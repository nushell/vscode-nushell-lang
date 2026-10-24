# vscode-nushell-lang VSCode extension

[![vsm-version](https://vsmarketplacebadges.dev/version/TheNuProjectContributors.vscode-nushell-lang.svg?style=flat-square&label=VS%20Marketplace)](https://marketplace.visualstudio.com/items?itemName=TheNuProjectContributors.vscode-nushell-lang)
[![vsm-downloads](https://vsmarketplacebadges.dev/downloads-short/TheNuProjectContributors.vscode-nushell-lang.svg?style=flat-square&label=downloads)](https://marketplace.visualstudio.com/items?itemName=TheNuProjectContributors.vscode-nushell-lang)
[![vsm-installs](https://vsmarketplacebadges.dev/installs-short/TheNuProjectContributors.vscode-nushell-lang.svg?style=flat-square&label=installs)](https://marketplace.visualstudio.com/items?itemName=TheNuProjectContributors.vscode-nushell-lang)

This [extension for VSCode](https://marketplace.visualstudio.com/items?itemName=TheNuProjectContributors.vscode-nushell-lang) provides editing, syntax highlighting, and IDE support for [Nushell](http://nushell.sh), a data-driven document language.

## Features

- Syntax highlighting grammar for Nushell scripts (`.nu` files) and ``nushell`` codeblocks in Markdown files
- Goto definition
- Hover support
- Validation (errors with red squiggly lines)
- Auto-complete built-in commands
- Inlays / Hints
- Configuration via vscode settings
- Step debugging of Nushell scripts (`nu --dap`, Nushell 0.116+)

## Finding `nu`

The language server, the Nushell terminal profile and the debugger all use the same `nu`, looked up in this order:

1. the `nushellLanguageServer.nushellExecutablePath` setting (when it is not the default `nu`);
2. `nu` on your `PATH`.

When neither finds `nu`, the extension points you to the [Nushell installation page](https://www.nushell.sh/book/installation.html) or the setting. Debugging needs Nushell 0.116.0 or newer.

## Debugging

Press **F5** in a `.nu` file (no `launch.json` needed), or add a configuration:

```json
{
  "type": "nushell",
  "request": "launch",
  "name": "Debug nu script",
  "program": "${file}",
  "cwd": "${workspaceFolder}",
  "args": [],
  "stopOnEntry": false
}
```

The debugger is built into Nushell (`nu --dap`, available from 0.116), so it needs no extra install. It supports:

- breakpoints, conditional breakpoints (`$total > 4000`), logpoints (`total {$total}`) and exception breakpoints ("Runtime errors");
- step over / into / out, through pipeline stages too, and a call stack with command names;
- variables inspected to any depth, an Environment scope, and watch / hover / Debug Console expressions;
- `def main` receives the launch `args`; scripts without `main` let you pick an entry point (`entryPoint`);
- `input` / `input list` answered through native VS Code prompts;
- **Visualize** (right-click a variable): tables as sortable, filterable grids, binaries as a hex view, JSON/XML strings formatted;
- **Nushell Debug: Show IR**: a live view of the compiled IR of the current block;
- **time travel**: Step Back / Reverse Continue over a recorded timeline (`nushellDebugger.timeTravel`, `nushellDebugger.timeTravelMaxSteps`);
- hot restart, optionally whenever you save the debugged script (`nushellDebugger.restartOnSave`; auto-saves are ignored).

Known limitations: launch only (no attach), externals get no interactive stdin, `input listen` is not supported, and variables can't be edited while paused.

The `examples/debug/` folder has scripts that exercise each feature.

## Screenshot (v1.5.0)

With Dark+ Color Theme

![Nushell script with Dark+ color theme](https://raw.githubusercontent.com/nushell/vscode-nushell-lang/main/assets/150-dark.png)

With Light+ Color Theme

![Nushell script with Light+ color theme](https://raw.githubusercontent.com/nushell/vscode-nushell-lang/main/assets/150-light.png)

Inlays / Hints

![Inlays](https://raw.githubusercontent.com/nushell/vscode-nushell-lang/main/assets/150-inlays.png)

Completions support

![Completions](https://raw.githubusercontent.com/nushell/vscode-nushell-lang/main/assets/150-completions.png)

Hover over built-ins for help

![Hover](https://raw.githubusercontent.com/nushell/vscode-nushell-lang/main/assets/150-hover-builtin.png)

Hover over custom commands for help

![HoverCustom](https://raw.githubusercontent.com/nushell/vscode-nushell-lang/main/assets/150-hover-custom.png)

Hover over variable

![HoverVar](https://raw.githubusercontent.com/nushell/vscode-nushell-lang/main/assets/150-hover-var.png)

Error & Validation support

![Error 1](https://raw.githubusercontent.com/nushell/vscode-nushell-lang/main/assets/150-error1.png)
![Error 2](https://raw.githubusercontent.com/nushell/vscode-nushell-lang/main/assets/150-error2.png)
![Error 3](https://raw.githubusercontent.com/nushell/vscode-nushell-lang/main/assets/150-error3.png)

Goto Definition support

![goto](https://raw.githubusercontent.com/nushell/vscode-nushell-lang/main/assets/150-goto-def.png)

Extension Settings

![settings](https://raw.githubusercontent.com/nushell/vscode-nushell-lang/main/assets/150-ext-settings.png)

## Known Issues

See [our Github repository](https://github.com/nushell/vscode-nushell-lang/issues) for active issues.

## Help

We are happily accepting pull requests to make this better. :)
