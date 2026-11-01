/** Active-popup listeners only. Capture scrolling so nested scroll containers reposition the popup too. */
export function connectPopupListeners(
	document: Document,
	host: HTMLElement,
	outside: () => void,
	reposition: () => void,
	inside: (target: Node) => boolean = (target) => host.contains(target),
): () => void {
	const click = (event: Event) => {
		if (event.target && !inside(event.target as Node)) outside();
	};
	document.addEventListener('click', click);
	document.addEventListener('scroll', reposition, true);
	document.defaultView?.addEventListener('resize', reposition);
	document.defaultView?.visualViewport?.addEventListener('resize', reposition);
	document.defaultView?.visualViewport?.addEventListener('scroll', reposition);
	return () => {
		document.removeEventListener('click', click);
		document.removeEventListener('scroll', reposition, true);
		document.defaultView?.removeEventListener('resize', reposition);
		document.defaultView?.visualViewport?.removeEventListener('resize', reposition);
		document.defaultView?.visualViewport?.removeEventListener('scroll', reposition);
	};
}
