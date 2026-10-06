<script lang="ts">
	// The partition painter: choose a relation, see the elements coloured by class,
	// then collapse every class into a single point — the quotient set X/∼ —
	// with the projection map q drawn as arrows.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { renderMathInText } from '$lib/katex/render';
	import { Tween, prefersReducedMotion } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';
	import { classColor, rampColor, scatter } from './palette';
	import { mod } from './relations';

	type Mode = 'mod' | 'colour' | 'distance';
	type Pt = [number, number];
	type Shape = 'circle' | 'square' | 'triangle' | 'diamond';
	interface El {
		label: string;
		home: Pt;
		cls: number;
		shape: Shape;
		r?: number;
		phi?: number;
	}
	interface Cls {
		tex: string;
		pos: Pt;
		color: string;
		members: number[];
		shape: Shape;
	}
	interface Head {
		x: number;
		y: number;
		tex: string;
	}
	interface Model {
		W: number;
		H: number;
		els: El[];
		classes: Cls[];
		heads: Head[];
		tokenR: number;
		elR: number;
		ring?: { c: Pt; R: number };
		polar?: { O: Pt; s: number };
	}

	let mode = $state<Mode>('mod');
	let n = $state(3);
	let collapsed = $state(false);
	let showArrows = $state(true);
	let sel = $state<number | null>(null);
	let width = $state(720);
	const narrow = $derived(width < 560);

	const t = new Tween(0, { duration: 950, easing: cubicInOut });

	const colourNames = ['gold', 'teal', 'violet', 'rose'];
	const colourHex = ['#f2d08f', '#5fd6cf', '#a493ff', '#f28db6'];
	const colourShapes: Shape[] = ['circle', 'square', 'triangle', 'diamond'];
	const colourCounts = [5, 4, 4, 3];
	const r2s = [0, 1, 2, 4, 5, 8, 9, 10, 13, 18];
	const rTeX = ['0', '1', String.raw`\sqrt2`, '2', String.raw`\sqrt5`, String.raw`2\sqrt2`, '3', String.raw`\sqrt{10}`, String.raw`\sqrt{13}`, String.raw`3\sqrt2`];

	function membersOf(els: El[], k: number) {
		return els.flatMap((e, i) => (e.cls === k ? [i] : []));
	}

	function build(mode: Mode, n: number, narrow: boolean): Model {
		if (mode === 'mod') {
			const W = narrow ? 360 : 640;
			const H = narrow ? 540 : 340;
			const cols = 8;
			const gx0 = narrow ? 40 : 52;
			const gdx = narrow ? 40 : 38;
			const gy0 = narrow ? 92 : 108;
			const gdy = narrow ? 54 : 60;
			const els: El[] = [];
			for (let i = 0; i < 24; i++) {
				const v = i - 8;
				els.push({
					label: v < 0 ? '−' + -v : String(v),
					home: [gx0 + (i % cols) * gdx, gy0 + Math.floor(i / cols) * gdy],
					cls: mod(v, n),
					shape: 'circle'
				});
			}
			const c: Pt = narrow ? [180, 410] : [494, 186];
			const R = n === 1 ? 0 : narrow ? 98 : 104;
			const classes: Cls[] = Array.from({ length: n }, (_, k) => {
				const a = -Math.PI / 2 + (2 * Math.PI * k) / n;
				return {
					tex: `[${k}]`,
					pos: [c[0] + R * Math.cos(a), c[1] + R * Math.sin(a)] as Pt,
					color: classColor(k),
					members: membersOf(els, k),
					shape: 'circle' as Shape
				};
			});
			const heads: Head[] = narrow
				? [
						{ x: 180, y: 44, tex: String.raw`X=\Z\ \ (\text{a window of it})` },
						{ x: 180, y: 256, tex: String.raw`X/{\sim}\;=\;\Z/${n}` }
					]
				: [
						{ x: 185, y: 52, tex: String.raw`X=\Z\ \ (\text{a window of it})` },
						{ x: 494, y: 40, tex: String.raw`X/{\sim}\;=\;\Z/${n}` }
					];
			return { W, H, els, classes, heads, tokenR: 19, elR: 13, ring: { c, R } };
		}
		if (mode === 'colour') {
			const W = narrow ? 360 : 640;
			const H = narrow ? 470 : 340;
			const box: [number, number, number, number] = narrow ? [40, 86, 320, 270] : [52, 92, 330, 296];
			const pts = scatter(16, box, narrow ? 44 : 50, 23);
			const els: El[] = [];
			let idx = 0;
			for (let k = 0; k < 4; k++)
				for (let j = 0; j < colourCounts[k]; j++) els.push({ label: '', home: pts[idx++], cls: k, shape: colourShapes[k] });
			const tokenPos: Pt[] = narrow
				? [
						[66, 392],
						[142, 392],
						[218, 392],
						[294, 392]
					]
				: [
						[448, 136],
						[548, 136],
						[448, 240],
						[548, 240]
					];
			const classes: Cls[] = colourNames.map((name, k) => ({
				tex: String.raw`[\text{${name}}]`,
				pos: tokenPos[k],
				color: colourHex[k],
				members: membersOf(els, k),
				shape: colourShapes[k]
			}));
			const heads: Head[] = narrow
				? [
						{ x: 180, y: 44, tex: String.raw`X=\text{a bag of 16 marbles}` },
						{ x: 180, y: 330, tex: String.raw`X/{\sim}\;=\;\text{the colours}` }
					]
				: [
						{ x: 190, y: 52, tex: String.raw`X=\text{a bag of 16 marbles}` },
						{ x: 498, y: 52, tex: String.raw`X/{\sim}\;=\;\text{the colours}` }
					];
			return { W, H, els, classes, heads, tokenR: 24, elR: 13 };
		}
		// distance from the origin, on the lattice points with −3 ≤ x, y ≤ 3
		const W = narrow ? 360 : 640;
		const H = narrow ? 420 : 340;
		const O: Pt = narrow ? [118, 214] : [214, 178];
		const s = narrow ? 33 : 34;
		const els: El[] = [];
		for (let y = 3; y >= -3; y--)
			for (let x = -3; x <= 3; x++) {
				const r2 = x * x + y * y;
				els.push({
					label: `(${x < 0 ? '−' + -x : x}, ${y < 0 ? '−' + -y : y})`,
					home: [O[0] + s * x, O[1] - s * y],
					cls: r2s.indexOf(r2),
					shape: 'circle',
					r: Math.sqrt(r2),
					phi: Math.atan2(y, x)
				});
			}
		const classes: Cls[] = r2s.map((r2, k) => ({
			tex: rTeX[k],
			pos: [O[0] + s * Math.sqrt(r2), O[1]] as Pt,
			color: rampColor(k / (r2s.length - 1)),
			members: membersOf(els, k),
			shape: 'circle' as Shape
		}));
		const heads: Head[] = narrow
			? [{ x: 180, y: 34, tex: String.raw`X=\text{lattice points } (x,y)` }]
			: [{ x: 214, y: 40, tex: String.raw`X=\text{lattice points } (x,y)` }];
		return { W, H, els, classes, heads, tokenR: 7.5, elR: 7, polar: { O, s } };
	}

	const M = $derived(build(mode, n, narrow));
	const u = $derived(t.current);

	function reset() {
		collapsed = false;
		sel = null;
		t.set(0, { duration: 0 });
	}
	function toggleCollapse() {
		collapsed = !collapsed;
		t.set(collapsed ? 1 : 0, { duration: prefersReducedMotion.current ? 0 : 950 });
	}
	function pick(k: number) {
		sel = sel === k ? null : k;
	}

	function bezierCtrl(a: Pt, b: Pt): Pt {
		const dx = b[0] - a[0];
		const dy = b[1] - a[1];
		const len = Math.hypot(dx, dy) || 1;
		const bend = 0.14 * len;
		return [(a[0] + b[0]) / 2 - (dy / len) * bend, (a[1] + b[1]) / 2 + (dx / len) * bend];
	}

	function posAt(e: El, m: Model, uu: number): Pt {
		const to = m.classes[e.cls].pos;
		if (m.polar && e.r !== undefined && e.phi !== undefined) {
			const phi = e.phi * (1 - uu);
			return [m.polar.O[0] + m.polar.s * e.r * Math.cos(phi), m.polar.O[1] - m.polar.s * e.r * Math.sin(phi)];
		}
		const c = bezierCtrl(e.home, to);
		const a = (1 - uu) * (1 - uu);
		const b = 2 * uu * (1 - uu);
		const d = uu * uu;
		return [a * e.home[0] + b * c[0] + d * to[0], a * e.home[1] + b * c[1] + d * to[1]];
	}

	/** projection arrow from an element's home to its class token */
	function arrowPath(e: El, m: Model): string | null {
		const to = m.classes[e.cls].pos;
		if (m.polar && e.r !== undefined && e.phi !== undefined) {
			if (e.r === 0 || Math.abs(e.phi) < 1e-9) return null;
			const R = m.polar.s * e.r;
			// stop a little before the token, along the circle
			const stop = Math.min(Math.abs(e.phi) * 0.5, 9 / R) * Math.sign(e.phi);
			const ex = m.polar.O[0] + R * Math.cos(stop);
			const ey = m.polar.O[1] - R * Math.sin(stop);
			const sweep = e.phi > 0 ? 1 : 0;
			const large = Math.abs(e.phi) > Math.PI ? 1 : 0;
			return `M ${e.home[0]} ${e.home[1]} A ${R} ${R} 0 ${large} ${sweep} ${ex} ${ey}`;
		}
		const c = bezierCtrl(e.home, to);
		const dx = to[0] - c[0];
		const dy = to[1] - c[1];
		const len = Math.hypot(dx, dy) || 1;
		const k = m.tokenR + 4;
		return `M ${e.home[0]} ${e.home[1]} Q ${c[0]} ${c[1]} ${to[0] - (dx / len) * k} ${to[1] - (dy / len) * k}`;
	}

	function shapePath(shape: Shape, x: number, y: number, r: number): string {
		if (shape === 'square') {
			const h = r * 0.86;
			return `M ${x - h} ${y - h} H ${x + h} V ${y + h} H ${x - h} Z`;
		}
		if (shape === 'triangle') {
			const h = r * 1.12;
			return `M ${x} ${y - h} L ${x + h * 0.95} ${y + h * 0.62} L ${x - h * 0.95} ${y + h * 0.62} Z`;
		}
		if (shape === 'diamond') {
			const h = r * 1.15;
			return `M ${x} ${y - h} L ${x + h} ${y} L ${x} ${y + h} L ${x - h} ${y} Z`;
		}
		return `M ${x - r} ${y} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0`;
	}

	// ── readout (prose with inline math, so that it wraps on small screens) ──
	function intTeX(v: number) {
		return v < 0 ? `-${-v}` : String(v);
	}
	const readout = $derived.by((): { rule: string; detail: string } => {
		if (mode === 'mod') {
			if (sel === null)
				return {
					rule: String.raw`\(x\sim y\) exactly when \(x\) and \(y\) leave the same remainder on division by \(${n}\).`,
					detail:
						n === 1
							? String.raw`\(\Z/1=\{[0]\}\): everything is declared the same.`
							: String.raw`Tap a number to see its class. \(\Z/${n}=\{${Array.from({ length: n }, (_, k) => `[${k}]`).join(',')}\}\) has ${n} elements.`
				};
			const k = sel;
			const list = [-2, -1, 0, 1, 2].map((j) => intTeX(k + j * n)).join(',\\ ');
			return {
				rule: String.raw`\([${k}] = \{\dots,\ ${list},\ \dots\}\)`,
				detail: String.raw`One element of \(\Z/${n}\), with infinitely many names: \([${k}]=[${intTeX(k + n)}]=[${intTeX(k - n)}]=\cdots\)`
			};
		}
		if (mode === 'colour') {
			if (sel === null)
				return {
					rule: String.raw`\(x\sim y\) exactly when \(x\) and \(y\) have the same colour.`,
					detail: String.raw`16 marbles, 4 classes: \(X/{\sim}=\{[\text{gold}],[\text{teal}],[\text{violet}],[\text{rose}]\}\).`
				};
			const name = colourNames[sel];
			return {
				rule: String.raw`\([\text{${name}}]\) = the ${colourCounts[sel]} ${name} marbles.`,
				detail: String.raw`A pile of ${colourCounts[sel]} marbles — but a single element of \(X/{\sim}\).`
			};
		}
		if (sel === null)
			return {
				rule: String.raw`\((x,y)\sim(x',y')\) exactly when \(x^2+y^2 = x'^2+y'^2\): the same distance from \(0\).`,
				detail: String.raw`49 points, 10 classes — one for each distance \(0,1,\sqrt2,2,\sqrt5,\dots,3\sqrt2\).`
			};
		const cnt = M.classes[sel]?.members.length ?? 0;
		return {
			rule: String.raw`Distance \(${rTeX[sel]}\): ${cnt} point${cnt === 1 ? '' : 's'} on the circle \(x^2+y^2=${r2s[sel]}\).`,
			detail: String.raw`Collapsed, the whole circle becomes one point of the ray \([0,\infty)\).`
		};
	});

	const modeOptions: { value: Mode; label: string }[] = [
		{ value: 'mod', label: 'Same remainder mod n' },
		{ value: 'colour', label: 'Same colour' },
		{ value: 'distance', label: 'Same distance from 0' }
	];
</script>

<div class="pp" bind:clientWidth={width}>
	<Svg viewBox="0 0 {M.W} {M.H}" maxHeight={narrow ? 640 : 470} label="Elements coloured by equivalence class, which can be collapsed into single points">
		<!-- decorative frames for X and X/∼ -->
		{#if M.ring && M.ring.R > 0}
			<circle cx={M.ring.c[0]} cy={M.ring.c[1]} r={M.ring.R} class="ring" style="opacity:{0.25 + 0.55 * u}" />
		{/if}
		{#if M.polar}
			{@const O = M.polar.O}
			{@const s = M.polar.s}
			{#each r2s as r2, k (r2)}
				{#if r2 > 0}
					<circle cx={O[0]} cy={O[1]} r={s * Math.sqrt(r2)} class="orbit" style="stroke:{M.classes[k].color}; opacity:{sel === null || sel === k ? 0.22 : 0.06}" />
				{/if}
			{/each}
			<!-- the ray [0, ∞): the quotient -->
			<line x1={O[0]} y1={O[1]} x2={O[0] + s * 4.6} y2={O[1]} class="ray-halo" style="opacity:{0.25 * u}" />
			<line x1={O[0]} y1={O[1]} x2={O[0] + s * 4.75} y2={O[1]} class="ray" style="opacity:{0.35 + 0.65 * u}" marker-end="url(#arrow-gold)" />
			{#each [1, 2, 3] as tk (tk)}
				<line x1={O[0] + s * tk} y1={O[1] + 5} x2={O[0] + s * tk} y2={O[1] + 11} class="tick" style="opacity:{u}" />
				<text x={O[0] + s * tk} y={O[1] + 24} class="tick-lbl" style="opacity:{u}">{tk}</text>
			{/each}
			<text x={O[0] + s * 4.75 + 4} y={O[1] + 26} class="ray-lbl" style="opacity:{u}">[0, ∞)</text>
		{/if}
		{#each M.heads as h (h.tex)}
			<SvgTeX x={h.x} y={h.y} tex={h.tex} size={narrow ? 15 : 16} color="var(--ink-dim)" w={360} h={30} />
		{/each}
		{#if mode === 'mod'}
			<text x={M.els[0].home[0] - 28} y={M.els[0].home[1] + 5} class="dots">…</text>
			<text x={M.els[23].home[0] + 22} y={M.els[23].home[1] + 5} class="dots">…</text>
		{/if}

		<!-- ghosts of the original elements (visible once collapsed) -->
		{#if u > 0.01}
			<g style="opacity:{u}">
				{#each M.els as e, i (i)}
					{@const hot = sel === e.cls}
					<path d={shapePath(e.shape, e.home[0], e.home[1], M.elR)} class="ghost" class:hot style="stroke:{M.classes[e.cls].color}" />
				{/each}
			</g>
			{#if showArrows}
				<g style="opacity:{u * u}">
					{#each M.els as e, i (i)}
						{@const d = arrowPath(e, M)}
						{@const hot = sel === e.cls}
						{#if d}
							<path {d} class="q-arrow" class:hot class:faded={sel !== null && !hot} marker-end={hot ? 'url(#arrow-gold)' : 'url(#arrow-dim)'} />
						{/if}
					{/each}
				</g>
			{/if}
		{/if}

		<!-- the elements themselves, travelling to their class -->
		{#each M.els as e, i (i)}
			{@const p = posAt(e, M, u)}
			{@const c = M.classes[e.cls]}
			{@const dim = sel !== null && sel !== e.cls}
			{@const rr = M.elR * (1 - 0.45 * u)}
			<g
				class="el"
				style="opacity:{(dim ? 0.22 : 1) * (1 - 0.92 * u)}"
				role="button"
				tabindex="-1"
				aria-label="element {e.label || colourNames[e.cls]}, class {c.tex}"
				onclick={() => pick(e.cls)}
			>
				<path d={shapePath(e.shape, p[0], p[1], rr + 7)} class="hit" />
				<path d={shapePath(e.shape, p[0], p[1], rr)} style="fill:{c.color}" class="body" />
				{#if e.label && mode === 'mod'}
					<text x={p[0]} y={p[1] + 4} class="num">{e.label}</text>
				{/if}
			</g>
		{/each}

		<!-- faint slots where the classes will land -->
		{#if u < 0.99 && !M.polar}
			<g style="opacity:{0.5 * (1 - u)}">
				{#each M.classes as c, k (k)}
					<path d={shapePath(c.shape, c.pos[0], c.pos[1], M.tokenR)} class="slot" style="stroke:{c.color}" />
				{/each}
			</g>
		{/if}

		<!-- the classes, as single points of the quotient -->
		{#if u > 0.01}
			{#each M.classes as c, k (k)}
				{@const hot = sel === k}
				{@const sc = 0.55 + 0.45 * u}
				<g
					class="token"
					class:hot
					style="opacity:{u}"
					role="button"
					tabindex="0"
					aria-label="class {c.tex}"
					onclick={() => pick(k)}
					onkeydown={(ev) => (ev.key === 'Enter' || ev.key === ' ') && (ev.preventDefault(), pick(k))}
				>
					<path d={shapePath(c.shape, c.pos[0], c.pos[1], (M.tokenR + 9) * sc)} class="halo" style="fill:{c.color}" />
					<path d={shapePath(c.shape, c.pos[0], c.pos[1], M.tokenR * sc)} class="tok" style="fill:{c.color}" />
					{#if mode === 'mod'}
						<SvgTeX x={c.pos[0]} y={c.pos[1]} tex={c.tex} size={14} color="#120d05" w={44} h={24} />
					{:else if mode === 'colour'}
						<SvgTeX x={c.pos[0]} y={c.pos[1] + M.tokenR + 20} tex={c.tex} size={14} color={c.color} w={110} h={24} />
					{:else if hot || k === 0}
						<SvgTeX x={c.pos[0]} y={c.pos[1] - 20} tex={c.tex} size={14} color={c.color} w={70} h={24} />
					{/if}
				</g>
			{/each}
		{/if}
	</Svg>

	<div class="readout" aria-live="polite">
		<div class="line main">{@html renderMathInText(readout.rule)}</div>
		<div class="line sub">{@html renderMathInText(readout.detail)}</div>
	</div>

	<Controls>
		<Segmented bind:value={mode} options={modeOptions} label="Choose the relation" onchange={reset} />
		{#if mode === 'mod'}
			<Stepper bind:value={n} min={1} max={8} label="n" onchange={() => (sel = null)} />
		{/if}
		<Button variant="gold" onclick={toggleCollapse}>{collapsed ? 'Expand the classes again' : 'Collapse each class to a point'}</Button>
		{#if collapsed}
			<Toggle bind:checked={showArrows} label="show the projection q" />
		{/if}
	</Controls>
</div>

<style>
	.pp {
		position: relative;
	}
	.pp > :global(svg) {
		padding: 0.4rem 0.6rem 0;
	}
	.ring {
		fill: none;
		stroke: rgba(216, 178, 110, 0.35);
		stroke-width: 1.2;
		stroke-dasharray: 2 5;
		transition: opacity 0.3s;
	}
	.orbit {
		fill: none;
		stroke-width: 1;
		transition: opacity 0.25s;
	}
	.ray {
		stroke: var(--gold-bright);
		stroke-width: 2;
	}
	.ray-halo {
		stroke: var(--gold-bright);
		stroke-width: 10;
		stroke-linecap: round;
	}
	.tick {
		stroke: var(--gold);
		stroke-width: 1.2;
	}
	.tick-lbl,
	.ray-lbl {
		font-family: var(--font-ui);
		font-size: 10.5px !important;
		fill: var(--ink-faint) !important;
		text-anchor: middle;
	}
	.ray-lbl {
		fill: var(--gold) !important;
		font-size: 12px !important;
		text-anchor: end;
	}
	.dots {
		fill: var(--ink-faint) !important;
		font-size: 18px !important;
		text-anchor: middle;
	}
	.el {
		cursor: pointer;
		transition: opacity 0.25s;
	}
	.el .hit {
		fill: transparent;
	}
	.el .body {
		stroke: rgba(6, 9, 18, 0.85);
		stroke-width: 1.4;
		filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.6));
	}
	.el:hover .body {
		stroke: #fff;
	}
	.num {
		font-family: var(--font-ui);
		font-size: 10.5px !important;
		font-weight: 650;
		fill: #120d05 !important;
		text-anchor: middle;
		pointer-events: none;
	}
	.ghost {
		fill: none;
		stroke-width: 1.2;
		stroke-dasharray: 2.5 2.5;
		opacity: 0.45;
	}
	.ghost.hot {
		opacity: 1;
		stroke-width: 1.8;
	}
	.slot {
		fill: rgba(255, 255, 255, 0.02);
		stroke-width: 1.2;
		stroke-dasharray: 3 4;
	}
	.q-arrow {
		fill: none;
		stroke: rgba(200, 192, 170, 0.36);
		stroke-width: 1.1;
		transition:
			stroke 0.2s,
			opacity 0.2s;
	}
	.q-arrow.hot {
		stroke: var(--gold-bright);
		stroke-width: 1.6;
	}
	.q-arrow.faded {
		opacity: 0.25;
	}
	.token {
		cursor: pointer;
	}
	.token .halo {
		opacity: 0.18;
		filter: blur(4px);
	}
	.token .tok {
		stroke: rgba(255, 255, 255, 0.55);
		stroke-width: 1.5;
		filter: url(#glow);
	}
	.token.hot .tok {
		stroke: #fff;
		stroke-width: 2.4;
	}
	.token:focus,
	.token:focus-visible {
		outline: none;
	}
	.token:focus-visible .tok {
		stroke: #fff;
		stroke-width: 3;
	}
	.readout {
		padding: 0.55rem 1.2rem 0.8rem;
		min-height: 4.6rem;
		text-align: center;
	}
	.line {
		padding: 0.1rem 0;
		line-height: 1.55;
	}
	.main {
		color: var(--ink-bright);
		font-size: 1rem;
	}
	.sub {
		color: var(--ink-dim);
		font-size: 0.9rem;
	}
</style>
