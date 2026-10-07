<script lang="ts">
	// Figure: three Δ-complexes — more relaxed gluings that are not simplicial
	// complexes: a circle from one edge, a sphere from two triangles with the same
	// corners, and the torus from two triangles (as in Hatcher's book).
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import GluingSquare from '$lib/components/svg/GluingSquare.svelte';

	type P = [number, number];
	/** a chevron at the middle of segment ab, pointing from a to b */
	function chev(a: P, b: P, s = 7): string {
		const mx = (a[0] + b[0]) / 2;
		const my = (a[1] + b[1]) / 2;
		const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
		const ux = (b[0] - a[0]) / L;
		const uy = (b[1] - a[1]) / L;
		return `M ${mx - ux * s - uy * s * 0.85} ${my - uy * s + ux * s * 0.85} L ${mx + ux * s * 0.35} ${my + uy * s * 0.35} L ${mx - ux * s + uy * s * 0.85} ${my - uy * s - ux * s * 0.85}`;
	}
	const sphereTri = (ox: number): P[] => [
		[ox + 15, 150],
		[ox + 95, 150],
		[ox + 55, 62]
	];
	const edgeCols = ['var(--gold-bright)', 'var(--teal)', 'var(--violet)'];
	// edges [0,1], [1,2], [0,2], always pointing from the smaller label to the larger
	const sides: [number, number][] = [
		[0, 1],
		[1, 2],
		[0, 2]
	];
</script>

<div class="grid">
	<div class="cell">
		<Svg viewBox="0 0 200 190" maxHeight={200} label="A circle made of one vertex and one edge whose two ends are glued to that vertex">
			<circle cx="100" cy="88" r="58" class="loop" />
			<path d={chev([158, 96], [158, 80], 8)} class="chev" style="stroke:var(--gold-bright)" />
			<circle cx="100" cy="146" r="7" class="v" />
			<SvgTeX x={100} y={170} tex="v" size={17} />
			<SvgTeX x={178} y={88} tex="a" size={18} color="var(--gold-bright)" w={30} h={28} />
		</Svg>
		<div class="t ui">A circle</div>
		<div class="c ui">1 vertex, 1 edge</div>
	</div>
	<div class="cell">
		<Svg viewBox="0 0 220 190" maxHeight={200} label="A sphere made of two triangles glued along their whole boundaries">
			{#each [0, 110] as ox, k (k)}
				{@const T = sphereTri(ox)}
				<polygon points={T.map((p) => p.join(',')).join(' ')} class="tri" class:second={k === 1} />
				{#each sides as [i, j], s (s)}
					<line x1={T[i][0]} y1={T[i][1]} x2={T[j][0]} y2={T[j][1]} class="e" style="stroke:{edgeCols[s]}" />
					<path d={chev(T[i], T[j])} class="chev" style="stroke:{edgeCols[s]}" />
				{/each}
				{#each T as p, i (i)}
					<circle cx={p[0]} cy={p[1]} r="5.5" class="v" />
					<!-- straight below (or above) its corner: an outward nudge would set the first triangle's 1 against the second's 0 -->
					<SvgTeX x={p[0]} y={p[1] + (i === 2 ? -15 : 17)} tex={String(i)} size={14} w={24} h={22} />
				{/each}
			{/each}
		</Svg>
		<div class="t ui">A sphere</div>
		<div class="c ui">3 vertices, 3 edges, and 2 triangles with the same three corners</div>
	</div>
	<div class="cell">
		<Svg viewBox="0 0 220 190" maxHeight={200} label="The torus as a square with opposite sides glued, cut by one diagonal into two triangles; all four corners are one vertex">
			<GluingSquare preset="torus" x={50} y={30} size={120} corners />
			<line x1="50" y1="150" x2="170" y2="30" class="e" style="stroke:var(--violet)" />
			<path d={chev([50, 150], [170, 30])} class="chev" style="stroke:var(--violet)" />
			<SvgTeX x={124} y={82} tex="c" size={17} color="var(--violet)" w={24} h={24} />
			<SvgTeX x={82} y={66} tex="U" size={16} color="var(--ink-dim)" w={24} h={24} />
			<SvgTeX x={138} y={120} tex="L" size={16} color="var(--ink-dim)" w={24} h={24} />
		</Svg>
		<div class="t ui">A torus</div>
		<div class="c ui">1 vertex, 3 edges, 2 triangles</div>
	</div>
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.6rem;
		padding: 1rem 1rem 0.9rem;
	}
	.cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}
	.loop {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 2.6;
	}
	.chev {
		fill: none;
		stroke-width: 2.4;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.tri {
		fill: rgba(116, 169, 255, 0.12);
	}
	.tri.second {
		fill: rgba(164, 147, 255, 0.14);
	}
	.e {
		stroke-width: 2.6;
		stroke-linecap: round;
	}
	.v {
		fill: url(#vertex-fill);
		stroke: #060912;
		stroke-width: 1.2;
	}
	.t {
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--ink-bright);
		margin-top: 0.2rem;
	}
	.c {
		font-size: 0.74rem;
		color: var(--ink-faint);
		max-width: 15rem;
	}
	@media (max-width: 560px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
