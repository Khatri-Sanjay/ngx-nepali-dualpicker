# Current API checkpoint

This document retains the detailed 1.x contracts that remain implemented. The migration guide and current generated demo API take precedence for changed behavior.

## Inherited public contracts

Contract source: current `libs/ngx-nepali-dualpicker/src/public-api.ts`, implementation and generated declarations in `dist/ngx-nepali-dualpicker`. This documents existing behavior, including compatibility-sensitive irregularities; it is not a promise that every edge case works correctly. See [ARCHITECTURE.md](ARCHITECTURE.md).

## Package entry points and named exports

Root import: `ngx-nepali-dualpicker`. Generated exports also expose `ngx-nepali-dualpicker/package.json`. The core entry point is `ngx-nepali-dualpicker/core`. Internal deep imports are unsupported.

Runtime exports: `NgxNepaliDualpicker`, `provideNepaliDualpicker`, `DateConversionService`, `DatePickerConfigService`, `ThemeService`, `DATE_PICKER_CONFIG`, `DEFAULT_PICKER_CONFIG`, `PRESET_THEMES`, `NepaliDatePipe`, `Calendar`.

Named type exports: `DatePickerConfig`, `DatePickerTheme`, `PresetThemeName`, `CalendarSystem`, `DateObj`, `DateInput`, `DatePickerValue`.

No root-exported directives, NgModules or date arithmetic utility functions exist. The core entry point exports conversion, calculation, parsing, validation, formatting and date types. Internal modules use direct imports.

## Date and calendar contracts

```ts
interface DateObj {
    year: number;
    month: number;
    day: number;
    weekDay?: number;
}
type DateInput = string | Date | DateObj;
type CalendarSystem = 'AD' | 'BS';
type DatePickerValue = string | string[] | { start: string | null; end: string | null } | null;
enum Calendar {
    AD = 'AD',
    BD = 'BS', // existing spelling is public API
}
```

Public conversion/configuration/setDate objects use months **1–12**. Public component state signals/fields and selectMonth use months **0–11**. They share DateObj today; preserve these conventions through adapters until an explicitly documented migration.

Strings are calendar date fields, not UTC timestamps. Conversion inputs use ISO `YYYY-MM-DD`; form values follow configured outputFormat. JavaScript Date adapters read **local Gregorian** fields. DateObj has no calendar tag. Optional weekDay is not guaranteed to be present in conversion results.

BS table: 2000–2139. AD validation/display: 1943–2082. Convertible AD interval: 1943-04-14 through 2082-12-31, subject to corresponding BS table coverage. Valid BS dates beyond the AD limit remain displayable but cannot be converted through the service. Calendar data provenance/accuracy is not certified by this contract.

## Component

`NgxNepaliDualpicker` is standalone, OnPush, selector **`ngx-nepali-dualpicker`**. Import directly in standalone `imports`, or in NgModule `imports` with the relevant forms module. There is no `NepaliDualPickerModule`.

### Inputs

| Template input | Setter member / read accessor    | Accepted value                                                       |
| -------------- | -------------------------------- | -------------------------------------------------------------------- |
| config         | configInput / config()           | DatePickerConfig, null or undefined; nullish becomes empty overrides |
| formControl    | formControlInput / formControl() | FormControl or undefined; raw generic today                          |
| placeholder    | placeholderInput / placeholder() | string or undefined                                                  |
| hasError       | hasErrorInput / hasError()       | boolean                                                              |

Input property aliases must remain intact. Read accessors are Signals rather than assignable ordinary input properties. There is no value/valueChange pair, no disabled input and no range-specific component; forms/config govern those behaviors.

### Outputs

| Name                | Payload                                                                                    | Current meaning                                                          |
| ------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| dateSelected        | DatePickerValue                                                                            | Formatted selection; also clearing and user changes/calendar conversions |
| pickerOpened        | void                                                                                       | open() notification; repeated calls can currently repeat it              |
| pickerClosed        | void                                                                                       | close() notification; may also occur when disabling                      |
| calendarTypeChanged | CalendarSystem                                                                             | New calendar type after switching                                        |
| parseError          | `{ type: 'format' \| 'validation' \| 'range' \| 'limit'; message: string; value: string }` | Manual input parsing/restriction/limit error                             |

Single empty value is null; multiple empty value is []; range empty value is `{ start: null, end: null }`. Range clicks emit `{ start, end: null }` immediately after the first endpoint. Multiple date order is preserved and duplicates removed. dateSelected and registered form change callbacks share formatting/output behavior. A browser document CustomEvent named `datepicker:open` with component instance in detail is also emitted on opening; treat it as an observable legacy integration point.

### Forms API

```ts
writeValue(value: unknown): void;
registerOnChange(fn: (value: DatePickerValue) => void): void;
registerOnTouched(fn: () => void): void;
setDisabledState(isDisabled: boolean): void;
```

The component provides NG_VALUE_ACCESSOR. Supported integration paths are `[formControl]`, `formControlName` and `[(ngModel)]` with Angular forms directives. There is no NG_VALIDATORS provider; parseError/hasError do not automatically set parent form validation errors.

writeValue accepts strings, Date/DateObj in single mode, arrays in multiple, and `{ start, end }` in range. Empty/nullish values reset. Writes suppress change/dateSelected emission; malformed values may log warnings and clear prior state. Programmatic writes currently do not normalize reversed range endpoints or enforce maxSelections consistently. Lifecycle initialization, disabled inline selection and touch behavior require additional host tests. Do not treat those gaps as desired behavior to preserve indefinitely.

### Public callable members to preserve

Signatures use void unless a return is shown:

```ts
toggleCalendarType(); switchCalendarType(newType: CalendarSystem);
populateYears(); setCurrentMonthData();
selectDate(day: number); clearSelection();
isDateSelectable(day: number): boolean;
isDateSelected(day: number): boolean;
isDateInRange(day: number): boolean;
isRangeStart(day: number): boolean; isRangeEnd(day: number): boolean;
isDateInHoverRange(day: number): boolean;
formatValue();
onFocus(); onBlur(); onInputChange(event: Event);
onDateHover(day: number); onDateLeave(); selectToday();
canNavigateMonth(offset: -1 | 1): boolean;
previousMonth(); nextMonth();
toggleMonthYearPicker(); closeMonthYearPicker();
selectMonth(monthIndex: number); selectYear(year: number);
toggleMode(selectionMode: 'single' | 'range' | 'multiple');
toggleOpen(); open(); close();
setDate(date: string | { year: number; month: number; day: number });
isDateFocused(day: number): boolean;
onDocumentClick(event: Event); onWindowResize(); onWindowScroll();
onKeyDown(event: KeyboardEvent);
getCurrentMonthLabel(): string;
ngOnInit(); ngAfterViewInit(); ngOnDestroy();
```

setDate uses an ISO string or one-based date object in the active calendar. A disabled date is ignored with a warning. In range mode it starts a partial range; in multiple it replaces the selection with one date. selectDate refers to a day in the current displayed month. selectMonth takes a **zero-based** month index. Preserve formatter callbacks `dateFormatter` and `outputFormatter`, each `(date: DateObj) => string`; callbacks receive the existing picker representation.

Protected subclass hooks: `getTodayDate(): DateObj`, `setCurrentDate(): void`. Constructor currently takes DateConversionService, ThemeService, ChangeDetectorRef and raw ElementRef. Prefer DI compatibility over changing constructor requirements.

### Public state / declaration surface

These are exposed in the component declaration. They are not all recommended application integration points, but deleting or making them private is source-breaking:

- Read signals: config, formControl, placeholder, hasError, mergedConfig, showDayPicker, effectivePlaceholder, currentMonthsMapping, rotatedDayNames.
- Writable date signals: focusedDate, selectedDate, hoverDate, startDate, endDate (`DateObj | null`); selectedDates (`DateObj[]`).
- Other writable signals: currentCalendarType, formattedDate, inputValue, isOpen, isTouched, showMonthYearPicker, isInputFocused, isDisabled, dropdownTop/dropdownLeft/dropdownWidth, rangeMode, multipleMode, direction, isMobileCompact, isDarkMode, currentTheme.
- Mutable fields: todayBS, todayAD, currentDisplayDate, years, currentMonthData, daysMapping.
- View-query access callbacks: inputContainer, monthColumn, yearColumn returning typed ElementRef or undefined.
- Angular input setters and output emitters listed above.

Compiler-generated Angular factory/component metadata are packaging artifacts, not APIs to invoke manually. Private methods are implementation details. Some internal types used here (DateFormatter, MonthMapping, DaysMapping) are reachable through declaration files but not named root exports.

## DatePickerConfig

All fields are optional in the input interface. Current defaults:

| Fields                                                           | Types / default                                                                         |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| language                                                         | en/ne; en                                                                               |
| calendar                                                         | AD/BS; BS                                                                               |
| allowTextInput, convertOnCalendarChange, showSelectionModeToggle | boolean; false                                                                          |
| displayFormat                                                    | yyyy-MM-dd, yyyy/MM/dd, MM/dd/yyyy, dd/MM/yyyy, dd-MM-yyyy, MMM dd, yyyy; yyyy-MM-dd    |
| outputFormat                                                     | same numeric formats, excluding MMM; yyyy-MM-dd                                         |
| monthLabelFormat / weekdayLabelFormat                            | full/short and short/narrow; full / narrow                                              |
| mode                                                             | single/range/multiple; single                                                           |
| minDate / maxDate                                                | Date, string, one-based `{ year, month, day }`, null; null                              |
| disableFutureDates / disablePastDates                            | boolean; false                                                                          |
| disabledDates                                                    | array of Date/string/date objects; []                                                   |
| disabledDaysOfWeek                                               | number[] (documented 0–6 Sunday–Saturday); []                                           |
| showClearButton / showTodayButton / closeOnSelection             | boolean; true                                                                           |
| placeholder                                                      | string; Select a date                                                                   |
| position                                                         | bottom-left, bottom-right, top-left, top-right, auto; bottom-left                       |
| theme                                                            | PresetThemeName, full DatePickerTheme, system; light                                    |
| customTheme                                                      | Partial<DatePickerTheme>; {} (shallow Partial type)                                     |
| bsYearRange                                                      | `{ start: number; end: number }`; 2000–2139, used for BS                                |
| ariaLabels                                                       | optional calendar, nextMonth, previousMonth, selectDate, clearDate, today string fields |
| mobilePresentation                                               | bottom-sheet/popup; bottom-sheet                                                        |
| firstDayOfWeek                                                   | 0 through 6; 0                                                                          |
| inline                                                           | boolean; false                                                                          |
| multipleSelection                                                | `{ maxSelections?: number }`; undefined maxSelections                                   |

Default ARIA labels: Nepali Calendar, Next Month, Previous Month, Select Date, Clear Date, Today. Global config supplies defaults, component config overrides them. Nested objects are merged by mergeConfig; arrays replace. Undefined overrides are ignored and null clears minDate/maxDate. Runtime input is not schema-validated. Changes to these semantics require tests/documentation.

## Configuration provider, token and service

`provideNepaliDualpicker(config: DatePickerConfig = {}): Provider` provides DATE_PICKER_CONFIG through a merge factory. Direct token provision also remains supported. DATE_PICKER_CONFIG is an InjectionToken<DatePickerConfig> with root defaults. DEFAULT_PICKER_CONFIG is a mutable `Required<DatePickerConfig>` object today; Required is shallow.

DatePickerConfigService public methods:

```ts
getGlobalConfig(): DatePickerConfig;
getMergedConfig(componentConfig?: DatePickerConfig): Required<DatePickerConfig>;
updateGlobalConfig(updates: Partial<DatePickerConfig>): void;
resetGlobalConfig(): void;
getConfigForMode(selectionMode: 'single' | 'range' | 'multiple'): Required<DatePickerConfig>;
getConfigWithTheme(theme: DatePickerConfig['theme']): Required<DatePickerConfig>;
getConfigWithLanguage(language: 'en' | 'ne'): Required<DatePickerConfig>;
createConfigPreset(baseConfig: DatePickerConfig): Required<DatePickerConfig>;
```

The root-provided service owns configuration in a signal. Updates use immutable nested merging; reads return independent snapshots. Picker computed configuration tracks updates. Full runtime mode/calendar reconciliation remains outstanding.

## DateConversionService

Root-provided injectable; current constructor has no required arguments and existing tests instantiate it directly.

```ts
convertAdToBs(input: DateInput, formatted?: boolean): DateObj | string;
convertBsToAd(input: DateInput, formatted?: boolean): DateObj | string;
getCurrentBsDate(formatted?: boolean): DateObj | string;
getWeekday(input: DateInput): number; // AD input, Sunday = 0
isBsYearSupported(year: number): boolean;
isAdYearSupported(year: number): boolean;
getDaysInBsMonth(year: number, month: number): number; // one-based month
getDaysInBsYear(year: number): number;
getCurrentBsMonth(formatted?: boolean): number | string;
getCurrentBsYear(formatted?: boolean): number | string;
```

formatted defaults to false; true yields zero-padded ISO/date-part strings. Invalid parsing/calendar/conversion inputs throw Error; year support predicates only check nominal bounds. Current-date helpers read the local clock. Preserve return shapes and exceptions; additive literal-boolean overloads can improve typing without changing runtime behavior.

## Themes and ThemeService

PresetThemeName is derived from PRESET_THEMES: light, dark, ocean, forest, purple, rose. system is a selection option, not a PRESET_THEMES key. Public preset objects are mutable and some nested groups are shared today.

DatePickerTheme required groups:

- colors: optional primary, primaryHover, primaryLight, secondary, background, surface, border, text, textSecondary, textDisabled, error, success, selectedBackground, selectedText, hoverBackground, todayText, rangeBackground, rangeHoverBackground strings.
- spacing: containerPadding, dateGap, headerPadding, pickerGap strings.
- typography: fontFamily string; fontSize base/small/large strings; fontWeight normal/medium/semibold/bold numbers.
- borderRadius: small/medium/large/full strings.
- shadows: dropdown/selected strings.
- transitions: default/fast/slow strings.
- dimensions: dateSize/containerWidth/containerMaxHeight/iconSize strings.

ThemeService is root-provided and implements OnDestroy:

```ts
getCurrentTheme(): Observable<DatePickerTheme>;
getCurrentThemeValue(): DatePickerTheme;
setTheme(theme: PresetThemeName | 'system' | DatePickerTheme, element?: HTMLElement): void;
mergeTheme(customTheme: Partial<DatePickerTheme>, element?: HTMLElement): void;
applyThemeToElement(theme: DatePickerTheme, element: HTMLElement): void;
removeThemeFromElement(element: HTMLElement): void;
getPresetTheme(name: PresetThemeName): DatePickerTheme;
getPresetThemes(): typeof PRESET_THEMES;
createCustomTheme(presetName: PresetThemeName, customProperties: Partial<DatePickerTheme>): DatePickerTheme;
mergeThemeObject(baseTheme: DatePickerTheme, customTheme: Partial<DatePickerTheme>): DatePickerTheme;
detectSystemTheme(): 'light' | 'dark';
prefersDarkMode(): boolean;
onSystemThemeChange(callback: (isDark: boolean) => void): () => void;
isValidTheme(theme: unknown): theme is DatePickerTheme;
ngOnDestroy(): void;
```

Element-less theme setters apply to document root in the browser. Element-taking methods intentionally depend on a DOM element. Preserve existing --ndp CSS custom-property names and major class hooks for consumer customization. isValidTheme currently does not deeply validate all fields.

## Pipes

### NepaliDatePipe

Standalone, pure, template name **nepaliDate**:

```ts
transform(
  value: string | DateObj | Date | null | undefined,
  format = 'mediumDate',
  locale: 'en' | 'ne' = 'ne',
  dateType: 'BS' | 'AD' = 'BS',
): string;
```

Formats the supplied calendar; it does not automatically convert AD to BS. Handles standard short/medium/long/full presets and date tokens. Empty/invalid values produce empty output. Weekdays depend on selected calendar; existing EEEE output uses abbreviated default weekday names. Preserve defaults, token/preset behavior and accepted parsing cases until regression tests exist.

### Internal pipe

NepaliNumeralPipe (nepaliNumeral) is standalone/pure and used by the picker, but not root-exported. Keep its functionality when restructuring; exposing it publicly would be an additive API decision.

## Migration

See [MIGRATION.md](MIGRATION.md) for intentional breaking changes in 2.0.0-next.0 and [RELEASE-CHECKPOINT.md](RELEASE-CHECKPOINT.md) for outstanding verification.
