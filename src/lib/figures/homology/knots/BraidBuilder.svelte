<script lang="ts">
	// Braids and their closures. Build a braid on 2, 3 or 4 strands one
	// crossing at a time (σᵢ: strands i and i + 1 cross), and watch its closure
	// (join the top of every strand to the bottom of the same position) appear
	// in space. The permutation of the strands decides how many components the
	// closure has (one per cycle); the Jones polynomial says which knot or link
	// it is, when it is one the book has met. σ₁σ₂σ₁ and σ₂σ₁σ₂ are the same braid
	// (the braid relation), so their closures share every invariant.
	import { untrack } from 'svelte';
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glowCore, glowTube, disposeTree, type PaletteName } from '$lib/three/materials';
	import { braidClosure } from '$lib/knots/curves';
	import { diagramOf, type V3 } from '$lib/knots/diagram';
	import { jones, linkingNumber } from '$lib/knots/invariants';
	import { L, type Laurent } from '$lib/knots/laurent';
	import { knots } from '$lib/knots/table';
	import { cyclesOf, permutation } from '$lib/knots/seifert';
	import { tex } from '$lib/katex/render';
	import { fitCamera } from '$lib/figures/homology/invariance/three-fit';
	import { closedCurve, flat } from './kit';

	type N = number;
	// side by side when the figure is wide enough, else the braid above its closure
	let width = $state(800);
	const wide = $derived(width >= 640);
	let n = $state<N>(3);
	let word = $state<number[]>([1, -2, 1, -2]);
	/** the Jones polynomial is a sum over 2^(crossings) states: keep it quick, even on a phone */
	const MAX = 12;

	// one colour per component, the same in the drawing, the closure and the formulas
	const CSS = ['#f4d79c', '#5fd6cf', '#a493ff', '#f28db6'];
	const GL: PaletteName[] = ['gold', 'teal', 'violet', 'rose'];
	const MACRO = ['\\cyc', '\\bdy', '\\chn', '\\hole'];

	// ── the closure and what it is ───────────────────────────────────────────
	// points per letter: fewer for computing than for drawing (braidClosure keeps
	// every point of the polyline off the crossings, so the projection stays generic)
	const PER = 25;
	const closureOf = (n: number, w: number[], per = 11) => braidClosure(n, w, { R0: 0.9, gap: 0.42, lift: 0.3, per });
	/** σᵢσᵢ⁻¹ and σᵢ⁻¹σᵢ cancel: the same braid, so the same closure, with fewer crossings to sum over */
	function freeReduce(w: number[]): number[] {
		const out: number[] = [];
		for (const g of w) {
			if (out.length && out[out.length - 1] === -g) out.pop();
			else out.push(g);
		}
		return out;
	}
	// a word met before (after an undo, or a crossing switched back) is not computed again
	const seen = new Map<string, ReturnType<typeof diagramOf>>();
	function diagramFor(n: number, w: number[]) {
		const r = freeReduce(w);
		const key = `${n}:${r.join(',')}`;
		let d = seen.get(key);
		if (!d) {
			d = diagramOf(closureOf(n, r));
			if (seen.size > 200) seen.clear();
			seen.set(key, d);
		}
		return d;
	}
	const jonesCache = new WeakMap<object, Laurent>();
	function jonesFor(d: ReturnType<typeof diagramOf>) {
		let V = jonesCache.get(d);
		if (!V) jonesCache.set(d, (V = jones(d)));
		return V;
	}

	interface Known {
		name: string;
		common?: string;
		components: number;
		V: Laurent;
		/** the mirror image's: V(t⁻¹) */
		Vm: Laurent;
	}
	let table: Known[] | null = null;
	function known(): Known[] {
		// the table's knots and links as closed braids (the unknot has no braid: V = 1)
		table ??= knots.map((k) => {
			const V = k.braid ? jones(diagramOf(closureOf(...k.braid))) : L.one();
			return { name: k.name, common: k.common, components: k.components, V, Vm: L.substitute(V, -1) };
		});
		return table;
	}
	/** the Jones polynomial of k round circles lying apart: (−t^½ − t^−½)^(k−1) */
	const unlinkV = (k: number) => L.pow(L.from({ 0.5: -1, [-0.5]: -1 }), k - 1);
	const nameTeX = (s: string) => (/^L/.test(s) ? `\\mathrm{${s}}` : s);

	/** what the closure is, as HTML, judged by its Jones polynomial */
	function identify(n: number, w: number[], V: Laurent, comps: number): string {
		if (L.eq(V, unlinkV(comps))) return comps === 1 ? 'the unknot' : `an unlink of ${comps} components (${comps} circles that come apart)`;
		for (const k of known()) {
			if (k.components !== comps) continue;
			const label = k.common ? `${k.common} ${tex(nameTeX(k.name))}` : tex(nameTeX(k.name));
			if (L.eq(V, k.V)) return label;
			if (L.eq(V, k.Vm)) return `the mirror image of ${label}`;
		}
		// strands that no crossing joins to their neighbours come apart: name the pieces one by one
		const blocks = blocksOf(n, w);
		if (blocks.length > 1) {
			const parts = blocks.map(([start, size]) => {
				const sub = w.filter((g) => Math.abs(g) > start && Math.abs(g) < start + size).map((g) => Math.sign(g) * (Math.abs(g) - start));
				const c = cyclesOf(permutation(size, sub)).length;
				const name = identify(size, sub, jonesFor(diagramFor(size, sub)), c);
				return name.replace(/^the unknot$/, 'an unknotted circle');
			});
			return `a split link: ${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}, lying apart`;
		}
		return comps === 1 ? 'a knot not in our table' : `a link of ${comps} components not in our table`;
	}

	/** runs of strands joined by crossings: [first strand, number of strands] */
	function blocksOf(n: number, w: number[]): [number, number][] {
		const used = new Set(w.map((g) => Math.abs(g)));
		const out: [number, number][] = [];
		let start = 0;
		for (let j = 1; j < n; j++)
			if (!used.has(j)) {
				out.push([start, j - start]);
				start = j;
			}
		out.push([start, n - start]);
		return out;
	}

	const perm = $derived(permutation(n, word));
	const cycles = $derived(cyclesOf(perm));
	/** the component (cycle) each strand belongs to, strands named by where they start */
	const compOf = $derived.by(() => {
		const c = new Array<number>(n).fill(0);
		cycles.forEach((cyc, i) => cyc.forEach((s) => (c[s] = i)));
		return c;
	});
	const closure = $derived(closureOf(n, word, PER));
	// the invariants come from the same closure, its cancelling pairs of crossings removed
	const D = $derived(diagramFor(n, word));
	const V = $derived(jonesFor(D));
	const what = $derived(identify(n, word, V, cycles.length));
	const plus = $derived(word.filter((g) => g > 0).length);
	const minus = $derived(word.length - plus);

	// ── TeX for the readout ──────────────────────────────────────────────────
	const sub = (i: number) => String.fromCharCode(0x2080 + i);
	const letter = (g: number) => `σ${sub(Math.abs(g))}${g < 0 ? '⁻¹' : ''}`;
	function wordTeX(w: number[]): string {
		if (!w.length) return 'e';
		let s = '';
		for (let k = 0; k < w.length; ) {
			let j = k;
			while (j < w.length && w[j] === w[k]) j++;
			const p = (j - k) * Math.sign(w[k]);
			s += `\\sigma_{${Math.abs(w[k])}}${p === 1 ? '' : `^{${p}}`}`;
			k = j;
		}
		return s;
	}
	const permTeX = $derived(cycles.map((c, i) => `${MACRO[i]}{(${c.map((s) => s + 1).join('\\;')})}`).join('\\,'));
	const signed = (x: number) => (x > 0 ? `+${x}` : `${x}`);
	const lkTeX = $derived.by(() => {
		const out: string[] = [];
		for (let a = 0; a < cycles.length; a++)
			for (let b = a + 1; b < cycles.length; b++) out.push(`\\operatorname{lk}(${MACRO[a]}{\\bullet}, ${MACRO[b]}{\\bullet}) = ${linkingNumber(D, a, b)}`);
		return out.join(',\\quad ');
	});

	// ── editing ──────────────────────────────────────────────────────────────
	function add(g: number) {
		if (word.length < MAX) word = [...word, g];
	}
	const undo = () => (word = word.slice(0, -1));
	const clear = () => (word = []);
	function flip(m: number) {
		word = word.map((g, k) => (k === m ? -g : g));
	}
	function setStrands(v: N) {
		// a smaller braid group: keep the crossings that still make sense
		word = word.filter((g) => Math.abs(g) < v);
	}
	const presets: { label: string; n: N; w: number[]; title: string }[] = [
		{ label: 'Trefoil σ₁³', n: 2, w: [1, 1, 1], title: 'The trefoil: σ₁³ on two strands' },
		{ label: 'Figure-eight (σ₁σ₂⁻¹)²', n: 3, w: [1, -2, 1, -2], title: 'The figure-eight knot: (σ₁σ₂⁻¹)² on three strands' },
		{ label: 'Borromean (σ₁σ₂⁻¹)³', n: 3, w: [1, -2, 1, -2, 1, -2], title: 'The Borromean rings: (σ₁σ₂⁻¹)³ on three strands' },
		{ label: 'Identity', n: 3, w: [], title: 'The identity braid on three strands: no crossings at all' }
	];
	const relation: { label: string; w: number[] }[] = [
		{ label: 'σ₁σ₂σ₁', w: [1, 2, 1] },
		{ label: 'σ₂σ₁σ₂', w: [2, 1, 2] }
	];
	const isOn = (pn: number, w: number[]) => pn === n && w.length === word.length && w.every((g, k) => g === word[k]);
	function choose(pn: N, w: number[]) {
		n = pn;
		word = [...w];
	}

	// ── the braid drawn flat ─────────────────────────────────────────────────
	// Strands run down the page; σᵢ crosses the strands in positions i and i + 1.
	// Read with every strand pointing down, a crossing is right-handed (positive,
	// as in braidClosure, where σᵢ is a right-handed crossing) exactly when the
	// strand moving LEFT passes over: so that is how σᵢ is drawn, and σᵢ⁻¹ the
	// other way round.
	const W = 320;
	const DX = 54;
	const geo = $derived.by(() => {
		const rows = Math.max(1, word.length);
		const reach = 10 + (n - 1) * 8; // the closing arcs leave this much room above and below
		// rows no taller than 64; beside the closure the picture is as tall as it (440), centred,
		// and above it (on phones) only as tall as the braid needs
		const h = Math.min(64, (440 - 2 * reach - 30) / rows);
		const H = wide ? 440 : rows * h + 2 * reach + 36;
		const yt = (H - rows * h) / 2 + 6;
		const yb = yt + rows * h;
		// centre the whole composition: the letters on the left (42 wide), the strands, the closing arcs on the right
		const x0 = 42 + (W - 64 - (n - 1) * (DX + 8)) / 2;
		return { H, rows, reach, yt, yb, h, x: (k: number) => x0 + k * DX, right: x0 + (n - 1) * DX };
	});
	const f = (v: number) => v.toFixed(1);
	/** each strand's path down the braid, and each crossing's over-piece */
	const drawing = $derived.by(() => {
		const { yt, h, x } = geo;
		const pos = Array.from({ length: n }, (_, s) => s);
		const d = pos.map((s) => `M ${f(x(s))} ${f(yt)}`);
		const crossings: { m: number; over: string; cx: number; cy: number; strand: number }[] = [];
		word.forEach((g, m) => {
			const i = Math.abs(g) - 1;
			const y0 = yt + m * h;
			const y1 = y0 + h;
			const a = pos.indexOf(i); // moves right, from i to i + 1
			const b = pos.indexOf(i + 1); // moves left
			const S = (from: number, to: number) => `C ${f(x(from))} ${f(y0 + h * 0.5)} ${f(x(to))} ${f(y1 - h * 0.5)} ${f(x(to))} ${f(y1)}`;
			for (let s = 0; s < n; s++) {
				if (s === a) d[s] += ' ' + S(i, i + 1);
				else if (s === b) d[s] += ' ' + S(i + 1, i);
				else d[s] += ` L ${f(x(pos[s]))} ${f(y1)}`;
			}
			const overStrand = g > 0 ? b : a;
			const over = g > 0 ? `M ${f(x(i + 1))} ${f(y0)} ${S(i + 1, i)}` : `M ${f(x(i))} ${f(y0)} ${S(i, i + 1)}`;
			crossings.push({ m, over, cx: (x(i) + x(i + 1)) / 2, cy: (y0 + y1) / 2, strand: overStrand });
			pos[a] = i + 1;
			pos[b] = i;
		});
		if (!word.length) for (let s = 0; s < n; s++) d[s] += ` L ${f(x(s))} ${f(yt + h)}`;
		// the closure, drawn faintly: the bottom of each position runs round to its top
		const { yb, right } = geo;
		const arcs = Array.from({ length: n }, (_, k) => {
			// nested: the rightmost position's arc is innermost, so no two of them cross
			const e = 10 + (n - 1 - k) * 8;
			const X = right + 20 + (n - 1 - k) * 8;
			const r = Math.min(7, e - 2);
			const xk = x(k);
			const strandHere = pos.indexOf(k); // the strand that ends here starts here again: same component
			return {
				comp: strandHere,
				d: `M ${f(xk)} ${f(yb)} L ${f(xk)} ${f(yb + e - r)} Q ${f(xk)} ${f(yb + e)} ${f(xk + r)} ${f(yb + e)} L ${f(X - r)} ${f(yb + e)} Q ${f(X)} ${f(yb + e)} ${f(X)} ${f(yb + e - r)} L ${f(X)} ${f(yt - e + r)} Q ${f(X)} ${f(yt - e)} ${f(X - r)} ${f(yt - e)} L ${f(xk + r)} ${f(yt - e)} Q ${f(xk)} ${f(yt - e)} ${f(xk)} ${f(yt - e + r)} L ${f(xk)} ${f(yt)}`
			};
		});
		return { d, crossings, arcs };
	});
	const key = (e: KeyboardEvent, m: number) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			flip(m);
		}
	};

	// ── the closure in space ─────────────────────────────────────────────────
	let api: { build(): void } | null = null;
	function setup(ctx: SceneContext) {
		const { scene, THREE } = ctx;
		const root = new THREE.Group();
		scene.add(root);
		// the braid axis, faint: every strand winds round it the same way
		scene.add(
			glowTube(new THREE.LineCurve3(new THREE.Vector3(0, -1.15, 0), new THREE.Vector3(0, 1.15, 0)), {
				color: 'blue',
				radius: 0.011,
				halo: false,
				intensity: 0.55,
				xray: 0,
				segments: 2,
				radialSegments: 6
			})
		);
		const unfit = fitCamera(ctx, 1.2, 0.62);
		const up = new THREE.Vector3(0, 1, 0);
		const cone = new THREE.ConeGeometry(0.13, 0.32, 18);
		function build() {
			disposeTree(root);
			root.clear();
			const comps = closure;
			let R = 0;
			for (const c of comps) for (const p of c) R = Math.max(R, Math.hypot(p[0], p[1]));
			const k = 1.7 / R;
			const slots = Math.max(1, word.length);
			comps.forEach((c, i) => {
				const pts = c.map((p) => flat([p[0] * k, p[1] * k, p[2] * k] as V3));
				root.add(glowTube(closedCurve(pts), { color: GL[i], closed: true, radius: 0.065, segments: Math.min(1600, pts.length * 2), haloScale: 2.3, xray: 0 }));
				// arrowheads where the strands are between crossings, twice round each strand: all turn the same way round the axis
				const per = PER * slots;
				const at = slots === 1 ? [0, Math.floor(PER / 2)] : [0, Math.floor(slots / 2) * PER];
				for (let q = 0; q < c.length / per; q++)
					for (const o of at) {
						const j = q * per + o;
						const p = new THREE.Vector3(...pts[j]);
						const dir = new THREE.Vector3(...pts[(j + 1) % pts.length]).sub(p).normalize();
						const head = new THREE.Mesh(cone.clone(), glowCore(GL[i], 1.2));
						head.position.copy(p);
						head.quaternion.setFromUnitVectors(up, dir);
						head.renderOrder = 7;
						root.add(head);
					}
			});
			ctx.invalidate();
		}
		api = { build };
		build();
		return {
			dispose() {
				api = null;
				unfit();
				cone.dispose();
			}
		};
	}
	$effect(() => {
		void closure;
		untrack(() => api?.build());
	});

</script>

<div class="bb" bind:clientWidth={width}>
	<div class="panes" class:wide>
		<div class="pane braid">
			<span class="tag ui">the braid <TeX tex={'\\beta'} /></span>
			<svg viewBox="0 0 {W} {geo.H}" role="group" aria-label="The braid drawn as {n} strands running down the page, crossing {word.length} times; each crossing can be pressed to switch which strand is on top.">
				{#each drawing.arcs as a, k (k)}
					<path d={a.d} class="arc" style="stroke:{CSS[compOf[a.comp]]}" />
				{/each}
				{#each drawing.d as d, s (s)}
					<path {d} class="halo" />
					<path {d} class="line" style="stroke:{CSS[compOf[s]]}" />
				{/each}
				{#each drawing.crossings as c (c.m)}
					<g
						role="button"
						tabindex="0"
						class="x"
						aria-label="Crossing {c.m + 1}, {letter(word[c.m])}: the strand moving {word[c.m] > 0 ? 'left' : 'right'} is on top. Press to switch it."
						onclick={() => flip(c.m)}
						onkeydown={(e) => key(e, c.m)}
					>
						<path d={c.over} class="halo over" />
						<path d={c.over} class="line over" style="stroke:{CSS[compOf[c.strand]]}" />
						<circle cx={c.cx} cy={c.cy} r={Math.max(9, Math.min(17, geo.h * 0.42))} class="hit" />
					</g>
					<text x={geo.x(0) - 30} y={c.cy + 4} class="lt">{letter(word[c.m])}</text>
				{/each}
				{#each Array(n) as _, s (s)}
					<text x={geo.x(s) - 9} y={geo.yt + 3} class="pos">{s + 1}</text>
				{/each}
			</svg>
		</div>
		<div class="pane space">
			<span class="tag ui">its closure <TeX tex={'\\hat\\beta'} /></span>
			<Scene3D
				{setup}
				height={wide ? 440 : 300}
				animate
				camera={{ position: [0, 2.8, 4.5], fov: 40 }}
				controls={{ autoRotate: true, autoRotateSpeed: 0.5 }}
				label="The closure of the braid in space: its strands, coloured by component, wind round a vertical axis and join up into closed loops."
			/>
		</div>
	</div>

	<div class="read ui" aria-live="polite">
		<span class="k">braid</span>
		<div class="v"><TeX tex={`\\beta = ${wordTeX(word)} \\in B_{${n}}`} /></div>
		<span class="k">strands</span>
		<div class="v">
			<TeX tex={`\\pi_\\beta = ${permTeX}`} />
			<span class="dim">{cycles.length === 1 ? 'one cycle: the closure is a knot' : `${cycles.length} cycles: the closure has ${cycles.length} components`}</span>
		</div>
		<span class="k">closure</span>
		<div class="v what">{@html what}</div>
		<span class="k">writhe</span>
		<div class="v">
			<TeX tex={`e(\\beta) = ${plus} - ${minus} = ${signed(plus - minus)}`} />
			<span class="dim">exponent sum, the writhe of the closure</span>
		</div>
		<span class="k">Jones</span>
		<div class="v"><TeX tex={`V(t) = ${L.tex(V)}`} /></div>
		{#if cycles.length > 1}
			<span class="k">linking</span>
			<div class="v"><TeX tex={lkTeX} /></div>
		{/if}
	</div>

	<div class="ctl ui">
		<div class="line1">
			<Segmented
				bind:value={n}
				onchange={setStrands}
				label="Number of strands"
				options={[
					{ value: 2, label: '2 strands' },
					{ value: 3, label: '3 strands' },
					{ value: 4, label: '4 strands' }
				]}
			/>
			<div class="edit">
				<Button onclick={undo} disabled={!word.length}>Undo</Button>
				<Button onclick={clear} disabled={!word.length}>Clear</Button>
			</div>
		</div>
		<div class="gens" role="group" aria-label="Add a crossing">
			{#each Array(n - 1) as _, k (k)}
				{#each [k + 1, -(k + 1)] as g (g)}
					<button type="button" class="gen" disabled={word.length >= MAX} onclick={() => add(g)} aria-label="Add {letter(g)}">
						<svg viewBox="0 0 18 20" aria-hidden="true">
							{#if g > 0}
								<path d="M3.5 2 L7.2 8.1 M10.8 13.9 L14.5 18" />
								<path d="M14.5 2 L3.5 18" />
							{:else}
								<path d="M14.5 2 L10.8 8.1 M7.2 13.9 L3.5 18" />
								<path d="M3.5 2 L14.5 18" />
							{/if}
						</svg>
						<span>{letter(g)}</span>
					</button>
				{/each}
			{/each}
		</div>
		{#if word.length >= MAX}<p class="note">That is {MAX} crossings, as many as this figure takes.</p>{/if}
		<div class="chips" role="group" aria-label="Examples">
			{#each presets as p (p.label)}
				<button type="button" class:on={isOn(p.n, p.w)} title={p.title} onclick={() => choose(p.n, p.w)}>{p.label}</button>
			{/each}
		</div>
		<div class="chips rel" role="group" aria-label="Check the braid relation">
			<span class="rl">Check the braid relation:</span>
			{#each relation as r (r.label)}
				<button type="button" class:on={isOn(3, r.w)} onclick={() => choose(3, r.w)}>{r.label}</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.bb {
		display: grid;
	}
	.panes {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}
	.panes.wide {
		grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
	}
	.pane {
		position: relative;
		min-width: 0;
	}
	.tag {
		position: absolute;
		top: 0.7rem;
		left: 1rem;
		z-index: 4;
		font-size: 0.66rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-faint);
		pointer-events: none;
	}
	.tag :global(.katex) {
		font-size: 1.1rem;
		text-transform: none;
		letter-spacing: 0;
		color: var(--ink-dim);
	}
	.braid svg {
		display: block;
		box-sizing: border-box;
		width: 100%;
		height: 440px;
		/* below the pane's tag */
		padding-top: 1.7rem;
	}
	.panes:not(.wide) .braid svg {
		height: auto;
		max-height: 440px;
		padding-top: 1.6rem;
	}
	.panes:not(.wide) .space {
		border-top: 1px solid var(--line-faint);
	}
	.arc {
		fill: none;
		stroke-width: 2;
		stroke-dasharray: 2 5;
		stroke-linecap: round;
		opacity: 0.55;
	}
	.halo {
		fill: none;
		stroke: #070b15;
		stroke-width: 13;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.line {
		fill: none;
		stroke-width: 5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	/* the over-pieces end where their strand continues: flat ends hide the seam */
	.halo.over,
	.line.over {
		stroke-linecap: butt;
	}
	.x {
		cursor: pointer;
		outline: none;
	}
	.hit {
		fill: transparent;
		stroke: transparent;
		stroke-width: 1.5;
		transition: stroke 0.15s;
	}
	.x:hover .hit,
	.x:focus-visible .hit {
		stroke: rgba(244, 215, 156, 0.7);
	}
	.lt {
		font-family: var(--font-body);
		font-size: 12px;
		fill: var(--ink-faint);
		text-anchor: middle;
	}
	.pos {
		font-family: var(--font-ui);
		font-size: 10px;
		fill: var(--ink-faint);
		text-anchor: middle;
	}
	.read {
		display: grid;
		grid-template-columns: 4.2rem minmax(0, 1fr);
		align-items: baseline;
		gap: 0.35rem 0.8rem;
		padding: 0.75rem 1.2rem 0.7rem;
		border-top: 1px solid var(--line-faint);
		color: var(--ink-bright);
		font-size: 0.92rem;
	}
	.v {
		min-width: 0;
	}
	.k {
		font-size: 0.64rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.dim {
		margin-left: 0.5rem;
		font-size: 0.78rem;
		color: var(--ink-faint);
	}
	.what {
		color: var(--gold-bright);
	}
	.ctl {
		display: grid;
		gap: 0.6rem;
		padding: 0.8rem 1rem 1rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	.line1 {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}
	.edit {
		display: flex;
		gap: 0.4rem;
	}
	.gens {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}
	.gen {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		min-height: 2.1rem;
		padding: 0.2rem 0.65rem 0.2rem 0.45rem;
		border-radius: 9px;
		border: 1px solid rgba(216, 178, 110, 0.32);
		background: rgba(216, 178, 110, 0.04);
		color: var(--gold-pale);
		font-family: var(--font-body);
		font-size: 0.95rem;
		cursor: pointer;
	}
	.gen:hover:not(:disabled) {
		border-color: rgba(216, 178, 110, 0.62);
		background: rgba(216, 178, 110, 0.1);
	}
	.gen:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.gen svg {
		width: 18px;
		height: 20px;
		flex: none;
	}
	.gen path {
		fill: none;
		stroke: currentColor;
		stroke-width: 1.8;
		stroke-linecap: round;
	}
	.note {
		margin: 0;
		font-size: 0.78rem;
		color: var(--amber);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem;
	}
	.chips button {
		font: inherit;
		font-size: 0.8rem;
		min-height: 2rem;
		padding: 0.28rem 0.65rem;
		border-radius: 999px;
		border: 1px solid var(--line-faint);
		background: rgba(255, 255, 255, 0.02);
		color: var(--ink-dim);
		cursor: pointer;
	}
	.chips button:hover {
		color: var(--ink-bright);
		border-color: var(--line);
	}
	.chips button.on {
		color: var(--gold-bright);
		border-color: var(--line-strong);
		background: rgba(216, 178, 110, 0.12);
	}
	.rl {
		font-size: 0.78rem;
		color: var(--ink-faint);
		margin-right: 0.2rem;
	}
	@media (pointer: coarse) {
		.gen,
		.chips button {
			min-height: 2.5rem;
		}
	}
</style>
