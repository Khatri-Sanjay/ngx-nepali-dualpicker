import { Pipe, PipeTransform } from '@angular/core';
import { formatDate, DateType } from '../core/formatting/format-date';
import { DateObj } from '../core/models/calendar-date.model';
export type { DateType } from '../core/formatting/format-date';
@Pipe({ name: 'nepaliDate', standalone: true, pure: true })
export class NepaliDatePipe implements PipeTransform {
	transform(
		value: string | DateObj | Date | null | undefined,
		format = 'mediumDate',
		locale: 'ne' | 'en' = 'ne',
		dateType: DateType = 'BS',
	): string {
		return formatDate(value, format, locale, dateType);
	}
}
