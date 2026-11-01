import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService system preference', () => {
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
