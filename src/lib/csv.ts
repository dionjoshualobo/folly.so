// Spreadsheets run a cell as a formula when it starts with = + - @ (or the
// full-width forms some locales accept), even after leading whitespace or a
// line feed. Plain numbers like -5 are safe and must stay numeric.
const FORMULA_START = /^\s*[=+\-@＝＋－＠]|^[\t\r\n]/
const PLAIN_NUMBER = /^-?\d+(\.\d+)?$/

/** Escape one value for a CSV cell, neutralising formula injection. */
export function csvCell(raw: string): string {
  const val = FORMULA_START.test(raw) && !PLAIN_NUMBER.test(raw) ? `'${raw}` : raw
  const clean = val.replace(/"/g, '""')
  return /[",\n\r]/.test(clean) ? `"${clean}"` : clean
}
