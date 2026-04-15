/**
 * UK number plate utilities.
 * Covers: current format (AB12 ABC), prefix (A123 BCD), suffix (ABC 123A),
 * dateless, Northern Ireland (AZZ 1234 / AAZ 1234), and military.
 */

// Current UK format: 2 letters, 2 digits, space?, 3 letters
const CURRENT_FORMAT = /^[A-Z]{2}[0-9]{2}\s?[A-Z]{3}$/i
// Prefix format: 1 letter, 1-3 digits, space?, 3 letters
const PREFIX_FORMAT = /^[A-Z][0-9]{1,3}\s?[A-Z]{3}$/i
// Suffix format: 3 letters, space?, 1-3 digits, 1 letter
const SUFFIX_FORMAT = /^[A-Z]{3}\s?[0-9]{1,3}[A-Z]$/i
// Dateless: 1-4 digits + 1-3 letters, or 1-3 letters + 1-4 digits
const DATELESS_FORMAT = /^[0-9]{1,4}\s?[A-Z]{1,3}$|^[A-Z]{1,3}\s?[0-9]{1,4}$/i
// Northern Ireland: 3 letters + 1-4 digits (includes AZ/IZ/OI etc)
const NI_FORMAT = /^[A-Z]{1,3}[0-9]{1,4}$/i

export function normaliseReg(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, '')
}

export function isValidUKPlate(input: string): boolean {
  const reg = normaliseReg(input)
  return (
    CURRENT_FORMAT.test(reg) ||
    PREFIX_FORMAT.test(reg) ||
    SUFFIX_FORMAT.test(reg) ||
    DATELESS_FORMAT.test(reg) ||
    NI_FORMAT.test(reg)
  )
}

/**
 * Format a registration for display — e.g. AB12ABC → AB12 ABC
 */
export function formatReg(input: string): string {
  const reg = normaliseReg(input)
  if (CURRENT_FORMAT.test(reg) && reg.length === 7) {
    return `${reg.slice(0, 4)} ${reg.slice(4)}`
  }
  return reg
}

/**
 * Determine approximate year of a current-format plate.
 * March: 01-50, September: 51-99.
 */
export function plateYear(input: string): number | null {
  const reg = normaliseReg(input)
  if (!CURRENT_FORMAT.test(reg)) return null
  const code = parseInt(reg.slice(2, 4), 10)
  if (code >= 1 && code <= 50) return 2000 + code
  if (code >= 51 && code <= 99) return 1949 + code
  return null
}
