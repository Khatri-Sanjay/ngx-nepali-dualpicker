import { PickerDate } from './picker-date.adapter';

export interface PickerSelection {
	readonly single: PickerDate | null;
	readonly multiple: PickerDate[];
	readonly start: PickerDate | null;
	readonly end: PickerDate | null;
}
