import { DateConversionService } from './date-conversion.service';
import { DateObj } from '../core/models/calendar-date.model';
import { DateValidator } from '../core/validation/date-validator';

/**
 * Unit tests for DateConversionService
 * Run with: npx jest date-conversion.service.spec.ts
 */

describe('DateConversionService', () => {
	let service: DateConversionService;

	beforeEach(() => {
		service = new DateConversionService();
	});

	describe('convertAdToBs', () => {
		it('should convert AD date to BS date correctly', () => {
			const adDate = { year: 2024, month: 1, day: 15 };
			const result = service.convertAdToBs(adDate) as DateObj;

			expect(result.year).toBe(2080);
			expect(result.month).toBe(10);
			expect(result.day).toBe(1);
		});

		it('should handle Date object input', () => {
			const date = new Date(2024, 0, 15); // January 15, 2024
			const result = service.convertAdToBs(date) as DateObj;

			expect(result.year).toBe(2080);
			expect(result.month).toBe(10);
			expect(result.day).toBe(1);
		});

		it('should handle ISO string input', () => {
			const result = service.convertAdToBs('2024-01-15') as DateObj;

			expect(result.year).toBe(2080);
			expect(result.month).toBe(10);
			expect(result.day).toBe(1);
		});

		it('should return formatted string when requested', () => {
			const result = service.convertAdToBs('2024-01-15', true);

			expect(result).toBe('2080-10-01');
		});

		it('should convert reference date correctly', () => {
			const adDate = { year: 1943, month: 4, day: 14 };
			const result = service.convertAdToBs(adDate) as DateObj;

			expect(result.year).toBe(2000);
			expect(result.month).toBe(1);
			expect(result.day).toBe(1);
		});

		it('should throw error for dates before reference date', () => {
			const adDate = { year: 1943, month: 4, day: 13 };

			expect(() => service.convertAdToBs(adDate)).toThrow();
		});

		it('should throw error for dates outside supported range', () => {
			const adDate = { year: 1900, month: 1, day: 1 };

			expect(() => service.convertAdToBs(adDate)).toThrowError(/Invalid AD date/);
		});

		it('should throw error for invalid dates', () => {
			const adDate = { year: 2024, month: 13, day: 1 };

			expect(() => service.convertAdToBs(adDate)).toThrow();
		});
	});

	describe('convertBsToAd', () => {
		it('should convert BS date to AD date correctly', () => {
			const bsDate = { year: 2080, month: 10, day: 1 };
			const result = service.convertBsToAd(bsDate) as DateObj;

			expect(result.year).toBe(2024);
			expect(result.month).toBe(1);
			expect(result.day).toBe(15);
		});

		it('should handle ISO string input', () => {
			const result = service.convertBsToAd('2080-10-01') as DateObj;

			expect(result.year).toBe(2024);
			expect(result.month).toBe(1);
			expect(result.day).toBe(15);
		});

		it('should return formatted string when requested', () => {
			const result = service.convertBsToAd('2080-10-01', true);

			expect(result).toBe('2024-01-15');
		});

		it('should convert reference date correctly', () => {
			const bsDate = { year: 2000, month: 1, day: 1 };
			const result = service.convertBsToAd(bsDate) as DateObj;

			expect(result.year).toBe(1943);
			expect(result.month).toBe(4);
			expect(result.day).toBe(14);
		});

		it('should throw error for dates before reference date', () => {
			const bsDate = { year: 1999, month: 12, day: 30 };

			expect(() => service.convertBsToAd(bsDate)).toThrow();
		});

		it('should throw error for dates outside supported range', () => {
			const bsDate = { year: 2140, month: 1, day: 1 };

			expect(() => service.convertBsToAd(bsDate)).toThrowError(/Invalid BS date/);
		});
	});

	describe('round-trip conversion', () => {
		it('should maintain date integrity in AD -> BS -> AD conversion', () => {
			const testDates = [
				{ year: 2024, month: 1, day: 1 },
				{ year: 2024, month: 6, day: 15 },
				{ year: 2024, month: 12, day: 31 },
				{ year: 2000, month: 5, day: 20 },
			];

			testDates.forEach((originalAd) => {
				const bs = service.convertAdToBs(originalAd) as DateObj;
				const backToAd = service.convertBsToAd(bs) as DateObj;

				expect(backToAd.year).toBe(originalAd.year);
				expect(backToAd.month).toBe(originalAd.month);
				expect(backToAd.day).toBe(originalAd.day);
			});
		});

		it('should maintain date integrity in BS -> AD -> BS conversion', () => {
			const testDates = [
				{ year: 2080, month: 1, day: 1 },
				{ year: 2080, month: 6, day: 15 },
				{ year: 2080, month: 12, day: 30 },
			];

			testDates.forEach((originalBs) => {
				const ad = service.convertBsToAd(originalBs) as DateObj;
				const backToBs = service.convertAdToBs(ad) as DateObj;

				expect(backToBs.year).toBe(originalBs.year);
				expect(backToBs.month).toBe(originalBs.month);
				expect(backToBs.day).toBe(originalBs.day);
			});
		});
	});

	describe('getCurrentBsDate', () => {
		it('should return current BS date as object', () => {
			const result = service.getCurrentBsDate() as DateObj;

			expect(result.year).toBeDefined();
			expect(result.month).toBeDefined();
			expect(result.day).toBeDefined();
			expect(result.year).toBeGreaterThanOrEqual(2080);
		});

		it('should return current BS date as formatted string', () => {
			const result = service.getCurrentBsDate(true) as string;

			expect(typeof result).toBe('string');
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});
	});

	describe('getWeekday', () => {
		it('should calculate weekday correctly', () => {
			const testDate = { year: 1943, month: 4, day: 14 }; // Wednesday
			const weekday = service.getWeekday(testDate);

			expect(weekday).toBe(3); // Wednesday
		});

		it('should handle different dates', () => {
			const testDate = { year: 2024, month: 1, day: 15 }; // Monday
			const weekday = service.getWeekday(testDate);

			expect(weekday).toBe(1); // Monday
		});
	});

	describe('helper methods', () => {
		it('should check if BS year is supported', () => {
			expect(service.isBsYearSupported(2080)).toBe(true);
			expect(service.isBsYearSupported(2000)).toBe(true);
			expect(service.isBsYearSupported(2139)).toBe(true);
			expect(service.isBsYearSupported(1999)).toBe(false);
			expect(service.isBsYearSupported(2140)).toBe(false);
		});

		it('should check if AD year is supported', () => {
			expect(service.isAdYearSupported(2024)).toBe(true);
			expect(service.isAdYearSupported(1943)).toBe(true);
			expect(service.isAdYearSupported(2082)).toBe(true);
			expect(service.isAdYearSupported(1942)).toBe(false);
			expect(service.isAdYearSupported(2083)).toBe(false);
		});

		it('should get days in BS month', () => {
			const days = service.getDaysInBsMonth(2080, 1);

			expect(days).toBeGreaterThan(0);
			expect(days).toBeLessThanOrEqual(32);
		});

		it('should get days in BS year', () => {
			const days = service.getDaysInBsYear(2080);

			expect(days).toBeGreaterThanOrEqual(365);
			expect(days).toBeLessThanOrEqual(366);
		});

		it('should throw error for unsupported BS year', () => {
			expect(() => service.getDaysInBsMonth(2140, 1)).toThrow();
			expect(() => service.getDaysInBsYear(1999)).toThrow();
		});
	});

	describe('edge cases', () => {
		it('should reject zero and overflow months during validation', () => {
			expect(DateValidator.isValidAdDate({ year: 2024, month: 0, day: 1 })).toBe(false);
			expect(DateValidator.isValidAdDate({ year: 2024, month: 13, day: 1 })).toBe(false);
			expect(DateValidator.isValidBsDate({ year: 2080, month: 0, day: 1 })).toBe(false);
			expect(DateValidator.isValidBsDate({ year: 2080, month: 13, day: 1 })).toBe(false);
		});

		it('should handle month boundaries', () => {
			// Last day of a month
			const lastDay = { year: 2024, month: 1, day: 31 };
			const result = service.convertAdToBs(lastDay);

			expect(result).toBeDefined();
		});

		it('should handle year boundaries', () => {
			// First day of year
			const firstDay = { year: 2024, month: 1, day: 1 };
			const result1 = service.convertAdToBs(firstDay);

			// Last day of year
			const lastDay = { year: 2024, month: 12, day: 31 };
			const result2 = service.convertAdToBs(lastDay);

			expect(result1).toBeDefined();
			expect(result2).toBeDefined();
		});

		it('should handle leap year dates', () => {
			// Feb 29 in leap year
			const leapDay = { year: 2024, month: 2, day: 29 };
			const result = service.convertAdToBs(leapDay);

			expect(result).toBeDefined();
		});
	});
});
