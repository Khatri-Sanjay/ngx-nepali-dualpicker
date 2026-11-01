# ngx-nepali-dualpicker

Version 2.0.0-next.0 is an implementation checkpoint, not a verified stable release. Currency APIs have been removed. Calendar-only utilities are available from `ngx-nepali-dualpicker/core`. See the repository migration and release-checkpoint documents.

Angular Nepali date picker for Bikram Sambat (BS) and Gregorian (AD) dates, with BS/AD conversion, reactive forms support, range and multiple selection, theming, and browser API guards.

[npm](https://www.npmjs.com/package/ngx-nepali-dualpicker) | [Demo](https://ngx-nepali-pickers.vercel.app/)

The repository includes interactive documentation covering installation, forms, selection modes, restrictions, conversion, localization, formatting, themes and the public API. Run `npm run start:docs` for documentation (port 4201), or `npm run start:playground` for the playground (port 4200); changes require deployment before they appear on the linked public site.

## Features

- Optional `showSecondaryDate` shows the corresponding AD/BS date in calendar cells.
- `dateFilter(date, calendar)` combines application availability rules with existing restrictions.
- `rangeConstraints` adds inclusive `minDays`/`maxDays` and `preventCrossingUnavailableDates`.
- Import `DateCellTemplateDirective` for typed `ng-template[ndpDateCell]` price, badge or event content.
- `presets` accepts labelled values or callbacks for month, fiscal-period or custom selections.

See the repository's `docs/BOOKING-FEATURES.md` and the documentation application's “Dual dates and booking” page for complete contracts and examples. These changes must be deployed before appearing on the public documentation site.

The inherited 1.1.4 implementation fixes rendering across the supported BS year range, bounds month and keyboard navigation, preserves manual input keys, and keeps form values synchronized when converting or clearing selections. Form strings are read using `outputFormat`; manual input uses `displayFormat`. Range selection emits `{ start, end: null }` after selecting its first endpoint.

The picker shares date formatting, parsing and arithmetic through the calendar core. BS arithmetic uses precomputed month offsets from the calendar table; repeated month rows belong to different years and must remain in that table. Multiple form writes and manual selections remove duplicate dates while preserving their order. The component keeps selection state and emits display/form updates through one path.

- Supports both BS and AD calendars.
- Converts dates between BS and AD through `DateConversionService`.
- Works with Angular standalone components and Reactive Forms.
- Selection modes: single, range, and multiple.
- English and Nepali display modes.
- Manual input support with configurable formats.
- Min/max dates, disabled dates, disabled weekdays, past/future restrictions.
- Built-in light, dark, ocean, forest, purple, and rose themes.
- Custom theme support through CSS variables.
- Browser API guards for server integration; SSR/hydration requires validation in your application.
- Popup positioning is fixed to the viewport, so the calendar is not clipped inside cards, modals, or containers with `overflow: hidden`.

## Compatibility

| Package              | Supported                                                       |
| -------------------- | --------------------------------------------------------------- |
| Angular              | `>=17.0.0 <23.0.0` (17, 18, 19, 20, 21, 22)                     |
| Node.js / TypeScript | Use the versions required by your application's Angular version |

The npm package is built with Angular 17.3 in production partial compilation mode. The peer range declares Angular 17–22 compatibility; isolated packed consumers have been exercised on selected Angular 17-22 versions, including the 17.0.0 floor. See the repository architecture report for exact versions and smoke-test scope. Future majors require validation. The development workspace uses Node 20 and TypeScript 5.4; consumers keep their own Angular toolchain.

Public conversion methods use **one-based months (1–12)**. The picker uses zero-based months internally. JavaScript `Date` inputs represent local Gregorian dates; ISO strings represent dates in the selected calendar. Conversion uses the bundled BS month table (2000–2139) and is additionally limited to AD 1943-04-14 through 2082-12-31. Future BS table entries have not been independently verified against an official calendar.

## Global defaults and NgModule usage

Provide optional defaults at application bootstrap:

```ts
import { provideNepaliDualpicker } from 'ngx-nepali-dualpicker';

export const appConfig = {
    providers: [provideNepaliDualpicker({ calendar: 'BS', language: 'en' })],
};
```

Component `[config]` overrides these defaults. In an NgModule application, add the standalone `NgxNepaliDualpicker` to the module's `imports`, alongside `ReactiveFormsModule` or `FormsModule`. Use `[formControl]`, `formControlName` or `[(ngModel)]` as normal Angular form bindings.

## Installation

```bash
npm install ngx-nepali-dualpicker
```

## Quick Start

```ts
import { Component } from '@angular/core';
import { NgxNepaliDualpicker, DatePickerConfig } from 'ngx-nepali-dualpicker';

@Component({
    selector: 'app-example',
    standalone: true,
    imports: [NgxNepaliDualpicker],
    template: `
        <ngx-nepali-dualpicker [config]="config" (dateSelected)="onDateSelected($event)"> </ngx-nepali-dualpicker>
    `,
})
export class ExampleComponent {
    config: DatePickerConfig = {
        calendar: 'BS',
        placeholder: 'Select date',
    };

    onDateSelected(value: string | string[] | { start: string | null; end: string | null } | null): void {
        console.log(value);
    }
}
```

## Reactive Forms

```ts
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgxNepaliDualpicker, DatePickerConfig } from 'ngx-nepali-dualpicker';

@Component({
    selector: 'app-form-example',
    standalone: true,
    imports: [ReactiveFormsModule, NgxNepaliDualpicker],
    template: ` <ngx-nepali-dualpicker [formControl]="dateControl" [config]="config"> </ngx-nepali-dualpicker> `,
})
export class FormExampleComponent {
    dateControl = new FormControl<string | null>(null);

    config: DatePickerConfig = {
        calendar: 'AD',
        outputFormat: 'yyyy-MM-dd',
    };
}
```

## Calendar Modes

```ts
const bsConfig: DatePickerConfig = {
    calendar: 'BS',
};

const adConfig: DatePickerConfig = {
    calendar: 'AD',
};

const autoConvertConfig: DatePickerConfig = {
    calendar: 'BS',
    convertOnCalendarChange: true,
};
```

## Selection Modes

```ts
const singleConfig: DatePickerConfig = {
    selectionMode: 'single',
};

const rangeConfig: DatePickerConfig = {
    selectionMode: 'range',
    closeOnSelection: false,
};

const multipleConfig: DatePickerConfig = {
    selectionMode: 'multiple',
    closeOnSelection: false,
    multipleSelection: {
        maxSelections: 5,
    },
};
```

## Manual Input

```ts
const config: DatePickerConfig = {
    allowTextInput: true,
    displayFormat: 'yyyy-MM-dd',
    outputFormat: 'yyyy-MM-dd',
};
```

Supported display/output formats:

- `yyyy-MM-dd`
- `yyyy/MM/dd`
- `MM/dd/yyyy`
- `dd/MM/yyyy`
- `dd-MM-yyyy`
- `MMM dd, yyyy` for display formatting

## Date Restrictions

Restriction dates can be JavaScript `Date` values, ISO strings, or date objects.

```ts
const config: DatePickerConfig = {
    minDate: { year: 2080, month: 1, day: 1 },
    maxDate: { year: 2082, month: 12, day: 30 },
    disablePastDates: false,
    disableFutureDates: false,
    disabledDaysOfWeek: [0, 6],
    disabledDates: [{ year: 2081, month: 10, day: 15 }, '2081-12-01', new Date()],
};
```

Date object months are 1-based:

```ts
{ year: 2081, month: 1, day: 15 }
```

JavaScript `Date` months are still 0-based because that is how JavaScript works:

```ts
new Date(2024, 0, 15); // January 15, 2024
```

## Popup Positioning

By default, the popup is positioned relative to the browser viewport with `position: fixed`. This prevents the calendar from being clipped when the picker is used inside cards, dialogs, tables, or containers that use `overflow: hidden`.

```ts
const config: DatePickerConfig = {
    popupPosition: 'bottom-left',
};
```

Supported positions:

- `bottom-left`
- `bottom-right`
- `top-left`
- `top-right`
- `auto`

For an always-visible calendar, use inline selectionMode:

```ts
const config: DatePickerConfig = {
    inline: true,
};
```

## SSR Support

Browser-only paths use guards for APIs such as `window`, `document`, `ResizeObserver`, `CustomEvent`, and `matchMedia`. Isolated consumers exercise the real Angular server renderer with reactive and template-driven forms without a browser window global. These smoke checks do not verify hydration or production AOT server builds. Validate your target server renderer, timezone and system-theme behavior before relying on SSR integration.

In an SSR app, install and import the package normally:

```ts
import { NgxNepaliDualpicker } from 'ngx-nepali-dualpicker';
```

If you previously used an older build and still see `window is not defined`, rebuild/reinstall the package and clear the consuming app cache:

```bash
npx ng cache clean
```

## Theming

Use a preset theme:

```ts
const config: DatePickerConfig = {
    theme: 'dark',
};
```

Available presets:

- `light`
- `dark`
- `ocean`
- `forest`
- `purple`
- `rose`
- `system`

Use a custom theme:

```ts
const config: DatePickerConfig = {
    theme: 'light',
    customTheme: {
        colors: {
            primary: '#2563eb',
            selectedBackground: '#2563eb',
            selectedText: '#ffffff',
            background: '#ffffff',
            surface: '#f8fafc',
            border: '#dbe3ef',
            text: '#0f172a',
        },
        dimensions: {
            containerWidth: '340px',
            dateSize: '38px',
            containerMaxHeight: '280px',
            iconSize: '16px',
        },
    },
};
```

## Global Configuration

```ts
import { ApplicationConfig } from '@angular/core';
import { DATE_PICKER_CONFIG } from 'ngx-nepali-dualpicker';

export const appConfig: ApplicationConfig = {
    providers: [
        {
            provide: DATE_PICKER_CONFIG,
            useValue: {
                calendar: 'BS',
                language: 'en',
                theme: 'light',
                outputFormat: 'yyyy-MM-dd',
            },
        },
    ],
};
```

Component-level config overrides global config:

```html
<ngx-nepali-dualpicker [config]="{ theme: 'purple', selectionMode: 'range' }"></ngx-nepali-dualpicker>
```

## Date Conversion Service

```ts
import { inject } from '@angular/core';
import { DateConversionService } from 'ngx-nepali-dualpicker';

export class ExampleComponent {
    private dateConversion = inject(DateConversionService);

    bsDate = this.dateConversion.convertAdToBs('2024-01-15');
    adDate = this.dateConversion.convertBsToAd('2080-10-01');
}
```

Return formatted strings by passing `true`:

```ts
const bs = this.dateConversion.convertAdToBs('2024-01-15', true);
const ad = this.dateConversion.convertBsToAd('2080-10-01', true);
```

## Pipes

```ts
import { NepaliDatePipe } from 'ngx-nepali-dualpicker';

@Component({
    standalone: true,
    imports: [NepaliDatePipe],
    template: ` {{ '2024-01-15' | nepaliDate: 'mediumDate' : 'en' : 'AD' }} `,
})
export class PipesExampleComponent {}
```

## Public API

```ts
import {
    NgxNepaliDualpicker,
    DateConversionService,
    DatePickerConfigService,
    ThemeService,
    DATE_PICKER_CONFIG,
    DEFAULT_PICKER_CONFIG,
    PRESET_THEMES,
    NepaliDatePipe,
    Calendar,
} from 'ngx-nepali-dualpicker';

import type { DatePickerConfig, DatePickerTheme, PresetThemeName, CalendarSystem } from 'ngx-nepali-dualpicker';
```

## Configuration Reference

| Option                            | Type                                | Default                      |
| --------------------------------- | ----------------------------------- | ---------------------------- |
| `language`                        | `'en' \| 'ne'`                      | `'en'`                       |
| `calendar`                        | `'BS' \| 'AD'`                      | `'BS'`                       |
| `convertOnCalendarChange`         | `boolean`                           | `false`                      |
| `allowTextInput`                  | `boolean`                           | `false`                      |
| `displayFormat`                   | date format                         | `'yyyy-MM-dd'`               |
| `outputFormat`                    | date format                         | `'yyyy-MM-dd'`               |
| `monthLabelFormat`                | `'full' \| 'short'`                 | `'full'`                     |
| `weekdayLabelFormat`              | `'short' \| 'narrow'`               | `'narrow'`                   |
| `selectionMode`                   | `'single' \| 'range' \| 'multiple'` | `'single'`                   |
| `showSelectionModeToggle`         | `boolean`                           | `false`                      |
| `minDate`                         | `Date \| string \| DateObj \| null` | `null`                       |
| `maxDate`                         | `Date \| string \| DateObj \| null` | `null`                       |
| `disableFutureDates`              | `boolean`                           | `false`                      |
| `disablePastDates`                | `boolean`                           | `false`                      |
| `disabledDates`                   | `Array<Date \| string \| DateObj>`  | `[]`                         |
| `disabledDaysOfWeek`              | `number[]`                          | `[]`                         |
| `showClearButton`                 | `boolean`                           | `true`                       |
| `showTodayButton`                 | `boolean`                           | `true`                       |
| `closeOnSelection`                | `boolean`                           | `true`                       |
| `placeholder`                     | `string`                            | `'Select a date'`            |
| `popupPosition`                   | popup position                      | `'bottom-left'`              |
| `theme`                           | preset, custom theme, or `'system'` | `'light'`                    |
| `customTheme`                     | `Partial<DatePickerTheme>`          | `{}`                         |
| `bsYearRange`                     | `{ start: number; end: number }`    | `{ start: 2000, end: 2139 }` |
| `mobilePresentation`              | `'bottom-sheet' \| 'popup'`         | `'bottom-sheet'`             |
| `firstDayOfWeek`                  | `0 \| 1 \| 2 \| 3 \| 4 \| 5 \| 6`   | `0`                          |
| `inline`                          | `boolean`                           | `false`                      |
| `multipleSelection.maxSelections` | `number \| undefined`               | `undefined`                  |

## Development

Build the library:

```bash
npx ng build ngx-nepali-dualpicker
```

Run tests:

```bash
npx ng test ngx-nepali-dualpicker --watch=false --browsers=ChromeHeadless
```

Build the demo app:

```bash
npx ng build playground
```

## License

MIT

Named-month display (`MMM dd, yyyy`) is display-only: use a numeric display format when `allowTextInput` is enabled. Date constraints and parse errors do not register Angular form validators automatically; validate completed ranges in the consuming form.

## Accessible forms and readonly mode

Set `readOnly: true` to permit viewing/browsing while blocking user editing, selection, clearing and calendar/mode changes. Form writes and reset remain supported. This is separate from disabling an Angular form control.

Enable `validation: { enabled: true, requireCompleteRange: true }` to opt into Angular form validation, including invalid drafts, unavailable dates, incomplete ranges and multiple limits. Defaults preserve existing validation behavior. Use the exported `nepaliDateValidator(config)` factory for independent controls, and `EDITABLE_DATE_FORMATS` for the supported numeric input patterns. Empty ranges need an application required-range rule if required.

Set a unique `id` and associate a native label with that inner input ID, or provide `ariaLabels.input`. The popup is non-modal; inline mode uses group semantics. Full dates, month changes, selections and errors have accessible announcements. `EEEE` produces full weekday names. Named-month display remains non-editable; invalid manual drafts stay visible without replacing the last valid model.

The repository guide `docs/ACCESSIBILITY-AND-FORMS.md` contains examples, keyboard behavior, validation error keys and the pending manual NVDA/VoiceOver checklist. Automated axe checks do not certify real screen-reader behavior.
