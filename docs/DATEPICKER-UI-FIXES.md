# Datepicker UI audit resolutions

Implemented 2026-11-01 against the [original audit](DATEPICKER-UI-AUDIT.md). All requested findings are addressed without adding or renaming public configuration APIs.

## Resolutions

| Finding                                       | Implemented behavior                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Transformed cards and dialogs misalign popups | The calendar uses a native top-layer popover while retaining Angular ownership. A themed portal provides compatibility when the Popover API is unavailable; native-dialog integrations use a modal surface in that fallback. Positioning measures the viewport, flips or clamps the panel, and observes content and viewport changes. |
| Range errors appear behind the calendar       | Open and inline calendars render validation feedback inside the panel, above its scrolling body. Closed inputs retain their associated feedback. Minimum and maximum range messages explain inclusive day counts.                                                                                                                     |
| Today navigates outside allowed dates         | Today is disabled when its date is unavailable, with an explanation. Its handler also guards direct invocation, preserving the current view and value.                                                                                                                                                                                |
| Today hover contrast                          | Hover keeps the preset primary foreground on a transparent background and adds an underline. Removing the unnecessary foreground transition also avoids stale colors during live theme changes.                                                                                                                                       |
| Visible and accessible labels differ          | Default labels follow the selected language. Today includes its visible label; month/year controls include their displayed period; day labels include the visible unpadded day. Explicit custom labels remain supported.                                                                                                              |
| Multiple-selection limits are unexplained     | A live count shows the maximum. An extra selection announces how to proceed, preserves the accepted dates, and does not invalidate an otherwise valid committed form value. Removing a selected date allows another selection.                                                                                                        |
| Empty availability is unexplained             | The visible month reports when no dates are available under the current restrictions. This is distinct from Today being unavailable.                                                                                                                                                                                                  |
| Inline calendars have an inactive trigger     | The popup trigger is absent in inline mode; input and clear-button spacing adapt.                                                                                                                                                                                                                                                     |
| Mobile dismissal is unclear                   | Bottom sheets have a visible, touch-sized Close action. Escape and outside-click dismissal remain available; height and bottom offsets follow the visual viewport and safe area. Coarse-pointer navigation and month/year targets are at least 44px.                                                                                  |
| Sunset is missing from theme controls         | Documentation and playground controls derive their options from the exported preset collection, including Sunset. Existing custom and system theme choices are retained.                                                                                                                                                              |

## Interaction policy

The mobile bottom sheet remains a nonmodal calendar: it does not lock background scrolling or impose a focus trap. It provides explicit dismissal and viewport-aware sizing. A calendar opened within an existing native modal remains within modal interaction constraints, including in the compatibility path.

Availability feedback describes the visible month, rather than claiming that no date exists anywhere. Custom themes remain responsible for their own contrast. No public API compatibility aliases were introduced.

## Verification

- Library: **185 browser unit/integration tests passed**, including new regressions for transformed ancestors, native dialogs, fallback ownership and cleanup, validation feedback, Today bounds, localized names, availability, selection limits and all preset colors.
- Playground: **47 tests passed**, including selecting Sunset and checking its rendered color.
- Documentation: **44 tests passed**, including Sunset configuration and generated example code.
- Production library, playground and documentation builds passed; documentation prerendered **47 routes**. Its initial bundle is **329.57 kB**.
- Architecture, ESLint, formatting and TypeScript checks passed.
- Documentation example compilation: **85 examples passed**. Documentation coverage/navigation validation passed for **45 pages**, **33 public symbols** and **36 configuration options**.
- Package validation passed for **153 packaged files**, exports and the standalone conversion smoke check. The core-only bundle contains no Angular or picker implementation (**2,328 gzip bytes**).
- Calendar checks passed **51,032 AD-to-BS-to-AD** and **51,032 BS-to-AD-to-BS** daily round trips, including endpoints and unsupported neighbors.
- A production Edge replay exercised **35 UI scenarios** with no console errors or header overflow. Inline calendars can extend below the viewport as normal page content. The transformed popup now aligns at **443.5px** with its **443.5px** input; the invalid-range feedback is unobscured; the mobile Close action dismisses the sheet; Today outside bounds leaves navigation usable.
- Targeted rendered Nepali visible-label checks found no violations. The visible Today label and accessible name both read `आज`.
- All **17 production documentation browser checks passed**, including hydrated routes, search, live examples, mobile navigation and automated accessibility checks. The browser driver foregrounds its target page so viewport-deferred examples render reliably.

Measured Today hover contrast against the rendered header background:

| Preset | Contrast |
| ------ | -------- |
| Light  | 6.70:1   |
| Dark   | 5.75:1   |
| Ocean  | 5.93:1   |
| Forest | 5.48:1   |
| Sunset | 7.09:1   |
| Purple | 6.98:1   |
| Rose   | 6.29:1   |

All exceed 4.5:1. Measurements and scenario outcomes are preserved in [the resolution evidence](qa/datepicker-ui-fixed.json); the original audit evidence is preserved separately.

## Maintenance and remaining verification

### Follow-up: RTL, bounded months and popup lifecycle

The subsequent four requested fixes are implemented. Input padding and icon placement use logical properties; touch icons remain 44px with no overlap in either direction. Month choices, navigation arrows and year changes respect minimum/maximum month bounds in both AD and BS. Touch Month/Year switch buttons are 44px tall. Native popover closure synchronizes component state, with listener cleanup on release and reopening covered by regression tests.

The final library suite passes **188 tests**. Production builds and architecture/lint/format/TypeScript checks pass. The **17 production documentation browser checks** also pass. An additional Edge touch replay checks LTR/RTL in popup and inline modes, confirms 96px input end padding for popup controls and 52px for inline clear controls, and verifies actual browser-driven popup dismissal. See [the follow-up measurements](qa/datepicker-ui-followup.json).

Regression coverage lives in `libs/ngx-nepali-dualpicker/src/lib/datepicker/ui-audit-regressions.integration.spec.ts`, with consumer coverage in the playground and documentation suites. Keep theme selectors derived from the exported preset registry, and test both native top-layer and compatibility paths when changing popup ownership.

These checks cover Windows Edge and browser emulation. Physical iOS/Android keyboards, Safari/Firefox, assistive technologies, unusual custom templates/themes and every host-dialog integration still require device-specific verification. The local Node 24 runtime differs from the repository's pinned Node 20 runtime; CI should repeat the checks using the pinned version.
