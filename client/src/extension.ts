/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import { window, type OutputChannel } from 'vscode';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  Trace,
  RevealOutputChannelOn,
} from 'vscode-languageclient/node';

import { registerDebugger } from './debug/register';
import { ensureNushell } from './nushell/resolve';

const EXTENSION_ID = 'TheNuProjectContributors.vscode-nushell-lang';
const CONFIG_SECTION = 'nushellLanguageServer';

let client: LanguageClient | undefined;
let clientNushellPath: string | undefined; // the `nu` that `client` runs
let fileWatcher: vscode.FileSystemWatcher | undefined;
let outputChannel: OutputChannel | undefined; // Single output channel for server logs and trace

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
function startLanguageServer(
  context: vscode.ExtensionContext,
  nushellPath: string,
): boolean {
  if (client) {
    void vscode.window.showInformationMessage(
      'Nushell Language Server is already running.',
    );
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
  clientNushellPath = nushellPath;

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
      clientNushellPath = undefined;
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
  clientNushellPath = undefined;
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

async function restartLanguageServer(
  context: vscode.ExtensionContext,
  nushellPath: string,
): Promise<void> {
  try {
    await stopLanguageServer();
  } catch (error) {
    console.error('Failed to stop Nushell Language Server:', error);
  }
  startLanguageServer(context, nushellPath);
}

/** The Settings UI writes the path on every keystroke; wait until it settles. */
const RESTART_DELAY_MS = 500;
let restartTimer: ReturnType<typeof setTimeout> | undefined;
/** The last restart; the next one waits for it, so restarts never overlap. */
let restartQueue: Promise<void> = Promise.resolve();

/**
 * `nushellExecutablePath` changed: restart a running server on the new `nu`.
 * A stopped server stays stopped, and a path that resolves to the running
 * `nu` changes nothing.
 */
function scheduleRestart(context: vscode.ExtensionContext): void {
  clearTimeout(restartTimer);
  restartTimer = setTimeout(() => {
    restartTimer = undefined;
    restartQueue = restartQueue
      .then(async () => {
        if (!client) {
          return;
        }

        const nushellPath = ensureNushell();
        if (nushellPath && nushellPath !== clientNushellPath) {
          await restartLanguageServer(context, nushellPath);
        }
      })
      .catch(() => {});
  }, RESTART_DELAY_MS);
}

export function activate(context: vscode.ExtensionContext) {
  console.log(`Activating ${EXTENSION_ID}.`);
  getOutputChannel(context);

  // The language server, the terminal profile and the debugger share one `nu`,
  // resolved as: nushellExecutablePath setting -> PATH.
  // It is resolved on every use so a changed setting or a fresh install is
  // picked up without reloading the window.
  context.subscriptions.push(
    vscode.window.registerTerminalProfileProvider('nushell_default', {
      provideTerminalProfile(
        token: vscode.CancellationToken,
      ): vscode.TerminalProfile | undefined {
        // Consume token to satisfy no-unused-vars without changing behavior
        void token;
        const nushellPath = ensureNushell();
        if (!nushellPath) {
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

  // The debugger resolves `nu` itself when a session starts
  context.subscriptions.push(...registerDebugger(ensureNushell));

  // React to trace level changes for the lifetime of the extension, and
  // restart the language server when the executable path setting changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(`${CONFIG_SECTION}.trace.server`)) {
        applyTraceFromConfig();
      }
      if (e.affectsConfiguration(`${CONFIG_SECTION}.nushellExecutablePath`)) {
        scheduleRestart(context);
      }
    }),
    new vscode.Disposable(() => clearTimeout(restartTimer)),
  );

  // Commands are registered before the server starts so they keep working
  // even when nushell was not found at activation time.
  context.subscriptions.push(
    vscode.commands.registerCommand('nushell.startLanguageServer', () => {
      const nushellPath = ensureNushell();
      if (nushellPath && startLanguageServer(context, nushellPath)) {
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

  // Start the language server once a `nu` is available
  const nushellPath = ensureNushell();
  if (nushellPath) {
    startLanguageServer(context, nushellPath);
  }
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return stopLanguageServer().then(() => undefined);
}
