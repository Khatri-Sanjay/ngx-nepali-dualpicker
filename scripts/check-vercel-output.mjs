import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const app = process.env.NDP_DEPLOY_APP;
assert(['documentation', 'playground'].includes(app), 'Set NDP_DEPLOY_APP.');
const root = path.resolve('.vercel/output/static');
const config = JSON.parse(readFileSync('.vercel/output/config.json', 'utf8'));
assert.equal(config.version, 3);
function resolve(url) {
	for (const route of config.routes) {
		if (route.handle === 'filesystem') {
			const file = path.join(root, url);
			if (existsSync(file) && (statSync(file).isFile() || existsSync(path.join(file, 'index.html')))) return 200;
		} else if (new RegExp(route.src).test(url)) {
			if (route.continue) continue;
			if (route.dest) assert(existsSync(path.join(root, route.dest)), `Missing destination: ${route.dest}`);
			return route.status ?? 200;
		}
	}
	return 404;
}
assert.equal(resolve('/'), 200);
assert.equal(resolve('/favicon.ico'), 200);
assert.equal(resolve('/robots.txt'), 200);
assert.equal(resolve('/missing-script.js'), 404);
const preview = process.env.VERCEL_ENV !== 'production';
assert.equal(config.routes[0].headers['X-Robots-Tag'], preview ? 'noindex, nofollow' : undefined);
if (app === 'documentation') {
	for (const route of ['/configuration', '/configuration/', '/pickers', '/changelog'])
		assert.equal(resolve(route), 200);
	assert.equal(resolve('/configuration-extra'), 404);
	assert.equal(resolve('/missing-page'), 404);
	assert.equal(resolve('/404'), 404);
	assert.equal(resolve('/readOnly'), 308);
	const html = readFileSync(path.join(root, 'configuration/index.html'), 'utf8');
	assert(html.includes('<h1'), 'Documentation must contain prerendered content.');
	assert.equal(html.includes('rel="canonical"'), !preview);
	if (!preview) assert(html.includes(process.env.NDP_DOCS_URL.replace(/\/$/, '')));
} else {
	assert.equal(resolve('/playground'), 200);
	assert.equal(resolve('/nested/client-route'), 200);
	assert(readFileSync(path.join(root, 'robots.txt'), 'utf8').includes('Disallow: /'));
}
console.log(
	`PASS: ${app} Vercel artifact routing, assets and indexing policy (${preview ? 'preview' : 'production'}).`,
);
