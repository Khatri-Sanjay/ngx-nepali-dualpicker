import type { DocPage } from '../doc-model';

export const setupPages: readonly DocPage[] = [
	{
		id: 'installation',
		title: 'Installation',
		group: 'Installation',
		description: 'Install the documented workspace build and understand published-version differences.',
		keywords: 'npm yarn pnpm tarball package dependencies install prerelease stable',
		sections: [
			{
				title: 'Choose the correct version',
				body: 'This documentation describes 2.0.0-next.0 in the repository. npm currently publishes 1.1.4; the renamed 2.x configuration keys do not work in 1.x. Until the prerelease is published, build the package from this workspace and install its tarball. The published-version installation commands below are for 1.1.4 only.',
				warning: true,
			},
			{
				title: 'Build the documented package',
				body: 'Run these commands from the library workspace. The pack script includes migration and changelog documents in dist/packages. Install that tarball in your consuming app, adjusting the relative path to match your folders.',
				code: 'npm ci\nnpm run pack:lib\n# From your consuming Angular application:\nnpm install ../nepali-dualpicker-workspace/dist/packages/ngx-nepali-dualpicker-2.0.0-next.0.tgz',
				language: 'Shell',
			},
			{
				title: 'Package manager alternatives',
				body: 'All three package managers can install the generated tarball. Use the same package-manager lockfile as the consuming application.',
				code: 'yarn add ../nepali-dualpicker-workspace/dist/packages/ngx-nepali-dualpicker-2.0.0-next.0.tgz\npnpm add ../nepali-dualpicker-workspace/dist/packages/ngx-nepali-dualpicker-2.0.0-next.0.tgz',
				language: 'Shell',
			},
			{
				title: 'Published stable package',
				body: 'These commands install the verified published release, not the API described by the 2.x examples. Consult the migration guide before replacing a stable installation.',
				code: 'npm install ngx-nepali-dualpicker@1.1.4\nyarn add ngx-nepali-dualpicker@1.1.4\npnpm add ngx-nepali-dualpicker@1.1.4',
				language: 'Shell',
			},
			{
				title: 'Dependencies and assets',
				body: 'The application supplies @angular/common, @angular/core, @angular/forms and RxJS peers. tslib is the only runtime dependency. No CSS framework, global library stylesheet, font files, icon font, CDK or animations provider is required; component styling and SVG icons are included.',
			},
		],
	},
	{
		id: 'compatibility',
		title: 'Compatibility & prerequisites',
		group: 'Getting Started',
		description: 'Separate declared peer support from the toolchain and checks actually available.',
		keywords: 'Angular TypeScript Node browser compatibility peers 17 18 19 20 21 22',
		sections: [
			{
				title: 'Declared Angular peers',
				body: 'The package declares Angular common/core/forms >=17.0.0 <23.0.0 and RxJS ^6.5.3 or ^7.4.0. This is a peer declaration, not certification of every patch, browser, SSR setup or third-party integration. The compatibility workflow builds isolated tarball consumers; review its run results before treating a particular major as verified.',
			},
			{
				title: 'Repository toolchain',
				body: 'This workspace uses Angular 17.3.12, CLI/build tooling 17.3.17 and TypeScript ~5.4.5. Its engines pin Node >=20.19.0 <21 and npm >=10 <12. Use .nvmrc/.node-version for repository development. Consumer applications should follow the official Angular compatibility table for their own Angular major.',
			},
			{
				title: 'Browser support',
				body: 'The repository has no maintained browser-version certification matrix. Browser tests here run through a Chromium headless launcher; this is not evidence of Safari, Firefox, mobile assistive-technology or every browser/OS combination. The implementation uses modern grid/flexbox, CSS variables, ResizeObserver and browser feature guards. Test the target browsers of your application.',
			},
			{
				title: 'Version metadata',
				body: 'The package page distinguishes the workspace version from a dated npm registry snapshot. Registry refresh is a maintenance command, not a network request required to read the documentation.',
			},
		],
	},
	{
		id: 'standalone',
		title: 'Standalone integration',
		group: 'Getting Started',
		description: 'Import the picker directly into an Angular standalone component.',
		keywords: 'standalone ApplicationConfig bootstrapApplication provideNepaliDualpicker',
		sections: [
			{
				title: 'Import the component',
				body: 'NgxNepaliDualpicker is standalone. Import it in the component that owns the template; root bootstrap does not make template imports available automatically.',
				code: `import { Component } from '@angular/core';
import { NgxNepaliDualpicker } from 'ngx-nepali-dualpicker';
@Component({ standalone: true, imports: [NgxNepaliDualpicker], template: '<ngx-nepali-dualpicker [config]="config" />' })
export class StandaloneExample { config = { calendar: 'BS' as const, inline: true }; }`,
			},
			{
				title: 'Optional application defaults',
				body: 'Register provideNepaliDualpicker in ApplicationConfig.providers when multiple pickers share settings. It is optional: the built-in token factory already supplies defaults. Per-picker configuration wins over application defaults.',
			},
		],
	},
	{
		id: 'ngmodule',
		title: 'NgModule integration',
		group: 'Getting Started',
		description: 'Use the standalone exports from an existing NgModule application.',
		keywords: 'NgModule imports declarations standalone FormsModule',
		sections: [
			{
				title: 'Import, do not declare',
				body: 'The library exports no NgModule. Angular permits standalone components, directives and pipes in an NgModule imports array. Do not put these exports in declarations.',
				code: `import { Component, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxNepaliDualpicker } from 'ngx-nepali-dualpicker';
import type { DatePickerValue } from 'ngx-nepali-dualpicker';
@Component({ selector: 'app-module-example', template: '<ngx-nepali-dualpicker [(ngModel)]="value" />' })
export class ModuleExample { value: DatePickerValue = null; }
@NgModule({ declarations: [ModuleExample], imports: [FormsModule, NgxNepaliDualpicker], exports: [ModuleExample] })
export class ExampleModule {}`,
			},
			{
				title: 'Forms imports still matter',
				body: 'Import FormsModule for ngModel, or ReactiveFormsModule for formControl/formControlName. Providers configure defaults; they do not register template directives.',
			},
		],
	},
	{
		id: 'configuration',
		title: 'Configuration reference',
		group: 'Installation',
		description: 'Every supported option, its type, default, purpose and a typed example.',
		keywords: 'DatePickerConfig options defaults provider global readOnly calendar selectionMode popupPosition',
		references: ['config', 'config-examples'],
		sections: [
			{
				title: 'Precedence and updates',
				body: 'Built-in defaults are merged with application defaults, then instance configuration. Nested settings merge; arrays replace; undefined is ignored; null clears date bounds. Reads from DatePickerConfigService are independent snapshots. Replace [config] objects rather than mutating captured state.',
			},
			{
				title: 'Canonical 2.x names',
				body: 'Configuration uses calendar, selectionMode, readOnly, allowTextInput, showSecondaryDate and popupPosition. Removed 1.x/earlier checkpoint names are not aliases. Use the migration table when upgrading.',
			},
			{
				title: 'Dates and calendars',
				body: 'Public date objects have one-based months. minDate/maxDate constrain both calendars; bsYearRange limits the BS year selector only. Set calendar explicitly when storing date-only values. outputFormat determines emitted strings; displayFormat determines visible and editable text.',
			},
			{
				title: 'Disabled versus read-only',
				body: 'Disable through Angular forms to block all picker actions. readOnly permits browsing but blocks selection, clearing, presets, and mode/calendar changes. There is no disabled option in DatePickerConfig.',
			},
		],
	},
	{
		id: 'project-setup',
		title: 'Project setup & styles',
		group: 'Installation',
		description: 'Angular, TypeScript, app providers, assets and production build setup.',
		keywords: 'angular.json tsconfig styles icons fonts production optimization',
		sections: [
			{
				title: 'Angular workspace configuration',
				body: 'Consumers do not need a special angular.json entry or a global stylesheet import. Import the standalone component and forms module you use. The library ships its own scoped/global-to-host component styles and inline SVG icons.',
			},
			{
				title: 'TypeScript setup',
				body: 'Use the TypeScript version supported by your Angular toolchain. Keep strict and strictTemplates enabled. Import type-only contracts with import type. Do not add paths that point into library src/lib; consume the installed root or /core entry point.',
			},
			{
				title: 'Application configuration',
				body: 'provideNepaliDualpicker supplies optional shared defaults. Angular common/core/forms and RxJS must resolve compatibly in the consuming application; do not bundle a second Angular runtime.',
			},
			{
				title: 'Production optimization',
				body: 'Build the consuming application in production mode. Package sideEffects is false and /core has no Angular runtime imports; actual output size depends on entry points and imports. Avoid importing the Angular root entry point for Node-only calendar calculations.',
			},
		],
	},
];
