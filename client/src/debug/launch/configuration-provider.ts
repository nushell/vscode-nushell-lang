import * as path from 'path';
import * as vscode from 'vscode';

import { resolveNushell } from '../../nushell/resolve';
import { confirmDapSupport } from '../adapter/descriptor-factory';
import { DEBUG_TYPE } from '../shared/debug-type';
import { isNuDocument } from '../shared/nu-document';
import { resolveEntryPoint } from './entry-point';

export class LaunchConfigurationProvider
  implements vscode.DebugConfigurationProvider
{
  resolveDebugConfiguration(
    folder: vscode.WorkspaceFolder | undefined,
    config: vscode.DebugConfiguration,
  ): vscode.ProviderResult<vscode.DebugConfiguration> {
    fillInActiveFile(folder, config);
    if (!config.program) {
      void vscode.window.showErrorMessage(
        "Nushell Debug: no program specified. Open a .nu file or set 'program' in launch.json.",
      );
      return undefined;
    }

    return config;
  }

  /**
   * Runs after ${file}/${workspaceFolder} substitution, so `program` is a real
   * path we can read — which is what lets us ask about entry point and args.
   */
  async resolveDebugConfigurationWithSubstitutedVariables(
    folder: vscode.WorkspaceFolder | undefined,
    config: vscode.DebugConfiguration,
  ): Promise<vscode.DebugConfiguration | undefined> {
    if (config.request !== 'launch') {
      return config;
    }

    if (typeof config.program !== 'string') {
      return config;
    }

    // A relative `cwd` is relative to the workspace folder; the adapter would
    // resolve it against the extension host's directory instead.
    if (folder && typeof config.cwd === 'string' && config.cwd !== '') {
      config.cwd = path.resolve(folder.uri.fsPath, config.cwd);
    }

    config.program = absoluteProgram(folder, config);

    // Before any entry-point or argument prompt: a too old `nu` stops here.
    const nu = quietNushell();
    if (nu && !(await confirmDapSupport(nu))) {
      return undefined;
    }

    return await resolveEntryPoint(config, config.program, nu);
  }
}

/**
 * `program: "scripts/tool.nu"` is relative to the script's working directory,
 * not to the extension host's — resolve it so both we and the adapter read
 * the right file.
 */
function absoluteProgram(
  folder: vscode.WorkspaceFolder | undefined,
  config: vscode.DebugConfiguration,
): string {
  const program: string = config.program;
  if (path.isAbsolute(program)) {
    return program;
  }

  // `cwd` may itself be relative to the workspace folder.
  const bases = [folder?.uri.fsPath, config.cwd].filter(
    (base): base is string => typeof base === 'string' && base !== '',
  );
  if (bases.length === 0) {
    return program; // nothing to anchor it to: let the adapter report it
  }

  return path.resolve(...bases, program);
}

/**
 * The `nu` to parse the script with. Deliberately not the resolver injected
 * into the adapter factory: that one (`ensureNushell`) reports a missing `nu`,
 * and the factory runs right after this, so reporting here too would warn twice.
 */
function quietNushell(): string | undefined {
  const resolution = resolveNushell();
  return resolution.kind === 'found' ? resolution.path : undefined;
}

/** F5 with no launch.json: debug the active .nu file. */
function fillInActiveFile(
  folder: vscode.WorkspaceFolder | undefined,
  config: vscode.DebugConfiguration,
): void {
  if (config.type || config.request || config.name) {
    return; // a real launch config; leave it alone
  }

  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  if (!isNuDocument(editor.document)) {
    return;
  }

  const script = editor.document.uri.fsPath;
  config.type = DEBUG_TYPE;
  config.request = 'launch';
  config.name = 'Debug nu script';
  config.program = script;
  config.cwd = folder?.uri.fsPath ?? path.dirname(script);
}
