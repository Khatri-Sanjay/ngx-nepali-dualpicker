import type { PickerSelection } from './selection-state.model';
import type { PickerDate } from './picker-date.adapter';
import type { DatePickerValue } from './datepicker-value.type';

export function emptySelection(): PickerSelection {
	return { single: null, multiple: [], start: null, end: null };
}

export function formatSelection(
	selection: PickerSelection,
	selectionMode: 'single' | 'range' | 'multiple',
	display: (date: PickerDate) => string,
	output: (date: PickerDate) => string,
): { display: string; value: DatePickerValue } {
	if (selectionMode === 'multiple')
		return { display: selection.multiple.map(display).join(', '), value: selection.multiple.map(output) };
	if (selectionMode === 'range')
		return {
			display: selection.start
				? display(selection.start) + (selection.end ? ' - ' + display(selection.end) : '')
				: '',
			value: {
				start: selection.start ? output(selection.start) : null,
				end: selection.end ? output(selection.end) : null,
			},
		};
	return {
		display: selection.single ? display(selection.single) : '',
		value: selection.single ? output(selection.single) : null,
	};
}
