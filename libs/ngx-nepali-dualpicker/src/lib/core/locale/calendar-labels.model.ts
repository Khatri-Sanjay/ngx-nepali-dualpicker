export interface Values {
	full: string[];
	short?: string[];
}

export interface MonthMapping {
	en: Values;
	ne: Values;
}

export interface DaysMapping {
	en: { short: string[]; narrow: string[] };
	ne: { short: string[]; narrow: string[] };
}

export interface WordsMapping {
	year: string;
	month: string;
}
