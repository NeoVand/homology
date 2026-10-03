<script lang="ts">
	// Letters as topological spaces: snip out a point and count the pieces.
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { letters, letterByChar, edgePoints, degrees, signature, cutLetter, armsAt, classes, type Cut, type Pt, type Letter } from './letters';

	let current = $state('A');
	let cut = $state<Cut | null>(null);
	let hover = $state<{ x: number; y: number } | null>(null);
	let showPoints = $state(true);
	let showClasses = $state(false);
	let svgEl = $state<SVGSVGElement>();

	const L = $derived(letterByChar.get(current)!);
	const deg = $derived(degrees(L));
	const sig = $derived(signature(L));
	const result = $derived(cut ? cutLetter(L, cut) : null);
	const myClass = $derived(classes.find((c) => c.members.includes(current))!);
	const pieceColors = ['#f4d79c', '#5fd6cf', '#a493ff', '#f28db6'];

	function choose(ch: string) {
		current = ch;
		cut = null;
	}

	const path = (pts: Pt[]) => 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');

	/** shorten a polyline by g at its start (fromStart) or at its end */
	function trim(pts: Pt[], g: number, fromStart: boolean): Pt[] {
		const P = fromStart ? [...pts] : [...pts].reverse();
		let left = g;
		while (P.length > 1) {
			const [a, b] = P;
			const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
			if (d > left) {
				const f = left / d;
				P[0] = [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f];
				break;
			}
			left -= d;
			P.shift();
		}
		return fromStart ? P : P.reverse();
	}

	// strokes to draw: each with a colour (piece) — split/trimmed around the cut
	const strokes = $derived.by(() => {
		const out: { d: string; c: string }[] = [];
		const gap = 5;
		L.edges.forEach(([a, b], i) => {
			const pts = edgePoints(L, i);
			if (!result || !cut) {
				out.push({ d: path(pts), c: '#ebe5d5' });
				return;
			}
			const [c0, c1] = result.edgeComp[i];
			if (cut.kind === 'edge' && cut.edge === i) {
				const s = cut.seg;
				const P = pts[s];
				const Q = pts[s + 1];
				const C: Pt = [P[0] + (Q[0] - P[0]) * cut.t, P[1] + (Q[1] - P[1]) * cut.t];
				out.push({ d: path(trim([...pts.slice(0, s + 1), C], gap, false)), c: pieceColors[c0 % 4] });
				out.push({ d: path(trim([C, ...pts.slice(s + 1)], gap, true)), c: pieceColors[c1 % 4] });
				return;
			}
			let q = pts;
			if (cut.kind === 'node' && a === cut.node) q = trim(q, gap, true);
			if (cut.kind === 'node' && b === cut.node) q = trim(q, gap, false);
			out.push({ d: path(q), c: pieceColors[(c0 >= 0 ? c0 : c1) % 4] });
		});
		return out;
	});

	const cutPoint = $derived.by((): Pt | null => {
		if (!cut) return null;
		if (cut.kind === 'node') return L.nodes[cut.node];
		const pts = edgePoints(L, cut.edge);
		const P = pts[cut.seg];
		const Q = pts[cut.seg + 1];
		return [P[0] + (Q[0] - P[0]) * cut.t, P[1] + (Q[1] - P[1]) * cut.t];
	});

	function locate(e: PointerEvent): { x: number; y: number } | null {
		if (!svgEl) return null;
		const m = svgEl.getScreenCTM();
		if (!m) return null;
		const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
		return { x: p.x, y: p.y };
	}

	function nearest(x: number, y: number, l: Letter): { cut: Cut; d: number; at: Pt } | null {
		let best: { cut: Cut; d: number; at: Pt } | null = null;
		l.edges.forEach((_, i) => {
			const pts = edgePoints(l, i);
			for (let s = 0; s < pts.length - 1; s++) {
				const [ax, ay] = pts[s];
				const [bx, by] = pts[s + 1];
				const dx = bx - ax;
				const dy = by - ay;
				const len2 = dx * dx + dy * dy || 1;
				const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2));
				const px = ax + t * dx;
				const py = ay + t * dy;
				const d = Math.hypot(x - px, y - py);
				if (!best || d < best.d) best = { cut: { kind: 'edge', edge: i, seg: s, t }, d, at: [px, py] };
			}
		});
		// snap to ends and branch points, and avoid "edge" cuts sitting on a node
		const dg = degrees(l);
		l.nodes.forEach((n, v) => {
			const d = Math.hypot(x - n[0], y - n[1]);
			if (d < (dg[v] === 2 ? 3 : 8) && (!best || d < best.d + 6)) best = { cut: { kind: 'node', node: v }, d, at: n };
		});
		return best;
	}

	function onMove(e: PointerEvent) {
		const p = locate(e);
		if (!p) return;
		const n = nearest(p.x, p.y, L);
		hover = n && n.d < 12 ? { x: n.at[0], y: n.at[1] } : null;
	}
	function onDown(e: PointerEvent) {
		const p = locate(e);
		if (!p) return;
		const n = nearest(p.x, p.y, L);
		if (n && n.d < 12) cut = n.cut;
	}
	function onKey(e: KeyboardEvent) {
		// keyboard: cycle the cut through the letter's special points, then edge midpoints
		if (e.key !== 'Enter' && e.key !== ' ') return;
		e.preventDefault();
		const opts: Cut[] = [
			...L.nodes.map((_, v) => ({ kind: 'node', node: v }) as Cut),
			...L.edges.map((_, i) => ({ kind: 'edge', edge: i, seg: Math.floor((edgePoints(L, i).length - 1) / 2), t: 0.5 }) as Cut)
		];
		const k = cut ? opts.findIndex((o) => JSON.stringify(o) === JSON.stringify(cut)) : -1;
		cut = opts[(k + 1) % opts.length];
	}

	const pieceWord = (k: number) => (k === 1 ? 'one piece' : `${['', 'one', 'two', 'three', 'four', 'five'][k] ?? k} pieces`);
</script>

<div class="lab">
	<div class="strip" role="toolbar" aria-label="Choose a letter">
		{#each letters as l (l.ch)}
			<button class="glyph" class:on={l.ch === current} aria-label="Letter {l.ch}" aria-pressed={l.ch === current} onclick={() => choose(l.ch)}>
				<svg viewBox="-14 -12 128 164" aria-hidden="true">
					{#each l.edges as _, i (i)}
						<path d={path(edgePoints(l, i))} />
					{/each}
				</svg>
			</button>
		{/each}
	</div>

	<div class="main">
		<div class="big">
			<svg
				bind:this={svgEl}
				viewBox="-24 -18 148 176"
				role="button"
				tabindex="0"
				aria-label="The letter {current}, drawn as thin strokes. Click a point of it to remove that point; or press Enter to step through its special points."
				onpointermove={onMove}
				onpointerleave={() => (hover = null)}
				onpointerdown={onDown}
				onkeydown={onKey}
			>
				{#each strokes as s, i (i)}
					<path d={s.d} class="stroke" style="stroke:{s.c}" />
					<path d={s.d} class="glow" style="stroke:{s.c}" />
				{/each}
				{#if showPoints && !cut}
					{#each L.nodes as n, v (v)}
						{#if deg[v] === 1}
							<circle cx={n[0]} cy={n[1]} r="4.2" class="end" />
						{:else if deg[v] >= 3}
							<circle cx={n[0]} cy={n[1]} r="5.4" class="branch" />
							<text x={n[0] + 8} y={n[1] - 7} class="deg">{deg[v]}</text>
						{/if}
					{/each}
				{/if}
				{#if hover}
					<circle cx={hover.x} cy={hover.y} r="7" class="hover" />
				{/if}
				{#if cutPoint}
					<circle cx={cutPoint[0]} cy={cutPoint[1]} r="5.5" class="hole" />
				{/if}
			</svg>
		</div>
		<div class="read ui" aria-live="polite">
			<div class="big-ch">{current}</div>
			{#if result && cut}
				<p class="verdict">
					Removing this point leaves <strong style="color:{result.pieces > 1 ? 'var(--gold-bright)' : 'var(--teal)'}">{pieceWord(result.pieces)}</strong>.
				</p>
				<p class="sub">{armsAt(L, cut)} arms meet at this point.</p>
				<Button variant="subtle" onclick={() => (cut = null)}>Put the point back</Button>
			{:else}
				<p class="verdict">Click a point of the letter to remove it.</p>
				<p class="sub">Try the junctions — and a point on a loop.</p>
			{/if}
			<dl class="fp">
				<div><dt>free ends</dt><dd>{sig.ends}</dd></div>
				<div><dt>3-way points</dt><dd>{sig.b3}</dd></div>
				<div><dt>4-way points</dt><dd>{sig.b4}</dd></div>
				<div><dt>loops</dt><dd>{sig.loops}</dd></div>
			</dl>
			{#if showClasses}
				<p class="sub">Same shape as: <strong>{[...myClass.members].join(' ')}</strong></p>
			{/if}
		</div>
	</div>

	<div class="toggles ui">
		<Toggle bind:checked={showPoints} label="Mark ends and branch points" />
		<Toggle bind:checked={showClasses} label="Sort the whole alphabet" />
	</div>

	{#if showClasses}
		<div class="classes">
			{#each classes as c (c.name)}
				<div class="cls" class:mine={c.members.includes(current)}>
					<div class="cls-letters">
						{#each [...c.members] as ch (ch)}
							<button class="mini" class:on={ch === current} onclick={() => choose(ch)} aria-label="Letter {ch}">
								<svg viewBox="-14 -12 128 164" aria-hidden="true">
									{#each letterByChar.get(ch)!.edges as _, i (i)}
										<path d={path(edgePoints(letterByChar.get(ch)!, i))} />
									{/each}
								</svg>
							</button>
						{/each}
					</div>
					<div class="cls-name ui">{c.name}</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.lab {
		padding: 0.6rem 0.9rem 0.9rem;
	}
	.strip {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.25rem;
		margin-bottom: 0.6rem;
	}
	.glyph,
	.mini {
		width: 2.1rem;
		height: 2.5rem;
		padding: 0.18rem;
		border-radius: 7px;
		border: 1px solid var(--line-faint);
		background: rgba(255, 255, 255, 0.02);
		cursor: pointer;
		transition: all 0.15s var(--ease);
	}
	.glyph:hover,
	.mini:hover {
		border-color: var(--line-strong);
		background: rgba(216, 178, 110, 0.08);
	}
	.glyph.on,
	.mini.on {
		border-color: var(--gold);
		background: rgba(216, 178, 110, 0.16);
		box-shadow: 0 0 10px -2px var(--gold-glow);
	}
	.glyph svg,
	.mini svg {
		width: 100%;
		height: 100%;
		display: block;
	}
	.glyph path,
	.mini path {
		fill: none;
		stroke: var(--ink);
		stroke-width: 11;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.glyph.on path {
		stroke: var(--gold-bright);
	}
	.main {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 1rem;
		align-items: center;
	}
	.big svg {
		display: block;
		width: 100%;
		max-height: 330px;
		touch-action: none;
		cursor: crosshair;
		outline: none;
	}
	.big svg:focus-visible {
		outline: 2px solid var(--gold-bright);
		border-radius: 8px;
	}
	.stroke {
		fill: none;
		stroke-width: 6;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.glow {
		fill: none;
		stroke-width: 16;
		stroke-linecap: round;
		stroke-linejoin: round;
		opacity: 0.12;
	}
	.end {
		fill: #0b1020;
		stroke: var(--teal);
		stroke-width: 2.2;
	}
	.branch {
		fill: var(--gold-bright);
		stroke: #0b1020;
		stroke-width: 1.6;
		filter: drop-shadow(0 0 4px rgba(242, 208, 143, 0.8));
	}
	.deg {
		font-family: var(--font-ui);
		font-size: 11px;
		fill: var(--gold-bright);
		font-weight: 600;
	}
	.hover {
		fill: none;
		stroke: rgba(255, 255, 255, 0.55);
		stroke-width: 1.5;
		stroke-dasharray: 3 2;
	}
	.hole {
		fill: #0b1020;
		stroke: var(--rose);
		stroke-width: 2.4;
		filter: drop-shadow(0 0 5px rgba(242, 141, 182, 0.9));
	}
	.read {
		font-size: 0.86rem;
		color: var(--ink-dim);
	}
	.big-ch {
		font-family: var(--font-display);
		font-size: 2rem;
		color: var(--gold-bright);
		line-height: 1;
		margin-bottom: 0.4rem;
	}
	.verdict {
		color: var(--ink);
		font-size: 0.95rem;
		margin: 0 0 0.3rem;
	}
	.sub {
		margin: 0 0 0.5rem;
	}
	.fp {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.25rem 0.8rem;
		margin: 0.7rem 0 0.4rem;
		padding: 0.6rem 0.7rem;
		border: 1px solid var(--line-faint);
		border-radius: 9px;
		background: rgba(255, 255, 255, 0.02);
	}
	.fp div {
		display: flex;
		justify-content: space-between;
		gap: 0.4rem;
	}
	.fp dt {
		color: var(--ink-faint);
		font-size: 0.72rem;
		letter-spacing: 0.05em;
	}
	.fp dd {
		margin: 0;
		color: var(--gold-bright);
		font-weight: 600;
	}
	.toggles {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem 1.4rem;
		margin-top: 0.7rem;
	}
	.classes {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(9.5rem, 1fr));
		gap: 0.5rem;
		margin-top: 0.8rem;
	}
	.cls {
		border: 1px solid var(--line-faint);
		border-radius: 10px;
		padding: 0.4rem 0.45rem 0.35rem;
		background: rgba(255, 255, 255, 0.015);
	}
	.cls.mine {
		border-color: var(--gold);
		background: rgba(216, 178, 110, 0.07);
	}
	.cls-letters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.15rem;
	}
	.mini {
		width: 1.5rem;
		height: 1.85rem;
		padding: 0.1rem;
	}
	.cls-name {
		font-size: 0.68rem;
		color: var(--ink-faint);
		margin-top: 0.25rem;
		letter-spacing: 0.03em;
	}
	@media (max-width: 560px) {
		.main {
			grid-template-columns: 1fr;
		}
		.big svg {
			max-height: 260px;
		}
	}
</style>
