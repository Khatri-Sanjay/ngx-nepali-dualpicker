export type CalendarKeyboardCommand =
	| { readonly type: 'days'; readonly offset: number }
	| { readonly type: 'months'; readonly offset: number }
	| { readonly type: 'boundary'; readonly end: boolean; readonly year: boolean; readonly week?: boolean }
	| { readonly type: 'calendar'; readonly calendar: 'BS' | 'AD' }
	| { readonly type: 'select' | 'dismiss' | 'today' };

export function getCalendarKeyboardCommand(event: {
	key: string;
	shiftKey?: boolean;
	ctrlKey?: boolean;
	metaKey?: boolean;
}): CalendarKeyboardCommand | null {
	const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
	if (Object.hasOwn(offsets, event.key)) return { type: 'days', offset: offsets[event.key] };
	switch (event.key) {
		case 'Enter':
		case ' ':
			return { type: 'select' };
		case 'Escape':
			return { type: 'dismiss' };
		case 'PageUp':
		case 'PageDown':
			return { type: 'months', offset: (event.key === 'PageUp' ? -1 : 1) * (event.shiftKey ? 12 : 1) };
		case 'Home':
		case 'End':
			return {
				type: 'boundary',
				end: event.key === 'End',
				year: !!(event.ctrlKey || event.metaKey),
				week: !(event.ctrlKey || event.metaKey),
			};
		case 't':
		case 'T':
			return { type: 'today' };
		case 'b':
		case 'B':
			return { type: 'calendar', calendar: 'BS' };
		case 'a':
		case 'A':
			return { type: 'calendar', calendar: 'AD' };
		default:
			return null;
	}
}
