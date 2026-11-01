import { Routes } from '@angular/router';
import { navigation } from './content/generated/navigation.generated';
export const routes: Routes = [
	{ path: '', pathMatch: 'full', redirectTo: 'introduction' },
	{ path: 'readOnly', pathMatch: 'full', redirectTo: 'read-only' },
	{
		path: '404',
		loadComponent: () => import('./pages/not-found.component').then((module) => module.NotFoundComponent),
	},
	...navigation.map((page) => ({
		path: page.path.slice(1),
		data: { page: page.id },
		loadComponent: () =>
			import('./pages/documentation-page/documentation-page.component').then(
				(module) => module.DocumentationPageComponent,
			),
	})),
	{
		path: '**',
		loadComponent: () => import('./pages/not-found.component').then((module) => module.NotFoundComponent),
	},
];
