import {
	normalizeMultipleSelection,
	normalizeRangeSelection,
	selectRangeEndpoint,
	toggleMultipleSelection,
} from './selection-transitions';

describe('Selection transitions', () => {
	const policy = { key: (day: number) => day, isSelectable: (day: number) => day > 0, maxSelections: 2 };

	it('shares restrictions, duplicate handling and limits between writes and clicks', () => {
		expect(normalizeMultipleSelection([3, 3, -1, 2, 1], policy)).toEqual([3, 2]);
		expect(toggleMultipleSelection([3, 2], 1, policy)).toEqual([3, 2]);
		expect(toggleMultipleSelection([3, 2], 3, policy)).toEqual([2]);
		expect(normalizeMultipleSelection([1], { ...policy, maxSelections: 0 })).toEqual([]);
	});

	it('normalizes reversed, orphan, restricted, partial and same-day ranges', () => {
		expect(normalizeRangeSelection({ start: 3, end: 1 }, policy)).toEqual({ start: 1, end: 3 });
		expect(normalizeRangeSelection({ start: null, end: 1 }, policy)).toEqual({ start: null, end: null });
		expect(normalizeRangeSelection({ start: -1, end: 1 }, policy)).toEqual({ start: null, end: null });
		expect(normalizeRangeSelection({ start: 1, end: -1 }, policy)).toEqual({ start: 1, end: null });
		expect(selectRangeEndpoint({ start: 1, end: null }, 1, policy)).toEqual({ start: 1, end: 1 });
		expect(selectRangeEndpoint({ start: 1, end: 3 }, 2, policy)).toEqual({ start: 2, end: null });
	});
});
