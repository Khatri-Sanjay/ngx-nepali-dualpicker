import { existsSync, readFileSync } from 'node:fs';
import { loadDocModule } from './load-doc-content.mjs';
const dir = 'apps/documentation/src/app/content';
const { pages, docGroups, pagePath } = loadDocModule(`${dir}/docs.catalog.ts`);
const { navigation } = loadDocModule(`${dir}/generated/navigation.generated.ts`);
const { searchIndex } = loadDocModule(`${dir}/generated/search.generated.ts`);
const { configurationTypes } = loadDocModule(`${dir}/api-signatures.generated.ts`);
const { configurationExamples } = loadDocModule(`${dir}/generated/configuration-examples.generated.ts`);
const { publicSurface } = loadDocModule(`${dir}/generated/public-surface.generated.ts`);
const site = JSON.parse(readFileSync('apps/documentation/site.config.json', 'utf8'));
const failures = [];
const assert = (condition, message) => {
	if (!condition) failures.push(message);
};
const paths = new Map(navigation.map((page) => [page.path, page]));
assert(paths.size === pages.length, 'Duplicate or missing page routes');
for (const group of docGroups)
	assert(
		pages.some((page) => page.group === group),
		'Empty navigation group: ' + group,
	);
for (const page of pages) {
	const nav = paths.get(pagePath(page.id));
	assert(!!nav, 'Missing navigation: ' + page.id);
	assert(
		new Set(nav.sections.map((section) => section.id)).size === nav.sections.length,
		'Duplicate section: ' + page.id,
	);
	if (page.source) assert(existsSync(page.source), 'Missing implementation source: ' + page.source);
	for (const section of page.sections)
		for (const link of section.links ?? []) {
			if (link.external) assert(/^https:\/\//.test(link.href), 'Invalid external URL: ' + link.href);
			else assert(paths.has(link.href.split('#')[0]), 'Broken content link: ' + link.href);
		}
}
assert(
	Object.keys(configurationTypes).sort().join() ===
		configurationExamples
			.map((item) => item.name)
			.sort()
			.join(),
	'Configuration example coverage is incomplete',
);
assert(new Set(searchIndex.map((item) => item.id)).size === searchIndex.length, 'Duplicate search record IDs');
for (const symbol of publicSurface)
	assert(
		searchIndex.some((item) => item.title === symbol.name),
		'Unsearchable public export: ' + symbol.name,
	);
for (const item of searchIndex) {
	const [path, fragment] = item.path.split('#');
	const page = paths.get(path);
	assert(!!page, 'Broken search path: ' + item.path);
	if (fragment)
		assert(
			page?.sections.some((section) => section.id === fragment) ||
				(/^release-/.test(fragment) && path === '/changelog'),
			'Broken search fragment: ' + item.path,
		);
}
const output = 'dist/documentation/browser';
assert(existsSync(output + '/index.html'), 'Production build missing; run npm run build:docs first');
if (existsSync(output + '/index.html')) {
	for (const page of pages) {
		const filename = output + pagePath(page.id) + '/index.html';
		assert(existsSync(filename), 'Missing prerendered route: ' + filename);
		if (!existsSync(filename)) continue;
		const html = readFileSync(filename, 'utf8');
		assert((html.match(/<h1(?:\s|>)/g) ?? []).length === 1, 'Expected exactly one prerendered h1: ' + page.id);
		assert(
			html.includes(page.title.replaceAll('&', '&amp;') + ' | ngx-nepali-dualpicker'),
			'Missing page title: ' + page.id,
		);
		assert(/name="description" content="[^"]+"/.test(html), 'Missing description: ' + page.id);
		assert(html.includes('og:title') && html.includes('twitter:card'), 'Missing social metadata: ' + page.id);
		if (site.publicUrl) assert(html.includes('rel="canonical"'), 'Missing canonical: ' + page.id);
		else
			assert(
				html.includes('noindex,nofollow') && !html.includes('rel="canonical"'),
				'Unconfigured build must not invent a canonical: ' + page.id,
			);
		for (const link of html.matchAll(/href="([^"?#]+)(?:\?[^"#]*)?(?:#([^"]*))?"/g)) {
			let href = link[1];
			if (!href.startsWith('/') || href.startsWith('//')) continue;
			if (site.baseHref !== '/' && href.startsWith(site.baseHref)) href = '/' + href.slice(site.baseHref.length);
			if (/\.[\w]+$/.test(href)) continue;
			assert(paths.has(href) || href === '/', 'Broken rendered internal link ' + page.id + ': ' + href);
		}
	}
	assert(existsSync(output + '/robots.txt') && existsSync(output + '/sitemap.xml'), 'Root robots/sitemap missing');
}
if (failures.length) {
	process.stderr.write(failures.join('\n') + '\n');
	process.exitCode = 1;
} else
	process.stdout.write(
		`PASS: ${pages.length} prerendered pages; all navigation, search targets, source paths, ${configurationExamples.length} config examples and ${new Set(publicSurface.map((s) => s.name)).size} public symbols verified.\n`,
	);
