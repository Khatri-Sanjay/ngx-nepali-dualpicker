# Changelog

## 2.0.0 - 2026-11-01

- Add verified Signal Forms interoperability for Angular 21 and 22, document Angular 21 validator-forwarding limits, and fix validation inside a computed context.
- Refresh published npm versions automatically in documentation and playground; exclude unpublished versions from release history.
- Add a shared dual-calendar logo, multi-size favicons, web manifests, social sharing images, and expanded documentation metadata.
- Preserve selected dates when clicking the active selection mode and expose active calendar/mode states to assistive technology.

- Import the library and demo into this workspace.
- Fix popup placement with collision-aware side fallback, theme-sized width, bounded scrolling, visual-viewport tracking and measurement before keyboard focus; preserve full-width mobile bottom sheets.
- Fix transformed-container and native-dialog popup ownership with top-layer presentation and a cleaned-up compatibility surface. Keep range errors inside open calendars, disable unavailable Today actions, preserve contrast-safe action text, and include visible localized labels in accessible names.
- Add selection-count/limit feedback and empty-availability guidance, remove inert inline triggers, add mobile dismissal and larger touch targets, track visual-viewport height, and derive all seven theme options (including Sunset) from public presets.
- Use logical input/icon spacing in RTL, keep touch Month/Year controls at 44px, restrict month navigation to date bounds in both calendars, and synchronize browser-driven popover dismissal with component state.
- **Breaking:** standardize configuration names (`calendar`, `selectionMode`, `readOnly`, `allowTextInput`, `showSecondaryDate`, `convertOnCalendarChange`, `popupPosition`, `mobilePresentation`, `multipleSelection`, and `bsYearRange`) with no legacy aliases. Rename label formats, range-crossing and previous-month options, expand theme background names/CSS properties, replace `CalendarType` with `CalendarSystem`, and correct `Calendar.BD` to `Calendar.BS`. See [the configuration migration table](docs/MIGRATION.md#configuration).
- Separate pure calendar operations from Angular; add a core entry point.
- Replace broad internal barrels with direct imports and enforce boundaries.
- Extract selection transitions and normalize external range/multiple values.
- Use signal-based configuration and isolate nested snapshots.
- Block disabled date clicks, manual-input mutation and clear actions.
- Preserve native child-control keyboard interaction.
- Track deferred picker callbacks and cancel them on destruction.
- Replace the icon-only Today action with a labelled calendar button and refresh month/year navigation with compact grids, keyboard navigation, focus return and a year-then-month selection flow.
- Configure ESLint, Prettier, strict checks, editor integration, commit checks and CI.
- **Breaking:** remove currency APIs and mutable configuration reads. See docs/MIGRATION.md.

This is an implementation checkpoint. Outstanding work is tracked in docs/RELEASE-CHECKPOINT.md.
