<script lang="ts">
	// Fox colourings: give every arc of a knot diagram a colour, a number mod p,
	// so that at each crossing twice the over-arc equals the sum of the two
	// under-arcs (for p = 3: the three arcs at a crossing are all the same
	// colour or all different). Using more than one colour is possible for the
	// trefoil but never for the unknot, however it is drawn: a first proof that
	// knots exist, by linear algebra over ℤ/p.
	import { untrack } from 'svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { knotById, tangledUnknot } from '$lib/knots/table';
	import { draw, pathOf } from '$lib/knots/draw';
	import { bestView } from '$lib/knots/view';
	import { resample } from '$lib/knots/relax';
	import { colouringEquations, isColouring, nullspaceMod } from '$lib/knots/colour';
	import type { V3 } from '$lib/knots/diagram';

	const choices = ['3_1', '4_1', '5_1', '5_2', '6_1', '7_1', 'tangle'] as const;
	type Choice = (typeof choices)[number];
	let which = $state<Choice>('3_1');
	let p = $state<3 | 5 | 7>(3);
	let col = $state<number[]>([]);
	let showEq = $state(false);

	const cache = new Map<Choice, ReturnType<typeof draw>>();
	function drawingOf(c: Choice) {
		if (!cache.has(c)) {
			const k = c === 'tangle' ? undefined : knotById.get(c)!;
			// a clean flat drawing where there is one; else the best shadow (the tangled unknot drawn tangled, with four crossings)
			const comps: V3[][] = k?.flat ? k.flat() : bestView((k ? k.build() : tangledUnknot()).map((x) => resample(x, 160)), { atLeast: k ? 0 : 4 });
			cache.set(c, draw(comps, 0.13));
		}
		return cache.get(c)!;
	}
	const d = $derived(drawingOf(which));
	const basis = $derived(nullspaceMod(colouringEquations(d, p), p));
	// a closed loop with no undercrossing is one more free colour
	const total = $derived(p ** (basis.length + d.loops.length));

	// a nice first colouring: the "all different" one when there is one
	function find() {
		const nontrivial = basis.length > 1;
		if (!nontrivial) {
			col = d.arcs.map(() => 0);
			return;
		}
		// combine the basis vectors with random coefficients until some arcs differ
		for (let tries = 0; tries < 50; tries++) {
			const c = basis.map(() => Math.floor(Math.random() * p));
			const v = d.arcs.map((_, i) => basis.reduce((a, b, k) => a + c[k] * b[i], 0) % p);
			if (new Set(v).size > 1) {
				col = v;
				return;
			}
		}
	}
	$effect(() => {
		void d;
		void p;
		untrack(find);
	});

	const palette = ['#f4d79c', '#5fd6cf', '#a493ff', '#f28db6', '#74a9ff', '#84d9a2', '#f4b55f'];
	const W = 560;
	const H = 380;
	const fit = $derived.by(() => {
		const b = d.box;
		const k = Math.min((W - 90) / (b.maxx - b.minx), (H - 80) / (b.maxy - b.miny));
		return { k, ox: W / 2 - ((b.minx + b.maxx) / 2) * k, oy: H / 2 + ((b.miny + b.maxy) / 2) * k };
	});
	const P = (q: [number, number]) => [fit.ox + q[0] * fit.k, fit.oy - q[1] * fit.k];
	const ok = (n: number) => {
		const c = d.crossings[n];
		return (((2 * (col[c.over] ?? 0) - (col[c.in] ?? 0) - (col[c.out] ?? 0)) % p) + p) % p === 0;
	};
	const broken = $derived(d.crossings.filter((_, n) => !ok(n)).length);
	const used = $derived(new Set(col).size);
	const valid = $derived(col.length === d.arcs.length && isColouring(d, p, col));

	function bump(i: number) {
		col = col.map((c, j) => (j === i ? (c + 1) % p : c));
	}
	const key = (e: KeyboardEvent, i: number) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			bump(i);
		}
	};
	const label = (c: Choice) => (c === 'tangle' ? 'tangled unknot' : c.replace(/_(\d)/, (_, x) => String.fromCharCode(0x2080 + +x)));
	const eqTeX = $derived.by(() => {
		const rows = d.crossings.map((c) => {
			const r = new Array(d.arcs.length).fill(0);
			r[c.over] += 2;
			r[c.in] -= 1;
			r[c.out] -= 1;
			return r;
		});
		const body = rows.map((r) => r.join(' & ')).join(' \\\\ ');
		return `\\begin{pmatrix} ${body} \\end{pmatrix}`;
	});
</script>

<div class="ck">
	<svg viewBox="0 0 {W} {H}" role="img" aria-label="A knot diagram whose arcs are coloured; each crossing is marked with a tick if its colours obey the rule and a cross if not.">
		{#each d.arcs as a, i (i)}
			<path d={pathOf(a.pts, false, fit.k, fit.ox, fit.oy)} class="halo" />
			<g
				role="button"
				tabindex="0"
				class="arc"
				aria-label="Arc {i + 1}, colour {col[i] ?? 0}; press to change"
				onclick={() => bump(i)}
				onkeydown={(e) => key(e, i)}
			>
				<path d={pathOf(a.pts, false, fit.k, fit.ox, fit.oy)} class="hit" />
				<path d={pathOf(a.pts, false, fit.k, fit.ox, fit.oy)} class="line" style="stroke:{palette[col[i] ?? 0]}" />
			</g>
		{/each}
		{#each d.loops as l (l.comp)}
			<path d={pathOf(l.pts, true, fit.k, fit.ox, fit.oy)} class="line" style="stroke:{palette[0]}" />
		{/each}
		{#each d.arcs as a, i (i)}
			{@const [x, y] = P([a.mid[0] - a.dir[1] * 0.2, a.mid[1] + a.dir[0] * 0.2])}
			<text {x} y={y + 4} class="num" style="fill:{palette[col[i] ?? 0]}">{col[i] ?? 0}</text>
		{/each}
		{#each d.crossings as c, n (n)}
			{@const [x, y] = P(c.at)}
			<text {x} y={y + 6} class="mark" class:good={ok(n)}>{ok(n) ? '✓' : '✗'}</text>
		{/each}
	</svg>

	<p class="read ui" aria-live="polite">
		{#if broken}
			<span class="bad">{broken} crossing{broken === 1 ? '' : 's'} break{broken === 1 ? 's' : ''} the rule</span>: twice the over-arc must equal the
			sum of the two under-arcs, mod {p}.
		{:else if used === 1}
			Every crossing checks out, but with a single colour that is no surprise.
			{#if basis.length === 1}With {p} colours this diagram has <strong>only</strong> the {p} one-colour colourings.{/if}
		{:else}
			<span class="good">A colouring with {used} colours.</span> With {p} colours this knot has {total} colourings: {p} with one colour and
			{total - p} more.
		{/if}
	</p>

	{#if showEq}
		<div class="eq">
			<p class="ui small">One row per crossing, one column per arc; a colouring is a column of colours that every row turns into a multiple of {p}:</p>
			<TeX tex={eqTeX} display />
			<p class="ui small">
				Its solutions form a space of dimension {basis.length} over ℤ/{p}, so there are {p}<sup>{basis.length}</sup> = {total} colourings.
			</p>
		</div>
	{/if}

	<div class="ctl ui">
		<div class="chips" role="radiogroup" aria-label="Which knot">
			{#each choices as c (c)}
				<button role="radio" aria-checked={which === c} class:on={which === c} onclick={() => (which = c)}>{label(c)}</button>
			{/each}
		</div>
		<div class="row">
			<Segmented
				bind:value={p}
				label="Number of colours"
				options={[
					{ value: 3, label: '3 colours' },
					{ value: 5, label: '5 colours' },
					{ value: 7, label: '7 colours' }
				]}
			/>
			<Button onclick={find}>Find a colouring</Button>
			<Button active={showEq} onclick={() => (showEq = !showEq)}>Equations</Button>
		</div>
	</div>
	{#if valid && used > 1}<span class="sr-only">valid</span>{/if}
</div>

<style>
	.ck {
		display: grid;
	}
	svg {
		width: 100%;
		max-height: 400px;
		display: block;
	}
	.halo {
		fill: none;
		stroke: #070b15;
		stroke-width: 13;
		stroke-linecap: round;
	}
	.arc {
		cursor: pointer;
		outline: none;
	}
	.hit {
		fill: none;
		stroke: transparent;
		stroke-width: 22;
	}
	.line {
		fill: none;
		stroke-width: 6;
		stroke-linecap: round;
		transition: stroke 0.2s;
	}
	.arc:hover .line,
	.arc:focus-visible .line {
		stroke-width: 8;
	}
	.num {
		text-anchor: middle;
		font-family: var(--font-ui);
		font-size: 14px;
		font-weight: 700;
		paint-order: stroke;
		stroke: #070b15;
		stroke-width: 5px;
		pointer-events: none;
	}
	.mark {
		text-anchor: middle;
		font-family: var(--font-ui);
		font-size: 17px;
		font-weight: 700;
		fill: var(--rose);
		paint-order: stroke;
		stroke: #070b15;
		stroke-width: 5px;
		pointer-events: none;
	}
	.mark.good {
		fill: var(--green);
	}
	.read {
		margin: 0.2rem 1.1rem 0.4rem;
		min-height: 2.8em;
		text-align: center;
		font-size: 0.86rem;
		color: var(--ink-dim);
		text-wrap: balance;
	}
	.good {
		color: #c5f0d4;
	}
	.bad {
		color: var(--rose);
	}
	.eq {
		margin: 0 1rem 0.5rem;
		text-align: center;
		overflow-x: auto;
	}
	.small {
		font-size: 0.78rem;
		color: var(--ink-faint);
		margin: 0.2rem 0;
	}
	.ctl {
		display: grid;
		gap: 0.5rem;
		justify-items: center;
		padding: 0.2rem 0.8rem 0.9rem;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.35rem;
	}
	.chips button {
		font: inherit;
		font-size: 0.8rem;
		padding: 0.28rem 0.65rem;
		border-radius: 999px;
		border: 1px solid var(--line-faint);
		background: rgba(255, 255, 255, 0.02);
		color: var(--ink-dim);
		cursor: pointer;
	}
	.chips button.on {
		color: var(--gold-bright);
		border-color: var(--line-strong);
		background: rgba(216, 178, 110, 0.12);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
	}
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip: rect(0 0 0 0);
	}
</style>
