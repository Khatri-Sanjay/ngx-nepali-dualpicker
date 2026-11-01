import metadata from '../../../libs/ngx-nepali-dualpicker/package.json';

/** Build-time metadata only; implementation is consumed through the public package. */
export const packageMetadata = {
	version: metadata.version,
	author: metadata.author.name,
	repository: metadata.repository.url.replace(/^git\+/, '').replace(/\.git$/, ''),
	npm: `https://www.npmjs.com/package/${metadata.name}`,
	issues: metadata.bugs.url,
	documentation: metadata.homepage,
	angularPeers: metadata.peerDependencies['@angular/core'],
};
