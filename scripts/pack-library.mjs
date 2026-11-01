import { existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const npmCli = process.env.npm_execpath;
if (!npmCli || !existsSync(npmCli)) {
	throw new Error('Run this script through npm run pack:lib so the npm CLI is available.');
}
if (!existsSync(new URL('../dist/ngx-nepali-dualpicker/package.json', import.meta.url))) {
	throw new Error('The built library is missing. Run npm run build:lib before packing.');
}
mkdirSync(new URL('../dist/packages/', import.meta.url), { recursive: true });
// Release documentation belongs in the artifact; ng-packagr intentionally disallows
// copying assets from outside its source project root.
for (const [source, target] of [
	['../docs/MIGRATION.md', 'MIGRATION.md'],
	['../CHANGELOG.md', 'CHANGELOG.md'],
]) {
	copyFileSync(new URL(source, import.meta.url), new URL(`../dist/ngx-nepali-dualpicker/${target}`, import.meta.url));
}
const result = spawnSync(
	process.execPath,
	[npmCli, 'pack', './dist/ngx-nepali-dualpicker', '--pack-destination', './dist/packages'],
	{
		cwd: root,
		stdio: 'inherit',
	},
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);
