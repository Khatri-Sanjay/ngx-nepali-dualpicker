import { formatPickerDate } from './format-picker-date';
import { EDITABLE_DATE_FORMATS } from './date-formats';
import { DateParser } from '../parsing/date-parser';
import { toNepaliNumerals } from '../locale/convert-numerals';

describe('format-picker-date', () => {
	it('round-trips every advertised editable pattern in English and Nepali digits', () => {
		const date = { year: 2080, month: 10, day: 1 };
		for (const pattern of EDITABLE_DATE_FORMATS) {
			const formatted = formatPickerDate(date, pattern);
			expect(DateParser.parseByFormat(formatted, pattern)).withContext(pattern).toEqual(date);
			expect(DateParser.parseByFormat(toNepaliNumerals(formatted), pattern))
				.withContext(pattern)
				.toEqual(date);
		}
	});
	it('formats all picker patterns with one-based public months', () => {
		const date = { year: 2024, month: 1, day: 5 };
		for (const [pattern, expected] of [
			['yyyy-MM-dd', '2024-01-05'],
			['yyyy/MM/dd', '2024/01/05'],
			['MM/dd/yyyy', '01/05/2024'],
			['dd/MM/yyyy', '05/01/2024'],
			['dd-MM-yyyy', '05-01-2024'],
			['MMM dd, yyyy', 'Jan 05, 2024'],
		])
			expect(formatPickerDate(date, pattern, 'Jan')).toBe(expected);
	});
});
