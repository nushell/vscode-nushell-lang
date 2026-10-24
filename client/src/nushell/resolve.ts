import * as os from 'os';
import * as path from 'path';
import {
  commands,
  env,
  Uri,
  window,
  workspace,
  WorkspaceConfiguration,
} from 'vscode';
import * as which from 'which';

import { NUSHELL_DOWNLOAD_PAGE } from './version';

const CONFIG_SECTION = 'nushellLanguageServer';
const EXECUTABLE_SETTING = 'nushellExecutablePath';

/**
 * The `nu` found. `fellBackFrom` is the configured path when it was not found
 * and PATH was used instead; telling the user is up to the caller.
 */
export type Resolution =
  | { kind: 'found'; path: string; fellBackFrom?: string }
  | { kind: 'missing' };

/** The stale setting the user was last warned about, so it is said once. */
let warnedFallback: string | undefined;

function settings(): WorkspaceConfiguration {
  // Use null for resource to get global/workspace settings
  return workspace.getConfiguration(CONFIG_SECTION, null);
}

function expandHome(p: string): string {
  if (!(p === '~' || p.startsWith('~/') || p.startsWith('~\\'))) {
    return p;
  }

  return path.join(os.homedir(), p.slice(1));
}

/**
 * Find the `nu` used by the language server, the terminal profile and the
 * debugger, in order: the `nushellExecutablePath` setting -> `nu` on PATH.
 * Reports nothing; see {@link ensureNushell}.
 */
export function resolveNushell(): Resolution {
  const configured = settings().get<string>(EXECUTABLE_SETTING, 'nu').trim();
  const usesSetting = configured !== '' && configured !== 'nu';

  if (usesSetting) {
    const found = which.sync(expandHome(configured), { nothrow: true });
    if (found) {
      return { kind: 'found', path: found };
    }
  }

  const onPath = which.sync('nu', { nothrow: true });
  if (onPath) {
    return usesSetting
      ? { kind: 'found', path: onPath, fellBackFrom: configured }
      : { kind: 'found', path: onPath };
  }

  return { kind: 'missing' };
}

/**
 * Resolve `nu`, pointing the user at the Nushell download page when nothing
 * is configured or on PATH, and warning (once per value) when the configured
 * path was not found. Returns undefined when there is no usable `nu`.
 */
export function ensureNushell(): string | undefined {
  const resolution = resolveNushell();
  if (resolution.kind === 'found') {
    warnFallback(resolution.fellBackFrom);
    return resolution.path;
  }

  void showNotFound();
  return undefined;
}

function warnFallback(configured: string | undefined): void {
  if (configured === warnedFallback) {
    return;
  }

  warnedFallback = configured;
  if (configured === undefined) {
    return; // the setting works again: warn anew if it breaks
  }

  void window.showWarningMessage(
    `Nushell executable not found at ${CONFIG_SECTION}.${EXECUTABLE_SETTING} (${configured}). Falling back to 'nu' on PATH.`,
  );
}

async function showNotFound(): Promise<void> {
  const openPage = 'Open download page';
  const configurePath = 'Configure path';
  const choice = await window.showWarningMessage(
    'Nushell was not found in your PATH. Install Nushell, or set the path to nu. After installing, run "Nushell: Start Language Server".',
    openPage,
    configurePath,
  );

  switch (choice) {
    case openPage:
      await env.openExternal(Uri.parse(NUSHELL_DOWNLOAD_PAGE));
      break;
    case configurePath:
      await commands.executeCommand(
        'workbench.action.openSettings',
        `${CONFIG_SECTION}.${EXECUTABLE_SETTING}`,
      );
      break;
  }
}
