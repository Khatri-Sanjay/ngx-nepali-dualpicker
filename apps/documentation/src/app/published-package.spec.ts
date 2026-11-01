import { TestBed, fakeAsync, tick, flushMicrotasks } from '@angular/core/testing';
import { readPublishedPackage } from '../../../shared/content/published-package';
import { PublishedPackageService } from '../../../shared/content/published-package.service';
import { ReleaseHistoryComponent } from './components/release-history/release-history.component';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';

function metadata(latest = '1.0.0', versions: Record<string, object> = { '1.0.0': {} }) {
	return {
		'dist-tags': { latest },
		versions,
		time: {
			'1.0.0': '2026-01-01T00:00:00Z',
			'1.1.0': '2026-02-01T00:00:00Z',
			'9.0.0': '2026-03-01T00:00:00Z',
		},
	};
}
function response(value: unknown): Response {
	return { ok: true, json: async () => value } as Response;
}
describe('Published npm metadata', () => {
	it('excludes deleted versions retained in time and follows latest rather than the highest version', () => {
		const result = readPublishedPackage(metadata('1.0.0', { '1.0.0': {}, '1.1.0': {} }));
		expect(result.latest).toBe('1.0.0');
		expect(result.releases.map((release) => release.version)).toEqual(['1.1.0', '1.0.0']);
		expect(() => readPublishedPackage(metadata('9.0.0'))).toThrow();
	});
	it('refreshes version and release list, removes deleted versions and retains verified data on failure', async () => {
		const fetcher = spyOn(globalThis, 'fetch').and.resolveTo(
			response(metadata('1.1.0', { '1.0.0': {}, '1.1.0': {} })),
		);
		const service = TestBed.inject(PublishedPackageService);
		await service.refresh();
		expect(service.latest()).toBe('1.1.0');
		fetcher.and.resolveTo(response(metadata()));
		await service.refresh();
		expect(service.latest()).toBe('1.0.0');
		expect(service.data().releases.map((release) => release.version)).toEqual(['1.0.0']);
		fetcher.and.rejectWith(new Error('Offline'));
		await service.refresh();
		expect(service.latest()).toBe('1.0.0');
		expect(service.stale()).toBeTrue();
		fetcher.and.resolveTo(response(metadata()));
		await service.refresh();
		expect(service.stale()).toBeFalse();
	});
	it('removes an unpublished release from changelog cards and version options', async () => {
		spyOn(globalThis, 'fetch').and.resolveTo(response(metadata('1.1.0', { '1.0.0': {}, '1.1.0': {} })));
		TestBed.configureTestingModule({ providers: [provideRouter([])] });
		const fixture = TestBed.createComponent(ReleaseHistoryComponent);
		fixture.detectChanges();
		const service = TestBed.inject(PublishedPackageService);
		await service.refresh();
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('#release-1-1-0')).not.toBeNull();
		(globalThis.fetch as jasmine.Spy).and.resolveTo(response(metadata()));
		await service.refresh();
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('#release-1-1-0')).toBeNull();
		expect(fixture.nativeElement.querySelector('option[value="1.1.0"]')).toBeNull();
		expect(fixture.nativeElement.querySelector('#release-1-0-0 .badge').textContent).toContain('Latest');
	});
	it('refreshes on a timer and tab visibility, then cleans up on teardown', fakeAsync(() => {
		const fetcher = spyOn(globalThis, 'fetch').and.resolveTo(response(metadata()));
		spyOnProperty(document, 'hidden', 'get').and.returnValue(false);
		TestBed.configureTestingModule({ providers: [provideRouter([])] });
		const fixture = TestBed.createComponent(AppComponent);
		fixture.detectChanges();
		flushMicrotasks();
		expect(fetcher).toHaveBeenCalledTimes(1);
		tick(5 * 60 * 1000);
		flushMicrotasks();
		expect(fetcher).toHaveBeenCalledTimes(2);
		document.dispatchEvent(new Event('visibilitychange'));
		flushMicrotasks();
		expect(fetcher).toHaveBeenCalledTimes(3);
		TestBed.resetTestingModule();
		tick(5 * 60 * 1000);
		flushMicrotasks();
		document.dispatchEvent(new Event('visibilitychange'));
		flushMicrotasks();
		expect(fetcher).toHaveBeenCalledTimes(3);
	}));
	it('renders the refreshed npm version in the documentation shell', async () => {
		spyOn(globalThis, 'fetch').and.resolveTo(response(metadata()));
		TestBed.configureTestingModule({ providers: [provideRouter([])] });
		const fixture = TestBed.createComponent(AppComponent);
		fixture.detectChanges();
		await TestBed.inject(PublishedPackageService).refresh();
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.version-tag').textContent).toContain('npm v1.0.0');
		expect(fixture.nativeElement.querySelector('.sidebar-version').textContent).toContain('1.0.0');
	});
});
