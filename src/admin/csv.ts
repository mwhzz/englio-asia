import { adminApi } from './adminApi';

/** Rows as CSV text (Excel and Google Sheets open it; a BOM keeps Bangla readable in Excel). */
export function toCsv(rows: Record<string, unknown>[]): string {
  if (!rows.length) return '';
  const cols = Object.keys(rows[0]);
  const cell = (v: unknown) => {
    const s = v === null || v === undefined ? '' : String(v);
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return `﻿${[cols.join(','), ...rows.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\r\n')}`;
}

/** Downloads an admin export (`/export/users`, `/export/tickets`, `/export/payments`) as a .csv file. */
export async function downloadCsv(path: string, name: string): Promise<void> {
  const rows = await adminApi<Record<string, unknown>[]>('GET', path);
  const url = URL.createObjectURL(new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: `${name}-${new Date().toISOString().slice(0, 10)}.csv` });
  a.click();
  URL.revokeObjectURL(url);
}
