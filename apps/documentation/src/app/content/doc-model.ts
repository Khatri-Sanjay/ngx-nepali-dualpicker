export const docGroups = [
	'Introduction',
	'Getting Started',
	'Installation',
	'Components',
	'Directives',
	'Pipes',
	'Services',
	'Theming',
	'Guides',
	'API Reference',
	'Changelog',
	'Migration',
	'Contributing',
] as const;
export type DocGroup = (typeof docGroups)[number];
export interface DocSection {
	readonly id?: string;
	readonly title: string;
	readonly body: string;
	readonly code?: string;
	readonly language?: string;
	readonly warning?: boolean;
	readonly links?: readonly { label: string; href: string; external?: boolean }[];
}
export interface DocPage {
	readonly id: string;
	readonly title: string;
	readonly description: string;
	readonly group: DocGroup | 'Overview' | 'Learn' | 'Reference';
	readonly keywords: string;
	readonly sections: readonly DocSection[];
	readonly examples?: readonly string[];
	readonly references?: readonly string[];
	readonly source?: string;
}
export const pagePath = (id: string): string => (id === 'home' ? '/introduction' : `/${id}`);
export const sectionId = (title: string): string =>
	title
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
