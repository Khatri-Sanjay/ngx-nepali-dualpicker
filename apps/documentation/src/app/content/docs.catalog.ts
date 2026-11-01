import { pages as existingPages } from './docs.content';
import { setupPages } from './pages/setup.pages';
import { referencePages } from './pages/reference.pages';
import { advancedPages } from './pages/advanced.pages';
import { projectPages } from './pages/project.pages';
import { docGroups, sectionId } from './doc-model';
import type { DocGroup, DocPage } from './doc-model';
export { docGroups, pagePath, sectionId } from './doc-model';
export type { DocPage, DocSection } from './doc-model';
export { quickStart, installation } from './docs.content';

const groups: Record<string, DocGroup> = {
	home: 'Introduction',
	'getting-started': 'Getting Started',
	pickers: 'Components',
	booking: 'Guides',
	core: 'Services',
	readOnly: 'Guides',
	forms: 'Guides',
	restrictions: 'Guides',
	conversion: 'Guides',
	localization: 'Guides',
	formatting: 'Guides',
	theming: 'Theming',
	accessibility: 'Guides',
	api: 'API Reference',
	examples: 'Components',
	faq: 'Getting Started',
};
const references: Record<string, readonly string[]> = {
	pickers: ['inputs', 'outputs', 'component-methods', 'config'],
	core: ['core-functions', 'DateCalculator', 'DateValidator', 'DateParser'],
	api: ['exports', 'inputs', 'outputs', 'component-methods', 'config'],
	theming: ['theme-tokens', 'DatePickerTheme'],
	accessibility: ['keyboard'],
	formatting: ['format-tokens'],
};
const order = [
	'home',
	'package',
	'architecture',
	'roadmap',
	'getting-started',
	'compatibility',
	'standalone',
	'ngmodule',
	'faq',
	'installation',
	'project-setup',
	'configuration',
	'pickers',
	'examples',
	'playground',
	'date-cell-template',
	'nepali-date-pipe',
	'date-conversion-service',
	'datepicker-config-service',
	'theme-service',
	'providers',
	'core',
	'theming',
	'forms',
	'read-only',
	'restrictions',
	'booking',
	'conversion',
	'localization',
	'formatting',
	'events',
	'signals-rxjs',
	'performance',
	'dynamic-components',
	'ssr',
	'testing',
	'deployment',
	'accessibility',
	'api',
	'types',
	'changelog',
	'migration',
	'contributing',
	'documentation-maintenance',
	'security',
];
const adapted = existingPages.map((page): DocPage => ({
	...page,
	id: page.id === 'readOnly' ? 'read-only' : page.id,
	title: page.id === 'pickers' ? 'NgxNepaliDualpicker' : page.id === 'accessibility' ? 'Accessibility' : page.title,
	group: groups[page.id],
	references: references[page.id],
	...(page.id === 'pickers'
		? {
				source: 'libs/ngx-nepali-dualpicker/src/lib/datepicker/ngx-nepali-dualpicker.component.ts',
				examples: ['basic', 'range', 'multiple'],
				sections: [
					...page.sections,
					{
						title: 'Import and form integration',
						body: 'Import NgxNepaliDualpicker in a standalone component or NgModule imports array. Use ReactiveFormsModule/FormsModule for forms. The config input is not a value binding; use formControl, formControlName or ngModel. The component has no value input.',
					},
					{
						title: 'Themes, CSS and responsive behavior',
						body: 'Component styles and SVG icons are included. Use theme/customTheme or the documented CSS variables. Host state classes include nepali-date-picker, ndp-disabled and ndp-readonly; detailed date/grid selectors belong to private views and are not a stable utility-class API. inline renders in normal flow; popupPosition applies to popups; mobilePresentation selects bottom-sheet or popup presentation.',
					},
					{
						title: 'Keyboard and accessibility',
						body: 'The date grid exposes full date names, current/selected/unavailable states and one roving tab stop. Arrow/Home/End/Page keys navigate; Escape dismisses popups or the period picker. The labelled Today action respects read-only/disabled state. Month/year grids support arrows and a year-then-month flow. Validate your application with target assistive technology.',
					},
					{
						title: 'Limitations and related integrations',
						body: 'Manual input uses supported numeric formats; named-month display is read-only. No time-of-day picker is exported. Form values are date-only and calendar-specific. Use DateCellTemplateDirective for cell contents, NepaliDatePipe for labels, and /core or DateConversionService for conversion.',
					},
					{
						title: 'Popup ownership and dismissal',
						body: 'Popups use the browser top layer to escape transformed or clipping cards and native dialogs, with a document-level compatibility surface where needed. Theme inheritance, outside-click handling and Angular ownership are preserved. The mobile bottom sheet remains nonmodal: background content is not focus-trapped or locked. Use its visible Close calendar action, Escape or an outside click to dismiss it. Sheet height follows the visual viewport and includes safe-area padding.',
					},
					{
						title: 'Today, selection limits and unavailable months',
						body: 'Today selects according to the active mode only when the local current date is available; otherwise its button is disabled and its explanation is shown. Rejected range ends keep the start and show an actionable error inside the open calendar. Multiple selection displays its count/limit and announces extra rejected clicks without invalidating an otherwise valid committed model. A month with no available dates explains how to continue browsing. Inline calendars omit the redundant popup trigger.',
					},
				],
			}
		: {}),
}));
export const pages: readonly DocPage[] = [
	...adapted,
	...setupPages,
	...referencePages,
	...advancedPages,
	...projectPages,
]
	.map((page) => ({
		...page,
		sections: page.sections.map((section) => ({ ...section, id: section.id ?? sectionId(section.title) })),
	}))
	.sort(
		(a, b) =>
			docGroups.indexOf(a.group as DocGroup) - docGroups.indexOf(b.group as DocGroup) ||
			order.indexOf(a.id) - order.indexOf(b.id),
	);

export const referenceTitles: Record<string, string | undefined> = {
	inputs: 'Component inputs',
	outputs: 'Component events',
	'component-methods': 'Public integration methods',
	config: 'Configuration options',
	'config-examples': 'Configuration examples',
	exports: 'Public entry points',
	'core-functions': 'Core functions',
	types: 'Public type declarations',
	'theme-tokens': 'Theme tokens and CSS variables',
	'format-tokens': 'Formatting tokens',
	keyboard: 'Keyboard interactions',
	'provider-exports': 'Provider and token API',
	migration: 'Configuration migration table',
	package: 'Package metadata',
};
