# Accessible date entry, validation and readonly mode

The picker uses a non-modal combobox/dialog pattern: the calendar does not trap focus or claim that the rest of the page is inert. Tab can leave it, and leaving the picker closes the popup. An inline calendar is a labelled group rather than a popup dialog. These choices adapt the relationships and keyboard guidance from the [W3C datepicker combobox example](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-datepicker/) without falsely labelling this implementation as modal.

## Label the actual input

```ts
config: DatePickerConfig = {
    id: 'appointment-date',
    calendar: 'AD',
    allowTextInput: true,
    validation: { enabled: true },
};
```

```html
<label for="appointment-date">Appointment date</label> <ngx-nepali-dualpicker [config]="config" [formControl]="date" />
```

Alternatively, set `ariaLabels.input`. An explicit accessible input label overrides an associated native label; keep their wording consistent. Do not rely on `aria-label` placed only on the custom-element host to label its inner text field.

Each input owns derived calendar, heading, help and error IDs. Automatic IDs use an application-scoped counter rather than a process-global counter. Supply an explicit unique ID for asynchronously rendered SSR/hydration layouts. Do not share the same ID through global defaults or repeat it across pickers.

The input references its format/keyboard help and any current error. Calendar cells use full localized weekday/month/day/year labels including the active calendar system. Full weekday names also label compact weekday headers. Month changes and committed selections have polite announcements; errors have alert semantics. English and Nepali format/navigation hints are available; `ariaLabels.keyboardHelp` can replace the keyboard explanation.

## Keyboard behavior

| Context                 | Key                          | Result                                                                              |
| ----------------------- | ---------------------------- | ----------------------------------------------------------------------------------- |
| Date input              | Down Arrow or Alt+Down Arrow | Open and focus selected date, or an available date within configured bounds         |
| Date input              | Enter when editable          | Commit valid text; retain invalid text and report an error                          |
| Non-editable date input | Enter or Space               | Open calendar                                                                       |
| Grid                    | Arrow keys                   | Move one day or one week                                                            |
| Grid                    | Home / End                   | Move to the beginning/end of the week, using firstDayOfWeek                         |
| Grid                    | Page Up / Page Down          | Move one month; Shift changes a year                                                |
| Grid                    | Enter / Space                | Select if available and not readonly                                                |
| Picker popup            | Escape                       | Close and restore focus to the opening input/button                                 |
| Picker popup            | Tab / Shift+Tab              | Follow normal focus order; leaving the picker closes it without stealing focus back |

The retained Ctrl/Meta Home/End shortcuts move to year boundaries. Restricted dates remain focusable in the grid so their unavailability can be announced, but cannot be selected. Disabled controls block navigation; readonly controls permit browsing.

The month/year button reports its expanded state and opens compact Month and Year views. Arrow keys move within the active period grid, Home/End move to its first/last option, and each grid has one tab stop. Choosing a year returns to the month view; choosing a month returns focus to the month/year button. Escape closes the period panel and restores that same focus. Today has a visible localized label and returns to the day calendar before applying the existing date selection rules.

## Optional Angular validation

```ts
const config: DatePickerConfig = {
    calendar: 'AD',
    selectionMode: 'range',
    allowTextInput: true,
    validation: { enabled: true, requireCompleteRange: true },
};
```

Validation defaults to disabled for compatibility. When enabled, the component supplies `NG_VALIDATORS`, including invalid draft text that has not replaced the model. It revalidates when configuration changes. Forms and ngModel use the same integration.

| Error key              | Meaning                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------- |
| `nepaliDate`           | Invalid value shape, output format or calendar date                                           |
| `nepaliDateInput`      | Invalid manual input retained in the field; last committed model is unchanged                 |
| `nepaliDateRestricted` | A selected date/endpoint violates min/max, weekday, explicit-date or past/future restrictions |
| `nepaliDateRange`      | Incomplete or reversed range; reason identifies the problem                                   |
| `nepaliDateLimit`      | Multiple selection exceeds maxSelections                                                      |

For controls used without a picker, use the optional factory:

```ts
import { FormControl, Validators } from '@angular/forms';
import { nepaliDateValidator } from 'ngx-nepali-dualpicker';

const date = new FormControl<string | null>(null, {
    validators: [Validators.required, nepaliDateValidator({ calendar: 'AD' })],
});
```

A config getter supports dynamic rules; call `control.updateValueAndValidity()` after those rules change. The standalone factory sees the model, not the picker's draft text. Enable component validation when invalid manual drafts must invalidate the form.

Empty values remain optional. `Validators.required` handles null/empty single values and empty arrays. An empty range object `{ start: null, end: null }` is truthy, so requiring a range needs an application validator checking its endpoints. `requireCompleteRange: false` permits a valid partial start, but never an orphan end. Range validation checks endpoint restrictions. Optional `rangeConstraints` adds inclusive duration limits and interior availability checks; see [booking features](BOOKING-FEATURES.md). Validation never rewrites a control value.

## Parsing and formatting contract

`EDITABLE_DATE_FORMATS` is exported from the root and `/core` entry points:

```text
yyyy-MM-dd
yyyy/MM/dd
MM/dd/yyyy
dd/MM/yyyy
dd-MM-yyyy
```

Manual entry uses displayFormat. Form writes and validation use outputFormat. Numeric Nepali digits normalize to English numeric fields; outputs retain the established date-only string contract. Multiple entries use commas; range endpoints use `-` with spaces. Malformed empty segments are rejected rather than silently removed. Manual outer whitespace is trimmed.

`MMM dd, yyyy` remains a display-only pattern. Requesting it together with allowTextInput makes the text field non-editable and explains why; the calendar can still select dates unless the whole picker is readonly.

Invalid drafts remain visible, announce an error, and leave the previous valid model unchanged. Correct the draft, choose an available date, clear the selection, reset the form or write a new value to recover. Restoring the previous valid text clears the error without an unnecessary model emission. Configuration changes reset drafts to the committed selection. No input-error console logging is used.

The date pipe formats calendar fields; it does not perform conversion. `EEEE` now returns full weekday names; `EEE`/`E` retain compact labels. Invalid input returns an empty string. Mixed numeric separators and malformed timestamp suffixes are rejected. Use date-only ISO strings or one-based objects for BS fields; JavaScript Date inputs are read as local Gregorian fields and must not be mistaken for BS conversion.

## Readonly versus disabled

| Behavior                                  | Readonly configuration            | Disabled Angular control                |
| ----------------------------------------- | --------------------------------- | --------------------------------------- |
| Focus/copy input                          | Yes                               | No                                      |
| Open/browse calendar                      | Yes                               | No                                      |
| Type, select, clear, switch calendar/mode | No                                | No                                      |
| Parent form writes/reset                  | Yes                               | Yes                                     |
| Imperative setDate                        | Supported as an application write | Existing programmatic behavior retained |
| Angular validation participation          | Normal                            | Angular excludes disabled controls      |

`readOnly: false` is the default. Changing readonly does not disable the FormControl. Input-only non-editability caused by allowTextInput=false or a display-only format does not make the whole calendar readonly.

## Automated checks and manual screen-reader verification

The browser suite uses axe-core with WCAG 2 A/AA and WCAG 2.1 AA tags without disabling color-contrast checks. It covers popup editable/readonly states, all seven presets with selected dates and action buttons, and inline range errors. Selected/action text and error colors were adjusted after a real contrast failure. Custom themes still require their own contrast audit.

Automated DOM checks are not a screen reader. Actual NVDA/VoiceOver sessions were not executed in this environment. Record browser, reader version, OS and result for the following manual release checks:

| Check                            | Expected result                                                         | NVDA + Firefox/Chrome | VoiceOver + Safari |
| -------------------------------- | ----------------------------------------------------------------------- | --------------------- | ------------------ |
| Enter field                      | Input label, format and keyboard instructions are understandable        | Not run               | Not run            |
| Open calendar                    | Dialog name, full focused date and calendar system announced            | Not run               | Not run            |
| Move week/month/year             | Correct date and changed month announced without excessive repetition   | Not run               | Not run            |
| Restricted day                   | Unavailable state announced; activation changes nothing                 | Not run               | Not run            |
| Range start/end                  | Start/completed range and any validation feedback understandable        | Not run               | Not run            |
| Invalid draft and recovery       | Error announced once; correction removes stale invalid state            | Not run               | Not run            |
| Readonly browsing                | Readonly state explained; no selection/mode/calendar mutation           | Not run               | Not run            |
| Escape and Tab exit              | Focus returns only on explicit dismissal; Tab exit does not steal focus | Not run               | Not run            |
| Nepali language                  | Full Nepali labels/numerals and navigation hints pronounced acceptably  | Not run               | Not run            |
| Forced-colors/zoom/mobile reader | Focus remains visible; navigation and announcements usable              | Not run               | Not run            |

No manual screen-reader certification, complete WCAG conformance, hydration guarantee or production AOT SSR certification is implied by the automated results.
