import { configurationExamples } from './generated/configuration-examples.generated';
import { themeTokens } from './generated/theme-tokens.generated';
import metadata from '../../../../../libs/ngx-nepali-dualpicker/package.json';
import { inputRows, outputRows, keyboardRows, tokenRows } from './docs.content';
import { configRows, exportRows } from './api.content';
import { publicMembers } from './api-signatures.generated';
import { publicSurface, typeDeclarations } from './generated/public-surface.generated';
import { migrationRows } from './generated/releases.generated';
import type { ApiRow } from '../components/api-table/api-table.component';
export interface ReferenceBlock {
	rows?: readonly ApiRow[];
	mode?: 'properties' | 'events' | 'methods';
	defaults?: boolean;
	code?: string;
	description?: string;
	declarations?: readonly { name: string; code: string }[];
}
const componentMethods = [
	'setDate',
	'open',
	'close',
	'toggleOpen',
	'clearSelection',
	'switchCalendarType',
	'toggleCalendarType',
	'toggleMode',
	'writeValue',
	'registerOnChange',
	'registerOnTouched',
	'setDisabledState',
	'validate',
	'registerOnValidatorChange',
	'previousMonth',
	'nextMonth',
];
const declarations = Object.entries(typeDeclarations).map(([name, code]) => ({ name, code }));
export const configExampleCode = configurationExamples;
export function referenceData(id: string): ReferenceBlock {
	if (id === 'inputs') return { rows: inputRows, defaults: true };
	if (id === 'outputs') return { rows: outputRows, mode: 'events' };
	if (id === 'config')
		return {
			rows: configRows,
			defaults: true,
			description:
				'All options are optional. Defaults are read from DEFAULT_PICKER_CONFIG. Undefined fields are displayed as not specified. Nested shapes are declared on the public types page.',
		};
	if (id === 'config-examples')
		return {
			declarations: configExampleCode,
			description:
				'Each snippet is an independent typed configuration. Apply changes by replacing the config object. Date examples use BS unless calendar is explicitly set to AD.',
		};
	if (id === 'keyboard') return { rows: keyboardRows };
	if (id === 'format-tokens') return { rows: tokenRows };
	if (id === 'exports')
		return {
			rows: publicSurface.map((item) => ({
				name: item.name + ' (' + item.entryPoint + ')',
				type: item.signature,
				description:
					item.description ||
					exportRows.find((row) => row.name === item.name)?.description ||
					'See its dedicated reference page and generated declaration below.',
			})),
		};
	if (id === 'core-functions')
		return {
			rows: publicSurface
				.filter((item) => item.entryPoint.endsWith('/core') && item.kind === 'function')
				.map((item) => ({
					name: item.name,
					type: item.signature.replace('=>', '→'),
					description: item.description || 'Pure calendar utility; see source-derived signature.',
				})),
			mode: 'methods',
		};
	if (id === 'component-methods')
		return {
			rows:
				publicMembers
					.find((item) => item.name === 'NgxNepaliDualpicker')
					?.rows.filter((row) => componentMethods.includes(row.name)) ?? [],
			mode: 'methods',
			description:
				'Integration methods only. View implementation and lifecycle helpers are intentionally not presented as application APIs. Prefer forms, inputs and outputs.',
		};
	if (id === 'types')
		return {
			declarations,
			description:
				'Exact exported type, interface and enum declarations generated from source. Shared one-based date contracts are re-exported from the pure core entry point. DatePickerValue belongs to the Angular entry point.',
		};
	if (id === 'migration')
		return {
			rows: migrationRows.map((row) => ({
				name: row.before,
				type: row.after,
				description: 'Replace the previous name; no compatibility alias exists in this workspace.',
			})),
		};
	if (id === 'provider-exports')
		return {
			rows: publicSurface
				.filter((item) =>
					[
						'provideNepaliDualpicker',
						'DATE_PICKER_CONFIG',
						'DEFAULT_PICKER_CONFIG',
						'nepaliDateValidator',
						'PRESET_THEMES',
						'EDITABLE_DATE_FORMATS',
					].includes(item.name),
				)
				.map((item) => ({
					name: item.name,
					type: item.signature,
					description:
						item.description ||
						exportRows.find((row) => row.name === item.name)?.description ||
						'Exported constant; see its declaration and setup guide.',
				})),
		};
	if (id === 'package')
		return {
			rows: [
				{ name: metadata.name, type: metadata.version, description: metadata.description },
				{ name: 'license', type: metadata.license, description: 'See the bundled MIT LICENSE.' },
				...Object.entries(metadata.peerDependencies).map(([name, type]) => ({
					name,
					type,
					description: 'Required application peer dependency.',
				})),
				...Object.entries(metadata.dependencies).map(([name, type]) => ({
					name,
					type,
					description: 'Runtime package dependency.',
				})),
			],
		};
	if (id === 'theme-tokens')
		return {
			rows: themeTokens,
			defaults: true,
			declarations: declarations.filter((item) => item.name === 'DatePickerTheme'),
			description:
				'Theme settings map to --ndp-* custom properties. Apply theme/customTheme on the picker; CSS variables set by ThemeService are inline on its host and take precedence over inherited variables.',
		};
	if (id in typeDeclarations) return { code: typeDeclarations[id as keyof typeof typeDeclarations] };
	return { rows: publicMembers.find((item) => item.name === id)?.rows ?? [], mode: 'methods' };
}
