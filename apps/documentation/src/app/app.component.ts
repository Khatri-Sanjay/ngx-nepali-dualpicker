import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	DestroyRef,
	HostListener,
	PLATFORM_ID,
	ViewChild,
	ElementRef,
	afterNextRender,
	inject,
	signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { navigation } from './content/generated/navigation.generated';
import { docGroups } from './content/doc-model';
import { site } from './configuration/site';
import { DocSearchComponent } from './components/doc-search/doc-search.component';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterLink, RouterLinkActive, RouterOutlet, DocSearchComponent],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
	readonly site = site;
	readonly metadata = site.metadata;
	readonly navigation = navigation;
	readonly groups = docGroups;
	readonly menuOpen = signal(false);
	readonly dark = signal(false);
	readonly collapsed = signal<readonly string[]>([]);
	private readonly document = inject(DOCUMENT);
	private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
	private readonly destroy = inject(DestroyRef);
	private previousOverflow = '';
	private focusTimer?: ReturnType<typeof setTimeout>;
	@ViewChild('sidebar') private sidebar?: ElementRef<HTMLElement>;
	@ViewChild('menuButton') private menuButton?: ElementRef<HTMLButtonElement>;
	constructor() {
		afterNextRender(() => this.restoreTheme());
		inject(Router)
			.events.pipe(
				filter((event) => event instanceof NavigationEnd),
				takeUntilDestroyed(),
			)
			.subscribe(() => this.navigate());
		this.destroy.onDestroy(() => {
			if (this.focusTimer) clearTimeout(this.focusTimer);
			if (this.menuOpen()) this.document.body.style.overflow = this.previousOverflow;
		});
	}
	pagesFor(group: string) {
		return this.navigation.filter((page) => page.group === group);
	}
	toggleGroup(group: string): void {
		this.collapsed.update((items) =>
			items.includes(group) ? items.filter((item) => item !== group) : [...items, group],
		);
	}
	restoreTheme(): void {
		if (!this.browser) return;
		try {
			const preference = this.document.defaultView?.localStorage.getItem('dualpicker-docs-theme');
			this.dark.set(
				preference
					? preference === 'dark'
					: !!this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches,
			);
		} catch {
			this.dark.set(false);
		}
	}
	toggleDark(): void {
		this.dark.update((value) => !value);
		if (this.browser) {
			try {
				this.document.defaultView?.localStorage.setItem(
					'dualpicker-docs-theme',
					this.dark() ? 'dark' : 'light',
				);
			} catch {
				/* Storage may be unavailable; in-memory theme still works. */
			}
		}
	}
	toggleMenu(): void {
		if (this.menuOpen()) {
			this.closeMenu();
			return;
		}
		this.previousOverflow = this.document.body.style.overflow;
		this.document.body.style.overflow = 'hidden';
		this.menuOpen.set(true);
		this.focusTimer = setTimeout(
			() => this.sidebar?.nativeElement.querySelector<HTMLElement>('button,a')?.focus(),
			0,
		);
	}
	closeMenu(restore = true): void {
		if (!this.menuOpen()) return;
		this.menuOpen.set(false);
		this.document.body.style.overflow = this.previousOverflow;
		if (restore) this.focusTimer = setTimeout(() => this.menuButton?.nativeElement.focus(), 0);
	}
	navigate(): void {
		this.closeMenu(false);
	}
	@HostListener('document:keydown', ['$event']) onKey(event: KeyboardEvent): void {
		if (!this.menuOpen()) return;
		if (event.key === 'Escape') {
			event.preventDefault();
			this.closeMenu();
			return;
		}
		if (event.key !== 'Tab') return;
		const items = Array.from(
			this.sidebar?.nativeElement.querySelectorAll<HTMLElement>('a[href],button') ?? [],
		).filter((item) => item.getClientRects().length);
		const first = items[0],
			last = items[items.length - 1];
		if (event.shiftKey && this.document.activeElement === first) {
			event.preventDefault();
			last?.focus();
		} else if (!event.shiftKey && this.document.activeElement === last) {
			event.preventDefault();
			first?.focus();
		}
	}
}
