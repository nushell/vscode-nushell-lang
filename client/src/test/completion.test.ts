import * as vscode from 'vscode';
import * as assert from 'assert';
import { getDocUri, activate, waitFor } from './helper';

function labelsOf(list: vscode.CompletionList): string[] {
  return list.items.map((item) =>
    typeof item.label === 'string' ? item.label : item.label.label,
  );
}

suite('Completion from nu --lsp', () => {
  const docUri = getDocUri('completion.nu');

  test('completes a built-in subcommand', async () => {
    await activate(docUri);

    // `"hello" | str upc` -> end of line
    const position = new vscode.Position(0, 17);
    let lastLabels: string[] = [];
    // VS Code also offers word-based and snippet suggestions, so keep polling
    // until the language server's own item shows up.
    const labels = await waitFor(async () => {
      const result = (await vscode.commands.executeCommand(
        'vscode.executeCompletionItemProvider',
        docUri,
        position,
      )) as vscode.CompletionList;
      lastLabels = result ? labelsOf(result) : [];
      return lastLabels.some((label) => label.includes('upcase'))
        ? lastLabels
        : undefined;
    }).catch((error) => {
      throw new Error(
        `expected a completion containing 'upcase', got: ${lastLabels.join(', ')} (${error})`,
      );
    });

    assert.ok(labels.some((label) => label.includes('upcase')));
  });
});
