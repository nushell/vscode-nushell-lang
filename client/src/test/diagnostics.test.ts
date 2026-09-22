import * as vscode from 'vscode';
import * as assert from 'assert';
import { getDocUri, activate, waitFor } from './helper';

suite('Diagnostics from nu --lsp', () => {
  const docUri = getDocUri('diagnostics.nu');

  test('reports a parse error for an incomplete let', async () => {
    await activate(docUri);

    const diagnostics = await waitFor(() => {
      const found = vscode.languages.getDiagnostics(docUri);
      return found.length > 0 ? found : undefined;
    });

    assert.ok(
      diagnostics.some((d) => d.severity === vscode.DiagnosticSeverity.Error),
      `expected an error diagnostic, got: ${JSON.stringify(diagnostics)}`,
    );
    assert.strictEqual(diagnostics[0].range.start.line, 0);
  });
});
