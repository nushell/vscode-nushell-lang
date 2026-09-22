import * as vscode from 'vscode';
import * as assert from 'assert';
import { getDocUri, activate, waitFor } from './helper';

function hoverText(hovers: vscode.Hover[]): string {
  return hovers
    .flatMap((h) => h.contents)
    .map((c) => (typeof c === 'string' ? c : c.value))
    .join('\n');
}

suite('Hover from nu --lsp', () => {
  const docUri = getDocUri('hover.nu');

  test('shows help for a built-in command', async () => {
    await activate(docUri);

    // `"hello" | str upcase` -> position inside `upcase`
    const position = new vscode.Position(0, 15);
    const hovers = await waitFor(async () => {
      const result = (await vscode.commands.executeCommand(
        'vscode.executeHoverProvider',
        docUri,
        position,
      )) as vscode.Hover[];
      return result && result.length > 0 ? result : undefined;
    });

    const text = hoverText(hovers);
    assert.match(text, /uppercase/i, `unexpected hover text: ${text}`);
  });
});
