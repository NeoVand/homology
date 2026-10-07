<script lang="ts">
	// Figure: no retraction of the disk onto its rim, by functoriality.
	// The commutative triangle S¹ → D² → S¹ (= identity) is sent by H₁ to
	// ℤ → 0 → ℤ (= identity), which cannot exist.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { animate, lerp, type Pt } from './diagram';

	let step = $state(0);
	const labels = ['The rim sits inside the disk', 'Suppose a retraction r exists', 'Then r ∘ i is the identity', 'Apply the functor H₁', 'Follow the generator 1', 'Contradiction: no retraction'];
	const texts: { tex: string; text: string }[] = [
		{ tex: 'i\\colon S^1 \\hookrightarrow D^2', text: 'The inclusion i puts the circle into the disk as its rim.' },
		{ tex: 'r\\colon D^2 \\to S^1,\\quad r(x) = x \\text{ for } x \\in S^1', text: 'A retraction would push every point of the disk onto the rim continuously, keeping rim points where they are.' },
		{ tex: 'r\\circ i = \\id_{S^1}', text: 'Going into the disk and then back out to the rim does nothing at all: the triangle commutes.' },
		{ tex: 'H_1(r)\\circ H_1(i) = H_1(r\\circ i) = H_1(\\id_{S^1}) = \\id_{\\Z}', text: 'A functor turns the commuting triangle of spaces into a commuting triangle of groups.' },
		{ tex: '1 \\;\\mapsto\\; i_*(1) = 0 \\;\\mapsto\\; r_*(0) = 0, \\qquad\\text{but}\\qquad \\id_{\\Z}(1) = 1', text: 'Any homomorphism through the zero group sends everything to 0 — but the identity sends 1 to 1.' },
		{ tex: '0 \\neq 1 \\;\\Longrightarrow\\; \\text{no retraction } D^2 \\to S^1', text: 'So r cannot exist. That is the heart of Brouwer’s fixed-point theorem.' }
	];

	const SL: Pt = [150, 190];
	const SD: Pt = [320, 82];
	const SR: Pt = [490, 190];
	const GL: Pt = [150, 430];
	const GD: Pt = [320, 322];
	const GR: Pt = [490, 430];

	// token animation for step 4
	let tok = $state(0); // 0 → 1 along i_*, 1 → 2 along r_*
	let cancel: (() => void) | null = null;
	$effect(() => {
		cancel?.();
		if (step === 4) {
			tok = 0;
			cancel = animate(2200, (t) => (tok = t * 2));
		} else tok = step > 4 ? 2 : 0;
	});
	const tokA = $derived(tok <= 1 ? lerp(GL, GD, tok) : lerp(GD, GR, tok - 1));
	const tokB = $derived(lerp(GL, GR, Math.min(1, tok / 2)));
	const tokAValue = $derived(tok < 0.97 ? '1' : '0');

	function seg(a: Pt, b: Pt, gap = 30): string {
		const dx = b[0] - a[0];
		const dy = b[1] - a[1];
		const L = Math.hypot(dx, dy);
		const ux = dx / L;
		const uy = dy / L;
		return `M ${a[0] + ux * gap} ${a[1] + uy * gap} L ${b[0] - ux * gap} ${b[1] - uy * gap}`;
	}
	// On a narrow plate the drawing is scaled down; scale the labels up (k ≥ 1) so they stay readable.
	let width = $state(640);
	const k = $derived(Math.min(1.7, Math.max(1, (0.9 * 640) / (width || 640))));

	const pushArrows = Array.from({ length: 8 }, (_, k) => {
		const a = (k / 8) * 2 * Math.PI + 0.2;
		return { x1: SD[0] + 12 * Math.cos(a), y1: SD[1] + 12 * Math.sin(a), x2: SD[0] + 34 * Math.cos(a), y2: SD[1] + 34 * Math.sin(a) };
	});
</script>

<div class="brouwer" bind:clientWidth={width}>
	<Svg viewBox="0 0 640 520" maxHeight={560} label="The triangle of spaces S¹ to D² to S¹, and its image under H₁: ℤ to 0 to ℤ">
		<defs>
			<radialGradient id="bt-disk" cx="45%" cy="40%" r="65%">
				<stop offset="0" stop-color="#5fd6cf" stop-opacity="0.32" />
				<stop offset="1" stop-color="#5fd6cf" stop-opacity="0.08" />
			</radialGradient>
		</defs>
		<text x="16" y="26" class="t-ui" style="font-size:{11 * k}px">SPACES</text>
		{#if step >= 3}<text x="16" y="282" class="t-ui" style="font-size:{11 * k}px">GROUPS · AFTER APPLYING H₁</text>{/if}

		<!-- ── spaces ── -->
		<circle cx={SL[0]} cy={SL[1]} r="30" class="ring" />
		<SvgTeX x={SL[0]} y={SL[1] + 50 + 8 * (k - 1)} tex="S^1" size={17 * k} w={40 * k} h={24 * k} />
		<circle cx={SD[0]} cy={SD[1]} r="42" fill="url(#bt-disk)" class="disk" />
		<SvgTeX x={SD[0] + 62 + 6 * (k - 1)} y={SD[1] - 26} tex="D^2" size={17 * k} w={40 * k} h={24 * k} />
		<circle cx={SR[0]} cy={SR[1]} r="30" class="ring" />
		<SvgTeX x={SR[0]} y={SR[1] + 50 + 8 * (k - 1)} tex="S^1" size={17 * k} w={40 * k} h={24 * k} />

		{#if step === 1 || step === 2}
			{#each pushArrows as a, k (k)}
				<line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} class="push" marker-end="url(#arrow-rose)" />
			{/each}
			<text x={SD[0]} y={SD[1] + 6} text-anchor="middle" class="q">?</text>
		{/if}

		<path d={seg(SL, SD, 40)} class="map" marker-end="url(#arrow-ivory)" />
		<SvgTeX x={(SL[0] + SD[0]) / 2 - 18 * k} y={(SL[1] + SD[1]) / 2 - 14 * k} tex="i" size={16 * k} w={30 * k} h={24 * k} />

		{#if step >= 1}
			<path d={seg(SD, SR, 40)} class="map retr" class:dead={step >= 5} marker-end="url(#arrow-rose)" />
			<SvgTeX x={(SR[0] + SD[0]) / 2 + 18 * k} y={(SR[1] + SD[1]) / 2 - 14 * k} tex="r" size={16 * k} color="var(--rose)" w={30 * k} h={24 * k} />
			{#if step >= 5}
				<g transform="translate({(SR[0] + SD[0]) / 2} {(SR[1] + SD[1]) / 2})" class="cross">
					<line x1="-12" y1="-12" x2="12" y2="12" />
					<line x1="-12" y1="12" x2="12" y2="-12" />
				</g>
			{/if}
		{/if}
		{#if step >= 2}
			<path d={seg(SL, SR, 36)} class="map idm" marker-end="url(#arrow-gold)" />
			<SvgTeX x={320} y={SL[1] + 18 + 5 * (k - 1)} tex={'\\id_{S^1}'} size={15 * k} color="var(--gold-bright)" w={70 * k} h={24 * k} />
			{#if step === 2}
				<path d="M {SL[0] + 40} {SL[1] - 14} Q 320 120 {SR[0] - 40} {SR[1] - 14}" class="commute" />
				<text x="320" y="164" text-anchor="middle" class="t-ui" style="font-size:{11 * k}px">commutes</text>
			{/if}
		{/if}

		<!-- ── the functor ── -->
		{#if step >= 3}
			<g class="beam-g">
				<path d="M 600 120 L 600 380" class="beam" marker-end="url(#arrow-gold)" />
				<rect x={600 - 18 * k} y={249 - 13 * k} width={36 * k} height={26 * k} rx={13 * k} class="pill" />
				<SvgTeX x={600} y={249} tex="H_1" size={15 * k} color="var(--gold-bright)" w={36 * k} h={24 * k} />
			</g>

			<!-- ── groups ── -->
			{#each [[GL, '\\Z'], [GD, '0'], [GR, '\\Z']] as [P, t], i (i)}
				<g transform="translate({(P as Pt)[0]} {(P as Pt)[1]})">
					<rect x="-28" y="-20" width="56" height="40" rx="12" class="gnode" class:zero={i === 1} />
					<SvgTeX x={0} y={0} tex={String(t)} size={19 * Math.min(k, 1.3)} color={i === 1 ? 'var(--rose)' : 'var(--ink-bright)'} w={50} h={28 * k} />
				</g>
			{/each}
			<SvgTeX x={GL[0] - 64 - 20 * (k - 1)} y={GL[1]} tex={'H_1(S^1)'} size={13 * k} color="var(--ink-faint)" w={80 * k} h={20 * k} />
			<SvgTeX x={GD[0] + 72 + 24 * (k - 1)} y={GD[1] - 22} tex={'H_1(D^2)'} size={13 * k} color="var(--ink-faint)" w={80 * k} h={20 * k} />
			<SvgTeX x={GR[0] + 66 + 20 * (k - 1)} y={GR[1]} tex={'H_1(S^1)'} size={13 * k} color="var(--ink-faint)" w={80 * k} h={20 * k} />

			<path d={seg(GL, GD, 34)} class="map" marker-end="url(#arrow-ivory)" />
			<SvgTeX x={(GL[0] + GD[0]) / 2 - 22 * k} y={(GL[1] + GD[1]) / 2 - 12 * k} tex="i_*" size={15 * k} w={36 * k} h={24 * k} />
			<path d={seg(GD, GR, 34)} class="map" marker-end="url(#arrow-rose)" />
			<SvgTeX x={(GR[0] + GD[0]) / 2 + 22 * k} y={(GR[1] + GD[1]) / 2 - 12 * k} tex="r_*" size={15 * k} color="var(--rose)" w={36 * k} h={24 * k} />
			<path d={seg(GL, GR, 36)} class="map idm" marker-end="url(#arrow-gold)" />
			<SvgTeX x={320} y={GL[1] + 18 + 5 * (k - 1)} tex={'\\id_{\\Z}'} size={15 * k} color="var(--gold-bright)" w={60 * k} h={24 * k} />
		{/if}

		{#if step >= 4}
			{@const kt = Math.min(k, 1.4)}
			<g transform="translate({tokA[0]} {tokA[1] - 26 - 6 * (k - 1)})">
				<circle r={13 * kt} class="token" class:crushed={tokAValue === '0'} />
				<text text-anchor="middle" dy={5 * kt} class="tok-t" style="font-size:{14 * kt}px">{tokAValue}</text>
			</g>
			<g transform="translate({tokB[0]} {tokB[1] + 34 + 6 * (k - 1)})">
				<circle r={13 * kt} class="token" />
				<text text-anchor="middle" dy={5 * kt} class="tok-t" style="font-size:{14 * kt}px">1</text>
			</g>
			{#if tok >= 2}
				<!-- on a phone the larger labels leave no room beside r_*: the pill moves up, into the gap below the H₁ pill -->
				{@const kc = Math.min(k, 1.25)}
				<g transform={k > 1.2 ? 'translate(535 305)' : `translate(${GR[0]} ${GR[1] - 58})`}>
					<rect x={-46 * kc} y={-15 * kc} width={92 * kc} height={30 * kc} rx={15 * kc} class="clash" />
					<SvgTeX x={0} y={0} tex={'0 \\neq 1'} size={16 * kc} color="#fff" w={90 * kc} h={26 * kc} />
				</g>
			{/if}
		{/if}
	</Svg>

	<div class="explain">
		<TeX tex={texts[step].tex} display />
		<p class="ui">{texts[step].text}</p>
	</div>
	<Controls>
		<StepControls bind:step count={labels.length} {labels} interval={2600} />
	</Controls>
</div>

<style>
	.brouwer {
		padding-top: 0.6rem;
	}
	.ring {
		fill: none;
		stroke: #f2d08f;
		stroke-width: 3;
		filter: url(#glow);
	}
	.disk {
		stroke: #5fd6cf;
		stroke-width: 2.4;
		filter: url(#glow);
	}
	.push {
		stroke: #f28db6;
		stroke-width: 1.6;
		opacity: 0.8;
	}
	.q {
		fill: #f28db6;
		font-size: 20px !important;
		font-weight: 700;
	}
	.map {
		fill: none;
		stroke: #ebe5d5;
		stroke-width: 2;
	}
	.retr {
		stroke: #f28db6;
		stroke-dasharray: 7 5;
	}
	.retr.dead {
		opacity: 0.35;
	}
	.cross line {
		stroke: #f28db6;
		stroke-width: 3.5;
		stroke-linecap: round;
	}
	.idm {
		stroke: #f2d08f;
		stroke-width: 2.4;
	}
	.commute {
		fill: none;
		stroke: rgba(132, 217, 162, 0.5);
		stroke-width: 1.4;
		stroke-dasharray: 2 5;
	}
	.beam {
		stroke: rgba(242, 208, 143, 0.55);
		stroke-width: 2;
		stroke-dasharray: 2 6;
		stroke-linecap: round;
	}
	.pill {
		fill: #0b1122;
		stroke: rgba(242, 208, 143, 0.6);
	}
	.gnode {
		fill: rgba(18, 26, 47, 0.95);
		stroke: rgba(242, 208, 143, 0.55);
		stroke-width: 1.4;
	}
	.gnode.zero {
		stroke: rgba(242, 141, 182, 0.7);
	}
	.token {
		fill: #f2d08f;
		filter: url(#glow-strong);
		transition: fill 0.3s;
	}
	.token.crushed {
		fill: #f28db6;
	}
	.tok-t {
		font-family: var(--font-ui);
		font-weight: 700;
		font-size: 14px;
		fill: #1a1206 !important;
	}
	.clash {
		fill: rgba(242, 141, 182, 0.85);
		filter: url(#glow);
	}
	.explain {
		padding: 0 1.2rem 0.4rem;
		text-align: center;
		min-height: 6.4rem;
	}
	.explain p {
		margin: -0.3rem 0 0.4rem;
		font-size: 0.84rem;
		color: var(--ink-dim);
	}
</style>
