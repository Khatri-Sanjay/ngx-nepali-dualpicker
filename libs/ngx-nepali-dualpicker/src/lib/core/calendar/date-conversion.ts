import { DateObj, DateInput } from '../models/calendar-date.model';
import { AD_VALIDATION, BS_AD_REFERENCE, BS_VALIDATION } from './calendar-data';
import { DateCalculator } from './date-calculator';
import { DateParser } from '../parsing/date-parser';
import { DateValidator } from '../validation/date-validator';

// One-based date-only conversion. Retains the existing epoch, lookup data and binary search.
export function convertAdToBs(input: DateInput, formatted: boolean = false): DateObj | string {
	// Parse input to DateObj
	const adDate = DateParser.parseToDateObj(input);

	// Validate AD date
	if (!DateValidator.isValidAdDate(adDate)) {
		throw new Error(
			`Invalid AD date: ${adDate.year}-${adDate.month}-${adDate.day}. ` +
				`Supported range is ${AD_VALIDATION.minYear}-${AD_VALIDATION.maxYear}.`,
		);
	}

	const baseAd = BS_AD_REFERENCE.ad;
	const baseBs = BS_AD_REFERENCE.bs;

	// Check if date is before reference date
	if (DateCalculator.compareDates(adDate, baseAd) < 0) {
		throw new Error(
			`AD date is before the reference date (${baseAd.year}-${baseAd.month}-${baseAd.day}). ` +
				`Conversion not supported.`,
		);
	}

	// Calculate total days from reference AD date
	const totalDays = DateCalculator.calculateAdDaysFromReference(adDate, baseAd);

	// Add days to base BS date
	const bsDate = DateCalculator.addDaysToBsDate(baseBs, totalDays);

	// Validate result
	if (!DateValidator.isValidBsDate(bsDate)) {
		throw new Error(
			`Conversion resulted in invalid BS date: ${bsDate.year}-${bsDate.month}-${bsDate.day}. ` +
				`This may be outside the supported BS range (${BS_VALIDATION.minYear}-${BS_VALIDATION.maxYear}).`,
		);
	}

	return formatted ? DateParser.formatDateObj(bsDate) : bsDate;
}

export function convertBsToAd(input: DateInput, formatted: boolean = false): DateObj | string {
	// Parse input to DateObj
	const bsDate = DateParser.parseToDateObj(input);

	// Validate BS date
	if (!DateValidator.isValidBsDate(bsDate)) {
		throw new Error(
			`Invalid BS date: ${bsDate.year}-${bsDate.month}-${bsDate.day}. ` +
				`Supported range is ${BS_VALIDATION.minYear}-${BS_VALIDATION.maxYear}.`,
		);
	}

	const baseAd = BS_AD_REFERENCE.ad;
	const baseBs = BS_AD_REFERENCE.bs;

	// Check if date is before reference date
	if (DateCalculator.compareDates(bsDate, baseBs) < 0) {
		throw new Error(
			`BS date is before the reference date (${baseBs.year}-${baseBs.month}-${baseBs.day}). ` +
				`Conversion not supported.`,
		);
	}

	// Calculate total days from reference BS date
	const totalDays = DateCalculator.calculateBsDaysFromReference(bsDate, baseBs);

	// Add days to base AD date
	const adDate = DateCalculator.addDaysToAdDate(baseAd, totalDays);

	// Validate result
	if (!DateValidator.isValidAdDate(adDate)) {
		throw new Error(
			`Conversion resulted in invalid AD date: ${adDate.year}-${adDate.month}-${adDate.day}. ` +
				`This may be outside the supported AD range (${AD_VALIDATION.minYear}-${AD_VALIDATION.maxYear}).`,
		);
	}

	return formatted ? DateParser.formatDateObj(adDate) : adDate;
}

export function getWeekday(input: DateInput): number {
	const adDate = DateParser.parseToDateObj(input);

	if (!DateValidator.isValidAdDate(adDate)) {
		throw new Error('Invalid AD date for weekday calculation');
	}

	const baseAd = BS_AD_REFERENCE.ad;
	const daysDifference = DateCalculator.calculateAdDaysFromReference(adDate, baseAd);

	// Reference date (1943/4/14) was Wednesday (day 3)
	return DateCalculator.calculateWeekday(daysDifference, 3);
}
