import type { DateCellContext } from '../../state/datepicker-options.model';

export interface CalendarCell {
	readonly day: number | null;
	readonly label: string;
	readonly accessibleLabel: string;
	readonly selectable: boolean;
	readonly selected: boolean;
	readonly today: boolean;
	readonly classes: Readonly<Record<string, boolean>>;
	readonly context?: DateCellContext;
	readonly secondaryLabel?: string;
}
