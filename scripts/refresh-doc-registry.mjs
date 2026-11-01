import { readFileSync, writeFileSync } from 'node:fs';
const manifest = JSON.parse(readFileSync('libs/ngx-nepali-dualpicker/package.json', 'utf8'));
const response = await fetch(`https://registry.npmjs.org/${manifest.name}`, { signal: AbortSignal.timeout(15000) });
if (!response.ok) throw new Error(`npm registry: HTTP ${response.status}; existing snapshot retained.`);
const registry = await response.json();
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
	latest: registry['dist-tags'].latest,
	releases: Object.entries(registry.time)
		.filter(([version]) => !['created', 'modified'].includes(version))
		.map(([version, date]) => ({ version, date, notesAvailable: false }))
		.sort((a, b) => b.date.localeCompare(a.date)),
	repositoryAvailable: repositoryStatus === 200,
	repositoryStatus,
	homepageAvailable: homepageStatus === 200,
	npmPageStatus,
};
writeFileSync(
	'apps/documentation/src/app/content/generated/registry.generated.ts',
	'// Dated npm registry and link snapshot. Refresh with npm run docs:registry.\nexport const registrySnapshot = ' +
		JSON.stringify(data, null, 2) +
		' as const;\n',
);
process.stdout.write(
	`Registry snapshot: latest ${data.latest}, ${data.releases.length} published versions, repository HTTP ${repositoryStatus}.\n`,
);
