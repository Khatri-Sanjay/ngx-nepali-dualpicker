import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import axe from 'axe-core';
import { NgxNepaliDualpicker } from './ngx-nepali-dualpicker.component';
import { DateCellTemplateDirective } from './components/calendar-grid/date-cell-template.directive';
import type { DatePickerConfig } from '../configuration/datepicker-config.model';
import type { DatePickerValue } from './state/datepicker-value.type';

@Component({
	standalone: true,
	imports: [ReactiveFormsModule, NgxNepaliDualpicker, DateCellTemplateDirective],
	template: `
		<label for="state-review">Date</label>
		<ngx-nepali-dualpicker [config]="config" [formControl]="value">
			@if (custom) {
				<ng-template ndpDateCell let-date
					><span class="badge">{{ date.day }} · Event</span></ng-template
				>
			}
		</ngx-nepali-dualpicker>
	`,
})
class StateHost {
	custom = false;
	config: DatePickerConfig = {
		id: 'state-review',
		calendar: 'AD',
		inline: true,
		showSecondaryDate: true,
		closeOnSelection: false,
		disabledDates: ['2024-01-16'],
		showSelectionModeToggle: true,
	};
	value = new FormControl<DatePickerValue>('2024-01-15');
}

describe('Datepicker interaction styles in the browser', () => {
	const face = (button: HTMLButtonElement) => button.querySelector<HTMLElement>('.datepicker__date-face')!;
	function create(patch: DatePickerConfig = {}) {
		const fixture = TestBed.createComponent(StateHost);
		const host = fixture.componentInstance;
		host.config = { ...host.config, ...patch };
		fixture.detectChanges();
		const picker = fixture.debugElement.query(By.directive(NgxNepaliDualpicker))
			.componentInstance as NgxNepaliDualpicker;
		const day = (value: number) =>
			fixture.nativeElement.querySelector(`[data-calendar-day="${value}"]`) as HTMLButtonElement;
		return { fixture, host, picker, day };
	}
	for (const theme of ['light', 'dark'] as const) {
		for (const showSecondaryDate of [false, true]) {
			it(`connects range cells and keeps endpoints rounded in ${theme}, dual dates: ${showSecondaryDate}`, () => {
				const { fixture, host, day } = create({
					theme,
					showSecondaryDate,
					selectionMode: 'range',
					disabledDates: [],
				});
				host.value.setValue({ start: '2024-01-15', end: '2024-01-18' });
				fixture.detectChanges();
				const middle = day(16).parentElement!;
				const band = getComputedStyle(middle, '::before');
				expect(band.left).toBe('0px');
				expect(band.right).toBe('0px');
				expect(parseFloat(band.width)).toBeCloseTo(middle.getBoundingClientRect().width, 0);
				expect(getComputedStyle(face(day(15))).borderTopRightRadius).toBe(
					getComputedStyle(face(day(15))).borderTopLeftRadius,
				);
				expect(getComputedStyle(face(day(18))).backgroundColor).toBe(
					getComputedStyle(face(day(15))).backgroundColor,
				);
				expect(day(15).getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
				expect(face(day(15)).getBoundingClientRect().height).toBe(showSecondaryDate ? 40 : 36);
				expect(parseFloat(band.height)).toBe(face(day(15)).getBoundingClientRect().height);
				expect(day(18).parentElement!.classList.contains('datepicker__date-container--after')).toBeFalse();
				expect(getComputedStyle(face(day(18))).boxShadow).toBe('none');
				expect(!!day(15).querySelector('.secondary-date')).toBe(showSecondaryDate);
			});

			it(`keeps today's marker below the labels when selected in ${theme}, dual dates: ${showSecondaryDate}`, () => {
				const { fixture, host, day } = create({ theme, showSecondaryDate });
				const today = new Date();
				const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
				host.value.setValue(date);
				fixture.detectChanges();
				const button = day(today.getDate());
				expect(button.getAttribute('aria-current')).toBe('date');
				expect(button.classList.contains('datepicker__date--active')).toBeTrue();
				const marker = getComputedStyle(face(button), '::after');
				expect(marker.content).not.toBe('none');
				expect(marker.width).toBe('3px');
				const label = button.querySelector('.secondary-date') ?? button.querySelector('.primary-date')!;
				expect(label.getBoundingClientRect().bottom).toBeLessThanOrEqual(
					button.getBoundingClientRect().bottom - 7,
				);
			});
		}
		it(`keeps unavailable day numbers, dual dates and template text visible in ${theme}`, () => {
			const { fixture, host, day } = create({ theme });
			const unavailable = day(16);
			expect(getComputedStyle(unavailable.querySelector('span')!).visibility).toBe('visible');
			expect(getComputedStyle(unavailable.querySelector('small')!).visibility).toBe('visible');
			expect(getComputedStyle(unavailable).color).not.toBe(getComputedStyle(unavailable).backgroundColor);
			expect(unavailable.getAttribute('aria-disabled')).toBe('true');
			host.custom = true;
			fixture.detectChanges();
			expect(getComputedStyle(day(16).querySelector('.badge')!).visibility).toBe('visible');
			expect(day(16).textContent).toContain('Event');
		});

		it(`keeps selected values recognizable while the control is disabled in ${theme}`, () => {
			const { fixture, host, day } = create({ theme });
			const selectedBackground = getComputedStyle(face(day(15))).backgroundColor;
			host.value.disable();
			fixture.detectChanges();
			expect(day(15).disabled).toBeTrue();
			expect(day(15).getAttribute('aria-disabled')).toBe('true');
			expect(getComputedStyle(face(day(15))).backgroundColor).toBe(selectedBackground);
			expect(getComputedStyle(day(15).querySelector('span')!).visibility).toBe('visible');
			expect(getComputedStyle(day(15)).cursor).toBe('not-allowed');
			const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
			expect(input.value).toBe('2024-01-15');
			expect(getComputedStyle(input).cursor).toBe('not-allowed');
			day(17).click();
			expect(host.value.value).toBe('2024-01-15');
			host.value.enable();
			fixture.detectChanges();
			day(17).click();
			expect(host.value.value).toBe('2024-01-17');
		});
	}

	it('does not preview unavailable endpoints or ranges crossing unavailable days', () => {
		const { fixture, picker, host } = create({
			selectionMode: 'range',
			rangeConstraints: { preventCrossingUnavailableDates: true },
		});
		host.value.setValue({ start: '2024-01-15', end: null });
		fixture.detectChanges();
		picker.onDateHover(16);
		expect(picker.hoverDate()).toBeNull();
		picker.onDateHover(17);
		expect(picker.hoverDate()).toBeNull();
		picker.onDateHover(14);
		expect(picker.hoverDate()?.day).toBe(14);
		host.config = { ...host.config, readOnly: true };
		fixture.detectChanges();
		expect(picker.hoverDate()).toBeNull();
	});

	it('connects a reverse range preview and removes its band when hovering the start', () => {
		const { fixture, host, picker, day } = create({ selectionMode: 'range', disabledDates: [] });
		host.value.setValue({ start: '2024-01-18', end: null });
		fixture.detectChanges();
		expect(day(18).parentElement!.classList.contains('datepicker__date-container--before')).toBeFalse();
		expect(day(18).parentElement!.classList.contains('datepicker__date-container--after')).toBeFalse();
		picker.onDateHover(15);
		fixture.detectChanges();
		expect(day(15).classList.contains('datepicker__date--preview-end')).toBeTrue();
		expect(day(15).parentElement!.classList.contains('datepicker__date-container--after')).toBeTrue();
		expect(day(18).parentElement!.classList.contains('datepicker__date-container--before')).toBeTrue();
		expect(day(18).parentElement!.classList.contains('datepicker__date-container--after')).toBeFalse();
		picker.onDateHover(18);
		fixture.detectChanges();
		expect(day(18).parentElement!.classList.contains('datepicker__date-container--before')).toBeFalse();
		expect(day(18).parentElement!.classList.contains('datepicker__date-container--after')).toBeFalse();
	});

	it('keeps a one-day range compact without connector tails or a synthetic focus border', () => {
		const { fixture, host, day } = create({ selectionMode: 'range', disabledDates: [] });
		host.value.setValue({ start: '2024-01-15', end: '2024-01-15' });
		fixture.detectChanges();
		const endpoint = day(15);
		endpoint.classList.add('datepicker__date--focused');
		expect(endpoint.parentElement!.classList.contains('datepicker__date-container--before')).toBeFalse();
		expect(endpoint.parentElement!.classList.contains('datepicker__date-container--after')).toBeFalse();
		expect(getComputedStyle(endpoint).outlineStyle).toBe('none');
		expect(getComputedStyle(face(endpoint)).outlineStyle).toBe('none');
		expect(getComputedStyle(face(endpoint)).boxShadow).toBe('none');
	});

	it('gives unavailable dates precedence over range fill and keeps readonly selection intact', () => {
		const { fixture, host, day } = create({ selectionMode: 'range' });
		host.value.setValue({ start: '2024-01-15', end: '2024-01-17' });
		fixture.detectChanges();
		expect(getComputedStyle(face(day(16))).backgroundColor).not.toBe(
			getComputedStyle(face(day(15))).backgroundColor,
		);
		expect(getComputedStyle(face(day(16)), '::after').display).toBe('none');
		host.config = { ...host.config, readOnly: true };
		fixture.detectChanges();
		expect(getComputedStyle(day(15)).cursor).toBe('default');
		expect(day(15).classList.contains('datepicker__date--active')).toBeTrue();
		expect(host.value.enabled).toBeTrue();
	});

	it('retains a visible keyboard focus outline on unavailable dates', () => {
		const { fixture, day } = create();
		day(16).focus();
		fixture.detectChanges();
		expect(getComputedStyle(face(day(16))).outlineStyle).not.toBe('none');
		expect(parseFloat(getComputedStyle(day(16)).outlineWidth)).toBeGreaterThanOrEqual(2);
	});

	it('passes accessibility checks with a preview containing an unavailable day', async () => {
		const { fixture, host, picker } = create({ selectionMode: 'range' });
		host.value.setValue({ start: '2024-01-15', end: null });
		fixture.detectChanges();
		picker.onDateHover(18);
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
