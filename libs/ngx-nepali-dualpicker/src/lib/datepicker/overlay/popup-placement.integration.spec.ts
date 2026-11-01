import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { NgxNepaliDualpicker } from '../ngx-nepali-dualpicker.component';
import type { DatePickerConfig } from '../../configuration/datepicker-config.model';

@Component({
	standalone: true,
	imports: [NgxNepaliDualpicker],
	template: '<ngx-nepali-dualpicker [config]="config" />',
})
class PopupHost {
	config: DatePickerConfig = {};
	@ViewChild(NgxNepaliDualpicker) picker!: NgxNepaliDualpicker;
}

describe('Rendered popup placement', () => {
	it('shows a complete desktop month without scrolling when it fits', fakeAsync(() => {
		const fixture = TestBed.createComponent(PopupHost);
		fixture.componentInstance.config = { calendar: 'AD', mobilePresentation: 'popup' };
		fixture.detectChanges();
		const host = fixture.nativeElement.querySelector('ngx-nepali-dualpicker') as HTMLElement;
		host.style.cssText = 'position:fixed;left:24px;top:16px;width:360px;display:block';
		fixture.componentInstance.picker.writeValue('2024-01-15');
		fixture.componentInstance.picker.open();
		fixture.detectChanges();
		tick();
		fixture.detectChanges();
		const popup = host.querySelector<HTMLElement>('.datepicker__container')!;
		const body = host.querySelector<HTMLElement>('.datepicker__body')!;
		expect(body.scrollHeight).toBeLessThanOrEqual(body.clientHeight + 1);
		expect(popup.scrollHeight).toBeLessThanOrEqual(popup.clientHeight + 1);
		expect(getComputedStyle(popup).overflowY).toBe('hidden');
		fixture.destroy();
	}));
	it('scrolls only the body and keeps navigation fixed in a constrained popup', fakeAsync(() => {
		const fixture = TestBed.createComponent(PopupHost);
		fixture.componentInstance.config = { calendar: 'AD', mobilePresentation: 'popup' };
		fixture.detectChanges();
		fixture.componentInstance.picker.open();
		fixture.detectChanges();
		tick();
		fixture.detectChanges();
		const popup = fixture.nativeElement.querySelector('.datepicker__container') as HTMLElement;
		const body = popup.querySelector<HTMLElement>('.datepicker__body')!;
		const header = popup.querySelector<HTMLElement>('.datepicker__options-container')!;
		popup.style.maxHeight = '180px';
		popup.style.animation = 'none';
		const before = header.getBoundingClientRect().top;
		expect(body.scrollHeight).toBeGreaterThan(body.clientHeight);
		body.scrollTop = 100;
		expect(body.scrollTop).toBeGreaterThan(0);
		expect(header.getBoundingClientRect().top).toBe(before);
		expect(popup.scrollTop).toBe(0);
		fixture.destroy();
	}));
	for (const edge of ['top', 'bottom'] as const) {
		it(`keeps the calendar beside the input at the ${edge} viewport edge`, fakeAsync(() => {
			const fixture = TestBed.createComponent(PopupHost);
			fixture.componentInstance.config = {
				calendar: 'AD',
				popupPosition: edge === 'bottom' ? 'bottom-left' : 'top-right',
				mobilePresentation: 'popup',
			};
			fixture.detectChanges();
			const host = fixture.nativeElement.querySelector('ngx-nepali-dualpicker') as HTMLElement;
			host.style.cssText = `position:fixed;left:24px;${edge}:16px;width:min(600px,calc(100vw - 48px));display:block`;
			fixture.detectChanges();
			fixture.componentInstance.picker.open();
			fixture.detectChanges();
			tick();
			fixture.detectChanges();
			const popup = host.querySelector<HTMLElement>('.datepicker__container')!;
			popup.style.animation = 'none';
			const anchor = host.querySelector<HTMLElement>('.input-container')!.getBoundingClientRect();
			const panel = popup.getBoundingClientRect();
			expect(getComputedStyle(popup).visibility).toBe('visible');
			expect(panel.width).toBeLessThanOrEqual(321);
			expect(panel.left).toBeGreaterThanOrEqual(7);
			expect(panel.right).toBeLessThanOrEqual(window.innerWidth - 7);
			if (edge === 'bottom') expect(panel.bottom).toBeLessThanOrEqual(anchor.top - 7);
			else expect(panel.top).toBeGreaterThanOrEqual(anchor.bottom + 7);
			fixture.destroy();
		}));
	}
});
