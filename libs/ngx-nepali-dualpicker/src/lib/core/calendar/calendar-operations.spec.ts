import { fromDayIndex, getDayIndex, getMonthGrid, getCalendarWeekday, shiftCalendarMonth } from './calendar-operations';

describe('Calendar views and navigation', () => {
	it('builds complete row-major weeks for a leap month with either week start', () => {
		for (const start of [0, 1, 6]) {
			const rows = getMonthGrid(2024, 2, 'AD', start);
			expect(rows.every((row) => row.length === 7)).toBeTrue();
			expect(rows.flat().filter((day) => day !== null)).toEqual(Array.from({ length: 29 }, (_, i) => i + 1));
		}
	});
	it('clamps month arithmetic and both calendar navigation endpoints', () => {
		expect(shiftCalendarMonth({ year: 2024, month: 1, day: 31 }, 1, 'AD')).toEqual({
			year: 2024,
			month: 2,
			day: 29,
		});
		expect(fromDayIndex(-1, 'BS')).toEqual({ year: 2000, month: 1, day: 1 });
		const terminal = fromDayIndex(Number.MAX_SAFE_INTEGER, 'AD');
		expect(terminal).toEqual({ year: 2082, month: 12, day: 31 });
		expect(fromDayIndex(getDayIndex(terminal, 'AD') + 1, 'AD')).toEqual(terminal);
	});
	it('calculates BS weekdays beyond the Gregorian conversion range', () => {
		expect(getCalendarWeekday({ year: 2000, month: 1, day: 1 }, 'BS')).toBe(3);
		expect(getMonthGrid(2139, 12, 'BS', 0).flat().filter(Boolean).length).toBeGreaterThan(28);
	});
});
