import { toEnglishNumerals } from '../locale/convert-numerals';
import { DateObj, DateInput } from '../models/calendar-date.model';
import { DateValidator } from '../validation/date-validator';

/**
 * Utility class for parsing different date input formats
 */
export class DateParser {
	/**
	 * Normalize and split manual input
	 * Supports: -, /, space, comma
	 */
	static splitInput(value: string): string[] {
		return toEnglishNumerals(value)
			.split(/[-/\s,]+/)
			.map((v) => v.trim())
			.filter(Boolean);
	}

	/**
	 * Parse date string using explicit format
	 */
	static parseByFormat(value: string, format: string): DateObj | null {
		const normalized = toEnglishNumerals(value);
		const patterns: Record<string, RegExp> = {
			'yyyy-MM-dd': /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
			'yyyy/MM/dd': /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/,
			'MM/dd/yyyy': /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
			'dd/MM/yyyy': /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
			'dd-MM-yyyy': /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
		};
		const match = patterns[format]?.exec(normalized);
		if (!match) return null;
		const parts = match.slice(1).map(Number);
		const [year, month, day] = format.startsWith('yyyy')
			? parts
			: format.startsWith('MM')
				? [parts[2], parts[0], parts[1]]
				: [parts[2], parts[1], parts[0]];
		return { year, month, day };
	}

	/**
	 * Parse various date input formats to DateObj
	 * Supports: Date object, ISO string (YYYY-MM-DD), DateObj
	 */
	static parseToDateObj(input: DateInput): DateObj {
		if (!input) {
			throw new Error('Invalid date input: input is null or undefined');
		}

		// Handle Date object
		if (input instanceof Date) {
			if (!DateValidator.isValidDateObject(input)) {
				throw new Error('Invalid Date object');
			}
			return {
				year: input.getFullYear(),
				month: input.getMonth() + 1,
				day: input.getDate(),
			};
		}

		// Handle string (ISO format YYYY-MM-DD)
		if (typeof input === 'string') {
			if (!DateValidator.isValidDateString(input)) {
				throw new Error(`Invalid date string format: ${input}. Expected format: YYYY-MM-DD`);
			}

			const [yearStr, monthStr, dayStr] = input.split('-');
			const year = parseInt(yearStr, 10);
			const month = parseInt(monthStr, 10);
			const day = parseInt(dayStr, 10);

			if (isNaN(year) || isNaN(month) || isNaN(day)) {
				throw new Error(`Invalid date string: ${input}`);
			}

			return { year, month, day };
		}

		// Handle DateObj
		if (typeof input === 'object' && 'year' in input && 'month' in input && 'day' in input) {
			const year = Number(input.year);
			const month = Number(input.month);
			const day = Number(input.day);

			if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
				throw new Error('Year, month, and day must be integers');
			}

			if (month < 1 || month > 12) {
				throw new Error(`Invalid month: ${month}. Month must be between 1 and 12`);
			}

			if (day < 1 || day > 32) {
				throw new Error(`Invalid day: ${day}. Day must be between 1 and 32`);
			}

			return { year, month, day };
		}

		throw new Error('Unsupported date input format. Expected: Date, string (YYYY-MM-DD), or DateObj');
	}

	/**
	 * Format DateObj as ISO string (YYYY-MM-DD)
	 */
	static formatDateObj(date: DateObj, separator: string = '-'): string {
		const pad = (n: number) => n.toString().padStart(2, '0');
		return `${date.year}${separator}${pad(date.month)}${separator}${pad(date.day)}`;
	}

	/**
	 * Convert DateObj to JavaScript Date object
	 */
	static dateObjToDate(date: DateObj): Date {
		return new Date(date.year, date.month - 1, date.day);
	}

	/**
	 * Parse current date to DateObj
	 */
	static getCurrentDate(): DateObj {
		const now = new Date();
		return {
			year: now.getFullYear(),
			month: now.getMonth() + 1,
			day: now.getDate(),
		};
	}
}
