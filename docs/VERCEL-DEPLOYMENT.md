# Deploy documentation and playground on Vercel

Create **two Vercel projects connected to this same Git repository**. Both use the repository root because dependencies, Angular configuration and the library are shared. Each project builds only its selected app plus the library. No serverless functions are deployed: documentation uses prerendered HTML and the playground is a browser SPA.

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

Import/create the projects, note their assigned domains, then set the variables and deploy/redeploy. Custom domains can replace the assigned domains later; update both projects' variables and redeploy both apps to refresh links and metadata. No real project IDs or domains are committed to this repository.

Production documentation emits canonical/social URLs, robots and sitemap entries using `NDP_DOCS_URL`. Preview documentation omits canonical URLs, disallows crawling and receives `X-Robots-Tag: noindex, nofollow`. Preview links intentionally point to the configured production counterpart; the build does not guess matching cross-project preview URLs.

The build temporarily supplies the environment URLs to both apps, then restores source configuration files, robots and sitemap in `finally`. Local development keeps its localhost links. Build one deployment target at a time in a given checkout because these temporary inputs are shared.

## Routing and embedding

- Documentation routes serve their actual prerendered `index.html`, including direct links and refreshes. Unknown URLs return the custom page with HTTP **404**, rather than a 200 SPA fallback. The existing `/readOnly` alias redirects to `/read-only`.
- Playground serves existing assets first and falls back to its `index.html` for extensionless Angular routes. Missing `.js`, `.css` and other asset URLs remain **404**.
- The documentation's playground link and optional iframe use `NDP_PLAYGROUND_URL`. Playground navigation links back to `NDP_DOCS_URL`. No localhost app-navigation origins are substituted in production.
- No `X-Frame-Options: DENY/SAMEORIGIN` is added to playground, because the documentation may embed it across project origins. Vercel Deployment Protection can still block preview iframe access; use the standalone link or configure protection appropriately. No access controls are disabled by these files.
- Both targets receive `nosniff` and a referrer policy. Preview deployments receive a noindex header. Playground has a disallow-all robots file; documentation is the searchable reference site.

## Local verification

PowerShell example using **reserved test origins**, not real deployments:

```powershell
$env:NDP_DEPLOY_APP = 'documentation' # or playground
$env:NDP_DOCS_URL = 'https://docs.example.invalid'
$env:NDP_PLAYGROUND_URL = 'https://playground.example.invalid'
$env:VERCEL_ENV = 'production' # or preview
npm.cmd run build:vercel
npm.cmd run check:vercel
```

`check:vercel` validates the generated artifact's route destinations, static assets, custom 404/SPA behavior and production/preview indexing policy. It is a local artifact check, not a request to a live Vercel deployment. Clear these environment variables before unrelated local builds. `.vercel/` is ignored; project links and deployment output must not be committed.

After connecting the real projects, verify both assigned domains, direct documentation URLs, unknown-page HTTP status, asset responses, cross-app links and iframe behavior on Vercel. Account/project settings and public deployment were not changed by the repository setup.

References: [Vercel monorepos](https://vercel.com/docs/monorepos), [Build Output API](https://vercel.com/docs/build-output-api), [route configuration](https://vercel.com/docs/build-output-api/configuration), and [Node 20 retirement](https://vercel.com/changelog/node-js-20-is-being-deprecated).
