<script lang="ts">
	// Portraits for a history box: large gold-line drawings centred at the top
	// of the box, fading down into it, with each person's name and dates beneath.
	// The drawings have transparent grounds, so they sit on the box itself.
	import { asset } from '$app/paths';
	import { people, biographyLink } from '$lib/content/people';

	let { keys }: { keys: string[] } = $props();

	const list = $derived(
		keys.map((k) => {
			const p = people[k];
			if (!p) throw new Error(`[Portraits] unknown person "${k}"`);
			return p;
		})
	);
</script>

<div class="pt" class:many={list.length > 1}>
	<div class="pics">
		{#each list as p (p.key)}
			<img
				src={asset(`/portraits/${p.key}.webp`)}
				alt="Drawing of {p.name}{p.imagined ? ', after a later imagined likeness' : ''}"
				width="640"
				height="640"
				loading="lazy"
				decoding="async"
			/>
		{/each}
	</div>
	<div class="names">
		{#each list as p (p.key)}
			<a class="who" href={biographyLink(p)} target="_blank" rel="noopener" title="Biography of {p.name}">
				<span class="nm">{p.name}</span>
				<span class="dt ui">{p.dates}</span>
			</a>
		{/each}
	</div>
</div>

<style>
	.pt {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: -0.4rem -1.3rem 1rem -1.35rem;
	}
	.pics {
		display: flex;
		justify-content: center;
		width: 100%;
		height: 17rem;
		-webkit-mask-image: linear-gradient(to bottom, #000 58%, transparent 97%);
		mask-image: linear-gradient(to bottom, #000 58%, transparent 97%);
	}
	img {
		display: block;
		height: 100%;
		width: auto;
		min-width: 0;
		aspect-ratio: 1;
		object-fit: cover;
	}
	.many img {
		margin-inline: -1.2rem;
	}
	.names {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.4rem 3rem;
		margin-top: -2.4rem;
		text-align: center;
		text-shadow: 0 2px 14px rgba(4, 6, 12, 0.95);
	}
	.who {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
		text-decoration: none;
		color: inherit;
	}
	.nm {
		font-family: var(--font-elegant);
		font-size: 1.85rem;
		line-height: 1.05;
		font-weight: 500;
		color: var(--gold-pale);
		text-wrap: balance;
		transition: color 0.2s var(--ease);
	}
	.many .nm {
		font-size: 1.45rem;
	}
	.who:hover .nm,
	.who:focus-visible .nm {
		color: var(--gold-bright);
	}
	.dt {
		font-size: 0.74rem;
		letter-spacing: 0.16em;
		color: var(--ink-faint);
		font-variant-numeric: tabular-nums;
	}
	/* phones */
	@media (max-width: 30rem) {
		.pt {
			margin-inline: -0.95rem -1rem;
		}
		.pics {
			height: 13rem;
		}
		.many img {
			margin-inline: -1.6rem;
		}
		.names {
			gap: 0.35rem 1.6rem;
		}
		.nm {
			font-size: 1.5rem;
		}
		.many .nm {
			font-size: 1.2rem;
		}
	}
</style>
