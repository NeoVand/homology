// Exact helpers for "arrow diagrams" between finite sets X = {0..m−1} and Y = {0..n−1}.
// An arrow diagram is a list of arrows [x, y]; it is a *function* when every x has exactly one arrow.

export type Arrow = [number, number];

export interface Classification {
	/** every element of X has exactly one arrow */
	isFunction: boolean;
	/** elements of X with no arrow */
	noArrow: number[];
	/** elements of X with two or more arrows */
	manyArrows: number[];
	/** (only meaningful for functions) no two elements of X land on the same element of Y */
	injective: boolean;
	/** a pair of elements of X that collide, if any */
	collision: [number, number, number] | null; // [x1, x2, y]
	/** (only meaningful for functions) every element of Y is hit */
	surjective: boolean;
	/** elements of Y that are not hit */
	missed: number[];
	bijective: boolean;
}

export function outgoing(arrows: Arrow[], m: number): number[][] {
	const out: number[][] = Array.from({ length: m }, () => []);
	for (const [x, y] of arrows) if (x < m) out[x].push(y);
	return out;
}

export function classify(arrows: Arrow[], m: number, n: number): Classification {
	const live = arrows.filter(([x, y]) => x < m && y < n);
	const out = outgoing(live, m);
	const noArrow = out.flatMap((ys, x) => (ys.length === 0 ? [x] : []));
	const manyArrows = out.flatMap((ys, x) => (ys.length > 1 ? [x] : []));
	const isFunction = noArrow.length === 0 && manyArrows.length === 0;

	const firstPreimage = new Map<number, number>();
	let collision: [number, number, number] | null = null;
	for (let x = 0; x < m; x++) {
		for (const y of out[x]) {
			const prev = firstPreimage.get(y);
			if (prev !== undefined && prev !== x && !collision) collision = [prev, x, y];
			if (prev === undefined) firstPreimage.set(y, x);
		}
	}
	const hit = new Set(live.map(([, y]) => y));
	const missed: number[] = [];
	for (let y = 0; y < n; y++) if (!hit.has(y)) missed.push(y);
	const injective = isFunction && collision === null;
	const surjective = isFunction && missed.length === 0;
	return {
		isFunction,
		noArrow,
		manyArrows,
		injective,
		collision,
		surjective,
		missed,
		bijective: injective && surjective
	};
}

/** Image f(A) = { f(a) : a ∈ A }, sorted. */
export function image(arrows: Arrow[], A: Iterable<number>): number[] {
	const a = new Set(A);
	return [...new Set(arrows.filter(([x]) => a.has(x)).map(([, y]) => y))].sort((p, q) => p - q);
}

/** Preimage f⁻¹(B) = { x : f(x) ∈ B }, sorted (for a function). */
export function preimage(arrows: Arrow[], B: Iterable<number>): number[] {
	const b = new Set(B);
	return [...new Set(arrows.filter(([, y]) => b.has(y)).map(([x]) => x))].sort((p, q) => p - q);
}

/** Compose two functions given as lookup arrays: (g ∘ f)[x] = g[f[x]]. */
export function compose(g: number[], f: number[]): number[] {
	return f.map((y) => g[y]);
}

/** Number of functions from a set of size m to a set of size n. */
export function countFunctions(m: number, n: number): number {
	return n ** m;
}

/** Count injections from an m-set to an n-set: n (n−1) … (n−m+1). */
export function countInjections(m: number, n: number): number {
	let c = 1;
	for (let i = 0; i < m; i++) c *= n - i;
	return Math.max(0, c);
}

/** The interval image f([a, b]) for f(x) = x². */
export function squareImage(a: number, b: number): [number, number] {
	const lo = a <= 0 && 0 <= b ? 0 : Math.min(a * a, b * b);
	return [lo, Math.max(a * a, b * b)];
}

/**
 * The preimage f⁻¹([c, d]) for f(x) = x², as a list of disjoint closed intervals
 * (empty list = empty set).
 */
export function squarePreimage(c: number, d: number): [number, number][] {
	if (d < 0 || c > d) return [];
	if (c <= 0) return [[-Math.sqrt(d), Math.sqrt(d)]];
	return [
		[-Math.sqrt(d), -Math.sqrt(c)],
		[Math.sqrt(c), Math.sqrt(d)]
	];
}

/** The n-th integer in the zig-zag listing 0, 1, −1, 2, −2, 3, … of ℤ. */
export function zigzag(k: number): number {
	return k % 2 === 1 ? (k + 1) / 2 : k === 0 ? 0 : -k / 2;
}
