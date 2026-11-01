import { DateCalculator } from './date-calculator';
import { BS_VALIDATION, NEPALI_MONTHS } from './calendar-data';

describe('date-calculator', () => {
	it('rejects invalid Gregorian month lookups instead of returning undefined as a number', () => {
		for (const month of [0, 13, NaN, Infinity, 1.5]) {
			expect(() => DateCalculator.getDaysInAdMonth(2024, month)).toThrow();
		}
		expect(() => DateCalculator.getDaysInAdMonth(NaN, 1)).toThrow();
		expect(DateCalculator.getDaysInAdMonth(2024, 2)).toBe(29);
		expect(DateCalculator.getDaysInAdMonth(1900, 2)).toBe(28);
	});
	it('round-trips the first and last day of every supported BS month', () => {
		let offset = 0;
		for (let year = BS_VALIDATION.minYear; year <= BS_VALIDATION.maxYear; year++) {
			for (let month = 1; month <= 12; month++) {
				const length = NEPALI_MONTHS[year - BS_VALIDATION.minYear][month - 1];
				const first = { year, month, day: 1 };
				const last = { year, month, day: length };
				expect(DateCalculator.getBsDayOffset(first)).toBe(offset);
				expect(DateCalculator.bsDateFromDayOffset(offset)).toEqual(first);
				expect(DateCalculator.bsDateFromDayOffset(offset + length - 1)).toEqual(last);
				offset += length;
			}
		}
		expect(() => DateCalculator.bsDateFromDayOffset(-1)).toThrow();
		expect(() => DateCalculator.bsDateFromDayOffset(offset)).toThrow();
	});
	it('calculates signed Gregorian offsets across leap dates', () => {
		expect(
			DateCalculator.calculateAdDaysFromReference(
				{ year: 2024, month: 2, day: 28 },
				{ year: 2024, month: 3, day: 1 },
			),
		).toBe(-2);
		expect(DateCalculator.addDaysToAdDate({ year: 2024, month: 3, day: 1 }, -1)).toEqual({
			year: 2024,
			month: 2,
			day: 29,
		});
	});
	it('calculates offsets from a BS reference beyond the first month', () => {
		const date = { year: 2080, month: 6, day: 15 };
		expect(DateCalculator.calculateBsDaysFromReference(date, date)).toBe(0);
		const next = DateCalculator.addDaysToBsDate(date, 500);
		expect(DateCalculator.calculateBsDaysFromReference(next, date)).toBe(500);
		expect(DateCalculator.addDaysToBsDate(next, -500)).toEqual(date);
	});
	it('rejects invalid BS month lookups', () => {
		expect(() => DateCalculator.getDaysInBsMonth(2080, 0)).toThrow();
		expect(() => DateCalculator.getDaysInBsMonth(2080, NaN)).toThrow();
	});
});
