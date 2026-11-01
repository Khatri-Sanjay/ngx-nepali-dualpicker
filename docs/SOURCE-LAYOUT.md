# Source layout and naming

The workspace uses Angular 17 conventions: kebab-case paths, `.component`, `.service`, `.pipe`, `.token`, and `.model` suffixes. Components keep their TypeScript, template, and stylesheet together. Public package imports remain `ngx-nepali-dualpicker` and `ngx-nepali-dualpicker/core`; source paths are internal implementation details.

```text
libs/ngx-nepali-dualpicker/
  src/public-api.ts                 Angular package exports
  src/core-api.ts                   Framework-independent exports
  src/lib/
    configuration/
      datepicker-config.model.ts    Contracts and calendar enum
      datepicker-config.defaults.ts Default configuration values
      merge-datepicker-config.ts    Configuration cloning and merge semantics
      datepicker-config.token.ts    Angular injection token
      datepicker-config.service.ts  Reactive application defaults
      provide-nepali-dualpicker.ts  Provider factory
    core/
      calendar/                     Data, conversion and calendar operations
      formatting/                   Localized and picker-specific formatting
      locale/                       Labels, numeral mappings and conversion
      models/                       Calendar date and calendar-system contracts
      parsing/                      Input parsing
      validation/                   Calendar validation
    datepicker/
      ngx-nepali-dualpicker.component.*  Public component and Angular forms adapter
      components/
        calendar-grid/              Grid view, cell model and presentation builder
        month-year-panel/           Month/year navigation view
      keyboard/                     Pure keyboard command mapping
      overlay/                      Popup geometry, listeners and scoped controller
      state/                        Selection, restrictions and legacy date adapters
    pipes/                          Angular formatting adapters
    services/                       Injectable calendar conversion facade
    themes/
      datepicker-theme.model.ts     Theme contract
      datepicker-theme.presets.ts   Preset data and derived preset names
      theme.service.ts             Public theme service
      picker-theme.controller.ts   Component-scoped theme ownership
      internal/                    Theme merging, detection and DOM application
  core/ng-package.json             Secondary entry point packaging
apps/
  playground/                      Interactive configuration application
  documentation/                   Guides, live examples and API reference
  shared/
    components/code-block/         Shared code viewer
    configuration/                 Cross-application URLs
    content/                       Example catalogue and package metadata
scripts/                           Build, development and verification tools
```

## Responsibilities

- Model files contain contracts rather than defaults or runtime functions.
- Functions use descriptive names such as `format-picker-date.ts` and `merge-datepicker-config.ts`. Avoid broad `utils`, `helpers`, or `common` buckets.
- Tests sit beside their implementation with the same base name and `.spec.ts`. Integration suites can describe the behavior they cover.
- Pure calendar and selection modules do not import Angular or browser APIs. Browser listeners and DOM theme application stay in adapters.
- Internal modules use direct imports. Only the package entry points define the supported consumer export surface.
- Both apps consume the built public library. Shared app code never becomes a dependency of the published library.
- Generated API signatures come from `npm run docs:api`; never edit the generated file manually.

`npm run check:architecture` enforces library path naming, model responsibilities, dependency boundaries, direct-import resolution and cycle checks. Build and test checks verify templates and behavior after moves.

## Notable source renames

| Previous path                       | Current path                                                                |
| ----------------------------------- | --------------------------------------------------------------------------- |
| `configuration/merge-config.ts`     | `configuration/merge-datepicker-config.ts`                                  |
| `themes/datepicker-theme.ts`        | `themes/datepicker-theme.model.ts` and `themes/datepicker-theme.presets.ts` |
| `core/calendar/conversion.ts`       | `core/calendar/date-conversion.ts`                                          |
| `core/calendar/calendar-view.ts`    | `core/calendar/calendar-operations.ts`                                      |
| `core/formatting/date-formatter.ts` | `core/formatting/format-picker-date.ts`                                     |
| `core/locale/locale.model.ts`       | `core/locale/calendar-labels.model.ts`                                      |
| `core/locale/numerals.ts`           | `core/locale/numeral-mappings.ts`                                           |

Historical audit snapshots under `docs/architecture/` retain the filenames present when those snapshots were recorded. This document describes the current layout.

The latest complete audit, migration plan and validation results are in [Architecture review](architecture/refactor-report.md).
