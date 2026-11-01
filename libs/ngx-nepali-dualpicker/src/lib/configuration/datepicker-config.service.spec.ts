import { computed } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DatePickerConfigService } from './datepicker-config.service';
import { DATE_PICKER_CONFIG } from './datepicker-config.token';

describe('Reactive global configuration', () => {
	it('invalidates computed reads after updates and reset', () => {
		const service = TestBed.inject(DatePickerConfigService);
		const language = computed(() => service.getMergedConfig().language);
		expect(language()).toBe('en');
		service.updateGlobalConfig({ language: 'ne' });
		expect(language()).toBe('ne');
		service.resetGlobalConfig();
		expect(language()).toBe('en');
	});

	it('does not mutate the provided object or expose nested references', () => {
		const provided = { bsYearRange: { start: 2000, end: 2090 }, disabledDates: [{ year: 2080, month: 1, day: 1 }] };
		TestBed.configureTestingModule({ providers: [{ provide: DATE_PICKER_CONFIG, useValue: provided }] });
		const service = TestBed.inject(DatePickerConfigService);
		const snapshot = service.getGlobalConfig();
		snapshot.bsYearRange!.start = 1;
		(snapshot.disabledDates![0] as { year: number }).year = 1;
		service.updateGlobalConfig({ language: 'ne' });
		expect(provided.bsYearRange.start).toBe(2000);
		expect(provided.disabledDates[0].year).toBe(2080);
		expect(service.getGlobalConfig().bsYearRange!.start).toBe(2000);
		expect(service.getGlobalConfig().disabledDates![0]).toEqual({ year: 2080, month: 1, day: 1 });
	});
});
