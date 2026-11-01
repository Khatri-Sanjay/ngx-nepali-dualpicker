import { DateObj } from '../models/calendar-date.model';
import { ENGLISH_MONTHS, ENGLISH_LEAP_MONTHS, NEPALI_MONTHS, BS_VALIDATION } from './calendar-data';
import { DateValidator } from '../validation/date-validator';

// Each entry is the first day's offset for one month, plus a final end sentinel.
// Build once so conversion and calendar rendering share the same table arithmetic.
const BS_MONTH_STARTS = [0];
for (const months of NEPALI_MONTHS) {
	for (const days of months) BS_MONTH_STARTS.push(BS_MONTH_STARTS[BS_MONTH_STARTS.length - 1] + days);
}

/**
 * Utility class for date calculations
 */
export class DateCalculator {
	/**
	 * Get the number of days in a specific AD month
	 */
	static getDaysInAdMonth(year: number, month: number): number {
		if (!Number.isInteger(year)) throw new Error('Year must be an integer');
		if (!Number.isInteger(month) || month < 1 || month > 12) throw new Error('Month must be between 1 and 12');
		const isLeap = DateValidator.isLeapYear(year);
		return isLeap ? ENGLISH_LEAP_MONTHS[month - 1] : ENGLISH_MONTHS[month - 1];
	}

	/**
	 * Get the number of days in a specific BS month
	 */
	static getDaysInBsMonth(year: number, month: number): number {
		if (!Number.isInteger(year)) throw new Error('Year must be an integer');
		const yearIndex = year - BS_VALIDATION.minYear;
		if (yearIndex < 0 || yearIndex >= NEPALI_MONTHS.length) {
			throw new Error(`BS year ${year} is out of range`);
		}
		if (!Number.isInteger(month) || month < 1 || month > 12) throw new Error('Month must be between 1 and 12');
		return NEPALI_MONTHS[yearIndex][month - 1];
	}

	/**
	 * Get total days in a BS year
	 */
	static getTotalDaysInBsYear(year: number): number {
		if (!Number.isInteger(year)) throw new Error('Year must be an integer');
		const yearIndex = year - BS_VALIDATION.minYear;
		if (yearIndex < 0 || yearIndex >= NEPALI_MONTHS.length) {
			throw new Error(`BS year ${year} is out of range`);
		}

		return NEPALI_MONTHS[yearIndex].reduce((sum, days) => sum + days, 0);
	}

	/**
	 * Get total days in an AD year
	 */
	static getTotalDaysInAdYear(year: number): number {
		return DateValidator.isLeapYear(year) ? 366 : 365;
	}

	/**
	 * Calculate total days from a reference date in AD calendar
	 */
	static calculateAdDaysFromReference(date: DateObj, referenceDate: DateObj): number {
		return (
			(Date.UTC(date.year, date.month - 1, date.day) -
				Date.UTC(referenceDate.year, referenceDate.month - 1, referenceDate.day)) /
			86400000
		);
	}

	/**
	 * Calculate total days from a reference date in BS calendar
	 */
	static calculateBsDaysFromReference(date: DateObj, referenceDate: DateObj): number {
		return this.getBsDayOffset(date) - this.getBsDayOffset(referenceDate);
	}

	/** Zero-based offset from the first date in the BS table. Public months are one-based. */
	static getBsDayOffset(date: DateObj): number {
		if (!DateValidator.isValidBsDate(date)) throw new Error('Invalid BS date');
		return BS_MONTH_STARTS[(date.year - BS_VALIDATION.minYear) * 12 + date.month - 1] + date.day - 1;
	}

	/** Find a BS date with a binary search of the shared month offsets. */
	static bsDateFromDayOffset(offset: number): DateObj {
		if (!Number.isInteger(offset) || offset < 0 || offset >= BS_MONTH_STARTS[BS_MONTH_STARTS.length - 1]) {
			throw new Error('BS day offset is out of range');
		}
		let low = 0;
		let high = BS_MONTH_STARTS.length - 1;
		while (low + 1 < high) {
			const middle = Math.floor((low + high) / 2);
			if (BS_MONTH_STARTS[middle] <= offset) low = middle;
			else high = middle;
		}
		return {
			year: BS_VALIDATION.minYear + Math.floor(low / 12),
			month: (low % 12) + 1,
			day: offset - BS_MONTH_STARTS[low] + 1,
		};
	}

	/**
	 * Add days to a BS date
	 */
	static addDaysToBsDate(date: DateObj, daysToAdd: number): DateObj {
		if (!Number.isInteger(daysToAdd) || !DateValidator.isValidBsDate(date))
			throw new Error('Invalid BS date or day offset');
		return this.bsDateFromDayOffset(this.getBsDayOffset(date) + daysToAdd);
	}

	/**
	 * Add days to an AD date
	 */
	static addDaysToAdDate(date: DateObj, daysToAdd: number): DateObj {
		if (!Number.isInteger(daysToAdd) || !DateValidator.isValidAdDate(date))
			throw new Error('Invalid AD date or day offset');
		const result = new Date(Date.UTC(date.year, date.month - 1, date.day + daysToAdd));
		return { year: result.getUTCFullYear(), month: result.getUTCMonth() + 1, day: result.getUTCDate() };
	}

	/**
	 * Calculate weekday from reference date
	 * @param daysDifference - Number of days from reference date
	 * @param referenceWeekday - Weekday of reference date (0 = Sunday, 6 = Saturday)
	 * @returns Weekday number (0 = Sunday, 6 = Saturday)
	 */
	static calculateWeekday(daysDifference: number, referenceWeekday: number = 3): number {
		return (((referenceWeekday + (daysDifference % 7)) % 7) + 7) % 7;
	}

	/**
	 * Compare two dates
	 * @returns -1 if date1 < date2, 0 if equal, 1 if date1 > date2
	 */
	static compareDates(date1: DateObj, date2: DateObj): number {
		if (date1.year !== date2.year) {
			return date1.year < date2.year ? -1 : 1;
		}
		if (date1.month !== date2.month) {
			return date1.month < date2.month ? -1 : 1;
		}
		if (date1.day !== date2.day) {
			return date1.day < date2.day ? -1 : 1;
		}
		return 0;
	}
}
