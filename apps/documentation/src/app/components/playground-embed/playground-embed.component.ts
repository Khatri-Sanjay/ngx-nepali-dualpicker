import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { site } from '../../configuration/site';
@Component({
	selector: 'app-playground-embed',
	standalone: true,
	templateUrl: './playground-embed.component.html',
	styleUrl: './playground-embed.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlaygroundEmbedComponent {
	readonly url = site.playground;
	readonly loaded = signal(false);
	readonly failed = signal(false);
	readonly slow = signal(false);
	readonly narrow = signal(false);
	readonly frame = signal<SafeResourceUrl | null>(null);
	private readonly sanitizer = inject(DomSanitizer);
	private timer?: ReturnType<typeof setTimeout>;
	constructor() {
		inject(DestroyRef).onDestroy(() => this.clearTimer());
	}
	private clearTimer(): void {
		if (this.timer) clearTimeout(this.timer);
	}
	finish(failed = false): void {
		this.clearTimer();
		this.loaded.set(!failed);
		this.failed.set(failed);
		this.slow.set(false);
	}
	close(): void {
		this.clearTimer();
		this.frame.set(null);
		this.slow.set(false);
	}
	open(): void {
		if (this.url) {
			this.clearTimer();
			this.slow.set(false);
			this.loaded.set(false);
			this.failed.set(false);
			this.frame.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.url));
			this.timer = setTimeout(() => this.slow.set(true), 12000);
		}
	}
}
