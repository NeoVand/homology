<script lang="ts">
	// Figure: the projective plane, homology and cohomology side by side. The
	// same "2" that makes H₁ = ℤ/2 reappears one degree higher as H² = ℤ/2.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import GluingSquare from '$lib/components/svg/GluingSquare.svelte';
	import MatrixView from '$lib/components/prose/MatrixView.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import { rp2Delta, cobd, bd } from './cells';

	let step = $state(0);
	const labels = ['The complex', 'Homology', 'H⁰ and H¹', 'H² = ℤ/2', 'The shift', 'With ℤ/2 coefficients'];

	const x0 = 74;
	const y0 = 34;
	const S = 200;
	const BL: [number, number] = [x0, y0 + S];
	const BR: [number, number] = [x0 + S, y0 + S];
	const TR: [number, number] = [x0 + S, y0];
	const TL: [number, number] = [x0, y0];

	const d2 = bd(rp2Delta, 2);
	const d1T = cobd(rp2Delta, 1);
	const mod2 = $derived(step === 5);
	const hom = $derived(step >= 1 ? (mod2 ? ['\\Z/2', '\\Z/2', '\\Z/2'] : ['\\Z', '\\Z/2', '0']) : ['?', '?', '?']);
	const coh = $derived(
		mod2 ? ['\\Z/2', '\\Z/2', '\\Z/2'] : [step >= 2 ? '\\Z' : '?', step >= 2 ? '0' : '?', step >= 3 ? '\\Z/2' : '?']
	);
	const isTorsion = (t: string) => t === '\\Z/2' && !mod2;
	const cols = [150, 245, 340];
	const rowY = [62, 162];
</script>

<div class="ts">
	<div class="pic">
		<Svg viewBox="30 0 300 280" maxHeight={290} label="The projective plane as a square with opposite sides glued with a twist, cut into two triangles">
			<GluingSquare
				preset="rp2"
				x={x0}
				y={y0}
				size={S}
				fill={false}
				sides={{ left: { label: 'b', dir: 1, marks: 2, color: 'var(--teal)' }, right: { label: 'b', dir: -1, marks: 2, color: 'var(--teal)' } }}
			/>
			<polygon points="{BL.join(',')} {BR.join(',')} {TL.join(',')}" class="tri" class:hot={step === 1 || step === 3} />
			<polygon points="{TR.join(',')} {BR.join(',')} {TL.join(',')}" class="tri" class:hot={step === 1 || step === 3} />
			<line x1={BR[0]} y1={BR[1]} x2={TL[0]} y2={TL[1]} class="diag" class:hot={step === 1 || step === 4} />
			<path d="M {x0 + S / 2 + 7} {y0 + S / 2 - 3} L {x0 + S / 2 - 3} {y0 + S / 2 - 3} L {x0 + S / 2 - 3} {y0 + S / 2 + 7}" class="chev" />
			<SvgTeX x={x0 + S / 2 + 20} y={y0 + S / 2 + 12} tex="c" size={18} color="var(--violet)" w={30} h={26} />
			<SvgTeX x={x0 + S * 0.3} y={y0 + S * 0.7} tex={'T_1'} size={17} color="var(--ink-dim)" w={40} h={26} />
			<SvgTeX x={x0 + S * 0.7} y={y0 + S * 0.3} tex={'T_2'} size={17} color="var(--ink-dim)" w={40} h={26} />
			{#each [BL, TR] as c, i (i)}
				<circle cx={c[0]} cy={c[1]} r="7.5" class="v" />
			{/each}
			{#each [BR, TL] as c, i (i)}
				<circle cx={c[0]} cy={c[1]} r="7.5" class="w" />
			{/each}
			<SvgTeX x={BL[0] - 16} y={BL[1] + 14} tex="v" size={15} color="var(--gold-bright)" w={24} h={22} />
			<SvgTeX x={TR[0] + 16} y={TR[1] - 12} tex="v" size={15} color="var(--gold-bright)" w={24} h={22} />
			<SvgTeX x={BR[0] + 16} y={BR[1] + 14} tex="w" size={15} color="var(--teal)" w={24} h={22} />
			<SvgTeX x={TL[0] - 16} y={TL[1] - 12} tex="w" size={15} color="var(--teal)" w={24} h={22} />
		</Svg>
	</div>
	<div class="ladder">
		<Svg viewBox="0 0 400 220" maxHeight={230} label="Homology and cohomology groups of the projective plane in degrees 0, 1, 2">
			{#each cols as x, k (k)}
				<SvgTeX {x} y={20} tex={`k = ${k}`} size={13} color="var(--ink-faint)" w={60} h={22} />
			{/each}
			<SvgTeX x={52} y={rowY[0]} tex={mod2 ? 'H_k(\\,\\cdot\\,;\\Z/2)' : 'H_k'} size={17} color="var(--violet)" w={100} h={30} />
			<SvgTeX x={52} y={rowY[1]} tex={mod2 ? 'H^k(\\,\\cdot\\,;\\Z/2)' : 'H^k'} size={17} color="var(--gold-bright)" w={100} h={30} />
			{#if step >= 4 && !mod2}
				<path d="M {cols[1] + 22} {rowY[0] + 20} C {cols[1] + 60} {rowY[0] + 70}, {cols[2] - 50} {rowY[1] - 70}, {cols[2] - 20} {rowY[1] - 22}" class="shift" marker-end="url(#arrow-rose)" />
				<SvgTeX x={(cols[1] + cols[2]) / 2 + 30} y={(rowY[0] + rowY[1]) / 2 - 4} tex={'\\text{torsion moves up}'} size={12} color="var(--rose)" w={140} h={22} />
			{/if}
			{#each [0, 1, 2] as k (k)}
				<rect x={cols[k] - 34} y={rowY[0] - 20} width="68" height="40" rx="10" class="cell" class:tor={isTorsion(hom[k])} />
				<SvgTeX x={cols[k]} y={rowY[0]} tex={hom[k]} size={18} color={isTorsion(hom[k]) ? 'var(--rose)' : 'var(--ink-bright)'} w={68} h={36} />
				<rect x={cols[k] - 34} y={rowY[1] - 20} width="68" height="40" rx="10" class="cell" class:tor={isTorsion(coh[k])} />
				<SvgTeX x={cols[k]} y={rowY[1]} tex={coh[k]} size={18} color={isTorsion(coh[k]) ? 'var(--rose)' : 'var(--ink-bright)'} w={68} h={36} />
			{/each}
		</Svg>
	</div>
	<div class="text">
		{#if step === 0}
			<p>
				Glue opposite sides of a square with a twist: \(a\) to \(a\) and \(b\) to \(b\), with the arrows. The corners become two vertices
				\(v\) and \(w\); the edges are \(a, b\) (from \(v\) to \(w\)) and the diagonal \(c\) (from \(w\) to \(w\)); the faces are two triangles
				with
			</p>
			<p class="eq">\(\partial T_1 = a - b + c, \qquad \partial T_2 = -a + b + c.\)</p>
		{:else if step === 1}
			<p>
				No combination of \(T_1, T_2\) has boundary \(0\), so \(H_2 = 0\). But \(\partial(T_1 + T_2) = 2c\): twice the loop \(c\) bounds, while
				\(c\) itself does not. That gives \(H_1 = \Z/2\).
			</p>
			<MatrixView M={d2} rowLabels={['a', 'b', 'c']} colLabels={['T_1', 'T_2']} caption={'\\partial_2 ='} />
		{:else if step === 2}
			<p>
				A 1-cocycle \(\varphi\) needs \(\varphi(a) - \varphi(b) + \varphi(c) = 0\) and \(-\varphi(a) + \varphi(b) + \varphi(c) = 0\). Adding:
				\(2\varphi(c) = 0\), so in \(\Z\) we get \(\varphi(c) = 0\) and \(\varphi(a) = \varphi(b)\). Those are exactly the coboundaries
				\(\delta f = (s, s, 0)\) with \(s = f(w) - f(v)\). So \(H^0 = \Z\) and \(H^1 = 0\): no integer measurement can see the twisted loop.
			</p>
			<MatrixView M={d1T} rowLabels={['T_1', 'T_2']} colLabels={['a', 'b', 'c']} caption={'\\delta_1 ='} />
		{:else if step === 3}
			<p>
				A 2-cochain is a pair \((p, q)\) of values on \(T_1, T_2\). A coboundary \(\delta\varphi\) is
				\((x - y + z,\; -x + y + z)\), whose sum \(2z\) is always even. Every pair with \(p + q\) even is reached, and the parity of \(p + q\)
				cannot be changed:
			</p>
			<p class="eq">\(H^2 = \Z^2 / \im \delta_1 \cong \Z/2, \qquad [(p, q)] \mapsto p + q \bmod 2.\)</p>
		{:else if step === 4}
			<p>
				The same \(2\) did both jobs. In homology it sits in \(\partial_2\) and makes torsion in \(H_1\); transposed, it sits in
				\(\delta_1\) and makes torsion in \(H^2\). In general the free parts of \(H_k\) and \(H^k\) agree, and the torsion of \(H_{k-1}\) moves up to
				\(H^k\).
			</p>
		{:else}
			<p>
				With coefficients in \(\Z/2\) the equation \(2\varphi(c) = 0\) holds for every \(\varphi(c)\), so \(\varphi = (1, 0, 1)\) is a cocycle that
				is not a coboundary: \(H^1(\RP^2; \Z/2) = \Z/2\). Every group becomes \(\Z/2\), in homology and in cohomology alike.
			</p>
		{/if}
	</div>
</div>
<Controls>
	<StepControls bind:step count={6} {labels} interval={4200} />
</Controls>

<style>
	.ts {
		display: grid;
		grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
		grid-template-areas: 'pic ladder' 'pic text';
		gap: 0.2rem 1.2rem;
		padding: 0.8rem 1.1rem 0.6rem;
		align-items: start;
	}
	.pic {
		grid-area: pic;
		align-self: center;
	}
	.ladder {
		grid-area: ladder;
	}
	.text {
		grid-area: text;
		font-size: 0.95rem;
		line-height: 1.6;
		min-height: 9.5em;
	}
	@media (max-width: 760px) {
		.ts {
			grid-template-columns: minmax(0, 1fr);
			grid-template-areas: 'pic' 'ladder' 'text';
		}
	}
	.text p {
		margin: 0 0 0.6em;
	}
	.eq {
		text-align: center;
		color: var(--ink-bright);
	}
	.tri {
		fill: rgba(116, 169, 255, 0.07);
		transition: fill 0.3s;
	}
	.tri.hot {
		fill: rgba(164, 147, 255, 0.2);
	}
	.diag {
		stroke: var(--violet);
		stroke-width: 2.4;
		stroke-linecap: round;
		transition: filter 0.3s;
	}
	.diag.hot {
		stroke: var(--rose);
		filter: drop-shadow(0 0 5px rgba(242, 141, 182, 0.8));
	}
	.chev {
		fill: none;
		stroke: var(--violet);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.v {
		fill: url(#vertex-fill);
		stroke: #060912;
		stroke-width: 1.3;
	}
	.w {
		fill: var(--teal);
		stroke: #060912;
		stroke-width: 1.3;
	}
	.cell {
		fill: rgba(10, 15, 29, 0.8);
		stroke: var(--line);
		stroke-width: 1;
		transition: stroke 0.3s;
	}
	.cell.tor {
		stroke: var(--rose);
		fill: rgba(242, 141, 182, 0.1);
	}
	.shift {
		fill: none;
		stroke: var(--rose);
		stroke-width: 2.2;
		stroke-dasharray: 5 4;
	}
</style>
