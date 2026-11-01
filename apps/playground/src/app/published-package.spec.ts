import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PublishedPackageService } from '../../../shared/content/published-package.service';
import { AppComponent } from './app.component';

describe('Playground published version', () => {
	it('renders the current npm tag instead of the built source version', async () => {
		spyOn(globalThis, 'fetch').and.resolveTo({
			ok: true,
			json: async () => ({
				'dist-tags': { latest: '1.0.0' },
				versions: { '1.0.0': {} },
				time: { '1.0.0': '2026-01-01T00:00:00Z' },
			}),
		} as Response);
		TestBed.configureTestingModule({ providers: [provideRouter([])] });
		const fixture = TestBed.createComponent(AppComponent);
		fixture.detectChanges();
		await TestBed.inject(PublishedPackageService).refresh();
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.version').textContent).toContain('npm v1.0.0');
	});
});
