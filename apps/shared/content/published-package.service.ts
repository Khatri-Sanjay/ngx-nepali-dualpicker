import { DOCUMENT } from '@angular/common';
import { Injectable, NgZone, DestroyRef, afterNextRender, computed, inject, signal } from '@angular/core';
import snapshot from './published-package.generated.json';
import { readPublishedPackage, PublishedPackage } from './published-package';

@Injectable({ providedIn: 'root' })
export class PublishedPackageService {
	private readonly document = inject(DOCUMENT);
	private readonly destroy = inject(DestroyRef);
	private readonly state = signal<PublishedPackage>(snapshot);
	readonly data = this.state.asReadonly();
	readonly latest = computed(() => this.data().latest);
	readonly stale = signal(false);
	private pending?: Promise<void>;
	private controller?: AbortController;
	private destroyed = false;

	constructor() {
		const injectZone = inject(NgZone);
		afterNextRender(() =>
			injectZone.runOutsideAngular(() => {
				void this.refresh();
				const timer = setInterval(
					() => {
						if (!this.document.hidden) void this.refresh();
					},
					5 * 60 * 1000,
				);
				const visible = () => {
					if (!this.document.hidden) void this.refresh();
				};
				this.document.addEventListener('visibilitychange', visible);
				this.destroy.onDestroy(() => {
					clearInterval(timer);
					this.document.removeEventListener('visibilitychange', visible);
				});
			}),
		);
		this.destroy.onDestroy(() => {
			this.destroyed = true;
			this.controller?.abort();
		});
	}

	refresh(): Promise<void> {
		if (this.destroyed) return Promise.resolve();
		if (this.pending) return this.pending;
		this.pending = this.load().finally(() => {
			this.pending = undefined;
		});
		return this.pending;
	}
	private async load(): Promise<void> {
		this.controller = new AbortController();
		const timeout = setTimeout(() => this.controller?.abort(), 10000);
		try {
			const response = await fetch('https://registry.npmjs.org/ngx-nepali-dualpicker', {
				cache: 'no-store',
				signal: this.controller.signal,
			});
			if (!response.ok) throw new Error('npm registry unavailable.');
			const data = readPublishedPackage(await response.json());
			if (!this.destroyed) {
				this.state.set(data);
				this.stale.set(false);
			}
		} catch {
			if (!this.destroyed) this.stale.set(true);
		} finally {
			clearTimeout(timeout);
		}
	}
}
