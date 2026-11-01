import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { format } from 'prettier';
import { loadDocModule } from './load-doc-content.mjs';
const dir = 'apps/documentation/src/app/content';
const { pages, referenceTitles } = loadDocModule(`${dir}/docs.catalog.ts`);
const { publicSurface, typeDeclarations } = loadDocModule(`${dir}/generated/public-surface.generated.ts`);
const { configurationTypes, publicMembers } = loadDocModule(`${dir}/api-signatures.generated.ts`);
const { registrySnapshot } = loadDocModule(`${dir}/generated/registry.generated.ts`);
const target = `${dir}/generated`;
mkdirSync(target, { recursive: true });
const { DEFAULT_PICKER_CONFIG: defaults } = loadDocModule(
	'libs/ngx-nepali-dualpicker/src/lib/configuration/datepicker-config.defaults.ts',
);
const { PRESET_THEMES: themes } = loadDocModule(
	'libs/ngx-nepali-dualpicker/src/lib/themes/datepicker-theme.presets.ts',
);
const exampleValues = {
	...defaults,
	dateFilter: null,
	presets: [{ label: 'Example date', value: '2080-10-01' }],
	id: 'booking-date',
	minDate: '2080-01-01',
	maxDate: '2081-12-30',
	customTheme: { colors: { primary: '#087b70' } },
};
const configurationExamples = Object.entries(exampleValues).map(([name, value]) => ({
	name,
	code: `import type { DatePickerConfig } from 'ngx-nepali-dualpicker';\nconst config: DatePickerConfig = { ${name}: ${name === 'dateFilter' ? 'date => date.day !== 15' : (JSON.stringify(value, null, 2) ?? 'undefined')} };`,
}));
writeFileSync(
	`${target}/configuration-examples.generated.ts`,
	'// Generated typed examples for every configuration option.\nexport const configurationExamples = ' +
		JSON.stringify(configurationExamples, null, 2) +
		' as const;\n',
);
const kebab = (value) => value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const themeTokens = [];
for (const [group, values] of Object.entries(themes.light))
	for (const [key, value] of Object.entries(values)) {
		if (group === 'typography' && typeof value === 'object') {
			for (const [part, defaultValue] of Object.entries(value))
				themeTokens.push({
					name: `--ndp-font-${kebab(key.replace(/^font/, ''))}-${part}`,
					type: `typography.${key}.${part}`,
					defaultValue: String(defaultValue),
					description: 'Theme variable emitted by ThemeApplier; configure through customTheme.',
				});
		} else {
			const prefix = {
				colors: 'color',
				spacing: 'spacing',
				borderRadius: 'radius',
				shadows: 'shadow',
				transitions: 'transition',
				dimensions: 'dimension',
				typography: '',
			}[group];
			themeTokens.push({
				name: group === 'typography' ? '--ndp-font-family' : `--ndp-${prefix}-${kebab(key)}`,
				type: group + '.' + key,
				defaultValue: String(value),
				description:
					'Light preset value. Emitted on the picker container; not every variable necessarily has a consumer in the current view.',
			});
		}
	}
writeFileSync(
	`${target}/theme-tokens.generated.ts`,
	'// Derived from preset fields and ThemeApplier naming.\nexport const themeTokens = ' +
		JSON.stringify(themeTokens, null, 2) +
		' as const;\n',
);
const route = (id) => (id === 'home' ? '/introduction' : `/${id}`);
const nav = pages.map((p) => ({
	id: p.id,
	path: route(p.id),
	title: p.title,
	description: p.description,
	group: p.group,
	sections: [
		...p.sections.map((s) => ({ id: s.id, title: s.title })),
		...(p.references ?? []).map((id) => ({ id, title: referenceTitles[id] ?? id })),
	],
}));
writeFileSync(
	`${target}/navigation.generated.ts`,
	'// Generated from docs.catalog.ts.\nexport const navigation = ' + JSON.stringify(nav, null, 2) + ' as const;\n',
);
const index = [];
for (const p of pages) {
	index.push({
		id: p.id,
		title: p.title,
		path: route(p.id),
		category: p.group,
		text: p.description + ' ' + p.keywords,
	});
	for (const [i, s] of p.sections.entries())
		index.push({
			id: `${p.id}-${i}`,
			title: s.title,
			path: route(p.id) + '#' + s.id,
			category: p.title,
			text: p.description + ' ' + s.body + ' ' + (s.code ?? ''),
		});
}
for (const [key, type] of Object.entries(configurationTypes))
	index.push({
		id: 'config-' + key,
		title: key,
		path: '/configuration#config',
		category: 'Configuration',
		text: type + ' DatePickerConfig ' + key,
	});
for (const symbol of publicSurface)
	index.push({
		id: symbol.entryPoint + '-' + symbol.name,
		title: symbol.name,
		path: symbol.entryPoint.endsWith('/core') ? '/core#core-functions' : '/api#exports',
		category: symbol.kind + ' API',
		text: symbol.signature + ' ' + symbol.description + ' ' + (typeDeclarations[symbol.name] ?? ''),
	});
for (const release of registrySnapshot.releases)
	index.push({
		id: 'release-' + release.version,
		title: 'Version ' + release.version,
		path: '/changelog#release-' + release.version.replaceAll('.', '-'),
		category: 'Published release',
		text: release.date + ' Historical change notes unavailable',
	});
const memberRoutes = {
	DateConversionService: '/date-conversion-service#DateConversionService',
	DatePickerConfigService: '/datepicker-config-service#DatePickerConfigService',
	ThemeService: '/theme-service#ThemeService',
	NepaliDatePipe: '/nepali-date-pipe#NepaliDatePipe',
	DateCalculator: '/core#DateCalculator',
	DateParser: '/core#DateParser',
	DateValidator: '/core#DateValidator',
};
for (const owner of publicMembers)
	if (memberRoutes[owner.name])
		for (const member of owner.rows)
			index.push({
				id: owner.name + '-' + member.name,
				title: member.name,
				path: memberRoutes[owner.name],
				category: owner.name,
				text: member.type + ' ' + member.description,
			});
for (const token of themeTokens)
	index.push({
		id: token.name,
		title: token.name,
		path: '/theming#theme-tokens',
		category: 'Theme token',
		text: token.type + ' ' + token.defaultValue,
	});
const changelog = readFileSync('CHANGELOG.md', 'utf8');
const notes = changelog
	.split(/\r?\n/)
	.filter((l) => l.startsWith('- '))
	.map((line) => {
		const text = line.slice(2);
		const category = /remove/i.test(text.slice(0, 20))
			? 'Removed'
			: /fix|block|preserve/i.test(text.slice(0, 20))
				? 'Fixed'
				: /add|import/i.test(text.slice(0, 16))
					? 'Added'
					: 'Changed';
		return {
			category,
			text: text.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'),
			breaking: /breaking/i.test(text),
		};
	});
const migration = readFileSync('docs/MIGRATION.md', 'utf8');
for (const [i, note] of notes.entries())
	index.push({
		id: 'unreleased-' + i,
		title: note.category + ' in the next release',
		path: '/changelog#release-next',
		category: 'Unreleased changelog',
		text: note.text,
	});
writeFileSync(
	`${target}/search.generated.ts`,
	'// Generated, loaded only when search is opened.\nexport const searchIndex = ' +
		JSON.stringify(index, null, 2) +
		' as const;\n',
);
const migrationRows = migration
	.split(/\r?\n/)
	.filter((l) => l.startsWith('| `'))
	.map((l) => {
		const fields = l
			.split('|')
			.slice(1, -1)
			.map((x) => x.trim().replaceAll('`', ''));
		return { before: fields[0], after: fields.slice(1).join(' | ') };
	});
writeFileSync(
	`${target}/releases.generated.ts`,
	'// Derived from the real changelog and migration source.\nexport const currentChanges = ' +
		JSON.stringify(notes, null, 2) +
		' as const;\nexport const migrationRows = ' +
		JSON.stringify(migrationRows, null, 2) +
		' as const;\n',
);
const settings = JSON.parse(readFileSync('apps/documentation/site.config.json', 'utf8'));
const assets = 'apps/documentation/src/assets';
mkdirSync(assets, { recursive: true });
writeFileSync(`${assets}/library-license.txt`, readFileSync('LICENSE', 'utf8'));
const publicUrl = settings.publicUrl?.replace(/\/$/, '');
const xml = publicUrl
	? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${nav.map((p) => `<url><loc>${publicUrl}${p.path}</loc></url>`).join('')}</urlset>`
	: '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n<!-- Set publicUrl in site.config.json before deployment. -->';
writeFileSync(`${assets}/sitemap.xml`, xml);
writeFileSync(
	`${assets}/robots.txt`,
	publicUrl
		? `User-agent: *\nAllow: /\nSitemap: ${publicUrl}/sitemap.xml\n`
		: 'User-agent: *\nDisallow: /\n# Production publicUrl is not configured.\n',
);
writeFileSync('apps/documentation/prerender-routes.txt', ['/', '/404', ...nav.map((p) => p.path)].join('\n') + '\n');
const covered = new Set(publicSurface.map((s) => s.name));
writeFileSync(
	`${target}/coverage.generated.ts`,
	'// Generated documentation coverage facts.\nexport const coverage = ' +
		JSON.stringify(
			{
				pages: pages.length,
				rootExports: publicSurface.filter((s) => s.entryPoint === 'ngx-nepali-dualpicker').length,
				coreExports: publicSurface.filter((s) => s.entryPoint.endsWith('/core')).length,
				uniqueSymbols: covered.size,
				configurationOptions: Object.keys(configurationTypes).length,
				sections: pages.reduce((n, p) => n + p.sections.length, 0),
			},
			null,
			2,
		) +
		' as const;\n',
);
process.stdout.write(
	`Documentation data: ${pages.length} pages, ${index.length} search records, ${covered.size} public symbols, ${Object.keys(configurationTypes).length} config options.\n`,
);
for (const name of readdirSync(target).filter((name) => name.endsWith('.ts'))) {
	const file = target + '/' + name;
	writeFileSync(
		file,
		await format(readFileSync(file, 'utf8'), {
			filepath: file,
			...JSON.parse(readFileSync('.prettierrc.json', 'utf8')),
		}),
	);
}
