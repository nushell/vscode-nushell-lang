import { window } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";

let client: LanguageClient | null = null;

async function startClient(clientOptions: LanguageClientOptions) {
  const serverOptions: ServerOptions = {
    command: "nuls",
    args: [],
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
      `Failed to start Nushell Language Server (nuls): ${reason}`,
    );
    client = null;
  });
}

async function stopClient(): Promise<void> {
  if (client) {
    await client.stop().catch((reason: unknown) => {
      window.showWarningMessage(
        `Failed to stop Nushell Language Server (nuls): ${reason}`,
      );
    });
  }
  client = null;
}

export async function activate(clientOptions: LanguageClientOptions) {
  await startClient(clientOptions);
}

export async function deactivate(): Promise<void> {
  await stopClient();
}
