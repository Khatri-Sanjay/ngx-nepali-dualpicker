import { readFileSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const site = JSON.parse(readFileSync('apps/documentation/site.config.json', 'utf8'));
if (!/^\/(?:[\w-]+\/)*$/.test(site.baseHref))
	throw new Error('baseHref must be / or a slash-delimited deployment path such as /docs/.');
if (site.publicUrl) {
	const url = new URL(site.publicUrl);
	if (url.protocol !== 'https:' || url.pathname.replace(/\/$/, '') !== site.baseHref.replace(/\/$/, ''))
		throw new Error('publicUrl must be the HTTPS documentation base URL with a path matching baseHref.');
}
if (site.playgroundUrl && !/^https?:\/\//.test(site.playgroundUrl))
	throw new Error('playgroundUrl must be a complete HTTP(S) URL.');
const result = spawnSync(
	process.execPath,
	[
		'node_modules/@angular/cli/bin/ng.js',
		'build',
		'documentation',
		'--configuration',
		'production',
		'--base-href',
		site.baseHref,
	],
	{ stdio: 'inherit' },
);
process.exitCode = result.status ?? 1;
if (result.status === 0)
	copyFileSync('dist/documentation/browser/404/index.html', 'dist/documentation/browser/404.html');
