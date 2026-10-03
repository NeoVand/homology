// Three small categories to explore by hand: a path with a shortcut, the
// divisors of 12 ordered by divisibility, and the rotations of a triangle
// (a group viewed as a category with one object).

export interface CatObject {
	id: string;
	tex: string;
	x: number;
	y: number;
}

export interface CatArrow {
	id: string;
	/** TeX name of the arrow */
	tex: string;
	src: string;
	tgt: string;
	/** generator (always drawn), composite (drawn faintly until you build it) or identity */
	kind: 'gen' | 'comp' | 'id';
	/** curvature for drawing (see diagram.arrow); for loops: the direction angle */
	bend?: number;
	/** loop size for endomorphisms */
	loopR?: number;
}

export interface SmallCategory {
	id: string;
	title: string;
	blurb: string;
	objects: CatObject[];
	arrows: CatArrow[];
	/** g ∘ f (first f, then g); null if not composable */
	compose(g: string, f: string): string | null;
	/** TeX for "g ∘ f" */
	composeTeX?(g: string, f: string): string;
}

function byId(arrows: CatArrow[]) {
	return new Map(arrows.map((a) => [a.id, a]));
}

/** The free category on A →f B →g C →h D plus a shortcut k: A → C. */
export function pathCategory(): SmallCategory {
	const objects: CatObject[] = [
		{ id: 'A', tex: 'A', x: 90, y: 170 },
		{ id: 'B', tex: 'B', x: 240, y: 70 },
		{ id: 'C', tex: 'C', x: 420, y: 70 },
		{ id: 'D', tex: 'D', x: 570, y: 170 }
	];
	const ids: CatArrow[] = objects.map((o, i) => ({
		id: `1${o.id}`,
		tex: `1_{${o.id}}`,
		src: o.id,
		tgt: o.id,
		kind: 'id',
		bend: [Math.PI * 0.75, -Math.PI / 2, -Math.PI / 2, Math.PI * 0.25][i],
		loopR: 15
	}));
	const arrows: CatArrow[] = [
		...ids,
		{ id: 'f', tex: 'f', src: 'A', tgt: 'B', kind: 'gen', bend: 0.08 },
		{ id: 'g', tex: 'g', src: 'B', tgt: 'C', kind: 'gen', bend: 0.0 },
		{ id: 'h', tex: 'h', src: 'C', tgt: 'D', kind: 'gen', bend: 0.08 },
		{ id: 'k', tex: 'k', src: 'A', tgt: 'C', kind: 'gen', bend: -0.24 },
		{ id: 'gf', tex: 'g\\circ f', src: 'A', tgt: 'C', kind: 'comp', bend: 0.02 },
		{ id: 'hg', tex: 'h\\circ g', src: 'B', tgt: 'D', kind: 'comp', bend: 0.02 },
		{ id: 'hk', tex: 'h\\circ k', src: 'A', tgt: 'D', kind: 'comp', bend: -0.2 },
		{ id: 'hgf', tex: 'h\\circ g\\circ f', src: 'A', tgt: 'D', kind: 'comp', bend: -0.34 }
	];
	const table: Record<string, string> = { 'g,f': 'gf', 'hg,f': 'hgf', 'h,g': 'hg', 'h,k': 'hk', 'h,gf': 'hgf' };
	const A = byId(arrows);
	return {
		id: 'path',
		title: 'A small category',
		blurb: 'Four objects, four generating arrows, and every composite they force.',
		objects,
		arrows,
		compose(g, f) {
			const G = A.get(g)!;
			const F = A.get(f)!;
			if (F.tgt !== G.src) return null;
			if (F.kind === 'id') return g;
			if (G.kind === 'id') return f;
			return table[`${g},${f}`] ?? null;
		}
	};
}

/** The divisors of 12, with an arrow a → b exactly when a divides b. */
export function divisorCategory(): SmallCategory {
	const pos: Record<number, [number, number]> = {
		1: [330, 330],
		2: [220, 240],
		3: [440, 240],
		4: [110, 150],
		6: [330, 150],
		12: [220, 60]
	};
	const ds = [1, 2, 3, 4, 6, 12];
	const objects: CatObject[] = ds.map((d) => ({ id: String(d), tex: String(d), x: pos[d][0], y: pos[d][1] }));
	const hasse = new Set(['1|2', '1|3', '2|4', '2|6', '3|6', '4|12', '6|12']);
	const arrows: CatArrow[] = [];
	for (const a of ds)
		for (const b of ds)
			if (b % a === 0) {
				const id = `${a}|${b}`;
				if (a === b) arrows.push({ id, tex: `${a}\\mid ${a}`, src: String(a), tgt: String(b), kind: 'id', bend: a === 1 ? Math.PI / 2 : -Math.PI / 2, loopR: 12 });
				else
					arrows.push({
						id,
						tex: `${a}\\mid ${b}`,
						src: String(a),
						tgt: String(b),
						kind: hasse.has(id) ? 'gen' : 'comp',
						bend: hasse.has(id) ? 0 : id === '1|12' ? 0.32 : id === '2|12' ? -0.22 : id === '3|12' ? 0.22 : id === '1|4' ? -0.2 : 0.2
					});
			}
	return {
		id: 'divisors',
		title: 'Divisors of 12',
		blurb: 'An arrow a → b means “a divides b”. Composition is the fact that divisibility is transitive.',
		objects,
		arrows,
		compose(g, f) {
			const [a, b] = f.split('|');
			const [b2, c] = g.split('|');
			if (b !== b2) return null;
			return `${a}|${c}`;
		}
	};
}

/** The rotations of an equilateral triangle: a group, seen as a category with one object. */
export function rotationCategory(): SmallCategory {
	const objects: CatObject[] = [{ id: '*', tex: '\\bigstar', x: 330, y: 200 }];
	const arrows: CatArrow[] = [
		{ id: 'r0', tex: 'e', src: '*', tgt: '*', kind: 'id', bend: Math.PI / 2, loopR: 30 },
		{ id: 'r1', tex: 'r', src: '*', tgt: '*', kind: 'gen', bend: -Math.PI * 0.75, loopR: 44 },
		{ id: 'r2', tex: 'r^2', src: '*', tgt: '*', kind: 'gen', bend: -Math.PI * 0.25, loopR: 44 }
	];
	return {
		id: 'rotations',
		title: 'Rotations of a triangle',
		blurb: 'One object; the arrows are the three rotations, and composing is doing one rotation after another.',
		objects,
		arrows,
		compose(g, f) {
			const k = (Number(g.slice(1)) + Number(f.slice(1))) % 3;
			return `r${k}`;
		}
	};
}

export const presets = { path: pathCategory, divisors: divisorCategory, rotations: rotationCategory } as const;

/** Every composable triple: check (h∘g)∘f = h∘(g∘f) and the unit laws. Returns violations. */
export function checkAxioms(C: SmallCategory): string[] {
	const bad: string[] = [];
	const A = new Map(C.arrows.map((a) => [a.id, a]));
	const idOf = (o: string) => C.arrows.find((a) => a.kind === 'id' && a.src === o)!.id;
	for (const f of C.arrows) {
		if (C.compose(idOf(f.tgt), f.id) !== f.id) bad.push(`left unit ${f.id}`);
		if (C.compose(f.id, idOf(f.src)) !== f.id) bad.push(`right unit ${f.id}`);
		for (const g of C.arrows) {
			if (g.src !== f.tgt) continue;
			const gf = C.compose(g.id, f.id);
			if (!gf || !A.has(gf)) {
				bad.push(`missing ${g.id}∘${f.id}`);
				continue;
			}
			const GF = A.get(gf)!;
			if (GF.src !== f.src || GF.tgt !== g.tgt) bad.push(`ends ${g.id}∘${f.id}`);
			for (const h of C.arrows) {
				if (h.src !== g.tgt) continue;
				const left = C.compose(C.compose(h.id, g.id)!, f.id);
				const right = C.compose(h.id, gf);
				if (left !== right) bad.push(`assoc ${h.id},${g.id},${f.id}`);
			}
		}
	}
	return bad;
}
