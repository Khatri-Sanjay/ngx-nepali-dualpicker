import { Component, computed, signal } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule, FormsModule, NgModel } from '@angular/forms';
import axe from 'axe-core';
import { NgxNepaliDualpicker } from './ngx-nepali-dualpicker.component';
import type { DatePickerConfig } from '../configuration/datepicker-config.model';
import type { DatePickerValue } from './state/datepicker-value.type';

@Component({
	standalone: true,
	imports: [ReactiveFormsModule, NgxNepaliDualpicker],
	template:
		'<label for="appointment">Appointment</label><ngx-nepali-dualpicker [config]="config" [formControl]="date" />',
})
class AppointmentHost {
	config: DatePickerConfig = {
		id: 'appointment',
		calendar: 'AD',
		allowTextInput: true,
		validation: { enabled: true },
		closeOnSelection: false,
	};
	date = new FormControl<DatePickerValue>('2024-01-15');
}

@Component({
	standalone: true,
	imports: [FormsModule, NgxNepaliDualpicker],
	template: '<ngx-nepali-dualpicker [(ngModel)]="model" [config]="config" />',
})
class ModelHost {
	model = '2024-01-15';
	config: DatePickerConfig = { calendar: 'AD', allowTextInput: true, validation: { enabled: true } };
}

describe('Accessible forms and readonly integration', () => {
	it('can validate within a computed without writing into its reactive context', () => {
		const { fixture, picker } = create();
		const value = signal('2024-02-30');
		const result = computed(() => picker.validate(new FormControl(value())));
		expect(result()?.['nepaliDate']).toBeDefined();
		value.set('2024-02-29');
		expect(result()).toBeNull();
		fixture.componentInstance.config = { calendar: 'AD', validation: { enabled: false } };
		fixture.detectChanges();
		value.set('invalid');
		expect(result()).toBeNull();
	});
	it('applies opt-in draft validation to template-driven forms too', async () => {
		const fixture = TestBed.createComponent(ModelHost);
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
		const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
		input.value = 'not-a-date';
		input.dispatchEvent(new Event('input'));
		input.dispatchEvent(new Event('blur'));
		fixture.detectChanges();
		await fixture.whenStable();
		const model = fixture.debugElement.query(By.directive(NgModel)).injector.get(NgModel);
		expect(model.control.hasError('nepaliDateInput')).toBeTrue();
		expect(fixture.componentInstance.model).toBe('2024-01-15');
	});
	function create() {
		const fixture = TestBed.createComponent(AppointmentHost);
		fixture.detectChanges();
		const picker = fixture.debugElement.query(By.directive(NgxNepaliDualpicker))
			.componentInstance as NgxNepaliDualpicker;
		const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
		return { fixture, picker, input, host: fixture.componentInstance };
	}
	it('keeps default validation opt-in while still explaining an invalid draft', () => {
		const { fixture, input, host } = create();
		host.config = { ...host.config, validation: { enabled: false } };
		fixture.detectChanges();
		input.value = 'invalid';
		input.dispatchEvent(new Event('input'));
		input.dispatchEvent(new Event('blur'));
		fixture.detectChanges();
		expect(host.date.valid).toBeTrue();
		expect(host.date.value).toBe('2024-01-15');
		expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
	});
	it('uses week Home/End in readonly mode and closes on focus leaving without stealing it', fakeAsync(() => {
		const { fixture, input, host, picker } = create();
		host.config = { ...host.config, readOnly: true };
		fixture.detectChanges();
		input.focus();
		picker.open();
		fixture.detectChanges();
		tick();
		fixture.detectChanges();
		const key = (value: string) => {
			document.activeElement?.dispatchEvent(
				new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true }),
			);
			fixture.detectChanges();
			tick();
			fixture.detectChanges();
		};
		key('Home');
		expect(document.activeElement?.getAttribute('data-calendar-day')).toBe('14');
		key('End');
		expect(document.activeElement?.getAttribute('data-calendar-day')).toBe('20');
		key('Enter');
		expect(host.date.value).toBe('2024-01-15');
		const outside = document.createElement('button');
		outside.textContent = 'Next field';
		document.body.appendChild(outside);
		try {
			outside.focus();
			fixture.detectChanges();
			expect(picker.isOpen()).toBeFalse();
			expect(document.activeElement).toBe(outside);
		} finally {
			outside.remove();
		}
	}));
	it('associates the label and format hint, opens by keyboard and restores trigger focus', fakeAsync(() => {
		const { fixture, picker, input } = create();
		input.focus();
		expect(picker.isOpen()).toBeFalse();
		expect(input.labels?.[0].textContent).toBe('Appointment');
		expect(input.getAttribute('role')).toBe('combobox');
		expect(fixture.nativeElement.querySelector('#' + input.getAttribute('aria-describedby')).textContent).toContain(
			'yyyy-MM-dd',
		);
		input.dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true, cancelable: true }),
		);
		fixture.detectChanges();
		tick();
		fixture.detectChanges();
		const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
		expect(input.getAttribute('aria-controls')).toBe(dialog.id);
		const day = document.activeElement as HTMLElement;
		expect(day.getAttribute('aria-label')).toContain('Monday');
		expect(day.getAttribute('aria-label')).toContain('January');
		day.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		fixture.detectChanges();
		expect(document.activeElement).toBe(input);
		expect(picker.isOpen()).toBeFalse();
	}));

	it('keeps invalid drafts visible, preserves the model and updates opt-in form errors', () => {
		const { fixture, input, host } = create();
		input.value = '2024-02-30';
		input.dispatchEvent(new Event('input'));
		input.dispatchEvent(new Event('blur'));
		fixture.detectChanges();
		expect(input.value).toBe('2024-02-30');
		expect(host.date.value).toBe('2024-01-15');
		expect(host.date.hasError('nepaliDateInput')).toBeTrue();
		expect(input.getAttribute('aria-invalid')).toBe('true');
		expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
		input.value = '2024-02-29';
		input.dispatchEvent(new Event('input'));
		input.dispatchEvent(new Event('blur'));
		fixture.detectChanges();
		expect(host.date.value).toBe('2024-02-29');
		expect(host.date.valid).toBeTrue();
		expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
		input.value = 'invalid';
		input.dispatchEvent(new Event('input'));
		input.dispatchEvent(new Event('blur'));
		fixture.detectChanges();
		expect(host.date.invalid).toBeTrue();
		input.value = '2024-02-29';
		input.dispatchEvent(new Event('input'));
		input.dispatchEvent(new Event('blur'));
		fixture.detectChanges();
		expect(host.date.valid).toBeTrue();
		expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
	});

	it('validates incomplete range selection immediately and revalidates changed restrictions', () => {
		const { fixture, host, picker } = create();
		host.config = { ...host.config, selectionMode: 'range' };
		fixture.detectChanges();
		picker.currentDisplayDate = { year: 2024, month: 0, day: 1 };
		picker.selectDate(15);
		fixture.detectChanges();
		expect(host.date.hasError('nepaliDateRange')).toBeTrue();
		picker.selectDate(20);
		fixture.detectChanges();
		expect(host.date.valid).toBeTrue();
		host.config = { ...host.config, minDate: '2024-01-18' };
		fixture.detectChanges();
		expect(host.date.value).toEqual({ start: null, end: null });
		expect(host.date.valid).toBeTrue();
	});

	for (const selectionMode of ['single', 'range', 'multiple'] as const) {
		it(`blocks all user mutations in readonly ${selectionMode} mode while allowing browse and form writes`, fakeAsync(() => {
			const { fixture, host, picker, input } = create();
			host.config = {
				...host.config,
				selectionMode,
				readOnly: true,
				inline: true,
				convertOnCalendarChange: true,
			};
			fixture.detectChanges();
			const initial: DatePickerValue =
				selectionMode === 'range'
					? { start: '2024-01-15', end: '2024-01-20' }
					: selectionMode === 'multiple'
						? ['2024-01-15']
						: '2024-01-15';
			host.date.setValue(initial);
			fixture.detectChanges();
			const changed = jasmine.createSpy('dateSelected');
			picker.dateSelected.subscribe(changed);
			expect(input.readOnly).toBeTrue();
			expect(input.disabled).toBeFalse();
			const first = fixture.nativeElement.querySelector('[data-calendar-day="1"]') as HTMLButtonElement;
			first.click();
			picker.selectDate(2);
			picker.selectToday();
			picker.clearSelection();
			picker.switchCalendarType('BS');
			picker.toggleMode('multiple');
			input.value = '2024-02-29';
			input.dispatchEvent(new Event('input'));
			input.dispatchEvent(new Event('blur'));
			fixture.detectChanges();
			expect(host.date.value).toEqual(initial);
			expect(changed).not.toHaveBeenCalled();
			expect(picker.currentCalendarType()).toBe('AD');
			picker.nextMonth();
			fixture.detectChanges();
			expect(picker.currentDisplayDate.month).toBe(1);
			host.date.setValue(null);
			fixture.detectChanges();
			expect(picker.inputValue()).toBe('');
			tick();
		}));
	}

	it('makes named-month display explicitly non-editable even when manual input is requested', () => {
		const { fixture, host, input } = create();
		host.config = { ...host.config, displayFormat: 'MMM dd, yyyy' };
		fixture.detectChanges();
		expect(input.readOnly).toBeTrue();
		expect(input.getAttribute('aria-readonly')).toBe('true');
		expect(input.value).toBe('Jan 15, 2024');
		expect(fixture.nativeElement.textContent).toContain('Display-only format');
	});

	it('creates distinct automatic input, dialog and help IDs for separate pickers', () => {
		const first = TestBed.createComponent(NgxNepaliDualpicker),
			second = TestBed.createComponent(NgxNepaliDualpicker);
		first.detectChanges();
		second.detectChanges();
		const firstId = first.nativeElement.querySelector('input').id as string;
		const secondId = second.nativeElement.querySelector('input').id as string;
		expect(firstId).not.toBe(secondId);
		expect(first.nativeElement.querySelector('#' + firstId + '-help')).not.toBeNull();
	});

	for (const readOnly of [false, true]) {
		it(`passes automated WCAG checks with the popup open (readonly=${readOnly})`, async () => {
			const { fixture, host, picker } = create();
			host.config = { ...host.config, readOnly };
			fixture.detectChanges();
			picker.open();
			fixture.detectChanges();
			await fixture.whenStable();
			fixture.detectChanges();
			const result = await axe.run(fixture.nativeElement as HTMLElement, {
				runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
			});
			expect(
				result.violations.map(
					(item) => `${item.id}: ${item.nodes.map((node) => node.failureSummary).join('; ')}`,
				),
			).toEqual([]);
		});
	}
	for (const theme of ['light', 'dark', 'ocean', 'forest', 'sunset', 'purple', 'rose'] as const) {
		it('passes selected-date and action contrast checks for preset ' + theme, async () => {
			const { fixture, host, picker } = create();
			host.config = { ...host.config, theme, convertOnCalendarChange: true, showSelectionModeToggle: true };
			fixture.detectChanges();
			picker.open();
			fixture.detectChanges();
			await fixture.whenStable();
			fixture.detectChanges();
			const result = await axe.run(fixture.nativeElement as HTMLElement, {
				runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
			});
			expect(
				result.violations.map(
					(item) => item.id + ': ' + item.nodes.map((node) => node.failureSummary).join('; '),
				),
			).toEqual([]);
		});
	}
	it('exposes inline group and range-error semantics without a false modal dialog', async () => {
		const { fixture, host, picker } = create();
		host.config = { ...host.config, inline: true, selectionMode: 'range' };
		fixture.detectChanges();
		picker.currentDisplayDate = { year: 2024, month: 0, day: 1 };
		picker.selectDate(15);
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
		expect(fixture.nativeElement.querySelector('[role="group"]')).not.toBeNull();
		expect(fixture.nativeElement.querySelector('input').getAttribute('aria-invalid')).toBe('true');
		expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('complete date range');
		const result = await axe.run(fixture.nativeElement as HTMLElement, {
			runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
		});
		expect(
			result.violations.map((item) => item.id + ': ' + item.nodes.map((node) => node.failureSummary).join('; ')),
		).toEqual([]);
	});
});
