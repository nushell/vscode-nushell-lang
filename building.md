# Building

## Regex Engine

VSCode uses a regular expressions engine that is based on Ruby for syntax highlighting.
[This Rubular site is good site](https://rubular.com/) to test and try out these regular expressions because it uses Ruby which supports `oniguruma` flavor of regular expressions.

## Build Process

We pretty much followed [these instructions](https://code.visualstudio.com/api/get-started/your-first-extension) for building this extension.
And [this link](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) for packaging the extension.

To summarize, the steps were:

1. `npm install -g yo generator-code`
2. `yo code`
3. choose "New Language Support" and fill out the rest of the questions
4. `npm install -g vsce`
5. update the `README.md` and `package.json`
6. `vsce package`
7. `code --install-extension vscode-nushell-lang-0.0.2.vsix`<br/>
   (Alternatively, you can do <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>-<kbd>Shift</kbd>-<kbd>P</kbd> and type "Extensions:Install From VSIX...")

If you have all these tools already installed, you should be able to clone this repo and just run `vsce package` to get a `.vsix` file that you can install in vscode.

## Build for Development

1. Clone this repo
2. In repo folder `npm install`
3. Hit F5 to start debugging (or Run->Start Debugging menu item)
4. Go to settings with `Ctrl ,` or `Cmd ,`
5. In the settings tree on the left, go to Extensions->Nushell IDE Support and make sure `Nushell Executable Path` is pointing at where you have nu/nu.exe installed. (It must be version 0.79.0 or greater)
6. Open a nushell script and in a moment you should see inlays and see the full functionality
7. To see the Language Server debug messages hit `Ctrl ~`
8. Go to the output tab
9. In the combo box on the right, choose `Nushell Language Server`. You should now see debug messaging as the client and server communicate

## Regex Engine

TIL - VSCode uses regexes for language syntax highlighting in \*.tmLanguage.json files. Those regexes and json are based on Textmate, which uses (and here is the secret-sauce) `oniguruma` flavor of syntax. See the cheat-sheet for the [syntax here](https://github.com/kkos/oniguruma/blob/master/doc/RE). Also there's a rust-crate called `onig` or `rust-onig` if we wanted to write something to help create compatible regular expressions.
