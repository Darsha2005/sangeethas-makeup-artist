/**
 * PURE STRING DATE & TIME UTILITIES
 * 
 * Prevents timezone shifting bugs by avoiding JavaScript `new Date('YYYY-MM-DD')`
 * UTC parsing. All date-only strings are kept strictly in ISO 'YYYY-MM-DD' format.
 */

// Return local today as 'YYYY-MM-DD'
export function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Format 'YYYY-MM-DD' into 'DD-MM-YYYY' display format
export function formatDateDisplay(isoDateStr: string | null | undefined): string {
  if (!isoDateStr) return '-';
  const clean = String(isoDateStr).trim().split('T')[0];
  const parts = clean.split('-');
  if (parts.length === 3 && parts[0].length === 4) {
    const [y, m, d] = parts;
    return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
  }
  return clean;
}

// Format 24-hour 'HH:mm' into 12-hour 'hh:mm AM/PM'
export function formatTime12H(timeStr: string | null | undefined): string {
  if (!timeStr) return '-';
  const str = String(timeStr).trim();
  const match = str.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return str;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

// Convert any input to valid 'YYYY-MM-DD'
export function toIsoDate(val: string | null | undefined): string {
  if (!val) return '';
  const str = String(val).trim().split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const match = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (match) {
    const [, d, m, y] = match;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return str;
}
