import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService system preference', () => {
	it('validates nested theme values before consumers apply an unknown theme', () => {
		const service = TestBed.inject(ThemeService);
		const theme = service.getPresetTheme('light');
		expect(service.isValidTheme(theme)).toBeTrue();
		expect(service.isValidTheme({ ...theme, colors: {} })).toBeTrue();
		for (const invalid of [
			null,
			{},
			{ ...theme, typography: {} },
			{ ...theme, spacing: [] },
			{ ...theme, colors: { primary: 123 } },
			{ ...theme, dimensions: { dateSize: '36px' } },
			{
				...theme,
				typography: { ...theme.typography, fontWeight: { ...theme.typography.fontWeight, bold: NaN } },
			},
		])
			expect(service.isValidTheme(invalid)).toBeFalse();
	});

	it('keeps the observed theme and target CSS in sync and releases the listener', () => {
		const addListener = jasmine.createSpy('addEventListener');
		const removeListener = jasmine.createSpy('removeEventListener');
		spyOn(window, 'matchMedia').and.returnValue({
			matches: false,
			addEventListener: addListener,
			removeEventListener: removeListener,
		} as unknown as MediaQueryList);
		const service = TestBed.inject(ThemeService);
		const target = document.createElement('div');
		service.setTheme('system', target);
		const initialBackground = target.style.getPropertyValue('--ndp-color-background');
		const listener = addListener.calls.mostRecent().args[1] as EventListener;
		listener(Object.assign(new Event('change'), { matches: true }));
		expect(target.style.getPropertyValue('--ndp-color-background')).toBe(
			service.getCurrentThemeValue().colors.background!,
		);
		expect(target.style.getPropertyValue('--ndp-color-background')).not.toBe(initialBackground);
		service.setTheme('light', target);
		expect(removeListener).toHaveBeenCalledWith('change', listener);
	});
});
