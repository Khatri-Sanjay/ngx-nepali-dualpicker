import { toEnglishNumerals, toNepaliNumerals } from './convert-numerals';

describe('Calendar numeral conversion', () => {
	it('round-trips every numeral while retaining punctuation and surrounding text', () => {
		const source = 'AD 0123456789 / -1.5, BS';
		expect(toNepaliNumerals(source)).toBe('AD ०१२३४५६७८९ / -१.५, BS');
		expect(toEnglishNumerals(toNepaliNumerals(source))).toBe(source);
	});
	it('preserves existing Nepali glyphs and handles zero and empty text', () => {
		expect(toNepaliNumerals('२०८०-01-15')).toBe('२०८०-०१-१५');
		expect(toNepaliNumerals(0)).toBe('०');
		expect(toEnglishNumerals('')).toBe('');
	});
});
