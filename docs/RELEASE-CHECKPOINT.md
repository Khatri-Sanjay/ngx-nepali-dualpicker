# Implementation checkpoint — 2026-10-30

Work now lives in `F:\POJECTS\nepali-dualpicker-workspace`. The source repository was readable and initially clean. The first configuration and interaction regressions were reproduced there, fixed, and imported here. Subsequent architecture, packaging and tooling changes were made here.

## Completed

- Import the real Angular library, demo, tests and packaging scripts.
- Separate core calendar operations, configuration, selection transitions, Angular services, pipes, picker and themes.
- Extract pure conversion functions while retaining table data, epoch, cumulative offsets and binary search.
- Add a packaged core entry point and executable dependency-boundary checks.
- Use signal-backed application configuration with independent nested snapshots.
- Share range/multiple normalization between clicks and external form writes.
- Guard disabled date selection, clear and manual-input mutation.
- Preserve child buttons/selects/text controls' keyboard events.
- Track deferred picker callbacks and cancel them on destruction.
- Remove the currency implementation, public export, demo and generated documentation.
- Configure ESLint, Angular template rules, typed promise rules, Prettier, strict TypeScript, EditorConfig, VS Code, Husky, lint-staged and CI checks.
- Add migration, architecture, calendar limitations and package validation documentation.

## Verification in this workspace

| Check                                                 | Result                                                                      |
| ----------------------------------------------------- | --------------------------------------------------------------------------- |
| Architecture boundaries and cycles                    | Passed, 24 implementation modules                                           |
| ESLint, Prettier, strict TypeScript                   | Passed                                                                      |
| Library Jasmine/Karma suite                           | 60 passed                                                                   |
| Playground Jasmine/Karma suite                        | 36 passed, including controls, routing, reset and disabled-preview behavior |
| Library production build                              | Passed, root and core entry points                                          |
| Playground production build                           | Passed, output dist/playground                                              |
| Displayed documentation examples                      | 31 compiled, including generated enabled/disabled playground code           |
| Package export/file checks and standalone core import | Passed                                                                      |
| Angular 17–22 packed consumer matrix                  | Script/workflow retained and extended for core; not executed here           |
| SSR/hydration and Playwright/axe                      | Not executed; fixtures not yet implemented                                  |

Tests used installed Edge 156 through Karma's Chromium launcher because Chrome is absent. Local commands used Node 24.19.0. The workspace pins Node 20.19.0 for the Angular 17 build baseline; the local run is not proof of an officially supported Angular/Node pairing. Review current official Angular toolchain compatibility before running each consumer major.

Four new configuration/interaction tests were observed failing before their fixes. Existing conversion tests and table-offset round trips passed; these do not establish independent calendar accuracy.

## Required before stable publishing

1. Complete the repository audit and independently verify historical calendar references, data provenance and exact conversion endpoints.
2. Decompose the large inherited picker into calendar/header/grid/navigation/overlay adapters; separate legacy zero-based component state from one-based public types.
3. Reconcile all runtime configuration changes with selection, calendar grids, focus, year lists and forms.
4. Finish strict token formatting and matching named-month parsing. The inherited parser is numeric; do not advertise every display format as manually editable.
5. Finish readonly/form validators, disabled navigation semantics, roving DOM focus, grid semantics, focus restoration and CDK overlay evaluation.
6. Implement the remaining toolkit capabilities: date-time, modal, dedicated month/year selection, multiple months, custom filters, events/holidays, fiscal utilities, templates, locale registration and additional pipes.
7. Isolate global styles/themes, test independent themes, and implement repeatable SSR/hydration consumers.
8. Execute the packed Angular 17–22 matrix with compatible Node/TypeScript versions; run browser accessibility tests and bundle analysis.
9. Review public contracts and all release metadata, inspect the final tarball, and explicitly authorize any publish or remote release.

Version is `2.0.0` because removals and normalization/read changes are breaking. This checkpoint is runnable but is not the completed, verified stable toolkit. No npm publish, remote push or public release was performed.
