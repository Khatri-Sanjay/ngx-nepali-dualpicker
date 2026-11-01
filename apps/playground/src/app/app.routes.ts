import { Routes } from '@angular/router';
export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		title: 'Angular Nepali Date Picker Playground | ngx-nepali-dualpicker',
		loadComponent: () =>
			import('./pages/playground/playground.component').then((module) => module.PlaygroundComponent),
	},
	{ path: 'playground', redirectTo: '', pathMatch: 'full' },
	{ path: '**', redirectTo: '' },
];
