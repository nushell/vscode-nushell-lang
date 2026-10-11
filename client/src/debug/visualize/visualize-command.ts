import * as vscode from 'vscode';

import { activeNuSession } from '../shared/session';
import { pinVariable, startPick, unpinVariable } from './pinned-variable';
import { openVisualizePanel } from './visualize-panel';
import {
  LOCALS_REFERENCE,
  VariableAddress,
  fetchVisualize,
} from './visualize-request';

/** A variable as VS Code hands it to a `debug/variables/context` command. */
interface MenuVariable {
  name: string;
  value: string;
  variablesReference: number;
  type?: string; // unused here; part of what VS Code passes
}

/** The scope or parent value the variable was listed under. */
interface MenuContainer {
  variablesReference?: number;
}

/** Shape VS Code passes to `debug/variables/context` menu commands. */
export interface VariableContext {
  sessionId?: string; // unused here; part of what VS Code passes
  container?: MenuContainer;
  variable?: MenuVariable;
}

/**
 * The "Visualize" command on the Variables view context menu: ask the adapter
 * for the whole value as JSON and render it in the visualize panel.
 */
export async function visualizeVariable(
  menuContext?: VariableContext,
): Promise<void> {
  const variable = menuContext?.variable;
  if (!variable) {
    return;
  }

  const session = activeNuSession();
  if (!session) {
    return;
  }

  const address = addressOf(variable, menuContext?.container);
  if (!address) {
    void vscode.window.showInformationMessage(
      `'${variable.name}': ${variable.value}`,
    );
    return;
  }

  const isCurrent = startPick();
  try {
    const body = await fetchVisualize(session, address);
    if (!isCurrent()) {
      return; // the user picked another value meanwhile
    }

    openVisualizePanel(variable.name, body);
  } catch (e) {
    if (!isCurrent()) {
      return;
    }

    void vscode.window.showWarningMessage(
      `Nushell Debug: cannot visualize '${variable.name}': ${String(e)}`,
    );
    return;
  }

  trackLive(variable.name, menuContext?.container);
}

/** Expandable values are addressed by their own reference; leaves (strings, binaries, numbers) by container + name. */
function addressOf(
  variable: MenuVariable,
  container?: MenuContainer,
): VariableAddress | undefined {
  if (variable.variablesReference) {
    return { variablesReference: variable.variablesReference };
  }

  if (container?.variablesReference) {
    return {
      containerReference: container.variablesReference,
      name: variable.name,
    };
  }

  return undefined; // unaddressable: nothing to fetch
}

/** Only top-level Locals can be re-read on every stop; anything nested stays a one-off snapshot. */
function trackLive(name: string, container?: MenuContainer): void {
  if (container?.variablesReference !== LOCALS_REFERENCE) {
    unpinVariable();
    return;
  }

  pinVariable(name);
}
