<script lang="ts" module>
	export type PortraitVariant = 'banner' | 'panel' | 'hero';
</script>

<script lang="ts">
	// Portraits for a history box: large gold-line drawings that fade into the
	// box, with each person's name and dates set over the fade.
	import { asset } from '$app/paths';
	import { people, biographyLink } from '$lib/content/people';

	let { keys, variant = 'banner' }: { keys: string[]; variant?: PortraitVariant } = $props();

	const list = $derived(
		keys.map((k) => {
			const p = people[k];
			if (!p) throw new Error(`[Portraits] unknown person "${k}"`);
			return p;
		})
	);
	const alt = (p: (typeof list)[number]) => `Drawing of ${p.name}${p.imagined ? ', after a later imagined likeness' : ''}`;
</script>

{#snippet names()}
	<div class="names">
		{#each list as p (p.key)}
			<a class="who" href={biographyLink(p)} target="_blank" rel="noopener" title="Biography of {p.name}">
				<span class="nm">{p.name}</span>
				<span class="dt ui">{p.dates}</span>
			</a>
		{/each}
	</div>
{/snippet}

<div class="pt v-{variant}" class:many={list.length > 1} style="--n:{list.length}">
	<div class="pics" aria-hidden={variant === 'hero' ? undefined : 'true'}>
		{#each list as p (p.key)}
			<img src={asset(`/portraits/${p.key}.webp`)} alt={alt(p)} width="640" height="640" loading="lazy" decoding="async" />
		{/each}
	</div>
	{@render names()}
</div>

<style>
	/* ── shared ─────────────────────────────────────────────────────────── */
	.pt {
		position: relative;
	}
	.pics {
		display: flex;
	}
	img {
		display: block;
		object-fit: cover;
		min-width: 0;
	}
	.names {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}
	.who {
		display: flex;
		flex-direction: column;
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

	/* ── A. banner: a strip across the top, portrait on the right ───────── */
	.v-banner {
		display: flex;
		align-items: flex-end;
		min-height: 13.5rem;
		margin: -0.2rem -1.3rem 1.1rem -1.35rem;
		padding: 0 1.35rem 1rem;
	}
	.v-banner .pics {
		position: absolute;
		inset: 0 0 0 auto;
		width: min(70%, calc(var(--n) * 15rem));
		-webkit-mask-image: linear-gradient(to right, transparent, #000 38%), linear-gradient(to bottom, #000 62%, transparent);
		-webkit-mask-composite: source-in;
		mask-image: linear-gradient(to right, transparent, #000 38%), linear-gradient(to bottom, #000 62%, transparent);
		mask-composite: intersect;
	}
	.v-banner img {
		flex: 1 1 0;
		height: 100%;
		object-position: center 22%;
	}
	.v-banner .names {
		position: relative;
		max-width: 58%;
	}

	/* ── B. panel: a tall portrait beside the text, fading into it ──────── */
	.v-panel {
		float: right;
		width: min(46%, calc(var(--n) * 13rem));
		margin: -0.2rem -1.3rem 0.8rem 1rem;
		shape-outside: inset(0);
	}
	.v-panel .pics {
		aspect-ratio: calc(var(--n) * 0.8);
		-webkit-mask-image: linear-gradient(to right, transparent, #000 30%), linear-gradient(to bottom, #000 55%, transparent 96%);
		-webkit-mask-composite: source-in;
		mask-image: linear-gradient(to right, transparent, #000 30%), linear-gradient(to bottom, #000 55%, transparent 96%);
		mask-composite: intersect;
	}
	.v-panel img {
		flex: 1 1 0;
		height: 100%;
		object-position: center 20%;
	}
	.v-panel .names {
		position: relative;
		margin-top: -2.6rem;
		padding: 0 1.3rem 0 1.2rem;
		text-align: right;
	}
	.v-panel .who {
		align-items: flex-end;
	}
	.v-panel .nm {
		font-size: 1.45rem;
	}
	.v-panel.many .nm {
		font-size: 1.2rem;
	}

	/* ── C. hero: a large centred portrait over the box, name beneath it ─ */
	.v-hero {
		margin: -0.4rem -1.3rem 1rem -1.35rem;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.v-hero .pics {
		justify-content: center;
		gap: 0;
		height: 17rem;
		width: 100%;
		-webkit-mask-image: linear-gradient(to bottom, #000 58%, transparent 97%);
		mask-image: linear-gradient(to bottom, #000 58%, transparent 97%);
	}
	.v-hero img {
		height: 100%;
		width: auto;
		aspect-ratio: 1;
	}
	.v-hero.many img {
		margin-inline: -1.2rem;
	}
	.v-hero .names {
		margin-top: -2.4rem;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.4rem 3rem;
		text-align: center;
		text-shadow: 0 2px 14px rgba(4, 6, 12, 0.95);
	}
	.v-hero .who {
		align-items: center;
	}

	/* phones */
	@media (max-width: 30rem) {
		.v-banner,
		.v-hero {
			margin-inline: -0.95rem -1rem;
			padding-inline: 1rem;
		}
		.v-banner {
			min-height: 11rem;
		}
		.v-banner .pics {
			width: min(78%, calc(var(--n) * 12rem));
		}
		.v-hero .pics {
			height: 13rem;
		}
		.v-panel {
			float: none;
			width: auto;
			margin: -0.2rem -0.95rem 0.9rem -1rem;
		}
		.v-panel .pics {
			aspect-ratio: auto;
			height: 12rem;
			-webkit-mask-image: linear-gradient(to bottom, #000 45%, transparent);
			mask-image: linear-gradient(to bottom, #000 45%, transparent);
		}
		.nm {
			font-size: 1.5rem;
		}
		.many .nm,
		.v-panel .nm {
			font-size: 1.25rem;
		}
	}
</style>
