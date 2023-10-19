import * as path from "path";
import { ExtensionContext, window } from "vscode";
import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient | null = null;

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
    "nushellLanguageServer",
    "Nushell Language Server",
    serverOptions,
    clientOptions,
  );

  return client.start().catch((reason) => {
    window.showWarningMessage(
      `Failed to run Nushell Language Server (extension): ${reason}`,
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
  await startClient(context, clientOptions);
}

export function deactivate(): Thenable<void> {
  return stopClient();
}
