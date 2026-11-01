import { connectPopupListeners } from './popup-listeners';

describe('Popup listeners', () => {
	it('captures nested scrolling and removes every attached listener', () => {
		const host = document.createElement('div'),
			nested = document.createElement('div');
		host.appendChild(nested);
		document.body.appendChild(host);
		const reposition = jasmine.createSpy('reposition'),
			outside = jasmine.createSpy('outside');
		const cleanup = connectPopupListeners(document, host, outside, reposition);
		nested.dispatchEvent(new Event('scroll'));
		document.body.click();
		expect(reposition).toHaveBeenCalledTimes(1);
		expect(outside).toHaveBeenCalledTimes(1);
		cleanup();
		nested.dispatchEvent(new Event('scroll'));
		document.body.click();
		expect(reposition).toHaveBeenCalledTimes(1);
		expect(outside).toHaveBeenCalledTimes(1);
		host.remove();
	});
});
