import { provideClientHydration } from '@angular/platform-browser';
import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideNepaliDualpicker } from 'ngx-nepali-dualpicker';

export const appConfig: ApplicationConfig = {
	providers: [
		provideClientHydration(),
		provideNepaliDualpicker({ language: 'en', calendar: 'BS' }),
		provideRouter(
			routes,
			withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
		),
	],
};
