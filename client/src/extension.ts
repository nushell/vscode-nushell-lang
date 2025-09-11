/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as fs from 'fs/promises';
import * as vscode from 'vscode';
import { type OutputChannel, window } from 'vscode';
import {
  type Executable,
  LanguageClient,
  type LanguageClientOptions,
  type ServerOptions,
  Trace,
} from 'vscode-languageclient/node';
import * as which from 'which';

let client: LanguageClient;
let outputChannel: OutputChannel; // Trace channel
let serverOutputChannel: OutputChannel; // Server logs channel (single instance)

function findNushellExecutable(): string | null {
  try {
    // Get the configured executable path from VSCode settings
    // Use null for resource to get global/workspace settings
    const config = vscode.workspace.getConfiguration(
      'nushellLanguageServer',
      null,
    );
    const configuredPath = config.get<string>('nushellExecutablePath', 'nu');

    // If user configured a specific path, try to find it
    if (configuredPath && configuredPath !== 'nu') {
      // User specified a custom path
      try {
        // Test if the configured path works
        return which.sync(configuredPath, { nothrow: true });
      } catch {
        // Fall back to searching PATH for 'nu'
      }
    }

    // Fall back to searching PATH for 'nu'
    return which.sync('nu', { nothrow: true });
  } catch {
    return null;
  }
}

import { executeBinary, maybe, maybeAsync, writeTempFileText } from './util';

/**
 * Interface for the JSON structure returned by `$nu | to json`
 */
interface NuJson {
  'default-config-dir': string;
  'config-path': string;
  'env-path': string;
  'history-path': string;
  'loginshell-path': string;
  'plugin-path': string;
  'home-path': string;
  'data-dir': string;
  'cache-dir': string;
  'vendor-autoload-dirs': string[];
  'user-autoload-dirs': string[];
  'temp-path': string;
  pid: number;
  'os-info': {
    name: string;
    arch: string;
    family: string;
    kernel_version: string;
  };
  'startup-time': number;
  'is-interactive': boolean;
  'is-login': boolean;
  'history-enabled': boolean;
  'current-exe': string;
}

/**
 * Get the Nushell commands to shadow `print` and `inspect`, preventing them from leaking to STDOUT.
 * These shadowed custom commands check if they are in "LSP Mode" before printing, by checking if the environment variable `NUSHELL_LSP` is
 * set to one of: [ 1, `1`, true, `true` ]. If that environment variable exists and is one of those values, we consider to be in "LSP Mode",
 * and therefore do not do any printing.
 *
 * @returns The Nushell commands to shadow `print` and `inspect`
 */
function getShadowedCustomCommands() {
  const shadowedText = `
		alias 'core-print' = print;
		alias 'core-inspect' = inspect;
		
		def 'is-lsp' []: [
			any -> bool
		] {
			($env | get -o NUSHELL_LSP) in [ 1, '1', true, 'true' ]
		}
			
		def 'print' [
			--no-newline(-n) # print without inserting a newline for the line ending
			--stderr(-e) # print to stderr instead of stdout
			--raw(-r) # print without formatting (including binary data)
			--always-print(-p) # always print, regardless of whether in lsp mode
			...rest: any # the values to print
		]: [
			any -> nothing
			nothing -> nothing
		] {
			if $always_print or not (is-lsp) {
				core-print --no-newline=($no_newline) --stderr=($stderr) --raw=($raw) ...$rest
			}
		}
			
		def 'inspect' [
			--always-print(-p)
			--label(-l): string
		]: [
			any -> any
		] {
			if $always_print or not (is-lsp) {
				if $label != null {
					{ label: $label, value: $in } | core-inspect | get value
				} else {
					core-inspect
				}
			} else {}
		}`;

  // Fix indentation and return

  return shadowedText
    .split(/[\r\n]+/gim)
    .map((line) => line.replace(/^(?: {4}|\t{2})/, ''))
    .join('\n')
    .trim();
}

/**
 * Read the user's real `env.nu` file by asking nushell where it is, and then reading that file.
 * This is necessary because the location of `env.nu` can vary based on OS and user configuration.
 *
 * @param found_nushell_path The path to the nushell executable
 * @returns The contents of the user's real `env.nu` file
 * @throws If the nushell executable cannot be executed, or if the env.nu file cannot be read
 */
async function getRealEnvFileText(found_nushell_path: string) {
  const nuOutput = await executeBinary(found_nushell_path, [
    '--commands',
    '$nu | select -o env-path | to json -r',
  ]);

  const [nuJson, nuJsonError] = maybe<Pick<NuJson, 'env-path'>>(() =>
    JSON.parse(nuOutput.stdout),
  );
  if (nuJsonError) {
    throw new Error(`Could not get $nu info: ${nuJsonError}`);
  }

  const envPath = nuJson['env-path'];
  const [envText, envTextError] = await maybeAsync<string>(() =>
    fs.readFile(envPath, 'utf8'),
  );
  if (envTextError) {
    throw new Error(
      `Could not read nushell env file at ${envPath}: ${envTextError}`,
    );
  }

  return envText;
}

/**
 * Get the server options for the language client, including setting up a temporary env.nu file
 * with shadowed print/inspect commands to prevent them from leaking to STDOUT.
 *
 * This is a bit of a hack, but it provides a solution for the problem of `print` and `inspect` commands leaking to STDOUT
 * and thus being interpreted as LSP messages.
 *
 * @param found_nushell_path The path to the nushell executable
 * @returns The server options for the language client
 */
async function getServerOptions(
  found_nushell_path: string,
): Promise<ServerOptions> {
  const getExecutable = (...args: string[]): Executable => {
    return {
      command: found_nushell_path,
      args: args,
      options: {
        env: {
          ...process.env,
          NUSHELL_LSP: '1',
        },
      },
    };
  };

  const defaultOptions: ServerOptions = {
    run: getExecutable('--no-history', '--lsp'),
    debug: getExecutable('--no-history', '--lsp'),
  };

  // Read the user's real `env.nu` file, so we can use it as a base for our temporary env file.
  const [envText, envTextError] = await maybeAsync<string>(() =>
    getRealEnvFileText(found_nushell_path),
  );
  if (envTextError) {
    await vscode.window.showErrorMessage(
      `Could not get nushell env file text`,
      envTextError,
    );
    return defaultOptions;
  }

  // Create a temp file with the user's real env.nu contents, plus our shadowed commands at the top.
  const [envTempFile, envTempFileError] = await maybeAsync<string>(() =>
    writeTempFileText(`${getShadowedCustomCommands()}\n\n${envText}`, `.nu`),
  );
  if (envTempFileError) {
    await vscode.window.showErrorMessage(
      `Failed to create temporary env file: ${envTempFileError}`,
    );
    return defaultOptions;
  }

  // Pass the `--env-config` argument to nushell to load our temp env file instead of the user's real one. This is
  // a bit of a hack, but it provides a solution for the problem of `print` and `inspect` commands leaking to STDOUT
  // and thus being interpreted as LSP messages.
  return {
    run: getExecutable('--no-history', '--env-config', envTempFile, '--lsp'),
    debug: getExecutable('--no-history', '--env-config', envTempFile, '--lsp'),
  };
}

async function startLanguageServer(
  context: vscode.ExtensionContext,
  found_nushell_path: string,
): Promise<void> {
  // Prevent duplicate clients/channels
  if (client) {
    vscode.window.showInformationMessage(
      'Nushell Language Server is already running.',
    );
    return;
  }
  // Channel to receive detailed JSON-RPC trace between VS Code and the LSP server
  if (outputChannel) {
    try {
      outputChannel.dispose();
    } catch {
      // ignore
    }
  }
  outputChannel = window.createOutputChannel('Nushell LSP Trace');
  context.subscriptions.push(outputChannel);

  // Use Nushell's native LSP server
  const serverOptions = await getServerOptions(found_nushell_path);

  // Ensure a single server output channel exists and is reused
  if (!serverOutputChannel) {
    serverOutputChannel = window.createOutputChannel('Nushell Language Server');
    context.subscriptions.push(serverOutputChannel);
  }

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Route general server logs to a single, reusable channel
    outputChannel: serverOutputChannel,
    // Send JSON-RPC trace to a dedicated channel visible in the Output panel
    traceOutputChannel: outputChannel,
    markdown: {
      isTrusted: true,
      supportHtml: true,
    },
    initializationOptions: {
      timeout: 10000, // 10 seconds
    },
    // Register the server for nushell files
    documentSelector: [{ scheme: 'file', language: 'nushell' }],
    synchronize: {
      // Notify the server about file changes to nushell files
      fileEvents: vscode.workspace.createFileSystemWatcher('**/*.nu'),
    },
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    'nushellLanguageServer',
    'Nushell Language Server',
    serverOptions,
    clientOptions,
  );

  // Initialize trace level from settings and react to changes
  const applyTraceFromConfig = () => {
    const configured = vscode.workspace
      .getConfiguration('nushellLanguageServer')
      .get<'off' | 'messages' | 'verbose'>('trace.server');
    const level: 'off' | 'messages' | 'verbose' = configured ?? 'messages';
    const map: Record<'off' | 'messages' | 'verbose', Trace> = {
      off: Trace.Off,
      messages: Trace.Messages,
      verbose: Trace.Verbose,
    };
    client.setTrace(map[level]);
    try {
      outputChannel.appendLine(`[Nushell] JSON-RPC tracing set to: ${level}`);
      if (level !== 'off') {
        outputChannel.show(true);
      }
    } catch {
      // ignore
    }
  };
  applyTraceFromConfig();
  const cfgDisp = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('nushellLanguageServer.trace.server')) {
      applyTraceFromConfig();
    }
  });
  context.subscriptions.push(cfgDisp);
  // Log client lifecycle
  client.onDidChangeState((e) => {
    try {
      outputChannel.appendLine(`[Nushell] Client state changed: ${e.newState}`);
    } catch {
      // ignore
    }
  });

  // Start the language client and register a disposable that stops it when disposed
  client.start().catch((error) => {
    vscode.window.showErrorMessage(
      `Failed to start Nushell language server: ${error.message}`,
    );
  });

  const disposable = new vscode.Disposable(() => {
    if (client) {
      client.stop().catch((error) => {
        console.error(
          'Failed to stop Nushell Language Server on dispose:',
          error,
        );
      });
    }
  });
  context.subscriptions.push(disposable);
}

export async function activate(context: vscode.ExtensionContext) {
  console.log('Terminals: ' + (<any>vscode.window).terminals.length);

  // Find Nushell executable once and reuse it
  const found_nushell_path = findNushellExecutable();

  context.subscriptions.push(
    vscode.window.registerTerminalProfileProvider('nushell_default', {
      provideTerminalProfile(
        token: vscode.CancellationToken,
      ): vscode.ProviderResult<vscode.TerminalProfile> {
        // Consume token to satisfy no-unused-vars without changing behavior
        void token;
        if (found_nushell_path == null) {
          console.log(
            'Nushell not found in env:PATH or any of the heuristic locations.',
          );
          // use an async arrow funciton to use `await` inside
          return (async () => {
            if (
              (await vscode.window.showErrorMessage(
                'We cannot find a nushell executable in your path or pre-defined locations',
                'install from website',
              )) &&
              (await vscode.env.openExternal(
                vscode.Uri.parse('https://www.nushell.sh/'),
              )) &&
              (await vscode.window.showInformationMessage(
                'after you install nushell, you might need to reload vscode',
                'reload now',
              ))
            ) {
              vscode.commands.executeCommand('workbench.action.reloadWindow');
            }
            // user has already seen error messages, but they didn't click through
            // return a promise that never resolve to supress the confusing error
            return await new Promise(() => undefined);
          })();
        }

        return {
          options: {
            name: 'Nushell',
            shellPath: found_nushell_path,
            iconPath: vscode.Uri.joinPath(
              context.extensionUri,
              'assets/nu.svg',
            ),
          },
        };
      },
    }),
  );

  // Check if Nushell was found for LSP server
  if (!found_nushell_path) {
    vscode.window
      .showErrorMessage(
        'Nushell executable not found. Please install Nushell and restart VSCode.',
        'Install from website',
      )
      .then((selection) => {
        if (selection) {
          vscode.env.openExternal(vscode.Uri.parse('https://www.nushell.sh/'));
        }
      });
    return;
  }

  console.log(`Found nushell executable at: ${found_nushell_path}`);
  console.log('Activating Nushell Language Server extension.');

  // Start the language server when the extension is activated
  await startLanguageServer(context, found_nushell_path);

  // Register a command to stop the language server
  const stopCommand = vscode.commands.registerCommand(
    'nushell.stopLanguageServer',
    async () => {
      if (client) {
        try {
          await client.stop();
          client = undefined;
          vscode.window.showInformationMessage(
            'Nushell Language Server stopped.',
          );
        } catch (error) {
          vscode.window.showErrorMessage(
            `Failed to stop Nushell Language Server: ${error}`,
          );
        }
      } else {
        vscode.window.showInformationMessage(
          'Nushell Language Server is not running.',
        );
      }
    },
  );
  context.subscriptions.push(stopCommand);

  // Register a command to start the language server
  const startCommand = vscode.commands.registerCommand(
    'nushell.startLanguageServer',
    async () => {
      await startLanguageServer(context, found_nushell_path);
      if (client) {
        vscode.window.showInformationMessage(
          'Nushell Language Server started.',
        );
      }
    },
  );
  context.subscriptions.push(startCommand);
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
