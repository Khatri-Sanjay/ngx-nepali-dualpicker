import { Directive, TemplateRef, inject } from '@angular/core';
import type { DateCellContext } from '../../state/datepicker-options.model';

@Directive({ selector: 'ng-template[ndpDateCell]', standalone: true })
export class DateCellTemplateDirective {
	readonly template = inject<TemplateRef<DateCellContext>>(TemplateRef);
	static ngTemplateContextGuard(
		_directive: DateCellTemplateDirective,
		_context: unknown,
	): _context is DateCellContext {
		return true;
	}
}
