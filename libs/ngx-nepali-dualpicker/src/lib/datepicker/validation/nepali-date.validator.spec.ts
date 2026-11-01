import { FormControl } from '@angular/forms';
import { nepaliDateValidator } from './nepali-date.validator';
import type { DatePickerConfig } from '../../configuration/datepicker-config.model';

describe('Optional date validators', () => {
	it('rejects invalid formats/calendar dates without mutating form values', () => {
		const date = new FormControl('2024-02-30', nepaliDateValidator({ calendar: 'AD' }));
		expect(date.errors?.['nepaliDate']).toEqual({ reason: 'calendar' });
		expect(date.value).toBe('2024-02-30');
		date.setValue('15/01/2024');
		expect(date.errors?.['nepaliDate']).toEqual({ reason: 'format' });
		date.setValue('2024-02-29');
		expect(date.valid).toBeTrue();
		date.setValue(null);
		expect(date.valid).toBeTrue();
	});
	it('validates complete ranges, ordering and restrictions and can permit partial ranges', () => {
		const config: DatePickerConfig = { calendar: 'AD', selectionMode: 'range', minDate: '2024-01-10' };
		const control = new FormControl<{ start: string | null; end: string | null }>(
			{ start: '2024-01-15', end: null },
			nepaliDateValidator(() => config),
		);
		expect(control.hasError('nepaliDateRange')).toBeTrue();
		config.validation = { requireCompleteRange: false };
		control.updateValueAndValidity();
		expect(control.valid).toBeTrue();
		control.setValue({ start: '2024-01-20', end: '2024-01-15' });
		expect(control.errors?.['nepaliDateRange']).toEqual({ reason: 'order' });
		control.setValue({ start: '2024-01-05', end: '2024-01-20' });
		expect(control.hasError('nepaliDateRestricted')).toBeTrue();
		control.setValue({ start: null, end: null });
		expect(control.valid).toBeTrue();
	});
	it('checks BS dates, numeric output formats, duplicates and multiple-selection limits', () => {
		const control = new FormControl(
			['2080-10-01', '2080-10-01'],
			nepaliDateValidator({ selectionMode: 'multiple', multipleSelection: { maxSelections: 1 } }),
		);
		expect(control.valid).toBeTrue();
		control.setValue(['2080-10-01', '2080-10-02']);
		expect(control.hasError('nepaliDateLimit')).toBeTrue();
		const numeric = new FormControl(
			'15/01/2024',
			nepaliDateValidator({ calendar: 'AD', outputFormat: 'dd/MM/yyyy', disabledDates: ['2024-01-15'] }),
		);
		expect(numeric.hasError('nepaliDateRestricted')).toBeTrue();
	});
});
