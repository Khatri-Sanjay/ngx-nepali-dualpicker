import { ChangeDetectionStrategy, Component, Input, computed, signal } from '@angular/core';

interface CodeToken {
	readonly text: string;
	readonly kind: string;
}

/** Lightweight token coloring with text interpolation only; never inject source as HTML. */
@Component({
	selector: 'app-code-block',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div class="code-block">
		<div class="toolbar">
			<span>{{ language }}</span>
			<div>
				<button type="button" (click)="expanded.set(!expanded())" [attr.aria-expanded]="expanded()">
					{{ expanded() ? 'Collapse' : 'Expand' }}
				</button>
				<button type="button" (click)="wrap.set(!wrap())" [attr.aria-pressed]="wrap()">Wrap</button
				><button type="button" (click)="copy()">{{ copied() ? 'Copied' : 'Copy' }}</button>
			</div>
		</div>
		<pre
			[class.wrap]="wrap()"
			[class.expanded]="expanded()"
			tabindex="0"
			role="region"
			[attr.aria-label]="language + ' code example'"
		><code>@for (token of tokens(); track $index) {<span [class]="token.kind">{{ token.text }}</span>}</code></pre>
		<span class="sr-only" role="status">{{ feedback() }}</span>
	</div>`,
	styles: [
		`
			:host {
				display: block;
				min-width: 0;
			}
			.code-block {
				--app-scrollbar-thumb: #62758e;
				--app-scrollbar-thumb-hover: #94a8c3;
				border: 1px solid var(--doc-border);
				border-radius: 10px;
				overflow: hidden;
				background: #111d31;
				color: #dce6f7;
			}
			.toolbar {
				display: flex;
				justify-content: space-between;
				align-items: center;
				padding: 10px 16px;
				background: #1a2941;
				font-size: 11px;
				color: #acbad2;
				letter-spacing: 0.4px;
			}
			.toolbar button {
				background: transparent;
				border: 1px solid #3d506d;
				border-radius: 5px;
				color: #dce6f7;
				padding: 4px 9px;
				margin-left: 7px;
				cursor: pointer;
			}
			pre {
				max-height: 380px;
				margin: 0;
				padding: 20px;
				overflow: auto;
				font:
					12px/1.8 ui-monospace,
					SFMono-Regular,
					Consolas,
					monospace;
				tab-size: 2;
			}
			.wrap {
				white-space: pre-wrap;
				overflow-wrap: anywhere;
			}
			pre.expanded {
				max-height: none;
			}
			.string {
				color: #a6d7b3;
			}
			.keyword {
				color: #acbaff;
			}
			.number {
				color: #e9bc84;
			}
			.comment {
				color: #899bb6;
			}
		`,
	],
})
export class CodeBlockComponent {
	private readonly source = signal('');
	@Input({ required: true }) set code(value: string) {
		this.source.set(value);
		this.copied.set(false);
		this.feedback.set('');
	}
	@Input() language = 'TypeScript';
	readonly copied = signal(false);
	readonly feedback = signal('');
	readonly wrap = signal(false);
	readonly expanded = signal(false);
	readonly tokens = computed<CodeToken[]>(() => {
		const pattern =
			/(\/\/[^\n]*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:import|from|export|class|readonly|const|return|if|else|new|true|false|null|interface|type|void|string|number|boolean)\b|\b\d+\b)/g;
		return this.source()
			.split(pattern)
			.filter(Boolean)
			.map((text) => ({
				text,
				kind: text.startsWith('//')
					? 'comment'
					: /^["']/.test(text)
						? 'string'
						: /^\d+$/.test(text)
							? 'number'
							: /^(import|from|export|class|readonly|const|return|if|else|new|true|false|null|interface|type|void|string|number|boolean)$/.test(
										text,
								  )
								? 'keyword'
								: '',
			}));
	});
	async copy(): Promise<void> {
		try {
			if (!navigator.clipboard) throw new Error('Clipboard unavailable');
			await navigator.clipboard.writeText(this.source());
			this.copied.set(true);
			this.feedback.set('Code copied to clipboard.');
		} catch {
			this.copied.set(false);
			this.feedback.set('Clipboard unavailable. Select the code and copy it manually.');
		}
	}
}
