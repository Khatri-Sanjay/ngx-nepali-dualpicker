import type { DateObj } from '../../core/models/calendar-date.model';
import type { CalendarSystem } from '../../core/models/calendar-system.model';
import { fromDayIndex, getDayIndex } from '../../core/calendar/calendar-operations';
import type { RangeConstraints } from './datepicker-options.model';

/** One policy for grid clicks, typed input, presets and Angular validators. */
export function getRangeConstraintError(
	start: DateObj,
	end: DateObj,
	calendar: CalendarSystem,
	constraints: RangeConstraints,
	isSelectable: (date: DateObj) => boolean,
): { reason: string; actual?: number; min?: number; max?: number } | null {
	const first = getDayIndex(start, calendar),
		last = getDayIndex(end, calendar);
	const { minDays, maxDays } = constraints;
	if (
		(minDays !== undefined && (!Number.isInteger(minDays) || minDays < 1)) ||
		(maxDays !== undefined && (!Number.isInteger(maxDays) || maxDays < 1)) ||
		(minDays !== undefined && maxDays !== undefined && minDays > maxDays)
	)
		return { reason: 'configuration' };
	if (last < first) return { reason: 'order' };
	const actual = last - first + 1;
	if (minDays !== undefined && actual < minDays) return { reason: 'minDays', actual, min: minDays };
	if (maxDays !== undefined && actual > maxDays) return { reason: 'maxDays', actual, max: maxDays };
	if (constraints.preventCrossingUnavailableDates) {
		for (let index = first; index <= last; index++) {
			if (!isSelectable(fromDayIndex(index, calendar))) return { reason: 'unavailable' };
		}
	}
	return null;
}
