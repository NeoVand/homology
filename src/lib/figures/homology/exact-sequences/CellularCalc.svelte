<script lang="ts">
	// A cellular homology calculator. Mode 1: type a polygon word (one 2-cell glued
	// along it); see the polygon, the vertex classes, the cellular chain complex and
	// H₀, H₁, H₂. Mode 2: the cell ladders of ℝPⁿ, ℂPⁿ and Sⁿ.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import MatrixView from '$lib/components/prose/MatrixView.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import { groupTeX } from '$lib/math/homology';
	import { identifySurface, ladder, ladderHomology, parseWord, polygonComplex, polygonHomology, wordTeX, type LadderSpace } from './cellular';

	let mode = $state<'word' | 'ladder'>('word');
	let input = $state('abab^-1');
	const presets: { label: string; word: string }[] = [
		{ label: 'Torus', word: 'aba^-1b^-1' },
		{ label: 'Klein bottle', word: 'abab^-1' },
		{ label: 'ℝP² (aa)', word: 'aa' },
		{ label: 'ℝP² (abab)', word: 'abab' },
		{ label: 'Sphere', word: 'aa^-1' },
		{ label: 'Genus 2', word: 'a1b1a1^-1b1^-1a2b2a2^-1b2^-1' },
		{ label: 'Three cross-caps', word: 'aabbcc' },
		{ label: 'Dunce cap', word: 'aaa^-1' },
		{ label: 'Möbius band', word: 'abcb' }
	];

	const parsed = $derived(parseWord(input));
	const P = $derived(parsed.error ? null : polygonComplex(parsed.letters));
	const H = $derived(P ? polygonHomology(P) : null);
	const info = $derived(P ? identifySurface(P) : null);

	const edgeColors = ['#f4d79c', '#5fd6cf', '#a493ff', '#f28db6', '#74a9ff', '#84d9a2', '#f4b55f', '#ebe5d5'];
	const vertexColors = ['#fff1d0', '#74a9ff', '#f28db6', '#84d9a2', '#a493ff', '#5fd6cf', '#f4b55f', '#ebe5d5'];
	const vName = (i: number) => 'PQRSTUVWXYZ'[i] ?? `v_{${i}}`;
	const eTeX = (name: string) => {
		const m = name.match(/^([a-z])(\d*)$/);
		return m ? m[1] + (m[2] ? `_{${m[2]}}` : '') : name;
	};

	// ── polygon geometry ──
	type Pt = [number, number];
	const CX = 180;
	const CY = 175;
	const RAD = 118;
	const geom = $derived.by(() => {
		if (!P) return null;
		const m = P.letters.length;
		const corners: Pt[] = [];
		const edges: { d: string; mid: Pt; tan: Pt; out: Pt }[] = [];
		if (m === 1) {
			corners.push([CX, CY + RAD]);
			edges.push({
				d: `M ${CX} ${CY + RAD} A ${RAD} ${RAD} 0 1 0 ${CX} ${CY - RAD} A ${RAD} ${RAD} 0 1 0 ${CX} ${CY + RAD}`,
				mid: [CX, CY - RAD],
				tan: [-1, 0],
				out: [0, -1]
			});
		} else if (m === 2) {
			const c0: Pt = [CX - RAD, CY];
			const c1: Pt = [CX + RAD, CY];
			corners.push(c0, c1);
			const lo: Pt = [CX, CY + 1.15 * RAD];
			const hi: Pt = [CX, CY - 1.15 * RAD];
			edges.push({ d: `M ${c0} Q ${lo} ${c1}`, mid: [(c0[0] + 2 * lo[0] + c1[0]) / 4, (c0[1] + 2 * lo[1] + c1[1]) / 4], tan: [1, 0], out: [0, 1] });
			edges.push({ d: `M ${c1} Q ${hi} ${c0}`, mid: [(c1[0] + 2 * hi[0] + c0[0]) / 4, (c1[1] + 2 * hi[1] + c0[1]) / 4], tan: [-1, 0], out: [0, -1] });
		} else {
			for (let i = 0; i < m; i++) {
				const th = -Math.PI / 2 - Math.PI / m + (2 * Math.PI * i) / m;
				corners.push([CX + RAD * Math.cos(th), CY - RAD * Math.sin(th)]);
			}
			for (let i = 0; i < m; i++) {
				const a = corners[i];
				const b = corners[(i + 1) % m];
				const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
				const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
				const tan: Pt = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
				const oL = Math.hypot(mid[0] - CX, mid[1] - CY) || 1;
				edges.push({ d: `M ${a} L ${b}`, mid, tan, out: [(mid[0] - CX) / oL, (mid[1] - CY) / oL] });
			}
		}
		return { corners, edges, m };
	});
	function chevron(mid: Pt, tan: Pt, dir: number, size = 8): string {
		const ux = tan[0] * dir;
		const uy = tan[1] * dir;
		return `M ${mid[0] - ux * size - uy * size * 0.75} ${mid[1] - uy * size + ux * size * 0.75} L ${mid[0] + ux * size * 0.5} ${mid[1] + uy * size * 0.5} L ${mid[0] - ux * size + uy * size * 0.75} ${mid[1] - uy * size - ux * size * 0.75}`;
	}

	// ── ladder mode ──
	let space = $state<LadderSpace>('RP');
	let n = $state(4);
	let mod2 = $state(false);
	const maxN = $derived(space === 'CP' ? 4 : 8);
	$effect(() => {
		if (n > maxN) n = maxN;
	});
	const L = $derived(ladder(space, Math.min(n, maxN)));
	const LH = $derived(ladderHomology(L, mod2));
	const spaceTeX = $derived(space === 'RP' ? `\\RP^{${n}}` : space === 'CP' ? `\\CP^{${n}}` : `S^{${n}}`);
	const ks = $derived(Array.from({ length: L.top + 1 }, (_, i) => L.top - i));
</script>

<div class="calc">
	<div class="modebar">
		<Segmented
			bind:value={mode}
			label="Calculator mode"
			options={[
				{ value: 'word', label: 'Polygon words' },
				{ value: 'ladder', label: 'ℝPⁿ, ℂPⁿ, Sⁿ' }
			]}
		/>
	</div>

	{#if mode === 'word'}
		<div class="inrow ui">
			<label class="in">
				<span class="lbl">word</span>
				<input type="text" bind:value={input} spellcheck="false" autocomplete="off" aria-label="edge word, e.g. aba^-1b^-1" />
			</label>
			<span class="hintx">inverse: <code>a^-1</code>, <code>a'</code>, <code>a⁻¹</code> or <code>A</code> · subscripts: <code>a1</code></span>
		</div>
		<div class="presets">
			{#each presets as p (p.label)}
				<Button variant="ghost" active={input === p.word} onclick={() => (input = p.word)}>{p.label}</Button>
			{/each}
		</div>

		{#if parsed.error || !P || !geom || !H || !info}
			<p class="err ui">{parsed.error}</p>
		{:else}
			<div class="body">
				<div class="poly">
					<Svg viewBox="0 0 360 350" maxHeight={360} label="The polygon with its sides labelled by the word">
						<defs>
							<radialGradient id="cc-face" cx="50%" cy="45%" r="65%">
								<stop offset="0" stop-color="#8f7cf7" stop-opacity="0.2" />
								<stop offset="1" stop-color="#6fd6e8" stop-opacity="0.08" />
							</radialGradient>
						</defs>
						{#if geom.m >= 3}
							<polygon points={geom.corners.map((c) => c.join(',')).join(' ')} fill="url(#cc-face)" />
						{:else if geom.m === 2}
							<path d="{geom.edges[0].d} {geom.edges[1].d.replace(/^M [^Q]*/, '')}" fill="url(#cc-face)" />
						{:else}
							<circle cx={CX} cy={CY} r={RAD} fill="url(#cc-face)" />
						{/if}
						<SvgTeX x={CX} y={CY} tex={'e^2'} size={20} color="var(--violet)" w={40} h={30} />
						{#each P.letters as l, i (i)}
							{@const e = geom.edges[i]}
							{@const ei = P.edges.indexOf(l.name)}
							{@const col = edgeColors[ei % edgeColors.length]}
							<path d={e.d} fill="none" stroke={col} stroke-width="3" stroke-linecap="round" class="side" />
							<path d={chevron(e.mid, e.tan, l.exp)} fill="none" stroke={col} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
							<SvgTeX x={e.mid[0] + e.out[0] * 22} y={e.mid[1] + e.out[1] * 22} tex={eTeX(l.name)} size={geom.m > 12 ? 13 : 16} color={col} w={40} h={24} />
						{/each}
						{#each geom.corners as c, i (i)}
							{@const vc = P.cornerClass[i]}
							<circle cx={c[0]} cy={c[1]} r="10" fill={vertexColors[vc % vertexColors.length]} stroke="#060912" stroke-width="1.5" />
							<text x={c[0]} y={c[1] + 4} text-anchor="middle" class="vl">{vName(vc)}</text>
						{/each}
					</Svg>
					<div class="wordtex"><TeX tex={wordTeX(P.letters)} /></div>
				</div>
				<div class="alg">
					<div class="cells ui">
						<span><b>{P.nVertices}</b> vertex class{P.nVertices === 1 ? '' : 'es'}</span>
						<span><b>{P.edges.length}</b> edge{P.edges.length === 1 ? '' : 's'}</span>
						<span><b>1</b> face</span>
						<span class="chi"><TeX tex={`\\chi = ${P.nVertices} - ${P.edges.length} + 1 = ${info.chi}`} /></span>
					</div>
					<div class="cx">
						<TeX tex={`0\\to\\mathbb Z \\xrightarrow{\\ \\partial_2\\ } \\mathbb Z^{${P.edges.length}} \\xrightarrow{\\ \\partial_1\\ } \\mathbb Z^{${P.nVertices}} \\to 0`} />
					</div>
					<div class="mats">
						<div class="mat">
							<MatrixView M={P.d2} rowLabels={P.edges.map(eTeX)} colLabels={['e^2']} caption={'\\partial_2 ='} cellClass={(_, __) => 'gold'} />
							<div class="why ui">exponent sum of each letter</div>
						</div>
						<div class="mat">
							<MatrixView M={P.d1} rowLabels={Array.from({ length: P.nVertices }, (_, i) => vName(i))} colLabels={P.edges.map(eTeX)} caption={'\\partial_1 ='} />
							<div class="why ui">end − start of each edge</div>
						</div>
					</div>
					<div class="res">
						{#each [0, 1, 2] as k (k)}
							<div class="hk" class:tors={H[k].torsion.length > 0}>
								<TeX tex={`H_{${k}} = ${groupTeX(H[k])}`} />
							</div>
						{/each}
					</div>
					<div class="ident ui">
						{#if info.closed}
							A closed surface: <b>{info.name}</b>
							{#if info.tex}<TeX tex={`(${info.tex})`} />{/if} — {info.orientable ? 'orientable' : 'non-orientable'}.
						{:else}
							Some edge appears only once, so it is a free boundary edge: this is <b>{info.name}</b>.
						{/if}
					</div>
				</div>
			</div>
		{/if}
	{:else}
		<div class="ladder">
			<div class="lhead">
				<TeX tex={spaceTeX} />
				<span class="ui sub">{space === 'RP' ? `one cell in each dimension 0 … ${n}` : space === 'CP' ? `one cell in each even dimension 0, 2, … ${2 * n}` : `one 0-cell and one ${n}-cell`}</span>
			</div>
			<div class="chips">
				<span class="zero"><TeX tex={'0\\to'} /></span>
				{#each ks as k, i (k)}
					<div class="chip" class:empty={!L.cells[k]}>
						<div class="c"><TeX tex={L.cells[k] ? `C_{${k}} = ${mod2 ? '\\mathbb Z/2' : '\\mathbb Z'}` : `C_{${k}} = 0`} /></div>
						<div class="h" class:t={LH[k].torsion.length > 0} class:z={LH[k].rank === 0 && LH[k].torsion.length === 0}>
							<TeX tex={`H_{${k}} = ${groupTeX(LH[k], mod2 ? 'Z2' : 'Z')}`} />
						</div>
					</div>
					{#if i < ks.length - 1}
						{@const d = L.degrees[k]}
						<span class="dk" class:two={d !== null && (mod2 ? d % 2 !== 0 : d !== 0)}>
							<TeX tex={d === null ? '\\to' : `\\xrightarrow{\\times ${mod2 ? d % 2 : d}}`} />
						</span>
					{/if}
				{/each}
				<span class="zero"><TeX tex={'\\to 0'} /></span>
			</div>
			<p class="explain ui">
				{#if space === 'RP'}
					The boundary of the \(k\)-cell wraps twice around \(\RP^{k-1}\): once by the identity, once by the antipodal map of degree \((-1)^k\). So \(d_k = 1 + (-1)^k\): it is \(\times 2\) when \(k\) is even and \(0\) when \(k\) is odd.
				{:else if space === 'CP'}
					There are no cells in odd dimensions, so every boundary map goes to or from \(0\). Every boundary map vanishes, and \(H_{2k}\cong\Z\) for \(0\le k\le n\).
				{:else}
					With only a \(0\)-cell and an \(n\)-cell there is nothing for the boundary to hit (for \(n = 1\) the edge's two ends are the same vertex, so \(d_1 = 0\)).
				{/if}
			</p>
		</div>
		<Controls>
			<Segmented
				bind:value={space}
				label="Space"
				options={[
					{ value: 'RP', label: 'ℝPⁿ' },
					{ value: 'CP', label: 'ℂPⁿ' },
					{ value: 'S', label: 'Sⁿ' }
				]}
			/>
			<Slider bind:value={n} min={1} max={maxN} step={1} label="n" format={(v) => String(v)} />
			<Toggle bind:checked={mod2} label="Coefficients ℤ/2" />
		</Controls>
	{/if}
</div>

<style>
	.modebar {
		display: flex;
		justify-content: center;
		padding: 0.9rem 1rem 0.2rem;
	}
	.inrow {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.5rem 1rem;
		padding: 0.6rem 1rem 0.3rem;
	}
	.in {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}
	.in .lbl {
		font-size: 0.7rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.in input {
		font-family: var(--font-mono);
		font-size: 1rem;
		padding: 0.45rem 0.7rem;
		min-width: 14rem;
		max-width: 70vw;
		border-radius: 9px;
		border: 1px solid var(--line);
		background: rgba(5, 8, 16, 0.7);
		color: var(--gold-pale);
		outline: none;
	}
	.in input:focus {
		border-color: var(--gold);
		box-shadow: 0 0 0 3px rgba(216, 178, 110, 0.15);
	}
	.hintx {
		font-size: 0.72rem;
		color: var(--ink-faint);
	}
	.hintx code {
		font-size: 0.85em;
		padding: 0.05em 0.3em;
	}
	.presets {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.35rem;
		padding: 0.3rem 0.8rem 0.4rem;
	}
	.err {
		text-align: center;
		color: var(--amber);
		font-size: 0.85rem;
		padding: 1rem;
	}
	.body {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1.4rem;
		align-items: center;
		justify-content: center;
		padding: 0.2rem 0.9rem 1rem;
	}
	.poly {
		flex: 1 1 260px;
		max-width: 360px;
	}
	.wordtex {
		text-align: center;
		color: var(--ink-bright);
		font-size: 1.05rem;
		margin-top: -0.4rem;
		overflow-x: auto;
	}
	.side {
		transition: stroke 0.3s;
	}
	.vl {
		font-family: var(--font-ui);
		font-size: 11px;
		font-weight: 700;
		fill: #0b1020 !important;
	}
	.alg {
		flex: 1 1 300px;
		max-width: 460px;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		min-width: 0;
	}
	.cells {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 0.9rem;
		font-size: 0.8rem;
		color: var(--ink-dim);
		align-items: baseline;
	}
	.cells b {
		color: var(--ink-bright);
	}
	.cells .chi {
		color: var(--ink-bright);
	}
	.cx {
		color: var(--ink-bright);
		overflow-x: auto;
	}
	.mats {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1rem;
		align-items: flex-start;
	}
	.mat {
		min-width: 0;
		max-width: 100%;
	}
	.mat :global(th .katex) {
		font-size: 1.2em;
	}
	.why {
		font-size: 0.68rem;
		color: var(--ink-faint);
		text-align: center;
	}
	.res {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 0.6rem;
	}
	.hk {
		padding: 0.35rem 0.7rem;
		border-radius: 9px;
		border: 1px solid rgba(244, 215, 156, 0.35);
		background: rgba(216, 178, 110, 0.08);
		color: var(--gold-bright);
		font-size: 1.02rem;
	}
	.hk.tors {
		border-color: rgba(242, 141, 182, 0.55);
		background: rgba(242, 141, 182, 0.09);
		color: var(--rose);
	}
	.ident {
		font-size: 0.82rem;
		color: var(--ink-dim);
	}
	.ident b {
		color: var(--ink-bright);
	}
	.ladder {
		padding: 0.6rem 1rem 0.2rem;
	}
	.lhead {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: center;
		gap: 0.3rem 0.9rem;
		font-size: 1.3rem;
		color: var(--ink-bright);
	}
	.lhead .sub {
		font-size: 0.78rem;
		color: var(--ink-faint);
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.6rem 0.3rem;
		padding: 0.9rem 0;
	}
	.chip {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		padding: 0.45rem 0.55rem;
		border-radius: 10px;
		border: 1px solid var(--line);
		background: rgba(255, 255, 255, 0.025);
		font-size: 0.86rem;
		min-width: 4.6rem;
	}
	.chip.empty {
		opacity: 0.45;
		border-style: dashed;
	}
	.chip .c {
		color: var(--ink-dim);
	}
	.chip .h {
		color: var(--gold-bright);
		font-size: 0.95rem;
	}
	.chip .h.t {
		color: var(--rose);
	}
	.chip .h.z {
		color: var(--ink-faint);
	}
	.dk {
		color: var(--ink-faint);
		font-size: 0.85rem;
	}
	.dk.two {
		color: var(--violet);
	}
	.zero {
		color: var(--ink-faint);
	}
	.explain {
		text-align: center;
		font-size: 0.84rem;
		color: var(--ink-dim);
		max-width: 40rem;
		margin: 0 auto 0.6rem;
	}
</style>
