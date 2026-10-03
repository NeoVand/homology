<script lang="ts">
	// Čech and Vietoris–Rips complexes of the same points at the same radius,
	// side by side, with their Betti numbers computed exactly.
	import CloudSvg from './CloudSvg.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { cechFiltration, ripsFiltration, reduce, barsOf, bettiAt, complexAt, dist, type Pt, type FSimplex } from './ph';
	import type { Box } from './draw';

	type Kind = 'triangle' | 'hexagon' | 'five';
	const s3 = Math.sqrt(3);
	const presets: Record<Kind, { pts: Pt[]; r: number; label: string }> = {
		triangle: {
			pts: [
				[-1, -1 / s3],
				[1, -1 / s3],
				[0, 2 / s3]
			],
			r: 1.03,
			label: 'Three points'
		},
		hexagon: {
			pts: Array.from({ length: 6 }, (_, k) => [Math.cos((Math.PI * k) / 3), Math.sin((Math.PI * k) / 3)] as Pt),
			r: 0.93,
			label: 'Hexagon'
		},
		five: {
			pts: [
				[-1.25, -0.55],
				[0.2, -1.05],
				[1.35, -0.25],
				[0.75, 1.0],
				[-0.85, 0.85]
			],
			r: 0.9,
			label: 'Five points'
		}
	};
	const box: Box = { x0: -2.35, x1: 2.35, y0: -2.15, y1: 2.35 };

	let kind = $state<Kind>('triangle');
	let pts = $state.raw<Pt[]>(presets.triangle.pts);
	let r = $state(presets.triangle.r);

	function load(k: Kind) {
		kind = k;
		pts = presets[k].pts.map((p) => [p[0], p[1]] as Pt);
		r = presets[k].r;
	}
	function moveTo(i: number, p: Pt) {
		const next = pts.slice();
		next[i] = p;
		pts = next;
	}

	const cech = $derived(cechFiltration(pts, 3));
	const rips = $derived(ripsFiltration(pts, 3));
	const cBars = $derived(barsOf(reduce(cech), 2));
	const rBars = $derived(barsOf(reduce(rips), 2));
	const cB = $derived(bettiAt(cBars, r));
	const rB = $derived(bettiAt(rBars, r));
	const pieces = (f: FSimplex[]) => {
		const now = complexAt(f, r);
		return {
			edges: now.filter((s) => s.verts.length === 2).map((s) => [s.verts[0], s.verts[1]] as [number, number]),
			tris: now.filter((s) => s.verts.length === 3).map((s) => s.verts)
		};
	};
	const C = $derived(pieces(cech));
	const R = $derived(pieces(rips));

	// spots that are enclosed by a Rips triangle but covered by no disc
	const gaps = $derived.by(() => {
		const out: Pt[] = [];
		const inC = new Set(C.tris.map((t) => t.join(',')));
		for (const t of R.tris) {
			if (inC.has(t.join(','))) continue;
			const [a, b, c] = t.map((i) => pts[i]);
			const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
			if (Math.abs(d) < 1e-12) continue;
			const a2 = a[0] ** 2 + a[1] ** 2;
			const b2 = b[0] ** 2 + b[1] ** 2;
			const c2 = c[0] ** 2 + c[1] ** 2;
			const o: Pt = [(a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / d, (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / d];
			if (pts.every((p) => dist(p, o) > r + 1e-9) && out.every((q) => dist(q, o) > 0.05)) out.push(o);
		}
		return out;
	});

	const labels = $derived(pts.map((_, i) => String(i)));
	const bt = (b: number[]) => `b_0 = ${b[0]},\\;\\; b_1 = ${b[1]},\\;\\; b_2 = ${b[2]}`;
	const verdict = $derived.by(() => {
		if (rB[2] > 0 && cB[2] === 0) return 'Rips has a hollow 2-dimensional void that the discs do not have.';
		if (cB[1] > rB[1]) return 'The discs leave a gap (rose dot): Čech sees the hole, Rips has filled it in.';
		if (cB.every((v, i) => v === rB[i])) return 'Here the two complexes have the same Betti numbers.';
		return 'The two complexes disagree here.';
	});
</script>

<div class="cvr">
	<div class="top ui">
		<Segmented
			value={kind}
			label="Configuration"
			options={(Object.keys(presets) as Kind[]).map((k) => ({ value: k, label: presets[k].label }))}
			onchange={load}
		/>
	</div>
	<div class="pair">
		<div class="side">
			<div class="name ui">Čech complex</div>
			<div class="rule ui">a simplex when the discs share a point</div>
			<CloudSvg
				{pts}
				{box}
				{r}
				edges={C.edges}
				tris={C.tris}
				{labels}
				draggable
				onmove={moveTo}
				maxHeight={330}
				labelSize={22}
				label="The Čech complex of the points at the chosen radius"
			>
				{#snippet overlay(X, Y)}
					{#each gaps as g, k (k)}
						<circle cx={X(g[0])} cy={Y(g[1])} r="6.5" class="gap" />
						<circle cx={X(g[0])} cy={Y(g[1])} r="2.2" class="gapdot" />
					{/each}
				{/snippet}
			</CloudSvg>
			<div class="betti" class:diff={cB.some((v, i) => v !== rB[i])}><TeX tex={bt(cB)} /></div>
		</div>
		<div class="side">
			<div class="name ui">Vietoris–Rips complex</div>
			<div class="rule ui">a simplex when the discs meet in pairs</div>
			<CloudSvg
				{pts}
				{box}
				{r}
				edges={R.edges}
				tris={R.tris}
				{labels}
				draggable
				onmove={moveTo}
				maxHeight={330}
				labelSize={22}
				label="The Vietoris–Rips complex of the same points at the same radius"
			/>
			<div class="betti" class:diff={cB.some((v, i) => v !== rB[i])}><TeX tex={bt(rB)} /></div>
		</div>
	</div>
	<p class="verdict ui">{verdict}</p>
	<div class="controls ui">
		<Slider bind:value={r} min={0} max={1.4} step={0.005} label="Radius r" format={(v) => v.toFixed(3)} />
	</div>
</div>

<style>
	.cvr {
		container-type: inline-size;
		padding: 0.8rem 1rem 0.2rem;
	}
	.top {
		display: flex;
		justify-content: center;
		margin-bottom: 0.6rem;
	}
	.pair {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}
	.side {
		min-width: 0;
		text-align: center;
	}
	.name {
		font-size: 0.74rem;
		font-weight: 650;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold);
	}
	.rule {
		font-size: 0.74rem;
		color: var(--ink-faint);
		margin-bottom: 0.2rem;
	}
	.betti {
		display: inline-block;
		margin-top: 0.3rem;
		padding: 0.2rem 0.7rem;
		border-radius: 999px;
		border: 1px solid var(--line-faint);
		font-size: 0.92rem;
		color: var(--ink-bright);
		transition: all 0.3s var(--ease);
	}
	.betti.diff {
		border-color: rgba(242, 141, 182, 0.55);
		box-shadow: 0 0 14px -4px rgba(242, 141, 182, 0.6);
	}
	.verdict {
		text-align: center;
		font-size: 0.84rem;
		color: var(--ink-dim);
		margin: 0.6rem 0 0.2rem;
		min-height: 1.4em;
	}
	.controls {
		display: flex;
		padding: 0.5rem 0 0.6rem;
	}
	.gap {
		fill: none;
		stroke: var(--rose);
		stroke-width: 1.6;
		stroke-dasharray: 2.5 2;
	}
	.gapdot {
		fill: var(--rose);
	}
	@container (max-width: 470px) {
		.pair {
			grid-template-columns: 1fr;
		}
	}
</style>
