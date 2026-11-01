import { DateObj } from '../../core/models/calendar-date.model';

/** Internal/legacy UI representation only. Month is an index in 0–11. */
export interface PickerDate {
	year: number;
	month: number;
	day: number;
}

export function toCalendarDate(date: PickerDate): DateObj {
	return { year: date.year, month: date.month + 1, day: date.day };
}

export function toPickerDate(date: DateObj): PickerDate {
	return { year: date.year, month: date.month - 1, day: date.day };
}

export type PickerDateFormatter = (date: PickerDate) => string;
