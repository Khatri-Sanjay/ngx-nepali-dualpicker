import { parsePlaygroundConfig } from '../../../../../shared/configuration/parse-picker-config';
import type { DatePickerConfig } from 'ngx-nepali-dualpicker';

describe('Playground JSON configuration', () => {
	for (const name of [
		'calendarType',
		'mode',
		'readonly',
		'allowManualInput',
		'dualDateDisplay',
		'autoConvert',
		'monthDisplayType',
		'dayDisplayType',
		'allowModeToggle',
		'closeOnSelect',
		'position',
		'multipleSelectionSettings',
		'mobileMode',
		'yearRange',
	]) {
		it(`rejects the removed configuration key ${name}`, () => {
			expect(() => parsePlaygroundConfig(JSON.stringify({ [name]: true }))).toThrowError(/unknown option/);
		});
	}
	it('rejects removed label and mobile presentation values', () => {
		expect(() => parsePlaygroundConfig('{"mobilePresentation":"compact"}')).toThrow();
		expect(() => parsePlaygroundConfig('{"monthLabelFormat":"default"}')).toThrow();
		expect(() => parsePlaygroundConfig('{"weekdayLabelFormat":"default"}')).toThrow();
	});
	it('rejects unfinished JSON and numeric strings in date objects', () => {
		expect(() => parsePlaygroundConfig('{"selectionMode":')).toThrow();
		expect(() => parsePlaygroundConfig('{"calendar":"AD","minDate":{"year":"2024","month":1,"day":1}}')).toThrow();
	});
	it('accepts range rules, static presets and calendar restrictions', () => {
		const config: DatePickerConfig = {
			calendar: 'AD',
			selectionMode: 'range',
			rangeConstraints: { minDays: 3, maxDays: 10 },
			minDate: '2024-01-01',
			disabledDates: [{ year: 2024, month: 1, day: 2 }],
			presets: [{ label: 'January', value: { start: '2024-01-03', end: '2024-01-05' } }],
		};
		expect(parsePlaygroundConfig(JSON.stringify(config))).toEqual(config);
	});

	for (const config of [
		null,
		[],
		{ inline: 'false' },
		{ selectionMode: 'other' },
		{ disabledDaysOfWeek: [7] },
		{ validation: null },
		{ multipleSelection: { maxSelections: -1 } },
		{ rangeConstraints: { minDays: 10, maxDays: 3 } },
		{ calendar: 'AD', minDate: '2024-02-31' },
		{ calendar: 'AD', minDate: '2024-02-01', maxDate: '2024-01-01' },
		{ typo: true },
		{ dateFilter: '() => true' },
		{ bsYearRange: { start: 2000 } },
	]) {
		it(`rejects invalid input before passing it to the picker: ${JSON.stringify(config)}`, () => {
			expect(() => parsePlaygroundConfig(JSON.stringify(config))).toThrow();
		});
	}

	it('fills nested theme groups so the exported configuration is usable as TypeScript', () => {
		const config = parsePlaygroundConfig('{"theme":"dark","customTheme":{"colors":{"primary":"#ff0000"}}}');
		expect(config.customTheme?.colors?.primary).toBe('#ff0000');
		expect(config.customTheme?.colors?.background).toBeDefined();
		expect(config.customTheme?.colors?.selectedBackground).toBeDefined();
	});
});
