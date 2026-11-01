import { DateObj } from '../models/calendar-date.model';

/** Format a public date (one-based month) without building every format variant. */
export function formatPickerDate(date: DateObj, format: string, shortMonth = ''): string {
	const day = String(date.day).padStart(2, '0');
	const month = String(date.month).padStart(2, '0');
	switch (format) {
		case 'yyyy/MM/dd':
			return `${date.year}/${month}/${day}`;
		case 'MM/dd/yyyy':
			return `${month}/${day}/${date.year}`;
		case 'dd/MM/yyyy':
			return `${day}/${month}/${date.year}`;
		case 'dd-MM-yyyy':
			return `${day}-${month}-${date.year}`;
		case 'MMM dd, yyyy':
			return `${shortMonth} ${day}, ${date.year}`;
		default:
			return `${date.year}-${month}-${day}`;
	}
}
