import { Pipe, PipeTransform } from '@angular/core';
import { toNepaliNumerals } from '../core/locale/convert-numerals';

@Pipe({
	name: 'nepaliNumeral',
	standalone: true,
	pure: true,
})
export class NepaliNumeralPipe implements PipeTransform {
	transform(value: number | string | null): string {
		return value == null ? '' : toNepaliNumerals(value);
	}
}
