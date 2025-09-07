// utils/dateUtils.js
const MONTHS = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
  jul: 6, aug: 7, sep: 8, sept: 8, oct: 9, nov: 10, dec: 11
};

export function escapeRegex(str = "") {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Parse many human-written date formats into a Date (midnight local).
 * Returns Date object or null.
 * Supported: m/d/yyyy, mm/dd/yy, dd MMM yyyy (e.g. "13 May 2003"), ISO (yyyy-mm-dd), Date constructor forms.
 * Heuristic: if year is far in future (e.g. 2525) convert -> 2000 + (year % 100) to fix common typos like 2525 -> 2025.
 */
export function parseFlexibleDate(input) {
  if (!input) return null;
  if (input instanceof Date && !isNaN(input.getTime())) {
    return new Date(input.getFullYear(), input.getMonth(), input.getDate());
  }

  const s = String(input).trim();
  const curYear = new Date().getFullYear();

  // mm/dd/yyyy or m/d/yyyy
  let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (m) {
    let month = parseInt(m[1], 10);
    let day = parseInt(m[2], 10);
    let year = parseInt(m[3], 10);
    if (year < 100) year += (year >= 70 ? 1900 : 2000);
    if (year > curYear + 2) year = 2000 + (year % 100); // heuristic fix e.g. 2525 -> 2025
    return new Date(year, month - 1, day);
  }

  // dd MMM yyyy  e.g. "13 May 2003" or "1 Jan 23"
  m = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{2,4})$/);
  if (m) {
    let day = parseInt(m[1], 10);
    let mon = m[2].toLowerCase().slice(0, 3);
    let year = parseInt(m[3], 10);
    const monthIndex = MONTHS[mon];
    if (monthIndex === undefined) return null;
    if (year < 100) year += (year >= 70 ? 1900 : 2000);
    if (year > curYear + 2) year = 2000 + (year % 100);
    return new Date(year, monthIndex, day);
  }

  // ISO yyyy-mm-dd
  m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (m) {
    return new Date(parseInt(m[1]), parseInt(m[2], 10) - 1, parseInt(m[3], 10));
  }

  // Fallback to Date constructor parsing
  const d = new Date(s);
  if (!isNaN(d.getTime())) return new Date(d.getFullYear(), d.getMonth(), d.getDate());

  return null;
}

/**
 * Compare two Date objects by day/month/year (ignore time)
 */
export function sameYMD(a, b) {
  if (!(a instanceof Date) || !(b instanceof Date)) return false;
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}
