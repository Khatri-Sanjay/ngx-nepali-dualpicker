import { readSelectionText, readSelectionValue } from './selection-values';
import { PickerDate } from './picker-date.adapter';

describe('Selection value boundaries', () => {
	const policy = {
		key: (date: PickerDate) => date.day,
		isSelectable: (date: PickerDate) => date.day > 0 && date.day < 30,
		maxSelections: 2,
	};
	const parse = (value: unknown): PickerDate => ({ year: 2024, month: 0, day: Number(value) });
	it('shares normalization across manual, form and programmatic representations', () => {
		const external = readSelectionValue({ start: 20, end: 10 }, 'range', parse, policy);
		const manual = readSelectionText('20 - 10', 'range', parse, policy);
		expect(manual.ok).toBeTrue();
		if (manual.ok) expect(manual.selection).toEqual(external);
		expect(
			readSelectionValue([10, 10, 12, 15], 'multiple', parse, policy).multiple.map((date) => date.day),
		).toEqual([10, 12]);
	});
	it('reports manual excess selections and rejects restricted endpoints transactionally', () => {
		const excessive = readSelectionText('10,12,15', 'multiple', parse, policy);
		expect(excessive.ok).toBeFalse();
		if (!excessive.ok) expect(excessive.error.type).toBe('limit');
		expect(readSelectionText('10 - 31', 'range', parse, policy).ok).toBeFalse();
		expect(readSelectionValue({ start: null, end: 10 }, 'range', parse, policy).end).toBeNull();
	});
});
