// Let a knot settle into a rounder, more legible shape without ever passing a
// strand through another: the curve is a chain of beads joined by springs,
// every bead pushes every other away, and no bead moves more than a small
// fraction of the bead spacing per step, so strands cannot cross. The knot
// type is unchanged (the tests check its invariants before and after).
import type { V3 } from './diagram';

/** respace a closed polyline to n points evenly along its length */
export function resample(pts: V3[], n: number): V3[] {
	const m = pts.length;
	const cum = [0];
	for (let i = 0; i < m; i++) {
		const a = pts[i];
		const b = pts[(i + 1) % m];
		cum.push(cum[i] + Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]));
	}
	const total = cum[m];
	const out: V3[] = [];
	let k = 0;
	for (let i = 0; i < n; i++) {
		const s = (total * i) / n;
		while (cum[k + 1] < s) k++;
		const a = pts[k];
		const b = pts[(k + 1) % m];
		const w = (s - cum[k]) / (cum[k + 1] - cum[k] || 1);
		out.push([a[0] + (b[0] - a[0]) * w, a[1] + (b[1] - a[1]) * w, a[2] + (b[2] - a[2]) * w]);
	}
	return out;
}

export function relax(
	comps: V3[][],
	opts: { per?: number; steps?: number; size?: number; thickness?: number; repel?: number; straighten?: number } = {}
): V3[][] {
	const per = opts.per ?? 140;
	const steps = opts.steps ?? 600;
	// the rope's thickness, as a fraction of the knot's size (its largest distance from the centre): parts
	// of the curve that are not neighbours along it are pushed apart hard whenever they come closer than
	// this, so that a tube drawn round the curve never runs into itself
	const thickness = opts.thickness ?? 0;
	// how hard every bead pushes every other away, and how hard each bead is pulled into line with its neighbours
	const repel = opts.repel ?? 1;
	const straighten = opts.straighten ?? 0.6;
	// beads, component by component
	const lens = comps.map((c) => {
		let L = 0;
		for (let i = 0; i < c.length; i++) {
			const a = c[i];
			const b = c[(i + 1) % c.length];
			L += Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
		}
		return L;
	});
	const totalLen = lens.reduce((a, b) => a + b, 0);
	const counts = lens.map((L) => Math.max(24, Math.round((per * comps.length * L) / totalLen)));
	const beads = comps.map((c, i) => resample(c, counts[i]));
	const X: V3[] = beads.flat();
	const N = X.length;
	const comp: number[] = [];
	const idx: number[] = [];
	beads.forEach((b, c) => b.forEach((_, i) => (comp.push(c), idx.push(i))));
	const next = (p: number) => {
		const c = comp[p];
		const start = p - idx[p];
		return start + ((idx[p] + 1) % counts[c]);
	};
	const prev = (p: number) => {
		const c = comp[p];
		const start = p - idx[p];
		return start + ((idx[p] - 1 + counts[c]) % counts[c]);
	};
	// target spacing: the mean bead spacing at the start
	let h = 0;
	for (let p = 0; p < N; p++) {
		const q = X[next(p)];
		h += Math.hypot(q[0] - X[p][0], q[1] - X[p][1], q[2] - X[p][2]);
	}
	h /= N;
	const F: V3[] = X.map(() => [0, 0, 0]);
	// the closest two strands may ever come: a third of the spacing, or (for a shape handed in tighter than
	// that) nearly as close as they were at the start
	const floor = Math.min(0.33 * h, 0.9 * minGap());
	for (let step = 0; step < steps; step++) {
		for (const f of F) f[0] = f[1] = f[2] = 0;
		// the thickness the rope should have now, and how far along it two beads must be to count as strangers
		let D = 0;
		let near = 3;
		if (thickness > 0) {
			const c: V3 = [0, 0, 0];
			for (const x of X) for (let i = 0; i < 3; i++) c[i] += x[i] / N;
			let R = 0;
			for (const x of X) R = Math.max(R, Math.hypot(x[0] - c[0], x[1] - c[1], x[2] - c[2]));
			D = thickness * R;
			near = Math.max(3, Math.ceil((1.6 * D) / h));
		}
		// repulsion between beads that are not neighbours along the curve
		for (let p = 0; p < N; p++)
			for (let q = p + 1; q < N; q++) {
				let stranger = true;
				if (comp[p] === comp[q]) {
					const d = Math.abs(idx[p] - idx[q]);
					const along = Math.min(d, counts[comp[p]] - d);
					if (along < 3) continue;
					stranger = along >= near;
				}
				const dx = X[p][0] - X[q][0];
				const dy = X[p][1] - X[q][1];
				const dz = X[p][2] - X[q][2];
				const r2 = dx * dx + dy * dy + dz * dz + 1e-9;
				let k = (repel * h * h) / (r2 * Math.sqrt(r2));
				if (stranger && r2 < D * D) {
					const r = Math.sqrt(r2);
					k += (6 * (D - r)) / r;
				}
				F[p][0] += k * dx;
				F[p][1] += k * dy;
				F[p][2] += k * dz;
				F[q][0] -= k * dx;
				F[q][1] -= k * dy;
				F[q][2] -= k * dz;
			}
		// springs to the neighbours, and a little straightening
		for (let p = 0; p < N; p++) {
			const a = X[prev(p)];
			const b = X[next(p)];
			for (const nb of [a, b]) {
				const dx = nb[0] - X[p][0];
				const dy = nb[1] - X[p][1];
				const dz = nb[2] - X[p][2];
				const r = Math.hypot(dx, dy, dz) || 1e-9;
				const k = (4 * (r - h)) / r;
				F[p][0] += k * dx;
				F[p][1] += k * dy;
				F[p][2] += k * dz;
			}
			F[p][0] += straighten * ((a[0] + b[0]) / 2 - X[p][0]);
			F[p][1] += straighten * ((a[1] + b[1]) / 2 - X[p][1]);
			F[p][2] += straighten * ((a[2] + b[2]) / 2 - X[p][2]);
		}
		// move, no bead more than a tenth of the spacing, nor more than a fifth of the
		// smallest gap g between two strands. Two beads then move less than 2g/5
		// relative to each other, and a distance changes by no more than that, so
		// every gap stays open during the step: no strand passes through another.
		// No step may bring two strands closer than the floor; a step that would is
		// taken smaller, and if even small steps would, the beads stay where they are.
		const g0 = minGap();
		const cap = Math.min(0.1 * h, 0.2 * g0);
		const old = X.map((x) => [x[0], x[1], x[2]] as V3);
		let scale = 1;
		for (let tries = 0; tries < 6; tries++) {
			for (let p = 0; p < N; p++) {
				const m = Math.hypot(F[p][0], F[p][1], F[p][2]) * 0.05;
				const s = (m > cap ? cap / m : 1) * scale;
				X[p][0] = old[p][0] + F[p][0] * 0.05 * s;
				X[p][1] = old[p][1] + F[p][1] * 0.05 * s;
				X[p][2] = old[p][2] + F[p][2] * 0.05 * s;
			}
			if (minGap() >= floor) break;
			scale /= 2;
			if (tries === 5) for (let p = 0; p < N; p++) X[p] = old[p];
		}
	}
	function minGap(): number {
		let best = Infinity;
		for (let p = 0; p < N; p++) {
			const p2 = next(p);
			for (let q = p + 1; q < N; q++) {
				const q2 = next(q);
				if (q === p2 || q2 === p || q === prev(p) || p2 === prev(q)) continue;
				if (comp[p] === comp[q]) {
					const d = Math.abs(idx[p] - idx[q]);
					if (Math.min(d, counts[comp[p]] - d) < 3) continue;
				}
				best = Math.min(best, segGap(X[p], X[p2], X[q], X[q2]));
			}
		}
		return best;
	}
	// centre, and scale to the requested size (the largest distance from the centre)
	const c: V3 = [0, 0, 0];
	for (const x of X) for (let i = 0; i < 3; i++) c[i] += x[i] / N;
	let R = 0;
	for (const x of X) R = Math.max(R, Math.hypot(x[0] - c[0], x[1] - c[1], x[2] - c[2]));
	const size = opts.size ?? 1.8;
	const out: V3[][] = [];
	let p = 0;
	for (const n of counts) {
		const pts: V3[] = [];
		for (let i = 0; i < n; i++, p++) pts.push([((X[p][0] - c[0]) * size) / R, ((X[p][1] - c[1]) * size) / R, ((X[p][2] - c[2]) * size) / R]);
		out.push(pts);
	}
	return out;
}

/** the shortest distance between segments ab and cd */
export function segGap(a: V3, b: V3, c: V3, d: V3): number {
	const u: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
	const v: V3 = [d[0] - c[0], d[1] - c[1], d[2] - c[2]];
	const w: V3 = [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
	const dot = (x: V3, y: V3) => x[0] * y[0] + x[1] * y[1] + x[2] * y[2];
	const A = dot(u, u);
	const B = dot(u, v);
	const C = dot(v, v);
	const D = dot(u, w);
	const E = dot(v, w);
	const den = A * C - B * B;
	let sN: number;
	let sD = den;
	let tN: number;
	let tD = den;
	if (den < 1e-12) {
		sN = 0;
		sD = 1;
		tN = E;
		tD = C;
	} else {
		sN = B * E - C * D;
		tN = A * E - B * D;
		if (sN < 0) {
			sN = 0;
			tN = E;
			tD = C;
		} else if (sN > sD) {
			sN = sD;
			tN = E + B;
			tD = C;
		}
	}
	if (tN < 0) {
		tN = 0;
		if (-D < 0) sN = 0;
		else if (-D > A) sN = sD;
		else {
			sN = -D;
			sD = A;
		}
	} else if (tN > tD) {
		tN = tD;
		if (-D + B < 0) sN = 0;
		else if (-D + B > A) sN = sD;
		else {
			sN = -D + B;
			sD = A;
		}
	}
	const sc = Math.abs(sN) < 1e-12 ? 0 : sN / sD;
	const tc = Math.abs(tN) < 1e-12 ? 0 : tN / tD;
	const dx = w[0] + sc * u[0] - tc * v[0];
	const dy = w[1] + sc * u[1] - tc * v[1];
	const dz = w[2] + sc * u[2] - tc * v[2];
	return Math.hypot(dx, dy, dz);
}
