<p align="center"><img src="apps/shared/assets/brand/logo.svg" width="88" height="88" alt="Nepali Dualpicker logo" /></p>

﻿# Nepali Dualpicker Workspace

Source workspace for **ngx-nepali-dualpicker**, an Angular date picker for Nepali Bikram Sambat (BS) and Gregorian (AD) calendars. This repository contains the publishable library, its documentation site, and an interactive playground.

[Documentation](https://ngx-nepali-dualpicker-docs.vercel.app/) | [Playground](https://ngx-nepali-dualpicker-playground.vercel.app/) | [npm](https://www.npmjs.com/package/ngx-nepali-dualpicker) | [GitHub](https://github.com/Khatri-Sanjay/ngx-nepali-dualpicker)

## Using the library

Start with the [library README](libs/ngx-nepali-dualpicker/README.md) for installation, Angular Forms integration, configuration, conversion, theming, and examples.

The source package release version is **2.0.0**. The latest published npm version in the registry snapshot is **1.1.4**. The 2.x configuration and examples describe the source package; installing npm latest does not install this API. See the [migration guide](docs/MIGRATION.md) and [release checkpoint](docs/RELEASE-CHECKPOINT.md).

## Prerequisites

- Angular 17.3 and TypeScript 5.4 are installed through this workspace's dependencies.
- `.nvmrc` and `.node-version` pin Node **20.19.0** for the existing local toolchain.
- `package.json` accepts Node `>=20.19.0 <21` or `>=24 <25`, with npm `>=10 <12`.
- Vercel projects use Node **24.x**. Angular 17 does not officially list Node 24 compatibility; local build validation is documented in the [deployment guide](docs/VERCEL-DEPLOYMENT.md).
- Browser tests require a Chromium browser.

## Local development

```sh
git clone https://github.com/Khatri-Sanjay/ngx-nepali-dualpicker.git
cd ngx-nepali-dualpicker
npm ci
npm start
```

`npm start` builds the library and serves the playground at **http://localhost:4200**.

```sh
# Serve documentation at http://localhost:4201
npm run start:docs

# Build the library and serve both apps
npm run start:all

# Rebuild the library while editing its source (separate terminal)
npm run watch
```

The apps consume the built library through its public exports. Rebuild it after library changes. Shared navigation links use the public sites by default; update `apps/shared/configuration/app-links.config.json` if you need both links to point to local servers.

On Windows, use `npm.cmd` if PowerShell blocks `npm.ps1`. To run tests with Microsoft Edge:

```powershell
$env:CHROME_BIN = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
npm.cmd test
```

## Repository structure

| Location                      | Responsibility                                                                   |
| ----------------------------- | -------------------------------------------------------------------------------- |
| `libs/ngx-nepali-dualpicker/` | Publishable Angular library and Angular-free `/core` entry point                 |
| `apps/playground/`            | Live configuration editor, forms, events, and booking examples                   |
| `apps/documentation/`         | Guides, searchable API reference, examples, and prerendered pages                |
| `apps/shared/`                | Shared examples, package metadata, navigation links, and code viewer             |
| `scripts/`                    | Build, documentation generation, architecture, package, and compatibility checks |
| `docs/`                       | Architecture, migration, deployment, accessibility, and release notes            |
| `vercel.json`                 | Shared install/build entry point for the two Vercel projects                     |

The library separates calendar calculations, configuration, selection state, rendering, overlays, and themes. See [architecture](docs/ARCHITECTURE.md) and [source layout](docs/SOURCE-LAYOUT.md).

## Commands

| Command                     | Purpose                                                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| `npm run check`             | Architecture checks, ESLint, Prettier, and TypeScript                                      |
| `npm test`                  | Library unit and integration tests                                                         |
| `npm run test:playground`   | Playground browser tests                                                                   |
| `npm run test:docs`         | Documentation browser tests                                                                |
| `npm run build`             | Production builds for the library and both apps                                            |
| `npm run build:lib`         | Build both library entry points                                                            |
| `npm run build:playground`  | Build the playground; build the library first                                              |
| `npm run build:docs`        | Regenerate documentation data and build prerendered documentation; build the library first |
| `npm run docs:api`          | Regenerate public API signatures                                                           |
| `npm run docs:data`         | Regenerate navigation, search, examples, robots, and sitemap data                          |
| `npm run docs:registry`     | Refresh the dated npm/link snapshot and documentation data                                 |
| `npm run check:docs`        | Compile the displayed documentation examples                                               |
| `npm run check:docs-site`   | Validate built documentation pages, metadata, and links                                    |
| `npm run check:calendar`    | Check conversion round trips and supported boundaries                                      |
| `npm run check:package`     | Validate the built package and exports                                                     |
| `npm run check:bundle`      | Verify the Angular-free consumer bundle                                                    |
| `npm run test:compat -- 17` | Check an isolated packed Angular consumer for the requested major                          |
| `npm run pack:lib`          | Build and create the installable package tarball                                           |
| `npm run release:check`     | Run the repository's release validation sequence                                           |

Use `npm run lint:fix` and `npm run format` to apply lint and formatting fixes. Release checks validate artifacts; publishing is a separate operation.

## Build artifacts and local package testing

```sh
npm run build
npm run pack:lib
```

| Artifact            | Output                                          |
| ------------------- | ----------------------------------------------- |
| npm library         | `dist/ngx-nepali-dualpicker/`                   |
| Installable tarball | `dist/packages/ngx-nepali-dualpicker-2.0.0.tgz` |
| Playground          | `dist/playground/browser/`                      |
| Documentation       | `dist/documentation/browser/`                   |

Install the tarball from a consuming Angular application to test the current source version:

```sh
npm install /path/to/ngx-nepali-dualpicker/dist/packages/ngx-nepali-dualpicker-2.0.0.tgz
```

## Vercel deployment

Create **two Vercel projects from the same repository**, both with the repository root and Framework Preset **Other**. The root [vercel.json](vercel.json) runs `npm ci` and `npm run build:vercel`. The script builds the library and selected app, then writes Vercel Build Output API artifacts to `.vercel/output`. Leave the Output Directory override disabled.

Set these environment variables for Production and Preview in each project:

| Variable             | Documentation project                                 | Playground project |
| -------------------- | ----------------------------------------------------- | ------------------ |
| `NDP_DEPLOY_APP`     | `documentation`                                       | `playground`       |
| `NDP_DOCS_URL`       | `https://ngx-nepali-dualpicker-docs.vercel.app`       | Same               |
| `NDP_PLAYGROUND_URL` | `https://ngx-nepali-dualpicker-playground.vercel.app` | Same               |

Vercel supplies `VERCEL_ENV`. Production documentation includes canonical URLs and a sitemap; previews disable indexing. Documentation serves prerendered routes and returns a real 404 for unknown pages. Playground uses an SPA fallback for extensionless routes while missing assets return 404.

To verify one target locally:

```powershell
$env:NDP_DEPLOY_APP = 'documentation'
$env:NDP_DOCS_URL = 'https://ngx-nepali-dualpicker-docs.vercel.app'
$env:NDP_PLAYGROUND_URL = 'https://ngx-nepali-dualpicker-playground.vercel.app'
$env:VERCEL_ENV = 'production'
npm.cmd run build:vercel
npm.cmd run check:vercel
```

Build one deployment target at a time: the script temporarily supplies shared site configuration and restores it afterward. See [Vercel deployment](docs/VERCEL-DEPLOYMENT.md) for routing, preview indexing, and embedding details.

## SEO and discoverability

Both production sites render crawlable HTML with canonical URLs, social cards, structured data, robots and sitemaps. Previews are excluded from indexing. Run `npm run check:seo` after building both apps. See [SEO configuration and verification](docs/SEO.md).

## Published version display

Documentation and playground fetch npm latest automatically after rendering, every five minutes while visible, and when a tab becomes visible. Production builds also refresh the fallback snapshot. The changelog lists only currently published versions; deleted/unpublished versions retained in npm timestamp history are excluded. If a browser refresh fails, the apps retain their last verified metadata. The npm badge reports the published release; the built library version remains separately identified. See [documentation maintenance](docs/DOCUMENTATION-MAINTENANCE.md).

## Contributing

Use public package imports in consumer examples, keep calendar logic independent of Angular, and add regression coverage for behavior changes. Before submitting, run checks and the tests relevant to your change. Update consumer documentation when changing the public API.

Report reproducible issues through [GitHub Issues](https://github.com/Khatri-Sanjay/ngx-nepali-dualpicker/issues), including Angular/browser versions, calendar, configuration, expected behavior, and actual behavior.

Useful references: [documentation maintenance](docs/DOCUMENTATION-MAINTENANCE.md), [accessibility and forms](docs/ACCESSIBILITY-AND-FORMS.md), [booking features](docs/BOOKING-FEATURES.md), and [calendar accuracy and limits](docs/CALENDAR-ACCURACY.md).

## License

[MIT](LICENSE) — Sanjay Khatri.
