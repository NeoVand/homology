<script lang="ts">
	// Figure: the classification of closed surfaces as a chart. Columns are values
	// of χ, rows are orientable / non-orientable; every closed surface sits in
	// exactly one cell.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';

	interface Cell {
		chi: number;
		orientable: boolean;
		name: string;
		tex: string;
		/** number of handles (orientable) or cross-caps */
		n: number;
		word: string;
		cells: string;
	}
	const cells: Cell[] = [
		{ chi: 2, orientable: true, name: 'the sphere', tex: 'S^2', n: 0, word: 'aa^{-1}', cells: '1 - 0 + 1 = 2' },
		{ chi: 0, orientable: true, name: 'the torus', tex: 'T^2', n: 1, word: 'aba^{-1}b^{-1}', cells: '1 - 2 + 1 = 0' },
		{
			chi: -2,
			orientable: true,
			name: 'the genus-2 surface',
			tex: '\\Sigma_2',
			n: 2,
			word: 'a_1b_1a_1^{-1}b_1^{-1}\\,a_2b_2a_2^{-1}b_2^{-1}',
			cells: '1 - 4 + 1 = -2'
		},
		{
			chi: -4,
			orientable: true,
			name: 'the genus-3 surface',
			tex: '\\Sigma_3',
			n: 3,
			word: 'a_1b_1a_1^{-1}b_1^{-1}\\,a_2b_2a_2^{-1}b_2^{-1}\\,a_3b_3a_3^{-1}b_3^{-1}',
			cells: '1 - 6 + 1 = -4'
		},
		{ chi: 1, orientable: false, name: 'the projective plane', tex: '\\RP^2', n: 1, word: 'aa', cells: '1 - 1 + 1 = 1' },
		{ chi: 0, orientable: false, name: 'the Klein bottle', tex: 'K', n: 2, word: 'aabb \\;(\\text{or } abab^{-1})', cells: '1 - 2 + 1 = 0' },
		{ chi: -1, orientable: false, name: 'three cross-caps', tex: 'N_3', n: 3, word: 'aabbcc', cells: '1 - 3 + 1 = -1' },
		{ chi: -2, orientable: false, name: 'four cross-caps', tex: 'N_4', n: 4, word: 'a_1a_1a_2a_2a_3a_3a_4a_4', cells: '1 - 4 + 1 = -2' },
		{ chi: -3, orientable: false, name: 'five cross-caps', tex: 'N_5', n: 5, word: 'a_1a_1\\cdots a_5a_5', cells: '1 - 5 + 1 = -3' },
		{ chi: -4, orientable: false, name: 'six cross-caps', tex: 'N_6', n: 6, word: 'a_1a_1\\cdots a_6a_6', cells: '1 - 6 + 1 = -4' }
	];
	const chis = [2, 1, 0, -1, -2, -3, -4];
	const X = (chi: number) => 128 + (2 - chi) * 74;
	const rowY = (o: boolean) => (o ? 112 : 228);
	let picked = $state<Cell>(cells[1]);
</script>

<div class="wrap">
	<Svg viewBox="0 0 640 300" maxHeight={330} label="A chart of closed surfaces: columns give the Euler characteristic, rows say whether the surface is orientable">
		<text x="22" y="46" class="hdr">χ =</text>
		{#each chis as chi (chi)}
			<text x={X(chi)} y="46" text-anchor="middle" class="chi">{chi}</text>
			<line x1={X(chi)} y1="60" x2={X(chi)} y2="282" class="col" />
		{/each}
		<text x="22" y={rowY(true) + 4} class="row">orientable</text>
		<text x="22" y={rowY(false) + 4} class="row">non-</text>
		<text x="22" y={rowY(false) + 19} class="row">orientable</text>
		{#each chis as chi (chi)}
			{#each [true, false] as o (o)}
				{#if !cells.some((c) => c.chi === chi && c.orientable === o)}
					<text x={X(chi)} y={rowY(o) + 5} text-anchor="middle" class="none">—</text>
				{/if}
			{/each}
		{/each}
		{#each cells as cell (cell.tex)}
			{@const x = X(cell.chi)}
			{@const y = rowY(cell.orientable)}
			{@const on = picked === cell}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<g
				class="cell"
				class:on
				role="button"
				tabindex="0"
				aria-label={cell.name}
				onclick={() => (picked = cell)}
				onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (picked = cell)}
				onpointerenter={(e) => e.pointerType === 'mouse' && (picked = cell)}
			>
				<rect x={x - 33} y={y - 40} width="66" height="80" rx="12" class="box" />
				{#if cell.orientable}
					{#if cell.n === 0}
						<circle cx={x} cy={y - 8} r="19" class="body" />
						<ellipse cx={x} cy={y - 8} rx="19" ry="6" class="equator" />
					{:else}
						<ellipse cx={x} cy={y - 8} rx="27" ry={13 + cell.n} class="body" />
						{#each Array(cell.n) as _, k (k)}
							{@const hx = x + (k - (cell.n - 1) / 2) * (cell.n === 1 ? 0 : 16)}
							<path d="M {hx - 6} {y - 9} Q {hx} {y - 3} {hx + 6} {y - 9}" class="hole" />
							<path d="M {hx - 4.5} {y - 7.5} Q {hx} {y - 11} {hx + 4.5} {y - 7.5}" class="hole" />
						{/each}
					{/if}
				{:else}
					<circle cx={x} cy={y - 8} r="19" class="body nonor" />
					{#each Array(cell.n) as _, k (k)}
						{@const ang = (k / cell.n) * Math.PI * 2 - Math.PI / 2}
						{@const rr = cell.n === 1 ? 0 : 10}
						{@const cx = x + rr * Math.cos(ang)}
						{@const cy = y - 8 + rr * Math.sin(ang)}
						<circle cx={cx} cy={cy} r="4" class="cc" />
						<path d="M {cx - 2.6} {cy - 2.6} L {cx + 2.6} {cy + 2.6} M {cx - 2.6} {cy + 2.6} L {cx + 2.6} {cy - 2.6}" class="ccx" />
					{/each}
				{/if}
				<SvgTeX x={x} y={y + 26} tex={cell.tex} size={14} w={60} h={22} color={on ? 'var(--gold-bright)' : 'var(--ink)'} />
			</g>
		{/each}
	</Svg>
	<div class="detail ui" aria-live="polite">
		<div class="dname"><TeX tex={picked.tex} />, {picked.name}</div>
		<div class="drow">
			{#if picked.orientable && picked.n === 0}
				Built from one point and one disk whose whole rim is pulled tight onto the point:
			{:else}
				Built from one point, {picked.orientable ? 2 * picked.n : picked.n}
				{(picked.orientable ? 2 * picked.n : picked.n) === 1 ? 'loop' : 'loops'} and one disk glued along
				<TeX tex={picked.word} />:
			{/if}
			<TeX tex={`c_0 - c_1 + c_2 = ${picked.cells}`} />
		</div>
		<div class="drow dim">
			{#if picked.orientable}
				Orientable, with {picked.n} handle{picked.n === 1 ? '' : 's'}: <TeX tex={`\\chi = 2 - 2g = 2 - 2\\cdot ${picked.n} = ${picked.chi}`} />
			{:else}
				Non-orientable, with {picked.n} cross-cap{picked.n === 1 ? '' : 's'}: <TeX tex={`\\chi = 2 - k = 2 - ${picked.n} = ${picked.chi}`} />
			{/if}
		</div>
	</div>
</div>

<style>
	.wrap {
		padding: 0.6rem 0.8rem 0;
	}
	.hdr,
	.row {
		font-family: var(--font-ui);
		font-size: 12px !important;
		fill: var(--ink-faint) !important;
		letter-spacing: 0.06em;
	}
	.chi {
		font-family: var(--font-ui);
		font-size: 15px !important;
		font-weight: 650;
		fill: var(--gold-bright) !important;
	}
	.col {
		stroke: rgba(216, 178, 110, 0.08);
		stroke-width: 1;
	}
	.none {
		fill: var(--ink-ghost) !important;
		font-size: 16px !important;
	}
	.cell {
		cursor: pointer;
		outline: none;
	}
	.box {
		fill: rgba(255, 255, 255, 0.02);
		stroke: rgba(216, 178, 110, 0.15);
		stroke-width: 1;
		transition: all 0.2s;
	}
	.cell:hover .box,
	.cell:focus-visible .box {
		stroke: var(--line-strong);
	}
	.cell.on .box {
		fill: rgba(242, 208, 143, 0.08);
		stroke: var(--gold);
		stroke-width: 1.6;
	}
	.body {
		fill: rgba(116, 169, 255, 0.18);
		stroke: rgba(116, 169, 255, 0.75);
		stroke-width: 1.4;
	}
	.body.nonor {
		fill: rgba(242, 141, 182, 0.14);
		stroke: rgba(242, 141, 182, 0.7);
	}
	.equator {
		fill: none;
		stroke: rgba(116, 169, 255, 0.4);
		stroke-width: 1;
		stroke-dasharray: 2 3;
	}
	.hole {
		fill: none;
		stroke: rgba(235, 229, 213, 0.85);
		stroke-width: 1.4;
		stroke-linecap: round;
	}
	.cc {
		fill: #10131d;
		stroke: rgba(242, 141, 182, 0.9);
		stroke-width: 1.1;
	}
	.ccx {
		stroke: rgba(242, 141, 182, 0.9);
		stroke-width: 1;
	}
	.detail {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		padding: 0.2rem 1.2rem 1rem;
		font-size: 0.84rem;
		color: var(--ink-dim);
		min-height: 6.5rem;
	}
	.dname {
		font-family: var(--font-elegant);
		font-size: 1.2rem;
		color: var(--ink-bright);
	}
	.drow :global(.katex) {
		font-size: 1em;
	}
	.dim {
		color: var(--ink-faint);
	}
</style>
