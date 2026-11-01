import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EDITABLE_DATE_FORMATS, NgxNepaliDualpicker } from 'ngx-nepali-dualpicker';
import type { CalendarSystem, DatePickerConfig, DatePickerValue } from 'ngx-nepali-dualpicker';
import { CodeBlockComponent } from '../../../../../shared/components/code-block/code-block.component';
import { BookingDemoComponent } from './booking-demo/booking-demo.component';
import { examples } from '../../../../../shared/content/picker-examples';
import { pickerThemeOptions } from '../../../../../shared/content/picker-themes';
import { parsePlaygroundConfig } from '../../../../../shared/configuration/parse-picker-config';
import { DateParser, formatPickerDate } from 'ngx-nepali-dualpicker/core';

const initialConfig: DatePickerConfig = {
	calendar: 'BS',
	language: 'en',
	selectionMode: 'single',
	theme: 'light',
	inline: true,
	convertOnCalendarChange: true,
	closeOnSelection: false,
	firstDayOfWeek: 0,
	showTodayButton: true,
	showClearButton: true,
	readOnly: false,
	allowTextInput: false,
	showSecondaryDate: false,
	displayFormat: 'yyyy-MM-dd',
	outputFormat: 'yyyy-MM-dd',
	popupPosition: 'auto',
	mobilePresentation: 'bottom-sheet',
	validation: { enabled: false, requireCompleteRange: true },
	multipleSelection: { maxSelections: 3 },
};

@Component({
	selector: 'app-playground',
	standalone: true,
	imports: [
		JsonPipe,
		FormsModule,
		ReactiveFormsModule,
		NgxNepaliDualpicker,
		CodeBlockComponent,
		BookingDemoComponent,
	],
	templateUrl: './playground.component.html',
	styleUrl: './playground.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaygroundComponent {
	readonly themeOptions = pickerThemeOptions;
	readonly examples = examples;
	readonly formats = EDITABLE_DATE_FORMATS;
	readonly config = signal<DatePickerConfig>({ ...initialConfig });
	readonly control = new FormControl<DatePickerValue>(null);
	readonly value = toSignal(this.control.valueChanges, { initialValue: this.control.value });
	readonly status = toSignal(this.control.statusChanges, { initialValue: this.control.status });
	readonly events = signal<string[]>([]);
	readonly error = signal('');
	readonly preset = signal('custom');
	readonly previewRevision = signal(0);
	readonly disabled = computed(() => this.status() === 'DISABLED');
	readonly codeTab = signal<'typescript' | 'html' | 'config'>('typescript');
	readonly configCode = computed(() => JSON.stringify(this.config(), null, 2));
	readonly themeName = computed(() =>
		typeof this.config().theme === 'object' ? 'custom' : (this.config().theme ?? 'light'),
	);
	readonly editorDraft = signal(JSON.stringify(initialConfig, null, 2));
	readonly editorError = signal('');
	readonly editorOpen = signal(true);
	readonly settingsExpanded = signal(false);

	get html(): string {
		return '<ngx-nepali-dualpicker [config]="config" [formControl]="date" />';
	}

	get typescript(): string {
		return `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgxNepaliDualpicker } from 'ngx-nepali-dualpicker';
import type { DatePickerConfig, DatePickerValue } from 'ngx-nepali-dualpicker';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ReactiveFormsModule, NgxNepaliDualpicker],
  template: \`${this.html}\`,
})
export class ExampleComponent {
  config: DatePickerConfig = ${this.configCode()};
  date = new FormControl<DatePickerValue>(${JSON.stringify(this.value())});
${this.disabled() ? '\n  constructor() { this.date.disable(); }\n' : ''}}`;
	}

	update(patch: Partial<DatePickerConfig>): void {
		this.applyConfig({ ...this.config(), ...patch });
		this.syncEditor();
	}

	private applyConfig(next: DatePickerConfig): void {
		const previous = this.config();
		const incompatible =
			next.selectionMode !== previous.selectionMode ||
			next.calendar !== previous.calendar ||
			next.outputFormat !== previous.outputFormat;
		this.preset.set('custom');
		this.error.set('');
		if (incompatible) {
			this.clear();
		}
		this.config.set(next);
	}

	editConfig(source: string): void {
		this.editorDraft.set(source);
		try {
			const parsed = parsePlaygroundConfig(source);
			this.applyConfig({ ...initialConfig, ...parsed });
			this.editorError.set('');
		} catch (error) {
			this.editorError.set(error instanceof Error ? error.message : 'Enter a valid JSON configuration.');
		}
	}

	syncEditor(): void {
		this.editorDraft.set(this.configCode());
		this.editorError.set('');
	}

	calendarChanged(calendar: CalendarSystem): void {
		this.config.update((current) => ({
			...current,
			calendar,
			minDate: null,
			maxDate: null,
			disabledDates: [],
		}));
		this.preset.set('custom');
		this.syncEditor();
		this.record(`calendarTypeChanged: ${calendar}`);
	}

	updateRange(patch: NonNullable<DatePickerConfig['rangeConstraints']>): void {
		const rangeConstraints = { ...this.config().rangeConstraints, ...patch };
		try {
			parsePlaygroundConfig(JSON.stringify({ rangeConstraints }));
			this.update({ rangeConstraints });
		} catch (error) {
			this.error.set(error instanceof Error ? error.message : 'Check the range limits.');
		}
	}

	updateMultiple(maxSelections: number | null): void {
		try {
			const multipleSelection = maxSelections === null ? {} : { maxSelections };
			parsePlaygroundConfig(JSON.stringify({ multipleSelection }));
			this.update({ multipleSelection });
		} catch (error) {
			this.error.set(error instanceof Error ? error.message : 'Use a positive whole number.');
		}
	}

	updateBound(key: 'minDate' | 'maxDate', value: string): void {
		const next = { ...this.config(), [key]: value || null };
		try {
			parsePlaygroundConfig(JSON.stringify(next));
			this.update({ [key]: value || null });
			this.error.set('');
		} catch (error) {
			this.error.set(error instanceof Error ? error.message : 'Check the date bounds.');
		}
	}

	boundText(value: DatePickerConfig['minDate']): string {
		if (!value) return '';
		return typeof value === 'string' ? value : formatPickerDate(DateParser.parseToDateObj(value), 'yyyy-MM-dd');
	}

	loadPreset(id: string): void {
		const example = examples.find((item) => item.id === id);
		if (!example) return;
		this.clear();
		this.preset.set(id);
		this.config.set({ ...initialConfig, ...example.config });
		// A preset supplies a value in its own calendar. Start a new adapter so it
		// cannot interpret that value using the previous preset's calendar.
		this.previewRevision.update((revision) => revision + 1);
		this.control.setValue(example.initial);
		this.syncEditor();
	}

	setDisabled(disabled: boolean): void {
		if (disabled) this.control.disable();
		else this.control.enable();
	}
	setReadonly(readOnly: boolean): void {
		this.update({ readOnly });
	}

	clear(): void {
		this.control.reset(null);
		this.error.set('');
		this.events.set([]);
	}

	reset(): void {
		this.setDisabled(false);
		this.config.set({ ...initialConfig });
		this.preset.set('custom');
		this.clear();
		this.syncEditor();
	}

	selected(value: DatePickerValue, selectionMode?: DatePickerConfig['selectionMode']): void {
		if (selectionMode && selectionMode !== this.config().selectionMode) {
			this.config.update((current) => ({ ...current, selectionMode }));
			this.preset.set('custom');
			this.syncEditor();
		}
		this.error.set('');
		this.record(`dateSelected: ${JSON.stringify(value)}`);
	}

	record(message: string): void {
		this.events.update((items) => [message, ...items].slice(0, 8));
	}
}
