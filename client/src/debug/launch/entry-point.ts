import * as vscode from 'vscode';

import { promptArgs } from './argument-prompt';
import { NuDefinition, readDefinitions } from './script-signatures';

/** The extra entry in the entry-point picker: don't call a command, just run the file. */
const RUN_TOP_TO_BOTTOM = '▶ Run script top-to-bottom';

/**
 * Decide what the adapter should call and with which arguments: `main` when
 * the script has one, otherwise a function the user picks (or nothing, to run
 * the file top-to-bottom). Every path may return undefined, which aborts the
 * launch — that is how a cancelled prompt is reported.
 *
 * Without a `nu` to parse the script with, or when parsing fails, the launch
 * goes ahead as configured.
 */
export async function resolveEntryPoint(
  config: vscode.DebugConfiguration,
  program: string,
  nu: string | undefined,
): Promise<vscode.DebugConfiguration | undefined> {
  if (!nu) {
    return config; // the adapter reports the missing `nu`
  }

  const defs = await readDefinitions(nu, program);
  if (!defs) {
    return config;
  }

  // Read the name the way nu-dap does: trimmed, and blank means `main`.
  const named =
    typeof config.entryPoint === 'string'
      ? config.entryPoint.trim() || undefined
      : undefined;
  const def = defs.find((candidate) => candidate.name === (named ?? 'main'));
  if (def) {
    return await ensureArgs(config, def);
  }

  return await askForEntryPoint(config, defs, named);
}

/** No `main`: let the user pick a function to debug (or run the script top-to-bottom). */
async function askForEntryPoint(
  config: vscode.DebugConfiguration,
  defs: NuDefinition[],
  named: string | undefined,
): Promise<vscode.DebugConfiguration | undefined> {
  if (named !== undefined) {
    return config; // the launch config names one; the adapter reports it if missing
  }

  if (defs.length === 0) {
    return config; // nothing to choose between
  }

  const picked = await pickEntryPoint(defs);
  if (picked === undefined) {
    return undefined; // cancelled
  }

  if (picked === RUN_TOP_TO_BOTTOM) {
    return config;
  }

  config.entryPoint = picked.name;
  return await ensureArgs(config, picked);
}

async function pickEntryPoint(
  defs: NuDefinition[],
): Promise<NuDefinition | typeof RUN_TOP_TO_BOTTOM | undefined> {
  const names = defs.map((def) => def.name);
  const picked = await vscode.window.showQuickPick(
    [RUN_TOP_TO_BOTTOM, ...names],
    {
      title: 'Nushell Debug: entry point',
      placeHolder:
        'This script has no `main`. Choose a function to debug (or run it top-to-bottom).',
      ignoreFocusOut: true,
    },
  );
  if (picked === undefined || picked === RUN_TOP_TO_BOTTOM) {
    return picked;
  }

  return defs.find((def) => def.name === picked);
}

/**
 * Prompt for arguments when the entry point requires some and the launch
 * config has none. `"args": []` (as in the README example) counts as none.
 */
async function ensureArgs(
  config: vscode.DebugConfiguration,
  def: NuDefinition,
): Promise<vscode.DebugConfiguration | undefined> {
  if (
    Array.isArray(config.args)
      ? config.args.length > 0
      : config.args !== undefined
  ) {
    return config;
  }

  if (!def.hasRequired) {
    return config;
  }

  const args = await promptArgs(def.usage);
  if (args === undefined) {
    return undefined; // cancelled
  }

  config.args = args;
  return config;
}
