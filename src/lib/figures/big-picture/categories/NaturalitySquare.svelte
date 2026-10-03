<script lang="ts">
	// Figure: V → V** is natural; the basis-dependent V → V* is not.
	// Pick a change of perspective T and drag a vector v; compare the two routes
	// around each square.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { apply, transpose2, inverse2, evSquare, betaSquare, isOrthogonal, presetsT, type V2 } from './naturality';

	let tId = $state('shear');
	const preset = $derived(presetsT.find((p) => p.id === tId)!);
	const T = $derived(preset.T);
	let v = $state<V2>([1, 1]);

	const ev = $derived(evSquare(T, v));
	const be = $derived(betaSquare(T, v)!);
	const Tv = $derived(apply(T, v));
	const natural = $derived(isOrthogonal(T));
	const route1 = $derived(apply(transpose2(inverse2(T)!), v)); // (T⁻¹)ᵀ v

	// plane geometry
	const S = 34;
	const C = 160;
	const X = (x: number) => C + x * S;
	const Y = (y: number) => C - y * S;
	let svgEl = $state<SVGSVGElement>();
	let dragging = false;

	function toPlane(e: PointerEvent): V2 | null {
		if (!svgEl) return null;
		const pt = svgEl.createSVGPoint();
		pt.x = e.clientX;
		pt.y = e.clientY;
		const m = svgEl.getScreenCTM();
		if (!m) return null;
		const q = pt.matrixTransform(m.inverse());
		const snap = (t: number) => Math.max(-3, Math.min(3, Math.round(t * 4) / 4));
		return [snap((q.x - C) / S), snap((C - q.y) / S)];
	}
	function down(e: PointerEvent) {
		dragging = true;
		(e.target as Element).setPointerCapture?.(e.pointerId);
		const p = toPlane(e);
		if (p && (p[0] || p[1])) v = p;
	}
	function move(e: PointerEvent) {
		if (!dragging) return;
		const p = toPlane(e);
		if (p && (p[0] || p[1])) v = p;
	}
	function up() {
		dragging = false;
	}
	function key(e: KeyboardEvent) {
		const d: Record<string, V2> = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, 0.25], ArrowDown: [0, -0.25] };
		const s = d[e.key];
		if (!s) return;
		e.preventDefault();
		const nv: V2 = [Math.max(-3, Math.min(3, v[0] + s[0])), Math.max(-3, Math.min(3, v[1] + s[1]))];
		if (nv[0] || nv[1]) v = nv;
	}

	/** level lines a·x + b·y = k of the covector (a, b), as segments (clipped later) */
	function stack(c: V2): { x1: number; y1: number; x2: number; y2: number }[] {
		const n2 = c[0] * c[0] + c[1] * c[1];
		if (n2 < 1e-9) return [];
		const n = Math.sqrt(n2);
		const d: V2 = [-c[1] / n, c[0] / n];
		const K = Math.min(14, Math.ceil(n * 5));
		const out = [];
		for (let k = -K; k <= K; k++) {
			const p0: V2 = [(k * c[0]) / n2, (k * c[1]) / n2];
			out.push({ x1: X(p0[0] - 8 * d[0]), y1: Y(p0[1] - 8 * d[1]), x2: X(p0[0] + 8 * d[0]), y2: Y(p0[1] + 8 * d[1]) });
		}
		return out;
	}
	const stackDown = $derived(stack(be.down)); // β(Tv)
	const stackAcross = $derived(stack(route1)); // (T⁻¹)* β(v)

	const f = (x: number) => {
		const r = Math.round(x * 100) / 100;
		const s = Number.isInteger(r) ? String(r) : r.toFixed(2).replace(/0$/, '');
		return s.startsWith('-') ? '-' + s.slice(1) : s;
	};
	const vec = (a: V2) => `(${f(a[0])},\\,${f(a[1])})`;
	const same = (a: V2, b: V2) => Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9;

	function arrowHead(x0: number, y0: number, x1: number, y1: number) {
		return `M ${X(x0)} ${Y(y0)} L ${X(x1)} ${Y(y1)}`;
	}
</script>

<div class="nat">
	<div class="cols">
		<div class="plane">
			<Svg viewBox="0 0 320 320" maxHeight={340} label="The plane with the vector v, its image Tv, and two covectors drawn as stacks of lines" bind:svg={svgEl} onpointermove={move} onpointerup={up} onpointerleave={up}>
				<defs>
					<clipPath id="nat-clip"><rect x="8" y="8" width="304" height="304" rx="10" /></clipPath>
				</defs>
				<rect x="8" y="8" width="304" height="304" rx="10" class="bg" />
				<g clip-path="url(#nat-clip)">
					{#each Array.from({ length: 9 }, (_, i) => i - 4) as k (k)}
						<line x1={X(k)} y1="8" x2={X(k)} y2="312" class="gridl" />
						<line x1="8" y1={Y(k)} x2="312" y2={Y(k)} class="gridl" />
					{/each}
					<line x1="8" y1={C} x2="312" y2={C} class="axis" />
					<line x1={C} y1="8" x2={C} y2="312" class="axis" />
					{#each stackAcross as l, i (i)}
						<line {...l} class="st across" />
					{/each}
					{#each stackDown as l, i (i)}
						<line {...l} class="st down" />
					{/each}
				</g>
				<path d={arrowHead(0, 0, Tv[0], Tv[1])} class="vec tv" marker-end="url(#arrow-blue)" />
				<path d={arrowHead(0, 0, v[0], v[1])} class="vec" marker-end="url(#arrow-gold)" />
				<SvgTeX x={X(Tv[0]) + 14} y={Y(Tv[1]) - 12} tex="Tv" size={14} color="var(--blue)" w={40} h={22} />
				<SvgTeX x={X(v[0]) + 12} y={Y(v[1]) - 12} tex="v" size={15} color="var(--gold-bright)" w={30} h={22} />
				<circle
					cx={X(v[0])}
					cy={Y(v[1])}
					r="16"
					class="handle"
					role="slider"
					tabindex="0"
					aria-label="vector v; arrow keys move it"
					aria-valuenow={v[0]}
					aria-valuetext="({v[0]}, {v[1]})"
					onpointerdown={down}
					onkeydown={key}
				/>
				<circle cx={X(v[0])} cy={Y(v[1])} r="6" class="knob" />
			</Svg>
			<div class="legend ui">
				<span><i class="sw down"></i><TeX tex={'\\beta(Tv)'} /></span>
				<span><i class="sw across"></i><TeX tex={'(T^{-1})^*\\beta(v)'} /></span>
			</div>
		</div>

		<div class="squares">
			<!-- the evaluation square -->
			<div class="sq">
				<div class="sq-title ui">Evaluation <TeX tex={'V\\to V^{**}'} /> — no choices</div>
				<Svg viewBox="0 0 300 190" maxHeight={210} label="Naturality square for evaluation">
					<SvgTeX x={50} y={30} tex={`v=${vec(v)}`} size={13} w={100} h={22} />
					<SvgTeX x={244} y={30} tex={'\\mathrm{ev}_v'} size={13} w={100} h={22} />
					<SvgTeX x={50} y={160} tex={`Tv=${vec(ev.down)}`} size={13} color="var(--blue)" w={110} h={22} />
					<SvgTeX x={244} y={160} tex={'\\mathrm{ev}_{Tv}'} size={13} color="var(--green)" w={100} h={22} />
					<path d="M 104 30 L 210 30" class="ar" marker-end="url(#arrow-ivory)" />
					<SvgTeX x={157} y={16} tex={'\\mathrm{ev}'} size={12} w={40} h={18} />
					<path d="M 104 160 L 210 160" class="ar" marker-end="url(#arrow-ivory)" />
					<SvgTeX x={157} y={146} tex={'\\mathrm{ev}'} size={12} w={40} h={18} />
					<path d="M 50 46 L 50 142" class="ar" marker-end="url(#arrow-blue)" />
					<SvgTeX x={36} y={95} tex="T" size={13} color="var(--blue)" w={20} h={18} />
					<path d="M 244 46 L 244 142" class="ar" marker-end="url(#arrow-blue)" />
					<SvgTeX x={268} y={95} tex={'T^{**}'} size={13} color="var(--blue)" w={40} h={18} />
				</Svg>
				<div class="routes ui">
					<div><span class="r">→ then ↓</span> <TeX tex={`T^{**}(\\mathrm{ev}_v) \\leftrightarrow ${vec(ev.across)}`} /></div>
					<div><span class="r">↓ then →</span> <TeX tex={`\\mathrm{ev}_{Tv} \\leftrightarrow ${vec(ev.down)}`} /></div>
					<div class="verdict ok">✓ commutes</div>
				</div>
			</div>

			<!-- the basis square -->
			<div class="sq">
				<div class="sq-title ui">Dual basis <TeX tex={'\\beta\\colon V\\to V^{*}'} /> — uses a basis</div>
				<Svg viewBox="0 0 300 190" maxHeight={210} label="The square for the basis-dependent map">
					<SvgTeX x={50} y={30} tex={`v=${vec(v)}`} size={13} w={100} h={22} />
					<SvgTeX x={244} y={30} tex={'\\beta(v)'} size={13} w={100} h={22} />
					<SvgTeX x={50} y={160} tex={`Tv=${vec(be.down)}`} size={13} color="var(--blue)" w={110} h={22} />
					<SvgTeX x={244} y={160} tex="?" size={15} color={natural ? 'var(--green)' : 'var(--rose)'} w={40} h={22} />
					<path d="M 104 30 L 210 30" class="ar" marker-end="url(#arrow-ivory)" />
					<SvgTeX x={157} y={16} tex={'\\beta'} size={12} w={40} h={18} />
					<path d="M 104 160 L 210 160" class="ar" marker-end="url(#arrow-ivory)" />
					<SvgTeX x={157} y={146} tex={'\\beta'} size={12} w={40} h={18} />
					<path d="M 50 46 L 50 142" class="ar" marker-end="url(#arrow-blue)" />
					<SvgTeX x={36} y={95} tex="T" size={13} color="var(--blue)" w={20} h={18} />
					<path d="M 244 46 L 244 142" class="ar" marker-end="url(#arrow-blue)" />
					<SvgTeX x={276} y={95} tex={'(T^{-1})^{*}'} size={12} color="var(--blue)" w={56} h={18} />
				</Svg>
				<div class="routes ui">
					<div><span class="r">→ then ↓</span> <TeX tex={`(T^{-1})^*\\beta(v) \\leftrightarrow ${vec(be.across)}`} /></div>
					<div><span class="r">↓ then →</span> <TeX tex={`\\beta(Tv) \\leftrightarrow ${vec(be.down)}`} /></div>
					{#if same(be.across, be.down)}
						<div class="verdict ok">✓ commutes {natural ? '(T keeps lengths and angles)' : 'for this v'}</div>
					{:else}
						<div class="verdict bad">✗ the two routes disagree</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
	<Controls>
		<span class="cap ui">change of perspective <TeX tex="T" /> =</span>
		<Segmented bind:value={tId} label="Change of perspective T" options={presetsT.map((p) => ({ value: p.id, label: p.label }))} />
		<span class="mat"><TeX tex={preset.tex} /></span>
	</Controls>
</div>

<style>
	.nat {
		padding-top: 0.8rem;
	}
	.cols {
		display: grid;
		grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
		gap: 0.4rem 1rem;
		padding: 0 0.8rem;
		align-items: start;
	}
	@media (max-width: 760px) {
		.cols {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.bg {
		fill: rgba(5, 9, 18, 0.55);
		stroke: rgba(216, 178, 110, 0.18);
	}
	.gridl {
		stroke: rgba(191, 228, 255, 0.06);
	}
	.axis {
		stroke: rgba(235, 229, 213, 0.25);
		stroke-width: 1;
	}
	.st {
		stroke-width: 1.6;
		transition: all 0.3s var(--ease);
	}
	.st.down {
		stroke: rgba(95, 214, 207, 0.75);
	}
	.st.across {
		stroke: rgba(164, 147, 255, 0.85);
		stroke-dasharray: 5 4;
		stroke-width: 2.2;
	}
	.vec {
		stroke: #f2d08f;
		stroke-width: 2.6;
		fill: none;
	}
	.vec.tv {
		stroke: #74a9ff;
	}
	.handle {
		fill: rgba(242, 208, 143, 0.12);
		stroke: rgba(242, 208, 143, 0.5);
		cursor: grab;
		touch-action: none;
	}
	.knob {
		fill: #f2d08f;
		pointer-events: none;
		filter: url(#glow);
	}
	.legend {
		display: flex;
		gap: 1.2rem;
		justify-content: center;
		font-size: 0.78rem;
		color: var(--ink-dim);
		margin: 0.2rem 0 0.4rem;
	}
	.sw {
		display: inline-block;
		width: 1.4rem;
		height: 0;
		border-top: 2px solid;
		vertical-align: middle;
		margin-right: 0.35rem;
	}
	.sw.down {
		border-color: rgba(95, 214, 207, 0.9);
	}
	.sw.across {
		border-color: #a493ff;
		border-top-style: dashed;
	}
	.squares {
		display: grid;
		gap: 0.6rem;
	}
	.sq {
		border: 1px solid var(--line-faint);
		border-radius: 10px;
		padding: 0.5rem 0.6rem 0.4rem;
		background: rgba(5, 9, 18, 0.35);
	}
	.sq-title {
		font-size: 0.74rem;
		letter-spacing: 0.05em;
		color: var(--gold);
		text-align: center;
	}
	.ar {
		stroke: #ebe5d5;
		stroke-width: 1.6;
		fill: none;
	}
	.routes {
		display: grid;
		gap: 0.1rem;
		font-size: 0.82rem;
		color: var(--ink);
		justify-items: center;
	}
	.r {
		color: var(--ink-faint);
		font-size: 0.72rem;
		margin-right: 0.3rem;
	}
	.verdict {
		font-weight: 650;
		font-size: 0.8rem;
		margin-top: 0.15rem;
	}
	.ok {
		color: var(--green);
	}
	.bad {
		color: var(--rose);
	}
	.cap {
		font-size: 0.78rem;
		color: var(--ink-dim);
	}
	.mat {
		font-size: 0.85rem;
	}
</style>
