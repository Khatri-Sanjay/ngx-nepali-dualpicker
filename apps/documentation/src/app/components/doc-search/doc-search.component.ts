import { DOCUMENT } from '@angular/common';
import {
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	HostListener,
	Input,
	ViewChild,
	computed,
	inject,
	signal,
} from '@angular/core';
import { Router } from '@angular/router';
interface SearchRecord {
	id: string;
	title: string;
	path: string;
	category: string;
	text: string;
}
@Component({
	selector: 'app-doc-search',
	standalone: true,
	templateUrl: './doc-search.component.html',
	styleUrl: './doc-search.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocSearchComponent {
	@Input() disabled = false;
	@ViewChild('dialog') dialog?: ElementRef<HTMLDialogElement>;
	@ViewChild('searchInput') input?: ElementRef<HTMLInputElement>;
	private readonly router = inject(Router);
	private readonly document = inject(DOCUMENT);
	private previousFocus: HTMLElement | null = null;
	readonly query = signal('');
	readonly selected = signal(0);
	readonly loading = signal(false);
	readonly error = signal('');
	readonly records = signal<readonly SearchRecord[]>([]);
	readonly results = computed(() => {
		const words = this.query().trim().toLowerCase().split(/\s+/).filter(Boolean);
		if (!words.length)
			return this.records()
				.filter((item) => !item.path.includes('#'))
				.slice(0, 10);
		return this.records()
			.map((item) => ({
				item,
				score: words.reduce(
					(sum, word) =>
						sum +
						(item.title.toLowerCase().includes(word) ? 5 : 0) +
						(item.text.toLowerCase().includes(word) ? 1 : 0),
					0,
				),
			}))
			.filter(({ item }) =>
				words.every((word) =>
					(item.title + ' ' + item.text + ' ' + item.category).toLowerCase().includes(word),
				),
			)
			.sort((a, b) => b.score - a.score)
			.slice(0, 30)
			.map(({ item }) => item);
	});
	async open(): Promise<void> {
		if (this.disabled) return;
		this.previousFocus = this.document.activeElement as HTMLElement;
		this.dialog?.nativeElement.showModal();
		this.input?.nativeElement.focus();
		if (this.records().length) return;
		this.loading.set(true);
		this.error.set('');
		try {
			const data = await import('../../content/generated/search.generated');
			this.records.set(data.searchIndex);
		} catch {
			this.error.set('Search could not load. Check your connection and retry.');
		} finally {
			this.loading.set(false);
		}
	}
	close(): void {
		this.dialog?.nativeElement.close();
		this.previousFocus?.focus();
	}
	update(value: string): void {
		this.query.set(value);
		this.selected.set(0);
	}
	go(index: number): void {
		const item = this.results()[index];
		if (!item) return;
		this.close();
		const [path, fragment] = item.path.split('#');
		void this.router.navigate([path], { fragment });
	}
	key(event: KeyboardEvent): void {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault();
			const length = this.results().length;
			this.selected.set(length ? (this.selected() + (event.key === 'ArrowDown' ? 1 : -1) + length) % length : 0);
			this.document.getElementById('search-result-' + this.selected())?.scrollIntoView({ block: 'nearest' });
		} else if (event.key === 'Enter') {
			event.preventDefault();
			this.go(this.selected());
		}
	}
	parts(value: string): { text: string; match: boolean }[] {
		const word = this.query().trim().split(/\s+/)[0];
		if (!word) return [{ text: value, match: false }];
		const index = value.toLowerCase().indexOf(word.toLowerCase());
		return index < 0
			? [{ text: value, match: false }]
			: [
					{ text: value.slice(0, index), match: false },
					{ text: value.slice(index, index + word.length), match: true },
					{ text: value.slice(index + word.length), match: false },
				];
	}
	@HostListener('document:keydown', ['$event']) shortcut(event: KeyboardEvent): void {
		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
			event.preventDefault();
			if (!this.dialog?.nativeElement.open) void this.open();
			else this.close();
		}
	}
}
