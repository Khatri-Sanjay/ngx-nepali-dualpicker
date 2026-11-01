<p align="center"><img src="https://ngx-nepali-dualpicker-docs.vercel.app/assets/brand/logo.svg" width="88" height="88" alt="Nepali Dualpicker logo" /></p>

﻿ # ngx-nepali-dualpicker

An Angular date picker for **Bikram Sambat (BS)** and **Gregorian (AD)** calendars. Select a single date, a date range, or multiple dates; convert between calendars; and customize availability, formatting, localization, and appearance.

[Documentation](https://ngx-nepali-dualpicker-docs.vercel.app/) | [Live playground](https://ngx-nepali-dualpicker-playground.vercel.app/) | [npm](https://www.npmjs.com/package/ngx-nepali-dualpicker) | [GitHub](https://github.com/Khatri-Sanjay/ngx-nepali-dualpicker)

## Features

- **Two calendars:** BS and AD selection, optional calendar switching with date conversion, and secondary-calendar labels in each day cell.
- **Selection modes:** single date, date range, and multiple dates with an optional selection limit.
- **Angular Forms:** standalone component with reactive forms, `formControlName`, template-driven forms, touched state, reset, and disabled controls.
- **Signal Forms interoperability:** tested through `[formField]` on Angular 21.2.25 and 22.2.4, with version-specific validation behavior described below.
- **Date restrictions:** minimum/maximum dates, disabled dates, disabled weekdays, past/future restrictions, and application-defined availability filters.
- **Booking rules:** inclusive range-length limits and optional prevention of ranges crossing unavailable dates.
- **Custom content:** typed date-cell templates for prices, availability, badges, or events, plus static or callback-based quick-selection presets.
- **Localization:** English and Nepali labels and numerals, configurable month/weekday labels, and first day of the week.
- **Formatting:** separate display and model formats, optional numeric text input, and a standalone date-formatting pipe.
- **Appearance:** light, dark, ocean, forest, purple, rose, system preference, and custom themes.
- **Presentation:** popup or inline calendar, month/year navigation, clear/today controls, popup positioning, and mobile bottom-sheet or popup presentation.
- **Accessibility:** keyboard navigation, associated input labels, active toggle states, selection/error announcements, and read-only browsing.
- **Date utilities:** injectable conversion service and an Angular-free `/core` entry point for conversion, formatting, parsing, validation, and arithmetic.

## Version and compatibility

**This README describes `2.0.0`, the current source release.** The latest published npm version in the registry snapshot is `1.1.4`, which has a different API. The examples below target 2.x. See the [migration guide](https://github.com/Khatri-Sanjay/ngx-nepali-dualpicker/blob/HEAD/docs/MIGRATION.md) when upgrading from 1.x.

| Dependency                                           | Declared peer range |
| ---------------------------------------------------- | ------------------- |
| `@angular/common`, `@angular/core`, `@angular/forms` | `>=17.0.0 <23.0.0`  |
| RxJS                                                 | `^6.5.3             |     | ^7.4.0` |

The library is compiled with Angular 17.3 using partial compilation. Use the Node.js and TypeScript versions required by your consuming Angular application. The declared peer range covers Angular 17–22; selected-version compatibility checks do not certify every application configuration.

## Installation

For the currently published release:

```sh
npm install ngx-nepali-dualpicker
```

That command currently installs 1.x. To use the 2.x API documented here before its npm publication, install a tarball built from the current source:

```sh
npm install /path/to/ngx-nepali-dualpicker-2.0.0.tgz
```

## Quick start

Import the standalone picker into your component. No global stylesheet import is required for the default picker styles.

```ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgxNepaliDualpicker } from 'ngx-nepali-dualpicker';
import type { DatePickerConfig } from 'ngx-nepali-dualpicker';

@Component({
    selector: 'app-date-example',
    standalone: true,
    imports: [ReactiveFormsModule, NgxNepaliDualpicker],
    template: `
        <label for="appointment-date">Appointment date</label>
        <ngx-nepali-dualpicker [formControl]="date" [config]="config" />
        <p>Selected BS date: {{ date.value }}</p>
    `,
})
export class DateExampleComponent {
    date = new FormControl<string | null>(null);
    config: DatePickerConfig = {
        id: 'appointment-date',
        calendar: 'BS',
        language: 'en',
        outputFormat: 'yyyy-MM-dd',
        showSecondaryDate: true,
    };
}
```

For NgModule applications, add `NgxNepaliDualpicker` to the module's `imports` alongside `ReactiveFormsModule` or `FormsModule`.

## Selection modes and values

All emitted date strings use `outputFormat` in the **active calendar**. Store the calendar alongside date-only values when your application supports switching calendars.

| Mode     | Configuration               | Model value                                  |
| -------- | --------------------------- | -------------------------------------------- |
| Single   | `selectionMode: 'single'`   | `'2081-01-15'` or `null`                     |
| Range    | `selectionMode: 'range'`    | `{ start: '2081-01-15', end: '2081-01-20' }` |
| Multiple | `selectionMode: 'multiple'` | `['2081-01-15', '2081-01-20']`               |

The exported union is:

```ts
import type { DatePickerValue } from 'ngx-nepali-dualpicker';
// string | string[] | { start: string | null; end: string | null } | null
```

A range emits `{ start, end: null }` after the first endpoint is selected. Multiple selections remove duplicates while preserving order.

```ts
const rangeConfig: DatePickerConfig = {
    calendar: 'BS',
    selectionMode: 'range',
    closeOnSelection: false,
    rangeConstraints: { minDays: 3, maxDays: 14 },
};

const multipleConfig: DatePickerConfig = {
    selectionMode: 'multiple',
    closeOnSelection: false,
    multipleSelection: { maxSelections: 5 },
};
```

Set `showSelectionModeToggle: true` to expose mode controls. Changing modes clears the previous selection; clicking the already active mode preserves it.

## Angular Forms and events

Use `[formControl]`, `formControlName`, or `[(ngModel)]`. Import the corresponding Angular forms module. Disable a reactive control with `control.disable()` and reset it with `control.reset()`.

```html
<!-- Inside a parent [formGroup] -->
<ngx-nepali-dualpicker formControlName="bookingDate" [config]="config" />

<!-- With FormsModule imported -->
<ngx-nepali-dualpicker [(ngModel)]="selectedDate" [config]="config" />

<!-- Without an Angular form -->
<ngx-nepali-dualpicker [config]="config" (dateSelected)="onDateSelected($event)" />
```

| Input         | Purpose                             |
| ------------- | ----------------------------------- |
| `config`      | `DatePickerConfig` overrides        |
| `placeholder` | Override the configured placeholder |
| `hasError`    | Apply an external error state       |

| Output                | Payload                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------ |
| `dateSelected`        | `DatePickerValue`                                                                          |
| `pickerOpened`        | `void`                                                                                     |
| `pickerClosed`        | `void`                                                                                     |
| `calendarTypeChanged` | `'AD'` or `'BS'`                                                                           |
| `parseError`          | `{ type: 'format' \| 'validation' \| 'range' \| 'limit', message: string, value: string }` |

The `formControl` binding is handled through Angular Forms. A component reference also exposes `open()`, `close()`, `clearSelection()`, `switchCalendarType(calendar)`, and `selectPreset(preset)`.

## Signal Forms

The existing `ControlValueAccessor` supports Angular's `[formField]` compatibility binding. Import `FormField` from `@angular/forms/signals` in your consumer and bind a field created with `form()`:

```html
<ngx-nepali-dualpicker [config]="config" [formField]="fields.date" />
```

Packed consumer tests cover Angular **21.2.25** and **22.2.4**, including model updates, single/range/multiple selection, calendar conversion, clearing, disabled state, touched/dirty state, and reset.

- **Angular 22.2.4:** picker validation is forwarded when `validation.enabled` is true, including invalid drafts and restricted values.
- **Angular 21.2.25:** values and control state work, but Angular's compatibility bridge does not forward the picker's legacy validators. Define equivalent Signal Forms schema rules or use reactive/template-driven forms for integrated picker validation.

Use one form binding per picker. Clearing emits `null`; range selection can emit a null endpoint, so allow these values in your model types. This is CVA interoperability; native `FormValueControl`, Signal Forms SSR, and hydration have not been verified. See [test scope and reproduction](https://github.com/Khatri-Sanjay/ngx-nepali-dualpicker/blob/HEAD/docs/SIGNAL-FORMS.md).

## Calendar conversion and dual dates

```ts
const config: DatePickerConfig = {
    calendar: 'BS',
    convertOnCalendarChange: true,
    showSecondaryDate: true,
};
```

`convertOnCalendarChange` enables calendar controls and converts selected dates when switching. `showSecondaryDate` displays the corresponding AD/BS date without changing the selected calendar or model. Secondary dates are omitted outside conversion coverage.

For conversion without a picker:

```ts
import { inject } from '@angular/core';
import { DateConversionService } from 'ngx-nepali-dualpicker';

// In a component, service, or another Angular injection context:
const conversion = inject(DateConversionService);
const bs = conversion.convertAdToBs('2024-01-15', true); // '2080-10-01'
const ad = conversion.convertBsToAd('2080-10-01', true); // '2024-01-15'
```

Omit `true` to receive `{ year, month, day }`. The service also provides current BS date/month/year, weekday lookup, supported-year checks, and BS month/year lengths.

## Date contracts and supported range

- Public date objects and callback/template dates use **one-based months, 1–12**.
- JavaScript `Date` values represent local Gregorian dates; their constructors use zero-based months.
- ISO restriction strings and date objects are interpreted in the active calendar. Selected model strings follow `outputFormat`.
- Dates are calendar dates, without time-of-day or timezone metadata.
- The bundled BS table covers **2000–2139**. Conversion is additionally bounded to **AD 1943-04-14 through 2082-12-31**; the available conversion range is the intersection of these limits.
- Future BS table entries have not been independently verified against an official calendar. Round-trip consistency does not establish historical or future calendar accuracy.

See [calendar accuracy and boundaries](https://github.com/Khatri-Sanjay/ngx-nepali-dualpicker/blob/HEAD/docs/CALENDAR-ACCURACY.md).

## Formatting, localization, and manual input

```ts
const config: DatePickerConfig = {
    calendar: 'BS',
    language: 'ne',
    allowTextInput: true,
    displayFormat: 'dd/MM/yyyy',
    outputFormat: 'yyyy-MM-dd',
    monthLabelFormat: 'full',
    weekdayLabelFormat: 'short',
    firstDayOfWeek: 1,
};
```

Editable display and output formats are `yyyy-MM-dd`, `yyyy/MM/dd`, `MM/dd/yyyy`, `dd/MM/yyyy`, and `dd-MM-yyyy`. They are also exported as `EDITABLE_DATE_FORMATS`.

The picker additionally accepts `MMM dd, yyyy` for **display only**. With that display format, choose dates through the calendar. Manual input uses `displayFormat`; form writes use `outputFormat`. Separate multiple dates with commas and range endpoints with `-`. Invalid drafts remain visible without replacing the last committed value.

For formatted text outside the picker, import `NepaliDatePipe` into the consuming component:

```html
{{ '2080-10-01' | nepaliDate: 'fullDate' : 'ne' : 'BS' }} {{ '2024-01-15' | nepaliDate: 'dd MMMM yyyy' : 'en' : 'AD' }}
```

The pipe supports `shortDate`, `mediumDate`, `longDate`, `fullDate`, and custom patterns including `EEEE` for full weekday names. It formats a date in the specified calendar; use conversion utilities when you need to convert between calendars.

## Restrictions and availability

```ts
const config: DatePickerConfig = {
    calendar: 'AD',
    minDate: '2026-01-01',
    maxDate: '2026-12-31',
    disabledDaysOfWeek: [0, 6], // Sunday and Saturday
    disabledDates: ['2026-12-25'],
    disablePastDates: true,
    dateFilter: (date, calendar) => calendar === 'AD' && date.day !== 15,
};
```

`minDate`, `maxDate`, and `disabledDates` accept JavaScript dates, ISO strings, or `{ year, month, day }` objects. `disableFutureDates` is also available. `bsYearRange` limits the BS year selector; use min/max dates to bound either calendar.

`dateFilter` is synchronous and receives a frozen date plus the active calendar. Return `true` to allow it. The filter combines with built-in restrictions and cannot re-enable an unavailable date. Fetch availability beforehand; keep callbacks deterministic and inexpensive. Replace the configuration/callback when availability changes so the computed calendar updates.

## Booking ranges and presets

```ts
const config: DatePickerConfig = {
    calendar: 'AD',
    selectionMode: 'range',
    rangeConstraints: {
        minDays: 3,
        maxDays: 14,
        preventCrossingUnavailableDates: true,
    },
    validation: { enabled: true, requireCompleteRange: true },
    presets: [{ label: 'Holiday break', value: { start: '2026-12-28', end: '2026-12-30' } }],
};
```

Range lengths count **inclusive days**: January 1–3 is three days, and a same-day range is one day. Limits must be positive integers with `minDays <= maxDays`. Crossing prevention checks every day, including endpoints, against the current availability rules.

A preset's `value` accepts a `DatePickerValue` or a synchronous resolver. Its context contains `calendar`, one-based `today`, `selectionMode`, and `outputFormat`. Return strings in that format and the current calendar. For example, a single-date preset can resolve today's value:

```ts
import { formatPickerDate } from 'ngx-nepali-dualpicker/core';

const config: DatePickerConfig = {
    selectionMode: 'single',
    presets: [{ label: 'Today', value: ({ today, outputFormat }) => formatPickerDate(today, outputFormat) }],
};
```

Presets respect restrictions, disabled/read-only state, forms, and selection events. Invalid presets retain the previous selection and report an error. Range presets must provide both endpoints.

## Custom date cells

Import `DateCellTemplateDirective` alongside the picker to render custom day content:

```ts
import { Component } from '@angular/core';
import { DateCellTemplateDirective, NgxNepaliDualpicker } from 'ngx-nepali-dualpicker';
import type { DatePickerConfig } from 'ngx-nepali-dualpicker';

@Component({
    selector: 'app-booking-calendar',
    standalone: true,
    imports: [NgxNepaliDualpicker, DateCellTemplateDirective],
    template: `
        <ngx-nepali-dualpicker [config]="config">
            <ng-template ndpDateCell let-date let-disabled="disabled" let-secondary="secondaryDate">
                <span>{{ date.day }}</span>
                <small>{{ disabled ? 'Unavailable' : 'Rs 500' }}</small>
                @if (secondary) {
                    <small>AD {{ secondary.month }}/{{ secondary.day }}</small>
                }
            </ng-template>
        </ngx-nepali-dualpicker>
    `,
})
export class BookingCalendarComponent {
    config: DatePickerConfig = { calendar: 'BS', inline: true };
}
```

The typed `DateCellContext` includes `$implicit`/`date`, `calendar`, `secondaryDate`, `secondaryCalendar`, `selected`, `disabled`, and `today`. The library retains the date button, accessible name, selection handlers, and keyboard behavior. Use one cell template per picker and keep its content non-interactive. Custom content replaces the default cell contents, including secondary labels.

## Validation and read-only state

Interaction restrictions always apply. Angular form validation is opt-in:

```ts
const config: DatePickerConfig = {
    calendar: 'AD',
    selectionMode: 'range',
    validation: { enabled: true, requireCompleteRange: true },
};
```

| Error key              | Meaning                                                              |
| ---------------------- | -------------------------------------------------------------------- |
| `nepaliDate`           | Invalid value shape, format, or calendar date                        |
| `nepaliDateInput`      | Invalid draft text in the component                                  |
| `nepaliDateRestricted` | A selected date is unavailable                                       |
| `nepaliDateRange`      | Incomplete/reversed range, invalid duration, or unavailable crossing |
| `nepaliDateLimit`      | Multiple-selection limit exceeded                                    |

Empty selections remain valid. Add `Validators.required` for required single dates; use an application validator for required range endpoints because an empty range object is still an object.

For validation independent of a picker:

```ts
import { FormControl } from '@angular/forms';
import { nepaliDateValidator } from 'ngx-nepali-dualpicker';

const date = new FormControl<string | null>(null, {
    validators: [nepaliDateValidator({ calendar: 'AD', minDate: '2026-01-01' })],
});
```

The validator factory also accepts a configuration getter. Call `updateValueAndValidity()` after changing its external rules.

Set `readOnly: true` to allow calendar browsing while blocking user editing, selection, clearing, and calendar/mode changes. This differs from disabling the Angular control; programmatic form writes and reset remain available.

## Themes and presentation

```ts
const config: DatePickerConfig = {
    theme: 'system',
    popupPosition: 'auto',
    mobilePresentation: 'bottom-sheet',
    customTheme: {
        colors: {
            primary: '#2563eb',
            selectedBackground: '#2563eb',
            selectedText: '#ffffff',
        },
    },
};
```

Presets are `light`, `dark`, `ocean`, `forest`, `purple`, and `rose`; `system` follows the browser's color preference. A complete `DatePickerTheme` can be supplied through `theme`, or overrides through `customTheme`. Theme sections cover colors, spacing, typography, border radii, shadows, transitions, and dimensions. Nested sections must satisfy their declared TypeScript shape.

Popup positions are `bottom-left`, `bottom-right`, `top-left`, `top-right`, and `auto`. The popup uses viewport positioning with native popover or compatibility overlay handling. Set `inline: true` for an always-visible calendar or `mobilePresentation: 'popup'` to retain a popup on small screens.

## Global defaults

```ts
import { ApplicationConfig } from '@angular/core';
import { provideNepaliDualpicker } from 'ngx-nepali-dualpicker';

export const appConfig: ApplicationConfig = {
    providers: [provideNepaliDualpicker({ calendar: 'BS', language: 'en', theme: 'light' })],
};
```

Each picker's `[config]` overrides the application defaults. `DATE_PICKER_CONFIG` and `DatePickerConfigService` are also exported for configuration integrations. Replace configuration objects when updating settings.

## Configuration reference

| Option                                   | Default                      | Purpose / accepted values                                                                             |
| ---------------------------------------- | ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| `calendar`                               | `'BS'`                       | `'BS'` or `'AD'`                                                                                      |
| `language`                               | `'en'`                       | `'en'` or `'ne'`                                                                                      |
| `selectionMode`                          | `'single'`                   | `'single'`, `'range'`, `'multiple'`                                                                   |
| `convertOnCalendarChange`                | `false`                      | Enable calendar switching with conversion                                                             |
| `showSecondaryDate`                      | `false`                      | Show corresponding dates in the other calendar                                                        |
| `allowTextInput`                         | `false`                      | Enable editing with a numeric display format                                                          |
| `readOnly`                               | `false`                      | Browse without user edits                                                                             |
| `displayFormat`                          | `'yyyy-MM-dd'`               | Numeric format or display-only `'MMM dd, yyyy'`                                                       |
| `outputFormat`                           | `'yyyy-MM-dd'`               | Numeric model format                                                                                  |
| `monthLabelFormat`                       | `'full'`                     | `'full'` or `'short'`                                                                                 |
| `weekdayLabelFormat`                     | `'narrow'`                   | `'narrow'` or `'short'`                                                                               |
| `firstDayOfWeek`                         | `0`                          | `0`–`6`, Sunday–Saturday                                                                              |
| `minDate`, `maxDate`                     | `null`                       | Inclusive date bounds                                                                                 |
| `disablePastDates`, `disableFutureDates` | `false`                      | Restrict dates relative to today                                                                      |
| `disabledDates`                          | `[]`                         | Unavailable dates                                                                                     |
| `disabledDaysOfWeek`                     | `[]`                         | Unavailable weekdays, `0`–`6`                                                                         |
| `dateFilter`                             | Allows all                   | Synchronous additional availability rule                                                              |
| `rangeConstraints`                       | `{}`                         | `minDays`, `maxDays`, `preventCrossingUnavailableDates`                                               |
| `multipleSelection`                      | No limit                     | Optional `maxSelections`                                                                              |
| `presets`                                | `[]`                         | Labelled static selections or resolvers                                                               |
| `showSelectionModeToggle`                | `false`                      | Display selection-mode controls                                                                       |
| `showClearButton`, `showTodayButton`     | `true`                       | Display utility buttons                                                                               |
| `closeOnSelection`                       | `true`                       | Close after completing selection                                                                      |
| `placeholder`                            | `'Select a date'`            | Input placeholder                                                                                     |
| `popupPosition`                          | `'bottom-left'`              | Popup placement                                                                                       |
| `mobilePresentation`                     | `'bottom-sheet'`             | `'bottom-sheet'` or `'popup'`                                                                         |
| `inline`                                 | `false`                      | Always-visible calendar                                                                               |
| `theme`                                  | `'light'`                    | Preset, `'system'`, or complete theme                                                                 |
| `customTheme`                            | `{}`                         | Theme overrides                                                                                       |
| `bsYearRange`                            | `{ start: 2000, end: 2139 }` | BS year-selector bounds                                                                               |
| `id`                                     | Generated                    | Explicit inner input ID for labels and SSR                                                            |
| `ariaLabels`                             | Localized defaults           | `input`, `keyboardHelp`, `calendar`, `nextMonth`, `previousMonth`, `selectDate`, `clearDate`, `today` |
| `validation`                             | Disabled                     | `enabled: false`, `requireCompleteRange: true`                                                        |

## Accessibility and keyboard use

Associate a native `<label>` with `config.id`, or supply `ariaLabels.input`. The popup is non-modal; inline mode uses group semantics. Month changes, selections, and errors are announced.

| Key                                      | Action                           |
| ---------------------------------------- | -------------------------------- |
| Down Arrow / Alt+Down Arrow on the input | Open the calendar                |
| Arrow keys in the calendar               | Move between dates               |
| Page Up / Page Down                      | Previous / next month            |
| Shift+Page Up / Shift+Page Down          | Previous / next year             |
| Home / End                               | Start / end of the week          |
| Ctrl/Meta+Home / End                     | Start / end of the year          |
| Enter / Space                            | Select the focused date          |
| Escape                                   | Close the calendar               |
| Tab                                      | Continue normal focus navigation |

Automated accessibility checks cover selected scenarios. Verify custom cells, themes, and your complete form with the browsers and assistive technology your users need.

## Angular-free utilities

Use the secondary entry point when you only need calendar operations:

```ts
import { convertAdToBs, convertBsToAd, formatPickerDate } from 'ngx-nepali-dualpicker/core';

const bs = convertAdToBs('2024-01-15');
const ad = convertBsToAd('2080-10-01', true);
const label = formatPickerDate({ year: 2080, month: 10, day: 1 }, 'dd/MM/yyyy');
```

`/core` also exports `DateCalculator`, `DateParser`, `DateValidator`, `getWeekday`, `formatDate`, `EDITABLE_DATE_FORMATS`, and calendar/date types. It does not require Angular runtime code. Conversion rejects invalid or unsupported dates; handle errors when accepting untrusted input.

## Server rendering

Browser APIs are guarded, and isolated consumers exercise Angular server rendering. Supply stable, unique input IDs for SSR layouts. Hydration, application timezone behavior, and system-theme rendering still need verification in your application; server-rendering smoke tests do not establish full hydration support.

## Support and license

Browse the [documentation](https://ngx-nepali-dualpicker-docs.vercel.app/) or try configurations in the [playground](https://ngx-nepali-dualpicker-playground.vercel.app/). Report bugs and feature requests through [GitHub Issues](https://github.com/Khatri-Sanjay/ngx-nepali-dualpicker/issues).

Licensed under the [MIT License](https://github.com/Khatri-Sanjay/ngx-nepali-dualpicker/blob/HEAD/LICENSE) — Sanjay Khatri.
