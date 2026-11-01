# Incremental architecture plan — 2026-10-30

This plan follows the fresh [repository baseline](review-baseline.md). It describes changes for this review, not the earlier refactors already present in the workspace.

## Chosen architecture

Retain `libs/ngx-nepali-dualpicker`, both application projects, and the two existing public entry points. The existing `core` directory is specifically the calendar domain; it is not a general utility bucket. Do not move it to a new `projects` hierarchy or introduce empty directives/templates/features. The component remains the CVA and selection orchestration boundary, with private view components and component-scoped browser/theme adapters.

## Migration map

Paths below are relative to `libs/ngx-nepali-dualpicker/src/lib` unless a workspace path is shown.

| Current file                                                | Target                                                     | Action                                                        | Reason and boundary                                                  | API/risk                                                            |
| ----------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `core/calendar/calendar-operations.ts`                      | `core/models/calendar-system.model.ts`                     | Extract `CalendarSystem` type; update direct imports          | Calendar identity is a domain contract independent of operations     | Public `/core` type export remains; low                             |
| `core/locale/numeral-mappings.ts`                           | Same, plus `core/locale/convert-numerals.ts`               | Keep data; centralize numeral conversions                     | Parser, formatter, pipe and cell builder duplicate locale conversion | Internal only; preserve acceptance rules; low                       |
| `datepicker/ngx-nepali-dualpicker.component.ts`             | Same, plus `datepicker/overlay/picker-popup.controller.ts` | Delegate measurement, active listeners and coordinate state   | DOM ownership belongs to the popup adapter rather than the CVA       | Preserve public coordinate signals, methods and event order; medium |
| `datepicker/overlay/popup-position.ts`                      | Same                                                       | Keep pure geometry                                            | Existing separation is appropriate; add boundary tests where needed  | Internal; low                                                       |
| `themes/theme.service.ts`                                   | Same, plus `themes/theme.service.spec.ts`                  | Correct system-theme application after failing test           | Theme stream and applied CSS must agree                              | Bug correction within existing behavior; medium                     |
| `core/calendar/date-conversion.ts`                          | Same, plus `core/calendar/date-conversion.spec.ts`         | Preserve algorithm/data; add endpoint/round-trip coverage     | Conversion boundaries need direct domain tests                       | No behavior/range changes; low                                      |
| `scripts/check-package.mjs`                                 | Same                                                       | Verify all established named exports and exclude apps/tooling | Catch accidental public export removal and package pollution         | Verification only; low                                              |
| `scripts/check-calendar.mjs`                                | New                                                        | Exhaustive daily round trips and dataset checksum             | Stronger conversion consistency evidence than sample dates           | Verification only; no independent accuracy claim                    |
| `scripts/check-compatibility.mjs`                           | Same                                                       | Add real server-rendering smoke and accurate fixture metadata | Existing isolated consumer checks cover browser forms but not SSR    | Fixture dependencies only; no library dependencies                  |
| `libs/ngx-nepali-dualpicker/README.md` and docs app content | Same                                                       | Correct theme example, limitations and stale statements       | Published documentation must match checked implementation            | Documentation only                                                  |
| All other current files                                     | Same                                                       | Keep                                                          | No demonstrated need for another rename or architecture layer        | No change                                                           |

## Planned additions in their actual owners

```text
libs/ngx-nepali-dualpicker/src/lib/
  core/models/calendar-system.model.ts
  core/locale/convert-numerals.ts
  core/locale/convert-numerals.spec.ts
  core/calendar/date-conversion.spec.ts
  datepicker/overlay/picker-popup.controller.ts
  themes/theme.service.spec.ts
scripts/check-calendar.mjs
docs/architecture/review-baseline.md
docs/architecture/refactor-plan.md
docs/architecture/refactor-report.md
```

The complete existing tree is in the baseline; the final report will include the complete resulting source tree and actual validation outcomes.

## Sequence and safeguards

1. Capture baseline, source tree, imports, public exports and dataset bytes before implementation.
2. Add failing regression coverage for system-theme CSS application.
3. Separate domain contracts and numeral conversion without changing calendar tables or results.
4. Extract popup ownership while retaining the public component adapters; keep state local to each picker.
5. Add direct conversion tests, exhaustive packaged-core verification and export checks.
6. Run all existing application/library checks, displayed-code compilation, packaging and isolated consumer checks. Attempt real SSR in installed consumer environments; report inaccessible environments rather than claiming support.
7. Record unchanged APIs, preserved legacy zero-based state, official toolchain requirements, unresolved dataset provenance, hydration and accessibility limits.

No CDK dependency, global state store, new feature, selector rename, date-value redesign or supported-range change is planned. Private internals exposed through the existing component declaration will be documented and retained; removing them requires a separate compatibility decision.

## Additional finding during domain verification

A focused failing test confirmed that `DateCalculator.getDaysInAdMonth` returned undefined for invalid months despite its numeric return contract. Add integer/year and 1?12 month checks in that existing file; preserve valid results and conversion ranges. Document this invalid-input correction in the migration guide and rerun the final package consumers.
