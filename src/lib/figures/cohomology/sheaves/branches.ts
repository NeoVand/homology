// Branches of √z and log z along paths in the punctured plane ℂ ∖ {0}.
// A "branch" is a continuous choice of value; we follow it by always picking,
// among the possible values at the next point, the one closest to the value
// we have just chosen (analytic continuation, done numerically).

export type C = [number, number];

export function principalSqrt([x, y]: C): C {
	const r = Math.hypot(x, y);
	const t = Math.atan2(y, x);
	const s = Math.sqrt(r);
	return [s * Math.cos(t / 2), s * Math.sin(t / 2)];
}

/** Follow a continuous square root along a polygonal path, starting from w0 (a square root of path[0]). */
export function trackSqrt(path: C[], w0: C): C[] {
	const out: C[] = [w0];
	let w = w0;
	for (let k = 1; k < path.length; k++) {
		const s = principalSqrt(path[k]);
		const m: C = [-s[0], -s[1]];
		const d1 = Math.hypot(s[0] - w[0], s[1] - w[1]);
		const d2 = Math.hypot(m[0] - w[0], m[1] - w[1]);
		w = d1 <= d2 ? s : m;
		out.push(w);
	}
	return out;
}

/** Follow a continuous logarithm (its imaginary part, the angle) along a path, starting from angle a0. */
export function trackLog(path: C[], a0: number): C[] {
	const out: C[] = [];
	let a = a0;
	for (let k = 0; k < path.length; k++) {
		const [x, y] = path[k];
		const p = Math.atan2(y, x);
		// the values of Im log are p + 2πn; pick the one nearest to the current angle
		const n = Math.round((a - p) / (2 * Math.PI));
		a = p + 2 * Math.PI * n;
		out.push([Math.log(Math.hypot(x, y)), a]);
	}
	return out;
}

/** Points of the circle |z − c| = r, counterclockwise, as a closed loop (last = first). */
export function circlePath(cx: number, cy: number, r: number, n = 240): C[] {
	return Array.from({ length: n + 1 }, (_, k) => {
		const t = (2 * Math.PI * k) / n;
		return [cx + r * Math.cos(t), cy + r * Math.sin(t)] as C;
	});
}
