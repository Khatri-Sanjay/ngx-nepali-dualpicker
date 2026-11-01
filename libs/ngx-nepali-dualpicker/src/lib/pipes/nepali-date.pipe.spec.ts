import { NepaliDatePipe } from './nepali-date.pipe';

describe('NepaliDatePipe', () => {
	const pipe = new NepaliDatePipe();

	it('formats BS dates without validating the BS year as an AD year', () => {
		expect(() => pipe.transform('2139-01-01', 'fullDate', 'en', 'BS')).not.toThrow();
		expect(pipe.transform('2000-01-01', 'EEEE', 'en', 'BS')).toBe('Wednesday');
		expect(pipe.transform('2080-10-01', 'EEEE', 'en', 'BS')).toBe('Monday');
	});
	it('uses full localized weekday names and predictable empty results for invalid dates', () => {
		expect(pipe.transform('2024-01-15', 'EEEE', 'ne', 'AD')).toBe('सोमबार');
		expect(pipe.transform('2024-02-30', 'yyyy-MM-dd', 'en', 'AD')).toBe('');
		expect(pipe.transform(new Date(NaN), 'fullDate', 'en', 'AD')).toBe('');
		expect(pipe.transform(null)).toBe('');
		expect(pipe.transform('2024-01/15', 'yyyy-MM-dd', 'en', 'AD')).toBe('');
		expect(pipe.transform('2024-01-15Tgarbage', 'yyyy-MM-dd', 'en', 'AD')).toBe('');
		expect(pipe.transform('2024-01-15T12:30:00Z', 'yyyy-MM-dd', 'en', 'AD')).toBe('2024-01-15');
		expect(pipe.transform(undefined)).toBe('');
		expect(pipe.transform(new Date(2024, 0, 15), 'yyyy-MM-dd', 'en', 'AD')).toBe('2024-01-15');
	});

	it('replaces tokens once without changing month names', () => {
		expect(pipe.transform('2024-03-05', 'MMMM dd, yyyy', 'en', 'AD')).toBe('March 05, 2024');
		expect(pipe.transform('2024-01-15', 'yyyy-MM-dd', 'en', 'AD')).toBe('2024-01-15');
	});
});
