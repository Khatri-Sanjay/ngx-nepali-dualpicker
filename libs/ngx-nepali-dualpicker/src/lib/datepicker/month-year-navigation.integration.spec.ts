import { TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { NgxNepaliDualpicker } from './ngx-nepali-dualpicker.component';
import type { DatePickerConfig } from '../configuration/datepicker-config.model';

@Component({
	standalone: true,
	imports: [NgxNepaliDualpicker],
	template: '<ngx-nepali-dualpicker [config]="config" />',
})
class NavigationHost {
	config: DatePickerConfig = {
		calendar: 'AD',
		inline: true,
		closeOnSelection: false,
		minDate: '2020-01-01',
		maxDate: '2030-12-31',
	};
	@ViewChild(NgxNepaliDualpicker) picker!: NgxNepaliDualpicker;
}

describe('Month/year navigation and Today action', () => {
	async function create(patch: DatePickerConfig = {}) {
		const fixture = TestBed.createComponent(NavigationHost);
		fixture.componentInstance.config = { ...fixture.componentInstance.config, ...patch };
		fixture.detectChanges();
		fixture.componentInstance.picker.writeValue('2024-01-15');
		fixture.detectChanges();
		await fixture.whenStable();
		return fixture;
	}
	for (const [theme, language] of [
		['light', 'en'],
		['dark', 'ne'],
	] as const) {
		it(`keeps the header and period grids within a narrow calendar in ${theme}/${language}`, async () => {
			const fixture = await create({ theme, language });
			const root = fixture.nativeElement as HTMLElement;
			root.style.width = '280px';
			fixture.detectChanges();
			const header = root.querySelector<HTMLElement>('.datepicker__options-container')!;
			expect(header.scrollWidth).toBeLessThanOrEqual(header.clientWidth + 1);
			expect(root.querySelector('.select-today')!.textContent).toContain(language === 'ne' ? 'आज' : 'Today');
			root.querySelector<HTMLButtonElement>('.picker-toggle')!.click();
			fixture.detectChanges();
			await fixture.whenStable();
			const months = root.querySelector<HTMLElement>('.month-picker-column')!;
			expect(months.scrollWidth).toBeLessThanOrEqual(months.clientWidth + 1);
			root.querySelectorAll<HTMLButtonElement>('.period-switch button')[1].click();
			fixture.detectChanges();
			await fixture.whenStable();
			const years = root.querySelector<HTMLElement>('.year-picker-column')!;
			expect(years.scrollWidth).toBeLessThanOrEqual(years.clientWidth + 1);
		});
	}
	it('chooses a year and then a month without reopening the panel or changing the selected date', async () => {
		const fixture = await create();
		const root = fixture.nativeElement as HTMLElement;
		const toggle = root.querySelector<HTMLButtonElement>('.picker-toggle')!;
		toggle.click();
		fixture.detectChanges();
		await fixture.whenStable();
		expect(toggle.getAttribute('aria-expanded')).toBe('true');
		expect(root.querySelectorAll('.month-item').length).toBe(12);
		root.querySelectorAll<HTMLButtonElement>('.period-switch button')[1].click();
		fixture.detectChanges();
		await fixture.whenStable();
		expect(root.querySelectorAll('.year-item').length).toBe(11);
		root.querySelector<HTMLButtonElement>('[data-year="2025"]')!.click();
		fixture.detectChanges();
		await fixture.whenStable();
		expect(fixture.componentInstance.picker.currentDisplayDate.year).toBe(2025);
		expect(root.querySelector('.month-picker-column')).not.toBeNull();
		root.querySelector<HTMLButtonElement>('[data-month-index="5"]')!.click();
		fixture.detectChanges();
		await fixture.whenStable();
		expect(fixture.componentInstance.picker.currentDisplayDate.month).toBe(5);
		expect(toggle.getAttribute('aria-expanded')).toBe('false');
		expect(fixture.componentInstance.picker.inputValue()).toBe('2024-01-15');
		expect(document.activeElement).toBe(toggle);
	});

	it('scrolls a long BS year grid to the displayed year', async () => {
		const fixture = await create({ calendar: 'BS', minDate: null, maxDate: null });
		const root = fixture.nativeElement as HTMLElement;
		fixture.componentInstance.picker.currentDisplayDate = { year: 2083, month: 6, day: 1 };
		fixture.detectChanges();
		root.querySelector<HTMLButtonElement>('.picker-toggle')!.click();
		fixture.detectChanges();
		await fixture.whenStable();
		root.querySelectorAll<HTMLButtonElement>('.period-switch button')[1].click();
		fixture.detectChanges();
		await fixture.whenStable();
		const years = root.querySelector<HTMLElement>('.year-picker-column')!;
		const selected = years.querySelector<HTMLElement>('.selected')!;
		expect(years.scrollTop).toBeGreaterThan(0);
		expect(selected.getBoundingClientRect().top).toBeGreaterThanOrEqual(years.getBoundingClientRect().top);
		expect(selected.getBoundingClientRect().bottom).toBeLessThanOrEqual(years.getBoundingClientRect().bottom);
	});

	it('supports arrow keys with one grid tab stop, and Escape returns to the month/year button', async () => {
		const fixture = await create();
		const root = fixture.nativeElement as HTMLElement;
		const toggle = root.querySelector<HTMLButtonElement>('.picker-toggle')!;
		toggle.click();
		fixture.detectChanges();
		await fixture.whenStable();
		const january = root.querySelector<HTMLButtonElement>('[data-month-index="0"]')!;
		january.focus();
		january.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
		fixture.detectChanges();
		expect((document.activeElement as HTMLElement).dataset['monthIndex']).toBe('1');
		expect(root.querySelectorAll('.month-item[tabindex="0"]').length).toBe(1);
		document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		fixture.detectChanges();
		expect(root.querySelector('ndp-month-year-panel')).toBeNull();
		expect(document.activeElement).toBe(toggle);
	});

	it('labels Today visibly and returns from the period picker to today', async () => {
		const fixture = await create();
		const root = fixture.nativeElement as HTMLElement;
		const todayButton = root.querySelector<HTMLButtonElement>('.select-today')!;
		expect(todayButton.textContent).toContain('Today');
		expect(getComputedStyle(todayButton).backgroundColor).toBe('rgba(0, 0, 0, 0)');
		root.querySelector<HTMLButtonElement>('.picker-toggle')!.click();
		fixture.detectChanges();
		todayButton.click();
		fixture.detectChanges();
		expect(root.querySelector('ndp-month-year-panel')).toBeNull();
		const today = new Date();
		expect(fixture.componentInstance.picker.currentDisplayDate.year).toBe(today.getFullYear());
		expect(fixture.componentInstance.picker.currentDisplayDate.month).toBe(today.getMonth());
		expect(root.querySelector('[aria-current="date"]')).not.toBeNull();
	});
});
