import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { ElementRef, Injectable, OnDestroy, PLATFORM_ID, inject, signal } from '@angular/core';
import { calculatePopupPosition, PopupPosition } from './popup-position';
import { connectPopupListeners } from './popup-listeners';
import { PopupSurface } from './popup-surface';

/** Each picker owns its listeners, DOM measurements and popup coordinates. */
@Injectable()
export class PickerPopupController implements OnDestroy {
	readonly top = signal<number | null>(null);
	readonly left = signal<number | null>(null);
	readonly width = signal<number | null>(null);
	readonly maxHeight = signal<number | null>(null);
	readonly opensTop = signal(false);
	private readonly document = inject(DOCUMENT);
	private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
	private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
	private readonly surface = new PopupSurface(this.document, this.host.nativeElement, () => this.dismiss?.());
	private dismiss?: () => void;
	contains(target: Node): boolean {
		return this.surface.contains(target);
	}
	private disconnect?: () => void;
	private resizeObserver?: ResizeObserver;
	private contentObserver?: MutationObserver;
	private observedPopup?: HTMLElement;
	private reposition?: () => void;

	attach(anchor: () => HTMLElement | undefined, popupPosition: () => PopupPosition, outside: () => void): void {
		this.detach();
		if (!this.browser) return;
		this.dismiss = outside;
		this.reposition = () => {
			this.update(anchor(), popupPosition());
		};
		this.disconnect = connectPopupListeners(
			this.document,
			this.host.nativeElement,
			outside,
			this.reposition,
			(target) => this.contains(target),
		);
	}

	update(anchor: HTMLElement | undefined, popupPosition: PopupPosition): void {
		const viewport = this.document.defaultView;
		if (!this.browser || !viewport || !anchor) return;
		const popup =
			this.surface.element ?? this.host.nativeElement.querySelector<HTMLElement>('.datepicker__container');
		if (!popup) return; // Wait for the rendered panel instead of flashing an estimated position.
		this.surface.activate(popup);
		if (this.observedPopup !== popup && typeof ResizeObserver !== 'undefined') {
			this.resizeObserver?.disconnect();
			this.resizeObserver = new ResizeObserver(() => this.reposition?.());
			this.resizeObserver.observe(popup);
			this.resizeObserver.observe(anchor);
			this.contentObserver?.disconnect();
			this.contentObserver = new MutationObserver(() => this.reposition?.());
			this.contentObserver.observe(popup, { childList: true, subtree: true });
			this.observedPopup = popup;
		}
		const previousWidth = popup.style.width;
		popup.style.width = 'var(--ndp-dimension-container-width)';
		const naturalWidth = popup.getBoundingClientRect().width;
		popup.style.width = previousWidth;
		const body = popup.querySelector<HTMLElement>('.datepicker__body');
		// A constrained flex body hides natural content height from the outer scrollHeight.
		// Measure that content as well so changing months can expand/flip the panel correctly.
		const height = Math.ceil(
			popup.scrollHeight +
				(body ? body.scrollHeight - body.clientHeight : 0) +
				popup.offsetHeight -
				popup.clientHeight,
		);
		const visibleViewport = viewport.visualViewport;
		popup.style.setProperty('--ndp-visual-height', `${visibleViewport?.height ?? viewport.innerHeight}px`);
		popup.style.setProperty(
			'--ndp-visual-bottom',
			`${Math.max(0, viewport.innerHeight - ((visibleViewport?.offsetTop ?? 0) + (visibleViewport?.height ?? viewport.innerHeight)))}px`,
		);
		const result = calculatePopupPosition(
			anchor.getBoundingClientRect(),
			{
				width: visibleViewport?.width ?? viewport.innerWidth,
				height: visibleViewport?.height ?? viewport.innerHeight,
				left: visibleViewport?.offsetLeft ?? 0,
				top: visibleViewport?.offsetTop ?? 0,
			},
			popupPosition,
			height,
			naturalWidth || 320,
		);
		this.top.set(result.top);
		this.left.set(result.left);
		this.width.set(result.width);
		this.maxHeight.set(result.maxHeight);
		this.opensTop.set(result.opensTop);
	}

	detach(): void {
		this.disconnect?.();
		this.disconnect = undefined;
		this.resizeObserver?.disconnect();
		this.resizeObserver = undefined;
		this.contentObserver?.disconnect();
		this.contentObserver = undefined;
		this.observedPopup = undefined;
		this.reposition = undefined;
		this.surface.release();
		this.dismiss = undefined;
		this.top.set(null);
		this.left.set(null);
		this.width.set(null);
		this.maxHeight.set(null);
		this.opensTop.set(false);
	}

	ngOnDestroy(): void {
		this.detach();
	}
}
