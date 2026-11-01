# Dual dates and booking customization

All five features are optional. Existing selections, calendar conversion data, selectors and default rendering remain unchanged. Public callback/template dates use **one-based months**; selected strings still use `outputFormat` in the active calendar.

## Dual-date display

```ts
const config: DatePickerConfig = {
    calendar: 'BS',
    showSecondaryDate: true,
};
```

BS cells show their corresponding AD month/day; AD cells show BS month/day. Full accessible labels include both dates and calendar names. Changing this option does not convert the form value. Conversion is omitted outside the shared supported AD/BS range; the main date remains usable. Labels follow the configured English/Nepali language. A custom cell template replaces the default contents, including the secondary label; use its secondaryDate context to render your own.

## Custom availability filters

```ts
const config: DatePickerConfig = {
    calendar: 'AD',
    disabledDaysOfWeek: [0, 6], // Built-in business-week rule
    dateFilter: (date, calendar) => {
        // Example booking rule; use calendar-specific availability in your application.
        return calendar === 'AD' && date.day !== 15;
    },
};
```

`DateFilter` is `(date: Readonly<DateObj>, calendar: 'AD' | 'BS') => boolean`. Return true to allow a date. It combines with min/max, past/future, disabled dates and weekday rules; it cannot re-enable a restricted date. The date argument is a frozen copy. A thrown callback rejects the date. Rules must be synchronous, deterministic and inexpensive: fetch availability in your application before providing a callback, never perform network requests inside it. The callback receives the current calendar, including after calendar switching.

Replace the configuration (and usually the callback) when availability changes; mutating a captured Set alone does not invalidate the computed grid. As with existing restrictions, configuration reconciliation can clear disallowed selections or leave a valid partial range. Standalone validators preserve the raw form value and require `updateValueAndValidity()` after external changes.

## Range constraints

```ts
const config: DatePickerConfig = {
    selectionMode: 'range',
    rangeConstraints: {
        minDays: 3,
        maxDays: 14,
        preventCrossingUnavailableDates: true,
    },
    validation: { enabled: true },
};
```

Duration counts **inclusive calendar days**, not milliseconds or nights. Jan 1–Jan 3 is 3 days; same-day start/end is 1. BS duration uses the real month-length table. There is no time-zone or DST duration calculation. For hotel nights, translate your policy to inclusive days in your application.

`minDays`/`maxDays` must be positive integers, with min ≤ max. Omitted limits are unrestricted. Invalid limits reject complete ranges with reason `configuration`. Partial starts remain allowed while the user is selecting; the existing requireCompleteRange validator controls form validity. Unavailable crossing prevention defaults to false. When enabled it checks **every day, including endpoints**, using all restrictions and dateFilter. It can be linear in the selected duration, so keep callbacks cheap.

Rejected end clicks preserve the start and report a range error; another valid end clears the error. Invalid typed ranges preserve the previous committed value. Complete programmatic ranges are normalized through the same selection policy; an unavailable/invalid complete range can become a valid partial start, consistent with existing restriction normalization. Angular validators inspect the original model without rewriting it.

`nepaliDateValidator()` and component validation report `nepaliDateRange` with reasons `minDays`, `maxDays`, `unavailable` or `configuration`; duration errors also include actual and min/max. Existing `incomplete`/`order` errors remain. Endpoint restrictions still report `nepaliDateRestricted`. Use component validation to make rejected draft input invalidate its form control; interaction restrictions apply even when optional Angular validation is disabled.

## Date-cell templates

```ts
import { Component } from '@angular/core';
import { NgxNepaliDualpicker, DateCellTemplateDirective } from 'ngx-nepali-dualpicker';
import type { DatePickerConfig } from 'ngx-nepali-dualpicker';

@Component({
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
export class BookingCalendar {
    config: DatePickerConfig = { calendar: 'BS', inline: true };
}
```

Import the standalone directive wherever its template is declared. Use at most one ndpDateCell template per picker. The context is typed as DateCellContext:

| Context             | Meaning                                                        |
| ------------------- | -------------------------------------------------------------- |
| `$implicit`, `date` | Frozen date with one-based month in the active calendar        |
| `calendar`          | AD or BS                                                       |
| `secondaryDate`     | Frozen corresponding date, or null outside conversion coverage |
| `secondaryCalendar` | Other calendar name                                            |
| `selected`, `today` | Current cell state                                             |
| `disabled`          | Date unavailable, picker disabled, or picker readonly          |

The library retains the button, full-date accessible name, selection handlers, focus behavior and unavailable state. Custom text is linked as its accessible description. Keep date text plus useful price/event/availability descriptions; decorative markers can use aria-hidden. Do not nest buttons, links, inputs or other interactive controls inside the date button. Use CSS to size cells for your content and verify contrast, zoom and screen-reader announcements. This API customizes content, not arbitrary controls or global styles.

## Quick-selection presets

```ts
import type { DatePickerConfig, DatePresetContext, DatePickerValue } from 'ngx-nepali-dualpicker';
import { DateCalculator, formatPickerDate } from 'ngx-nepali-dualpicker/core';

function monthValue(context: DatePresetContext, offset: number): DatePickerValue {
    const ordinal = context.today.year * 12 + context.today.month - 1 + offset;
    const year = Math.floor(ordinal / 12);
    const month = (((ordinal % 12) + 12) % 12) + 1;
    const day =
        context.calendar === 'BS'
            ? DateCalculator.getDaysInBsMonth(year, month)
            : DateCalculator.getDaysInAdMonth(year, month);
    return {
        start: formatPickerDate({ year, month, day: 1 }, context.outputFormat),
        end: formatPickerDate({ year, month, day }, context.outputFormat),
    };
}

const config: DatePickerConfig = {
    calendar: 'BS',
    selectionMode: 'range',
    presets: [
        { label: 'This month', value: (context) => monthValue(context, 0) },
        { label: 'Last month', value: (context) => monthValue(context, -1) },
        { label: 'Fiscal period', value: { start: '2082-04-01', end: '2083-03-31' } },
    ],
};
```

`DateSelectionPreset` has a label and value: a DatePickerValue or synchronous resolver returning one. Context includes calendar, one-based frozen today, mode and outputFormat. Resolvers run on activation, not during rendering; today is read from the local system date when the preset is activated. Return a date string for single mode, string array for multiple, or `{start,end}` strings for range; use the current outputFormat. Static fiscal-period strings are calendar-specific; resolve them by context if calendar switching is allowed.

Presets use existing Angular forms/events, mark the control touched, update the visible period and respect closeOnSelection. Range presets must be complete. Invalid shape, unavailable dates, excess multiple values, range violations or resolver exceptions report an error and retain the old selection; they are not silently truncated. Empty selections can clear a value. Presets cannot bypass readonly/disabled state. `picker.selectPreset(preset)` applies the same rules programmatically.

The playground contains a dual-calendar booking example with availability, range rules, optional custom price cells, and month presets. Automated browser tests cover these features and axe checks; actual screen-reader testing remains part of the [manual accessibility checklist](ACCESSIBILITY-AND-FORMS.md).
