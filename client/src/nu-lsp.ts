import { window } from "vscode";
import * as vscode from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";

let client: LanguageClient | null = null;

async function startClient(clientOptions: LanguageClientOptions) {
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

  return client.start().catch((reason: unknown) => {
    window.showWarningMessage(
      `Failed to start Nushell Language Server (nu --lsp): ${reason}`,
    );
    client = null;
  });
}

async function stopClient(): Promise<void> {
  if (client) {
    await client.stop().catch((reason: unknown) => {
      window.showWarningMessage(
        `Failed to stop Nushell Language Server (nu --lsp): ${reason}`,
      );
    });
  }
  client = null;
}

export async function activate(clientOptions: LanguageClientOptions) {
  // TODO: use configuration
  // const configuration = workspace.getConfiguration("nushellLanguageServer", null);

  await startClient(clientOptions);
}

export async function deactivate(): Promise<void> {
  await stopClient();
}
