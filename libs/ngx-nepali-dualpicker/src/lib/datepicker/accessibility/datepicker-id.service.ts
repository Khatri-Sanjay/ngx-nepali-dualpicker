import { APP_ID, Injectable, inject } from '@angular/core';

/** App-scoped IDs avoid a process-global counter leaking between SSR requests. */
@Injectable({ providedIn: 'root' })
export class DatepickerIdService {
	private readonly appId = inject(APP_ID);
	private next = 0;
	create(): string {
		return `ndp-${this.appId}-${this.next++}`;
	}
}
