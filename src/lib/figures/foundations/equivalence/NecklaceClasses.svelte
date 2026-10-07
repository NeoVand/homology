<script lang="ts">
	// "The same up to rotation": the 16 ways to colour the corners of a square
	// gold or violet, sorted into rotation classes, then collapsed to 6 points.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import { renderMathInText } from '$lib/katex/render';
	import { Tween, prefersReducedMotion } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { rotate4 } from './relations';

	type Pt = [number, number];

	// classes in rotation order, starting from their smallest member
	const classes: number[][] = (() => {
		const seen = new Set<number>();
		const out: number[][] = [];
		for (let c = 0; c < 16; c++) {
			if (seen.has(c)) continue;
			const orbit: number[] = [];
			let x = c;
			while (!orbit.includes(x)) {
				orbit.push(x);
				seen.add(x);
				x = rotate4(x);
			}
			out.push(orbit);
		}
		return out;
	})();
	const classOf = new Map<number, number>();
	classes.forEach((cl, k) => cl.forEach((c, i) => classOf.set(c, k * 10 + i)));

	let stage = $state(0);
	let width = $state(720);
	const narrow = $derived(width < 560);
	let sel = $state<number | null>(null); // a class index
	const s = new Tween(0, { duration: 900, easing: cubicInOut });

	function layout(st: number, narrow: boolean): { W: number; H: number; pos: Pt[]; scale: number[] } {
		const pos: Pt[] = Array(16);
		const scale: number[] = Array(16).fill(1);
		if (narrow) {
			const W = 360;
			const H = 430;
			for (let c = 0; c < 16; c++) {
				const code = classOf.get(c)!;
				const k = Math.floor(code / 10);
				const i = code % 10;
				if (st === 0) pos[c] = [62 + (c % 4) * 78, 72 + Math.floor(c / 4) * 86];
				else if (st === 1) pos[c] = [78 + i * 68, 48 + k * 66];
				else {
					pos[c] = [70 + (k % 3) * 110, 110 + Math.floor(k / 3) * 150];
					scale[c] = 1.25;
				}
			}
			return { W, H: st === 2 ? 340 : H, pos, scale };
		}
		const W = 640;
		const H = st === 0 ? 270 : st === 1 ? 310 : 240;
		for (let c = 0; c < 16; c++) {
			const code = classOf.get(c)!;
			const k = Math.floor(code / 10);
			const i = code % 10;
			if (st === 0) pos[c] = [62 + (c % 8) * 74, 92 + Math.floor(c / 8) * 96];
			else if (st === 1) pos[c] = [72 + k * 99, 62 + i * 64];
			else {
				pos[c] = [72 + k * 99, 112];
				scale[c] = 1.35;
			}
		}
		return { W, H, pos, scale };
	}

	const L = $derived([0, 1, 2].map((st) => layout(st, narrow)));
	const cur = $derived(s.current);
	const geo = $derived.by(() => {
		const a = Math.min(1, Math.floor(cur));
		const b = Math.min(2, a + 1);
		const f = Math.min(1, cur - a);
		const A = L[a];
		const B = L[b];
		return {
			W: A.W,
			H: A.H + (B.H - A.H) * f,
			pos: A.pos.map((p, c) => [p[0] + (B.pos[c][0] - p[0]) * f, p[1] + (B.pos[c][1] - p[1]) * f] as Pt),
			scale: A.scale.map((x, c) => x + (B.scale[c] - x) * f)
		};
	});
	// in the last stage only the first member (the representative) stays visible
	const collapseAmt = $derived(Math.max(0, cur - 1));

	function go(st: number) {
		stage = st;
		s.set(st, { duration: prefersReducedMotion.current ? 0 : 900 });
	}

	const bead: Pt[] = [
		[-15, -15],
		[15, -15],
		[15, 15],
		[-15, 15]
	];

	const readout = $derived.by(() => {
		if (sel !== null) {
			const cl = classes[sel];
			const how =
				cl.length === 1
					? 'This class has 1 member: a quarter turn leaves it unchanged.'
					: cl.length === 2
						? 'This class has 2 members: a quarter turn swaps them.'
						: 'This class has 4 members: each quarter turn carries one to the next.';
			return `${how} As an element of the quotient, the whole class is a single necklace.`;
		}
		if (stage === 0) return String.raw`Each corner is gold or violet: two choices at each of four corners make \(2^4 = 16\) colourings. Declare two colourings the same when a rotation turns one into the other.`;
		if (stage === 1) return String.raw`Sorted into classes (piles): \(1+4+4+2+4+1 = 16\). Six piles.`;
		return String.raw`The quotient set has 6 elements: there are exactly 6 different necklaces with 4 beads in 2 colours.`;
	});
</script>

<div class="nk" bind:clientWidth={width}>
	<Svg viewBox="0 0 {geo.W} {geo.H}" maxHeight={narrow ? 520 : 360} label="Sixteen colourings of the corners of a square, sorted into six rotation classes">
		{#if cur > 0.02}
			{#each classes as cl, k (k)}
				{@const p = L[1].pos[cl[0]]}
				{#if !narrow}
					<rect x={p[0] - 40} y={p[1] - 40} width="80" height={L[1].pos[cl[cl.length - 1]][1] - p[1] + 80} rx="16" class="pile" class:hot={sel === k} style="opacity:{Math.min(1, cur) * (1 - collapseAmt)}" />
				{:else}
					<rect x={p[0] - 38} y={p[1] - 31} width={L[1].pos[cl[cl.length - 1]][0] - p[0] + 76} height="62" rx="16" class="pile" class:hot={sel === k} style="opacity:{Math.min(1, cur) * (1 - collapseAmt)}" />
				{/if}
			{/each}
		{/if}
		{#each Array(16) as _, c (c)}
			{@const k = Math.floor(classOf.get(c)! / 10)}
			{@const isRep = classOf.get(c)! % 10 === 0}
			{@const p = geo.pos[c]}
			{@const op = (isRep ? 1 : 1 - collapseAmt) * (sel === null || sel === k ? 1 : 0.28)}
			<g
				class="neck"
				class:hot={sel === k}
				transform="translate({p[0]} {p[1]}) scale({geo.scale[c]})"
				style="opacity:{op}"
				role="button"
				tabindex={isRep ? 0 : -1}
				aria-label="colouring {c}, class {k + 1}"
				onclick={() => (sel = sel === k ? null : k)}
				onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), (sel = sel === k ? null : k))}
			>
				<rect x="-27" y="-27" width="54" height="54" rx="12" class="hit" />
				<rect x="-15" y="-15" width="30" height="30" rx="3" class="frame" />
				{#each bead as b, i (i)}
					{@const on = ((c >> i) & 1) === 1}
					<circle cx={b[0]} cy={b[1]} r="6.6" class="bead" class:gold={on} class:violet={!on} />
				{/each}
				{#if isRep && collapseAmt > 0.05}
					<g style="opacity:{collapseAmt}">
						<circle cx="0" cy="0" r="29" class="tok-ring" />
						<text x="0" y="46" class="cnt">×{classes[k].length}</text>
					</g>
				{/if}
			</g>
		{/each}
	</Svg>
	<p class="readout" aria-live="polite">{@html renderMathInText(readout)}</p>
	<Controls>
		<Segmented
			bind:value={stage}
			options={[
				{ value: 0, label: 'All 16 colourings' },
				{ value: 1, label: 'Sort into classes' },
				{ value: 2, label: 'One point per class' }
			]}
			label="Stage"
			onchange={(v) => go(v)}
		/>
	</Controls>
</div>

<style>
	.nk > :global(svg) {
		padding: 0.6rem 0.4rem 0;
	}
	.pile {
		fill: rgba(164, 147, 255, 0.05);
		stroke: rgba(164, 147, 255, 0.28);
		stroke-width: 1.2;
		stroke-dasharray: 3 4;
	}
	.pile.hot {
		fill: rgba(242, 208, 143, 0.07);
		stroke: rgba(242, 208, 143, 0.6);
	}
	.neck {
		cursor: pointer;
		transition: opacity 0.25s;
	}
	.neck:focus {
		outline: none;
	}
	.hit {
		fill: transparent;
	}
	.frame {
		fill: rgba(116, 169, 255, 0.05);
		stroke: rgba(200, 192, 170, 0.45);
		stroke-width: 1.4;
	}
	.neck:hover .frame,
	.neck.hot .frame,
	.neck:focus-visible .frame {
		stroke: var(--gold-bright);
	}
	.bead {
		stroke: rgba(6, 9, 18, 0.9);
		stroke-width: 1.3;
	}
	.bead.gold {
		fill: #f2d08f;
	}
	.bead.violet {
		fill: #6f5fd0;
		stroke: #b4a8ff;
		stroke-width: 1.2;
	}
	.tok-ring {
		fill: none;
		stroke: var(--gold);
		stroke-width: 1;
		stroke-dasharray: 2 3;
	}
	.cnt {
		font-family: var(--font-ui);
		font-size: 11px !important;
		font-weight: 650;
		fill: var(--gold) !important;
		text-anchor: middle;
	}
	.readout {
		margin: 0.6rem 1.3rem 0.9rem !important;
		text-align: center;
		font-size: 0.95rem;
		color: var(--ink-dim);
		min-height: 3em;
	}
</style>
