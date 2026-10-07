<script lang="ts">
	// Clock arithmetic ℤ/n: pick n, a and b; watch the hand walk a steps and
	// then b more, wrapping past 0. The addition table is colour-coded by value.
	import { Tween, prefersReducedMotion } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import Svg from '$lib/components/svg/Svg.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { PlayIcon } from '$lib/icons';
	import { mod, residueColor } from './zn';

	let n = $state(12);
	let a = $state(7);
	let b = $state(8);
	let showInv = $state(false);

	const p = new Tween(0, { easing: cubicInOut });

	// keep a, b inside ℤ/n when n shrinks
	$effect(() => {
		if (a > n - 1) a = n - 1;
		if (b > n - 1) b = n - 1;
	});

	function play() {
		const total = a + b;
		if (prefersReducedMotion.current) {
			p.set(total, { duration: 0 });
			return;
		}
		p.set(0, { duration: 0 }).then(() => p.set(total, { duration: 380 + 85 * total }));
	}

	$effect(() => {
		void n;
		void a;
		void b;
		play();
	});

	const R = 104;
	const ang = (s: number) => -Math.PI / 2 + (2 * Math.PI * s) / n;
	const at = (s: number, r: number): [number, number] => [r * Math.cos(ang(s)), r * Math.sin(ang(s))];

	function arc(s0: number, s1: number, r: number) {
		if (s1 <= s0 + 1e-6) return '';
		const [x0, y0] = at(s0, r);
		const [x1, y1] = at(s1, r);
		const large = s1 - s0 > n / 2 ? 1 : 0;
		return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
	}

	const cur = $derived(p.current);
	const goldArc = $derived(arc(0, Math.min(cur, a), R - 12));
	const tealArc = $derived(cur > a ? arc(a, cur, R - 24) : '');
	const hand = $derived(at(cur, R - 6));
	const sum = $derived(a + b);
	const res = $derived(mod(a + b, n));
	const wrapped = $derived(sum >= n);
	const passed = $derived(cur >= n - 0.02);
</script>

<div class="clock-fig">
	<div class="clockbox">
		<Svg viewBox="-150 -150 300 300" maxHeight={340} label="A clock face with n positions showing the addition a + b in ℤ/n">
			<defs>
				<radialGradient id="ca-face" cx="50%" cy="45%" r="55%">
					<stop offset="0" stop-color="#1d2750" stop-opacity="0.85" />
					<stop offset="1" stop-color="#0a0f1e" stop-opacity="0.4" />
				</radialGradient>
				<!-- glows sized for small dots (the shared ones crop a small dot's blur to a square) -->
				<filter id="ca-glow" x="-150%" y="-150%" width="400%" height="400%">
					<feGaussianBlur stdDeviation="3" result="b" />
					<feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
				</filter>
				<filter id="ca-glow-strong" x="-150%" y="-150%" width="400%" height="400%">
					<feGaussianBlur stdDeviation="6" result="b" />
					<feMerge><feMergeNode in="b" /><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
				</filter>
			</defs>
			<circle r={R + 30} fill="url(#ca-face)" stroke="rgba(216,178,110,0.28)" stroke-width="1" />
			<circle r={R} fill="none" stroke="rgba(235,229,213,0.16)" stroke-width="1" />

			{#if showInv}
				{#each Array.from({ length: n }, (_, k) => k) as k (k)}
					{#if k > 0 && k < n - k}
						{@const [x0, y0] = at(k, R)}
						{@const [x1, y1] = at(n - k, R)}
						<line x1={x0} y1={y0} x2={x1} y2={y1} stroke="#f28db6" stroke-opacity="0.55" stroke-width="1.3" stroke-dasharray="4 4" />
					{/if}
				{/each}
				<line x1="0" y1={-R - 18} x2="0" y2={R + 18} stroke="#f28db6" stroke-opacity="0.25" stroke-width="1" />
			{/if}

			<path d={goldArc} fill="none" stroke="#f2d08f" stroke-width="5" stroke-linecap="round" filter="url(#glow)" />
			<path d={tealArc} fill="none" stroke="#5fd6cf" stroke-width="5" stroke-linecap="round" filter="url(#glow)" />

			{#each Array.from({ length: n }, (_, k) => k) as k (k)}
				{@const [x, y] = at(k, R)}
				{@const [tx, ty] = at(k, R + 21)}
				{@const isRes = k === res && Math.abs(cur - sum) < 0.01}
				<circle
					cx={x}
					cy={y}
					r={isRes ? 8 : 5.5}
					fill={residueColor(k, n)}
					stroke="#0b1020"
					stroke-width="1"
					filter={isRes ? 'url(#ca-glow-strong)' : undefined}
				/>
				<text x={tx} y={ty + 5} text-anchor="middle" class="num" class:hi={k === res && Math.abs(cur - sum) < 0.01}>{k}</text>
			{/each}

			{#if passed && wrapped}
				<circle cx="0" cy={-R} r="11.5" fill="none" stroke="#5fd6cf" stroke-opacity="0.6" stroke-width="1.5" />
			{/if}

			<line x1="0" y1="0" x2={hand[0]} y2={hand[1]} stroke="#fbf6e8" stroke-width="2.4" stroke-linecap="round" />
			<circle cx={hand[0]} cy={hand[1]} r="4.5" fill="#fff8e6" filter="url(#ca-glow)" />
			<circle r="6" fill="url(#vertex-fill)" />
		</Svg>
		<div class="readout ui">
			{#if wrapped}
				<TeX tex={`${a} + ${b} = ${sum} = ${n} + ${res}`} />, so in <TeX tex={`\\mathbb{Z}/${n}`} />:
				<span class="big"><TeX tex={`${a} + ${b} = ${res}`} /></span>
			{:else}
				<span class="big"><TeX tex={`${a} + ${b} = ${res}`} /></span>
				<span class="dim">(no wrap needed)</span>
			{/if}
			<div class="inv">
				{#if a === 0}
					<TeX tex={'0'} /> is its own inverse: <TeX tex={'0 + 0 = 0'} />.
				{:else}
					Inverse of <TeX tex={String(a)} />: <TeX tex={`-${a} = ${mod(-a, n)}`} />, because
					<TeX tex={`${a} + ${mod(-a, n)} = ${n} = 0`} /> on this clock.
				{/if}
			</div>
		</div>
	</div>

	<div class="tablebox">
		<div class="cap ui">Addition table of <TeX tex={`\\mathbb{Z}/${n}`} /> — tap a cell</div>
		<div class="grid" style="--n:{n + 1}">
			<div class="h plus"><TeX tex={'+'} /></div>
			{#each Array.from({ length: n }, (_, k) => k) as j (j)}
				<div class="h" class:on={j === b}>{j}</div>
			{/each}
			{#each Array.from({ length: n }, (_, k) => k) as i (i)}
				<div class="h" class:on={i === a}>{i}</div>
				{#each Array.from({ length: n }, (_, k) => k) as j (j)}
					{@const v = mod(i + j, n)}
					<button
						class="c"
						class:sel={i === a && j === b}
						class:line={i === a || j === b}
						style="--c:{residueColor(v, n)}"
						onclick={() => {
							a = i;
							b = j;
						}}
						aria-label="{i} plus {j} is {v}">{v}</button
					>
				{/each}
			{/each}
		</div>
	</div>
</div>
<Controls>
	<Stepper bind:value={n} min={2} max={12} label="clock size n">
		{#snippet labelSnippet()}<span class="long">clock size&nbsp;</span><TeX tex="n" />{/snippet}
	</Stepper>
	<Stepper bind:value={a} min={0} max={n - 1} label="a">
		{#snippet labelSnippet()}<TeX tex="a" />{/snippet}
	</Stepper>
	<Stepper bind:value={b} min={0} max={n - 1} label="b">
		{#snippet labelSnippet()}<TeX tex="b" />{/snippet}
	</Stepper>
	<Toggle bind:checked={showInv} label="show inverses" />
	<Button icon={PlayIcon} onclick={play} title="Replay the walk"><span class="long">Replay</span></Button>
</Controls>

<style>
	.clock-fig {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 1rem 1.6rem;
		padding: 1rem 1.3rem 1rem;
		align-items: center;
	}
	@container figure (max-width: 46rem) {
		.clock-fig {
			grid-template-columns: minmax(0, 1fr);
			padding: 0.8rem 0.7rem;
		}
	}
	/* on a phone the toolbar keeps to two rows: short labels, an icon-only replay */
	@container figure (max-width: 30rem) {
		.long {
			display: none;
		}
		/* the 12 × 12 table: cells are about 25px, room for 10.5px numbers */
		.grid .h,
		.grid .c {
			font-size: 0.66rem;
		}
		.grid {
			gap: 1.5px;
		}
	}
	.num {
		font-family: var(--font-ui);
		font-size: 13px;
		fill: var(--ink-dim) !important;
	}
	.num.hi {
		fill: var(--ink-bright) !important;
		font-weight: 700;
	}
	.readout {
		text-align: center;
		font-size: 0.86rem;
		color: var(--ink);
		line-height: 1.7;
		margin-top: 0.3rem;
	}
	.big {
		font-size: 1.12rem;
		color: var(--gold-bright);
		white-space: nowrap;
	}
	.dim {
		color: var(--ink-faint);
	}
	.inv {
		color: var(--ink-dim);
		font-size: 0.8rem;
		text-wrap: balance;
	}
	.tablebox {
		min-width: 0;
	}
	.cap {
		font-size: 0.74rem;
		color: var(--ink-faint);
		text-align: center;
		margin-bottom: 0.45rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(var(--n), minmax(0, 1fr));
		gap: 2px;
		/* small clocks get a compact table rather than a few huge cells */
		max-width: min(25rem, calc(var(--n) * 2.5rem));
		margin: 0 auto;
	}
	.h,
	.c {
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		font-family: var(--font-ui);
		font-size: clamp(0.55rem, 1.6cqi, 0.78rem);
		font-variant-numeric: tabular-nums;
		border-radius: 4px;
		min-width: 0;
	}
	.h {
		color: var(--ink-faint);
	}
	.h.on {
		color: var(--gold-bright);
		font-weight: 700;
	}
	.c {
		border: 0;
		padding: 0;
		cursor: pointer;
		color: #0b1020;
		font-weight: 600;
		background: color-mix(in oklch, var(--c) 78%, #0b1020);
		opacity: 0.82;
		transition:
			opacity 0.15s,
			box-shadow 0.15s;
	}
	.c.line {
		opacity: 1;
	}
	.c:hover {
		opacity: 1;
		box-shadow: 0 0 0 1.5px rgba(255, 255, 255, 0.6);
	}
	.c.sel {
		opacity: 1;
		box-shadow:
			0 0 0 2px #fff8e6,
			0 0 12px var(--c);
		z-index: 1;
	}
	.plus {
		color: var(--ink-faint);
	}
</style>
