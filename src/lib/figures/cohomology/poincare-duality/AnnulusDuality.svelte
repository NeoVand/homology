<script lang="ts">
	// Lefschetz duality on the annulus: the core circle and a radial rung swap
	// roles. A loop in the interior is dual to a fence running from boundary to
	// boundary, and vice versa.
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
	// chevrons across the core circle (pointing outwards) and across the rung (pointing anticlockwise)
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
	<Svg viewBox="0 0 420 370" maxHeight={380} label="An annulus with its core circle and a radial rung joining the inner boundary to the outer boundary. In one view the core circle is a loop and the rung is its fence; in the other the rung is a relative cycle and the core circle is its fence.">
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
		<!-- the core circle -->
		<circle {cx} {cy} r={rc} class="curve" style="--c:{pair === 'core' ? 'var(--gold-bright)' : 'var(--teal)'}" filter="url(#ad-glow)" />
		{#if pair === 'rung'}
			<path d={coreChev} class="chev" style="--c:var(--teal)" />
		{:else}
			<path d="M{cx + rc - 6} {cy - 9} L{cx + rc} {cy + 2} L{cx + rc + 6} {cy - 9}" class="chev" style="--c:var(--gold-bright)" />
		{/if}
		<!-- the rung -->
		<line x1={rungA[0]} y1={rungA[1]} x2={rungB[0]} y2={rungB[1]} class="curve" style="--c:{pair === 'core' ? 'var(--teal)' : 'var(--gold-bright)'}" filter="url(#ad-glow)" />
		{#if pair === 'core'}
			<path d={rungChev} class="chev" style="--c:var(--teal)" />
		{:else}
			{@const ux = Math.cos(ang)}
			{@const uy = Math.sin(ang)}
			{@const ax = rungA[0] + (rungB[0] - rungA[0]) * 0.78}
			{@const ay = rungA[1] + (rungB[1] - rungA[1]) * 0.78}
			<path d="M{ax - ux * 8 - uy * 7} {ay - uy * 8 + ux * 7} L{ax + ux * 4} {ay + uy * 4} L{ax - ux * 8 + uy * 7} {ay - uy * 8 - ux * 7}" class="chev" style="--c:var(--gold-bright)" />
		{/if}
		<circle cx={mid[0]} cy={mid[1]} r="10" class="halo" />
		<circle cx={mid[0]} cy={mid[1]} r="4.8" class="dot" />
		<SvgTeX x={cx} y={cy - rc - 18} tex={pair === 'core' ? '\\text{loop in } H_1(A)' : '\\text{fence: } H^1(A,\\partial A)'} color={pair === 'core' ? 'var(--gold-bright)' : 'var(--teal)'} size={15} w={200} h={26} />
		<SvgTeX x={rungB[0] + 30} y={rungB[1] - 22} tex={pair === 'core' ? '\\text{fence: } H^1(A,\\partial A)' : '\\text{relative cycle: } H_1(A,\\partial A)'} color={pair === 'core' ? 'var(--teal)' : 'var(--gold-bright)'} size={14} w={210} h={26} anchor="end" />
		<text x={cx} y={cy + r1 + 24} class="t-ui note">dashed circles: the boundary ∂A</text>
	</Svg>
	<div class="ctl ui">
		<Segmented
			bind:value={pair}
			label="Which duality"
			options={[
				{ value: 'core', label: 'H₁(A) ≅ H¹(A, ∂A)' },
				{ value: 'rung', label: 'H₁(A, ∂A) ≅ H¹(A)' }
			]}
		/>
		<span class="read">
			{#if pair === 'core'}
				<TeX tex={'\\text{the core circle } \\longleftrightarrow \\text{ the rung as a fence}'} />
			{:else}
				<TeX tex={'\\text{the rung } \\longleftrightarrow \\text{ the core circle as a fence}'} />
			{/if}
		</span>
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
	.read {
		color: var(--ink-bright);
		font-size: 0.92rem;
	}
</style>
