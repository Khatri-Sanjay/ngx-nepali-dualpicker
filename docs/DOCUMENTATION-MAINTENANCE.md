# Maintaining the official documentation application

The documentation is the Angular application at `apps/documentation`. It consumes the built public package, shares real examples and configuration validation with the playground, and targets Angular 17. Do not import library implementation files into either consuming app.

## Run and build

Use the pinned Node 20.19.x toolchain and npm 10/11. On Windows, use `npm.cmd` if PowerShell blocks npm.ps1.

```sh
npm ci
npm run build:lib
npm run start:all
```

Documentation runs at http://localhost:4201; the real playground runs at http://localhost:4200. `npm run start:docs` starts only documentation. `npm run build` builds the library, playground and prerendered documentation. Deploy **dist/documentation/browser**, including the route directories, robots.txt, sitemap.xml and assets. No SSR Node server is needed for this static deployment.

## Content and coverage

- `content/doc-model.ts`: structured page and section contracts.
- `content/pages/*.pages.ts` and `content/docs.content.ts`: explanations and complete examples.
- `content/docs.catalog.ts`: canonical page order, groups and shared reference block assignments.
- `content/reference-data.ts`: reusable API-reference projections, intentionally excluding component view/lifecycle helpers from the supported method table.
- `content/generated`: source-derived entry points, declarations, search, navigation, configuration examples, theme tokens, registry snapshot, release notes and coverage facts.
- `apps/shared/content/picker-examples.ts`: genuine rendered examples shared by both apps.
- `apps/shared/configuration/parse-picker-config.ts`: strict JSON validation; no eval or arbitrary Angular compilation.

Add a DocPage record, assign one of the existing groups and add its ID to the catalog order. Give sections unique titles or explicit IDs. Set `references` to a reusable reference block ID when appropriate. Put complete importable TypeScript in TypeScript examples; mark shell/text snippets with the correct language. Link supported APIs to their actual source paths. Run the generators, example compiler and site checker after every content/API change.

```sh
npm run docs:api
npm run docs:data
npm run check:docs
npm run build:docs
npm run check:docs-site
```

`build:docs` regenerates source signatures and site data automatically. Generation formats its output using the repository Prettier configuration. Defaults come from DEFAULT_PICKER_CONFIG; API signatures and exported contracts come from the TypeScript compiler. Human explanations still need review. A successful extraction is not proof of API behavior.

## Releases and real external links

`npm run docs:registry` explicitly refreshes npm versions/publication timestamps and repository/homepage availability, then regenerates the search index. Normal builds use the committed snapshot and need no external metadata requests. The UI displays the snapshot date and separates the unpublished workspace version from published npm latest. Do not invent missing historical release notes. Keep CHANGELOG.md and docs/MIGRATION.md authoritative for unreleased changes; review generated category assignments before release.

The manifest repository currently returns 404. Fix and verify the real repository URL before advertising GitHub/source/issues/PR links. No security contact or discussions URL is inferred. A verified source link can be added after the repository is reachable and its default branch is known.

## Production identity and SEO

Edit `apps/documentation/site.config.json`:

```json
{
    "publicUrl": null,
    "playgroundUrl": null,
    "baseHref": "/"
}
```

Replace null values with confirmed URLs. `publicUrl` must be the full HTTPS base URL of this documentation deployment; its path must match baseHref. A subdirectory baseHref must begin and end with `/`. The playground URL points to the separately deployed playground. Localhost is used only as the development fallback while publicUrl is unset. Never publish development URLs as production identity.

Until publicUrl is configured, pages deliberately emit no canonical URL, `noindex,nofollow`, an empty sitemap and Disallow robots policy. Once configured, the build generates canonical/OG URLs, TechArticle JSON-LD, indexable pages and the sitemap. Do not remove this guard without providing the actual production URL.

Serve prerendered directories before your hosting fallback. Configure unknown paths to return a real 404 status (the client also supplies an explicit missing-page view). Keep baseHref aligned with hosting. HTTPS is needed for dependable clipboard access. Frame restrictions may prevent embedding the separate playground; the full-app link remains available. Interactive examples remain available locally without the frame.

## Validation

```sh
npm run check
npm run build
npm test
npm run test:playground
npm run test:docs
npm run check:docs
npm run check:docs-site
npm run check:package
npm run check:bundle
```

Set CHROME_BIN to your Chromium/Edge executable when Chrome is not installed at the default path. `npm run check:docs-browser` serves the production output temporarily on loopback, checks real hydration/interactions/mobile layout and axe results, and writes screenshots/results under `tmp/docs-browser`. It reuses Karma's installed WebSocket transport and axe. This is browser automation, not a substitute for screen-reader or multi-browser verification. Browser profiles remain under tmp for diagnostics; no personal browser profile is accessed.

The current integration tests cover every catalog route and generated anchor, search navigation/empty states, metadata changes, theme persistence, drawer scroll restoration, live JSON application/errors/reset, release filtering, real date selection, forms, conversion and copy failures. The static checker verifies production HTML and documentation coverage. Do not claim broader browser, security, screen-reader or Angular-major certification from these tests.

## Launch requirements

Confirm production origins and the public repository; supply a private security reporting channel; publish the documented prerelease or keep tarball installation; recover historical release notes if available; review upstream dependency advisories with a planned Angular upgrade. Do not run forced major-version dependency updates as part of editing documentation. See DOCUMENTATION-REPORT.md for the actual verification results and remaining information gaps.
