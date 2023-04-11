/* eslint-disable @typescript-eslint/no-var-requires */
// "use strict";
// import * as vscode from "vscode";
// export function activate(context: vscode.ExtensionContext) {
//   console.log("Terminals: " + (<any>vscode.window).terminals.length);
//   context.subscriptions.push(
//     vscode.window.registerTerminalProfileProvider("nushell_default", {
//       provideTerminalProfile(
//         token: vscode.CancellationToken
//       ): vscode.ProviderResult<vscode.TerminalProfile> {
//         const path = require("path");
//         const fs = require("fs");
//         const glob = require("glob");
//         const os = require("os");

//         const pathsToCheck = [
//           // cargo install location
//           "~/.cargo/bin/nu",
//           "~/.cargo/bin/nu.exe",

//           // winget on Windows install location
//           "c:\\program files\\nu\\bin\\nu.exe",
//           // just add a few other drives for fun
//           "d:\\program files\\nu\\bin\\nu.exe",
//           "e:\\program files\\nu\\bin\\nu.exe",
//           "f:\\program files\\nu\\bin\\nu.exe",

//           // SCOOP:TODO
//           // all user installed programs and scoop itself install to
//           // c:\users\<user>\scoop\ unless SCOOP env var is set
//           // globally installed programs go in
//           // c:\programdata\scoop unless SCOOP_GLOBAL env var is set
//           // scoop install location
//           "~/scoop/apps/nu/*/nu.exe",
//           "~/scoop/shims/nu.exe",

//           // chocolatey install location - same as winget
//           // 'c:\\program files\\nu\\bin\\nu.exe',

//           // macos dmg install
//           // we currentl don't have a dmg install

//           // linux and mac zips can be put anywhere so it's hard to guess

//           // brew install location mac
//           // intel
//           "/usr/local/bin/nu",
//           // arm
//           "/opt/homebrew/bin/nu",

//           // native package manager install location
//           "/usr/bin/nu",
//         ];

//         let found_nushell_path = "";
//         const home = os.homedir();

//         for (const cur_val of pathsToCheck) {
//           // console.log("Inspecting location: " + cur_val);
//           let constructed_file = "";
//           if (cur_val.startsWith("~/scoop")) {
//             // console.log("Found scoop: " + cur_val);
//             const p = path.join(home, cur_val.slice(1));
//             // console.log("Expanded ~: " + p);
//             const file = glob.sync(p, "debug").toString();
//             // console.log("Glob for files: " + file);

//             if (file) {
//               // console.log("Found some file: " + file);
//               // if there are slashes, reverse them to back slashes
//               constructed_file = file.replace(/\//g, "\\");
//             }
//           } else if (cur_val.startsWith("~")) {
//             constructed_file = path.join(home, cur_val.slice(1));
//             // console.log("Found ~, constructing path: " + constructed_file);
//           } else {
//             constructed_file = cur_val;
//           }

//           if (fs.existsSync(constructed_file)) {
//             // console.log("File exists, returning: " + constructed_file);
//             found_nushell_path = constructed_file;
//             break;
//           } else {
//             // console.log("File not found: " + constructed_file);
//           }
//         }

//         if (found_nushell_path.length > 0) {
//           return {
//             options: {
//               name: "Nushell",
//               shellPath: found_nushell_path,
//             },
//           };
//         } else {
//           console.log("Nushell not found, returning undefined");
//           return undefined;
//         }
//       },
//     })
//   );
// }
