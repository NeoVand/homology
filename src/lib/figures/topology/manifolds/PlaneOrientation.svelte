<script lang="ts">
	// Orientation of the plane. Drag two vectors u and v. If turning u towards v
	// the short way is anticlockwise, the ordered pair (u, v) is positively
	// oriented and det(u, v) > 0; if clockwise, det(u, v) < 0; if they lie on
	// one line they are not a basis at all.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';

	const C: [number, number] = [210, 158];
	const S = 46; // pixels per unit
	const LIM = 2.9;

	let u = $state<[number, number]>([2, 0.5]);
	let v = $state<[number, number]>([0.75, 1.75]);
	let drag: 'u' | 'v' | null = null;
	let svg = $state<SVGSVGElement>();

	const X = (x: number) => C[0] + S * x;
	const Y = (y: number) => C[1] - S * y;
	const det = $derived(u[0] * v[1] - u[1] * v[0]);
	const kind = $derived(Math.abs(det) < 0.06 ? 'flat' : det > 0 ? 'pos' : 'neg');
	const handles = $derived([
		{ name: 'u' as const, w: u },
		{ name: 'v' as const, w: v }
	]);

	function pos(e: PointerEvent) {
		if (!svg || !drag) return;
		const pt = svg.createSVGPoint();
		pt.x = e.clientX;
		pt.y = e.clientY;
		const m = svg.getScreenCTM();
		if (!m) return;
		const q = pt.matrixTransform(m.inverse());
		const snap = (t: number) => Math.round(Math.max(-LIM, Math.min(LIM, t)) * 4) / 4;
		const w: [number, number] = [snap((q.x - C[0]) / S), snap((C[1] - q.y) / S)];
		if (w[0] === 0 && w[1] === 0) return;
		if (drag === 'u') u = w;
		else v = w;
	}

	// the turning arc from u towards v, the short way round
	const arc = $derived.by(() => {
		const a = Math.atan2(u[1], u[0]);
		let d = Math.atan2(v[1], v[0]) - a;
		while (d > Math.PI) d -= 2 * Math.PI;
		while (d < -Math.PI) d += 2 * Math.PI;
		const r = 0.62;
		const n = 28;
		const pts: string[] = [];
		for (let i = 0; i <= n; i++) {
			const t = a + (d * i) / n;
			pts.push(`${i ? 'L' : 'M'}${X(r * Math.cos(t)).toFixed(1)} ${Y(r * Math.sin(t)).toFixed(1)}`);
		}
		return pts.join(' ');
	});
	// the parallelogram spanned by u and v
	const para = $derived(`M ${X(0)} ${Y(0)} L ${X(u[0])} ${Y(u[1])} L ${X(u[0] + v[0])} ${Y(u[1] + v[1])} L ${X(v[0])} ${Y(v[1])} Z`);
	const f = (x: number) => {
		const s = Number.isInteger(x) ? String(x) : x.toFixed(2).replace(/0$/, '');
		return s.replace('-', '−');
	};
	function keyMove(which: 'u' | 'v', e: KeyboardEvent) {
		const d: Record<string, [number, number]> = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, 0.25], ArrowDown: [0, -0.25] };
		const s = d[e.key];
		if (!s) return;
		e.preventDefault();
		const w = which === 'u' ? u : v;
		const nw: [number, number] = [Math.max(-LIM, Math.min(LIM, w[0] + s[0])), Math.max(-LIM, Math.min(LIM, w[1] + s[1]))];
		if (which === 'u') u = nw;
		else v = nw;
	}
</script>

<div class="wrap">
	<Svg
		bind:svg
		viewBox="0 0 420 316"
		maxHeight={380}
		label="Two draggable arrows u and v from the origin, the parallelogram they span, and a curved arrow turning from u to v"
		onpointermove={pos}
		onpointerup={() => (drag = null)}
		onpointerleave={() => (drag = null)}
	>
		{#each [-3, -2, -1, 1, 2, 3] as k (k)}
			<line x1={X(k)} y1={Y(-3.2)} x2={X(k)} y2={Y(3.2)} class="grid" />
			<line x1={X(-4.4)} y1={Y(k)} x2={X(4.4)} y2={Y(k)} class="grid" />
		{/each}
		<line x1={X(-4.4)} y1={Y(0)} x2={X(4.4)} y2={Y(0)} class="axis" />
		<line x1={X(0)} y1={Y(-3.2)} x2={X(0)} y2={Y(3.2)} class="axis" />
		<path d={para} class="para {kind}" />
		{#if kind !== 'flat'}
			<path d={arc} class="turn {kind}" marker-end={kind === 'pos' ? 'url(#arrow-green)' : 'url(#arrow-rose)'} />
		{/if}
		<line x1={X(0)} y1={Y(0)} x2={X(u[0])} y2={Y(u[1])} class="vec gold" marker-end="url(#arrow-gold)" />
		<line x1={X(0)} y1={Y(0)} x2={X(v[0])} y2={Y(v[1])} class="vec teal" marker-end="url(#arrow-teal)" />
		<SvgTeX x={X(u[0] * 1.13) + 10} y={Y(u[1] * 1.13) - 4} tex="u" size={16} color="var(--gold-bright)" w={20} h={22} />
		<SvgTeX x={X(v[0] * 1.13) + 10} y={Y(v[1] * 1.13) - 4} tex="v" size={16} color="var(--teal)" w={20} h={22} />
		{#each handles as h (h.name)}
			<circle
				cx={X(h.w[0])}
				cy={Y(h.w[1])}
				r="17"
				class="handle"
				role="slider"
				tabindex="0"
				aria-label="tip of the vector {h.name}; arrow keys move it"
				aria-valuenow={h.w[0]}
				aria-valuetext="({h.w[0]}, {h.w[1]})"
				onpointerdown={(e) => {
					drag = h.name;
					(e.target as Element).setPointerCapture?.(e.pointerId);
				}}
				onkeydown={(e) => keyMove(h.name, e)}
			/>
		{/each}
	</Svg>
	<div class="readout ui {kind}" aria-live="polite">
		<span>
			<TeX tex={`\\det(u, v) = (${f(u[0])})(${f(v[1])}) - (${f(u[1])})(${f(v[0])}) = ${f(Math.round(det * 10000) / 10000)}`} />
		</span>
		<span class="verdict">
			{#if kind === 'pos'}
				Turning from u to v is anticlockwise: a <strong>positive</strong> basis.
			{:else if kind === 'neg'}
				Turning from u to v is clockwise: a <strong>negative</strong> basis.
			{:else}
				u and v lie on one line: they are not a basis, and have no orientation.
			{/if}
		</span>
	</div>
	<Controls>
		<Button onclick={() => ([u, v] = [v, u])}>Swap u and v</Button>
		<Button onclick={() => (v = [-v[0], -v[1]])}>Reverse v</Button>
		<Button onclick={() => ((u = [u[0], -u[1]]), (v = [v[0], -v[1]]))}>Reflect in the horizontal axis</Button>
	</Controls>
</div>

<style>
	.grid {
		stroke: rgba(235, 229, 213, 0.06);
		stroke-width: 1;
	}
	.axis {
		stroke: var(--ink-faint);
		stroke-width: 1.2;
	}
	.para {
		stroke: none;
		transition: fill 0.2s;
	}
	.para.pos {
		fill: rgba(132, 217, 162, 0.13);
	}
	.para.neg {
		fill: rgba(242, 141, 182, 0.13);
	}
	.para.flat {
		fill: none;
	}
	.turn {
		fill: none;
		stroke-width: 2.2;
	}
	.turn.pos {
		stroke: var(--green);
	}
	.turn.neg {
		stroke: var(--rose);
	}
	.vec {
		stroke-width: 2.6;
		stroke-linecap: round;
	}
	.vec.gold {
		stroke: var(--gold-bright);
	}
	.vec.teal {
		stroke: var(--teal);
	}
	.handle {
		fill: rgba(242, 208, 143, 0.1);
		stroke: rgba(242, 208, 143, 0.4);
		stroke-width: 1;
		cursor: grab;
		touch-action: none;
		outline: none;
	}
	.handle:focus-visible {
		stroke: var(--gold-bright);
		stroke-width: 2;
	}
	.readout {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.3rem 1.2rem;
		padding: 0.55rem 1.2rem 0.7rem;
		font-size: 0.88rem;
		color: var(--ink-dim);
		border-top: 1px solid var(--line-faint);
	}
	.readout.pos .verdict strong {
		color: var(--green);
	}
	.readout.neg .verdict strong {
		color: var(--rose);
	}
</style>
