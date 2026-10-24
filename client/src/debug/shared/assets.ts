import * as path from 'path';

/**
 * Absolute path of a debugger asset (webview page or script). The extension is
 * bundled into out/extension.js, so `__dirname` is out/ and the assets are
 * copied to out/debug/ by scripts/copy-debug-assets.js.
 */
export function assetPath(file: string): string {
  return path.join(__dirname, 'debug', file);
}

/** The folder holding the debugger assets, for webview `localResourceRoots`. */
export function assetDir(): string {
  return path.join(__dirname, 'debug');
}
