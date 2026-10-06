<script lang="ts">
	// Figure: d marks where sheets end. Each 1-form is drawn as a family of
	// co-oriented curves; wherever a curve begins we draw a dot — together the
	// dots are the 2-form dω. Drag (or resize) the rectangle: the net number of
	// sheets piercing its boundary always equals the number of dots inside.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { boundaryPiercings, endPresets, endsInside, total, type Box, type Rect, type Sheet } from './sheets';
	import { clamp, type Vec2 } from './calc';

	const W = 640;
	const H = 400;
	const S = W / 5.2;
	const box: Box = [-2.6, 2.6, -H / (2 * S), H / (2 * S)];
	const px = (p: Vec2): Vec2 => [W / 2 + p[0] * S, H / 2 - p[1] * S];
	const wx = (x: number, y: number): Vec2 => [(x - W / 2) / S, (H / 2 - y) / S];

	let key = $state('xdy');
	let R = $state<Rect>([0.45, 1.65, -0.35, 0.75]);

	const P = $derived(endPresets[key]);
	const sheets = $derived(P.sheets(box));
	const pierce = $derived(boundaryPiercings(sheets, R));
	const ends = $derived(endsInside(sheets, R));
	const nP = $derived(total(pierce));
	const nE = $derived(total(ends));
	const holeInside = $derived((P.holes ?? []).some(([x, y]) => x > R[0] && x < R[1] && y > R[2] && y < R[3]));

	function sheetD(s: Sheet): string {
		if (s.kind === 'seg') {
			const a = px(s.a);
			const b = px(s.b);
			return `M ${a[0].toFixed(1)} ${a[1].toFixed(1)} L ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
		}
		const c = px(s.c);
		const r = s.r * S;
		return `M ${c[0] - r} ${c[1]} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`;
	}
	// short ticks on the "+" side of each sheet (its co-orientation)
	function ticks(s: Sheet): string {
		let d = '';
		if (s.kind === 'seg') {
			const L = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]);
			const u: Vec2 = [(s.b[0] - s.a[0]) / L, (s.b[1] - s.a[1]) / L];
			const nm = Math.hypot(s.n[0], s.n[1]);
			const n: Vec2 = [s.n[0] / nm, s.n[1] / nm];
			const step = 0.85;
			const off = (Math.abs(s.a[0] * 7.3 + s.a[1] * 3.1) % step) + 0.25;
			for (let t = off; t < L; t += step) {
				const p = px([s.a[0] + u[0] * t, s.a[1] + u[1] * t]);
				d += `M ${p[0].toFixed(1)} ${p[1].toFixed(1)} l ${(n[0] * 5).toFixed(1)} ${(-n[1] * 5).toFixed(1)} `;
			}
		} else {
			for (let k = 0; k < 10; k++) {
				const a = (2 * Math.PI * (k + 0.5 * (s.r % 1))) / 10;
				const p = px([s.c[0] + s.r * Math.cos(a), s.c[1] + s.r * Math.sin(a)]);
				d += `M ${p[0].toFixed(1)} ${p[1].toFixed(1)} l ${(Math.cos(a) * 5).toFixed(1)} ${(-Math.sin(a) * 5).toFixed(1)} `;
			}
		}
		return d;
	}
	const allD = $derived(sheets.map(sheetD).join(' '));
	const allTicks = $derived(sheets.map(ticks).join(' '));
	const dots = $derived(sheets.filter((s) => s.kind === 'seg' && s.end) as Extract<Sheet, { kind: 'seg' }>[]);
	const dotSign = (s: Extract<Sheet, { kind: 'seg' }>) =>
		(s.b[0] - s.a[0]) * s.n[1] - (s.b[1] - s.a[1]) * s.n[0] > 0 ? 1 : -1;

	// dragging the rectangle (body = move, corner = resize)
	let svg: SVGSVGElement | undefined = $state();
	let mode: 'move' | 'size' | null = null;
	let last: Vec2 = [0, 0];
	const toW = (e: PointerEvent): Vec2 => {
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg!.getScreenCTM()!.inverse());
		return wx(p.x, p.y);
	};
	function down(e: PointerEvent, m: 'move' | 'size') {
		mode = m;
		last = toW(e);
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		e.preventDefault();
	}
	function move(e: PointerEvent) {
		if (!mode) return;
		const p = toW(e);
		const dx = p[0] - last[0];
		const dy = p[1] - last[1];
		last = p;
		if (mode === 'move') {
			const w = R[1] - R[0];
			const h = R[3] - R[2];
			const x0 = clamp(R[0] + dx, box[0] + 0.05, box[1] - 0.05 - w);
			const y0 = clamp(R[2] + dy, box[2] + 0.05, box[3] - 0.05 - h);
			R = [x0, x0 + w, y0, y0 + h];
		} else {
			R = [R[0], clamp(R[1] + dx, R[0] + 0.2, box[1] - 0.05), clamp(R[2] + dy, box[2] + 0.05, R[3] - 0.2), R[3]];
		}
	}
	function keyMove(e: KeyboardEvent) {
		const s = 0.08;
		const m: Record<string, Vec2> = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, s], ArrowDown: [0, -s] };
		const d = m[e.key];
		if (!d) return;
		e.preventDefault();
		const w = R[1] - R[0];
		const h = R[3] - R[2];
		const x0 = clamp(R[0] + d[0], box[0] + 0.05, box[1] - 0.05 - w);
		const y0 = clamp(R[2] + d[1], box[2] + 0.05, box[3] - 0.05 - h);
		R = [x0, x0 + w, y0, y0 + h];
	}
	const rp = $derived({ a: px([R[0], R[3]]), b: px([R[1], R[2]]) });
	const rectChevrons = $derived.by(() => {
		const [x0, y0] = rp.a;
		const [x1, y1] = rp.b;
		const mx = (x0 + x1) / 2;
		const my = (y0 + y1) / 2;
		const s = 6;
		// counterclockwise on screen: bottom → right, right ↑, top ←, left ↓
		return [
			`M ${mx - s} ${y1 - s} L ${mx + s * 0.6} ${y1} L ${mx - s} ${y1 + s}`,
			`M ${x1 - s} ${my + s} L ${x1} ${my - s * 0.6} L ${x1 + s} ${my + s}`,
			`M ${mx + s} ${y0 - s} L ${mx - s * 0.6} ${y0} L ${mx + s} ${y0 + s}`,
			`M ${x0 - s} ${my - s} L ${x0} ${my + s * 0.6} L ${x0 + s} ${my - s}`
		];
	});
</script>

<div class="ends">
	<Svg bind:svg viewBox="0 0 {W} {H}" maxHeight={500} label="A 1-form drawn as curves, with dots where curves begin, and a movable rectangle.">
		<defs>
			<clipPath id="ends-clip"><rect x="0" y="0" width={W} height={H} /></clipPath>
		</defs>
		<g clip-path="url(#ends-clip)">
			<path d={allD} class="sheet" class:exact={P.closed} />
			<path d={allTicks} class="tick" class:exact={P.closed} />
			{#each dots as s, i (i)}
				{@const q = px(s.a)}
				{#if dotSign(s) > 0}
					<circle cx={q[0]} cy={q[1]} r="2.6" class="dot pos" />
				{:else}
					<circle cx={q[0]} cy={q[1]} r="2.6" class="dot neg" />
				{/if}
			{/each}
		</g>
		{#each P.holes ?? [] as h, i (i)}
			{@const q = px(h)}
			<circle cx={q[0]} cy={q[1]} r="7" class="hole" />
		{/each}

		<!-- the probe rectangle -->
		<rect
			x={rp.a[0]}
			y={rp.a[1]}
			width={rp.b[0] - rp.a[0]}
			height={rp.b[1] - rp.a[1]}
			class="probe"
			role="slider"
			tabindex="0"
			aria-label="Probe rectangle: drag to move, arrow keys to nudge"
			aria-valuenow={nE}
			onpointerdown={(e) => down(e, 'move')}
			onpointermove={move}
			onpointerup={() => (mode = null)}
			onpointercancel={() => (mode = null)}
			onkeydown={keyMove}
		/>
		{#each rectChevrons as d, i (i)}
			<path {d} class="rchev" />
		{/each}
		{#each pierce as p, i (i)}
			{@const q = px(p.p)}
			<circle cx={q[0]} cy={q[1]} r="3.4" class={p.sign > 0 ? 'pp' : 'pm'} />
		{/each}
		{#each ends as e, i (i)}
			{@const q = px(e.p)}
			<circle cx={q[0]} cy={q[1]} r="5" class={e.sign > 0 ? 'ein pos' : 'ein neg'} />
		{/each}
		<g
			class="corner"
			transform="translate({rp.b[0]} {rp.b[1]})"
			role="slider"
			tabindex="-1"
			aria-label="Resize the rectangle"
			aria-valuenow={0}
			onpointerdown={(e) => down(e, 'size')}
			onpointermove={move}
			onpointerup={() => (mode = null)}
			onpointercancel={() => (mode = null)}
		>
			<circle r="16" class="hit" />
			<path d="M -7 4 L 4 4 L 4 -7" class="grip" />
		</g>
	</Svg>
	<Controls>
		<Segmented bind:value={key} label="The 1-form" options={Object.values(endPresets).map((p) => ({ value: p.key, label: p.label }))} />
	</Controls>
	<div class="readout">
		<div class="forms">
			<TeX tex={String.raw`\omega = ${P.omegaTeX}`} />
			<TeX tex={P.dTeX} />
		</div>
		<div class="counts ui">
			<div><span class="lbl">Net sheets piercing the boundary</span><b class="gold">{nP > 0 ? '+' : ''}{nP}</b></div>
			<div><span class="lbl">Sheet-ends (dots) inside</span><b class="gold">{nE > 0 ? '+' : ''}{nE}</b></div>
		</div>
		<p class="note">
			{#if holeInside}
				The rectangle surrounds the missing origin, so it is not a region of the punctured plane: rays pass out through its boundary although none of them ends inside. Stokes’ theorem does not apply here.
			{:else}
				{P.note}
			{/if}
		</p>
	</div>
</div>

<style>
	.sheet {
		fill: none;
		stroke: rgba(164, 147, 255, 0.5);
		stroke-width: 1.1;
	}
	.sheet.exact {
		stroke: rgba(95, 214, 207, 0.55);
	}
	.tick {
		fill: none;
		stroke: rgba(164, 147, 255, 0.7);
		stroke-width: 1.1;
	}
	.tick.exact {
		stroke: rgba(95, 214, 207, 0.75);
	}
	.dot.pos {
		fill: var(--gold-bright);
	}
	.dot.neg {
		fill: #0a0f22;
		stroke: var(--rose);
		stroke-width: 1.3;
	}
	.hole {
		fill: #0a0f22;
		stroke: var(--rose);
		stroke-width: 2;
		filter: url(#glow);
	}
	.probe {
		fill: rgba(242, 208, 143, 0.07);
		stroke: var(--gold-bright);
		stroke-width: 2;
		cursor: move;
		touch-action: none;
		outline: none;
	}
	.probe:focus-visible {
		stroke-width: 3;
	}
	.rchev {
		fill: none;
		stroke: #fff4da;
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
		pointer-events: none;
	}
	.pp {
		fill: var(--green);
		stroke: #0a0f22;
		stroke-width: 1;
		pointer-events: none;
	}
	.pm {
		fill: #0a0f22;
		stroke: var(--rose);
		stroke-width: 1.8;
		pointer-events: none;
	}
	.ein {
		fill: none;
		stroke-width: 1.6;
		pointer-events: none;
	}
	.ein.pos {
		stroke: var(--gold-bright);
	}
	.ein.neg {
		stroke: var(--rose);
	}
	.corner {
		cursor: nwse-resize;
		touch-action: none;
	}
	.hit {
		fill: transparent;
	}
	.grip {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 2.4;
		stroke-linecap: round;
	}
	.readout {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.6rem 1.6rem;
		padding: 0.85rem 1.2rem 0.6rem;
		border-top: 1px solid var(--line-faint);
		align-items: center;
	}
	.forms {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		font-size: 1.04rem;
	}
	.counts {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 0.8rem;
		color: var(--ink-dim);
	}
	.counts > div {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
	}
	.counts b {
		font-size: 1rem;
		font-variant-numeric: tabular-nums;
	}
	.gold {
		color: var(--gold-bright);
	}
	.note {
		grid-column: 1 / -1;
		margin: 0.2rem 0 0.3rem;
		font-size: 0.92rem;
		color: var(--ink-dim);
	}
	@media (max-width: 640px) {
		.readout {
			grid-template-columns: 1fr;
		}
	}
</style>
