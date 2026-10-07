<script lang="ts">
	// Figure: the de Rham map. Integrate a 1-form over each (straight, oriented)
	// edge of a triangulated annulus to get a 1-cochain. Click a triangle or a
	// loop to add up the numbers around it: a closed form gives a cocycle (every
	// triangle sums to 0); dθ still gives one full turn around the hole.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { fmt, type Vec2 } from '$lib/figures/cohomology/differential-forms/calc';
	import {
		TAU,
		annulusEdges,
		annulusPos,
		annulusTris,
		deRhamCochain,
		innerLoop,
		onEdge,
		outerLoop,
		type EdgeForm
	} from './derham';

	const W = 640;
	const H = 420;
	const S = 92;
	const px = (p: Vec2): Vec2 => [W / 2 + p[0] * S, H / 2 - p[1] * S];
	const names = ['a_0', 'a_1', 'a_2', 'b_0', 'b_1', 'b_2'];

	let form = $state<EdgeForm>('angle');
	let selected = $state<{ kind: 'tri' | 'loop'; path: number[]; label: string } | null>({
		kind: 'loop',
		path: innerLoop,
		label: 'the inner loop'
	});

	const cochain = $derived(deRhamCochain(form));

	function fracTeX(v: number): string {
		// value in turns, as a nice fraction
		const t = v / TAU;
		for (const d of [1, 2, 3, 6]) {
			const n = Math.round(t * d);
			if (Math.abs(t * d - n) < 1e-9) {
				if (n === 0) return '0';
				const sign = n < 0 ? '-' : '';
				const a = Math.abs(n);
				return d === 1 ? `${sign}${a}` : `${sign}\\tfrac{${a}}{${d}}`;
			}
		}
		return fmt(t, 3);
	}
	const valueTeX = (v: number) => (form === 'angle' ? fracTeX(v) : fmt(v, 2).replace('−', '-'));

	const terms = $derived.by(() => {
		if (!selected) return [];
		const p = selected.path;
		return p.map((a, k) => {
			const b = p[(k + 1) % p.length];
			return { a, b, v: onEdge(cochain, a, b) };
		});
	});
	const total = $derived(terms.reduce((s, t) => s + t.v, 0));
	const sumTeX = $derived.by(() => {
		if (!terms.length) return '';
		const parts = terms.map((t, k) => {
			const s = valueTeX(t.v);
			return k === 0 ? s : s.startsWith('-') ? ` - ${s.slice(1)}` : ` + ${s}`;
		});
		const tot = form === 'angle' ? fracTeX(total) : fmt(Math.abs(total) < 5e-3 ? 0 : total, 2).replace('−', '-');
		const unit = form === 'angle' ? String.raw`\ \text{turn${Math.abs(total / TAU - 1) < 1e-9 ? '' : 's'}}` : '';
		return parts.join('') + ` = ${tot}${unit}`;
	});

	const edgeOn = (i: number, j: number) =>
		!!selected && selected.path.some((a, k) => {
			const b = selected!.path[(k + 1) % selected!.path.length];
			return (a === i && b === j) || (a === j && b === i);
		});

	function triPoints(t: number[]) {
		return t.map((v) => px(annulusPos[v]).join(',')).join(' ');
	}
	function midLabel(i: number, j: number): [number, number] {
		const a = px(annulusPos[i]);
		const b = px(annulusPos[j]);
		const mx = (a[0] + b[0]) / 2;
		const my = (a[1] + b[1]) / 2;
		const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
		const nx = -(b[1] - a[1]) / L;
		const ny = (b[0] - a[0]) / L;
		// put the label on the side away from the centre
		const away = (mx - W / 2) * nx + (my - H / 2) * ny > 0 ? 1 : -1;
		return [mx + nx * 15 * away, my + ny * 15 * away];
	}
	function arrowMid(i: number, j: number) {
		const a = px(annulusPos[i]);
		const b = px(annulusPos[j]);
		const mx = a[0] + (b[0] - a[0]) * 0.56;
		const my = a[1] + (b[1] - a[1]) * 0.56;
		const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
		const ux = (b[0] - a[0]) / L;
		const uy = (b[1] - a[1]) / L;
		const s = 6;
		return `M ${mx - ux * s - uy * s} ${my - uy * s + ux * s} L ${mx + ux * s * 0.6} ${my + uy * s * 0.6} L ${mx - ux * s + uy * s} ${my - uy * s - ux * s}`;
	}
	// On a narrow plate the drawing is scaled down; the edge values grow a little (kz ≥ 1).
	let width = $state(420);
	const kz = $derived(Math.min(1.4, Math.max(1, (1.2 * 420) / (width || 420))));

	function pickTri(k: number) {
		const t = annulusTris[k];
		selected = { kind: 'tri', path: [t[0], t[1], t[2]], label: `the triangle [${t.map((v) => names[v].replace('_', '')).join(', ')}]` };
	}
</script>

<div class="derham" bind:clientWidth={width}>
	<Svg viewBox="110 76 420 364" maxHeight={500} label="A triangulated annulus around a missing point; each edge is labelled with the integral of a 1-form along it.">
		{#each annulusTris as t, k (k)}
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<polygon
				points={triPoints(t)}
				class="tri"
				class:sel={selected?.kind === 'tri' && selected.path.join() === t.join()}
				role="button"
				tabindex="0"
				aria-label="Triangle {t.join('')}"
				onclick={() => pickTri(k)}
				onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pickTri(k))}
			/>
		{/each}
		<circle cx={W / 2} cy={H / 2} r="7" class="hole" />
		{#each annulusEdges as [i, j], k (k)}
			{@const a = px(annulusPos[i])}
			{@const b = px(annulusPos[j])}
			{@const on = edgeOn(i, j)}
			{@const m = midLabel(i, j)}
			{#if on}
				<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} class="edge-halo" />
			{/if}
			<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} class="edge" class:on />
			<path d={arrowMid(i, j)} class="arrowhead" class:on />
			<SvgTeX x={m[0]} y={m[1]} tex={valueTeX(cochain[k])} color={on ? 'var(--gold-bright)' : 'var(--gold-pale)'} size={(on ? 17 : 15) * kz} w={64 * kz} h={28 * kz} />
		{/each}
		{#each annulusPos as p, v (v)}
			{@const q = px(p)}
			<circle cx={q[0]} cy={q[1]} r="6" class="vtx" />
			{@const rr = Math.hypot(p[0], p[1])}
			{@const k = v < 3 ? -0.3 : 0.24}
			<SvgTeX x={q[0] + (p[0] / rr) * k * S} y={q[1] - (p[1] / rr) * k * S} tex={names[v]} color="var(--ink-bright)" size={16} w={34} h={22} />
		{/each}
	</Svg>
	<Controls>
		<Segmented
			bind:value={form}
			label="The 1-form"
			options={[
				{ value: 'angle', label: 'dθ (in turns)' },
				{ value: 'xdy', label: 'x dy' },
				{ value: 'exact', label: 'd(½(x²+y²))' }
			]}
		/>
		<Button variant="subtle" onclick={() => (selected = { kind: 'loop', path: innerLoop, label: 'the inner loop' })}>Inner loop</Button>
		<Button variant="subtle" onclick={() => (selected = { kind: 'loop', path: outerLoop, label: 'the outer loop' })}>Outer loop</Button>
	</Controls>
	<div class="readout">
		{#if selected}
			<div class="cap ui">Adding up around {selected.label} (click any triangle)</div>
			<TeX tex={sumTeX} />
		{/if}
		<p class="note">
			{#if form === 'angle'}
				Each edge carries the angle it subtends at the missing point, as a fraction of a full turn. Every triangle sums to 0 — the cochain is a cocycle because dθ is closed — yet each loop around the hole sums to one whole turn.
			{:else if form === 'xdy'}
				x dy is not closed, and its cochain is not a cocycle: each triangle sums to its own signed area (Stokes: the integral of dx∧dy over the triangle).
			{:else}
				An exact form f = ½(x² + y²) gives the coboundary of the vertex values of f: every closed path, even around the hole, sums to 0.
			{/if}
		</p>
	</div>
</div>

<style>
	.tri {
		fill: rgba(116, 169, 255, 0.07);
		stroke: none;
		cursor: pointer;
		transition: fill 0.2s;
		outline: none;
	}
	.tri:hover,
	.tri:focus-visible {
		fill: rgba(164, 147, 255, 0.16);
	}
	.tri.sel {
		fill: rgba(164, 147, 255, 0.26);
	}
	.hole {
		fill: #0a0f22;
		stroke: var(--rose);
		stroke-width: 2.2;
	}
	.edge {
		stroke: rgba(220, 210, 185, 0.5);
		stroke-width: 1.8;
		stroke-linecap: round;
	}
	.edge.on {
		stroke: var(--gold-bright);
		stroke-width: 3;
	}
	.edge-halo {
		stroke: var(--gold-bright);
		stroke-width: 10;
		opacity: 0.16;
		stroke-linecap: round;
	}
	.arrowhead {
		fill: none;
		stroke: rgba(220, 210, 185, 0.8);
		stroke-width: 1.6;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.arrowhead.on {
		stroke: #fff4da;
	}
	.vtx {
		fill: url(#vertex-fill);
		stroke: #060912;
		stroke-width: 1.5;
	}
	.readout {
		padding: 0.8rem 1.2rem 0.4rem;
		border-top: 1px solid var(--line-faint);
		font-size: 1.05rem;
		overflow-x: auto;
	}
	.cap {
		font-size: 0.66rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--gold);
		margin-bottom: 0.2rem;
	}
	.note {
		margin: 0.5rem 0 0.4rem;
		font-size: 0.92rem;
		color: var(--ink-dim);
	}
</style>
