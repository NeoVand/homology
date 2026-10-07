<script lang="ts">
	// Figure: the map f(z) = zᵏ from a circle to a circle. A point going once round
	// the left circle goes k times round the right one: chains push forward,
	// f_*[S¹] = k[S¹]. A fence on the right circle pulls back to |k| fences on the
	// left one: measurements pull back, f*[φ] = k[φ]. The arrows point opposite ways.
	import { onMount } from 'svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';

	let k = $state(2);
	let fenceAngle = $state(0.9); // radians, on the right-hand circle
	let playing = $state(true);
	let s = $state(0.15); // position of the moving point, in turns
	let reduced = false;

	const L = { x: 150, y: 175, r: 92 };
	const R = { x: 490, y: 175, r: 92 };
	const at = (c: { x: number; y: number; r: number }, a: number, rr = c.r): [number, number] => [c.x + rr * Math.cos(a), c.y - rr * Math.sin(a)];

	// preimages of the fence under z ↦ z^k: angles (θ + 2πj)/k
	const pre = $derived(k === 0 ? [] : Array.from({ length: Math.abs(k) }, (_, j) => (fenceAngle + 2 * Math.PI * j) / k));
	const imgAngle = $derived(k * 2 * Math.PI * s);

	let host: HTMLDivElement;
	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) playing = false;
		let raf = 0;
		let last = 0;
		let visible = false;
		const loop = (now: number) => {
			const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
			last = now;
			if (playing) s = (s + dt / 7) % 1;
			raf = visible ? requestAnimationFrame(loop) : 0;
		};
		const io = new IntersectionObserver(([e]) => {
			visible = e.isIntersecting;
			if (visible && !raf) {
				last = 0;
				raf = requestAnimationFrame(loop);
			}
		});
		io.observe(host);
		return () => {
			io.disconnect();
			cancelAnimationFrame(raf);
		};
	});

	// drag the fence around the right circle
	let dragging = false;
	function angleFrom(e: PointerEvent) {
		const svg = (e.currentTarget as SVGElement).ownerSVGElement ?? (e.currentTarget as SVGSVGElement);
		const pt = svg.createSVGPoint();
		pt.x = e.clientX;
		pt.y = e.clientY;
		const p = pt.matrixTransform(svg.getScreenCTM()!.inverse());
		return Math.atan2(-(p.y - R.y), p.x - R.x);
	}
	function down(e: PointerEvent) {
		dragging = true;
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		e.preventDefault();
	}
	function move(e: PointerEvent) {
		if (!dragging) return;
		let a = angleFrom(e);
		if (k === 0 && Math.abs(a) < 0.08) a = a < 0 ? -0.08 : 0.08; // keep the fence off the image point of z ↦ 1
		fenceAngle = a;
	}
	function up() {
		dragging = false;
	}
	function key(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') fenceAngle -= 0.1;
		if (e.key === 'ArrowRight' || e.key === 'ArrowUp') fenceAngle += 0.1;
	}

	const mult = (x: string) => (k === 0 ? '0' : `${k === 1 ? '' : k === -1 ? '-' : k}${x}`);
	const fwd = $derived(`f_*[S^1] = ${mult('[S^1]')}`);
	const back = $derived(`f^*[\\varphi] = ${mult('[\\varphi]')}`);
	const pairing = $derived(
		`\\langle f^*\\varphi, [S^1] \\rangle = ${k} = \\langle \\varphi, f_*[S^1] \\rangle`
	);
	const tick = (c: { x: number; y: number; r: number }, a: number, len = 16) => {
		const [x1, y1] = at(c, a, c.r - len);
		const [x2, y2] = at(c, a, c.r + len);
		return { x1, y1, x2, y2 };
	};
	const tf = $derived(tick(R, fenceAngle, 20));
	const handle = $derived(at(R, fenceAngle, R.r + 20));
	// On a narrow plate the drawing is scaled down; scale its labels up (kz ≥ 1) so they stay readable.
	let width = $state(600);
	const kz = $derived(Math.min(1.7, Math.max(1, (0.9 * 600) / (width || 600))));
	const phiAt = $derived(at(R, fenceAngle, R.r + 42 + 8 * (kz - 1)));
	const P = $derived(at(L, 2 * Math.PI * s));
	const Q = $derived(at(R, imgAngle));
	const preTicks = $derived(pre.map((a) => ({ t: tick(L, a), lab: at(L, a, L.r + 28 + 10 * (kz - 1)) })));
</script>

<div class="cv" bind:this={host} bind:clientWidth={width}>
	<Svg viewBox={kz > 1.2 ? '20 6 600 358' : '20 30 600 300'} maxHeight={340} label="A map from a circle to a circle that wraps around k times; chains are pushed forward and a fence is pulled back">
		<!-- the two circles -->
		<circle cx={L.x} cy={L.y} r={L.r} class="circ src" />
		<circle cx={R.x} cy={R.y} r={R.r} class="circ dst" />
		<SvgTeX x={L.x} y={L.y + L.r + 30} tex="X = S^1" size={16 * kz} color="var(--ink-dim)" w={100 * kz} h={26 * kz} />
		<SvgTeX x={R.x} y={R.y + R.r + 30} tex="Y = S^1" size={16 * kz} color="var(--ink-dim)" w={100 * kz} h={26 * kz} />

		<!-- forward arrow (chains) and backward arrow (measurements) -->
		<path d="M 266 140 C 302 112, 338 112, 374 140" class="arr gold" marker-end="url(#arrow-gold)" />
		<SvgTeX x={320} y={72 - 6 * (kz - 1)} tex={`f(z) = z^{${k}}`} size={16 * kz} color="var(--gold-bright)" w={140 * kz} h={28 * kz} />
		<!-- on a phone the two captions sit above and below the whole drawing, where there is room for larger text -->
		<text x="320" y={kz > 1.2 ? 26 : 100} class="t-ui mini" class:big={kz > 1.2}>CHAINS PUSH FORWARD</text>
		<path d="M 374 212 C 338 240, 302 240, 266 212" class="arr teal" marker-end="url(#arrow-teal)" />
		<text x="320" y={kz > 1.2 ? 352 : 258} class="t-ui mini" class:big={kz > 1.2}>MEASUREMENTS PULL BACK</text>
		<SvgTeX x={320} y={280 + 4 * (kz - 1)} tex={'f^{*}'} size={17 * kz} color="var(--teal)" w={60 * kz} h={28 * kz} />

		<!-- pulled-back fences on the left -->
		{#each preTicks as { t, lab }, j (j)}
			<line x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} class="fence teal" />
			<SvgTeX x={lab[0]} y={lab[1]} tex={k > 0 ? '+1' : '-1'} size={13 * kz} color="var(--teal)" w={36 * kz} h={22 * kz} />
		{/each}

		<!-- the fence on the right, draggable -->
		<line x1={tf.x1} y1={tf.y1} x2={tf.x2} y2={tf.y2} class="fence rose" />
		<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
		<circle
			cx={handle[0]}
			cy={handle[1]}
			r="11"
			class="handle"
			role="slider"
			tabindex="0"
			aria-label="Fence position"
			aria-valuenow={Math.round((fenceAngle * 180) / Math.PI)}
			onpointerdown={down}
			onpointermove={move}
			onpointerup={up}
			onpointercancel={up}
			onkeydown={key}
		/>
		<SvgTeX x={phiAt[0]} y={phiAt[1]} tex={'\\varphi'} size={17 * kz} color="var(--rose)" w={30 * kz} h={26 * kz} />

		<!-- the moving point and its image -->
		<circle cx={P[0]} cy={P[1]} r="7" class="pt" />
		<circle cx={Q[0]} cy={Q[1]} r="7" class="pt" />
		<circle cx={L.x} cy={L.y} r="3" class="ctr" />
		<circle cx={R.x} cy={R.y} r="3" class="ctr" />
	</Svg>
</div>
<Controls>
	<div class="row">
		<span class="ui lbl">Wrapping number k</span>
		<Segmented
			bind:value={k}
			options={[
				{ value: -1, label: '−1' },
				{ value: 0, label: '0' },
				{ value: 1, label: '1' },
				{ value: 2, label: '2' },
				{ value: 3, label: '3' }
			]}
			label="Wrapping number"
		/>
		<Toggle bind:checked={playing} label="Move the point" />
	</div>
	<div class="read">
		<span class="gold"><TeX tex={fwd} /></span>
		<span class="teal"><TeX tex={back} /></span>
		<span class="pair"><TeX tex={pairing} /></span>
	</div>
</Controls>

<style>
	.cv {
		padding: 0.4rem 0.6rem 0.2rem;
	}
	.circ {
		fill: none;
		stroke-width: 3.2;
	}
	.circ.src {
		stroke: var(--gold-bright);
		filter: drop-shadow(0 0 5px rgba(242, 208, 143, 0.5));
	}
	.circ.dst {
		stroke: rgba(242, 208, 143, 0.65);
	}
	.arr {
		fill: none;
		stroke-width: 2.2;
	}
	.arr.gold {
		stroke: var(--gold-bright);
	}
	.arr.teal {
		stroke: var(--teal);
	}
	.mini {
		font-size: 9.5px !important;
		text-anchor: middle;
		letter-spacing: 0.16em !important;
	}
	.mini.big {
		font-size: 19px !important;
		letter-spacing: 0.08em !important;
	}
	.fence {
		stroke-width: 3.4;
		stroke-linecap: round;
	}
	.fence.rose {
		stroke: var(--rose);
		filter: drop-shadow(0 0 4px rgba(242, 141, 182, 0.8));
	}
	.fence.teal {
		stroke: var(--teal);
		filter: drop-shadow(0 0 4px rgba(95, 214, 207, 0.8));
	}
	.handle {
		fill: rgba(242, 141, 182, 0.25);
		stroke: var(--rose);
		stroke-width: 1.5;
		cursor: grab;
		touch-action: none;
	}
	.handle:focus-visible {
		outline: none;
		stroke-width: 3;
	}
	.pt {
		fill: #fff3d6;
		filter: drop-shadow(0 0 6px rgba(242, 208, 143, 0.95));
	}
	.ctr {
		fill: var(--ink-ghost);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.6rem 1rem;
		width: 100%;
	}
	.lbl {
		font-size: 0.8rem;
		color: var(--ink-dim);
	}
	.read {
		width: 100%;
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.6rem;
		border-top: 1px solid var(--line-faint);
		padding-top: 0.6rem;
		font-size: 1rem;
	}
	.gold {
		color: var(--gold-bright);
	}
	.teal {
		color: var(--teal);
	}
	.pair {
		color: var(--ink-bright);
	}
</style>
