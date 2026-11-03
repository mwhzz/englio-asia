const DIGITS = '০১২৩৪৫৬৭৮৯';

export function toBanglaDigits(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => DIGITS[Number(digit)]);
}
