import { DateParser } from './date-parser';

describe('date-parser', () => {
	it('parses Nepali digits and rejects trailing fields', () => {
		expect(DateParser.parseByFormat('२०८०-१०-०१', 'yyyy-MM-dd')).toEqual({ year: 2080, month: 10, day: 1 });
		expect(DateParser.parseByFormat('2024-01-15-99', 'yyyy-MM-dd')).toBeNull();
	});
	it('rejects exponents, mixed separators and trailing text', () => {
		for (const text of ['2024/01/15', '2024-1e1-15', '2024-01/15', '2024-01-15abc'])
			expect(DateParser.parseByFormat(text, 'yyyy-MM-dd')).toBeNull();
	});
});
