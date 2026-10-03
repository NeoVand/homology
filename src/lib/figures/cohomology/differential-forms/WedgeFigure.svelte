<script lang="ts">
	// Figure: the wedge product dx∧dy as oriented area. Drag the tips of u and
	// v; the parallelogram they span has signed area dx∧dy(u, v) = u₁v₂ − u₂v₁,
	// positive when v is counterclockwise from u, negative (hatched) otherwise.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { clamp, fmtTeX, type Vec2 } from './calc';

	const W = 640;
	const H = 380;
	const S = 80;
	const O: Vec2 = [250, 250];
	const px = (p: Vec2): Vec2 => [O[0] + p[0] * S, O[1] - p[1] * S];
	const wx = (x: number, y: number): Vec2 => [(x - O[0]) / S, (O[1] - y) / S];
	const snap = (v: number) => Math.round(v * 4) / 4;

	let u = $state<Vec2>([2, 0.5]);
	let v = $state<Vec2>([0.75, 1.75]);

	const det = $derived(u[0] * v[1] - u[1] * v[0]);
	const sign = $derived(det > 1e-9 ? 1 : det < -1e-9 ? -1 : 0);
	const poly = $derived([px([0, 0]), px(u), px([u[0] + v[0], u[1] + v[1]]), px(v)]);
	const polyStr = $derived(poly.map((p) => p.join(',')).join(' '));

	// orientation arc from u to v around the origin
	const arc = $derived.by(() => {
		const a0 = Math.atan2(u[1], u[0]);
		let da = Math.atan2(v[1], v[0]) - a0;
		while (da > Math.PI) da -= 2 * Math.PI;
		while (da < -Math.PI) da += 2 * Math.PI;
		const r = 0.55;
		const pts: Vec2[] = [];
		for (let i = 0; i <= 30; i++) {
			const a = a0 + (da * i) / 30;
			pts.push(px([r * Math.cos(a), r * Math.sin(a)]));
		}
		const e = pts[pts.length - 1];
		const p = pts[pts.length - 2];
		const L = Math.hypot(e[0] - p[0], e[1] - p[1]) || 1;
		const ux = (e[0] - p[0]) / L;
		const uy = (e[1] - p[1]) / L;
		return {
			d: 'M ' + pts.map((q) => q.join(' ')).join(' L '),
			head: `M ${e[0] - ux * 8 - uy * 5} ${e[1] - uy * 8 + ux * 5} L ${e[0]} ${e[1]} L ${e[0] - ux * 8 + uy * 5} ${e[1] - uy * 8 - ux * 5}`,
			show: Math.abs(da) > 0.15
		};
	});

	let svg: SVGSVGElement | undefined = $state();
	let drag: 'u' | 'v' | null = null;
	function down(e: PointerEvent, w: 'u' | 'v') {
		drag = w;
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		e.preventDefault();
	}
	function move(e: PointerEvent) {
		if (!drag || !svg) return;
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM()!.inverse());
		const q = wx(p.x, p.y);
		const val: Vec2 = [clamp(snap(q[0]), -3, 4.5), clamp(snap(q[1]), -2.5, 2.75)];
		if (drag === 'u') u = val;
		else v = val;
	}
	function key(e: KeyboardEvent, w: 'u' | 'v') {
		const m: Record<string, Vec2> = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, 0.25], ArrowDown: [0, -0.25] };
		const d = m[e.key];
		if (!d) return;
		e.preventDefault();
		const cur = w === 'u' ? u : v;
		const val: Vec2 = [clamp(cur[0] + d[0], -3, 4.5), clamp(cur[1] + d[1], -2.5, 2.75)];
		if (w === 'u') u = val;
		else v = val;
	}
	const grid = (() => {
		let d = '';
		for (let x = -3; x <= 4.5; x += 0.5) d += `M ${px([x, -3])[0]} 0 V ${H} `;
		for (let y = -2.5; y <= 3; y += 0.5) d += `M 0 ${px([0, y])[1]} H ${W} `;
		return d;
	})();
	const n = (x: number) => fmtTeX(x, 2).replace(/\.?0+$/, '') || '0';
</script>

<div class="wedge">
	<Svg bind:svg viewBox="0 0 {W} {H}" maxHeight={460} label="Two draggable vectors u and v and the parallelogram they span, shaded by its signed area.">
		<defs>
			<pattern id="wedge-hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
				<rect width="8" height="8" fill="rgba(242,141,182,0.12)" />
				<line x1="0" y1="0" x2="0" y2="8" stroke="rgba(242,141,182,0.55)" stroke-width="2" />
			</pattern>
		</defs>
		<path d={grid} class="grid" />
		<line x1="0" y1={O[1]} x2={W} y2={O[1]} class="axis" />
		<line x1={O[0]} y1="0" x2={O[0]} y2={H} class="axis" />
		<!-- unit square -->
		<rect x={O[0]} y={O[1] - S} width={S} height={S} class="unit" />
		<SvgTeX x={O[0] + S / 2} y={O[1] - S / 2} tex={'1'} color="var(--ink-faint)" size={14} w={20} h={20} />

		<polygon points={polyStr} class="para" class:neg={sign < 0} />
		{#if arc.show}
			<path d={arc.d} class="orient" class:neg={sign < 0} />
			<path d={arc.head} class="orient" class:neg={sign < 0} />
		{/if}

		<!-- vectors -->
		{#each [{ w: 'u' as const, p: u, c: 'var(--gold-bright)' }, { w: 'v' as const, p: v, c: 'var(--teal)' }] as vec (vec.w)}
			{@const t = px(vec.p)}
			<line x1={O[0]} y1={O[1]} x2={t[0]} y2={t[1]} stroke={vec.c} class="vec" marker-end={vec.w === 'u' ? 'url(#arrow-gold)' : 'url(#arrow-teal)'} />
			<g
				class="tip"
				transform="translate({t[0]} {t[1]})"
				role="slider"
				tabindex="0"
				aria-label="Vector {vec.w}: drag or use arrow keys"
				aria-valuenow={vec.p[0]}
				onpointerdown={(e) => down(e, vec.w)}
				onpointermove={move}
				onpointerup={() => (drag = null)}
				onpointercancel={() => (drag = null)}
				onkeydown={(e) => key(e, vec.w)}
			>
				<circle r="18" class="hit" />
				<circle r="11" style="stroke:{vec.c}" class="knob" />
				<SvgTeX x={14} y={-16} tex={String.raw`\mathbf ${vec.w}`} color={vec.c} size={18} w={30} h={26} />
			</g>
		{/each}
		<SvgTeX
			x={W - 120}
			y={36}
			tex={sign > 0 ? String.raw`\text{positive: } \mathbf v \text{ is counterclockwise from } \mathbf u` : sign < 0 ? String.raw`\text{negative: } \mathbf v \text{ is clockwise from } \mathbf u` : String.raw`\text{flat: no area at all}`}
			color={sign > 0 ? 'var(--gold-bright)' : sign < 0 ? 'var(--rose)' : 'var(--ink-dim)'}
			size={14}
			w={230}
			h={24}
		/>
	</Svg>
	<Controls>
		<Button variant="subtle" onclick={() => ([u, v] = [v, u])}>Swap u and v</Button>
		<Button variant="subtle" onclick={() => (v = [u[0] * 0.5, u[1] * 0.5])}>Make v parallel to u</Button>
		<Button variant="subtle" onclick={() => ((u = [2, 0.5]), (v = [0.75, 1.75]))}>Reset</Button>
	</Controls>
	<div class="readout">
		<TeX
			display
			tex={String.raw`(dx\wedge dy)(\mathbf u,\mathbf v) = u_1v_2 - u_2v_1 = (${n(u[0])})(${n(v[1])}) - (${n(u[1])})(${n(v[0])}) = \htmlClass{${sign >= 0 ? 'tx-gold' : 'tx-rose'}}{${fmtTeX(det, 4).replace(/\.?0+$/, '') || '0'}}`}
		/>
	</div>
</div>

<style>
	.grid {
		stroke: rgba(116, 169, 255, 0.08);
		stroke-width: 1;
	}
	.axis {
		stroke: rgba(235, 229, 213, 0.28);
		stroke-width: 1.2;
	}
	.unit {
		fill: rgba(255, 255, 255, 0.03);
		stroke: rgba(235, 229, 213, 0.35);
		stroke-dasharray: 4 4;
	}
	.para {
		fill: rgba(242, 208, 143, 0.2);
		stroke: rgba(242, 208, 143, 0.8);
		stroke-width: 1.4;
		transition: fill 0.25s var(--ease);
	}
	.para.neg {
		fill: url(#wedge-hatch);
		stroke: rgba(242, 141, 182, 0.85);
	}
	.orient {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 2;
		stroke-linecap: round;
	}
	.orient.neg {
		stroke: var(--rose);
	}
	.vec {
		stroke-width: 3;
		stroke-linecap: round;
	}
	.tip {
		cursor: grab;
		touch-action: none;
		outline: none;
	}
	.hit {
		fill: transparent;
	}
	.knob {
		fill: rgba(255, 244, 218, 0.04);
		stroke-width: 1.6;
		stroke-dasharray: 3 3;
	}
	.tip:hover .knob,
	.tip:focus-visible .knob {
		fill: rgba(255, 244, 218, 0.18);
		stroke-dasharray: none;
	}
	.readout {
		padding: 0.2rem 1rem 0.6rem;
		border-top: 1px solid var(--line-faint);
		overflow-x: auto;
	}
</style>
