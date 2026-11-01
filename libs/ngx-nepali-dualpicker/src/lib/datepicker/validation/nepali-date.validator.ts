import type { ValidationErrors, ValidatorFn } from '@angular/forms';
import type { DatePickerConfig } from '../../configuration/datepicker-config.model';
import { mergeConfig } from '../../configuration/merge-datepicker-config';
import { DateParser } from '../../core/parsing/date-parser';
import { DateValidator } from '../../core/validation/date-validator';
import { DateCalculator } from '../../core/calendar/date-calculator';
import { convertAdToBs } from '../../core/calendar/date-conversion';
import type { DateObj } from '../../core/models/calendar-date.model';
import { compileDateRestrictions } from '../state/date-restrictions';
import { getRangeConstraintError } from '../state/range-constraints';

/** Empty selections remain valid; compose with Angular Validators.required when needed. */
export function validateDatePickerValue(value: unknown, overrides: DatePickerConfig): ValidationErrors | null {
	const config = mergeConfig(overrides);
	const empty = (item: unknown) => item === null || item === undefined || item === '';
	if (empty(value)) return null;
	let values: unknown[];
	if (config.selectionMode === 'multiple') {
		if (!Array.isArray(value)) return { nepaliDate: { reason: 'shape' } };
		values = value;
	} else if (config.selectionMode === 'range') {
		if (typeof value !== 'object' || value === null || !('start' in value) || !('end' in value))
			return { nepaliDate: { reason: 'shape' } };
		if (empty(value.start) && empty(value.end)) return null;
		if (empty(value.start) || (empty(value.end) && config.validation.requireCompleteRange !== false))
			return { nepaliDateRange: { reason: 'incomplete' } };
		values = empty(value.end) ? [value.start] : [value.start, value.end];
	} else values = [value];
	const dates: DateObj[] = [];
	try {
		for (const item of values) {
			let date: DateObj | null;
			if (typeof item === 'string') date = DateParser.parseByFormat(item, config.outputFormat);
			else if (item instanceof Date)
				date = config.calendar === 'BS' ? (convertAdToBs(item) as DateObj) : DateParser.parseToDateObj(item);
			else if (
				item &&
				typeof item === 'object' &&
				'year' in item &&
				'month' in item &&
				'day' in item &&
				typeof item.year === 'number' &&
				typeof item.month === 'number' &&
				typeof item.day === 'number'
			)
				date = DateParser.parseToDateObj({ year: item.year, month: item.month, day: item.day });
			else return { nepaliDate: { reason: 'shape' } };
			if (!date) return { nepaliDate: { reason: 'format' } };
			if (!(config.calendar === 'BS' ? DateValidator.isValidBsDate(date) : DateValidator.isValidAdDate(date)))
				return { nepaliDate: { reason: 'calendar' } };
			dates.push(date);
		}
	} catch {
		return { nepaliDate: { reason: 'calendar' } };
	}
	if (config.selectionMode === 'range' && dates.length === 2 && DateCalculator.compareDates(dates[0], dates[1]) > 0)
		return { nepaliDateRange: { reason: 'order' } };
	const todayAd = DateParser.getCurrentDate();
	const today = config.calendar === 'BS' ? (convertAdToBs(todayAd) as DateObj) : todayAd;
	const restrictions = compileDateRestrictions(config, config.calendar, today);
	const restricted = dates.find((date) => !restrictions.isSelectable(date));
	if (restricted) return { nepaliDateRestricted: { date: restricted } };
	if (config.selectionMode === 'range' && dates.length === 2) {
		const error = getRangeConstraintError(
			dates[0],
			dates[1],
			config.calendar,
			config.rangeConstraints,
			restrictions.isSelectable,
		);
		if (error) return { nepaliDateRange: error };
	}
	const count = new Set(dates.map((date) => `${date.year}-${date.month}-${date.day}`)).size;
	const max = config.multipleSelection.maxSelections;
	if (config.selectionMode === 'multiple' && max !== undefined && count > max)
		return { nepaliDateLimit: { max, actual: count } };
	return null;
}

/** Supply a config getter for dynamic forms, then call control.updateValueAndValidity after config changes. */
export function nepaliDateValidator(config: DatePickerConfig | (() => DatePickerConfig) = {}): ValidatorFn {
	return (control) => validateDatePickerValue(control.value, typeof config === 'function' ? config() : config);
}
