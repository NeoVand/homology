<script lang="ts">
	// Vectors over 𝔽₂ are rows of switches (= subsets); adding is XOR
	// (= symmetric difference): 1 + 1 = 0, so a switch flipped twice is off.
	import TeX from '$lib/components/prose/TeX.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';

	const names = ['a', 'b', 'c', 'd', 'e', 'f'];
	let u = $state([1, 0, 1, 1, 0, 0]);
	let v = $state([0, 0, 1, 0, 1, 0]);
	const w = $derived(u.map((x, i) => (x + v[i]) % 2));
	const both = $derived(u.map((x, i) => x === 1 && v[i] === 1));

	const setTeX = (x: number[]) => {
		const s = names.filter((_, i) => x[i]);
		return s.length ? `\\{${s.join(',')}\\}` : '\\varnothing';
	};
	const listTeX = (x: number[]) => `(${x.join(',')})`;
</script>

<div class="sw ui">
	{#snippet row(name: string, color: string, x: number[], editable: boolean, which: 'u' | 'v' | null)}
		<div class="row">
			<div class="name" style="color:{color}"><TeX tex={name} /></div>
			<div class="cells">
				{#each x as bit, i (i)}
					{#if editable}
						<button
							class="cell"
							class:on={bit === 1}
							style="--c:{color}"
							aria-pressed={bit === 1}
							aria-label="{which} switch {names[i]}: {bit ? 'on' : 'off'}"
							onclick={() => {
								if (which === 'u') u[i] = 1 - u[i];
								else v[i] = 1 - v[i];
							}}
						>
							<span class="lamp"></span>
							<span class="lbl">{names[i]}</span>
						</button>
					{:else}
						<div class="cell result" class:on={bit === 1} class:cancel={both[i]} style="--c:{color}">
							<span class="lamp"></span>
							<span class="lbl">{names[i]}</span>
							{#if both[i]}<span class="x" title="1 + 1 = 0">1+1=0</span>{/if}
						</div>
					{/if}
				{/each}
			</div>
			<div class="read">
				<span class="list"><TeX tex={listTeX(x)} /></span>
				<span class="set"><TeX tex={setTeX(x)} /></span>
			</div>
		</div>
	{/snippet}

	{@render row('\\mathbf u', 'var(--violet)', u, true, 'u')}
	<div class="op">+</div>
	{@render row('\\mathbf v', 'var(--blue)', v, true, 'v')}
	<div class="rule"></div>
	{@render row('\\mathbf u + \\mathbf v', 'var(--gold-bright)', w, false, null)}

	<p class="note">
		A switch is on in the sum when it is on in <em>exactly one</em> of <span class="vv">u</span> and
		<span class="bb">v</span>. Where both are on, they cancel: <TeX tex={'1+1=0'} />. As subsets, the sum is the
		<em>symmetric difference</em>: everything in one set or the other, but not in both.
	</p>
</div>
<Controls>
	<Button variant="subtle" onclick={() => (v = [...u])}>Make v equal to u</Button>
	<Button variant="subtle" onclick={() => (v = [0, 0, 0, 0, 0, 0])}>Make v zero</Button>
	<Button variant="subtle" onclick={() => (v = u.map((x) => 1 - x))}>Make v the complement of u</Button>
</Controls>

<style>
	.sw {
		padding: 1.1rem 1.2rem 0.6rem;
		max-width: 40rem;
		margin: 0 auto;
	}
	.row {
		display: grid;
		grid-template-columns: 4.4rem auto minmax(0, 1fr);
		align-items: center;
		gap: 0.8rem;
	}
	@media (max-width: 560px) {
		.row {
			grid-template-columns: 3.4rem auto;
		}
		.read {
			grid-column: 2;
		}
	}
	.name {
		text-align: right;
		font-size: 1.05rem;
	}
	.cells {
		display: flex;
		gap: 6px;
	}
	.cell {
		position: relative;
		width: 2.3rem;
		height: 2.6rem;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.1);
		background: rgba(255, 255, 255, 0.03);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		padding: 0;
		cursor: pointer;
		transition: all 0.25s var(--ease);
	}
	.cell.result {
		cursor: default;
	}
	button.cell:hover {
		border-color: var(--c);
	}
	.lamp {
		width: 0.9rem;
		height: 0.9rem;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.15);
		transition: all 0.25s var(--ease);
	}
	.cell.on .lamp {
		background: radial-gradient(circle at 35% 35%, #fff, var(--c) 60%);
		border-color: var(--c);
		box-shadow: 0 0 12px var(--c);
	}
	.cell.on {
		background: color-mix(in srgb, var(--c) 10%, transparent);
		border-color: color-mix(in srgb, var(--c) 55%, transparent);
	}
	.cell.cancel {
		border-color: rgba(95, 214, 207, 0.6);
		border-style: dashed;
	}
	.lbl {
		font-size: 0.66rem;
		color: var(--ink-faint);
		letter-spacing: 0.05em;
	}
	.x {
		position: absolute;
		bottom: -1.15rem;
		left: 50%;
		transform: translateX(-50%);
		font-size: 0.56rem;
		white-space: nowrap;
		color: var(--teal);
		letter-spacing: 0.02em;
	}
	.read {
		display: flex;
		flex-wrap: wrap;
		gap: 0.2rem 1rem;
		color: var(--ink);
		font-size: 0.9rem;
	}
	.set {
		color: var(--ink-dim);
	}
	.op {
		margin: 0.15rem 0 0.15rem 1.6rem;
		color: var(--ink-faint);
		font-size: 1.1rem;
	}
	.rule {
		height: 1px;
		margin: 0.6rem 0 0.7rem 5rem;
		max-width: 16rem;
		background: linear-gradient(90deg, var(--line-strong), transparent);
	}
	.note {
		margin: 1.6rem 0 0.2rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
		line-height: 1.55;
	}
	.vv {
		color: var(--violet);
		font-weight: 650;
	}
	.bb {
		color: var(--blue);
		font-weight: 650;
	}
	@container figure (max-width: 34rem) {
		.lbl {
			font-size: 0.78rem;
		}
		.x {
			font-size: 0.7rem;
			bottom: -1.25rem;
		}
	}
</style>
