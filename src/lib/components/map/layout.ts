// The geometry of the course map: one row of stations per part, snaking left to
// right and back along the reading order, with the prerequisite graph drawn over
// it. Pure, so that map.test.ts can check it.
import { parts, chapters } from '$lib/content/toc';

/** the map's own units (the SVG viewBox) */
export const W = 1000;
export const ROW = 190;
export const TOP = 120;
const PAD = 150;
export const H = TOP + (parts.length - 1) * ROW + 120;

/** label lines start this far below a station's centre, this far apart */
export const LABEL_Y = 44;
export const LINE = 16;

export interface Station {
	id: string;
	num: string;
	title: string;
	part: string;
	color: string;
	x: number;
	y: number;
	row: number;
	/** position in the reading order */
	index: number;
	/** the title, broken into lines */
	lines: string[];
	/** crowded row: smaller labels */
	dense: boolean;
	/** half the width the station may claim, from the space to its neighbours */
	half: number;
}

// Break a title into as few lines as greedy filling needs (at most `max`
// characters each), then even the lines out, so that no word is left alone.
export function wrap(t: string, max = 16): string[] {
	const words = t.split(' ');
	let count = 0;
	let cur = '';
	for (const w of words) {
		if ((cur + ' ' + w).trim().length > max && cur) {
			count++;
			cur = w;
		} else cur = (cur + ' ' + w).trim();
	}
	if (cur) count++;
	const n = Math.min(4, count);
	let best: string[] = [t];
	let bestScore = Infinity;
	// try every way of cutting the words into n lines (titles are short)
	const cut = (start: number, left: number, acc: string[]) => {
		if (left === 1) {
			const lines = [...acc, words.slice(start).join(' ')];
			const score = Math.max(...lines.map((l) => l.length));
			if (score < bestScore) [best, bestScore] = [lines, score];
			return;
		}
		for (let k = start + 1; k <= words.length - left + 1; k++) cut(k, left - 1, [...acc, words.slice(start, k).join(' ')]);
	};
	cut(0, n, []);
	return best;
}

export const stations: Station[] = [];
parts.forEach((p, r) => {
	const n = p.chapters.length;
	const span = W - 2 * PAD;
	const gap = n <= 1 ? span : n <= 3 ? (0.6 * span) / (n - 1) : span / (n - 1);
	p.chapters.forEach((c, i) => {
		const t = n === 1 ? 0.5 : i / (n - 1);
		const along = r % 2 === 0 ? t : 1 - t;
		const x = n === 1 ? W / 2 : PAD + span * (n <= 3 ? 0.2 + 0.6 * along : along);
		stations.push({
			id: c.id,
			num: c.num,
			title: c.title,
			part: p.id,
			color: p.color,
			x,
			y: TOP + r * ROW,
			row: r,
			index: stations.length,
			lines: wrap(c.title, n >= 8 ? 14 : n === 7 ? 16 : 15),
			dense: n >= 7,
			half: Math.min(60, gap / 2)
		});
	});
});
export const stationById = new Map(stations.map((s) => [s.id, s]));

/** the reading path through every station, with rounded turns between rows */
export const route = (() => {
	let d = `M ${stations[0].x} ${stations[0].y}`;
	for (let i = 1; i < stations.length; i++) {
		const a = stations[i - 1];
		const b = stations[i];
		if (a.row === b.row) d += ` L ${b.x} ${b.y}`;
		else {
			const side = a.row % 2 === 0 ? 1 : -1; // turn on the right after even rows
			const cx = side > 0 ? Math.max(a.x, b.x) + 105 : Math.min(a.x, b.x) - 105;
			d += ` C ${cx} ${a.y}, ${cx} ${b.y}, ${b.x} ${b.y}`;
		}
	}
	return d;
})();

type Pt = [number, number];
export interface Edge {
	key: string;
	/** the prerequisite */
	from: string;
	/** the chapter that builds on it */
	to: string;
	/** from → to, and the same curve traced to → from */
	d: string;
	back: string;
	/** length, in map units */
	len: number;
}

function cubic(p: Pt[], t: number): Pt {
	const s = 1 - t;
	const k = [s * s * s, 3 * s * s * t, 3 * s * t * t, t * t * t];
	return [k.reduce((a, w, i) => a + w * p[i][0], 0), k.reduce((a, w, i) => a + w * p[i][1], 0)];
}

/**
 * A prerequisite as a curve: between rows, an S that leaves and arrives
 * vertically, the way a family tree is drawn; within a row, a bridge arching
 * over the stations in between.
 */
export function edgeCurve(a: Pick<Station, 'x' | 'y'>, b: Pick<Station, 'x' | 'y'>): Pt[] {
	if (Math.abs(a.y - b.y) < 1) {
		const h = Math.min(62, 26 + 0.14 * Math.abs(b.x - a.x));
		return [
			[a.x, a.y],
			[a.x, a.y - h],
			[b.x, b.y - h],
			[b.x, b.y]
		];
	}
	const k = 0.55 * (b.y - a.y);
	return [
		[a.x, a.y],
		[a.x, a.y + k],
		[b.x, b.y - k],
		[b.x, b.y]
	];
}

const fmt = (n: number) => Math.round(n * 10) / 10;
const pathOf = (p: Pt[]) => `M ${fmt(p[0][0])} ${fmt(p[0][1])} C ${p.slice(1).map((q) => `${fmt(q[0])} ${fmt(q[1])}`).join(', ')}`;

export const edges: Edge[] = chapters.flatMap((c) =>
	c.prereqs.map((from) => {
		const a = stationById.get(from)!;
		const b = stationById.get(c.id)!;
		const p = edgeCurve(a, b);
		let len = 0;
		let prev = p[0];
		for (let i = 1; i <= 48; i++) {
			const q = cubic(p, i / 48);
			len += Math.hypot(q[0] - prev[0], q[1] - prev[1]);
			prev = q;
		}
		return { key: `${from}>${c.id}`, from, to: c.id, d: pathOf(p), back: pathOf([...p].reverse()), len };
	})
);

const prereqsOf = new Map(chapters.map((c) => [c.id, c.prereqs]));
const builtOnBy = new Map<string, string[]>(chapters.map((c) => [c.id, []]));
for (const c of chapters) for (const p of c.prereqs) builtOnBy.get(p)!.push(c.id);

/** the chapters directly built on `id` */
export const dependents = (id: string) => builtOnBy.get(id) ?? [];

function reach(id: string, next: (id: string) => string[]): Map<string, number> {
	const seen = new Map<string, number>();
	let frontier = [id];
	for (let depth = 1; frontier.length; depth++) {
		const out: string[] = [];
		for (const f of frontier)
			for (const n of next(f))
				if (!seen.has(n) && n !== id) {
					seen.set(n, depth);
					out.push(n);
				}
		frontier = out;
	}
	return seen;
}

/**
 * Where to carry on reading: the first unvisited chapter after the one opened
 * most recently, or failing that the first unvisited chapter of all.
 * `visited` maps chapter ids to when they were last opened.
 */
export function nextChapter(visited: Record<string, number>): string | undefined {
	let last = -1;
	let when = -Infinity;
	chapters.forEach((c, i) => {
		const t = visited[c.id];
		if (t !== undefined && t > when) [last, when] = [i, t];
	});
	const fresh = chapters.filter((c) => visited[c.id] === undefined);
	return (fresh.find((c) => chapters.indexOf(c) > last) ?? fresh[0])?.id;
}

/** every chapter `id` builds on, with how many steps back it lies */
export const upstream = (id: string) => reach(id, (c) => prereqsOf.get(c) ?? []);
/** every chapter that builds on `id`, with how many steps on it lies */
export const downstream = (id: string) => reach(id, dependents);
