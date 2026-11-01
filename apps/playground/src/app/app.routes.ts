import { Routes } from '@angular/router';
export const routes: Routes = [
	{
		path: '',
		pathMatch: 'full',
		title: 'Nepali Date Playground',
		loadComponent: () =>
			import('./pages/playground/playground.component').then((module) => module.PlaygroundComponent),
	},
	{ path: 'playground', redirectTo: '', pathMatch: 'full' },
	{ path: '**', redirectTo: '' },
];
