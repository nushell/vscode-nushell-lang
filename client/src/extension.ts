/* eslint-disable @typescript-eslint/no-var-requires */
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from "path";
// import { workspace, ExtensionContext } from "vscode";
import * as vscode from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;

export function activate(context: vscode.ExtensionContext) {
  console.log("Terminals: " + (<any>vscode.window).terminals.length);
  context.subscriptions.push(
    vscode.window.registerTerminalProfileProvider("nushell_default", {
      provideTerminalProfile(
        token: vscode.CancellationToken
      ): vscode.ProviderResult<vscode.TerminalProfile> {
        const which = require("which");
        const path = require("path");

        const PATH_FROM_ENV = process.env["PATH"];
        const pathsToCheck = [
          PATH_FROM_ENV,
          // cargo install location
          (process.env["CARGO_HOME"] || "~/.cargo") + "/bin",

          // winget on Windows install location
          "c:\\program files\\nu\\bin",
          // just add a few other drives for fun
          "d:\\program files\\nu\\bin",
          "e:\\program files\\nu\\bin",
          "f:\\program files\\nu\\bin",

          // SCOOP:TODO
          // all user installed programs and scoop itself install to
          // c:\users\<user>\scoop\ unless SCOOP env var is set
          // globally installed programs go in
          // c:\programdata\scoop unless SCOOP_GLOBAL env var is set
          // scoop install location
          // SCOOP should already set up the correct `PATH` env var
          //"~/scoop/apps/nu/*/nu.exe",
          //"~/scoop/shims/nu.exe",

          // chocolatey install location - same as winget
          // 'c:\\program files\\nu\\bin\\nu.exe',

          // macos dmg install
          // we currentl don't have a dmg install

          // linux and mac zips can be put anywhere so it's hard to guess

          // brew install location mac
          // intel
          "/usr/local/bin",
          // arm
          "/opt/homebrew/bin",

          // native package manager install location
          // standard location should be in `PATH` env var
          //"/usr/bin/nu",
        ];

        const found_nushell_path = which.sync("nu", {
          nothrow: true,
          path: pathsToCheck.join(path.delimiter),
        });

        if (found_nushell_path == null) {
          console.log(
            "Nushell not found in env:PATH or any of the heuristic locations."
          );
          // use an async arrow funciton to use `await` inside
          return (async () => {
            if (
              (await vscode.window.showErrorMessage(
                "We cannot find a nushell executable in your path or pre-defined locations",
                "install from website"
              )) &&
              (await vscode.env.openExternal(
                vscode.Uri.parse("https://www.nushell.sh/")
              )) &&
              (await vscode.window.showInformationMessage(
                "after you install nushell, you might need to reload vscode",
                "reload now"
              ))
            ) {
              vscode.commands.executeCommand("workbench.action.reloadWindow");
            }
            // user has already seen error messages, but they didn't click through
            // return a promise that never resolve to supress the confusing error
            return await new Promise(() => undefined);
          })();
        }

        return {
          options: {
            name: "Nushell",
            shellPath: found_nushell_path,
            iconPath: vscode.Uri.joinPath(
              context.extensionUri,
              "assets/nu.svg"
            ),
          },
        };
      },
    })
  );

  // The server is implemented in node
  const serverModule = context.asAbsolutePath(
    path.join("out", "server", "src", "server.js")
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

  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: [{ scheme: "file", language: "nushell" }],
    synchronize: {
      // Notify the server about file changes to '.clientrc files contained in the workspace
      fileEvents: vscode.workspace.createFileSystemWatcher("**/.clientrc"),
    },
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "nushellLanguageServer",
    "Nushell Language Server",
    serverOptions,
    clientOptions
  );

  // Start the client. This will also launch the server
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
