import { convertAdToBs, convertBsToAd, getWeekday } from '../core/calendar/date-conversion';
import { Injectable } from '@angular/core';
import { DateObj, DateInput } from '../core/models/calendar-date.model';
import { AD_VALIDATION, BS_VALIDATION } from '../core/calendar/calendar-data';
import { DateCalculator } from '../core/calendar/date-calculator';
import { DateParser } from '../core/parsing/date-parser';

/**
 * Service for converting between AD (Anno Domini/Gregorian) and BS (Bikram Sambat) calendar systems
 *
 * Reference Point:
 * - BS 2000/1/1 = AD 1943/4/14 (Wednesday)
 *
 * Supported Ranges:
 * - AD: 1943 - 2082
 * - BS: 2000 - 2139
 */
@Injectable({
	providedIn: 'root',
})
export class DateConversionService {
	/**
	 * Convert AD (Gregorian) date to BS (Bikram Sambat) date
	 *
	 * @param input - Date input (Date object, ISO string 'YYYY-MM-DD', or DateObj)
	 * @param formatted - If true, returns formatted string (YYYY-MM-DD), otherwise returns DateObj
	 * @returns BS date as DateObj or formatted string
	 *
	 * @example
	 * // Using Date object
	 * convertAdToBs(new Date(2024, 0, 15)) // Returns: { year: 2080, month: 10, day: 1 }
	 *
	 * @example
	 * // Using ISO string
	 * convertAdToBs('2024-01-15', true) // Returns: '2080-10-01'
	 *
	 * @example
	 * // Using DateObj
	 * convertAdToBs({ year: 2024, month: 1, day: 15 }) // Returns: { year: 2080, month: 10, day: 1 }
	 */
	public convertAdToBs(input: DateInput, formatted: boolean = false): DateObj | string {
		return convertAdToBs(input, formatted);
	}

	/**
	 * Convert BS (Bikram Sambat) date to AD (Gregorian) date
	 *
	 * @param input - Date input (Date object, ISO string 'YYYY-MM-DD', or DateObj)
	 * @param formatted - If true, returns formatted string (YYYY-MM-DD), otherwise returns DateObj
	 * @returns AD date as DateObj or formatted string
	 *
	 * @example
	 * // Using DateObj
	 * convertBsToAd({ year: 2080, month: 10, day: 1 }) // Returns: { year: 2024, month: 1, day: 15 }
	 *
	 * @example
	 * // Using ISO string
	 * convertBsToAd('2080-10-01', true) // Returns: '2024-01-15'
	 */
	public convertBsToAd(input: DateInput, formatted: boolean = false): DateObj | string {
		return convertBsToAd(input, formatted);
	}

	/**
	 * Get current date in BS (Bikram Sambat) calendar
	 *
	 * @param formatted - If true, returns formatted string (YYYY-MM-DD), otherwise returns DateObj
	 * @returns Current BS date
	 *
	 * @example
	 * getCurrentBsDate() // Returns: { year: 2081, month: 10, day: 13 }
	 * getCurrentBsDate(true) // Returns: '2081-10-13'
	 */
	public getCurrentBsDate(formatted: boolean = false): DateObj | string {
		const currentAdDate = DateParser.getCurrentDate();
		return this.convertAdToBs(currentAdDate, formatted);
	}

	/**
	 * Get the weekday for a given date
	 *
	 * @param input - Date input in AD calendar
	 * @returns Weekday number (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
	 *
	 * @example
	 * getWeekday({ year: 2024, month: 1, day: 15 }) // Returns: 1 (Monday)
	 */
	public getWeekday(input: DateInput): number {
		return getWeekday(input);
	}

	/**
	 * Check if a BS year is supported in the conversion tables
	 */
	public isBsYearSupported(year: number): boolean {
		return year >= BS_VALIDATION.minYear && year <= BS_VALIDATION.maxYear;
	}

	/**
	 * Check if an AD year is supported for conversion
	 */
	public isAdYearSupported(year: number): boolean {
		return year >= AD_VALIDATION.minYear && year <= AD_VALIDATION.maxYear;
	}

	/**
	 * Get total days in a BS month
	 */
	public getDaysInBsMonth(year: number, month: number): number {
		if (!this.isBsYearSupported(year)) {
			throw new Error(`BS year ${year} is not supported`);
		}
		return DateCalculator.getDaysInBsMonth(year, month);
	}

	/**
	 * Get total days in a BS year
	 */
	public getDaysInBsYear(year: number): number {
		if (!this.isBsYearSupported(year)) {
			throw new Error(`BS year ${year} is not supported`);
		}
		return DateCalculator.getTotalDaysInBsYear(year);
	}

	/**
	 * Get current month in BS (Bikram Sambat) calendar
	 *
	 * @param formatted - If true, returns formatted string (MM), otherwise returns month number (1-12)
	 * @returns Current BS month
	 *
	 * @example
	 * getCurrentBsMonth() // Returns: { month: 10 }
	 * getCurrentBsMonth(true) // Returns: '10'
	 */
	public getCurrentBsMonth(formatted: boolean = false): number | string {
		const currentBsDate = DateParser.parseToDateObj(this.getCurrentBsDate(false)); // Get current BS date as DateObj
		const currentBsMonth = currentBsDate.month;
		return formatted ? this.formatMonth(currentBsMonth) : currentBsMonth;
	}

	/**
	 * Get current year in BS (Bikram Sambat) calendar
	 *
	 * @param formatted - If true, returns formatted string (YYYY), otherwise returns the year number
	 * @returns Current BS year
	 *
	 * @example
	 * getCurrentBsYear() // Returns: { year: 2081 }
	 * getCurrentBsYear(true) // Returns: '2081'
	 */
	public getCurrentBsYear(formatted: boolean = false): number | string {
		const currentBsDate = DateParser.parseToDateObj(this.getCurrentBsDate(false)); // Get current BS date as DateObj
		const currentBsYear = currentBsDate.year;
		return formatted ? this.formatYear(currentBsYear) : currentBsYear;
	}

	// Helper function to format month as string
	private formatMonth(month: number): string {
		return month < 10 ? `0${month}` : `${month}`;
	}

	// Helper function to format year as string
	private formatYear(year: number): string {
		return `${year}`;
	}
}
