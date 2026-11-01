import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NepaliDatePipe, NgxNepaliDualpicker } from 'ngx-nepali-dualpicker';
import type { DatePickerConfig, DatePickerValue } from 'ngx-nepali-dualpicker';
import { CodeBlockComponent } from '../../../../../shared/components/code-block/code-block.component';

@Component({
	selector: 'app-formatting-example',
	standalone: true,
	imports: [FormsModule, NepaliDatePipe, NgxNepaliDualpicker, CodeBlockComponent],
	template: `<section class="widget">
			<h3>Picker format explorer</h3>
			<label
				>Display format<select [ngModel]="display" (ngModelChange)="setDisplay($event)">
					@for (format of displayFormats; track format) {
						<option [value]="format">{{ format }}</option>
					}
				</select></label
			><label
				>Output format<select [ngModel]="output" (ngModelChange)="setOutput($event)">
					@for (format of outputFormats; track format) {
						<option [value]="format">{{ format }}</option>
					}
				</select></label
			>
			@for (settings of [config]; track settings) {
				<ngx-nepali-dualpicker [config]="settings" (dateSelected)="value = $event" />
			}
			<output>{{ value }}</output
			><app-code-block [code]="code" />
		</section>
		<section class="widget">
			<h3>Public date pipe</h3>
			<label
				>Locale<select [(ngModel)]="locale">
					<option value="en">English</option>
					<option value="ne">नेपाली</option>
				</select></label
			>
			<p>BS date: 2080-10-01</p>
			@for (format of pipeFormats; track format) {
				<div class="format-row">
					<code>{{ format }}</code
					><strong>{{ '2080-10-01' | nepaliDate: format : locale : 'BS' }}</strong>
				</div>
			}
			<app-code-block [code]="pipeCode" language="HTML" />
		</section>`,
	styleUrl: '../../styles/example-widgets.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormattingExampleComponent {
	readonly outputFormats = ['yyyy-MM-dd', 'yyyy/MM/dd', 'MM/dd/yyyy', 'dd/MM/yyyy', 'dd-MM-yyyy'] as const;
	readonly displayFormats = [...this.outputFormats, 'MMM dd, yyyy'] as const;
	readonly pipeFormats = [
		'shortDate',
		'mediumDate',
		'longDate',
		'fullDate',
		'yyyy-MM-dd',
		'yyyy/MM/dd',
		'MM/dd/yyyy',
		'dd/MM/yyyy',
		'dd-MM-yyyy',
		'MMM dd, yyyy',
		'MMMM d, yyyy',
		'EEEE',
		'EEE',
		'yy-M-d',
	];
	display: NonNullable<DatePickerConfig['displayFormat']> = 'yyyy-MM-dd';
	output: NonNullable<DatePickerConfig['outputFormat']> = 'yyyy-MM-dd';
	config: DatePickerConfig = { calendar: 'BS', displayFormat: this.display, outputFormat: this.output };
	value: DatePickerValue = null;
	locale: 'en' | 'ne' = 'en';
	readonly pipeCode = `<!-- Import NepaliDatePipe in component imports. -->\n{{ '2080-10-01' | nepaliDate:'MMMM d, yyyy':'ne':'BS' }}`;
	get code(): string {
		return `const config: DatePickerConfig = ${JSON.stringify(this.config, null, 2)};`;
	}
	setDisplay(value: NonNullable<DatePickerConfig['displayFormat']>): void {
		this.display = value;
		this.update();
	}
	setOutput(value: NonNullable<DatePickerConfig['outputFormat']>): void {
		this.output = value;
		this.update();
	}
	private update(): void {
		this.config = { calendar: 'BS', displayFormat: this.display, outputFormat: this.output };
		this.value = null;
	}
}
