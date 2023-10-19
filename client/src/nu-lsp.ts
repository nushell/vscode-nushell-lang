import { ExtensionContext, window } from "vscode";
import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";

let client: LanguageClient | null = null;

async function startClient(
  _context: ExtensionContext,
  clientOptions: LanguageClientOptions,
) {
  const configuration = vscode.workspace.getConfiguration(
    "nushellLanguageServer",
    null,
  );

  const serverOptions: ServerOptions = {
    command: configuration.nushellExecutablePath,
    args: ["--lsp"],
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "nushellLanguageServer",
    "Nushell Language Server",
    serverOptions,
    clientOptions,
  );

  return client.start().catch((reason) => {
    window.showWarningMessage(
      `Failed to run Nushell Language Server (nu --lsp): ${reason}`,
    );
    client = null;
  });
}

async function stopClient(): Promise<void> {
  if (client) {
    client.stop();
  }
  client = null;
}

export async function activate(
  context: ExtensionContext,
  clientOptions: LanguageClientOptions,
) {
  // TODO: use configuration
  // const configuration = workspace.getConfiguration("nushellLanguageServer", null);

  await startClient(context, clientOptions);
}

export function deactivate(): Thenable<void> {
  return stopClient();
}
