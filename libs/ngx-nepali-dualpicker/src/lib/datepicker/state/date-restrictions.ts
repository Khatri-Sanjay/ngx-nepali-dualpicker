import { DateInput, DateObj } from '../../core/models/calendar-date.model';
import type { CalendarSystem } from '../../core/models/calendar-system.model';
import { getCalendarWeekday, getDayIndex } from '../../core/calendar/calendar-operations';
import { DateParser } from '../../core/parsing/date-parser';
import { DateValidator } from '../../core/validation/date-validator';
import { convertAdToBs } from '../../core/calendar/date-conversion';
import type { DateFilter } from './datepicker-options.model';

export interface DateRestrictions {
	readonly minDate?: DateInput | null;
	readonly maxDate?: DateInput | null;
	readonly disabledDates?: readonly DateInput[];
	readonly disabledDaysOfWeek?: readonly number[];
	readonly disablePastDates?: boolean;
	readonly disableFutureDates?: boolean;
	readonly dateFilter?: DateFilter;
}

export function isCalendarDateValid(date: DateObj, calendar: CalendarSystem): boolean {
	return calendar === 'BS' ? DateValidator.isValidBsDate(date) : DateValidator.isValidAdDate(date);
}

export function parseRestrictionDate(value: DateInput | null | undefined, calendar: CalendarSystem): DateObj | null {
	if (value === null || value === undefined) return null;
	try {
		const parsed =
			value instanceof Date && calendar === 'BS'
				? (convertAdToBs(value) as DateObj)
				: DateParser.parseToDateObj(value);
		return isCalendarDateValid(parsed, calendar) ? parsed : null;
	} catch {
		return null;
	}
}

/** Compile date lists and bounds once per configuration. Invalid configuration entries are ignored, as in 1.x. */
export function compileDateRestrictions(config: DateRestrictions, calendar: CalendarSystem, today: DateObj) {
	const min = parseRestrictionDate(config.minDate, calendar);
	const max = parseRestrictionDate(config.maxDate, calendar);
	const minIndex = min ? getDayIndex(min, calendar) : null;
	const maxIndex = max ? getDayIndex(max, calendar) : null;
	const disabled = new Set(
		(config.disabledDates ?? [])
			.map((date) => parseRestrictionDate(date, calendar))
			.filter((date): date is DateObj => date !== null)
			.map((date) => getDayIndex(date, calendar)),
	);
	const weekdays = new Set(config.disabledDaysOfWeek ?? []);
	const todayIndex = getDayIndex(today, calendar);
	return {
		min,
		max,
		isSelectable(date: DateObj): boolean {
			if (!isCalendarDateValid(date, calendar)) return false;
			const index = getDayIndex(date, calendar);
			return (
				(minIndex === null || index >= minIndex) &&
				(maxIndex === null || index <= maxIndex) &&
				(!config.disablePastDates || index >= todayIndex) &&
				(!config.disableFutureDates || index <= todayIndex) &&
				!disabled.has(index) &&
				!weekdays.has(getCalendarWeekday(date, calendar)) &&
				passesFilter(date)
			);
		},
	};
	function passesFilter(date: DateObj): boolean {
		try {
			return config.dateFilter ? config.dateFilter(Object.freeze({ ...date }), calendar) === true : true;
		} catch {
			// Failed availability rules must not accidentally allow a booking.
			return false;
		}
	}
}
