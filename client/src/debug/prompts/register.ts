import * as vscode from 'vscode';

import { onCustomEvent } from '../shared/custom-event';
import { UiRequest, handleUiRequest } from './ui-prompts';

export function register(): vscode.Disposable[] {
  return [
    onCustomEvent<UiRequest>(
      'nuDapUi',
      (session, request) => void handleUiRequest(session, request),
    ),
  ];
}
