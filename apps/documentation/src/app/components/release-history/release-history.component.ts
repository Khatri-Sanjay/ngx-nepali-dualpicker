import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { registrySnapshot } from '../../content/generated/registry.generated';
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
	readonly registry = registrySnapshot;
	readonly changes = currentChanges;
	readonly query = signal('');
	readonly version = signal('all');
	readonly categories = ['Added', 'Changed', 'Fixed', 'Removed', 'Deprecated', 'Security'];
	readonly releases = computed(() =>
		this.registry.releases.filter(
			(release) =>
				(this.version() === 'all' || this.version() === release.version) &&
				release.version.includes(this.query().trim()),
		),
	);
	readonly showNext = computed(
		() =>
			['all', 'next'].includes(this.version()) &&
			('unreleased ' + site.metadata.version + ' ' + currentChanges.map((item) => item.text).join(' '))
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
