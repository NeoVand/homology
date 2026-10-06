<script lang="ts">
	// Figure: why "bounded" is not a sheafy property but "bounded by 1" is.
	// The real line is covered by the overlapping intervals U_n = (n − 1, n + 1).
	// On each piece we take a bounded function; neighbouring pieces agree on
	// their overlaps, so the pieces glue — and the glued function may escape
	// every bound. A bound fixed in advance, like |f| ≤ 1, survives gluing.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';

	type Mode = 'bounded' | 'one';
	let mode = $state<Mode>('bounded');
	let M = $state(3);

	const W = 820;
	const H = 372;
	const XMIN = -7.4;
	const XMAX = 7.4;
	const YMAX = 7.6;
	const sx = (x: number) => 30 + ((x - XMIN) / (XMAX - XMIN)) * (W - 60);
	const AXIS = 172;
	const sy = (y: number) => AXIS - (y / YMAX) * 142;
	const fOne = (x: number) => Math.sin(1.25 * x) * 0.82 + 0.18 * Math.sin(3.1 * x + 0.5);
	const fn = (x: number) => (mode === 'bounded' ? x : fOne(x));
	const scaleY = $derived(mode === 'bounded' ? 1 : 4.2); // magnify the |f| ≤ 1 picture

	const pieces = $derived(Array.from({ length: 2 * M + 1 }, (_, k) => k - M));
	const colours = ['var(--violet)', 'var(--blue)', 'var(--teal)'];
	function path(a: number, b: number) {
		const n = 60;
		let d = '';
		for (let i = 0; i <= n; i++) {
			const x = a + ((b - a) * i) / n;
			d += `${i ? 'L' : 'M'} ${sx(x).toFixed(1)} ${sy(fn(x) * scaleY).toFixed(1)} `;
		}
		return d;
	}
	const sup = $derived(mode === 'bounded' ? M + 1 : 1);
</script>

<div class="wrap">
	<Svg viewBox="0 0 {W} {H}" maxHeight={420} label="The line covered by overlapping intervals; on each interval a bounded function; the pieces agree on overlaps and glue to one function on the union.">
		<!-- axes -->
		<line x1={sx(XMIN)} y1={AXIS} x2={sx(XMAX)} y2={AXIS} stroke="rgba(235,229,213,0.3)" />
		<line x1={sx(0)} y1={22} x2={sx(0)} y2={318} stroke="rgba(235,229,213,0.18)" />
		{#each [-6, -4, -2, 2, 4, 6] as t (t)}
			<line x1={sx(t)} y1={AXIS - 4} x2={sx(t)} y2={AXIS + 4} stroke="rgba(235,229,213,0.3)" />
			<text x={sx(t)} y={AXIS + 18} text-anchor="middle" class="t-ui">{t}</text>
		{/each}

		<!-- the bounds each piece satisfies -->
		{#each pieces as n (n)}
			{@const bound = mode === 'bounded' ? Math.abs(n) + 1 : 1}
			{@const yb = Math.min(bound * scaleY, YMAX - 0.2)}
			<g>
				<rect x={sx(n - 1)} y={sy(yb)} width={sx(n + 1) - sx(n - 1)} height={sy(-yb) - sy(yb)} fill={colours[(n + 30) % 3]} opacity="0.05" />
				<line x1={sx(n - 1)} y1={sy(yb)} x2={sx(n + 1)} y2={sy(yb)} stroke={colours[(n + 30) % 3]} stroke-dasharray="5 4" stroke-width="1.6" opacity="0.8" />
				<line x1={sx(n - 1)} y1={sy(-yb)} x2={sx(n + 1)} y2={sy(-yb)} stroke={colours[(n + 30) % 3]} stroke-dasharray="5 4" stroke-width="1.6" opacity="0.8" />
			</g>
		{/each}

		<!-- the glued function -->
		<path d={path(-M - 1, M + 1)} stroke="var(--gold-bright)" stroke-width="3" fill="none" filter="url(#glow)" />

		<!-- the cover: intervals U_n in two staggered rows -->
		{#each pieces as n (n)}
			{@const row = ((n % 2) + 2) % 2}
			{@const y = 336 + row * 16}
			<line x1={sx(n - 1) + 3} y1={y} x2={sx(n + 1) - 3} y2={y} stroke={colours[(n + 30) % 3]} stroke-width="7" stroke-linecap="round" opacity="0.85" />
			<circle cx={sx(n - 1) + 3} cy={y} r="4" fill="#0b1020" stroke={colours[(n + 30) % 3]} stroke-width="1.5" />
			<circle cx={sx(n + 1) - 3} cy={y} r="4" fill="#0b1020" stroke={colours[(n + 30) % 3]} stroke-width="1.5" />
		{/each}
		<SvgTeX x={sx(XMIN) + 14} y={322} tex={'U_n'} size={16} color="var(--ink-dim)" w={40} />

		{#if mode === 'bounded'}
			<SvgTeX x={sx(XMAX) - 70} y={36} tex={`\\sup |f| = ${sup}`} size={17} color="var(--rose)" w={140} />
		{:else}
			<SvgTeX x={sx(XMAX) - 70} y={36} tex={'|f| \\le 1 \\text{ everywhere}'} size={16} color="var(--green)" w={170} />
		{/if}
	</Svg>

	<div class="readout ui">
		{#if mode === 'bounded'}
			<p>
				On each piece <span class="tx">U<sub>n</sub> = (n−1, n+1)</span> the function x ↦ x is bounded (by |n| + 1, the
				dashed lines), and neighbouring pieces agree where they overlap. Glued together they give x ↦ x on the whole union,
				whose largest value grows with every piece you add: the property “bounded” does not survive gluing.
			</p>
		{:else}
			<p>
				Now every piece satisfies the same bound <span class="tx">|f| ≤ 1</span>, fixed in advance. Whatever pieces you
				glue, the result still satisfies it, because the bound can be checked point by point: “bounded by 1” is a sheafy
				property. (The picture is magnified vertically.)
			</p>
		{/if}
	</div>

	<Controls>
		<Segmented
			bind:value={mode}
			options={[
				{ value: 'bounded', label: 'Bounded' },
				{ value: 'one', label: 'Bounded by 1' }
			]}
			label="Property"
		/>
		<Stepper bind:value={M} min={0} max={6} label="Pieces on each side" />
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.5rem;
	}
	.readout {
		padding: 0.2rem 1.2rem 0.4rem;
		font-size: 0.84rem;
		color: var(--ink-dim);
		line-height: 1.55;
	}
	.readout p {
		margin: 0.3rem 0;
	}
	.tx {
		color: var(--gold-bright);
		white-space: nowrap;
	}
</style>
