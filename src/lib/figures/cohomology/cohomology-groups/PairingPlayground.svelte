<script lang="ts">
	// Figure: a cochain is a function on edges, extended to chains by linearity.
	// Build a chain by tapping edges; the readout evaluates the cochain on it.
	// With φ = δf, the pairing only sees the boundary of the chain (Stokes), so it
	// vanishes on every cycle.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import OGraphView from '$lib/figures/cohomology/cochains/OGraphView.svelte';
	import { gradient, signed, type Pt } from '$lib/figures/cohomology/cochains/graph';

	const pos: Pt[] = [
		[70, 214],
		[176, 70],
		[330, 82],
		[404, 222],
		[236, 252]
	];
	const edges: [number, number][] = [
		[0, 1],
		[1, 2],
		[2, 3],
		[0, 4],
		[3, 4],
		[1, 4],
		[2, 4]
	];
	const g = { n: 5, edges };
	const edgeName = (e: number) => `${edges[e][0]}${edges[e][1]}`;
	const f = [0, 2, 1, 4, 1];
	const phiFree = [3, 1, -2, 1, 1, 2, -2];
	const phiExact = gradient(g, f);

	let which = $state<'free' | 'exact'>('free');
	let c = $state<number[]>([1, 1, 1, 0, 0, 0, 0]);
	let sel = $state<number | null>(2);
	const phi = $derived(which === 'free' ? phiFree : phiExact);

	const boundary = $derived.by(() => {
		const b = new Array(5).fill(0);
		edges.forEach(([t, h], e) => {
			b[h] += c[e];
			b[t] -= c[e];
		});
		return b;
	});
	const isCycle = $derived(boundary.every((x) => x === 0));
	const isZeroChain = $derived(c.every((x) => x === 0));
	const value = $derived(c.reduce((s, x, e) => s + x * phi[e], 0));

	const term = (coef: number, body: string, first: boolean) => {
		const sign = coef < 0 ? '-' : first ? '' : '+';
		const a = Math.abs(coef);
		return `${sign} ${a === 1 ? '' : a}${body}`;
	};
	const chainTeX = $derived.by(() => {
		const parts: string[] = [];
		c.forEach((x, e) => {
			if (x) parts.push(term(x, `[${edges[e][0]},${edges[e][1]}]`, parts.length === 0));
		});
		return 'c = ' + (parts.length ? parts.join(' ') : '0');
	});
	const pairTeX = $derived.by(() => {
		const parts: string[] = [];
		c.forEach((x, e) => {
			if (!x) return;
			const p = phi[e];
			const pv = p < 0 ? `(${p})` : String(p);
			parts.push((parts.length === 0 ? (x < 0 ? '-' : '') : x < 0 ? '-' : '+') + ` ${Math.abs(x) === 1 ? '' : Math.abs(x) + '\\cdot'}${pv}`);
		});
		return `\\langle \\varphi, c\\rangle = ` + (parts.length ? parts.join(' ') + ' = ' : '') + value;
	});
	const bdTeX = $derived.by(() => {
		const parts: string[] = [];
		boundary.forEach((x, v) => {
			if (x) parts.push(term(x, `[${v}]`, parts.length === 0));
		});
		return '\\partial c = ' + (parts.length ? parts.join(' ') : '0');
	});
	const stokesTeX = $derived.by(() => {
		const parts: string[] = [];
		boundary.forEach((x, v) => {
			if (x) parts.push((parts.length === 0 ? (x < 0 ? '-' : '') : x < 0 ? '-' : '+') + ` ${Math.abs(x) === 1 ? '' : Math.abs(x) + '\\cdot'}${f[v]}`);
		});
		return `\\langle \\delta f, c\\rangle = \\langle f, \\partial c\\rangle = ` + (parts.length ? parts.join(' ') + ' = ' : '') + value;
	});

	function nudge(d: number) {
		if (sel === null) return;
		c[sel] += d;
	}
	const presets: { label: string; c: number[] }[] = [
		{ label: 'A path 0 → 3', c: [1, 1, 1, 0, 0, 0, 0] },
		{ label: 'A loop', c: [1, 0, 0, -1, 0, 1, 0] },
		{ label: 'Another loop', c: [0, 1, 0, 0, 0, -1, 1] },
		{ label: 'Clear', c: [0, 0, 0, 0, 0, 0, 0] }
	];
</script>

<Controls>
	<Segmented
		bind:value={which}
		options={[
			{ value: 'free', label: 'φ: any cochain' },
			{ value: 'exact', label: 'φ = δf: a coboundary' }
		]}
		label="Which cochain"
	/>
</Controls>
<div class="pp">
	<Svg viewBox="30 30 420 260" maxHeight={360} label="A graph with a cochain on its edges and a chain built by tapping edges">
		<OGraphView
			{pos}
			{edges}
			vertexRadius={12}
			vertexText={(v) => String(v)}
			vertexLabel={(v) => (which === 'exact' ? `f = ${f[v]}` : boundary[v] ? `∂: ${signed(boundary[v])}` : null)}
			vertexLabelColor={() => (which === 'exact' ? 'var(--teal)' : 'var(--violet)')}
			edgeColor={(e) => (c[e] ? 'var(--violet)' : 'rgba(206,198,176,0.42)')}
			edgeWidth={(e) => (c[e] ? 2.4 + 1.6 * Math.min(3, Math.abs(c[e])) : 2.2)}
			edgeLabel={(e) => signed(phi[e], false)}
			edgeLabelColor={() => (which === 'exact' ? 'var(--teal)' : 'var(--gold-bright)')}
			edgeLabel2={(e) => (c[e] ? `×${signed(c[e], false)}` : null)}
			edgeLabel2Color={() => 'var(--violet)'}
			selectedEdge={sel}
			clickEdge={true}
			onedge={(e) => (sel = e)}
		/>
	</Svg>
</div>
<Controls>
	<div class="row">
		<span class="ui lbl">Edge {sel === null ? '—' : `[${edges[sel][0]},${edges[sel][1]}]`} in the chain:</span>
		<Button onclick={() => nudge(-1)} disabled={sel === null}>−1</Button>
		<Button onclick={() => nudge(1)} disabled={sel === null}>+1</Button>
		<span class="sp"></span>
		{#each presets as p (p.label)}
			<Button variant="subtle" onclick={() => (c = [...p.c])}>{p.label}</Button>
		{/each}
	</div>
	<div class="read ui">
		<div class="line chain"><TeX tex={chainTeX} /></div>
		<div class="line val"><TeX tex={pairTeX} /></div>
		<div class="line">
			<TeX tex={bdTeX} />
			{#if isCycle && !isZeroChain}<span class="tag cyc">a cycle</span>{/if}
		</div>
		{#if which === 'exact'}
			<div class="line stokes"><TeX tex={stokesTeX} /></div>
		{/if}
	</div>
</Controls>

<style>
	.pp {
		padding: 0.5rem 0.6rem 0.2rem;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.6rem;
		width: 100%;
	}
	.lbl {
		font-size: 0.8rem;
		color: var(--ink-dim);
	}
	.sp {
		flex: 1;
	}
	.read {
		width: 100%;
		border-top: 1px solid var(--line-faint);
		padding-top: 0.6rem;
		display: grid;
		gap: 0.3rem;
		font-size: 0.95rem;
	}
	.line {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		flex-wrap: wrap;
		overflow-x: auto;
	}
	.chain {
		color: var(--violet);
	}
	.val {
		color: var(--gold-bright);
	}
	.stokes {
		color: var(--teal);
	}
	.tag {
		font-size: 0.7rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		border-radius: 999px;
		padding: 0.05rem 0.5rem;
	}
	.cyc {
		color: var(--gold-bright);
		border: 1px solid rgba(242, 208, 143, 0.5);
	}
</style>
