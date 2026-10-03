<script lang="ts">
	// ℤ² modulo the sublattice H spanned by two draggable integer vectors v, w.
	// Every lattice point is coloured by its coset; the shaded tile (a
	// fundamental domain) holds exactly one point of each colour, and the number
	// of colours is |det(v w)|. The quotient group is computed by the Smith
	// normal form.
	import Svg from '$lib/components/svg/Svg.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import { latticeQuotient, snfFull } from './snf';
	import { residueColor, mod, gcd } from '../groups/zn';

	type V2 = [number, number];
	let v = $state<V2>([2, 1]);
	let w = $state<V2>([1, 2]);
	let moving = $state<'v' | 'w'>('v');
	let dragging = $state<'v' | 'w' | null>(null);
	let svgEl = $state<SVGSVGElement>();

	const G = 6; // grid half-size
	const L = 4; // vectors live in [−L, L]²
	const U = 27; // px per lattice unit
	const pts: V2[] = [];
	for (let x = -G; x <= G; x++) for (let y = -G; y <= G; y++) pts.push([x, y]);

	const q = $derived(latticeQuotient(v, w));
	const snf = $derived(snfFull([[v[0], w[0]], [v[1], w[1]]], false));
	const N = $derived(q.index);
	const finite = $derived(Number.isFinite(N));

	function colorOf(p: V2): string {
		const [c0, c1] = q.coords(p[0], p[1]);
		if (finite) {
			if (N === 1) return residueColor(0, 3);
			const d0 = q.d[0] || 1;
			return residueColor(c0 + d0 * c1, N);
		}
		if (q.rank === 1) {
			const d0 = q.d[0] || 1;
			return residueColor(mod(c1, 6) * d0 + c0, 6 * d0);
		}
		return residueColor(mod(c0 + 3 * c1, 7), 7);
	}
	const inH = (p: V2) => {
		const [c0, c1] = q.coords(p[0], p[1]);
		return c0 === 0 && c1 === 0;
	};
	// lattice points in the half-open tile {s v + t w : 0 ≤ s, t < 1}
	function inTile(p: V2): boolean {
		if (!finite) return false;
		const D = q.det;
		const s = (p[0] * w[1] - p[1] * w[0]) / D;
		const t = (v[0] * p[1] - v[1] * p[0]) / D;
		return s >= -1e-9 && s < 1 - 1e-9 && t >= -1e-9 && t < 1 - 1e-9;
	}
	const X = (p: V2) => p[0] * U;
	const Y = (p: V2) => -p[1] * U;

	// translates of the tile that meet the view
	const tiles = $derived.by(() => {
		if (!finite) return [] as V2[][];
		const out: V2[][] = [];
		for (let a = -14; a <= 14; a++)
			for (let b = -14; b <= 14; b++) {
				const o: V2 = [a * v[0] + b * w[0], a * v[1] + b * w[1]];
				const c: V2 = [o[0] + (v[0] + w[0]) / 2, o[1] + (v[1] + w[1]) / 2];
				if (Math.abs(c[0]) > G + 3 || Math.abs(c[1]) > G + 3) continue;
				out.push([o, [o[0] + v[0], o[1] + v[1]], [o[0] + v[0] + w[0], o[1] + v[1] + w[1]], [o[0] + w[0], o[1] + w[1]]]);
			}
		return out;
	});
	// for a degenerate H, draw the lines through the cosets
	const lineDir = $derived.by((): V2 | null => {
		if (finite || q.rank === 0) return null;
		const d = v[0] || v[1] ? v : w;
		const g = gcd(d[0], d[1]) || 1;
		return [d[0] / g, d[1] / g];
	});

	function toLattice(e: PointerEvent): V2 | null {
		if (!svgEl) return null;
		const ctm = svgEl.getScreenCTM();
		if (!ctm) return null;
		const pt = svgEl.createSVGPoint();
		pt.x = e.clientX;
		pt.y = e.clientY;
		const p = pt.matrixTransform(ctm.inverse());
		const x = Math.max(-L, Math.min(L, Math.round(p.x / U)));
		const y = Math.max(-L, Math.min(L, Math.round(-p.y / U)));
		return [x, y];
	}
	function onMove(e: PointerEvent) {
		if (!dragging) return;
		const p = toLattice(e);
		if (!p) return;
		if (dragging === 'v') v = p;
		else w = p;
	}
	function setTo(p: V2) {
		if (Math.abs(p[0]) > L || Math.abs(p[1]) > L) return;
		if (moving === 'v') v = [p[0], p[1]];
		else w = [p[0], p[1]];
	}

	const presets: { v: V2; w: V2; label: string }[] = [
		{ v: [2, 1], w: [1, 2], label: '(2,1), (1,2)' },
		{ v: [2, 0], w: [0, 2], label: '(2,0), (0,2)' },
		{ v: [2, 0], w: [0, 3], label: '(2,0), (0,3)' },
		{ v: [3, 1], w: [1, 2], label: '(3,1), (1,2)' },
		{ v: [2, 2], w: [4, 4], label: '(2,2), (4,4)' },
		{ v: [2, 1], w: [4, 2], label: '(2,1), (4,2)' }
	];

	const matTeX = $derived(`\\begin{pmatrix} ${v[0]} & ${w[0]} \\\\ ${v[1]} & ${w[1]} \\end{pmatrix}`);
	const diagTeX = $derived(
		`\\begin{pmatrix} ${snf.diag[0] ?? 0} & 0 \\\\ 0 & ${snf.diag[1] ?? 0} \\end{pmatrix}`
	);

	// the collapsed picture: one dot per coset
	const collapsed = $derived.by(() => {
		if (!finite) return null;
		const d0 = q.d[0] || 1;
		const d1 = q.d[1] || 1;
		const dots: { x: number; y: number; c: string }[] = [];
		if (d0 === 1) {
			const n = d1;
			const r = n === 1 ? 0 : 34;
			for (let i = 0; i < n; i++) {
				const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
				dots.push({ x: 50 + r * Math.cos(a), y: 50 + r * Math.sin(a), c: N === 1 ? residueColor(0, 3) : residueColor(i * d0, N) });
			}
		} else {
			const gap = Math.min(20, 84 / Math.max(d0, d1));
			for (let i = 0; i < d0; i++)
				for (let j = 0; j < d1; j++)
					dots.push({ x: 50 + (j - (d1 - 1) / 2) * gap, y: 50 + (i - (d0 - 1) / 2) * gap, c: residueColor(i + d0 * j, N) });
		}
		return dots;
	});
</script>

<svelte:window onpointermove={onMove} onpointerup={() => (dragging = null)} onpointercancel={() => (dragging = null)} />

<div class="lq">
	<div class="stage">
		<Svg bind:svg={svgEl} viewBox="{-G * U - 16} {-G * U - 16} {2 * G * U + 32} {2 * G * U + 32}" maxHeight={430} label="The integer lattice coloured by cosets of the sublattice spanned by v and w">
			<defs>
				<clipPath id="lq-clip"><rect x={-G * U - 10} y={-G * U - 10} width={2 * G * U + 20} height={2 * G * U + 20} rx="10" /></clipPath>
			</defs>
			<g clip-path="url(#lq-clip)">
				{#each Array.from({ length: 2 * G + 1 }, (_, i) => i - G) as i (i)}
					<line x1={i * U} y1={-G * U - 10} x2={i * U} y2={G * U + 10} stroke="rgba(235,229,213,0.05)" />
					<line x1={-G * U - 10} y1={i * U} x2={G * U + 10} y2={i * U} stroke="rgba(235,229,213,0.05)" />
				{/each}
				{#each tiles as t, i (i)}
					<polygon points={t.map((p) => `${X(p)},${Y(p)}`).join(' ')} fill="none" stroke="rgba(164,147,255,0.22)" stroke-width="1" />
				{/each}
				{#if finite}
					<polygon
						points={[[0, 0] as V2, v, [v[0] + w[0], v[1] + w[1]] as V2, w].map((p) => `${X(p)},${Y(p)}`).join(' ')}
						fill="rgba(164,147,255,0.2)"
						stroke="#a493ff"
						stroke-width="1.6"
						stroke-dasharray="5 4"
					/>
				{/if}
				{#if lineDir}
					{#each pts as p (p[0] * 100 + p[1])}
						<line
							x1={X(p)}
							y1={Y(p)}
							x2={X([p[0] + lineDir[0], p[1] + lineDir[1]])}
							y2={Y([p[0] + lineDir[0], p[1] + lineDir[1]])}
							stroke="rgba(164,147,255,0.22)"
							stroke-width="1"
						/>
					{/each}
				{/if}
				{#each pts as p (p[0] * 100 + p[1])}
					{@const h = inH(p)}
					{@const tile = inTile(p)}
					<g class="pt" role="button" tabindex="-1" aria-label="lattice point ({p[0]}, {p[1]})" onclick={() => setTo(p)} onkeydown={() => {}}>
						<circle cx={X(p)} cy={Y(p)} r="12" fill="transparent" />
						{#if tile}<circle cx={X(p)} cy={Y(p)} r="9.5" fill="none" stroke="#fbf6e8" stroke-width="1.4" />{/if}
						<circle cx={X(p)} cy={Y(p)} r={h ? 6.4 : 4.8} fill={colorOf(p)} stroke={h ? '#fff8e6' : '#0b1020'} stroke-width={h ? 1.4 : 0.8} filter={h ? 'url(#glow)' : undefined} />
					</g>
				{/each}
			</g>
			<!-- axes -->
			<circle cx="0" cy="0" r="2.5" fill="#fbf6e8" />
			<!-- the two vectors -->
			{#each [['v', v, '#f2d08f', 'gold'], ['w', w, '#5fd6cf', 'teal']] as [name, vec, col, mk] (name)}
				{@const P = vec as V2}
				{#if P[0] !== 0 || P[1] !== 0}
					<line x1="0" y1="0" x2={X(P)} y2={Y(P)} stroke={col as string} stroke-width="3" marker-end="url(#arrow-{mk})" filter="url(#glow)" />
				{/if}
				<g
					class="handle"
					class:active={dragging === name}
					role="slider"
					tabindex="0"
					aria-label="vector {name} = ({P[0]}, {P[1]}); drag to move"
					aria-valuenow={P[0]}
					onpointerdown={(e) => {
						dragging = name as 'v' | 'w';
						moving = name as 'v' | 'w';
						e.preventDefault();
					}}
				>
					<circle cx={X(P)} cy={Y(P)} r="18" fill="transparent" />
					<circle cx={X(P)} cy={Y(P)} r="9" fill="none" stroke={col as string} stroke-width="2" />
				</g>
				<text x={X(P) + 12} y={Y(P) - 10} class="vlbl" style="fill:{col}">{name}</text>
			{/each}
		</Svg>
		<div class="tap ui">
			<span>Drag the arrow tips, or tap a point to move</span>
			<Segmented bind:value={moving} options={[{ value: 'v', label: 'v' }, { value: 'w', label: 'w' }]} label="Which vector to move" />
		</div>
	</div>

	<div class="info ui">
		<div class="row big"><TeX tex={`H = \\langle (${v[0]}, ${v[1]}),\\ (${w[0]}, ${w[1]}) \\rangle`} /></div>
		<div class="row">
			<TeX tex={`\\det ${matTeX} = ${q.det}`} />
		</div>
		<div class="row">
			{#if finite}
				Number of cosets (colours) <TeX tex={`= |\\det| = ${N}`} />. The shaded tile contains exactly one point of each
				colour (ringed).
			{:else}
				<TeX tex="\\det = 0" />: the vectors lie on one line, so there are <b>infinitely many</b> cosets (the colours
				repeat).
			{/if}
		</div>
		<div class="row">
			Smith normal form: <TeX tex={diagTeX} />
		</div>
		<div class="row result">
			<TeX tex={`\\mathbb{Z}^2 / H \\;\\cong\\; ${q.tex}`} />
		</div>
		{#if collapsed}
			<div class="collapse">
				<svg viewBox="0 0 100 100" width="96" height="96" aria-label="one dot per coset">
					{#each collapsed as d, i (i)}
						<circle cx={d.x} cy={d.y} r={collapsed.length > 16 ? 3.6 : 5} fill={d.c} />
					{/each}
				</svg>
				<span class="dim">Collapse each colour to one dot: this is the quotient group.</span>
			</div>
		{/if}
		<div class="presets">
			{#each presets as pr (pr.label)}
				<button
					class="pre"
					class:on={pr.v[0] === v[0] && pr.v[1] === v[1] && pr.w[0] === w[0] && pr.w[1] === w[1]}
					onclick={() => {
						v = [...pr.v];
						w = [...pr.w];
					}}>{pr.label}</button
				>
			{/each}
		</div>
	</div>
</div>

<style>
	.lq {
		display: grid;
		grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
		gap: 1rem 1.6rem;
		padding: 1rem 1.3rem 1.2rem;
		align-items: center;
	}
	@media (max-width: 760px) {
		.lq {
			grid-template-columns: minmax(0, 1fr);
			padding: 0.7rem 0.6rem 1rem;
		}
	}
	.stage {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		touch-action: pan-y;
	}
	.pt {
		cursor: pointer;
		outline: none;
	}
	.handle {
		cursor: grab;
		touch-action: none;
	}
	.handle.active {
		cursor: grabbing;
	}
	.vlbl {
		font-family: var(--font-body);
		font-style: italic;
		font-weight: 700;
		font-size: 17px !important;
		pointer-events: none;
	}
	.tap {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.6rem;
		flex-wrap: wrap;
		font-size: 0.74rem;
		color: var(--ink-faint);
	}
	.info {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
	}
	.row {
		line-height: 1.6;
	}
	.big {
		font-size: 1rem;
		color: var(--ink-bright);
	}
	.result {
		font-size: 1.3rem;
		color: var(--gold-bright);
		padding: 0.3rem 0;
	}
	.collapse {
		display: flex;
		align-items: center;
		gap: 0.8rem;
	}
	.dim {
		color: var(--ink-faint);
		font-size: 0.78rem;
	}
	.presets {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}
	.pre {
		border: 1px solid var(--line-faint);
		background: rgba(255, 255, 255, 0.03);
		color: var(--ink-dim);
		border-radius: 999px;
		padding: 0.25rem 0.65rem;
		font-size: 0.74rem;
		font-variant-numeric: tabular-nums;
		cursor: pointer;
		min-height: 2rem;
	}
	.pre.on {
		border-color: var(--gold);
		color: var(--gold-bright);
		background: rgba(216, 178, 110, 0.12);
	}
</style>
