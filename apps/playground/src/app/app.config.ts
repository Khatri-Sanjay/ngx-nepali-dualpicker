import { ApplicationConfig } from '@angular/core';
import { provideRouter, withHashLocation, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideNepaliDualpicker } from 'ngx-nepali-dualpicker';

export const appConfig: ApplicationConfig = {
	providers: [
		provideNepaliDualpicker({ language: 'en', calendar: 'BS' }),
		provideRouter(
			routes,
			withHashLocation(),
			withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
		),
	],
};
