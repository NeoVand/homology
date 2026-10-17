<script lang="ts">
	// The space around a trefoil, through its loops. Each arc of the diagram has
	// a lasso: a loop that starts high above the knot, goes down around that arc
	// once and comes back up. Sliding a lasso along its strand, under a crossing,
	// changes it: on the far side it must also go round the strand on top, so
	// the lassos obey one relation per crossing. Then send each lasso to a flip
	// of the triangle (Chapter 1.3): if every crossing's relation holds there,
	// the flips are a faithful picture of the loops, and flips do not commute.
	import { draw, pathOf } from '$lib/knots/draw';
	import { sampleClosed } from '$lib/knots/curves';
	import type { V2 } from '$lib/knots/diagram';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { ResetIcon } from '$lib/icons';

	const TAU = Math.PI * 2;
	// the classic three-lobed trefoil
	const d = draw(
		[
			sampleClosed((u) => {
				const t = TAU * u;
				return [0.55 * (Math.sin(t) + 2 * Math.sin(2 * t)), 0.55 * (Math.cos(t) - 2 * Math.cos(2 * t)), -0.55 * Math.sin(3 * t)];
			}, 600)
		],
		0.17
	);
	const W = 600;
	const H = 430;
	const k = 104;
	const ox = W / 2;
	const oy = H / 2 + 6;
	const P = (p: V2): V2 => [ox + p[0] * k, oy - p[1] * k];
	const names = ['x', 'y', 'z'];

	// the flips of the triangle, as in Chapter 1.3: f₁ (vertical axis), f₂, f₃
	const flips = [
		{ tex: 'f_1', color: '#5fd6cf', angle: 90 },
		{ tex: 'f_2', color: '#a493ff', angle: 210 },
		{ tex: 'f_3', color: '#f28db6', angle: 330 }
	];
	/** f_a f_b f_a in D₃: f_b itself if a = b, otherwise the third flip */
	const conj = (a: number, b: number) => (a === b ? b : 3 - a - b);

	let mode = $state<'lassos' | 'flips'>('lassos');
	let picked = $state<number | null>(0);
	let assign = $state<number[]>([0, 1, 2]);

	// lasso geometry: a small ellipse across the strand at the middle of each arc
	const lassos = d.arcs.map((a, i) => {
		const [mx, my] = P(a.mid);
		const dir: V2 = [a.dir[0], -a.dir[1]]; // page coordinates
		const nrm: V2 = [-dir[1], dir[0]];
		const R1 = 28;
		const R2 = 10;
		const pt = (th: number): V2 => [mx + nrm[0] * R1 * Math.cos(th) + dir[0] * R2 * Math.sin(th), my + nrm[1] * R1 * Math.cos(th) + dir[1] * R2 * Math.sin(th)];
		const arc = (a0: number, a1: number) => {
			const pts: V2[] = [];
			for (let s = 0; s <= 24; s++) pts.push(pt(a0 + ((a1 - a0) * s) / 24));
			return 'M ' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L ');
		};
		// the half in front of the strand, and the half behind it (drawn under the strand)
		const front = arc(-Math.PI / 2 + 0.25, Math.PI / 2 - 0.25);
		const back = arc(Math.PI / 2 + 0.25, (3 * Math.PI) / 2 - 0.25);
		const tip = pt(0.35);
		const tail = pt(0.15);
		const label: V2 = [mx + nrm[0] * (R1 + 20), my + nrm[1] * (R1 + 20)];
		return { i, front, back, tip, tail, label };
	});

	const relation = (n: number) => {
		const c = d.crossings[n];
		const o = names[c.over];
		const pre = c.sign > 0 ? o : `${o}^{-1}`;
		const post = c.sign > 0 ? `${o}^{-1}` : o;
		return `${names[c.out]} = ${pre}\\,${names[c.in]}\\,${post}`;
	};
	const holds = (n: number) => {
		const c = d.crossings[n];
		return assign[c.out] === conj(assign[c.over], assign[c.in]);
	};
	const allHold = $derived(d.crossings.every((_, n) => holds(n)));
	const distinct = $derived(new Set(assign).size);

	function cycle(i: number) {
		assign = assign.map((f, j) => (j === i ? (f + 1) % 3 : f));
	}
	function key(e: KeyboardEvent, fn: () => void) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			fn();
		}
	}
	const arcColor = (i: number) => {
		if (mode === 'flips') return flips[assign[i]].color;
		if (picked === null) return '#e9dfc6';
		const c = d.crossings[picked];
		return c.over === i ? '#f4d79c' : c.in === i || c.out === i ? '#e9dfc6' : '#5d5a50';
	};
	const touches = (n: number, i: number) => {
		const c = d.crossings[n];
		return c.over === i || c.in === i || c.out === i;
	};

	const flipBadge = (cx: number, cy: number, f: number) => {
		// a small triangle with its mirror axis
		const r = 15;
		const v = [90, 210, 330].map((a) => [cx + r * Math.cos((a * Math.PI) / 180), cy - r * Math.sin((a * Math.PI) / 180)]);
		const ang = (flips[f].angle * Math.PI) / 180;
		const ax: V2 = [cx + 1.25 * r * Math.cos(ang), cy - 1.25 * r * Math.sin(ang)];
		const bx: V2 = [cx - 0.75 * r * Math.cos(ang), cy + 0.75 * r * Math.sin(ang)];
		return { tri: v.map((p) => p.join(',')).join(' '), ax, bx };
	};
</script>

<div class="kl">
	<svg viewBox="0 0 {W} {H}" role="img" aria-label="A trefoil knot drawn with three arcs. Around each arc is a small loop, a lasso, labelled x, y or z. The three crossings can be selected to show the relation between the lassos there; in the second mode each arc is sent to a flip of a triangle and each crossing shows whether its relation holds.">
		<!-- lassos, back halves (under the knot) -->
		{#if mode === 'lassos'}
			{#each lassos as l (l.i)}
				<path d={l.back} class="lasso back" />
			{/each}
		{/if}
		<!-- the knot -->
		{#each d.arcs as a, i (i)}
			<path d={pathOf(a.pts, false, k, ox, oy)} class="halo" />
			<path d={pathOf(a.pts, false, k, ox, oy)} class="arc" style="stroke:{arcColor(i)}" />
		{/each}
		{#if mode === 'lassos'}
			{#each lassos as l (l.i)}
				<path d={l.front} class="lasso" />
				<line x1={l.tail[0]} y1={l.tail[1]} x2={l.tip[0]} y2={l.tip[1]} class="lasso-head" marker-end="url(#arrow-teal)" />
				<SvgTeX x={l.label[0]} y={l.label[1]} tex={names[l.i]} size={24} color="var(--teal)" w={44} h={34} />
			{/each}
		{:else}
			{#each lassos as l (l.i)}
				{@const b = flipBadge(l.label[0], l.label[1], assign[l.i])}
				<g
					class="badge"
					role="button"
					tabindex="0"
					aria-label="Lasso {names[l.i]} goes to the flip f{assign[l.i] + 1}; press to change it"
					onclick={() => cycle(l.i)}
					onkeydown={(e) => key(e, () => cycle(l.i))}
				>
					<circle cx={l.label[0]} cy={l.label[1]} r="25" class="badge-bg" />
					<polygon points={b.tri} class="tri" />
					<line x1={b.ax[0]} y1={b.ax[1]} x2={b.bx[0]} y2={b.bx[1]} style="stroke:{flips[assign[l.i]].color}" class="axis" />
				</g>
			{/each}
		{/if}
		<!-- crossings -->
		{#each d.crossings as c, n (n)}
			{@const [cx, cy] = P(c.at)}
			<g
				class="xing"
				class:on={picked === n}
				role="button"
				tabindex="0"
				aria-label="Crossing {n + 1}"
				onclick={() => (picked = picked === n ? null : n)}
				onkeydown={(e) => key(e, () => (picked = picked === n ? null : n))}
			>
				<circle {cx} {cy} r="19" class="hit" />
				{#if mode === 'flips'}
					<text x={cx} y={cy + 5} class="mark" class:good={holds(n)}>{holds(n) ? '✓' : '✗'}</text>
				{:else}
					<circle {cx} {cy} r="16" class="ring" />
				{/if}
			</g>
		{/each}
	</svg>

	<div class="read ui" aria-live="polite">
		{#if mode === 'lassos'}
			{#if picked !== null}
				{@const c = d.crossings[picked]}
				<p>
					Slide the lasso <TeX tex={names[c.in]} /> along its strand, under this crossing: it arrives as the lasso
					<TeX tex={names[c.out]} />, but on the way it has had to go round the strand on top, whose lasso is
					<span class="nw"><TeX tex={names[c.over]} />.</span> So
				</p>
				<TeX tex={relation(picked)} display />
			{:else}
				<p>Choose a crossing to see the relation it imposes on the lassos.</p>
			{/if}
			<p class="all">
				All three: <TeX tex={d.crossings.map((_, n) => relation(n)).join(',\\quad ')} />
			</p>
		{:else if !allHold}
			<p class="bad">At least one crossing breaks its relation: these flips are not a picture of the loops.</p>
		{:else if distinct === 1}
			<p>Every crossing checks out, but with one flip everywhere this proves nothing: a single loop round any knot does as much.</p>
		{:else}
			<p class="good">
				Every crossing checks out, and the flips do not commute: <TeX tex={`${flips[0].tex}${flips[1].tex} \\ne ${flips[1].tex}${flips[0].tex}`} />. So
				the lassos cannot commute either: <TeX tex="xy \ne yx" />. Around an unknotted circle every loop is a power of one lasso, and they all
				commute. The trefoil is really knotted.
			</p>
		{/if}
	</div>

	<div class="ctl ui">
		<Segmented
			bind:value={mode}
			label="What to show"
			options={[
				{ value: 'lassos', label: 'Lassos and relations' },
				{ value: 'flips', label: 'Send them to the triangle' }
			]}
		/>
		{#if mode === 'flips'}
			<Button icon={ResetIcon} onclick={() => (assign = [0, 1, 2])}>Reset</Button>
		{/if}
	</div>
</div>

<style>
	.kl {
		display: grid;
	}
	svg {
		width: 100%;
		max-height: 440px;
		display: block;
	}
	.halo {
		fill: none;
		stroke: #070b15;
		stroke-width: 14;
		stroke-linecap: round;
	}
	.arc {
		fill: none;
		stroke-width: 6;
		stroke-linecap: round;
		transition: stroke 0.25s;
	}
	.lasso {
		fill: none;
		stroke: var(--teal);
		stroke-width: 2.8;
		stroke-linecap: round;
	}
	.lasso.back {
		opacity: 0.55;
	}
	.lasso-head {
		stroke: var(--teal);
		stroke-width: 2.4;
	}
	.xing {
		cursor: pointer;
		outline: none;
	}
	.hit {
		fill: transparent;
	}
	.ring {
		fill: none;
		stroke: rgba(244, 215, 156, 0.25);
		stroke-width: 1.5;
		stroke-dasharray: 3 4;
		transition: stroke 0.2s;
	}
	.xing:hover .ring,
	.xing:focus-visible .ring,
	.xing.on .ring {
		stroke: var(--gold-bright);
	}
	.mark {
		text-anchor: middle;
		font-family: var(--font-ui);
		font-size: 21px;
		font-weight: 700;
		fill: var(--rose);
		paint-order: stroke;
		stroke: #070b15;
		stroke-width: 5px;
	}
	.mark.good {
		fill: var(--green);
	}
	.badge {
		cursor: pointer;
		outline: none;
	}
	.badge-bg {
		fill: rgba(12, 17, 32, 0.92);
		stroke: rgba(244, 215, 156, 0.3);
	}
	.badge:hover .badge-bg,
	.badge:focus-visible .badge-bg {
		stroke: var(--gold-bright);
	}
	.tri {
		fill: rgba(244, 215, 156, 0.08);
		stroke: #e9dfc6;
		stroke-width: 1.4;
	}
	.axis {
		stroke-width: 2.4;
		stroke-linecap: round;
	}
	.read {
		min-height: 6.6rem;
		margin: 0 1.1rem;
		font-size: 0.88rem;
		color: var(--ink-dim);
		text-align: center;
	}
	.read p {
		margin: 0.3rem 0;
	}
	.nw {
		white-space: nowrap;
	}
	.read .all {
		font-size: 0.8rem;
		color: var(--ink-faint);
	}
	.read .good {
		color: #c5f0d4;
	}
	.read .bad {
		color: var(--rose);
	}
	.ctl {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		justify-content: center;
		padding: 0.4rem 0 0.9rem;
	}
</style>
