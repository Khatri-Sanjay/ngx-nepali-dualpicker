import type { CalendarSystem } from '../core/models/calendar-system.model';
import type { DatePickerTheme } from '../themes/datepicker-theme.model';
import type { PresetThemeName } from '../themes/datepicker-theme.presets';
import type { EditableDateFormat } from '../core/formatting/date-formats';
import type { DateFilter, RangeConstraints, DateSelectionPreset } from '../datepicker/state/datepicker-options.model';

export enum Calendar {
	AD = 'AD',
	BS = 'BS',
}

/**
 * Main configuration interface for Nepali Date Picker
 */
export interface DatePickerConfig {
	// Language settings
	language?: 'en' | 'ne';
	allowTextInput?: boolean;
	/** Readonly calendars can be browsed; user selection, clearing and calendar/mode changes are blocked. */
	readOnly?: boolean;
	/** Show the corresponding date in the other calendar without changing the selected value. */
	showSecondaryDate?: boolean;
	dateFilter?: DateFilter;
	rangeConstraints?: RangeConstraints;
	presets?: readonly DateSelectionPreset[];
	/** Explicit stable ID is recommended for asynchronously rendered SSR/hydration layouts. */
	id?: string;
	/** Opt-in Angular form validation. */
	validation?: { enabled?: boolean; requireCompleteRange?: boolean };

	calendar?: CalendarSystem;
	convertOnCalendarChange?: boolean; // Automatically convert between BS/AD on toggle

	// Display options
	displayFormat?: EditableDateFormat | 'MMM dd, yyyy';
	outputFormat?: EditableDateFormat;

	// Localized calendar labels
	monthLabelFormat?: 'full' | 'short';
	weekdayLabelFormat?: 'short' | 'narrow';

	// Date picker mode
	selectionMode?: 'single' | 'range' | 'multiple';
	showSelectionModeToggle?: boolean;

	// Date restrictions
	minDate?: Date | string | { year: number; month: number; day: number } | null;
	maxDate?: Date | string | { year: number; month: number; day: number } | null;
	disableFutureDates?: boolean;
	disablePastDates?: boolean;
	disabledDates?: Array<Date | string | { year: number; month: number; day: number }>;
	disabledDaysOfWeek?: number[]; // 0-6, Sunday-Saturday

	// UI options
	showClearButton?: boolean;
	showTodayButton?: boolean;
	closeOnSelection?: boolean;
	placeholder?: string;
	popupPosition?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right' | 'auto';

	// Theming
	theme?: PresetThemeName | DatePickerTheme | 'system';
	customTheme?: Partial<DatePickerTheme>;

	/** BS year-selector bounds. Use minDate/maxDate to bound either calendar. */
	bsYearRange?: {
		start: number;
		end: number;
	};

	// Accessibility
	ariaLabels?: {
		input?: string;
		keyboardHelp?: string;
		calendar?: string;
		nextMonth?: string;
		previousMonth?: string;
		selectDate?: string;
		clearDate?: string;
		today?: string;
	};

	mobilePresentation?: 'bottom-sheet' | 'popup';

	// First day of week (0 = Sunday, 1 = Monday)
	firstDayOfWeek?: 0 | 1 | 2 | 3 | 4 | 5 | 6;

	// Inline mode (always visible)
	inline?: boolean;

	// Multiple selection settings
	multipleSelection?: {
		maxSelections?: number;
	};
}
