import { window } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";

let client: LanguageClient | null = null;
const name = "Nushell Language Server (nuls)";

async function startClient(clientOptions: LanguageClientOptions) {
  const serverOptions: ServerOptions = {
    command: "nuls",
    args: [],
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "nushellLanguageServer-nuls",
    name,
    serverOptions,
    clientOptions,
  );

  return client.start().catch((reason: unknown) => {
    window.showWarningMessage(`Failed to start ${name}: ${reason}`);
    client = null;
  });
}

async function stopClient(): Promise<void> {
  if (client) {
    await client.stop().catch((reason: unknown) => {
      console.error(`Failed to stop ${name}: ${reason}`);
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
