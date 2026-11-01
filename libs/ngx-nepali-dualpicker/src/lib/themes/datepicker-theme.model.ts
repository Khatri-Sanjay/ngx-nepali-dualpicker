/**
 * Theme Configuration for Nepali Date Picker
 * Provides full customization capabilities for colors, spacing, typography, and animations
 */

export interface DatePickerTheme {
	// Color scheme
	colors: {
		primary?: string;
		primaryHover?: string;
		primaryLight?: string;
		secondary?: string;
		background?: string;
		surface?: string;
		border?: string;
		text?: string;
		textSecondary?: string;
		textDisabled?: string;
		error?: string;
		success?: string;
		selectedBackground?: string;
		selectedText?: string;
		hoverBackground?: string;
		todayText?: string;
		rangeBackground?: string;
		rangeHoverBackground?: string;
	};

	// Spacing
	spacing: {
		containerPadding: string;
		dateGap: string;
		headerPadding: string;
		pickerGap: string;
	};

	// Typography
	typography: {
		fontFamily: string;
		fontSize: {
			base: string;
			small: string;
			large: string;
		};
		fontWeight: {
			normal: number;
			medium: number;
			semibold: number;
			bold: number;
		};
	};

	// Border radius
	borderRadius: {
		small: string;
		medium: string;
		large: string;
		full: string;
	};

	// Shadows
	shadows: {
		dropdown: string;
		selected: string;
	};

	// Transitions
	transitions: {
		default: string;
		fast: string;
		slow: string;
	};

	// Dimensions
	dimensions: {
		dateSize: string;
		containerWidth: string;
		containerMaxHeight: string;
		iconSize: string;
	};
}
