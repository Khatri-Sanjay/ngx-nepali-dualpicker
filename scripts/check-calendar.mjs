import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve('dist/ngx-nepali-dualpicker');
const manifest = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const dates = await import(pathToFileURL(path.join(root, manifest.exports['./core'].default)));
const first = { year: 1943, month: 4, day: 14 };
const last = { year: 2082, month: 12, day: 31 };
const finalBs = { year: 2139, month: 9, day: 16 };
assert.deepEqual(dates.convertAdToBs(last), finalBs);
const days = dates.DateCalculator.calculateAdDaysFromReference(last, first) + 1;
for (let offset = 0; offset < days; offset++) {
	const ad = dates.DateCalculator.addDaysToAdDate(first, offset);
	const bs = dates.convertAdToBs(ad);
	assert.deepEqual(dates.convertBsToAd(bs), ad);
	const independentBsOffset = dates.DateCalculator.addDaysToBsDate({ year: 2000, month: 1, day: 1 }, offset);
	assert.deepEqual(dates.convertAdToBs(dates.convertBsToAd(independentBsOffset)), independentBsOffset);
}
assert.throws(() => dates.convertAdToBs('1943-04-13'));
assert.throws(() => dates.convertAdToBs('2083-01-01'));
assert.throws(() => dates.convertBsToAd('2139-09-17'));
const dataset = readFileSync('libs/ngx-nepali-dualpicker/src/lib/core/calendar/calendar-data.ts', 'utf8').replaceAll(
	'\r\n',
	'\n',
);
const report = {
	adToBsToAd: days,
	bsToAdToBs: days,
	firstAd: first,
	lastAd: last,
	firstBs: { year: 2000, month: 1, day: 1 },
	lastBs: finalBs,
	datasetSha256: createHash('sha256').update(dataset).digest('hex'),
	independentHistoricalAccuracy: 'Not established by round trips; authoritative provenance is still required.',
};
mkdirSync('tmp/calendar-check', { recursive: true });
writeFileSync('tmp/calendar-check/report.json', JSON.stringify(report, null, 2));
console.log(
	`Calendar verified: ${days} daily AD→BS→AD and ${days} daily BS→AD→BS round trips; endpoints and unsupported neighbors checked.`,
);
