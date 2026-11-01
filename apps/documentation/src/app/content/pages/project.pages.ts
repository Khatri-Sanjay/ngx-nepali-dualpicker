import type { DocPage } from '../doc-model';
export const projectPages: readonly DocPage[] = [
	{
		id: 'playground',
		examples: ['basic', 'range'],
		title: 'Interactive playground',
		group: 'Components',
		description: 'Use the real configuration workspace, with a standalone fallback when embedding is unavailable.',
		keywords: 'playground live config JSON responsive editors HTML TypeScript reset',
		sections: [
			{
				title: 'A real library consumer',
				body: 'The playground is a separate Angular application that renders the built public library. Its JSON editor applies validated configuration live, preserves the last working preview on invalid input, and generates complete Angular TypeScript/HTML integration code. It also demonstrates forms, range rules, dual dates and custom cells.',
			},
			{
				title: 'Code editing boundary',
				body: 'Live JSON and property controls change real picker behavior. TypeScript/HTML tabs show generated source; they do not pretend to compile arbitrary Angular source in the browser. A source release can be installed from npm only after its publication. Use the repository Angular development server for arbitrary component/template/style editing.',
			},
			{
				title: 'Embedding and fallback',
				body: 'Load the configured playground below or open its standalone URL. A deployment may block iframe embedding through its content-security or frame policy; the standalone link remains available. Production docs/playground URLs are configured explicitly in site.config.json.',
			},
		],
	},
	{
		id: 'package',
		title: 'Package & project information',
		group: 'Introduction',
		description: 'Workspace version, published npm metadata, dependencies and verified project links.',
		keywords: 'npm version license MIT peerDependencies GitHub source repository package metadata',
		references: ['package'],
		sections: [
			{
				title: 'Workspace versus npm',
				body: 'The source release version is 2.0.0. The current published version is shown in the npm latest badge and refreshed automatically. This site documents the workspace implementation; installation and migration pages explain the API difference. Snapshot dates are displayed so cached registry metadata is not mistaken for a real-time statistic.',
			},
			{
				title: 'Project links',
				body: 'Package metadata links to the project GitHub repository, issue tracker and documentation. Use the navigation links to browse source, report issues or open the interactive playground.',
			},
			{
				title: 'License and dependencies',
				body: 'The library is MIT licensed. tslib is its runtime dependency; Angular common/core/forms and RxJS are peers. Documentation prerendering adds matching Angular 17 server-rendering dependencies to the workspace, not to the published library.',
			},
		],
	},
	{
		id: 'changelog',
		title: 'Changelog & release history',
		group: 'Changelog',
		description: 'Verified release timestamps and source release notes, with filtering and search.',
		keywords: 'changelog releases versions added changed fixed removed deprecated security breaking',
		sections: [
			{
				title: 'What is verified',
				body: 'Published versions are checked against the current npm version list; unpublished versions are excluded. Release metadata refreshes automatically, with a verified build snapshot used when the registry is unavailable. Source release notes come from the repository CHANGELOG.md. Historical per-version change notes are explicitly marked missing; timestamps are not invented release notes.',
			},
			{
				title: 'Release categories',
				body: 'Current recorded notes are grouped into Added, Changed, Fixed, Removed, Deprecated and Security. A missing category means no note is recorded, not that a release has been audited free of that class of issue. Breaking changes link to the migration guide.',
			},
		],
	},
	{
		id: 'migration',
		title: 'Migration to 2.x',
		group: 'Migration',
		description:
			'Breaking configuration names, removed APIs and concrete changes required for this workspace version.',
		keywords: 'migration 1.1.4 2.0 next breaking CalendarSystem selectionMode readOnly canonical rename',
		references: ['migration'],
		sections: [
			{
				title: 'Scope and compatibility',
				body: 'This migration is from the published 1.1.4 lineage to the 2.0.0 source release. It is a major-version change, not a compatible 1.x patch. No aliases preserve the removed configuration keys. Use the local tarball while 2.x is unpublished.',
			},
			{
				title: 'Configuration after migration',
				body: 'Use canonical names and explicitly persist the calendar with date-only values. The table below is generated from the repository migration document, including label-format and mobile-presentation values.',
				code: `import type { DatePickerConfig } from 'ngx-nepali-dualpicker';
const config: DatePickerConfig = {
 calendar: 'BS', selectionMode: 'range', allowTextInput: true, readOnly: false,
 showSecondaryDate: true, popupPosition: 'auto', mobilePresentation: 'bottom-sheet',
 rangeConstraints: { minDays: 3, maxDays: 32, preventCrossingUnavailableDates: true },
};`,
			},
			{
				title: 'Before migration (previous API)',
				body: 'This historical snippet illustrates names listed in the checked-in migration document. It is deliberately not valid against 2.x. Replace it with the typed example above; do not copy these keys into current applications.',
				language: 'Text',
				code: '// Previous configuration names\n{ calendarType: "BS", mode: "range", allowManualInput: true, readonly: false,\n  dualDateDisplay: true, position: "auto", mobileMode: "compact" }',
			},
			{
				title: 'Removed and renamed exports',
				body: 'CurrencyFormatterPipe and currency APIs are removed. Use CalendarSystem instead of the removed CalendarType alias, and Calendar.BS instead of Calendar.BD. DatePresetContext uses selectionMode. The previous-month component method is previousMonth(). Unsupported deep imports into src/lib are not a migration contract.',
			},
			{
				title: 'State and validation changes',
				body: 'Configuration snapshots are independent, and updateGlobalConfig uses reactive state. Mode/calendar/restriction changes are reconciled. writeValue does not emit selection changes. Multiple values normalize and deduplicate; range values order endpoints and may retain a valid partial start. Validation is opt-in, named-month manual parsing is unsupported, and malformed input follows the documented error policy.',
			},
			{
				title: 'Styles and defaults',
				body: 'Theme background names and corresponding --ndp-color CSS properties are expanded. bsYearRange makes the existing BS-only selector behavior explicit. Label-format/mobile value renames preserve their intended presentations. Consult the current defaults table rather than guessing defaults from the old API.',
			},
		],
	},
	{
		id: 'contributing',
		title: 'Contributing',
		group: 'Contributing',
		description: 'Develop, verify and review changes without bypassing public package boundaries.',
		keywords: 'contributing pull request bug issue source develop npm ci',
		sections: [
			{
				title: 'Prepare the workspace',
				body: 'Use the pinned Node version, install with npm ci, build the library and run both consuming apps. Keep changes compatible with Angular 17. Add no new dependency without a concrete need.',
				code: 'npm ci\nnpm run build:lib\nnpm run start:all',
				language: 'Shell',
			},
			{
				title: 'Contribution workflow',
				body: 'Work in a focused branch, read the source layout and architecture rules, add behavior-based regression coverage, regenerate API/doc data when the public surface changes, and run the documented checks. Do not deep-import internal library source from consumer apps. Prefer direct imports inside the library.',
			},
			{
				title: 'Reports and pull requests',
				body: 'A report should include Angular/TypeScript/browser versions, calendar/selection mode, a minimal config, expected/actual behavior and date-only values. Do not include private booking/customer data. Use the GitHub issue tracker linked in the site navigation to report reproducible problems.',
				warning: true,
			},
			{
				title: 'License and review',
				body: 'The repository includes an MIT license. No contributor license agreement, maintainer response SLA or published code of conduct was found in the audited source; do not imply one exists. Record user-visible changes and migrations before a release.',
			},
		],
	},
	{
		id: 'documentation-maintenance',
		title: 'Maintaining documentation',
		group: 'Contributing',
		description: 'Refresh source-derived references, releases, search, metadata and prerendered routes.',
		keywords: 'docs api generated inventory search registry sitemap maintenance coverage',
		sections: [
			{
				title: 'Structured content',
				body: 'DocPage/DocSection records define content. The catalog assigns groups and ordering once; generated navigation, routes, search and sitemap use that catalog. Add guides in content/pages, keep API explanations tied to actual source, and avoid editing generated files by hand.',
			},
			{
				title: 'Refresh commands',
				body: 'API declarations come from the TypeScript source, defaults from the built public package, and release/link metadata from an explicit registry refresh. Production builds refresh registry metadata; browser refreshes keep the published version current afterward.',
				code: 'npm run docs:api\nnpm run docs:registry\nnpm run docs:data\nnpm run check:docs\nnpm run check:docs-site\nnpm run build:docs',
				language: 'Shell',
			},
			{
				title: 'Publication checklist',
				body: 'Update site.config.json with confirmed production URLs and base path, verify repository links, refresh the registry snapshot, review npm advisories, run all checks and inspect prerendered HTML. Publish the release to npm before advertising its npm install command. Keep missing information explicit.',
			},
		],
	},
	{
		id: 'security',
		title: 'Security & responsible reporting',
		group: 'Contributing',
		description: 'Known reporting limitations and practical dependency/content safeguards.',
		keywords: 'security policy vulnerabilities audit disclosure CSP',
		sections: [
			{
				title: 'Reporting destination is not configured',
				body: 'No published private security contact or SECURITY.md policy existed in the audited repository. Do not post sensitive vulnerability details into a public example or issue. The maintainer must supply a verified private reporting channel before official launch.',
				warning: true,
			},
			{
				title: 'Documentation and examples',
				body: 'Code highlighting and search highlighting render text tokens rather than injecting untrusted HTML. Live configuration is parsed/validated JSON; it does not evaluate arbitrary TypeScript. Public example content must never contain private booking data, credentials or customer identifiers.',
			},
			{
				title: 'Dependencies',
				body: 'The documentation retains the repository’s Angular 17 toolchain. Installation may report upstream advisories; inspect npm audit and plan compatible remediation with the maintainer. Successful builds and tests are not a security audit or a promise of supported security updates.',
			},
		],
	},
];
