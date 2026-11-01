import { appLinks } from '../../../shared/configuration/app-links';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { packageMetadata } from '../../../shared/content/package-metadata';
@Component({
	selector: 'app-root',
	standalone: true,
	imports: [RouterOutlet],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
	readonly metadata = packageMetadata;
	readonly appLinks = appLinks;
	readonly dark = signal(false);
	toggleDark(): void {
		this.dark.update((value) => !value);
	}
}
