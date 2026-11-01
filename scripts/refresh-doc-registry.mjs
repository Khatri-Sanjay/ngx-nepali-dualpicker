import { format } from 'prettier';
import { loadDocModule } from './load-doc-content.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
const manifest = JSON.parse(readFileSync('libs/ngx-nepali-dualpicker/package.json', 'utf8'));
const response = await fetch(`https://registry.npmjs.org/${manifest.name}`, { signal: AbortSignal.timeout(15000) });
if (!response.ok) throw new Error(`npm registry: HTTP ${response.status}; existing snapshot retained.`);
const registry = await response.json();
const { readPublishedPackage } = loadDocModule('apps/shared/content/published-package.ts');
const published = readPublishedPackage(registry);
writeFileSync('apps/shared/content/published-package.generated.json', JSON.stringify(published, null, 4) + '\n');
const repository = manifest.repository.url.replace(/^git\+/, '').replace(/\.git$/, '');
const check = async (url) => {
	try {
		return (
			await fetch(url, {
				headers: { 'User-Agent': 'ngx-nepali-dualpicker-docs' },
				signal: AbortSignal.timeout(15000),
			})
		).status;
	} catch {
		return null;
	}
};
const [repositoryStatus, homepageStatus, npmPageStatus] = await Promise.all([
	check(repository),
	check(manifest.homepage),
	check(`https://www.npmjs.com/package/${manifest.name}`),
]);
const data = {
	checkedAt: new Date().toISOString().slice(0, 10),
	latest: published.latest,
	releases: published.releases,
	repositoryAvailable: repositoryStatus === 200,
	repositoryStatus,
	homepageAvailable: homepageStatus === 200,
	npmPageStatus,
};
writeFileSync(
	'apps/documentation/src/app/content/generated/registry.generated.ts',
	await format(
		'// Dated npm registry and link snapshot. Refresh with npm run docs:registry.\nexport const registrySnapshot = ' +
			JSON.stringify(data, null, 2) +
			' as const;\n',
		{ parser: 'typescript', ...JSON.parse(readFileSync('.prettierrc.json', 'utf8')) },
	),
);
process.stdout.write(
	`Registry snapshot: latest ${data.latest}, ${data.releases.length} published versions, repository HTTP ${repositoryStatus}.\n`,
);
