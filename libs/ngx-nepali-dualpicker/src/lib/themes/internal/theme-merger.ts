import { DatePickerTheme } from '../datepicker-theme.model';

export class ThemeMerger {
	/**
	 * Deep merge two theme objects
	 */
	static merge(baseTheme: DatePickerTheme, customTheme: Partial<DatePickerTheme>): DatePickerTheme {
		return {
			colors: {
				...baseTheme.colors,
				...customTheme.colors,
			},
			spacing: {
				...baseTheme.spacing,
				...customTheme.spacing,
			},
			typography: {
				fontFamily: customTheme.typography?.fontFamily ?? baseTheme.typography.fontFamily,
				fontSize: {
					...baseTheme.typography.fontSize,
					...customTheme.typography?.fontSize,
				},
				fontWeight: {
					...baseTheme.typography.fontWeight,
					...customTheme.typography?.fontWeight,
				},
			},
			borderRadius: {
				...baseTheme.borderRadius,
				...customTheme.borderRadius,
			},
			shadows: {
				...baseTheme.shadows,
				...customTheme.shadows,
			},
			transitions: {
				...baseTheme.transitions,
				...customTheme.transitions,
			},
			dimensions: {
				...baseTheme.dimensions,
				...customTheme.dimensions,
			},
		};
	}

	/**
	 * Validate if theme is complete
	 */
	static isValid(theme: unknown): theme is DatePickerTheme {
		return !!(
			theme !== null &&
			typeof theme === 'object' &&
			'colors' in theme &&
			theme.colors &&
			'spacing' in theme &&
			theme.spacing &&
			'typography' in theme &&
			theme.typography &&
			'borderRadius' in theme &&
			theme.borderRadius &&
			'shadows' in theme &&
			theme.shadows &&
			'transitions' in theme &&
			theme.transitions &&
			'dimensions' in theme &&
			theme.dimensions
		);
	}
}
