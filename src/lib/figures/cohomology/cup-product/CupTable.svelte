<script lang="ts">
	// Explorer: pick a space, see its basis fences and the multiplication table
	// of its degree-1 classes — every entry computed by front face × back face.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import GluingSquare from '$lib/components/svg/GluingSquare.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { renderMathInText } from '$lib/katex/render';
	import { cupSpaces, crossingsFor, entryTeX, type CupSpace } from './spaces';
	import { boxMap, coChevrons, midArrow, pathD, type Map2, type Pt } from './draw';

	const spaces = cupSpaces();
	let id = $state('torus');
	let cell = $state<[number, number]>([0, 1]);
	const S = $derived(spaces.find((s) => s.id === id)!);

	$effect(() => {
		// pick an interesting default cell for each space
		const s = spaces.find((x) => x.id === id)!;
		const k = s.classes.length;
		cell = s.id === 'rp2' ? [0, 0] : s.id === 'klein' ? [1, 1] : k > 1 ? [0, 1] : [0, 0];
	});

	const X = 80;
	const Y = 52;
	const SZ = 260;
	const squareMap = boxMap(0, 1, 0, 1, X, Y, SZ, SZ);
	const octMap = boxMap(-1.08, 1.08, -1.08, 1.08, X - 6, Y - 6, SZ + 12, SZ + 12);
	const mapFor = (s: CupSpace): Map2 => (s.id === 'genus2' ? octMap : squareMap);
	const preset = (s: CupSpace) => (s.id === 'klein' ? 'klein' : s.id === 'rp2' ? 'rp2' : 'torus');

	const crossings = $derived(crossingsFor(S, cell[0], cell[1]));
	const value = $derived(S.table[cell[0]][cell[1]]);
	const cellTeX = $derived(`${S.classes[cell[0]].tex}\\smile ${S.classes[cell[1]].tex} = ${entryTeX(value, S.gen)}`);

	function octSides(s: CupSpace) {
		const M = s.model!;
		const m = mapFor(s);
		return M.polygon.map((p, i) => {
			const q = M.polygon[(i + 1) % M.polygon.length];
			const a = m(p);
			const b = m(q);
			const side = M.sides[i];
			const [from, to] = side.dir === 1 ? [a, b] : [b, a];
			const mx = (a[0] + b[0]) / 2;
			const my = (a[1] + b[1]) / 2;
			const cx = X + SZ / 2;
			const cy = Y + SZ / 2;
			const l = Math.hypot(mx - cx, my - cy);
			const pair = Math.min(i, side.pair);
			const colors = ['var(--gold-bright)', 'var(--teal)', '', '', 'var(--violet)', 'var(--blue)'];
			return {
				a,
				b,
				arrow: midArrow(from, to, 7),
				lx: mx + ((mx - cx) / l) * 20,
				ly: my + ((my - cy) / l) * 20,
				label: side.label,
				color: colors[pair] || 'var(--ink)'
			};
		});
	}

	const isOn = (i: number) => cell[0] === i || cell[1] === i;

	/** a spot inside the picture near the end of a fence, on the left of its direction */
	function labelSpot(arc: Pt[], m: Map2): Pt {
		const a = m(arc[0]);
		const b = m(arc[arc.length - 1]);
		const t = 0.84;
		const x = a[0] + (b[0] - a[0]) * t;
		const y = a[1] + (b[1] - a[1]) * t;
		const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
		// left of travel in SVG coordinates (y down) is (uy, −ux)
		return [x + ((b[1] - a[1]) / l) * 15, y - ((b[0] - a[0]) / l) * 15];
	}
</script>

<div class="ct">
	<div class="top ui">
		<Segmented
			bind:value={id}
			label="Choose a space"
			options={spaces.map((s) => ({
				value: s.id,
				label: { torus: 'T²', wedge: 'S¹∨S¹∨S²', genus2: 'Σ₂', rp2: 'ℝP² mod 2', klein: 'K mod 2', torus2: 'T² mod 2' }[s.id] ?? s.name
			}))}
		/>
	</div>
	<div class="body">
		<div class="pic">
			<Svg viewBox="0 0 420 380" maxHeight={400} label="The chosen surface drawn as a polygon with glued sides, with one coloured fence for each basis class of its first cohomology; the selected product's fences and their crossing points are highlighted.">
<defs>
				<filter id="ct-glow" filterUnits="userSpaceOnUse" x="-40" y="-40" width="500" height="460">
					<feGaussianBlur stdDeviation="2.6" result="b" />
					<feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
				</filter>
			</defs>
				{#if S.model}
					{@const m = mapFor(S)}
					{#if S.id === 'genus2'}
						<polygon points={S.model.polygon.map((p) => m(p).join(',')).join(' ')} class="poly" />
						{#each octSides(S) as sd, i (i)}
							<line x1={sd.a[0]} y1={sd.a[1]} x2={sd.b[0]} y2={sd.b[1]} stroke={sd.color} stroke-width="2.4" stroke-linecap="round" />
							<path d={sd.arrow} fill="none" stroke={sd.color} stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" />
							<SvgTeX x={sd.lx} y={sd.ly} tex={sd.label} color={sd.color} size={14} w={40} h={24} />
						{/each}
					{:else}
						<GluingSquare preset={preset(S)} x={X} y={Y} size={SZ} />
					{/if}
					<!-- the triangulation the products are computed on -->
					{#each S.model.edgeSegs as segs, e (e)}
						{#each segs as sg, k (k)}
							{#if sg.side < 0}
								{@const a = m(sg.a)}
								{@const b = m(sg.b)}
								<line x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} class="tri-edge" />
							{/if}
						{/each}
					{/each}
					<!-- fences -->
					{#each S.fences ?? [] as F, i (i)}
						{#each F as arc, k (k)}
							<path d={pathD(arc, m)} class="fence" class:on={isOn(i)} style="--c:{S.classes[i].color}" />
							{#if S.coeff === 'Z'}
								<path d={coChevrons(arc, m, { spacing: 64, size: 6.5 })} class="chev" class:on={isOn(i)} style="--c:{S.classes[i].color}" />
							{/if}
						{/each}
					{/each}
					{#if cell[0] === cell[1] && S.pushoffs}
						{#each S.pushoffs[cell[0]] as arc, k (k)}
							<path d={pathD(arc, m)} class="fence push on" style="--c:{S.classes[cell[0]].color}" />
						{/each}
					{/if}
					<!-- labels of the fences -->
					{#each S.fences ?? [] as F, i (i)}
						{@const lp = labelSpot(F[0], m)}
						<SvgTeX x={lp[0]} y={lp[1]} tex={S.classes[i].tex} color={S.classes[i].color} size={16} w={36} h={24} />
					{/each}
					{#each crossings as c, k (k)}
						{@const p = m(c.p)}
						<circle cx={p[0]} cy={p[1]} r="11" class="halo" />
						<circle cx={p[0]} cy={p[1]} r="5" class="dot" />
						{#if S.coeff === 'Z'}
							<text x={p[0] + 9} y={p[1] - 9} class="sgn">{c.sign > 0 ? '+' : '−'}</text>
						{/if}
					{/each}
				{:else}
					<!-- S¹ ∨ S¹ ∨ S², drawn by hand -->
					<defs>
						<radialGradient id="ct-sph" cx="38%" cy="34%" r="70%">
							<stop offset="0" stop-color="#cfe8ff" stop-opacity="0.35" />
							<stop offset="0.45" stop-color="#8f7cf7" stop-opacity="0.22" />
							<stop offset="1" stop-color="#ee8fbf" stop-opacity="0.12" />
						</radialGradient>
					</defs>
					<circle cx="210" cy="250" r="92" fill="url(#ct-sph)" stroke="rgba(200,192,170,0.5)" stroke-width="1.5" />
					<ellipse cx="210" cy="250" rx="92" ry="22" fill="none" stroke="rgba(200,192,170,0.25)" stroke-dasharray="4 5" />
					<circle cx="146" cy="115" r="68" class="wloop" style="--c:var(--gold-bright)" />
					<circle cx="274" cy="115" r="68" class="wloop" style="--c:var(--teal)" />
					<circle cx="210" cy="158" r="6" fill="url(#vertex-fill)" stroke="#060912" />
					<!-- gates (fences on circles) -->
					<line x1="68" y1="100" x2="88" y2="104" class="gate" class:on={isOn(0)} style="--c:var(--gold-bright)" />
					<line x1="352" y1="100" x2="332" y2="104" class="gate" class:on={isOn(1)} style="--c:var(--teal)" />
					<SvgTeX x={52} y={78} tex={'\\alpha'} color="var(--gold-bright)" size={17} w={30} h={24} />
					<SvgTeX x={368} y={78} tex={'\\beta'} color="var(--teal)" size={17} w={30} h={24} />
					<SvgTeX x={210} y={250} tex={'S^2'} color="var(--ink-dim)" size={17} w={40} h={24} />
					<text x="210" y="368" class="t-ui note-t">fences on different circles never meet</text>
				{/if}
			</Svg>
		</div>
		<div class="info ui">
			<div class="groups"><TeX tex={`H^0 = ${S.groups[0]},\\quad H^1 = ${S.groups[1]},\\quad H^2 = ${S.groups[2]}`} /></div>
			<div class="coef">coefficients <TeX tex={S.coeff === 'Z' ? '\\Z' : '\\Z/2'} />; <TeX tex={S.gen} /> generates <TeX tex="H^2" /></div>
			<table class="mt">
				<thead>
					<tr>
						<th class="corner"><TeX tex={'\\smile'} /></th>
						{#each S.classes as c, j (j)}
							<th style="color:{c.color}"><TeX tex={c.tex} /></th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each S.classes as c, i (i)}
						<tr>
							<th style="color:{c.color}"><TeX tex={c.tex} /></th>
							{#each S.table[i] as v, j (j)}
								<td>
									<button
										class="cellb"
										class:sel={cell[0] === i && cell[1] === j}
										class:nz={v !== 0}
										aria-label="product of class {i + 1} and class {j + 1}"
										onclick={() => (cell = [i, j])}><TeX tex={entryTeX(v, S.gen)} /></button
									>
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
			<div class="pick">
				<TeX tex={cellTeX} />
				{#if S.fences}
					<span class="cnt"
						>{crossings.length} crossing{crossings.length === 1 ? '' : 's'}{S.coeff === 'Z' && crossings.length
							? ` (signed sum ${crossings.reduce((a, c) => a + c.sign, 0)})`
							: ''}{cell[0] === cell[1] ? ' with a pushed-off copy' : ''}</span
					>
				{/if}
			</div>
			<p class="moral">{@html renderMathInText(S.moral)}</p>
		</div>
	</div>
</div>

<style>
	.ct {
		padding: 0.6rem 1.1rem 1rem;
	}
	.top {
		display: flex;
		justify-content: center;
		margin: 0.2rem 0 0.4rem;
	}
	.body {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		gap: 0.6rem 1.4rem;
		align-items: center;
	}
	@container figure (max-width: 760px) {
		.body {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.poly {
		fill: rgba(143, 124, 247, 0.12);
		stroke: none;
	}
	.tri-edge {
		stroke: rgba(200, 192, 170, 0.16);
		stroke-width: 1;
	}
	.fence {
		fill: none;
		stroke: var(--c);
		stroke-width: 2;
		opacity: 0.32;
		stroke-linecap: round;
		transition: opacity 0.3s var(--ease);
	}
	.fence.on {
		opacity: 1;
		stroke-width: 3;
		filter: url(#ct-glow);
	}
	.fence.push {
		stroke-dasharray: 7 5;
	}
	.chev {
		fill: none;
		stroke: var(--c);
		stroke-width: 2;
		opacity: 0.3;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.chev.on {
		opacity: 1;
	}
	.halo {
		fill: var(--rose);
		opacity: 0.25;
		filter: blur(3px);
	}
	.dot {
		fill: var(--rose);
		stroke: #fff4f8;
		stroke-width: 1.2;
	}
	.sgn {
		font-family: var(--font-ui);
		font-weight: 700;
		font-size: 15px;
		fill: var(--rose);
	}
	.wloop {
		fill: none;
		stroke: var(--c);
		stroke-width: 2.6;
	}
	.gate {
		stroke: var(--c);
		stroke-width: 5;
		stroke-linecap: round;
		opacity: 0.45;
	}
	.gate.on {
		opacity: 1;
		filter: url(#ct-glow);
	}
	.note-t {
		text-anchor: middle;
		font-size: 11px;
	}
	.info {
		display: grid;
		gap: 0.55rem;
		justify-items: start;
	}
	.groups {
		font-size: 0.98rem;
		color: var(--ink-bright);
	}
	.coef {
		font-size: 0.78rem;
		color: var(--ink-faint);
	}
	.mt {
		margin: 0.2rem 0;
		width: auto;
		border-collapse: separate;
		border-spacing: 4px;
	}
	.mt th,
	.mt td {
		border: 0;
		padding: 0;
		text-align: center;
		font-size: 0.95rem;
		text-transform: none;
		letter-spacing: 0;
	}
	.mt thead th {
		text-transform: none;
		letter-spacing: 0;
		padding-bottom: 2px;
	}
	.corner {
		color: var(--ink-faint);
	}
	.cellb {
		min-width: 3.3rem;
		height: 2.5rem;
		border-radius: 9px;
		border: 1px solid var(--line-faint);
		background: rgba(255, 255, 255, 0.03);
		color: var(--ink-dim);
		cursor: pointer;
		transition: all 0.2s var(--ease);
		font-size: 0.95rem;
	}
	.cellb.nz {
		color: var(--rose);
		background: rgba(242, 141, 182, 0.08);
	}
	.cellb:hover {
		border-color: var(--gold);
	}
	.cellb.sel {
		border-color: var(--gold-bright);
		box-shadow: 0 0 0 2px rgba(244, 215, 156, 0.25);
		background: rgba(216, 178, 110, 0.12);
	}
	.pick {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem 0.7rem;
		align-items: baseline;
		color: var(--ink-bright);
	}
	.cnt {
		font-size: 0.74rem;
		color: var(--ink-faint);
	}
	.moral {
		margin: 0;
		font-family: var(--font-body);
		font-size: 0.9rem;
		line-height: 1.55;
		color: var(--ink-dim);
	}
</style>
