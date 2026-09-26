# GAD-7 dependency inventory

Status: evidence-based inventory of the current extraction. This document describes `copied-from-main-repo` as inspected on 2026-09-26; it does not prescribe the final implementation.

## 1. Scope and inspection method

The inspected source root is `copied-from-main-repo`. The inventory was built from the file list, TypeScript imports, Angular templates and styles, `angular.json`, `package.json`, and the environment and entry-point files that are present in that directory. Classifications mean:

- **Required**: directly needed by the current GAD-7 component or by a local file it directly imports.
- **Indirectly required**: not imported by the GAD-7 component itself, but needed by a current shared module, Angular configuration, or runtime entry point that the current extraction expects to load.
- **Unrelated**: copied application functionality with no evidence of use by the current GAD-7 template or its direct feature logic.
- **Unresolved**: the extraction is incomplete or the evidence is insufficient to decide without running or reconstructing the original application.

This is an inventory, not an approval to preserve every current dependency. The final product scope in `_docs/PROJECT-SCOPE.md` requires a small offline application with no backend, login, analytics, CDN runtime assets, or unrelated psychology/application features.

## 2. Extraction completeness

The copied tree contains the GAD-7 folder, shared folders, assets, environment files, styles, and several Angular configuration files. It does **not** contain the files referenced by `src/main.ts` such as `src/app/app.module.ts`, `src/test.ts`, or `src/polyfills.ts`; therefore the copied tree cannot currently be proven to build independently from its present contents. No `src/app/user` shell, user-area, dashboard, navigation, or other route files are present beyond the GAD-7 folder.

The root package and Angular project are still named `yekravankav`, not `gad7`. `angular.json` also refers to missing Font Awesome paths under `src/assets/awesome/`. These are extraction/configuration findings for later isolation work, not changes made by this issue.

## 3. GAD-7 feature entry points and files

Entry point evidence:

- `copied-from-main-repo/src/app/user/tests/gad7/gad7.module.ts` declares `Gad7Component` and imports the two shared modules plus the feature routing module.
- `copied-from-main-repo/src/app/user/tests/gad7/gad7-routing.module.ts` maps its empty child path to `Gad7Component`.
- `copied-from-main-repo/src/app/user/tests/gad7/gad7.component.ts` is the component runtime entry point. It creates the form, performs HTTP calls, calculates results, and controls restart behavior.
- `copied-from-main-repo/src/main.ts` expects an absent root `AppModule` to bootstrap the application.

| File | Role and observed dependencies | Classification |
|---|---|---|
| `src/app/user/tests/gad7/gad7.component.ts` | Component class; imports Angular forms, `HttpClient`, local helpers/constants, `SessionID`, and `environment`. Calls `POST` on initialization/restart and `PATCH` on submit. | Required feature source; backend/session imports are incompatible with the final offline scope |
| `src/app/user/tests/gad7/gad7.component.html` | Questionnaire and result template. Uses `mat-card`, `mat-divider`, `mat-radio-group`, `mat-radio-button`, `mat-button`, `mat-raised-button`, `mat-stroked-button`, `mat-progress-bar`, `ngx-gauge`, `*ngIf`, `*ngFor`, reactive-form bindings, and `latinToPersianNumbers`. | Required feature source; requires local replacement or isolation of shared exports |
| `src/app/user/tests/gad7/gad7.component.scss` | Component styling for Material cards, progress bar, questionnaire options, result card, and `ngx-gauge`. | Required feature source |
| `src/app/user/tests/gad7/gad7.constants.ts` | Severity categories, severity/recommendation/color/emoji data, and seven question strings. The Persian text and emoji are visibly mojibake in the inspected file. | Required feature source; Unicode correction is a later task |
| `src/app/user/tests/gad7/gad7.helpers.ts` | Local pure helpers for severity thresholds, display text, recommendation, gauge color/emoji, and gauge markers. Imports only `gad7.constants.ts`. | Required feature source |
| `src/app/user/tests/gad7/gad7.module.ts` | NgModule boundary; imports `CommonModule`, `FormsModule`, `ReactiveFormsModule`, `ShareModule`, `UiShareModule`, and `Gad7RoutingModule`. | Required boundary; shared-module imports must be reduced or replaced |
| `src/app/user/tests/gad7/gad7-routing.module.ts` | Feature child route with empty path to `Gad7Component`. | Required route definition; final root integration is unresolved |

### Direct feature import graph

```text
gad7.module.ts
├─ @angular/core, @angular/common, @angular/forms
├─ ./gad7.component.ts
├─ ./gad7-routing.module.ts
├─ src/app/share/share.module.ts
└─ src/app/ui-share/ui-share.module.ts

gad7.component.ts
├─ @angular/core
├─ @angular/forms
├─ @angular/common/http (HttpClient)
├─ ./gad7.helpers.ts
├─ ./gad7.constants.ts
├─ src/app/share/sessionid.service.ts
└─ src/environments/environment.ts

gad7.helpers.ts ── ./gad7.constants.ts
gad7-routing.module.ts ── @angular/router, ./gad7.component.ts
gad7.component.html ── exports supplied by ShareModule and UiShareModule (listed below)
```

The component template does not reference `gad-7.jpg`; that image is copied but currently unreferenced.

## 4. Angular modules, directives, pipes, providers, and UI components

### Directly required by the current template/feature

| Symbol or module | Evidence | Current source |
|---|---|---|
| `CommonModule` | `*ngIf` and `*ngFor` in the template | Imported by `gad7.module.ts` |
| `FormsModule`, `ReactiveFormsModule` | Form group/control bindings and form construction | Imported by `gad7.module.ts` and `gad7.component.ts` |
| `MatCardModule` | `mat-card`, `mat-card-title`, `mat-card-content`, `mat-card-actions` | Re-exported by `src/app/ui-share/ui-share.module.ts` |
| `MatDividerModule` | `mat-divider` | Re-exported by `UiShareModule` |
| `MatButtonModule` | `mat-button`, `mat-raised-button`, `mat-stroked-button` | Re-exported by `UiShareModule` |
| `MatRadioModule` | `mat-radio-group`, `mat-radio-button` | Re-exported by `UiShareModule` |
| `MatProgressBarModule` | `mat-progress-bar` | Re-exported by `UiShareModule` |
| `NgxGaugeModule` / `ngx-gauge` | Result template uses `<ngx-gauge>` and its inputs | Imported and re-exported by `UiShareModule`; package `ngx-gauge` |
| `LatinToPersianNumbersPipe` | Template uses `latinToPersianNumbers` for question number, score, and gauge value | Declared/exported by `src/app/share/share.module.ts` |
| `RouterModule` | Feature route declaration | Imported by `gad7-routing.module.ts` |
| `SessionID` provider | Component injects it and uses `ensureSessionId` | Provided/exported through `ShareModule`; incompatible with final assessment persistence design |
| `HttpClient` | Component injects it and sends POST/PATCH requests | Imported directly in `gad7.component.ts`; requires an HTTP provider in the missing app shell |
| `environment` | Component reads `environment.apiBaseUrl` | `src/environments/environment.ts` |

### Shared-module exports that are present but not needed by the GAD-7 template

`UiShareModule` also declares/exports `LoadingOverlayComponent` and `EmotionBadgeComponent`, and imports/exports Material dialog, form-field, input, icon, stepper, snackbar, list, sidenav, toolbar, expansion, spinner, chips, paginator, Nebular card/layout, `BaseChartDirective`, and `NgxGaugeModule`. There is no reference to the loading overlay, emotion badge, chart, Nebular components, paginator, or the other controls in the GAD-7 template or component class. They are shared scaffolding, not demonstrated GAD-7 requirements.

`ShareModule` also declares/exports `PersianToEnglishNumbersPipe`, `NewReviewComponent`, `FaDigitsPaginatorDirective`, `FaDateOnlyPipe`, and `FaDateYmdPipe`, and provides `FaPaginatorIntl` and `MatPaginatorIntl`. None is referenced by the GAD-7 feature. The only shared export demonstrated as required by the feature template is `LatinToPersianNumbersPipe`; `SessionID` is used by the component only because the current implementation still performs session/API work.

## 5. Shared and copied source inventory

| Path | Observed role | GAD-7 classification |
|---|---|---|
| `src/app/share/latin-to-persian-numbers.pipe.ts` | Converts Latin digits to Persian digits; exported by `ShareModule` and used in the GAD-7 template. | Required, or replaceable by a local feature pipe |
| `src/app/share/sessionid.service.ts` | Creates/reads a `gad7_session_id` value in `localStorage`. | Indirectly required by current code; incompatible backend/session dependency for final scope |
| `src/app/share/persian-to-latin-numbers.pipe.ts` | Reverse digit conversion. | Unrelated to observed GAD-7 use |
| `src/app/share/fa-date-only.pipe.ts` | Persian date formatting. | Unrelated to observed GAD-7 use |
| `src/app/share/fa-date-ymd.pipe.ts` | Persian year/month/day formatting. | Unrelated to observed GAD-7 use |
| `src/app/share/fa-digits-paginator.directive.ts` | Converts digits in Material paginator/overlay elements. | Unrelated to observed GAD-7 use |
| `src/app/share/fa-paginator-intl.ts` | Persian Material paginator labels. | Unrelated to observed GAD-7 use |
| `src/app/share/new-review/new-review.component.ts` | Review submission UI; belongs to another business feature. | Unrelated |
| `src/app/share/new-review/new-review.component.html` | Review form template with rating/input controls. | Unrelated |
| `src/app/share/new-review/new-review.component.css` | Review form styling. | Unrelated |
| `src/app/share/share.module.ts` | Aggregates the above shared utilities and review feature; provides session and paginator services. | Indirect scaffolding; must not be copied wholesale into final app |
| `src/app/ui-share/loading-overlay/loading-overlay.component.ts` | Generic loading overlay. | Unrelated; no GAD-7 template use |
| `src/app/ui-share/loading-overlay/loading-overlay.component.html` | Loading overlay template. | Unrelated |
| `src/app/ui-share/loading-overlay/loading-overlay.component.scss` | Loading overlay styling. | Unrelated |
| `src/app/ui-share/emotion/emotion-badge.component.ts` | Emotion badge UI. | Unrelated |
| `src/app/ui-share/emotion/emotion-badge.component.html` | Emotion badge template. | Unrelated |
| `src/app/ui-share/emotion/emotion-badge.component.scss` | Emotion badge styling. | Unrelated |
| `src/app/ui-share/emotion/emotion-theme.ts` | Emotion labels, tones, icons, and chart colors. | Unrelated |
| `src/app/ui-share/emotion/emotion-badge.component.spec.ts` | Tests for unrelated emotion badge. | Unrelated/test-only |
| `src/app/ui-share/emotion/emotion-theme.spec.ts` | Tests for unrelated emotion theme. | Unrelated/test-only |
| `src/app/ui-share/ui-share.module.ts` | Aggregates broad Material/Nebular/chart/gauge UI dependencies. | Indirect scaffolding; retain only the demonstrated card/divider/button/radio/progress/gauge pieces |

No copied `user-area`, dashboard, navigation, review route, emotion route, or other business-feature files were found in the current file list. Their absence is not evidence that the missing original application did not contain them; it is an extraction boundary to preserve.

## 6. Runtime, session, route, and API dependencies

The current GAD-7 component has three server-bound operations:

1. On `ngOnInit`, it obtains `gad7_session_id` through `SessionID.ensureSessionId` and sends `POST environment.apiBaseUrl + '/test/gad7?action=enter'` with the session ID.
2. On submit, it calculates the local score and sends `PATCH environment.apiBaseUrl + '/test/gad7?action=calculate-result'` with the session ID and severity.
3. On restart, it removes `gad7_session_id`, creates a new session ID, and sends the same initial `POST`.

Environment values are:

| File | `production` | `analyticsEnabled` | API base URL | Other value |
|---|---:|---:|---|---|
| `src/environments/environment.ts` | `false` | `false` | `http://localhost:3000` | ARCaptcha site key `k229kzo5ia` |
| `src/environments/environment.prod.ts` | `true` | `true` | `/api` | ARCaptcha site key `k229kzo5ia` |
| `src/environments/environment.spec.ts` | Test expectation | N/A | N/A | Expects development ARCaptcha key `0000000000`, which conflicts with `environment.ts` as copied |

These are external/backend or tracking-related dependencies and must be removed or replaced for the final offline product. The final local persistence design is not present in the copied source; no GAD-7-specific history key or saved-record schema exists yet. The existing `gad7_session_id` local-storage value is a server session identifier, not assessment history.

Routing evidence is limited to the feature child route in `gad7-routing.module.ts`. The root route and root `AppModule` are absent. `main.ts` imports the missing `src/app/app.module`; therefore the final root mapping remains unresolved from this extraction.

## 7. Assets, fonts, styles, and external URLs

### Present local assets

| Path | Evidence of use | Classification |
|---|---|---|
| `src/assets/images/user/gad-7.jpg` | Present in the extraction; no reference in the GAD-7 template, component, styles, or config was found. | Unreferenced/possibly required visual reference; verify before removal |
| `src/assets/fonts/Vazir.ttf` | Referenced by `src/styles.scss`; body and Nebular theme use Vazir. | Required for current RTL typography if global styles are retained |
| `src/assets/fonts/Vazir-Thin.ttf` | Referenced by `src/styles.scss`. | Possibly required; no GAD-7-specific thin-face usage found |
| `src/assets/fonts/Vazir-Bold.ttf` | Referenced by `src/styles.scss`. | Possibly required; no explicit component use found |
| `src/assets/fonts/IRANSans.ttf` | Referenced by `src/styles.scss`. | Possibly required global font; no direct GAD-7 use found |
| `src/assets/fonts/IRANSans_Light.ttf` | Referenced by `src/styles.scss`. | Possibly required global font; no direct GAD-7 use found |
| `src/assets/fonts/material-symbols/material-symbols-outlined.woff2` | Referenced by `src/styles.scss` font-face. | Possibly required global icon font; no GAD-7 template icon found |
| `src/favicon.png` | Included by `angular.json`; linked by `src/index.html`. | Indirectly required application asset |

### Referenced but absent assets/configuration

`angular.json` and `src/styles.scss` reference `src/assets/awesome/css/all.css` and `src/assets/awesome/webfonts`. Neither appears in the copied file list. The build/test asset glob for `src/assets/awesome/webfonts` therefore cannot be verified from this extraction. `src/styles.scss` also imports Nebular global styles and `@angular/material/theming`; those imports pull in package styles unrelated to the minimal GAD-7 surface unless retained intentionally.

`src/index.html` loads `https://www.googletagmanager.com/gtag/js?id=G-NHGJ6G4YZ1`, defines `dataLayer`, and calls `gtag`. This is an external CDN/analytics runtime dependency and violates the final scope. It must be removed in the standalone application. The document title is also mojibake in the copied file.

`src/main.ts` imports `chart.js` and sets Chart.js defaults, but no chart is used by the GAD-7 feature. This is an unrelated or unresolved root-entry dependency, not a demonstrated GAD-7 requirement.

## 8. Package dependency inventory

The following table covers every package listed in `copied-from-main-repo/package.json`. “Possibly required” means the package is pulled by current shared/configuration code or may be needed by the current Angular setup, but the GAD-7 feature itself does not demonstrate a direct need.

### Runtime dependencies

| Package | Evidence/classification |
|---|---|
| `@angular/animations` | Possibly required by Angular Material/Nebular UI; no direct GAD-7 import found. |
| `@angular/cdk` | Possibly required by `FaDigitsPaginatorDirective`/`OverlayModule` in unrelated shared code; not needed by the observed GAD-7 template directly. |
| `@angular/common` | Required by `CommonModule` and template structural directives. |
| `@angular/compiler` | Possibly required Angular runtime/build package; no feature-level import. |
| `@angular/core` | Required by component, modules, routing module, helpers' Angular-adjacent feature boundary. |
| `@angular/forms` | Required for the reactive form and controls. |
| `@angular/localize` | Unresolved/possibly required only by missing broader application configuration; no GAD-7 reference found. |
| `@angular/material` | Required for the Material controls used by the template, subject to replacing the broad `UiShareModule`. |
| `@angular/platform-browser` | Possibly required by the missing root application bootstrap; no direct GAD-7 import. |
| `@angular/platform-browser-dynamic` | Indirectly required by `src/main.ts` bootstrap; not a feature-level dependency. |
| `@angular/router` | Required for `Gad7RoutingModule`; root routing integration remains missing. |
| `@nebular/auth` | Unrelated/possibly required only by global styles; no GAD-7 behavior uses it. |
| `@nebular/eva-icons` | Unrelated; no GAD-7 reference found. |
| `@nebular/security` | Unrelated; no GAD-7 reference found. |
| `@nebular/theme` | Unrelated to the observed feature; imported by `styles.scss`, `themes.scss`, and `UiShareModule` for copied application scaffolding. |
| `@ng-bootstrap/ng-bootstrap` | Unrelated; used by `ShareModule`'s review component (`NgbRatingModule`). |
| `@popperjs/core` | Possibly transitive support for Bootstrap/NgBootstrap; no GAD-7 reference. |
| `arcaptcha-angular` | Unrelated/external anti-bot integration; no GAD-7 template reference, but environment contains site keys. |
| `bootstrap` | Unrelated to the observed component behavior; globally configured CSS and review scaffolding may use it. |
| `chart.js` | Unrelated to GAD-7; imported only by `src/main.ts` and indirectly associated with copied chart support. |
| `chartjs-plugin-datalabels` | Unrelated; no reference in the inspected GAD-7 or shared files. |
| `eva-icons` | Unrelated; no GAD-7 reference found. |
| `ng2-charts` | Unrelated; `BaseChartDirective` is imported/exported by `UiShareModule`, but no GAD-7 chart exists. |
| `ngx-gauge` | Required by the result template and component stylesheet. Verify compatibility during isolation. |
| `rxjs` | Required by current `HttpClient` subscriptions and indirectly by Angular; will become unnecessary for HTTP if that code is removed, subject to Angular runtime needs. |
| `zone.js` | Possibly required by this Angular 17 bootstrap/configuration; not a GAD-7 domain dependency. |

### Development dependencies

| Package | Evidence/classification |
|---|---|
| `@angular-devkit/build-angular` | Indirectly required by the copied Angular CLI build/test configuration; not feature-specific. |
| `@angular/cli` | Indirectly required for the configured `ng` commands. |
| `@angular/compiler-cli` | Indirectly required to compile the Angular project. |
| `@types/jasmine` | Test-only infrastructure; no GAD-7 test is present. |
| `jasmine-core` | Test-only infrastructure. |
| `karma` | Test-only infrastructure referenced by `angular.json`, though the referenced `karma.conf.js` is absent. |
| `karma-chrome-launcher` | Test-only browser launcher. |
| `karma-coverage` | Test-only coverage support; no current GAD-7 coverage configuration found. |
| `karma-jasmine` | Test-only adapter. |
| `karma-jasmine-html-reporter` | Test-only reporter. |
| `tslib` | Possibly required TypeScript helper runtime/build support. |
| `typescript` | Indirectly required by the Angular source/build. |

The package manifest also defines `test:headless`, but no `karma.conf.js` is present in the copied file list. This command and the complete test entry point are unresolved until the missing test/bootstrap files are restored or the extraction is rebuilt.

## 9. Classification summary for Issues #4 and #5

Issue #4 (isolation) can begin with the following demonstrated local boundary:

- Keep the seven files under `src/app/user/tests/gad7/` as the behavioral reference.
- Keep the pure helper/constants relationship.
- Replace the `ShareModule` dependency with only the Persian-number conversion behavior, or a local feature equivalent.
- Replace the broad `UiShareModule` dependency with only Material card/divider/button/radio/progress modules and the gauge implementation, or approved local equivalents.
- Remove `HttpClient`, `SessionID`, `environment.apiBaseUrl`, and the two `/test/gad7` endpoint values as part of the offline flow boundary, not as a server integration.
- Decide whether `ngx-gauge` remains or is replaced after a focused rendering check.

Issue #5 (cleanup) has clear unrelated candidates:

- `share/new-review/**`, date pipes, paginator services/directive, reverse-number pipe, and the broad `ShareModule` exports.
- `ui-share/loading-overlay/**`, `ui-share/emotion/**`, emotion tests, and unrelated Material/Nebular/chart/paginator/sidenav/toolbar modules in `UiShareModule`.
- Nebular, Bootstrap, NgBootstrap, Nebular auth/security/icons, Eva icons, Chart.js, ng2-charts, chart data labels, ARCaptcha, and analytics/CDN references, subject to confirming no missing root application code still needs them.
- Missing/unused `src/assets/awesome/**` references and the unreferenced `gad-7.jpg` require explicit evidence before deletion.

Do not delete the above solely from this document: the missing `AppModule`, test files, and broader original route configuration are unresolved evidence gaps.

## 10. Unresolved questions and evidence needed

| Question | Why unresolved | Evidence needed |
|---|---|---|
| What root module/routes originally loaded `Gad7Module`? | `src/app/app.module.ts` and broader app routes are absent. | Restore the missing shell or inspect the source extraction manifest; then trace route imports. |
| Is `ngx-gauge` required in the final visual reference? | The template uses it, but no successful standalone build/render is possible from the copied tree. | Build an isolated feature and verify result rendering against the reference. |
| Which exact Material modules are required after removing `UiShareModule`? | Current shared module re-exports many modules. | Compile a minimal module and run a component render test. |
| Is `latinToPersianNumbers` the intended final pipe behavior? | It is used by the template, but all visible Persian strings are mojibake and no visual verification exists. | Inspect the intended UTF-8 source/reference and test rendered Persian digits. |
| Are the copied Persian strings recoverable from the source? | `gad7.constants.ts`, `gad7.component.html`, and `index.html` contain mojibake sequences. | Obtain an authoritative UTF-8 source or product copy, then perform an encoding-safe visual verification. |
| Is `gad-7.jpg` required? | It exists but has no current reference. | Search the original feature design/template or compare the intended screen before removal. |
| Are Font Awesome assets required? | Angular config/styles reference missing `src/assets/awesome/**` files. | Restore/list the original assets or remove the references and verify the build. |
| Is Chart.js needed by any missing app shell? | `main.ts` imports it; the GAD-7 feature does not. | Inspect/restored root module and routes, then remove if no chart route remains. |
| What is the authoritative ARCaptcha requirement? | Environment keys exist but no copied component uses the package. | Trace the missing app module and search the complete original extraction; final scope says no external runtime service. |
| What is the intended history schema? | Current storage only holds a server session ID. | Define and test a versioned GAD-7-local schema in the later persistence issue. |
| Is `environment.spec.ts` stale? | It expects a test key different from `environment.ts`. | Run the restored test suite or reconcile the source before relying on the test. |
| Which server routing strategy will be used? | Only a child route is present; root/static fallback config is absent. | Decide hash/deployment-safe routing during static deployment work and verify a production build. |

## 11. Change boundary for this issue

Only `_docs/gad7-dependency-inventory.md` is delivered for Issue #3. No production source, package manifest, generated output, or file under `copied-from-main-repo` was modified. Because this issue produces documentation rather than production behavior, a production test-first test is not applicable; adding a test would not exercise the deliverable. Lightweight validation should instead confirm that the documented paths and package names match the current repository state.
