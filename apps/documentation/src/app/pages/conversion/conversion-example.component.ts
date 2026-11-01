import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DateConversionService } from 'ngx-nepali-dualpicker';
import { CodeBlockComponent } from '../../../../../shared/components/code-block/code-block.component';

@Component({
	selector: 'app-conversion-example',
	standalone: true,
	imports: [FormsModule, CodeBlockComponent],
	template: `<section class="widget">
		<h3>Calendar converter</h3>
		<form (ngSubmit)="convert()">
			<label
				>Direction<select name="direction" [(ngModel)]="direction">
					<option value="BS">BS → AD</option>
					<option value="AD">AD → BS</option>
				</select></label
			>
			<div class="fields">
				<label>Year<input name="year" type="number" [(ngModel)]="year" required /></label
				><label
					>Month (1–12)<input
						name="month"
						type="number"
						[(ngModel)]="month"
						min="1"
						max="12"
						required /></label
				><label>Day<input name="day" type="number" [(ngModel)]="day" min="1" max="32" required /></label>
			</div>
			<button type="submit">Convert date →</button><button type="button" (click)="today()">Use today</button>
		</form>
		<output aria-live="polite">{{ result() }}</output>
		@if (error()) {
			<p role="alert">{{ error() }}</p>
		}
		<app-code-block [code]="code" />
	</section>`,
	styleUrl: '../../styles/example-widgets.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversionExampleComponent {
	readonly service = inject(DateConversionService);
	direction: 'BS' | 'AD' = 'BS';
	year = 2080;
	month = 10;
	day = 1;
	readonly result = signal('AD 2024-01-15');
	readonly error = signal('');
	get code(): string {
		return `import { Component, inject } from '@angular/core';\nimport { DateConversionService } from 'ngx-nepali-dualpicker';\n\n@Component({ selector: 'app-converter', standalone: true,\n  template: '<button type="button" (click)="convert()">Convert</button><p>{{ result }}</p><p>{{ error }}</p>' })\nexport class ConverterComponent {\n  private readonly dates = inject(DateConversionService);\n  result = '';\n  error = '';\n  convert(): void {\n    try {\n      this.result = String(this.dates.${this.direction === 'BS' ? 'convertBsToAd' : 'convertAdToBs'}(\n        { year: ${this.year}, month: ${this.month}, day: ${this.day} }, true,\n      ));\n      this.error = '';\n    } catch (error) {\n      this.result = '';\n      this.error = error instanceof Error ? error.message : 'Invalid date';\n    }\n  }\n}`;
	}
	convert(): void {
		try {
			const input = { year: this.year, month: this.month, day: this.day };
			const result =
				this.direction === 'BS'
					? this.service.convertBsToAd(input, true)
					: this.service.convertAdToBs(input, true);
			this.result.set(`${this.direction === 'BS' ? 'AD' : 'BS'} ${result}`);
			this.error.set('');
		} catch (error) {
			this.result.set('');
			this.error.set(error instanceof Error ? error.message : 'Invalid date');
		}
	}
	today(): void {
		const now = new Date();
		const ad = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
		this.direction = 'AD';
		this.year = ad.year;
		this.month = ad.month;
		this.day = ad.day;
		this.convert();
	}
}
