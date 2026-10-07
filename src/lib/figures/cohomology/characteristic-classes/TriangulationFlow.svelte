<script lang="ts">
	// Static figure: the vector field that proves Poincaré–Hopf. On a
	// triangulated surface, let everything flow away from the vertices (sources,
	// index +1), across the middles of the edges (saddles, index −1) and into the
	// middles of the faces (sinks, index +1). The indices add up to V − E + F.
	import Svg from '$lib/components/svg/Svg.svelte';

	const C: [number, number] = [320, 200];
	const Rh = 182;
	const ring = Array.from({ length: 6 }, (_, k) => {
		const t = (Math.PI / 3) * k + Math.PI / 6;
		return [C[0] + Rh * Math.cos(t), C[1] + Rh * Math.sin(t) * 0.92] as [number, number];
	});
	const verts: [number, number][] = [C, ...ring];
	const faces: [number, number, number][] = ring.map((_, k) => [0, 1 + k, 1 + ((k + 1) % 6)]);
	const edgeSet = new Map<string, [number, number]>();
	for (const [a, b, c] of faces)
		for (const [p, q] of [
			[a, b],
			[b, c],
			[a, c]
		]) {
			const key = p < q ? `${p},${q}` : `${q},${p}`;
			if (!edgeSet.has(key)) edgeSet.set(key, [Math.min(p, q), Math.max(p, q)]);
		}
	const edges = [...edgeSet.values()];
	const mid = (e: [number, number]) => [(verts[e[0]][0] + verts[e[1]][0]) / 2, (verts[e[0]][1] + verts[e[1]][1]) / 2] as [number, number];
	const cen = (f: [number, number, number]) =>
		[(verts[f[0]][0] + verts[f[1]][0] + verts[f[2]][0]) / 3, (verts[f[0]][1] + verts[f[1]][1] + verts[f[2]][1]) / 3] as [number, number];

	// arrows: vertex → edge midpoint (along the edge), edge midpoint → face centre
	function seg(a: [number, number], b: [number, number], shrinkA: number, shrinkB: number) {
		const dx = b[0] - a[0];
		const dy = b[1] - a[1];
		const l = Math.hypot(dx, dy);
		return {
			x1: a[0] + (dx / l) * shrinkA,
			y1: a[1] + (dy / l) * shrinkA,
			x2: b[0] - (dx / l) * shrinkB,
			y2: b[1] - (dy / l) * shrinkB
		};
	}
	const toMid = edges.flatMap((e) => [seg(verts[e[0]], mid(e), 17, 17), seg(verts[e[1]], mid(e), 17, 17)]);
	const toCen = faces.flatMap((f) =>
		edges
			.filter((e) => f.includes(e[0]) && f.includes(e[1]))
			.map((e) => seg(mid(e), cen(f), 16, 14))
	);

	// On a narrow plate the picture is cropped to the hexagon (so it is scaled down less),
	// its labels are a little larger, and the legend moves below it as text.
	let width = $state(640);
	const narrow = $derived(width > 0 && width < 520);
</script>

<div bind:clientWidth={width}>

<Svg viewBox={narrow ? '116 4 408 396' : '0 0 640 440'} maxHeight={460} label="A patch of a triangulated surface with a flow drawn on it: sources at the vertices, saddles at the midpoints of the edges, sinks at the centres of the triangles.">
	{#each faces as f, i (i)}
		<polygon points={f.map((v) => verts[v].join(',')).join(' ')} fill="rgba(164,147,255,0.08)" stroke="rgba(235,229,213,0.28)" stroke-width="1.3" />
	{/each}
	{#each toMid as a, i (i)}
		<line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="var(--gold)" stroke-width="2.2" marker-end="url(#arrow-gold)" opacity="0.9" />
	{/each}
	{#each toCen as a, i (i)}
		<line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="var(--teal)" stroke-width="2.2" marker-end="url(#arrow-teal)" opacity="0.9" />
	{/each}
	{#each verts as v, i (i)}
		<circle cx={v[0]} cy={v[1]} r="13.5" fill="rgba(6,10,20,0.9)" stroke="var(--gold-bright)" stroke-width="2.2" filter="url(#glow)" />
		<text x={v[0]} y={v[1] + 4.6} text-anchor="middle" class="lab gold" class:big={narrow}>+1</text>
	{/each}
	{#each edges as e, i (i)}
		{@const m = mid(e)}
		<rect x={m[0] - 11.5} y={m[1] - 11.5} width="23" height="23" rx="4.5" fill="rgba(6,10,20,0.9)" stroke="var(--teal)" stroke-width="2" transform="rotate(45 {m[0]} {m[1]})" />
		<text x={m[0]} y={m[1] + 4.4} text-anchor="middle" class="lab teal" class:big={narrow}>−1</text>
	{/each}
	{#each faces as f, i (i)}
		{@const c = cen(f)}
		<circle cx={c[0]} cy={c[1]} r="12" fill="rgba(164,147,255,0.3)" stroke="var(--violet)" stroke-width="2" />
		<text x={c[0]} y={c[1] + 4.4} text-anchor="middle" class="lab violet" class:big={narrow}>+1</text>
	{/each}
	<g class="legend" style:display={narrow ? 'none' : null}>
		<circle cx="60" cy="418" r="8" fill="none" stroke="var(--gold-bright)" stroke-width="2" />
		<text x="76" y="423" class="t-ui">VERTEX: SOURCE, +1</text>
		<rect x="245" y="410" width="15" height="15" rx="3" fill="none" stroke="var(--teal)" stroke-width="2" transform="rotate(45 252.5 417.5)" />
		<text x="269" y="423" class="t-ui">EDGE: SADDLE, −1</text>
		<circle cx="440" cy="418" r="8" fill="none" stroke="var(--violet)" stroke-width="2" />
		<text x="456" y="423" class="t-ui">FACE: SINK, +1</text>
	</g>
</Svg>
{#if narrow}
	<div class="legend-html ui">
		<span><i class="mk src"></i>vertex: source, +1</span>
		<span><i class="mk sad"></i>edge: saddle, −1</span>
		<span><i class="mk snk"></i>face: sink, +1</span>
	</div>
{/if}
</div>

<style>
	.lab {
		font-family: var(--font-ui);
		font-size: 12.5px;
		font-weight: 700;
	}
	.lab.big {
		font-size: 14px !important;
	}
	.legend-html {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.3rem 1rem;
		padding: 0.2rem 0.8rem 0.6rem;
		font-size: 0.72rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.legend-html span {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
	}
	.mk {
		display: inline-block;
		width: 0.7rem;
		height: 0.7rem;
		border: 2px solid;
		border-radius: 50%;
	}
	.mk.src {
		border-color: var(--gold-bright);
	}
	.mk.sad {
		border-color: var(--teal);
		border-radius: 2px;
		transform: rotate(45deg) scale(0.85);
	}
	.mk.snk {
		border-color: var(--violet);
	}
	.gold {
		fill: var(--gold-bright);
	}
	.teal {
		fill: var(--teal);
	}
	.violet {
		fill: #d4ccff;
	}
</style>
