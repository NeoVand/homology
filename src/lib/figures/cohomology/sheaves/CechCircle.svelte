<script lang="ts">
	// Figure: Čech cohomology of the circle. Three arcs (a good cover) or two
	// arcs (whose overlap falls into two pieces). The reader sets the numbers
	// on the overlaps; the figure tries to absorb them as differences of numbers
	// on the arcs and reports the class that survives.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { absorb2, absorb3 } from './cech';

	type Mode = 'three' | 'two';
	let mode = $state<Mode>('three');

	// three arcs: corrections on U01, U12, U02 (the 1-cochain c)
	let c01 = $state(2);
	let c12 = $state(1);
	let c02 = $state(3);
	// two arcs: corrections on the two pieces W1, W2 of U ∩ V
	let w1 = $state(2);
	let w2 = $state(3);

	const three = $derived(absorb3(c01, c12, c02));
	const two = $derived(absorb2(w1, w2));
	const hol = $derived(mode === 'three' ? three.holonomy : two.holonomy);

	const CX = 175;
	const CY = 182;
	const R = 104;
	const deg = Math.PI / 180;
	// math angle (counterclockwise, y up) → screen point
	const P = (t: number, r = R) => [CX + r * Math.cos(t), CY - r * Math.sin(t)] as const;
	function arc(a: number, b: number, r: number) {
		// counterclockwise from a to b (b > a)
		const [x0, y0] = P(a, r);
		const [x1, y1] = P(b, r);
		const large = b - a > Math.PI ? 1 : 0;
		return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 0 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
	}

	const threeArcs = [
		{ name: 'U_0', c: 'var(--violet)', a: 10 * deg, b: 170 * deg, r: R + 20 },
		{ name: 'U_1', c: 'var(--blue)', a: 130 * deg, b: 290 * deg, r: R + 36 },
		{ name: 'U_2', c: 'var(--teal)', a: 250 * deg, b: 410 * deg, r: R + 52 }
	];
	const threeOverlaps = [
		{ key: '01', a: 130 * deg, b: 170 * deg },
		{ key: '12', a: 250 * deg, b: 290 * deg },
		{ key: '02', a: 10 * deg, b: 50 * deg }
	];
	const twoArcs = [
		{ name: 'U', c: 'var(--violet)', a: -35 * deg, b: 215 * deg, r: R + 22 },
		{ name: 'V', c: 'var(--teal)', a: 145 * deg, b: 395 * deg, r: R + 40 }
	];
	const twoOverlaps = [
		{ key: 'W_1', a: -35 * deg, b: 35 * deg },
		{ key: 'W_2', a: 145 * deg, b: 215 * deg }
	];

	const cval = (k: string) => (k === '01' ? c01 : k === '12' ? c12 : c02);
	const sgn = (v: number) => (v < 0 ? `-${Math.abs(v)}` : `${v}`);

	function makeConsistent() {
		if (mode === 'three') c12 = c02 - c01;
		else w2 = w1;
	}
	function staircase() {
		if (mode === 'three') {
			c01 = 1;
			c12 = 1;
			c02 = -1;
		} else {
			w1 = 0;
			w2 = 1;
		}
	}

	// the nerve panel
	const NV = {
		U0: [478, 70] as const,
		U1: [404, 262] as const,
		U2: [552, 262] as const
	};
</script>

{#snippet stepper(label: string, value: number, set: (v: number) => void)}
	<div class="step">
		<span class="lbl"><TeX tex={label} /></span>
		<button aria-label="decrease {label}" onclick={() => set(Math.max(-9, value - 1))}>−</button>
		<span class="val nums">{value < 0 ? '−' + Math.abs(value) : value}</span>
		<button aria-label="increase {label}" onclick={() => set(Math.min(9, value + 1))}>+</button>
	</div>
{/snippet}

<div class="wrap">
	<Svg
		viewBox="0 0 640 360"
		maxHeight={420}
		label="A circle covered by open arcs, with numbers on the overlaps, and beside it the nerve of the cover."
	>
		<!-- the loop itself: glows rose when a nontrivial class survives, green when the data glue -->
		<circle
			cx={CX}
			cy={CY}
			r={R}
			fill="none"
			stroke={hol === 0 ? 'var(--green)' : 'var(--rose)'}
			stroke-width="3"
			opacity="0.9"
			filter="url(#glow)"
			class="loop"
		/>
		{#if mode === 'three'}
			{#each threeArcs as A (A.name)}
				<path d={arc(A.a, A.b, A.r)} stroke={A.c} stroke-width="9" fill="none" stroke-linecap="round" opacity="0.85" />
				<SvgTeX
					x={P((A.a + A.b) / 2, A.r + 22)[0]}
					y={P((A.a + A.b) / 2, A.r + 22)[1]}
					tex={A.name}
					size={19}
					color={A.c}
					w={50}
				/>
			{/each}
			{#each threeOverlaps as O (O.key)}
				{@const bad = O.key === '12' && hol !== 0}
				{@const col = bad ? 'var(--rose)' : 'var(--gold-bright)'}
				<path d={arc(O.a, O.b, R)} stroke={col} stroke-width="9" fill="none" stroke-linecap="round" />
				{@const m = (O.a + O.b) / 2}
				{@const q = P(m, R - 36)}
				<g class="pill" class:bad>
					<rect x={q[0] - 40} y={q[1] - 15} width="80" height="30" rx="15" />
					<SvgTeX x={q[0]} y={q[1]} tex={`c_{${O.key}} = ${sgn(cval(O.key))}`} size={16} color={col} w={78} />
				</g>
			{/each}
			<SvgTeX x={CX} y={CY} tex={'S^1'} size={20} color="var(--ink-dim)" w={50} />
		{:else}
			{#each twoArcs as A (A.name)}
				<path d={arc(A.a, A.b, A.r)} stroke={A.c} stroke-width="9" fill="none" stroke-linecap="round" opacity="0.85" />
			{/each}
			<SvgTeX x={P(90 * deg, R + 44)[0]} y={P(90 * deg, R + 44)[1]} tex="U" size={19} color="var(--violet)" w={40} />
			<SvgTeX x={P(270 * deg, R + 62)[0]} y={P(270 * deg, R + 62)[1]} tex="V" size={19} color="var(--teal)" w={40} />
			{#each twoOverlaps as O, k (O.key)}
				<path d={arc(O.a, O.b, R)} stroke="var(--gold-bright)" stroke-width="9" fill="none" stroke-linecap="round" />
				{@const m = (O.a + O.b) / 2}
				{@const q = P(m, R - 38)}
				<g class="pill">
					<rect x={q[0] - 26} y={q[1] - 15} width="52" height="30" rx="15" />
					<SvgTeX x={q[0]} y={q[1]} tex={sgn(k === 0 ? w1 : w2)} size={18} color="var(--gold-bright)" w={48} />
				</g>
				<SvgTeX x={P(m, R + 64)[0]} y={P(m, R + 64)[1]} tex={O.key} size={17} color="var(--gold-bright)" w={44} />
			{/each}
			<SvgTeX x={CX} y={CY} tex={'S^1'} size={20} color="var(--ink-dim)" w={50} />
		{/if}

		<!-- right: the nerve -->
		<line x1="352" y1="24" x2="352" y2="336" stroke="rgba(216,178,110,0.18)" />
		{#if mode === 'three'}
			<text x="478" y="30" text-anchor="middle" class="t-ui">THE NERVE</text>
			{@const e = [
				{ a: NV.U0, b: NV.U1, v: c01, k: 'c_{01}', lx: -62, ly: 0, bad: false },
				{ a: NV.U1, b: NV.U2, v: c12, k: 'c_{12}', lx: 0, ly: 30, bad: hol !== 0 },
				{ a: NV.U0, b: NV.U2, v: c02, k: 'c_{02}', lx: 62, ly: 0, bad: false }
			]}
			{#each e as E (E.k)}
				{@const col = E.bad ? 'var(--rose)' : 'var(--gold-bright)'}
				<line
					x1={E.a[0]}
					y1={E.a[1]}
					x2={E.a[0] + (E.b[0] - E.a[0]) * 0.88}
					y2={E.a[1] + (E.b[1] - E.a[1]) * 0.88}
					stroke={col}
					stroke-width="2.6"
					marker-end={E.bad ? 'url(#arrow-rose)' : 'url(#arrow-gold)'}
				/>
				<SvgTeX
					x={(E.a[0] + E.b[0]) / 2 + E.lx}
					y={(E.a[1] + E.b[1]) / 2 + E.ly}
					tex={`${E.k} = ${sgn(E.v)}`}
					size={16}
					color={col}
					w={110}
				/>
			{/each}
			{#each [['f_0', NV.U0, 'var(--violet)', three.f[0], 0, -24], ['f_1', NV.U1, 'var(--blue)', three.f[1], -8, 30], ['f_2', NV.U2, 'var(--teal)', three.f[2], 8, 30]] as [n, p, c, fv, dx, dy] (n)}
				{@const pt = p as readonly [number, number]}
				<circle cx={pt[0]} cy={pt[1]} r="9" fill={c as string} stroke="#fff6dc" stroke-width="1" />
				<SvgTeX x={pt[0] + (dx as number)} y={pt[1] + (dy as number)} tex={`${n} = ${sgn(fv as number)}`} size={15} color={c as string} w={90} />
			{/each}
			{#if hol !== 0}
				<SvgTeX x={478} y={322} tex={`\\text{but } f_2 - f_1 = ${sgn(three.f[2] - three.f[1])}`} size={15} color="var(--rose)" w={220} />
			{:else}
				<text x="478" y="326" text-anchor="middle" class="t-ui">A HOLLOW TRIANGLE ≃ A CIRCLE</text>
			{/if}
		{:else}
			<text x="440" y="30" text-anchor="middle" class="t-ui">HONEST ČECH DATA</text>
			<circle cx="440" cy="92" r="9" fill="var(--violet)" stroke="#fff6dc" stroke-width="1" />
			<circle cx="440" cy="268" r="9" fill="var(--teal)" stroke="#fff6dc" stroke-width="1" />
			<path d="M 446 100 C 500 140, 500 220, 446 260" stroke="var(--gold-bright)" stroke-width="2.6" fill="none" />
			<path d="M 434 100 C 380 140, 380 220, 434 260" stroke="var(--gold-bright)" stroke-width="2.6" fill="none" />
			<SvgTeX x={440} y={70} tex="U" size={17} color="var(--violet)" w={30} />
			<SvgTeX x={440} y={292} tex="V" size={17} color="var(--teal)" w={30} />
			<SvgTeX x={512} y={180} tex={`W_1{:}\\,${sgn(w1)}`} size={15} color="var(--gold-bright)" w={80} />
			<SvgTeX x={368} y={180} tex={`W_2{:}\\,${sgn(w2)}`} size={15} color="var(--gold-bright)" w={80} />
			<text x="440" y="326" text-anchor="middle" class="t-ui">ONE NUMBER PER PIECE</text>
			<!-- the naive nerve -->
			<g opacity="0.75">
				<text x="584" y="30" text-anchor="middle" class="t-ui">NERVE</text>
				<line x1="584" y1="110" x2="584" y2="250" stroke="var(--ink-faint)" stroke-width="2.4" stroke-dasharray="5 5" />
				<circle cx="584" cy="110" r="7" fill="var(--violet)" />
				<circle cx="584" cy="250" r="7" fill="var(--teal)" />
				<path d="M 568 166 L 600 198 M 600 166 L 568 198" stroke="var(--rose)" stroke-width="3" stroke-linecap="round" />
				<text x="584" y="326" text-anchor="middle" class="t-ui">ONE EDGE ≄ CIRCLE</text>
			</g>
		{/if}
	</Svg>

	<div class="readout ui" aria-live="polite">
		{#if mode === 'three'}
			<div class="formula">
				<span class="k">Loop test</span>
				<TeX tex={`c_{01} + c_{12} - c_{02} = ${sgn(c01)} + ${c12 < 0 ? `(${sgn(c12)})` : c12} - ${c02 < 0 ? `(${sgn(c02)})` : c02} = ${sgn(three.holonomy)}`} />
			</div>
		{:else}
			<div class="formula">
				<span class="k">Class</span>
				<TeX tex={`c_{W_2} - c_{W_1} = ${sgn(w2)} - ${w1 < 0 ? `(${sgn(w1)})` : w1} = ${sgn(two.holonomy)}`} />
			</div>
		{/if}
		<div class="verdict" class:ok={hol === 0}>
			{#if hol === 0}
				Consistent: the numbers on the overlaps are differences of numbers on the arcs (a coboundary), so local
				readings glue to one global reading.
			{:else}
				No choice of numbers on the arcs absorbs these corrections: going once around, they add up to {hol < 0
					? '−' + Math.abs(hol)
					: hol}. This number is the class that survives in Ȟ¹.
			{/if}
		</div>
	</div>

	<Controls>
		<Segmented
			bind:value={mode}
			options={[
				{ value: 'three', label: 'Three arcs' },
				{ value: 'two', label: 'Two arcs' }
			]}
			label="Cover"
		/>
		{#if mode === 'three'}
			{@render stepper('c_{01}', c01, (v) => (c01 = v))}
			{@render stepper('c_{12}', c12, (v) => (c12 = v))}
			{@render stepper('c_{02}', c02, (v) => (c02 = v))}
		{:else}
			{@render stepper('c_{W_1}', w1, (v) => (w1 = v))}
			{@render stepper('c_{W_2}', w2, (v) => (w2 = v))}
		{/if}
		<Button onclick={makeConsistent}>Make it glue</Button>
		<Button onclick={staircase}>Staircase</Button>
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.5rem;
	}
	.loop {
		transition: stroke 0.4s var(--ease);
	}
	.pill rect {
		fill: rgba(10, 14, 28, 0.88);
		stroke: rgba(242, 208, 143, 0.55);
		stroke-width: 1.2;
	}
	.pill.bad rect {
		stroke: rgba(242, 141, 182, 0.75);
	}
	.readout {
		padding: 0.4rem 1.2rem 0.8rem;
		font-size: 0.84rem;
		display: grid;
		gap: 0.35rem;
	}
	.formula {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.3rem 0.9rem;
		color: var(--ink-bright);
	}
	.k {
		color: var(--ink-dim);
		letter-spacing: 0.03em;
	}
	.verdict {
		color: var(--rose);
		line-height: 1.5;
	}
	.verdict.ok {
		color: var(--green);
	}
	.step {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.85rem;
	}
	.step .lbl {
		color: var(--gold-bright);
		min-width: 2.4rem;
	}
	.step button {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 1px solid var(--line);
		background: rgba(216, 178, 110, 0.06);
		color: var(--gold-bright);
		cursor: pointer;
		font-size: 1rem;
		line-height: 1;
	}
	.step button:hover {
		background: rgba(216, 178, 110, 0.16);
		border-color: var(--gold);
	}
	.step .val {
		min-width: 1.8rem;
		text-align: center;
		color: var(--ink-bright);
		font-weight: 600;
	}
</style>
