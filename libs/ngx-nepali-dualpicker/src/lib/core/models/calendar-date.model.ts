/** Date-only fields with one-based months; the calling API determines AD or BS. Not a timestamp. */
export interface DateObj {
	year: number;
	month: number;
	day: number;
	weekDay?: number;
}

export type DateInput = string | Date | DateObj;

export interface DateReference {
	bs: DateObj;
	ad: DateObj;
}

export interface DateValidationConfig {
	minYear: number;
	maxYear: number;
	minMonth: number;
	maxMonth: number;
	minDay: number;
	maxDay: number;
}
