// Geometry for a ring of n equal gears, each meshing with its two neighbours.
// Gear i turns by θᵢ(t) = φᵢ + sᵢ·ω·t. Two equal gears with T teeth mesh along the
// line at angle α (from gear i to gear i+1) exactly when
//     φᵢ + φᵢ₊₁ ≡ 2α + π + p/2   (mod p),   p = 2π/T,
// and they turn in opposite directions (sᵢ₊₁ = −sᵢ). Around the ring the spins
// alternate, which closes up only when n is even: the ℤ/2 obstruction.

export interface GearRing {
	n: number;
	/** pitch radius of each gear */
	r: number;
	/** radius of the ring of centres */
	rho: number;
	centers: [number, number][];
	/** starting phase of each gear (radians) */
	phase: number[];
	/** spin direction of each gear: +1 or −1 (the last one clashes with the first when n is odd) */
	spin: (1 | -1)[];
	teeth: number;
}

export function gearRing(n: number, cx = 230, cy = 200, maxR = 186, teeth = 12): GearRing {
	const s = Math.sin(Math.PI / n);
	const r = Math.min(46, (maxR * s) / (1 + s) / 1.02);
	const rho = r / s;
	const centers: [number, number][] = [];
	for (let i = 0; i < n; i++) {
		const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
		centers.push([cx + rho * Math.cos(a), cy + rho * Math.sin(a)]);
	}
	const p = (2 * Math.PI) / teeth;
	const phase = [0];
	for (let i = 0; i + 1 < n; i++) {
		const [x0, y0] = centers[i];
		const [x1, y1] = centers[i + 1];
		const alpha = Math.atan2(y1 - y0, x1 - x0);
		phase.push(2 * alpha + Math.PI + p / 2 - phase[i]);
	}
	const spin = Array.from({ length: n }, (_, i) => (i % 2 === 0 ? 1 : -1) as 1 | -1);
	return { n, r, rho, centers, phase, spin, teeth };
}

/** How far the mesh between gear i and gear j = i+1 (mod n) is from perfect, in fractions of a tooth (0 = perfect). */
export function meshError(g: GearRing, i: number): number {
	const j = (i + 1) % g.n;
	const [x0, y0] = g.centers[i];
	const [x1, y1] = g.centers[j];
	const alpha = Math.atan2(y1 - y0, x1 - x0);
	const p = (2 * Math.PI) / g.teeth;
	const want = 2 * alpha + Math.PI + p / 2;
	let d = (g.phase[i] + g.phase[j] - want) / p;
	d -= Math.round(d);
	return Math.abs(d);
}

/** SVG path of a gear with pitch radius r and T teeth, centred at the origin, one tooth centred on angle 0. */
export function gearPath(r: number, T: number): string {
	const p = (2 * Math.PI) / T;
	const d = Math.min(0.13 * r, 7.5);
	const rr = r - d;
	const rt = r + d;
	const pts: [number, number][] = [];
	for (let j = 0; j < T; j++) {
		const a = j * p;
		const seq: [number, number][] = [
			[a - 0.5 * p, rr],
			[a - 0.24 * p, rr],
			[a - 0.13 * p, rt],
			[a + 0.13 * p, rt],
			[a + 0.24 * p, rr]
		];
		for (const [ang, rad] of seq) pts.push([rad * Math.cos(ang), rad * Math.sin(ang)]);
	}
	return 'M ' + pts.map(([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`).join(' L ') + ' Z';
}
