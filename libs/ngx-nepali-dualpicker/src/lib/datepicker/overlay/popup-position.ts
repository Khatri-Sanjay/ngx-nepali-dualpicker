export interface PopupAnchor {
	readonly top: number;
	readonly bottom: number;
	readonly left: number;
	readonly right: number;
	readonly width: number;
}
export type PopupPosition = 'auto' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

export function calculatePopupPosition(
	anchor: PopupAnchor,
	viewport: { width: number; height: number; left?: number; top?: number },
	popupPosition: PopupPosition,
	popupHeight = 430,
	popupWidth = 320,
) {
	const margin = 8,
		gap = 8;
	const viewportLeft = viewport.left ?? 0;
	const viewportTop = viewport.top ?? 0;
	const bottom = viewportTop + viewport.height - margin;
	const above = Math.max(0, anchor.top - viewportTop - margin - gap);
	const below = Math.max(0, bottom - anchor.bottom - gap);
	const prefersTop = popupPosition.startsWith('top');
	const preferredSpace = prefersTop ? above : below;
	const otherSpace = prefersTop ? below : above;
	// Alignment is a preference: flip rather than covering the input at an edge.
	const flip = preferredSpace < popupHeight && otherSpace > preferredSpace;
	const opensTop = flip ? !prefersTop : prefersTop;
	const maxHeight = Math.min(Math.max(0, viewport.height - margin * 2), opensTop ? above : below);
	const height = Math.min(popupHeight, maxHeight);
	const width = Math.max(0, Math.min(popupWidth, viewport.width - margin * 2));
	const left = Math.max(
		viewportLeft + margin,
		Math.min(
			popupPosition.endsWith('right') ? anchor.right - width : anchor.left,
			viewportLeft + viewport.width - width - margin,
		),
	);
	const preferredTop = opensTop ? anchor.top - height - gap : anchor.bottom + gap;
	const top = Math.max(viewportTop + margin, Math.min(preferredTop, bottom - height));
	return { top, left, width, maxHeight, opensTop };
}
