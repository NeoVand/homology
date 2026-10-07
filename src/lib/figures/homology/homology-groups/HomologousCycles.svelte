<script lang="ts">
	// Cycles modulo boundaries, by hand: click triangles to push a cycle across
	// them. The cycle changes; its homology class (the badge) never does.
	// Two spaces: a ring-shaped annulus, and a big triangle with one small
	// triangle missing, where the game is to shrink-wrap the rim onto the hole.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import FlatComplex from './FlatComplex.svelte';
	import { annulus, annulusWinding, holedTriangle, windingAround } from './complexes';
	import { addChains, isZero, zeroChain, type Chain } from './chains';
	import { push, support, triBoundary } from './homologous';
	import { mulberry32 } from '$lib/math/persistence';
	import { ResetIcon, ShuffleIcon, UndoIcon } from '$lib/icons';

	// ── the annulus ────────────────────────────────────────────────────────
	const A = annulus();
	const [inner, middle, outer] = A.cycles!.map((c) => c.chain);
	const ccwA = new Map(A.L.tris.map((d) => [d.t, d.screen]));
	// a small loop that bounds: the boundary of two neighbouring triangles, counterclockwise
	const smallLoop = (() => {
		const ts = [A.K.indexOf([1, 2, 9]), A.K.indexOf([2, 9, 10])].filter((t) => t >= 0);
		let z = zeroChain(A.K, 1);
		for (const t of ts) z = addChains(z, triBoundary(A.K, t), ccwA.get(t)!);
		return z;
	})();

	// ── the triangle with a hole ───────────────────────────────────────────
	const T = holedTriangle();
	const [rim, hug] = T.cycles!.map((c) => c.chain);
	const ccwT = new Map(T.L.tris.map((d) => [d.t, d.screen]));
	const holePts = T.hole.map((v) => T.L.verts.find((d) => d.v === v)!.p);

	type SpaceId = 'annulus' | 'triangle';
	const spaces = {
		annulus: {
			ex: A,
			ccw: ccwA,
			winding: (z: Chain) => annulusWinding(A.K, z),
			starts: [
				{ value: 'middle', label: 'Once around', z: middle, tex: '\\gamma' },
				{ value: 'small', label: 'A small loop', z: smallLoop, tex: '\\sigma' },
				{ value: 'pair', label: 'Inner − outer', z: addChains(inner, outer, -1), tex: '\\gamma_{\\text{in}} - \\gamma_{\\text{out}}' },
				{ value: 'twice', label: 'Twice around', z: middle.map((x) => 2 * x), tex: '2\\gamma' }
			]
		},
		triangle: {
			ex: T,
			ccw: ccwT,
			winding: (z: Chain) => windingAround(T.L, z, T.holeCentre),
			starts: [{ value: 'rim', label: 'The rim', z: rim, tex: '\\rho' }]
		}
	};

	let spaceId = $state<SpaceId>('annulus');
	const sp = $derived(spaces[spaceId]);
	const K = $derived(sp.ex.K);
	let startId = $state('middle');
	const start = $derived(sp.starts.find((s) => s.value === startId) ?? sp.starts[0]);
	let z = $state<Chain>(middle.slice());
	let c = $state<Chain>(zeroChain(A.K, 2));
	let history = $state<{ z: Chain; c: Chain }[]>([]);
	let pulseTri = $state<number | null>(null);
	let pulseKey = $state(0);
	let lastSign = $state<1 | -1>(1);
	let showC = $state(true);

	function reset(id = startId) {
		const s = sp.starts.find((x) => x.value === id) ?? sp.starts[0];
		startId = s.value;
		z = s.z.slice();
		c = zeroChain(K, 2);
		history = [];
		pulseTri = null;
	}
	function setSpace(id: SpaceId) {
		spaceId = id;
		reset(spaces[id].starts[0].value);
	}
	function pick(_kind: string, t: number) {
		history = [...history, { z, c }];
		const r = push(K, { z, c }, t, (sp.ccw.get(t) ?? 1) as 1 | -1);
		z = r.z;
		c = r.c;
		lastSign = r.sign;
		pulseTri = t;
		pulseKey++;
	}
	function undo() {
		const h = history[history.length - 1];
		if (!h) return;
		z = h.z;
		c = h.c;
		history = history.slice(0, -1);
		pulseTri = null;
	}
	let seed = 7;
	function wiggle() {
		const rnd = mulberry32(seed++);
		// push across triangles that touch the current cycle, so the cycle visibly wanders
		for (let n = 0; n < 6; n++) {
			const touching = K.simplices[2].map((_, t) => t).filter((t) => triBoundary(K, t).some((x, e) => x && z[e]));
			const pool = touching.length ? touching : K.simplices[2].map((_, t) => t);
			pick('tri', pool[Math.floor(rnd() * pool.length)]);
		}
	}

	const w = $derived(sp.winding(z));
	const len = $derived(support(z));
	const area = $derived(support(c));
	const closed = $derived(isZero(K.boundary(1, z)));
	const hugged = $derived(spaceId === 'triangle' && z.every((x, i) => x === hug[i]));
	const badge = $derived(
		w === 0
			? { text: 'bounds — the zero class', cls: 'zero' }
			: {
					text: `${Math.abs(w) === 1 ? 'once' : Math.abs(w) === 2 ? 'twice' : Math.abs(w) + ' times'} around the hole${w < 0 ? ', clockwise' : ''}`,
					cls: 'hole'
				}
	);
	const gen = $derived(spaceId === 'annulus' ? '\\gamma' : '\\rho');
	const classTeX = $derived(w === 0 ? '[z] = 0' : `[z] = ${w === 1 ? '' : w === -1 ? '-' : w}[${gen}]`);
	const maxC = $derived(Math.max(1, ...c.map((x) => Math.abs(x))));
</script>

<div class="hc">
	<div class="space-pick">
		<Segmented
			value={spaceId}
			options={[
				{ value: 'annulus', label: 'Annulus' },
				{ value: 'triangle', label: 'Triangle with a hole' }
			]}
			onchange={(v) => setSpace(v as SpaceId)}
			label="Which space"
		/>
	</div>
	<div class="pic">
		{#if spaceId === 'annulus'}
			<Svg viewBox={A.L.viewBox} maxHeight={470} label="A triangulated annulus around a central hole, with a gold cycle drawn on its edges. Clicking a triangle pushes the cycle across it.">
				<circle cx="0" cy="0" r={A.L.scale * 1.05} class="hole-disk" />
				<SvgTeX x={0} y={-8} tex={'\\text{hole}'} size={17} color="var(--rose)" w={80} />
				<SvgTeX x={0} y={18} tex={'(\\text{not part of } K)'} size={11} color="var(--ink-faint)" w={120} />
				<FlatComplex
					L={A.L}
					edgeCoef={(e) => z[e]}
					triFill={(t) => (showC && c[t] ? 'var(--violet)' : null)}
					triOpacity={(t) => 0.16 + (0.3 * Math.abs(c[t])) / maxC}
					interactive={['tri']}
					onpick={pick}
					{pulseTri}
					{pulseKey}
					showLabels={false}
					ariaName="annulus"
				/>
			</Svg>
		{:else}
			<Svg viewBox={T.L.viewBox} maxHeight={470} label="A big triangle cut into sixteen small ones, with one small triangle near the middle missing: the hole. A gold cycle runs around the rim. Clicking a triangle pushes the cycle across it.">
				<polygon points={holePts.map((p) => p.join(',')).join(' ')} class="hole-tri" />
				<FlatComplex
					L={T.L}
					edgeCoef={(e) => z[e]}
					coefColor={hugged ? 'var(--green)' : 'var(--gold-bright)'}
					triFill={(t) => (showC && c[t] ? 'var(--violet)' : null)}
					triOpacity={(t) => 0.16 + (0.3 * Math.abs(c[t])) / maxC}
					interactive={['tri']}
					onpick={pick}
					{pulseTri}
					{pulseKey}
					showLabels={false}
					ariaName="holed triangle"
				/>
			</Svg>
		{/if}
	</div>
	<div class="side ui">
		<div class="badge {badge.cls}">
			<span class="b-k">class</span>
			<span class="b-v"><TeX tex={classTeX} /></span>
			<span class="b-t">{badge.text}</span>
		</div>
		{#if spaceId === 'triangle'}
			<div class="goal" class:won={hugged}>
				<span class="b-k">goal</span>
				{#if hugged}
					<span class="g-t">Done in {history.length} push{history.length === 1 ? '' : 'es'}. The violet 2-chain is all {area} triangles:</span>
					<span class="g-m"><TeX tex={'\\rho - \\eta = \\partial(\\text{everything})'} /></span>
				{:else}
					<span class="g-t">Shrink-wrap the rim onto the hole: a loop of 3 edges. Now {len} edges, after {history.length} push{history.length === 1 ? '' : 'es'}.</span>
				{/if}
			</div>
		{/if}
		<dl class="facts">
			<div>
				<dt>start</dt>
				<dd><TeX tex={`z = ${start.tex}`} /></dd>
			</div>
			<div>
				<dt>now</dt>
				<dd><TeX tex={area ? `z' = z + \\partial c` : `z' = z`} /></dd>
			</div>
			<div>
				<dt>cycle?</dt>
				<dd class:ok={closed}>{closed ? '∂z′ = 0 — still a cycle' : 'not a cycle'}</dd>
			</div>
			<div>
				<dt>size</dt>
				<dd>{len} edges · c covers {area} triangle{area === 1 ? '' : 's'}</dd>
			</div>
		</dl>
		{#if history.length}
			<p class="last">
				Last push added <TeX tex={lastSign > 0 ? '+\\partial t' : '-\\partial t'} /> for the flashing triangle <TeX tex="t" />.
			</p>
		{:else}
			<p class="last">Click any triangle to push the cycle across it.</p>
		{/if}
		<div class="row">
			<Button onclick={undo} disabled={!history.length} icon={UndoIcon}>Undo</Button>
			<Button onclick={() => reset()} icon={ResetIcon}>Reset</Button>
			<Button onclick={wiggle} icon={ShuffleIcon}>Six random pushes</Button>
		</div>
		<label class="chk"><input type="checkbox" bind:checked={showC} /> shade the 2-chain <TeX tex="c" /></label>
		{#if sp.starts.length > 1}
			<div class="starts">
				<span class="lbl">start from</span>
				<Segmented bind:value={startId} options={sp.starts.map((s) => ({ value: s.value, label: s.label }))} onchange={(v) => reset(v)} />
			</div>
		{/if}
	</div>
</div>

<style>
	.hc {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
		gap: 0.5rem 1.2rem;
		padding: 0.6rem 1.1rem 1.1rem;
		align-items: center;
	}
	.space-pick {
		grid-column: 1 / -1;
		padding-top: 0.2rem;
	}
	@container figure (max-width: 46rem) {
		.hc {
			grid-template-columns: minmax(0, 1fr);
			padding: 0.4rem 0.7rem 0.9rem;
		}
	}
	.hole-disk {
		fill: rgba(4, 6, 12, 0.85);
		stroke: var(--rose);
		stroke-width: 1.6;
		stroke-dasharray: 5 5;
	}
	.hole-tri {
		fill: rgba(4, 6, 12, 0.92);
		stroke: var(--rose);
		stroke-width: 1.8;
		stroke-dasharray: 5 4;
	}
	.side {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		font-size: 0.82rem;
		color: var(--ink-dim);
	}
	.badge,
	.goal {
		display: grid;
		gap: 0.15rem;
		padding: 0.75rem 0.95rem;
		border-radius: 12px;
		border: 1px solid var(--line);
		background: rgba(10, 15, 29, 0.7);
		transition:
			border-color 0.4s var(--ease),
			box-shadow 0.4s var(--ease);
	}
	.badge.hole {
		border-color: rgba(242, 208, 143, 0.55);
		box-shadow: 0 0 24px -8px var(--gold-glow);
	}
	.badge.zero {
		border-color: rgba(95, 214, 207, 0.55);
		box-shadow: 0 0 24px -8px rgba(95, 214, 207, 0.4);
	}
	.goal {
		padding: 0.6rem 0.95rem;
	}
	.goal.won {
		border-color: rgba(120, 214, 140, 0.6);
		box-shadow: 0 0 24px -8px rgba(120, 214, 140, 0.45);
	}
	.g-t {
		color: var(--ink);
		font-size: 0.84rem;
		line-height: 1.45;
	}
	.g-m {
		color: var(--green);
		font-size: 1.02rem;
	}
	.b-k {
		font-size: 0.66rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.b-v {
		font-size: 1.35rem;
		color: var(--gold-bright);
	}
	.zero .b-v {
		color: var(--teal);
	}
	.b-t {
		color: var(--ink);
		font-size: 0.85rem;
	}
	.facts {
		margin: 0;
		display: grid;
		gap: 0.3rem;
	}
	.facts div {
		display: grid;
		grid-template-columns: 4.2rem 1fr;
		gap: 0.6rem;
		align-items: baseline;
	}
	dt {
		font-size: 0.66rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	dd {
		margin: 0;
		color: var(--ink);
	}
	dd.ok {
		color: var(--green);
	}
	.last {
		margin: 0;
		font-size: 0.8rem;
		color: var(--ink-dim);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.45rem;
	}
	.chk {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		cursor: pointer;
	}
	.chk input {
		accent-color: var(--violet);
	}
	.starts {
		display: grid;
		gap: 0.35rem;
	}
	.lbl {
		font-size: 0.66rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
</style>
