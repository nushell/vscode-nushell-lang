import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';
import * as vscode from 'vscode';
import { spawn } from 'node:child_process';

export interface ExecutionResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

export async function executeBinary(
  binaryPath: string,
  args: string[],
): Promise<ExecutionResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(binaryPath, args);
    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    child.on('close', (code) => {
      resolve({ code, stdout: stdoutData, stderr: stderrData });
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

export function maybe<T>(
  callback: () => T,
): [data: T, error: null] | [data: undefined, error: unknown] {
  try {
    const data = callback();
    return [data, null];
  } catch (error) {
    return [undefined, error];
  }
}

export async function maybeAsync<T>(
  callback: () => Promise<T>,
  showError?:
    | undefined
    | boolean
    | string
    | ((
        error: unknown,
      ) =>
        | string
        | boolean
        | undefined
        | Promise<string | boolean | undefined>),
): Promise<[data: T, error: null] | [data: undefined, error: unknown]> {
  try {
    const data = await callback();
    return [data, null];
  } catch (error) {
    const showErrorValue =
      typeof showError === 'function' ? await showError(error) : showError;
    if (showErrorValue === true || typeof showErrorValue === 'string') {
      await vscode.window.showErrorMessage(
        typeof showErrorValue === 'string'
          ? showErrorValue
          : `An error occurred: ${error}`,
        error,
      );
    }

    return [undefined, error];
  }
}

export async function writeTempFileText(
  content: string,
  extension: string = '.txt',
) {
  const tempdir = os.tmpdir();
  extension = extension.startsWith('.') ? extension : `.${extension}`;
  const fileName = `temp-${crypto.randomUUID()}${extension}`;
  const filePath = path.join(tempdir, fileName);
  await fs.writeFile(filePath, content, 'utf8');

  return filePath;
}
