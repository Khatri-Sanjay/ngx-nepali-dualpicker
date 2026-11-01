import { PickerDate } from './picker-date.adapter';
import { PickerSelection } from './selection-state.model';

function sameDay(left: PickerDate | null, right: PickerDate): boolean {
	return !!left && left.year === right.year && left.month === right.month && left.day === right.day;
}

/** Selection decoration is independent of Angular, CSS classes and DOM layout. */
export function getCalendarDayState(
	date: PickerDate,
	selection: PickerSelection,
	selectionMode: 'single' | 'multiple' | 'range',
	hover: PickerDate | null,
	focus: PickerDate | null,
	today: PickerDate,
	key: (date: PickerDate) => number,
) {
	const range = selectionMode === 'range';
	const start = range && sameDay(selection.start, date);
	const end = range && sameDay(selection.end, date);
	const index = key(date);
	const startIndex = range && selection.start ? key(selection.start) : null;
	const endIndex = range && selection.end ? key(selection.end) : null;
	const hoverIndex = range && hover ? key(hover) : null;
	const rangeLimit = endIndex ?? hoverIndex;
	const rangeLow = startIndex !== null && rangeLimit !== null ? Math.min(startIndex, rangeLimit) : null;
	const rangeHigh = startIndex !== null && rangeLimit !== null ? Math.max(startIndex, rangeLimit) : null;
	return {
		rangeBefore: rangeLow !== null && rangeHigh !== null && index > rangeLow && index <= rangeHigh,
		rangeAfter: rangeLow !== null && rangeHigh !== null && index >= rangeLow && index < rangeHigh,
		rangePreview: endIndex === null && hoverIndex !== null,
		previewEnd: range && endIndex === null && !start && sameDay(hover, date),
		selected:
			selectionMode === 'multiple'
				? selection.multiple.some((item) => sameDay(item, date))
				: range
					? start || end
					: sameDay(selection.single, date),
		start,
		end,
		inRange: startIndex !== null && endIndex !== null && index > startIndex && index < endIndex,
		inHover:
			startIndex !== null &&
			endIndex === null &&
			hoverIndex !== null &&
			index > Math.min(startIndex, hoverIndex) &&
			index < Math.max(startIndex, hoverIndex),
		focused: sameDay(focus, date),
		today: sameDay(today, date),
	};
}
