# vscode-nushell-lang README

This extension provides editing and syntax highlighting support
for [Nushell](http://nushell.sh), a data driven document language.


## Features

* Syntax highlighting grammar
* Nushell theme that tries to match Nushell's coloring

## Known Issues

See [our Github repository](https://github.com/nushell/vscode-nushell-lang)
for active issues.

## Regex Engine

VSCode uses a regular expressions that is based on Ruby for syntax highlighting. [This is a good site](https://rubular.com/) to test and try out these regular expressions.

## Build Process

We pretty much followed [these instructions](https://code.visualstudio.com/api/get-started/your-first-extension) for building this extension. And [this link](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) for packaging the extension.

To summarize:
1. npm install -g yo generator-code
2. yo code
3. chose `New Language Support` and filled out the rest of the questions
4. npm install -g vsce
5. update the readme and package.json
6. vsce package
7. code --install-extension vscode-nushell-lang-0.0.2.vsix or alternatively you can do ctrl/cmd-shift-p Extensions:Install From VSIX...

If you have all these tools already installed you should be able to clone this repo and just do a `vsce package` to get a vsix file that you can install in vscode.

## Help

We are happily accepting pull requests to make this better. :)