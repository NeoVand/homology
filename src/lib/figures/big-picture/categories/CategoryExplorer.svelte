<script lang="ts">
	// Figure: a small category as dots and arrows. Click arrows head-to-tail to
	// compose them; a third arrow checks associativity; identity loops check the
	// unit laws.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { presets, type SmallCategory, type CatArrow } from './smallcats';
	import { arrow, loop, animate } from './diagram';

	type PresetId = keyof typeof presets;
	let presetId = $state<PresetId>('path');
	let cat = $derived<SmallCategory>(presets[presetId]());
	let path = $state<string[]>([]);
	let revealed = $state<Set<string>>(new Set());
	let note = $state('');
	let draw = $state(1); // 0 → 1 while the composite arrow draws itself
	let cancel: (() => void) | null = null;
	// On a narrow plate the drawing is cropped and scaled down; the labels are scaled up (ls ≥ 1)
	// so that they stay readable (ls ≈ 1.7 for the widest drawing on a phone).
	let width = $state(660);
	const narrow = $derived(width > 0 && width < 520);

	const objById = $derived(new Map(cat.objects.map((o) => [o.id, o])));
	const rank = { comp: 0, id: 1, gen: 2 } as const;
	const drawOrder = $derived([...cat.arrows].sort((a, b) => rank[a.kind] - rank[b.kind]));
	const arrById = $derived(new Map(cat.arrows.map((a) => [a.id, a])));

	function geom(a: CatArrow) {
		const s = objById.get(a.src)!;
		const t = objById.get(a.tgt)!;
		if (a.src === a.tgt) {
			const g = loop([s.x, s.y], a.bend ?? -Math.PI / 2, a.loopR ?? 16, 0.55, presetId === 'rotations' ? 26 : 19);
			const ang = a.bend ?? -Math.PI / 2;
			const push = (ls - 1) * 12; // a larger label sits a little further out
			return { ...g, label: [g.label[0] + push * Math.cos(ang), g.label[1] + push * Math.sin(ang)] as [number, number] };
		}
		return arrow([s.x, s.y], [t.x, t.y], a.bend ?? 0, 24, 26, 15 * Math.min(ls, 1.45));
	}

	function fold(p: string[]): string | null {
		let acc: string | null = p[0] ?? null;
		for (let i = 1; i < p.length && acc; i++) acc = cat.compose(p[i], acc);
		return acc;
	}
	const result = $derived(path.length >= 2 ? fold(path) : null);

	function pick(id: string) {
		cancel?.();
		const a = arrById.get(id)!;
		if (path.length === 0 || path.length >= 3) {
			path = [id];
			note = '';
			return;
		}
		const last = arrById.get(path[path.length - 1])!;
		if (last.tgt !== a.src) {
			note = `not composable: ${last.id === a.id ? 'it' : 'the last arrow'} ends at ${objById.get(last.tgt)!.tex.replace('\\bigstar', '★')}, but this one starts at ${objById.get(a.src)!.tex.replace('\\bigstar', '★')}`;
			path = [id];
			return;
		}
		note = '';
		path = [...path, id];
		const r = fold(path);
		if (r) {
			draw = 0;
			cancel = animate(800, (t) => (draw = t), () => {
				revealed = new Set([...revealed, r]);
			});
		}
	}

	function reset() {
		cancel?.();
		path = [];
		note = '';
		draw = 1;
	}
	function changePreset() {
		reset();
		revealed = new Set();
	}

	// ── readout ────────────────────────────────────────────────────────────
	const tx = (id: string) => arrById.get(id)?.tex ?? id;
	const objTex = (id: string) => objById.get(id)?.tex ?? id;
	const paren = (t: string) => (/\\circ|\\mid/.test(t) ? `(${t})` : t);

	/** join with “=”, dropping a term that only repeats the previous one */
	function chain(parts: string[]): string {
		const norm = (s: string) => s.replace(/[\s{}]/g, '').replace(/\\left|\\right/g, '');
		const out: string[] = [];
		for (const p of parts) if (!out.length || norm(out[out.length - 1]) !== norm(p)) out.push(p);
		return out.join(' = ');
	}

	const readout = $derived.by(() => {
		if (path.length === 0) return '';
		const a0 = arrById.get(path[0])!;
		if (path.length === 1) return `${tx(a0.id)}\\colon ${objTex(a0.src)} \\to ${objTex(a0.tgt)}`;
		if (path.length === 2 && result) {
			const [f, g] = path;
			const r = arrById.get(result)!;
			return `${chain([`${paren(tx(g))}\\circ ${paren(tx(f))}`, tx(result)])}\\colon ${objTex(r.src)}\\to ${objTex(r.tgt)}`;
		}
		if (path.length === 3 && result) {
			const [f, g, h] = path;
			const hg = cat.compose(h, g)!;
			const gf = cat.compose(g, f)!;
			return chain([
				`(${tx(h)}\\circ ${tx(g)})\\circ ${tx(f)}`,
				`${paren(tx(hg))}\\circ ${paren(tx(f))}`,
				tx(result),
				`${paren(tx(h))}\\circ ${paren(tx(gf))}`,
				`${tx(h)}\\circ(${tx(g)}\\circ ${tx(f)})`
			]);
		}
		return '';
	});

	const prompt = $derived.by(() => {
		if (note) return note;
		if (path.length === 0) return 'Click an arrow to start a path.';
		const last = arrById.get(path[path.length - 1])!;
		if (path.length === 1)
			return `Now click an arrow that starts where this one ends (at ${objTex(last.tgt).replace('\\bigstar', '★')}).`;
		if (path.length === 2) {
			const r = arrById.get(result!)!;
			const ids = path.some((p) => arrById.get(p)!.kind === 'id');
			if (ids) return 'Composing with an identity changes nothing: that is the unit law.';
			if (r.kind === 'comp') return 'The composite is an arrow of the category in its own right. Add a third arrow to test associativity.';
			return 'The composite was already one of the drawn arrows. Add a third arrow to test associativity.';
		}
		return 'Both ways of bracketing give the same arrow: composition is associative.';
	});

	const selIndex = (id: string) => path.indexOf(id);
	const viewBoxes: Record<PresetId, [number, number, number, number]> = {
		path: [0, 18, 660, 262],
		divisors: [0, 22, 660, 368],
		rotations: [0, 52, 660, 316]
	};
	// on a narrow plate, crop to the drawing (the wide boxes keep the desktop sizes equal)
	const crops: Record<PresetId, [number, number]> = { path: [0, 660], divisors: [30, 490], rotations: [200, 430] };
	const vb = $derived.by(() => {
		const [x, y, w, h] = viewBoxes[presetId];
		return narrow ? ([crops[presetId][0], y, crops[presetId][1], h] as const) : ([x, y, w, h] as const);
	});
	const ls = $derived(Math.min(1.75, Math.max(1, (0.9 * vb[2]) / (width || 660))));
	const lo = $derived(Math.min(ls, 1.3));
	// room for the larger labels
	const viewBox = $derived(`${vb[0]} ${vb[1] - (ls - 1) * 22} ${vb[2]} ${vb[3] + (ls - 1) * 44}`);
	const rotAngle = $derived(presetId === 'rotations' && result ? Number(result.slice(1)) * 120 : presetId === 'rotations' && path.length === 1 ? Number(path[0].slice(1)) * 120 : 0);
</script>

<div class="explorer" bind:clientWidth={width}>
	<Svg {viewBox} maxHeight={430} label="A small category drawn as dots and arrows; click arrows to compose them">
		<!-- faint backdrop -->
		<defs>
			<radialGradient id="ce-node" cx="40%" cy="35%" r="70%">
				<stop offset="0" stop-color="#2a3762" />
				<stop offset="1" stop-color="#0d1426" />
			</radialGradient>
		</defs>

		<!-- arrows (composites underneath, generators on top so their hit areas win) -->
		{#each drawOrder as a (a.id)}
			{@const g = geom(a)}
			{@const k = selIndex(a.id)}
			{@const isResult = result === a.id && path.length >= 2}
			{@const hidden = a.kind === 'comp' && !revealed.has(a.id) && !isResult}
			{@const color = isResult ? 'gold' : k >= 0 ? 'violet' : a.kind === 'id' ? 'dim' : a.kind === 'comp' ? 'blue' : 'ivory'}
			<g class="arr" class:hidden class:sel={k >= 0} class:res={isResult}>
				{#if isResult}
					<path d={g.d} class="glow" pathLength="1" stroke-dasharray="1" stroke-dashoffset={1 - draw} />
				{/if}
				<path
					d={g.d}
					class="stroke {color}"
					marker-end={hidden ? undefined : `url(#arrow-${color})`}
					pathLength={isResult ? 1 : undefined}
					stroke-dasharray={isResult ? '1' : a.kind === 'comp' && !revealed.has(a.id) ? '4 6' : undefined}
					stroke-dashoffset={isResult ? 1 - draw : undefined}
				/>
				{#if k >= 0 && !isResult && draw < 1}
					<path d={g.d} class="comet" pathLength="1" stroke-dasharray="0.12 1" stroke-dashoffset={-(draw * 0.9)} />
				{/if}
				{#if !hidden || isResult}
					<SvgTeX x={g.label[0]} y={g.label[1]} tex={a.tex} size={(a.kind !== 'id' || presetId === 'rotations' ? 15 : narrow ? 13 : 12) * ls} color={isResult ? 'var(--gold-bright)' : k >= 0 ? 'var(--violet)' : a.kind === 'id' ? 'var(--ink-faint)' : a.kind === 'comp' ? 'var(--blue)' : 'var(--ink)'} w={110 * ls} h={26 * ls} />
				{/if}
				{#if k >= 0}
					<g transform="translate({g.mid[0]} {g.mid[1]})">
						<circle r={9 * lo} class="badge" />
						<text text-anchor="middle" dy={4 * lo} class="badge-t" style="font-size:{11 * lo}px">{k + 1}</text>
					</g>
				{/if}
				<!-- generous invisible hit area -->
				<path
					d={g.d}
					class="hit"
					role="button"
					tabindex={hidden ? -1 : 0}
					aria-label="arrow {a.id} from {a.src} to {a.tgt}"
					onclick={() => pick(a.id)}
					onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick(a.id))}
				/>
			</g>
		{/each}

		<!-- objects -->
		{#each cat.objects as o (o.id)}
			<g class="obj" transform="translate({o.x} {o.y})">
				<circle r="24" class="halo" />
				<circle r="17" fill="url(#ce-node)" class="node" />
				<SvgTeX x={0} y={0} tex={o.tex} size={(presetId === 'divisors' ? 15 : 18) * lo} color="var(--gold-pale)" w={40 * lo} h={30 * lo} />
			</g>
		{/each}

		{#if presetId === 'rotations'}
			<!-- the triangle being rotated -->
			<g transform="translate(560 200)">
				<circle r="54" class="disc" />
				<g style="transform: rotate({rotAngle}deg); transition: transform 0.8s var(--ease)">
					<polygon points="0,-40 34.6,20 -34.6,20" class="tri" />
					<circle cx="0" cy="-40" r="6" class="mark" />
				</g>
				<text y="78" text-anchor="middle" class="t-ui" style="font-size:{11 * ls}px">result</text>
			</g>
		{/if}
	</Svg>
	<div class="readout ui" aria-live="polite">
		{#if readout}<div class="formula"><TeX tex={readout} /></div>{/if}
		<div class="prompt" class:warn={!!note}>{prompt}</div>
	</div>
	<Controls align="between">
		<Segmented
			bind:value={presetId}
			onchange={changePreset}
			label="Which category"
			options={[
				{ value: 'path', label: 'A small category' },
				{ value: 'divisors', label: 'Divisors of 12' },
				{ value: 'rotations', label: 'A group' }
			]}
		/>
		<Button variant="subtle" onclick={reset}>Clear path</Button>
	</Controls>
</div>

<style>
	.explorer {
		padding-top: 0.6rem;
	}
	.arr .stroke {
		fill: none;
		stroke-width: 2.2;
		stroke-linecap: round;
		transition: stroke 0.25s var(--ease), opacity 0.25s;
	}
	.stroke.ivory {
		stroke: #ebe5d5;
	}
	.stroke.dim {
		stroke: rgba(139, 134, 118, 0.7);
		stroke-width: 1.5;
	}
	.stroke.blue {
		stroke: #74a9ff;
	}
	.stroke.violet {
		stroke: #a493ff;
		stroke-width: 3;
	}
	.stroke.gold {
		stroke: #f2d08f;
		stroke-width: 3.2;
	}
	.arr.hidden .stroke {
		opacity: 0.24;
	}
	.arr.hidden .hit {
		pointer-events: none;
	}
	/* glows are wide translucent strokes, not filters: straight arrows have zero-area bounding boxes */
	.glow {
		fill: none;
		stroke: #f2d08f;
		stroke-width: 11;
		stroke-linecap: round;
		opacity: 0.22;
	}
	.comet {
		fill: none;
		stroke: #fff6dc;
		stroke-width: 5;
		stroke-linecap: round;
		opacity: 0.95;
	}
	.hit {
		fill: none;
		stroke: transparent;
		stroke-width: 26;
		cursor: pointer;
		pointer-events: stroke;
	}
	.arr:hover .stroke {
		stroke-width: 3.4;
	}
	.hit:focus-visible {
		outline: none;
		stroke: rgba(242, 208, 143, 0.18);
	}
	.badge {
		fill: #a493ff;
		stroke: #0b1122;
		stroke-width: 2;
	}
	.badge-t {
		font-family: var(--font-ui);
		font-size: 11px;
		font-weight: 700;
		fill: #0b1122 !important;
	}
	.halo {
		fill: rgba(242, 208, 143, 0.08);
		stroke: rgba(242, 208, 143, 0.3);
		stroke-width: 1;
	}
	.node {
		stroke: #f2d08f;
		stroke-width: 1.6;
		filter: url(#glow);
	}
	.disc {
		fill: rgba(116, 169, 255, 0.06);
		stroke: rgba(116, 169, 255, 0.25);
		stroke-dasharray: 3 5;
	}
	.tri {
		fill: rgba(164, 147, 255, 0.22);
		stroke: #a493ff;
		stroke-width: 2;
		stroke-linejoin: round;
	}
	.mark {
		fill: #f2d08f;
		filter: url(#glow);
	}
	.readout {
		min-height: 4.6rem;
		padding: 0.4rem 1.2rem 0.9rem;
		text-align: center;
	}
	.formula {
		font-size: 1.05rem;
		color: var(--ink-bright);
		overflow-x: auto;
		padding: 0.2rem 0 0.35rem;
	}
	.prompt {
		font-size: 0.82rem;
		color: var(--ink-dim);
	}
	.prompt.warn {
		color: var(--amber);
	}
</style>
