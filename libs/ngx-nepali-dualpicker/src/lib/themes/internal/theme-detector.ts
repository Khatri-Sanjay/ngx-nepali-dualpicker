import { DatePickerTheme } from '../datepicker-theme.model';

export class ThemeDetector {
	/**
	 * Check if user prefers dark mode
	 */
	static prefersDarkMode(): boolean {
		if (typeof window === 'undefined' || !window.matchMedia) return false;

		return window.matchMedia('(prefers-color-scheme: dark)').matches;
	}

	/**
	 * Get system theme preference
	 */
	static getSystemTheme(): 'light' | 'dark' {
		return this.prefersDarkMode() ? 'dark' : 'light';
	}

	/**
	 * Listen for system theme changes
	 */
	static onSystemThemeChange(callback: (isDark: boolean) => void): () => void {
		if (typeof window === 'undefined' || !window.matchMedia) return () => {};

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

		const handler = (e: MediaQueryListEvent | MediaQueryList) => {
			callback('matches' in e ? e.matches : (e as MediaQueryListEvent).matches);
		};

		// Modern browsers
		if (mediaQuery.addEventListener) {
			mediaQuery.addEventListener('change', handler as EventListener);
			return () => mediaQuery.removeEventListener('change', handler as EventListener);
		}

		return () => {};
	}

	/**s
	 * Check if browser supports color scheme detection
	 */
	static supportsColorScheme(): boolean {
		return typeof window !== 'undefined' && !!window.matchMedia;
	}

	static isThemeDark(theme: DatePickerTheme): boolean {
		const bg = theme?.colors?.background;
		if (!bg) return false;

		let hex = bg.replace('#', '');
		if (hex.length === 3) {
			hex = hex
				.split('')
				.map((c) => c + c)
				.join('');
		}

		if (hex.length !== 6) return false;

		const r = parseInt(hex.substr(0, 2), 16);
		const g = parseInt(hex.substr(2, 2), 16);
		const b = parseInt(hex.substr(4, 2), 16);

		if ([r, g, b].some(isNaN)) return false;

		const brightness = (r * 299 + g * 587 + b * 114) / 1000;
		return brightness < 128;
	}
}
