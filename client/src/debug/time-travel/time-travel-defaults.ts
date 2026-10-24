import * as vscode from 'vscode';

/**
 * The adapter reads time travel from the launch arguments; the `nushellDebugger.timeTravel*`
 * settings supply the defaults for whatever the launch config leaves out.
 * Registered as its own configuration provider so the launch slice does not
 * need to know the feature exists.
 */
export class TimeTravelDefaults implements vscode.DebugConfigurationProvider {
  resolveDebugConfigurationWithSubstitutedVariables(
    _folder: vscode.WorkspaceFolder | undefined,
    config: vscode.DebugConfiguration,
  ): vscode.ProviderResult<vscode.DebugConfiguration> {
    const settings = vscode.workspace.getConfiguration('nushellDebugger');
    if (config.timeTravel === undefined) {
      config.timeTravel = settings.get<boolean>('timeTravel', true);
    }

    if (config.timeTravelMaxSteps === undefined) {
      config.timeTravelMaxSteps = settings.get<number>(
        'timeTravelMaxSteps',
        10000,
      );
    }

    return config;
  }
}
