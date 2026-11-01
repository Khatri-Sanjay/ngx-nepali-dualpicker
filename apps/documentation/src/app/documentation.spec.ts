import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { NgxNepaliDualpicker, DEFAULT_PICKER_CONFIG } from 'ngx-nepali-dualpicker';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { pages } from './content/docs.catalog';
import { examples } from '../../../shared/content/picker-examples';
import { configRows, exportRows } from './content/api.content';
import { publicMembers } from './content/api-signatures.generated';
import * as library from 'ngx-nepali-dualpicker';
import { DocumentationPageComponent } from './pages/documentation-page/documentation-page.component';
import { DemoCardComponent } from './components/demo-card/demo-card.component';
import { CodeBlockComponent } from '../../../shared/components/code-block/code-block.component';
import { FormsExampleComponent } from './pages/forms/forms-example.component';
import { ConversionExampleComponent } from './pages/conversion/conversion-example.component';
import { FormattingExampleComponent } from './pages/formatting/formatting-example.component';

describe('Documentation consumer', () => {
	beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));
	it('documents every runtime root export and separates configuration types from defaults', () => {
		for (const name of Object.keys(library)) {
			expect(exportRows.some((row) => row.name === name))
				.withContext(name)
				.toBeTrue();
		}
		expect(configRows.find((row) => row.name === 'calendar')?.type).toBe('CalendarSystem');
		expect(configRows.find((row) => row.name === 'calendar')?.defaultValue).toBe('"BS"');
		expect(
			publicMembers
				.find((item) => item.name === 'NgxNepaliDualpicker')
				?.rows.some((row) => row.name === 'setDate'),
		).toBeTrue();
	});

	it('opens documentation at the root and links to the separate playground', async () => {
		const harness = await RouterTestingHarness.create();
		await harness.navigateByUrl('/');
		expect(harness.routeNativeElement?.querySelector('h1')?.textContent).toContain('Nepali dates.');
		const fixture = TestBed.createComponent(AppComponent);
		fixture.detectChanges();
		expect(
			fixture.nativeElement.querySelector('a[href="https://ngx-nepali-dualpicker-playground.vercel.app"]'),
		).not.toBeNull();
	});
	it('renders every route and navigates between pages', async () => {
		const errors = spyOn(console, 'error');
		const harness = await RouterTestingHarness.create();
		for (const page of pages) {
			await harness.navigateByUrl(
				page.id === 'home' ? '/introduction' : `/${page.id}`,
				DocumentationPageComponent,
			);
			harness.detectChanges();
			expect(harness.routeNativeElement?.querySelector('h1')).withContext(page.id).not.toBeNull();
			expect(harness.routeNativeElement?.textContent)
				.withContext(page.id)
				.toContain(page.id === 'home' ? 'Nepali dates.' : page.title);
		}
		expect(errors).not.toHaveBeenCalled();
	});

	for (const example of examples) {
		it(`selects a real date and displays current source: ${example.id}`, async () => {
			const fixture = TestBed.createComponent(DemoCardComponent);
			fixture.componentRef.setInput('example', example);
			fixture.detectChanges();
			await fixture.whenStable();
			fixture.detectChanges();
			const card = fixture.componentInstance;
			const picker = fixture.debugElement.query(By.directive(NgxNepaliDualpicker))
				.componentInstance as NgxNepaliDualpicker;
			expect(picker.currentCalendarType()).toBe(example.config.calendar ?? 'BS');
			if (example.initial) expect(picker.inputValue()).withContext('initial form value').not.toBe('');
			picker.open();
			fixture.detectChanges();
			const day = Array.from({ length: 32 }, (_, index) => index + 1).find((value) =>
				picker.isDateSelectable(value),
			);
			expect(day).withContext('at least one selectable day').toBeDefined();
			const cell = fixture.nativeElement.querySelector(`[data-calendar-day="${day}"]`) as HTMLElement | null;
			expect(cell).not.toBeNull();
			cell?.click();
			fixture.detectChanges();
			await fixture.whenStable();
			fixture.detectChanges();
			expect(card.value()).not.toBeNull();
			expect(fixture.nativeElement.querySelector('.result pre').textContent.trim()).not.toBe('null');
			card.tab.set('typescript');
			fixture.detectChanges();
			expect(fixture.nativeElement.querySelector('app-code-block').textContent).toContain('NgxNepaliDualpicker');
			expect(card.typescript).toContain(JSON.stringify(card.config(), null, 2));
		});
	}

	it('integrates reactive forms and ngModel, validates, submits, disables and resets', async () => {
		const fixture = TestBed.createComponent(FormsExampleComponent);
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
		const component = fixture.componentInstance;
		const pickers = fixture.debugElement.queryAll(By.directive(NgxNepaliDualpicker));
		expect((pickers[0].componentInstance as NgxNepaliDualpicker).inputValue()).toBe('2080-10-01');
		expect((pickers[1].componentInstance as NgxNepaliDualpicker).inputValue()).toBe('2080-10-01');
		component.form.controls.date.setValue('2080-10-02');
		fixture.detectChanges();
		expect((pickers[0].componentInstance as NgxNepaliDualpicker).inputValue()).toBe('2080-10-02');
		component.submit();
		expect(component.submitted?.date).toBe('2080-10-02');
		component.toggleDisabled();
		fixture.detectChanges();
		expect(pickers[0].nativeElement.querySelector('input').disabled).toBeTrue();
		component.toggleDisabled();
		component.form.reset();
		fixture.detectChanges();
		expect(component.form.invalid).toBeTrue();
		component.submit();
		expect(component.form.controls.date.touched).toBeTrue();
		(pickers[1].componentInstance as NgxNepaliDualpicker).setDate('2080-10-03');
		await fixture.whenStable();
		expect(component.model).toBe('2080-10-03');
	});

	it('converts in both directions and displays validation errors', () => {
		const fixture = TestBed.createComponent(ConversionExampleComponent);
		fixture.detectChanges();
		const component = fixture.componentInstance;
		component.convert();
		expect(component.result()).toBe('AD 2024-01-15');
		component.direction = 'AD';
		component.year = 2024;
		component.month = 1;
		component.day = 15;
		component.convert();
		expect(component.result()).toBe('BS 2080-10-01');
		component.month = 13;
		component.convert();
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
	});

	it('updates language and theme through public configuration', async () => {
		const fixture = TestBed.createComponent(DemoCardComponent);
		fixture.componentRef.setInput(
			'example',
			examples.find((example) => example.id === 'theme'),
		);
		fixture.detectChanges();
		await fixture.whenStable();
		const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
		select.value = 'dark';
		select.dispatchEvent(new Event('change'));
		fixture.detectChanges();
		await fixture.whenStable();
		const picker = fixture.debugElement.query(By.directive(NgxNepaliDualpicker))
			.componentInstance as NgxNepaliDualpicker;
		expect(picker.mergedConfig().theme).toBe('dark');
		expect(picker.isDarkMode()).toBeTrue();
		select.value = 'custom';
		select.dispatchEvent(new Event('change'));
		fixture.detectChanges();
		await fixture.whenStable();
		expect(picker.mergedConfig().customTheme.colors?.primary).toBe('#0d947d');
	});

	it('renders every formatting preset, Nepali numerals', async () => {
		const fixture = TestBed.createComponent(FormattingExampleComponent);
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelectorAll('.format-row').length).toBe(
			fixture.componentInstance.pipeFormats.length,
		);
		const selects = fixture.nativeElement.querySelectorAll('select') as NodeListOf<HTMLSelectElement>;
		selects[2].value = 'ne';
		selects[2].dispatchEvent(new Event('change'));
		await fixture.whenStable();
		fixture.detectChanges();
		expect(fixture.nativeElement.textContent).toContain('२०८०');
		for (const format of fixture.componentInstance.displayFormats) {
			fixture.componentInstance.setDisplay(format);
			fixture.detectChanges();
			expect(fixture.nativeElement.querySelector('ngx-nepali-dualpicker')).not.toBeNull();
		}
	});

	it('provides search, project links and responsive menu/theme controls', () => {
		const fixture = TestBed.createComponent(AppComponent);
		fixture.detectChanges();
		const component = fixture.componentInstance;

		fixture.detectChanges();

		component.dark.set(false);
		component.toggleDark();
		component.toggleMenu();
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.site.dark')).not.toBeNull();
		expect(fixture.nativeElement.querySelector('.sidebar.mobile-open')).not.toBeNull();
		component.navigate();
		expect(component.menuOpen()).toBeFalse();

		expect(
			fixture.nativeElement.querySelector('a[href="https://github.com/Khatri-Sanjay/ngx-nepali-dualpicker"]'),
		).not.toBeNull();
	});

	it('copies exact code and announces clipboard failure', async () => {
		const fixture = TestBed.createComponent(CodeBlockComponent);
		fixture.componentRef.setInput('code', 'const date = "2080-10-01";');
		fixture.detectChanges();
		const copy = spyOn(navigator.clipboard, 'writeText').and.resolveTo();
		await fixture.componentInstance.copy();
		expect(copy).toHaveBeenCalledWith('const date = "2080-10-01";');
		expect(fixture.componentInstance.copied()).toBeTrue();
		copy.and.rejectWith(new Error('Denied'));
		await fixture.componentInstance.copy();
		expect(fixture.componentInstance.feedback()).toContain('manually');
	});

	it('documents every current configuration default', () => {
		expect(configRows.map((row) => row.name).sort()).toEqual(Object.keys(DEFAULT_PICKER_CONFIG).sort());
		expect(new Set(pages.map((page) => page.id)).size).toBe(pages.length);
	});

	it('keeps both displayed calendar representations synchronized', async () => {
		const fixture = TestBed.createComponent(DemoCardComponent);
		fixture.componentRef.setInput(
			'example',
			examples.find((example) => example.id === 'dual'),
		);
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
		const picker = fixture.debugElement.query(By.directive(NgxNepaliDualpicker))
			.componentInstance as NgxNepaliDualpicker;
		expect(fixture.componentInstance.representation('AD')).toBe('2024-01-15');
		picker.switchCalendarType('AD');
		fixture.detectChanges();
		await fixture.whenStable();
		expect(fixture.componentInstance.representation('BS')).toBe('2080-10-01');
		expect(fixture.componentInstance.value()).toBe('2024-01-15');
	});

	it('shows partial and completed ranges and mode-specific clear values', async () => {
		const fixture = TestBed.createComponent(DemoCardComponent);
		fixture.componentRef.setInput(
			'example',
			examples.find((example) => example.id === 'reports'),
		);
		fixture.detectChanges();
		await fixture.whenStable();
		const picker = fixture.debugElement.query(By.directive(NgxNepaliDualpicker))
			.componentInstance as NgxNepaliDualpicker;
		picker.currentDisplayDate = { year: 2024, month: 0, day: 1 };
		picker.setCurrentMonthData();
		picker.selectDate(15);
		expect(fixture.componentInstance.value()).toEqual({ start: '2024-01-15', end: null });
		picker.selectDate(20);
		expect(fixture.componentInstance.value()).toEqual({ start: '2024-01-15', end: '2024-01-20' });
		picker.clearSelection();
		expect(fixture.componentInstance.value()).toEqual({ start: null, end: null });
	});

	it('enforces the multiple demo selection limit without duplicates', async () => {
		const fixture = TestBed.createComponent(DemoCardComponent);
		fixture.componentRef.setInput(
			'example',
			examples.find((example) => example.id === 'multiple'),
		);
		fixture.detectChanges();
		await fixture.whenStable();
		const picker = fixture.debugElement.query(By.directive(NgxNepaliDualpicker))
			.componentInstance as NgxNepaliDualpicker;
		picker.currentDisplayDate = { year: 2024, month: 0, day: 1 };
		picker.setCurrentMonthData();
		for (const day of [15, 16, 17, 18]) picker.selectDate(day);
		expect(fixture.componentInstance.value()).toEqual(['2024-01-15', '2024-01-16', '2024-01-17']);
		picker.selectDate(16);
		expect(fixture.componentInstance.value()).toEqual(['2024-01-15', '2024-01-17']);
	});

	it('shows unavailable dates and weekday restrictions from the actual picker', async () => {
		for (const id of ['disabled', 'weekdays']) {
			const fixture = TestBed.createComponent(DemoCardComponent);
			fixture.componentRef.setInput(
				'example',
				examples.find((example) => example.id === id),
			);
			fixture.detectChanges();
			await fixture.whenStable();
			const picker = fixture.debugElement.query(By.directive(NgxNepaliDualpicker))
				.componentInstance as NgxNepaliDualpicker;
			expect(picker.isDateSelectable(20)).toBeFalse();
			expect(picker.isDateSelectable(21)).toBeFalse();
			expect(picker.isDateSelectable(15)).toBeTrue();
			fixture.destroy();
		}
	});

	it('displays manual input errors emitted by the package', async () => {
		const fixture = TestBed.createComponent(DemoCardComponent);
		fixture.componentRef.setInput(
			'example',
			examples.find((example) => example.id === 'manual'),
		);
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
		const input = fixture.nativeElement.querySelector('ngx-nepali-dualpicker input') as HTMLInputElement;
		input.value = 'not-a-date';
		input.dispatchEvent(new Event('input'));
		input.dispatchEvent(new Event('blur'));
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('[role="alert"]')).not.toBeNull();
		expect(fixture.componentInstance.error()).not.toBe('');
	});
});
