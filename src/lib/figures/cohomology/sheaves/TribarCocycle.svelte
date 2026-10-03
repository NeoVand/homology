<script lang="ts">
	// Figure: Penrose's analysis of the impossible triangle. The drawing is the
	// union of three pieces, each a genuine 3D corner. Pull them apart to see
	// that; rescale each piece about the eye (which does not change its drawing)
	// and watch the depth ratios on the overlaps: their product never changes.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { tribarFaces, project, eyeModel, ratios, corners, type Vec3, type Axis } from './tribar';
	import { ease, prefersReducedMotion } from './svgutil';

	const faces = tribarFaces();
	const { mu } = eyeModel(30);

	// fit the drawing into the viewBox
	const all = faces.flatMap((f) => f.pts.map(project));
	const xs = all.map((p) => p[0]);
	const ys = all.map((p) => p[1]);
	const minX = Math.min(...xs);
	const maxX = Math.max(...xs);
	const minY = Math.min(...ys);
	const maxY = Math.max(...ys);
	const W = 640;
	const H = 430;
	const SC = Math.min((W - 120) / (maxX - minX), (H - 110) / (maxY - minY));
	const OX = W / 2 - (SC * (minX + maxX)) / 2;
	const OY = H / 2 - (SC * (minY + maxY)) / 2 + 6;
	const toScreen = (p: [number, number]): [number, number] => [OX + SC * p[0], OY + SC * p[1]];

	// centre of the picture and of each piece's corner (for the exploded view)
	const cornerScreen = corners.map((c) => toScreen(project([c[0] + 0.5, c[1] + 0.5, c[2] + 0.5])));
	const picCentre: [number, number] = [
		(cornerScreen[0][0] + cornerScreen[1][0] + cornerScreen[2][0]) / 3,
		(cornerScreen[0][1] + cornerScreen[1][1] + cornerScreen[2][1]) / 3
	];

	const shade: Record<Axis, string> = { x: 'url(#tb-x)', y: 'url(#tb-y)', z: 'url(#tb-z)' };
	const pieceColour = ['var(--violet)', 'var(--blue)', 'var(--teal)'];

	// overlap regions, drawn as gold veils: for piece k, the far part of its
	// incoming beam (cubes −4, −3 relative to its corner) and the far part of its
	// outgoing beam (cubes 3, 4)
	const sigma = (p: Vec3): Vec3 => [p[2], p[0], p[1]];
	function inPiece(k: number, p: Vec3): Vec3 {
		let q = p;
		for (let s = 0; s < k; s++) q = sigma(q);
		const c = corners[k];
		return [q[0] + c[0], q[1] + c[1], q[2] + c[2]];
	}
	const overlapPolys = [0, 1, 2].flatMap((k) => {
		const inc = [
			[
				[-4, 1, 0],
				[-2, 1, 0],
				[-2, 1, 1],
				[-4, 1, 1]
			],
			[
				[-4, 0, 1],
				[-2, 0, 1],
				[-2, 1, 1],
				[-4, 1, 1]
			]
		] as Vec3[][];
		const out = [
			[
				[1, 3, 0],
				[1, 5, 0],
				[1, 5, 1],
				[1, 3, 1]
			],
			[
				[0, 3, 1],
				[1, 3, 1],
				[1, 5, 1],
				[0, 5, 1]
			]
		] as Vec3[][];
		return [
			...inc.map((poly) => ({ piece: k, which: (k + 2) % 3, pts: poly.map((p) => toScreen(project(inPiece(k, p)))) })),
			...out.map((poly) => ({ piece: k, which: k, pts: poly.map((p) => toScreen(project(inPiece(k, p)))) }))
		];
	});
	// overlap index o: 0 = U12 (beam B, between pieces 0 and 1), 1 = U23, 2 = U31

	let explode = $state(0);
	let l1 = $state(0);
	let l2 = $state(0);
	let l3 = $state(0);
	const lam = $derived([2 ** l1, 2 ** l2, 2 ** l3] as [number, number, number]);
	const d = $derived(ratios(lam, mu));
	const dv = $derived([d.d12, d.d23, d.d31]);

	function offset(k: number): [number, number] {
		const c = cornerScreen[k];
		const vx = c[0] - picCentre[0];
		const vy = c[1] - picCentre[1];
		const L = Math.hypot(vx, vy) || 1;
		const e = ease(explode);
		return [(vx / L) * 70 * e, (vy / L) * 70 * e];
	}
	const pts = (p: [number, number][], k: number) => {
		const [dx, dy] = offset(k);
		return p.map(([x, y]) => `${(x + dx).toFixed(1)},${(y + dy).toFixed(1)}`).join(' ');
	};

	let anim = 0;
	function animateExplode(to: number) {
		cancelAnimationFrame(anim);
		if (prefersReducedMotion()) {
			explode = to;
			return;
		}
		const from = explode;
		const t0 = performance.now();
		const dur = 900;
		const tick = (now: number) => {
			const s = Math.min(1, (now - t0) / dur);
			explode = from + (to - from) * s;
			if (s < 1) anim = requestAnimationFrame(tick);
		};
		anim = requestAnimationFrame(tick);
	}

	const okColour = (x: number) => (Math.abs(Math.log(x)) < 0.004 ? 'var(--green)' : 'var(--rose)');
	const f3 = (x: number) => x.toFixed(3);

	function matchTwo() {
		l1 = 0;
		l2 = 0;
		l3 = 0;
	}
	function spread() {
		// d12 = d23 = d31 = μ^{1/3}: λ1/λ2 = λ2/λ3 = m, with m = μ^{1/3}
		const m = Math.log2(mu) / 3;
		l2 = 0;
		l1 = m;
		l3 = -m;
	}
	const pieceLabel = ['U_1', 'U_2', 'U_3'];
	const overlapLabel = ['U_1\\cap U_2', 'U_2\\cap U_3', 'U_3\\cap U_1'];
	const dLabel = ['d_{12}', 'd_{23}', 'd_{31}'];
</script>

<div class="wrap">
	<Svg
		viewBox="0 0 {W} {H}"
		maxHeight={470}
		label="The Penrose impossible triangle drawn as three overlapping pieces, each a genuine three-dimensional corner. The pieces can be pulled apart."
	>
		<defs>
			<linearGradient id="tb-z" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stop-color="#fbeccb" />
				<stop offset="1" stop-color="#e9cf98" />
			</linearGradient>
			<linearGradient id="tb-x" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stop-color="#d9b46f" />
				<stop offset="1" stop-color="#b98f4a" />
			</linearGradient>
			<linearGradient id="tb-y" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stop-color="#7d5f30" />
				<stop offset="1" stop-color="#5a4221" />
			</linearGradient>
		</defs>

		{#each [0, 1, 2] as k (k)}
			<g class="piece">
				{#each faces.filter((f) => f.piece === k) as f, i (i)}
					<polygon points={pts(f.pts.map((p) => toScreen(project(p))), k)} fill={shade[f.normal]} class="face" />
				{/each}
			</g>
		{/each}

		<!-- overlap veils, coloured by whether the two pieces agree there -->
		{#each overlapPolys as o, i (i)}
			<polygon points={pts(o.pts, o.piece)} class="veil" style="--c:{okColour(dv[o.which])}" />
		{/each}

		{#if explode > 0.02}
			{#each [0, 1, 2] as k (k)}
				{@const c = cornerScreen[k]}
				{@const [dx, dy] = offset(k)}
				{@const vx = c[0] - picCentre[0]}
				{@const vy = c[1] - picCentre[1]}
				{@const L = Math.hypot(vx, vy)}
				<g opacity={Math.min(1, explode * 1.4)}>
					<SvgTeX
						x={c[0] + dx + (vx / L) * 46}
						y={c[1] + dy + (vy / L) * 46}
						tex={pieceLabel[k]}
						size={22}
						color={pieceColour[k]}
						w={60}
					/>
				</g>
			{/each}
		{/if}
	</Svg>

	<div class="panel ui">
		<div class="rows">
			{#each [0, 1, 2] as o (o)}
				{@const val = dv[o]}
				{@const gap = Math.max(-1, Math.min(1, Math.log(val) / 0.5))}
				<div class="row">
					<span class="lbl"><TeX tex={overlapLabel[o]} /></span>
					<svg viewBox="-100 -14 200 28" class="line" aria-hidden="true">
						<line x1="-96" y1="0" x2="96" y2="0" stroke="rgba(235,229,213,0.18)" />
						<line x1="0" y1="-9" x2="0" y2="9" stroke="rgba(235,229,213,0.25)" />
						<circle cx={-gap * 40} cy="0" r="6" fill={pieceColour[o]} />
						<circle cx={gap * 40} cy="0" r="6" fill={pieceColour[(o + 1) % 3]} />
						<line x1={-gap * 40} y1="0" x2={gap * 40} y2="0" stroke={okColour(val)} stroke-width="2.5" />
					</svg>
					<span class="dv nums" style="color:{okColour(val)}"><TeX tex={`${dLabel[o]} = ${f3(val)}`} /></span>
				</div>
			{/each}
		</div>
		<div class="product">
			<TeX tex={`d_{12}\\,d_{23}\\,d_{31} = ${f3(d.product)} \\neq 1`} />
			<span class="note">— no rescaling of the pieces can change this product.</span>
		</div>
	</div>

	<Controls>
		<Slider bind:value={explode} min={0} max={1} step={0.01} label="Pull the pieces apart" format={(v) => `${Math.round(v * 100)}%`} />
		<Button onclick={() => animateExplode(explode > 0.5 ? 0 : 1)}>{explode > 0.5 ? 'Reassemble' : 'Explode'}</Button>
		<Button onclick={matchTwo}>Agree on two overlaps</Button>
		<Button onclick={spread}>Spread the blame</Button>
	</Controls>
	<Controls>
		<Slider bind:value={l1} min={-1} max={1} step={0.01} label="Rescale U₁ about the eye" format={(v) => `×${(2 ** v).toFixed(2)}`} />
		<Slider bind:value={l2} min={-1} max={1} step={0.01} label="Rescale U₂ about the eye" format={(v) => `×${(2 ** v).toFixed(2)}`} />
		<Slider bind:value={l3} min={-1} max={1} step={0.01} label="Rescale U₃ about the eye" format={(v) => `×${(2 ** v).toFixed(2)}`} />
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.4rem;
	}
	.face {
		stroke: #2a1f10;
		stroke-width: 1.1;
		stroke-linejoin: round;
	}
	.veil {
		fill: color-mix(in srgb, var(--c) 30%, transparent);
		stroke: var(--c);
		stroke-width: 1.4;
		stroke-dasharray: 4 3;
		pointer-events: none;
		transition:
			fill 0.3s,
			stroke 0.3s;
	}
	.panel {
		padding: 0.4rem 1.2rem 0.7rem;
		display: grid;
		gap: 0.5rem;
		font-size: 0.84rem;
	}
	.rows {
		display: grid;
		gap: 0.2rem;
	}
	.row {
		display: grid;
		grid-template-columns: 6.2rem minmax(6rem, 1fr) 7.5rem;
		align-items: center;
		gap: 0.6rem;
	}
	.lbl {
		color: var(--gold-bright);
	}
	.line {
		width: 100%;
		height: 26px;
	}
	.dv {
		text-align: right;
	}
	.product {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.3rem 0.7rem;
		color: var(--rose);
		border-top: 1px solid var(--line-faint);
		padding-top: 0.45rem;
	}
	.note {
		color: var(--ink-dim);
	}
	@media (max-width: 520px) {
		.row {
			grid-template-columns: 5.2rem 1fr;
		}
		.dv {
			grid-column: 1 / -1;
			text-align: left;
		}
	}
</style>
