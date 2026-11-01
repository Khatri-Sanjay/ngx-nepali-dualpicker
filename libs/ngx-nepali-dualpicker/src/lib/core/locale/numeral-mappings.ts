export const EN_TO_NE_DIGITS = {
	'0': '०',
	'1': '१',
	'2': '२',
	'3': '३',
	'4': '४',
	'5': '५',
	'6': '६',
	'7': '७',
	'8': '८',
	'9': '९',
} as const;

export type EnDigit = keyof typeof EN_TO_NE_DIGITS;
export type NeDigit = (typeof EN_TO_NE_DIGITS)[EnDigit];

export const NEPALI_DIGITS: string[] = Object.values(EN_TO_NE_DIGITS);
export const NE_TO_EN_DIGITS = Object.fromEntries(
	Object.entries(EN_TO_NE_DIGITS).map(([english, nepali]) => [nepali, english]),
) as {
	readonly [Digit in NeDigit]: {
		[English in EnDigit]: (typeof EN_TO_NE_DIGITS)[English] extends Digit ? English : never;
	}[EnDigit];
};

export const DIGITS = {
	enToNe: EN_TO_NE_DIGITS,
	neToEn: NE_TO_EN_DIGITS,
} as const;
