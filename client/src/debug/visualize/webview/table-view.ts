import { escapeAttribute, escapeHtml } from '../../shared/escape-html';
import { NuRecord, cellText, compareCells } from '../cell-values';

interface Column {
  key: string;
  label: string;
  /** Rendered muted and not searched: the row index, not data. */
  dim?: boolean;
}

/** What a table shows: its columns, its rows, and how to read one cell of a row. */
interface Table<Row> {
  columns: Column[];
  rows: Row[];
  cell: (row: Row, key: string) => unknown;
  /** The noun in the row count: "row(s)", "item(s)", … */
  unit: string;
}

type SortDirection = 1 | -1;

/** The user's current sort and filter. */
interface View {
  sortKey?: string;
  direction: SortDirection;
  filter: string;
}

const INDEX_COLUMN: Column = { key: '__index', label: '#', dim: true };

/** A list of records (a nu table): one row per record, the union of their fields as columns. */
export function renderTable(records: NuRecord[]): HTMLElement {
  const rows = records.map((record, index) => ({ index, record }));
  return makeTable({
    columns: tableColumns(records),
    rows,
    cell: (row, key) =>
      key === INDEX_COLUMN.key ? row.index : row.record[key],
    unit: 'row(s)',
  });
}

/** Every field of every record, in order of first appearance, after the index column. */
function tableColumns(records: NuRecord[]): Column[] {
  const fields = new Set<string>();
  for (const record of records) {
    for (const field of Object.keys(record)) {
      fields.add(field);
    }
  }

  return [
    INDEX_COLUMN,
    ...Array.from(fields, (field) => ({ key: field, label: field })),
  ];
}

/** A plain list: index and value. */
export function renderList(items: unknown[]): HTMLElement {
  const rows = items.map((item, index) => ({ index, item }));
  return makeTable({
    columns: [INDEX_COLUMN, { key: 'value', label: 'value' }],
    rows,
    cell: (row, key) => (key === INDEX_COLUMN.key ? row.index : row.item),
    unit: 'item(s)',
  });
}

/** A single record: field and value. */
export function renderRecord(record: NuRecord): HTMLElement {
  return makeTable({
    columns: [
      { key: 'field', label: 'field' },
      { key: 'value', label: 'value' },
    ],
    rows: Object.entries(record),
    cell: ([field, value], key) => (key === 'field' ? field : value),
    unit: 'field(s)',
  });
}

/** A sortable (click a header: ascending, descending, off) and filterable table. */
function makeTable<Row>(table: Table<Row>): HTMLElement {
  const container = document.createElement('div');
  const filterInput = document.createElement('input');
  filterInput.placeholder = 'filter…';
  const head = document.createElement('thead');
  const body = document.createElement('tbody');
  const grid = document.createElement('table');
  grid.append(head, body);
  const count = document.createElement('p');
  count.className = 'hint';
  container.append(filterInput, grid, count);

  const view: View = { direction: 1, filter: '' };
  const render = (): void => {
    const shown = sorted(matching(table, view.filter), table, view);
    head.innerHTML = `<tr>${table.columns.map((column) => headerCell(column, view)).join('')}</tr>`;
    body.innerHTML = shown.map((row) => rowHtml(table, row)).join('');
    count.textContent = `${shown.length} of ${table.rows.length} ${table.unit}`;
  };

  head.addEventListener('click', (event) => {
    const header = (event.target as Element).closest('th');
    if (!header) {
      return;
    }

    cycleSort(view, header.getAttribute('data-key') ?? undefined);
    render();
  });

  filterInput.addEventListener('input', () => {
    view.filter = filterInput.value;
    render();
  });

  render();
  return container;
}

/** Clicking a header cycles ascending → descending → unsorted; clicking another header starts ascending. */
function cycleSort(view: View, key: string | undefined): void {
  if (view.sortKey !== key) {
    view.sortKey = key;
    view.direction = 1;
    return;
  }

  if (view.direction === 1) {
    view.direction = -1;
    return;
  }

  view.sortKey = undefined;
  view.direction = 1;
}

function headerCell(column: Column, view: View): string {
  const cls = column.dim ? ' class="idx"' : '';
  return `<th data-key="${escapeAttribute(column.key)}"${cls}>${escapeHtml(column.label)}${sortArrow(column, view)}</th>`;
}

function sortArrow(column: Column, view: View): string {
  if (view.sortKey !== column.key) {
    return '';
  }

  if (view.direction === 1) {
    return ' ▲';
  }

  return ' ▼';
}

/** The rows whose data cells contain the filter text; the index column is not searched. */
function matching<Row>(table: Table<Row>, filter: string): Row[] {
  const needle = filter.toLowerCase();
  if (!needle) {
    return table.rows;
  }

  const searched = table.columns.filter((column) => !column.dim);
  return table.rows.filter((row) =>
    searched.some((column) =>
      cellText(table.cell(row, column.key)).toLowerCase().includes(needle),
    ),
  );
}

function sorted<Row>(rows: Row[], table: Table<Row>, view: View): Row[] {
  const key = view.sortKey;
  if (key === undefined) {
    return rows;
  }

  return [...rows].sort(
    (a, b) =>
      view.direction * compareCells(table.cell(a, key), table.cell(b, key)),
  );
}

function rowHtml<Row>(table: Table<Row>, row: Row): string {
  const cells = table.columns.map((column) => {
    const value = table.cell(row, column.key);
    return `<td${cellClass(column, value)}>${escapeHtml(cellText(value))}</td>`;
  });

  return `<tr>${cells.join('')}</tr>`;
}

function cellClass(column: Column, value: unknown): string {
  if (column.dim) {
    return ' class="idx"';
  }

  if (typeof value === 'number') {
    return ' class="num"';
  }

  return '';
}
