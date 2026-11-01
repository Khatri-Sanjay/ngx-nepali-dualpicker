import { ElementRef, Injectable, OnDestroy, PLATFORM_ID, Signal, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DatePickerConfig } from '../configuration/datepicker-config.model';
import { ThemeService } from './theme.service';
import { ThemeDetector } from './internal/theme-detector';
import { DatePickerTheme } from './datepicker-theme.model';

/** Component-scoped owner of theme effects. Never changes document-root styles. */
@Injectable()
export class PickerThemeController implements OnDestroy {
	readonly theme = signal<DatePickerTheme | null>(null);
	readonly dark = signal(false);
	private readonly service = inject(ThemeService);
	private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
	private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));

	bind(config: Signal<Required<DatePickerConfig>>): void {
		effect(
			(onCleanup) => {
				const current = config();
				const apply = () => {
					const preset =
						typeof current.theme === 'string'
							? this.service.getPresetTheme(
									current.theme === 'system' ? this.service.detectSystemTheme() : current.theme,
								)
							: current.theme;
					const resolved = this.service.mergeThemeObject(preset, current.customTheme);
					this.theme.set(resolved);
					this.dark.set(ThemeDetector.isThemeDark(resolved));
					if (this.browser) this.service.applyThemeToElement(resolved, this.element.nativeElement);
				};
				apply();
				if (this.browser && current.theme === 'system') onCleanup(this.service.onSystemThemeChange(apply));
			},
			{ allowSignalWrites: true },
		);
	}

	ngOnDestroy(): void {
		if (this.browser) this.service.removeThemeFromElement(this.element.nativeElement);
	}
}
