import type { CalendarCell } from './calendar-cell.model';
import type { getCalendarDayState } from '../../state/calendar-day-state';
import { toNepaliNumerals } from '../../../core/locale/convert-numerals';

interface CalendarCellDetails {
	readonly state: ReturnType<typeof getCalendarDayState>;
	readonly selectable: boolean;
	readonly language: 'en' | 'ne';
	readonly accessibleLabel: string;
}

/** Map domain state to labels and CSS without Angular or DOM dependencies. */
export function createCalendarCell(day: number | null, describe: (day: number) => CalendarCellDetails): CalendarCell {
	if (day === null) {
		return { day, label: '', accessibleLabel: '', selectable: false, selected: false, today: false, classes: {} };
	}
	const { state, selectable, language, accessibleLabel } = describe(day);
	return {
		day,
		label: language === 'ne' ? toNepaliNumerals(day) : String(day),
		accessibleLabel,
		selectable,
		selected: state.selected,
		today: state.today,
		classes: {
			'datepicker__date--range-before': state.rangeBefore,
			'datepicker__date--range-after': state.rangeAfter,
			'datepicker__date--range-preview': state.rangePreview,
			'datepicker__date--preview-end': state.previewEnd,
			'datepicker__date--active': state.selected,
			'datepicker__date--disabled': !selectable,
			'datepicker__date--focused': state.focused,
			'datepicker__date--range-start': state.start,
			'datepicker__date--range-end': state.end,
			'datepicker__date--in-range': state.inRange,
			'datepicker__date--range-hover': state.inHover,
			'datepicker__date--current-day': state.today,
		},
	};
}
