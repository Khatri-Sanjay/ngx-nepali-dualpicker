import type { DateObj } from '../../core/models/calendar-date.model';
import type { CalendarSystem } from '../../core/models/calendar-system.model';
import type { DatePickerValue } from './datepicker-value.type';
import type { EditableDateFormat } from '../../core/formatting/date-formats';

/** Synchronous, deterministic rule. True permits a date; months are one-based. */
export type DateFilter = (date: Readonly<DateObj>, calendar: CalendarSystem) => boolean;

export interface RangeConstraints {
	/** Inclusive calendar days: selecting the same start/end has duration 1. */
	minDays?: number;
	maxDays?: number;
	preventCrossingUnavailableDates?: boolean;
}

export interface DatePresetContext {
	readonly calendar: CalendarSystem;
	readonly today: Readonly<DateObj>;
	readonly selectionMode: 'single' | 'range' | 'multiple';
	readonly outputFormat: EditableDateFormat;
}

export interface DateSelectionPreset {
	readonly label: string;
	/** Resolved at activation. Values follow outputFormat and the current selection mode. */
	readonly value: DatePickerValue | ((context: DatePresetContext) => DatePickerValue);
}

/** Content is rendered inside the library's date button; do not add nested interactive controls. */
export interface DateCellContext {
	readonly $implicit: Readonly<DateObj>;
	readonly date: Readonly<DateObj>;
	readonly calendar: CalendarSystem;
	readonly secondaryDate: Readonly<DateObj> | null;
	readonly secondaryCalendar: CalendarSystem;
	readonly selected: boolean;
	readonly disabled: boolean;
	readonly today: boolean;
}
