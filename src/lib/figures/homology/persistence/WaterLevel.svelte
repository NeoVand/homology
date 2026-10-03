<script lang="ts">
	// The elder rule, seen as lakes in a landscape. Water rises to level t; the
	// flooded part {x : f(x) ≤ t} falls into lakes. Each lake is born at a valley
	// floor; when two lakes meet over a pass, the younger one (higher floor) dies.
	import Barcode, { type BarDatum } from './Barcode.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { sublevelBars } from './ph';

	// control points (x, height): valley floors and passes, joined by smooth cosine arcs
	const ctrl: [number, number][] = [
		[0, 0.92],
		[0.11, 0.35],
		[0.26, 0.72],
		[0.4, 0.15],
		[0.55, 0.62],
		[0.67, 0.45],
		[0.81, 0.86],
		[0.91, 0.28],
		[1, 0.95]
	];
	const N = 400;
	const xs = Array.from({ length: N }, (_, i) => i / (N - 1));
	const f = xs.map((x) => {
		let k = 0;
		while (k < ctrl.length - 2 && x > ctrl[k + 1][0]) k++;
		const [x0, y0] = ctrl[k];
		const [x1, y1] = ctrl[k + 1];
		const t = (x - x0) / (x1 - x0);
		return y0 + ((y1 - y0) * (1 - Math.cos(Math.PI * Math.min(1, Math.max(0, t))))) / 2;
	});
	const lbars = sublevelBars(f);
	// name the valleys left to right
	const minima = lbars.map((b) => b.minIdx).sort((a, b) => a - b);
	const letter = (idx: number) => 'ABCD'[minima.indexOf(idx)] ?? '?';
	const palette = ['var(--teal)', 'var(--blue)', 'var(--violet)', 'var(--rose)'];
	const colorOf = new Map<number, string>();
	lbars.forEach((b, i) => colorOf.set(b.minIdx, palette[i % palette.length]));
	const bars: BarDatum[] = lbars.map((b, i) => ({
		id: i,
		dim: 0,
		birth: b.birth,
		death: b.death,
		color: colorOf.get(b.minIdx),
		tag: letter(b.minIdx)
	}));

	let t = $state(0.5);

	const W = 600;
	const H = 250;
	const padL = 30;
	const padR = 14;
	const padT = 14;
	const padB = 22;
	const X = (x: number) => padL + x * (W - padL - padR);
	const Y = (y: number) => padT + (1 - y) * (H - padT - padB);
	const terrain =
		`M ${X(0)} ${Y(0)} ` + xs.map((x, i) => `L ${X(x)} ${Y(f[i])}`).join(' ') + ` L ${X(1)} ${Y(0)} Z`;
	const ridge = xs.map((x, i) => `${i ? 'L' : 'M'} ${X(x)} ${Y(f[i])}`).join(' ');

	// lakes at level t: maximal runs with f ≤ t, coloured by their lowest valley (the elder)
	const lakes = $derived.by(() => {
		const out: { d: string; color: string; x0: number; x1: number }[] = [];
		let i = 0;
		while (i < N) {
			if (f[i] > t) {
				i++;
				continue;
			}
			let j = i;
			let low = i;
			while (j + 1 < N && f[j + 1] <= t) {
				j++;
				if (f[j] < f[low]) low = j;
			}
			// exact shoreline by linear interpolation
			const left = i > 0 ? xs[i - 1] + ((t - f[i - 1]) / (f[i] - f[i - 1])) * (xs[i] - xs[i - 1]) : 0;
			const right = j < N - 1 ? xs[j] + ((t - f[j]) / (f[j + 1] - f[j])) * (xs[j + 1] - xs[j]) : 1;
			let d = `M ${X(left)} ${Y(t)}`;
			for (let k = i; k <= j; k++) d += ` L ${X(xs[k])} ${Y(f[k])}`;
			d += ` L ${X(right)} ${Y(t)} Z`;
			// the elder of this lake is the deepest valley in it
			let elder = low;
			let best = Infinity;
			for (const m of minima) if (m >= i && m <= j && f[m] < best) ((best = f[m]), (elder = m));
			out.push({ d, color: colorOf.get(elder) ?? 'var(--teal)', x0: left, x1: right });
			i = j + 1;
		}
		return out;
	});
	const count = $derived(lakes.length);

	let svgEl: SVGSVGElement | undefined = $state();
	let dragging = false;
	function setFrom(e: PointerEvent) {
		if (!svgEl) return;
		const rect = svgEl.getBoundingClientRect();
		const py = ((e.clientY - rect.top) / rect.height) * H;
		t = Math.min(1, Math.max(0.05, 1 - (py - padT) / (H - padT - padB)));
	}
</script>

<div class="wl">
	<svg
		bind:this={svgEl}
		viewBox="0 0 {W} {H}"
		role="img"
		aria-label="A landscape with lakes filling the valleys up to a water level that you can drag"
		onpointerdown={(e) => {
			dragging = true;
			svgEl?.setPointerCapture(e.pointerId);
			setFrom(e);
		}}
		onpointermove={(e) => dragging && setFrom(e)}
		onpointerup={() => (dragging = false)}
		onpointercancel={() => (dragging = false)}
	>
		<defs>
			<linearGradient id="wl-rock" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0" stop-color="#2a3352" />
				<stop offset="1" stop-color="#0b1020" />
			</linearGradient>
			<linearGradient id="wl-sheen" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0" stop-color="#ffffff" stop-opacity="0.25" />
				<stop offset="0.3" stop-color="#ffffff" stop-opacity="0" />
			</linearGradient>
		</defs>
		<path d={terrain} fill="url(#wl-rock)" />
		{#each lakes as l, k (k)}
			<path d={l.d} fill={l.color} fill-opacity="0.55" />
			<path d={l.d} fill="url(#wl-sheen)" />
			<line x1={X(l.x0)} x2={X(l.x1)} y1={Y(t)} y2={Y(t)} stroke={l.color} stroke-width="2" />
		{/each}
		<path d={ridge} fill="none" stroke="rgba(235, 229, 213, 0.75)" stroke-width="1.8" />
		<!-- water level line -->
		<line x1={padL} x2={W - padR} y1={Y(t)} y2={Y(t)} class="level" />
		<SvgTeX x={padL - 14} y={Y(t)} tex="t" size={15} color="var(--gold-bright)" w={20} h={20} />
		<!-- valley labels -->
		{#each minima as m (m)}
			<SvgTeX x={X(xs[m])} y={Y(f[m]) + 13} tex={letter(m)} size={13} color={colorOf.get(m) ?? 'var(--ink)'} w={20} h={18} />
		{/each}
	</svg>
	<div class="readout ui">
		<span class="chip"><TeX tex={`t = ${t.toFixed(2)}`} /></span>
		<span class="chip teal"><span class="k">lakes</span> <TeX tex={`b_0 = ${count}`} /></span>
	</div>
	<div class="code">
		<Barcode {bars} xmax={1} now={t} height={130} dims={[0]} axis="t" label="Barcode of the lakes" onscrub={(v) => (t = Math.max(0.05, v))} />
	</div>
	<div class="controls ui">
		<Slider bind:value={t} min={0.05} max={1} step={0.005} label="Water level t" format={(v) => v.toFixed(2)} />
	</div>
</div>

<style>
	.wl {
		padding: 0.9rem 1rem 0.2rem;
	}
	svg {
		display: block;
		width: 100%;
		height: auto;
		cursor: ns-resize;
		touch-action: pan-x;
		user-select: none;
	}
	.level {
		stroke: var(--gold-bright);
		stroke-width: 1.2;
		stroke-dasharray: 5 4;
		opacity: 0.8;
	}
	.readout {
		display: flex;
		justify-content: center;
		gap: 0.6rem;
		margin: 0.5rem 0 0.2rem;
		font-size: 0.82rem;
	}
	.chip {
		display: inline-flex;
		align-items: baseline;
		gap: 0.4rem;
		padding: 0.2rem 0.7rem;
		border-radius: 999px;
		border: 1px solid var(--line-faint);
		color: var(--ink-bright);
	}
	.chip .k {
		font-size: 0.64rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.chip.teal {
		color: var(--teal);
		border-color: rgba(95, 214, 207, 0.35);
	}
	.code {
		max-width: 600px;
		margin: 0 auto;
	}
	.controls {
		display: flex;
		padding: 0.5rem 0 0.6rem;
	}
</style>
