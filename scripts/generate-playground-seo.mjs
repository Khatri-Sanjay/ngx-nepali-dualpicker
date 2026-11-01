import { readFileSync, writeFileSync } from 'node:fs';
import { format } from 'prettier';
const links = JSON.parse(readFileSync('apps/shared/configuration/app-links.config.json', 'utf8'));
const metadata = JSON.parse(readFileSync('libs/ngx-nepali-dualpicker/package.json', 'utf8'));
const url = new URL(links.playground);
if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/')
	throw new Error('Playground SEO requires a confirmed HTTPS origin.');
const origin = url.origin;
const indexable = !process.env.VERCEL_ENV || process.env.VERCEL_ENV === 'production';
const title = 'Angular Nepali Date Picker Playground | ngx-nepali-dualpicker';
const description =
	'Try the Angular Nepali date picker with BS and AD calendars, date ranges, multiple dates, themes, Angular Forms and copyable configuration examples.';
const image = origin + '/assets/brand/social-card.png';
const schema = {
	'@context': 'https://schema.org',
	'@type': 'WebApplication',
	name: 'Nepali Dualpicker Playground',
	url: origin + '/',
	description,
	applicationCategory: 'DeveloperApplication',
	operatingSystem: 'Any',
	browserRequirements: 'Requires JavaScript',
	image,
	author: { '@type': 'Person', name: metadata.author.name, url: metadata.author.url },
	isBasedOn: {
		'@type': 'SoftwareSourceCode',
		name: metadata.name,
		codeRepository: metadata.repository.url.replace(/^git\+/, '').replace(/\.git$/, ''),
		programmingLanguage: 'TypeScript',
		runtimePlatform: 'Angular',
		version: metadata.version,
		license: 'https://opensource.org/license/mit/',
	},
};
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
const meta = (key, value, property = false) =>
	`<meta ${property ? 'property' : 'name'}="${key}" content="${escape(value)}" />`;
const tags = [
	meta('description', description),
	meta('robots', indexable ? 'index,follow' : 'noindex,nofollow'),
	meta('og:type', 'website', true),
	meta('og:site_name', metadata.name, true),
	meta('og:title', title, true),
	meta('og:description', description, true),
	meta('twitter:card', 'summary_large_image'),
	meta('twitter:title', title),
	meta('twitter:description', description),
];
if (indexable)
	tags.push(
		`<link rel="canonical" href="${origin}/" />`,
		meta('og:url', origin + '/', true),
		meta('og:image', image, true),
		meta('og:image:type', 'image/png', true),
		meta('og:image:width', '1200', true),
		meta('og:image:height', '630', true),
		meta('og:image:alt', 'ngx-nepali-dualpicker: BS and AD calendars for Angular', true),
		meta('twitter:image', image),
		meta('twitter:image:alt', 'ngx-nepali-dualpicker: BS and AD calendars for Angular'),
		`<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>`,
	);
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8" /><title>${title}</title>
<base href="/" /><meta name="viewport" content="width=device-width, initial-scale=1" />${tags.join('\n')}
<meta name="theme-color" content="#087B70" /><meta name="application-name" content="Nepali Dualpicker Playground" />
<link rel="icon" type="image/svg+xml" href="assets/brand/logo.svg" /><link rel="alternate icon" type="image/x-icon" href="favicon.ico" />
<link rel="apple-touch-icon" sizes="180x180" href="assets/brand/icon-180.png" /><link rel="manifest" href="assets/site.webmanifest" />
</head><body><app-root></app-root></body></html>`;
writeFileSync(
	'apps/playground/src/index.html',
	await format(html, { parser: 'html', ...JSON.parse(readFileSync('.prettierrc.json', 'utf8')) }),
);
writeFileSync(
	'apps/playground/src/assets/robots.txt',
	indexable ? `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n` : 'User-agent: *\nDisallow: /\n',
);
writeFileSync(
	'apps/playground/src/assets/sitemap.xml',
	`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${indexable ? `<url><loc>${origin}/</loc></url>` : ''}</urlset>\n`,
);
console.log(`Playground metadata: ${indexable ? 'indexable production' : 'noindex preview'}.`);
