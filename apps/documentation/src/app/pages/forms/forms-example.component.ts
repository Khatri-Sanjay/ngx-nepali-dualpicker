import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxNepaliDualpicker } from 'ngx-nepali-dualpicker';
import type { DatePickerConfig } from 'ngx-nepali-dualpicker';
import { CodeBlockComponent } from '../../../../../shared/components/code-block/code-block.component';

export const reactiveHtml = `<form [formGroup]="form" (ngSubmit)="submit()">
  <label>Date of appointment (required)</label>
  <ngx-nepali-dualpicker formControlName="date" [config]="config"
    [hasError]="form.controls.date.touched && form.controls.date.invalid" />
  <button type="button" (click)="toggleDisabled()">Toggle disabled</button>
  <button type="button" (click)="form.reset()">Reset</button>
  <button type="submit">Submit</button>
</form>
<pre>{{ form.getRawValue() | json }}</pre>
<p>Valid: {{ form.valid }} · Touched: {{ form.controls.date.touched }} · Disabled: {{ form.controls.date.disabled }}</p>
<pre>{{ submitted | json }}</pre>`;
export const modelHtml = `<form #modelForm="ngForm" (ngSubmit)="modelSubmitted = model">
  <label>Event date</label>
  <ngx-nepali-dualpicker name="eventDate" [(ngModel)]="model" [config]="config" />
  <button type="submit">Submit</button>
  <button type="button" (click)="modelForm.resetForm()">Reset</button>
</form>
<p>Selected: {{ model }}</p>
<p>Submitted: {{ modelSubmitted }}</p>`;
// Shared live/source templates are statically evaluated by Angular's template compiler.
const formsTemplate = `<section class="widget">
			<h3>Reactive form</h3>
			<p>Initial value: 2080-10-01. Clear, submit, reset and disable to inspect the control.</p>
			${reactiveHtml}<app-code-block [code]="reactiveCode" /><app-code-block
				[code]="reactiveTemplate"
				language="HTML"
			/>
		</section>
		<section class="widget">
			<h3>Template-driven form</h3>
			${modelHtml}<app-code-block [code]="modelCode" /><app-code-block [code]="modelTemplate" language="HTML" />
		</section>`;
@Component({
	selector: 'app-forms-example',
	standalone: true,
	imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxNepaliDualpicker, CodeBlockComponent],
	template: formsTemplate,
	styleUrl: '../../styles/example-widgets.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormsExampleComponent {
	readonly config: DatePickerConfig = {
		calendar: 'BS',
		outputFormat: 'yyyy-MM-dd',
		allowTextInput: true,
		validation: { enabled: true },
	};
	readonly form = new FormGroup({ date: new FormControl<string | null>('2080-10-01', Validators.required) });
	submitted: { date: string | null } | null = null;
	model: string | null = '2080-10-01';
	modelSubmitted: string | null = null;
	readonly reactiveTemplate = reactiveHtml;
	readonly modelTemplate = modelHtml;
	readonly reactiveCode = `import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxNepaliDualpicker } from 'ngx-nepali-dualpicker';
import type { DatePickerConfig } from 'ngx-nepali-dualpicker';
@Component({ selector: 'app-reactive-example', standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgxNepaliDualpicker],
  templateUrl: './reactive-example.html' })
export class ReactiveExampleComponent {
  config: DatePickerConfig = { calendar: 'BS', outputFormat: 'yyyy-MM-dd', allowTextInput: true, validation: { enabled: true } };
  form = new FormGroup({ date: new FormControl<string | null>('2080-10-01', Validators.required) });
  submitted: { date: string | null } | null = null;
  toggleDisabled(): void {
    const control = this.form.controls.date;
    if (control.disabled) control.enable(); else control.disable();
  }
  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.valid && this.form.enabled) this.submitted = this.form.getRawValue();
  }
}`;
	readonly modelCode = `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxNepaliDualpicker } from 'ngx-nepali-dualpicker';
import type { DatePickerConfig } from 'ngx-nepali-dualpicker';
@Component({ selector: 'app-model-example', standalone: true,
  imports: [FormsModule, NgxNepaliDualpicker], templateUrl: './model-example.html' })
export class ModelExampleComponent {
  config: DatePickerConfig = { calendar: 'BS', outputFormat: 'yyyy-MM-dd', allowTextInput: true, validation: { enabled: true } };
  model: string | null = '2080-10-01';
  modelSubmitted: string | null = null;
}`;
	toggleDisabled(): void {
		const control = this.form.controls.date;
		if (control.disabled) control.enable();
		else control.disable();
	}
	submit(): void {
		this.form.markAllAsTouched();
		if (this.form.valid && this.form.enabled) this.submitted = this.form.getRawValue();
	}
}
