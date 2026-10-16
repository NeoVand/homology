<script lang="ts">
	// Portraits for a history box: large gold-line drawings centred at the top
	// of the box, fading down into it, each with its name and dates beneath.
	// The drawings are on pure black and blend with the screen mode, so the
	// black vanishes into the box and only the gold drawing shows.
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
	{#each list as p (p.key)}
		<div class="col">
			<img
				src={asset(`/portraits/${p.key}.webp`)}
				alt="Drawing of {p.name}{p.imagined ? ', after a later imagined likeness' : ''}"
				width="560"
				height="560"
				loading="lazy"
				decoding="async"
			/>
			<a class="who" href={biographyLink(p)} target="_blank" rel="noopener" title="Biography of {p.name}">
				<span class="nm">{p.name}</span>
				<span class="dt ui">{p.dates}</span>
			</a>
		</div>
	{/each}
</div>

<style>
	.pt {
		display: flex;
		justify-content: center;
		margin: -0.4rem -1.3rem 1rem -1.35rem;
	}
	.col {
		flex: 0 1 17rem;
		min-width: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.many .col {
		margin-inline: -0.8rem;
	}
	img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 1;
		object-fit: cover;
		mix-blend-mode: screen;
		-webkit-mask-image: linear-gradient(to bottom, #000 58%, transparent 97%);
		mask-image: linear-gradient(to bottom, #000 58%, transparent 97%);
	}
	.who {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.15rem;
		margin-top: -2.4rem;
		padding-inline: 0.5rem;
		text-align: center;
		text-decoration: none;
		color: inherit;
		text-shadow: 0 2px 14px rgba(4, 6, 12, 0.95);
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
	/* phones: one portrait a little smaller; two or three share the width */
	@media (max-width: 30rem) {
		.pt {
			margin-inline: -0.95rem -1rem;
		}
		.col {
			flex-basis: 13rem;
		}
		.many .col {
			flex: 1 1 0;
			margin-inline: -0.35rem;
		}
		.who {
			margin-top: -1.8rem;
			padding-inline: 0.2rem;
		}
		.nm {
			font-size: 1.5rem;
		}
		.many .nm {
			font-size: 1.05rem;
		}
		.many .dt {
			font-size: 0.62rem;
			letter-spacing: 0.08em;
		}
	}
</style>
