// The Euler–Poincaré ledger: add the simplices of a complex one at a time
// (faces before cofaces). Each new k-simplex either creates a new k-cycle
// ("positive": b_k goes up) or kills an existing (k−1)-class ("negative":
// b_{k−1} goes down). Mod-2 column reduction decides which, and pairs each
// negative simplex with the positive one whose class it kills.
import type { SimplicialComplex } from '$lib/math/complex';

export interface LedgerEvent {
	dim: number;
	/** index of the simplex in K.simplices[dim] */
	index: number;
	positive: boolean;
	/** for a negative simplex: the event number of the positive simplex it pairs with */
	partner: number | null;
	/** Betti numbers (mod 2) after this event */
	betti: number[];
	/** simplex counts after this event */
	counts: number[];
}

export function ledger(K: SimplicialComplex): LedgerEvent[] {
	const order: [number, number][] = [];
	for (let k = 0; k <= K.dim; k++) for (let i = 0; i < K.count(k); i++) order.push([k, i]);
	const pos = new Map<string, number>();
	order.forEach(([k, i], n) => pos.set(`${k}:${i}`, n));

	const pivotOwner = new Map<number, number>(); // low → event number of the column owning it
	const reduced = new Map<number, Set<number>>(); // event number → reduced column
	const events: LedgerEvent[] = [];
	const betti = new Array<number>(K.dim + 1).fill(0);
	const counts = new Array<number>(K.dim + 1).fill(0);
	const cols = Array.from({ length: K.dim + 1 }, (_, k) => K.boundaryColumns(k));

	order.forEach(([k, i], n) => {
		const col = new Set<number>();
		if (k > 0) for (const [r] of cols[k][i]) col.add(pos.get(`${k - 1}:${r}`)!);
		const low = () => (col.size ? Math.max(...col) : -1);
		let l = low();
		while (l >= 0 && pivotOwner.has(l)) {
			for (const x of reduced.get(pivotOwner.get(l)!)!) {
				if (col.has(x)) col.delete(x);
				else col.add(x);
			}
			l = low();
		}
		counts[k]++;
		if (l < 0) {
			betti[k]++;
			events.push({ dim: k, index: i, positive: true, partner: null, betti: betti.slice(), counts: counts.slice() });
		} else {
			pivotOwner.set(l, n);
			reduced.set(n, col);
			betti[k - 1]--;
			events.push({ dim: k, index: i, positive: false, partner: l, betti: betti.slice(), counts: counts.slice() });
		}
	});
	return events;
}

export const alternating = (xs: number[]) => xs.reduce((s, x, k) => s + (k % 2 ? -x : x), 0);
