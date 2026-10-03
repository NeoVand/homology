<script lang="ts">
	// Figure: the Hodge decomposition of an edge flow on a complex with holes:
	// flow = gradient + curl + harmonic, computed by least squares. The harmonic
	// part lives in a space of dimension b₁ — one dimension per hole.
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import FlowPanel from './FlowPanel.svelte';
	import { hodgeDecompose } from '$lib/math/hodge';
	import { mulberry32 } from '$lib/math/persistence';
	import { annulus, twoHoles, type Planar } from './complexes';

	let shape = $state<'annulus' | 'two'>('annulus');
	let preset = $state<'swirl' | 'gradient' | 'vortex' | 'mixed' | 'random'>('mixed');
	let sign = $state<'+' | '−'>('+');

	const planar = $derived.by((): { P: Planar; pos: [number, number][]; vb: string; loops: number[][] } => {
		if (shape === 'annulus') {
			const P = annulus(10, 0, 0, 0.45, 1);
			const pos = P.pos.map(([x, y]) => [150 + 128 * x, 150 + 128 * y] as [number, number]);
			return { P, pos, vb: '6 6 288 288', loops: [Array.from({ length: 10 }, (_, i) => i)] };
		}
		const P = twoHoles();
		const pos = P.pos.map(([x, y]) => [20 + 52 * x, 20 + 52 * y] as [number, number]);
		const id = (i: number, j: number) => j * 7 + i;
		return {
			P,
			pos,
			vb: '0 0 352 196',
			loops: [
				[id(1, 1), id(2, 1), id(2, 2), id(1, 2)],
				[id(4, 1), id(5, 1), id(5, 2), id(4, 2)]
			]
		};
	});
	const K = $derived(planar.P.K);
	const edges = $derived(K.simplices[1]);

	function makeFlow(kind: typeof preset): number[] {
		const P = planar.P;
		const centres = P.holes;
		const swirl = edges.map(([a, b]) => {
			let s = 0;
			for (const c of centres) {
				const mx = (P.pos[a][0] + P.pos[b][0]) / 2 - c[0];
				const my = (P.pos[a][1] + P.pos[b][1]) / 2 - c[1];
				const r2 = mx * mx + my * my || 1;
				const dx = P.pos[b][0] - P.pos[a][0];
				const dy = P.pos[b][1] - P.pos[a][1];
				s += (-my * dx + mx * dy) / r2; // a discrete dθ around each hole
			}
			return s;
		});
		const h = P.pos.map(([x, y]) => 0.9 * x + 0.5 * y); // a height function
		const grad = edges.map(([a, b]) => h[b] - h[a]);
		const vort = new Array(edges.length).fill(0);
		const t = K.simplices[2][shape === 'annulus' ? 3 : 7];
		K.boundaryColumns(2)[K.indexOf(t)].forEach((s, e) => (vort[e] += s));
		const rnd = mulberry32(5);
		if (kind === 'swirl') return swirl;
		if (kind === 'gradient') return grad;
		if (kind === 'vortex') return vort;
		if (kind === 'random') return edges.map(() => Math.round((rnd() * 2 - 1) * 10) / 10);
		return swirl.map((x, i) => x + 0.7 * grad[i] + 0.9 * vort[i]);
	}
	let flow = $state<number[]>([]);
	$effect(() => {
		flow = makeFlow(preset).map((x) => Math.round(x * 100) / 100);
	});

	const parts = $derived(flow.length === edges.length ? hodgeDecompose(K, flow) : null);
	const scale = $derived(Math.max(1e-6, ...flow.map(Math.abs)));
	const sq = (v: number[]) => v.reduce((a, x) => a + x * x, 0);
	const E = $derived(
		parts
			? { total: sq(flow), g: sq(parts.gradient), c: sq(parts.curl), h: sq(parts.harmonic) }
			: { total: 0, g: 0, c: 0, h: 0 }
	);
	const b1 = $derived(shape === 'annulus' ? 1 : 2);

	function loopSum(v: number[], cyc: number[]) {
		let s = 0;
		for (let k = 0; k < cyc.length; k++) {
			const a = cyc[k];
			const b = cyc[(k + 1) % cyc.length];
			const e = K.indexOf([a, b]);
			if (e < 0) continue;
			s += a < b ? v[e] : -v[e];
		}
		return s;
	}
	const circ = $derived(parts ? planar.loops.map((c) => loopSum(parts.harmonic, c)) : []);
	const fmt = (x: number) => (Math.abs(x) < 0.005 ? '0' : x.toFixed(2).replace('-', '−'));

	function bump(i: number) {
		const d = sign === '+' ? 1 : -1;
		flow = flow.map((x, k) => (k === i ? Math.round((x + d) * 100) / 100 : x));
	}
	const pct = (x: number) => (E.total > 1e-12 ? (100 * x) / E.total : 0);
</script>

<div class="hodge">
	{#if parts}
		<div class="grid">
			<div class="main">
				<FlowPanel K={K} pos={planar.pos} {flow} {scale} viewBox={planar.vb} title="the flow" sym="f" color="#f2d08f" marker="gold" interactive onedge={bump} maxHeight={500} label="The edge flow; click an edge to add to it" />
			</div>
			<div class="parts">
				<FlowPanel K={K} pos={planar.pos} flow={parts.gradient} {scale} potential={parts.potential} viewBox={planar.vb} title="= gradient" sym={"\\delta_0 s"} color="#5fd6cf" marker="teal" maxHeight={170} label="The gradient part, with the potential shaded on vertices" />
				<FlowPanel K={K} pos={planar.pos} flow={parts.curl} {scale} circulation={parts.circulation} viewBox={planar.vb} title="+ curl" sym={"\\delta_1^{\\mathsf T}\\varphi"} color="#a493ff" marker="violet" maxHeight={170} label="The curl part, with circulation shaded on triangles" />
				<FlowPanel K={K} pos={planar.pos} flow={parts.harmonic} {scale} viewBox={planar.vb} title="+ harmonic" sym="h" color="#f28db6" marker="rose" maxHeight={170} label="The harmonic part" />
			</div>
		</div>

		<div class="energy ui">
			<div class="bar" role="img" aria-label="Energy split: gradient {pct(E.g).toFixed(0)} percent, curl {pct(E.c).toFixed(0)} percent, harmonic {pct(E.h).toFixed(0)} percent">
				<span class="seg g" style="width:{pct(E.g)}%"></span>
				<span class="seg c" style="width:{pct(E.c)}%"></span>
				<span class="seg h" style="width:{pct(E.h)}%"></span>
			</div>
			<div class="eq">
				<TeX tex={`\\|f\\|^2 = ${fmt(E.total)} \\;=\\; \\textcolor{#5fd6cf}{${fmt(E.g)}} + \\textcolor{#a493ff}{${fmt(E.c)}} + \\textcolor{#f28db6}{${fmt(E.h)}}`} />
			</div>
			<div class="facts">
				<span>harmonic flows form a space of dimension <TeX tex={`b_1 = ${b1}`} /></span>
				<span>circulation of the harmonic part around {circ.length > 1 ? 'the holes' : 'the hole'}: <b>{circ.map(fmt).join(', ')}</b></span>
			</div>
		</div>
	{/if}

	<Controls>
		<Segmented
			bind:value={shape}
			label="Complex"
			options={[
				{ value: 'annulus', label: 'Annulus (one hole)' },
				{ value: 'two', label: 'Two holes' }
			]}
		/>
		<Segmented
			bind:value={preset}
			label="Starting flow"
			options={[
				{ value: 'mixed', label: 'mixture' },
				{ value: 'swirl', label: 'swirl' },
				{ value: 'gradient', label: 'downhill' },
				{ value: 'vortex', label: 'vortex' },
				{ value: 'random', label: 'random' }
			]}
		/>
		<span class="ui lbl">click adds</span>
		<Segmented bind:value={sign} label="Click adds or subtracts one" options={[{ value: '+', label: '+1' }, { value: '−', label: '−1' }]} />
		<Button variant="subtle" onclick={() => (flow = flow.map(() => 0))}>Clear</Button>
	</Controls>
</div>

<style>
	.hodge {
		padding-top: 0.8rem;
	}
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
		gap: 0.6rem 1rem;
		padding: 0 1rem;
		align-items: center;
	}
	.parts {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.4rem;
	}
	@media (min-width: 900px) {
		.parts {
			grid-template-columns: minmax(0, 1fr);
		}
		.grid {
			grid-template-columns: minmax(0, 1.6fr) minmax(0, 0.8fr);
		}
	}
	@media (max-width: 640px) {
		.grid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.energy {
		padding: 0.6rem 1.2rem 0.6rem;
		display: grid;
		gap: 0.35rem;
		justify-items: center;
	}
	.bar {
		display: flex;
		width: min(100%, 34rem);
		height: 10px;
		border-radius: 6px;
		overflow: hidden;
		background: rgba(255, 255, 255, 0.06);
	}
	.seg {
		height: 100%;
		transition: width 0.4s var(--ease);
	}
	.seg.g {
		background: #5fd6cf;
	}
	.seg.c {
		background: #a493ff;
	}
	.seg.h {
		background: #f28db6;
	}
	.eq {
		font-size: 0.95rem;
	}
	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1.4rem;
		justify-content: center;
		font-size: 0.78rem;
		color: var(--ink-dim);
	}
	.facts b {
		color: var(--rose);
	}
	.lbl {
		font-size: 0.76rem;
		color: var(--ink-dim);
	}
</style>
