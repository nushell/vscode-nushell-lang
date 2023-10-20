import * as path from "path";
import { LanguageClientOptions } from "vscode-languageclient";
import { ExtensionContext } from "vscode";
import * as vscode from "vscode";
import * as which from "which";

import {
  activate as activateExtension,
  deactivate as deactivateExtension,
} from "./nu-ide";
import {
  activate as activateNuLsp,
  deactivate as deactivateNuLsp,
} from "./nu-lsp";
import { activate as activateNuls, deactivate as deactivateNuls } from "./nuls";

function startLanguageServer(context: ExtensionContext) {
  // Options to control the language client
  const clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: [{ scheme: "file", language: "nushell" }],
    synchronize: {
      // Notify the server about file changes to '.clientrc files contained in the workspace
      fileEvents: vscode.workspace.createFileSystemWatcher("**/.clientrc"),
    },
  };

  const configuration = vscode.workspace.getConfiguration(
    "nushellLanguageServer",
    null,
  );

  if (configuration.implementation == "nu --lsp") {
    activateNuLsp(clientOptions);
  } else if (configuration.implementation == "nuls") {
    activateNuls(clientOptions);
  } else {
    activateExtension(context, clientOptions);
  }
}

function stopLanguageServers() {
  deactivateExtension();
  deactivateNuLsp();
  deactivateNuls();
}

function handleDidChangeConfiguration(this: ExtensionContext) {
  stopLanguageServers();
  startLanguageServer(this);
}

export function activate(context: vscode.ExtensionContext): void {
  console.log("Terminals: " + (<any>vscode.window).terminals.length);
  context.subscriptions.push(
    vscode.window.registerTerminalProfileProvider("nushell_default", {
      provideTerminalProfile(
        token: vscode.CancellationToken,
      ): vscode.ProviderResult<vscode.TerminalProfile> {
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
            "Nushell not found in env:PATH or any of the heuristic locations.",
          );
          // use an async arrow funciton to use `await` inside
          return (async () => {
            if (
              (await vscode.window.showErrorMessage(
                "We cannot find a nushell executable in your path or pre-defined locations",
                "install from website",
              )) &&
              (await vscode.env.openExternal(
                vscode.Uri.parse("https://www.nushell.sh/"),
              )) &&
              (await vscode.window.showInformationMessage(
                "after you install nushell, you might need to reload vscode",
                "reload now",
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
              "assets/nu.svg",
            ),
          },
        };
      },
    }),
  );

  startLanguageServer(context);
  vscode.workspace.onDidChangeConfiguration(
    handleDidChangeConfiguration,
    context,
    undefined,
  );
}

export function deactivate(): void {
  stopLanguageServers();
}
