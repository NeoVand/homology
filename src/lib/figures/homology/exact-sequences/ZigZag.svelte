<script lang="ts">
	// The connecting homomorphism, chased step by step through the short exact
	// sequence of chain complexes 0 → C(A) → C(X) → C(X, A) → 0 for X = a filled
	// triangle and A = its boundary circle. Every cell shows an actual chain.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';

	let step = $state(0);
	const labels = ['The diagram', 'Start: a relative cycle', 'Lift it', 'Take its boundary', 'It dies in C₁(X, A)', 'So it comes from A', 'The answer'];
	const notes = [
		String.raw`\text{Each row } 0 \to C_n(A) \xrightarrow{\,i\,} C_n(X) \xrightarrow{\,j\,} C_n(X,A) \to 0 \text{ is exact.}`,
		String.raw`c = [012] \in C_2(X,A):\ \partial c \text{ lies in } A, \text{ so } c \text{ is a relative cycle.}`,
		String.raw`\text{Lift: } b = [012] \in C_2(X) \text{ with } j(b) = c.`,
		String.raw`\partial b = [12] - [02] + [01] \in C_1(X).`,
		String.raw`j(\partial b) = \partial(jb) = \partial c = 0 \text{ in } C_1(X,A).`,
		String.raw`\text{Exactness: } \partial b = i(a) \text{ for a unique } a = [01]+[12]-[02] \in C_1(A).`,
		String.raw`\partial_*[c] = [a]:\quad H_2(X,A) \xrightarrow{\ \cong\ } H_1(A) \cong \mathbb Z.`
	];

	const colX = [100, 300, 500];
	const rowY = [92, 252];
	const W = 156;
	const H = 116;
	// a small triangle inside a cell
	const tri = (cx: number, cy: number) => [
		[cx - 34, cy + 26],
		[cx + 34, cy + 26],
		[cx, cy - 30]
	];
	const pts = (p: number[][]) => p.map((q) => q.join(',')).join(' ');

	type CellState = { fill?: boolean; loop?: boolean; zero?: boolean; faint?: boolean };
	const cells = $derived.by(() => {
		const s: Record<string, CellState> = {};
		if (step >= 1) s['0-2'] = { fill: true };
		if (step >= 2) s['0-1'] = { fill: true };
		if (step >= 3) s['1-1'] = { loop: true };
		if (step >= 4) s['1-2'] = { zero: true };
		if (step >= 5) s['1-0'] = { loop: true };
		return s;
	});
	const groupTeX: Record<string, string> = {
		'0-0': 'C_2(A) = 0',
		'0-1': 'C_2(X) = \\mathbb Z',
		'0-2': 'C_2(X,A) = \\mathbb Z',
		'1-0': 'C_1(A) = \\mathbb Z^3',
		'1-1': 'C_1(X) = \\mathbb Z^3',
		'1-2': 'C_1(X,A) = 0'
	};
	// which cells take part: drawn complex is A (boundary only), X, or X/A (faint boundary)
	const kind = ['A', 'X', 'XA'];
	/** a counterclockwise (on screen) three-quarter circle: the orientation of [012] */
	function swirl(cx: number, cy: number, r: number) {
		const out: string[] = [];
		for (let i = 0; i <= 20; i++) {
			const t = ((200 + (270 * i) / 20) * Math.PI) / 180;
			out.push(`${(cx + r * Math.cos(t)).toFixed(1)},${(cy - r * Math.sin(t)).toFixed(1)}`);
		}
		return 'M ' + out.join(' L ');
	}
	function chevron(a: number[], b: number[]) {
		const mx = (a[0] + b[0]) / 2;
		const my = (a[1] + b[1]) / 2;
		const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
		const ux = (b[0] - a[0]) / L;
		const uy = (b[1] - a[1]) / L;
		return `M ${mx - ux * 5 - uy * 4} ${my - uy * 5 + ux * 4} L ${mx + ux * 3} ${my + uy * 3} L ${mx - ux * 5 + uy * 4} ${my - uy * 5 - ux * 4}`;
	}
</script>

<div class="zig">
	<Svg viewBox="0 0 600 350" maxHeight={420} label="A three-by-two grid of chain groups; a highlighted path zig-zags from the relative 2-chain to the boundary loop in A">
		<!-- column headers -->
		{#each ['A', 'X', '(X,A)'] as h, c (h)}
			<SvgTeX x={colX[c]} y={18} tex={h} size={17} color="var(--ink-dim)" w={80} h={24} />
		{/each}
		<!-- horizontal maps -->
		{#each rowY as y, r (r)}
			<line x1={colX[0] + W / 2 + 4} y1={y} x2={colX[1] - W / 2 - 4} y2={y} class="arr" marker-end="url(#arrow-ivory)" />
			<line x1={colX[1] + W / 2 + 4} y1={y} x2={colX[2] - W / 2 - 4} y2={y} class="arr" marker-end="url(#arrow-ivory)" />
			<SvgTeX x={(colX[0] + colX[1]) / 2} y={y - 10} tex={'i'} size={14} color="var(--ink-dim)" w={20} h={20} />
			<SvgTeX x={(colX[1] + colX[2]) / 2} y={y - 10} tex={'j'} size={14} color="var(--ink-dim)" w={20} h={20} />
		{/each}
		<!-- vertical boundary maps -->
		{#each colX as x, c (c)}
			<line x1={x} y1={rowY[0] + H / 2 + 4} x2={x} y2={rowY[1] - H / 2 - 4} class="arr" marker-end="url(#arrow-ivory)" />
			<SvgTeX x={x + 14} y={(rowY[0] + rowY[1]) / 2} tex={'\\partial'} size={14} color="var(--ink-dim)" w={20} h={20} />
		{/each}

		<!-- the zig-zag path -->
		{#if step >= 2}
			<path d="M {colX[2] - W / 2 - 2} {rowY[0] + 20} L {colX[1] + W / 2 + 2} {rowY[0] + 20}" class="zz" marker-end="url(#arrow-gold)" />
		{/if}
		{#if step >= 3}
			<path d="M {colX[1] - 22} {rowY[0] + H / 2 + 2} L {colX[1] - 22} {rowY[1] - H / 2 - 2}" class="zz" marker-end="url(#arrow-gold)" />
		{/if}
		{#if step >= 5}
			<path d="M {colX[1] - W / 2 - 2} {rowY[1] + 20} L {colX[0] + W / 2 + 2} {rowY[1] + 20}" class="zz" marker-end="url(#arrow-gold)" />
		{/if}

		<!-- cells -->
		{#each rowY as y, r (r)}
			{#each colX as x, c (c)}
				{@const key = `${r}-${c}`}
				{@const st = cells[key] ?? {}}
				{@const T = tri(x, y + 6)}
				{@const active = !!(st.fill || st.loop || st.zero)}
				<rect x={x - W / 2} y={y - H / 2} width={W} height={H} rx="12" class="cell" class:active />
				<SvgTeX x={x} y={y - H / 2 + 14} tex={groupTeX[key]} size={12.5} color={active ? 'var(--gold-pale)' : 'var(--ink-faint)'} w={W} h={20} />
				<!-- the underlying complex, faint -->
				{#if kind[c] !== 'A'}
					<polygon points={pts(T)} class="tri-faint" class:xa={kind[c] === 'XA'} />
				{/if}
				<polygon points={pts(T)} class="edges-faint" class:dashed={kind[c] === 'XA'} />
				{#if st.fill}
					<polygon points={pts(T)} class="tri-on" />
					<path d={swirl(x, y + 12, 11)} class="swirl" marker-end="url(#arrow-violet)" />
				{/if}
				{#if st.loop}
					{#each [0, 1, 2] as e (e)}
						{@const a = T[e]}
						{@const b = T[(e + 1) % 3]}
						<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} class="loop" />
						<path d={chevron(a, b)} class="chev" />
					{/each}
				{/if}
				{#if st.zero}
					<SvgTeX x={x} y={y + 10} tex={'0\\ \\checkmark'} size={22} color="var(--green)" w={80} h={34} />
				{/if}
				{#if kind[c] !== 'XA' || !st.zero}
					{#each T as p, v (v)}
						<circle cx={p[0]} cy={p[1]} r="3.4" class="vtx" class:dim={kind[c] === 'XA'} />
					{/each}
				{/if}
			{/each}
		{/each}
	</Svg>
	<div class="note"><TeX tex={notes[step]} /></div>
	<Controls>
		<StepControls bind:step count={labels.length} {labels} interval={2400} />
	</Controls>
</div>

<style>
	.arr {
		stroke: rgba(235, 229, 213, 0.5);
		stroke-width: 1.4;
	}
	.cell {
		fill: rgba(255, 255, 255, 0.02);
		stroke: rgba(216, 178, 110, 0.16);
		stroke-width: 1;
		transition: all 0.4s var(--ease);
	}
	.cell.active {
		fill: rgba(216, 178, 110, 0.07);
		stroke: rgba(242, 208, 143, 0.6);
	}
	.tri-faint {
		fill: rgba(116, 169, 255, 0.08);
	}
	.tri-faint.xa {
		fill: rgba(116, 169, 255, 0.05);
	}
	.edges-faint {
		fill: none;
		stroke: rgba(200, 192, 170, 0.45);
		stroke-width: 1.4;
	}
	.edges-faint.dashed {
		stroke-dasharray: 3 4;
		stroke: rgba(200, 192, 170, 0.3);
	}
	.tri-on {
		fill: rgba(164, 147, 255, 0.42);
		stroke: var(--violet);
		stroke-width: 1.5;
	}
	.swirl {
		fill: none;
		stroke: #fff;
		stroke-width: 1.4;
		opacity: 0.85;
	}
	.loop {
		stroke: var(--gold-bright);
		stroke-width: 3;
		stroke-linecap: round;
		filter: drop-shadow(0 0 3px rgba(244, 215, 156, 0.8));
	}
	.chev {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 1.8;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.vtx {
		fill: url(#vertex-fill);
		stroke: #060912;
		stroke-width: 1;
	}
	.vtx.dim {
		opacity: 0.45;
	}
	.zz {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 2.6;
		stroke-dasharray: 7 5;
		filter: drop-shadow(0 0 4px rgba(244, 215, 156, 0.8));
	}
	.note {
		text-align: center;
		padding: 0.2rem 1rem 0.7rem;
		min-height: 2.4rem;
		font-size: 0.98rem;
		color: var(--ink-bright);
		overflow-x: auto;
	}
</style>
