# Nepali Dualpicker Workspace

Angular library and interactive playground for `ngx-nepali-dualpicker`, imported from the existing 1.1.4 project and refactored here for `2.0.0-next.0`. This is an implementation checkpoint; the complete toolkit remains in progress.

## Development

Use Node 20.19.x (`.nvmrc`) and npm 10 or 11. Angular 17.3 is the build baseline.

```sh
npm ci
npm start
```

PowerShell users with script execution disabled can use `npm.cmd`.

## Playground

`npm start` builds the library and launches the `playground` application at `http://localhost:4200`. Its homepage provides live controls and an editable JSON configuration object, with presets, date restrictions, range rules, formatting, themes, popup behavior, form values, events and copyable Angular code. Valid JSON changes update the calendar immediately; invalid drafts retain the last working preview. Appearance and behavior edits preserve the selection; calendar, selection-mode and output-format edits clear incompatible values. Controls collapse on smaller screens. Reset restores the initial settings. JSON supports static presets and date lists; callback filters and cell templates are demonstrated in the booking example.

Documentation is a separate Angular application. Run `npm run start:docs` at `http://localhost:4201` for installation, forms, selection modes, restrictions, conversion, localization, formatting, themes, keyboard usage, SSR notes and the complete API reference. The playground runs at port 4200. Build the app with `npm run build:playground`, run its browser tests with `npm run test:playground`, and deploy `dist/playground/browser`. The former `dualpicker-demo` target and `build:demo` / `test:demo` commands were replaced.

The documentation platform contains 45 structured pages, source-derived public APIs, searchable configuration/services/releases, real configurable examples, responsive navigation, persistent light/dark themes and prerendered HTML. Build it with `npm run build:docs` and deploy `dist/documentation/browser`. Configure confirmed production URLs in `apps/documentation/site.config.json`; indexing is deliberately disabled until the documentation URL is set. The documented 2.x workspace is unpublished; installation uses a locally packed tarball instead of assuming npm latest has the new APIs.

See [documentation maintenance](docs/DOCUMENTATION-MAINTENANCE.md), [coverage inventory](docs/DOCUMENTATION-INVENTORY.md) and [implementation report](docs/DOCUMENTATION-REPORT.md) for architecture, publication requirements and actual verification results.

| Command                     | Purpose                                                      |
| --------------------------- | ------------------------------------------------------------ |
| `npm run check`             | Architecture boundaries, ESLint, Prettier, strict TypeScript |
| `npm run lint:fix`          | Apply available ESLint fixes                                 |
| `npm run format`            | Apply formatting                                             |
| `npm test`                  | Library tests                                                |
| `npm run test:playground`   | Playground tests                                             |
| `npm run build`             | Production library, playground and documentation builds      |
| `npm run docs:api`          | Regenerate public signatures                                 |
| `npm run check:docs`        | Compile displayed documentation examples                     |
| `npm run pack:lib`          | Build and pack the npm artifact                              |
| `npm run check:package`     | Validate package files and pure-core import                  |
| `npm run test:compat -- 17` | Test packed library in an isolated Angular consumer          |

Chrome is the default browser. For installed Edge on Windows:

```powershell
$env:CHROME_BIN = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
npm.cmd test
```

ESLint checks TypeScript and inline/external Angular templates. Prettier owns formatting. Husky runs lint-staged on commit; CI runs the full checks. VS Code settings enable formatting and ESLint fixes on save.

## Structure

The publishable library lives under `libs/`; the interactive playground app lives under `apps/`. Root configuration, dependencies, formatting and linting are shared. The playground imports the built library's public API. Build either target with `npm run build:lib` or `npm run build:playground` (build the library first).

```text
libs/ngx-nepali-dualpicker/
  src/public-api.ts       Angular consumer API
  src/core-api.ts         Angular-free consumer API
  src/lib/
    core/                 Calendar data, conversion, arithmetic, parsing, validation
    configuration/        Defaults, DI token, immutable configuration merge
    datepicker/           Rendering and interaction adapter
      state/              Pure selection transitions
    pipes/                Standalone Angular pipes
    services/             Injectable facades
    themes/               Theme definitions and DOM adapters
  core/ng-package.json    Secondary entry point
apps/playground/ Interactive configuration playground
apps/documentation/ Guides, working examples and API reference
apps/shared/ Shared example catalogue, code viewer and app links
scripts/                  Architecture, docs, package and compatibility checks
```

Read [architecture](docs/ARCHITECTURE.md), [migration](docs/MIGRATION.md), [calendar limitations](docs/CALENDAR-ACCURACY.md), [public API](docs/PUBLIC-API.md) and [release checkpoint](docs/RELEASE-CHECKPOINT.md).

Validation commands do not publish, push or create public releases.

## Documentation application

Run `npm run build:lib` before building either app individually. Use `npm run build:docs` to build documentation, `npm run test:docs` for browser tests, and `npm run check:docs` to compile displayed examples. Regenerate source-derived signatures with `npm run docs:api`. `npm run build` builds all three projects.

Deploy `dist/documentation/browser` and `dist/playground/browser` independently. Configure each host to rewrite unknown paths to its own `index.html` for deep links. Set the public URLs in `apps/shared/configuration/app-links.ts` before deployment. The library test configuration remains under `libs/ngx-nepali-dualpicker/tsconfig.spec.json`.

See [Source layout and naming](docs/SOURCE-LAYOUT.md) for directory responsibilities and internal source renames.

The [architecture refactor report](docs/architecture/refactor-report.md) records the repository audit, complete trees, migration map, public API decisions, compatibility matrix and remaining release limitations.

The [accessible forms guide](docs/ACCESSIBILITY-AND-FORMS.md) covers readonly mode, optional validators, editable formats, keyboard interaction and manual screen-reader verification.

## Booking and calendar customization

The picker supports optional dual AD/BS cell labels, a synchronous `dateFilter`, inclusive `rangeConstraints`, typed `ndpDateCell` templates, and application-defined selection `presets`.

```ts
const config: DatePickerConfig = {
    calendar: 'BS',
    selectionMode: 'range',
    showSecondaryDate: true,
    dateFilter: (date) => date.day !== 15,
    rangeConstraints: { minDays: 3, maxDays: 14, preventCrossingUnavailableDates: true },
    validation: { enabled: true },
};
```

See [booking features and examples](docs/BOOKING-FEATURES.md) for callbacks, cell context, presets, error behavior, and calendar/date contracts. The playground includes a working booking example.
