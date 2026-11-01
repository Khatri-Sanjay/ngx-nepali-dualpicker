import type { DocPage } from '../doc-model';

export const referencePages: readonly DocPage[] = [
	{
		id: 'date-cell-template',
		title: 'DateCellTemplateDirective',
		group: 'Directives',
		description:
			'Customize calendar cell content while retaining the picker’s interaction and accessibility behavior.',
		keywords: 'directive ng-template ndpDateCell DateCellContext custom template price badge',
		source: 'libs/ngx-nepali-dualpicker/src/lib/datepicker/components/calendar-grid/date-cell-template.directive.ts',
		references: ['DateCellContext'],
		sections: [
			{
				title: 'Selector and import',
				body: 'Import DateCellTemplateDirective in the component that declares ng-template[ndpDateCell]. Place the template inside ngx-nepali-dualpicker. The directive has no inputs or outputs; it captures a typed TemplateRef used by the picker.',
				code: `import { Component } from '@angular/core';
import { NgxNepaliDualpicker, DateCellTemplateDirective } from 'ngx-nepali-dualpicker';
@Component({ standalone: true, imports: [NgxNepaliDualpicker, DateCellTemplateDirective],
 template: \`<ngx-nepali-dualpicker [config]="{ inline: true, showSecondaryDate: true }">
   <ng-template ndpDateCell let-date let-disabled="disabled" let-secondary="secondaryDate">
     <span>{{ date.day }}</span><small>{{ disabled ? 'Unavailable' : 'Open' }}</small>
     @if (secondary) { <small>AD {{ secondary.month }}/{{ secondary.day }}</small> }
   </ng-template>
 </ngx-nepali-dualpicker>\` })
export class CustomCellExample {}`,
			},
			{
				title: 'Context contract',
				body: '$implicit and date are frozen one-based calendar fields. calendar identifies those fields. secondaryDate may be null outside the common conversion interval; secondaryCalendar identifies its calendar. selected, disabled and today describe the cell state. A custom template replaces default labels, including the secondary label.',
			},
			{
				title: 'Template configuration and events',
				body: 'The directive has no configuration object, input binding or output event. Configure behavior on the owning picker and handle dateSelected/parseError there. DateCellContext is supplied by the library rather than constructed by the consumer.',
			},
			{
				title: 'Accessibility and sizing',
				body: 'The library retains the button, full date accessible name, keyboard behavior and restrictions. Projected text is associated as a description. Use text and decorative markup only: nested buttons, links or form fields would create conflicting interactions. Keep content compact, do not rely on color alone, and test contrast in selected/disabled states.',
			},
			{
				title: 'Live example',
				body: 'The booking example in the playground switches custom price cells on and off against the actual directive. It also demonstrates unavailable days, dual dates, presets and range constraints.',
			},
		],
	},
	{
		id: 'nepali-date-pipe',
		title: 'NepaliDatePipe',
		group: 'Pipes',
		description: 'Format date fields with localized names and numerals without converting calendars.',
		keywords: 'nepaliDate pipe transform null format locale DateObj Date mediumDate fullDate',
		source: 'libs/ngx-nepali-dualpicker/src/lib/pipes/nepali-date.pipe.ts',
		references: ['NepaliDatePipe', 'format-tokens'],
		sections: [
			{
				title: 'Import and use',
				body: 'The standalone pure pipe is named nepaliDate. Its arguments are value, format (mediumDate), locale (ne) and calendar (BS). It returns a string. Import it into the template owner.',
				code: `import { Component } from '@angular/core';
import { NepaliDatePipe } from 'ngx-nepali-dualpicker';
@Component({ standalone: true, imports: [NepaliDatePipe], template: "<p>{{ date | nepaliDate:'yyyy-MM-dd':'en':'BS' }}</p>" })
export class PipeExample { date = { year: 2080, month: 10, day: 1 }; }
// Expected text: 2080-10-01`,
			},
			{
				title: 'Accepted values and empty states',
				body: 'Inputs are date-only strings, DateObj, JavaScript Date, null or undefined. Null/undefined, malformed input and invalid calendar dates format as an empty string. JavaScript Date reads local fields, so store date-only fields when timezone conversion is not intended. Replace object references to trigger a pure pipe after a change.',
			},
			{
				title: 'Formatting is not conversion',
				body: 'Passing AD fields with BS formatting does not convert them. Convert through DateConversionService or /core first. The calendar argument controls validation, month names and weekday calculation. Range objects and arrays must be formatted endpoint-by-endpoint/date-by-date.',
			},
			{
				title: 'Pipe grammar versus picker grammar',
				body: 'The pipe supports named presets and date tokens in the table. Editable picker display/output formats support a smaller numeric grammar; MMM dd, yyyy is display-only in the picker. Do not infer parser support from a formatting token.',
			},
		],
		examples: ['locale'],
	},
	{
		id: 'date-conversion-service',
		title: 'DateConversionService',
		group: 'Services',
		description: 'Inject calendar conversion and date information into Angular applications.',
		keywords: 'inject service convertAdToBs convertBsToAd getCurrentBsDate weekday',
		references: ['DateConversionService'],
		source: 'libs/ngx-nepali-dualpicker/src/lib/services/date-conversion.service.ts',
		sections: [
			{
				title: 'Injection and conversion',
				body: 'The service is provided in root. It delegates to the same calendar core as /core; no extra provider is required. Conversion methods accept DateInput and optionally return a formatted date-only string.',
				code: `import { Injectable, inject } from '@angular/core';
import { DateConversionService } from 'ngx-nepali-dualpicker';
@Injectable({ providedIn: 'root' })
export class CalendarAdapter {
 private readonly dates = inject(DateConversionService);
 toBs(): string { return this.dates.convertAdToBs('2024-01-15', true) as string; }
}
// toBs(): 2080-10-01`,
			},
			{
				title: 'Errors and date contracts',
				body: 'Invalid or unsupported conversions throw. Catch errors at user-input and backend boundaries. Public months are 1–12; JavaScript Date uses local Gregorian fields. Conversion returns fields/date-only strings rather than a UTC instant. See the calendar accuracy guide for table provenance and independent-verification limitations.',
			},
		],
	},
	{
		id: 'datepicker-config-service',
		title: 'DatePickerConfigService',
		group: 'Services',
		description: 'Manage reactive global defaults and independent configuration snapshots.',
		keywords: 'service updateGlobalConfig getGlobalConfig getMergedConfig resetGlobalConfig',
		references: ['DatePickerConfigService'],
		source: 'libs/ngx-nepali-dualpicker/src/lib/configuration/datepicker-config.service.ts',
		sections: [
			{
				title: 'Reactive application defaults',
				body: 'The root-provided service stores global configuration in a signal. Existing pickers observe updateGlobalConfig; per-instance overrides still win. Configuration snapshots clone nested objects, arrays and Dates.',
				code: `import { Injectable, inject } from '@angular/core';
import { DatePickerConfigService } from 'ngx-nepali-dualpicker';
@Injectable({ providedIn: 'root' })
export class CalendarPreferences {
 private readonly config = inject(DatePickerConfigService);
 useNepali(): void { this.config.updateGlobalConfig({ language: 'ne', firstDayOfWeek: 0 }); }
 reset(): void { this.config.resetGlobalConfig(); }
}`,
			},
			{
				title: 'Merge semantics',
				body: 'Nested objects merge, arrays replace, undefined is ignored and null clears min/max dates. getMergedConfig applies instance overrides after global defaults. Do not mutate DEFAULT_PICKER_CONFIG or a shared preset. resetGlobalConfig returns to built-in defaults, not the original injected token value.',
			},
			{
				title: 'Preset helpers',
				body: 'getConfigForMode, getConfigWithTheme, getConfigWithLanguage and createConfigPreset return merged configuration objects. They do not register a new global preset or emit selection events.',
			},
		],
	},
	{
		id: 'theme-service',
		title: 'ThemeService',
		group: 'Services',
		description: 'Observe, resolve and apply themes when application-level control is needed.',
		keywords: 'ThemeService getCurrentTheme Observable setTheme mergeTheme system CSS DOM',
		references: ['ThemeService'],
		source: 'libs/ngx-nepali-dualpicker/src/lib/themes/theme.service.ts',
		sections: [
			{
				title: 'Prefer instance configuration for pickers',
				body: 'Each picker manages its own theme through config.theme/customTheme. Use ThemeService when your application explicitly needs its own theme stream, snapshots, preset merging or element styling. Applying a global service theme does not replace instance configuration.',
			},
			{
				title: 'Observable integration',
				body: 'getCurrentTheme returns an Observable of independent theme snapshots. Use Angular AsyncPipe, toSignal or takeUntilDestroyed instead of unmanaged subscriptions. setTheme and mergeTheme can apply variables to a specific HTMLElement; omitting it applies to document.documentElement in a browser.',
				code: `import { Injectable, inject } from '@angular/core';
import { ThemeService } from 'ngx-nepali-dualpicker';
@Injectable({ providedIn: 'root' })
export class ThemePreferences {
 private readonly themes = inject(ThemeService);
 readonly theme$ = this.themes.getCurrentTheme();
 applyTo(element: HTMLElement): void { this.themes.setTheme('ocean', element); }
}`,
			},
			{
				title: 'Browser and lifecycle considerations',
				body: 'Pass actual browser elements only after view initialization. System-theme listening is guarded for browsers and cleaned up by the service. onSystemThemeChange returns a cleanup function that your own application must invoke. Element styling methods require an actual element; they are not a server DOM abstraction.',
			},
		],
	},
	{
		id: 'providers',
		title: 'Providers, tokens & defaults',
		group: 'Services',
		description: 'Register shared configuration with the public provider and injection token.',
		keywords: 'provideNepaliDualpicker DATE_PICKER_CONFIG DEFAULT_PICKER_CONFIG InjectionToken Provider DI',
		references: ['provider-exports'],
		sections: [
			{
				title: 'Optional provider',
				body: 'provideNepaliDualpicker(config) returns an Angular Provider for DATE_PICKER_CONFIG, merged with built-in defaults. Register it at application or injector scope. It does not register template imports.',
				code: `import { ApplicationConfig } from '@angular/core';
import { provideNepaliDualpicker } from 'ngx-nepali-dualpicker';
export const appConfig: ApplicationConfig = { providers: [provideNepaliDualpicker({ calendar: 'BS', language: 'ne' })] };`,
			},
			{
				title: 'Token and defaults',
				body: 'DATE_PICKER_CONFIG has a root factory, so no provider is required for a basic picker. Prefer the provider helper over hand-building every default. DEFAULT_PICKER_CONFIG is a shared exported object; treat it as read-only. DatePickerConfigService owns runtime updates independently of later mutations to token initialization data.',
			},
		],
	},
	{
		id: 'types',
		title: 'Types, interfaces & enums',
		group: 'API Reference',
		description: 'Every exported contract from both public entry points, generated from source.',
		keywords:
			'Calendar CalendarSystem DateObj DateInput DatePickerValue DatePickerConfig DatePickerTheme PresetThemeName DateCellContext DatePresetContext DateSelectionPreset RangeConstraints DateFilter',
		references: ['types'],
		sections: [
			{
				title: 'Calendar fields and form values',
				body: 'CalendarSystem is AD | BS; Calendar.AD and Calendar.BS are enum constants. DateObj months are one-based and DateInput accepts fields, date-only strings or local JavaScript Date. DatePickerValue is mode-specific: string/null, string[], or start/end endpoints. It carries no calendar tag, so persist the calendar/output format with it.',
			},
			{
				title: 'Configuration and extension contracts',
				body: 'DatePickerConfig options are optional and merge with defaults. DatePickerTheme describes theme groups; customTheme is Partial at the top level. DateFilter is a synchronous boolean predicate. RangeConstraints counts inclusive calendar days. Presets receive DatePresetContext at activation; custom cells receive DateCellContext.',
			},
		],
	},
];
