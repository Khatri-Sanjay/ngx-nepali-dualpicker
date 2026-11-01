import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
export interface ApiRow {
	readonly name: string;
	readonly type: string;
	readonly description: string;
	readonly defaultValue?: string;
	readonly required?: boolean;
}
@Component({
	selector: 'app-api-table',
	standalone: true,
	changeDetection: ChangeDetectionStrategy.OnPush,
	template: `<div class="table-scroll" tabindex="0" role="region" [attr.aria-label]="caption">
		<table>
			<caption>
				{{
					caption
				}}
			</caption>
			<thead>
				<tr>
					<th scope="col">{{ mode === 'events' ? 'Event' : mode === 'methods' ? 'Method' : 'Property' }}</th>
					<th scope="col">
						{{ mode === 'events' ? 'Payload' : mode === 'methods' ? 'Parameters' : 'Type / signature' }}
					</th>
					@if (mode === 'methods') {
						<th scope="col">Return type</th>
					}
					@if (showDefaults) {
						<th scope="col">Default</th>
						<th scope="col">Required</th>
					}
					<th scope="col">Description</th>
				</tr>
			</thead>
			<tbody>
				@for (row of rows; track row.name) {
					<tr>
						<th scope="row">
							<code>{{ row.name }}</code>
						</th>
						<td>
							<code>{{ mode === 'methods' ? parameters(row.type) : row.type }}</code>
						</td>
						@if (mode === 'methods') {
							<td>
								<code>{{ returns(row.type) }}</code>
							</td>
						}
						@if (showDefaults) {
							<td>
								<code>{{ row.defaultValue ?? 'Not specified' }}</code>
							</td>
							<td>{{ row.required ? 'Yes' : 'No' }}</td>
						}
						<td>{{ row.description }}</td>
					</tr>
				}
			</tbody>
		</table>
	</div>`,
	styles: [
		`
			:host {
				display: block;
				min-width: 0;
			}
			.table-scroll {
				overflow: auto;
				max-width: 100%;
				border: 1px solid var(--doc-border);
				border-radius: 9px;
			}
			table {
				border-collapse: collapse;
				width: 100%;
				text-align: left;
				font-size: 12px;
				line-height: 1.7;
			}
			caption {
				text-align: left;
				font-weight: 650;
				padding: 16px;
				color: var(--doc-text);
			}
			th,
			td {
				padding: 13px 16px;
				border-top: 1px solid var(--doc-border);
				vertical-align: top;
			}
			thead {
				background: var(--doc-surface);
				color: var(--doc-muted);
			}
			td {
				color: var(--doc-muted);
			}
			tbody th {
				font-weight: 500;
				color: var(--doc-accent);
			}
			code {
				overflow-wrap: anywhere;
				white-space: pre-wrap;
				font:
					11px/1.7 ui-monospace,
					Consolas,
					monospace;
			}
			.table-scroll:focus-visible {
				outline: 2px solid var(--doc-accent);
			}
		`,
	],
})
export class ApiTableComponent {
	@Input() showDefaults = false;
	@Input() caption = 'API reference';
	@Input({ required: true }) rows: readonly ApiRow[] = [];
	@Input() mode: 'properties' | 'events' | 'methods' = 'properties';
	parameters(signature: string): string {
		return signature.includes('→') ? signature.slice(0, signature.lastIndexOf('→')).trim() : signature;
	}
	returns(signature: string): string {
		return signature.includes('→') ? signature.slice(signature.lastIndexOf('→') + 1).trim() : 'See signature';
	}
}
