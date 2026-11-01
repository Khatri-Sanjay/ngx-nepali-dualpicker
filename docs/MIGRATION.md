# Migration from 1.1.4 to 2.0.0

This release begins a new major version. Do not publish it as a 1.x patch.

## Removed APIs

CurrencyFormatterPipe, currency formatting, currency-to-words logic and their tables were removed. Remove the pipe from standalone imports and templates; use a separate package where needed. No shim is provided. Date numeral conversion remains internally available.

## Configuration

Configuration names have been standardized for this major version. Replace the old keys directly; there are no aliases, fallback keys or deprecated exports for these names.

| Previous name                              | Canonical name                                                      |
| ------------------------------------------ | ------------------------------------------------------------------- |
| `calendarType`                             | `calendar`                                                          |
| `mode`                                     | `selectionMode`                                                     |
| `readonly`                                 | `readOnly`                                                          |
| `allowManualInput`                         | `allowTextInput`                                                    |
| `dualDateDisplay`                          | `showSecondaryDate`                                                 |
| `autoConvert`                              | `convertOnCalendarChange`                                           |
| `monthDisplayType`                         | `monthLabelFormat` (`default` → `full`; `short` unchanged)          |
| `dayDisplayType`                           | `weekdayLabelFormat` (`default` → `short`; `short` → `narrow`)      |
| `allowModeToggle`                          | `showSelectionModeToggle`                                           |
| `closeOnSelect`                            | `closeOnSelection`                                                  |
| `position`                                 | `popupPosition`                                                     |
| `multipleSelectionSettings`                | `multipleSelection`                                                 |
| `mobileMode`                               | `mobilePresentation` (`compact` → `bottom-sheet`; `full` → `popup`) |
| `yearRange`                                | `bsYearRange` (the existing BS-only behavior is unchanged)          |
| `rangeConstraints.preventUnavailableDates` | `rangeConstraints.preventCrossingUnavailableDates`                  |
| `ariaLabels.prevMonth`                     | `ariaLabels.previousMonth`                                          |
| `colors.selectedBg`                        | `colors.selectedBackground`                                         |
| `colors.hoverBg`                           | `colors.hoverBackground`                                            |
| `colors.rangeBg`                           | `colors.rangeBackground`                                            |
| `colors.rangeHoverBg`                      | `colors.rangeHoverBackground`                                       |

Theme CSS properties follow the same change: for example, `--ndp-color-selected-bg` becomes `--ndp-color-selected-background`. The old CSS properties are not emitted or read.

Use the `CalendarSystem` type from either public entry point instead of the removed `CalendarType` alias. The enum member is `Calendar.BS`; `Calendar.BD` has been removed. `DatePresetContext.mode` becomes `DatePresetContext.selectionMode`. The previous-month component method is now `previousMonth()` instead of `prevMonth()`.

```ts
const config: DatePickerConfig = {
    calendar: 'BS',
    selectionMode: 'range',
    showSecondaryDate: true,
    allowTextInput: true,
    readOnly: false,
    popupPosition: 'auto',
    mobilePresentation: 'bottom-sheet',
    rangeConstraints: { minDays: 3, maxDays: 32, preventCrossingUnavailableDates: true },
};
```

Reads from getGlobalConfig now return independent snapshots. Use the existing service method instead of mutating a returned object:

```ts
configService.updateGlobalConfig({ language: 'ne' });
```

Picker computed configuration tracks these updates. Runtime mode/calendar and restriction changes are reconciled. Mode changes clear the previous selection; calendar changes follow convertOnCalendarChange. Regression tests cover these transitions.

## External form values

writeValue never emits a form change callback. Multiple writes filter restricted dates, remove duplicates in first-occurrence order and truncate to maxSelections. Range writes order reversed endpoints, reject orphan ends and retain a valid start when the end is restricted. Malformed values follow the existing clear/warning behavior.

Serialized form values and outputFormat remain unchanged. Service and configuration objects use one-based months. Existing component state retains zero-based months pending a separate migration.

## Lightweight conversion

```ts
import { convertAdToBs } from 'ngx-nepali-dualpicker/core';

const bs = convertAdToBs('2024-01-15');
```

DateConversionService and the component selector remain supported. Unsupported internal deep-import paths changed during the refactor.

## Invalid arithmetic inputs

`DateCalculator.getDaysInAdMonth` now throws for a non-integer year or a month outside integers 1?12. Previously invalid month indexes returned `undefined` despite the declared numeric return type. Validate input or catch the error at application boundaries. Valid Gregorian month lengths and all conversion results remain unchanged. This is an invalid-input bug correction within the 2.0.0 release.

## Accessibility and date-entry enhancements

New config fields: readOnly (false), id (automatic when empty), and validation ({ enabled: false, requireCompleteRange: true }). New root exports: nepaliDateValidator and EDITABLE_DATE_FORMATS; /core also exports EDITABLE_DATE_FORMATS. Existing value shapes remain unchanged.

EEEE now returns full weekday names. Invalid manual drafts remain visible instead of reverting silently, while the last valid model is preserved. Named-month display explicitly disables text editing. Mixed separators and malformed date-pipe timestamp suffixes are rejected. Input focus alone no longer opens the popup; click a non-editable field, activate the calendar button, or use Down/Alt+Down. Home/End now navigate week boundaries. Preset contrast colors were adjusted. See ACCESSIBILITY-AND-FORMS.md for opt-in validation and the readonly contract.
