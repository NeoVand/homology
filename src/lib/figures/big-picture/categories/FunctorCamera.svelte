<script lang="ts">
	// Figure: a functor at work. Top row: spaces and continuous maps
	//   S¹ —f→ T² —g→ S¹,  f(z) = (z^p, z^q),  g(x, y) = x^r y^s.
	// Bottom row: what H₁ (or, flipped, H¹) turns them into: groups and matrices.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import { torusCurve, torusOutline, torusGrid, coil, type TorusView } from './torus';
	import { animate } from './diagram';
	import { untrack } from 'svelte';

	let { mode = 'covariant' }: { mode?: 'covariant' | 'contravariant' } = $props();

	let p = $state(1);
	let q = $state(1);
	let r = $state(2);
	let s = $state(1);
	const w = $derived(r * p + s * q);

	// 0 = homology picture, 1 = cohomology picture (arrows mirrored).
	// The contravariant figure opens on cohomology, so that it does not look like the one before it.
	const co0 = untrack(() => mode === 'contravariant');
	let flip = $state(co0 ? 1 : 0);
	let which = $state<'H1' | 'Hc'>(co0 ? 'Hc' : 'H1');

	// On a narrow plate the drawing is scaled down; scale the labels up (k ≥ 1) so they stay readable.
	let width = $state(720);
	const k = $derived(Math.min(1.8, Math.max(1, (0.9 * 720) / (width || 720))));
	const narrow = $derived(k > 1.3);
	let cancel: (() => void) | null = null;
	function setWhich(v: 'H1' | 'Hc') {
		cancel?.();
		const from = flip;
		const to = v === 'Hc' ? 1 : 0;
		cancel = animate(900, (t) => (flip = from + (to - from) * t));
	}

	const T: TorusView = { cx: 360, cy: 128, s: 70, R: 1, r: 0.42, tilt: 0.66 };
	const outline = torusOutline(T);
	const grid = torusGrid(T, 20, 8);
	const curve = $derived(torusCurve(T, p, q));
	const coilPath = $derived(coil(610, 128, 44, w, 9));
	const sgn = (n: number) => (n < 0 ? '-' + Math.abs(n) : String(n));

	const yTop = 128;
	const yBot = 392;
	const mirror = (cx: number) => {
		const k = 1 - 2 * flip;
		return `translate(${cx} 0) scale(${k.toFixed(4)} 1) translate(${-cx} 0)`;
	};
	const showCo = $derived(flip > 0.5);
	const fade = $derived(Math.abs(1 - 2 * flip));
	const Hname = $derived(showCo ? 'H^1' : 'H_1');

	const fLabel = $derived(showCo ? `\\begin{pmatrix}${sgn(p)} & ${sgn(q)}\\end{pmatrix}` : `\\begin{pmatrix}${sgn(p)}\\\\ ${sgn(q)}\\end{pmatrix}`);
	const gLabel = $derived(showCo ? `\\begin{pmatrix}${sgn(r)}\\\\ ${sgn(s)}\\end{pmatrix}` : `\\begin{pmatrix}${sgn(r)} & ${sgn(s)}\\end{pmatrix}`);

	const readout = $derived(
		showCo
			? `H^1(g\\circ f) = (${sgn(w)}) = \\begin{pmatrix}${sgn(p)} & ${sgn(q)}\\end{pmatrix}\\begin{pmatrix}${sgn(r)}\\\\ ${sgn(s)}\\end{pmatrix} = H^1(f)\\circ H^1(g)`
			: `H_1(g\\circ f) = (${sgn(w)}) = \\begin{pmatrix}${sgn(r)} & ${sgn(s)}\\end{pmatrix}\\begin{pmatrix}${sgn(p)}\\\\ ${sgn(q)}\\end{pmatrix} = H_1(g)\\circ H_1(f)`
	);
	const elements = $derived(
		showCo
			? [`${sgn(p * r + q * s)}`, `(${sgn(r)},${sgn(s)})`, '1']
			: ['1', `(${sgn(p)},${sgn(q)})`, `${sgn(w)}`]
	);
</script>

<div class="fc" bind:clientWidth={width}>
	<Svg viewBox="0 0 720 {510 + 26 * (k - 1)}" maxHeight={520} label="Spaces and maps on top; the groups and matrices that the functor assigns to them below">
		<defs>
			<linearGradient id="fc-torus" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stop-color="#6fd6e8" stop-opacity="0.22" />
				<stop offset="0.5" stop-color="#8f7cf7" stop-opacity="0.18" />
				<stop offset="1" stop-color="#ee8fbf" stop-opacity="0.2" />
			</linearGradient>
		</defs>

		<!-- row captions (no room for them on a phone, where the labels are scaled up) -->
		{#if !narrow}
			<text x="16" y="24" class="t-ui">SPACES AND CONTINUOUS MAPS</text>
			<text x="128" y={yBot - 62} class="t-ui">GROUPS AND HOMOMORPHISMS</text>
		{/if}

		<!-- composite on top -->
		<path d="M 118 70 Q 360 -52 602 70" class="arc" marker-end="url(#arrow-blue)" />
		<SvgTeX x={360} y={32} tex={'g\\circ f'} size={16 * k} color="var(--blue)" w={80 * k} h={24 * k} />

		<!-- the left circle (the loop that generates) -->
		<circle cx="110" cy={yTop} r="44" class="ring" />
		<circle cx="110" cy={yTop} r="44" class="loop" />
		<path d="M 104 84 L 116 84" marker-end="url(#arrowmid-gold)" class="tick" />
		<SvgTeX x={110} y={yTop} tex="S^1" size={17 * k} color="var(--ink)" w={40 * k} h={26 * k} />

		<!-- torus -->
		<ellipse cx={outline.outer.cx} cy={outline.outer.cy} rx={outline.outer.rx} ry={outline.outer.ry} fill="url(#fc-torus)" class="tbody" />
		<ellipse cx={outline.hole.cx} cy={outline.hole.cy} rx={outline.hole.rx} ry={outline.hole.ry} class="thole" />
		{#each grid as g, i (i)}
			<path d={g.d} class="tgrid" class:front={g.front} />
		{/each}
		{#each curve as c, i (i)}
			<path d={c.d} class="tcurve" class:front={c.front} />
		{/each}
		{#if p === 0 && q === 0}
			<circle cx={T.cx} cy={T.cy - (T.R * Math.sin(T.tilt) + T.r) * T.s} r="5" class="dot" />
		{/if}
		<SvgTeX x={360} y={yTop + 88 + 4 * (k - 1)} tex="T^2" size={17 * k} color="var(--ink)" w={40 * k} h={26 * k} />

		<!-- right circle with the composite loop -->
		<circle cx="610" cy={yTop} r="44" class="ring" />
		<path d={coilPath} class="loop" />
		<SvgTeX x={610} y={yTop} tex="S^1" size={17 * k} color="var(--ink)" w={40 * k} h={26 * k} />

		<!-- maps f, g -->
		<path d="M 164 {yTop} L 252 {yTop}" class="map" marker-end="url(#arrow-ivory)" />
		<SvgTeX x={208} y={yTop - 16 - 6 * (k - 1)} tex="f" size={16 * k} w={30 * k} h={24 * k} />
		<path d="M 470 {yTop} L 558 {yTop}" class="map" marker-end="url(#arrow-ivory)" />
		<SvgTeX x={514} y={yTop - 16 - 6 * (k - 1)} tex="g" size={16 * k} w={30 * k} h={24 * k} />

		<!-- the functor: three beams -->
		{#each [110, 360, 610] as x (x)}
			<path d="M {x} {yTop + (x === 360 ? 104 : 60)} L {x} {yBot - 30}" class="beam" marker-end="url(#arrow-gold)" />
			<g transform="translate({x} {yBot - 96})">
				<rect x={-20 * k} y={-13 * k} width={40 * k} height={26 * k} rx={13 * k} class="pill" />
				<g opacity={fade}><SvgTeX x={0} y={0} tex={Hname} size={15 * k} color="var(--gold-bright)" w={40 * k} h={24 * k} /></g>
			</g>
		{/each}

		<!-- groups -->
		{#each [[110, '\\Z'], [360, '\\Z^2'], [610, '\\Z']] as [x, t], i (i)}
			<g transform="translate({x} {yBot})">
				<rect x="-34" y={-21 * Math.min(k, 1.3)} width="68" height={42 * Math.min(k, 1.3)} rx="12" class="gnode" />
				<SvgTeX x={0} y={0} tex={String(t)} size={19 * Math.min(k, 1.4)} color="var(--ink-bright)" w={60} h={30 * k} />
				<g opacity={fade}>
					<SvgTeX x={0} y={36 + 12 * (k - 1)} tex={elements[i]} size={13 * k} color="var(--gold-bright)" w={90 * k} h={20 * k} />
				</g>
			</g>
		{/each}

		<!-- induced maps (mirrored when flipped) -->
		<g transform={mirror(234)}>
			<path d="M 150 {yBot} L 318 {yBot}" class="hom" marker-end="url(#arrow-gold)" />
		</g>
		<g opacity={fade}><SvgTeX x={234} y={yBot - 30 - 14 * (k - 1)} tex={fLabel} size={13 * k} color="var(--gold-pale)" w={110 * k} h={46 * k} /></g>
		<g transform={mirror(486)}>
			<path d="M 402 {yBot} L 570 {yBot}" class="hom" marker-end="url(#arrow-gold)" />
		</g>
		<g opacity={fade}><SvgTeX x={486} y={yBot - 30 - 14 * (k - 1)} tex={gLabel} size={13 * k} color="var(--gold-pale)" w={110 * k} h={46 * k} /></g>
		<g transform={mirror(360)}>
			<path d="M 118 {yBot + 50 + 14 * (k - 1)} Q 360 {yBot + 128 + 14 * (k - 1)} 602 {yBot + 50 + 14 * (k - 1)}" class="arc" marker-end="url(#arrow-blue)" />
		</g>
		<g opacity={fade}>
			<SvgTeX x={360} y={yBot + 100 + 20 * (k - 1)} tex={`${Hname}(g\\circ f) = (${sgn(w)})`} size={14 * k} color="var(--blue)" w={200 * k} h={24 * k} />
		</g>
	</Svg>

	<div class="readout" aria-live="polite">
		<TeX tex={readout} display />
		<p class="ui note">
			{#if showCo}
				Arrows turned around, matrices transposed, and the order of composition reversed — yet the composite still matches.
			{:else}
				The loop goes {p} time{Math.abs(p) === 1 ? '' : 's'} around one way and {q} around the other; the composite winds {w} time{Math.abs(w) === 1 ? '' : 's'} around the last circle.
			{/if}
		</p>
	</div>

	<Controls>
		<div class="group">
			<span class="cap ui">loop <TeX tex="f" /></span>
			<Stepper bind:value={p} min={-3} max={3} label="p" />
			<Stepper bind:value={q} min={-3} max={3} label="q" />
		</div>
		<div class="group">
			<span class="cap ui">map <TeX tex="g" /></span>
			<Stepper bind:value={r} min={-3} max={3} label="r" />
			<Stepper bind:value={s} min={-3} max={3} label="s" />
		</div>
		{#if mode === 'contravariant'}
			<Segmented
				bind:value={which}
				onchange={setWhich}
				label="Which functor"
				options={[
					{ value: 'H1', label: 'Homology H₁' },
					{ value: 'Hc', label: 'Cohomology H¹' }
				]}
			/>
		{/if}
	</Controls>
</div>

<style>
	.fc {
		padding-top: 0.8rem;
	}
	.ring {
		fill: rgba(116, 169, 255, 0.05);
		stroke: rgba(235, 229, 213, 0.35);
		stroke-width: 7;
	}
	.loop {
		fill: none;
		stroke: #f2d08f;
		stroke-width: 2.4;
		stroke-linejoin: round;
		filter: url(#glow);
	}
	.tick {
		stroke: #f2d08f;
		stroke-width: 2.4;
		fill: none;
	}
	.tbody {
		stroke: rgba(164, 147, 255, 0.5);
		stroke-width: 1.2;
	}
	.thole {
		fill: #0a1020;
		stroke: rgba(164, 147, 255, 0.35);
		stroke-width: 1;
	}
	.tgrid {
		fill: none;
		stroke: rgba(191, 228, 255, 0.08);
		stroke-width: 0.8;
	}
	.tgrid.front {
		stroke: rgba(191, 228, 255, 0.22);
	}
	.tcurve {
		fill: none;
		stroke: rgba(242, 208, 143, 0.32);
		stroke-width: 1.6;
		stroke-dasharray: 3 4;
	}
	.tcurve.front {
		stroke: #f2d08f;
		stroke-width: 2.6;
		stroke-dasharray: none;
		filter: url(#glow);
	}
	.dot {
		fill: #f2d08f;
		filter: url(#glow);
	}
	.map {
		stroke: #ebe5d5;
		stroke-width: 2;
		fill: none;
	}
	.arc {
		fill: none;
		stroke: #74a9ff;
		stroke-width: 1.8;
		stroke-dasharray: 6 5;
	}
	.beam {
		stroke: rgba(242, 208, 143, 0.55);
		stroke-width: 2;
		stroke-dasharray: 2 6;
		stroke-linecap: round;
		fill: none;
	}
	.pill {
		fill: #0b1122;
		stroke: rgba(242, 208, 143, 0.6);
		stroke-width: 1.2;
	}
	.gnode {
		fill: rgba(18, 26, 47, 0.95);
		stroke: rgba(242, 208, 143, 0.55);
		stroke-width: 1.4;
		filter: url(#glow);
	}
	.hom {
		stroke: #f2d08f;
		stroke-width: 2.2;
		fill: none;
	}
	.readout {
		padding: 0 1.2rem 0.6rem;
		text-align: center;
	}
	.note {
		margin: -0.4rem 0 0.4rem;
		font-size: 0.8rem;
		color: var(--ink-dim);
	}
	.group {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.3rem 0.8rem;
	}
	.cap {
		font-size: 0.74rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--gold);
	}
	/* a phone: each group (caption and its two steppers) on one line, the captions in a column */
	@container figure (max-width: 30rem) {
		.group {
			flex-wrap: nowrap;
			gap: 0.3rem 0.5rem;
		}
		.cap {
			min-width: 3.3rem;
		}
	}
</style>
