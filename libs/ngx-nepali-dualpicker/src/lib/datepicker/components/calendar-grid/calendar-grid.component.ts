import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	Output,
	inject,
	TemplateRef,
} from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import type { DateCellContext } from '../../state/datepicker-options.model';
import { CalendarKeyboardCommand, getCalendarKeyboardCommand } from '../../keyboard/calendar-keyboard';

import type { CalendarCell } from './calendar-cell.model';
@Component({
	selector: 'ndp-calendar-grid',
	standalone: true,
	imports: [NgClass, NgTemplateOutlet],
	templateUrl: './calendar-grid.component.html',
	styleUrl: './calendar-grid.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarGridComponent {
	@Input() cellTemplate: TemplateRef<DateCellContext> | null = null;
	@Input() rows: readonly (readonly CalendarCell[])[] = [];
	@Input() weekdays: readonly string[] = [];
	@Input() weekdayLabels: readonly string[] = [];
	@Input() labelledBy = '';
	@Input() readOnly = false;
	@Input() multiselectable = false;
	@Input() focusedDay = 1;
	@Input() disabled = false;
	@Input() label = '';
	@Output() daySelected = new EventEmitter<number>();
	@Output() dayHovered = new EventEmitter<number | null>();
	@Output() dayFocused = new EventEmitter<number>();
	@Output() navigate = new EventEmitter<CalendarKeyboardCommand>();
	private element = inject<ElementRef<HTMLElement>>(ElementRef);
	select(cell: CalendarCell): void {
		if (!this.disabled && !this.readOnly && cell.selectable && cell.day !== null) this.daySelected.emit(cell.day);
	}
	onKey(event: KeyboardEvent): void {
		if (this.disabled) return;
		const command = getCalendarKeyboardCommand(event);
		if (command) {
			event.preventDefault();
			event.stopPropagation();
			this.navigate.emit(command);
		}
	}
	focusDay(day: number): void {
		this.element.nativeElement.querySelector<HTMLElement>('[data-calendar-day="' + day + '"]')?.focus();
	}
}
