import { toEnglishNumerals, toNepaliNumerals } from '../locale/convert-numerals';
import type { CalendarSystem } from '../models/calendar-system.model';
import { NEPALI_MONTHS_NAME, DAYS_NAME, ENGLISH_MONTHS_NAME, FULL_WEEKDAY_NAMES } from '../locale/calendar-labels';
import { NEPALI_DIGITS } from '../locale/numeral-mappings';
import { BS_AD_REFERENCE } from '../calendar/calendar-data';
import { DateObj } from '../models/calendar-date.model';
import { DateCalculator } from '../calendar/date-calculator';
import { DateValidator } from '../validation/date-validator';
export type DateType = CalendarSystem;

export function formatDate(
	value: string | DateObj | Date | null | undefined,
	format: string = 'mediumDate',
	locale: 'ne' | 'en' = 'ne',
	dateType: DateType = 'BS',
): string {
	if (!value) return '';

	// Parse the input value into a DateObj
	const dateObj = parseDate(value);

	if (!dateObj) return '';

	// Validate date based on calendar type
	if (!isValidDate(dateObj, dateType)) {
		return '';
	}

	// Apply the format
	switch (format) {
		case 'shortDate':
			// yyyy-MM-dd or yyyy/MM/dd
			return formatPattern(dateObj, 'yyyy-MM-dd', locale, dateType);

		case 'mediumDate':
			// dd MMM yyyy (e.g., 15 Baisakh 2081 or 15 Apr 2024)
			return formatPattern(dateObj, 'dd MMM yyyy', locale, dateType);

		case 'longDate':
			// dd MMMM yyyy (e.g., 15 Baisakh 2081 or 15 April 2024)
			return formatPattern(dateObj, 'dd MMMM yyyy', locale, dateType);

		case 'fullDate':
			// EEEE, dd MMMM yyyy (e.g., Monday, 15 Baisakh 2081)
			return formatPattern(dateObj, 'EEEE, dd MMMM yyyy', locale, dateType);

		default:
			// Custom format
			return formatPattern(dateObj, format, locale, dateType);
	}
}

function parseDate(value: string | DateObj | Date): DateObj | null {
	// Handle DateObj
	if (isDateObj(value)) {
		return value;
	}

	// Handle JavaScript Date (always AD)
	if (value instanceof Date) {
		return fromJsDate(value);
	}

	// Handle string
	if (typeof value === 'string') {
		return parseDateString(value);
	}

	return null;
}

function isDateObj(value: unknown): value is DateObj {
	return (
		value !== null &&
		typeof value === 'object' &&
		'year' in value &&
		'month' in value &&
		'day' in value &&
		typeof value.year === 'number' &&
		typeof value.month === 'number' &&
		typeof value.day === 'number'
	);
}

function fromJsDate(date: Date): DateObj {
	return {
		year: date.getFullYear(),
		month: date.getMonth() + 1, // JS months are 0-indexed
		day: date.getDate(),
	};
}

function parseDateString(value: string): DateObj | null {
	// Convert Nepali digits to English digits first
	const normalized = toEnglishNumerals(value.trim());

	// Try yyyy-MM-dd or yyyy/MM/dd format
	let match =
		normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/) ?? normalized.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
	if (match) {
		return {
			year: parseInt(match[1], 10),
			month: parseInt(match[2], 10),
			day: parseInt(match[3], 10),
		};
	}

	// Try dd-MM-yyyy or dd/MM/yyyy format
	match = normalized.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/) ?? normalized.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
	if (match) {
		return {
			year: parseInt(match[3], 10),
			month: parseInt(match[2], 10),
			day: parseInt(match[1], 10),
		};
	}

	// Try ISO format (yyyy-MM-ddTHH:mm:ss...)
	match = normalized.match(
		/^(\d{4})-(\d{2})-(\d{2})[T ](?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d(?:\.\d{1,9})?)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)?$/,
	);
	if (match) {
		return {
			year: parseInt(match[1], 10),
			month: parseInt(match[2], 10),
			day: parseInt(match[3], 10),
		};
	}

	return null;
}

function isValidDate(date: DateObj, dateType: DateType): boolean {
	if (dateType === 'BS') {
		return DateValidator.isValidBsDate(date);
	} else {
		return DateValidator.isValidAdDate(date);
	}
}

function formatPattern(date: DateObj, pattern: string, locale: 'ne' | 'en', dateType: DateType): string {
	const monthIndex = date.month - 1;

	const monthNames = dateType === 'BS' ? NEPALI_MONTHS_NAME : ENGLISH_MONTHS_NAME;

	const monthFull =
		monthNames[locale]?.full?.[monthIndex] ?? monthNames['en']?.full?.[monthIndex] ?? `Month ${date.month}`;

	const monthShort =
		monthNames[locale]?.short?.[monthIndex] ?? monthNames['en']?.short?.[monthIndex] ?? `M${date.month}`;

	const useNepaliDigits = locale === 'ne';

	const yearStr = useNepaliDigits ? toNepaliNumerals(date.year) : date.year.toString();

	const monthStr = useNepaliDigits ? toNepaliNumerals(date.month) : date.month.toString();

	const dayStr = useNepaliDigits ? toNepaliNumerals(date.day) : date.day.toString();

	const dayOfWeek = getDayOfWeek(date, dateType);

	const dayName = FULL_WEEKDAY_NAMES[locale]?.[dayOfWeek] ?? FULL_WEEKDAY_NAMES.en[dayOfWeek] ?? '';

	const dayNameShort = DAYS_NAME[locale]?.short?.[dayOfWeek] ?? DAYS_NAME['en']?.short?.[dayOfWeek] ?? '';

	const tokenMap: Record<string, string> = {
		yyyy: yearStr,
		yy: yearStr.slice(-2),
		MMMM: monthFull,
		MMM: monthShort,
		MM: pad(monthStr, locale),
		M: monthStr,
		dd: pad(dayStr, locale),
		d: dayStr,
		EEEE: dayName,
		EEE: dayNameShort,
		E: dayNameShort,
	};

	return pattern.replace(/yyyy|MMMM|EEEE|MMM|EEE|yy|MM|dd|M|d|E/g, (token) => tokenMap[token]);
}

function getDayOfWeek(date: DateObj, dateType: DateType): number {
	if (dateType === 'AD') {
		const jsDate = new Date(date.year, date.month - 1, date.day);
		return jsDate.getDay();
	} else {
		const daysDifference = DateCalculator.calculateBsDaysFromReference(date, BS_AD_REFERENCE.bs);
		return DateCalculator.calculateWeekday(daysDifference, BS_AD_REFERENCE.dayOfWeek);
	}
}

function pad(value: string, locale: 'ne' | 'en'): string {
	if (value.length === 1) {
		const zero = locale === 'ne' ? NEPALI_DIGITS[0] : '0';
		return zero + value;
	}
	return value;
}
