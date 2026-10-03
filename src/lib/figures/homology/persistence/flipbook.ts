// The filtration flip-book: an irregular pentagon whose Vietoris–Rips filtration
// tells a complete little story. Steps and narration are generated from the
// actual reduction, so the text always matches the mathematics.
import { ripsFiltration, reduce, type Pt, type FSimplex } from './ph';

export const pentagon: Pt[] = [
	[-0.05, 0.81],
	[-0.82, 0.5],
	[-0.78, -0.53],
	[0.4, -0.86],
	[1.07, 0.04]
];

export interface FlipStep {
	/** the simplices present after this step (indices into `simplices`) */
	upto: number;
	/** the simplex added in this step (−1 for the opening step) */
	added: number;
	r: number;
	kind: 'start' | 'merge' | 'loop' | 'instant-loop' | 'instant-fill' | 'fill';
	title: string;
	/** narration with \( … \) math */
	body: string;
	/** a vertex to ring (the oldest point of the piece that dies) */
	ring?: number;
}

const fmt = (x: number) => x.toFixed(2);
const words = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const word = (n: number) => words[n] ?? String(n);
const name = (s: FSimplex) => s.verts.join('');

export function flipbook(pts: Pt[] = pentagon) {
	const all = ripsFiltration(pts, 2);
	const stop = all.find((s) => s.verts.length === 2 && s.verts[0] === 0 && s.verts[1] === 3)!.value;
	const simplices = all.filter((s) => s.value <= stop + 1e-12);
	const red = reduce(simplices);
	const nv = pts.length;

	// union–find replay to know which pieces merge (elder = smallest label)
	const parent = Array.from({ length: nv }, (_, i) => i);
	const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])));

	const steps: FlipStep[] = [
		{
			upto: nv - 1,
			added: -1,
			r: 0,
			kind: 'start',
			title: `r = 0: ${word(nv)} points`,
			body: `At \\(r = 0\\) the complex is just the ${word(nv)} points: ${word(nv)} separate pieces, so ${word(nv)} \\(H_0\\) bars begin at once.`
		}
	];
	const deathOf = new Map<number, number>(); // birth simplex → death simplex
	for (const p of red.pairs) if (p.deathIdx >= 0) deathOf.set(p.birthIdx, p.deathIdx);

	for (let j = nv; j < simplices.length; j++) {
		const s = simplices[j];
		const r = s.value;
		if (s.verts.length === 2) {
			const [a, b] = s.verts;
			const ra = find(a);
			const rb = find(b);
			if (ra !== rb) {
				const young = Math.max(ra, rb);
				const old = Math.min(ra, rb);
				parent[young] = old;
				steps.push({
					upto: j,
					added: j,
					r,
					kind: 'merge',
					ring: young,
					title: `edge ${name(s)}: pieces merge`,
					body:
						`At \\(r = ${fmt(r)}\\) the discs around ${a} and ${b} touch, so the edge \\(${name(s)}\\) appears and two pieces become one. ` +
						`Both pieces were born at \\(r = 0\\); breaking the tie by labels, the piece whose oldest point is ${old} counts as the elder, ` +
						`so the bar of the younger piece (oldest point ${young}, ringed) ends here — the elder rule.`
				});
			} else {
				const d = deathOf.get(j);
				const instant = d !== undefined && simplices[d].value === r;
				steps.push({
					upto: j,
					added: j,
					r,
					kind: instant ? 'instant-loop' : 'loop',
					title: instant ? `edge ${name(s)}: a short-lived loop` : `edge ${name(s)}: a loop is born`,
					body: instant
						? `At \\(r = ${fmt(r)}\\) the edge \\(${name(s)}\\) appears. Its ends were already in the same piece, so it closes a new loop — ` +
							`but every triangle through \\(${name(s)}\\) whose other two edges already exist appears at this very same radius (next step).`
						: `At \\(r = ${fmt(r)}\\) the edge \\(${name(s)}\\) appears. Points ${a} and ${b} were already in the same piece, so the new edge closes a loop around the middle: ` +
							`a 1-dimensional hole is born, and an \\(H_1\\) bar starts.`
				});
			}
		} else {
			// a triangle: it kills the class created by red.low[j]
			const i = red.low[j];
			const bornAt = simplices[i].value;
			const instant = bornAt === r;
			steps.push({
				upto: j,
				added: j,
				r,
				kind: instant ? 'instant-fill' : 'fill',
				title: instant ? `triangle ${name(s)} fills in` : `triangle ${name(s)}: the hole dies`,
				body: instant
					? `The triangle \\(${name(s)}\\) is filled in at \\(r = ${fmt(r)}\\), together with its longest edge. It fills the loop that edge \\(${name(simplices[i])}\\) had just closed: ` +
						`that loop is born and dies at the same instant — a bar of length zero, which we do not draw.`
					: `The triangle \\(${name(s)}\\) is filled in at \\(r = ${fmt(r)}\\). Now the big loop is the boundary of the filled triangles, so it is no longer a hole: ` +
						`the \\(H_1\\) bar born at \\(r = ${fmt(bornAt)}\\) ends here. We stop the film: from now on the complex only fills up.`
			});
		}
	}
	return { simplices, reduction: red, steps, stop };
}
