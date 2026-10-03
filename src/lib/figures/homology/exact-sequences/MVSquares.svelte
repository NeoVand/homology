<script lang="ts">
	// Mayer–Vietoris on the gluing square: the torus as two cylinders, the Klein
	// bottle as two Möbius bands. U = middle strip, V = top + bottom strips (glued
	// along a), U ∩ V = two thin strips — two circles for the torus, but ONE circle
	// running around twice for the Klein bottle.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import GluingSquare from '$lib/components/svg/GluingSquare.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import MVTable, { type MVRow } from './MVTable.svelte';

	let kind = $state<'torus' | 'klein'>('klein');
	let step = $state(0);
	const labels = ['The square', 'U: the middle strip', 'V: top and bottom strips', 'U ∩ V', 'Fill in the groups', 'The key map Φ', 'Read off the answer'];

	const X0 = 70;
	const Y0 = 40;
	const S = 220;
	// y measured upwards from the bottom of the square, as a fraction
	const sy = (f: number) => Y0 + S * (1 - f);
	const K = $derived(kind === 'klein');

	const notes = $derived(
		K
			? [
					String.raw`\text{Klein bottle } K:\ \text{top and bottom glued straight, left and right with a flip.}`,
					String.raw`U \text{ (middle strip, sides glued with a flip) is a M\"obius band} \simeq S^1.`,
					String.raw`V \text{ (top and bottom strips, glued along } a\text{) is another M\"obius band} \simeq S^1.`,
					String.raw`U\cap V:\ \text{the flip joins the two thin strips into ONE annulus} \simeq S^1.`,
					String.raw`\text{Fill in } H_*(U\cap V),\ H_*(U)\oplus H_*(V);\ \text{unknown: } H_*(K).`,
					String.raw`\Phi\colon H_1(U\cap V)=\mathbb Z \to \mathbb Z^2,\quad 1\mapsto(2,-2):\ \text{the overlap circle wraps twice.}`,
					String.raw`H_2(K) = \ker\Phi = 0,\qquad H_1(K) \cong \operatorname{coker}\Phi = \mathbb Z^2/\langle(2,-2)\rangle \cong \mathbb Z\oplus\mathbb Z/2.`
				]
			: [
					String.raw`\text{Torus } T:\ \text{both pairs of opposite sides glued straight.}`,
					String.raw`U \text{ (middle strip, sides glued) is a cylinder} \simeq S^1.`,
					String.raw`V \text{ (top and bottom strips, glued along } a\text{) is another cylinder} \simeq S^1.`,
					String.raw`U\cap V:\ \text{two separate thin annuli} \simeq S^1 \sqcup S^1.`,
					String.raw`\text{Fill in } H_*(U\cap V),\ H_*(U)\oplus H_*(V);\ \text{unknown: } H_*(T).`,
					String.raw`\Phi(x,y) = (x+y,\,-x-y):\ \text{each overlap circle goes once around each core.}`,
					String.raw`H_2(T) = \ker\Phi\cong\mathbb Z;\quad 0\to\operatorname{coker}\Phi\cong\mathbb Z\to H_1(T)\to\ker\Phi_0\cong\mathbb Z\to 0,\ \text{so } H_1(T)\cong\mathbb Z^2.`
				]
	);

	const rows = $derived<MVRow[]>(
		K
			? [
					{ n: 2, cells: [{ tex: '0', shown: step >= 4 }, { tex: '0', shown: step >= 4 }, { tex: '0', shown: step >= 6, hl: step >= 6 ? 'green' : undefined }] },
					{
						n: 1,
						cells: [
							{ tex: '\\mathbb Z', shown: step >= 3, hl: step === 5 ? 'gold' : step === 3 ? 'gold' : undefined },
							{ tex: '\\mathbb Z^2', shown: step >= 2, hl: step === 5 ? 'gold' : step === 1 || step === 2 ? 'violet' : undefined },
							{ tex: '\\mathbb Z\\oplus\\mathbb Z/2', shown: step >= 6, hl: step >= 6 ? 'green' : undefined }
						]
					},
					{ n: 0, cells: [{ tex: '\\mathbb Z', shown: step >= 3 }, { tex: '\\mathbb Z^2', shown: step >= 2 }, { tex: '\\mathbb Z', shown: step >= 4 }] }
				]
			: [
					{ n: 2, cells: [{ tex: '0', shown: step >= 4 }, { tex: '0', shown: step >= 4 }, { tex: '\\mathbb Z', shown: step >= 6, hl: step >= 6 ? 'green' : undefined }] },
					{
						n: 1,
						cells: [
							{ tex: '\\mathbb Z^2', shown: step >= 3, hl: step === 5 || step === 3 ? 'gold' : undefined },
							{ tex: '\\mathbb Z^2', shown: step >= 2, hl: step === 5 ? 'gold' : step === 1 || step === 2 ? 'violet' : undefined },
							{ tex: '\\mathbb Z^2', shown: step >= 6, hl: step >= 6 ? 'green' : undefined }
						]
					},
					{ n: 0, cells: [{ tex: '\\mathbb Z^2', shown: step >= 3 }, { tex: '\\mathbb Z^2', shown: step >= 2 }, { tex: '\\mathbb Z', shown: step >= 4 }] }
				]
	);

	const showU = $derived(step >= 1);
	const showV = $derived(step >= 2);
	const showW = $derived(step >= 3);
	const focusU = $derived(step === 1);
	const focusV = $derived(step === 2);
	const focusW = $derived(step === 3 || step === 5);

	// the overlap circle(s) at heights 1/4 and 3/4, with direction arrows
	function chev(x: number, y: number, dir: 1 | -1) {
		return `M ${x - 6 * dir} ${y - 6} L ${x + 3 * dir} ${y} L ${x - 6 * dir} ${y + 6}`;
	}
</script>

<div class="mvsq">
	<div class="top">
		<div class="pic">
			<Svg viewBox="0 0 360 300" maxHeight={330} label="A gluing square divided into a middle strip U, top and bottom strips V, and two thin overlap strips">
				<!-- strips -->
				{#if showV}
					<rect x={X0} y={sy(0.3)} width={S} height={S * 0.3} class="v" class:focus={focusV} />
					<rect x={X0} y={sy(1)} width={S} height={S * 0.3} class="v" class:focus={focusV} />
				{/if}
				{#if showU}
					<rect x={X0} y={sy(0.8)} width={S} height={S * 0.6} class="u" class:focus={focusU} />
				{/if}
				{#if showW}
					<rect x={X0} y={sy(0.3)} width={S} height={S * 0.1} class="w" class:focus={focusW} />
					<rect x={X0} y={sy(0.8)} width={S} height={S * 0.1} class="w" class:focus={focusW} />
				{/if}
				<GluingSquare preset={kind} x={X0} y={Y0} size={S} fill={!showU} corners />
				<!-- cores -->
				{#if showU}
					<line x1={X0} y1={sy(0.5)} x2={X0 + S} y2={sy(0.5)} class="core" />
					<SvgTeX x={X0 + S / 2} y={sy(0.5) - 12} tex={'\\text{core of } U'} size={12} color="var(--blue)" w={100} h={20} />
				{/if}
				{#if showV}
					<line x1={X0} y1={sy(0) - 1} x2={X0 + S} y2={sy(0) - 1} class="core v" />
					<line x1={X0} y1={sy(1) + 1} x2={X0 + S} y2={sy(1) + 1} class="core v" />
				{/if}
				{#if showW}
					<!-- overlap circles -->
					<line x1={X0} y1={sy(0.25)} x2={X0 + S} y2={sy(0.25)} class="ov" class:focus={focusW} />
					<line x1={X0} y1={sy(0.75)} x2={X0 + S} y2={sy(0.75)} class="ov" class:focus={focusW} />
					<path d={chev(X0 + S * 0.62, sy(0.25), 1)} class="ovch" />
					<path d={chev(X0 + S * 0.62, sy(0.75), 1)} class="ovch" />
					{#if K}
						<!-- the flip: matching dots are the same point of K -->
						<circle cx={X0 + S} cy={sy(0.25)} r="4" class="jdot" />
						<circle cx={X0} cy={sy(0.75)} r="4" class="jdot" />
						<circle cx={X0 + S} cy={sy(0.75)} r="4" class="jdot two" />
						<circle cx={X0} cy={sy(0.25)} r="4" class="jdot two" />
						<SvgTeX x={X0 + S / 2} y={sy(0.25) + 14} tex={'\\text{one circle, twice around}'} size={11.5} color="var(--gold-bright)" w={170} h={18} />
					{:else}
						<SvgTeX x={X0 + S / 2} y={sy(0.25) + 14} tex={'\\text{two separate circles}'} size={11.5} color="var(--gold-bright)" w={170} h={18} />
					{/if}
				{/if}
				<!-- legend letters -->
				{#if showU}<SvgTeX x={X0 - 54} y={sy(0.5)} tex={'U'} size={17} color="var(--blue)" w={24} h={24} />{/if}
				{#if showV}
					<SvgTeX x={X0 - 54} y={sy(0.12)} tex={'V'} size={17} color="var(--violet)" w={24} h={24} />
					<SvgTeX x={X0 - 54} y={sy(0.88)} tex={'V'} size={17} color="var(--violet)" w={24} h={24} />
				{/if}
			</Svg>
		</div>
		<div class="side ui">
			<div class="k">{K ? 'Klein bottle' : 'Torus'}</div>
			<div class="pieces">
				<div><span class="sw u"></span><TeX tex={'U'} /> = {K ? 'Möbius band' : 'cylinder'}</div>
				<div><span class="sw v"></span><TeX tex={'V'} /> = {K ? 'Möbius band' : 'cylinder'}</div>
				<div><span class="sw w"></span><TeX tex={'U\\cap V'} /> = {K ? 'one annulus' : 'two annuli'}</div>
			</div>
			{#if step >= 5}
				<div class="phi">
					<TeX tex={K ? '\\Phi_1\\colon \\mathbb Z\\to\\mathbb Z^2,\\ 1\\mapsto(2,-2)' : '\\Phi_1\\colon \\mathbb Z^2\\to\\mathbb Z^2,\\ (x,y)\\mapsto(x+y,-x-y)'} />
				</div>
			{/if}
		</div>
	</div>
	<MVTable {rows} heads={['H_n(U\\cap V)', 'H_n(U)\\oplus H_n(V)', K ? 'H_n(K)' : 'H_n(T^2)']} maps={['\\Phi', '\\Psi']} hlConnect={step >= 6 && !K ? 1 : null} />
	<div class="note"><TeX tex={notes[step]} /></div>
	<Controls>
		<Segmented
			bind:value={kind}
			label="Surface"
			options={[
				{ value: 'torus', label: 'Torus' },
				{ value: 'klein', label: 'Klein bottle' }
			]}
		/>
		<StepControls bind:step count={labels.length} {labels} interval={2800} />
	</Controls>
</div>

<style>
	.top {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0 1.2rem;
		padding: 0.6rem 0.8rem 0;
	}
	.pic {
		flex: 1 1 280px;
		max-width: 400px;
	}
	.side {
		flex: 1 1 200px;
		max-width: 280px;
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		font-size: 0.82rem;
		color: var(--ink-dim);
	}
	.side .k {
		font-size: 0.7rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold);
		font-weight: 650;
	}
	.pieces {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.sw {
		display: inline-block;
		width: 0.8rem;
		height: 0.8rem;
		border-radius: 3px;
		margin-right: 0.45rem;
		vertical-align: -0.1rem;
	}
	.sw.u {
		background: rgba(116, 169, 255, 0.55);
	}
	.sw.v {
		background: rgba(164, 147, 255, 0.55);
	}
	.sw.w {
		background: rgba(244, 215, 156, 0.75);
	}
	.phi {
		color: var(--gold-bright);
		font-size: 0.95rem;
	}
	.u {
		fill: rgba(116, 169, 255, 0.16);
		transition: fill 0.4s;
	}
	.u.focus {
		fill: rgba(116, 169, 255, 0.34);
	}
	.v {
		fill: rgba(164, 147, 255, 0.14);
		transition: fill 0.4s;
	}
	.v.focus {
		fill: rgba(164, 147, 255, 0.34);
	}
	.w {
		fill: rgba(244, 215, 156, 0.16);
		transition: fill 0.4s;
	}
	.w.focus {
		fill: rgba(244, 215, 156, 0.32);
	}
	.core {
		stroke: var(--blue);
		stroke-width: 2;
		stroke-dasharray: 6 5;
	}
	.core.v {
		stroke: var(--violet);
	}
	.ov {
		stroke: rgba(244, 215, 156, 0.8);
		stroke-width: 2;
	}
	.ov.focus {
		stroke: var(--gold-bright);
		stroke-width: 3;
		filter: drop-shadow(0 0 4px rgba(244, 215, 156, 0.75));
	}
	.ovch {
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 2;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.jdot {
		fill: var(--gold-bright);
	}
	.jdot.two {
		fill: #fff;
		stroke: var(--gold-bright);
		stroke-width: 1.4;
	}
	.note {
		text-align: center;
		padding: 0 1rem 0.7rem;
		min-height: 2.2rem;
		font-size: 0.95rem;
		color: var(--ink-bright);
		overflow-x: auto;
	}
</style>
