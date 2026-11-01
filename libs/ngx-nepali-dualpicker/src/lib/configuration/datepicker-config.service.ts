import { Injectable, inject, signal } from '@angular/core';
import { DATE_PICKER_CONFIG } from './datepicker-config.token';
import { DatePickerConfig } from './datepicker-config.model';
import { mergeConfig } from './merge-datepicker-config';

/**
 * Service to manage global date picker configuration
 * and provide merged configurations for components
 */
@Injectable({
	providedIn: 'root',
})
export class DatePickerConfigService {
	private globalConfig = signal(mergeConfig(inject(DATE_PICKER_CONFIG)));

	/**
	 * Get the global configuration
	 */
	getGlobalConfig(): DatePickerConfig {
		return mergeConfig(this.globalConfig());
	}

	/**
	 * Get merged configuration (global config + component overrides)
	 * Uses your existing mergeConfig function
	 *
	 * @param componentConfig - Component-level configuration to override global settings
	 * @returns Merged configuration
	 */
	getMergedConfig(componentConfig?: DatePickerConfig): Required<DatePickerConfig> {
		return mergeConfig(this.globalConfig(), componentConfig ?? {});
	}

	/**
	 * Update global configuration at runtime
	 * @param updates - Partial configuration to update
	 */
	updateGlobalConfig(updates: Partial<DatePickerConfig>): void {
		this.globalConfig.update((current) => mergeConfig(current, updates));
	}

	/**
	 * Reset global configuration to defaults
	 */
	resetGlobalConfig(): void {
		const defaults = mergeConfig({});
		this.globalConfig.set(defaults);
	}

	/**
	 * Get configuration for a specific mode
	 * @param mode - Date picker mode
	 */
	getConfigForMode(selectionMode: 'single' | 'range' | 'multiple'): Required<DatePickerConfig> {
		return this.getMergedConfig({ selectionMode });
	}

	/**
	 * Get configuration with specific theme
	 * @param theme - Theme to apply
	 */
	getConfigWithTheme(theme: DatePickerConfig['theme']): Required<DatePickerConfig> {
		return this.getMergedConfig({ theme });
	}

	/**
	 * Get configuration with specific language
	 * @param language - Language to use
	 */
	getConfigWithLanguage(language: 'en' | 'ne'): Required<DatePickerConfig> {
		return this.getMergedConfig({ language });
	}

	/**
	 * Create a custom configuration preset
	 * Useful for creating reusable configurations
	 */
	createConfigPreset(baseConfig: DatePickerConfig): Required<DatePickerConfig> {
		return this.getMergedConfig(baseConfig);
	}
}
