<script lang="ts">
	// Rotate and flip a triangle; every move you make fills in one entry of the
	// Cayley table of D₃. Row g, column h holds g∘h ("first h, then g").
	import { prefersReducedMotion } from 'svelte/motion';
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { D3, compose, cayleyTable, matrixOf, partialMove, mul, apply, det, slot, type Mat2 } from './d3';

	const R = 92;
	const table = cayleyTable();
	const corners = [
		{ name: 'A', fill: '#f2d08f' },
		{ name: 'B', fill: '#74a9ff' },
		{ name: 'C', fill: '#84d9a2' }
	];

	let net = $state(0);
	let pose = $state<Mat2>([1, 0, 0, 1]);
	let known = $state<boolean[]>(Array(36).fill(false));
	let last = $state<{ g: number; h: number } | null>(null);
	let pressed = $state<number[]>([]);
	let moving = $state<number | null>(null);
	let queue: number[] = [];
	let raf = 0;

	const discovered = $derived(known.filter(Boolean).length);

	/** a pair (g, h) whose two products are both known and differ */
	const clash = $derived.by(() => {
		const pairs: [number, number][] = [];
		for (let g = 1; g < 6; g++) for (let h = g + 1; h < 6; h++) pairs.push([g, h]);
		// prefer the pair the text talks about
		pairs.sort((a, b) => (a[0] === 1 && a[1] === 3 ? -1 : b[0] === 1 && b[1] === 3 ? 1 : 0));
		for (const [g, h] of pairs)
			if (known[g * 6 + h] && known[h * 6 + g] && table[g][h] !== table[h][g]) return { g, h };
		return null;
	});

	const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

	function press(g: number) {
		queue.push(g);
		if (moving === null) next();
	}

	function next() {
		const g = queue.shift();
		if (g === undefined) {
			moving = null;
			return;
		}
		const from = net;
		const base = matrixOf(from);
		moving = g;
		const finish = () => {
			const to = compose(g, from);
			pose = matrixOf(to);
			net = to;
			known[g * 6 + from] = true;
			last = { g, h: from };
			pressed = [...pressed, g];
			next();
		};
		const dur = prefersReducedMotion.current ? 0 : queue.length ? 300 : 680;
		if (!dur || g === 0) {
			finish();
			return;
		}
		const t0 = performance.now();
		const step = (now: number) => {
			const t = Math.min(1, (now - t0) / dur);
			pose = mul(partialMove(g, ease(t)), base);
			if (t < 1) raf = requestAnimationFrame(step);
			else finish();
		};
		raf = requestAnimationFrame(step);
	}

	function reset() {
		cancelAnimationFrame(raf);
		queue = [];
		moving = null;
		net = 0;
		pose = [1, 0, 0, 1];
		pressed = [];
	}

	function playCell(g: number, h: number) {
		reset();
		press(h);
		press(g);
	}

	function fillAll() {
		known = Array(36).fill(true);
	}

	function clearTable() {
		known = Array(36).fill(false);
		last = null;
	}

	// SVG helpers (math coordinates have y up; SVG has y down)
	const P = (p: [number, number]): [number, number] => [p[0], -p[1]];
	const pts = $derived([0, 1, 2].map((i) => P(apply(pose, slot(i, R)))));
	const d = $derived(det(pose));
	const faceUp = $derived(d >= 0);
	const svgMatrix = $derived(`matrix(${pose[0]},${-pose[2]},${-pose[1]},${pose[3]},0,0)`);

	const word = $derived.by(() => {
		if (!pressed.length) return '';
		const seq = pressed.slice(-4).reverse();
		const more = pressed.length > 4 ? '\\cdots \\circ ' : '';
		return seq.length === 1 && !more
			? `${D3[seq[0]].tex}`
			: more + seq.map((g) => D3[g].tex).join(' \\circ ') + ` = ${D3[net].tex}`;
	});
</script>

<div class="tp">
	<div class="stage">
		<Svg viewBox="-160 -160 320 252" maxHeight={330} label="An equilateral triangle with corners A, B, C sitting in a triangular slot, with three mirror axes">
			<defs>
				<radialGradient id="tp-up" cx="40%" cy="30%" r="80%">
					<stop offset="0" stop-color="#8f86ff" stop-opacity="0.55" />
					<stop offset="1" stop-color="#3a3f9a" stop-opacity="0.35" />
				</radialGradient>
				<pattern id="tp-down" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
					<rect width="9" height="9" fill="#5a2741" fill-opacity="0.5" />
					<line x1="0" y1="0" x2="0" y2="9" stroke="#f28db6" stroke-opacity="0.45" stroke-width="2.2" />
				</pattern>
				<radialGradient id="tp-bg" cx="50%" cy="50%" r="50%">
					<stop offset="0" stop-color="#2a3570" stop-opacity="0.35" />
					<stop offset="1" stop-color="#2a3570" stop-opacity="0" />
				</radialGradient>
			</defs>
			<circle r="150" fill="url(#tp-bg)" />

			<!-- mirror axes, fixed in space -->
			{#each [3, 4, 5] as f, i (f)}
				{@const a = slot(i, 1)}
				<line
					x1={-a[0] * 70}
					y1={a[1] * 70}
					x2={a[0] * 128}
					y2={-a[1] * 128}
					stroke={D3[f].color}
					stroke-opacity={moving === f ? 0.95 : 0.32}
					stroke-width={moving === f ? 2 : 1.2}
					stroke-dasharray="5 6"
				/>
				<SvgTeX x={a[0] * 140} y={-a[1] * 140} tex={D3[f].tex} size={15} color={D3[f].color} w={40} h={24} />
			{/each}

			<!-- rotation hint -->
			<path
				d="M 118 -46 A 126 126 0 0 0 76 -100"
				fill="none"
				stroke="#f2d08f"
				stroke-opacity={moving === 1 || moving === 2 ? 0.95 : 0.45}
				stroke-width="1.6"
				marker-end="url(#arrow-gold)"
			/>
			<SvgTeX x={124} y={-90} tex="r" size={15} color="#f2d08f" w={30} h={24} />

			<!-- the slot (where the triangle must land) -->
			<polygon
				points={[0, 1, 2].map((i) => P(slot(i, R + 9)).join(',')).join(' ')}
				fill="none"
				stroke="rgba(235,229,213,0.28)"
				stroke-width="1.2"
				stroke-dasharray="3 5"
			/>

			<!-- the triangle -->
			<polygon
				points={pts.map((p) => p.join(',')).join(' ')}
				fill={faceUp ? 'url(#tp-up)' : 'url(#tp-down)'}
				fill-opacity={0.25 + 0.75 * Math.min(1, Math.abs(d))}
				stroke={faceUp ? '#b9b0ff' : '#f28db6'}
				stroke-width="2.2"
				stroke-linejoin="round"
			/>
			<!-- an arrow printed on the face: it reverses when the triangle is turned over -->
			<g transform={svgMatrix} opacity={0.25 + 0.6 * Math.min(1, Math.abs(d))}>
				<path
					d="M 20 -6 A 21 21 0 1 0 6 19"
					fill="none"
					stroke={faceUp ? '#d9d4ff' : '#ffc2db'}
					stroke-width="2.4"
					stroke-linecap="round"
				/>
				<path d="M 20 -6 L 26 4 L 13 3 Z" fill={faceUp ? '#d9d4ff' : '#ffc2db'} />
			</g>

			{#each pts as p, i (i)}
				<g transform="translate({p[0]},{p[1]})">
					<circle r="15" fill={corners[i].fill} fill-opacity="0.18" />
					<circle r="11.5" fill={corners[i].fill} stroke="#0b1020" stroke-width="1.2" />
					<text class="corner" text-anchor="middle" dy="4.6">{corners[i].name}</text>
				</g>
			{/each}
		</Svg>
		<div class="side ui">
			<span class="pill" class:down={!faceUp}>{faceUp ? 'face up' : 'face down'}</span>
			{#if word}
				<span class="word">Net move: <TeX tex={word} /></span>
			{:else}
				<span class="word dim">Press a move below.</span>
			{/if}
		</div>
		<div class="moves ui" role="group" aria-label="Symmetry moves">
			{#each D3 as g (g.id)}
				<button class="mv" style="--c:{g.color}" onclick={() => press(g.id)} title={g.words} aria-label="{g.label}: {g.words}">
					<TeX tex={g.tex} />
				</button>
			{/each}
			<button class="mv reset" onclick={reset} title="Put the triangle back to the start">Reset</button>
		</div>
	</div>

	<div class="tablebox">
		<div class="thead ui">
			<span>Cayley table: row \(g\), column \(h\) holds \(g \circ h\)</span>
		</div>
		<div class="grid" role="table" aria-label="Cayley table of the triangle symmetries">
			<div class="cell corner-cell" role="columnheader"><TeX tex={'\\circ'} /></div>
			{#each D3 as h (h.id)}
				<div class="cell head" role="columnheader" style="--c:{h.color}"><TeX tex={h.tex} /></div>
			{/each}
			{#each D3 as g (g.id)}
				<div class="cell head" role="rowheader" style="--c:{g.color}"><TeX tex={g.tex} /></div>
				{#each D3 as h (h.id)}
					{@const v = table[g.id][h.id]}
					{@const k = known[g.id * 6 + h.id]}
					{@const isLast = last && last.g === g.id && last.h === h.id}
					{@const isClash = clash && ((clash.g === g.id && clash.h === h.id) || (clash.h === g.id && clash.g === h.id))}
					<button
						class="cell val"
						class:known={k}
						class:last={isLast}
						class:clash={isClash}
						style="--c:{D3[v].color}"
						onclick={() => playCell(g.id, h.id)}
						aria-label={k ? `${g.label} after ${h.label} is ${D3[v].label}` : `${g.label} after ${h.label}: not yet discovered; click to play`}
					>
						{#if k}<TeX tex={D3[v].tex} />{:else}<span class="q">·</span>{/if}
					</button>
				{/each}
			{/each}
		</div>
		<div class="tfoot ui">
			<span class="count"><b>{discovered}</b> of 36 products discovered</span>
			<span class="btns">
				<button class="link" onclick={fillAll}>Fill in the rest</button>
				<button class="link" onclick={clearTable}>Clear</button>
			</span>
		</div>
		<div class="news ui" aria-live="polite">
			{#if clash}
				{@const a = D3[clash.g].tex}
				{@const b = D3[clash.h].tex}
				<p class="warn">
					<TeX tex={`${a}\\circ ${b} = ${D3[table[clash.g][clash.h]].tex}`} /> but
					<TeX tex={`${b}\\circ ${a} = ${D3[table[clash.h][clash.g]].tex}`} />: the order matters!
				</p>
			{:else if last}
				<p>
					New entry: <TeX tex={`${D3[last.g].tex} \\circ ${D3[last.h].tex} = ${D3[table[last.g][last.h]].tex}`} />
					<span class="dim">(first {D3[last.h].label}, then {D3[last.g].label})</span>
				</p>
			{:else}
				<p class="dim">Each move you make from the current position fills in one entry. Tap any cell to watch that product.</p>
			{/if}
		</div>
	</div>
</div>

<style>
	.tp {
		display: grid;
		grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
		gap: 1.2rem 1.6rem;
		padding: 1rem 1.3rem 1.2rem;
		align-items: start;
	}
	@media (max-width: 760px) {
		.tp {
			grid-template-columns: minmax(0, 1fr);
			padding: 0.8rem 0.8rem 1rem;
		}
	}
	.stage {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.corner {
		font-family: var(--font-ui);
		font-size: 12.5px;
		font-weight: 700;
		fill: #0b1020 !important;
	}
	.side {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.7rem;
		flex-wrap: wrap;
		min-height: 1.9rem;
		font-size: 0.82rem;
		color: var(--ink-dim);
	}
	.pill {
		font-size: 0.66rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		padding: 0.18rem 0.55rem;
		border-radius: 999px;
		color: #cfc9ff;
		border: 1px solid rgba(164, 147, 255, 0.45);
		background: rgba(164, 147, 255, 0.1);
	}
	.pill.down {
		color: #ffc2db;
		border-color: rgba(242, 141, 182, 0.5);
		background: rgba(242, 141, 182, 0.1);
	}
	.word {
		color: var(--ink);
	}
	.dim {
		color: var(--ink-faint);
	}
	.moves {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.45rem;
	}
	.mv {
		min-width: 2.7rem;
		height: 2.35rem;
		padding: 0 0.7rem;
		border-radius: 10px;
		border: 1px solid color-mix(in srgb, var(--c) 45%, transparent);
		background: color-mix(in srgb, var(--c) 9%, rgba(8, 12, 24, 0.6));
		color: var(--c);
		cursor: pointer;
		font-size: 1rem;
		transition:
			background 0.18s var(--ease),
			transform 0.12s var(--ease);
	}
	.mv:hover {
		background: color-mix(in srgb, var(--c) 20%, rgba(8, 12, 24, 0.6));
	}
	.mv:active {
		transform: translateY(1px);
	}
	.mv.reset {
		--c: #8b8676;
		font-size: 0.74rem;
		letter-spacing: 0.06em;
		color: var(--ink-dim);
	}
	.tablebox {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
		min-width: 0;
	}
	.thead {
		font-size: 0.74rem;
		color: var(--ink-faint);
		letter-spacing: 0.02em;
		text-align: center;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(7, minmax(0, 1fr));
		gap: 3px;
		max-width: 22rem;
		width: 100%;
		margin: 0 auto;
	}
	.cell {
		aspect-ratio: 1;
		display: grid;
		place-items: center;
		border-radius: 7px;
		font-size: 0.98rem;
		min-width: 0;
	}
	.corner-cell {
		color: var(--ink-faint);
	}
	.head {
		color: var(--c);
		background: color-mix(in srgb, var(--c) 7%, transparent);
		border: 1px solid color-mix(in srgb, var(--c) 22%, transparent);
	}
	.val {
		border: 1px solid rgba(255, 255, 255, 0.06);
		background: rgba(255, 255, 255, 0.02);
		color: var(--ink-ghost);
		cursor: pointer;
		padding: 0;
		transition:
			background 0.25s var(--ease),
			box-shadow 0.25s var(--ease);
	}
	.val:hover {
		border-color: rgba(255, 255, 255, 0.22);
	}
	.val.known {
		color: var(--c);
		background: color-mix(in srgb, var(--c) 16%, rgba(6, 10, 20, 0.7));
		border-color: color-mix(in srgb, var(--c) 30%, transparent);
	}
	.val.last {
		box-shadow:
			0 0 0 2px var(--c),
			0 0 14px color-mix(in srgb, var(--c) 70%, transparent);
	}
	.val.clash {
		box-shadow:
			0 0 0 2px var(--rose),
			0 0 16px rgba(242, 141, 182, 0.6);
	}
	.q {
		font-size: 1.1rem;
		opacity: 0.7;
	}
	.tfoot {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.3rem 0.8rem;
		font-size: 0.76rem;
		color: var(--ink-dim);
		max-width: 22rem;
		width: 100%;
		margin: 0 auto;
	}
	.count b {
		color: var(--gold-bright);
	}
	.btns {
		display: inline-flex;
		gap: 0.8rem;
	}
	.link {
		background: none;
		border: 0;
		padding: 0.3rem 0;
		color: var(--gold);
		cursor: pointer;
		font-size: 0.76rem;
		text-decoration: underline;
		text-underline-offset: 0.2em;
		text-decoration-color: rgba(216, 178, 110, 0.4);
	}
	.news {
		min-height: 3.2rem;
		font-size: 0.84rem;
		line-height: 1.5;
		text-align: center;
		color: var(--ink);
		max-width: 24rem;
		margin: 0 auto;
	}
	.news p {
		margin: 0;
	}
	.news .warn {
		color: #ffd0e2;
	}
</style>
