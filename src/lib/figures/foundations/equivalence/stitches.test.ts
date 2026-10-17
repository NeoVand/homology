import { describe, expect, it } from 'vitest';
import { threadStates, threads, DOTS } from './stitches';

const STEP = 1 / 2000;

describe('the threads of Figure 1.2.7', () => {
	it('are all showing on the square, and all closed on the torus', () => {
		const s0 = threadStates(0);
		for (const s of s0) expect(s.alpha).toBe(1);
		const s1 = threadStates(1);
		for (const s of s1) expect(s.alpha).toBe(0);
	});

	it('close in the right order: the b-sides with the roll, the a-sides with the bend', () => {
		const tube = threadStates(0.46);
		threads.forEach((th, k) => {
			if (th.kind === 'b' || th.kind === 'p') expect(tube[k].alpha, th.kind).toBe(0);
			else expect(tube[k].alpha, th.kind).toBe(1);
		});
	});

	it('bow in a direction perpendicular to their chord at every moment (no flips)', () => {
		for (let t = 0; t <= 1; t += STEP) {
			threadStates(t).forEach((s, k) => {
				if (s.alpha > 0) expect(s.margin, `${threads[k].kind} at t=${t.toFixed(4)}`).toBeGreaterThan(0.99);
			});
		}
	});

	it('change continuously: no dot jumps and no fade jumps between nearby moments', () => {
		let prev = threadStates(0).map((s) => ({ dots: s.dots.slice(), alpha: s.alpha }));
		let worstMove = 0;
		let worstFade = 0;
		for (let t = STEP; t <= 1 + 1e-9; t += STEP) {
			const cur = threadStates(t);
			cur.forEach((s, k) => {
				worstFade = Math.max(worstFade, Math.abs(s.alpha - prev[k].alpha));
				if (s.alpha > 0 || prev[k].alpha > 0)
					for (let i = 0; i < DOTS * 3; i++) worstMove = Math.max(worstMove, Math.abs(s.dots[i] - prev[k].dots[i]));
			});
			prev = cur.map((s) => ({ dots: s.dots.slice(), alpha: s.alpha }));
		}
		// at 2000 steps across the whole fold, nothing visible moves more than a hair per step
		// (the sheet itself moves up to 0.0075 per step; the arcs swing at most a little faster)
		expect(worstMove).toBeLessThan(0.02);
		// and no thread fades out in less than 1/30 of the fold (about a quarter of a second when playing)
		expect(worstFade).toBeLessThan(30 / 2000);
	});
});
