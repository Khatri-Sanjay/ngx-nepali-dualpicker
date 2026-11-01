import { DEFAULT_PICKER_CONFIG, EDITABLE_DATE_FORMATS, PRESET_THEMES } from 'ngx-nepali-dualpicker';
import type { DatePickerConfig, DatePickerTheme } from 'ngx-nepali-dualpicker';
import { DateCalculator, DateParser, DateValidator } from 'ngx-nepali-dualpicker/core';

type Rule = (value: unknown, path: string) => void;
const fail = (path: string, message: string): never => {
	throw new Error(`${path}: ${message}`);
};
function record(value: unknown, path: string): Record<string, unknown> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return fail(path, 'use a JSON object.');
	return value as Record<string, unknown>;
}
const text: Rule = (value, path) => {
	if (typeof value !== 'string') fail(path, 'use a string.');
};
const integer =
	(min: number, max = Number.MAX_SAFE_INTEGER): Rule =>
	(value, path) => {
		if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < min || value > max)
			fail(path, `use a whole number between ${min} and ${max}.`);
	};
const oneOf =
	(values: readonly unknown[]): Rule =>
	(value, path) => {
		if (!values.includes(value)) fail(path, `choose ${values.join(', ')}.`);
	};
const array =
	(rule: Rule): Rule =>
	(value, path) => {
		if (!Array.isArray(value)) return fail(path, 'use an array.');
		value.forEach((item, index) => rule(item, `${path}[${index}]`));
	};
const object =
	(rules: Record<string, Rule>): Rule =>
	(value, path) => {
		for (const [key, item] of Object.entries(record(value, path))) {
			if (!Object.hasOwn(rules, key)) fail(`${path}.${key}`, 'unknown option.');
			rules[key](item, `${path}.${key}`);
		}
	};
function fromDefaults(value: unknown): Rule {
	if (typeof value === 'string') return text;
	if (typeof value === 'boolean')
		return (item, path) => {
			if (typeof item !== 'boolean') fail(path, 'use true or false.');
		};
	if (typeof value === 'number') return integer(0);
	return object(
		Object.fromEntries(Object.entries(record(value, 'defaults')).map(([key, item]) => [key, fromDefaults(item)])),
	);
}

function fillDefaults(base: unknown, patch: unknown): unknown {
	if (!base || typeof base !== 'object') return patch ?? base;
	const overrides = record(patch, 'theme');
	return Object.fromEntries(
		Object.entries(base).map(([key, value]) => [
			key,
			Object.hasOwn(overrides, key) ? fillDefaults(value, overrides[key]) : value,
		]),
	);
}

/** Validate JSON before it reaches the live consumer; callbacks remain TypeScript-only. */
export function parsePlaygroundConfig(source: string): DatePickerConfig {
	const parsed: unknown = JSON.parse(source);
	const config = record(parsed, 'config');
	const calendar = config['calendar'] ?? 'BS';
	const date: Rule = (value, path) => {
		try {
			if (typeof value === 'string') {
				if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) fail(path, 'use yyyy-MM-dd.');
			} else {
				object({ year: integer(1), month: integer(1, 12), day: integer(1, 32) })(value, path);
			}
			const result =
				typeof value === 'string'
					? DateParser.parseByFormat(value, 'yyyy-MM-dd')
					: DateParser.parseToDateObj(
							record(value, path) as unknown as { year: number; month: number; day: number },
						);
			if (
				!result ||
				!(calendar === 'AD' ? DateValidator.isValidAdDate(result) : DateValidator.isValidBsDate(result))
			)
				fail(path, 'use a valid date in the selected calendar (yyyy-MM-dd or { year, month, day }).');
		} catch {
			fail(path, 'use a valid date in the selected calendar (yyyy-MM-dd or { year, month, day }).');
		}
	};
	const rules: Record<string, Rule> = {};
	// Derive ordinary scalar fields from the public defaults to avoid a second config model.
	for (const [key, value] of Object.entries(DEFAULT_PICKER_CONFIG)) {
		if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number')
			rules[key] = fromDefaults(value);
	}
	Object.assign(rules, {
		calendar: oneOf(['AD', 'BS']),
		language: oneOf(['en', 'ne']),
		selectionMode: oneOf(['single', 'range', 'multiple']),
		firstDayOfWeek: integer(0, 6),
		popupPosition: oneOf(['auto', 'bottom-left', 'bottom-right', 'top-left', 'top-right']),
		mobilePresentation: oneOf(['bottom-sheet', 'popup']),
		weekdayLabelFormat: oneOf(['short', 'narrow']),
		monthLabelFormat: oneOf(['full', 'short']),
		displayFormat: oneOf([...EDITABLE_DATE_FORMATS, 'MMM dd, yyyy']),
		outputFormat: oneOf(EDITABLE_DATE_FORMATS),
		theme: (value: unknown, path: string) =>
			typeof value === 'string'
				? oneOf([...Object.keys(PRESET_THEMES), 'system'])(value, path)
				: fromDefaults(PRESET_THEMES.light)(value, path),
		customTheme: fromDefaults(PRESET_THEMES.light),
		minDate: (value: unknown, path: string) => {
			if (value !== null) date(value, path);
		},
		maxDate: (value: unknown, path: string) => {
			if (value !== null) date(value, path);
		},
		disabledDates: array(date),
		disabledDaysOfWeek: array(integer(0, 6)),
		validation: fromDefaults({ enabled: false, requireCompleteRange: true }),
		ariaLabels: fromDefaults(DEFAULT_PICKER_CONFIG.ariaLabels),
		rangeConstraints: object({
			minDays: integer(1),
			maxDays: integer(1),
			preventCrossingUnavailableDates: fromDefaults(false),
		}),
		multipleSelection: object({ maxSelections: integer(1) }),
		bsYearRange: object({ start: integer(1, 9999), end: integer(1, 9999) }),
		dateFilter: (_value: unknown, path: string) =>
			fail(path, 'callbacks require TypeScript. Use disabledDates or disabledDaysOfWeek in JSON.'),
		presets: array((value, path) => {
			const preset = record(value, path);
			text(preset['label'], `${path}.label`);
			const selection: Rule = (item, location) => {
				if (item === null || typeof item === 'string') return;
				if (Array.isArray(item)) return array(text)(item, location);
				const range = record(item, location);
				if (!Object.hasOwn(range, 'start') || !Object.hasOwn(range, 'end'))
					fail(location, 'range values need start and end.');
				object({
					start: (v, p) => {
						if (v !== null) text(v, p);
					},
					end: (v, p) => {
						if (v !== null) text(v, p);
					},
				})(range, location);
			};
			if (!Object.hasOwn(preset, 'value')) fail(path, 'a preset needs a value.');
			object({ label: text, value: selection })(preset, path);
		}),
	} satisfies Record<string, Rule>);
	object(rules)(config, 'config');
	const result = config as DatePickerConfig;
	// Expand partial theme groups so copied TypeScript satisfies the public theme contract.
	if (result.theme && typeof result.theme === 'object')
		result.theme = fillDefaults(PRESET_THEMES.light, result.theme) as DatePickerTheme;
	if (result.customTheme) {
		const base =
			typeof result.theme === 'object'
				? result.theme
				: PRESET_THEMES[result.theme === 'system' ? 'light' : (result.theme ?? 'light')];
		result.customTheme = Object.fromEntries(
			Object.entries(result.customTheme).map(([key, value]) => [
				key,
				fillDefaults(base[key as keyof DatePickerTheme], value),
			]),
		);
	}
	if (
		result.minDate &&
		result.maxDate &&
		DateCalculator.compareDates(
			DateParser.parseToDateObj(result.minDate),
			DateParser.parseToDateObj(result.maxDate),
		) > 0
	)
		fail('config', 'minDate must be on or before maxDate.');
	const range = result.rangeConstraints;
	if (range?.minDays && range.maxDays && range.minDays > range.maxDays)
		fail('config.rangeConstraints', 'minDays must not exceed maxDays.');
	if (
		result.bsYearRange &&
		(result.bsYearRange.start === undefined ||
			result.bsYearRange.end === undefined ||
			result.bsYearRange.start > result.bsYearRange.end ||
			result.bsYearRange.end - result.bsYearRange.start > 300)
	)
		fail('config.bsYearRange', 'provide start and end in order, spanning at most 300 years.');
	return result;
}
