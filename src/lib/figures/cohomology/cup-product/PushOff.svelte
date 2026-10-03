<script lang="ts">
	// Torus versus Klein bottle, mod 2: try to slide a fence off itself.
	// On the torus every fence escapes (all squares vanish); on the Klein bottle
	// the fence through the twist cannot (β ⌣ β ≠ 0).
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import GluingSquare from '$lib/components/svg/GluingSquare.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { arcCrossings, type Pt } from './flat';
	import { boxMap, pathD } from './draw';
	import { cupSpaces } from './spaces';

	let which = $state<'alpha' | 'beta'>('beta');
	let eps = $state(0.16);

	const SZ = 220;
	const X = 50;
	const Y = 46;
	const panels = [
		{ id: 'torus', name: 'T^2', preset: 'torus' as const },
		{ id: 'klein', name: 'K', preset: 'klein' as const }
	];

	function curves(space: string, w: 'alpha' | 'beta', e: number): { F: Pt[][]; G: Pt[][]; exit?: Pt; entry?: Pt } {
		if (w === 'alpha') {
			const x = 0.42;
			return {
				F: [
					[
						[x, 0],
						[x, 1]
					]
				],
				G: [
					[
						[x + e, 0],
						[x + e, 1]
					]
				]
			};
		}
		if (space === 'torus') {
			const y = 0.58;
			const y2 = (((y - e) % 1) + 1) % 1;
			return {
				F: [
					[
						[1, y],
						[0, y]
					]
				],
				G: [
					[
						[1, y2],
						[0, y2]
					]
				],
				exit: [0, y2],
				entry: [1, y2]
			};
		}
		// Klein bottle: (0, y) is glued to (1, 1 − y)
		const y0 = 0.42;
		return {
			F: [
				[
					[0, y0],
					[1, 1 - y0]
				]
			],
			G: [
				[
					[0, y0 + e],
					[1, 1 - y0 - e]
				]
			],
			exit: [1, 1 - y0 - e],
			entry: [0, y0 + e]
		};
	}

	const map = boxMap(0, 1, 0, 1, X, Y, SZ, SZ);
	const data = $derived(
		panels.map((p) => {
			const c = curves(p.id, which, eps);
			return { ...p, ...c, cr: arcCrossings(c.F, c.G) };
		})
	);
	// the full mod-2 cup products, computed by front face × back face (spaces.ts)
	const all = cupSpaces();
	const forms: Record<string, number[][]> = {
		torus: all.find((x) => x.id === 'torus2')!.table,
		klein: all.find((x) => x.id === 'klein')!.table
	};
	const col = $derived(which === 'alpha' ? 'var(--gold-bright)' : 'var(--teal)');
	const formTeX = (name: string, F: number[][]) =>
		`${name}:\\quad \\begin{pmatrix} \\alpha^2 & \\alpha\\beta \\\\ \\beta\\alpha & \\beta^2 \\end{pmatrix} = \\begin{pmatrix} ${F[0][0]} & ${F[0][1]} \\\\ ${F[1][0]} & ${F[1][1]} \\end{pmatrix}`;
</script>

<div class="po">
	<div class="panels">
		{#each data as d (d.id)}
			<div class="panel">
				<Svg
					viewBox="0 0 320 352"
					maxHeight={360}
					label={d.id === 'torus'
						? 'The torus as a gluing square, with a fence and a dashed pushed-off copy that does not cross it.'
						: 'The Klein bottle as a gluing square, with the fence through the twisted gluing and a dashed pushed-off copy that crosses it once.'}
				>
					<defs>
						<filter id="po-glow-{d.id}" filterUnits="userSpaceOnUse" x="-40" y="-40" width="400" height="432">
							<feGaussianBlur stdDeviation="2.6" result="b" />
							<feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
						</filter>
					</defs>
					<GluingSquare preset={d.preset} x={X} y={Y} size={SZ} />
					<path d={pathD(d.F[0], map)} class="f" style="--c:{col}" filter="url(#po-glow-{d.id})" />
					<path d={pathD(d.G[0], map)} class="f push" style="--c:{col}" filter="url(#po-glow-{d.id})" />
					{#if d.exit && d.entry}
						{@const ex = map(d.exit)}
						{@const en = map(d.entry)}
						<circle cx={ex[0]} cy={ex[1]} r="4.5" class="gl" />
						<circle cx={en[0]} cy={en[1]} r="4.5" class="gl" />
					{/if}
					{#each d.cr as c, k (k)}
						{@const p = map(c.p)}
						<circle cx={p[0]} cy={p[1]} r="12" class="halo" />
						<circle cx={p[0]} cy={p[1]} r="5.5" class="dot" />
					{/each}
					<SvgTeX x={X + SZ / 2} y={Y + SZ + 48} tex={d.name} size={22} w={60} h={30} />
					<text x={X + SZ / 2} y={Y + SZ + 80} class="t-ui cnt" class:hit={d.cr.length % 2 === 1}
						>{d.cr.length} crossing{d.cr.length === 1 ? '' : 's'} → {which === 'alpha' ? 'α²' : 'β²'} = {d.cr.length % 2}</text
					>
				</Svg>
			</div>
		{/each}
	</div>
	<div class="ctl ui">
		<Segmented
			bind:value={which}
			label="Which fence to square"
			options={[
				{ value: 'alpha', label: 'square α (crosses a)' },
				{ value: 'beta', label: 'square β (crosses b)' }
			]}
		/>
		<Slider bind:value={eps} min={0.04} max={0.34} step={0.005} label="push the copy away" format={(v) => v.toFixed(2)} />
	</div>
	<div class="forms ui">
		{#each data as d (d.id)}
			<div class="form"><TeX tex={formTeX(d.name, forms[d.id])} /></div>
		{/each}
	</div>
</div>

<style>
	.panels {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.4rem 1rem;
		padding: 0.6rem 1rem 0.2rem;
	}
	@media (max-width: 560px) {
		.panels {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.f {
		fill: none;
		stroke: var(--c);
		stroke-width: 3;
		stroke-linecap: round;
	}
	.f.push {
		stroke-width: 2.4;
		stroke-dasharray: 8 6;
		opacity: 0.85;
	}
	.gl {
		fill: none;
		stroke: var(--ink-bright);
		stroke-width: 1.4;
		opacity: 0.8;
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
	.cnt {
		text-anchor: middle;
		font-size: 14px;
	}
	.cnt.hit {
		fill: var(--rose);
	}
	.ctl {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.8rem 1.4rem;
		padding: 0.8rem 1.2rem 0.6rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	.forms {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		gap: 0.6rem 1.4rem;
		padding: 0.5rem 1.2rem 1rem;
		background: rgba(5, 8, 16, 0.45);
		color: var(--ink-bright);
	}
</style>
