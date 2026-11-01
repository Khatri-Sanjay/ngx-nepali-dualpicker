# Documentation audit and implementation plan

Audit date: 2026-10-31. Evidence comes from `src/public-api.ts`, `src/core-api.ts`, package manifests, configuration defaults, component decorators, services, themes, tests, scripts and local Git history.

## Repository facts

- Package: `ngx-nepali-dualpicker`, a BS/AD datepicker and calendar conversion library.
- Workspace: Angular 17.3.12, CLI/build tooling 17.3.17, TypeScript 5.4.5, RxJS 7.8.2 installed.
- Declared consumer peers: Angular common/core/forms >=17 <23 and RxJS ^6.5.3 or ^7.4.0. A declared range is not evidence that every version/browser combination has been verified.
- Root entry point: Angular integrations. `/core`: framework-independent calendar calculations, formatting and parsing.
- Component: `NgxNepaliDualpicker` (`ngx-nepali-dualpicker`), standalone, OnPush, ControlValueAccessor and optional validator.
- Directive: `DateCellTemplateDirective` (`ng-template[ndpDateCell]`), a typed template projection contract without inputs/outputs.
- Pipe: `NepaliDatePipe` (`nepaliDate`), pure and standalone. It formats but does not convert calendars.
- Services: `DateConversionService`, `DatePickerConfigService`, `ThemeService`.
- Provider/token/defaults: `provideNepaliDualpicker`, `DATE_PICKER_CONFIG`, `DEFAULT_PICKER_CONFIG`.
- Themes: `PRESET_THEMES`, `DatePickerTheme`, `PresetThemeName`; per-instance theme configuration and CSS properties. No external fonts, icons, CDK or Tailwind installation is required.
- Contracts: `Calendar`, `CalendarSystem`, `DateObj`, `DateInput`, `DatePickerConfig`, `DatePickerValue`, `DateFilter`, `RangeConstraints`, `DatePresetContext`, `DateSelectionPreset`, `DateCellContext`.
- Validators/formats: `nepaliDateValidator`, `EDITABLE_DATE_FORMATS`.
- Core runtime exports: `convertAdToBs`, `convertBsToAd`, `getWeekday`, `DateCalculator`, `DateValidator`, `DateParser`, `formatPickerDate`, `formatDate`. Shared type/format exports also appear in `/core`.
- Configuration: 36 optional top-level options; exact types/defaults must be generated from the source and built public defaults, including nested contracts.
- Existing documentation: 16 structured pages, generated signatures, real form/conversion/formatting demos, shared examples and copyable code. Existing prose contains stale claims and must be corrected.
- Existing playground: a separate application on port 4200 with validated live JSON configuration and genuine library rendering. Reuse it; do not simulate Angular source execution.
- Tests: Karma/Jasmine, Angular consumer integration, browser style/keyboard/axe coverage, compiled documentation examples, package exports and core bundle checks. These are not a blanket accessibility/browser certification.
- Build/release: ng-packagr, ESM root and secondary entry points, MIT, next-version changelog and migration guide, npm packing, compatibility workflow. Local Git has one initial commit, no tags and no remote configured.

## Publication and link evidence

- npm registry query confirms latest published version **1.1.4** and its timestamps. Workspace **2.0.0-next.0** is unreleased and absent from registry dist-tags. Do not instruct users to install an unpublished npm version.
- Manifest repository and issue URLs return HTTP 404 from both GitHub and the GitHub API. Preserve provenance on the package page, but do not present these as working navigation links or invent source/security/discussion URLs.
- Manifest GitHub Pages homepage returns HTTP 200. It is an existing older site, not a confirmed origin for this documentation deployment.
- npm web page returns HTTP 403 to automated checking; registry metadata verifies the package exists. This does not establish an npm-page outage.
- Current app URLs are localhost development URLs. Production origins require owner configuration. Canonicals/sitemaps must not silently use localhost as production identity.

## Coverage and implementation sequence

1. Keep this audit, generate an export/configuration/theme inventory, and snapshot verified npm metadata with refresh instructions.
2. Centralize page models, categories, links, section anchors and route metadata. Expand Introduction, Getting Started, Installation, Components, Directives, Pipes, Services, Theming, Guides, API Reference, Changelog, Migration and Contributing.
3. Correct stale content before expanding it. Document the canonical 2.x names, local-tarball setup, published-version distinction, supported contracts and actual limitations.
4. Build a persistent sidebar, responsive drawer, breadcrumbs, active sections, previous/next navigation, a page TOC and a premium documentation shell with persistent/system-aware themes.
5. Add an accessible Ctrl/Cmd+K search dialog with section/API/code/release indexing, keyboard navigation, highlighting and empty/loading/error states.
6. Reuse real demos, share the JSON configuration validator, add reset/responsive/theme controls and integrate the real playground with a visible standalone fallback. TypeScript/HTML source must be labelled honestly; do not pretend arbitrary source is compiled in-browser.
7. Generate release history from verified registry timestamps and actual local changelog/migration text. Missing historical release notes remain explicitly unavailable.
8. Add Angular 17 prerendering, page-specific SEO, configurable canonical/social URLs, sitemap and robots generation. Verify prerendered output, not just client-side meta updates.
9. Check API coverage, every route/anchor/internal link, examples, search, theme, keyboard behavior, responsive layout, copies, build output and existing library/playground regressions.
10. Deliver maintenance/deployment instructions and a report separating executed checks, missing source information and remaining publication tasks.

## Scope safeguards

The library's public API is not changed for this documentation project. Documentation examples consume the built public package. No historical release contents, production origins, repository links, certifications or arbitrary code-execution features will be fabricated.
