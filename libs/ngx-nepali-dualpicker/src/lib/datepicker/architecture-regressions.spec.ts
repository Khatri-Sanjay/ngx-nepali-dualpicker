import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { NgxNepaliDualpicker } from './ngx-nepali-dualpicker.component';
import { DatePickerConfigService } from '../configuration/datepicker-config.service';

describe('Picker architecture regressions', () => {
	it('stops measuring a closed popup and clears its public coordinate signals', fakeAsync(() => {
		const fixture = TestBed.createComponent(NgxNepaliDualpicker);
		fixture.componentRef.setInput('config', { calendar: 'AD', inline: false });
		fixture.detectChanges();
		const picker = fixture.componentInstance;
		const anchor = fixture.nativeElement.querySelector('.input-container') as HTMLElement;
		const measure = spyOn(anchor, 'getBoundingClientRect').and.callThrough();
		picker.open();
		fixture.detectChanges();
		tick();
		expect(picker.dropdownTop()).not.toBeNull();
		picker.close();
		fixture.detectChanges();
		const previousCalls = measure.calls.count();
		document.dispatchEvent(new Event('scroll'));
		expect(measure.calls.count()).toBe(previousCalls);
		expect(picker.dropdownTop()).toBeNull();
		expect(picker.dropdownLeft()).toBeNull();
		expect(picker.dropdownWidth()).toBeNull();
	}));
	function create() {
		const fixture = TestBed.createComponent(NgxNepaliDualpicker);
		fixture.componentRef.setInput('config', { calendar: 'AD', inline: true, closeOnSelection: false });
		fixture.detectChanges();
		return fixture;
	}
	it('derives grids after replacing display dates without refresh calls', () => {
		const fixture = create(),
			picker = fixture.componentInstance;
		picker.currentDisplayDate = { year: 2024, month: 1, day: 1 };
		fixture.detectChanges();
		expect(Object.values(picker.currentMonthData).flat().filter(Boolean).length).toBe(29);
	});
	it('preserves the browsed month during display edits and moves only when new bounds exclude it', () => {
		const fixture = create();
		const picker = fixture.componentInstance;
		picker.writeValue('2024-01-15');
		picker.nextMonth();
		fixture.detectChanges();
		const browsed = { ...picker.currentDisplayDate };
		fixture.componentRef.setInput('config', { calendar: 'AD', inline: true, showSecondaryDate: true });
		fixture.detectChanges();
		expect(picker.currentDisplayDate).toEqual(browsed);
		expect(picker.inputValue()).toBe('2024-01-15');
		fixture.componentRef.setInput('config', {
			calendar: 'AD',
			inline: true,
			minDate: '2024-03-01',
			maxDate: '2024-03-31',
		});
		fixture.detectChanges();
		expect(picker.currentDisplayDate).toEqual({ year: 2024, month: 2, day: 1 });
	});
	it('reconciles runtime mode and restrictions without duplicate form emissions', () => {
		const fixture = create(),
			picker = fixture.componentInstance,
			change = jasmine.createSpy('change');
		picker.registerOnChange(change);
		picker.writeValue('2024-01-15');
		fixture.componentRef.setInput('config', {
			calendar: 'AD',
			selectionMode: 'multiple',
			inline: true,
			multipleSelection: { maxSelections: 1 },
		});
		fixture.detectChanges();
		expect(picker.multipleMode()).toBeTrue();
		expect(change).toHaveBeenCalledOnceWith([]);
		picker.writeValue(['2024-01-15']);
		change.calls.reset();
		fixture.componentRef.setInput('config', {
			calendar: 'AD',
			selectionMode: 'multiple',
			inline: true,
			disabledDates: ['2024-01-15'],
		});
		fixture.detectChanges();
		expect(picker.selectedDates()).toEqual([]);
		expect(change).toHaveBeenCalledOnceWith([]);
	});
	it('reacts to application defaults while preserving instance overrides', () => {
		const fixture = create(),
			picker = fixture.componentInstance;
		const config = TestBed.inject(DatePickerConfigService);
		config.updateGlobalConfig({ language: 'ne', firstDayOfWeek: 1 });
		fixture.detectChanges();
		expect(picker.mergedConfig().language).toBe('ne');
		expect(picker.currentCalendarType()).toBe('AD');
		expect(picker.rotatedDayNames()[0]).toBeDefined();
	});
	it('does not mark a control touched when disabled and blocks every navigation entry', () => {
		const picker = create().componentInstance,
			touch = jasmine.createSpy('touch');
		picker.registerOnTouched(touch);
		const display = picker.currentDisplayDate;
		picker.setDisabledState(true);
		picker.selectMonth(5);
		picker.selectYear(2024);
		picker.selectToday();
		picker.toggleMode('range');
		expect(picker.currentDisplayDate).toEqual(display);
		expect(picker.rangeMode()).toBeFalse();
		expect(touch).not.toHaveBeenCalled();
	});
	it('keeps one grid tab stop and moves actual focus through rendered keyboard events', fakeAsync(() => {
		const fixture = create(),
			picker = fixture.componentInstance;
		picker.currentDisplayDate = { year: 2024, month: 0, day: 1 };
		fixture.detectChanges();
		const first = fixture.nativeElement.querySelector('[data-calendar-day="1"]') as HTMLElement;
		first.focus();
		first.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
		fixture.detectChanges();
		tick();
		fixture.detectChanges();
		expect(document.activeElement?.getAttribute('data-calendar-day')).toBe('2');
		expect(fixture.nativeElement.querySelectorAll('ndp-calendar-grid button[tabindex="0"]').length).toBe(1);
		expect(fixture.nativeElement.querySelectorAll('[role="row"]').length).toBeGreaterThan(4);
	}));
	it('does not change document-root styles when configuration or instance themes change', () => {
		const before = document.documentElement.style.cssText;
		const fixture = create();
		fixture.componentRef.setInput('config', { theme: 'dark', inline: true });
		fixture.detectChanges();
		expect(document.documentElement.style.cssText).toBe(before);
		expect(fixture.nativeElement.style.getPropertyValue('--ndp-color-background')).toBe('#1e293b');
	});
	it('restores popup focus on Escape without reopening it', fakeAsync(() => {
		const fixture = create(),
			picker = fixture.componentInstance;
		fixture.componentRef.setInput('config', { calendar: 'AD', inline: false });
		fixture.detectChanges();
		picker.open();
		fixture.detectChanges();
		const cell = fixture.nativeElement.querySelector('ndp-calendar-grid button[tabindex="0"]') as HTMLElement;
		cell.focus();
		cell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
		fixture.detectChanges();
		tick();
		expect(picker.isOpen()).toBeFalse();
		expect(document.activeElement).toBe(fixture.nativeElement.querySelector('input'));
	}));
});
