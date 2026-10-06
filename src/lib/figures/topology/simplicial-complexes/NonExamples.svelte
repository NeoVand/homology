<script lang="ts">
	// Figure: which pictures obey the two rules of a simplicial complex?
	import Svg from '$lib/components/svg/Svg.svelte';
	import Mark from '$lib/components/ui/Mark.svelte';

	type P = [number, number];
	interface Panel {
		ok: boolean;
		title: string;
		why: string;
		tris: P[][];
		edges?: [P, P][];
		missing?: [P, P][];
		bad?: P[];
		overlap?: P[];
		verts: P[];
	}
	const panels: Panel[] = [
		{
			ok: true,
			title: 'Glued along an edge',
			why: 'They meet in a whole common edge.',
			tris: [
				[
					[30, 130],
					[110, 130],
					[70, 40]
				],
				[
					[110, 130],
					[150, 40],
					[70, 40]
				]
			],
			verts: [
				[30, 130],
				[110, 130],
				[70, 40],
				[150, 40]
			]
		},
		{
			ok: true,
			title: 'Glued at a corner',
			why: 'They meet in a single common vertex.',
			tris: [
				[
					[24, 120],
					[90, 85],
					[30, 45]
				],
				[
					[90, 85],
					[160, 120],
					[150, 40]
				]
			],
			verts: [
				[24, 120],
				[90, 85],
				[30, 45],
				[160, 120],
				[150, 40]
			]
		},
		{
			ok: false,
			title: 'A missing edge',
			why: 'Rule 1 fails: a face of the triangle is not in the list.',
			tris: [
				[
					[40, 130],
					[150, 130],
					[95, 38]
				]
			],
			missing: [
				[
					[40, 130],
					[95, 38]
				]
			],
			verts: [
				[40, 130],
				[150, 130],
				[95, 38]
			]
		},
		{
			ok: false,
			title: 'A corner on an edge',
			why: 'Rule 2 fails: they meet in a point that is a vertex of one but not of the other.',
			tris: [
				[
					[20, 130],
					[100, 130],
					[60, 40]
				],
				[
					[80, 85],
					[160, 130],
					[150, 45]
				]
			],
			bad: [[80, 85]],
			verts: [
				[20, 130],
				[100, 130],
				[60, 40],
				[80, 85],
				[160, 130],
				[150, 45]
			]
		},
		{
			ok: false,
			title: 'Overlapping triangles',
			why: 'Rule 2 fails: they share a whole region that is not a face of either.',
			tris: [
				[
					[25, 130],
					[120, 130],
					[60, 40]
				],
				[
					[70, 95],
					[165, 115],
					[135, 35]
				]
			],
			overlap: [
				[70, 95],
				[101.0, 101.5],
				[86.5, 79.8]
			],
			bad: [[85.8, 92.1]],
			verts: [
				[25, 130],
				[120, 130],
				[60, 40],
				[70, 95],
				[165, 115],
				[135, 35]
			]
		},
		{
			ok: false,
			title: 'Edges that cross',
			why: 'Rule 2 fails: two edges meet at a point that is not a vertex.',
			tris: [],
			edges: [
				[
					[35, 125],
					[155, 45]
				],
				[
					[40, 45],
					[150, 130]
				]
			],
			bad: [[93.3, 86.2]],
			verts: [
				[35, 125],
				[155, 45],
				[40, 45],
				[150, 130]
			]
		}
	];
</script>

<div class="grid">
	{#each panels as pnl, i (i)}
		<div class="cell" class:bad={!pnl.ok}>
			<Svg viewBox="0 0 190 160" maxHeight={170} label="{pnl.title}: {pnl.ok ? 'allowed' : 'not allowed'}. {pnl.why}">
				{#each pnl.tris as t, j (j)}
					<polygon points={t.map((q) => q.join(',')).join(' ')} class="tri" class:second={j === 1} />
				{/each}
				{#if pnl.overlap}
					<polygon points={pnl.overlap.map((q) => q.join(',')).join(' ')} class="ov" />
				{/if}
				{#each pnl.tris as t, j (j)}
					{#each [0, 1, 2] as a (a)}
						{@const p = t[a]}
						{@const q = t[(a + 1) % 3]}
						{@const isMissing =
							pnl.missing?.some(
								([m1, m2]) =>
									(m1.join() === p.join() && m2.join() === q.join()) || (m1.join() === q.join() && m2.join() === p.join())
							) ?? false}
						<line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} class="edge" class:missing={isMissing} />
					{/each}
				{/each}
				{#each pnl.edges ?? [] as [p, q], j (j)}
					<line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} class="edge solo" />
				{/each}
				{#each pnl.verts as v, j (j)}
					<circle cx={v[0]} cy={v[1]} r="4.5" class="v" />
				{/each}
				{#each pnl.bad ?? [] as b, j (j)}
					<circle cx={b[0]} cy={b[1]} r="11" class="badmark" />
				{/each}
			</Svg>
			<div class="lbl ui">
				<span class="mark"><Mark ok={pnl.ok} /></span>
				<span class="t">{pnl.title}</span>
			</div>
			<div class="why">{pnl.why}</div>
		</div>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.4rem 0.8rem;
		padding: 1rem 1rem 0.8rem;
	}
	.cell {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5rem 0.4rem 0.7rem;
		border-radius: 10px;
		background: rgba(132, 217, 162, 0.04);
		border: 1px solid rgba(132, 217, 162, 0.16);
	}
	.cell.bad {
		background: rgba(242, 141, 182, 0.04);
		border-color: rgba(242, 141, 182, 0.18);
	}
	.tri {
		fill: rgba(116, 169, 255, 0.14);
	}
	.tri.second {
		fill: rgba(164, 147, 255, 0.16);
	}
	.ov {
		fill: rgba(242, 141, 182, 0.45);
	}
	.edge {
		stroke: rgba(235, 229, 213, 0.75);
		stroke-width: 2;
		stroke-linecap: round;
	}
	.edge.missing {
		stroke: var(--amber);
		stroke-dasharray: 3 5;
		stroke-width: 2.2;
	}
	.edge.solo {
		stroke: rgba(235, 229, 213, 0.85);
	}
	.v {
		fill: url(#vertex-fill);
		stroke: #060912;
		stroke-width: 1;
	}
	.badmark {
		fill: none;
		stroke: var(--rose);
		stroke-width: 2;
		filter: url(#glow);
	}
	.lbl {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--ink-bright);
		margin-top: 0.2rem;
	}
	.mark {
		color: var(--green);
		font-size: 0.95rem;
	}
	.bad .mark {
		color: var(--rose);
	}
	.why {
		font-size: 0.74rem;
		line-height: 1.4;
		color: var(--ink-faint);
		text-align: center;
		font-family: var(--font-ui);
		margin-top: 0.15rem;
	}
	@media (max-width: 640px) {
		.grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			padding: 0.8rem 0.6rem;
		}
	}
</style>
