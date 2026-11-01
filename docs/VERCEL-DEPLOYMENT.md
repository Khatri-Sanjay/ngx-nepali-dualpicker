# Deploy documentation and playground on Vercel

Create **two Vercel projects connected to this same Git repository**. Both use the repository root because dependencies, Angular configuration and the library are shared. Each project builds only its selected app plus the library. No serverless functions are deployed: documentation uses prerendered HTML and the playground is a prerendered Angular application.

The root `vercel.json` runs `npm ci` and `npm run build:vercel`. The build writes Vercel's version 3 Build Output API to `.vercel/output`, including app-specific routes and response headers. Do not set an output-directory override or move the project root to `apps/documentation` or `apps/playground`.

## Project settings

| Setting          | Documentation project                     | Playground project                  |
| ---------------- | ----------------------------------------- | ----------------------------------- |
| Git repository   | This repository                           | This repository                     |
| Root Directory   | Repository root (`.` / leave empty)       | Repository root (`.` / leave empty) |
| Framework Preset | Other                                     | Other                               |
| Node.js Version  | 24.x                                      | 24.x                                |
| Install Command  | `npm ci` (from vercel.json)               | Same                                |
| Build Command    | `npm run build:vercel` (from vercel.json) | Same                                |
| Output Directory | Leave override disabled                   | Leave override disabled             |
| `NDP_DEPLOY_APP` | `documentation`                           | `playground`                        |

Vercel retired Node 20 on October 1, 2026. The root engine range now allows Node 24 as well as the existing local Node 20 baseline. `.nvmrc` and `.node-version` retain the existing local pin. Angular 17's official Node compatibility does not include Node 24; the static builds have been validated locally with Node 24, but a supported Angular/toolchain upgrade remains advisable. This configuration does not change Angular or library peer dependencies.

## Environment variables

Set these variables in **both projects**, for **Production and Preview** environments, before building:

| Variable             | Value                                                                    |
| -------------------- | ------------------------------------------------------------------------ |
| `NDP_DEPLOY_APP`     | The project-specific value above                                         |
| `NDP_DOCS_URL`       | The actual HTTPS production origin assigned to the documentation project |
| `NDP_PLAYGROUND_URL` | The actual HTTPS production origin assigned to the playground project    |

Use confirmed origins only, without a path, query, fragment or credentials. Trailing `/` is accepted. Vercel provides `VERCEL_ENV` automatically; do not override it. No tokens or secrets belong in these public URL variables.

Import/create the projects, note their assigned domains, then set the variables and deploy/redeploy. Custom domains can replace the assigned domains later; update both projects' variables and redeploy both apps to refresh links and metadata. The confirmed documentation and playground origins are committed in the site and shared link configuration.

Production documentation emits canonical/social URLs, robots and sitemap entries using `NDP_DOCS_URL`. Preview documentation omits canonical URLs, disallows crawling and receives `X-Robots-Tag: noindex, nofollow`. Preview links intentionally point to the configured production counterpart; the build does not guess matching cross-project preview URLs.

The build temporarily supplies the environment URLs to both apps, then restores source configuration files, robots and sitemap in `finally`. The committed configuration uses the public project links. Build one deployment target at a time in a given checkout because these temporary inputs are shared.

## Routing and embedding

- Documentation routes serve their actual prerendered `index.html`, including direct links and refreshes. Unknown URLs return the custom page with HTTP **404**, rather than a 200 SPA fallback. The existing `/readOnly` alias redirects to `/read-only`.
- The legacy `/playground` URL redirects to `/`. Playground serves existing assets first and falls back to its `index.html` for extensionless Angular routes. Missing `.js`, `.css` and other asset URLs remain **404**.
- The documentation's playground link and optional iframe use `NDP_PLAYGROUND_URL`. Playground navigation links back to `NDP_DOCS_URL`. No localhost app-navigation origins are substituted in production.
- No `X-Frame-Options: DENY/SAMEORIGIN` is added to playground, because the documentation may embed it across project origins. Vercel Deployment Protection can still block preview iframe access; use the standalone link or configure protection appropriately. No access controls are disabled by these files.
- Both targets receive `nosniff` and a referrer policy. Preview deployments receive a noindex header. Both production apps allow indexing and include sitemaps. Preview builds disallow indexing.

## Local verification

PowerShell example using the confirmed public origins:

```powershell
$env:NDP_DEPLOY_APP = 'documentation' # or playground
$env:NDP_DOCS_URL = 'https://ngx-nepali-dualpicker-docs.vercel.app'
$env:NDP_PLAYGROUND_URL = 'https://ngx-nepali-dualpicker-playground.vercel.app'
$env:VERCEL_ENV = 'production' # or preview
npm.cmd run build:vercel
npm.cmd run check:vercel
```

`check:vercel` validates the generated artifact's route destinations, static assets, custom 404/SPA behavior and production/preview indexing policy. It is a local artifact check, not a request to a live Vercel deployment. Clear these environment variables before unrelated local builds. `.vercel/` is ignored; project links and deployment output must not be committed.

Run repository quality checks and app tests after the deployment build finishes and restores its temporary configuration. Running `format:check` during a deployment build can report the temporary JSON configuration as unformatted; app tests may read deployment URLs or race the shared library rebuild.

For library regression tests on Windows, Karma needs a Chromium browser. If Chrome is unavailable but Microsoft Edge is installed at the standard location:

```powershell
$env:CHROME_BIN = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
npm.cmd test
```

### Review checkpoint (2026-11-01)

The library review found that `ThemeService.isValidTheme()` checked only whether top-level sections were truthy. Malformed nested typography could pass validation and then throw during theme application. Validation now checks required nested fields, string values and finite numeric font weights, with regression coverage.

The library's 189 tests, production package build, package checks and core bundle check passed locally on Node 24.19.0. The calendar check passed 51,032 daily round trips in each direction; independent historical accuracy remains outside that check (see [calendar accuracy and range](./CALENDAR-ACCURACY.md)).

Both documentation and playground passed local Vercel artifact checks in production and preview modes using reserved test origins. These checks do not establish live domain, account protection or iframe behavior on Vercel.

After connecting the real projects, verify both assigned domains, direct documentation URLs, unknown-page HTTP status, asset responses, cross-app links and iframe behavior on Vercel. Account/project settings and public deployment were not changed by the repository setup.

References: [Vercel monorepos](https://vercel.com/docs/monorepos), [Build Output API](https://vercel.com/docs/build-output-api), [route configuration](https://vercel.com/docs/build-output-api/configuration), and [Node 20 retirement](https://vercel.com/changelog/node-js-20-is-being-deprecated).
