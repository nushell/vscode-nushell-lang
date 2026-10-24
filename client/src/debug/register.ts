import { Disposable } from 'vscode';

import * as adapter from './adapter/register';
import { NushellResolver } from './adapter/descriptor-factory';
import * as ir from './ir/register';
import * as launch from './launch/register';
import * as prompts from './prompts/register';
import * as restart from './restart/register';
import * as timeTravel from './time-travel/register';
import * as trace from './trace/register';
import * as visualize from './visualize/register';

/**
 * Nushell debugger.
 *
 * All debugging logic lives in Nushell itself (`nu --dap`, the `nu-dap` crate).
 * This only wires VS Code up to it. Each feature is a folder under debug/ that
 * owns its own VS Code registrations; this file just lists them.
 */
export function registerDebugger(
  resolveNushell: NushellResolver,
): Disposable[] {
  return [
    ...adapter.register(resolveNushell),
    ...timeTravel.register(),
    ...launch.register(),
    ...prompts.register(),
    ...visualize.register(),
    ...ir.register(),
    ...restart.register(),
    ...trace.register(),
  ];
}
