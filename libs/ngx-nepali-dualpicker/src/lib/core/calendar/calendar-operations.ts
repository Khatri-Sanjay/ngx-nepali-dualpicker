import { DateObj } from '../models/calendar-date.model';
import { DateCalculator } from './date-calculator';
import { AD_VALIDATION, BS_VALIDATION, BS_AD_REFERENCE } from './calendar-data';

import type { CalendarSystem } from '../models/calendar-system.model';

/** Calendar calculations use one-based months. UI month indexes never enter this module. */
export function getMonthLength(year: number, month: number, calendar: CalendarSystem): number {
	if (!Number.isInteger(month) || month < 1 || month > 12) return 0;
	const bounds = calendar === 'BS' ? BS_VALIDATION : AD_VALIDATION;
	if (!Number.isInteger(year) || year < bounds.minYear || year > bounds.maxYear) return 0;
	return calendar === 'BS'
		? DateCalculator.getDaysInBsMonth(year, month)
		: DateCalculator.getDaysInAdMonth(year, month);
}

/** Day indexes have a calendar-specific epoch; compare only within the same calendar. */
export function getDayIndex(date: DateObj, calendar: CalendarSystem): number {
	return calendar === 'BS'
		? DateCalculator.getBsDayOffset(date)
		: DateCalculator.calculateAdDaysFromReference(date, { year: AD_VALIDATION.minYear, month: 1, day: 1 });
}

export function fromDayIndex(index: number, calendar: CalendarSystem): DateObj {
	const bounds = calendar === 'BS' ? BS_VALIDATION : AD_VALIDATION;
	const last = { year: bounds.maxYear, month: 12, day: getMonthLength(bounds.maxYear, 12, calendar) };
	const clamped = Math.max(0, Math.min(index, getDayIndex(last, calendar)));
	return calendar === 'BS'
		? DateCalculator.bsDateFromDayOffset(clamped)
		: DateCalculator.addDaysToAdDate({ year: bounds.minYear, month: 1, day: 1 }, clamped);
}

export function getCalendarWeekday(date: DateObj, calendar: CalendarSystem): number {
	return calendar === 'BS'
		? DateCalculator.calculateWeekday(getDayIndex(date, calendar), BS_AD_REFERENCE.dayOfWeek)
		: new Date(Date.UTC(date.year, date.month - 1, date.day)).getUTCDay();
}

/** Row-major weeks, including padding. No selection or presentation state is stored. */
export function getMonthGrid(
	year: number,
	month: number,
	calendar: CalendarSystem,
	weekStartsOn: number,
): (number | null)[][] {
	const length = getMonthLength(year, month, calendar);
	if (!length) return [];
	const leading = (getCalendarWeekday({ year, month, day: 1 }, calendar) - weekStartsOn + 7) % 7;
	const cells = Array.from({ length: Math.ceil((leading + length) / 7) * 7 }, (_, index) =>
		index >= leading && index < leading + length ? index - leading + 1 : null,
	);
	return Array.from({ length: cells.length / 7 }, (_, row) => cells.slice(row * 7, row * 7 + 7));
}

export function shiftCalendarMonth(date: DateObj, months: number, calendar: CalendarSystem): DateObj {
	const ordinal = date.year * 12 + date.month - 1 + months;
	const year = Math.floor(ordinal / 12);
	const month = (((ordinal % 12) + 12) % 12) + 1;
	const length = getMonthLength(year, month, calendar);
	return length ? { year, month, day: Math.min(date.day, length) } : { ...date };
}

export function getYearOptions(
	calendar: CalendarSystem,
	range: { start: number; end: number },
	min?: DateObj | null,
	max?: DateObj | null,
): number[] {
	const bounds = calendar === 'BS' ? BS_VALIDATION : AD_VALIDATION;
	const start = Math.max(
		bounds.minYear,
		calendar === 'BS' ? range.start : bounds.minYear,
		min?.year ?? bounds.minYear,
	);
	const end = Math.min(bounds.maxYear, calendar === 'BS' ? range.end : bounds.maxYear, max?.year ?? bounds.maxYear);
	return Array.from({ length: Math.max(0, end - start + 1) }, (_, index) => start + index);
}
