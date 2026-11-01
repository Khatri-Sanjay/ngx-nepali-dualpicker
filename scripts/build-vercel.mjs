import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const app = process.env.NDP_DEPLOY_APP;
if (!['documentation', 'playground'].includes(app))
	throw new Error('Set NDP_DEPLOY_APP to documentation or playground in this Vercel project.');
if (!process.env.npm_execpath) throw new Error('Run this build through npm run build:vercel.');
const production = process.env.VERCEL_ENV === 'production';
function origin(name) {
	const value = process.env[name];
	if (!value) throw new Error(`Set ${name} to the confirmed HTTPS production origin (no path).`);
	const url = new URL(value);
	if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash)
		throw new Error(`${name} must be an HTTPS origin without credentials, a path, query or fragment.`);
	return url.origin;
}
const documentation = origin('NDP_DOCS_URL');
const playground = origin('NDP_PLAYGROUND_URL');
const sitePath = 'apps/documentation/site.config.json';
const linksPath = 'apps/shared/configuration/app-links.config.json';
const originals = new Map(
	[
		sitePath,
		linksPath,
		'apps/documentation/src/assets/robots.txt',
		'apps/documentation/src/assets/sitemap.xml',
		'apps/playground/src/index.html',
		'apps/playground/src/assets/robots.txt',
		'apps/playground/src/assets/sitemap.xml',
	].map((file) => [file, readFileSync(file)]),
);
const output = path.resolve('.vercel/output');
// Only remove this build's fixed output folder; retain .vercel/project.json and credentials.
if (output !== path.join(process.cwd(), '.vercel', 'output')) throw new Error('Unexpected output location.');
rmSync(output, { recursive: true, force: true });
function run(script) {
	const result = spawnSync(process.execPath, [process.env.npm_execpath, 'run', script], { stdio: 'inherit' });
	if (result.status !== 0) throw new Error(`${script} failed (${result.status ?? result.error?.message}).`);
}
try {
	writeFileSync(
		sitePath,
		JSON.stringify({ publicUrl: production ? documentation : null, playgroundUrl: playground, baseHref: '/' }),
	);
	writeFileSync(linksPath, JSON.stringify({ documentation, playground }));
	run('build:lib');
	run(app === 'documentation' ? 'build:docs' : 'build:playground');
	const source = `dist/${app}/browser`;
	if (!existsSync(`${source}/index.html`)) throw new Error(`Missing ${source}/index.html.`);
	mkdirSync(output, { recursive: true });
	cpSync(source, path.join(output, 'static'), { recursive: true });
	const headers = {
		'X-Content-Type-Options': 'nosniff',
		'Referrer-Policy': 'strict-origin-when-cross-origin',
		...(!production ? { 'X-Robots-Tag': 'noindex, nofollow' } : {}),
	};
	const routes = [{ src: '/(.*)', headers, continue: true }];
	if (app === 'documentation') {
		// Preserve prerendered HTML and actual 404 status; do not serve a generic SPA shell for every URL.
		for (const entry of readdirSync(source, { withFileTypes: true })) {
			if (entry.isDirectory() && entry.name !== '404' && existsSync(`${source}/${entry.name}/index.html`)) {
				if (!/^[\w-]+$/.test(entry.name)) throw new Error(`Unsupported route directory: ${entry.name}`);
				routes.push({ src: `^/${entry.name}/?$`, dest: `/${entry.name}/index.html` });
			}
		}
		routes.push({ src: '^/readOnly/?$', headers: { Location: '/read-only' }, status: 308 });
		routes.push({ src: '^/404(?:/|\\.html)?$', dest: '/404.html', status: 404 });
		routes.push({ handle: 'filesystem' }, { src: '/(.*)', dest: '/404.html', status: 404 });
	} else {
		// The legacy playground path redirects to the canonical root.
		routes.push({ src: '^/playground/?$', headers: { Location: '/' }, status: 308 });
		routes.push({ handle: 'filesystem' }, { src: '^/[^.]*$', dest: '/index.html' });
	}
	writeFileSync(path.join(output, 'config.json'), JSON.stringify({ version: 3, routes }, null, 2) + '\n');
	console.log('Vercel output: ' + output);
} finally {
	for (const [file, contents] of originals) writeFileSync(file, contents);
}
