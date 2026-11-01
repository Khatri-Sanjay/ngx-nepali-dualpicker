/** Keep Angular ownership while lifting the panel out of transformed/clipping ancestors. */
export class PopupSurface {
	private panel?: HTMLElement;
	private portal?: HTMLElement;
	private scope?: HTMLElement;
	private marker?: Comment;
	private modal?: HTMLDialogElement;
	private originalRole?: string | null;
	private readonly onToggle = (event: Event): void => {
		if ((event as ToggleEvent).newState === 'closed' && this.panel && !this.panel.matches(':popover-open'))
			this.dismiss();
	};
	constructor(
		private readonly document: Document,
		private readonly host: HTMLElement,
		private readonly dismiss: () => void,
	) {}
	get element(): HTMLElement | undefined {
		return this.panel;
	}
	contains(target: Node): boolean {
		return this.host.contains(target) || !!this.panel?.contains(target) || !!this.modal?.contains(target);
	}
	activate(panel: HTMLElement): void {
		if (this.panel === panel) {
			this.syncTheme();
			return;
		}
		this.release();
		this.panel = panel;
		if (typeof panel.showPopover === 'function') {
			panel.setAttribute('popover', 'manual');
			try {
				panel.showPopover();
				panel.addEventListener('toggle', this.onToggle);
				return;
			} catch {
				panel.removeAttribute('popover');
			}
		}
		// Progressive fallback for browsers without the Popover API.
		this.marker = this.document.createComment('datepicker popup');
		panel.before(this.marker);
		this.portal = this.document.createElement('ngx-nepali-dualpicker');
		this.portal.setAttribute('data-ndp-overlay', '');
		this.scope = this.document.createElement('div');
		this.portal.append(this.scope);
		this.scope.append(panel);
		if (this.host.closest('dialog[open]')) {
			this.modal = this.document.createElement('dialog');
			this.modal.className = 'ndp-fallback-surface';
			this.modal.setAttribute('aria-label', panel.getAttribute('aria-label') ?? 'Calendar');
			this.modal.append(this.portal);
			this.document.body.append(this.modal);
			this.originalRole = panel.getAttribute('role');
			panel.setAttribute('role', 'presentation');
			panel.classList.add('ndp-fallback-modal-panel');
			this.modal.addEventListener('cancel', (event) => {
				event.preventDefault();
				this.dismiss();
			});
			this.modal.addEventListener('click', (event) => {
				if (event.target === this.modal) this.dismiss();
			});
			this.modal.showModal();
		} else this.document.body.append(this.portal);
		this.syncTheme();
	}
	private syncTheme(): void {
		if (!this.portal || !this.scope) return;
		this.portal.className = this.host.className;
		this.scope.className =
			'nepali-date-picker' +
			(this.host.classList.contains('dark-mode') ? ' dark-mode' : '') +
			(this.host.classList.contains('mobile-compact') ? ' mobile-compact' : '');
		const style = this.document.defaultView?.getComputedStyle(this.host);
		this.scope.dir = style?.direction ?? this.host.dir;
		if (style)
			for (const name of Array.from(style))
				if (name.startsWith('--ndp-')) this.scope.style.setProperty(name, style.getPropertyValue(name));
	}
	release(): void {
		this.panel?.removeEventListener('toggle', this.onToggle);
		if (typeof this.panel?.hidePopover === 'function' && this.panel.matches(':popover-open'))
			this.panel.hidePopover();
		this.panel?.removeAttribute('popover');
		if (this.marker?.parentNode && this.panel) this.marker.replaceWith(this.panel);
		this.portal?.remove();
		if (this.originalRole !== undefined && this.panel) {
			if (this.originalRole === null) this.panel.removeAttribute('role');
			else this.panel.setAttribute('role', this.originalRole);
		}
		this.panel?.classList.remove('ndp-fallback-modal-panel');
		this.modal?.close();
		this.modal?.remove();
		this.modal = undefined;
		this.originalRole = undefined;
		this.portal = undefined;
		this.scope = undefined;
		this.marker = undefined;
		this.panel = undefined;
	}
}
