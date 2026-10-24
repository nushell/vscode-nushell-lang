import { formatText } from '../text-format';

/** A string: formatted and highlighted when it is JSON or XML, otherwise verbatim. */
export function renderString(text: string): HTMLElement {
  const formatted = formatText(text);
  const container = document.createElement('div');
  const note = document.createElement('p');
  note.className = 'hint';
  note.textContent = formatted.note;
  const listing = document.createElement('pre');
  listing.innerHTML = formatted.html;
  container.append(note, listing);
  return container;
}
