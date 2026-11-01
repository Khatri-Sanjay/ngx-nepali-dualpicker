/** Numeric patterns supported by both editable picker parsing and formatting. */
export const EDITABLE_DATE_FORMATS = ['yyyy-MM-dd', 'yyyy/MM/dd', 'MM/dd/yyyy', 'dd/MM/yyyy', 'dd-MM-yyyy'] as const;

export type EditableDateFormat = (typeof EDITABLE_DATE_FORMATS)[number];

export function isEditableDateFormat(format: string): format is EditableDateFormat {
	return (EDITABLE_DATE_FORMATS as readonly string[]).includes(format);
}
