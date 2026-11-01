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
		const record = (value: unknown): value is Record<string, unknown> =>
			value !== null && typeof value === 'object' && !Array.isArray(value);
		const strings = (value: unknown, keys: string[]): boolean =>
			record(value) && keys.every((key) => typeof value[key] === 'string');
		if (!record(theme) || !record(theme['colors']) || !record(theme['typography'])) return false;
		const typography = theme['typography'];
		const weights = typography['fontWeight'];
		return (
			Object.values(theme['colors']).every((value) => value === undefined || typeof value === 'string') &&
			strings(theme['spacing'], ['containerPadding', 'dateGap', 'headerPadding', 'pickerGap']) &&
			typeof typography['fontFamily'] === 'string' &&
			strings(typography['fontSize'], ['base', 'small', 'large']) &&
			record(weights) &&
			['normal', 'medium', 'semibold', 'bold'].every(
				(key) => typeof weights[key] === 'number' && Number.isFinite(weights[key]),
			) &&
			strings(theme['borderRadius'], ['small', 'medium', 'large', 'full']) &&
			strings(theme['shadows'], ['dropdown', 'selected']) &&
			strings(theme['transitions'], ['default', 'fast', 'slow']) &&
			strings(theme['dimensions'], ['dateSize', 'containerWidth', 'containerMaxHeight', 'iconSize'])
		);
	}
}
