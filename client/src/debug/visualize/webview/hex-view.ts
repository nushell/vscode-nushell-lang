import { BinaryMarker } from '../cell-values';
import { byteCountNote, decodeHex, hexDump } from '../hex-dump';

const GROUP_SIZES = [1, 2, 4, 8, 16, 32, 64];

/** Offset · hex bytes (grouped) · ASCII, with a toolbar to pick the group size. */
export function renderBinary(binary: BinaryMarker): HTMLElement {
  const bytes = decodeHex(binary.$nuBinary);
  const container = document.createElement('div');
  const toolbar = document.createElement('div');
  toolbar.className = 'toolbar';
  const label = document.createElement('span');
  label.className = 'hint';
  label.textContent = 'group bytes: ';
  toolbar.appendChild(label);
  const listing = document.createElement('pre');
  const note = document.createElement('p');
  note.className = 'hint';
  note.textContent = byteCountNote(bytes.length, binary.length);
  container.append(toolbar, listing, note);

  const show = (groupSize: number): void => {
    for (const button of toolbar.querySelectorAll('button')) {
      button.className = Number(button.textContent) === groupSize ? 'on' : '';
    }

    listing.innerHTML = hexDump(bytes, groupSize);
  };

  for (const size of GROUP_SIZES) {
    toolbar.appendChild(groupButton(size, () => show(size)));
  }

  show(GROUP_SIZES[0]);
  return container;
}

function groupButton(size: number, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button');
  button.textContent = String(size);
  button.addEventListener('click', onClick);
  return button;
}
