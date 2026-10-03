<script lang="ts">
	// Figure: the pages of the spectral sequence of a filtered complex.
	// Dots are generators placed at (p, q) = (stage, degree − stage); on page E^r
	// the differential d^r joins dots along slope (−r, r − 1); dots that are
	// joined die on the next page; what survives to E^∞ is the homology.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { toys, spectral, aliveOn, differentialsOn, gridPos, LARGE_P } from './spectral';

	let toyId = $state<'disks' | 'torus' | 'rp2'>('disks');
	let field = $state<'Q' | 'F2'>('Q');
	let page = $state(1);
	const F = $derived(toys[toyId]);
	const S = $derived(spectral(F, field === 'Q' ? LARGE_P : 2));
	const pages = $derived(Array.from({ length: S.last }, (_, i) => i + 1));
	$effect(() => {
		if (page > S.last) page = S.last;
	});
	const alive = $derived(aliveOn(F, S, page));
	const dying = $derived(new Set(differentialsOn(S, page).flatMap((d) => [d.from, d.to])));
	const diffs = $derived(differentialsOn(S, page));

	// grid geometry
	const PMAX = 3;
	const QMAX = 2;
	const CW = 104;
	const CH = 86;
	const OX = 64;
	const OY = 300;
	const cx = (p: number) => OX + CW * p + CW / 2;
	const cy = (q: number) => OY - CH * q - CH / 2;
	const dotPos = $derived.by(() => {
		const byCell = new Map<string, number[]>();
		F.gens.forEach((g, i) => {
			const [p, q] = gridPos(g);
			const key = `${p},${q}`;
			byCell.set(key, [...(byCell.get(key) ?? []), i]);
		});
		const pos = new Map<number, [number, number]>();
		for (const [key, list] of byCell) {
			const [p, q] = key.split(',').map(Number);
			list.forEach((i, k) => pos.set(i, [cx(p) + (k - (list.length - 1) / 2) * 30, cy(q)]));
		}
		return pos;
	});

	function arrowPath(a: [number, number], b: [number, number]) {
		const dx = b[0] - a[0];
		const dy = b[1] - a[1];
		const L = Math.hypot(dx, dy);
		const ux = dx / L;
		const uy = dy / L;
		const s: [number, number] = [a[0] + ux * 14, a[1] + uy * 14];
		const e: [number, number] = [b[0] - ux * 16, b[1] - uy * 16];
		const mx = (s[0] + e[0]) / 2 - uy * 22;
		const my = (s[1] + e[1]) / 2 + ux * 22;
		return `M ${s[0]} ${s[1]} Q ${mx} ${my} ${e[0]} ${e[1]}`;
	}

	const homologyReadout = $derived.by(() => {
		if (page < S.last) return '';
		const fieldT = field === 'Q' ? '\\Q' : '\\Z/2';
		const dims = [0, 1, 2].map((n) => [...alive].filter((i) => F.gens[i].dim === n).length);
		return dims
			.map((dm, n) => `H_{${n}} = ${dm === 0 ? '0' : dm === 1 ? fieldT : `${fieldT}^{${dm}}`}`)
			.join(',\\quad ');
	});

	const stageNotes: Record<string, string[]> = {
		disks: ['stage 0: two points v, w and a loop c at v', 'stage 1: a segment t from v to w, and a loop b at w', 'stage 2: a disk e filling c, a disk f filling b'],
		torus: ['stage 0: a point v', 'stage 1: two loops a, b (a figure eight)', 'stage 2: a square s glued along aba⁻¹b⁻¹'],
		rp2: ['stage 0: a point v', 'stage 1: a loop a', 'stage 2: a disk s glued along aa (boundary wraps twice)']
	};
	const bdTeX = (i: number) => {
		const bd = F.gens[i].bd ?? {};
		const terms = Object.entries(bd).filter(([, c]) => c !== 0);
		if (!terms.length) return '\\partial ' + F.gens[i].tex + ' = 0';
		return (
			'\\partial ' +
			F.gens[i].tex +
			' = ' +
			terms
				.map(([nm, c], k) => {
					const g = F.gens.find((h) => h.name === nm)!;
					const coef = Math.abs(c) === 1 ? '' : String(Math.abs(c));
					return (k === 0 ? (c < 0 ? '-' : '') : c < 0 ? ' - ' : ' + ') + coef + g.tex;
				})
				.join('')
		);
	};
	const pageLabel = (r: number) => (r === S.last ? `E^{${r}} = E^{\\infty}` : `E^{${r}}`);
</script>

<div class="ss">
	<div class="cols">
		<div class="gridwrap">
			<Svg viewBox="0 0 500 360" maxHeight={380} label="The grid of a spectral sequence page: columns are stages p, rows are q; dots are generators and gold arrows are differentials">
				<!-- cells -->
				{#each Array.from({ length: PMAX + 1 }, (_, p) => p) as p (p)}
					{#each Array.from({ length: QMAX + 1 }, (_, q) => q) as q (q)}
						<rect x={OX + CW * p + 3} y={OY - CH * (q + 1) + 3} width={CW - 6} height={CH - 6} rx="10" class="cell" />
					{/each}
				{/each}
				<!-- total-degree diagonals -->
				{#each [0, 1, 2] as n (n)}
					<line x1={cx(0) - CW * 0.45} y1={cy(n) - CH * 0.45} x2={cx(n) + CW * 0.45} y2={cy(0) + CH * 0.45} class="diag" />
					<text x={cx(0) - CW * 0.42} y={cy(n) - CH * 0.3} class="t-ui diag-t">n = {n}</text>
				{/each}
				<!-- axes -->
				<line x1={OX} y1={OY} x2={OX + CW * (PMAX + 1) + 10} y2={OY} class="axis" marker-end="url(#arrow-dim)" />
				<line x1={OX} y1={OY} x2={OX} y2={OY - CH * (QMAX + 1) - 10} class="axis" marker-end="url(#arrow-dim)" />
				{#each Array.from({ length: PMAX + 1 }, (_, p) => p) as p (p)}
					<SvgTeX x={cx(p)} y={OY + 16} tex={String(p)} size={13} color="var(--ink-faint)" w={20} h={18} />
				{/each}
				{#each Array.from({ length: QMAX + 1 }, (_, q) => q) as q (q)}
					<SvgTeX x={OX - 14} y={cy(q)} tex={String(q)} size={13} color="var(--ink-faint)" w={20} h={18} />
				{/each}
				<SvgTeX x={OX + CW * (PMAX + 1) + 4} y={OY + 18} tex="p" size={15} color="var(--ink-dim)" w={20} h={20} />
				<SvgTeX x={OX - 16} y={OY - CH * (QMAX + 1) - 4} tex="q" size={15} color="var(--ink-dim)" w={20} h={20} />

				<!-- differentials of this page -->
				{#each diffs as d (d.from + ',' + d.to)}
					{@const a = dotPos.get(d.from)!}
					{@const b = dotPos.get(d.to)!}
					<path d={arrowPath(a, b)} class="dr" marker-end="url(#arrow-gold)" />
					<SvgTeX x={(a[0] + b[0]) / 2 + 8} y={(a[1] + b[1]) / 2 - 26} tex={`d^{${page}}`} size={13} color="var(--gold-bright)" w={36} h={20} />
				{/each}

				<!-- dots -->
				{#each F.gens as g, i (g.name)}
					{@const pos = dotPos.get(i)!}
					{@const on = alive.has(i)}
					<g class="dot" class:off={!on} class:dying={dying.has(i)} transform="translate({pos[0]} {pos[1]})">
						<circle r="11" class="d" />
						<SvgTeX x={0} y={0} tex={g.tex} size={13} color={on ? '#0b1122' : 'var(--ink-ghost)'} w={20} h={20} />
					</g>
				{/each}

				<SvgTeX x={250} y={22} tex={pageLabel(page)} size={20} color="var(--gold-bright)" w={160} h={30} />
			</Svg>
		</div>
		<div class="side">
			<div class="stitle ui">{F.title}</div>
			<ul class="stages ui">
				{#each stageNotes[toyId] as s, i (i)}<li>{s}</li>{/each}
			</ul>
			<div class="gens">
				{#each F.gens as g, i (g.name)}
					<div class="gen" class:off={!alive.has(i)} class:dying={dying.has(i)}>
						<span class="gname"><TeX tex={g.tex} /></span>
						<span class="ginfo ui">dim {g.dim}, stage {g.filt}</span>
						<span class="gbd"><TeX tex={bdTeX(i)} /></span>
					</div>
				{/each}
			</div>
		</div>
	</div>
	<div class="readout ui" aria-live="polite">
		{#if page < S.last}
			<span>On page <TeX tex={`E^{${page}}`} />, the differential <TeX tex={`d^{${page}}`} /> has slope <TeX tex={`(-${page},\\,${page - 1})`} />. {diffs.length ? `The ${diffs.length} gold arrow${diffs.length > 1 ? 's' : ''} pair${diffs.length > 1 ? '' : 's'} off generators that cancel; turn the page to see them vanish.` : 'Nothing happens on this page.'}</span>
		{:else}
			<span>Nothing more can happen: the sequence has <em>converged</em>. Each surviving dot contributes to <TeX tex="H_n" /> with <TeX tex="n = p + q" /> its diagonal: <TeX tex={homologyReadout} />.</span>
		{/if}
	</div>
	<Controls align="between">
		<Segmented
			bind:value={page}
			label="Page"
			options={pages.map((r) => ({ value: r, label: r === S.last ? `E${'⁰¹²³⁴⁵'[r]} = E∞` : `E${'⁰¹²³⁴⁵'[r]}` }))}
		/>
		<Segmented
			bind:value={toyId}
			onchange={() => (page = 1)}
			label="Example"
			options={[
				{ value: 'disks', label: 'Two disks on a segment' },
				{ value: 'torus', label: 'Torus by cells' },
				{ value: 'rp2', label: 'ℝP² by cells' }
			]}
		/>
		<Segmented
			bind:value={field}
			onchange={() => (page = 1)}
			label="Coefficients"
			options={[
				{ value: 'Q', label: 'ℚ' },
				{ value: 'F2', label: 'ℤ/2' }
			]}
		/>
	</Controls>
</div>

<style>
	.ss {
		padding-top: 0.8rem;
	}
	.cols {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
		gap: 0.6rem 1rem;
		padding: 0 1rem;
		align-items: start;
	}
	@media (max-width: 760px) {
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.cell {
		fill: rgba(116, 169, 255, 0.04);
		stroke: rgba(116, 169, 255, 0.14);
	}
	.diag {
		stroke: rgba(242, 208, 143, 0.14);
		stroke-width: 1;
		stroke-dasharray: 3 5;
	}
	.diag-t {
		fill: rgba(242, 208, 143, 0.45) !important;
		font-size: 10px !important;
	}
	.axis {
		stroke: rgba(235, 229, 213, 0.4);
		stroke-width: 1.2;
	}
	.dr {
		fill: none;
		stroke: #f2d08f;
		stroke-width: 2.4;
		filter: url(#glow);
	}
	.dot {
		transition: opacity 0.4s var(--ease);
	}
	.dot .d {
		fill: #f4d79c;
		stroke: #fff6dc;
		stroke-width: 1;
		filter: url(#glow);
	}
	.dot.dying .d {
		fill: #f28db6;
	}
	.dot.off .d {
		fill: transparent;
		stroke: rgba(139, 134, 118, 0.35);
		stroke-dasharray: 2 3;
		filter: none;
	}
	.side {
		font-size: 0.86rem;
	}
	.stitle {
		font-size: 0.76rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--gold);
		margin-top: 0.4rem;
	}
	.stages {
		margin: 0.3rem 0 0.6rem;
		padding-left: 1.1rem;
		font-size: 0.78rem;
		color: var(--ink-dim);
	}
	.gens {
		display: grid;
		gap: 0.25rem;
	}
	.gen {
		display: grid;
		grid-template-columns: 1.4rem 6.4rem 1fr;
		align-items: center;
		gap: 0.4rem;
		padding: 0.2rem 0.4rem;
		border-radius: 8px;
		background: rgba(244, 215, 156, 0.06);
		transition: opacity 0.4s;
	}
	.gen.dying {
		background: rgba(242, 141, 182, 0.12);
	}
	.gen.off {
		opacity: 0.35;
	}
	.gname {
		color: var(--gold-bright);
	}
	.ginfo {
		font-size: 0.7rem;
		color: var(--ink-faint);
	}
	.gbd {
		font-size: 0.85rem;
	}
	.readout {
		padding: 0.5rem 1.2rem 0.7rem;
		font-size: 0.84rem;
		color: var(--ink-dim);
		text-align: center;
	}
</style>
