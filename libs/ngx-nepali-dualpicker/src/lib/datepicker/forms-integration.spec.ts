import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgxNepaliDualpicker } from './ngx-nepali-dualpicker.component';
import { DatePickerValue } from './state/datepicker-value.type';

@Component({
	standalone: true,
	imports: [ReactiveFormsModule, NgxNepaliDualpicker],
	template: ` <form [formGroup]="form">
		<ngx-nepali-dualpicker
			formControlName="range"
			[config]="{ calendar: 'AD', selectionMode: 'range', inline: true }"
		/>
		<ngx-nepali-dualpicker
			formControlName="multiple"
			[config]="{
				calendar: 'AD',
				selectionMode: 'multiple',
				inline: true,
				multipleSelection: { maxSelections: 2 },
			}"
		/>
	</form>`,
})
class FormsHost {
	readonly form = new FormGroup({
		range: new FormControl<DatePickerValue>({ start: '2024-01-15', end: '2024-01-20' }),
		multiple: new FormControl<DatePickerValue>(['2024-01-15', '2024-01-16']),
	});
}

describe('Rendered Angular Forms initialization', () => {
	it('initializes every mode before CVA writes without form change emissions', () => {
		const fixture = TestBed.createComponent(FormsHost),
			changes = jasmine.createSpy('changes');
		fixture.componentInstance.form.valueChanges.subscribe(changes);
		fixture.detectChanges();
		const pickers = fixture.debugElement.queryAll(By.directive(NgxNepaliDualpicker));
		expect((pickers[0].componentInstance as NgxNepaliDualpicker).startDate()?.day).toBe(15);
		expect((pickers[0].componentInstance as NgxNepaliDualpicker).endDate()?.day).toBe(20);
		expect((pickers[1].componentInstance as NgxNepaliDualpicker).selectedDates().length).toBe(2);
		expect(changes).not.toHaveBeenCalled();
		fixture.componentInstance.form.reset();
		fixture.detectChanges();
		expect((pickers[0].componentInstance as NgxNepaliDualpicker).startDate()).toBeNull();
		expect((pickers[1].componentInstance as NgxNepaliDualpicker).selectedDates()).toEqual([]);
	});
});
