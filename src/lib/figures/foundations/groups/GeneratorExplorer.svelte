<script lang="ts">
	// Pick n and an element k of ℤ/n; watch the walk 0, k, 2k, … trace a star
	// and come home. The dots it visits form the cyclic subgroup ⟨k⟩.
	import Svg from '$lib/components/svg/Svg.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import { cycleOf, gcd, divisors, generators, mod } from './zn';

	let n = $state(12);
	let k = $state(5);
	let showGens = $state(false);

	$effect(() => {
		if (k > n - 1) k = n - 1;
	});

	const R = 108;
	const at = (j: number, r = R): [number, number] => {
		const a = -Math.PI / 2 + (2 * Math.PI * j) / n;
		return [r * Math.cos(a), r * Math.sin(a)];
	};

	const walk = $derived(cycleOf(k, n));
	const inSub = $derived(new Set(walk));
	const gens = $derived(new Set(generators(n)));
	const ord = $derived(walk.length);
	const g = $derived(gcd(k, n));
	const path = $derived.by(() => {
		const pts = [...walk, 0].map((j) => at(j, R));
		return 'M ' + pts.map((p) => p.map((v) => v.toFixed(2)).join(' ')).join(' L ');
	});
	const listTeX = $derived(
		walk.length <= 12
			? '\\{' + walk.join(', ') + '\\}'
			: '\\{' + walk.slice(0, 8).join(', ') + ', \\dots, ' + walk[walk.length - 1] + '\\}'
	);
	const subs = $derived(divisors(n).map((d) => ({ d: d % n, size: n / d })));
</script>

<div class="gen">
	<div class="ringbox">
		<Svg viewBox="-150 -150 300 300" maxHeight={360} label="The elements of Z/n on a circle, with the walk 0, k, 2k, … drawn as a star polygon">
			<defs>
				<radialGradient id="ge-bg" cx="50%" cy="50%" r="50%">
					<stop offset="0" stop-color="#2b2a66" stop-opacity="0.45" />
					<stop offset="1" stop-color="#0a0f1e" stop-opacity="0" />
				</radialGradient>
			</defs>
			<circle r="148" fill="url(#ge-bg)" />
			<circle r={R} fill="none" stroke="rgba(235,229,213,0.12)" stroke-width="1" />
			{#key `${n}-${k}`}
				<path d={path} fill="rgba(242,208,143,0.05)" stroke="#f2d08f" stroke-width="2" stroke-linejoin="round" class="star" pathLength="1" filter="url(#glow)" />
			{/key}
			{#each Array.from({ length: n }, (_, j) => j) as j (j)}
				{@const [x, y] = at(j)}
				{@const [tx, ty] = at(j, R + 25)}
				{@const on = inSub.has(j)}
				{#if showGens && gens.has(j)}
					<circle cx={x} cy={y} r="12" fill="none" stroke="#5fd6cf" stroke-width="1.6" stroke-opacity="0.85" />
				{/if}
				<circle
					cx={x}
					cy={y}
					r={j === k ? 9 : on ? 7 : 5}
					fill={on ? 'url(#vertex-fill)' : 'rgba(150,145,130,0.45)'}
					stroke={j === k ? '#fff8e6' : 'none'}
					stroke-width="1.5"
					class="dot"
					role="button"
					tabindex="0"
					aria-label="choose k = {j}"
					onclick={() => (k = j)}
					onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (k = j)}
				/>
				<circle cx={x} cy={y} r="15" fill="transparent" class="hit" onclick={() => (k = j)} />
				<text x={tx} y={ty + 4.5} text-anchor="middle" class="lbl" class:on>{j}</text>
			{/each}
		</Svg>
	</div>
	<div class="info ui">
		<div class="line big"><TeX tex={`\\langle ${k} \\rangle = ${listTeX}`} /></div>
		<div class="line">
			The order of <TeX tex={String(k)} /> is the number of dots visited:
			<div class="formula">
				<TeX tex={`\\operatorname{order}(${k}) = \\dfrac{${n}}{\\gcd(${n}, ${k})} = \\dfrac{${n}}{${g}} = ${ord}`} />
			</div>
		</div>
		<div class="line verdict" class:yes={ord === n}>
			{#if ord === n}
				<TeX tex={String(k)} /> generates all of <TeX tex={`\\mathbb{Z}/${n}`} />.
			{:else if k === 0}
				<TeX tex={'0'} /> generates only the trivial subgroup <TeX tex={'\\{0\\}'} />.
			{:else}
				<TeX tex={String(k)} /> generates a subgroup with only {ord} of the {n} elements.
			{/if}
		</div>
		<div class="subs">
			<span class="slabel">All subgroups of <TeX tex={`\\mathbb{Z}/${n}`} />:</span>
			{#each subs as s (s.d)}
				<button class="sub" class:on={walk.length === s.size} onclick={() => (k = s.d)} title="{s.size} {s.size === 1 ? 'element' : 'elements'}">
					<TeX tex={`\\langle ${s.d} \\rangle`} /><span class="sz">{s.size}</span>
				</button>
			{/each}
		</div>
		<div><Toggle bind:checked={showGens} label="show all generators" /></div>
		{#if showGens}
			<div class="line gl">
				Generators (teal rings): <TeX tex={'\\{' + [...gens].join(', ') + '\\}'} /> — exactly the
				<TeX tex={'k'} /> with <TeX tex={`\\gcd(k, ${n}) = 1`} />.
			</div>
		{/if}
	</div>
</div>
<Controls>
	<Stepper bind:value={n} min={2} max={24} label="n">
		{#snippet labelSnippet()}<TeX tex="n" />{/snippet}
	</Stepper>
	<Stepper bind:value={k} min={0} max={n - 1} label="k">
		{#snippet labelSnippet()}<TeX tex="k" />{/snippet}
	</Stepper>
</Controls>

<style>
	.gen {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
		gap: 0.8rem 1.6rem;
		padding: 1rem 1.3rem;
		align-items: center;
	}
	@container figure (max-width: 45rem) {
		.gen {
			grid-template-columns: minmax(0, 1fr);
			padding: 0.8rem 0.8rem;
		}
	}
	.star {
		stroke-dasharray: 1;
		stroke-dashoffset: 1;
		animation: draw 1.4s cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
	}
	@keyframes draw {
		to {
			stroke-dashoffset: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.star {
			animation: none;
			stroke-dashoffset: 0;
		}
	}
	.dot {
		cursor: pointer;
		transition: r 0.2s;
	}
	.hit {
		cursor: pointer;
	}
	.lbl {
		font-family: var(--font-ui);
		font-size: 11.5px;
		fill: var(--ink-ghost) !important;
		pointer-events: none;
	}
	.lbl.on {
		fill: var(--gold-bright) !important;
		font-weight: 650;
	}
	.info {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
	}
	.line {
		line-height: 1.6;
	}
	.formula {
		margin-top: 0.25rem;
		font-size: 1.02rem;
		color: var(--ink);
		white-space: nowrap;
	}
	.big {
		font-size: 1.05rem;
		color: var(--gold-bright);
	}
	.verdict {
		color: var(--ink);
	}
	.verdict.yes {
		color: var(--green);
	}
	.subs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
		align-items: center;
	}
	.slabel {
		width: 100%;
		font-size: 0.78rem;
		color: var(--ink-faint);
	}
	.sub {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		border: 1px solid var(--line-faint);
		background: rgba(255, 255, 255, 0.03);
		color: var(--ink);
		border-radius: 999px;
		padding: 0.22rem 0.6rem;
		cursor: pointer;
		min-height: 2rem;
	}
	.sub.on {
		border-color: var(--gold);
		background: rgba(216, 178, 110, 0.14);
		color: var(--gold-bright);
	}
	.sz {
		font-size: 0.68rem;
		color: var(--ink-faint);
		border-left: 1px solid var(--line-faint);
		padding-left: 0.35rem;
	}
	.gl {
		color: #b8f0eb;
	}
</style>
