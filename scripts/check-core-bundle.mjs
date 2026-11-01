import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import { build } from 'esbuild';

const root = path.resolve('dist/ngx-nepali-dualpicker');
const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const entry = path.join(root, manifest.exports['./core'].default).replaceAll('\\', '/');
const result = await build({
	stdin: {
		contents: `import { convertAdToBs } from ${JSON.stringify(entry)}; console.log(convertAdToBs('2024-01-15'));`,
		resolveDir: process.cwd(),
		sourcefile: 'core-consumer.js',
	},
	bundle: true,
	minify: true,
	write: false,
	metafile: true,
	platform: 'browser',
	format: 'esm',
});
const output = result.outputFiles[0].contents;
assert.doesNotMatch(new TextDecoder().decode(output), /NgxNepaliDualpicker|CalendarGridComponent|ngDeclareComponent/);
assert.ok(
	Object.keys(result.metafile.inputs).every(
		(file) => !file.includes('node_modules/@angular/') && !file.includes('/datepicker/'),
	),
);
const report = {
	bytes: output.byteLength,
	gzipBytes: gzipSync(output).byteLength,
	inputs: Object.keys(result.metafile.inputs),
};
mkdirSync('tmp/bundle-check', { recursive: true });
writeFileSync('tmp/bundle-check/core-consumer.mjs', output);
writeFileSync('tmp/bundle-check/report.json', JSON.stringify(report, null, 2));
process.stdout.write(
	`Core-only consumer: ${report.bytes} bytes, ${report.gzipBytes} gzip bytes; no Angular or picker implementation.\n`,
);
