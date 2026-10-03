// Small exact helpers for the integers and the cyclic groups ℤ/n.

/** The representative of a in {0, 1, …, n−1}. */
export function mod(a: number, n: number): number {
	return ((a % n) + n) % n;
}

export function gcd(a: number, b: number): number {
	a = Math.abs(a);
	b = Math.abs(b);
	while (b) [a, b] = [b, a % b];
	return a;
}

export function lcm(a: number, b: number): number {
	return a === 0 || b === 0 ? 0 : Math.abs(a * b) / gcd(a, b);
}

export function divisors(n: number): number[] {
	const out: number[] = [];
	for (let d = 1; d <= n; d++) if (n % d === 0) out.push(d);
	return out;
}

/** Order of the element k in ℤ/n: the smallest m ≥ 1 with m·k ≡ 0. */
export function orderIn(k: number, n: number): number {
	return n / gcd(mod(k, n), n);
}

/** The cyclic subgroup ⟨k⟩ of ℤ/n, listed in the order 0, k, 2k, … */
export function cycleOf(k: number, n: number): number[] {
	const out: number[] = [];
	let x = 0;
	do {
		out.push(x);
		x = mod(x + k, n);
	} while (x !== 0);
	return out;
}

/** The elements that generate all of ℤ/n (those coprime to n). */
export function generators(n: number): number[] {
	if (n === 1) return [0];
	const out: number[] = [];
	for (let k = 1; k < n; k++) if (gcd(k, n) === 1) out.push(k);
	return out;
}

/** All subgroups of ℤ/n: one for each divisor d of n, namely ⟨d⟩, of size n/d. */
export function subgroups(n: number): { gen: number; elements: number[] }[] {
	return divisors(n).map((d) => ({ gen: d % n, elements: cycleOf(d, n).slice().sort((a, b) => a - b) }));
}

/**
 * The values k = φ(1) for which x ↦ k·x is a well-defined homomorphism
 * ℤ/m → ℤ/n: exactly those with m·k ≡ 0 (mod n).
 */
export function homImages(m: number, n: number): number[] {
	const out: number[] = [];
	for (let k = 0; k < n; k++) if ((m * k) % n === 0) out.push(k);
	return out;
}

export function homKernel(m: number, n: number, k: number): number[] {
	const out: number[] = [];
	for (let x = 0; x < m; x++) if ((k * x) % n === 0) out.push(x);
	return out;
}

export function homImage(m: number, n: number, k: number): number[] {
	const s = new Set<number>();
	for (let x = 0; x < m; x++) s.add((k * x) % n);
	return [...s].sort((a, b) => a - b);
}

/** Check the homomorphism property by brute force (used in tests). */
export function isHom(m: number, n: number, f: (x: number) => number): boolean {
	for (let a = 0; a < m; a++) for (let b = 0; b < m; b++) if (f(mod(a + b, m)) !== mod(f(a) + f(b), n)) return false;
	return true;
}

/** A perceptually even colour wheel for the elements of ℤ/n, starting from gold at 0. */
export function residueColor(a: number, n: number, lightness = 80, chroma = 0.13): string {
	const h = (85 + (360 * mod(a, n)) / n) % 360;
	return `oklch(${lightness}% ${chroma} ${h.toFixed(1)})`;
}

/** Format an integer with a proper minus sign. */
export function fmtInt(x: number): string {
	return x < 0 ? '−' + Math.abs(x) : String(x);
}

/** TeX for a set of numbers, e.g. "\{0, 3\}". */
export function setTeX(xs: number[]): string {
	return '\\{' + xs.join(', ') + '\\}';
}
