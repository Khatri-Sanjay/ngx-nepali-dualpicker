import { DatePickerTheme } from '../datepicker-theme.model';

export class ThemeApplier {
	private static readonly PREFIX = '--ndp';

	static applyTheme(theme: DatePickerTheme, element: HTMLElement): void {
		this.removeTheme(element);
		this.applyColors(theme.colors, element);
		this.applySpacing(theme.spacing, element);
		this.applyTypography(theme.typography, element);
		this.applyBorderRadius(theme.borderRadius, element);
		this.applyShadows(theme.shadows, element);
		this.applyTransitions(theme.transitions, element);
		this.applyDimensions(theme.dimensions, element);
	}

	static removeTheme(element: HTMLElement): void {
		const styles = element.style;
		const propsToRemove: string[] = [];

		for (let i = 0; i < styles.length; i++) {
			const prop = styles[i];
			if (prop.startsWith(this.PREFIX)) {
				propsToRemove.push(prop);
			}
		}

		propsToRemove.forEach((prop) => element.style.removeProperty(prop));
	}

	private static applyColors(colors: DatePickerTheme['colors'], element: HTMLElement): void {
		Object.entries(colors).forEach(([key, value]) => {
			if (value !== undefined) {
				element.style.setProperty(`${this.PREFIX}-color-${this.toKebabCase(key)}`, value);
			}
		});
	}

	private static applySpacing(spacing: DatePickerTheme['spacing'], element: HTMLElement): void {
		Object.entries(spacing).forEach(([key, value]) => {
			if (value !== undefined) {
				element.style.setProperty(`${this.PREFIX}-spacing-${this.toKebabCase(key)}`, value);
			}
		});
	}

	private static applyTypography(typography: DatePickerTheme['typography'], element: HTMLElement): void {
		element.style.setProperty(`${this.PREFIX}-font-family`, typography.fontFamily);

		Object.entries(typography.fontSize).forEach(([key, value]) => {
			if (value !== undefined) {
				element.style.setProperty(`${this.PREFIX}-font-size-${key}`, value);
			}
		});

		Object.entries(typography.fontWeight).forEach(([key, value]) => {
			if (value !== undefined) {
				element.style.setProperty(`${this.PREFIX}-font-weight-${key}`, value.toString());
			}
		});
	}

	private static applyBorderRadius(borderRadius: DatePickerTheme['borderRadius'], element: HTMLElement): void {
		Object.entries(borderRadius).forEach(([key, value]) => {
			if (value !== undefined) {
				element.style.setProperty(`${this.PREFIX}-radius-${key}`, value);
			}
		});
	}

	private static applyShadows(shadows: DatePickerTheme['shadows'], element: HTMLElement): void {
		Object.entries(shadows).forEach(([key, value]) => {
			if (value !== undefined) {
				element.style.setProperty(`${this.PREFIX}-shadow-${key}`, value);
			}
		});
	}

	private static applyTransitions(transitions: DatePickerTheme['transitions'], element: HTMLElement): void {
		Object.entries(transitions).forEach(([key, value]) => {
			if (value !== undefined) {
				element.style.setProperty(`${this.PREFIX}-transition-${key}`, value);
			}
		});
	}

	private static applyDimensions(dimensions: DatePickerTheme['dimensions'], element: HTMLElement): void {
		Object.entries(dimensions).forEach(([key, value]) => {
			if (value !== undefined) {
				element.style.setProperty(`${this.PREFIX}-dimension-${this.toKebabCase(key)}`, value);
			}
		});
	}

	private static toKebabCase(str: string): string {
		return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
	}
}
