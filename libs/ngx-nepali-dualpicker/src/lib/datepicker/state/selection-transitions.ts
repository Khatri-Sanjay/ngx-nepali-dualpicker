/** Policies are supplied by the calendar adapter; this engine owns no Angular state. */
export interface SelectionPolicy<T> {
	readonly key: (value: T) => number;
	readonly isSelectable: (value: T) => boolean;
	readonly maxSelections?: number;
	readonly isRangeSelectable?: (start: T, end: T) => boolean;
}

export interface RangeSelection<T> {
	readonly start: T | null;
	readonly end: T | null;
}

/** Keep first-occurrence order; filter restricted dates, deduplicate, then apply the limit. */
export function normalizeMultipleSelection<T>(values: readonly T[], policy: SelectionPolicy<T>): T[] {
	const unique = new Map<number, T>();
	for (const value of values) {
		if (policy.isSelectable(value) && !unique.has(policy.key(value))) unique.set(policy.key(value), value);
	}
	const max = policy.maxSelections;
	const limit = max === undefined ? unique.size : Number.isInteger(max) && max >= 0 ? max : 0;
	return [...unique.values()].slice(0, limit);
}

export function toggleMultipleSelection<T>(values: readonly T[], value: T, policy: SelectionPolicy<T>): T[] {
	const current = normalizeMultipleSelection(values, policy);
	const key = policy.key(value);
	return current.some((item) => policy.key(item) === key)
		? current.filter((item) => policy.key(item) !== key)
		: normalizeMultipleSelection([...current, value], policy);
}

/** Reject an orphan end; preserve a valid partial start; order complete endpoints. */
export function normalizeRangeSelection<T>(range: RangeSelection<T>, policy: SelectionPolicy<T>): RangeSelection<T> {
	if (range.start === null || !policy.isSelectable(range.start)) return { start: null, end: null };
	if (range.end === null || !policy.isSelectable(range.end)) return { start: range.start, end: null };
	const ordered =
		policy.key(range.start) <= policy.key(range.end)
			? { start: range.start, end: range.end }
			: { start: range.end, end: range.start };
	return policy.isRangeSelectable && !policy.isRangeSelectable(ordered.start, ordered.end)
		? { start: range.start, end: null }
		: ordered;
}

export function selectRangeEndpoint<T>(
	range: RangeSelection<T>,
	value: T,
	policy: SelectionPolicy<T>,
): RangeSelection<T> {
	if (!policy.isSelectable(value)) return normalizeRangeSelection(range, policy);
	const current = normalizeRangeSelection(range, policy);
	return current.start === null || current.end !== null
		? { start: value, end: null }
		: normalizeRangeSelection({ start: current.start, end: value }, policy);
}
