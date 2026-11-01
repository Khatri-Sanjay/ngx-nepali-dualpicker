import { convertAdToBs, convertBsToAd } from './date-conversion';
import { DateCalculator } from './date-calculator';
import { NEPALI_MONTHS } from './calendar-data';

describe('Pure AD/BS conversion boundaries', () => {
	it('preserves the established first and final mutually convertible dates', () => {
		expect(convertAdToBs('1943-04-14')).toEqual({ year: 2000, month: 1, day: 1 });
		expect(convertBsToAd('2000-01-01', true)).toBe('1943-04-14');
		expect(convertAdToBs('2082-12-31')).toEqual({ year: 2139, month: 9, day: 16 });
		expect(convertBsToAd('2139-09-16', true)).toBe('2082-12-31');
		expect(() => convertAdToBs('1943-04-13')).toThrow();
		expect(() => convertAdToBs('2083-01-01')).toThrow();
		expect(() => convertBsToAd('2139-09-17')).toThrow();
	});
	it('round-trips leap days and every BS month transition inside the conversion interval', () => {
		for (const ad of ['2000-02-29', '2024-02-29', '2023-12-31', '2024-01-01']) {
			expect(convertBsToAd(convertAdToBs(ad), true)).toBe(ad);
		}
		for (let year = 2000; year <= 2139; year++) {
			for (let month = 1; month <= 12; month++) {
				if (year === 2139 && month >= 9) continue;
				const last = { year, month, day: DateCalculator.getDaysInBsMonth(year, month) };
				expect(convertAdToBs(convertBsToAd(last))).toEqual(last);
				const next = DateCalculator.addDaysToBsDate(last, 1);
				expect(convertAdToBs(convertBsToAd(next))).toEqual(next);
			}
		}
	});
	it('retains a complete 140-year table without treating shape checks as historical accuracy proof', () => {
		expect(NEPALI_MONTHS.length).toBe(140);
		for (const year of NEPALI_MONTHS) {
			expect(year.length).toBe(12);
			expect(year.every((days) => Number.isInteger(days) && days >= 29 && days <= 32)).toBeTrue();
		}
	});
});
