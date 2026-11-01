import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	DestroyRef,
	PLATFORM_ID,
	afterNextRender,
	computed,
	inject,
	signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DemoCardComponent } from '../../components/demo-card/demo-card.component';
import { CodeBlockComponent } from '../../../../../shared/components/code-block/code-block.component';
import { ApiTableComponent } from '../../components/api-table/api-table.component';
import { InfoBoxComponent } from '../../components/info-box/info-box.component';
import { ReleaseHistoryComponent } from '../../components/release-history/release-history.component';
import { PlaygroundEmbedComponent } from '../../components/playground-embed/playground-embed.component';
import { pages, pagePath, referenceTitles, installation, quickStart } from '../../content/docs.catalog';
import { referenceData } from '../../content/reference-data';
import { navigation } from '../../content/generated/navigation.generated';
import { site } from '../../configuration/site';
import { exampleById } from '../../../../../shared/content/picker-examples';
import { FormsExampleComponent } from '../forms/forms-example.component';
import { ConversionExampleComponent } from '../conversion/conversion-example.component';
import { FormattingExampleComponent } from '../formatting/formatting-example.component';
@Component({
	selector: 'app-documentation-page',
	standalone: true,
	imports: [
		RouterLink,
		DemoCardComponent,
		CodeBlockComponent,
		ApiTableComponent,
		InfoBoxComponent,
		ReleaseHistoryComponent,
		PlaygroundEmbedComponent,
		FormsExampleComponent,
		ConversionExampleComponent,
		FormattingExampleComponent,
	],
	templateUrl: './documentation-page.component.html',
	styleUrl: './documentation-page.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentationPageComponent {
	private readonly route = inject(ActivatedRoute);
	private readonly title = inject(Title);
	private readonly meta = inject(Meta);
	private readonly document = inject(DOCUMENT);
	private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
	private readonly destroy = inject(DestroyRef);
	private observer?: IntersectionObserver;
	readonly page = signal(pages[0]);
	readonly active = signal('');
	readonly site = site;
	readonly metadata = site.metadata;
	readonly install = installation;
	readonly quickStart = quickStart;
	readonly example = exampleById;
	readonly referenceData = referenceData;
	readonly referenceTitles = referenceTitles;
	readonly pagePath = pagePath;
	readonly toc = computed(() => navigation.find((item) => item.id === this.page().id)?.sections ?? []);
	readonly previous = computed(() => pages[pages.indexOf(this.page()) - 1]);
	readonly next = computed(() => pages[pages.indexOf(this.page()) + 1]);
	constructor() {
		this.route.data.pipe(takeUntilDestroyed()).subscribe((data) => {
			const page = pages.find((item) => item.id === data['page']) ?? pages[0];
			this.page.set(page);
			this.active.set('');
			this.updateMetadata();
			if (this.browser) setTimeout(() => this.observe(), 0);
		});
		afterNextRender(() => this.observe());
		this.destroy.onDestroy(() => this.observer?.disconnect());
	}
	private observe(): void {
		if (!this.browser || !('IntersectionObserver' in (this.document.defaultView ?? {}))) return;
		this.observer?.disconnect();
		this.observer = new IntersectionObserver(
			(entries) => {
				const visible = entries.find((entry) => entry.isIntersecting);
				if (visible) this.active.set(visible.target.id);
			},
			{ rootMargin: '-90px 0px -65% 0px' },
		);
		this.document.querySelectorAll('section[id]').forEach((section) => this.observer?.observe(section));
	}
	private updateMetadata(): void {
		const page = this.page(),
			title = page.title + ' | ngx-nepali-dualpicker';
		this.title.setTitle(title);
		this.meta.updateTag({ name: 'description', content: page.description });
		for (const [property, content] of Object.entries({
			'og:title': title,
			'og:description': page.description,
			'og:type': 'website',
			'og:site_name': 'Nepali Dualpicker documentation',
		}))
			this.meta.updateTag({ property, content });
		this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
		this.meta.updateTag({ name: 'twitter:title', content: title });
		this.meta.updateTag({ name: 'twitter:description', content: page.description });
		this.document.querySelector('link[rel="canonical"]')?.remove();
		this.meta.removeTag('property="og:url"');
		this.document.getElementById('docs-schema')?.remove();
		if (site.publicUrl) {
			const url = site.publicUrl.replace(/\/$/, '') + pagePath(page.id);
			const canonical = this.document.createElement('link');
			canonical.rel = 'canonical';
			canonical.href = url;
			this.document.head.appendChild(canonical);
			this.meta.updateTag({ property: 'og:url', content: url });
			this.meta.updateTag({ name: 'robots', content: 'index,follow' });
			const schema = this.document.createElement('script');
			schema.id = 'docs-schema';
			schema.type = 'application/ld+json';
			schema.textContent = JSON.stringify({
				'@context': 'https://schema.org',
				'@type': 'TechArticle',
				headline: page.title,
				description: page.description,
				url,
				inLanguage: 'en',
			}).replace(/</g, '\\u003c');
			this.document.head.appendChild(schema);
		} else this.meta.updateTag({ name: 'robots', content: 'noindex,nofollow' });
	}
}
