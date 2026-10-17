import { describe, expect, it } from 'vitest';
import { chapters } from '$lib/content/toc';
import { edges, stations, stationById, upstream, downstream, nextChapter, W, H, LABEL_Y, LINE } from './layout';

describe('the course map', () => {
	it('has a station for every chapter, inside the map', () => {
		expect(stations.map((s) => s.id)).toEqual(chapters.map((c) => c.id));
		for (const s of stations) {
			expect(s.x - s.half).toBeGreaterThanOrEqual(0);
			expect(s.x + s.half).toBeLessThanOrEqual(W);
			expect(s.y + LABEL_Y + (s.lines.length - 1) * LINE).toBeLessThan(H);
		}
	});

	it('keeps neighbouring labels apart', () => {
		for (const s of stations) {
			// an estimate of a line’s width: half an em per character (checked against the browser’s)
			const size = s.dense ? 13 : 14;
			for (const l of s.lines) expect(l.length * size * 0.5, `${s.num} “${l}”`).toBeLessThan(2 * s.half);
		}
	});

	it('draws every prerequisite pointing forward along the reading order', () => {
		expect(edges.length).toBe(chapters.reduce((n, c) => n + c.prereqs.length, 0));
		for (const e of edges) {
			const a = stationById.get(e.from)!;
			const b = stationById.get(e.to)!;
			expect(a.index, e.key).toBeLessThan(b.index);
			expect(e.len).toBeGreaterThan(Math.hypot(b.x - a.x, b.y - a.y) - 1e-6);
		}
	});

	it('finds what a chapter builds on, and how far back', () => {
		const up = upstream('homology/chains');
		expect(up.get('homology/cycles-and-boundaries')).toBe(1);
		expect(up.get('foundations/abelian-groups')).toBe(1);
		expect(up.get('topology/euler-characteristic')).toBe(2);
		// the shortest way back counts: 1.1 is reached through 1.4 as well as through Part II
		expect(up.get('foundations/sets-and-functions')).toBe(4);
		expect(up.has('homology/chains')).toBe(false);
		const down = downstream('homology/chains');
		expect(down.get('homology/homology-groups')).toBe(1);
		expect(down.has('prelude/shape-of-a-question')).toBe(false);
		for (const c of chapters) for (const [id] of upstream(c.id)) expect(downstream(id).has(c.id)).toBe(true);
	});

	it('suggests carrying on after the chapter read most recently', () => {
		expect(nextChapter({})).toBe(chapters[0].id);
		// read 2.1 and 2.2 last, after 0.1: carry on with 2.3
		expect(nextChapter({ 'prelude/shape-of-a-question': 1, 'topology/spaces': 2, 'topology/gluing': 3 })).toBe('topology/homotopy');
		// came back to the start most recently: the first chapter not yet read after it
		expect(nextChapter({ 'topology/spaces': 1, 'prelude/shape-of-a-question': 2 })).toBe('prelude/reading-math');
		// the last chapter read most recently: go back for the first one missed
		const all = Object.fromEntries(chapters.map((c, i) => [c.id, i]));
		delete all['foundations/groups'];
		expect(nextChapter(all)).toBe('foundations/groups');
		expect(nextChapter(Object.fromEntries(chapters.map((c) => [c.id, 1])))).toBeUndefined();
	});
});
