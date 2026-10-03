import { describe, expect, it } from 'vitest';
import { toys, spectral, pageDims, bruteForceDim, differentialsOn, aliveOn, LARGE_P, type Filtered } from './spectral';

function checkAgainstDefinition(F: Filtered, p: number) {
	const S = spectral(F, p);
	for (let r = 1; r <= 4; r++) {
		const dims = pageDims(F, S, r);
		for (let pf = 0; pf <= 3; pf++)
			for (let n = 0; n <= 3; n++) {
				const expected = bruteForceDim(F, r, pf, n, p);
				expect(dims.get(`${pf},${n - pf}`) ?? 0, `${F.id} E^${r}_{${pf},${n - pf}}`).toBe(expected);
			}
	}
}

describe('spectral sequence of a filtered complex', () => {
	it('toys are filtered chain complexes (∂ lowers dimension, respects stages, ∂∂ = 0)', () => {
		for (const F of Object.values(toys)) {
			const byName = new Map(F.gens.map((g) => [g.name, g]));
			for (const g of F.gens) {
				const bd = g.bd ?? {};
				for (const t of Object.keys(bd)) {
					const h = byName.get(t)!;
					expect(h.dim).toBe(g.dim - 1);
					expect(h.filt).toBeLessThanOrEqual(g.filt);
				}
				// ∂∂ = 0: the coefficient of every u in ∂(∂g) vanishes
				for (const u of F.gens) {
					let total = 0;
					for (const [t, c1] of Object.entries(bd)) total += c1 * (byName.get(t)!.bd?.[u.name] ?? 0);
					expect(total).toBe(0);
				}
			}
		}
	});
	it('pages agree with the subquotient definition', () => {
		for (const F of Object.values(toys)) {
			checkAgainstDefinition(F, LARGE_P);
			checkAgainstDefinition(F, 2);
		}
	});
	it('two disks on a segment: d¹ twice, then a d²', () => {
		const F = toys.disks;
		const S = spectral(F);
		const name = (i: number) => F.gens[i].name;
		expect(differentialsOn(S, 1).map((d) => `${name(d.from)}→${name(d.to)}`).sort()).toEqual(['f→b', 't→w']);
		expect(differentialsOn(S, 2).map((d) => `${name(d.from)}→${name(d.to)}`)).toEqual(['e→c']);
		expect(S.last).toBe(3);
		expect([...aliveOn(F, S, 3)].map(name)).toEqual(['v']);
	});
	it('ℝP² by skeleta: over ℚ a d¹ kills a and s; over ℤ/2 nothing dies', () => {
		const F = toys.rp2;
		expect(spectral(F).survivors.map((i) => F.gens[i].name)).toEqual(['v']);
		expect(spectral(F, 2).survivors.map((i) => F.gens[i].name)).toEqual(['v', 'a', 's']);
	});
	it('torus by skeleta degenerates at E¹', () => {
		const S = spectral(toys.torus);
		expect(S.pairs.length).toBe(0);
		expect(S.last).toBe(1);
	});
});
