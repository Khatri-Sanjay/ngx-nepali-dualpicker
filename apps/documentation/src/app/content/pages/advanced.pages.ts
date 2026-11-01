import type { DocPage } from '../doc-model';
export const advancedPages: readonly DocPage[] = [
	{
		id: 'architecture',
		title: 'Architecture & design principles',
		group: 'Introduction',
		description: 'Understand the Angular adapter, pure calendar core and supported extension points.',
		keywords: 'architecture core public API OnPush signals configuration immutable calendar',
		sections: [
			{
				title: 'Two entry points',
				body: 'The root entry point contains Angular components, forms integration, services, tokens and themes. /core contains calendar conversion, arithmetic, parsing, validation and formatting without Angular/RxJS dependencies. Internal source paths are implementation details, not supported imports.',
			},
			{
				title: 'Date-domain rules',
				body: 'Public calendar objects use one-based months. Conversion is based on the bundled BS month table, a reference epoch and cumulative day offsets; it is not an astronomical calendar engine. Some inherited component state uses zero-based months. Prefer DateObj, DatePickerValue and public core functions over mutating that state.',
			},
			{
				title: 'Configuration and rendering',
				body: 'The picker is a standalone OnPush Angular adapter. Selection transitions and restrictions are separate from DOM rendering; configuration updates replace state and reconcile the model. Availability callbacks must be deterministic. Styles are scoped to picker hosts and private views; use theme contracts/tokens to customize.',
			},
			{
				title: 'Extension boundaries',
				body: 'Supported customization includes typed config, Angular forms, dateFilter, presets and DateCellTemplateDirective. Editing internal component state or deep-importing src/lib may bypass validation and is not a stable integration pattern.',
			},
		],
	},
	{
		id: 'signals-rxjs',
		title: 'Signals & RxJS',
		group: 'Guides',
		description: 'Connect application state to immutable config and Angular forms.',
		keywords: 'signals computed toSignal RxJS takeUntilDestroyed valueChanges debounceTime',
		sections: [
			{
				title: 'Signals for input configuration',
				body: 'Use a signal or computed configuration and pass its value to [config]. Supply a new object when changing nested settings. This is an application integration pattern, not an additional library store API.',
				code: `import { Component, computed, signal } from '@angular/core';
import { NgxNepaliDualpicker } from 'ngx-nepali-dualpicker';
import type { DatePickerConfig } from 'ngx-nepali-dualpicker';
@Component({ standalone: true, imports: [NgxNepaliDualpicker], template: '<button (click)="dark.set(!dark())">Theme</button><ngx-nepali-dualpicker [config]="config()" />' })
export class SignalExample {
 readonly dark = signal(false);
 readonly config = computed<DatePickerConfig>(() => ({ calendar: 'BS', theme: this.dark() ? 'dark' : 'light' }));
}`,
			},
			{
				title: 'RxJS form values',
				body: 'FormControl.valueChanges is the normal stream for model values, including programmatic writes and resets. dateSelected is an interaction event and should not be treated as a replacement for all form state. Use takeUntilDestroyed for subscriptions and avoid starting requests for incomplete ranges.',
			},
			{
				title: 'No hidden async availability API',
				body: 'dateFilter is synchronous. Fetch availability in your application, replace the captured immutable dataset and replace config so the grid re-evaluates. There is no library HTTP client, async dateFilter, resource or remote validation endpoint.',
			},
		],
	},
	{
		id: 'events',
		title: 'Events & value handling',
		group: 'Guides',
		description: 'Understand selected values, parse errors, popup lifecycle and calendar conversion.',
		keywords: 'dateSelected parseError pickerOpened pickerClosed calendarTypeChanged event payload range partial',
		references: ['outputs'],
		sections: [
			{
				title: 'Interaction events versus form state',
				body: 'dateSelected emits formatted mode-specific values after supported user actions. A first range click can emit a partial range. writeValue synchronizes without selection emissions; subscribe to your Angular control for a complete form-state stream. Clearing and calendar conversion can also update the value.',
			},
			{
				title: 'Rejected selections',
				body: 'parseError covers invalid manual drafts, rejected range endpoints, multiple-selection limit attempts and invalid presets. Read its type, message and value. Invalid text remains visible while the last committed model remains intact; rejected range endpoints preserve the start and show their explanation inside the open popup. An extra multiple-selection click announces the limit without invalidating the existing valid model. Enabling validation also exposes errors on the Angular control.',
			},
			{
				title: 'Popup and calendar events',
				body: 'pickerOpened/pickerClosed describe popup actions; inline rendering is independent. calendarTypeChanged emits AD or BS for an interactive switch. Persist the calendar with emitted date-only strings because DatePickerValue itself has no calendar tag.',
			},
		],
	},
	{
		id: 'performance',
		title: 'Performance & lazy loading',
		group: 'Guides',
		description: 'Keep calendar integrations predictable and avoid unnecessary application work.',
		keywords: 'performance OnPush lazy loading dateFilter debounce bundle core',
		sections: [
			{
				title: 'Keep callbacks inexpensive',
				body: 'dateFilter may run for many visible and intermediate range dates. Use constant-time lookup in a prepared Set; do not perform HTTP calls, mutate application state or compute expensive prices in each invocation. preventCrossingUnavailableDates may inspect every day in a candidate interval.',
			},
			{
				title: 'Lazy load the owning page',
				body: 'Use your Angular router loadComponent/loadChildren boundary around feature pages that contain pickers. The library is standalone and can be imported by those pages. A dynamic component can also be created with ViewContainerRef.createComponent; see the next guide.',
			},
			{
				title: 'Use the smallest entry point',
				body: 'Node utilities and conversion-only code should import /core. The repository verifies that a core-only consumer excludes Angular and picker implementation. Do not quote a universal application bundle size: production output depends on your imports and build configuration.',
			},
		],
	},
	{
		id: 'dynamic-components',
		title: 'Dynamic component integration',
		group: 'Guides',
		description: 'Create a real picker through Angular’s component API.',
		keywords: 'ViewContainerRef createComponent ComponentRef setInput setDate dynamic',
		sections: [
			{
				title: 'Create and configure',
				body: 'This is an Angular integration pattern. Use the public component type and setInput with the config alias. Manage the ComponentRef lifetime through its container or destroy it yourself. Prefer a host component with Angular forms directives when integrating complex forms.',
				code: `import { Component, ViewContainerRef, inject } from '@angular/core';
import { NgxNepaliDualpicker } from 'ngx-nepali-dualpicker';
@Component({ standalone: true, template: '<button (click)="create()">Add calendar</button>' })
export class DynamicExample {
 private readonly container = inject(ViewContainerRef);
 create(): void {
   this.container.clear();
   const picker = this.container.createComponent(NgxNepaliDualpicker);
   picker.setInput('config', { calendar: 'AD', inline: true });
   picker.changeDetectorRef.detectChanges();
   picker.instance.setDate('2024-01-15');
 }
}`,
			},
		],
	},
	{
		id: 'ssr',
		title: 'SSR & hydration',
		group: 'Guides',
		description: 'Understand browser guards, stable IDs and what server rendering does not prove.',
		keywords: 'SSR hydration prerender server browser id timezone',
		sections: [
			{
				title: 'Implementation support and limits',
				body: 'The library guards popup measurement, DOM listeners and per-instance theme application for browser execution. Browser guards are not a guarantee that every consuming app hydrates correctly. Validate your actual Angular version, timezone, locale, server renderer and projected templates.',
			},
			{
				title: 'Stable input and identifiers',
				body: 'Provide a stable config.id, fixed initial form values and consistent config on server and client. Avoid conditional browser-only markup that changes the initial calendar tree. Today is based on the local system date; server/client timezone or build-time differences can change current-date decoration.',
			},
			{
				title: 'Documentation rendering strategy',
				body: 'This documentation is prerendered to static HTML. Its content, navigation and metadata are available without JavaScript; live demos are deferred until the browser can run them. Prerendering documentation prose is not certification of all interactive library SSR/hydration scenarios.',
			},
			{
				title: 'Recommended application verification',
				body: 'Render a host with an explicit ID and fixed AD/BS form value on the server, then hydrate it in a browser and test keyboard interaction, disabled/read-only states, custom cells and multiple picker instances. Check for hydration warnings and mismatched date fields. These are integration tests for your application.',
			},
		],
	},
	{
		id: 'testing',
		title: 'Testing integrations',
		group: 'Guides',
		description: 'Test forms, restrictions, keyboard interaction and real consumer imports.',
		keywords: 'TestBed Karma Jasmine unit integration axe testing',
		sections: [
			{
				title: 'Test the application boundary',
				body: 'Create a standalone host importing the installed public package and the forms module you use. Verify initial writes, user selections, clear/reset, disabled/readOnly behavior, partial ranges, validation errors and runtime config changes. Avoid asserting private signals or querying internal classes as an application contract.',
			},
			{
				title: 'Keyboard and assistive technology',
				body: 'Test the native input, popup trigger, calendar grid and month/year picker using keyboard events and real focus. Automated axe checks help find issues but cannot certify full screen-reader behavior; perform manual checks on the target browser/AT combinations.',
			},
			{
				title: 'Repository checks',
				body: 'The workspace supplies library and consumer browser suites, compiled documentation examples, architecture boundaries, calendar round trips, package export checks and a core-only bundle check. The maintenance guide documents which commands to run and how to record their actual results.',
				code: 'npm run check\nnpm run build\nnpm test\nnpm run test:playground\nnpm run test:docs\nnpm run check:docs\nnpm run check:package\nnpm run check:bundle',
				language: 'Shell',
			},
		],
	},
	{
		id: 'deployment',
		title: 'Build & production deployment',
		group: 'Guides',
		description: 'Deploy prerendered documentation and the separate playground with explicit public origins.',
		keywords: 'deployment prerender sitemap robots canonical DOCS_PUBLIC_URL PLAYGROUND_PUBLIC_URL hosting',
		sections: [
			{
				title: 'Build the static website',
				body: 'Build the library first, generate documentation data and build the documentation application. The browser output contains a prerendered index for each route and static assets. Host the browser directory; no Node server is required for this deployment.',
				code: 'npm ci\nnpm run build:lib\nnpm run build:docs',
				language: 'Shell',
			},
			{
				title: 'Configure public identity',
				body: 'Set the documentation public origin/base path and playground URL in the documentation site configuration before deployment. No production origin is inferred from localhost or the older package homepage. Canonical/social URLs and sitemap entries are emitted only when the documentation origin is configured.',
			},
			{
				title: 'Hosting rules',
				body: 'Serve prerendered route directories and index.html files. Configure a 404 fallback for unknown paths and ensure the base href matches any subdirectory deployment. Deploy dist/playground/browser separately and configure the real playground URL for links/embedding. HTTPS is required for reliable clipboard access.',
			},
			{
				title: 'Security and release readiness',
				body: 'Review npm audit for the pinned toolchain, apply compatible fixes through your normal release process and test again. Do not run audit fix --force blindly across Angular majors. This website implementation does not remove upstream dependency advisories or establish a security certification.',
			},
		],
	},
	{
		id: 'roadmap',
		title: 'Roadmap & known limitations',
		group: 'Introduction',
		description: 'Current implementation boundaries and evidence needed before a stable release.',
		keywords: 'roadmap limitations calendar accuracy SSR accessibility release',
		sections: [
			{
				title: 'Current capabilities',
				body: 'Single, range and multiple selection; BS/AD conversion; forms integration; canonical typed configuration; seven themes plus system; localized labels/numerals; date restrictions; synchronous filters; presets and projected cells are implemented in this workspace.',
			},
			{
				title: 'Known boundaries',
				body: 'Manual parsing supports five numeric formats; named-month display is not editable. Time-of-day selection is not implemented. Public date fields are one-based, while some inherited component state remains zero-based. BS conversion depends on bundled data and its supported overlap with AD validation.',
			},
			{
				title: 'Before stable publication',
				body: 'The repository release checkpoint calls for independent calendar data/provenance review, target browser/assistive-technology verification, consumer-version verification and full SSR/hydration validation. The package metadata currently points to an unavailable public repository and the 2.x prerelease is not published. No dates are promised for these tasks.',
			},
		],
	},
];
