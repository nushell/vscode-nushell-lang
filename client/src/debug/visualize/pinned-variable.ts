import * as vscode from 'vscode';

import {
  isVisualizePanelOpen,
  markVisualizePanelStale,
  updateVisualizePanel,
} from './visualize-panel';
import { LOCALS_REFERENCE, fetchVisualize } from './visualize-request';

// Live tracking for the visualize panel.
//
// The panel can follow one variable: on every stop we re-fetch it and repaint,
// so the grid tracks execution. Only members of the top-level Locals scope can
// be re-fetched, because only they have a stable container + name; nested
// values are addressed by a reference that is invalidated at the next stop.

let pinnedName: string | undefined;

/**
 * Bumped per refresh and per pin change; a response that is not from the
 * latest refresh, or that arrives after the user picked another value, is
 * discarded.
 */
let generation = 0;

/**
 * Bumped per Visualize pick. A pick outranks a refresh: a refresh that
 * started before a pick is dropped, but a refresh never drops a pick.
 */
let picks = 0;

/** Start a Visualize pick; the returned check says whether no later pick came in. */
export function startPick(): () => boolean {
  const mine = ++picks;
  return () => mine === picks;
}

export function pinVariable(name: string): void {
  pinnedName = name;
  generation++;
}

export function unpinVariable(): void {
  pinnedName = undefined;
  generation++;
}

/** Re-read the pinned variable and repaint the visualize panel. */
export async function refreshPinnedVariable(
  session: vscode.DebugSession,
): Promise<void> {
  const name = pinnedName;
  if (!name) {
    return;
  }

  if (!isVisualizePanelOpen()) {
    return;
  }

  const mine = ++generation;
  const picksThen = picks;
  const isCurrent = () => mine === generation && picksThen === picks;
  try {
    const body = await fetchVisualize(session, {
      containerReference: LOCALS_REFERENCE,
      name,
    });
    if (!isCurrent()) {
      return; // a later stop or a new pick superseded this answer
    }

    updateVisualizePanel(name, body);
  } catch {
    if (!isCurrent()) {
      return;
    }

    markVisualizePanelStale(); // the variable is out of scope at this stop
  }
}
