import { PickerDate } from './picker-date.adapter';
import type { PickerSelection } from './selection-state.model';
import { emptySelection } from './selection-state';
import { normalizeMultipleSelection, normalizeRangeSelection, SelectionPolicy } from './selection-transitions';

type Mode = 'single' | 'multiple' | 'range';
export interface SelectionInputError {
	readonly type: 'format' | 'validation' | 'limit';
	readonly message: string;
}
export type SelectionInputResult =
	| { readonly ok: true; readonly selection: PickerSelection }
	| { readonly ok: false; readonly error: SelectionInputError };

export function normalizePickerSelection(
	state: PickerSelection,
	selectionMode: Mode,
	policy: SelectionPolicy<PickerDate>,
): PickerSelection {
	const empty = emptySelection();
	if (selectionMode === 'single')
		return { ...empty, single: state.single && policy.isSelectable(state.single) ? state.single : null };
	if (selectionMode === 'multiple') return { ...empty, multiple: normalizeMultipleSelection(state.multiple, policy) };
	return { ...empty, ...normalizeRangeSelection({ start: state.start, end: state.end }, policy) };
}

/** One normalization boundary for forms and programmatic values. Malformed date parsing throws to the adapter. */
export function readSelectionValue(
	value: unknown,
	selectionMode: Mode,
	parse: (value: unknown) => PickerDate,
	policy: SelectionPolicy<PickerDate>,
): PickerSelection {
	const empty = emptySelection();
	if (value === null || value === undefined || value === '') return empty;
	if (selectionMode === 'single')
		return normalizePickerSelection({ ...empty, single: parse(value) }, selectionMode, policy);
	if (selectionMode === 'multiple')
		return normalizePickerSelection(
			{ ...empty, multiple: Array.isArray(value) ? value.map(parse) : [] },
			selectionMode,
			policy,
		);
	if (typeof value !== 'object' || !('start' in value)) return empty;
	return normalizePickerSelection(
		{
			...empty,
			start: value.start ? parse(value.start) : null,
			end: 'end' in value && value.end ? parse(value.end) : null,
		},
		selectionMode,
		policy,
	);
}

/** Parsing is transactional: errors preserve the old selection. Manual excess selections are reported, never silently truncated. */
export function readSelectionText(
	text: string,
	selectionMode: Mode,
	parse: (text: string) => PickerDate | null,
	policy: SelectionPolicy<PickerDate>,
): SelectionInputResult {
	if (!text.trim()) return { ok: true, selection: emptySelection() };
	const parts =
		selectionMode === 'multiple'
			? text.split(',').map((value) => value.trim())
			: selectionMode === 'range'
				? text.split(' - ').map((value) => value.trim())
				: [text.trim()];
	if (!parts.length || (selectionMode === 'range' && parts.length > 2))
		return { ok: false, error: { type: 'format', message: 'Invalid selection format.' } };
	const dates = parts.map(parse);
	if (dates.some((date) => !date))
		return { ok: false, error: { type: 'format', message: 'Date does not match the required format.' } };
	if (dates.some((date) => date && !policy.isSelectable(date)))
		return { ok: false, error: { type: 'validation', message: 'Invalid or unavailable date.' } };
	const valid = dates as PickerDate[];
	if (selectionMode === 'range' && valid.length === 2 && policy.isRangeSelectable) {
		const [start, end] = policy.key(valid[0]) <= policy.key(valid[1]) ? valid : [valid[1], valid[0]];
		if (!policy.isRangeSelectable(start, end))
			return {
				ok: false,
				error: { type: 'validation', message: 'Range violates duration or availability rules.' },
			};
	}
	const unique = normalizeMultipleSelection(valid, { ...policy, maxSelections: undefined });
	if (selectionMode === 'multiple' && policy.maxSelections !== undefined && unique.length > policy.maxSelections) {
		return { ok: false, error: { type: 'limit', message: `Maximum ${policy.maxSelections} dates allowed.` } };
	}
	const state =
		selectionMode === 'multiple'
			? { ...emptySelection(), multiple: unique }
			: selectionMode === 'range'
				? { ...emptySelection(), start: valid[0], end: valid[1] ?? null }
				: { ...emptySelection(), single: valid[0] };
	return { ok: true, selection: normalizePickerSelection(state, selectionMode, policy) };
}
