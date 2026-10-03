<script lang="ts">
	// Formal sums of three named pieces a, b, c — drawn, as they soon will be,
	// as the oriented edges of a triangle. Coefficients are stepped up and down;
	// sums and differences are computed coefficient by coefficient.
	import TeX from '$lib/components/prose/TeX.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';

	type Vec = [number, number, number];
	let X = $state<Vec>([2, -1, 3]);
	let Y = $state<Vec>([1, 1, -3]);
	let op = $state<'+' | '-'>('+');

	const Z = $derived<Vec>(op === '+' ? [X[0] + Y[0], X[1] + Y[1], X[2] + Y[2]] : [X[0] - Y[0], X[1] - Y[1], X[2] - Y[2]]);
	const names = ['a', 'b', 'c'];

	function texOf(v: Vec): string {
		let out = '';
		v.forEach((k, i) => {
			if (k === 0) return;
			const mag = Math.abs(k) === 1 ? '' : String(Math.abs(k));
			if (!out) out = (k < 0 ? '-' : '') + mag + names[i];
			else out += (k < 0 ? ' - ' : ' + ') + mag + names[i];
		});
		return out || '0';
	}
	function fullTeX(v: Vec): string {
		return v.map((k, i) => `${k < 0 ? '(' + k + ')' : k}${names[i]}`).join(' + ');
	}
	// is v a nonzero multiple of the loop a + b − c?
	const loopMult = (v: Vec) => (v[0] !== 0 && v[0] === v[1] && v[2] === -v[0] ? v[0] : 0);

	// triangle geometry: vertices 0 (bottom-left), 1 (bottom-right), 2 (top)
	const V: [number, number][] = [
		[22, 112],
		[138, 112],
		[80, 18]
	];
	const E: [number, number][] = [
		[0, 1],
		[1, 2],
		[0, 2]
	]; // a, b, c — oriented from the lower to the higher label

	function step(which: 'X' | 'Y', i: number, d: number) {
		const T = which === 'X' ? X : Y;
		const v = Math.max(-5, Math.min(5, T[i] + d));
		if (which === 'X') X[i] = v;
		else Y[i] = v;
	}

	const presets: { label: string; X: Vec; Y: Vec; op: '+' | '-' }[] = [
		{ label: '(2a − b + 3c) + (a + b − 3c)', X: [2, -1, 3], Y: [1, 1, -3], op: '+' },
		{ label: 'around the triangle', X: [1, 0, 0], Y: [0, 1, -1], op: '+' },
		{ label: 'everything cancels', X: [1, 2, -1], Y: [1, 2, -1], op: '-' }
	];
</script>

{#snippet tri(v: Vec, title: string, gold: boolean)}
	<svg viewBox="0 0 160 140" class="tri" role="img" aria-label="{title}: {fullTeX(v)}">
		{#each E as [p, q], i (i)}
			{@const k = v[i]}
			{@const A = k < 0 ? V[q] : V[p]}
			{@const B = k < 0 ? V[p] : V[q]}
			{@const mx = (V[p][0] + V[q][0]) / 2}
			{@const my = (V[p][1] + V[q][1]) / 2}
			{@const dx = V[q][0] - V[p][0]}
			{@const dy = V[q][1] - V[p][1]}
			{@const len = Math.hypot(dx, dy)}
			{@const ox = mx - (V[0][0] + V[1][0] + V[2][0]) / 3}
			{@const oy = my - (V[0][1] + V[1][1] + V[2][1]) / 3}
			{@const on = Math.hypot(ox, oy) || 1}
			{@const nx = ox / on}
			{@const ny = oy / on}
			{@const col = gold ? '#f2d08f' : k < 0 ? '#c9a6ff' : '#a493ff'}
			{#if k === 0}
				<line x1={V[p][0]} y1={V[p][1]} x2={V[q][0]} y2={V[q][1]} stroke="rgba(235,229,213,0.18)" stroke-width="1.4" stroke-dasharray="4 4" />
			{:else}
				<line x1={A[0]} y1={A[1]} x2={B[0]} y2={B[1]} stroke={col} stroke-width={1.6 + 1.1 * Math.min(5, Math.abs(k))} stroke-linecap="round" opacity="0.92" />
				<polygon
					points="{mx + (dx / len) * 7 * Math.sign(k)},{my + (dy / len) * 7 * Math.sign(k)} {mx - (dx / len) * 5 * Math.sign(k) + (dy / len) * 6},{my - (dy / len) * 5 * Math.sign(k) - (dx / len) * 6} {mx - (dx / len) * 5 * Math.sign(k) - (dy / len) * 6},{my - (dy / len) * 5 * Math.sign(k) + (dx / len) * 6}"
					fill="#fbf6e8"
				/>
			{/if}
			<text x={mx + nx * 17} y={my + ny * 17 + 4} text-anchor="middle" class="coef" class:zero={k === 0}>{k === 0 ? names[i] : `${k < 0 ? '−' : ''}${Math.abs(k) === 1 ? '' : Math.abs(k)}${names[i]}`}</text>
		{/each}
		{#each V as P, j (j)}
			<circle cx={P[0]} cy={P[1]} r="4.5" fill="url(#inv-v)" />
		{/each}
		<defs>
			<radialGradient id="inv-v" cx="35%" cy="35%" r="70%">
				<stop offset="0" stop-color="#fffaf0" /><stop offset="0.6" stop-color="#d8d2bf" /><stop offset="1" stop-color="#8b8676" />
			</radialGradient>
		</defs>
	</svg>
{/snippet}

{#snippet stepper(which: 'X' | 'Y', v: Vec)}
	<div class="steppers ui">
		{#each names as nm, i (nm)}
			<span class="st">
				<button aria-label="decrease the coefficient of {nm}" onclick={() => step(which, i, -1)}>−</button>
				<span class="val" class:neg={v[i] < 0} class:zero={v[i] === 0}>{v[i] < 0 ? '−' + Math.abs(v[i]) : v[i]}<i>{nm}</i></span>
				<button aria-label="increase the coefficient of {nm}" onclick={() => step(which, i, 1)}>+</button>
			</span>
		{/each}
	</div>
{/snippet}

<div class="inv">
	<div class="box">
		<div class="ptitle ui">first inventory</div>
		{@render tri(X, 'first inventory', false)}
		<div class="expr"><TeX tex={texOf(X)} /></div>
		{@render stepper('X', X)}
	</div>
	<div class="opcol">
		<Segmented
			bind:value={op}
			options={[
				{ value: '+', label: '+' },
				{ value: '-', label: '−' }
			]}
			label="Add or subtract"
		/>
	</div>
	<div class="box">
		<div class="ptitle ui">second inventory</div>
		{@render tri(Y, 'second inventory', false)}
		<div class="expr"><TeX tex={texOf(Y)} /></div>
		{@render stepper('Y', Y)}
	</div>
	<div class="eq ui" aria-hidden="true">=</div>
	<div class="box result" class:loop={loopMult(Z) !== 0}>
		<div class="ptitle ui">result</div>
		{@render tri(Z, 'result', loopMult(Z) !== 0)}
		<div class="expr big"><TeX tex={texOf(Z)} /></div>
		<div class="work ui">
			<TeX
				tex={`(${X[0]}${op === '+' ? '+' : '-'}${Y[0] < 0 ? '(' + Y[0] + ')' : Y[0]})a + (${X[1]}${op === '+' ? '+' : '-'}${Y[1] < 0 ? '(' + Y[1] + ')' : Y[1]})b + (${X[2]}${op === '+' ? '+' : '-'}${Y[2] < 0 ? '(' + Y[2] + ')' : Y[2]})c`}
			/>
		</div>
		{#if loopMult(Z) !== 0}
			<div class="badge ui">
				{loopMult(Z) === 1 ? 'once' : loopMult(Z) === -1 ? 'once backwards' : `${Math.abs(loopMult(Z))} times`} around the triangle
			</div>
		{/if}
	</div>
</div>
<div class="presets ui">
	{#each presets as p (p.label)}
		<button
			onclick={() => {
				X = [...p.X];
				Y = [...p.Y];
				op = p.op;
			}}>{p.label}</button
		>
	{/each}
</div>

<style>
	.inv {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr) auto minmax(0, 1fr);
		align-items: center;
		gap: 0.6rem;
		padding: 1rem 1rem 0.4rem;
	}
	@media (max-width: 720px) {
		.inv {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
			padding: 0.8rem 0.6rem 0.3rem;
		}
		.opcol {
			grid-column: 1 / -1;
			grid-row: 2;
			justify-self: center;
		}
		.eq {
			display: none;
		}
		.result {
			grid-column: 1 / -1;
		}
	}
	.box {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.35rem;
		min-width: 0;
		padding: 0.6rem 0.4rem 0.7rem;
		border-radius: 12px;
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid var(--line-faint);
	}
	.result {
		border-color: rgba(164, 147, 255, 0.35);
		background: rgba(164, 147, 255, 0.05);
	}
	.result.loop {
		border-color: rgba(242, 208, 143, 0.6);
		background: rgba(242, 208, 143, 0.06);
		box-shadow: 0 0 24px -8px rgba(242, 208, 143, 0.45);
	}
	.ptitle {
		font-size: 0.66rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.tri {
		width: 100%;
		max-width: 11rem;
		height: auto;
		overflow: visible;
	}
	.coef {
		font-family: var(--font-body);
		font-style: italic;
		font-size: 14px;
		fill: var(--ink-bright);
	}
	.coef.zero {
		fill: var(--ink-ghost);
	}
	.expr {
		font-size: 1.05rem;
		color: var(--violet);
		min-height: 1.6rem;
	}
	.expr.big {
		font-size: 1.2rem;
		color: var(--ink-bright);
	}
	.result.loop .expr.big {
		color: var(--gold-bright);
	}
	.work {
		font-size: 0.74rem;
		color: var(--ink-faint);
		text-align: center;
	}
	.badge {
		font-size: 0.68rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--gold-bright);
		border: 1px solid rgba(242, 208, 143, 0.5);
		border-radius: 999px;
		padding: 0.15rem 0.6rem;
	}
	.opcol {
		display: flex;
		justify-content: center;
	}
	.eq {
		font-size: 1.4rem;
		color: var(--ink-dim);
	}
	.steppers {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		width: 100%;
		align-items: center;
	}
	.st {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}
	.st button {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 1px solid var(--line);
		background: rgba(164, 147, 255, 0.06);
		color: var(--violet);
		cursor: pointer;
		font-size: 1rem;
		line-height: 1;
	}
	.st button:hover {
		background: rgba(164, 147, 255, 0.16);
	}
	.val {
		min-width: 2.8rem;
		text-align: center;
		font-variant-numeric: tabular-nums;
		color: var(--ink-bright);
		font-size: 0.9rem;
	}
	.val i {
		font-family: var(--font-body);
		margin-left: 0.1em;
	}
	.val.neg {
		color: #d7c6ff;
	}
	.val.zero {
		color: var(--ink-ghost);
	}
	.presets {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.4rem;
		padding: 0.4rem 1rem 1rem;
	}
	.presets button {
		border: 1px solid var(--line-faint);
		background: rgba(255, 255, 255, 0.03);
		color: var(--ink-dim);
		border-radius: 999px;
		padding: 0.3rem 0.75rem;
		font-size: 0.74rem;
		cursor: pointer;
		min-height: 2rem;
	}
	.presets button:hover {
		color: var(--gold-bright);
		border-color: var(--line);
	}
</style>
