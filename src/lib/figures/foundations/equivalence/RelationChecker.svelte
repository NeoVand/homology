<script lang="ts">
	// Toggle the pairs of a relation on {1,2,3,4}; watch the three axioms light up,
	// see a witness whenever one fails, and "close it up" to the equivalence
	// relation it generates.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { renderMathInText } from '$lib/katex/render';
	import {
		checkReflexive,
		checkSymmetric,
		checkTransitive,
		classesOf,
		equivalenceClosure,
		fromPredicate,
		type Matrix
	} from './relations';

	const N = 4;
	const names = ['1', '2', '3', '4'];

	interface Preset {
		id: string;
		label: string;
		make: () => Matrix;
	}
	const presets: Preset[] = [
		{ id: 'eq', label: '=', make: () => fromPredicate(N, (i, j) => i === j) },
		{ id: 'le', label: '≤', make: () => fromPredicate(N, (i, j) => i <= j) },
		{ id: 'near', label: '|x − y| ≤ 1', make: () => fromPredicate(N, (i, j) => Math.abs(i - j) <= 1) },
		{ id: 'parity', label: 'same parity', make: () => fromPredicate(N, (i, j) => (i - j) % 2 === 0) },
		{ id: 'lonely', label: 'only 1 ∼ 1', make: () => fromPredicate(N, (i, j) => i === 0 && j === 0) },
		{ id: 'all', label: 'everything', make: () => fromPredicate(N, () => true) },
		{ id: 'none', label: 'empty', make: () => fromPredicate(N, () => false) }
	];

	let M = $state<Matrix>(presets[2].make());
	let added = $state<Matrix>(fromPredicate(N, () => false));
	let active = $state<string | null>('near');

	const refl = $derived(checkReflexive(M));
	const sym = $derived(checkSymmetric(M));
	const trans = $derived(checkTransitive(M));
	const isEq = $derived(refl.ok && sym.ok && trans.ok);
	const classes = $derived(isEq ? classesOf(M) : []);

	function toggle(i: number, j: number) {
		M[i][j] = !M[i][j];
		added[i][j] = false;
		active = null;
	}
	function load(p: Preset) {
		M = p.make();
		added = fromPredicate(N, () => false);
		active = p.id;
	}
	function closeUp() {
		const E = equivalenceClosure(M);
		added = fromPredicate(N, (i, j) => E[i][j] && !M[i][j]);
		M = E;
		active = null;
	}

	// ── what to highlight ──
	type Mark = 'culprit' | 'missing';
	const marks = $derived.by(() => {
		const m = new Map<string, Mark>();
		if (!refl.ok) for (const i of refl.missing) m.set(`${i},${i}`, 'missing');
		else if (!sym.ok && sym.bad) {
			const [i, j] = sym.bad;
			m.set(`${i},${j}`, 'culprit');
			m.set(`${j},${i}`, 'missing');
		} else if (!trans.ok && trans.bad) {
			const [i, j, k] = trans.bad;
			m.set(`${i},${j}`, 'culprit');
			m.set(`${j},${k}`, 'culprit');
			m.set(`${i},${k}`, 'missing');
		}
		return m;
	});

	const reason = $derived.by(() => {
		const n = (i: number) => names[i];
		return {
			refl: refl.ok
				? String.raw`every \(x\sim x\)`
				: String.raw`missing ${refl.missing.map((i) => `\(${n(i)}\sim ${n(i)}\)`).join(', ')}`,
			sym:
				sym.ok || !sym.bad
					? String.raw`every arrow has a partner coming back`
					: String.raw`\(${n(sym.bad[0])}\sim ${n(sym.bad[1])}\) but not \(${n(sym.bad[1])}\sim ${n(sym.bad[0])}\)`,
			trans:
				trans.ok || !trans.bad
					? String.raw`every two-step path has a shortcut`
					: String.raw`\(${n(trans.bad[0])}\sim ${n(trans.bad[1])}\) and \(${n(trans.bad[1])}\sim ${n(trans.bad[2])}\), but not \(${n(trans.bad[0])}\sim ${n(trans.bad[2])}\)`
		};
	});

	const verdict = $derived(
		isEq
			? String.raw`An equivalence relation! Its classes: ${classes.map((c) => `\(\{${c.map((i) => names[i]).join(',')}\}\)`).join(', ')}.`
			: String.raw`Not an equivalence relation. Try “close it up”: it adds exactly the pairs that the three rules force.`
	);

	// ── graph geometry ──
	const P: [number, number][] = [
		[62, 62],
		[178, 62],
		[178, 178],
		[62, 178]
	];
	const C: [number, number] = [120, 120];
	const R = 15;

	function edgePath(i: number, j: number, bend: number): { d: string } {
		const [x1, y1] = P[i];
		const [x2, y2] = P[j];
		const dx = x2 - x1;
		const dy = y2 - y1;
		const len = Math.hypot(dx, dy);
		const ux = dx / len;
		const uy = dy / len;
		const mx = (x1 + x2) / 2 - uy * bend;
		const my = (y1 + y2) / 2 + ux * bend;
		// start/end on the node circles, aimed at the control point
		const a = Math.atan2(my - y1, mx - x1);
		const b = Math.atan2(my - y2, mx - x2);
		const sx = x1 + Math.cos(a) * (R + 2);
		const sy = y1 + Math.sin(a) * (R + 2);
		const ex = x2 + Math.cos(b) * (R + 3);
		const ey = y2 + Math.sin(b) * (R + 3);
		return { d: `M ${sx} ${sy} Q ${mx} ${my} ${ex} ${ey}` };
	}
	function loopPath(i: number): string {
		const [x, y] = P[i];
		const ox = x - C[0];
		const oy = y - C[1];
		const l = Math.hypot(ox, oy);
		const ux = ox / l;
		const uy = oy / l;
		const cx = x + ux * (R + 11);
		const cy = y + uy * (R + 11);
		// a small circle tangent-ish to the node, drawn as two arcs
		const r = 11;
		const px = -uy;
		const py = ux;
		const sx = x + ux * R + px * 6;
		const sy = y + uy * R + py * 6;
		const ex = x + ux * R - px * 6;
		const ey = y + uy * R - py * 6;
		void cx;
		void cy;
		return `M ${sx} ${sy} C ${sx + ux * 2.4 * r + px * r} ${sy + uy * 2.4 * r + py * r}, ${ex + ux * 2.4 * r - px * r} ${ey + uy * 2.4 * r - py * r}, ${ex} ${ey}`;
	}
	const arrows = $derived.by(() => {
		const out: { key: string; d: string; kind: 'plain' | 'added' | 'culprit' | 'missing' }[] = [];
		for (let i = 0; i < N; i++)
			for (let j = 0; j < N; j++) {
				const key = `${i},${j}`;
				const mk = marks.get(key);
				const present = M[i][j];
				if (!present && mk !== 'missing') continue;
				const kind = mk ?? (added[i][j] ? 'added' : 'plain');
				if (i === j) out.push({ key, d: loopPath(i), kind });
				else {
					// bend the arrow when its reverse is also drawn (present, or a dashed "missing" ghost)
					const reverseDrawn = M[j][i] || marks.get(`${j},${i}`) === 'missing';
					const selfDrawn = present || mk === 'missing';
					out.push({ key, d: edgePath(i, j, reverseDrawn && selfDrawn ? 14 : 0).d, kind });
				}
			}
		return out;
	});
	const markerFor = (k: string) =>
		k === 'culprit' ? 'url(#arrow-gold)' : k === 'missing' ? 'url(#arrow-rose)' : k === 'added' ? 'url(#arrow-violet)' : 'url(#arrow-ivory)';
</script>

<div class="rc">
	<div class="panes">
		<div class="pane">
			<div class="cap ui">The relation as a table: row \(x\), column \(y\)</div>
			<table class="grid ui" aria-label="Relation table: click a cell to toggle whether row is related to column">
				<thead>
					<tr>
						<th class="corner">∼</th>
						{#each names as nm (nm)}<th>{nm}</th>{/each}
					</tr>
				</thead>
				<tbody>
					{#each names as rn, i (rn)}
						<tr>
							<th>{rn}</th>
							{#each names as cn, j (cn)}
								{@const mk = marks.get(`${i},${j}`)}
								<td>
									<button
										class="cell"
										class:on={M[i][j]}
										class:added={added[i][j]}
										class:diag={i === j}
										class:culprit={mk === 'culprit'}
										class:missing={mk === 'missing'}
										aria-pressed={M[i][j]}
										aria-label="{rn} related to {cn}: {M[i][j] ? 'yes' : 'no'}"
										onclick={() => toggle(i, j)}
									>
										{#if M[i][j]}<span class="dot"></span>{/if}
									</button>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<div class="pane">
			<div class="cap ui">The same relation as arrows: \(x \to y\) when \(x\sim y\)</div>
			<div class="graph">
				<Svg viewBox="0 0 240 240" maxHeight={250} label="The relation drawn as arrows between the elements 1, 2, 3, 4">
					{#each arrows as a (a.key)}
						{#if a.kind === 'culprit'}<path d={a.d} class="arr-halo" />{/if}
						<path d={a.d} class="arr {a.kind}" marker-end={markerFor(a.kind)} />
					{/each}
					{#each P as p, i (i)}
						<circle cx={p[0]} cy={p[1]} r={R + 6} class="nhalo" />
						<circle cx={p[0]} cy={p[1]} r={R} class="node" />
						<text x={p[0]} y={p[1] + 5} class="nlbl">{names[i]}</text>
					{/each}
				</Svg>
			</div>
		</div>
	</div>

	<div class="lights">
		<div class="light" class:ok={refl.ok}>
			<span class="badge">{refl.ok ? '✓' : '✗'}</span>
			<span class="nm">Reflexive</span>
			<span class="why">{@html renderMathInText(reason.refl)}</span>
		</div>
		<div class="light" class:ok={sym.ok}>
			<span class="badge">{sym.ok ? '✓' : '✗'}</span>
			<span class="nm">Symmetric</span>
			<span class="why">{@html renderMathInText(reason.sym)}</span>
		</div>
		<div class="light" class:ok={trans.ok}>
			<span class="badge">{trans.ok ? '✓' : '✗'}</span>
			<span class="nm">Transitive</span>
			<span class="why">{@html renderMathInText(reason.trans)}</span>
		</div>
	</div>
	<p class="verdict" class:yes={isEq} aria-live="polite">{@html renderMathInText(verdict)}</p>

	<Controls>
		<div class="presets">
			<span class="pl ui">Try:</span>
			{#each presets as p (p.id)}
				<Button variant="ghost" active={active === p.id} onclick={() => load(p)}>{p.label}</Button>
			{/each}
		</div>
		<Button variant="gold" onclick={closeUp} disabled={isEq}>Close it up</Button>
	</Controls>
</div>

<style>
	.panes {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		align-items: flex-start;
		gap: 0.6rem 2.2rem;
		padding: 1.1rem 1rem 0.2rem;
	}
	.pane {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
	}
	.cap {
		font-size: 0.74rem;
		letter-spacing: 0.04em;
		color: var(--ink-faint);
		text-align: center;
		max-width: 16rem;
	}
	.grid {
		border-collapse: separate;
		border-spacing: 4px;
		margin: 0;
		width: auto;
		font-size: 0.85rem;
	}
	.grid th {
		color: var(--gold);
		font-weight: 600;
		padding: 0 0.2rem;
		border: 0;
		text-align: center;
		letter-spacing: 0;
		text-transform: none;
		font-size: 0.9rem;
	}
	.grid .corner {
		color: var(--ink-faint);
	}
	.grid td {
		padding: 0;
		border: 0;
	}
	.cell {
		display: grid;
		place-items: center;
		width: 2.6rem;
		height: 2.6rem;
		border-radius: 9px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.025);
		cursor: pointer;
		transition:
			background 0.18s var(--ease),
			border-color 0.18s var(--ease),
			transform 0.12s;
	}
	.cell:hover {
		border-color: var(--gold);
		background: rgba(216, 178, 110, 0.08);
	}
	.cell:active {
		transform: scale(0.94);
	}
	.cell.diag {
		background: rgba(116, 169, 255, 0.05);
	}
	.cell.on {
		background: rgba(216, 178, 110, 0.14);
		border-color: rgba(216, 178, 110, 0.5);
	}
	.dot {
		width: 0.85rem;
		height: 0.85rem;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #fffaf0, #f2d08f 55%, #a5803f);
		box-shadow: 0 0 10px rgba(242, 205, 135, 0.6);
	}
	.cell.added {
		background: rgba(164, 147, 255, 0.16);
		border-color: rgba(164, 147, 255, 0.6);
	}
	.cell.added .dot {
		background: radial-gradient(circle at 35% 35%, #f3f0ff, #a493ff 60%, #6b5cc4);
		box-shadow: 0 0 10px rgba(164, 147, 255, 0.7);
	}
	.cell.culprit {
		border-color: var(--gold-bright);
		box-shadow: 0 0 0 2px rgba(244, 215, 156, 0.35);
	}
	.cell.missing {
		border: 1.5px dashed var(--rose);
		box-shadow: 0 0 12px rgba(242, 141, 182, 0.35);
	}
	.graph {
		width: 15rem;
		max-width: 80vw;
	}
	.arr {
		fill: none;
		stroke-width: 1.8;
		stroke-linecap: round;
	}
	.arr.plain {
		stroke: rgba(235, 229, 213, 0.75);
	}
	.arr.added {
		stroke: var(--violet);
		stroke-width: 2.2;
	}
	.arr.culprit {
		stroke: var(--gold-bright);
		stroke-width: 2.6;
	}
	.arr-halo {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 9;
		stroke-linecap: round;
		opacity: 0.18;
	}
	.arr.missing {
		stroke: var(--rose);
		stroke-width: 2.2;
		stroke-dasharray: 4 4;
	}
	.node {
		fill: url(#vertex-fill);
		stroke: rgba(6, 9, 18, 0.9);
		stroke-width: 1.5;
	}
	.nhalo {
		fill: rgba(242, 208, 143, 0.12);
		filter: blur(3px);
	}
	.nlbl {
		font-family: var(--font-ui);
		font-weight: 700;
		font-size: 13px !important;
		fill: #120d05 !important;
		text-anchor: middle;
		pointer-events: none;
	}
	.lights {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12.5rem, 1fr));
		gap: 0.6rem;
		padding: 0.9rem 1.2rem 0.3rem;
	}
	.light {
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-rows: auto auto;
		column-gap: 0.55rem;
		align-items: center;
		padding: 0.55rem 0.75rem;
		border-radius: 10px;
		border: 1px solid rgba(242, 141, 182, 0.35);
		background: rgba(242, 141, 182, 0.06);
		transition: all 0.25s var(--ease);
	}
	.light.ok {
		border-color: rgba(132, 217, 162, 0.45);
		background: rgba(132, 217, 162, 0.07);
	}
	.badge {
		grid-row: span 2;
		display: grid;
		place-items: center;
		width: 1.7rem;
		height: 1.7rem;
		border-radius: 50%;
		font-family: var(--font-ui);
		font-weight: 700;
		font-size: 0.9rem;
		color: #1a0d14;
		background: var(--rose);
		box-shadow: 0 0 12px rgba(242, 141, 182, 0.5);
	}
	.light.ok .badge {
		color: #07140c;
		background: var(--green);
		box-shadow: 0 0 12px rgba(132, 217, 162, 0.5);
	}
	.nm {
		font-family: var(--font-ui);
		font-size: 0.74rem;
		font-weight: 650;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-bright);
	}
	.why {
		font-size: 0.86rem;
		color: var(--ink-dim);
		line-height: 1.4;
	}
	.verdict {
		margin: 0.5rem 1.2rem 0.9rem !important;
		text-align: center;
		font-size: 0.95rem;
		color: var(--ink-dim);
	}
	.verdict.yes {
		color: var(--green);
	}
	.presets {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.35rem;
		flex: 1 1 18rem;
	}
	.pl {
		font-size: 0.74rem;
		color: var(--ink-faint);
		margin-right: 0.2rem;
	}
</style>
