import { copyFileSync, existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { signalHost, signalSpec } from './signal-forms-fixture.mjs';

// Install the actual npm tarball in an isolated consumer. Never map library source.
const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
const npmCli =
	process.env.npm_execpath ||
	require.resolve('npm/bin/npm-cli.js', {
		paths: [path.dirname(process.execPath)],
	});
const angular = process.argv[2] || '22';
const major = Number(angular.split('.')[0]);
const minor = Number(angular.split('.')[1] ?? -1);
const typescript = {
	17: '~5.2.2',
	18: minor === 0 ? '~5.4.5' : '~5.5.4',
	19: minor === 0 ? '~5.6.3' : minor === 1 ? '~5.7.3' : '~5.8.3',
	20: minor === 0 || minor === 1 ? '~5.8.3' : '~5.9.3',
	21: '~5.9.3',
	22: '~6.0.3',
}[major];
if (!typescript) throw new Error('Supported compatibility targets: Angular 17 through 22');
const exact = angular.includes('.');
const version = exact ? angular : `^${major}.0.0`;
const cliVersion = exact ? angular : version;
const fixture = path.join(root, 'tmp', `compat-angular-${angular}`);
mkdirSync(path.join(fixture, 'src'), { recursive: true });
if (existsSync(path.join(fixture, 'verification.json'))) unlinkSync(path.join(fixture, 'verification.json'));
const run = (args, cwd = fixture) => {
	const result = spawnSync(process.execPath, args, { cwd, stdio: 'inherit', env: process.env });
	if (result.error) throw result.error;
	if (result.status !== 0) throw new Error(`Command failed: ${args.join(' ')}`);
};
const json = (name, data) => writeFileSync(path.join(fixture, name), JSON.stringify(data, null, 2));
const pack = spawnSync(
	process.execPath,
	[npmCli, 'pack', './dist/ngx-nepali-dualpicker', '--pack-destination', fixture, '--json'],
	{
		cwd: root,
		encoding: 'utf8',
	},
);
if (pack.status !== 0) throw new Error(pack.stderr);
const packedName = JSON.parse(pack.stdout)[0].filename;
const packedPath = path.join(fixture, packedName);
const digest = createHash('sha256').update(readFileSync(packedPath)).digest('hex').slice(0, 16);
const tarball = packedName.replace(/\.tgz$/, `-${digest}.tgz`);
// A changed build must force npm to reinstall, even when the library version is unchanged.
copyFileSync(packedPath, path.join(fixture, tarball));
unlinkSync(packedPath);
const dependencies = {
	'ngx-nepali-dualpicker': `file:./${tarball}`,
	rxjs: '^7.8.0',
	tslib: '^2.6.0',
	'zone.js': major <= 18 ? '~0.14.10' : '~0.15.1',
};
for (const name of ['common', 'compiler', 'core', 'forms', 'platform-browser', 'platform-server'])
	dependencies[`@angular/${name}`] = version;
if (major < 20) dependencies['@angular/platform-browser-dynamic'] = version;
const builder = major >= 20 ? '@angular/build' : '@angular-devkit/build-angular';
json('package.json', {
	name: `dualpicker-compat-angular-${major}`,
	private: true,
	dependencies,
	devDependencies: {
		[builder]: cliVersion,
		'@angular/cli': cliVersion,
		'@angular/compiler-cli': version,
		typescript,
		'@types/jasmine': '~5.1.0',
		'jasmine-core': '~5.1.0',
		karma: '^6.4.0',
		'karma-chrome-launcher': '^3.2.0',
		'karma-jasmine': '^5.1.0',
	},
});
json('angular.json', {
	version: 1,
	// Repeated package checks must not reuse transformed code from an older tarball.
	cli: { cache: { enabled: false } },
	projects: {
		consumer: {
			projectType: 'application',
			root: '',
			sourceRoot: 'src',
			architect: {
				build: {
					builder: `${builder}:application`,
					options: {
						outputPath: 'dist',
						index: 'src/index.html',
						browser: 'src/main.ts',
						tsConfig: 'tsconfig.app.json',
						polyfills: ['zone.js'],
						styles: [],
						assets: [],
					},
				},
				test: {
					builder: `${builder}:karma`,
					options: {
						tsConfig: 'tsconfig.spec.json',
						karmaConfig: 'karma.conf.cjs',
						polyfills: ['zone.js', 'zone.js/testing'],
						styles: [],
						assets: [],
					},
				},
			},
		},
	},
});
writeFileSync(
	path.join(fixture, 'karma.conf.cjs'),
	`module.exports = config => config.set({
  frameworks: ['jasmine'${major < 20 ? ", '@angular-devkit/build-angular'" : ''}],
  plugins: [require('karma-jasmine'), require('karma-chrome-launcher')${major < 20 ? ", require('@angular-devkit/build-angular/plugins/karma')" : ''}],
  reporters: ['dots'], port: ${9900 + major}, browsers: ['ChromeHeadless'], singleRun: true,
});\n`,
);
json('tsconfig.json', {
	compilerOptions: {
		target: 'ES2022',
		module: 'ES2022',
		moduleResolution: 'bundler',
		strict: true,
		experimentalDecorators: true,
		useDefineForClassFields: false,
		skipLibCheck: false,
		lib: ['ES2022', 'DOM'],
	},
	angularCompilerOptions: { strictTemplates: true, strictInjectionParameters: true },
});
json('tsconfig.app.json', {
	extends: './tsconfig.json',
	compilerOptions: { outDir: './out-tsc/app', types: [] },
	files: ['src/main.ts'],
});
json('tsconfig.spec.json', {
	extends: './tsconfig.json',
	compilerOptions: { outDir: './out-tsc/spec', types: ['jasmine'] },
	include: ['src/**/*.spec.ts'],
});
writeFileSync(
	path.join(fixture, 'src/index.html'),
	'<!doctype html><html><head><title>Compatibility</title><base href="/"></head><body><compat-root></compat-root></body></html>',
);
writeFileSync(
	path.join(fixture, 'src/host.ts'),
	`
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { NgxNepaliDualpicker, DateCellTemplateDirective, DatePickerConfig, provideNepaliDualpicker } from 'ngx-nepali-dualpicker';
@Component({ selector: 'compat-root', standalone: true,
  imports: [FormsModule, ReactiveFormsModule, NgxNepaliDualpicker, DateCellTemplateDirective],
  providers: [provideNepaliDualpicker({ language: 'en' })],
  template: '<ngx-nepali-dualpicker [config]="config" [formControl]="control"><ng-template ndpDateCell let-date><span class="consumer-cell">{{date.day}}</span></ng-template></ngx-nepali-dualpicker><ngx-nepali-dualpicker [config]="config" [(ngModel)]="model" />'
})
export class Host {
  config: DatePickerConfig = { calendar: 'AD', convertOnCalendarChange: true, showSecondaryDate: true, dateFilter: date => date.day !== 16, validation: { enabled: true }, presets: [{label: 'Custom date', value: '2024-01-20'}] };
  control = new FormControl('2024-01-15');
  model = '2024-01-15';
}
`,
);
writeFileSync(
	path.join(fixture, 'src/main.ts'),
	`import { bootstrapApplication } from '@angular/platform-browser';\nimport { Host } from './host';\nbootstrapApplication(Host).catch(console.error);\n`,
);
writeFileSync(
	path.join(fixture, 'src/consumer.spec.ts'),
	`
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgxNepaliDualpicker, DateConversionService, nepaliDateValidator, EDITABLE_DATE_FORMATS } from 'ngx-nepali-dualpicker';
import { FormControl } from '@angular/forms';
import { Host } from './host';
import { convertAdToBs } from 'ngx-nepali-dualpicker/core';
describe('Published package consumer', () => {
  it('supports reactive forms, ngModel, switching and disabled state', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    const pickers = fixture.debugElement.queryAll(By.directive(NgxNepaliDualpicker));
    const reactive = pickers[0].componentInstance as NgxNepaliDualpicker;
    const model = pickers[1].componentInstance as NgxNepaliDualpicker;
    expect(reactive.inputValue()).toBe('2024-01-15');
    expect(model.inputValue()).toBe('2024-01-15');
    const changes = jasmine.createSpy('valueChanges');
    fixture.componentInstance.control.valueChanges.subscribe(changes);
    fixture.componentInstance.control.setValue('2024-02-29');
    fixture.detectChanges();
    expect(changes).toHaveBeenCalledTimes(1);
    expect(reactive.inputValue()).toBe('2024-02-29');
    reactive.switchCalendarType('BS');
    reactive.switchCalendarType('AD');
    expect(fixture.componentInstance.control.value).toBe('2024-02-29');
    model.setDate('2024-01-20');
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.model).toBe('2024-01-20');
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(pickers[0].nativeElement.querySelector('input').disabled).toBeTrue();
    expect(convertAdToBs('2024-01-15')).toEqual({ year: 2080, month: 10, day: 1 });
    const service = TestBed.inject(DateConversionService);
    expect(service.convertBsToAd(service.convertAdToBs('2024-02-29'), true)).toBe('2024-02-29');
    expect(EDITABLE_DATE_FORMATS.length).toBe(5);
    const invalid = new FormControl('2024-02-30', nepaliDateValidator({ calendar: 'AD' }));
    expect(invalid.hasError('nepaliDate')).toBeTrue();
    fixture.componentInstance.control.enable();
    reactive.open();
    fixture.detectChanges();
    expect(pickers[0].nativeElement.querySelector('.consumer-cell')).not.toBeNull();
    reactive.selectPreset({label: 'Unavailable', value: '2024-01-16'});
    expect(fixture.componentInstance.control.value).toBe('2024-02-29');
    reactive.selectPreset({label: 'Custom date', value: '2024-01-20'});
    expect(fixture.componentInstance.control.value).toBe('2024-01-20');
    const range = new FormControl({start: '2024-02-28', end: '2024-03-01'}, nepaliDateValidator({calendar: 'AD', selectionMode: 'range', rangeConstraints: {maxDays: 2}}));
    expect(range.getError('nepaliDateRange').reason).toBe('maxDays');
    fixture.componentInstance.config = { ...fixture.componentInstance.config, readOnly: true };
    fixture.detectChanges();
    const beforeReadonly = fixture.componentInstance.control.value;
    reactive.selectToday(); reactive.clearSelection(); reactive.switchCalendarType('BS');
    expect(fixture.componentInstance.control.value).toBe(beforeReadonly);
    expect(pickers[0].nativeElement.querySelector('input').readOnly).toBeTrue();
  });
});
`,
);
if (major >= 21) {
	writeFileSync(path.join(fixture, 'src/signal-host.ts'), signalHost);
	writeFileSync(
		path.join(fixture, 'src/signal-forms.spec.ts'),
		`const forwardsLegacyValidators = ${major >= 22};\n` + signalSpec,
	);
	writeFileSync(
		path.join(fixture, 'src/main.ts'),
		"import { bootstrapApplication } from '@angular/platform-browser';\nimport { SignalHost } from './signal-host';\nbootstrapApplication(SignalHost).catch(console.error);\n",
	);
}
console.log(`Checking Angular ${angular} with Node ${process.version} and the packed library`);
run([npmCli, 'install', '--no-audit', '--no-fund']);
const cli = path.join(fixture, 'node_modules/@angular/cli/bin/ng.js');
run([cli, 'build', 'consumer']);
run([cli, 'test', 'consumer', '--watch=false', '--browsers=ChromeHeadless']);
// A real renderer exercises guarded code without browser globals. Hydration is a separate browser test.
const compiler = require(path.join(fixture, 'node_modules/typescript'));
const serverHost = compiler.transpileModule(readFileSync(path.join(fixture, 'src/host.ts'), 'utf8'), {
	compilerOptions: {
		target: compiler.ScriptTarget.ES2022,
		module: compiler.ModuleKind.ES2022,
		experimentalDecorators: true,
		useDefineForClassFields: false,
	},
}).outputText;
writeFileSync(path.join(fixture, 'src/server-host.mjs'), serverHost);
writeFileSync(
	path.join(fixture, 'src/server-smoke.mjs'),
	`
import 'zone.js/node';
import '@angular/compiler';
import assert from 'node:assert/strict';
import { bootstrapApplication } from '@angular/platform-browser';
import { renderApplication, provideServerRendering } from '@angular/platform-server';
import { Host } from './server-host.mjs';
const html = await renderApplication(
  context => bootstrapApplication(Host, { providers: [provideServerRendering()] }, context),
  { document: '<html><head></head><body><compat-root></compat-root></body></html>', url: 'http://localhost/', allowedHosts: ['localhost'] },
);
assert.equal(typeof globalThis.window, 'undefined');
assert.ok(html.includes('2024-01-15'));
assert.equal((html.match(/<ngx-nepali-dualpicker[ >]/g) ?? []).length, 2);
console.log('PASS: real server renderer, two forms pickers, no browser window global');
`,
);
run([path.join(fixture, 'src/server-smoke.mjs')]);
const installed = JSON.parse(readFileSync(path.join(fixture, 'node_modules/@angular/core/package.json'), 'utf8'));
json('verification.json', {
	status: 'passed',
	angular: installed.version,
	node: process.version,
	typescript: JSON.parse(readFileSync(path.join(fixture, 'node_modules/typescript/package.json'), 'utf8')).version,
	tarball,
	checks: [
		'packed install',
		'production build',
		'browser forms and core smoke',
		...(major >= 21 ? ['Signal Forms production build and six browser integration scenarios'] : []),
		'server rendering without browser globals',
	],
});
console.log(`PASS: published package build and forms runtime on Angular ${installed.version}`);
