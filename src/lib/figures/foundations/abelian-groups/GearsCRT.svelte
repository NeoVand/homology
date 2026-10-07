<script lang="ts">
	// Two clocks, with m and n hours, tick together: the element (1, 1) of
	// ℤ/m ⊕ ℤ/n, added again and again. On the m × n grid (a torus: leave one
	// edge, re-enter at the opposite one) the walk visits every cell exactly
	// when gcd(m, n) = 1 — and then ℤ/m ⊕ ℤ/n is cyclic, ≅ ℤ/mn.
	import { onDestroy } from 'svelte';
	import { Tween, prefersReducedMotion } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import Svg from '$lib/components/svg/Svg.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import { gcd, lcm, residueColor } from '../groups/zn';

	let m = $state(2);
	let n = $state(3);
	let k = $state(0);
	let playing = $state(false);
	let cw = $state(700);
	let timer: ReturnType<typeof setInterval> | undefined;

	const hand = new Tween(0, { duration: 420, easing: cubicInOut });
	$effect(() => {
		hand.set(k, { duration: prefersReducedMotion.current ? 0 : 420 });
	});
	$effect(() => {
		void m;
		void n;
		stop();
		k = 0;
		hand.set(0, { duration: 0 });
	});

	const L = $derived(lcm(m, n));
	const cyclic = $derived(gcd(m, n) === 1);
	const visited = $derived(new Set(Array.from({ length: Math.min(k, L) + 1 }, (_, i) => `${i % m},${i % n}`)));

	function stepOnce() {
		k = k + 1;
		if (k >= L) {
			k = L;
			stop();
		}
	}
	function play() {
		if (playing) return stop();
		if (k >= L) {
			k = 0;
			hand.set(0, { duration: 0 });
		}
		playing = true;
		timer = setInterval(stepOnce, prefersReducedMotion.current ? 250 : 650);
	}
	function stop() {
		playing = false;
		clearInterval(timer);
	}
	function reset() {
		stop();
		k = 0;
		hand.set(0, { duration: 0 });
	}
	onDestroy(stop);

	const narrow = $derived(cw < 560);
	const W = $derived(narrow ? 400 : 640);
	const Hh = $derived(narrow ? 490 : 300);
	const r = 52;
	const dial1 = $derived<[number, number]>(narrow ? [W / 2 - 96, 96] : [96, 146]);
	const dial2 = $derived<[number, number]>(narrow ? [W / 2 + 96, 96] : [268, 146]);
	const gx0 = $derived(narrow ? 40 : 372);
	const gy0 = $derived(narrow ? 214 : 40);
	const gw = $derived(narrow ? W - 80 : 248);
	const cell = $derived(Math.min(gw / n, (narrow ? 250 : 220) / m));
	const gridW = $derived(cell * n);
	const gridH = $derived(cell * m);
	const gx = $derived(gx0 + (gw - gridW) / 2);
	const gy = $derived(gy0 + ((narrow ? 250 : 220) - gridH) / 2);

	const at = (c: [number, number], hours: number, h: number, rad = r): [number, number] => {
		const a = -Math.PI / 2 + (2 * Math.PI * h) / hours;
		return [c[0] + rad * Math.cos(a), c[1] + rad * Math.sin(a)];
	};
	const cellC = (a: number, b: number): [number, number] => [gx + (b + 0.5) * cell, gy + (a + 0.5) * cell];

	// path segments on the torus grid
	const segs = $derived.by(() => {
		const out: { x1: number; y1: number; x2: number; y2: number }[] = [];
		for (let i = 0; i < Math.min(k, L); i++) {
			const a = i % m;
			const b = i % n;
			const [x1, y1] = cellC(a, b);
			const wrapA = a === m - 1;
			const wrapB = b === n - 1;
			if (!wrapA && !wrapB) {
				const [x2, y2] = cellC(a + 1, b + 1);
				out.push({ x1, y1, x2, y2 });
			} else {
				// leave through the edge, re-enter on the opposite side
				out.push({ x1, y1, x2: x1 + cell / 2, y2: y1 + cell / 2 });
				const [x3, y3] = cellC((a + 1) % m, (b + 1) % n);
				out.push({ x1: x3 - cell / 2, y1: y3 - cell / 2, x2: x3, y2: y3 });
			}
		}
		return out;
	});
</script>

<div class="gears" bind:clientWidth={cw}>
	<Svg viewBox="0 0 {W} {Hh}" maxHeight={narrow ? 520 : 340} label="Two clock dials with m and n hours ticking together, and the path of (k mod m, k mod n) on an m by n grid">
		{#each [[dial1, m, 'a'], [dial2, n, 'b']] as [c, hours, nm] (nm)}
			{@const C = c as [number, number]}
			{@const H = hours as number}
			{@const hp = at(C, H, hand.current, r - 12)}
			<circle cx={C[0]} cy={C[1]} r={r + 28} fill="rgba(30,38,80,0.5)" stroke="rgba(216,178,110,0.3)" />
			{#each Array.from({ length: H }, (_, i) => i) as i (i)}
				{@const p = at(C, H, i)}
				{@const tp = at(C, H, i, r + 16)}
				<circle cx={p[0]} cy={p[1]} r="5.5" fill={residueColor(i, H)} />
				<text x={tp[0]} y={tp[1] + 4} text-anchor="middle" class="num">{i}</text>
			{/each}
			<line x1={C[0]} y1={C[1]} x2={hp[0]} y2={hp[1]} stroke="#fbf6e8" stroke-width="2.4" stroke-linecap="round" />
			<circle cx={C[0]} cy={C[1]} r="5" fill="url(#vertex-fill)" />
			<text x={C[0]} y={C[1] + r + 50} text-anchor="middle" class="cap">ℤ/{H}</text>
		{/each}

		<!-- the grid -->
		<rect x={gx} y={gy} width={gridW} height={gridH} fill="rgba(10,14,30,0.6)" stroke="rgba(216,178,110,0.35)" rx="4" />
		{#each Array.from({ length: m }, (_, a) => a) as a (a)}
			{#each Array.from({ length: n }, (_, b) => b) as b (b)}
				{@const on = visited.has(`${a},${b}`)}
				{@const cur = a === k % m && b === k % n}
				<rect
					x={gx + b * cell + 2}
					y={gy + a * cell + 2}
					width={cell - 4}
					height={cell - 4}
					rx="4"
					fill={cur ? 'rgba(242,208,143,0.55)' : on ? 'rgba(242,208,143,0.18)' : 'rgba(255,255,255,0.03)'}
					stroke={cur ? '#f2d08f' : 'rgba(255,255,255,0.06)'}
				/>
			{/each}
		{/each}
		{#each segs as s, i (i)}
			<line x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} stroke="#f2d08f" stroke-width="2" stroke-linecap="round" opacity="0.85" />
		{/each}
		{#each Array.from({ length: m }, (_, a) => a) as a (a)}
			<text x={gx - 8} y={gy + (a + 0.5) * cell + 4} text-anchor="end" class="num">{a}</text>
		{/each}
		{#each Array.from({ length: n }, (_, b) => b) as b (b)}
			<text x={gx + (b + 0.5) * cell} y={gy - 7} text-anchor="middle" class="num">{b}</text>
		{/each}
	</Svg>
	<div class="read ui" aria-live="polite">
		<div>
			after <b>{k}</b> step{k === 1 ? '' : 's'}: <TeX tex={`${k}\\cdot(1, 1) = (${k % m}, ${k % n})`} />
		</div>
		<div class="dim">
			Both hands are back at 0 after <TeX tex={`\\operatorname{lcm}(${m}, ${n}) = ${L}`} /> steps, having visited {L} of
			the {m * n} pairs.
		</div>
		<div class="verdict" class:yes={cyclic}>
			{#if cyclic}
				Every pair is reached, so <TeX tex="(1,1)" /> generates everything:
				<TeX tex={`\\mathbb{Z}/${m} \\oplus \\mathbb{Z}/${n} \\cong \\mathbb{Z}/${m * n}`} />.
			{:else}
				Only {L} of {m * n} pairs. No element has order more than {L}, so
				<TeX tex={`\\mathbb{Z}/${m} \\oplus \\mathbb{Z}/${n}`} /> is <em>not</em> cyclic.
			{/if}
		</div>
	</div>
</div>
<Controls>
	<button class="b ui" onclick={stepOnce} disabled={k >= L}>Step</button>
	<button class="b ui gold" onclick={play}>{playing ? 'Pause' : 'Play'}</button>
	<button class="b ui" onclick={reset}>Reset</button>
	<Stepper bind:value={m} min={2} max={8} label="m" />
	<Stepper bind:value={n} min={2} max={8} label="n" />
</Controls>

<style>
	.gears {
		padding: 0.7rem 0.8rem 0.2rem;
	}
	.num {
		font-family: var(--font-ui);
		font-size: 11px !important;
		fill: var(--ink-faint) !important;
	}
	.cap {
		font-family: var(--font-body);
		font-size: 15px !important;
		fill: var(--ink-dim) !important;
	}
	.read {
		text-align: center;
		font-size: 0.86rem;
		color: var(--ink);
		line-height: 1.7;
		padding: 0.3rem 0.6rem 0.7rem;
	}
	.dim {
		color: var(--ink-dim);
		font-size: 0.8rem;
	}
	.verdict {
		color: var(--rose);
	}
	.verdict.yes {
		color: var(--green);
	}
	.b {
		height: 2.2rem;
		padding: 0 0.9rem;
		border-radius: 999px;
		border: 1px solid var(--line);
		background: rgba(216, 178, 110, 0.05);
		color: var(--gold-bright);
		cursor: pointer;
		font-size: 0.78rem;
	}
	.b.gold {
		border: 0;
		background: linear-gradient(180deg, #f6dca0, #d2a95f);
		color: #1a1206;
		font-weight: 650;
	}
	.b:disabled {
		opacity: 0.35;
		cursor: default;
	}
	/* phones: the drawing shrinks, so its numbers grow */
	@container figure (max-width: 34rem) {
		.num {
			font-size: 14px !important;
		}
	}
</style>
