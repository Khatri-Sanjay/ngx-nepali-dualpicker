import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DatePickerTheme } from './datepicker-theme.model';
import { PresetThemeName, PRESET_THEMES, DEFAULT_LIGHT_THEME, DEFAULT_DARK_THEME } from './datepicker-theme.presets';
import { ThemeApplier } from './internal/theme-applier';
import { ThemeMerger } from './internal/theme-merger';
import { ThemeDetector } from './internal/theme-detector';

@Injectable({
	providedIn: 'root',
})
export class ThemeService implements OnDestroy {
	private currentTheme$ = new BehaviorSubject<DatePickerTheme>(DEFAULT_LIGHT_THEME);
	private requestedTheme: PresetThemeName | 'system' | DatePickerTheme = 'light';
	private systemThemeCleanup?: () => void;
	private document = inject(DOCUMENT);
	private platformId = inject(PLATFORM_ID);
	private isBrowser = isPlatformBrowser(this.platformId);

	ngOnDestroy(): void {
		this.cleanup();
	}

	/**
	 * Get current theme as observable
	 */
	getCurrentTheme(): Observable<DatePickerTheme> {
		return this.currentTheme$.pipe(map((theme) => ThemeMerger.merge(theme, {})));
	}

	/**
	 * Get current theme value (synchronous)
	 */
	getCurrentThemeValue(): DatePickerTheme {
		return ThemeMerger.merge(this.currentTheme$.value, {});
	}

	/**
	 * Set theme from preset name or custom object
	 */
	setTheme(theme: PresetThemeName | 'system' | DatePickerTheme, element?: HTMLElement): void {
		this.requestedTheme = theme;
		this.cleanup();
		if (theme === 'system') this.initializeSystemThemeListener(element);
		const resolvedTheme = ThemeMerger.merge(this.resolveTheme(theme), {});

		this.currentTheme$.next(resolvedTheme);

		if (element) {
			ThemeApplier.applyTheme(resolvedTheme, element);
		} else if (this.isBrowser) {
			ThemeApplier.applyTheme(resolvedTheme, this.document.documentElement);
		}
	}

	/**
	 * Merge custom theme with current theme
	 */
	mergeTheme(customTheme: Partial<DatePickerTheme>, element?: HTMLElement): void {
		const currentTheme = this.currentTheme$.value;
		const mergedTheme = ThemeMerger.merge(currentTheme, customTheme);
		this.requestedTheme = mergedTheme;
		this.cleanup();

		this.currentTheme$.next(mergedTheme);

		if (element) {
			ThemeApplier.applyTheme(mergedTheme, element);
		} else if (this.isBrowser) {
			ThemeApplier.applyTheme(mergedTheme, this.document.documentElement);
		}
	}

	/**
	 * Apply theme to specific element
	 */
	applyThemeToElement(theme: DatePickerTheme, element: HTMLElement): void {
		ThemeApplier.applyTheme(theme, element);
	}

	/**
	 * Remove theme from element
	 */
	removeThemeFromElement(element: HTMLElement): void {
		ThemeApplier.removeTheme(element);
	}

	/**
	 * Get preset theme by name
	 */
	getPresetTheme(name: PresetThemeName): DatePickerTheme {
		return ThemeMerger.merge(PRESET_THEMES[name] || DEFAULT_LIGHT_THEME, {});
	}

	/**
	 * Get all preset themes
	 */
	getPresetThemes(): typeof PRESET_THEMES {
		return Object.fromEntries(
			Object.entries(PRESET_THEMES).map(([name, theme]) => [name, ThemeMerger.merge(theme, {})]),
		) as typeof PRESET_THEMES;
	}

	/**
	 * Create custom theme based on preset
	 */
	createCustomTheme(presetName: PresetThemeName, customProperties: Partial<DatePickerTheme>): DatePickerTheme {
		const baseTheme = this.getPresetTheme(presetName);
		return ThemeMerger.merge(baseTheme, customProperties);
	}

	/**
	 * Merge theme objects (helper)
	 */
	mergeThemeObject(baseTheme: DatePickerTheme, customTheme: Partial<DatePickerTheme>): DatePickerTheme {
		return ThemeMerger.merge(baseTheme, customTheme);
	}

	/**
	 * Detect system theme
	 */
	detectSystemTheme(): 'light' | 'dark' {
		return ThemeDetector.getSystemTheme();
	}

	/**
	 * Check if user prefers dark mode
	 */
	prefersDarkMode(): boolean {
		return ThemeDetector.prefersDarkMode();
	}

	/**
	 * Listen for system theme changes
	 */
	onSystemThemeChange(callback: (isDark: boolean) => void): () => void {
		return ThemeDetector.onSystemThemeChange(callback);
	}

	/**
	 * Validate if theme is complete
	 */
	isValidTheme(theme: unknown): theme is DatePickerTheme {
		return ThemeMerger.isValid(theme);
	}

	private resolveTheme(theme: PresetThemeName | 'system' | DatePickerTheme): DatePickerTheme {
		if (typeof theme === 'string') {
			if (theme === 'system') {
				const systemTheme = ThemeDetector.getSystemTheme();
				return systemTheme === 'dark' ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
			}
			return PRESET_THEMES[theme] || DEFAULT_LIGHT_THEME;
		}

		return theme;
	}

	private initializeSystemThemeListener(element?: HTMLElement): void {
		if (this.isBrowser && ThemeDetector.supportsColorScheme()) {
			this.systemThemeCleanup = ThemeDetector.onSystemThemeChange((isDark) => {
				if (this.requestedTheme !== 'system') return;
				const newTheme = isDark ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
				this.currentTheme$.next(newTheme);
				ThemeApplier.applyTheme(newTheme, element ?? this.document.documentElement);
			});
		}
	}

	private cleanup(): void {
		if (this.systemThemeCleanup) {
			this.systemThemeCleanup();
			this.systemThemeCleanup = undefined;
		}
	}
}
