import { TestBed } from '@angular/core/testing';
import { NgxNepaliDualpicker } from '../datepicker/ngx-nepali-dualpicker.component';
import { Calendar } from './datepicker-config.model';
import { DEFAULT_PICKER_CONFIG } from './datepicker-config.defaults';

describe('Canonical datepicker configuration', () => {
	it('exposes the corrected calendar enum and explicit defaults without old keys', () => {
		expect(Object.keys(Calendar)).toEqual(['AD', 'BS']);
		expect(Calendar.BS).toBe('BS');
		expect(DEFAULT_PICKER_CONFIG.selectionMode).toBe('single');
		expect(DEFAULT_PICKER_CONFIG.mobilePresentation).toBe('bottom-sheet');
		expect(DEFAULT_PICKER_CONFIG.monthLabelFormat).toBe('full');
		expect(DEFAULT_PICKER_CONFIG.weekdayLabelFormat).toBe('narrow');
		for (const removed of ['calendarType', 'mode', 'readonly', 'position', 'mobileMode', 'yearRange']) {
			expect(Object.hasOwn(DEFAULT_PICKER_CONFIG, removed)).toBeFalse();
		}
	});
	it('applies the canonical names to calendar state and selection behavior', () => {
		const fixture = TestBed.createComponent(NgxNepaliDualpicker);
		fixture.componentRef.setInput('config', {
			calendar: 'AD',
			selectionMode: 'range',
			inline: true,
			readOnly: true,
			allowTextInput: true,
			showSecondaryDate: true,
			popupPosition: 'auto',
			monthLabelFormat: 'short',
			weekdayLabelFormat: 'short',
			rangeConstraints: { minDays: 3, preventCrossingUnavailableDates: true },
		});
		fixture.detectChanges();
		expect(fixture.componentInstance.currentCalendarType()).toBe('AD');
		expect(fixture.componentInstance.rangeMode()).toBeTrue();
		expect(fixture.componentInstance.getCurrentMonthLabel().length).toBeLessThanOrEqual(3);
		expect(fixture.componentInstance.rotatedDayNames()[0]).toBe('Sun');
		expect(fixture.componentInstance.mergedConfig().readOnly).toBeTrue();
		expect(fixture.componentInstance.mergedConfig().rangeConstraints.preventCrossingUnavailableDates).toBeTrue();
	});
});
