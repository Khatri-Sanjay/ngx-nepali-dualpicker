import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import axe from 'axe-core';
import { NgxNepaliDualpicker } from './ngx-nepali-dualpicker.component';
import { DateCellTemplateDirective } from './components/calendar-grid/date-cell-template.directive';
import type { DatePickerConfig } from '../configuration/datepicker-config.model';
import type { DatePickerValue } from './state/datepicker-value.type';
import type { DatePresetContext } from './state/datepicker-options.model';
import { nepaliDateValidator } from './validation/nepali-date.validator';
import { convertAdToBs } from '../core/calendar/date-conversion';
import type { DateObj } from '../core/models/calendar-date.model';
import { formatPickerDate } from '../core/formatting/format-picker-date';

@Component({
	standalone: true,
	imports: [ReactiveFormsModule, NgxNepaliDualpicker, DateCellTemplateDirective],
	template: `
		<label for="booking">Booking</label>
		<ngx-nepali-dualpicker [config]="config" [formControl]="date">
			@if (customCell) {
				<ng-template ndpDateCell let-date let-secondary="secondaryDate" let-disabled="disabled">
					<span class="custom-day">{{ date.day }}</span>
					<small class="availability">{{ disabled ? 'Unavailable' : 'Rs 500' }}</small>
					@if (secondary) {
						<span class="secondary-year">{{ secondary.year }}</span>
					}
				</ng-template>
			}
		</ngx-nepali-dualpicker>
	`,
})
class BookingHost {
	config: DatePickerConfig = {
		id: 'booking',
		calendar: 'AD',
		inline: true,
		closeOnSelection: false,
		allowTextInput: true,
		validation: { enabled: true },
	};
	date = new FormControl<DatePickerValue>('2024-01-15');
	customCell = false;
}

describe('Dual dates and booking features', () => {
	function create(config: DatePickerConfig = {}) {
		const fixture = TestBed.createComponent(BookingHost);
		const host = fixture.componentInstance;
		host.config = { ...host.config, ...config };
		fixture.detectChanges();
		const picker = fixture.debugElement.query(By.directive(NgxNepaliDualpicker))
			.componentInstance as NgxNepaliDualpicker;
		return { fixture, host, picker };
	}

	it('resolves today at activation rather than retaining the initialization date', () => {
		const { picker, host } = create();
		jasmine.clock().install();
		try {
			jasmine.clock().mockDate(new Date(2024, 1, 29, 12));
			picker.selectPreset({
				label: 'Today',
				value: ({ today, outputFormat }) => formatPickerDate(today, outputFormat),
			});
			expect(host.date.value).toBe('2024-02-29');
		} finally {
			jasmine.clock().uninstall();
		}
	});

	it('commits complete BS range and multiple presets with normal form events', () => {
		const { fixture, host, picker } = create({ calendar: 'BS', selectionMode: 'range' });
		picker.selectPreset({ label: 'BS period', value: { start: '2080-10-01', end: '2080-10-03' } });
		fixture.detectChanges();
		expect(host.date.value).toEqual({ start: '2080-10-01', end: '2080-10-03' });
		expect(host.date.touched).toBeTrue();
		expect(host.date.valid).toBeTrue();
		host.config = { ...host.config, selectionMode: 'multiple', multipleSelection: { maxSelections: 2 } };
		fixture.detectChanges();
		picker.selectPreset({ label: 'Two days', value: ['2080-10-01', '2080-10-02'] });
		expect(host.date.value).toEqual(['2080-10-01', '2080-10-02']);
		picker.selectPreset({ label: 'Too many', value: ['2080-10-01', '2080-10-02', '2080-10-03'] });
		expect(host.date.value).toEqual(['2080-10-01', '2080-10-02']);
	});

	it('localizes both date labels to Nepali digits', () => {
		const { fixture } = create({ language: 'ne', showSecondaryDate: true });
		const cell = fixture.nativeElement.querySelector('[data-calendar-day="15"]') as HTMLButtonElement;
		expect(cell.querySelector('.secondary-date')?.textContent).toContain('१');
		expect(cell.getAttribute('aria-label')).toContain('२०८०');
	});

	it('keeps dual-date display opt-in', () => {
		const { fixture } = create();
		expect(fixture.nativeElement.querySelector('.secondary-date')).toBeNull();
	});

	it('shows the exact corresponding BS date and full announcement without changing AD values', () => {
		const { fixture, host } = create({ showSecondaryDate: true });
		const cell = fixture.nativeElement.querySelector('[data-calendar-day="15"]') as HTMLButtonElement;
		const bs = convertAdToBs('2024-01-15') as DateObj;
		expect(cell.querySelector('.secondary-date')?.textContent).toContain(String(bs.day));
		expect(cell.getAttribute('aria-label')).toContain('BS');
		expect(cell.getAttribute('aria-label')).toContain(String(bs.year));
		cell.click();
		expect(host.date.value).toBe('2024-01-15');
	});

	it('shows AD dates in BS cells and leaves unsupported conversion boundaries empty', () => {
		const { fixture, host } = create({ calendar: 'BS', showSecondaryDate: true });
		host.date.setValue('2080-10-01');
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('[data-calendar-day="1"]').getAttribute('aria-label')).toContain(
			'2024 AD',
		);
		host.config = { ...host.config, calendar: 'AD' };
		fixture.detectChanges();
		host.date.setValue('1943-01-01');
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('[data-calendar-day="1"] .secondary-date')).toBeNull();
	});

	it('combines filters with existing restrictions and passes immutable one-based dates', () => {
		const filter = jasmine.createSpy('filter').and.callFake((date: Readonly<DateObj>, calendar: string) => {
			expect(Object.isFrozen(date)).toBeTrue();
			expect(date.month).toBeGreaterThanOrEqual(1);
			expect(date.month).toBeLessThanOrEqual(12);
			expect(calendar).toBe('AD');
			return date.day !== 16;
		});
		const { fixture, host, picker } = create({ dateFilter: filter, disabledDates: ['2024-01-17'] });
		picker.selectDate(16);
		picker.selectDate(17);
		expect(host.date.value).toBe('2024-01-15');
		expect(fixture.nativeElement.querySelector('[data-calendar-day="16"]').getAttribute('aria-disabled')).toBe(
			'true',
		);
	});

	it('fails closed for thrown filters and revalidates changed filters', () => {
		const { fixture, host } = create();
		host.config = {
			...host.config,
			dateFilter: () => {
				throw new Error('offline');
			},
		};
		fixture.detectChanges();
		expect(host.date.value).toBeNull();
		expect(fixture.nativeElement.querySelector('[data-calendar-day="16"]').getAttribute('aria-disabled')).toBe(
			'true',
		);
		const standalone = new FormControl(
			'2024-01-15',
			nepaliDateValidator(() => host.config),
		);
		expect(standalone.hasError('nepaliDateRestricted')).toBeTrue();
		host.config = { ...host.config, dateFilter: () => true };
		fixture.detectChanges();
		standalone.updateValueAndValidity();
		expect(standalone.valid).toBeTrue();
		expect(host.date.valid).toBeTrue();
	});

	it('rejects invalid typed ranges transactionally and accepts inclusive minimum duration', () => {
		const { fixture, host } = create({ selectionMode: 'range', rangeConstraints: { minDays: 3, maxDays: 5 } });
		host.date.setValue({ start: '2024-01-15', end: '2024-01-17' });
		fixture.detectChanges();
		const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
		input.value = '2024-01-15 - 2024-01-16';
		input.dispatchEvent(new Event('input'));
		input.dispatchEvent(new Event('blur'));
		fixture.detectChanges();
		expect(host.date.hasError('nepaliDateInput')).toBeTrue();
		expect(host.date.value).toEqual({ start: '2024-01-15', end: '2024-01-17' });
		input.value = '2024-01-15 - 2024-01-19';
		input.dispatchEvent(new Event('input'));
		input.dispatchEvent(new Event('blur'));
		fixture.detectChanges();
		expect(host.date.valid).toBeTrue();
		expect(host.date.value).toEqual({ start: '2024-01-15', end: '2024-01-19' });
	});

	it('keeps the selected start after a rejected click and allows recovery', () => {
		const { fixture, host, picker } = create({
			selectionMode: 'range',
			rangeConstraints: { minDays: 3, preventCrossingUnavailableDates: true },
			disabledDates: ['2024-01-18'],
		});
		host.date.setValue(null);
		picker.currentDisplayDate = { year: 2024, month: 0, day: 1 };
		picker.selectDate(15);
		picker.selectDate(16);
		expect(host.date.value).toEqual({ start: '2024-01-15', end: null });
		picker.selectDate(19);
		expect(host.date.value).toEqual({ start: '2024-01-15', end: null });
		picker.selectDate(17);
		fixture.detectChanges();
		expect(host.date.value).toEqual({ start: '2024-01-15', end: '2024-01-17' });
		expect(host.date.valid).toBeTrue();
	});

	it('projects typed cell context while retaining library buttons, names and restrictions', () => {
		const { fixture, host } = create({ disabledDates: ['2024-01-16'] });
		host.customCell = true;
		fixture.detectChanges();
		const cell = fixture.nativeElement.querySelector('[data-calendar-day="16"]') as HTMLButtonElement;
		expect(cell.querySelector('.custom-day')?.textContent).toBe('16');
		expect(cell.querySelector('.availability')?.textContent).toBe('Unavailable');
		expect(cell.querySelector('.secondary-year')?.textContent).toBe('2080');
		expect(cell.getAttribute('aria-label')).toContain('January');
		cell.click();
		expect(host.date.value).toBe('2024-01-15');
	});

	it('resolves presets on activation, emits once, and uses the output format', () => {
		const { host, picker } = create({ outputFormat: 'dd/MM/yyyy' });
		let emissions = 0;
		host.date.valueChanges.subscribe(() => emissions++);
		const resolve = jasmine.createSpy('resolve').and.callFake((context: DatePresetContext) => {
			expect(context.calendar).toBe('AD');
			expect(context.selectionMode).toBe('single');
			expect(Object.isFrozen(context.today)).toBeTrue();
			return formatPickerDate({ year: 2024, month: 1, day: 20 }, context.outputFormat);
		});
		expect(resolve).not.toHaveBeenCalled();
		picker.selectPreset({ label: 'Custom date', value: resolve });
		expect(resolve).toHaveBeenCalledTimes(1);
		expect(host.date.value).toBe('20/01/2024');
		expect(emissions).toBe(1);
	});

	it('rejects invalid preset values, range crossings, and resolver failures without replacing the model', () => {
		const { host, picker } = create({
			selectionMode: 'range',
			rangeConstraints: { preventCrossingUnavailableDates: true },
			disabledDates: ['2024-01-18'],
		});
		host.date.setValue({ start: '2024-01-15', end: '2024-01-17' });
		const before = host.date.value;
		picker.selectPreset({ label: 'Unavailable', value: { start: '2024-01-15', end: '2024-01-19' } });
		expect(host.date.value).toEqual(before);
		picker.selectPreset({ label: 'Wrong mode', value: '2024-01-20' });
		expect(host.date.value).toEqual(before);
		picker.selectPreset({
			label: 'Broken',
			value: () => {
				throw new Error('failed');
			},
		});
		expect(host.date.value).toEqual(before);
	});

	it('renders preset buttons and prevents their activation in readonly/disabled states', () => {
		const { fixture, host, picker } = create({ presets: [{ label: 'Fiscal date', value: '2024-01-20' }] });
		const button = fixture.nativeElement.querySelector('.datepicker__presets button') as HTMLButtonElement;
		button.click();
		expect(host.date.value).toBe('2024-01-20');
		host.config = { ...host.config, readOnly: true };
		fixture.detectChanges();
		expect(button.disabled).toBeTrue();
		picker.selectPreset({ label: 'Another', value: '2024-01-21' });
		expect(host.date.value).toBe('2024-01-20');
		host.config = { ...host.config, readOnly: false };
		host.date.disable();
		fixture.detectChanges();
		picker.selectPreset({ label: 'Another', value: '2024-01-22' });
		expect(host.date.value).toBe('2024-01-20');
	});

	it('passes automated accessibility checks with dual labels, custom cells and preset buttons', async () => {
		const { fixture, host } = create({
			showSecondaryDate: true,
			presets: [{ label: 'Choose January 20', value: '2024-01-20' }],
		});
		host.customCell = true;
		fixture.detectChanges();
		expect(
			(
				await axe.run(fixture.nativeElement, {
					runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
				})
			).violations,
		).toEqual([]);
	});
});

describe('Range constraint validators', () => {
	const range = { start: '2024-02-28', end: '2024-03-01' };
	for (const [constraints, reason] of [
		[{ minDays: 4 }, 'minDays'],
		[{ maxDays: 2 }, 'maxDays'],
		[{ minDays: 0 }, 'configuration'],
		[{ minDays: 5, maxDays: 2 }, 'configuration'],
	] as const) {
		it(`reports ${JSON.stringify(constraints)} without rewriting the value`, () => {
			const control = new FormControl(
				range,
				nepaliDateValidator({ calendar: 'AD', selectionMode: 'range', rangeConstraints: constraints }),
			);
			expect(control.getError('nepaliDateRange')?.reason).toBe(reason);
			expect(control.value).toEqual(range);
		});
	}
	it('counts leap days inclusively and optionally checks interior availability', () => {
		const config: DatePickerConfig = {
			calendar: 'AD',
			selectionMode: 'range',
			rangeConstraints: { minDays: 3, maxDays: 3 },
			dateFilter: (date) => date.day !== 29,
		};
		const control = new FormControl(
			range,
			nepaliDateValidator(() => config),
		);
		expect(control.valid).toBeTrue();
		config.rangeConstraints = { ...config.rangeConstraints, preventCrossingUnavailableDates: true };
		control.updateValueAndValidity();
		expect(control.getError('nepaliDateRange')?.reason).toBe('unavailable');
	});
	it('applies inclusive constraints to BS month transitions', () => {
		const start = convertAdToBs('2024-04-12') as DateObj,
			end = convertAdToBs('2024-04-14') as DateObj;
		const control = new FormControl(
			{ start: formatPickerDate(start, 'yyyy-MM-dd'), end: formatPickerDate(end, 'yyyy-MM-dd') },
			nepaliDateValidator({
				calendar: 'BS',
				selectionMode: 'range',
				rangeConstraints: { minDays: 3, maxDays: 3 },
			}),
		);
		expect(control.valid).toBeTrue();
	});
});
