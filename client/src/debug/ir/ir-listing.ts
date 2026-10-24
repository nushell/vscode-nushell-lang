import { escapeHtml } from '../shared/escape-html';

/** One IR line as HTML; the instruction we are paused on is marked so the page can scroll to it. */
export function irLine(line: string, currentIndex: number): string {
  if (!isInstructionAt(line, currentIndex)) {
    return `<span>${escapeHtml(line)}\n</span>`;
  }

  return `<span class="current" id="cur">${escapeHtml(line)}\n</span>`;
}

/** IR lines are numbered `  12: instruction`; is this the one at `index`? */
export function isInstructionAt(line: string, index: number): boolean {
  const match = /^\s*(\d+):/.exec(line);
  if (!match) {
    return false;
  }

  return Number(match[1]) === index;
}
