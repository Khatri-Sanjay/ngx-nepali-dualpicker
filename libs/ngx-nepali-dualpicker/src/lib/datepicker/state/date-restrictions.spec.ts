import { compileDateRestrictions } from './date-restrictions';

describe('Compiled date restrictions', () => {
	it('applies inclusive bounds, disabled lists and weekdays without mutating inputs', () => {
		const dates = ['2024-01-16'];
		const policy = compileDateRestrictions(
			{ minDate: '2024-01-15', maxDate: '2024-01-20', disabledDates: dates, disabledDaysOfWeek: [6] },
			'AD',
			{ year: 2024, month: 1, day: 15 },
		);
		expect(policy.isSelectable({ year: 2024, month: 1, day: 15 })).toBeTrue();
		for (const day of [14, 16, 20, 21]) expect(policy.isSelectable({ year: 2024, month: 1, day })).toBeFalse();
		expect(dates).toEqual(['2024-01-16']);
	});
	it('adapts JavaScript bounds to BS and preserves the invalid-config-entry policy', () => {
		const policy = compileDateRestrictions({ minDate: new Date(2024, 0, 15), disabledDates: ['invalid'] }, 'BS', {
			year: 2080,
			month: 10,
			day: 1,
		});
		expect(policy.min).toEqual({ year: 2080, month: 10, day: 1 });
		expect(policy.isSelectable({ year: 2080, month: 9, day: 29 })).toBeFalse();
		expect(policy.isSelectable({ year: 2080, month: 10, day: 1 })).toBeTrue();
	});
});
