import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
@Component({
	standalone: true,
	imports: [RouterLink],
	template: `<article>
		<p>DOCUMENTATION / 404</p>
		<h1>Page not found</h1>
		<p>This page may have moved. Search the documentation or start with the introduction.</p>
		<a routerLink="/introduction">Open documentation</a>
	</article>`,
	styles: [
		`
			article {
				max-width: 700px;
				padding: 40px 0;
			}
			p {
				font-size: 14px;
				color: var(--doc-muted);
				line-height: 1.8;
			}
			h1 {
				font-size: 36px;
			}
			a {
				color: var(--doc-accent);
			}
		`,
	],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundComponent {
	constructor() {
		const document = inject(DOCUMENT);
		document.querySelector('link[rel="canonical"]')?.remove();
		document.getElementById('docs-schema')?.remove();
		inject(Title).setTitle('Page not found | Nepali Dualpicker');
		inject(Meta).updateTag({ name: 'robots', content: 'noindex,nofollow' });
	}
}
