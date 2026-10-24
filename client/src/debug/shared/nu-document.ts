import * as vscode from 'vscode';

/** Language ids other extensions register for Nushell; either counts. */
const NU_LANGUAGE_IDS = ['nushell', 'nu'];

/** Is this document a Nushell script? */
export function isNuDocument(doc: vscode.TextDocument): boolean {
  if (NU_LANGUAGE_IDS.includes(doc.languageId)) {
    return true;
  }

  return doc.fileName.endsWith('.nu');
}
