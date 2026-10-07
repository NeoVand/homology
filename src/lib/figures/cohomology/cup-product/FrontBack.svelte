<script lang="ts">
	// Anatomy of the cup product on one triangle: φ is read on the front edge,
	// ψ on the back edge, and the long edge is never consulted.
	import { onMount } from 'svelte';
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { MinusIcon, PlusIcon } from '$lib/icons';
	import { midArrow, num } from './draw';

	// values on [v0,v1], [v1,v2], [v0,v2]
	let phi = $state([2, 1, 3]);
	let psi = $state([-1, 3, 2]);
	let order = $state<'pp' | 'qp'>('pp');

	let reduced = $state(true);
	onMount(() => {
		reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	const V0: [number, number] = [70, 282];
	const V1: [number, number] = [262, 58];
	const V2: [number, number] = [454, 282];

	const left = $derived(order === 'pp' ? phi : psi);
	const right = $derived(order === 'pp' ? psi : phi);
	const leftName = $derived(order === 'pp' ? '\\varphi' : '\\psi');
	const rightName = $derived(order === 'pp' ? '\\psi' : '\\varphi');
	const leftCol = $derived(order === 'pp' ? 'var(--gold-bright)' : 'var(--teal)');
	const rightCol = $derived(order === 'pp' ? 'var(--teal)' : 'var(--gold-bright)');
	const product = $derived(left[0] * right[1]);
	const p = (n: number) => (n < 0 ? `(${n})` : `${n}`);
	const resultTeX = $derived(`(${leftName}\\smile ${rightName})(\\sigma) = ${p(left[0])}\\cdot ${p(right[1])} = ${product}`);
	const dphi = $derived(phi[1] - phi[2] + phi[0]);
	const dpsi = $derived(psi[1] - psi[2] + psi[0]);

	function bump(which: 'phi' | 'psi', i: number, d: number) {
		const arr = which === 'phi' ? phi : psi;
		arr[i] = Math.max(-5, Math.min(5, arr[i] + d));
	}
	// On a narrow plate the triangle is scaled down: its labels grow (k ≥ 1) and the two edge
	// readouts move to the top corners, where there is room for them.
	let width = $state(524);
	const k = $derived(Math.min(1.7, Math.max(1, (0.9 * 524) / (width || 524))));
	const narrow = $derived(k > 1.15);
	const lx = $derived(narrow ? 4 : 128);
	const rx = $derived(narrow ? 520 : 398);
	const ly = $derived(narrow ? 26 : 150);
	const edgeNames = ['[v_0,v_1]', '[v_1,v_2]', '[v_0,v_2]'];
	const edgeRoles = ['front', 'back', 'long'];
</script>

<div class="fb">
	<div class="pic" bind:clientWidth={width}>
		<Svg viewBox="0 0 524 {330 + 8 * (k - 1)}" maxHeight={340} label="A triangle with vertices v0, v1, v2. The edge from v0 to v1 is the front face, the edge from v1 to v2 is the back face; the cup product multiplies the first measurement on the front face by the second on the back face.">
			<defs>
				<linearGradient id="fb-fill" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stop-color="#6fd6e8" stop-opacity="0.13" />
					<stop offset="0.5" stop-color="#8f7cf7" stop-opacity="0.16" />
					<stop offset="1" stop-color="#ee8fbf" stop-opacity="0.13" />
				</linearGradient>
			</defs>
			<polygon points="{V0.join(',')} {V1.join(',')} {V2.join(',')}" fill="url(#fb-fill)" stroke="none" />
			<!-- long edge: never consulted -->
			<line x1={V0[0]} y1={V0[1]} x2={V2[0]} y2={V2[1]} stroke="rgba(200,192,170,0.45)" stroke-width="2" stroke-dasharray="5 6" />
			<path d={midArrow(V0, V2, 7)} fill="none" stroke="rgba(200,192,170,0.6)" stroke-width="1.8" stroke-linecap="round" />
			<!-- front and back edges -->
			<line x1={V0[0]} y1={V0[1]} x2={V1[0]} y2={V1[1]} stroke={leftCol} stroke-width="11" opacity="0.18" stroke-linecap="round" filter="url(#glow)" />
			<line x1={V0[0]} y1={V0[1]} x2={V1[0]} y2={V1[1]} stroke={leftCol} stroke-width="3.2" stroke-linecap="round" />
			<path d={midArrow(V0, V1, 8)} fill="none" stroke={leftCol} stroke-width="2.2" stroke-linecap="round" />
			<line x1={V1[0]} y1={V1[1]} x2={V2[0]} y2={V2[1]} stroke={rightCol} stroke-width="11" opacity="0.18" stroke-linecap="round" filter="url(#glow)" />
			<line x1={V1[0]} y1={V1[1]} x2={V2[0]} y2={V2[1]} stroke={rightCol} stroke-width="3.2" stroke-linecap="round" />
			<path d={midArrow(V1, V2, 8)} fill="none" stroke={rightCol} stroke-width="2.2" stroke-linecap="round" />
			{#if !reduced}
				<circle r="5" fill="#fff6dc" filter="url(#glow)">
					<animateMotion dur="3.2s" repeatCount="indefinite" keyPoints="0;0.5;1;1" keyTimes="0;0.4;0.8;1" calcMode="linear" path="M{V0[0]} {V0[1]} L{V1[0]} {V1[1]} L{V2[0]} {V2[1]}" />
				</circle>
			{/if}
			<!-- vertices -->
			{#each [V0, V1, V2] as v, i (i)}
				<circle cx={v[0]} cy={v[1]} r="7.5" fill="url(#vertex-fill)" stroke="#060912" stroke-width="1.4" />
			{/each}
			<SvgTeX x={V0[0] - 6} y={V0[1] + 26 + 4 * (k - 1)} tex={'v_0'} size={18 * k} w={40 * k} h={40 * k} />
			<SvgTeX x={V1[0]} y={V1[1] - 24 - 4 * (k - 1)} tex={'v_1'} size={18 * k} w={40 * k} h={40 * k} />
			<SvgTeX x={V2[0] + 6} y={V2[1] + 26 + 4 * (k - 1)} tex={'v_2'} size={18 * k} w={40 * k} h={40 * k} />
			<!-- edge readouts -->
			<SvgTeX x={lx} y={ly} w={220} h={30 * k} anchor={narrow ? 'start' : 'end'} tex={`${leftName}([v_0,v_1]) = ${num(left[0]).replace('−', '-')}`} color={leftCol} size={16 * k} />
			<SvgTeX x={rx} y={ly} w={220} h={30 * k} anchor={narrow ? 'end' : 'start'} tex={`${rightName}([v_1,v_2]) = ${num(right[1]).replace('−', '-')}`} color={rightCol} size={16 * k} />
			<text x={lx} y={ly + (narrow ? 32 * k : 24)} text-anchor={narrow ? 'start' : 'end'} class="t-ui role" style:font-size={narrow ? `${13 * k}px` : null}>front face</text>
			<text x={rx} y={ly + (narrow ? 32 * k : 24)} text-anchor={narrow ? 'end' : 'start'} class="t-ui role" style:font-size={narrow ? `${13 * k}px` : null}>back face</text>
			<text x="262" y={306 + 8 * (k - 1)} text-anchor="middle" class="t-ui role" style:font-size={narrow ? `${12 * k}px` : null}>long edge — never consulted</text>
			<!-- the product -->
			<SvgTeX x={262} y={212} w={320} h={44} tex={`${product}`} color="var(--rose)" size={34} />
		</Svg>
		<div class="result"><TeX tex={resultTeX} /></div>
	</div>
	<div class="panel ui">
		<Segmented
			bind:value={order}
			label="Order of the factors"
			options={[
				{ value: 'pp', label: 'φ ⌣ ψ' },
				{ value: 'qp', label: 'ψ ⌣ φ' }
			]}
		/>
		<table class="vals">
			<thead>
				<tr>
					<th></th>
					{#each edgeNames as e, i (e)}
						<th><TeX tex={e} /><span class="role-h">{edgeRoles[i]}</span></th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each [['phi', phi, '\\varphi', 'gold'], ['psi', psi, '\\psi', 'teal']] as row (row[0])}
					{@const which = row[0] as 'phi' | 'psi'}
					{@const arr = row[1] as number[]}
					<tr>
						<th class={row[3] as string}><TeX tex={row[2] as string} /></th>
						{#each arr as v, i (i)}
							<td>
								<span class="step">
									<button aria-label="Decrease {which === 'phi' ? 'φ' : 'ψ'} on the {edgeRoles[i]} edge" disabled={v <= -5} onclick={() => bump(which, i, -1)}><Icon icon={MinusIcon} size={14} stroke={1.8} /></button>
									<span class="n nums" aria-live="polite">{num(v)}</span>
									<button aria-label="Increase {which === 'phi' ? 'φ' : 'ψ'} on the {edgeRoles[i]} edge" disabled={v >= 5} onclick={() => bump(which, i, 1)}><Icon icon={PlusIcon} size={14} stroke={1.8} /></button>
								</span>
							</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
		<p class="note">
			Change the long-edge values, or ψ on the front edge: the product does not move. Only
			the left factor on the front edge and the right factor on the back edge matter.
		</p>
		<p class="note small">
			<TeX tex={`(\\delta\\varphi)(\\sigma) = ${dphi}, \\quad (\\delta\\psi)(\\sigma) = ${dpsi}`} />
			<span class="tag" class:ok={dphi === 0 && dpsi === 0}>{dphi === 0 && dpsi === 0 ? 'both add up to 0 around the triangle' : 'not both 0 around the triangle'}</span>
		</p>
	</div>
</div>

<style>
	.fb {
		display: grid;
		grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr);
		gap: 0.6rem 1.2rem;
		padding: 0.9rem 1.1rem 1rem;
		align-items: center;
	}
	@container figure (max-width: 760px) {
		.fb {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.result {
		text-align: center;
		color: var(--rose);
		font-size: 1rem;
		margin-top: 0.2rem;
	}
	.role {
		font-size: 10.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}
	.panel {
		display: grid;
		gap: 0.7rem;
		justify-items: start;
	}
	.vals {
		border-collapse: collapse;
		font-size: 0.85rem;
		margin: 0;
		width: 100%;
	}
	.vals th,
	.vals td {
		border: 0;
		padding: 0.25rem 0.2rem;
		text-align: center;
		text-transform: none;
		letter-spacing: 0;
	}
	.vals thead th {
		font-weight: 400;
		color: var(--ink-dim);
		font-size: 0.8rem;
		text-transform: none;
		letter-spacing: 0;
	}
	.role-h {
		display: block;
		font-size: 0.6rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	th.gold {
		color: var(--gold-bright);
	}
	th.teal {
		color: var(--teal);
	}
	.step {
		display: inline-flex;
		align-items: center;
		gap: 0.15rem;
		border: 1px solid var(--line-faint);
		border-radius: 9px;
		padding: 0.1rem;
		background: rgba(255, 255, 255, 0.02);
	}
	.step button {
		width: 1.75rem;
		height: 1.9rem;
		border: 0;
		border-radius: 7px;
		background: rgba(216, 178, 110, 0.08);
		color: var(--gold-bright);
		cursor: pointer;
		font-size: 1rem;
		line-height: 1;
	}
	.step button {
		display: grid;
		place-items: center;
	}
	.step button:hover:not(:disabled) {
		background: rgba(216, 178, 110, 0.2);
	}
	.step button:disabled {
		opacity: 0.35;
		cursor: default;
	}
	.n {
		min-width: 1.6rem;
		color: var(--ink-bright);
		font-weight: 600;
	}
	.note {
		margin: 0;
		font-size: 0.8rem;
		line-height: 1.5;
		color: var(--ink-dim);
	}
	.note.small {
		font-size: 0.78rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 0.6rem;
		align-items: baseline;
	}
	.tag {
		font-size: 0.74rem;
		color: var(--amber);
	}
	.tag.ok {
		color: var(--green);
	}
</style>
