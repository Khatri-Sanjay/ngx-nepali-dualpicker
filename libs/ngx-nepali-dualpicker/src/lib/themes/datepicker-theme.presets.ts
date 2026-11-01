import type { DatePickerTheme } from './datepicker-theme.model';

// Default light theme
export const DEFAULT_LIGHT_THEME: DatePickerTheme = {
	colors: {
		primary: '#1d4ed8',
		primaryHover: '#2563eb',
		primaryLight: '#eff6ff',
		secondary: '#64748b',
		background: '#ffffff',
		surface: '#f8fafc',
		border: '#e2e8f0',
		text: '#0f172a',
		textSecondary: '#64748b',
		textDisabled: '#cbd5e1',
		error: '#b91c1c',
		success: '#10b981',
		selectedBackground: '#1d4ed8',
		selectedText: '#ffffff',
		hoverBackground: '#f1f5f9',
		todayText: '#3b82f6',
		rangeBackground: '#dbeafe',
		rangeHoverBackground: '#bfdbfe',
	},
	spacing: {
		containerPadding: '12px',
		dateGap: '4px',
		headerPadding: '12px',
		pickerGap: '8px',
	},
	typography: {
		fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
		fontSize: {
			base: '14px',
			small: '12px',
			large: '16px',
		},
		fontWeight: {
			normal: 400,
			medium: 500,
			semibold: 600,
			bold: 700,
		},
	},
	borderRadius: {
		small: '4px',
		medium: '6px',
		large: '8px',
		full: '9999px',
	},
	shadows: {
		dropdown: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
		selected: '0 2px 8px rgba(59, 130, 246, 0.3)',
	},
	transitions: {
		default: 'all 0.2s ease',
		fast: 'all 0.15s ease',
		slow: 'all 0.3s ease',
	},
	dimensions: {
		dateSize: '36px',
		containerWidth: '320px',
		containerMaxHeight: '280px',
		iconSize: '16px',
	},
};

// Default dark theme
export const DEFAULT_DARK_THEME: DatePickerTheme = {
	colors: {
		primary: '#60a5fa',
		primaryHover: '#60a5fa',
		primaryLight: '#1e3a8a',
		secondary: '#94a3b8',
		background: '#1e293b',
		surface: '#0f172a',
		border: '#334155',
		text: '#f1f5f9',
		textSecondary: '#94a3b8',
		textDisabled: '#475569',
		error: '#ef4444',
		success: '#10b981',
		selectedBackground: '#60a5fa',
		selectedText: '#0f172a',
		hoverBackground: '#334155',
		todayText: '#60a5fa',
		rangeBackground: '#1e3a8a',
		rangeHoverBackground: '#1e40af',
	},
	spacing: {
		containerPadding: '12px',
		dateGap: '4px',
		headerPadding: '12px',
		pickerGap: '8px',
	},
	typography: {
		fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
		fontSize: {
			base: '14px',
			small: '12px',
			large: '16px',
		},
		fontWeight: {
			normal: 400,
			medium: 500,
			semibold: 600,
			bold: 700,
		},
	},
	borderRadius: {
		small: '4px',
		medium: '6px',
		large: '8px',
		full: '9999px',
	},
	shadows: {
		dropdown: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)',
		selected: '0 2px 8px rgba(59, 130, 246, 0.5)',
	},
	transitions: {
		default: 'all 0.2s ease',
		fast: 'all 0.15s ease',
		slow: 'all 0.3s ease',
	},
	dimensions: {
		dateSize: '36px',
		containerWidth: '320px',
		containerMaxHeight: '280px',
		iconSize: '16px',
	},
};

// Preset themes
export const PRESET_THEMES = {
	light: DEFAULT_LIGHT_THEME,
	dark: DEFAULT_DARK_THEME,
	ocean: {
		...DEFAULT_LIGHT_THEME,
		colors: {
			...DEFAULT_LIGHT_THEME.colors,
			primary: '#0369a1',
			primaryHover: '#0284c7',
			primaryLight: '#e0f2fe',
			selectedBackground: '#0369a1',
			todayText: '#0369a1',
			rangeBackground: '#e0f2fe',
			rangeHoverBackground: '#bae6fd',
		},
	} as DatePickerTheme,
	forest: {
		...DEFAULT_LIGHT_THEME,
		colors: {
			...DEFAULT_LIGHT_THEME.colors,
			primary: '#047857',
			primaryHover: '#059669',
			primaryLight: '#d1fae5',
			selectedBackground: '#047857',
			todayText: '#047857',
			rangeBackground: '#d1fae5',
			rangeHoverBackground: '#a7f3d0',
		},
	} as DatePickerTheme,
	sunset: {
		...DEFAULT_LIGHT_THEME,
		colors: {
			...DEFAULT_LIGHT_THEME.colors,
			primary: '#92400e',
			primaryHover: '#d97706',
			primaryLight: '#fef3c7',
			selectedBackground: '#92400e',
			todayText: '#92400e',
			rangeBackground: '#fef3c7',
			rangeHoverBackground: '#fde68a',
		},
	} as DatePickerTheme,
	purple: {
		...DEFAULT_LIGHT_THEME,
		colors: {
			...DEFAULT_LIGHT_THEME.colors,
			primary: '#7e22ce',
			primaryHover: '#9333ea',
			primaryLight: '#f3e8ff',
			selectedBackground: '#7e22ce',
			todayText: '#7e22ce',
			rangeBackground: '#f3e8ff',
			rangeHoverBackground: '#e9d5ff',
		},
	} as DatePickerTheme,
	rose: {
		...DEFAULT_LIGHT_THEME,
		colors: {
			...DEFAULT_LIGHT_THEME.colors,
			primary: '#be123c',
			primaryHover: '#e11d48',
			primaryLight: '#ffe4e6',
			selectedBackground: '#be123c',
			todayText: '#be123c',
			rangeBackground: '#ffe4e6',
			rangeHoverBackground: '#fecdd3',
		},
	} as DatePickerTheme,
};

export type PresetThemeName = keyof typeof PRESET_THEMES;
