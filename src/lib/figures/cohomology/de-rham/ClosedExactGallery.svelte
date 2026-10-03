<script lang="ts">
	// Figure: closed versus exact. A gallery of 1-forms on the plane or the
	// punctured plane, drawn by their arrows. Drag the circle (centre and rim):
	// the loop integral is computed along it, and compared with the integral of
	// dω over the disk inside.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { circlePoly, clamp, fmt, lineIntegral, regionIntegral, type Vec2 } from '$lib/figures/cohomology/differential-forms/calc';
	import { gallery, TAU } from './derham';

	const W = 640;
	const H = 400;
	const S = W / 5.2;
	const box = [-2.6, 2.6, -H / (2 * S), H / (2 * S)];
	const px = (p: Vec2): Vec2 => [W / 2 + p[0] * S, H / 2 - p[1] * S];
	const wx = (x: number, y: number): Vec2 => [(x - W / 2) / S, (H / 2 - y) / S];

	let key = $state('angle');
	let c = $state<Vec2>([0.2, 0.1]);
	let r = $state(1.0);

	const F = $derived(gallery[key]);
	const poly = $derived(circlePoly(c, r, 720, 0.123));
	const holesIn = $derived(F.holes.filter((h) => Math.hypot(h[0] - c[0], h[1] - c[1]) < r));
	const nearHole = $derived(F.holes.some((h) => Math.abs(Math.hypot(h[0] - c[0], h[1] - c[1]) - r) < 0.05));
	const loop = $derived(nearHole ? NaN : lineIntegral(poly, F.PQ));
	const inside = $derived(regionIntegral(poly, F.g));
	const turns = $derived(loop / TAU);

	const arrows = $derived.by(() => {
		const out: { d: string; o: number }[] = [];
		const step = 0.3;
		for (let y = -1.5; y <= 1.51; y += step)
			for (let x = -2.4; x <= 2.41; x += step) {
				if (F.holes.some((h) => Math.hypot(x - h[0], y - h[1]) < 0.16)) continue;
				const [P, Q] = F.PQ(x, y);
				const m = Math.hypot(P, Q);
				if (!isFinite(m) || m < 1e-9) continue;
				const L = (0.24 * Math.tanh(0.9 * m)) / m;
				const a = px([x - (P * L) / 2, y - (Q * L) / 2]);
				const b = px([x + (P * L) / 2, y + (Q * L) / 2]);
				const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
				const ux = (b[0] - a[0]) / len;
				const uy = (b[1] - a[1]) / len;
				const hs = Math.min(5, len * 0.45);
				out.push({
					d: `M ${a[0].toFixed(1)} ${a[1].toFixed(1)} L ${b[0].toFixed(1)} ${b[1].toFixed(1)} M ${(b[0] - ux * hs - uy * hs * 0.6).toFixed(1)} ${(b[1] - uy * hs + ux * hs * 0.6).toFixed(1)} L ${b[0].toFixed(1)} ${b[1].toFixed(1)} L ${(b[0] - ux * hs + uy * hs * 0.6).toFixed(1)} ${(b[1] - uy * hs - ux * hs * 0.6).toFixed(1)}`,
					o: 0.35 + 0.6 * Math.tanh(0.7 * m)
				});
			}
		return out;
	});

	const circleD = $derived.by(() => {
		const q = px(c);
		const R = r * S;
		return `M ${q[0] - R} ${q[1]} a ${R} ${R} 0 1 0 ${2 * R} 0 a ${R} ${R} 0 1 0 ${-2 * R} 0`;
	});
	const chevrons = $derived.by(() => {
		const out: string[] = [];
		for (let k = 0; k < 6; k++) {
			const a = (TAU * (k + 0.25)) / 6;
			const p = px([c[0] + r * Math.cos(a), c[1] + r * Math.sin(a)]);
			// counterclockwise tangent on screen
			const tx = -Math.sin(a);
			const ty = -Math.cos(a);
			const s = 6;
			out.push(`M ${p[0] - tx * s - ty * s} ${p[1] - ty * s + tx * s} L ${p[0] + tx * s * 0.6} ${p[1] + ty * s * 0.6} L ${p[0] - tx * s + ty * s} ${p[1] - ty * s - tx * s}`);
		}
		return out;
	});

	let svg: SVGSVGElement | undefined = $state();
	let drag: 'c' | 'r' | null = null;
	const toW = (e: PointerEvent): Vec2 => {
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg!.getScreenCTM()!.inverse());
		return wx(p.x, p.y);
	};
	function down(e: PointerEvent, w: 'c' | 'r') {
		drag = w;
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		e.preventDefault();
	}
	function move(e: PointerEvent) {
		if (!drag) return;
		const p = toW(e);
		if (drag === 'c') c = [clamp(p[0], box[0] + 0.1, box[1] - 0.1), clamp(p[1], box[2] + 0.1, box[3] - 0.1)];
		else r = clamp(Math.hypot(p[0] - c[0], p[1] - c[1]), 0.15, 2.4);
	}
	function key_(e: KeyboardEvent, w: 'c' | 'r') {
		const s = 0.08;
		if (w === 'r') {
			if (e.key === 'ArrowRight' || e.key === 'ArrowUp') r = clamp(r + s, 0.15, 2.4);
			else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') r = clamp(r - s, 0.15, 2.4);
			else return;
		} else {
			const m: Record<string, Vec2> = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, s], ArrowDown: [0, -s] };
			const d = m[e.key];
			if (!d) return;
			c = [c[0] + d[0], c[1] + d[1]];
		}
		e.preventDefault();
	}
	const rim = $derived(px([c[0] + r, c[1]]));
	const ctr = $derived(px(c));
	const turnsTeX = $derived.by(() => {
		if (!isFinite(turns) || !F.closed || Math.abs(turns - Math.round(turns)) > 1e-3) return '';
		const k = Math.round(turns);
		if (k === 0) return '';
		const m = k === 1 ? '' : k === -1 ? '-' : `${k}\\cdot `;
		return String.raw`\;=\; ${m}2\pi`;
	});
</script>

<div class="gallery">
	<Svg bind:svg viewBox="0 0 {W} {H}" maxHeight={480} label="Arrows of a 1-form and a circular loop that can be moved and resized.">
		<defs>
			<clipPath id="gal-clip"><rect x="0" y="0" width={W} height={H} /></clipPath>
		</defs>
		<g clip-path="url(#gal-clip)">
			<path d={circleD} class="disk" class:open={holesIn.length > 0} />
			{#each arrows as a, i (i)}
				<path d={a.d} class="arrow" style="opacity:{a.o}" />
			{/each}
			{#each F.holes as h, i (i)}
				{@const q = px(h)}
				<circle cx={q[0]} cy={q[1]} r="7" class="hole" />
			{/each}
			<path d={circleD} class="loop-halo" />
			<path d={circleD} class="loop" />
			{#each chevrons as d, i (i)}
				<path {d} class="chev" />
			{/each}
		</g>
		<g
			class="handle"
			transform="translate({ctr[0]} {ctr[1]})"
			role="slider"
			tabindex="0"
			aria-label="Centre of the loop (arrow keys move it)"
			aria-valuenow={c[0]}
			onpointerdown={(e) => down(e, 'c')}
			onpointermove={move}
			onpointerup={() => (drag = null)}
			onpointercancel={() => (drag = null)}
			onkeydown={(e) => key_(e, 'c')}
		>
			<circle r="17" class="hit" />
			<path d="M 0 -7 L 7 0 L 0 7 L -7 0 Z" class="diamond" />
		</g>
		<g
			class="handle"
			transform="translate({rim[0]} {rim[1]})"
			role="slider"
			tabindex="0"
			aria-label="Radius of the loop (arrow keys change it)"
			aria-valuenow={r}
			onpointerdown={(e) => down(e, 'r')}
			onpointermove={move}
			onpointerup={() => (drag = null)}
			onpointercancel={() => (drag = null)}
			onkeydown={(e) => key_(e, 'r')}
		>
			<circle r="17" class="hit" />
			<circle r="7.5" class="knob" />
		</g>
		{#if holesIn.length}
			<SvgTeX x={W - 112} y={22} tex={String.raw`\text{the disk contains a missing point}`} color="var(--rose)" size={13} w={210} h={22} />
		{/if}
	</Svg>
	<Controls>
		<Segmented bind:value={key} label="The 1-form" options={Object.values(gallery).map((g) => ({ value: g.key, label: g.label }))} />
	</Controls>
	<div class="readout">
		<div class="forms">
			<TeX tex={F.tex} />
			<TeX tex={F.dTeX} />
			{#if F.potentialTeX}<TeX tex={F.potentialTeX} />{/if}
		</div>
		<div class="nums">
			<div class="row">
				<span class="cap ui gold">around the loop</span>
				{#if isFinite(loop)}
					<TeX tex={String.raw`\oint_\gamma \omega = ${fmt(loop, 3).replace('−', '-')}${turnsTeX}`} />
				{:else}
					<span class="warn ui">the loop runs through a missing point</span>
				{/if}
			</div>
			<div class="row">
				<span class="cap ui violet">inside the disk, where the form is defined</span>
				<TeX tex={String.raw`\iint_D d\omega = ${fmt(inside, 3).replace('−', '-')}`} />
			</div>
			<div class="chips ui">
				<span class="chip" class:yes={F.closed}>{F.closed ? 'closed' : 'not closed'}</span>
				<span class="chip" class:yes={F.exact}>{F.exact ? 'exact' : 'not exact'}</span>
			</div>
		</div>
		<p class="note">
			{#if holesIn.length && isFinite(loop) && Math.abs(loop - inside) > 1e-3}
				The two numbers disagree, and that is no contradiction: the disk is not inside the domain of ω, so Green's theorem does not apply to it.
			{:else}
				{F.blurb}
			{/if}
		</p>
	</div>
</div>

<style>
	.disk {
		fill: rgba(164, 147, 255, 0.08);
	}
	.disk.open {
		fill: rgba(242, 141, 182, 0.08);
	}
	.arrow {
		fill: none;
		stroke: #e9e2cf;
		stroke-width: 1.3;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.hole {
		fill: #0a0f22;
		stroke: var(--rose);
		stroke-width: 2.2;
	}
	.loop-halo {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 9;
		opacity: 0.16;
	}
	.loop {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 2.6;
	}
	.chev {
		fill: none;
		stroke: #fff4da;
		stroke-width: 2.2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.handle {
		cursor: grab;
		touch-action: none;
		outline: none;
	}
	.hit {
		fill: transparent;
	}
	.diamond {
		fill: rgba(11, 16, 34, 0.85);
		stroke: rgba(255, 244, 218, 0.85);
		stroke-width: 1.6;
	}
	.knob {
		fill: #0b1022;
		stroke: var(--gold-bright);
		stroke-width: 2.4;
	}
	.handle:hover .knob,
	.handle:focus-visible .knob,
	.handle:hover .diamond,
	.handle:focus-visible .diamond {
		fill: #fff4da;
	}
	.readout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem 1.6rem;
		padding: 0.9rem 1.2rem 0.5rem;
		border-top: 1px solid var(--line-faint);
	}
	.forms {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		font-size: 1.02rem;
	}
	.nums {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 1.02rem;
	}
	.row {
		display: flex;
		flex-direction: column;
	}
	.cap {
		font-size: 0.64rem;
		letter-spacing: 0.13em;
		text-transform: uppercase;
	}
	.gold {
		color: var(--gold);
	}
	.violet {
		color: var(--violet);
	}
	.warn {
		color: var(--rose);
		font-size: 0.82rem;
	}
	.chips {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.2rem;
	}
	.chip {
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 0.15rem 0.6rem;
		border-radius: 999px;
		border: 1px solid rgba(242, 141, 182, 0.5);
		color: var(--rose);
	}
	.chip.yes {
		border-color: rgba(95, 214, 207, 0.55);
		color: var(--teal);
	}
	.note {
		grid-column: 1 / -1;
		margin: 0.2rem 0 0.4rem;
		font-size: 0.92rem;
		color: var(--ink-dim);
	}
	@media (max-width: 640px) {
		.readout {
			grid-template-columns: 1fr;
		}
	}
</style>
