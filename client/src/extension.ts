/* eslint-disable @typescript-eslint/no-var-requires */
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as vscode from 'vscode';
import * as which from 'which';

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from 'vscode-languageclient/node';

let client: LanguageClient;

function findNushellExecutable(): string | null {
  try {
    // Get the configured executable path from VSCode settings
    // Use null for resource to get global/workspace settings
    const config = vscode.workspace.getConfiguration('nushellLanguageServer', null);
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
  } catch (error) {
    return null;
  }
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
    vscode.window.showErrorMessage(
      'Nushell executable not found. Please install Nushell and restart VSCode.',
      'Install from website'
    ).then((selection) => {
      if (selection) {
        vscode.env.openExternal(vscode.Uri.parse('https://www.nushell.sh/'));
      }
    });
    return;
  }

  // Use Nushell's native LSP server
  const serverOptions: ServerOptions = {
    run: { 
      command: found_nushell_path, 
      args: ['--lsp']
    },
    debug: { 
      command: found_nushell_path, 
      args: ['--lsp']
    },
  };

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for nushell files
    documentSelector: [{ scheme: 'file', language: 'nushell' }],
    synchronize: {
      // Notify the server about file changes to nushell files
      fileEvents: vscode.workspace.createFileSystemWatcher('**/*.nu'),
    }
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    'nushellLanguageServer',
    'Nushell Language Server',
    serverOptions,
    clientOptions,
  );

  // Start the client. This will also launch the server
  client.start().catch((error) => {
    vscode.window.showErrorMessage(`Failed to start Nushell language server: ${error.message}`);
  });
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
