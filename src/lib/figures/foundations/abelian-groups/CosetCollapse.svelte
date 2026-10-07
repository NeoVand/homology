<script lang="ts">
	// The integers, coloured by their coset of nℤ: sort them into rows (each a
	// shifted copy of nℤ), then collapse every row into a single dot. The n dots
	// that remain ARE the group ℤ/nℤ. Pick representatives to see that adding
	// cosets does not depend on which representatives you pick.
	import { Tween, prefersReducedMotion } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import { residueColor, mod, fmtInt } from '../groups/zn';

	let n = $state(3);
	let stage = $state<0 | 1 | 2>(0);
	let cw = $state(700);
	let a = $state<number | null>(null);
	let b = $state<number | null>(null);

	const s = new Tween(0, { duration: 900, easing: cubicInOut });
	$effect(() => {
		s.set(stage, { duration: prefersReducedMotion.current ? 0 : 900 });
	});

	const narrow = $derived(cw < 560);
	const W = $derived(narrow ? 340 : 680);
	const K = $derived(narrow ? 5 : 9);
	const H = 300;
	const xL = $derived(narrow ? 72 : 104);
	const xR = $derived(W - 18);
	const step = $derived((xR - xL) / (2 * K));
	const ints = $derived(Array.from({ length: 2 * K + 1 }, (_, i) => i - K));

	const xOf = (k: number) => xL + (k + K) * step;
	const rowY = (r: number) => H / 2 + (r - (n - 1) / 2) * Math.min(48, 200 / Math.max(1, n - 1));
	const ringR = $derived(narrow ? 74 : 92);
	const tokenPos = (r: number): [number, number] => {
		const ang = -Math.PI / 2 + (2 * Math.PI * r) / n;
		return [W / 2 + ringR * Math.cos(ang), H / 2 + ringR * Math.sin(ang)];
	};
	const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
	function pos(k: number, sv: number): [number, number] {
		const r = mod(k, n);
		const p0: [number, number] = [xOf(k), H / 2];
		const p1: [number, number] = [xOf(k), rowY(r)];
		const p2 = tokenPos(r);
		if (sv <= 1) {
			const t = ease(Math.max(0, sv));
			return [p0[0] + (p1[0] - p0[0]) * t, p0[1] + (p1[1] - p0[1]) * t];
		}
		const t = ease(Math.min(1, sv - 1));
		return [p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t];
	}

	const sv = $derived(s.current);
	const labelOpacity = $derived(Math.max(0, 1 - Math.max(0, sv - 1) * 2.2));
	const rowLabelOpacity = $derived(Math.max(0, Math.min(1, sv) - Math.max(0, sv - 1) * 2.5));
	const tokenOpacity = $derived(Math.max(0, (sv - 1.55) / 0.45));

	// keep selections meaningful when n or the range changes
	$effect(() => {
		void n;
		void K;
		a = null;
		b = null;
	});

	function pick(k: number) {
		if (a === null || b !== null) {
			a = k;
			b = null;
		} else b = k;
	}
	function pickPile(r: number) {
		// in the collapsed view: choose a random representative of the pile
		const reps = ints.filter((k) => mod(k, n) === r);
		pick(reps[Math.floor(Math.random() * reps.length)]);
	}
	function reroll() {
		if (a === null) return;
		const ra = mod(a, n);
		const repsA = ints.filter((k) => mod(k, n) === ra && k !== a);
		a = repsA[Math.floor(Math.random() * repsA.length)] ?? a;
		if (b !== null) {
			const rb = mod(b, n);
			const repsB = ints.filter((k) => mod(k, n) === rb && k !== b);
			b = repsB[Math.floor(Math.random() * repsB.length)] ?? b;
		}
	}

	const sum = $derived(a !== null && b !== null ? a + b : null);
	const cosetTeX = (r: number) => (r === 0 ? `${n}\\mathbb{Z}` : `${r} + ${n}\\mathbb{Z}`);
</script>

<div class="cc" bind:clientWidth={cw}>
	<Svg viewBox="0 0 {W} {H}" maxHeight={360} label="The integers coloured by coset of nZ, sorted into rows and collapsed into the n elements of Z/nZ">
		<defs>
			<radialGradient id="cc-glow" cx="50%" cy="50%" r="50%">
				<stop offset="0" stop-color="#2b2f6e" stop-opacity="0.5" />
				<stop offset="1" stop-color="#0a0f1e" stop-opacity="0" />
			</radialGradient>
		</defs>
		<ellipse cx={W / 2} cy={H / 2} rx={W / 2} ry={H / 2} fill="url(#cc-glow)" opacity={0.4 + 0.6 * tokenOpacity} />

		<!-- the number line (stage 0) -->
		<g opacity={Math.max(0, 1 - sv * 1.6)}>
			<line x1={xL - step / 2} y1={H / 2} x2={xR + step / 2} y2={H / 2} stroke="rgba(235,229,213,0.25)" stroke-width="1.2" />
			<text x={xL - step / 2 - 6} y={H / 2 + 4} text-anchor="end" class="ell">⋯</text>
			<text x={xR + step / 2 + 6} y={H / 2 + 4} text-anchor="start" class="ell">⋯</text>
		</g>

		<!-- row guides and labels (stage 1) -->
		{#each Array.from({ length: n }, (_, r) => r) as r (r)}
			<g opacity={rowLabelOpacity}>
				<line x1={xL - step / 2} y1={rowY(r)} x2={xR + step / 2} y2={rowY(r)} stroke={residueColor(r, n)} stroke-opacity="0.18" stroke-width="1" />
				<SvgTeX x={xL - 12} y={rowY(r)} tex={cosetTeX(r)} size={narrow ? 12.5 : 14} color={residueColor(r, n, 86)} w={110} h={24} anchor="end" />
			</g>
		{/each}

		<!-- the collapsed group (stage 2) -->
		<g opacity={tokenOpacity}>
			{#each Array.from({ length: n }, (_, r) => r) as r (r)}
				{@const a0 = -Math.PI / 2 + (2 * Math.PI * r) / n + 0.3}
				{@const a1 = -Math.PI / 2 + (2 * Math.PI * (r + 1)) / n - 0.3}
				<path
					d="M {W / 2 + ringR * Math.cos(a0)} {H / 2 + ringR * Math.sin(a0)} A {ringR} {ringR} 0 {a1 - a0 > Math.PI ? 1 : 0} 1 {W / 2 + ringR * Math.cos(a1)} {H / 2 + ringR * Math.sin(a1)}"
					fill="none"
					stroke="rgba(235,229,213,0.35)"
					stroke-width="1.3"
					marker-end="url(#arrow-ivory)"
				/>
			{/each}
			{#each Array.from({ length: n }, (_, r) => r) as r (r)}
				{@const p = tokenPos(r)}
				{@const dx = p[0] - W / 2}
				{@const dy = p[1] - H / 2}
				{@const L = Math.hypot(dx, dy) || 1}
				<circle cx={p[0]} cy={p[1]} r="22" fill={residueColor(r, n)} fill-opacity="0.16" />
				<SvgTeX
					x={p[0] + (dx / L) * (narrow ? 44 : 58)}
					y={p[1] + (dy / L) * (narrow ? 36 : 40)}
					tex={cosetTeX(r)}
					size={narrow ? 13 : 15}
					color={residueColor(r, n, 88)}
					w={120}
					h={26}
				/>
			{/each}
			<SvgTeX x={W / 2} y={H / 2} tex={`\\mathbb{Z}/${n}\\mathbb{Z}`} size={narrow ? 15 : 18} color="var(--ink-bright)" w={100} h={30} />
		</g>

		<!-- the integers -->
		{#each ints as k (k)}
			{@const [x, y] = pos(k, sv)}
			{@const r = mod(k, n)}
			{@const sel = k === a || k === b}
			{@const isSum = sum !== null && k === sum}
			<g
				class="dot"
				role="button"
				tabindex="0"
				aria-label="integer {k}, in the coset {r} + {n}Z"
				onclick={() => (sv > 1.5 ? pickPile(r) : pick(k))}
				onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (sv > 1.5 ? pickPile(r) : pick(k))}
			>
				<circle cx={x} cy={y} r={Math.max(12, step / 2)} fill="transparent" />
				{#if sel || isSum}
					<circle cx={x} cy={y} r={sv > 1.5 ? 17 : 11} fill="none" stroke={isSum ? '#fff8e6' : '#fbf6e8'} stroke-width="1.8" stroke-dasharray={isSum ? '3 3' : 'none'} />
				{/if}
				<circle cx={x} cy={y} r={sv > 1.5 ? 12 : narrow ? 6 : 7} fill={residueColor(r, n)} stroke="#0b1020" stroke-width="1" filter={sv > 1.5 ? 'url(#glow)' : undefined} />
				<text x={x} y={y + (narrow ? 22 : 24)} text-anchor="middle" class="num" opacity={labelOpacity}>{fmtInt(k)}</text>
				{#if sel && sv <= 1.5}
					<text x={x} y={y - 14} text-anchor="middle" class="tag">{k === a && k === b ? 'a=b' : k === a ? 'a' : 'b'}</text>
				{/if}
				{#if isSum && sv <= 1.5 && !sel}
					<text x={x} y={y - 14} text-anchor="middle" class="tag">a+b</text>
				{/if}
			</g>
		{/each}
	</Svg>

	<div class="read ui" aria-live="polite">
		{#if a === null}
			<span class="dim">
				{#if stage === 2}Tap two of the dots of \(\Z/n\Z\) to add them.{:else}Tap an integer to choose \(a\), then another to choose \(b\).{/if}
			</span>
		{:else if b === null}
			<TeX tex={`a = ${a} \\in ${cosetTeX(mod(a, n))}`} />. Now choose <TeX tex="b" />.
		{:else if sum !== null}
			{#if stage === 2}
				<span class="sumline"
					><TeX tex={`(${cosetTeX(mod(a, n))}) + (${cosetTeX(mod(b, n))}) = ${cosetTeX(mod(sum, n))}`} /></span
				>
				<span class="dim">computed with the representatives <TeX tex={`${a}`} /> and <TeX tex={`${b}`} />: <TeX tex={`${a} + ${b < 0 ? `(${b})` : b} = ${sum}`} /></span>
			{:else}
				<span class="sumline"><TeX tex={`a + b = ${a} + ${b < 0 ? `(${b})` : b} = ${sum} \\in ${cosetTeX(mod(sum, n))}`} /></span>
				<span class="dim">Pick other representatives of the same two rows: the answer’s row never changes.</span>
			{/if}
		{/if}
	</div>
</div>
<Controls>
	<Segmented
		bind:value={stage}
		options={[
			{ value: 0, label: '1 · Number line' },
			{ value: 1, label: '2 · Sort into cosets' },
			{ value: 2, label: '3 · Collapse' }
		]}
		label="Stage"
	/>
	<Stepper bind:value={n} min={2} max={5} label="n" />
	<button class="again ui" onclick={reroll} disabled={a === null}>Other representatives</button>
</Controls>

<style>
	.cc {
		padding: 0.6rem 0.8rem 0.2rem;
	}
	.num {
		font-family: var(--font-ui);
		font-size: 12px !important;
		fill: var(--ink-faint) !important;
		pointer-events: none;
	}
	.tag {
		font-family: var(--font-ui);
		font-size: 11px !important;
		font-weight: 700;
		fill: var(--ink-bright) !important;
		pointer-events: none;
	}
	.ell {
		font-size: 16px !important;
		fill: var(--ink-faint) !important;
	}
	.dot {
		cursor: pointer;
		outline: none;
	}
	.read {
		min-height: 3.4rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.2rem;
		text-align: center;
		font-size: 0.86rem;
		color: var(--ink);
		padding: 0 0.5rem 0.6rem;
	}
	.sumline {
		font-size: 1.02rem;
		color: var(--gold-bright);
	}
	.dim {
		color: var(--ink-faint);
		font-size: 0.8rem;
	}
	.again {
		background: none;
		border: 1px solid var(--line);
		color: var(--gold-bright);
		border-radius: 9px;
		padding: 0.4rem 0.8rem;
		font-size: 0.76rem;
		cursor: pointer;
		min-height: 2rem;
	}
	.again:disabled {
		opacity: 0.35;
		cursor: default;
	}
	/* phones: the drawing is at about 100%, but its numbers are small; one size up */
	@container figure (max-width: 34rem) {
		.num {
			font-size: 13.5px !important;
		}
	}
</style>
