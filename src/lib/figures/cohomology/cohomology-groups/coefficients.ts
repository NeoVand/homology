// The coefficient table of §4.2: for each space, homology with ℤ coefficients
// and cohomology with ℤ, ℤ/2 and ℝ coefficients, all from the tested engine.
import { homology, cohomology, type HomologyGroup } from '$lib/math/homology';
import * as ex from '$lib/math/examples';
import type { SimplicialComplex } from '$lib/math/complex';

export interface SpaceEntry {
	id: string;
	label: string;
	make: () => SimplicialComplex;
	/** a one-line description for the table */
	note: string;
}

export const spaces: SpaceEntry[] = [
	{ id: 'circle', label: 'Circle', make: () => ex.circle(3), note: 'one loop' },
	{ id: 'figureEight', label: 'Figure eight', make: ex.figureEight, note: 'two loops joined at a point' },
	{ id: 'sphere', label: 'Sphere', make: ex.sphereTetra, note: 'one enclosed void' },
	{ id: 'torus', label: 'Torus', make: ex.torus7, note: 'orientable, two loops and a void' },
	{ id: 'genus2', label: 'Genus 2', make: ex.genus2, note: 'two handles' },
	{ id: 'mobius', label: 'Möbius band', make: ex.mobius5, note: 'one-sided, with boundary' },
	{ id: 'klein', label: 'Klein bottle', make: () => ex.kleinGrid(3, 3), note: 'one-sided, closed' },
	{ id: 'rp2', label: 'Projective plane', make: ex.projectivePlane6, note: 'one-sided, closed' }
];

export interface Cell {
	text: string;
	tex: string;
	/** the group has torsion (ℤ/n summands) */
	torsion: boolean;
}

const sup = (n: number) =>
	String(n)
		.split('')
		.map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[+d])
		.join('');

function cell(g: HomologyGroup, base: 'Z' | 'Z2' | 'R'): Cell {
	const B = base === 'Z' ? 'ℤ' : base === 'R' ? 'ℝ' : 'ℤ/2';
	const BT = base === 'Z' ? '\\mathbb{Z}' : base === 'R' ? '\\mathbb{R}' : '\\mathbb{Z}/2';
	const parts: string[] = [];
	const tparts: string[] = [];
	if (g.rank === 1) {
		parts.push(B);
		tparts.push(BT);
	} else if (g.rank > 1) {
		parts.push(base === 'Z2' ? `(ℤ/2)${sup(g.rank)}` : `${B}${sup(g.rank)}`);
		tparts.push(base === 'Z2' ? `(\\mathbb{Z}/2)^{${g.rank}}` : `${BT}^{${g.rank}}`);
	}
	for (const t of g.torsion) {
		parts.push(`ℤ/${t}`);
		tparts.push(`\\mathbb{Z}/${t}`);
	}
	return {
		text: parts.length ? parts.join(' ⊕ ') : '0',
		tex: tparts.length ? tparts.join(' \\oplus ') : '0',
		torsion: g.torsion.length > 0
	};
}

export interface Table {
	hom: Cell[];
	Z: Cell[];
	Z2: Cell[];
	R: Cell[];
	/** dimensions of H^k(X; ℝ) */
	betti: number[];
	/** the torsion orders of H_k(X; ℤ), per degree */
	torsion: number[][];
}

const cache = new Map<string, Table>();

export function tableFor(id: string): Table {
	const hit = cache.get(id);
	if (hit) return hit;
	const s = spaces.find((x) => x.id === id)!;
	const K = s.make();
	const H = homology(K, 'Z');
	// over a field of characteristic 0 the ranks are the same over ℚ and over ℝ
	const R = cohomology(K, 'Q');
	const t: Table = {
		hom: H.map((g) => cell(g, 'Z')),
		Z: cohomology(K, 'Z').map((g) => cell(g, 'Z')),
		Z2: cohomology(K, 'Z2').map((g) => cell(g, 'Z2')),
		R: R.map((g) => cell(g, 'R')),
		betti: R.map((g) => g.rank),
		torsion: H.map((g) => g.torsion)
	};
	cache.set(id, t);
	return t;
}
