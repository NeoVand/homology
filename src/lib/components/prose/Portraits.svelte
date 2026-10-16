<script lang="ts">
	// Gold-line portrait medallions for a history box, floated beside its text.
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

<div class="portraits ui" class:pair={list.length > 1}>
	{#each list as p (p.key)}
		{@const link = biographyLink(p)}
		<figure class="pt">
			<a href={link} target="_blank" rel="noopener" title="Biography of {p.name}">
				<img
					src={asset(`/portraits/${p.key}.webp`)}
					alt="Drawing of {p.name}{p.imagined ? ', after a later imagined likeness' : ''}"
					width="240"
					height="240"
					loading="lazy"
					decoding="async"
				/>
			</a>
			<figcaption>
				<span class="nm">{p.name}</span>
				<span class="dt">{p.dates}</span>
			</figcaption>
		</figure>
	{/each}
</div>

<style>
	.portraits {
		float: right;
		display: flex;
		gap: 0.7rem;
		margin: 0.15rem 0 0.7rem 1.2rem;
		max-width: 50%;
	}
	.pt {
		margin: 0;
		width: 7rem;
		text-align: center;
	}
	.pair .pt {
		width: 6rem;
	}
	a {
		display: block;
		border-radius: 50%;
	}
	img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 1;
		border-radius: 50%;
		object-fit: cover;
		border: 1px solid rgba(216, 178, 110, 0.42);
		box-shadow:
			0 0 0 4px rgba(216, 178, 110, 0.06),
			0 10px 26px -14px rgba(0, 0, 0, 0.95);
		transition:
			border-color 0.25s var(--ease),
			box-shadow 0.25s var(--ease);
	}
	a:hover img,
	a:focus-visible img {
		border-color: rgba(244, 215, 156, 0.8);
		box-shadow:
			0 0 0 4px rgba(216, 178, 110, 0.12),
			0 0 22px -6px rgba(242, 205, 135, 0.45);
	}
	figcaption {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		margin-top: 0.45rem;
		line-height: 1.25;
	}
	.nm {
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: #e2d6bf;
		text-wrap: balance;
	}
	.dt {
		font-size: 0.66rem;
		color: var(--ink-faint);
		font-variant-numeric: tabular-nums;
	}
	/* phones: smaller medallions, so the text keeps its width */
	@media (max-width: 30rem) {
		.portraits {
			margin-left: 0.85rem;
			gap: 0.5rem;
		}
		.pt {
			width: 5.4rem;
		}
		.pair .pt {
			width: 4.6rem;
		}
	}
</style>
