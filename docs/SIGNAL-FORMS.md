# Signal Forms compatibility

The packed `ngx-nepali-dualpicker` 2.x source package was exercised with Angular Signal Forms through its existing `ControlValueAccessor` implementation. The library retains its Angular 17 build baseline and does not import `@angular/forms/signals`.

## Tested behavior

| Scenario                                                 | Angular 21.2.25                       | Angular 22.2.4                 |
| -------------------------------------------------------- | ------------------------------------- | ------------------------------ |
| Strict production compilation of `[formField]`           | Pass                                  | Pass                           |
| Model writes and day-click updates                       | Pass                                  | Pass                           |
| Calendar switching and clearing                          | Pass                                  | Pass                           |
| Schema-driven disabled state and re-enabling             | Pass                                  | Pass                           |
| Touched/dirty state and explicit-value reset             | Pass                                  | Pass                           |
| Range objects and partial endpoints                      | Pass                                  | Pass                           |
| Multiple arrays, deselection, and selection limits       | Pass                                  | Pass                           |
| Signal Forms schema `required`                           | Pass                                  | Pass                           |
| Picker validators forwarded to Signal Forms field errors | Not forwarded by Angular's CVA bridge | Pass with `validation.enabled` |
| Invalid text preserves the previous valid model          | Pass                                  | Pass                           |

Tests use the actual npm tarball in isolated consumers, not source aliases. Browser execution uses Microsoft Edge in headless Chromium mode on Windows, with Node 24.19.0. Exact dependency versions and tarball digests are recorded in each consumer's `verification.json` under `tmp/compat-angular-<major>/` after a successful run.

## Usage

Import `FormField` from `@angular/forms/signals` in an Angular version that provides it, create a model with `signal()` and a field tree with `form()`, then bind:

```html
<ngx-nepali-dualpicker [config]="config" [formField]="fields.date" />
```

Use one forms binding per picker. Do not also attach `ngModel` or `formControl` to the same instance. Model values follow `DatePickerValue`: clearing a single date emits `null`, and a partially selected range has a null endpoint. Type your application model accordingly. Validation rules should match the active calendar and selection mode.

On **Angular 22.2.4**, enable `validation: { enabled: true }` to forward the picker's legacy validators, including invalid drafts, unavailable dates, range constraints, and multiple limits. Angular schema validation such as `required()` remains separate.

On **Angular 21.2.25**, availability and range rules still prevent invalid user selections, but the CVA bridge does not collect `NG_VALIDATORS`. Do not rely on picker validation to invalidate the Signal Forms field. Supply equivalent schema validation for model values, or use reactive/template-driven forms when you need the picker's integrated draft validation. This is a tested integration limitation, not full validation support.

## Regression fixed

Angular 22 invokes legacy validators within a computed value. The picker's `validate()` previously wrote its UI feedback signal directly in that context, throwing `NG0600`. Feedback writes now run through `untracked()`, while configuration and draft-error reads remain tracked. A library regression test checks validation from a computed with invalid, valid, and validation-disabled inputs.

## Reproduce

```powershell
$env:CHROME_BIN = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
npm.cmd run build:lib
npm.cmd run test:compat -- 21
npm.cmd run test:compat -- 22
npm.cmd test
```

The compatibility command installs the packed library in an isolated consumer, builds it, runs six Signal Forms scenarios plus the existing forms/core scenario, and checks server rendering with the existing reactive/template-driven host. That server check does not test Signal Forms SSR or hydration.

Reusable consumer sources live in `scripts/signal-forms-fixture.mjs`. The compatibility runner includes them only for Angular 21 and newer. The results apply to the tested versions and scenarios; they do not establish native `FormValueControl` support or full Signal Forms hydration compatibility.

References: [Angular FormField](https://angular.dev/api/forms/signals/FormField), [custom controls](https://angular.dev/guide/forms/signals/custom-controls), and [Signal Forms validation](https://angular.dev/guide/forms/signals/validation).
