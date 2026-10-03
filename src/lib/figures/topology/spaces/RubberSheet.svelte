<script lang="ts">
	// A rubber sheet with a loop, two points and a curve drawn on it. Drag the
	// gold pins to stretch it: lengths, areas and angles change; "inside",
	// "outside", "closed" and "crosses twice" do not — unless you tear or glue.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	const W = 640;
	const H = 400;
	const SX0 = 24,
		SX1 = 616,
		SY0 = 18,
		SY1 = 382;
	const SIG = 115;

	type P = [number, number];
	const restPins: P[] = [
		[140, 112],
		[338, 108],
		[530, 196],
		[232, 318],
		[452, 318]
	];
	const anchors: P[] = [
		[SX0, SY0],
		[(SX0 + SX1) / 2, SY0],
		[SX1, SY0],
		[SX1, (SY0 + SY1) / 2],
		[SX1, SY1],
		[(SX0 + SX1) / 2, SY1],
		[SX0, SY1],
		[SX0, (SY0 + SY1) / 2]
	];
	let pins = $state<P[]>(restPins.map((p) => [...p] as P));
	let mode = $state<'stretch' | 'tear' | 'glue'>('stretch');
	let amount = $state(0); // how far the tear/glue has progressed (animated)
	let svg = $state<SVGSVGElement>();
	let drag = -1;

	// shapes in rest position
	const loopRest: P[] = Array.from({ length: 180 }, (_, i) => {
		const a = (i / 180) * Math.PI * 2;
		const r = 104 + 13 * Math.sin(3 * a) + 7 * Math.cos(2 * a);
		return [228 + r * Math.cos(a), 202 + r * Math.sin(a)];
	});
	const inRest: P = [222, 196];
	const outRest: P = [478, 104];
	const curveRest: P[] = Array.from({ length: 70 }, (_, i) => {
		const s = i / 69;
		const x = 96 + 262 * s;
		const y = 64 + 280 * s + 16 * Math.sin(s * Math.PI * 3);
		return [x, y];
	});

	// solve the Gaussian RBF interpolation for the pin displacements
	const centers: P[] = [...restPins, ...anchors];
	const phi = (d2: number) => Math.exp(-d2 / (2 * SIG * SIG));
	function solve(M: number[][], b: number[]) {
		const n = b.length;
		const A = M.map((r, i) => [...r, b[i]]);
		for (let c = 0; c < n; c++) {
			let piv = c;
			for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
			[A[c], A[piv]] = [A[piv], A[c]];
			for (let r = 0; r < n; r++) {
				if (r === c) continue;
				const f = A[r][c] / A[c][c];
				for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k];
			}
		}
		return A.map((r, i) => r[n] / r[i]);
	}
	const Phi = centers.map((a) => centers.map((b) => phi((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)));
	const weights = $derived.by(() => {
		const dx = centers.map((_, i) => (i < pins.length ? pins[i][0] - restPins[i][0] : 0));
		const dy = centers.map((_, i) => (i < pins.length ? pins[i][1] - restPins[i][1] : 0));
		return { wx: solve(Phi, dx), wy: solve(Phi, dy) };
	});

	// tear: a slit through the top of the loop; glue: pinch the loop's two sides together
	const SLIT = { x: 228, y0: 64, y1: 148 };
	const G1: P = loopRest[90]; // left side of the loop
	const G2: P = loopRest[0]; // right side
	const GM: P = [(G1[0] + G2[0]) / 2, (G1[1] + G2[1]) / 2];

	function warp(p: P): P {
		let x = p[0];
		let y = p[1];
		const { wx, wy } = weights;
		for (let i = 0; i < centers.length; i++) {
			const f = phi((p[0] - centers[i][0]) ** 2 + (p[1] - centers[i][1]) ** 2);
			x += wx[i] * f;
			y += wy[i] * f;
		}
		if (mode === 'tear' && amount > 0) {
			// push the two sides of the slit apart
			const dy = p[1] < SLIT.y0 ? SLIT.y0 - p[1] : p[1] > SLIT.y1 ? p[1] - SLIT.y1 : 0;
			const fall = Math.exp(-(dy * dy) / (2 * 22 * 22)) * Math.exp(-((p[0] - SLIT.x) ** 2) / (2 * 60 * 60));
			x += Math.sign(p[0] - SLIT.x || 1) * 26 * amount * fall;
		}
		if (mode === 'glue' && amount > 0) {
			const f1 = Math.exp(-((p[0] - G1[0]) ** 2 + (p[1] - G1[1]) ** 2) / (2 * 70 * 70));
			const f2 = Math.exp(-((p[0] - G2[0]) ** 2 + (p[1] - G2[1]) ** 2) / (2 * 70 * 70));
			x += amount * ((GM[0] - G1[0]) * f1 + (GM[0] - G2[0]) * f2);
			y += amount * ((GM[1] - G1[1]) * f1 + (GM[1] - G2[1]) * f2);
		}
		return [x, y];
	}

	const NX = 16;
	const NY = 10;
	const grid = $derived.by(() => {
		const lines: string[] = [];
		for (let i = 0; i <= NX; i++) {
			const x = SX0 + ((SX1 - SX0) * i) / NX;
			lines.push(pathOf(Array.from({ length: 41 }, (_, k) => warp([x, SY0 + ((SY1 - SY0) * k) / 40]))));
		}
		for (let j = 0; j <= NY; j++) {
			const y = SY0 + ((SY1 - SY0) * j) / NY;
			lines.push(pathOf(Array.from({ length: 61 }, (_, k) => warp([SX0 + ((SX1 - SX0) * k) / 60, y]))));
		}
		return lines;
	});
	const outline = $derived.by(() => {
		const top = Array.from({ length: 61 }, (_, k) => warp([SX0 + ((SX1 - SX0) * k) / 60, SY0]));
		const right = Array.from({ length: 41 }, (_, k) => warp([SX1, SY0 + ((SY1 - SY0) * k) / 40]));
		const bottom = Array.from({ length: 61 }, (_, k) => warp([SX1 - ((SX1 - SX0) * k) / 60, SY1]));
		const left = Array.from({ length: 41 }, (_, k) => warp([SX0, SY1 - ((SY1 - SY0) * k) / 40]));
		return pathOf([...top, ...right, ...bottom, ...left]) + ' Z';
	});
	// fold check: does any little cell of the sheet turn over?
	const folds = $derived.by(() => {
		const bad: string[] = [];
		const n = 32;
		const m = 20;
		const pts: P[][] = [];
		for (let j = 0; j <= m; j++) {
			pts.push([]);
			for (let i = 0; i <= n; i++) pts[j].push(warp([SX0 + ((SX1 - SX0) * i) / n, SY0 + ((SY1 - SY0) * j) / m]));
		}
		for (let j = 0; j < m; j++)
			for (let i = 0; i < n; i++) {
				const a = pts[j][i],
					b = pts[j][i + 1],
					c = pts[j + 1][i + 1],
					d = pts[j + 1][i];
				const s1 = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
				const s2 = (c[0] - a[0]) * (d[1] - a[1]) - (c[1] - a[1]) * (d[0] - a[0]);
				if (s1 <= 0 || s2 <= 0) bad.push(pathOf([a, b, c, d]) + ' Z');
			}
		return bad;
	});

	const loopW = $derived(loopRest.map(warp));
	const curveW = $derived(curveRest.map(warp));
	const inW = $derived(warp(inRest));
	const outW = $derived(warp(outRest));
	const pinsW = $derived(pins);

	// the loop as drawn: broken at the slit when torn
	const loopPaths = $derived.by(() => {
		if (mode !== 'tear' || amount < 0.05) return [pathOf([...loopW, loopW[0]])];
		// find the samples near the top crossing of the slit and leave a gap
		const idx = loopRest.map((p, i) => ({ i, d: Math.abs(p[0] - SLIT.x) + (p[1] < 150 ? 0 : 1e9) })).sort((a, b) => a.d - b.d)[0].i;
		const pts: P[] = [];
		for (let k = 1; k < loopW.length - 1; k++) pts.push(loopW[(idx + k) % loopW.length]);
		return [pathOf(pts)];
	});

	function pathOf(pts: P[]) {
		return 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');
	}
	function lengthOf(pts: P[], closed = true) {
		let s = 0;
		for (let i = 0; i < pts.length - (closed ? 0 : 1); i++) {
			const a = pts[i];
			const b = pts[(i + 1) % pts.length];
			s += Math.hypot(b[0] - a[0], b[1] - a[1]);
		}
		return s;
	}
	function areaOf(pts: P[]) {
		let s = 0;
		for (let i = 0; i < pts.length; i++) {
			const a = pts[i];
			const b = pts[(i + 1) % pts.length];
			s += a[0] * b[1] - b[0] * a[1];
		}
		return Math.abs(s) / 2;
	}
	function winding(pts: P[], q: P) {
		let w = 0;
		for (let i = 0; i < pts.length; i++) {
			const a = pts[i];
			const b = pts[(i + 1) % pts.length];
			if (a[1] <= q[1]) {
				if (b[1] > q[1] && (b[0] - a[0]) * (q[1] - a[1]) - (q[0] - a[0]) * (b[1] - a[1]) > 0) w++;
			} else if (b[1] <= q[1] && (b[0] - a[0]) * (q[1] - a[1]) - (q[0] - a[0]) * (b[1] - a[1]) < 0) w--;
		}
		return w;
	}
	function crossings(A: P[], B: P[]) {
		let n = 0;
		for (let i = 0; i < A.length; i++) {
			const a = A[i];
			const b = A[(i + 1) % A.length];
			for (let j = 0; j < B.length - 1; j++) {
				const c = B[j];
				const d = B[j + 1];
				const d1 = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
				const d2 = (b[0] - a[0]) * (d[1] - a[1]) - (b[1] - a[1]) * (d[0] - a[0]);
				const d3 = (d[0] - c[0]) * (a[1] - c[1]) - (d[1] - c[1]) * (a[0] - c[0]);
				const d4 = (d[0] - c[0]) * (b[1] - c[1]) - (d[1] - c[1]) * (b[0] - c[0]);
				if (d1 * d2 < 0 && d3 * d4 < 0) n++;
			}
		}
		return n;
	}
	const L0 = lengthOf(loopRest);
	const A0 = areaOf(loopRest);
	const stats = $derived.by(() => ({
		len: lengthOf(loopW) / L0,
		area: areaOf(loopW) / A0,
		inside: winding(loopW, inW) !== 0,
		outside: winding(loopW, outW) === 0,
		cross: crossings(loopW, curveW)
	}));
	const torn = $derived(mode === 'tear' && amount > 0.05);
	const glued = $derived(mode === 'glue' && amount > 0.95);

	// animate tear / glue
	let raf = 0;
	function animateTo(m: 'tear' | 'glue' | 'stretch') {
		cancelAnimationFrame(raf);
		if (m === 'stretch') {
			const from = amount;
			const t0 = performance.now();
			const step = (now: number) => {
				const k = Math.min(1, (now - t0) / 500);
				amount = from * (1 - k * k * (3 - 2 * k));
				if (k < 1) raf = requestAnimationFrame(step);
				else mode = 'stretch';
			};
			raf = requestAnimationFrame(step);
			return;
		}
		mode = m;
		amount = 0;
		const t0 = performance.now();
		const step = (now: number) => {
			const k = Math.min(1, (now - t0) / 700);
			amount = k * k * (3 - 2 * k);
			if (k < 1) raf = requestAnimationFrame(step);
		};
		raf = requestAnimationFrame(step);
	}

	function local(e: PointerEvent): P | null {
		if (!svg) return null;
		const m = svg.getScreenCTM();
		if (!m) return null;
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
		return [p.x, p.y];
	}
	function down(e: PointerEvent, i: number) {
		drag = i;
		(e.currentTarget as Element).setPointerCapture?.(e.pointerId);
	}
	function move(e: PointerEvent) {
		if (drag < 0) return;
		const p = local(e);
		if (!p) return;
		const next = pins.map((q) => [...q] as P);
		next[drag] = [Math.max(SX0 + 20, Math.min(SX1 - 20, p[0])), Math.max(SY0 + 20, Math.min(SY1 - 20, p[1]))];
		pins = next;
	}
	function up() {
		drag = -1;
	}
	function key(e: KeyboardEvent, i: number) {
		const d: Record<string, P> = { ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, -8], ArrowDown: [0, 8] };
		const v = d[e.key];
		if (!v) return;
		e.preventDefault();
		const next = pins.map((q) => [...q] as P);
		next[i] = [next[i][0] + v[0], next[i][1] + v[1]];
		pins = next;
	}
	const pct = (x: number) => `${Math.round(x * 100)}%`;
</script>

<div class="rs">
	<Svg bind:svg viewBox="0 0 {W} {H}" maxHeight={430} label="A rubber sheet with a gold loop, a rose point inside it, a teal point outside it and a violet curve crossing it; gold pins stretch the sheet" onpointermove={move} onpointerup={up} onpointerleave={up}>
		<defs>
			<linearGradient id="rs-sheet" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stop-color="#6fd6e8" stop-opacity="0.09" />
				<stop offset="0.5" stop-color="#8f7cf7" stop-opacity="0.08" />
				<stop offset="1" stop-color="#ee8fbf" stop-opacity="0.09" />
			</linearGradient>
		</defs>
		<path d={outline} fill="url(#rs-sheet)" />
		{#each grid as d, i (i)}
			<path {d} fill="none" stroke="rgba(191,228,255,0.16)" stroke-width="1" />
		{/each}
		{#each folds as d, i (i)}
			<path {d} fill="rgba(242,141,182,0.35)" />
		{/each}
		<path d={pathOf(curveW)} fill="none" stroke="var(--violet)" stroke-width="3" stroke-linecap="round" filter="url(#glow)" />
		{#each loopPaths as d, i (i)}
			<path {d} fill="none" stroke="var(--gold-bright)" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round" filter="url(#glow)" />
		{/each}
		{#if mode === 'glue' && amount > 0.02}
			<circle cx={warp(G1)[0]} cy={warp(G1)[1]} r={4 + 3 * amount} fill="var(--rose)" filter="url(#glow)" />
			<circle cx={warp(G2)[0]} cy={warp(G2)[1]} r={4 + 3 * amount} fill="var(--rose)" filter="url(#glow)" />
		{/if}
		<circle cx={inW[0]} cy={inW[1]} r="7" fill="var(--rose)" stroke="#060912" stroke-width="1.5" filter="url(#glow)" />
		<circle cx={outW[0]} cy={outW[1]} r="7" fill="var(--teal)" stroke="#060912" stroke-width="1.5" filter="url(#glow)" />
		{#each pinsW as p, i (i)}
			<g class="pin" role="button" tabindex="0" aria-label="Pin {i + 1}: drag, or use the arrow keys, to stretch the sheet" onpointerdown={(e) => down(e, i)} onkeydown={(e) => key(e, i)}>
				<circle cx={p[0]} cy={p[1]} r="20" fill="transparent" />
				<circle cx={p[0]} cy={p[1]} r="8.5" fill="url(#vertex-fill)" stroke="#060912" stroke-width="1.6" />
				<circle cx={p[0]} cy={p[1]} r="13" fill="none" stroke="rgba(244,215,156,0.45)" stroke-width="1.2" />
			</g>
		{/each}
	</Svg>
	<div class="panel ui">
		<div class="cols">
			<div class="col">
				<h4>Changes when you stretch</h4>
				<ul>
					<li>length of the loop <b>{pct(stats.len)}</b></li>
					<li>area inside it <b>{pct(stats.area)}</b></li>
					<li>shapes, angles, straightness</li>
				</ul>
			</div>
			<div class="col">
				<h4>Survives any stretching</h4>
				<ul>
					<li class:ok={!torn && stats.inside} class:bad={torn}>
						{torn ? '✗ the loop is broken: nothing is enclosed any more' : stats.inside ? '✓ the rose point is inside the loop' : '✗ the rose point has escaped'}
					</li>
					<li class:ok={stats.outside}>{stats.outside ? '✓ the teal point is outside it' : '✗ the teal point is inside'}</li>
					<li class:ok={!glued && stats.cross === 2} class:bad={glued}>
						{glued ? '✗ the loop now touches itself: its inside has split in two' : `✓ the violet curve crosses the loop ${stats.cross} times`}
					</li>
				</ul>
			</div>
		</div>
		{#if folds.length && mode === 'stretch'}
			<p class="warn">The sheet has folded over itself (rose): now two points sit in the same spot. A rubber sheet may stretch but not fold through itself — ease off a little.</p>
		{/if}
		<div class="btns">
			<Button variant={mode === 'stretch' ? 'gold' : 'ghost'} onclick={() => animateTo('stretch')}>Stretch only</Button>
			<Button variant={mode === 'tear' ? 'gold' : 'ghost'} onclick={() => animateTo('tear')}>Tear it</Button>
			<Button variant={mode === 'glue' ? 'gold' : 'ghost'} onclick={() => animateTo('glue')}>Glue two points</Button>
			<Button
				variant="subtle"
				onclick={() => {
					pins = restPins.map((p) => [...p] as P);
					animateTo('stretch');
				}}>Reset</Button
			>
		</div>
	</div>
</div>

<style>
	.rs {
		padding: 0.5rem 0.5rem 0;
	}
	.pin {
		cursor: grab;
		outline: none;
	}
	.pin:focus-visible circle:nth-child(3) {
		stroke: var(--gold-bright);
		stroke-width: 2.5;
	}
	.panel {
		padding: 0.75rem 1rem 0.9rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
		font-size: 0.83rem;
		color: var(--ink-dim);
	}
	.cols {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: 0.4rem 1.4rem;
	}
	h4 {
		margin: 0 0 0.3rem !important;
		font-size: 0.68rem !important;
	}
	ul {
		margin: 0 !important;
		padding: 0 !important;
		list-style: none;
	}
	li {
		margin: 0.15rem 0 !important;
	}
	li::before {
		display: none !important;
	}
	li b {
		color: var(--gold-bright);
	}
	li.ok {
		color: var(--green);
	}
	li.bad {
		color: var(--rose);
	}
	.warn {
		color: var(--amber);
		margin: 0.5rem 0 0;
	}
	.btns {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 0.7rem;
	}
</style>
