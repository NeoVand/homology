<script lang="ts">
	// Figure 3.2.4 — orientation and signs. Left: an oriented edge; flipping it
	// negates it, and ∂ = head − tail. Right: an oriented triangle written in any
	// of its six vertex orders, times an integer c; the boundary formula gives
	// arrows that always run around the triangle in its sense of rotation.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import GraphCanvas from '../cycles-and-boundaries/GraphCanvas.svelte';
	import { orderedBoundary, orderedBoundaryTerms, permSign } from './chains';

	// left panel: one edge
	const ePos: [number, number][] = [
		[44, 168],
		[196, 168]
	];
	let flipped = $state(false);
	const head = $derived(flipped ? 0 : 1);
	const tail = $derived(flipped ? 1 : 0);

	// right panel: one triangle, 0 bottom-left, 1 bottom-right, 2 top
	const tPos: [number, number][] = [
		[322, 252],
		[522, 252],
		[422, 78]
	];
	const tEdges: [number, number][] = [
		[0, 1],
		[0, 2],
		[1, 2]
	];
	const orders = [
		[0, 1, 2],
		[1, 2, 0],
		[2, 0, 1],
		[1, 0, 2],
		[0, 2, 1],
		[2, 1, 0]
	];
	let w = $state([0, 1, 2]);
	let c = $state(1);

	const sign = $derived(permSign(w));
	const bd = $derived(orderedBoundary(w)); // sorted edge key → ±1
	const coef = (i: number) => c * (bd.get(tEdges[i].join(',')) ?? 0);
	const eff = $derived(sign * Math.sign(c)); // +1: anticlockwise on screen
	const cx = (tPos[0][0] + tPos[1][0] + tPos[2][0]) / 3;
	const cy = (tPos[0][1] + tPos[1][1] + tPos[2][1]) / 3 + 10;

	const wTeX = $derived(`[${w.join(',')}]`);
	const cTeX = $derived(c === 1 ? '' : c === -1 ? '-' : String(c));
	const termsTeX = $derived(
		orderedBoundaryTerms(w)
			.map((t, i) => `${i === 0 ? '' : t.sign > 0 ? ' + ' : ' - '}[${t.face.join(',')}]`)
			.join('')
	);
	const fmt = (n: number) => (n > 0 ? `+${n}` : `${n}`);
	const normTeX = $derived.by(() => {
		const parts: string[] = [];
		for (const [i, e] of tEdges.entries()) {
			const k = coef(i);
			if (!k) continue;
			const mag = Math.abs(k) === 1 ? '' : String(Math.abs(k));
			parts.push(`${parts.length === 0 ? (k < 0 ? '-' : '') : k < 0 ? ' - ' : ' + '}${mag}\\bdy{[${e.join(',')}]}`);
		}
		return parts.length ? parts.join('') : '0';
	});
	const signWord = $derived(sign > 0 ? 'same' : 'opposite');
</script>

<div class="wrap">
	<div class="panels">
	<div class="pane edgepane">
	<Svg viewBox="0 40 240 230" maxHeight={300} label="An edge between vertices 0 and 1 with an arrow; its head is marked plus and its tail minus.">
		<!-- left: the edge -->
		<GraphCanvas
			pos={ePos}
			edges={[[0, 1]]}
			edgeLook={() => ({ color: 'var(--violet)', width: 4, glow: true, arrow: flipped ? -1 : 1 })}
			vertexLook={(v) => ({
				label: String(v),
				labelOffset: [0, 26],
				ring: v === head ? 'var(--teal)' : 'var(--rose)',
				glow: true
			})}
		/>
		<SvgTeX x={ePos[head][0]} y={128} tex="+" size={22} color="var(--teal)" />
		<SvgTeX x={ePos[tail][0]} y={128} tex="-" size={22} color="var(--rose)" />
		<SvgTeX x={120} y={70} tex={flipped ? String.raw`\chn{[1,0] = -[0,1]}` : String.raw`\chn{[0,1]}`} size={18} w={220} />
		<SvgTeX
			x={120}
			y={236}
			tex={flipped ? String.raw`\partial[1,0] = \bdy{0 - 1}` : String.raw`\partial[0,1] = \bdy{1 - 0}`}
			size={17}
			w={220}
		/>
	</Svg>
	</div>
	<div class="pane tripane">
	<Svg viewBox="280 40 290 260" maxHeight={300} label="A triangle 0 1 2 with arrows and coefficients on its edges and a circular arrow showing its orientation.">
		<!-- right: the triangle -->
		<polygon points={tPos.map((p) => p.join(',')).join(' ')} class="tri" style="fill-opacity:{Math.min(0.5, 0.16 + 0.11 * Math.abs(c))}" />
		{#if c !== 0}
			{@const r = 30}
			<path
				d={eff > 0
					? `M ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx} ${cy + r}`
					: `M ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx + r} ${cy}`}
				class="spin"
				marker-end="url(#arrow-violet)"
			/>
		{/if}
		<GraphCanvas
			pos={tPos}
			edges={tEdges}
			edgeLook={(i) => {
				const k = coef(i);
				return k
					? { color: 'var(--teal)', width: 2.6 + 1.1 * Math.abs(k), glow: true, arrow: k > 0 ? 1 : -1, label: fmt(k), labelColor: 'var(--teal)', labelSide: i === 1 ? -1 : 1 }
					: { color: 'rgba(206,198,176,0.35)', width: 2 };
			}}
			vertexLook={(v) => ({ label: String(v), labelOffset: v === 2 ? [0, -24] : v === 0 ? [-20, 14] : [20, 14] })}
		/>
	</Svg>
	</div>
	</div>

	<div class="readout ui" aria-live="polite">
		<div class="line">
			<TeX tex={String.raw`\chn{${cTeX}${wTeX}} = ${sign * c === 1 ? '' : sign * c === -1 ? '-' : sign * c}\chn{[0,1,2]}`} />
			<span class="note">— the order {w.join(', ')} has the <b>{signWord}</b> orientation as 0, 1, 2 ({sign > 0 ? 'an even' : 'an odd'} number of swaps).</span>
		</div>
		<div class="line">
			<TeX tex={String.raw`\partial${wTeX} = ${termsTeX}`} />
			<span class="note">(the formula, term by term)</span>
		</div>
		<div class="line">
			<TeX tex={String.raw`\partial(${cTeX === '' ? '' : cTeX === '-' ? '-' : cTeX + '\\,'}${wTeX}) = ${normTeX}`} />
			<span class="note">(every edge rewritten in increasing order)</span>
		</div>
	</div>

	<Controls>
		<Button variant="ghost" onclick={() => (flipped = !flipped)}>Flip the edge</Button>
		<div class="orders" role="group" aria-label="Vertex order of the triangle">
			{#each orders as o (o.join(''))}
				<button class="chip" class:on={o.join('') === w.join('')} class:odd={permSign(o) < 0} onclick={() => (w = o)}>[{o.join(',')}]</button>
			{/each}
		</div>
		<Slider bind:value={c} min={-3} max={3} step={1} label="Multiply by c" format={(v) => (v > 0 ? `+${v}` : `${v}`)} />
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.6rem;
	}
	.panels {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: center;
		gap: 0 1.5rem;
		padding: 0 0.8rem;
	}
	.edgepane {
		flex: 1 1 200px;
		max-width: 260px;
	}
	.tripane {
		flex: 1 1 240px;
		max-width: 330px;
	}
	.tri {
		fill: var(--violet);
		stroke: none;
	}
	.spin {
		fill: none;
		stroke: var(--violet);
		stroke-width: 2;
	}
	.readout {
		display: grid;
		gap: 0.3rem;
		padding: 0.4rem 1.2rem 0.8rem;
		font-size: 0.84rem;
		color: var(--ink-dim);
	}
	.line {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.2rem 0.6rem;
		font-size: 1rem;
		color: var(--ink-bright);
	}
	.note {
		font-size: 0.8rem;
		color: var(--ink-faint);
	}
	.note b {
		color: var(--ink-bright);
	}
	.orders {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}
	.chip {
		min-height: 2.1rem;
		padding: 0.15rem 0.6rem;
		border-radius: 8px;
		border: 1px solid rgba(164, 147, 255, 0.4);
		background: rgba(164, 147, 255, 0.07);
		color: var(--violet);
		font-family: var(--font-mono);
		font-size: 0.78rem;
		cursor: pointer;
	}
	.chip.odd {
		border-style: dashed;
	}
	.chip.on {
		background: var(--violet);
		color: #160f33;
		border-color: transparent;
		font-weight: 700;
	}
</style>
