// Argentine CBU (Clave Bancaria Uniforme) check-digit validation, mirroring the
// BCRA modulo-10 algorithm used by the backend (ms-banks Cbu value object).
//
// Layout (22 digits):
//   Block 1 (8):  bankNumber(3) sucursalCode(4) checkDigit1(1)
//   Block 2 (14): accountNumber(13)             checkDigit2(1)
//
// Each check digit = (10 - (weightedSum(body) mod 10)) mod 10.

const FIRST_BLOCK_WEIGHTS = [7, 1, 3, 9, 7, 1, 3]
const SECOND_BLOCK_WEIGHTS = [3, 9, 7, 1, 3, 9, 7, 1, 3, 9, 7, 1, 3]

function checkDigit(body: string, weights: number[]): number {
  const sum = weights.reduce((acc, w, i) => acc + Number(body[i]) * w, 0)
  return (10 - (sum % 10)) % 10
}

export function cbuCheckDigits(cbu: string): { cd1: number; cd2: number } {
  return {
    cd1: checkDigit(cbu.slice(0, 7), FIRST_BLOCK_WEIGHTS),
    cd2: checkDigit(cbu.slice(8, 21), SECOND_BLOCK_WEIGHTS),
  }
}

export function isValidCbu(cbu: string): boolean {
  if (!/^\d{22}$/.test(cbu)) return false
  const { cd1, cd2 } = cbuCheckDigits(cbu)
  return Number(cbu[7]) === cd1 && Number(cbu[21]) === cd2
}

/** Human-readable reason a 22-digit CBU fails check-digit validation, or null if valid. */
export function cbuCheckDigitError(cbu: string): string | null {
  if (!/^\d{22}$/.test(cbu)) return null // format handled elsewhere
  const { cd1, cd2 } = cbuCheckDigits(cbu)
  const bad: string[] = []
  if (Number(cbu[7]) !== cd1) bad.push(`digit 8 should be ${cd1}`)
  if (Number(cbu[21]) !== cd2) bad.push(`digit 22 should be ${cd2}`)
  return bad.length ? `Invalid CBU check digit (${bad.join(', ')})` : null
}
