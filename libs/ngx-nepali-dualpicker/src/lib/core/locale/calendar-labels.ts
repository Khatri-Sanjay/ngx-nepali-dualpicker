import type { MonthMapping, DaysMapping, WordsMapping } from './calendar-labels.model';

/** Full names for date tokens and accessible announcements; compact grid labels stay unchanged. */
export const FULL_WEEKDAY_NAMES = {
	en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
	ne: ['आइतबार', 'सोमबार', 'मंगलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'],
} as const;

export const DATE_WORDS: WordsMapping = {
	year: 'साल',
	month: 'महिना',
};

/** Weekday labels indexed Sunday (0) through Saturday (6). */
export const DAYS_NAME: DaysMapping = {
	en: {
		short: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
		narrow: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
	},
	ne: {
		short: ['आइत', 'सोम', 'मंगल', 'बुध', 'बिही', 'शुक्र', 'शनि'],
		narrow: ['आ', 'सो', 'मं', 'बु', 'बि', 'शु', 'श'],
	},
};

/** BS month labels indexed Baisakh (0) through Chaitra (11). */
export const NEPALI_MONTHS_NAME: MonthMapping = {
	en: {
		full: [
			'Baisakh',
			'Jestha',
			'Asadh',
			'Shrawan',
			'Bhadra',
			'Ashwin',
			'Kartik',
			'Mangsir',
			'Poush',
			'Magh',
			'Falgun',
			'Chaitra',
		],
		short: ['Bai', 'Jes', 'Asa', 'Shr', 'Bha', 'Ash', 'Kar', 'Man', 'Pou', 'Mag', 'Fal', 'Cha'],
	},
	ne: {
		full: [
			'बैशाख',
			'जेष्ठ',
			'आषाढ',
			'श्रावण',
			'भाद्र',
			'आश्विन',
			'कार्तिक',
			'मंसिर',
			'पौष',
			'माघ',
			'फाल्गुन',
			'चैत्र',
		],
		short: ['बै', 'जे', 'अ', 'श्रा', 'भा', 'आ', 'का', 'मं', 'पौ', 'मा', 'फा', 'चै'],
	},
};

/** Gregorian month labels indexed January (0) through December (11). */
export const ENGLISH_MONTHS_NAME: MonthMapping = {
	en: {
		full: [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		],
		short: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
	},
	ne: {
		full: [
			'जनवरी',
			'फेब्रुअरी',
			'मार्च',
			'अप्रिल',
			'मे',
			'जुन',
			'जुलाई',
			'अगष्ट',
			'सेप्टेम्बर',
			'अक्टोबर',
			'नोभेम्बर',
			'डिसेम्बर',
		],
		short: ['जन', 'फेब', 'मार', 'अप्र', 'मे', 'जुन', 'जुल', 'अग', 'सेप', 'अक्ट', 'नोभ', 'डिस'],
	},
};
