import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import ts from 'typescript';

const root = path.resolve('dist/ngx-nepali-dualpicker');
const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
assert.equal(manifest.name, 'ngx-nepali-dualpicker');
assert.equal(manifest.sideEffects, false);
for (const entry of ['.', './core']) {
	assert.ok(manifest.exports[entry]?.types, `Missing types export: ${entry}`);
	assert.ok(manifest.exports[entry]?.default, `Missing ESM export: ${entry}`);
}
const expectedExports = {
	'.': [
		'NgxNepaliDualpicker',
		'nepaliDateValidator',
		'EDITABLE_DATE_FORMATS',
		'DateCellTemplateDirective',
		'DateFilter',
		'RangeConstraints',
		'DatePresetContext',
		'DateSelectionPreset',
		'DateCellContext',
		'provideNepaliDualpicker',
		'DateConversionService',
		'DatePickerConfigService',
		'ThemeService',
		'DATE_PICKER_CONFIG',
		'DEFAULT_PICKER_CONFIG',
		'Calendar',
		'PRESET_THEMES',
		'NepaliDatePipe',
		'DatePickerConfig',
		'CalendarSystem',
		'DatePickerTheme',
		'PresetThemeName',
		'DateObj',
		'DateInput',
		'DatePickerValue',
	],
	'./core': [
		'convertAdToBs',
		'convertBsToAd',
		'getWeekday',
		'DateCalculator',
		'DateValidator',
		'DateParser',
		'formatPickerDate',
		'DateObj',
		'DateInput',
		'formatDate',
		'CalendarSystem',
		'EDITABLE_DATE_FORMATS',
	],
};
for (const [entry, expected] of Object.entries(expectedExports)) {
	const declaration = path.join(root, manifest.exports[entry].types);
	const program = ts.createProgram([declaration], { skipLibCheck: true, noEmit: true });
	const checker = program.getTypeChecker();
	const symbol = checker.getSymbolAtLocation(program.getSourceFile(declaration));
	assert.ok(symbol, `Missing declaration module: ${entry}`);
	assert.deepEqual(
		checker
			.getExportsOfModule(symbol)
			.map((item) => item.name)
			.sort(),
		[...expected].sort(),
		`Public exports changed: ${entry}`,
	);
}
const corePath = path.join(root, manifest.exports['./core'].default);
const source = readFileSync(corePath, 'utf8');
assert.doesNotMatch(source, /(?:from\s*|import\s*)['"](?:@angular|rxjs|@angular\/cdk)/);
const core = await import(pathToFileURL(corePath).href);
assert.deepEqual(core.convertAdToBs('2024-01-15'), { year: 2080, month: 10, day: 1 });
assert.deepEqual(core.convertBsToAd('2080-10-01'), { year: 2024, month: 1, day: 15 });
for (const file of readdirSync(path.join(root, 'fesm2022')).filter((file) => file.endsWith('.mjs'))) {
	assert.doesNotMatch(
		readFileSync(path.join(root, 'fesm2022', file), 'utf8'),
		/CurrencyFormatterPipe|CURRENCY_CONFIG|currencyFormatter/,
	);
}
const npmCli = process.env.npm_execpath;
assert.ok(npmCli, 'Run through npm run check:package');
const packed = spawnSync(process.execPath, [npmCli, 'pack', root, '--dry-run', '--json'], { encoding: 'utf8' });
assert.equal(packed.status, 0, packed.stderr);
const [{ files }] = JSON.parse(packed.stdout);
assert.ok(files.some((file) => file.path === 'README.md'));
assert.ok(files.some((file) => file.path === 'LICENSE'));
for (const file of files)
	assert.doesNotMatch(file.path, /(?:\.spec\.|node_modules|coverage|currency|^apps\/|^scripts\/)/i);
process.stdout.write(
	`Package verified: ${files.length} files, public/core exports, standalone Node conversion smoke, no removed implementation.\n`,
);
