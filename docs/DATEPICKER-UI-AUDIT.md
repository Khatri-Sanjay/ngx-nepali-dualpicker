# Datepicker UI and state audit

Reviewed 2026-11-01 against the current implementation and built playground. This is a diagnostic review: no component behavior or public API was changed during the audit.

**Implementation follow-up:** the findings below describe the original audit snapshot. The subsequent requested fixes are implemented; see [the resolution report](DATEPICKER-UI-FIXES.md) for current behavior and verification results.

## Evidence and scope

- Ran the current library browser suite: **168 tests passed**.
- Exercised **35 representative browser scenarios** in Edge 156 on Windows: seven preset themes across single/range/multiple selection; BS/AD; English/Nepali; secondary dates; all header controls at 320/375/768 pixels; read-only; disabled forms; no availability; multiple-selection limits; Today outside bounds; invalid range ends; popup/bottom-sheet layouts; transformed ancestors; invalid manual entry; localized accessible labels.
- Read the actual templates, styles, config contracts, popup adapter, selection transitions and integration tests.
- Ran a targeted axe visible-label/accessibility-name check on Nepali controls. Calculated Today hover contrast from the actual preset colors and rendered CSS behavior.
- Saved measurements in [the audit evidence](qa/datepicker-ui-audit.json). Screenshots and the temporary browser driver are under `tmp/datepicker-ui-audit` and `tmp/audit-datepicker-ui.mjs` in this workspace.
- No horizontal header overflow was measured in the sampled narrow layouts. No console errors occurred in the exercised scenarios. Inline calendars extending below the viewport are normal page scrolling, not popup containment failures.

These samples are not the full cross-product of 36 configuration options. They do not certify physical iOS/Android keyboards, Safari/Firefox, every screen reader, custom themes/templates, zoom levels or every modal/dialog integration.

## Fix first: confirmed issues

### P1 — Popup coordinates break inside transformed ancestors

**Reproduce:** open the desktop popup normally, then place its owning preview/card inside an ancestor with `transform: translateZ(0)` and resize/reposition.

The baseline popup aligned with the input at x=443.5px. In the transformed container, the popup moved to x=839.5px while the input stayed at x=443.5px; part of the panel also extended outside the viewport. Fixed-position descendants use a transformed containing block, but the adapter writes viewport coordinates without converting them to that containing block.

**Manage:** use a document-level overlay/portal with explicit ownership, theme propagation, focus and outside-click handling, or correctly handle the actual fixed-position containing block. Test transformed cards, dialogs, drawers, containment and nested scrolling together. Merely increasing z-index will not fix coordinates or clipping.

Source: [popup measurements and coordinate assignment](../libs/ngx-nepali-dualpicker/src/lib/datepicker/overlay/picker-popup.controller.ts), [fixed popup styling](../libs/ngx-nepali-dualpicker/src/lib/datepicker/ngx-nepali-dualpicker.component.scss).

### P1 — Range-validation feedback can be hidden behind the popup

**Reproduce:** use an open AD range popup with `rangeConstraints: { minDays: 5 }`; choose the 12th and then the 13th.

The component correctly preserves the partial start and creates “Range violates duration or availability rules.” The error is rendered below the input, where the fixed popup overlaps it. Browser hit-testing confirmed the popup covered the error's location.

**Manage:** show interaction errors inside the open popup, close to the date grid, with a live announcement. Retain the associated field error for the closed state. Explain the actionable restriction, such as “Choose at least 5 days”, rather than only a generic rejection.

Source: [error placement and popup markup](../libs/ngx-nepali-dualpicker/src/lib/datepicker/ngx-nepali-dualpicker.component.html), [range rejection handling](../libs/ngx-nepali-dualpicker/src/lib/datepicker/ngx-nepali-dualpicker.component.ts).

### P1 — Today can navigate outside the allowed calendar bounds

**Reproduce:** set AD min/max dates to 2024-01-01 and 2024-12-31, then activate Today while the local date is in 2026.

Today moves the view to the current month even though that date is unavailable. The observed result had zero selectable days and both month navigation buttons disabled. The month/year selector remains a recovery route, but the UI gives no explanation.

**Manage:** establish one explicit policy: disable Today with an explanation when it cannot select, or provide a separate, clearly named navigation action. Keep the displayed month inside the intended browse bounds, or make returning to the allowed interval straightforward. Test single, partial range, complete range, multiple, read-only and disabled states separately.

Source: [selectToday and canNavigateMonth](../libs/ngx-nepali-dualpicker/src/lib/datepicker/ngx-nepali-dualpicker.component.ts).

### P1 — Today hover text contrast fails in three presets

The small Today label uses `primaryHover` on the header background when hovered. The actual preset values produce:

| Preset | Hover text | Background | Contrast |
| ------ | ---------- | ---------- | -------- |
| Ocean  | #0284c7    | #ffffff    | 4.10:1   |
| Forest | #059669    | #ffffff    | 3.77:1   |
| Sunset | #d97706    | #ffffff    | 3.19:1   |

These are below 4.5:1 for the current 12px normal-weight label. Base-state contrast tests do not establish hover-state contrast.

**Manage:** keep text on a contrast-safe foreground token through hover/focus/pressed states, or adjust these foreground colors. Recheck every preset, system theme and application override in all interaction states. Preserve the requested transparent Today background.

Source: [Today styling](../libs/ngx-nepali-dualpicker/src/lib/datepicker/ngx-nepali-dualpicker.component.scss), [actual preset colors](../libs/ngx-nepali-dualpicker/src/lib/themes/datepicker-theme.presets.ts).

### P1 — Accessible names do not consistently include visible labels

In the Nepali scenario, Today visibly reads **आज** but its default accessible name is **Today**. The month/year control also replaces its visible month/year text with a generic accessible instruction. The targeted axe `label-content-name-mismatch` check reported both controls as serious findings.

**Manage:** localize default names and include the visible label in the accessible name. For example, the month/year name should include the displayed localized month and year, followed by its instruction. Preserve meaningful application overrides while requiring visible-name consistency. Verify the English version as well as Nepali and voice-control behavior.

Source: [Today and month/year button labels](../libs/ngx-nepali-dualpicker/src/lib/datepicker/ngx-nepali-dualpicker.component.html), [default ariaLabels](../libs/ngx-nepali-dualpicker/src/lib/configuration/datepicker-config.defaults.ts).

## Manage next: confirmed UX gaps

| Priority | State/use case                      | Observed gap                                                                                                                      | Recommended handling                                                                                                                                                                            |
| -------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P2       | Multiple selection at maxSelections | With a limit of two, the third click leaves two selections and displays no error or limit explanation                             | Show a selected-count/limit summary and announce a rejected extra selection. Continue allowing removal. Avoid marking all unselected days unavailable without explaining the reason.            |
| P2       | Inline calendar                     | The calendar trigger remains visible/focusable, while open/toggleOpen return immediately for inline mode                          | Remove the redundant popup trigger in inline mode, or give it a meaningful documented action. Do not expose an inert button as an interactive affordance.                                       |
| P2       | Mobile bottom sheet                 | No explicit close/dismiss control was found; the presentation lacks a clearly defined modal/backdrop policy                       | Add an accessible dismissal action. Decide whether it is modal; if so, implement backdrop, background scroll/focus management and modal semantics together. Desktop popups can remain nonmodal. |
| P2       | No available dates                  | Blocking all seven weekdays produces a fully unavailable month with no empty-state explanation                                    | Show a concise availability message and useful recovery/navigation guidance; preserve keyboard access to navigation.                                                                            |
| P2       | Feature discovery                   | PRESET_THEMES implements seven presets, including sunset; the playground/docs theme selectors omit sunset and some prose says six | Derive theme options from the public preset metadata and correct the documented count. Test all seven, plus system/custom configurations.                                                       |

## State matrix to maintain

| Area                      | Required state/use-case coverage                                                                                                           | Current assessment / next action                                                                                                                                                                                      |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Single selection          | Empty, selected, selecting today, clearing, same date clicked again, programmatic initial value/reset                                      | Existing tests and sampled previews cover the common path. Keep Today-bounds and focus behavior in regression coverage.                                                                                               |
| Range selection           | Empty, start only, forward/reverse hover, completed range, one-day range, week/month/year crossing, invalid end, reset                     | Existing tests cover bands, reverse previews, unavailable cells and one-day endpoints. Add visible in-popup rejection feedback and cross-month interaction review.                                                    |
| Range constraints         | minDays/maxDays inclusive boundaries, blocked endpoints, crossing unavailable days, invalid constraint settings                            | Domain checks exist. Make the specific failed constraint visible and understandable before the user repeatedly retries.                                                                                               |
| Multiple selection        | Zero/one/many dates, maximum reached, exceeding the maximum, deselection, clear/reset, long field value                                    | Selection limits work in the sample; rejection feedback is missing. Consider a compact count/summary with an accessible way to inspect/remove dates when the list becomes long.                                       |
| Today                     | Normal, already selected, outside bounds, filtered, read-only, disabled, period picker open, all modes                                     | The button is now visually lightweight. Correct bounded navigation, hover contrast and visible/accessible naming. Clearly distinguish selection from keyboard navigation-to-today.                                    |
| Popup layout              | All preferred positions, left/right/bottom/top edges, short windows, nested scrolling, resizing, transformed parents, clipped containers   | Ordinary desktop placement and header/body scrolling work in the exercised tests. Transformed containing blocks are a confirmed failure.                                                                              |
| Inline layout             | Narrow parent, full month, long localized heading, custom height/width, forms and keyboard interaction                                     | Basic layouts work; remove or redefine the redundant trigger. Inline content may legitimately require normal page scrolling.                                                                                          |
| Mobile/tablet             | 320/375/768 widths, portrait/landscape, popup/sheet, touch targets, browser bars, virtual keyboard, orientation changes                    | Sampled headers fit. Give the sheet explicit dismissal. Navigation arrows are 28px at the small breakpoint; review larger touch hit areas. The sheet's 90vh rule needs real-device keyboard/dynamic-viewport testing. |
| Theme                     | Seven presets, system changes, custom colors, hover, focus, pressed, selected, unavailable, disabled                                       | Existing contrast tests cover important base/selected states. Fix the measured Today hover failures and validate each custom-theme foreground/background pair.                                                        |
| Date-cell states          | Normal, hover, focused, selected, today, today+selected, range start/end/middle/preview, unavailable, read-only                            | Broad existing browser coverage for range bands and today markers is a strength. Retain visible distinctions that do not depend on color alone.                                                                       |
| Restrictions              | min/max exact endpoints, disabled weekday/date, past/future, callbacks, no available dates, runtime changes                                | Existing rules combine restrictions. Add an explained no-availability state and verify the displayed month cannot strand users outside valid browse bounds.                                                           |
| Forms                     | ngModel/reactive, empty/initial/reset, required, invalid draft, invalid model, touched, read-only, disabled, runtime mode/calendar changes | Existing tests cover both forms approaches, validation opt-in and retained invalid drafts. Keep error placement visible while the popup remains open.                                                                 |
| Manual formats            | Every numeric format, named-month display-only, partial text, malformed text, mixed separators, range/multiple delimiters, clearing        | Existing parsing boundaries are documented/tested. Provide format hints and actionable errors; do not infer edit support from pipe formatting tokens.                                                                 |
| Month/year selection      | Open/close, active/current states, keyboard arrows, year-to-month flow, long year lists, restricted years, focus return                    | Existing tests cover the flow, narrow layout and scroll-to-year. Fix visible-name consistency and verify behavior after changing bounds with the panel open.                                                          |
| Localization              | English/Nepali labels, numerals, long headings, weekday formats, firstDayOfWeek, error messages, aria labels                               | Sampled layouts fit. Visible and accessible labels need correction. Both supported languages are LTR; do not advertise a public RTL configuration that does not exist.                                                |
| Dual dates                | Primary/secondary emphasis, selected/disabled contrast, unavailable conversion, both calendar directions, narrow cells                     | Existing styles/tests retain secondary text and state markers. Make null/out-of-range secondary data understandable; keep the stored value/calendar contract explicit.                                                |
| Presets                   | Correct mode/calendar/output format, resolver failure, restricted result, partial/complete range, read-only/disabled, many labels          | Existing source validates preset results. Verify long/wrapped shortcut labels and keep rejection feedback inside the active interaction surface.                                                                      |
| Custom cells              | Short/long labels, prices/badges, selected/disabled/dual state, zoom, overflow, accessible description                                     | Existing tests cover representative custom content. Treat arbitrary interactive nested content as an application/template constraint; do not imply any supplied template is automatically accessible.                 |
| Keyboard/focus            | Tab order, open/close, Escape return, arrows, Home/End, PageUp/Down, year jumps, unavailable dates, focus leaving                          | Current tests cover substantial behavior. Add transformed overlays and mobile dismissal without trapping focus incorrectly. Test speech input and real screen readers manually.                                       |
| Scrollbars                | Page/panel/body/code, light/dark, short viewport, forced colors, touch                                                                     | Thin shared styling and body-only calendar scrolling are implemented. Preserve native visibility in high-contrast mode and actual OS/browser behavior.                                                                |
| Application integration   | Several pickers, unique IDs, dialogs/drawers, route destruction, live config/theme updates, nested scroll parents                          | Existing cleanup/unique-ID coverage helps. Add transformed-dialog overlay regression cases and physical-device viewport changes.                                                                                      |
| Async availability        | Loading, empty data, fetch failure, changed availability while open                                                                        | These are application-owned states: dateFilter is synchronous. Disable/explain unavailable data at the application boundary instead of inventing an async library API.                                                |
| SSR/hydration and time    | Stable IDs/initial model, consistent calendar/locale, server-client timezone, midnight/long-open sessions                                  | Not certified by this audit. Verify the consuming app; the local date and server-rendered date can differ.                                                                                                            |
| Accessibility preferences | Reduced motion, forced colors, zoom, text enlargement, screen readers, voice control                                                       | CSS support exists for several preferences. Manually verify target environments; automated passing checks are not full accessibility certification.                                                                   |

## Recommended implementation order

1. Correct overlay containing-block handling and make open-popup validation messages visible.
2. Fix Today's bounds policy, contrast-safe hover foregrounds, and visible/accessibility-name consistency.
3. Explain multiple-selection limits and no-availability states; remove inert inline controls.
4. Complete mobile dismissal and validate dynamic viewports/large touch hit areas on actual devices.
5. Generate theme controls from actual preset exports, then extend regression coverage across the priority intersections above.

Keep DATE_PICKER_CONFIG as the injection/configuration token. The principal changes belong in the popup controller, component template/styles, selection feedback and localized labels—not in the token factory.
