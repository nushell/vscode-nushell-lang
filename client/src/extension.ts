/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import * as which from 'which';
import { window, type OutputChannel } from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  Trace,
} from 'vscode-languageclient/node';

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

function startLanguageServer(
  context: vscode.ExtensionContext,
  found_nushell_path: string,
): void {
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
  const serverOptions: ServerOptions = {
    run: {
      command: found_nushell_path,
      args: ['--lsp'],
    },
    debug: {
      command: found_nushell_path,
      args: ['--lsp'],
    },
  };

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

export function activate(context: vscode.ExtensionContext) {
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
  startLanguageServer(context, found_nushell_path);

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
    () => {
      startLanguageServer(context, found_nushell_path);
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
