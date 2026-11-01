import config from '../../../site.config.json';
import { appLinks } from '../../../../shared/configuration/app-links';
import { packageMetadata } from '../../../../shared/content/package-metadata';
import { registrySnapshot } from '../content/generated/registry.generated';
export const site = {
	...config,
	publicUrl: config.publicUrl as string | null,
	playground: config.playgroundUrl || (!config.publicUrl ? appLinks.playground : null),
	repository: packageMetadata.repository,
	issues: packageMetadata.issues,
	registry: registrySnapshot,
	metadata: packageMetadata,
};
