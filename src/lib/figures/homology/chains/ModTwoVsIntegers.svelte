<script lang="ts">
	// Figure 3.2.5 — two triangles sharing the edge [1,2]. Mod 2 the shared edge
	// always cancels when both triangles are taken. With integer coefficients it
	// cancels only when the two triangles are oriented consistently (a = −b
	// here); otherwise it is counted twice.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import GraphCanvas from '../cycles-and-boundaries/GraphCanvas.svelte';
	import { square, chainTeX } from './chains';

	const K = square.K;
	const edges = K.simplices[1] as [number, number][]; // [0,1],[0,2],[1,2],[1,3],[2,3]
	const tris = K.simplices[2] as [number, number, number][]; // [0,1,2],[1,2,3]
	const sides = [1, -1, 1, 1, -1] as const;
	const SHARED = 2;
	// on screen, [0,1,2] runs anticlockwise and [1,2,3] clockwise
	const baseSpin = [1, -1];

	let mode = $state<'z' | 'z2'>('z');
	let a = $state(1);
	let b = $state(1);
	let t0 = $state(true);
	let t1 = $state(true);

	const coeffs = $derived(mode === 'z' ? [a, b] : [t0 ? 1 : 0, t1 ? 1 : 0]);
	const raw = $derived(K.boundary(2, coeffs));
	const bd = $derived(mode === 'z' ? raw : raw.map((x) => ((x % 2) + 2) % 2));
	const shared = $derived(bd[SHARED]);
	const fmt = (n: number) => (mode === 'z2' ? String(n) : n > 0 ? `+${n}` : `${n}`);

	const chainStr = $derived(
		mode === 'z'
			? chainTeX(K, 2, coeffs, (t) => `\\chn{${t}}`)
			: coeffs.some(Boolean)
				? tris
						.filter((_, i) => coeffs[i])
						.map((t) => `\\chn{[${t.join(',')}]}`)
						.join(' + ')
				: '0'
	);
	const bdStr = $derived(
		mode === 'z'
			? chainTeX(K, 1, bd, (t, i) => (i === SHARED ? `\\hole{${t}}` : `\\bdy{${t}}`))
			: bd.some(Boolean)
				? edges
						.filter((_, i) => bd[i])
						.map((e) => `\\bdy{[${e.join(',')}]}`)
						.join(' + ')
				: '0'
	);
	const centroid = (t: number[]) => [t.reduce((s, v) => s + square.pos[v][0], 0) / 3, t.reduce((s, v) => s + square.pos[v][1], 0) / 3];
</script>

<div class="wrap">
	<Svg viewBox="70 50 340 300" maxHeight={380} label="A square split by its diagonal into triangles [0,1,2] and [1,2,3]. Edge labels show the coefficients of the boundary of the chosen chain; the diagonal is the shared edge.">
		<GraphCanvas
			pos={square.pos}
			{edges}
			{tris}
			triLook={(i) => ({ fill: 'var(--violet)', opacity: coeffs[i] ? Math.min(0.5, 0.18 + 0.14 * Math.abs(coeffs[i])) : 0.05 })}
			edgeLook={(i) => {
				const k = bd[i];
				if (!k) {
					return i === SHARED && coeffs[0] && coeffs[1]
						? { color: 'rgba(242,208,143,0.5)', width: 2, dash: '4 6', label: '0', labelColor: 'var(--gold-bright)', labelSide: sides[i] }
						: { color: 'rgba(206,198,176,0.32)', width: 2 };
				}
				const col = i === SHARED ? 'var(--rose)' : 'var(--teal)';
				return {
					color: col,
					width: 2.6 + 1.2 * Math.abs(k),
					glow: true,
					arrow: mode === 'z' ? (k > 0 ? 1 : -1) : 0,
					label: fmt(k),
					labelColor: col,
					labelSide: sides[i]
				};
			}}
			vertexLook={(v) => ({ label: String(v), labelOffset: [v % 2 === 0 ? -20 : 20, v < 2 ? 16 : -16] })}
		/>
		{#if mode === 'z'}
			{#each tris as t, i (t.join(''))}
				{#if coeffs[i]}
					{@const [x, y] = centroid(t)}
					{@const s = baseSpin[i] * Math.sign(coeffs[i])}
					{@const r = 17}
					<path
						d={s > 0 ? `M ${x + r} ${y} A ${r} ${r} 0 1 0 ${x} ${y + r}` : `M ${x} ${y + r} A ${r} ${r} 0 1 1 ${x + r} ${y}`}
						class="spin"
						marker-end="url(#arrow-violet)"
					/>
				{/if}
			{/each}
		{/if}
	</Svg>

	<div class="readout ui" aria-live="polite">
		<div class="line"><TeX tex={String.raw`\partial\big(${chainStr}\big) = ${bdStr}`} /></div>
		<div class="line note">
			{#if !(coeffs[0] && coeffs[1])}
				Take both triangles to see what happens on the shared edge \([1,2]\).
			{:else if shared === 0}
				<span class="badge gold">cancels</span>
				{#if mode === 'z2'}Mod 2 the shared edge is counted twice, and \(1 + 1 = 0\): only the outer rim survives.
				{:else}The shared edge gets coefficient \(a + b = 0\): the triangles turn the same way, so they cross \([1,2]\) in opposite directions.{/if}
			{:else if a * b > 0}
				<span class="badge rose">adds up</span> The shared edge gets coefficient <TeX tex={`a + b = ${a + b}`} />: as written, the two triangles turn opposite
				ways, so they cross \([1,2]\) in the <em>same</em> direction and their contributions add.
			{:else}
				<span class="badge rose">partly cancels</span> The shared edge gets coefficient <TeX tex={`a + b = ${a + b}`} />: the two contributions point opposite
				ways but have different sizes.
			{/if}
		</div>
	</div>

	<Controls>
		<Segmented
			bind:value={mode}
			label="Coefficients"
			options={[
				{ value: 'z2', label: 'mod 2' },
				{ value: 'z', label: 'integers' }
			]}
		/>
		{#if mode === 'z'}
			<div class="sliders">
				<Slider bind:value={a} min={-2} max={2} step={1} label="a: coefficient of [0,1,2]" format={(v) => (v > 0 ? `+${v}` : `${v}`)} />
				<Slider bind:value={b} min={-2} max={2} step={1} label="b: coefficient of [1,2,3]" format={(v) => (v > 0 ? `+${v}` : `${v}`)} />
			</div>
			<Button variant="ghost" onclick={() => ((a = 1), (b = 1))}>a = b = 1</Button>
			<Button variant="ghost" onclick={() => ((a = 1), (b = -1))}>a = 1, b = −1</Button>
		{:else}
			<Toggle bind:checked={t0} label="[0,1,2] in the chain" />
			<Toggle bind:checked={t1} label="[1,2,3] in the chain" />
		{/if}
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.6rem;
	}
	.spin {
		fill: none;
		stroke: var(--violet);
		stroke-width: 1.8;
	}
	.readout {
		display: grid;
		gap: 0.35rem;
		padding: 0.4rem 1.2rem 0.85rem;
		color: var(--ink-dim);
	}
	.line {
		font-size: 1.02rem;
		color: var(--ink-bright);
		overflow-x: auto;
	}
	.line.note {
		font-size: 0.84rem;
		color: var(--ink-dim);
		line-height: 1.6;
		min-height: 2.8rem;
	}
	.badge {
		font-size: 0.66rem;
		font-weight: 650;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		margin-right: 0.3rem;
	}
	.badge.gold {
		color: #1a1206;
		background: linear-gradient(180deg, #f6dca0, #d2a95f);
	}
	.badge.rose {
		color: #2a0816;
		background: var(--rose);
	}
	.sliders {
		display: flex;
		flex-wrap: wrap;
		gap: 0.8rem 1.4rem;
		width: 100%;
	}
</style>
