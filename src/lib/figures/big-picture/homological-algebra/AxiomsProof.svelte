<script lang="ts">
	// Figure: the Eilenberg–Steenrod axioms as five cards, and a step-through
	// computation of the homology of spheres that uses nothing but the axioms.
	// The cards used in each step light up.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';

	type Ax = 'homotopy' | 'exactness' | 'excision' | 'dimension' | 'additivity';
	const axioms: { id: Ax; name: string; tex: string; text: string }[] = [
		{ id: 'homotopy', name: 'Homotopy', tex: 'f\\simeq g \\Rightarrow f_* = g_*', text: 'Homotopic maps induce the same homomorphism.' },
		{ id: 'exactness', name: 'Exactness', tex: '\\cdots\\to H_n(A)\\to H_n(X)\\to H_n(X,A)\\xrightarrow{\\partial}\\cdots', text: 'Every pair gives a long exact sequence, with natural ∂.' },
		{ id: 'excision', name: 'Excision', tex: 'H_n(X\\setminus U, A\\setminus U)\\cong H_n(X,A)', text: 'Cutting out a set deep inside A changes nothing.' },
		{ id: 'dimension', name: 'Dimension', tex: 'H_n(\\mathrm{pt}) = 0 \\text{ for } n\\neq 0', text: 'A point has homology only in degree 0, where it is G.' },
		{ id: 'additivity', name: 'Additivity', tex: 'H_n(\\textstyle\\bigsqcup X_\\alpha)\\cong\\bigoplus H_n(X_\\alpha)', text: 'A disjoint union has the direct sum of homologies.' }
	];

	let step = $state(0);
	const steps: { label: string; uses: Ax[]; tex: string; text: string }[] = [
		{ label: 'The question', uses: [], tex: '\\tilde H_k(S^n) = \\;?', text: 'We want the homology of every sphere, using only the five axioms — no chains, no simplices, no matrices.' },
		{ label: 'Disks are trivial', uses: ['homotopy', 'dimension'], tex: 'D^n\\simeq\\mathrm{pt}\\;\\Longrightarrow\\;\\tilde H_k(D^n)\\cong\\tilde H_k(\\mathrm{pt}) = 0 \\text{ for all } k', text: 'A disk shrinks to its centre, so by the homotopy axiom it has the homology of a point, which the dimension axiom pins down.' },
		{ label: 'The pair (Dⁿ, Sⁿ⁻¹)', uses: ['exactness'], tex: '\\underbrace{\\tilde H_k(D^n)}_{0}\\to H_k(D^n,S^{n-1})\\xrightarrow{\\;\\partial\\;}\\tilde H_{k-1}(S^{n-1})\\to\\underbrace{\\tilde H_{k-1}(D^n)}_{0}', text: 'In the long exact sequence of the disk and its rim, the outer terms vanish, so the connecting map ∂ in the middle is an isomorphism.' },
		{ label: 'Collapse the rim', uses: ['excision', 'homotopy'], tex: 'H_k(D^n, S^{n-1})\\;\\cong\\;\\tilde H_k(D^n/S^{n-1})\\;=\\;\\tilde H_k(S^n)', text: 'Excision (with a little homotopy) says relative homology only sees the quotient. Pulling the rim of a disk together into one point gives a sphere — a drawstring bag.' },
		{ label: 'One dimension down', uses: ['exactness', 'excision'], tex: '\\tilde H_k(S^n)\\;\\cong\\;\\tilde H_{k-1}(S^{n-1})\\;\\cong\\;\\cdots\\;\\cong\\;\\tilde H_{k-n}(S^0)', text: 'Chaining the last two steps drops both the degree and the dimension by one. Repeat until you reach the 0-sphere.' },
		{ label: 'The bottom step: S⁰', uses: ['additivity', 'dimension'], tex: 'H_0(S^0) = H_0(\\mathrm{pt})\\oplus H_0(\\mathrm{pt}) = G\\oplus G,\\qquad \\tilde H_0(S^0)\\cong G', text: 'The 0-sphere is two points. Additivity splits it; dimension says each point contributes G in degree 0 and nothing else.' },
		{ label: 'Conclusion', uses: ['homotopy', 'exactness', 'excision', 'dimension', 'additivity'], tex: '\\tilde H_k(S^n)\\cong\\begin{cases} G & k = n\\\\ 0 & k\\neq n\\end{cases}', text: 'Any theory satisfying the axioms gives spheres exactly the homology we computed by hand in Part III.' }
	];
	const uses = $derived(new Set(steps[step].uses));

	// On a narrow plate the illustration is scaled down; scale its labels up (ks ≥ 1) so they stay readable.
	let width = $state(640);
	const ks = $derived(Math.min(1.6, Math.max(1, (0.85 * 640) / (width || 640))));
</script>

<div class="es" bind:clientWidth={width}>
	<div class="cards">
		{#each axioms as a, i (a.id)}
			<div class="card" class:on={uses.has(a.id)}>
				<div class="num ui">{i + 1}</div>
				<div class="name ui">{a.name}</div>
				<div class="ctex"><TeX tex={a.tex} /></div>
				<div class="ctext ui">{a.text}</div>
			</div>
		{/each}
	</div>

	<Svg viewBox="0 0 640 {210 + 16 * (ks - 1)}" maxHeight={240 + 30 * (ks - 1)} label="An illustration of the current step of the computation">
		<defs>
			<radialGradient id="ax-ball" cx="38%" cy="32%" r="70%">
				<stop offset="0" stop-color="#8f7cf7" stop-opacity="0.55" />
				<stop offset="0.7" stop-color="#3b3f8f" stop-opacity="0.35" />
				<stop offset="1" stop-color="#121a2f" stop-opacity="0.2" />
			</radialGradient>
			<radialGradient id="ax-disk" cx="50%" cy="50%" r="60%">
				<stop offset="0" stop-color="#5fd6cf" stop-opacity="0.28" />
				<stop offset="1" stop-color="#5fd6cf" stop-opacity="0.06" />
			</radialGradient>
		</defs>
		{#if step === 0}
			<circle cx="320" cy="105" r="70" fill="url(#ax-ball)" class="ball" />
			<ellipse cx="320" cy="105" rx="70" ry="18" class="equator" />
			<SvgTeX x={320} y={105} tex="?" size={34 * ks} color="var(--gold-bright)" w={40 * ks} h={40 * ks} />
			<SvgTeX x={430} y={60} tex="S^n" size={20 * ks} w={50 * ks} h={30 * ks} />
		{:else if step === 1}
			{#each [70, 52, 34, 16] as r, k (r)}
				<circle cx="220" cy="105" r={r} class="shrink" style="opacity:{0.3 + k * 0.18}" />
			{/each}
			<circle cx="220" cy="105" r="70" fill="url(#ax-disk)" class="disk" />
			{#each Array.from({ length: 8 }, (_, k) => (k / 8) * Math.PI * 2) as a (a)}
				<line x1={220 + 64 * Math.cos(a)} y1={105 + 64 * Math.sin(a)} x2={220 + 24 * Math.cos(a)} y2={105 + 24 * Math.sin(a)} class="inward" marker-end="url(#arrow-teal)" />
			{/each}
			<path d="M 320 105 L 390 105" class="ar" marker-end="url(#arrow-ivory)" />
			<SvgTeX x={355} y={88} tex={'\\simeq'} size={18 * ks} w={30 * ks} h={24 * ks} />
			<circle cx="440" cy="105" r="7" class="pt" />
			<SvgTeX x={440} y={140} tex={'\\mathrm{pt}'} size={16 * ks} w={40 * ks} h={24 * ks} />
			<SvgTeX x={220} y={190 + 6 * (ks - 1)} tex="D^n" size={16 * ks} w={40 * ks} h={24 * ks} />
		{:else if step === 2}
			<circle cx="320" cy="105" r="72" fill="url(#ax-disk)" class="disk" />
			<circle cx="320" cy="105" r="72" class="rim" />
			<SvgTeX x={320} y={105} tex="D^n" size={20 * ks} w={50 * ks} h={30 * ks} />
			<SvgTeX x={430} y={50} tex={'S^{n-1}'} size={18 * ks} color="var(--gold-bright)" w={60 * ks} h={26 * ks} />
		{:else if step === 3}
			<!-- disk → drawstring bag → sphere -->
			<circle cx="110" cy="110" r="58" fill="url(#ax-disk)" class="disk" />
			<circle cx="110" cy="110" r="58" class="rim" />
			<path d="M 190 110 L 240 110" class="ar" marker-end="url(#arrow-ivory)" />
			<path d="M 270 70 Q 262 150 320 160 Q 378 150 370 70 Q 345 92 320 64 Q 295 92 270 70 Z" fill="url(#ax-disk)" class="disk" />
			<path d="M 270 70 Q 295 92 320 64 Q 345 92 370 70" class="rim" />
			<path d="M 400 110 L 450 110" class="ar" marker-end="url(#arrow-ivory)" />
			<circle cx="530" cy="110" r="58" fill="url(#ax-ball)" class="ball" />
			<circle cx="530" cy="52" r="6" class="pt" />
			<SvgTeX x={110} y={192 + 6 * (ks - 1)} tex="D^n" size={15 * ks} w={40 * ks} h={22 * ks} />
			<SvgTeX x={320} y={192 + 6 * (ks - 1)} tex={'\\text{pull the rim together}'} size={13 * ks} color="var(--ink-dim)" w={200 * ks} h={22 * ks} />
			<SvgTeX x={530} y={192 + 6 * (ks - 1)} tex={'D^n/S^{n-1}\\cong S^n'} size={15 * ks} w={160 * ks} h={22 * ks} />
		{:else if step === 4 || step === 6}
			{#each [0, 1, 2, 3] as k (k)}
				{@const x = 110 + k * 140}
				{@const r = 48 - k * 9}
				{#if k < 3}
					<circle cx={x} cy="95" r={r} fill="url(#ax-ball)" class="ball" class:lit={step === 6 && k === 0} />
				{:else}
					<circle cx={x - 14} cy="95" r="7" class="pt" />
					<circle cx={x + 14} cy="95" r="7" class="pt" />
				{/if}
				<SvgTeX x={x} y={165 + 2 * (ks - 1)} tex={['S^n', 'S^{n-1}', 'S^{n-2}', 'S^0'][k]} size={15 * ks} w={60 * ks} h={22 * ks} />
				<SvgTeX x={x} y={192 + 6 * (ks - 1)} tex={['\\tilde H_k', '\\tilde H_{k-1}', '\\tilde H_{k-2}', '\\tilde H_{k-n}'][k]} size={13 * ks} color="var(--gold-bright)" w={70 * ks} h={22 * ks} />
				{#if k < 3}
					<path d="M {x + 58} 95 L {x + 82} 95" class="ar" marker-end="url(#arrow-gold)" />
					<SvgTeX x={x + 70} y={78 - 4 * (ks - 1)} tex={k < 2 ? '\\cong' : '\\cdots'} size={15 * ks} color="var(--gold-bright)" w={30 * ks} h={20 * ks} />
				{/if}
			{/each}
		{:else if step === 5}
			<circle cx="270" cy="105" r="9" class="pt" />
			<circle cx="370" cy="105" r="9" class="pt" />
			<SvgTeX x={270} y={145} tex="G" size={18 * ks} color="var(--gold-bright)" w={30 * ks} h={24 * ks} />
			<SvgTeX x={320} y={145} tex={'\\oplus'} size={18 * ks} w={30 * ks} h={24 * ks} />
			<SvgTeX x={370} y={145} tex="G" size={18 * ks} color="var(--gold-bright)" w={30 * ks} h={24 * ks} />
			<SvgTeX x={320} y={60} tex={'S^0 = \\{-1, +1\\}'} size={16 * ks} w={160 * ks} h={26 * ks} />
		{/if}
	</Svg>

	<div class="explain">
		<TeX tex={steps[step].tex} display />
		<p class="ui">{steps[step].text}</p>
	</div>
	<Controls>
		<StepControls bind:step count={steps.length} labels={steps.map((s) => s.label)} interval={3200} />
	</Controls>
</div>

<style>
	.es {
		padding-top: 0.9rem;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: 0.5rem;
		padding: 0 1rem 0.5rem;
	}
	@media (max-width: 820px) {
		.cards {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	.card {
		position: relative;
		border-radius: 12px;
		padding: 0.55rem 0.6rem 0.6rem;
		border: 1px solid var(--line-faint);
		background: rgba(18, 26, 47, 0.55);
		transition: all 0.35s var(--ease);
		opacity: 0.55;
	}
	.card.on {
		opacity: 1;
		border-color: var(--gold);
		background:
			radial-gradient(120% 120% at 0% 0%, rgba(242, 208, 143, 0.16), transparent 60%),
			rgba(18, 26, 47, 0.85);
		box-shadow: 0 0 24px -8px rgba(242, 208, 143, 0.55);
	}
	.num {
		position: absolute;
		top: 0.45rem;
		right: 0.6rem;
		font-size: 0.66rem;
		color: var(--gold-deep);
	}
	.name {
		font-size: 0.72rem;
		font-weight: 650;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--gold);
	}
	.ctex {
		font-size: 0.74rem;
		margin: 0.35rem 0;
		overflow-x: auto;
		overflow-y: hidden;
		color: var(--ink-bright);
	}
	.ctext {
		font-size: 0.7rem;
		line-height: 1.35;
		color: var(--ink-dim);
	}
	.ball {
		stroke: rgba(164, 147, 255, 0.6);
		stroke-width: 1.4;
	}
	.ball.lit {
		stroke: #f2d08f;
		stroke-width: 2.4;
		filter: url(#glow);
	}
	.equator {
		fill: none;
		stroke: rgba(164, 147, 255, 0.4);
		stroke-dasharray: 3 4;
	}
	.disk {
		stroke: rgba(95, 214, 207, 0.6);
		stroke-width: 1.4;
	}
	.rim {
		fill: none;
		stroke: #f2d08f;
		stroke-width: 3;
		filter: url(#glow);
	}
	.shrink {
		fill: none;
		stroke: rgba(95, 214, 207, 0.4);
		stroke-dasharray: 2 4;
	}
	.inward {
		stroke: #5fd6cf;
		stroke-width: 1.4;
	}
	.pt {
		fill: #f2d08f;
		filter: url(#glow);
	}
	.ar {
		stroke: #ebe5d5;
		stroke-width: 1.8;
		fill: none;
	}
	.explain {
		padding: 0 1.2rem 0.3rem;
		text-align: center;
		min-height: 6.4rem;
	}
	.explain p {
		margin: -0.3rem auto 0.4rem;
		font-size: 0.84rem;
		color: var(--ink-dim);
		max-width: 42rem;
	}
</style>
