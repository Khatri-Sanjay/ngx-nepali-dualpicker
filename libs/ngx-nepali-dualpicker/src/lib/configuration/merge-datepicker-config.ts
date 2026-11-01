import { DEFAULT_PICKER_CONFIG } from './datepicker-config.defaults';
import { DatePickerConfig } from './datepicker-config.model';

/**
 * Check if a value is a plain object (not array, date, etc.)
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
	if (typeof value !== 'object' || value === null) {
		return false;
	}

	if (value instanceof Date || value instanceof RegExp || Array.isArray(value)) {
		return false;
	}

	const prototype = Object.getPrototypeOf(value);
	return prototype === null || prototype === Object.prototype;
}

/** Copy configuration values without sharing mutable arrays, objects or Dates. */
function cloneValue(value: unknown): unknown {
	if (value instanceof Date) return new Date(value.getTime());
	if (Array.isArray(value)) return value.map(cloneValue);
	if (isPlainObject(value)) return deepMerge(value);
	return value;
}

/** Configuration-specific merge: arrays replace and null clears date bounds only. */
function deepMerge<T extends object>(...objects: Partial<T>[]): T {
	const result: Record<string, unknown> = {};

	for (const obj of objects) {
		if (!obj) continue;

		for (const key in obj) {
			if (
				['__proto__', 'constructor', 'prototype'].includes(key) ||
				!Object.prototype.hasOwnProperty.call(obj, key)
			) {
				continue;
			}

			const value = obj[key];
			if (value === null && (key === 'minDate' || key === 'maxDate')) {
				result[key] = null;
				continue;
			}

			if (value === undefined || value === null) {
				continue;
			}

			const existingValue = result[key];

			if (isPlainObject(value) && isPlainObject(existingValue)) {
				result[key] = deepMerge(existingValue, value);
			} else if (Array.isArray(value)) {
				result[key] = value.map(cloneValue);
			} else {
				result[key] = cloneValue(value);
			}
		}
	}

	return result as T;
}

/** Clone instance overrides without filling defaults or overriding application configuration. */
export function cloneConfig(config: DatePickerConfig): DatePickerConfig {
	return deepMerge<DatePickerConfig>(config);
}

/**
 * Merge multiple config objects with proper priority
 *
 * Priority order (highest to lowest):
 * 1. Last config passed
 * 2. Middle configs
 * 3. First config passed
 * 4. defaultConfig (always used as base)
 *
 * @param userConfigs - Config objects to merge (later ones override earlier ones)
 * @returns Complete config with all defaults filled in
 *
 * @example
 * // Single config
 * const config = mergeConfig({ theme: 'dark' });
 *
 * @example
 * // Multiple configs (component overrides global)
 * const config = mergeConfig(globalConfig, componentConfig);
 *
 * @example
 * // With nested overrides
 * const config = mergeConfig(
 *   { customTheme: { colors: { primary: '#ff0000' } } },
 *   { customTheme: { colors: { secondary: '#00ff00' } } }
 * );
 * // Result: both primary and secondary colors are set
 */
export function mergeConfig(...userConfigs: Partial<DatePickerConfig>[]): Required<DatePickerConfig> {
	const validConfigs = userConfigs.filter((config) => config != null);

	if (validConfigs.length === 0) {
		return deepMerge(DEFAULT_PICKER_CONFIG) as Required<DatePickerConfig>;
	}

	const merged = deepMerge<DatePickerConfig>(DEFAULT_PICKER_CONFIG, ...validConfigs);

	return merged as Required<DatePickerConfig>;
}
