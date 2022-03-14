# vscode-nushell-lang VSCode extension

This [extension for VSCode](https://code.visualstudio.com/docs/introvideos/extend) provides editing and syntax highlighting support for [Nushell](http://nushell.sh), a data-driven document language.

## Features

- Syntax highlighting grammar for Nushell scripts (`.nu` files)
- Nushell theme that tries to match Nushell's coloring

## Screenshot (v0.5.1)

With Nushell-Dark Color Theme

![Nushell script with Nushell color theme](https://raw.githubusercontent.com/nushell/vscode-nushell-lang/main/assets/051-dark.png)

With Nushell-Light Color Theme

![Nushell script with VSDark+ color theme](https://raw.githubusercontent.com/nushell/vscode-nushell-lang/main/assets/051-light.png)

## Known Issues

See [our Github repository](https://github.com/nushell/vscode-nushell-lang/issues) for active issues.

## Regex Engine

VSCode uses a regular expressions engine that is based on Ruby for syntax highlighting.
[This is a good site](https://rubular.com/) to test and try out these regular expressions.

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

## Help

We are happily accepting pull requests to make this better. :)
