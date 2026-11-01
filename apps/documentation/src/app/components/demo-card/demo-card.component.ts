import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DateConversionService, NgxNepaliDualpicker } from 'ngx-nepali-dualpicker';
import type { CalendarSystem, DatePickerConfig, DatePickerValue, PresetThemeName } from 'ngx-nepali-dualpicker';
import type { PickerExample } from '../../../../../shared/content/picker-examples';
import { CodeBlockComponent } from '../../../../../shared/components/code-block/code-block.component';
import { parsePlaygroundConfig } from '../../../../../shared/configuration/parse-picker-config';
import { pickerThemeOptions } from '../../../../../shared/content/picker-themes';

@Component({
	selector: 'app-demo-card',
	standalone: true,
	imports: [CommonModule, FormsModule, NgxNepaliDualpicker, CodeBlockComponent],
	templateUrl: './demo-card.component.html',
	styleUrl: './demo-card.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoCardComponent {
	readonly themeOptions = pickerThemeOptions;
	@Input({ required: true }) set example(value: PickerExample) {
		this.definition = value;
		this.config.set({ ...value.config });
		this.value.set(value.initial);
		this.initialValue.set(value.initial);
		this.calendar.set(value.config.calendar ?? 'BS');
		this.draft.set(JSON.stringify(value.config, null, 2));
	}
	definition!: PickerExample;
	readonly config = signal<DatePickerConfig>({});
	readonly value = signal<DatePickerValue>(null);
	readonly initialValue = signal<DatePickerValue>(null);
	readonly calendar = signal<CalendarSystem>('BS');
	readonly tab = signal<'preview' | 'typescript' | 'html'>('preview');
	readonly error = signal('');
	readonly events = signal<string[]>([]);
	readonly draft = signal('');
	readonly configError = signal('');
	readonly narrow = signal(false);
	readonly previewDark = signal(false);
	applyConfiguration(): void {
		try {
			const config = parsePlaygroundConfig(this.draft());
			this.config.set(config);
			this.calendar.set(config.calendar ?? 'BS');
			this.configError.set('');
			this.value.set(null);
			this.initialValue.set(null);
		} catch (error) {
			this.configError.set(error instanceof Error ? error.message : 'Invalid configuration');
		}
	}
	reset(): void {
		this.config.set({ ...this.definition.config });
		this.draft.set(JSON.stringify(this.definition.config, null, 2));
		this.value.set(this.definition.initial);
		this.initialValue.set(this.definition.initial);
		this.calendar.set(this.definition.config.calendar ?? 'BS');
		this.events.set([]);
		this.error.set('');
		this.configError.set('');
		this.narrow.set(false);
		this.previewDark.set(false);
	}
	togglePreviewTheme(): void {
		this.previewDark.update((value) => !value);
		this.config.update((config) => ({ ...config, theme: this.previewDark() ? 'dark' : 'light' }));
		this.draft.set(JSON.stringify(this.config(), null, 2));
	}
	private readonly conversion = inject(DateConversionService);
	get html(): string {
		return '<ngx-nepali-dualpicker\n  [config]="config"\n  [(ngModel)]="value"\n  (dateSelected)="onSelected($event)"\n  (calendarTypeChanged)="calendar = $event"\n  (parseError)="error = $event.message"\n/>\n<pre>{{ value | json }}</pre>\n<p>{{ error }}</p>';
	}
	get typescript(): string {
		return `import { CommonModule } from '@angular/common';\nimport { Component } from '@angular/core';\nimport { FormsModule } from '@angular/forms';\nimport { NgxNepaliDualpicker } from 'ngx-nepali-dualpicker';\nimport type { CalendarSystem, DatePickerConfig, DatePickerValue } from 'ngx-nepali-dualpicker';\n\n@Component({\n  selector: 'app-picker-example',\n  standalone: true,\n  imports: [CommonModule, FormsModule, NgxNepaliDualpicker],\n  templateUrl: './picker-example.html',\n})\nexport class PickerExampleComponent {\n  config: DatePickerConfig = ${JSON.stringify(this.config(), null, 2)};\n  value: DatePickerValue = ${JSON.stringify(this.initialValue())};\n  calendar: CalendarSystem = '${this.config().calendar ?? 'BS'}';\n  error = '';\n  onSelected(value: DatePickerValue): void {\n    this.value = value;\n  }\n}`;
	}
	record(message: string): void {
		this.events.update((items) => [message, ...items].slice(0, 4));
	}
	selected(value: DatePickerValue): void {
		this.value.set(value);
		this.error.set('');
		this.record(`dateSelected: ${JSON.stringify(value)}`);
	}
	changeCalendar(calendar: CalendarSystem): void {
		this.calendar.set(calendar);
		this.record(`calendarTypeChanged: ${calendar}`);
	}
	changeLocale(event: Event): void {
		if (!(event.target instanceof HTMLSelectElement)) return;
		const language = event.target.value === 'ne' ? 'ne' : 'en';
		this.config.update((config) => ({ ...config, language }));
	}
	changeTheme(event: Event): void {
		if (!(event.target instanceof HTMLSelectElement)) return;
		const selected = event.target.value;
		if (selected === 'custom')
			this.config.update((config) => ({
				...config,
				theme: 'light',
				customTheme: {
					colors: {
						primary: '#0d947d',
						selectedBackground: '#0d947d',
						primaryHover: '#087661',
						todayText: '#0d947d',
					},
				},
			}));
		else if (selected === 'system' || pickerThemeOptions.some((option) => option.value === selected)) {
			const theme = selected as PresetThemeName | 'system';
			this.config.update((config) => ({ ...config, theme, customTheme: {} }));
		}
	}
	representation(target: CalendarSystem): string {
		const value = this.value();
		if (typeof value !== 'string' || !value) return 'Select a date';
		try {
			return this.calendar() === target
				? value
				: String(
						target === 'AD'
							? this.conversion.convertBsToAd(value, true)
							: this.conversion.convertAdToBs(value, true),
					);
		} catch {
			return 'Outside the conversion range';
		}
	}
}
