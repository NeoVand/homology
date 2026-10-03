// Numerics for the 3D divergence-theorem figure: a smooth "source" (a
// Gaussian blob of divergence with total strength 1) plus an optional uniform
// wind. Flux through a sphere and total divergence inside it are computed by
// independent quadratures and agree.
import { GL8 } from './calc';

export type V3 = [number, number, number];

export const BLOB_S = 0.38;
const SQRTPI = Math.sqrt(Math.PI);

/** erf(x) = 2/√π ∫₀ˣ e^{−u²} du, by composite Gauss–Legendre (accurate to ~1e-13 for |x| ≤ 6). */
export function erf(x: number): number {
	const a = Math.abs(x);
	if (a >= 6) return Math.sign(x);
	let sum = 0;
	const panels = 4;
	const h = a / panels;
	for (let k = 0; k < panels; k++)
		for (let i = 0; i < 8; i++) {
			const u = (k + GL8.x[i]) * h;
			sum += GL8.w[i] * Math.exp(-u * u);
		}
	return Math.sign(x) * (2 / SQRTPI) * sum * h;
}

/** source density ρ = div F: a normalized Gaussian (∫ρ dV = 1) */
export function rho(p: V3): number {
	const r2 = p[0] * p[0] + p[1] * p[1] + p[2] * p[2];
	return Math.exp(-r2 / (BLOB_S * BLOB_S)) / (Math.pow(Math.PI, 1.5) * BLOB_S ** 3);
}

/** total source within radius r of the blob centre */
export function enclosed(r: number): number {
	const t = r / BLOB_S;
	return erf(t) - (2 / SQRTPI) * t * Math.exp(-t * t);
}

/** the field: radial part with div = ρ, plus a uniform wind (div 0) */
export function field(p: V3, wind = 0): V3 {
	const r = Math.hypot(p[0], p[1], p[2]);
	if (r < 1e-9) return [wind, 0, 0];
	const k = enclosed(r) / (4 * Math.PI * r * r * r);
	return [k * p[0] + wind, k * p[1], k * p[2]];
}

/** ∯ F·n dA over the sphere with centre c and radius R (Gauss–Legendre in cos θ × trapezoid in φ). */
export function sphereFlux(c: V3, R: number, wind = 0, nu = 24, nphi = 48): number {
	let s = 0;
	// 24-point composite rule from GL8 on 3 panels of [−1, 1]
	const panels = Math.max(1, Math.round(nu / 8));
	const h = 2 / panels;
	for (let k = 0; k < panels; k++)
		for (let i = 0; i < 8; i++) {
			const u = -1 + (k + GL8.x[i]) * h;
			const w = GL8.w[i] * h;
			const sn = Math.sqrt(Math.max(0, 1 - u * u));
			for (let j = 0; j < nphi; j++) {
				const ph = (2 * Math.PI * (j + 0.5)) / nphi;
				const n: V3 = [sn * Math.cos(ph), u, sn * Math.sin(ph)];
				const F = field([c[0] + R * n[0], c[1] + R * n[1], c[2] + R * n[2]], wind);
				s += w * (F[0] * n[0] + F[1] * n[1] + F[2] * n[2]);
			}
		}
	return s * R * R * ((2 * Math.PI) / nphi);
}

/** ∭ div F dV over the ball with centre c and radius R (spherical coordinates about c). */
export function ballDivergence(c: V3, R: number, nr = 2, nu = 2, nphi = 40): number {
	let s = 0;
	const hr = R / nr;
	const hu = 2 / nu;
	for (let a = 0; a < nr; a++)
		for (let i = 0; i < 8; i++) {
			const r = (a + GL8.x[i]) * hr;
			const wr = GL8.w[i] * hr * r * r;
			for (let b = 0; b < nu; b++)
				for (let k = 0; k < 8; k++) {
					const u = -1 + (b + GL8.x[k]) * hu;
					const wu = GL8.w[k] * hu;
					const sn = Math.sqrt(Math.max(0, 1 - u * u));
					for (let j = 0; j < nphi; j++) {
						const ph = (2 * Math.PI * (j + 0.5)) / nphi;
						s += wr * wu * rho([c[0] + r * sn * Math.cos(ph), c[1] + r * u, c[2] + r * sn * Math.sin(ph)]);
					}
				}
		}
	return s * ((2 * Math.PI) / nphi);
}
