import { Provider } from '@angular/core';
import { DatePickerConfig } from './datepicker-config.model';
import { DATE_PICKER_CONFIG } from './datepicker-config.token';
import { mergeConfig } from './merge-datepicker-config';

/** Provide application-wide defaults; component configuration takes precedence. */
export function provideNepaliDualpicker(config: DatePickerConfig = {}): Provider {
	return { provide: DATE_PICKER_CONFIG, useFactory: () => mergeConfig(config) };
}
