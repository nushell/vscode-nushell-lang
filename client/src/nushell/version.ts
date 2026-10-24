// Pure helpers for checking a Nushell version.
// Kept free of `vscode` imports so they can be unit tested with node:test.

/** Where users are sent to install or upgrade Nushell themselves. */
export const NUSHELL_DOWNLOAD_PAGE =
  'https://www.nushell.sh/book/installation.html';

/** Extract `x.y.z` from `nu --version` output (e.g. `0.116.0` or `0.116.0-nightly.3`). */
export function parseNuVersion(output: string): string | undefined {
  const match = /(\d+)\.(\d+)\.(\d+)/.exec(output);
  return match ? `${match[1]}.${match[2]}.${match[3]}` : undefined;
}

/** Numeric comparison of `x.y.z` versions: negative when a < b, 0 when equal, positive when a > b. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) {
      return diff;
    }
  }
  return 0;
}
