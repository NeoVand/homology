<script lang="ts">
	const items = [
		{ c: 'var(--gold-bright)', name: 'Gold', role: 'cycles — the loops and surfaces we are measuring; the main highlight', tex: '\\cyc{z}' },
		{ c: 'var(--teal)', name: 'Teal', role: 'boundaries and exact things — “this one bounds”', tex: '\\bdy{b}' },
		{ c: 'var(--violet)', name: 'Violet', role: 'chains and general elements — whatever you have selected', tex: '\\chn{c}' },
		{ c: 'var(--rose)', name: 'Rose', role: 'holes, obstructions and non-trivial classes', tex: '\\hole{h}' },
		{ c: 'var(--blue)', name: 'Blue', role: 'neutral structure and examples', tex: '' },
		{ c: 'var(--green)', name: 'Green', role: 'exercises, and anything consistent or solved', tex: '' }
	];
</script>

<ul class="legend">
	{#each items as it (it.name)}
		<li style="--c:{it.c}">
			<span class="sw" aria-hidden="true"></span>
			<span class="nm ui">{it.name}</span>
			<span class="role">{it.role}</span>
		</li>
	{/each}
</ul>

<style>
	.legend {
		list-style: none;
		margin: 0;
		padding: 1.2rem 1.4rem 1rem !important;
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.7rem 1.6rem;
	}
	@media (min-width: 640px) {
		.legend {
			grid-template-columns: 1fr 1fr;
		}
	}
	.legend li {
		display: grid;
		grid-template-columns: 2.2rem 4.2rem 1fr;
		align-items: center;
		gap: 0.6rem;
		margin: 0;
	}
	.legend li::before {
		display: none;
	}
	.sw {
		width: 2.2rem;
		height: 0.55rem;
		border-radius: 999px;
		background: var(--c);
		box-shadow: 0 0 14px -2px var(--c);
	}
	.nm {
		font-size: 0.74rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--c);
		font-weight: 650;
	}
	.role {
		font-size: 0.92rem;
		color: var(--ink-dim);
		line-height: 1.4;
	}
</style>
