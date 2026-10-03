<script lang="ts">
	// Figure 3.1.3 — a triangulated patch in which triangles can be filled or
	// emptied. Draw a loop: if every triangle it encloses is filled, the loop is
	// the rim of a filled region (a boundary, teal); otherwise it surrounds at
	// least one empty triangle (a hole, rose).
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import GraphCanvas from './GraphCanvas.svelte';
	import { patch, oddVertices, symDiff, enclosedTriangles, triangleEdges, transposePts } from './graphs';

	const P = patch;
	const n = P.pos.length;
	const sides = triangleEdges(P.edges, P.tris);
	const rim = (R: number[]) => {
		let z = new Set<number>();
		for (const t of R) z = symDiff(z, sides[t]);
		return [...z];
	};
	const presets: { label: string; R: number[] }[] = [
		{ label: 'Small loop', R: [7] },
		{ label: 'Tight loop on the left', R: [3] },
		{ label: 'Wider loop on the left', R: [0, 3, 5, 6] },
		{ label: 'Outer rim', R: P.tris.map((_, i) => i) }
	];

	let width = $state(800);
	const portrait = $derived(width < 540);
	const pos = $derived(portrait ? transposePts(P.pos) : P.pos);

	let empty = $state<number[]>([3, 9]);
	let sel = $state<number[]>([]);
	let mode = $state<'loop' | 'fill'>('loop');

	const selSet = $derived(new Set(sel));
	const emptySet = $derived(new Set(empty));
	const odd = $derived(oddVertices(n, P.edges, sel));
	const isCycle = $derived(sel.length > 0 && odd.length === 0);
	const region = $derived(isCycle ? (enclosedTriangles(P, sel) ?? []) : []);
	const regionSet = $derived(new Set(region));
	const holesInside = $derived(region.filter((t) => emptySet.has(t)));
	const bounds = $derived(isCycle && holesInside.length === 0);
	const holeNames = $derived(new Map([...empty].sort((a, b) => a - b).map((t, k) => [t, `h_{${k + 1}}`])));
	const F = $derived(P.tris.length - empty.length);

	function pick(kind: string, i: number) {
		if (kind === 'edge') sel = selSet.has(i) ? sel.filter((x) => x !== i) : [...sel, i];
		else if (kind === 'tri') empty = emptySet.has(i) ? empty.filter((x) => x !== i) : [...empty, i];
	}
	const holeList = $derived(holesInside.map((t) => holeNames.get(t)).join(',\\ '));
	const edgeColor = $derived(bounds ? 'var(--teal)' : isCycle ? 'var(--gold-bright)' : 'var(--gold)');
</script>

<div class="wrap" bind:clientWidth={width}>
	<Svg viewBox={portrait ? '14 40 330 520' : '40 10 520 330'} maxHeight={portrait ? 560 : 430} label="A triangulated patch of ten triangles. Some triangles are empty (holes). Tap edges to draw a loop, or switch mode and tap triangles to fill or empty them.">
		<GraphCanvas
			{pos}
			edges={P.edges}
			tris={P.tris}
			hit={34}
			interactive={mode === 'loop' ? ['edge'] : ['tri']}
			onpick={pick}
			edgeName={(i) => `edge ${P.edges[i].join('–')}${selSet.has(i) ? ', in the loop' : ''}`}
			triName={(i) => `triangle ${P.tris[i].join('')}, ${emptySet.has(i) ? 'empty' : 'filled'}`}
			triLook={(i) => {
				const inR = regionSet.has(i);
				if (emptySet.has(i))
					return {
						empty: true,
						fill: inR ? 'rgba(242,141,182,0.46)' : 'rgba(3,5,11,0.6)',
						label: holeNames.get(i),
						labelColor: inR ? '#ffd3e6' : 'rgba(242,141,182,0.75)',
						glow: inR
					};
				if (inR && bounds) return { fill: 'rgba(95,214,207,0.5)', glow: true };
				if (inR) return { fill: 'rgba(95,214,207,0.26)' };
				return { fill: 'rgba(132,150,255,0.13)' };
			}}
			edgeLook={(i) =>
				selSet.has(i)
					? { color: edgeColor, width: 4.4, glow: true }
					: { color: 'rgba(206,198,176,0.42)', width: 2 }}
			vertexLook={(v) => (odd.includes(v) ? { color: '#ff9a9a', ring: 'var(--red)', glow: true, pulse: true } : {})}
		/>
	</Svg>

	<div class="readout ui" aria-live="polite">
		<div class="row">
			<span class="holes"><TeX tex={String.raw`\text{holes: } b_1 = \hole{${empty.length}}`} /></span>
			<span class="formula"><TeX tex={String.raw`E - V + 1 - F = 19 - 10 + 1 - ${F} = ${empty.length}`} /></span>
		</div>
		<div class="status" class:ok={bounds} class:hole={isCycle && !bounds}>
			{#if sel.length === 0}
				Tap edges to draw a closed loop — or pick one of the loops below.
			{:else if !isCycle}
				<span class="badge red">not closed</span> loose ends at {odd.length} vertices: keep going.
			{:else if bounds}
				<span class="badge teal">bounds</span> This cycle is the rim of the {region.length} teal triangle{region.length === 1 ? '' : 's'}: it is a
				<b class="t">boundary</b>.
			{:else}
				<span class="badge rose">hole</span> It surrounds the empty triangle{holesInside.length === 1 ? '' : 's'}
				<TeX tex={holeList} />, so it bounds nothing here.
				{#if region.length > holesInside.length}
					It is <b class="g">homologous</b> to the rim{holesInside.length === 1 ? '' : 's'} of <TeX tex={holeList} />: together they bound the pale
					teal triangles in between.
				{/if}
			{/if}
		</div>
	</div>

	<Controls>
		<Segmented
			bind:value={mode}
			label="What a tap does"
			options={[
				{ value: 'loop', label: 'Tap edges: draw a loop' },
				{ value: 'fill', label: 'Tap triangles: fill / empty' }
			]}
		/>
		<div class="presets">
			{#each presets as p (p.label)}
				<Button variant="ghost" onclick={() => ((sel = rim(p.R)), (mode = 'loop'))}>{p.label}</Button>
			{/each}
			<Button variant="subtle" onclick={() => (sel = [])}>Clear loop</Button>
		</div>
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.6rem;
	}
	.readout {
		display: grid;
		gap: 0.45rem;
		padding: 0.4rem 1.2rem 0.85rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.3rem 1.2rem;
	}
	.holes {
		font-size: 1.15rem;
		color: var(--ink-bright);
	}
	.formula {
		color: var(--ink-faint);
		font-size: 0.95rem;
	}
	.status {
		min-height: 2.6rem;
		line-height: 1.55;
	}
	.badge {
		font-size: 0.68rem;
		font-weight: 650;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		margin-right: 0.35rem;
		border: 1px solid currentColor;
	}
	.badge.red {
		color: var(--red);
	}
	.badge.teal {
		color: #062320;
		background: var(--teal);
		border-color: transparent;
		box-shadow: 0 0 12px -2px rgba(95, 214, 207, 0.6);
	}
	.badge.rose {
		color: #2a0816;
		background: var(--rose);
		border-color: transparent;
		box-shadow: 0 0 12px -2px rgba(242, 141, 182, 0.6);
	}
	b.t {
		color: var(--teal);
	}
	b.g {
		color: var(--gold-bright);
	}
	.presets {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
</style>
