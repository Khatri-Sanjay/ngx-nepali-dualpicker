import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxNepaliDualpicker, DateCellTemplateDirective } from 'ngx-nepali-dualpicker';
import type { DatePickerConfig, DatePickerValue, DatePresetContext } from 'ngx-nepali-dualpicker';
import { DateCalculator, formatPickerDate } from 'ngx-nepali-dualpicker/core';

function monthPreset(context: DatePresetContext, offset: number): DatePickerValue {
	const ordinal = context.today.year * 12 + context.today.month - 1 + offset;
	const year = Math.floor(ordinal / 12),
		month = (((ordinal % 12) + 12) % 12) + 1;
	const day =
		context.calendar === 'BS'
			? DateCalculator.getDaysInBsMonth(year, month)
			: DateCalculator.getDaysInAdMonth(year, month);
	return {
		start: formatPickerDate({ year, month, day: 1 }, context.outputFormat),
		end: formatPickerDate({ year, month, day }, context.outputFormat),
	};
}

@Component({
	selector: 'app-booking-demo',
	standalone: true,
	imports: [JsonPipe, FormsModule, ReactiveFormsModule, NgxNepaliDualpicker, DateCellTemplateDirective],
	templateUrl: './booking-demo.component.html',
	styleUrl: './booking-demo.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingDemoComponent {
	readonly booking = new FormControl<DatePickerValue>(null);
	readonly value = toSignal(this.booking.valueChanges, { initialValue: this.booking.value });
	readonly status = toSignal(this.booking.statusChanges, { initialValue: this.booking.status });
	readonly selectionError = signal('');
	readonly range = computed(() => {
		const value = this.value();
		return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
	});
	customCells = false;
	config: DatePickerConfig = {
		id: 'booking-demo',
		calendar: 'BS',
		inline: true,
		selectionMode: 'range',
		showSecondaryDate: true,
		closeOnSelection: false,
		validation: { enabled: true },
		dateFilter: (date) => date.day !== 10 && date.day !== 20,
		rangeConstraints: { minDays: 3, maxDays: 32 },
		presets: [
			{ label: 'This month', value: (context) => monthPreset(context, 0) },
			{ label: 'Last month', value: (context) => monthPreset(context, -1) },
		],
	};
	updateConfig(patch: Partial<DatePickerConfig>): void {
		this.selectionError.set('');
		this.config = { ...this.config, ...patch };
	}

	clearBooking(): void {
		this.booking.reset();
		this.selectionError.set('');
	}
}
