import * as vscode from 'vscode';

/** Body of the adapter's `nuDapUi` prompt event. */
export interface UiRequest {
  id: number;
  kind: 'text' | 'list';
  prompt: string;
  default?: string;
  items?: string[];
  multi?: boolean;
  truncated?: boolean;
}

/** The answer we send back: a value, the chosen index/indices, or a cancellation. */
type UiReply =
  | { value: string }
  | { index: number }
  | { indices: number[] }
  | { cancelled: true };

interface ListPick extends vscode.QuickPickItem {
  index: number;
}

const CANCELLED: UiReply = { cancelled: true };

/**
 * Native prompts for the script's `input` / `input list` commands.
 *
 * The adapter fires a `nuDapUi` event and blocks its eval thread until we
 * answer with a `nuDapUiReply` request, so every path here must end in a reply.
 */
export async function handleUiRequest(
  session: vscode.DebugSession,
  request: UiRequest,
): Promise<void> {
  const reply = await askUser(request);
  await sendReply(session, request.id, reply);
}

async function askUser(request: UiRequest): Promise<UiReply> {
  try {
    if (request.kind === 'list') {
      return await askFromList(request);
    }

    return await askForText(request);
  } catch {
    return CANCELLED; // the dialog was torn down (e.g. the window closed)
  }
}

async function askForText(request: UiRequest): Promise<UiReply> {
  const value = await vscode.window.showInputBox({
    prompt: request.prompt,
    value: request.default,
    ignoreFocusOut: true,
  });

  if (value === undefined) {
    return CANCELLED;
  }

  return { value };
}

async function askFromList(request: UiRequest): Promise<UiReply> {
  const picks = toPicks(request.items ?? []);
  const title = listTitle(request);
  if (request.multi) {
    return await askForManyPicks(picks, title);
  }

  return await askForOnePick(picks, title);
}

async function askForOnePick(
  picks: ListPick[],
  title: string,
): Promise<UiReply> {
  const selected = await vscode.window.showQuickPick(picks, {
    title,
    ignoreFocusOut: true,
  });
  if (!selected) {
    return CANCELLED;
  }

  return { index: selected.index };
}

async function askForManyPicks(
  picks: ListPick[],
  title: string,
): Promise<UiReply> {
  const selected = await vscode.window.showQuickPick(picks, {
    title,
    canPickMany: true,
    ignoreFocusOut: true,
  });
  if (!selected) {
    return CANCELLED;
  }

  return { indices: selected.map((pick) => pick.index) };
}

/** The adapter answers by index, so show it — the list may contain duplicate labels. */
function toPicks(items: string[]): ListPick[] {
  return items.map((label, index) => ({
    label,
    description: `#${index}`,
    index,
  }));
}

function listTitle(request: UiRequest): string {
  if (!request.truncated) {
    return request.prompt;
  }

  return `${request.prompt} (list truncated to 1000 items)`;
}

async function sendReply(
  session: vscode.DebugSession,
  id: number,
  reply: UiReply,
): Promise<void> {
  try {
    await session.customRequest('nuDapUiReply', { id, ...reply });
  } catch {
    // The session ended while the dialog was open: nobody is waiting any more.
  }
}
