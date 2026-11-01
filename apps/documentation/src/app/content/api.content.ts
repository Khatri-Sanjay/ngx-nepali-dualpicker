import { DEFAULT_PICKER_CONFIG } from 'ngx-nepali-dualpicker';
import type { DatePickerConfig } from 'ngx-nepali-dualpicker';
import type { ApiRow } from '../components/api-table/api-table.component';
import { configurationTypes } from './api-signatures.generated';

export const exportRows: readonly ApiRow[] = [
	{
		name: 'DateCellTemplateDirective',
		type: 'Standalone directive',
		description: 'Import to declare ng-template[ndpDateCell] with a typed DateCellContext inside a picker.',
	},
	{
		name: 'DateCellContext, DateFilter, RangeConstraints, DateSelectionPreset, DatePresetContext',
		type: 'Public types',
		description:
			'One-based calendar contracts for cell content, synchronous availability, inclusive duration rules and selection shortcuts.',
	},
	{
		name: 'nepaliDateValidator',
		type: 'ValidatorFn factory',
		description:
			'Optional date, restriction, range and selection-limit validation for Angular controls. Accepts config or a config getter; empty values compose with Validators.required.',
	},
	{
		name: 'EDITABLE_DATE_FORMATS',
		type: 'Readonly numeric format list',
		description:
			'The five formats supported by editable parsing and output formatting. Named-month display remains display-only.',
	},
	{
		name: 'NgxNepaliDualpicker',
		type: 'Standalone component',
		description:
			'Import in component/module imports; selector ngx-nepali-dualpicker. Use config for behavior and Angular forms for value binding.',
	},
	{
		name: 'provideNepaliDualpicker',
		type: '(config?: DatePickerConfig) → Provider',
		description:
			'Register in application providers for shared defaults. Defaults merge with each picker config; the provider is optional.',
	},
	{
		name: 'DATE_PICKER_CONFIG',
		type: 'InjectionToken<DatePickerConfig>',
		description:
			'Inject configuration or provide a custom value. Prefer provideNepaliDualpicker to merge omitted options with defaults.',
	},
	{
		name: 'DEFAULT_PICKER_CONFIG',
		type: 'Required<DatePickerConfig>',
		description:
			'Built-in defaults listed below. Treat this shared object as read-only; copy options into your own configuration.',
	},
	{
		name: 'PRESET_THEMES',
		type: 'Record<PresetThemeName, DatePickerTheme>',
		description:
			'Seven built-in themes. Use preset names in config.theme or create a merged custom theme; avoid mutating shared presets.',
	},
	{
		name: 'Calendar',
		type: "enum: AD = 'AD', BS = 'BS'",
		description: 'Calendar constants. Use Calendar.BS for Bikram Sambat and Calendar.AD for Gregorian dates.',
	},
	{
		name: 'CalendarSystem',
		type: "'AD' | 'BS'",
		description: 'Active calendar discriminator for configuration and calendarTypeChanged.',
	},
	{
		name: 'DateObj',
		type: '{ year: number; month: number; day: number; weekDay?: number }',
		description:
			'Date-only fields. Public conversion/config/setDate months are 1–12, weekDay is Sunday 0–Saturday 6. Exposed component date state uses months 0–11.',
	},
	{
		name: 'DateInput',
		type: 'string | Date | DateObj',
		description:
			'Conversion input. Strings use date-only ISO fields; Date reads local Gregorian fields. Objects carry no calendar tag: the called conversion method determines their calendar.',
	},
	{
		name: 'DatePickerValue',
		type: 'string | string[] | { start: string | null; end: string | null } | null',
		description:
			'Form and dateSelected value. Single clears to null, multiple to [], range to null endpoints. A first range click can emit start with end null. Dates use outputFormat.',
	},
	{
		name: 'DatePickerConfig',
		type: 'Interface; all options optional',
		description:
			'Component/global options; see the full types, defaults and behavior table below. Supply a new object when changing input configuration.',
	},
	{
		name: 'DatePickerTheme',
		type: 'Theme interface',
		description:
			'Colors, spacing, typography, borderRadius, shadows, transitions and dimensions. See theme groups below. customTheme is shallow Partial<DatePickerTheme>.',
	},
	{
		name: 'PresetThemeName',
		type: "'light' | 'dark' | 'ocean' | 'forest' | 'purple' | 'rose'",
		description:
			'Names accepted by theme presets and ThemeService. config.theme additionally accepts system or a complete theme object.',
	},
	{
		name: 'DateConversionService',
		type: 'Root injectable service',
		description:
			'Inject for BS/AD conversion, current BS dates and calendar month/year information; methods are listed below.',
	},
	{
		name: 'DatePickerConfigService',
		type: 'Root injectable service',
		description:
			'Inject to create/merge configuration presets and manage global configuration. Runtime updates use a signal and are observed by existing pickers; instance overrides take precedence.',
	},
	{
		name: 'ThemeService',
		type: 'Root injectable service',
		description:
			'Inject for theme observation, merging, preset lookup and applying variables. Browser DOM methods should be used in browser contexts.',
	},
	{
		name: 'NepaliDatePipe',
		type: 'Standalone pipe: nepaliDate',
		description:
			'Formats BS or AD fields in en/ne; never converts calendars. Import in template imports or instantiate for programmatic formatting.',
	},
];

const configDescriptions: Record<keyof DatePickerConfig, string> = {
	showSecondaryDate: 'Show the corresponding date from the other calendar in each cell.',
	dateFilter:
		'Synchronous callback: true permits the one-based date in the active calendar; combines with other restrictions.',
	rangeConstraints: 'Inclusive minDays/maxDays and optional prevention of ranges crossing unavailable dates.',
	presets:
		'Application-defined shortcuts resolved on activation and validated against the current mode and restrictions.',
	language: 'en or ne: label/numeral language.',
	calendar: 'BS or AD: active calendar.',
	convertOnCalendarChange: 'Convert selected dates when switching calendars.',
	allowTextInput: 'Enable numeric text entry; named-month parsing is not supported.',
	readOnly: 'Allow browsing while blocking user changes. Form writes remain supported; distinct from disabled.',
	id: 'Stable inner input ID; derived calendar, help and error IDs follow it. IDs must be unique per page.',
	validation: 'Opt-in component validation: enabled defaults false; requireCompleteRange defaults true.',
	displayFormat: 'One of six picker display formats; not arbitrary tokens.',
	outputFormat: 'One of five numeric output formats.',
	monthLabelFormat: 'Full or abbreviated month labels.',
	weekdayLabelFormat: 'Short or narrow localized weekday labels.',
	selectionMode: 'single, range or multiple.',
	showSelectionModeToggle: 'Display mode-switch controls.',
	minDate: 'Date, ISO string, one-based object or null.',
	maxDate: 'Date, ISO string, one-based object or null.',
	disableFutureDates: 'Prevent dates after local today.',
	disablePastDates: 'Prevent dates before local today.',
	disabledDates: 'Explicit unavailable dates; list replaces global list.',
	disabledDaysOfWeek: 'Unavailable weekdays: Sunday 0 to Saturday 6.',
	showClearButton: 'Display Clear action.',
	showTodayButton: 'Show Today action; disabled with an explanation when the current date is unavailable.',
	closeOnSelection: 'Close on completed selection; usually false for ranges/multiple.',
	placeholder: 'Input hint; component placeholder input takes precedence.',
	popupPosition:
		'Preferred bottom-left, bottom-right, top-left, top-right or auto placement. Flips vertically when space is insufficient, clamps horizontally and scrolls within available height.',
	theme: 'Preset name, full theme object or system.',
	customTheme: 'Partial theme groups merged with resolved theme; shallow Partial typing.',
	bsYearRange: 'BS display years, clamped to table and min/max.',
	ariaLabels:
		'input, keyboardHelp, calendar, nextMonth, previousMonth, selectDate, clearDate and today overrides. Default control names localize; visible labels remain part of accessible names.',
	mobilePresentation:
		'Nonmodal bottom-sheet with explicit dismissal, or anchored popup on mobile; size tracks the visual viewport.',
	firstDayOfWeek: '0–6; rotates headings and grid.',
	inline: 'Always display calendar in normal flow; no popup trigger.',
	multipleSelection:
		'Optional maxSelections; visible count and rejected-click feedback preserve the committed model.',
};
export const configRows: readonly ApiRow[] = (Object.keys(DEFAULT_PICKER_CONFIG) as (keyof DatePickerConfig)[]).map(
	(name) => ({
		name,
		type: configurationTypes[name],
		defaultValue:
			name === 'dateFilter' ? '() => true' : (JSON.stringify(DEFAULT_PICKER_CONFIG[name]) ?? 'undefined'),
		description: configDescriptions[name],
	}),
);
export const methodRows: readonly ApiRow[] = [
	{
		name: 'setDate(date)',
		type: 'ISO string | one-based object → void',
		description: 'Select one date; range starts an endpoint, multiple replaces with one date.',
	},
	{ name: 'open() / close() / toggleOpen()', type: 'void', description: 'Popup visibility; close marks touched.' },
	{ name: 'clearSelection()', type: 'void', description: 'Emit the mode-specific empty value.' },
	{
		name: 'switchCalendarType(type) / toggleCalendarType()',
		type: 'CalendarSystem / void',
		description: 'Switch calendar; convertOnCalendarChange controls selected-date conversion.',
	},
	{ name: 'toggleMode(mode)', type: 'single | range | multiple → void', description: 'Change selection mode.' },
	{ name: 'selectToday()', type: 'void', description: 'Select local today if allowed.' },
	{ name: 'prevMonth() / nextMonth()', type: 'void', description: 'Navigate displayed calendar.' },
	{
		name: 'selectMonth(index) / selectYear(year)',
		type: 'number → void',
		description: 'Component month indices are zero-based.',
	},
	{
		name: 'writeValue / registerOnChange / registerOnTouched / setDisabledState',
		type: 'ControlValueAccessor',
		description: 'Used by Angular forms; writeValue accepts unknown at its boundary.',
	},
];
export const conversionRows: readonly ApiRow[] = [
	{
		name: 'convertAdToBs(input, formatted?)',
		type: 'DateInput, boolean → DateObj | string',
		description: 'AD to BS; true yields ISO string; throws on invalid/out-of-range input.',
	},
	{
		name: 'convertBsToAd(input, formatted?)',
		type: 'DateInput, boolean → DateObj | string',
		description: 'BS to AD with the same return convention.',
	},
	{ name: 'getCurrentBsDate(formatted?)', type: 'boolean → DateObj | string', description: 'Convert local today.' },
	{ name: 'getWeekday(input)', type: 'DateInput → number', description: 'AD weekday, Sunday = 0.' },
	{
		name: 'isBsYearSupported(year) / isAdYearSupported(year)',
		type: 'number → boolean',
		description: 'Nominal year bounds, not date-convertibility checks.',
	},
	{
		name: 'getDaysInBsMonth(year, month)',
		type: 'number, number → number',
		description: 'One-based BS month length.',
	},
	{ name: 'getDaysInBsYear(year)', type: 'number → number', description: 'Total BS year length.' },
	{
		name: 'getCurrentBsMonth(formatted?) / getCurrentBsYear(formatted?)',
		type: 'boolean → number | string',
		description: 'Current BS date parts.',
	},
];
export const configServiceRows: readonly ApiRow[] = [
	{ name: 'getGlobalConfig()', type: 'DatePickerConfig', description: 'Current global configuration object.' },
	{
		name: 'getMergedConfig(componentConfig?)',
		type: 'Required<DatePickerConfig>',
		description: 'Merge global settings and component overrides.',
	},
	{
		name: 'updateGlobalConfig(updates) / resetGlobalConfig()',
		type: 'void',
		description:
			'Immutable nested updates tracked by picker computed configuration. Runtime selection mode and restriction changes are reconciled by existing picker instances.',
	},
	{
		name: 'getConfigForMode(mode)',
		type: 'Required<DatePickerConfig>',
		description: 'Configuration preset for a selection mode.',
	},
	{
		name: 'getConfigWithTheme(theme) / getConfigWithLanguage(language)',
		type: 'Required<DatePickerConfig>',
		description: 'Merged themed/localized presets.',
	},
	{
		name: 'createConfigPreset(baseConfig)',
		type: 'Required<DatePickerConfig>',
		description: 'Reusable configuration with defaults.',
	},
];
export const themeRows: readonly ApiRow[] = [
	{
		name: 'getCurrentTheme() / getCurrentThemeValue()',
		type: 'Observable<DatePickerTheme> / DatePickerTheme',
		description: 'Observe/read current service theme.',
	},
	{
		name: 'setTheme(theme, element?) / mergeTheme(customTheme, element?)',
		type: 'void',
		description: 'Resolve/merge and apply variables; element-less browser calls target root.',
	},
	{
		name: 'applyThemeToElement(theme, element) / removeThemeFromElement(element)',
		type: 'void',
		description: 'DOM element theme operations.',
	},
	{
		name: 'getPresetTheme(name) / getPresetThemes()',
		type: 'DatePickerTheme / typeof PRESET_THEMES',
		description: 'Read predefined theme objects.',
	},
	{
		name: 'createCustomTheme(name, overrides) / mergeThemeObject(base, overrides)',
		type: 'DatePickerTheme',
		description: 'Create merged theme values.',
	},
	{
		name: 'detectSystemTheme() / prefersDarkMode()',
		type: 'light | dark / boolean',
		description: 'Read browser color-scheme preference.',
	},
	{
		name: 'onSystemThemeChange(callback)',
		type: 'cleanup function',
		description: 'Subscribe to browser preference changes.',
	},
	{
		name: 'isValidTheme(value)',
		type: 'value is DatePickerTheme',
		description: 'Group-presence check; not deep runtime validation.',
	},
];
export const themeTypeCode = `import type { DatePickerTheme, PresetThemeName } from 'ngx-nepali-dualpicker';
// PresetThemeName: light | dark | ocean | forest | purple | rose
// DatePickerTheme groups:
// colors: optional primary, primaryHover, primaryLight, secondary,
// background, surface, border, text, textSecondary, textDisabled,
// error, success, selectedBackground, selectedText, hoverBackground, todayText,
// rangeBackground, rangeHoverBackground
// spacing: containerPadding, dateGap, headerPadding, pickerGap (strings)
// typography: fontFamily; fontSize { base, small, large } (strings);
// fontWeight { normal, medium, semibold, bold } (numbers)
// borderRadius: small, medium, large, full (strings)
// shadows: dropdown, selected (strings)
// transitions: default, fast, slow (strings)
// dimensions: dateSize, containerWidth, containerMaxHeight, iconSize (strings)`;
