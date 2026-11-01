import type { ApiRow } from '../components/api-table/api-table.component';
import type { DocPage } from './doc-model';

export const installation =
	'npm run pack:lib\n# From your consuming Angular app, install the generated local tarball:\nnpm install ../nepali-dualpicker-workspace/dist/packages/ngx-nepali-dualpicker-2.0.0-next.0.tgz';
export const quickStart = `import { Component } from '@angular/core';
import { NgxNepaliDualpicker } from 'ngx-nepali-dualpicker';
import type { DatePickerConfig, DatePickerValue } from 'ngx-nepali-dualpicker';

@Component({
  selector: 'app-example', standalone: true,
  imports: [NgxNepaliDualpicker],
  template: \`<ngx-nepali-dualpicker
    [config]="config" (dateSelected)="value = $event" />\`,
})
export class ExampleComponent {
  config: DatePickerConfig = { calendar: 'BS' };
  value: DatePickerValue = null;
}`;
export const pages: readonly DocPage[] = [
	{
		id: 'booking',
		title: 'Dual dates and booking',
		group: 'Learn',
		description: 'Corresponding dates, availability filters, range limits, cell templates and quick selections.',
		keywords:
			'showSecondaryDate dateFilter rangeConstraints minDays maxDays preventCrossingUnavailableDates ndpDateCell DateCellContext presets fiscal month',
		sections: [
			{
				title: 'Dual dates and availability',
				body: 'showSecondaryDate adds the corresponding date and full accessible announcement without changing form values. dateFilter receives a frozen one-based date and the active AD/BS calendar. Return true to permit selection; it combines with existing restrictions. Callbacks must be synchronous, deterministic and inexpensive. Exceptions reject dates. Replace config when availability changes; captured mutable state alone does not refresh a computed grid.',
				code: `import type { DatePickerConfig } from 'ngx-nepali-dualpicker';
const config: DatePickerConfig = {
  calendar: 'BS', selectionMode: 'range', showSecondaryDate: true,
  dateFilter: (date, calendar) => calendar === 'BS' && date.day !== 15,
  rangeConstraints: { minDays: 3, maxDays: 14, preventCrossingUnavailableDates: true },
  validation: { enabled: true },
};`,
			},
			{
				title: 'Range contract',
				body: 'Durations are inclusive calendar days: Jan 1–3 is 3 days; same-day is 1. BS uses actual month lengths. Positive integer minDays/maxDays constrain completed ranges. preventCrossingUnavailableDates checks all days, including endpoints, and defaults to false. Rejected end clicks preserve the start; invalid typed text and presets preserve the committed value. Optional Angular validation reports nepaliDateRange reasons minDays, maxDays, unavailable or configuration. Programmatic writes and config changes follow the existing normalization policy and may leave a valid partial start.',
			},
			{
				title: 'Typed custom cell contents',
				body: 'Import DateCellTemplateDirective in the template owner. The context provides date/$implicit, calendar, secondaryDate (nullable), secondaryCalendar, selected, disabled and today. Months are one-based. The library retains its button, date name, focus and restrictions; custom text becomes an accessible description. Do not nest interactive controls. Templates replace default contents, so render secondaryDate explicitly if desired. Verify content sizing and contrast.',
				code: `import { Component } from '@angular/core';
import { NgxNepaliDualpicker, DateCellTemplateDirective } from 'ngx-nepali-dualpicker';
@Component({
  standalone: true, imports: [NgxNepaliDualpicker, DateCellTemplateDirective],
  template: \`<ngx-nepali-dualpicker [config]="{ calendar: 'BS', inline: true }">
    <ng-template ndpDateCell let-date let-disabled="disabled" let-secondary="secondaryDate">
      <span>{{ date.day }}</span><small>{{ disabled ? 'Unavailable' : 'Rs 500' }}</small>
      @if (secondary) { <small>AD {{ secondary.month }}/{{ secondary.day }}</small> }
    </ng-template>
  </ngx-nepali-dualpicker>\`,
})
export class BookingCalendar {}`,
			},
			{
				title: 'Application-defined presets',
				body: 'A preset contains label and value: a mode-specific DatePickerValue or a synchronous resolver. It receives calendar, one-based today, selectionMode and outputFormat when activated. Static fiscal dates are specific to a calendar and output format. Presets validate before committing, mark the control touched, respect closeOnSelection and cannot bypass readonly/disabled state. Failed resolvers or invalid selections leave the model unchanged. Today is read from the local system date at activation.',
				code: `import type { DatePickerConfig, DatePresetContext, DatePickerValue } from 'ngx-nepali-dualpicker';
import { DateCalculator, formatPickerDate } from 'ngx-nepali-dualpicker/core';
function monthValue(context: DatePresetContext, offset: number): DatePickerValue {
  const ordinal = context.today.year * 12 + context.today.month - 1 + offset;
  const year = Math.floor(ordinal / 12), month = ((ordinal % 12 + 12) % 12) + 1;
  const day = context.calendar === 'BS'
    ? DateCalculator.getDaysInBsMonth(year, month) : DateCalculator.getDaysInAdMonth(year, month);
  return { start: formatPickerDate({year, month, day: 1}, context.outputFormat), end: formatPickerDate({year, month, day}, context.outputFormat) };
}
const config: DatePickerConfig = {
  calendar: 'BS', selectionMode: 'range',
  presets: [
    { label: 'This month', value: context => monthValue(context, 0) },
    { label: 'Last month', value: context => monthValue(context, -1) },
    { label: 'Fiscal period', value: { start: '2082-04-01', end: '2083-03-31' } },
  ],
};`,
			},
		],
	},
	{
		id: 'core',
		title: 'Calendar utilities',
		group: 'Reference',
		description: 'Use calendar functions without Angular or dependency injection.',
		keywords:
			'core convertAdToBs convertBsToAd getWeekday DateCalculator DateValidator DateParser formatDate formatPickerDate DateObj DateInput CalendarSystem',
		sections: [
			{
				title: 'Angular-free entry point',
				body: 'Import from ngx-nepali-dualpicker/core in browser or Node applications. No Angular bootstrap or provider is required. DateObj uses one-based months. Conversion returns calendar fields, not a timestamp. Invalid or unsupported conversions throw; catch these at application boundaries.',
				code: "import { convertAdToBs, convertBsToAd, formatDate } from 'ngx-nepali-dualpicker/core';\nconst bs = convertAdToBs('2024-01-15');\nconst ad = convertBsToAd({ year: 2080, month: 10, day: 1 });\nconst label = formatDate(bs, 'yyyy-MM-dd', 'en', 'BS');\n// label: '2080-10-01'\nconsole.log(ad, label);",
			},
			{
				title: 'Available exports',
				body: 'convertAdToBs and convertBsToAd convert date inputs. getWeekday returns Sunday = 0 through Saturday = 6. DateCalculator provides calendar arithmetic and month lengths. DateValidator validates calendar fields and leap years. DateParser parses supported numeric input formats. formatPickerDate formats picker values; formatDate supports localized date patterns. DateObj, DateInput and CalendarSystem are type exports. The conversion interval and calendar-table limitations in the conversion guide also apply here.',
			},
			{
				title: 'Choose the right entry point',
				body: 'Use the root entry point for Angular components, providers, services, themes and pipes. Use /core for framework-independent calculations. Formatting does not convert calendars. Prefer calendar fields or date-only strings over UTC timestamps.',
			},
		],
	},
	{
		id: 'home',
		title: 'Introduction',
		group: 'Overview',
		description: 'Nepali dates, naturally integrated with Angular.',
		keywords: 'Bikram Sambat Gregorian datepicker standalone TypeScript',
		sections: [
			{
				title: 'One component, two calendars',
				body: 'Select Bikram Sambat or Gregorian dates with the same Angular component. Use single dates, ranges or multiple selection, then integrate the returned date-only values into your forms.',
			},
			{
				title: 'Built for Angular consumers',
				body: 'A standalone OnPush component, a ControlValueAccessor, typed configuration and an ESM Angular package. Angular is a peer dependency. Tree-shaking metadata is present; final application size depends on your imports and build.',
			},
		],
		examples: ['dual'],
	},
	{
		id: 'getting-started',
		title: 'Getting started',
		group: 'Overview',
		description: 'Install the package and render your first BS picker.',
		keywords: 'installation npm standalone NgModule provideNepaliDualpicker DATE_PICKER_CONFIG',
		sections: [
			{
				title: 'Install',
				body: 'This site documents the unreleased 2.0.0-next.0 workspace. The npm latest tag is 1.1.4 and uses a different API. Build and install the local tarball below to run these examples; adjust its relative path for your application. Your application supplies Angular common/core/forms and RxJS peers. The development compiler is Angular 17.3; the declared peer range is 17–22. The repository architecture report records the exact packed-consumer builds, browser forms tests and server-rendering smoke checks for selected Angular 17-22 versions.',
				code: installation,
				language: 'Shell',
			},
			{
				title: 'Smallest working example',
				body: 'Import the standalone component. Listen to dateSelected to receive the formatted value. Single selection returns string or null; there is no value input.',
				code: quickStart,
			},
			{
				title: 'Application-wide defaults',
				body: 'Component config overrides global defaults. Provide defaults once at bootstrap. Replace config objects when updating input settings. Mode/calendar changes reconcile selection and restrictions; changing mode clears the prior selection.',
				code: `import { ApplicationConfig } from '@angular/core';\nimport { provideNepaliDualpicker } from 'ngx-nepali-dualpicker';\n\nexport const appConfig: ApplicationConfig = {\n  providers: [provideNepaliDualpicker({ language: 'en', calendar: 'BS' })],\n};`,
			},
			{
				title: 'NgModule applications',
				body: 'There is no dedicated library NgModule. Import the standalone component in an existing module’s imports, along with the forms module you use.',
				code: `import { NgModule } from '@angular/core';\nimport { FormsModule, ReactiveFormsModule } from '@angular/forms';\nimport { NgxNepaliDualpicker } from 'ngx-nepali-dualpicker';\n\n@NgModule({ imports: [FormsModule, ReactiveFormsModule, NgxNepaliDualpicker] })\nexport class BookingModule {}`,
			},
		],
		examples: ['basic'],
	},
	{
		id: 'pickers',
		title: 'Picker components',
		group: 'Learn',
		description: 'Single, dual calendar, range, multiple and inline examples.',
		keywords: 'NgxNepaliDualpicker selector convertOnCalendarChange mode range multiple inline Today clear events',
		sections: [
			{
				title: 'Choose a selection mode',
				body: 'These are configurations of one component, not separate range or dual-picker exports. Range values have start/end strings, including a partial start with end null. Multiple values are string arrays. Empty values depend on the mode.',
			},
			{
				title: 'Calendar switching',
				body: 'convertOnCalendarChange preserves the selected day by calling the conversion service. Dates outside the conversion interval can be cleared during a switch. Without convertOnCalendarChange, switching does not preserve the same absolute date. Constraint strings/objects are interpreted in the active calendar.',
				warning: true,
			},
		],
		examples: ['basic', 'ad', 'dual', 'range', 'multiple', 'advanced', 'today'],
	},
	{
		id: 'readOnly',
		title: 'Readonly and validation',
		group: 'Learn',
		description: 'Browse without editing and opt into Angular form validation.',
		keywords:
			'readonly validation enabled requireCompleteRange nepaliDateValidator EDITABLE_DATE_FORMATS ariaLabels id errors',
		sections: [
			{
				title: 'Readonly is independent of disabled',
				body: 'Set readOnly: true to block user selection, typing, clearing and calendar/mode changes. The input remains focusable and the calendar can be browsed. Angular form writes and setDate still update the displayed value. Disabling a form control also prevents navigation and excludes that control from normal Angular form validation.',
				code: "import type { DatePickerConfig } from 'ngx-nepali-dualpicker';\nconst readonlyConfig: DatePickerConfig = { calendar: 'BS', readOnly: true };",
			},
			{
				title: 'Opt-in component validation',
				body: 'Set validation.enabled: true to activate NG_VALIDATORS. Validation errors use nepaliDate, nepaliDateInput, nepaliDateRestricted, nepaliDateRange and nepaliDateLimit. Empty values are optional; combine with application required rules. requireCompleteRange defaults to true. Endpoint restrictions are checked; enable rangeConstraints.preventCrossingUnavailableDates to check every interior day too.',
				code: "import type { DatePickerConfig } from 'ngx-nepali-dualpicker';\nconst config: DatePickerConfig = {\n calendar: 'AD', selectionMode: 'range', allowTextInput: true,\n validation: { enabled: true, requireCompleteRange: true },\n};",
			},
			{
				title: 'Standalone Angular validator',
				body: 'The factory validates model values without changing them. A config getter supports dynamic rules; call updateValueAndValidity after changing those rules. To validate an editable picker draft as well as its last committed model, enable component validation.',
				code: "import { FormControl, Validators } from '@angular/forms';\nimport { nepaliDateValidator } from 'ngx-nepali-dualpicker';\nconst date = new FormControl<string | null>(null, { validators: [\n Validators.required, nepaliDateValidator({ calendar: 'AD', minDate: '2024-01-01' }),\n] });",
			},
		],
	},
	{
		id: 'forms',
		title: 'Angular forms',
		group: 'Learn',
		description: 'Reactive and template-driven forms with reset, submit and validation.',
		keywords:
			'FormGroup FormControl formControlName ngModel required Validators touched disabled writeValue ControlValueAccessor',
		sections: [
			{
				title: 'Use Angular’s forms directives',
				body: 'The picker provides NG_VALUE_ACCESSOR. Import ReactiveFormsModule for formControl/formControlName, or FormsModule for ngModel. writeValue synchronizes without emitting selection changes.',
			},
			{
				title: 'Validation belongs to your form',
				body: 'Validators.required checks an empty single value. Range validation checks incomplete and reversed endpoints when enabled. Enable config.validation.enabled for built-in NG_VALIDATORS integration, including raw input errors. Or attach nepaliDateValidator(config) to a control. Validation is disabled by default; hasError remains visual only. Empty range objects need an application-required-range validator.',
			},
			{
				title: 'Current edge cases',
				body: 'Disabling closes the popup without marking the control touched. Host regression tests cover initial writes, runtime restrictions and mode changes. Enable component validation for complete-range checks; requiring an empty range remains an application rule.',
				warning: true,
			},
		],
	},
	{
		id: 'restrictions',
		title: 'Date restrictions',
		group: 'Learn',
		description: 'Min/max, specific disabled days and weekday rules.',
		keywords:
			'minDate maxDate disabledDates disabledDaysOfWeek disableFutureDates disablePastDates dateFilter filters bsYearRange',
		sections: [
			{
				title: 'Date-only constraints',
				body: 'minDate, maxDate and disabledDates accept ISO strings, JavaScript Date or one-based objects. Prefer date-only strings/objects in a fixed calendar. JavaScript Date inputs read local Gregorian fields. Use calendar explicitly.',
			},
			{
				title: 'Recurring weekday rules',
				body: 'disabledDaysOfWeek uses Sunday = 0 through Saturday = 6. Combine weekday restrictions and disabledDates with a synchronous dateFilter(date, calendar) callback for application availability. True permits selection; it cannot override another restriction. Callback dates use one-based months.',
			},
			{
				title: 'Keep constraints consistent',
				body: 'Avoid minDate after maxDate, invalid bounds or switching between BS/AD with unconverted constraint strings. rangeConstraints.minDays/maxDays limit inclusive calendar duration; preventCrossingUnavailableDates optionally blocks crossing any unavailable day. See Dual dates and booking for complete contracts.',
				warning: true,
			},
		],
		examples: ['bounds', 'disabled', 'weekdays', 'today'],
	},
	{
		id: 'conversion',
		title: 'BS ↔ AD conversion',
		group: 'Learn',
		description: 'Convert calendar-only values through DateConversionService.',
		keywords:
			'DateConversionService DateObj convertBsToAd convertAdToBs getCurrentBsDate getWeekday timezone utilities',
		sections: [
			{
				title: 'Use the public service',
				body: 'Objects use months 1–12. formatted true returns YYYY-MM-DD; otherwise an object is returned. Invalid dates and out-of-range conversions throw Error. Catch errors at application boundaries.',
				code: `import { Component, inject } from '@angular/core';\nimport { DateConversionService } from 'ngx-nepali-dualpicker';\n\n@Component({ selector: 'app-converted-date', standalone: true,\n  template: '<p>AD: {{ ad }}</p><p>BS: {{ bs }}</p>' })\nexport class ConvertedDateComponent {\n  private readonly dates = inject(DateConversionService);\n  readonly ad = this.dates.convertBsToAd({ year: 2080, month: 10, day: 1 }, true);\n  readonly bs = this.dates.convertAdToBs('2024-01-15', true);\n  // ad: '2024-01-15'; bs: '2080-10-01'\n}`,
			},
			{
				title: 'Supported interval',
				body: 'The BS table covers 2000–2139. Conversion is additionally limited to AD 1943-04-14 through 2082-12-31. Not every displayable BS date can convert to AD. Future calendar rows have not been independently verified against authoritative calendars.',
			},
			{
				title: 'Timezone safety',
				body: 'Date-only strings are calendar fields. A JavaScript Date is read in local time; new Date("2024-01-15") is a UTC instant and can read as the previous local day. Prefer strings or one-based DateObj. Today is determined from the local browser date.',
			},
			{
				title: 'Pure utilities',
				body: 'There are no root-exported bsToAd, adToBs, isValidNepaliDate or comparison functions. Angular-free conversion, arithmetic, parsing and formatting are exported from ngx-nepali-dualpicker/core. Use that secondary entry point outside Angular; never import internal source files.',
			},
		],
	},
	{
		id: 'localization',
		title: 'Localization & numerals',
		group: 'Learn',
		description: 'English and Nepali labels, numerals and date formatting.',
		keywords: 'language ne en NepaliDatePipe nepaliDate NepaliNumeralPipe numeral Baisakh Magh',
		sections: [
			{
				title: 'Two built-in languages',
				body: 'language en/ne selects the provided month/weekday labels. Nepali mode displays Nepali date numerals. No locale-registration or custom locale-data API exists.',
			},
			{
				title: 'Display and storage differ',
				body: 'The picker’s numeric form output remains formatted strings rather than localized numeral domain objects. NepaliDatePipe can format a supplied BS or AD date with Nepali digits. It formats; it does not convert calendars.',
				code: `import { NepaliDatePipe } from 'ngx-nepali-dualpicker';\n\nconst pipe = new NepaliDatePipe();\nconst english = pipe.transform('2080-10-01', 'yyyy-MM-dd', 'en', 'BS');\nconst nepali = pipe.transform('2080-10-01', 'yyyy-MM-dd', 'ne', 'BS');\n// 2080-10-01 versus २०८०-१०-०१`,
			},
			{
				title: 'Numeral pipe boundary',
				body: 'NepaliNumeralPipe is internal and is not a root export. Use language: ne for picker numerals, or the public NepaliDatePipe for formatted date numerals.',
			},
		],
		examples: ['locale'],
	},
	{
		id: 'formatting',
		title: 'Formatting & manual input',
		group: 'Learn',
		description: 'Separate displayFormat from outputFormat and explore pipe tokens.',
		keywords: 'yyyy MM dd MMM MMMM EEEE EEE outputFormat displayFormat parseError format',
		sections: [
			{
				title: 'Picker formats',
				body: 'displayFormat supports yyyy-MM-dd, yyyy/MM/dd, MM/dd/yyyy, dd/MM/yyyy, dd-MM-yyyy and MMM dd, yyyy. outputFormat supports the five numeric formats. Tokens are case-sensitive: yyyy and dd are lowercase.',
			},
			{
				title: 'Manual entry',
				body: 'Numeric manual entry uses displayFormat. EDITABLE_DATE_FORMATS lists the five supported numeric patterns. MMM dd, yyyy is display-only and makes the text field readonly while calendar selection remains available. Invalid drafts stay visible and retain the last valid model; opt-in validation marks the control invalid. Form writes use outputFormat.',
				warning: true,
			},
			{
				title: 'Date pipe formats',
				body: 'NepaliDatePipe accepts shortDate, mediumDate, longDate, fullDate or token patterns. EEEE produces full English or Nepali weekday names; EEE and E retain compact labels. Pipe formatting does not convert calendars.',
			},
		],
		examples: ['manual'],
	},
	{
		id: 'theming',
		title: 'Theming & dark mode',
		group: 'Learn',
		description: 'Preset themes, custom accents and CSS variable integration.',
		keywords: 'theme customTheme PRESET_THEMES ThemeService DatePickerTheme system dark --ndp-color-primary',
		sections: [
			{
				title: 'Choose a preset',
				body: 'Available presets are light, dark, ocean, forest, sunset, purple and rose. system follows preferred browser color scheme. The documentation’s dark-mode toggle changes the site; picker theme remains an explicit example setting.',
			},
			{
				title: 'Custom theme properties',
				body: 'Use customTheme to override supported groups. Colors are individually optional; other groups are shallow Partial types and require complete nested fields when supplied. The live example uses the actual configuration API.',
			},
			{
				title: 'CSS variables',
				body: 'Implemented properties include --ndp-color-primary, --ndp-color-selected-background, --ndp-color-selected-text and --ndp-color-today-text. Theme application writes inline variables on the picker container, so ordinary external rules do not override them. Prefer customTheme rather than relying on CSS specificity.',
				code: `const config: DatePickerConfig = {\n  theme: 'light',\n  customTheme: { colors: {\n    primary: '#0d947d', selectedBackground: '#0d947d',\n    selectedText: '#ffffff', todayText: '#0d947d',\n  } },\n};`,
			},
			{
				title: 'Theme service',
				body: 'ThemeService exposes current theme through an Observable, resolves presets and applies/removes CSS variables on elements. Calls without an element can affect document-root theme variables; use per-picker config for isolated examples.',
			},
			{
				title: 'Typography, spacing and dimensions',
				body: 'DatePickerTheme exposes typography.fontFamily, fontSize and fontWeight; spacing.containerPadding/dateGap/headerPadding/pickerGap; borderRadius, shadows and transitions; and dimensions.dateSize/containerWidth/containerMaxHeight/iconSize. The table lists emitted CSS variables and light defaults. Emission does not guarantee a variable is read by every private view. Use the theme groups rather than assuming an undocumented class or layout hook is stable.',
			},
			{
				title: 'Responsive and encapsulated customization',
				body: 'Constrain the public picker host in your own layout (for example display:block; width:min(100%,360px)). Pick mobilePresentation for popup behavior and inline for normal-flow rendering. Angular view encapsulation scopes private styles; parent component selectors do not reach internal view elements. Avoid ::ng-deep or global overrides of private date cells. Test long localized labels, selected states and any custom cell markup at narrow widths.',
			},
		],
		examples: ['theme'],
	},
	{
		id: 'accessibility',
		title: 'Accessibility & SSR',
		group: 'Learn',
		description: 'Keyboard controls, ARIA settings and current verification limits.',
		keywords:
			'ariaLabels keyboard Escape Enter ArrowLeft ArrowRight PageUp PageDown Home End SSR hydration focus disabled screen reader',
		sections: [
			{
				title: 'Keyboard in popup mode',
				body: 'When the popup is open, arrows move logical focus by a day/week; Enter or Space selects; Escape closes. PageUp/PageDown change month (Shift changes year); Home/End jump to week boundaries (Ctrl changes year boundaries). T jumps to today. Editable inputs keep normal typing keys except Escape.',
			},
			{
				title: 'Customize announcements',
				body: 'ariaLabels accepts input, keyboardHelp, calendar, nextMonth, previousMonth, selectDate, clearDate and today. Set a unique config.id and associate a label with that input ID, or set ariaLabels.input. Use DateCellTemplateDirective for projected cell contents; preserve the surrounding accessible button.',
			},
			{
				title: 'Current accessibility limitations',
				body: 'The picker provides a labelled non-modal dialog, input/help/error relationships, full-date labels, live month/selection announcements, a roving tab stop and Escape focus restoration. Inline calendars use group semantics. Automated axe WCAG-tag checks cover all seven presets. Manual NVDA/VoiceOver verification remains a separate checklist; no screen-reader certification is claimed.',
				warning: true,
			},
			{
				title: 'SSR and hydration',
				body: 'Packed consumers on selected Angular 17-22 versions exercise the real server renderer with reactive and template-driven pickers without a browser window global. This documentation app is client-rendered. Hydration, production AOT server builds and every configuration permutation remain unverified. Test server/client clock, timezone and system-theme differences in your application.',
				warning: true,
			},
		],
	},
	{
		id: 'api',
		title: 'API reference',
		group: 'Reference',
		description: 'The actual public component, configuration, types, pipes and services.',
		keywords:
			'config placeholder formControl hasError dateSelected pickerOpened pickerClosed calendarTypeChanged parseError DateObj DateInput DatePickerValue Calendar.BS services utilities',
		sections: [
			{
				title: 'NgxNepaliDualpicker',
				body: 'Selector ngx-nepali-dualpicker. Standalone, OnPush, NG_VALUE_ACCESSOR. One component serves all modes. Projected date-cell contents are supported through DateCellTemplateDirective (ng-template[ndpDateCell]).',
			},
			{
				title: 'Types',
				body: 'DateObj represents calendar fields without a calendar discriminator. Service/config/setDate months are one-based; exposed component state uses zero-based months. DatePickerValue is the forms/output union.',
				code: `export interface DateObj {\n  year: number; month: number; day: number; weekDay?: number;\n}\nexport type DateInput = string | Date | DateObj;\nexport type CalendarSystem = 'AD' | 'BS';\nexport type DatePickerValue = string | string[] |\n  { start: string | null; end: string | null } | null;\n// Calendar.AD === 'AD'; Calendar.BS === 'BS' (existing spelling).`,
			},
			{
				title: 'Public values',
				body: 'DATE_PICKER_CONFIG, DEFAULT_PICKER_CONFIG, PRESET_THEMES and Calendar are root exports. provideNepaliDualpicker(config) returns an Angular Provider. Internal calendar tables and pure utility classes are not root exports.',
			},
		],
	},
	{
		id: 'examples',
		title: 'Real-world examples',
		group: 'Reference',
		description: 'Leave, bookings, birth dates, Nepali forms and reporting.',
		keywords: 'employee leave booking birth government report validation range',
		sections: [
			{
				title: 'Keep business validation in your application',
				body: 'These examples collect date values. Approval rules, availability, age calculations, persistence and server validation are application responsibilities. Check both range endpoints before submitting a query or leave request.',
			},
		],
		examples: ['leave', 'booking', 'birth', 'government', 'reports'],
	},
	{
		id: 'faq',
		title: 'FAQ & troubleshooting',
		group: 'Reference',
		description: 'Practical answers, integration checks and release guidance.',
		keywords: 'install styles forms ControlValueAccessor reset SSR conversion migration errors',
		sections: [
			{
				title: 'Does it support both calendars and forms?',
				body: 'Yes. Configure calendar BS or AD, and convertOnCalendarChange for selected-day conversion. Use ReactiveFormsModule or FormsModule with the standalone component. Range and multiple modes are configurations of the same component.',
			},
			{
				title: 'Picker does not appear',
				body: 'Import NgxNepaliDualpicker in the consuming component/module imports. Click the input to open a popup, or set inline true. Check that the form control is enabled and browser console has no template/import errors.',
			},
			{
				title: 'No value accessor / values do not update',
				body: 'Import the appropriate forms module and the picker. Use formControlName inside a formGroup, or name with ngModel inside a form. Match strings to outputFormat. A range expects { start, end }; multiple expects an array. Do not combine reactive and ngModel directives on one picker.',
			},
			{
				title: 'Conversion mismatch',
				body: 'Check active calendar, one-based month objects, date-only ISO input and supported conversion interval. Avoid UTC Date parsing for a local calendar day. Conversion tables include future entries that need independent verification.',
			},
			{
				title: 'Styles or popup positioning look wrong',
				body: 'Component styles ship with the Angular bundle; no extra CSS import is required. The component uses global styles and inline theme variables. Inspect conflicting application selectors, custom dimensions, stacking contexts and nested scroll containers.',
			},
			{
				title: 'SSR error',
				body: 'Capture the exact stack and package version. Verify browser-only theme calls are not given server-incompatible elements. Test the actual package in your SSR application; this site does not demonstrate SSR.',
			},
			{
				title: 'Migrating releases',
				body: 'The current package is 1.x. No 2.x migration or new domain API is available. Existing selector, root exports, strings and Calendar.BS remain. Recent label corrections rename the tenth BS month to Magh/माघ. Consult release notes before upgrading; no speculative migration guide is provided.',
			},
		],
	},
];

export const inputRows: readonly ApiRow[] = [
	{ name: 'config', type: 'DatePickerConfig', defaultValue: '{}', description: 'Merged with application defaults.' },
	{
		name: 'formControl',
		type: 'FormControl | undefined',
		defaultValue: 'undefined',
		description: 'Angular forms binding; component also stores this input.',
	},
	{
		name: 'placeholder',
		type: 'string | undefined',
		defaultValue: 'undefined',
		description: 'Overrides configured placeholder.',
	},
	{
		name: 'hasError',
		type: 'boolean',
		defaultValue: 'false',
		description: 'Visual error indication; not a form validator.',
	},
];
export const outputRows: readonly ApiRow[] = [
	{
		name: 'dateSelected',
		type: 'DatePickerValue',
		description: 'Selection/clear/conversion result in outputFormat.',
	},
	{ name: 'pickerOpened', type: 'void', description: 'Popup opened; repeated open calls can emit again.' },
	{ name: 'pickerClosed', type: 'void', description: 'Popup closed, including programmatic disable.' },
	{ name: 'calendarTypeChanged', type: 'CalendarSystem', description: 'AD or BS after switching.' },
	{
		name: 'parseError',
		type: '{ type, message, value }',
		description:
			'type is format, validation, range or limit; rejected input, range endpoints or presets. Value is input text or the preset label.',
	},
];
export const keyboardRows: readonly ApiRow[] = [
	{ name: '← / →', type: 'Previous / next day', description: 'Moves logical focusedDate.' },
	{ name: '↑ / ↓', type: 'Previous / next week', description: 'Moves logical focus by seven days.' },
	{ name: 'Enter / Space', type: 'Select', description: 'Opens a closed popup or selects its logical focus.' },
	{ name: 'Escape', type: 'Close', description: 'Dismisses the popup; handled in editable input too.' },
	{ name: 'PageUp / PageDown', type: 'Month; Shift = year', description: 'Navigate within calendar boundaries.' },
	{ name: 'Home / End', type: 'Week boundary; Ctrl/Meta = year', description: 'Jump to start/end.' },
	{ name: 'T', type: 'Today', description: 'Jump to today outside editable input.' },
	{
		name: 'A / B',
		type: 'AD / BS',
		description: 'Switch calendars outside editable input; convertOnCalendarChange controls conversion.',
	},
];
export const tokenRows: readonly ApiRow[] = [
	{ name: 'yyyy / yy', type: 'Year / last two digits', description: '2080 / 80.' },
	{ name: 'MM / M', type: 'Month padded / unpadded', description: '01 / 1; pipe supports both.' },
	{ name: 'dd / d', type: 'Day padded / unpadded', description: '05 / 5; pipe supports both.' },
	{ name: 'MMMM / MMM', type: 'Month name / abbreviation', description: 'Magh / Mag. MMMM is a pipe token.' },
	{
		name: 'EEEE / EEE / E',
		type: 'Weekday labels',
		description: 'Full weekday for EEEE; compact weekday labels for EEE and E.',
	},
];
