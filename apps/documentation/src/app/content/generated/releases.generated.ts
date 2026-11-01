// Derived from the real changelog and migration source.
export const currentChanges = [
	{
		category: 'Added',
		text: 'Import the library and demo into this workspace.',
		breaking: false,
	},
	{
		category: 'Fixed',
		text: 'Fix popup placement with collision-aware side fallback, theme-sized width, bounded scrolling, visual-viewport tracking and measurement before keyboard focus; preserve full-width mobile bottom sheets.',
		breaking: false,
	},
	{
		category: 'Fixed',
		text: 'Fix transformed-container and native-dialog popup ownership with top-layer presentation and a cleaned-up compatibility surface. Keep range errors inside open calendars, disable unavailable Today actions, preserve contrast-safe action text, and include visible localized labels in accessible names.',
		breaking: false,
	},
	{
		category: 'Added',
		text: 'Add selection-count/limit feedback and empty-availability guidance, remove inert inline triggers, add mobile dismissal and larger touch targets, track visual-viewport height, and derive all seven theme options (including Sunset) from public presets.',
		breaking: false,
	},
	{
		category: 'Changed',
		text: 'Breaking: standardize configuration names (`calendar`, `selectionMode`, `readOnly`, `allowTextInput`, `showSecondaryDate`, `convertOnCalendarChange`, `popupPosition`, `mobilePresentation`, `multipleSelection`, and `bsYearRange`) with no legacy aliases. Rename label formats, range-crossing and previous-month options, expand theme background names/CSS properties, replace `CalendarType` with `CalendarSystem`, and correct `Calendar.BD` to `Calendar.BS`. See the configuration migration table.',
		breaking: true,
	},
	{
		category: 'Changed',
		text: 'Separate pure calendar operations from Angular; add a core entry point.',
		breaking: false,
	},
	{
		category: 'Changed',
		text: 'Replace broad internal barrels with direct imports and enforce boundaries.',
		breaking: false,
	},
	{
		category: 'Changed',
		text: 'Extract selection transitions and normalize external range/multiple values.',
		breaking: false,
	},
	{
		category: 'Changed',
		text: 'Use signal-based configuration and isolate nested snapshots.',
		breaking: false,
	},
	{
		category: 'Fixed',
		text: 'Block disabled date clicks, manual-input mutation and clear actions.',
		breaking: false,
	},
	{
		category: 'Fixed',
		text: 'Preserve native child-control keyboard interaction.',
		breaking: false,
	},
	{
		category: 'Changed',
		text: 'Track deferred picker callbacks and cancel them on destruction.',
		breaking: false,
	},
	{
		category: 'Changed',
		text: 'Replace the icon-only Today action with a labelled calendar button and refresh month/year navigation with compact grids, keyboard navigation, focus return and a year-then-month selection flow.',
		breaking: false,
	},
	{
		category: 'Changed',
		text: 'Configure ESLint, Prettier, strict checks, editor integration, commit checks and CI.',
		breaking: false,
	},
	{
		category: 'Removed',
		text: 'Breaking: remove currency APIs and mutable configuration reads. See docs/MIGRATION.md.',
		breaking: true,
	},
] as const;
export const migrationRows = [
	{
		before: 'calendarType',
		after: 'calendar',
	},
	{
		before: 'mode',
		after: 'selectionMode',
	},
	{
		before: 'readonly',
		after: 'readOnly',
	},
	{
		before: 'allowManualInput',
		after: 'allowTextInput',
	},
	{
		before: 'dualDateDisplay',
		after: 'showSecondaryDate',
	},
	{
		before: 'autoConvert',
		after: 'convertOnCalendarChange',
	},
	{
		before: 'monthDisplayType',
		after: 'monthLabelFormat (default → full; short unchanged)',
	},
	{
		before: 'dayDisplayType',
		after: 'weekdayLabelFormat (default → short; short → narrow)',
	},
	{
		before: 'allowModeToggle',
		after: 'showSelectionModeToggle',
	},
	{
		before: 'closeOnSelect',
		after: 'closeOnSelection',
	},
	{
		before: 'position',
		after: 'popupPosition',
	},
	{
		before: 'multipleSelectionSettings',
		after: 'multipleSelection',
	},
	{
		before: 'mobileMode',
		after: 'mobilePresentation (compact → bottom-sheet; full → popup)',
	},
	{
		before: 'yearRange',
		after: 'bsYearRange (the existing BS-only behavior is unchanged)',
	},
	{
		before: 'rangeConstraints.preventUnavailableDates',
		after: 'rangeConstraints.preventCrossingUnavailableDates',
	},
	{
		before: 'ariaLabels.prevMonth',
		after: 'ariaLabels.previousMonth',
	},
	{
		before: 'colors.selectedBg',
		after: 'colors.selectedBackground',
	},
	{
		before: 'colors.hoverBg',
		after: 'colors.hoverBackground',
	},
	{
		before: 'colors.rangeBg',
		after: 'colors.rangeBackground',
	},
	{
		before: 'colors.rangeHoverBg',
		after: 'colors.rangeHoverBackground',
	},
] as const;
