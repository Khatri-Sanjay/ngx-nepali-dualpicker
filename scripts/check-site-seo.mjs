import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const preview = process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production';
const links = JSON.parse(readFileSync('apps/shared/configuration/app-links.config.json', 'utf8'));
const docs = JSON.parse(readFileSync('apps/documentation/site.config.json', 'utf8'));
for (const [app, route, origin] of [
	['playground', '', links.playground],
	['documentation', 'introduction/', docs.publicUrl],
]) {
	const root = `dist/${app}/browser`;
	const html = readFileSync(`${root}/${route}index.html`, 'utf8');
	assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `${app}: prerendered h1`);
	assert(html.includes('Angular'), `${app}: descriptive title/content`);
	assert(html.includes('summary_large_image'), `${app}: social card`);
	const indexable = !preview && !!origin;
	assert.equal(html.includes('rel="canonical"'), indexable, `${app}: canonical indexing policy`);
	assert.equal(html.includes('noindex,nofollow'), !indexable, `${app}: robots indexing policy`);
	if (indexable) {
		assert(html.includes(origin.replace(/\/$/, '') + '/assets/brand/social-card.png'));
		const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(
			(match) => JSON.parse(match[1]),
		);
		assert(schemas.length, `${app}: structured data`);
		assert(
			schemas.some((schema) => ['WebSite', 'WebApplication'].includes(schema['@type'])),
			`${app}: site schema`,
		);
	}
	const robots = readFileSync(`${root}/robots.txt`, 'utf8');
	const sitemap = readFileSync(`${root}/sitemap.xml`, 'utf8');
	assert.equal(robots.includes('Disallow: /'), !indexable);
	assert.equal(sitemap.includes('<loc>'), indexable);
	for (const asset of ['logo.svg', 'icon-180.png', 'social-card.png'])
		assert(existsSync(`${root}/assets/brand/${asset}`));
	console.log(`PASS: ${app} prerendered content, metadata, schema, brand assets and indexing policy.`);
}
