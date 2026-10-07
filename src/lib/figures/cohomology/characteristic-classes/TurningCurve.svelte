<script lang="ts">
	// Figure: the total curvature of a closed plane curve. Drag the control
	// points. The "comb" shows the curvature along the curve (gold teeth where it
	// turns left, teal where it turns right); the dial adds up the turning. The
	// total is always a whole number of full turns: 360° times the turning number.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import { closedSpline, turningAngles, type P2 } from './geometry';
	import { turningPresets as presets } from './presets';
	import { svgPoint } from '../sheaves/svgutil';

	type Preset = keyof typeof presets;
	let preset = $state<Preset>('bean');
	let ctrl = $state<P2[]>(presets.bean.map((p) => [...p] as P2));

	const curve = $derived(closedSpline(ctrl, 36));
	const turns = $derived(turningAngles(curve));
	const total = $derived(turns.reduce((s, x) => s + x, 0));
	// screen y points down, so a visually anticlockwise turn is negative here: flip the sign
	const T = $derived(-total);
	const k = $derived(Math.round(T / (2 * Math.PI)));
	const path = $derived('M' + curve.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L') + 'Z');

	// curvature comb: at each sample, a tooth along the normal of length ∝ curvature
	const comb = $derived.by(() => {
		const out: { x0: number; y0: number; x1: number; y1: number; pos: boolean }[] = [];
		const n = curve.length;
		for (let i = 0; i < n; i += 2) {
			const a = curve[(i - 1 + n) % n];
			const b = curve[i];
			const c = curve[(i + 1) % n];
			const ds = (Math.hypot(b[0] - a[0], b[1] - a[1]) + Math.hypot(c[0] - b[0], c[1] - b[1])) / 2;
			const kappa = turns[i] / Math.max(ds, 1e-6); // radians per pixel; screen y is down, so left turns are negative
			const tx = c[0] - a[0];
			const ty = c[1] - a[1];
			const tl = Math.hypot(tx, ty) || 1;
			// normal pointing to the inside of the turn
			const nx = -ty / tl;
			const ny = tx / tl;
			const len = Math.max(-46, Math.min(46, kappa * 1400));
			out.push({ x0: b[0], y0: b[1], x1: b[0] - nx * len, y1: b[1] - ny * len, pos: kappa < 0 });
		}
		return out;
	});

	let svgEl = $state<SVGSVGElement>();
	let dragI = -1;
	function down(i: number, e: PointerEvent) {
		e.preventDefault();
		(e.currentTarget as Element).setPointerCapture?.(e.pointerId);
		dragI = i;
	}
	function move(e: PointerEvent) {
		if (dragI < 0 || !svgEl) return;
		const p = svgPoint(svgEl, e);
		ctrl[dragI] = [Math.min(540, Math.max(30, p.x)), Math.min(370, Math.max(30, p.y))];
	}
	function up() {
		dragI = -1;
	}
	function load(p: Preset) {
		preset = p;
		ctrl = presets[p].map((q) => [...q] as P2);
	}
	const deg = $derived(Math.round((T * 180) / Math.PI));
	// the dial spiral: one loop per full turn
	const spiral = $derived.by(() => {
		const steps = 240;
		let d = '';
		for (let i = 0; i <= steps; i++) {
			const a = Math.PI / 2 + (T * i) / steps;
			const r = 14 + 22 * (i / steps);
			d += `${i ? 'L' : 'M'}${(640 + r * Math.cos(a)).toFixed(1)} ${(200 - r * Math.sin(a)).toFixed(1)}`;
		}
		return d;
	});

	// On a narrow plate the dial moves out of the picture, next to the readout, and the
	// picture is cropped to where the curve can be (so it is scaled down less).
	let width = $state(720);
	const narrow = $derived(width > 0 && width < 520);
</script>

{#snippet dial()}
	<circle cx="640" cy="200" r="46" fill="rgba(6,10,20,0.6)" stroke="rgba(216,178,110,0.3)" />
	<path d={spiral} fill="none" stroke="var(--gold-bright)" stroke-width="2.4" />
	<SvgTeX x={640} y={268} tex={`${deg}^\\circ`} size={18} color="var(--gold-bright)" w={100} />
	<text x="640" y="132" text-anchor="middle" class="t-ui dlab">TOTAL TURNING</text>
{/snippet}

<div class="wrap" bind:clientWidth={width}>
	<Svg bind:svg={svgEl} viewBox={narrow ? '10 12 550 376' : '0 0 720 400'} maxHeight={430} label="A closed curve through draggable points, with a comb showing how sharply it turns at each place, and a dial adding up the total turning." onpointermove={move} onpointerup={up} onpointerleave={up}>
		{#each comb as t, i (i)}
			<line x1={t.x0} y1={t.y0} x2={t.x1} y2={t.y1} stroke={t.pos ? 'var(--gold)' : 'var(--teal)'} stroke-width="1.3" opacity="0.7" />
		{/each}
		<path d={path} fill="none" stroke="var(--gold-bright)" stroke-width="3" filter="url(#glow)" stroke-linejoin="round" />
		{#each ctrl as p, i (i)}
			<circle cx={p[0]} cy={p[1]} r="18" fill="transparent" class="hit" role="button" tabindex="-1" aria-label="Drag this control point" onpointerdown={(e) => down(i, e)} />
			<circle cx={p[0]} cy={p[1]} r="7" fill="url(#vertex-fill)" stroke="#fff6dc" stroke-width="1" pointer-events="none" />
		{/each}
		<!-- the dial -->
		{#if !narrow}{@render dial()}{/if}
	</Svg>

	<div class="readrow">
	{#if narrow}
		<svg class="dialsvg" viewBox="574 118 132 168" aria-hidden="true">{@render dial()}</svg>
	{/if}
	<div class="readout ui" aria-live="polite">
		The tangent turns through <strong class="tx">{deg}°</strong> in all:{' '}
		<strong class="tx">{k}</strong> full turn{Math.abs(k) === 1 ? '' : 's'}.
		{#if k === 1}
			A simple closed curve, traversed anticlockwise: always exactly one turn.
		{:else if k === -1}
			A simple closed curve traversed clockwise turns exactly once the other way.
		{:else if k === 0}
			The left turns and the right turns cancel exactly, as for a figure eight.
		{:else}
			Each extra loop adds a whole extra turn — never a fraction of one.
		{/if}
	</div>
	</div>

	<Controls>
		<Segmented
			bind:value={preset}
			options={[
				{ value: 'bean', label: 'Bean' },
				{ value: 'eight', label: 'Figure eight' },
				{ value: 'loop', label: 'With a loop' }
			]}
			label="Curve"
			onchange={(v) => load(v)}
		/>
		<span class="hint ui">Drag the gold points</span>
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.4rem;
	}
	.hit {
		cursor: grab;
		touch-action: none;
	}
	.readout {
		padding: 0.3rem 1.2rem 0.6rem;
		font-size: 0.86rem;
		color: var(--ink);
		line-height: 1.5;
	}
	.tx {
		color: var(--gold-bright);
	}
	.readrow {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		padding-left: 0.8rem;
	}
	.readrow .readout {
		flex: 1;
		padding-left: 0.4rem;
	}
	.dialsvg {
		flex: none;
		width: 92px;
		height: auto;
		overflow: visible;
	}
	.dialsvg .dlab {
		font-family: var(--font-ui);
		font-size: 14px;
		letter-spacing: 0.04em;
		fill: var(--ink-faint);
	}
	.hint {
		font-size: 0.75rem;
		color: var(--ink-faint);
	}
</style>
