import { PRESET_THEMES } from 'ngx-nepali-dualpicker';
import type { PresetThemeName } from 'ngx-nepali-dualpicker';

/** Derive controls from the installed public package so every implemented preset is discoverable. */
export const pickerThemeOptions = (Object.keys(PRESET_THEMES) as PresetThemeName[]).map((value) => ({
	value,
	label: value[0].toUpperCase() + value.slice(1),
}));
