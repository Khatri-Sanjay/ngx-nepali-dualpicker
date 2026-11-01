import type { DatePickerConfig } from 'ngx-nepali-dualpicker';

export interface PickerExample {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly config: DatePickerConfig;
	readonly initial: string | null;
}
export const examples: readonly PickerExample[] = [
	{
		id: 'basic',
		title: 'Your first Nepali date',
		description: 'A single BS date. Select a day to receive a date-only string; Clear emits null.',
		config: { calendar: 'BS', placeholder: 'Select a Nepali date' },
		initial: null,
	},
	{
		id: 'ad',
		title: 'Gregorian date picker',
		description: 'The same component with calendar set to AD.',
		config: { calendar: 'AD' },
		initial: '2024-01-15',
	},
	{
		id: 'dual',
		title: 'Two calendars. One selected day.',
		description:
			'Enable convertOnCalendarChange and use the BS / AD buttons. Both representations below come from DateConversionService.',
		config: { calendar: 'BS', convertOnCalendarChange: true },
		initial: '2080-10-01',
	},
	{
		id: 'range',
		title: 'Date range',
		description:
			'Choose two endpoints. The first selection emits a partial range; the second completes it. Clear resets both endpoints. Use rangeConstraints to enforce minimum and maximum range lengths.',
		config: { calendar: 'BS', selectionMode: 'range', closeOnSelection: false },
		initial: null,
	},
	{
		id: 'multiple',
		title: 'Multiple dates',
		description:
			'Choose up to three days. Select a chosen day again to remove it. Values preserve selection order.',
		config: {
			calendar: 'AD',
			selectionMode: 'multiple',
			closeOnSelection: false,
			multipleSelection: { maxSelections: 3 },
		},
		initial: null,
	},
	{
		id: 'advanced',
		title: 'Inline calendar',
		description:
			'An always-visible calendar with Monday-first columns. The picker’s inline keyboard behavior has known limitations.',
		config: { calendar: 'AD', inline: true, firstDayOfWeek: 1, showTodayButton: true, showClearButton: true },
		initial: null,
	},
	{
		id: 'bounds',
		title: 'A bounded BS year',
		description: 'Only BS 2083-01-01 through 2083-12-30 are available. Constraint objects use one-based months.',
		config: { calendar: 'BS', minDate: '2083-01-01', maxDate: '2083-12-30' },
		initial: '2083-01-01',
	},
	{
		id: 'disabled',
		title: 'Specific unavailable dates',
		description: 'AD January 20 and 21, 2024 are unavailable. This is a list of dates, not a callback filter.',
		config: { calendar: 'AD', disabledDates: ['2024-01-20', '2024-01-21'] },
		initial: '2024-01-15',
	},
	{
		id: 'weekdays',
		title: 'Weekday restrictions',
		description:
			'Sunday (0) and Saturday (6) are unavailable. Use dateFilter for additional application-specific restrictions.',
		config: { calendar: 'AD', disabledDaysOfWeek: [0, 6] },
		initial: '2024-01-15',
	},
	{
		id: 'today',
		title: 'Today and past/future limits',
		description:
			'Today uses the browser’s local Gregorian date. This example disables future dates. The Today button is a built-in action.',
		config: { calendar: 'AD', disableFutureDates: true, showTodayButton: true },
		initial: null,
	},
	{
		id: 'locale',
		title: 'English and Nepali',
		description:
			'Switch language to change calendar labels and displayed numerals. Numeric form output remains based on outputFormat.',
		config: { calendar: 'BS', language: 'ne' },
		initial: '2080-10-01',
	},
	{
		id: 'manual',
		title: 'Type or select',
		description:
			'Manual input uses displayFormat; form output uses outputFormat. Invalid input emits parseError. Named-month manual parsing is not supported.',
		config: { calendar: 'AD', allowTextInput: true, displayFormat: 'dd/MM/yyyy', outputFormat: 'yyyy-MM-dd' },
		initial: '2024-01-15',
	},
	{
		id: 'theme',
		title: 'Preset and custom themes',
		description:
			'Choose a preset or a custom accent. Themes are configured per picker; documentation dark mode is independent.',
		config: { calendar: 'AD', theme: 'light' },
		initial: '2024-01-15',
	},
	{
		id: 'leave',
		title: 'Employee leave application',
		description:
			'Collect leave start/end dates as one range value. Submit a completed range; a partial range is still a valid picker emission.',
		config: { calendar: 'BS', selectionMode: 'range', closeOnSelection: false },
		initial: null,
	},
	{
		id: 'booking',
		title: 'Event booking',
		description:
			'Choose an event date with past dates unavailable. Applications remain responsible for server-side availability checks.',
		config: { calendar: 'AD', disablePastDates: true },
		initial: null,
	},
	{
		id: 'birth',
		title: 'Date of birth',
		description:
			'Prevent future dates. Store a date-only string rather than converting it through a UTC timestamp.',
		config: { calendar: 'BS', disableFutureDates: true },
		initial: null,
	},
	{
		id: 'government',
		title: 'Nepali application form',
		description:
			'Use Nepali labels and show the selected date in BS and AD without asking the user to enter it twice.',
		config: { calendar: 'BS', language: 'ne', convertOnCalendarChange: true },
		initial: '2080-10-01',
	},
	{
		id: 'reports',
		title: 'Report date filter',
		description: 'Select a Gregorian reporting interval. Query a backend only after both endpoints are present.',
		config: { calendar: 'AD', selectionMode: 'range', closeOnSelection: false },
		initial: null,
	},
];
export function exampleById(id: string): PickerExample {
	const example = examples.find((item) => item.id === id);
	if (!example) throw new Error(`Unknown documentation example: ${id}`);
	return example;
}
