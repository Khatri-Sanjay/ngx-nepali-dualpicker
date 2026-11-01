export interface PublishedRelease {
	version: string;
	date: string;
	notesAvailable: boolean;
}
export interface PublishedPackage {
	latest: string;
	checkedAt: string;
	releases: PublishedRelease[];
}
function record(value: unknown): Record<string, unknown> {
	if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid npm metadata.');
	return value as Record<string, unknown>;
}
/** npm time retains unpublished entries; versions is the authority for available releases. */
export function readPublishedPackage(value: unknown): PublishedPackage {
	const data = record(value);
	const versions = record(data['versions']);
	const time = record(data['time']);
	const latest = record(data['dist-tags'])['latest'];
	if (typeof latest !== 'string' || !Object.hasOwn(versions, latest))
		throw new Error('Missing published latest tag.');
	const releases = Object.keys(versions)
		.flatMap((version) => {
			const date = time[version];
			return typeof date === 'string' && Number.isFinite(Date.parse(date))
				? [{ version, date, notesAvailable: false }]
				: [];
		})
		.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
	return { latest, releases, checkedAt: new Date().toISOString() };
}
