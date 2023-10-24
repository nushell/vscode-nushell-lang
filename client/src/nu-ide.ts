import * as path from "path";
import { ExtensionContext, window } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient | null = null;
const name = "Nushell Language Server (extension)";

async function startClient(
  context: ExtensionContext,
  clientOptions: LanguageClientOptions,
) {
  // The server is implemented in node
  const serverModule = context.asAbsolutePath(
    path.join("out", "server", "src", "server.js"),
  );

  // The debug options for the server
  // --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
  const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

  // If the extension is launched in debug mode then the debug server options are used
  // Otherwise the run options are used
  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "nushellLanguageServer-ide",
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

export async function activate(
  context: ExtensionContext,
  clientOptions: LanguageClientOptions,
) {
  await startClient(context, clientOptions);
}

export async function deactivate(): Promise<void> {
  await stopClient();
}
