import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgxNepaliDualpicker } from 'ngx-nepali-dualpicker';
import { BookingDemoComponent } from './booking-demo.component';

describe('Booking demo', () => {
	it('applies checkbox changes immediately and preserves the browsed month', async () => {
		const fixture = TestBed.createComponent(BookingDemoComponent);
		fixture.detectChanges();
		await fixture.whenStable();
		const picker = fixture.debugElement.query(By.directive(NgxNepaliDualpicker))
			.componentInstance as NgxNepaliDualpicker;
		picker.nextMonth();
		fixture.detectChanges();
		const browsed = { ...picker.currentDisplayDate };
		const options = fixture.nativeElement.querySelectorAll('.option input') as NodeListOf<HTMLInputElement>;
		options[0].click();
		fixture.detectChanges();
		await fixture.whenStable();
		expect(picker.currentDisplayDate).toEqual(browsed);
		expect(fixture.nativeElement.querySelector('.secondary-date')).toBeNull();
		options[1].click();
		fixture.detectChanges();
		await fixture.whenStable();
		expect(fixture.nativeElement.querySelector('.price-amount')).not.toBeNull();
		options[1].click();
		fixture.detectChanges();
		await fixture.whenStable();
		expect(fixture.nativeElement.querySelector('.price-amount')).toBeNull();
		expect(picker.currentDisplayDate).toEqual(browsed);
		options[0].click();
		fixture.detectChanges();
		await fixture.whenStable();
		expect(fixture.nativeElement.querySelector('.secondary-date')).not.toBeNull();
		expect(picker.currentDisplayDate).toEqual(browsed);
	});

	it('revalidates a crossing range when whole-period availability is checked', async () => {
		const fixture = TestBed.createComponent(BookingDemoComponent);
		fixture.detectChanges();
		await fixture.whenStable();
		const component = fixture.componentInstance;
		component.booking.setValue({ start: '2083-07-09', end: '2083-07-11' });
		fixture.detectChanges();
		expect(component.booking.valid).toBeTrue();
		const options = fixture.nativeElement.querySelectorAll('.option input') as NodeListOf<HTMLInputElement>;
		options[2].click();
		fixture.detectChanges();
		await fixture.whenStable();
		expect(component.config.rangeConstraints?.preventCrossingUnavailableDates).toBeTrue();
		expect(component.range()?.end).toBeNull();
		expect(component.booking.invalid).toBeTrue();
		expect(options[2].checked).toBeTrue();
	});
	it('updates the summary through the picker and clears the whole selection', async () => {
		const fixture = TestBed.createComponent(BookingDemoComponent);
		fixture.detectChanges();
		await fixture.whenStable();
		const component = fixture.componentInstance;
		const picker = fixture.debugElement.query(By.directive(NgxNepaliDualpicker))
			.componentInstance as NgxNepaliDualpicker;
		picker.selectDate(11);
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.selection-feedback').textContent).toContain(
			'Now choose an end date',
		);
		picker.selectDate(14);
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.selection-feedback').textContent).toContain(
			'Your date range is ready',
		);
		expect(fixture.nativeElement.querySelector('.selected-dates').textContent).toContain(component.range()!.end);
		component.selectionError.set('Previous selection error');
		fixture.nativeElement.querySelector('.clear-button').click();
		fixture.detectChanges();
		expect(component.booking.value).toBeNull();
		expect(component.range()).toBeNull();
		expect(component.selectionError()).toBe('');
		expect(fixture.nativeElement.querySelector('.clear-button').disabled).toBeTrue();
	});

	it('keeps both calendars and sample prices visible in custom cells', async () => {
		const fixture = TestBed.createComponent(BookingDemoComponent);
		fixture.componentInstance.customCells = true;
		fixture.detectChanges();
		await fixture.whenStable();
		expect(fixture.nativeElement.querySelector('.price-amount').textContent).toContain('Rs500');
		expect(fixture.nativeElement.querySelector('.price-secondary').textContent).toContain('AD');
		fixture.componentInstance.updateConfig({ showSecondaryDate: false });
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.price-secondary')).toBeNull();
		expect(fixture.nativeElement.querySelector('.calendar-badge').textContent.trim()).toBe('BS');
	});
});
