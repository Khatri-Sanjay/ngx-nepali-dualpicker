import { DOCUMENT } from '@angular/common';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { Meta, Title } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { DocSearchComponent } from './components/doc-search/doc-search.component';
import { ReleaseHistoryComponent } from './components/release-history/release-history.component';
import { DemoCardComponent } from './components/demo-card/demo-card.component';
import { searchIndex } from './content/generated/search.generated';
import { pages, pagePath } from './content/docs.catalog';
import { navigation } from './content/generated/navigation.generated';
import { examples } from '../../../shared/content/picker-examples';
import { site } from './configuration/site';
import { PlaygroundEmbedComponent } from './components/playground-embed/playground-embed.component';

describe('Documentation platform', () => {
	beforeEach(() => TestBed.configureTestingModule({ providers: [provideRouter(routes)] }));
	it('renders the Sunset preset from the documentation theme selector', async () => {
		const fixture = TestBed.createComponent(DemoCardComponent);
		fixture.componentRef.setInput(
			'example',
			examples.find((example) => example.id === 'theme'),
		);
		fixture.detectChanges();
		await fixture.whenStable();
		const option = fixture.nativeElement.querySelector('option[value="sunset"]') as HTMLOptionElement;
		expect(option).not.toBeNull();
		const select = option.closest('select')!;
		select.value = 'sunset';
		select.dispatchEvent(new Event('change'));
		fixture.detectChanges();
		await fixture.whenStable();
		fixture.detectChanges();
		expect(fixture.componentInstance.config().theme).toBe('sunset');
		expect(fixture.componentInstance.typescript).toContain('"sunset"');
	});
	it('loads the playground only on request and handles delayed, failed and closed frames', fakeAsync(() => {
		const fixture = TestBed.createComponent(PlaygroundEmbedComponent);
		fixture.detectChanges();
		const component = fixture.componentInstance;
		expect(fixture.nativeElement.querySelector('iframe')).toBeNull();
		component.open();
		expect(component.frame()).not.toBeNull();
		tick(12000);
		expect(component.slow()).toBeTrue();
		component.finish(true);
		expect(component.failed()).toBeTrue();
		expect(component.slow()).toBeFalse();
		component.open();
		component.finish();
		expect(component.loaded()).toBeTrue();
		component.close();
		expect(component.frame()).toBeNull();
	}));
	it('offers local setup instead of inventing an unconfigured production playground link', () => {
		const previous = site.playground;
		site.playground = null;
		try {
			const fixture = TestBed.createComponent(PlaygroundEmbedComponent);
			fixture.detectChanges();
			expect(fixture.nativeElement.textContent).toContain('not been configured');
			expect(fixture.nativeElement.querySelector('iframe,a')).toBeNull();
		} finally {
			site.playground = previous;
		}
	});
	it('emits canonical, social URL and structured metadata only for a configured production identity', async () => {
		const previous = site.publicUrl;
		// Reserved invalid domain is a test fixture, never a published project URL.
		site.publicUrl = 'https://docs.example.invalid';
		try {
			const harness = await RouterTestingHarness.create();
			await harness.navigateByUrl('/configuration');
			harness.detectChanges();
			const document = TestBed.inject(DOCUMENT);
			expect(document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(
				'https://docs.example.invalid/configuration',
			);
			expect(TestBed.inject(Meta).getTag('property="og:url"')?.content).toBe(
				'https://docs.example.invalid/configuration',
			);
			expect(TestBed.inject(Meta).getTag('property="og:image"')?.content).toBe(
				'https://docs.example.invalid/assets/brand/social-card.png',
			);
			expect(TestBed.inject(Meta).getTag('name="twitter:card"')?.content).toBe('summary_large_image');
			expect(JSON.parse(document.getElementById('docs-schema')?.textContent ?? '{}')['@type']).toBe(
				'TechArticle',
			);
			await harness.navigateByUrl('/unknown-page');
			expect(document.querySelector('link[rel="canonical"]')).toBeNull();
			expect(TestBed.inject(Meta).getTag('property="og:url"')).toBeNull();
			expect(TestBed.inject(Meta).getTag('property="og:image"')).toBeNull();
			expect(document.getElementById('docs-breadcrumbs')).toBeNull();
		} finally {
			site.publicUrl = previous;
		}
	});
	it('indexes config, utility methods, code, themes and actual releases', () => {
		for (const term of [
			'rangeConstraints',
			'getDaysInBsMonth',
			'--ndp-color-selected-background',
			'Version ' + site.registry.latest,
			'NgxNepaliDualpicker',
		])
			expect(searchIndex.some((item) => (item.title + ' ' + item.text).includes(term)))
				.withContext(term)
				.toBeTrue();
		expect(Number(navigation.length)).toBe(pages.length);
	});
	it('opens keyboard search, highlights literal text and navigates to an API section', async () => {
		const fixture = TestBed.createComponent(DocSearchComponent);
		fixture.detectChanges();
		const component = fixture.componentInstance;
		await component.open();
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('dialog').open).toBeTrue();
		component.update('rangeConstraints');
		fixture.detectChanges();
		expect(component.results().length).toBeGreaterThan(0);
		expect(fixture.nativeElement.querySelector('mark')?.textContent).toContain('rangeConstraints');
		const go = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
		component.key(new KeyboardEvent('keydown', { key: 'Enter' }));
		expect(go).toHaveBeenCalled();
		expect(fixture.nativeElement.querySelector('dialog').open).toBeFalse();
		component.update('no-such-api-987');
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.empty')).not.toBeNull();
	});
	it('changes documentation metadata and resolves every generated section anchor', async () => {
		const harness = await RouterTestingHarness.create();
		for (const page of pages) {
			await harness.navigateByUrl(pagePath(page.id));
			harness.detectChanges();
			expect(TestBed.inject(Title).getTitle()).toBe((page.seoTitle ?? page.title) + ' | ngx-nepali-dualpicker');
			expect(TestBed.inject(Meta).getTag('name="description"')?.content).toBe(page.description);
			for (const section of navigation.find((item) => item.id === page.id)?.sections ?? [])
				expect(harness.routeNativeElement?.querySelector('[id="' + section.id + '"]'))
					.withContext(page.id + '#' + section.id)
					.not.toBeNull();
		}
	});
	it('redirects the old read-only URL and shows an explicit missing-page state', async () => {
		const harness = await RouterTestingHarness.create();
		await harness.navigateByUrl('/readOnly');
		expect(TestBed.inject(Router).url).toBe('/read-only');
		await harness.navigateByUrl('/missing-page');
		expect(harness.routeNativeElement?.textContent).toContain('Page not found');
	});
	it('persists the theme and restores body scrolling when the drawer closes', () => {
		const fixture = TestBed.createComponent(AppComponent);
		fixture.detectChanges();
		const component = fixture.componentInstance;
		const document = TestBed.inject(DOCUMENT);
		const original = document.body.style.overflow;
		component.restoreTheme();
		const before = component.dark();
		component.toggleDark();
		component.restoreTheme();
		expect(component.dark()).toBe(!before);
		component.toggleMenu();
		expect(document.body.style.overflow).toBe('hidden');
		component.onKey(new KeyboardEvent('keydown', { key: 'Escape' }));
		expect(component.menuOpen()).toBeFalse();
		expect(document.body.style.overflow).toBe(original);
		component.toggleDark();
	});
	it('applies valid live JSON, preserves the last valid config on error, resets and updates copied source', () => {
		const fixture = TestBed.createComponent(DemoCardComponent);
		fixture.componentRef.setInput('example', examples[0]);
		fixture.detectChanges();
		const card = fixture.componentInstance;
		card.draft.set('{"calendar":"AD","selectionMode":"range","inline":true}');
		card.applyConfiguration();
		fixture.detectChanges();
		expect(card.config().selectionMode).toBe('range');
		expect(card.typescript).toContain('"inline": true');
		card.draft.set('{"legacyOption":true}');
		card.applyConfiguration();
		expect(card.configError()).toContain('legacyOption');
		expect(card.config().selectionMode).toBe('range');
		card.togglePreviewTheme();
		expect(card.config().theme).toBe('dark');
		card.reset();
		expect(card.config()).toEqual(examples[0].config);
		expect(card.configError()).toBe('');
	});
	it('filters releases without making up historical notes or dates', () => {
		const fixture = TestBed.createComponent(ReleaseHistoryComponent);
		fixture.detectChanges();
		const component = fixture.componentInstance;
		expect(fixture.nativeElement.textContent).toContain(site.metadata.version);
		component.version.set(component.registry.latest);
		fixture.detectChanges();
		expect(component.releases().length).toBe(1);
		expect(component.showCurrent()).toBeFalse();
		expect(fixture.nativeElement.querySelector('time').textContent).toBe(
			component.registry.releases
				.find((release) => release.version === component.registry.latest)!
				.date.slice(0, 10),
		);
		expect(fixture.nativeElement.textContent).toContain('not available');
		component.query.set('no-release');
		fixture.detectChanges();
		expect(fixture.nativeElement.querySelector('.empty')).not.toBeNull();
	});
});
