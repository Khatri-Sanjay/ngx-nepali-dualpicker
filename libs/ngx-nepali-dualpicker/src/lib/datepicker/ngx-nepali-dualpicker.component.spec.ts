import { TestBed } from '@angular/core/testing';
import { NgxNepaliDualpicker } from './ngx-nepali-dualpicker.component';

describe('NgxNepaliDualpicker forms and calendar switching', () => {
	it('deduplicates multiple form writes without emitting changes', () => {
		const picker = create('multiple').componentInstance;
		const change = jasmine.createSpy('change');
		picker.registerOnChange(change);
		picker.writeValue(['2024-01-15', '2024-01-15', '2024-01-16']);
		expect(picker.selectedDates().length).toBe(2);
		expect(picker.inputValue()).toBe('2024-01-15, 2024-01-16');
		expect(change).not.toHaveBeenCalled();
	});

	for (const selectionMode of ['single', 'range', 'multiple'] as const) {
		it(`emits exactly one empty value when clearing ${selectionMode} selection`, () => {
			const picker = create(selectionMode).componentInstance;
			const change = jasmine.createSpy('change');
			picker.registerOnChange(change);
			picker.clearSelection();
			expect(change).toHaveBeenCalledTimes(1);
			expect(change).toHaveBeenCalledWith(
				selectionMode === 'multiple' ? [] : selectionMode === 'range' ? { start: null, end: null } : null,
			);
		});
	}

	it('converts both range endpoints and multiple dates without losing order', () => {
		for (const selectionMode of ['range', 'multiple'] as const) {
			const picker = create(selectionMode).componentInstance;
			const original =
				selectionMode === 'range' ? { start: '2024-01-15', end: '2024-01-16' } : ['2024-01-15', '2024-01-16'];
			picker.writeValue(original);
			const change = jasmine.createSpy('change');
			picker.registerOnChange(change);
			picker.switchCalendarType('BS');
			picker.switchCalendarType('AD');
			expect(change).toHaveBeenCalledTimes(2);
			expect(change).toHaveBeenCalledWith(original);
		}
	});

	it('renders every supported BS year, including dates beyond the AD conversion range', () => {
		const fixture = TestBed.createComponent(NgxNepaliDualpicker);
		fixture.componentRef.setInput('config', { calendar: 'BS', bsYearRange: { start: 2000, end: 2139 } });
		fixture.detectChanges();
		const picker = fixture.componentInstance;
		picker.selectYear(2139);
		picker.selectMonth(11);
		expect(() => fixture.detectChanges()).not.toThrow();
		expect(Object.values(picker.currentMonthData).flat().filter(Boolean).length).toBeGreaterThan(28);
		picker.nextMonth();
		expect(picker.currentDisplayDate.year).toBe(2139);
		picker.focusedDate.set({ year: 2139, month: 11, day: 30 });
		picker.isOpen.set(true);
		expect(() => picker.onKeyDown(new KeyboardEvent('keydown', { key: 'ArrowRight' }))).not.toThrow();
	});

	it('reads form dates using the configured output format', () => {
		const fixture = TestBed.createComponent(NgxNepaliDualpicker);
		fixture.componentRef.setInput('config', { calendar: 'AD', outputFormat: 'dd/MM/yyyy' });
		fixture.detectChanges();
		fixture.componentInstance.writeValue('15/01/2024');
		expect(fixture.componentInstance.selectedDate()).toEqual({ year: 2024, month: 0, day: 15 });
	});

	it('clears an unconvertible AD selection instead of relabeling it as BS', () => {
		const picker = create().componentInstance;
		picker.writeValue('1943-01-01');
		const change = jasmine.createSpy('change');
		picker.registerOnChange(change);
		spyOn(console, 'error');
		picker.switchCalendarType('BS');
		expect(picker.selectedDate()).toBeNull();
		expect(change).toHaveBeenCalledWith(null);
	});

	it('does not emit changes for an empty multiple form write', () => {
		const picker = create('multiple').componentInstance;
		const change = jasmine.createSpy('change');
		picker.registerOnChange(change);
		picker.writeValue([]);
		expect(change).not.toHaveBeenCalled();
	});

	it('publishes a partial range immediately', () => {
		const picker = create('range').componentInstance;
		const change = jasmine.createSpy('change');
		picker.registerOnChange(change);
		picker.currentDisplayDate = { year: 2024, month: 0, day: 1 };
		picker.selectDate(15);
		expect(change).toHaveBeenCalledWith({ start: '2024-01-15', end: null });
	});

	it('preserves native typing keys in the editable input', () => {
		const fixture = TestBed.createComponent(NgxNepaliDualpicker);
		fixture.componentRef.setInput('config', { calendar: 'AD', allowTextInput: true });
		fixture.detectChanges();
		const event = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
		fixture.nativeElement.querySelector('input').dispatchEvent(event);
		expect(event.defaultPrevented).toBeFalse();
		expect(fixture.componentInstance.currentCalendarType()).toBe('AD');
	});

	function create(selectionMode: 'single' | 'range' | 'multiple' = 'single') {
		const fixture = TestBed.createComponent(NgxNepaliDualpicker);
		fixture.componentRef.setInput('config', { calendar: 'AD', selectionMode, convertOnCalendarChange: true });
		fixture.detectChanges();
		return fixture;
	}

	it('renders external form writes without emitting changes', () => {
		const fixture = create();
		const picker = fixture.componentInstance;
		const change = jasmine.createSpy('change');
		const selected = jasmine.createSpy('selected');
		picker.registerOnChange(change);
		picker.dateSelected.subscribe(selected);
		picker.writeValue('2024-01-15');
		expect(picker.inputValue()).toBe('2024-01-15');
		expect(change).not.toHaveBeenCalled();
		expect(selected).not.toHaveBeenCalled();
	});

	it('clears stale range endpoints on a partial form write', () => {
		const picker = create('range').componentInstance;
		picker.writeValue({ start: '2024-01-15', end: '2024-01-20' });
		picker.writeValue({ start: '2024-01-16', end: null });
		expect(picker.startDate()?.day).toBe(16);
		expect(picker.endDate()).toBeNull();
	});

	it('converts the selected date through the rendered calendar buttons', () => {
		const fixture = create();
		const picker = fixture.componentInstance;
		picker.writeValue('2024-01-15');
		picker.open();
		fixture.detectChanges();
		const bsButton = fixture.nativeElement.querySelector('[aria-label="BS, switch to Bikram Sambat calendar"]');
		bsButton.click();
		fixture.detectChanges();
		expect(picker.currentCalendarType()).toBe('BS');
		picker.switchCalendarType('AD');
		expect(picker.selectedDate()).toEqual({ year: 2024, month: 0, day: 15 });
	});
});

describe('Critical interaction regressions', () => {
	it('normalizes external range ordering and rejects an orphan end without emitting', () => {
		const fixture = TestBed.createComponent(NgxNepaliDualpicker);
		fixture.componentRef.setInput('config', { calendar: 'AD', selectionMode: 'range' });
		fixture.detectChanges();
		const picker = fixture.componentInstance;
		const change = jasmine.createSpy('change');
		picker.registerOnChange(change);
		picker.writeValue({ start: '2024-01-20', end: '2024-01-15' });
		expect(picker.startDate()?.day).toBe(15);
		expect(picker.endDate()?.day).toBe(20);
		picker.writeValue({ start: null, end: '2024-01-20' });
		expect(picker.startDate()).toBeNull();
		expect(picker.endDate()).toBeNull();
		expect(change).not.toHaveBeenCalled();
	});

	it('enforces the multiple-selection cap on external writes', () => {
		const fixture = TestBed.createComponent(NgxNepaliDualpicker);
		fixture.componentRef.setInput('config', {
			calendar: 'AD',
			selectionMode: 'multiple',
			multipleSelection: { maxSelections: 2 },
		});
		fixture.detectChanges();
		fixture.componentInstance.writeValue(['2024-01-15', '2024-01-15', '2024-01-16', '2024-01-17']);
		expect(fixture.componentInstance.selectedDates().map((date) => date.day)).toEqual([15, 16]);
	});

	it('blocks clicks on rendered dates when an inline control is disabled', () => {
		const fixture = TestBed.createComponent(NgxNepaliDualpicker);
		fixture.componentRef.setInput('config', { calendar: 'AD', inline: true });
		fixture.detectChanges();
		const picker = fixture.componentInstance;
		const change = jasmine.createSpy('change');
		picker.registerOnChange(change);
		picker.setDisabledState(true);
		fixture.detectChanges();
		fixture.nativeElement.querySelector('.datepicker__date').click();
		expect(picker.selectedDate()).toBeNull();
		expect(change).not.toHaveBeenCalled();
	});

	it('lets a focused header button receive Enter without selecting a date', () => {
		const fixture = TestBed.createComponent(NgxNepaliDualpicker);
		fixture.detectChanges();
		const picker = fixture.componentInstance;
		picker.open();
		fixture.detectChanges();
		const select = spyOn(picker, 'selectDate');
		const button = fixture.nativeElement.querySelector('button');
		const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
		button.dispatchEvent(event);
		expect(event.defaultPrevented).toBeFalse();
		expect(select).not.toHaveBeenCalled();
	});
});
