<script lang="ts">
	// Figure: barycentric coordinates. Drag a point around a triangle; its three
	// coordinates are the weights you would hang on the corners to balance it there,
	// and also the shares of the area cut out by joining it to the corners.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	type P = [number, number];
	const V: P[] = [
		[110, 352],
		[530, 352],
		[320, 66]
	];
	const col = ['var(--gold-bright)', 'var(--teal)', 'var(--violet)'];
	const hex = ['#f2d08f', '#5fd6cf', '#a493ff'];

	let t = $state<[number, number, number]>([0.25, 0.35, 0.4]);
	let showAreas = $state(true);
	let svgEl = $state<SVGSVGElement>();
	let dragging = $state(false);
	let cw = $state(640);
	/** labels grow on narrow screens, where the drawing is scaled down */
	const k = $derived(cw < 560 ? 1.55 : 1);

	const area2 = (a: P, b: P, c: P) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
	const A = area2(V[0], V[1], V[2]);
	const toPoint = (w: number[]): P => [
		w[0] * V[0][0] + w[1] * V[1][0] + w[2] * V[2][0],
		w[0] * V[0][1] + w[1] * V[1][1] + w[2] * V[2][1]
	];
	const p = $derived(toPoint(t));

	function bary(q: P): [number, number, number] {
		const a0 = area2(q, V[1], V[2]) / A;
		const a1 = area2(V[0], q, V[2]) / A;
		return [a0, a1, 1 - a0 - a1];
	}

	/** snap to corners and sides when close, so faces are easy to land on */
	function snap(w: [number, number, number]): [number, number, number] {
		const q = toPoint(w);
		for (let i = 0; i < 3; i++) {
			if (Math.hypot(q[0] - V[i][0], q[1] - V[i][1]) < 16) return [0, 1, 2].map((j) => (j === i ? 1 : 0)) as [number, number, number];
		}
		for (let i = 0; i < 3; i++) {
			// side opposite vertex i: coordinate i near zero (scaled by that side's height)
			const j = (i + 1) % 3;
			const k = (i + 2) % 3;
			const h = Math.abs(A) / Math.hypot(V[j][0] - V[k][0], V[j][1] - V[k][1]);
			if (Math.abs(w[i] * h) < 9 && w[j] >= -0.02 && w[k] >= -0.02) {
				const s = Math.min(1, Math.max(0, w[j] / (w[j] + w[k] || 1)));
				const out: [number, number, number] = [0, 0, 0];
				out[j] = s;
				out[k] = 1 - s;
				return out;
			}
		}
		return w;
	}

	function svgPoint(e: PointerEvent): P | null {
		if (!svgEl) return null;
		const m = svgEl.getScreenCTM();
		if (!m) return null;
		const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
		return [Math.min(630, Math.max(10, pt.x)), Math.min(410, Math.max(10, pt.y))];
	}
	function moveTo(e: PointerEvent) {
		const q = svgPoint(e);
		if (q) t = snap(bary(q));
	}
	function down(e: PointerEvent) {
		dragging = true;
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		e.preventDefault();
	}
	function move(e: PointerEvent) {
		if (dragging) moveTo(e);
	}
	function up() {
		dragging = false;
	}
	function key(e: KeyboardEvent) {
		const d: Record<string, P> = { ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, -8], ArrowDown: [0, 8] };
		const s = d[e.key];
		if (!s) return;
		e.preventDefault();
		t = snap(bary([p[0] + s[0], p[1] + s[1]]));
	}

	const fmt = (x: number) => (Math.abs(x) < 0.005 ? '0' : x.toFixed(2));
	const where = $derived.by(() => {
		const zero = t.map((x) => Math.abs(x) < 0.005);
		const neg = t.map((x) => x < -0.005);
		if (neg.some(Boolean)) {
			const i = neg.indexOf(true);
			return { kind: 'outside', text: `outside the triangle, because t${'₀₁₂'[i]} is negative` };
		}
		const nz = zero.filter(Boolean).length;
		if (nz === 2) {
			const i = zero.indexOf(false);
			return { kind: 'vertex', text: `at the corner v${'₀₁₂'[i]}: a 0-dimensional face`, face: [i] };
		}
		if (nz === 1) {
			const i = zero.indexOf(true);
			const f = [0, 1, 2].filter((j) => j !== i);
			return { kind: 'edge', text: `on the edge [v${'₀₁₂'[f[0]]}, v${'₀₁₂'[f[1]]}]: a 1-dimensional face (t${'₀₁₂'[i]} = 0)`, face: f };
		}
		return { kind: 'inside', text: 'inside the triangle: all three coordinates are positive' };
	});
	const sub = (i: number): P[] => V.map((v, j) => (j === i ? p : v));
</script>

<div class="wrap" bind:clientWidth={cw}>
	<Svg viewBox="0 0 640 420" maxHeight={430} bind:svg={svgEl} label="A triangle with a draggable point and its three barycentric coordinates">
		<!-- the three sub-triangles: each has area proportional to the weight of the opposite corner -->
		{#if showAreas && where.kind !== 'outside'}
			{#each [0, 1, 2] as i (i)}
				<polygon points={sub(i).map((q) => q.join(',')).join(' ')} fill={hex[i]} fill-opacity="0.13" stroke="none" />
			{/each}
		{/if}
		<polygon points={V.map((q) => q.join(',')).join(' ')} class="tri" />
		{#if where.kind === 'edge' && where.face}
			{@const [a, b] = where.face}
			<line x1={V[a][0]} y1={V[a][1]} x2={V[b][0]} y2={V[b][1]} class="face-glow" />
		{/if}
		<!-- spokes -->
		{#each V as v, i (i)}
			<line x1={v[0]} y1={v[1]} x2={p[0]} y2={p[1]} stroke={hex[i]} stroke-opacity="0.45" stroke-width="1.4" stroke-dasharray="4 4" />
		{/each}
		<!-- weights hung at the corners -->
		{#each V as v, i (i)}
			{@const w = Math.max(0, t[i])}
			<circle cx={v[0]} cy={v[1]} r={8 + 30 * Math.sqrt(w)} fill={hex[i]} fill-opacity="0.16" stroke={hex[i]} stroke-opacity="0.55" stroke-width="1.2" class="mass" />
			<circle cx={v[0]} cy={v[1]} r="7" fill={hex[i]} class:hot={where.kind === 'vertex' && where.face?.[0] === i} />
			<SvgTeX
				x={v[0] + (i === 2 ? 0 : i === 0 ? -6 : 6) * k}
				y={v[1] + (i === 2 ? -40 : 40) * (k > 1 ? 1.1 : 1)}
				tex={`v_${i}`}
				color={col[i]}
				size={19 * k}
				w={60 * k}
				h={30 * k}
			/>
			{#if k === 1}
				<SvgTeX
					x={v[0] + (i === 2 ? 92 : i === 0 ? -6 : 6)}
					y={v[1] + (i === 2 ? -40 : 64)}
					tex={`t_${i} = ${fmt(t[i])}`}
					color={t[i] < -0.005 ? 'var(--rose)' : col[i]}
					size={16}
					w={130}
					h={28}
				/>
			{/if}
		{/each}
		<!-- the point -->
		<g
			class="handle"
			class:dragging
			role="slider"
			tabindex="0"
			aria-label="Point inside the triangle; use arrow keys to move"
			aria-valuemin={0}
			aria-valuemax={100}
			aria-valuenow={Math.round(t[0] * 100)}
			aria-valuetext={`t0 ${fmt(t[0])}, t1 ${fmt(t[1])}, t2 ${fmt(t[2])}`}
			onpointerdown={down}
			onpointermove={move}
			onpointerup={up}
			onpointercancel={up}
			onkeydown={key}
		>
			<circle cx={p[0]} cy={p[1]} r={24 * k} class="hit" />
			<circle cx={p[0]} cy={p[1]} r={14 * k} class="ring" />
			<circle cx={p[0]} cy={p[1]} r={7.5 * k} class="dot" />
		</g>
		<SvgTeX x={p[0] + 26} y={p[1] - 22} tex="p" color="var(--ink-bright)" size={19 * k} w={30 * k} h={30 * k} anchor="start" />
	</Svg>
	<div class="readout ui" aria-live="polite">
		<div class="eq">
			<TeX tex={`p = ${fmt(t[0])}\\,\\textcolor{#f2d08f}{v_0} + ${fmt(t[1])}\\,\\textcolor{#5fd6cf}{v_1} + ${fmt(t[2])}\\,\\textcolor{#a493ff}{v_2}`} />
		</div>
		<div class="sum">
			<TeX tex={`t_0 + t_1 + t_2 = ${fmt(t[0] + t[1] + t[2])}`} />
		</div>
		<div class="where" class:out={where.kind === 'outside'}>The point is {where.text}.</div>
	</div>
</div>
<div class="bar ui">
	<Button variant="ghost" onclick={() => (t = [1 / 3, 1 / 3, 1 / 3])}>Centre</Button>
	<Button variant="ghost" onclick={() => (t = [0.5, 0.5, 0])}>Midpoint of an edge</Button>
	<Button variant="ghost" onclick={() => (t = [0, 0, 1])}>A corner</Button>
	<Toggle bind:checked={showAreas} label="Show areas" />
</div>

<style>
	.wrap {
		padding: 0.6rem 0.8rem 0;
	}
	.tri {
		fill: rgba(116, 169, 255, 0.05);
		stroke: rgba(235, 229, 213, 0.65);
		stroke-width: 2;
		stroke-linejoin: round;
	}
	.face-glow {
		stroke: var(--gold-bright);
		stroke-width: 5;
		stroke-linecap: round;
		filter: url(#glow);
	}
	.mass {
		transition: r 0.12s linear;
	}
	.hot {
		filter: url(#glow-strong);
	}
	.handle {
		cursor: grab;
		touch-action: none;
		outline: none;
	}
	.handle.dragging {
		cursor: grabbing;
	}
	.hit {
		fill: transparent;
	}
	.ring {
		fill: rgba(251, 246, 232, 0.08);
		stroke: rgba(251, 246, 232, 0.55);
		stroke-width: 1.4;
	}
	.handle:focus-visible .ring {
		stroke: var(--gold-bright);
		stroke-width: 2.4;
	}
	.dot {
		fill: var(--ink-bright);
		filter: url(#glow);
	}
	.readout {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.2rem 1rem 0.8rem;
		text-align: center;
	}
	.eq {
		font-size: 1.05rem;
		color: var(--ink-bright);
		max-width: 100%;
		overflow-x: auto;
	}
	.sum {
		font-size: 0.92rem;
		color: var(--ink-dim);
	}
	.where {
		font-size: 0.82rem;
		color: var(--green);
	}
	.where.out {
		color: var(--rose);
	}
	.bar {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 0.8rem;
		padding: 0.8rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
</style>
