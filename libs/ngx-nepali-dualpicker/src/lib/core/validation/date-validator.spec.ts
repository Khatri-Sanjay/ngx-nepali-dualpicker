import { DateValidator } from './date-validator';

describe('date-validator', () => {
	it('rejects non-finite and fractional date fields', () => {
		for (const value of [NaN, Infinity, 1.5]) {
			expect(DateValidator.isValidAdDate({ year: 2024, month: 1, day: value })).toBeFalse();
			expect(DateValidator.isValidBsDate({ year: 2080, month: 1, day: value })).toBeFalse();
		}
	});
});
