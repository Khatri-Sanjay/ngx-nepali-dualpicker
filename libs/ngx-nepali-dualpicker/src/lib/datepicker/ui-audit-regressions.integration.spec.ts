import { Component, ViewChild } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import axe from 'axe-core';
import { NgxNepaliDualpicker } from './ngx-nepali-dualpicker.component';
import type { DatePickerConfig } from '../configuration/datepicker-config.model';
import { PRESET_THEMES } from '../themes/datepicker-theme.presets';
import { FormControl } from '@angular/forms';

@Component({
	standalone: true,
	imports: [NgxNepaliDualpicker],
	template: '<ngx-nepali-dualpicker [config]="config" />',
})
class AuditHost {
	config: DatePickerConfig = { calendar: 'AD', closeOnSelection: false };
	@ViewChild(NgxNepaliDualpicker) picker!: NgxNepaliDualpicker;
}
describe('UI audit regressions', () => {
	it('applies month bounds in the BS calendar too', () => {
		const { fixture, picker } = create({
			calendar: 'BS',
			inline: true,
			minDate: '2080-04-15',
			maxDate: '2080-07-10',
		});
		picker.selectYear(2080);
		picker.selectMonth(3);
		expect(picker.canNavigateMonth(-1)).toBeFalse();
		picker.selectMonth(2);
		expect(picker.currentDisplayDate.month).toBe(3);
		picker.selectMonth(6);
		expect(picker.canNavigateMonth(1)).toBeFalse();
		fixture.destroy();
	});
	it('disables out-of-bounds months and clamps year changes to the nearest allowed month', fakeAsync(() => {
		const { fixture, host, picker } = create({ inline: true, minDate: '2024-06-15', maxDate: '2025-03-10' });
		picker.selectYear(2024);
		picker.selectMonth(5);
		picker.toggleMonthYearPicker();
		fixture.detectChanges();
		tick();
		fixture.detectChanges();
		const months = host.querySelectorAll<HTMLButtonElement>('.month-item');
		expect(months[4].disabled).toBeTrue();
		expect(months[5].disabled).toBeFalse();
		expect(picker.canNavigateMonth(-1)).toBeFalse();
		picker.selectMonth(0);
		expect(picker.currentDisplayDate.month).toBe(5);
		picker.selectYear(2025);
		expect(picker.currentDisplayDate.month).toBe(2);
		expect(picker.canNavigateMonth(1)).toBeFalse();
		fixture.detectChanges();
		tick();
		fixture.destroy();
	}));
	it('synchronizes native popover dismissal and allows reopening', fakeAsync(() => {
		const { fixture, host, picker } = create();
		picker.open();
		fixture.detectChanges();
		tick();
		fixture.detectChanges();
		const panel = host.querySelector<HTMLElement>('.datepicker__container')!;
		expect(panel.matches(':popover-open')).toBeTrue();
		panel.hidePopover();
		// Native toggle delivery is outside fakeAsync's timer queue.
		panel.dispatchEvent(new ToggleEvent('toggle', { oldState: 'open', newState: 'closed' }));
		tick(30);
		fixture.detectChanges();
		expect(picker.isOpen()).toBeFalse();
		expect(host.querySelector('.datepicker__container')).toBeNull();
		picker.open();
		fixture.detectChanges();
		tick();
		fixture.detectChanges();
		expect(host.querySelector('.datepicker__container')!.matches(':popover-open')).toBeTrue();
		fixture.destroy();
	}));
	it('preserves selection, theme and cleanup through the document-level compatibility surface', fakeAsync(() => {
		const { fixture, host, picker } = create({ theme: 'forest' });
		picker.direction.set('rtl');
		fixture.detectChanges();
		host.style.transform = 'translateZ(0)';
		picker.open();
		fixture.detectChanges();
		const original = host.querySelector<HTMLElement>('.datepicker__container')!;
		Object.defineProperty(original, 'showPopover', { value: undefined });
		tick();
		fixture.detectChanges();
		const panel = document.querySelector<HTMLElement>('[data-ndp-overlay] .datepicker__container')!;
		expect(panel).not.toBeNull();
		expect(getComputedStyle(panel).direction).toBe('rtl');
		expect(getComputedStyle(panel).getPropertyValue('--ndp-color-primary').trim()).toBe(
			PRESET_THEMES.forest.colors.primary!,
		);
		panel.querySelector<HTMLButtonElement>('[data-calendar-day="15"]')!.click();
		fixture.detectChanges();
		expect(picker.selectedDate()?.day).toBe(15);
		document.body.click();
		fixture.detectChanges();
		tick();
		expect(picker.isOpen()).toBeFalse();
		expect(document.querySelector('[data-ndp-overlay]')).toBeNull();
		fixture.destroy();
	}));
	it('keeps the compatibility panel usable above a transformed native modal', fakeAsync(() => {
		const { fixture, host, picker } = create();
		const dialog = document.createElement('dialog');
		dialog.setAttribute('aria-label', 'Booking');
		dialog.style.transform = 'translateX(20px)';
		document.body.append(dialog);
		dialog.append(host);
		dialog.showModal();
		picker.open();
		fixture.detectChanges();
		Object.defineProperty(host.querySelector('.datepicker__container')!, 'showPopover', { value: undefined });
		tick();
		fixture.detectChanges();
		const surface = document.querySelector<HTMLDialogElement>('dialog.ndp-fallback-surface')!;
		expect(surface.open).toBeTrue();
		expect(surface.contains(document.activeElement)).toBeTrue();
		surface.dispatchEvent(new Event('cancel', { cancelable: true }));
		fixture.detectChanges();
		tick();
		expect(picker.isOpen()).toBeFalse();
		expect(document.querySelector('dialog.ndp-fallback-surface')).toBeNull();
		fixture.destroy();
		dialog.close();
		dialog.remove();
	}));
	function create(config: DatePickerConfig = {}) {
		const fixture = TestBed.createComponent(AuditHost);
		fixture.componentInstance.config = { calendar: 'AD', closeOnSelection: false, ...config };
		fixture.detectChanges();
		return { fixture, host: fixture.nativeElement as HTMLElement, picker: fixture.componentInstance.picker };
	}
	it('lifts popups out of transformed and clipping containers without losing Angular ownership', fakeAsync(() => {
		const { fixture, host, picker } = create();
		host.style.cssText = 'position:fixed;left:60px;top:60px;width:360px;transform:translateZ(0);overflow:hidden';
		picker.open();
		fixture.detectChanges();
		tick();
		fixture.detectChanges();
		const popup = host.querySelector<HTMLElement>('.datepicker__container')!;
		popup.style.animation = 'none';
		const anchor = host.querySelector('.input-container')!.getBoundingClientRect();
		const box = popup.getBoundingClientRect();
		expect(popup.matches(':popover-open')).toBeTrue();
		expect(box.left).toBeCloseTo(anchor.left, 0);
		expect(box.top).toBeCloseTo(anchor.bottom + 8, 0);
		picker.close();
		fixture.detectChanges();
		expect(document.querySelector('[data-ndp-overlay]')).toBeNull();
		fixture.destroy();
	}));
	it('positions inside an open native dialog with a transformed card', fakeAsync(() => {
		const { fixture, host, picker } = create();
		const dialog = document.createElement('dialog');
		dialog.setAttribute('aria-label', 'Booking');
		document.body.append(dialog);
		dialog.append(host);
		host.style.transform = 'translateZ(0)';
		dialog.showModal();
		picker.open();
		fixture.detectChanges();
		tick();
		fixture.detectChanges();
		const popup = host.querySelector<HTMLElement>('.datepicker__container')!;
		popup.style.animation = 'none';
		const anchor = host.querySelector('.input-container')!.getBoundingClientRect();
		expect(popup.getBoundingClientRect().left).toBeCloseTo(anchor.left, 0);
		expect(popup.matches(':popover-open')).toBeTrue();
		picker.close();
		fixture.destroy();
		dialog.close();
		dialog.remove();
	}));
	it('keeps a rejected range explanation inside the open popup and preserves the start', fakeAsync(() => {
		const { fixture, host, picker } = create({ rangeConstraints: { minDays: 5 }, selectionMode: 'range' });
		picker.setDate('2024-01-12');
		picker.open();
		fixture.detectChanges();
		tick();
		fixture.detectChanges();
		picker.selectDate(13);
		fixture.detectChanges();
		const panel = host.querySelector('.datepicker__container')!;
		expect(panel.querySelector('[role=alert]')?.textContent).toContain('at least 5 days');
		expect(picker.startDate()?.day).toBe(12);
		expect(picker.endDate()).toBeNull();
		expect(host.querySelectorAll('[role=alert]').length).toBe(1);
		fixture.destroy();
	}));
	it('leaves the bounded view and model intact when Today is unavailable', () => {
		const { fixture, host, picker } = create({ inline: true, minDate: '2024-01-01', maxDate: '2024-12-31' });
		picker.writeValue('2024-01-15');
		fixture.detectChanges();
		const before = picker.currentDisplayDate;
		const button = host.querySelector<HTMLButtonElement>('.select-today')!;
		expect(button.disabled).toBeTrue();
		expect(button.title).toContain('unavailable');
		picker.selectToday();
		expect(picker.currentDisplayDate).toEqual(before);
		expect(picker.inputValue()).toBe('2024-01-15');
		fixture.destroy();
	});
	it('explains the multiple limit, preserves the selection and lets users remove dates', () => {
		const { fixture, host, picker } = create({
			inline: true,
			selectionMode: 'multiple',
			multipleSelection: { maxSelections: 2 },
			validation: { enabled: true },
		});
		picker.setDate('2024-01-12');
		picker.selectDate(13);
		picker.selectDate(14);
		fixture.detectChanges();
		expect(picker.selectedDates().map((date) => date.day)).toEqual([12, 13]);
		expect(host.querySelector('.datepicker__notice')?.textContent).toContain('Selection limit reached');
		expect(host.textContent).toContain('2 dates selected');
		expect(picker.validate(new FormControl(['2024-01-12', '2024-01-13']))).toBeNull();
		picker.selectDate(12);
		fixture.detectChanges();
		expect(picker.selectedDates().map((date) => date.day)).toEqual([13]);
		expect(host.querySelector('[role=alert]')).toBeNull();
		expect(host.querySelector('.datepicker__notice')).toBeNull();
		fixture.destroy();
	});
	it('removes the inline popup trigger and explains a fully unavailable month', () => {
		const { fixture, host } = create({ inline: true, disabledDaysOfWeek: [0, 1, 2, 3, 4, 5, 6] });
		expect(host.querySelector('.form-icon')).toBeNull();
		expect(host.textContent).toContain('No dates are available in this month');
		expect(host.querySelector<HTMLButtonElement>('.picker-toggle')?.disabled).toBeFalse();
		fixture.destroy();
	});
	for (const language of ['en', 'ne'] as const)
		it(`includes visible labels in accessible names for ${language}`, async () => {
			const { fixture, host } = create({
				inline: true,
				language,
				convertOnCalendarChange: true,
				showSelectionModeToggle: true,
			});
			fixture.detectChanges();
			const today = host.querySelector<HTMLButtonElement>('.select-today')!;
			expect(today.getAttribute('aria-label')).toContain(language === 'ne' ? 'आज' : 'Today');
			const period = host.querySelector<HTMLButtonElement>('.picker-toggle')!;
			const visible = Array.from(period.querySelectorAll('span'))
				.map((item) => item.textContent?.trim())
				.join(' ');
			expect(period.getAttribute('aria-label')).toContain(visible);
			const result = await axe.run(host, { runOnly: { type: 'rule', values: ['label-content-name-mismatch'] } });
			expect(result.violations).toEqual([]);
			fixture.destroy();
		});
	function luminance(hex: string) {
		const channels = hex
			.slice(1)
			.match(/../g)!
			.map((value) => parseInt(value, 16) / 255)
			.map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
		return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
	}
	for (const [name, theme] of Object.entries(PRESET_THEMES))
		it(`keeps the Today foreground contrast safe in ${name}`, () => {
			const { fixture, host } = create({ inline: true, theme: name as keyof typeof PRESET_THEMES });
			const color = theme.colors.primary!,
				background = theme.colors.background!;
			const first = luminance(color),
				second = luminance(background);
			expect((Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)).toBeGreaterThanOrEqual(4.5);
			expect(getComputedStyle(host.querySelector('.select-today')!).backgroundColor).toBe('rgba(0, 0, 0, 0)');
			fixture.destroy();
		});
});
