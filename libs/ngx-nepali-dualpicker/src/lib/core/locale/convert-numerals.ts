import { EN_TO_NE_DIGITS, NE_TO_EN_DIGITS, EnDigit, NeDigit } from './numeral-mappings';

/** Replace numeric glyphs only; preserve separators, signs, labels and whitespace. */
export function toNepaliNumerals(value: string | number): string {
	return String(value).replace(/[0-9]/g, (digit) => EN_TO_NE_DIGITS[digit as EnDigit]);
}

/** Normalize glyphs without broadening any caller's date parsing grammar. */
export function toEnglishNumerals(value: string): string {
	return value.replace(/[\u0966-\u096f]/g, (digit) => NE_TO_EN_DIGITS[digit as NeDigit]);
}
