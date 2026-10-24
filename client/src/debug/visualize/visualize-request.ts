import * as vscode from 'vscode';

/** Body of the adapter's `nuDapVisualize` response: the whole value as JSON. */
export interface VisualizeResponse {
  value: unknown;
  type: string;
  truncated: boolean;
}

/** How the adapter is told which value to send: by its own reference, or by container + name. */
export interface VariableAddress {
  variablesReference?: number;
  containerReference?: number;
  name?: string;
}

/**
 * The adapter's fixed `variablesReference` for the top-level Locals scope —
 * `PauseSnapshot::LOCALS_REF` in Nushell's crates/nu-dap/src/state.rs (nushell/nushell).
 */
export const LOCALS_REFERENCE = 1;

/** Ask the adapter for a value in full. Rejects when the address is stale or the session is gone. */
export async function fetchVisualize(
  session: vscode.DebugSession,
  address: VariableAddress,
): Promise<VisualizeResponse> {
  return (await session.customRequest(
    'nuDapVisualize',
    address,
  )) as VisualizeResponse;
}
