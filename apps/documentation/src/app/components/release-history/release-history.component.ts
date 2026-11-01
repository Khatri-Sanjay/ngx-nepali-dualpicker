import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PublishedPackageService } from '../../../../../shared/content/published-package.service';
import { currentChanges } from '../../content/generated/releases.generated';
import { site } from '../../configuration/site';
@Component({
	selector: 'app-release-history',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './release-history.component.html',
	styleUrl: './release-history.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReleaseHistoryComponent {
	readonly site = site;
	readonly published = inject(PublishedPackageService);
	get registry() {
		return this.published.data();
	}
	readonly changes = currentChanges;
	readonly query = signal('');
	readonly version = signal('all');
	readonly categories = ['Added', 'Changed', 'Fixed', 'Removed', 'Deprecated', 'Security'];
	readonly currentPublished = computed(() =>
		this.registry.releases.find((release) => release.version === site.metadata.version),
	);
	readonly previousReleases = computed(() =>
		this.registry.releases.filter((release) => release.version !== site.metadata.version),
	);
	readonly releases = computed(() =>
		this.previousReleases().filter(
			(release) =>
				(this.version() === 'all' || this.version() === release.version) &&
				release.version.includes(this.query().trim()),
		),
	);
	readonly showCurrent = computed(
		() =>
			['all', site.metadata.version].includes(this.version()) &&
			('release ' + site.metadata.version + ' ' + currentChanges.map((item) => item.text).join(' '))
				.toLowerCase()
				.includes(this.query().toLowerCase()),
	);
	inCategory(category: string) {
		return this.changes.filter((item) => item.category === category);
	}
	releaseId(version: string): string {
		return 'release-' + version.replaceAll('.', '-');
	}
}
