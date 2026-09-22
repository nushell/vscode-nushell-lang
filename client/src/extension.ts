/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import * as which from 'which';
import { window, type OutputChannel } from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  Trace,
  RevealOutputChannelOn,
} from 'vscode-languageclient/node';

const EXTENSION_ID = 'TheNuProjectContributors.vscode-nushell-lang';
const CONFIG_SECTION = 'nushellLanguageServer';

let client: LanguageClient | undefined;
let fileWatcher: vscode.FileSystemWatcher | undefined;
let outputChannel: OutputChannel | undefined; // Single output channel for server logs and trace

function expandHome(p: string): string {
  if (p === '~' || p.startsWith('~/') || p.startsWith('~\\')) {
    return path.join(os.homedir(), p.slice(1));
  }
  return p;
}

/**
 * Resolve the nushell executable: the configured path if it exists,
 * otherwise `nu` on PATH. Returns null when nothing usable is found.
 */
function findNushellExecutable(): string | null {
  try {
    const config = vscode.workspace.getConfiguration(CONFIG_SECTION, null);
    const configuredPath = config
      .get<string>('nushellExecutablePath', 'nu')
      .trim();

    if (configuredPath && configuredPath !== 'nu') {
      const found = which.sync(expandHome(configuredPath), { nothrow: true });
      if (found) {
        return found;
      }
      void vscode.window.showWarningMessage(
        `Configured nushell executable '${configuredPath}' was not found. Falling back to 'nu' on PATH.`,
      );
    }

    return which.sync('nu', { nothrow: true });
  } catch {
    return null;
  }
}

function showNushellNotFound(): void {
  void vscode.window
    .showErrorMessage(
      'Nushell executable not found. Install Nushell or set "nushellLanguageServer.nushellExecutablePath", then run "Nushell: Start Language Server".',
      'Install from website',
    )
    .then((selection) => {
      if (selection) {
        void vscode.env.openExternal(
          vscode.Uri.parse('https://www.nushell.sh/'),
        );
      }
    });
}

function getOutputChannel(context: vscode.ExtensionContext): OutputChannel {
  if (!outputChannel) {
    outputChannel = window.createOutputChannel('Nushell Language Server');
    context.subscriptions.push(outputChannel);
  }
  return outputChannel;
}

function log(message: string): void {
  try {
    outputChannel?.appendLine(`[Nushell] ${message}`);
  } catch {
    // ignore
  }
}

type TraceLevel = 'off' | 'messages' | 'verbose';

function traceLevelFromConfig(): TraceLevel {
  const configured = vscode.workspace
    .getConfiguration(CONFIG_SECTION)
    .get<TraceLevel>('trace.server');
  return configured ?? 'messages';
}

function applyTraceFromConfig(): void {
  const level = traceLevelFromConfig();
  const map: Record<TraceLevel, Trace> = {
    off: Trace.Off,
    messages: Trace.Messages,
    verbose: Trace.Verbose,
  };
  void client?.setTrace(map[level]);
  log(`JSON-RPC tracing set to: ${level}`);
}

/**
 * Start `nu --lsp` and connect the language client to it.
 * Returns true when a new client was started.
 */
function startLanguageServer(context: vscode.ExtensionContext): boolean {
  if (client) {
    void vscode.window.showInformationMessage(
      'Nushell Language Server is already running.',
    );
    return false;
  }

  // Resolve the executable on every start so a changed setting or a fresh
  // install is picked up without reloading the window.
  const nushellPath = findNushellExecutable();
  if (!nushellPath) {
    showNushellNotFound();
    return false;
  }

  const channel = getOutputChannel(context);

  // Use Nushell's native LSP server
  const serverOptions: ServerOptions = {
    run: { command: nushellPath, args: ['--lsp'] },
    debug: { command: nushellPath, args: ['--lsp'] },
  };

  fileWatcher = vscode.workspace.createFileSystemWatcher('**/*.nu');

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Route general server logs to a single channel
    outputChannel: channel,
    // Never auto-reveal the server output channel
    revealOutputChannelOn: RevealOutputChannelOn.Never,
    // Send JSON-RPC trace to the same channel as server logs
    traceOutputChannel: channel,
    markdown: {
      isTrusted: true,
      supportHtml: true,
    },
    // Register the server for nushell files
    documentSelector: [
      { scheme: 'file', language: 'nushell' },
      { scheme: 'untitled', language: 'nushell' },
    ],
    synchronize: {
      // Notify the server about file changes to nushell files
      fileEvents: fileWatcher,
    },
  };

  // Create the language client and start the client.
  const newClient = new LanguageClient(
    CONFIG_SECTION,
    'Nushell Language Server',
    serverOptions,
    clientOptions,
  );
  client = newClient;

  // Log client lifecycle
  newClient.onDidChangeState((e) => {
    log(`Client state changed: ${e.newState}`);
  });

  log(`Starting language server: ${nushellPath} --lsp`);
  applyTraceFromConfig();

  newClient.start().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    log(`Failed to start language server: ${message}`);
    void vscode.window.showErrorMessage(
      `Failed to start Nushell language server: ${message}`,
    );
    // Leave things in a state where "Nushell: Start Language Server" can retry.
    if (client === newClient) {
      client = undefined;
    }
    fileWatcher?.dispose();
    fileWatcher = undefined;
  });

  return true;
}

async function stopLanguageServer(): Promise<boolean> {
  if (!client) {
    return false;
  }
  const running = client;
  client = undefined;
  fileWatcher?.dispose();
  fileWatcher = undefined;
  try {
    await running.stop();
    log('Language server stopped.');
  } catch (error) {
    log(`Failed to stop language server: ${error}`);
    throw error;
  }
  return true;
}

export function activate(context: vscode.ExtensionContext) {
  console.log(`Activating ${EXTENSION_ID}.`);
  getOutputChannel(context);

  context.subscriptions.push(
    vscode.window.registerTerminalProfileProvider('nushell_default', {
      provideTerminalProfile(
        token: vscode.CancellationToken,
      ): vscode.ProviderResult<vscode.TerminalProfile> {
        // Consume token to satisfy no-unused-vars without changing behavior
        void token;
        const nushellPath = findNushellExecutable();
        if (!nushellPath) {
          showNushellNotFound();
          return undefined;
        }

        return {
          options: {
            name: 'Nushell',
            shellPath: nushellPath,
            iconPath: vscode.Uri.joinPath(
              context.extensionUri,
              'assets/nu.svg',
            ),
          },
        };
      },
    }),
  );

  // React to trace level changes for the lifetime of the extension
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(`${CONFIG_SECTION}.trace.server`)) {
        applyTraceFromConfig();
      }
    }),
  );

  // Commands are registered before the server starts so they keep working
  // even when nushell was not found at activation time.
  context.subscriptions.push(
    vscode.commands.registerCommand('nushell.startLanguageServer', () => {
      if (startLanguageServer(context)) {
        void vscode.window.showInformationMessage(
          'Nushell Language Server started.',
        );
      }
    }),
    vscode.commands.registerCommand('nushell.stopLanguageServer', async () => {
      try {
        if (await stopLanguageServer()) {
          void vscode.window.showInformationMessage(
            'Nushell Language Server stopped.',
          );
        } else {
          void vscode.window.showInformationMessage(
            'Nushell Language Server is not running.',
          );
        }
      } catch (error) {
        void vscode.window.showErrorMessage(
          `Failed to stop Nushell Language Server: ${error}`,
        );
      }
    }),
    vscode.commands.registerCommand('nushell.openDocs', async () => {
      await vscode.env.openExternal(
        vscode.Uri.parse('https://www.nushell.sh/book/'),
      );
    }),
  );

  // Make sure the server is stopped when the extension is disposed
  context.subscriptions.push(
    new vscode.Disposable(() => {
      stopLanguageServer().catch((error) => {
        console.error(
          'Failed to stop Nushell Language Server on dispose:',
          error,
        );
      });
    }),
  );

  // Start the language server when the extension is activated
  startLanguageServer(context);
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return stopLanguageServer().then(() => undefined);
}
