import {
	AfterViewInit,
	ChangeDetectionStrategy,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	Output,
	ViewChild,
	DestroyRef,
	PLATFORM_ID,
	inject,
	signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NepaliNumeralPipe } from '../../../pipes/nepali-numeral.pipe';
@Component({
	selector: 'ndp-month-year-panel',
	standalone: true,
	imports: [NepaliNumeralPipe],
	templateUrl: './month-year-panel.component.html',
	styleUrl: './month-year-panel.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthYearPanelComponent implements AfterViewInit {
	@Input() months: readonly string[] = [];
	@Input() years: readonly number[] = [];
	@Input() month = 0;
	@Input() year = 0;
	@Input() language: 'en' | 'ne' = 'en';
	@Input() disabled = false;
	@Input() disabledMonths: readonly number[] = [];
	@Input() todayMonth = -1;
	@Input() todayYear = -1;
	readonly view = signal<'months' | 'years'>('months');
	readonly monthFocus = signal<number | null>(null);
	readonly yearFocus = signal<number | null>(null);
	get focusableMonth(): number {
		const preferred = this.monthFocus() ?? this.month;
		return this.disabledMonths.includes(preferred)
			? this.months.findIndex((_, index) => !this.disabledMonths.includes(index))
			: preferred;
	}
	private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
	private focusTimer?: ReturnType<typeof setTimeout>;
	@Output() monthSelected = new EventEmitter<number>();
	@Output() yearSelected = new EventEmitter<number>();
	@ViewChild('monthColumn') monthColumnRef?: ElementRef<HTMLDivElement>;
	@ViewChild('yearColumn') yearColumnRef?: ElementRef<HTMLDivElement>;
	constructor() {
		inject(DestroyRef).onDestroy(() => {
			if (this.focusTimer !== undefined) clearTimeout(this.focusTimer);
		});
	}
	ngAfterViewInit(): void {
		this.focusAfterRender();
	}
	activate(view: 'months' | 'years'): void {
		if (this.disabled) return;
		this.view.set(view);
		this.focusAfterRender();
	}
	chooseYear(year: number): void {
		if (this.disabled) return;
		this.yearSelected.emit(year);
		this.activate('months');
	}
	private focusAfterRender(): void {
		if (!this.browser) return;
		if (this.focusTimer !== undefined) clearTimeout(this.focusTimer);
		this.focusTimer = setTimeout(() => {
			this.focusTimer = undefined;
			this.scrollToSelected();
			const container = this.view() === 'months' ? this.monthColumnRef : this.yearColumnRef;
			const button =
				container?.nativeElement.querySelector<HTMLButtonElement>('button.selected:not(:disabled)') ??
				container?.nativeElement.querySelector<HTMLButtonElement>('button:not(:disabled)');
			button?.focus({ preventScroll: true });
		}, 0);
	}
	onGridKey(event: KeyboardEvent): void {
		const container = event.currentTarget as HTMLElement;
		const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
		const index = buttons.indexOf(event.target as HTMLButtonElement);
		if (index < 0) return;
		const columns = this.view() === 'months' ? 3 : 4;
		const rtl = container.ownerDocument.defaultView?.getComputedStyle(container).direction === 'rtl';
		let next: number;
		switch (event.key) {
			case 'ArrowLeft':
				next = index + (rtl ? 1 : -1);
				break;
			case 'ArrowRight':
				next = index + (rtl ? -1 : 1);
				break;
			case 'ArrowUp':
				next = index - columns;
				break;
			case 'ArrowDown':
				next = index + columns;
				break;
			case 'Home':
				next = 0;
				break;
			case 'End':
				next = buttons.length - 1;
				break;
			default:
				return;
		}
		event.preventDefault();
		event.stopPropagation();
		buttons[Math.max(0, Math.min(buttons.length - 1, next))]?.focus();
	}
	scrollToSelected(): void {
		for (const ref of [this.monthColumnRef, this.yearColumnRef]) {
			const container = ref?.nativeElement;
			const selected = container?.querySelector<HTMLElement>('.selected');
			if (container && selected)
				container.scrollTop = Math.max(
					0,
					container.scrollTop +
						selected.getBoundingClientRect().top -
						container.getBoundingClientRect().top -
						container.clientHeight / 2 +
						selected.clientHeight / 2,
				);
		}
	}
}
