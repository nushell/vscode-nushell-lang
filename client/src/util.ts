import { spawn } from 'node:child_process';
import * as crypto from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as os from 'node:os';
import * as path from 'node:path';
import * as vscode from 'vscode';

/**
 * The result of executing a binary, including the exit code, stdout, and stderr.
 */
export interface ExecutionResult {
  code: number | null;
  stdout: string;
  stderr: string;
}

/**
 * Executes a binary with the given arguments and captures its output.
 * @param binaryPath The path to the binary to execute.
 * @param args The arguments to pass to the binary.
 * @return A promise that resolves to an object containing the exit code, stdout, and stderr.
 * @throws If the binary cannot be executed.
 */
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

/**
 * A utility function that executes a callback and captures any thrown errors.
 * If the callback executes successfully, it returns a tuple with the result and null error.
 * If an error is thrown, it returns a tuple with undefined data and the caught error.
 * @param callback The function to execute.
 * @return A tuple containing either the result and null error, or undefined data and the caught error.
 */
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

/**
 * A utility function that executes an asynchronous callback and captures any thrown errors.
 * If the callback executes successfully, it returns a tuple with the result and null error.
 * If an error is thrown, it returns a tuple with undefined data and the caught error.
 * If `showError` is provided and evaluates to true or a string, an error message will be displayed to the user.
 * @param callback The asynchronous function to execute.
 * @param showError Optional parameter to control error message display. Can be:
 * - `undefined`: No error message will be shown.
 * - `boolean`: If true, a generic error message will be shown.
 * - `string`: A custom error message to display.
 * - `function`: A function that takes the error as an argument and returns a boolean or string to control error message display.
 * @return A promise that resolves to a tuple containing either the result and null error, or undefined data and the caught error.
 */
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

/**
 * Writes the given text content to a temporary file with the specified extension.
 * The file is created in the system's temporary directory.
 *
 * @param content The text content to write to the temporary file.
 * @param extension The file extension to use for the temporary file (default is '.txt').
 * @return A promise that resolves to the path of the created temporary file.
 * @throws If the file cannot be created or written to.
 */
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
