import { mergeConfig } from './merge-datepicker-config';
import { DatePickerConfig } from './datepicker-config.model';
import { InjectionToken } from '@angular/core';

/**
 * Injection token for global date picker configuration
 *
 * Use this in app.config.ts to provide global defaults:
 *
 * @example
 * ```typescript
 * export const appConfig: ApplicationConfig = {
 *   providers: [
 *     {
 *       provide: DATE_PICKER_CONFIG,
 *       useValue: {
 *         theme: 'ocean',
 *         language: 'en',
 *         displayFormat: 'MMM dd, yyyy'
 *       }
 *     }
 *   ]
 * };
 * ```
 */
export const DATE_PICKER_CONFIG = new InjectionToken<DatePickerConfig>('DATE_PICKER_CONFIG', {
	providedIn: 'root',
	factory: () => mergeConfig({}),
});
