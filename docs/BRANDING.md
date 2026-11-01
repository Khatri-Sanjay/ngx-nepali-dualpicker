# Brand assets

The project mark uses two overlapping calendar pages and a check mark to represent BS/AD date selection. Teal (`#087B70`), coral (`#F29B87`), and white keep it readable on light and dark surfaces.

## Sources and generated files

- `apps/shared/assets/brand/logo.svg`: editable vector mark; also used as the SVG favicon.
- `apps/shared/assets/brand/social-card.svg`: editable 1200 x 630 sharing card.
- `icon-16.png`, `icon-32.png`, and `icon-48.png`: small raster variants used by the ICO generator.
- `icon-180.png`: Apple touch icon.
- `icon-192.png` and `icon-512.png`: web manifest icons.
- `social-card.png`: PNG sharing card for Open Graph and Twitter/X.
- Each application's `src/favicon.ico`: multi-resolution 16/32/48px icon.

Both apps copy the shared brand directory into `assets/brand`. Each app has its own `assets/site.webmanifest`. Header images are decorative alongside the visible project name; README images have alternative text.

## Regenerate

Edit the SVG sources, then run:

```powershell
$env:CHROME_BIN = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
npm.cmd run brand:assets
```

The generator uses an isolated headless browser to rasterize the SVGs. It does not need an external image service or add a runtime dependency. Review `social-card.png` and the small icons after changes. Commit the generated files so deployment builds do not need a browser to create icons.

## Metadata and indexing

Documentation pages use route-specific titles/descriptions, canonical URLs, a 1200 x 630 Open Graph image, Twitter/X large-image cards, and TechArticle structured data referring to the source package. The configured documentation public URL supplies absolute sharing URLs. Preview builds omit canonical identity and disable indexing.

The playground has its own title, description, sharing metadata, and icons. Its production homepage is prerendered, indexable, and canonicalized to the playground origin; preview builds remain noindex. Its metadata and sharing image URLs are generated from shared app links during each build.

Robots and sitemap data remain generated from documentation routes and site configuration. The production site checker verifies canonical/social metadata and the presence and dimensions of the brand assets. Updated metadata and assets take effect after redeployment; search engines and social platforms may retain their own cached previews.
