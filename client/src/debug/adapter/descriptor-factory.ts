import { execFile } from 'child_process';
import { promisify } from 'util';
import {
  CancellationError,
  DebugAdapterDescriptor,
  DebugAdapterDescriptorFactory,
  DebugAdapterExecutable,
  Uri,
  env,
  window,
} from 'vscode';

import {
  NUSHELL_DOWNLOAD_PAGE,
  compareVersions,
  parseNuVersion,
} from '../../nushell/version';

const execFileAsync = promisify(execFile);

/** The first Nushell release that ships `nu --dap`. */
export const MIN_DAP_VERSION = '0.116.0';

/** Finds the `nu` to run; undefined when there is none, after telling the user. */
export type NushellResolver = () => string | undefined;

/**
 * The debugger ships inside Nushell itself: `nu --dap` starts a Debug Adapter
 * Protocol server over stdio — the same entry point Zed, Neovim, and any other
 * DAP client use. All we do is find a `nu` (the same one the language server
 * uses) and spawn it.
 */
export class AdapterDescriptorFactory implements DebugAdapterDescriptorFactory {
  private readonly resolveNushell: NushellResolver;

  constructor(resolveNushell: NushellResolver) {
    this.resolveNushell = resolveNushell;
  }

  /**
   * Cancels the launch when there is no usable `nu`. The resolver has already
   * told the user (with buttons to download or configure), so cancelling keeps
   * VS Code from showing a second error on top of it.
   */
  async createDebugAdapterDescriptor(): Promise<DebugAdapterDescriptor> {
    const nu = this.resolveNushell();
    if (!nu) {
      throw new CancellationError();
    }

    // Normally a cache hit: the launch configuration provider checked first.
    if (!(await confirmDapSupport(nu))) {
      throw new CancellationError();
    }

    return new DebugAdapterExecutable(nu, ['--dap']);
  }
}

/** `nu` paths already known to support `--dap`. */
const supported = new Set<string>();

/**
 * Compares `nu --version` against {@link MIN_DAP_VERSION}; nightlies report
 * the upcoming release (e.g. `0.116.0-nightly.3`), so they pass too. Not
 * cached on failure: the user may upgrade `nu` before the next launch.
 *
 * False for a too old `nu`, after offering the Nushell download page; the
 * caller cancels the launch. VS Code doesn't show an error for a cancelled
 * launch, so this is the only message the user sees.
 */
export async function confirmDapSupport(nu: string): Promise<boolean> {
  if (supported.has(nu)) {
    return true;
  }

  const version = await nuVersion(nu);
  if (!version) {
    return true; // could not ask: let `nu --dap` speak for itself
  }

  if (compareVersions(version, MIN_DAP_VERSION) >= 0) {
    supported.add(nu);
    return true;
  }

  void offerDownloadPage(nu, version);
  return false;
}

async function offerDownloadPage(nu: string, version: string): Promise<void> {
  const openPage = 'Open download page';
  const choice = await window.showWarningMessage(
    `Debugging is disabled because it needs Nushell ${MIN_DAP_VERSION} or higher, ` +
      `and ${nu} is version ${version}. Go to the Nushell download page?`,
    openPage,
  );

  if (choice === openPage) {
    await env.openExternal(Uri.parse(NUSHELL_DOWNLOAD_PAGE));
  }
}

async function nuVersion(nu: string): Promise<string | undefined> {
  try {
    const { stdout } = await execFileAsync(nu, ['--version'], {
      timeout: 10000,
    });
    return parseNuVersion(stdout);
  } catch {
    return undefined;
  }
}
