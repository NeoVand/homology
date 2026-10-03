<script lang="ts">
	// Cycles modulo boundaries, by hand: click triangles to push a cycle across
	// them. The cycle changes; its homology class (the badge) never does.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import FlatComplex from './FlatComplex.svelte';
	import { annulus, annulusWinding } from './complexes';
	import { addChains, isZero, zeroChain, type Chain } from './chains';
	import { push, support, triBoundary } from './homologous';
	import { mulberry32 } from '$lib/math/persistence';

	const A = annulus();
	const K = A.K;
	const [inner, middle, outer] = A.cycles!.map((c) => c.chain);
	// a small loop that bounds: the boundary of two neighbouring triangles, counterclockwise
	const ccw = new Map(A.L.tris.map((d) => [d.t, d.screen]));
	const smallLoop = (() => {
		const ts = [K.indexOf([1, 2, 9]), K.indexOf([2, 9, 10])].filter((t) => t >= 0);
		let z = zeroChain(K, 1);
		for (const t of ts) z = addChains(z, triBoundary(K, t), ccw.get(t)!);
		return z;
	})();

	const starts: { value: string; label: string; z: Chain; tex: string }[] = [
		{ value: 'middle', label: 'Once around', z: middle, tex: '\\gamma' },
		{ value: 'small', label: 'A small loop', z: smallLoop, tex: '\\sigma' },
		{ value: 'pair', label: 'Inner − outer', z: addChains(inner, outer, -1), tex: '\\gamma_{\\text{in}} - \\gamma_{\\text{out}}' },
		{ value: 'twice', label: 'Twice around', z: middle.map((x) => 2 * x), tex: '2\\gamma' }
	];

	let startId = $state('middle');
	const start = $derived(starts.find((s) => s.value === startId)!);
	let z = $state<Chain>(middle.slice());
	let c = $state<Chain>(zeroChain(K, 2));
	let history = $state<{ z: Chain; c: Chain }[]>([]);
	let pulseTri = $state<number | null>(null);
	let pulseKey = $state(0);
	let lastSign = $state<1 | -1>(1);
	let showC = $state(true);

	function reset(id = startId) {
		startId = id;
		z = starts.find((s) => s.value === id)!.z.slice();
		c = zeroChain(K, 2);
		history = [];
		pulseTri = null;
	}
	function pick(_kind: string, t: number) {
		history = [...history, { z, c }];
		const r = push(K, { z, c }, t, (ccw.get(t) ?? 1) as 1 | -1);
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
			const touching = K.simplices[2]
				.map((_, t) => t)
				.filter((t) => triBoundary(K, t).some((x, e) => x && z[e]));
			const pool = touching.length ? touching : K.simplices[2].map((_, t) => t);
			pick('tri', pool[Math.floor(rnd() * pool.length)]);
		}
	}

	const w = $derived(annulusWinding(K, z));
	const len = $derived(support(z));
	const area = $derived(support(c));
	const closed = $derived(isZero(K.boundary(1, z)));
	const badge = $derived(
		w === 0
			? { text: 'bounds — the zero class', cls: 'zero' }
			: { text: `${Math.abs(w) === 1 ? 'once' : Math.abs(w) === 2 ? 'twice' : Math.abs(w) + ' times'} around the hole${w < 0 ? ', clockwise' : ''}`, cls: 'hole' }
	);
	const classTeX = $derived(w === 0 ? '[z] = 0' : `[z] = ${w === 1 ? '' : w === -1 ? '-' : w}[\\gamma]`);
	const maxC = $derived(Math.max(1, ...c.map((x) => Math.abs(x))));
</script>

<div class="hc">
	<div class="pic">
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
	</div>
	<div class="side ui">
		<div class="badge {badge.cls}">
			<span class="b-k">class</span>
			<span class="b-v"><TeX tex={classTeX} /></span>
			<span class="b-t">{badge.text}</span>
		</div>
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
			<Button onclick={undo} disabled={!history.length}>Undo</Button>
			<Button onclick={() => reset()}>Reset</Button>
			<Button onclick={wiggle}>Six random pushes</Button>
		</div>
		<label class="chk"><input type="checkbox" bind:checked={showC} /> shade the 2-chain <TeX tex="c" /></label>
		<div class="starts">
			<span class="lbl">start from</span>
			<Segmented bind:value={startId} options={starts.map((s) => ({ value: s.value, label: s.label }))} onchange={(v) => reset(v)} />
		</div>
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
	@media (max-width: 760px) {
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
	.side {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		font-size: 0.82rem;
		color: var(--ink-dim);
	}
	.badge {
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
