import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { NgxNepaliDualpicker } from 'ngx-nepali-dualpicker';
import { routes } from '../../app.routes';
import { PlaygroundComponent } from './playground.component';

describe('Interactive playground', () => {
	it('offers and renders the Sunset preset through the actual theme control', async () => {
		const fixture = TestBed.createComponent(PlaygroundComponent);
		fixture.detectChanges();
		await fixture.whenStable();
		const option = fixture.nativeElement.querySelector('option[value="sunset"]') as HTMLOptionElement;
		expect(option).not.toBeNull();
		const select = option.closest('select')!;
		select.value = 'sunset';
		select.dispatchEvent(new Event('change'));
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
		expect(fixture.componentInstance.config().theme).toBe('sunset');
		expect(
			getComputedStyle(fixture.nativeElement.querySelector('.preview-stage ngx-nepali-dualpicker'))
				.getPropertyValue('--ndp-color-primary')
				.trim(),
		).toBe('#92400e');
	});
	it('keeps the live workspace within a narrow container', async () => {
		const fixture = TestBed.createComponent(PlaygroundComponent);
		fixture.nativeElement.style.width = '360px';
		fixture.componentInstance.settingsExpanded.set(true);
		fixture.detectChanges();
		await fixture.whenStable();
		const editor = fixture.nativeElement.querySelector('#config-json') as HTMLElement;
		expect(editor.getBoundingClientRect().width).toBeLessThanOrEqual(editor.parentElement!.clientWidth);
		const layout = fixture.nativeElement.querySelector('.playground-layout') as HTMLElement;
		expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
	});

	it('applies live JSON edits and preserves the working preview when an edit is invalid', async () => {
		const fixture = TestBed.createComponent(PlaygroundComponent);
		fixture.detectChanges();
		await fixture.whenStable();
		const component = fixture.componentInstance;
		const editor = fixture.nativeElement.querySelector('#config-json') as HTMLTextAreaElement;
		editor.value = JSON.stringify({
			calendar: 'AD',
			selectionMode: 'range',
			inline: false,
			showSecondaryDate: true,
		});
		editor.dispatchEvent(new Event('input'));
		fixture.detectChanges();
		await fixture.whenStable();
		const picker = fixture.debugElement.query(By.directive(NgxNepaliDualpicker))
			.componentInstance as NgxNepaliDualpicker;
		expect(picker.rangeMode()).toBeTrue();
		expect(picker.currentCalendarType()).toBe('AD');
		expect(picker.mergedConfig().inline).toBeFalse();
		const working = component.config();
		editor.value = '{"inline":"wrong"}';
		editor.dispatchEvent(new Event('input'));
		fixture.detectChanges();
		expect(component.config()).toBe(working);
		expect(editor.getAttribute('aria-invalid')).toBe('true');
		expect(component.editorError()).toContain('inline');
		component.syncEditor();
		expect(component.editorError()).toBe('');
		expect(JSON.parse(component.editorDraft()).selectionMode).toBe('range');
	});

	it('preserves values during appearance edits and synchronizes controls, form writes and calendar toggles', async () => {
		const fixture = TestBed.createComponent(PlaygroundComponent);
		fixture.detectChanges();
		const component = fixture.componentInstance;
		component.loadPreset('ad');
		fixture.detectChanges();
		await fixture.whenStable();
		component.update({ theme: 'dark', showSecondaryDate: true });
		fixture.detectChanges();
		await fixture.whenStable();
		expect(component.control.value).toBe('2024-01-15');
		expect(component.editorDraft()).toContain('"theme": "dark"');
		component.control.setValue('2024-01-17');
		expect(component.value()).toBe('2024-01-17');
		const picker = fixture.debugElement.query(By.directive(NgxNepaliDualpicker))
			.componentInstance as NgxNepaliDualpicker;
		picker.switchCalendarType('BS');
		fixture.detectChanges();
		await fixture.whenStable();
		expect(component.config().calendar).toBe('BS');
		expect(JSON.parse(component.editorDraft()).calendar).toBe('BS');
		expect(component.value()).toBe(component.control.value);
	});

	it('synchronizes the in-calendar mode switch without discarding the next range selection', async () => {
		const fixture = TestBed.createComponent(PlaygroundComponent);
		fixture.detectChanges();
		fixture.componentInstance.update({ showSelectionModeToggle: true });
		fixture.detectChanges();
		await fixture.whenStable();
		const picker = fixture.debugElement.query(By.directive(NgxNepaliDualpicker))
			.componentInstance as NgxNepaliDualpicker;
		picker.toggleMode('range');
		fixture.detectChanges();
		await fixture.whenStable();
		expect(fixture.componentInstance.config().selectionMode).toBe('range');
		picker.selectDate(11);
		fixture.detectChanges();
		await fixture.whenStable();
		picker.selectDate(14);
		fixture.detectChanges();
		expect(fixture.componentInstance.control.value).toEqual(
			jasmine.objectContaining({ start: jasmine.any(String), end: jasmine.any(String) }),
		);
	});

	it('updates configuration without replacing the preview picker', async () => {
		const fixture = TestBed.createComponent(PlaygroundComponent);
		fixture.detectChanges();
		await fixture.whenStable();
		const picker = fixture.debugElement.query(By.directive(NgxNepaliDualpicker)).componentInstance;
		fixture.componentInstance.update({ selectionMode: 'range' });
		fixture.detectChanges();
		await fixture.whenStable();
		expect(fixture.debugElement.query(By.directive(NgxNepaliDualpicker)).componentInstance).toBe(picker);
	});

	it('includes preset initial values in copied code and clears them after configuration changes', () => {
		const component = TestBed.createComponent(PlaygroundComponent).componentInstance;
		component.loadPreset('ad');
		expect(component.typescript).toContain('new FormControl<DatePickerValue>("2024-01-15")');
		component.setReadonly(true);
		expect(component.preset()).toBe('custom');
		expect(component.control.value).toBe('2024-01-15');
		component.update({ selectionMode: 'range' });
		expect(component.typescript).toContain('new FormControl<DatePickerValue>(null)');
		expect(component.control.value).toBeNull();
	});

	it('preserves the selected value when inspecting readonly and disabled states', async () => {
		const fixture = TestBed.createComponent(PlaygroundComponent);
		fixture.detectChanges();
		fixture.componentInstance.loadPreset('disabled');
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.componentInstance.setReadonly(true);
		fixture.detectChanges();
		await fixture.whenStable();
		expect(fixture.componentInstance.control.value).toBe('2024-01-15');
		fixture.componentInstance.setDisabled(true);
		fixture.detectChanges();
		expect(fixture.componentInstance.control.value).toBe('2024-01-15');
		fixture.componentInstance.setDisabled(false);
		fixture.componentInstance.setReadonly(false);
		fixture.detectChanges();
		expect(fixture.componentInstance.control.value).toBe('2024-01-15');
	});
	it('opens the playground at the root and redirects unknown routes', async () => {
		TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
		const harness = await RouterTestingHarness.create();
		await harness.navigateByUrl('/', PlaygroundComponent);
		expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Nepali Date Playground');
		await harness.navigateByUrl('/introduction');
		expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Nepali Date Playground');
	});

	it('applies mode controls to a new preview and displays real range values', async () => {
		const fixture = TestBed.createComponent(PlaygroundComponent);
		fixture.detectChanges();
		await fixture.whenStable();
		const select = fixture.nativeElement.querySelector('[aria-label="Selection mode"]') as HTMLSelectElement;
		select.value = 'range';
		select.dispatchEvent(new Event('change'));
		fixture.detectChanges();
		await fixture.whenStable();
		const picker = fixture.debugElement.query(By.directive(NgxNepaliDualpicker))
			.componentInstance as NgxNepaliDualpicker;
		expect(picker.rangeMode()).toBeTrue();
		picker.selectDate(10);
		picker.selectDate(12);
		fixture.detectChanges();
		expect(fixture.componentInstance.value()).toEqual(fixture.componentInstance.control.value);
		expect(fixture.nativeElement.querySelector('.value').textContent).toContain('start');
		expect(fixture.componentInstance.typescript).toContain('"selectionMode": "range"');
		expect(fixture.componentInstance.events().length).toBeGreaterThan(0);
	});

	it('enforces disabled state and resets configuration, form and event output', async () => {
		const fixture = TestBed.createComponent(PlaygroundComponent);
		fixture.detectChanges();
		await fixture.whenStable();
		const component = fixture.componentInstance;
		component.setDisabled(true);
		fixture.detectChanges();
		fixture.nativeElement.querySelector('.datepicker__date').click();
		expect(component.value()).toBeNull();
		expect(component.control.disabled).toBeTrue();
		expect(component.typescript).toContain('this.date.disable()');
		component.reset();
		fixture.detectChanges();
		await fixture.whenStable();
		expect(component.control.enabled).toBeTrue();
		expect(component.config().selectionMode).toBe('single');
		expect(component.value()).toBeNull();
		expect(component.events()).toEqual([]);
	});

	it('loads preset restrictions and initial values through the real form adapter', async () => {
		const fixture = TestBed.createComponent(PlaygroundComponent);
		fixture.detectChanges();
		fixture.componentInstance.loadPreset('disabled');
		fixture.detectChanges();
		await fixture.whenStable();
		const picker = fixture.debugElement.query(By.directive(NgxNepaliDualpicker))
			.componentInstance as NgxNepaliDualpicker;
		expect(picker.inputValue()).toBe('2024-01-15');
		expect(picker.isDateSelectable(20)).toBeFalse();
		expect(fixture.componentInstance.configCode()).toContain('2024-01-20');
	});
});
