import * as vscode from 'vscode';

/** Long messages (e.g. the `nuDapIr` listing) are cut to this many characters. */
const MAX_MESSAGE_LENGTH = 2000;

/**
 * Logs the DAP traffic between VS Code and `nu --dap` when the
 * `nushellDebugger.trace` setting is on. A request without a matching
 * response shows what the adapter is stuck on.
 */
export class DapTraceFactory implements vscode.DebugAdapterTrackerFactory {
  private readonly channel: vscode.OutputChannel;

  constructor(channel: vscode.OutputChannel) {
    this.channel = channel;
  }

  createDebugAdapterTracker(
    session: vscode.DebugSession,
  ): vscode.DebugAdapterTracker | undefined {
    if (!isTraceEnabled()) {
      return undefined;
    }

    const log = (line: string) =>
      this.channel.appendLine(`${timestamp()} [${session.name}] ${line}`);

    return {
      onWillStartSession: () => log('session starting'),
      onWillReceiveMessage: (message: unknown) => log(`-> ${format(message)}`),
      onDidSendMessage: (message: unknown) => log(`<- ${format(message)}`),
      onWillStopSession: () => log('session stopping'),
      onError: (error: Error) => log(`adapter error: ${error.message}`),
      onExit: (code: number | undefined, signal: string | undefined) =>
        log(`adapter exited (code ${code ?? '-'}, signal ${signal ?? '-'})`),
    };
  }
}

function isTraceEnabled(): boolean {
  return vscode.workspace
    .getConfiguration('nushellDebugger')
    .get<boolean>('trace', false);
}

/** Local time with milliseconds, e.g. `19:41:55.123`. */
function timestamp(): string {
  const now = new Date();
  const time = now.toTimeString().slice(0, 8);
  const ms = String(now.getMilliseconds()).padStart(3, '0');
  return `${time}.${ms}`;
}

function format(message: unknown): string {
  const text = JSON.stringify(message);
  if (text.length <= MAX_MESSAGE_LENGTH) {
    return text;
  }

  return `${text.slice(0, MAX_MESSAGE_LENGTH)}… (${text.length} chars)`;
}
