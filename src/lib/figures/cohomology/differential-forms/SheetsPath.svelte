<script lang="ts">
	// Figure: an exact 1-form ω = df drawn as its stack of level sheets
	// f = kε. Drag the path's endpoints and middle: the net number of sheets
	// crossed (forward minus backward) times ε is ∫_γ ω ≈ f(B) − f(A), and it
	// does not care how the path wiggles in between.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { exactPresets, crossings, type Box } from './sheets';
	import { clamp, fmtTeX, type Vec2 } from './calc';

	const W = 640;
	const H = 400;
	const S = W / 5.2;
	const box: Box = [-2.6, 2.6, -H / (2 * S), H / (2 * S)];
	const px = (p: Vec2): Vec2 => [W / 2 + p[0] * S, H / 2 - p[1] * S];
	const wx = (x: number, y: number): Vec2 => [(x - W / 2) / S, (H / 2 - y) / S];

	let key = $state('lin');
	let A = $state<Vec2>([-1.8, -0.9]);
	let M = $state<Vec2>([-0.2, 0.95]);
	let B = $state<Vec2>([1.7, -0.35]);

	const P = $derived(exactPresets[key]);
	const levels = $derived(P.levels(box));
	const path = $derived.by(() => {
		const Q: Vec2 = [2 * M[0] - (A[0] + B[0]) / 2, 2 * M[1] - (A[1] + B[1]) / 2];
		const out: Vec2[] = [];
		for (let i = 0; i <= 500; i++) {
			const t = i / 500;
			out.push([
				(1 - t) ** 2 * A[0] + 2 * t * (1 - t) * Q[0] + t * t * B[0],
				(1 - t) ** 2 * A[1] + 2 * t * (1 - t) * Q[1] + t * t * B[1]
			]);
		}
		return out;
	});
	const c = $derived(crossings(path, P.f, P.eps));
	const exact = $derived(P.f(B[0], B[1]) - P.f(A[0], A[1]));
	const pathD = $derived('M ' + path.map((p) => px(p).map((v) => v.toFixed(1)).join(' ')).join(' L '));
	const levelD = (pl: Vec2[]) => 'M ' + pl.map((p) => px(p).map((v) => v.toFixed(1)).join(' ')).join(' L ');

	// little "uphill" arrows showing which way across a sheet counts as +1
	const ups = $derived.by(() => {
		const out: { d: string }[] = [];
		for (const y of [-1.15, 0, 1.15])
			for (const x of [-2.2, -1.1, 0, 1.1, 2.2]) {
				const g = P.grad(x, y);
				const m = Math.hypot(g[0], g[1]);
				if (m < 1e-6) continue;
				const u: Vec2 = [g[0] / m, g[1] / m];
				const a = px([x, y]);
				const b = px([x + u[0] * 0.22, y + u[1] * 0.22]);
				const ux = (b[0] - a[0]) / 27;
				const uy = (b[1] - a[1]) / 27;
				out.push({
					d: `M ${a[0]} ${a[1]} L ${b[0]} ${b[1]} M ${b[0] - ux * 7 - uy * 5} ${b[1] - uy * 7 + ux * 5} L ${b[0]} ${b[1]} L ${b[0] - ux * 7 + uy * 5} ${b[1] - uy * 7 - ux * 5}`
				});
			}
		return out;
	});

	let svg: SVGSVGElement | undefined = $state();
	let drag: 'A' | 'M' | 'B' | null = null;
	function down(e: PointerEvent, w: 'A' | 'M' | 'B') {
		drag = w;
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		e.preventDefault();
	}
	function move(e: PointerEvent) {
		if (!drag || !svg) return;
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM()!.inverse());
		const q = wx(p.x, p.y);
		const v: Vec2 = [clamp(q[0], box[0] + 0.1, box[1] - 0.1), clamp(q[1], box[2] + 0.1, box[3] - 0.1)];
		if (drag === 'A') A = v;
		else if (drag === 'M') M = v;
		else B = v;
	}
	function key_(e: KeyboardEvent, w: 'A' | 'M' | 'B') {
		const s = 0.08;
		const m: Record<string, Vec2> = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, s], ArrowDown: [0, -s] };
		const d = m[e.key];
		if (!d) return;
		e.preventDefault();
		const cur = w === 'A' ? A : w === 'M' ? M : B;
		const v: Vec2 = [clamp(cur[0] + d[0], box[0] + 0.1, box[1] - 0.1), clamp(cur[1] + d[1], box[2] + 0.1, box[3] - 0.1)];
		if (w === 'A') A = v;
		else if (w === 'M') M = v;
		else B = v;
	}
	const handles = $derived([
		{ w: 'A' as const, p: A, tex: 'A' },
		{ w: 'M' as const, p: M, tex: '' },
		{ w: 'B' as const, p: B, tex: 'B' }
	]);
</script>

<div class="sheets">
	<Svg bind:svg viewBox="0 0 {W} {H}" maxHeight={500} label="Level lines of a function, and a path crossing them.">
		<g class="levels">
			{#each levels as l, i (i)}
				<path d={levelD(l)} />
			{/each}
		</g>
		<g class="ups">
			{#each ups as u, i (i)}
				<path d={u.d} />
			{/each}
		</g>
		<path d={pathD} class="path-halo" />
		<path d={pathD} class="path" />
		{#each c.marks as m, i (i)}
			{@const q = px(m.p)}
			{#if m.sign > 0}
				<circle cx={q[0]} cy={q[1]} r="4.2" class="plus" />
			{:else}
				<circle cx={q[0]} cy={q[1]} r="4.2" class="minus" />
			{/if}
		{/each}
		{#each handles as h (h.w)}
			{@const q = px(h.p)}
			<g
				class="handle {h.w}"
				transform="translate({q[0]} {q[1]})"
				role="slider"
				tabindex="0"
				aria-label={h.w === 'M' ? 'Bend the path' : `Endpoint ${h.w}`}
				aria-valuenow={0}
				onpointerdown={(e) => down(e, h.w)}
				onpointermove={move}
				onpointerup={() => (drag = null)}
				onpointercancel={() => (drag = null)}
				onkeydown={(e) => key_(e, h.w)}
			>
				<circle r="18" class="hit" />
				<circle r={h.w === 'M' ? 6 : 8} class="knob" />
				{#if h.tex}
					<SvgTeX x={0} y={-22} tex={h.tex} color="var(--gold-bright)" size={18} w={30} h={26} />
				{/if}
			</g>
		{/each}
	</Svg>
	<Controls>
		<Segmented bind:value={key} label="The 1-form" options={Object.values(exactPresets).map((p) => ({ value: p.key, label: p.label }))} />
	</Controls>
	<div class="readout">
		<div class="cell">
			<span class="cap ui">The form and its function</span>
			<TeX tex={String.raw`\omega = ${P.omegaTeX} = d\big(${P.fTeX}\big)`} />
		</div>
		<div class="cell">
			<span class="cap ui">Sheets crossed</span>
			<span class="counts">
				<span class="p">{c.pos} forward</span> · <span class="m">{c.neg} backward</span> · net <b>{c.net}</b>
				<span class="worth">(each sheet is worth ε = {P.eps})</span>
			</span>
		</div>
		<div class="cell">
			<span class="cap ui">The line integral</span>
			<TeX tex={String.raw`\int_\gamma \omega = f(B) - f(A) = ${fmtTeX(exact, 2)} \;\approx\; ${c.net}\times ${P.eps}`} />
		</div>
	</div>
</div>

<style>
	.levels path {
		fill: none;
		stroke: rgba(95, 214, 207, 0.55);
		stroke-width: 1.3;
	}
	.ups path {
		fill: none;
		stroke: rgba(95, 214, 207, 0.9);
		stroke-width: 1.6;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.path-halo {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 10;
		opacity: 0.16;
	}
	.path {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 2.6;
	}
	.plus {
		fill: var(--green);
		stroke: #0a0f22;
		stroke-width: 1.2;
	}
	.minus {
		fill: #0a0f22;
		stroke: var(--rose);
		stroke-width: 2.2;
	}
	.handle {
		cursor: grab;
		touch-action: none;
		outline: none;
	}
	.hit {
		fill: transparent;
	}
	.knob {
		fill: #0b1022;
		stroke: var(--gold-bright);
		stroke-width: 2.4;
	}
	.handle.A .knob,
	.handle.B .knob {
		fill: var(--gold-bright);
	}
	.handle:hover .knob,
	.handle:focus-visible .knob {
		fill: #fff4da;
	}
	.readout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.7rem 1.4rem;
		padding: 0.85rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
	}
	.cell {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		font-size: 1.02rem;
	}
	.cap {
		font-size: 0.66rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--gold);
	}
	.counts {
		font-family: var(--font-ui);
		font-size: 0.86rem;
		color: var(--ink);
	}
	.counts .p {
		color: var(--green);
	}
	.counts .m {
		color: var(--rose);
	}
	.counts b {
		color: var(--gold-bright);
	}
	.worth {
		display: block;
		color: var(--ink-faint);
		font-size: 0.78rem;
	}
	.cell:first-child {
		grid-column: 1 / -1;
	}
	@media (max-width: 560px) {
		.readout {
			grid-template-columns: 1fr;
		}
	}
</style>
