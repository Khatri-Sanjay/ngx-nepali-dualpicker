import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
@Component({
	selector: 'app-info-box',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<aside [class.warning]="kind === 'warning'">
		<strong>{{ title }}</strong>
		<p><ng-content /></p>
	</aside>`,
	styles: [
		`
			aside {
				padding: 17px 20px;
				border: 1px solid var(--doc-border);
				border-left: 3px solid var(--doc-accent);
				border-radius: 8px;
				background: var(--doc-soft);
				font-size: 13px;
				line-height: 1.8;
				color: var(--doc-text);
			}
			p {
				margin: 5px 0 0;
			}
			.warning {
				border-left-color: #c28832;
				background: var(--doc-surface);
			}
		`,
	],
})
export class InfoBoxComponent {
	@Input() title = 'Good to know';
	@Input() kind: 'tip' | 'warning' = 'tip';
}
