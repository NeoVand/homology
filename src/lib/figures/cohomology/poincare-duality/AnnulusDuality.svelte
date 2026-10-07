<script lang="ts">
	// Lefschetz duality on the annulus. Duality matches each curve with the fence
	// along it: the core circle C with its fence, a class in H¹(A, ∂A) (it never
	// meets the rim); the radial rung R, a relative cycle, with its fence, a class
	// in H¹(A). The other curve tests the fence and crosses it once.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';

	let pair = $state<'core' | 'rung'>('core');
	const cx = 210;
	const cy = 185;
	const r0 = 70;
	const r1 = 150;
	const rc = 110;
	const ang = -0.62;
	const rungA: [number, number] = [cx + r0 * Math.cos(ang), cy + r0 * Math.sin(ang)];
	const rungB: [number, number] = [cx + r1 * Math.cos(ang), cy + r1 * Math.sin(ang)];
	const mid: [number, number] = [cx + rc * Math.cos(ang), cy + rc * Math.sin(ang)];
	// chevrons across each curve point the way a crossing counts +1: from the left
	// of the curve to its right (C runs anticlockwise, R from the inner rim outwards)
	const coreChev = Array.from({ length: 10 }, (_, k) => {
		const t = (2 * Math.PI * (k + 0.5)) / 10;
		const x = cx + rc * Math.cos(t);
		const y = cy + rc * Math.sin(t);
		const ox = Math.cos(t);
		const oy = Math.sin(t);
		const tx = -oy;
		const ty = ox;
		return `M${x - tx * 6} ${y - ty * 6} L${x + ox * 7} ${y + oy * 7} L${x + tx * 6} ${y + ty * 6}`;
	}).join(' ');
	const rungChev = [0.25, 0.5, 0.75]
		.map((s) => {
			const x = rungA[0] + (rungB[0] - rungA[0]) * s;
			const y = rungA[1] + (rungB[1] - rungA[1]) * s;
			const ux = Math.cos(ang);
			const uy = Math.sin(ang);
			const nx = -uy;
			const ny = ux;
			return `M${x - ux * 6} ${y - uy * 6} L${x + nx * 7} ${y + ny * 7} L${x + ux * 6} ${y + uy * 6}`;
		})
		.join(' ');
</script>

<div class="ad">
	<Svg viewBox="0 0 420 370" maxHeight={380} label="An annulus with its core circle and a radial rung joining the inner boundary to the outer boundary. Lefschetz duality matches each curve with the fence along it; the other curve crosses that fence once.">
		<defs>
			<radialGradient id="ad-fill" cx="50%" cy="50%" r="50%">
				<stop offset="0.4" stop-color="#8f7cf7" stop-opacity="0.08" />
				<stop offset="0.75" stop-color="#6fd6e8" stop-opacity="0.18" />
				<stop offset="1" stop-color="#ee8fbf" stop-opacity="0.12" />
			</radialGradient>
			<filter id="ad-glow" filterUnits="userSpaceOnUse" x="0" y="0" width="420" height="370">
				<feGaussianBlur stdDeviation="2.6" result="g" />
				<feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
			</filter>
		</defs>
		<path d="M{cx + r1} {cy} A{r1} {r1} 0 1 1 {cx - r1} {cy} A{r1} {r1} 0 1 1 {cx + r1} {cy} M{cx + r0} {cy} A{r0} {r0} 0 1 0 {cx - r0} {cy} A{r0} {r0} 0 1 0 {cx + r0} {cy} Z" fill="url(#ad-fill)" fill-rule="evenodd" />
		<circle {cx} {cy} r={r1} class="bd" />
		<circle {cx} {cy} r={r0} class="bd" />
		<!-- the core circle: the cycle with its own fence, or the test loop -->
		{#if pair === 'core'}
			<circle {cx} {cy} r={rc} class="curve" style="--c:var(--gold-bright)" filter="url(#ad-glow)" />
			<path d={coreChev} class="chev" style="--c:var(--teal)" />
			<path d="M{cx + rc - 6} {cy + 9} L{cx + rc} {cy - 2} L{cx + rc + 6} {cy + 9}" class="chev" style="--c:var(--gold-bright)" />
		{:else}
			<circle {cx} {cy} r={rc} class="curve test" style="--c:var(--violet)" />
		{/if}
		<!-- the rung: the relative cycle with its own fence, or the test path -->
		{#if pair === 'rung'}
			{@const ux = Math.cos(ang)}
			{@const uy = Math.sin(ang)}
			{@const ax = rungA[0] + (rungB[0] - rungA[0]) * 0.86}
			{@const ay = rungA[1] + (rungB[1] - rungA[1]) * 0.86}
			<line x1={rungA[0]} y1={rungA[1]} x2={rungB[0]} y2={rungB[1]} class="curve" style="--c:var(--gold-bright)" filter="url(#ad-glow)" />
			<path d={rungChev} class="chev" style="--c:var(--teal)" />
			<path d="M{ax - ux * 8 - uy * 7} {ay - uy * 8 + ux * 7} L{ax + ux * 4} {ay + uy * 4} L{ax - ux * 8 + uy * 7} {ay - uy * 8 - ux * 7}" class="chev" style="--c:var(--gold-bright)" />
		{:else}
			<line x1={rungA[0]} y1={rungA[1]} x2={rungB[0]} y2={rungB[1]} class="curve test" style="--c:var(--violet)" />
		{/if}
		<circle cx={mid[0]} cy={mid[1]} r="10" class="halo" />
		<circle cx={mid[0]} cy={mid[1]} r="4.8" class="dot" />
		<SvgTeX x={cx} y={cy - rc - 18} tex={pair === 'core' ? String.raw`\text{loop } C \in H_1(A)` : String.raw`\text{test loop}`} color={pair === 'core' ? 'var(--gold-bright)' : 'var(--violet)'} size={15} w={200} h={26} />
		<SvgTeX x={rungB[0] + 30} y={rungB[1] - 22} tex={pair === 'core' ? String.raw`\text{test path}` : String.raw`\text{relative cycle } R \in H_1(A,\partial A)`} color={pair === 'core' ? 'var(--violet)' : 'var(--gold-bright)'} size={14} w={240} h={26} anchor="end" />
		<text x={cx} y={cy + r1 + 24} class="t-ui note">dashed circles: the boundary ∂A</text>
	</Svg>
	<div class="ctl ui">
		<Segmented
			bind:value={pair}
			label="Which duality"
			options={[
				{ value: 'core', label: 'H¹(A, ∂A) ≅ H₁(A)' },
				{ value: 'rung', label: 'H¹(A) ≅ H₁(A, ∂A)' }
			]}
		/>
		<p class="read">
			{#if pair === 'core'}
				The fence along <i>C</i> (teal chevrons) never touches the rim, so it is a class in <TeX tex={String.raw`H^1(A,\partial A)`} />. Duality matches it with <i>C</i> itself. A path from rim to rim crosses it once.
			{:else}
				The fence along the rung <i>R</i> (teal chevrons) counts how often a loop goes round, a class in <TeX tex={String.raw`H^1(A)`} />. Duality matches it with <i>R</i>, read as a relative cycle. The test loop crosses it once.
			{/if}
		</p>
	</div>
</div>

<style>
	.bd {
		fill: none;
		stroke: rgba(235, 229, 213, 0.6);
		stroke-width: 1.6;
		stroke-dasharray: 6 5;
	}
	.curve {
		fill: none;
		stroke: var(--c);
		stroke-width: 3.2;
		stroke-linecap: round;
		transition: stroke 0.4s var(--ease);
	}
	.chev {
		fill: none;
		stroke: var(--c);
		stroke-width: 2.2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.halo {
		fill: var(--rose);
		opacity: 0.3;
		filter: blur(3px);
	}
	.dot {
		fill: var(--rose);
		stroke: #fff4f8;
		stroke-width: 1.2;
	}
	.note {
		text-anchor: middle;
		font-size: 11px;
	}
	.ctl {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1.2rem;
		padding: 0.8rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	.curve.test {
		stroke-width: 2.2;
		stroke-dasharray: 7 5;
	}
	.read {
		margin: 0;
		flex: 1 1 18rem;
		color: var(--ink-dim);
		font-size: 0.86rem;
		line-height: 1.5;
	}
</style>
