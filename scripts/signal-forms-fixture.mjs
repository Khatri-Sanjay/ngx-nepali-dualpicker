// Consumer-only sources: compiled against Angular 21+ after installing the actual package tarball.
export const signalHost = `
import { Component, signal } from '@angular/core';
import { form, FormField, disabled, required } from '@angular/forms/signals';
import { NgxNepaliDualpicker, DatePickerConfig } from 'ngx-nepali-dualpicker';
@Component({
 selector: 'compat-root', standalone: true,
 imports: [FormField, NgxNepaliDualpicker],
 template: '<ngx-nepali-dualpicker [config]="config" [formField]="fields.date" />'
})
export class SignalHost {
 model = signal({ date: '2024-01-15' });
 blocked = signal(false);
 fields = form(this.model, path => {
   required(path.date);
   disabled(path.date, () => this.blocked());
 });
 config: DatePickerConfig = { calendar: 'AD', inline: true, closeOnSelection: false, convertOnCalendarChange: true,
   allowTextInput: true, validation: { enabled: true }, disabledDates: ['2024-01-16'] };
}
@Component({
 selector: 'signal-range', standalone: true,
 imports: [FormField, NgxNepaliDualpicker],
 template: '<ngx-nepali-dualpicker [config]="config" [formField]="fields.date" />'
})
export class SignalRangeHost {
 model = signal({ date: { start: '2024-01-15', end: '2024-01-18' } });
 fields = form(this.model);
 config: DatePickerConfig = { calendar: 'AD', inline: true, selectionMode: 'range',
   closeOnSelection: false, validation: { enabled: true }, rangeConstraints: { minDays: 3 } };
}
@Component({
 selector: 'signal-multiple', standalone: true,
 imports: [FormField, NgxNepaliDualpicker],
 template: '<ngx-nepali-dualpicker [config]="config" [formField]="fields.date" />'
})
export class SignalMultipleHost {
 model = signal({ date: ['2024-01-15'] });
 fields = form(this.model);
 config: DatePickerConfig = { calendar: 'AD', inline: true, selectionMode: 'multiple',
   closeOnSelection: false, validation: { enabled: true }, multipleSelection: { maxSelections: 2 } };
}
`;

export const signalSpec = `
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NgxNepaliDualpicker } from 'ngx-nepali-dualpicker';
import { SignalHost, SignalRangeHost, SignalMultipleHost } from './signal-host';
async function settle(fixture: any) {
 fixture.detectChanges(); await fixture.whenStable(); fixture.detectChanges();
}
function picker(fixture: any): NgxNepaliDualpicker {
 return fixture.debugElement.query(By.directive(NgxNepaliDualpicker)).componentInstance;
}
function clickDay(fixture: any, day: number) {
 fixture.nativeElement.querySelector('[data-calendar-day="' + day + '"]').click();
}
describe('Signal Forms packed consumer', () => {
 it('synchronizes single-date model writes and real day clicks in both directions', async () => {
  const f = TestBed.createComponent(SignalHost); await settle(f);
  expect(picker(f).inputValue()).toBe('2024-01-15');
  f.componentInstance.model.set({date: '2024-01-20'}); await settle(f);
  expect(picker(f).inputValue()).toBe('2024-01-20');
  clickDay(f, 22); await settle(f);
  expect(f.componentInstance.model().date).toBe('2024-01-22');
  expect(f.componentInstance.fields.date().dirty()).toBeTrue();
  picker(f).switchCalendarType('BS'); await settle(f);
  expect(f.componentInstance.model().date).toBe('2080-10-08');
  picker(f).switchCalendarType('AD'); await settle(f);
  expect(f.componentInstance.model().date).toBe('2024-01-22');
  picker(f).clearSelection(); await settle(f);
  expect(f.componentInstance.model().date).toBeNull();
  expect(f.nativeElement.querySelector('input').value).toBe('');
 });
 it('propagates schema disabled state and prevents selection until enabled', async () => {
  const f = TestBed.createComponent(SignalHost); await settle(f);
  f.componentInstance.blocked.set(true); await settle(f);
  expect(f.nativeElement.querySelector('input').disabled).toBeTrue();
  clickDay(f, 22); await settle(f);
  expect(f.componentInstance.model().date).toBe('2024-01-15');
  f.componentInstance.blocked.set(false); await settle(f);
  expect(f.nativeElement.querySelector('input').disabled).toBeFalse();
  clickDay(f, 22); await settle(f);
  expect(f.componentInstance.model().date).toBe('2024-01-22');
 });
 it('tracks touched state and resets value and field flags', async () => {
  const f = TestBed.createComponent(SignalHost); await settle(f);
  expect(f.componentInstance.fields.date().touched()).toBeFalse();
  const input = f.nativeElement.querySelector('input'); input.focus(); input.blur(); await settle(f);
  expect(f.componentInstance.fields.date().touched()).toBeTrue();
  clickDay(f, 22); await settle(f);
  f.componentInstance.fields().reset({date: '2024-02-29'}); await settle(f);
  expect(f.componentInstance.model().date).toBe('2024-02-29');
  expect(picker(f).inputValue()).toBe('2024-02-29');
  expect(f.componentInstance.fields.date().touched()).toBeFalse();
  expect(f.componentInstance.fields.date().dirty()).toBeFalse();
 });
 it('checks schema required and version-specific legacy validation forwarding', async () => {
  const f = TestBed.createComponent(SignalHost); await settle(f);
  f.componentInstance.model.set({date: ''}); await settle(f);
  expect(f.componentInstance.fields.date().invalid()).toBeTrue();
  f.componentInstance.model.set({date: '2024-01-16'}); await settle(f);
  expect(f.componentInstance.fields.date().invalid()).toBe(forwardsLegacyValidators);
  f.componentInstance.model.set({date: '2024-01-20'}); await settle(f);
  expect(f.componentInstance.fields.date().valid()).toBeTrue();
  const input = f.nativeElement.querySelector('input');
  input.value = '2024-02-30'; input.dispatchEvent(new Event('input', {bubbles: true}));
  input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true})); await settle(f);
  expect(f.componentInstance.model().date).toBe('2024-01-20');
  expect(f.componentInstance.fields.date().invalid()).toBe(forwardsLegacyValidators);
  input.value = '2024-01-21'; input.dispatchEvent(new Event('input', {bubbles: true}));
  input.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', bubbles: true})); await settle(f);
  expect(f.componentInstance.model().date).toBe('2024-01-21');
  expect(f.componentInstance.fields.date().valid()).toBeTrue();
 });
 it('supports range objects, partial endpoints, duration validation and reset', async () => {
  const f = TestBed.createComponent(SignalRangeHost); await settle(f);
  expect(picker(f).startDate()?.day).toBe(15);
  expect(picker(f).endDate()?.day).toBe(18);
  clickDay(f, 20); await settle(f);
  expect(f.componentInstance.model().date).toEqual({start: '2024-01-20', end: null} as any);
  expect(f.componentInstance.fields.date().invalid()).toBe(forwardsLegacyValidators);
  clickDay(f, 24); await settle(f);
  expect(f.componentInstance.model().date).toEqual({start: '2024-01-20', end: '2024-01-24'});
  expect(f.componentInstance.fields.date().valid()).toBeTrue();
  f.componentInstance.model.set({date: {start: '2024-01-20', end: '2024-01-21'}}); await settle(f);
  expect(f.componentInstance.fields.date().invalid()).toBe(forwardsLegacyValidators);
  f.componentInstance.fields().reset({date: {start: '2024-02-01', end: '2024-02-05'}}); await settle(f);
  expect(picker(f).startDate()?.month).toBe(1);
  expect(picker(f).endDate()?.day).toBe(5);
  expect(f.componentInstance.fields.date().valid()).toBeTrue();
 });
 it('supports array values, selection limits, deselection and reset', async () => {
  const f = TestBed.createComponent(SignalMultipleHost); await settle(f);
  clickDay(f, 20); await settle(f);
  expect(f.componentInstance.model().date).toEqual(['2024-01-15', '2024-01-20']);
  clickDay(f, 22); await settle(f);
  expect(f.componentInstance.model().date).toEqual(['2024-01-15', '2024-01-20']);
  clickDay(f, 15); await settle(f);
  expect(f.componentInstance.model().date).toEqual(['2024-01-20']);
  f.componentInstance.model.set({date: ['2024-01-15', '2024-01-20', '2024-01-22']}); await settle(f);
  expect(f.componentInstance.fields.date().invalid()).toBe(forwardsLegacyValidators);
  f.componentInstance.fields().reset({date: []}); await settle(f);
  expect(picker(f).selectedDates()).toEqual([]);
  expect(f.componentInstance.fields.date().valid()).toBeTrue();
 });
});
`;
