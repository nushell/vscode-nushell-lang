// Copy the debugger's webview pages (.html/.css), which live next to their
// TypeScript under client/src/debug/, into out/debug/. The extension is bundled
// into out/extension.js, so the panels load them from there (see
// client/src/debug/shared/assets.ts). Webview scripts are not copied: esbuild
// bundles client/src/debug/visualize/webview/main.ts (see package.json).
const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'client', 'src', 'debug');
const OUT = path.join(__dirname, '..', 'out', 'debug');
const ASSET = /\.(html|css)$/;

function copyAssets(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const from = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      copyAssets(from);
      continue;
    }

    if (!ASSET.test(entry.name)) {
      continue;
    }

    // Flat: the panels look assets up by file name only
    const to = path.join(OUT, entry.name);
    if (copied.has(entry.name)) {
      throw new Error(`Duplicate debugger asset name: ${entry.name}`);
    }
    fs.mkdirSync(OUT, { recursive: true });
    fs.copyFileSync(from, to);
    copied.add(entry.name);
  }
}

const copied = new Set();
copyAssets(SRC);
