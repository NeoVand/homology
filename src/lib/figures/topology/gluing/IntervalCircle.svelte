<script lang="ts">
	// [0,1] with 0 ~ 1 becomes a circle. Which sets around the glued point are open?
	// Look back before the glue: U is open exactly when π⁻¹(U) is open in [0,1].
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';

	let g = $state(0.72);
	let which = $state<'good' | 'bad'>('good');
	const R = 78;
	const LEN = 2 * Math.PI * R;
	const eps = 0.11;
	const CX = 300;
	const BASE = 236;

	function pt(s01: number, gg: number): [number, number] {
		// position of the parameter s ∈ [0,1] after bending by gg ∈ [0,1]
		const s = (s01 - 0.5) * LEN;
		const k = (gg * 2 * Math.PI) / LEN;
		const x = Math.abs(k) < 1e-7 ? s : Math.sin(k * s) / k;
		const y = Math.abs(k * s) < 1e-5 ? (k * s * s) / 2 : (1 - Math.cos(k * s)) / k;
		return [CX + x, BASE - y];
	}
	const poly = (a: number, b: number, gg: number) =>
		Array.from({ length: 81 }, (_, i) => pt(a + ((b - a) * i) / 80, gg))
			.map((p) => p.map((c) => c.toFixed(1)).join(','))
			.join(' ');

	const P0 = $derived(pt(0, g));
	const P1 = $derived(pt(1, g));
	const glued = $derived(g > 0.995);
</script>

<div class="ic">
	<Svg viewBox="0 0 600 300" maxHeight={330} label="An interval bending round until its two ends meet, with a highlighted set near the ends">
		<polyline points={poly(0, 1, g)} fill="none" stroke="var(--ink)" stroke-width="3" stroke-linecap="round" />
		<polyline points={poly(0, eps, g)} fill="none" stroke={which === 'good' ? 'var(--teal)' : 'var(--rose)'} stroke-width="8" stroke-linecap="round" filter="url(#glow)" />
		{#if which === 'good'}
			<polyline points={poly(1 - eps, 1, g)} fill="none" stroke="var(--teal)" stroke-width="8" stroke-linecap="round" filter="url(#glow)" />
		{/if}
		<!-- the end points -->
		{#if glued}
			<circle cx={P0[0]} cy={P0[1]} r="7" fill="var(--gold-bright)" stroke="#060912" stroke-width="1.5" filter="url(#glow)" />
			<SvgTeX x={P0[0]} y={P0[1] - 22} tex={'[0]=[1]'} size={15} w={90} h={22} color="var(--gold-bright)" />
		{:else}
			<circle cx={P0[0]} cy={P0[1]} r="6.5" fill="var(--gold-bright)" stroke="#060912" stroke-width="1.5" />
			<circle cx={P1[0]} cy={P1[1]} r="6.5" fill={which === 'bad' ? 'var(--rose)' : 'var(--gold-bright)'} stroke="#060912" stroke-width="1.5" />
			<SvgTeX x={P0[0] - 14} y={P0[1] + 20} tex="0" size={15} w={20} h={20} />
			<SvgTeX x={P1[0] + 14} y={P1[1] + 20} tex="1" size={15} w={20} h={20} />
		{/if}
	</Svg>
	<div class="panel ui">
		<div class="row">
			<Slider bind:value={g} min={0} max={1} step={0.005} label="Glue the ends together" format={(v) => `${Math.round(v * 100)}%`} />
			<Segmented
				bind:value={which}
				options={[
					{ value: 'good', label: 'An arc around the glued point' },
					{ value: 'bad', label: 'A one-sided arc' }
				]}
				label="Which set"
			/>
		</div>
		<p class="read" aria-live="polite">
			{#if which === 'good'}
				Before gluing, this set is <TeX tex={'[0,\\varepsilon)\\cup(1-\\varepsilon,1]'} />: open in <TeX tex={'[0,1]'} />, since every point of it has some room
				inside <TeX tex={'[0,1]'} />. So after gluing it is <b class="ok">open</b> — the glued point has room on both sides.
			{:else}
				This set contains the glued point, so before gluing it is <TeX tex={'[0,\\varepsilon)\\cup\\{1\\}'} />. The lonely point <TeX tex="1" /> has no room at
				all, so this is <b class="no">not open</b> — just as the picture suggests: the arc stops dead at the glued point.
			{/if}
		</p>
	</div>
</div>

<style>
	.ic {
		padding: 0.6rem 0.6rem 0;
	}
	.panel {
		padding: 0.7rem 1rem 0.9rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
		font-size: 0.85rem;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.7rem 1.3rem;
		margin-bottom: 0.5rem;
	}
	.read {
		margin: 0;
		color: var(--ink-dim);
		line-height: 1.55;
	}
	.ok {
		color: var(--teal);
	}
	.no {
		color: var(--rose);
	}
</style>
