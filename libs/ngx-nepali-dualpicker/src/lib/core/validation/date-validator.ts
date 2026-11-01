import { DateObj } from '../models/calendar-date.model';
import {
	AD_VALIDATION,
	BS_VALIDATION,
	NEPALI_MONTHS,
	ENGLISH_MONTHS,
	ENGLISH_LEAP_MONTHS,
} from '../calendar/calendar-data';

/**
 * Utility class for date validation
 */
export class DateValidator {
	/**
	 * Validate if a date is within AD (Gregorian) calendar range
	 */
	static isValidAdDate(date: DateObj): boolean {
		const { year, month, day } = date;
		if (![year, month, day].every(Number.isInteger)) return false;

		// Check year range
		if (year < AD_VALIDATION.minYear || year > AD_VALIDATION.maxYear) {
			return false;
		}

		// Check month range
		if (month < AD_VALIDATION.minMonth || month > AD_VALIDATION.maxMonth) {
			return false;
		}

		// Check day range
		if (day < AD_VALIDATION.minDay) {
			return false;
		}

		// Check if day is valid for the specific month
		const isLeap = DateValidator.isLeapYear(year);
		const monthDays = isLeap ? ENGLISH_LEAP_MONTHS : ENGLISH_MONTHS;

		if (day > monthDays[month - 1]) {
			return false;
		}

		return true;
	}

	/**
	 * Validate if a date is within BS (Bikram Sambat) calendar range
	 */
	static isValidBsDate(date: DateObj): boolean {
		const { year, month, day } = date;
		if (![year, month, day].every(Number.isInteger)) return false;

		// Check year range
		if (year < BS_VALIDATION.minYear || year > BS_VALIDATION.maxYear) {
			return false;
		}

		// Check month range
		if (month < BS_VALIDATION.minMonth || month > BS_VALIDATION.maxMonth) {
			return false;
		}

		// Check day range
		if (day < BS_VALIDATION.minDay) {
			return false;
		}

		// Check if day is valid for the specific month in BS calendar
		const yearIndex = year - BS_VALIDATION.minYear;
		if (yearIndex < 0 || yearIndex >= NEPALI_MONTHS.length) {
			return false;
		}

		const daysInMonth = NEPALI_MONTHS[yearIndex][month - 1];
		if (day > daysInMonth) {
			return false;
		}

		return true;
	}

	/**
	 * Check if a year is a leap year in Gregorian calendar
	 */
	static isLeapYear(year: number): boolean {
		if (year % 4 === 0) {
			return year % 100 === 0 ? year % 400 === 0 : true;
		}
		return false;
	}

	/**
	 * Validate date string format (YYYY-MM-DD)
	 */
	static isValidDateString(dateString: string): boolean {
		const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
		return dateRegex.test(dateString);
	}

	/**
	 * Check if Date object is valid
	 */
	static isValidDateObject(date: Date): boolean {
		return date instanceof Date && !isNaN(date.getTime());
	}
}
