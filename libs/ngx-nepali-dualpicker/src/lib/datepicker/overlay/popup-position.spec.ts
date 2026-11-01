import { calculatePopupPosition } from './popup-position';

describe('Popup adapter', () => {
	it('flips a bottom-aligned popup above the input rather than overlapping it', () => {
		const anchor = { left: 100, right: 740, width: 640, top: 650, bottom: 694 };
		const result = calculatePopupPosition(anchor, { width: 1000, height: 720 }, 'bottom-left', 360);
		expect(result.opensTop).toBeTrue();
		expect(result.top + 360).toBe(anchor.top - 8);
		expect(result.width).toBe(320);
		expect(result.left).toBe(anchor.left);
	});
	it('keeps the requested top/right alignment when it fits and flips down near the top', () => {
		const result = calculatePopupPosition(
			{ left: 600, right: 900, width: 300, top: 16, bottom: 60 },
			{ width: 1000, height: 720 },
			'top-right',
			360,
		);
		expect(result.opensTop).toBeFalse();
		expect(result.top).toBe(68);
		expect(result.left).toBe(580);
	});
	it('limits height to the available side without covering the input', () => {
		const result = calculatePopupPosition(
			{ left: 30, right: 300, width: 270, top: 200, bottom: 244 },
			{ width: 375, height: 400 },
			'auto',
			500,
		);
		expect(result.opensTop).toBeTrue();
		expect(result.maxHeight).toBe(184);
		expect(result.top).toBe(8);
		expect(result.top + result.maxHeight).toBe(192);
	});
	it('honors themed width and a shifted visual viewport', () => {
		const result = calculatePopupPosition(
			{ left: 950, right: 1350, width: 400, top: 300, bottom: 344 },
			{ left: 800, top: 100, width: 400, height: 600 },
			'bottom-left',
			250,
			360,
		);
		expect(result.left).toBe(832);
		expect(result.width).toBe(360);
		expect(result.top).toBe(352);
	});
	it('clamps measured popups into the viewport and flips automatic positioning', () => {
		const result = calculatePopupPosition(
			{ left: 900, right: 1100, width: 200, top: 650, bottom: 690 },
			{ width: 1000, height: 700 },
			'auto',
			400,
		);
		expect(result.left + result.width).toBeLessThanOrEqual(992);
		expect(result.top).toBe(242);
	});
});
