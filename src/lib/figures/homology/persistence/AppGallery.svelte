<script lang="ts">
	// Six places where persistent homology has found structure, each with a small
	// schematic illustration (schematic, not data).
	import { mulberry32 } from '$lib/math/persistence';

	const rnd = mulberry32(77);
	const gauss = () => Math.sqrt(-2 * Math.log(Math.max(1e-12, rnd()))) * Math.cos(2 * Math.PI * rnd());
	const d2 = (a: number[], b: number[]) => Math.hypot(a[0] - b[0], a[1] - b[1]);

	// 1 · sensors in a fenced region, with a coverage hole
	const holeAt = [128, 60];
	const sensors: number[][] = [];
	for (let i = 0; i < 7; i++)
		for (let j = 0; j < 4; j++) {
			const p = [24 + i * 25.5 + (rnd() - 0.5) * 10, 20 + j * 27 + (rnd() - 0.5) * 9];
			if (d2(p, holeAt) > 24) sensors.push(p);
		}
	const comm: number[][] = [];
	sensors.forEach((a, i) => sensors.forEach((b, j) => j > i && d2(a, b) < 36 && comm.push([...a, ...b])));

	// 2 · 3×3 image patches around the circle of edge directions
	const patches = Array.from({ length: 8 }, (_, k) => {
		const th = (k / 8) * Math.PI * 2;
		const cx = 100 + 42 * Math.cos(th);
		const cy = 62 - 40 * Math.sin(th);
		const cells: { x: number; y: number; v: number }[] = [];
		for (let a = -1; a <= 1; a++)
			for (let b = -1; b <= 1; b++) {
				const s = a * Math.cos(th) - b * Math.sin(th);
				cells.push({ x: cx + a * 7 - 3.5, y: cy + b * 7 - 3.5, v: 0.5 + 0.5 * Math.tanh(2.2 * s) });
			}
		return cells;
	});
	const shade = (v: number) => {
		const c0 = [26, 36, 64];
		const c1 = [244, 230, 200];
		return `rgb(${c0.map((c, i) => Math.round(c + (c1[i] - c) * v)).join(',')})`;
	};

	// 3 · a tree, and a tree with a reticulation (a loop)
	const tree = (ox: number) => [
		[ox, 112, ox, 84],
		[ox, 84, ox - 22, 62],
		[ox, 84, ox + 22, 62],
		[ox - 22, 62, ox - 34, 34],
		[ox - 22, 62, ox - 10, 34],
		[ox + 22, 62, ox + 10, 34],
		[ox + 22, 62, ox + 34, 34]
	];

	// 4 · place fields along a circular track
	const fields = Array.from({ length: 12 }, (_, k) => {
		const th = (k / 12) * Math.PI * 2;
		return [100 + 68 * Math.cos(th), 62 + 36 * Math.sin(th)];
	});

	// 5 · atoms of a glass (a jittered lattice with two vacancies, whose rings we light up)
	const atoms: number[][] = [];
	const vac = [
		[70, 52],
		[136, 72]
	];
	for (let j = 0; j < 7; j++)
		for (let i = 0; i < 12; i++) {
			const p = [10 + i * 17 + (j % 2) * 8.5 + gauss() * 2.2, 10 + j * 15 + gauss() * 2.2];
			atoms.push(p);
		}
	const bonds: number[][] = [];
	const keep = atoms.filter((p) => vac.every((v) => d2(p, v) > 9));
	keep.forEach((a, i) => keep.forEach((b, j) => j > i && d2(a, b) < 21 && bonds.push([...a, ...b])));
	const rings = vac.map((v) => {
		const near = keep.filter((p) => d2(p, v) < 27).sort((a, b) => Math.atan2(a[1] - v[1], a[0] - v[0]) - Math.atan2(b[1] - v[1], b[0] - v[0]));
		return near.map((p) => p.join(',')).join(' ');
	});

	// 6 · the cosmic web: clusters joined by filaments, voids in between
	const nodes = [
		[30, 30],
		[92, 18],
		[160, 36],
		[52, 92],
		[118, 82],
		[178, 104]
	];
	const fil = [
		[0, 1],
		[1, 2],
		[0, 3],
		[3, 4],
		[1, 4],
		[4, 5],
		[2, 5]
	];
	const galaxies: number[][] = [];
	for (const [a, b] of fil)
		for (let k = 0; k < 30; k++) {
			const t = rnd();
			const p = [nodes[a][0] + (nodes[b][0] - nodes[a][0]) * t, nodes[a][1] + (nodes[b][1] - nodes[a][1]) * t];
			galaxies.push([p[0] + gauss() * 2.6, p[1] + gauss() * 2.6]);
		}
	for (const n of nodes) for (let k = 0; k < 16; k++) galaxies.push([n[0] + gauss() * 3.5, n[1] + gauss() * 3.5]);

	interface Card {
		key: string;
		title: string;
		text: string;
		cite: string;
	}
	const cards: Card[] = [
		{
			key: 'sensors',
			title: 'Coverage without coordinates',
			text: 'Sensors that know only which neighbours they can hear — not where anyone is — can still certify that their sensing discs cover a fenced region with no gaps. The certificate is a homology computation on the Rips complex of the “who hears whom” graph.',
			cite: 'de Silva & Ghrist, Algebraic & Geometric Topology 7 (2007)'
		},
		{
			key: 'patches',
			title: 'The shape of image patches',
			text: 'High-contrast 3×3 patches cut from photographs crowd around a circle of “edge” patches — one long H₁ bar. At finer settings three circles appear, and the evidence points to a Klein bottle that contains them.',
			cite: 'Carlsson, Ishkhanov, de Silva & Zomorodian, Int. J. Computer Vision 76 (2008)'
		},
		{
			key: 'evolution',
			title: 'Loops in the tree of life',
			text: 'Descent from a single parent draws a tree, and a tree has no loops. Persistent H₁ in genetic-distance data signals reassortment and recombination, where lineages swap genes.',
			cite: 'Chan, Carlsson & Rabadán, PNAS 110 (2013)'
		},
		{
			key: 'neurons',
			title: 'Geometry in neural activity',
			text: 'From correlations between neurons alone, the Betti curves of the clique complexes they generate tell geometrically organised activity — such as hippocampal place cells — from random structure.',
			cite: 'Giusti, Pastalkova, Curto & Itskov, PNAS 112 (2015)'
		},
		{
			key: 'glass',
			title: 'Rings in glass',
			text: 'Atoms in an amorphous solid form rings on many scales. Persistence diagrams of atomic configurations separate liquid, glass and crystal, and reveal a hierarchy of ring structures.',
			cite: 'Hiraoka et al., PNAS 113 (2016)'
		},
		{
			key: 'cosmos',
			title: 'The cosmic web',
			text: 'Galaxies trace clusters, filaments, walls and enormous voids. Persistent Betti numbers measure this web in all three dimensions at once: pieces, tunnels and voids.',
			cite: 'Pranav et al., Monthly Notices of the RAS 465 (2017)'
		}
	];
</script>

<div class="gallery">
	{#each cards as c (c.key)}
		<article class="card">
			<svg viewBox="0 0 200 124" class="art" role="img" aria-label="Schematic illustration: {c.title}">
				{#if c.key === 'sensors'}
					<rect x="8" y="7" width="184" height="110" rx="4" class="fence" />
					{#each sensors as p, i (i)}
						<circle cx={p[0]} cy={p[1]} r="20" class="cover" />
					{/each}
					{#each comm as l, i (i)}
						<line x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} class="link" />
					{/each}
					<circle cx={holeAt[0]} cy={holeAt[1]} r="9" class="hole" />
					{#each sensors as p, i (i)}
						<circle cx={p[0]} cy={p[1]} r="2.6" class="dot" />
					{/each}
				{:else if c.key === 'patches'}
					<ellipse cx="100" cy="62" rx="42" ry="40" class="orbit" />
					{#each patches as cells, k (k)}
						<g class="patch">
							{#each cells as cell, m (m)}
								<rect x={cell.x} y={cell.y} width="7" height="7" fill={shade(cell.v)} />
							{/each}
							<rect x={cells[0].x} y={cells[0].y} width="21" height="21" class="frame" />
						</g>
					{/each}
				{:else if c.key === 'evolution'}
					{#each tree(52) as l, i (i)}
						<line x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} class="branch" />
					{/each}
					{#each tree(148) as l, i (i)}
						<line x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} class="branch" />
					{/each}
					<path d="M 148 84 L 126 62 L 138 34 M 148 84 L 170 62 L 158 34" class="loop" />
					<path d="M 138 34 C 142 22, 154 22, 158 34" class="retic" />
					<text x="52" y="18" class="lbl">tree</text>
					<text x="148" y="16" class="lbl">network</text>
				{:else if c.key === 'neurons'}
					<ellipse cx="100" cy="62" rx="68" ry="36" class="track" />
					{#each fields as p, i (i)}
						<circle cx={p[0]} cy={p[1]} r="16" class="field" />
					{/each}
					{#each fields as p, i (i)}
						{@const q = fields[(i + 1) % fields.length]}
						<line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} class="syn" />
					{/each}
					{#each fields as p, i (i)}
						<circle cx={p[0]} cy={p[1]} r="2.8" class="dot" />
					{/each}
				{:else if c.key === 'glass'}
					{#each bonds as l, i (i)}
						<line x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} class="bond" />
					{/each}
					{#each rings as pts, i (i)}
						<polygon points={pts} class="ring" />
					{/each}
					{#each keep as p, i (i)}
						<circle cx={p[0]} cy={p[1]} r="3" class="atom" />
					{/each}
				{:else}
					{#each galaxies as g, i (i)}
						<circle cx={g[0]} cy={g[1]} r="0.9" class="gal" />
					{/each}
					{#each nodes as n, i (i)}
						<circle cx={n[0]} cy={n[1]} r="4" class="cluster" />
					{/each}
					<circle cx="74" cy="56" r="15" class="void" />
					<circle cx="147" cy="63" r="13" class="void" />
				{/if}
			</svg>
			<div class="ct">{c.title}</div>
			<div class="tx">{c.text}</div>
			<div class="ci ui">{c.cite}</div>
		</article>
	{/each}
</div>

<style>
	.gallery {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 17rem), 1fr));
		gap: 1rem;
		padding: 1rem;
	}
	.card {
		display: flex;
		flex-direction: column;
		padding: 0.6rem 0.9rem 0.8rem;
		border-radius: 10px;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.01));
		border: 1px solid var(--line-faint);
		transition:
			border-color 0.25s var(--ease),
			transform 0.25s var(--ease);
	}
	.card:hover {
		border-color: var(--line-strong);
		transform: translateY(-2px);
	}
	.art {
		display: block;
		width: 100%;
		height: auto;
		margin-bottom: 0.4rem;
		border-radius: 6px;
		background: radial-gradient(90% 90% at 50% 40%, rgba(40, 52, 110, 0.35), rgba(3, 6, 14, 0.4));
	}
	.ct {
		font-family: var(--font-elegant);
		font-weight: 600;
		font-size: 1.14rem;
		letter-spacing: 0.01em;
		color: var(--ink-bright);
		margin: 0.2rem 0 0.3rem;
	}
	.tx {
		font-size: 0.88rem;
		line-height: 1.5;
		color: var(--ink-dim);
		margin: 0 0 0.5rem;
		flex: 1;
	}
	.ci {
		font-size: 0.68rem;
		color: var(--ink-faint);
		letter-spacing: 0.02em;
		font-style: italic;
	}
	.fence {
		fill: none;
		stroke: rgba(95, 214, 207, 0.5);
		stroke-dasharray: 3 3;
	}
	.cover {
		fill: rgba(95, 214, 207, 0.09);
		stroke: rgba(95, 214, 207, 0.25);
		stroke-width: 0.6;
	}
	.link {
		stroke: rgba(235, 229, 213, 0.35);
		stroke-width: 0.7;
	}
	.hole {
		fill: rgba(242, 141, 182, 0.15);
		stroke: var(--rose);
		stroke-dasharray: 2 2;
	}
	.dot {
		fill: #fff3d6;
	}
	.orbit {
		fill: none;
		stroke: rgba(242, 208, 143, 0.55);
		stroke-width: 1.2;
	}
	.patch .frame {
		fill: none;
		stroke: rgba(242, 208, 143, 0.7);
		stroke-width: 0.8;
	}
	.branch {
		stroke: rgba(235, 229, 213, 0.75);
		stroke-width: 1.6;
		stroke-linecap: round;
	}
	.loop {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 2.4;
		stroke-linecap: round;
		opacity: 0.8;
	}
	.retic {
		fill: none;
		stroke: var(--rose);
		stroke-width: 2.2;
		stroke-dasharray: 3 2;
	}
	.lbl {
		fill: var(--ink-faint);
		font-family: var(--font-ui);
		font-size: 9px;
		letter-spacing: 0.1em;
		text-anchor: middle;
		text-transform: uppercase;
	}
	.track {
		fill: none;
		stroke: rgba(235, 229, 213, 0.15);
		stroke-width: 10;
	}
	.field {
		fill: rgba(164, 147, 255, 0.12);
		stroke: rgba(164, 147, 255, 0.35);
		stroke-width: 0.6;
	}
	.syn {
		stroke: var(--gold-bright);
		stroke-width: 1.4;
		opacity: 0.8;
	}
	.bond {
		stroke: rgba(116, 169, 255, 0.4);
		stroke-width: 0.9;
	}
	.ring {
		fill: rgba(242, 208, 143, 0.12);
		stroke: var(--gold-bright);
		stroke-width: 1.6;
	}
	.atom {
		fill: #cfe0ff;
		stroke: rgba(6, 9, 18, 0.8);
		stroke-width: 0.5;
	}
	.gal {
		fill: rgba(255, 243, 214, 0.8);
	}
	.cluster {
		fill: rgba(242, 208, 143, 0.35);
		stroke: rgba(242, 208, 143, 0.8);
		stroke-width: 0.6;
	}
	.void {
		fill: none;
		stroke: rgba(242, 141, 182, 0.55);
		stroke-dasharray: 2 3;
	}
</style>
