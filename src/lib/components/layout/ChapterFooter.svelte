<script lang="ts">
	import { neighbours } from '$lib/content/toc';
	import { chapterHref, href } from '$lib/util/paths';
	import Ornament from './Ornament.svelte';

	let { id }: { id: string } = $props();
	const nb = $derived(neighbours(id));
</script>

<footer class="ch-foot ui">
	<Ornament width={200} class="orn" />
	{#if nb.next}
		<a class="next panel" href={chapterHref(nb.next.id)}>
			<span class="eyebrow">Continue the journey</span>
			<span class="nnum nums">Chapter {nb.next.num}</span>
			<span class="ntitle gold-text">{nb.next.title}</span>
			<span class="nblurb">{nb.next.blurb}</span>
			<span class="arrow" aria-hidden="true">→</span>
		</a>
	{:else}
		<a class="next panel" href={href('/map/')}>
			<span class="eyebrow">You have reached the end</span>
			<span class="ntitle gold-text">Look back over the map</span>
			<span class="nblurb">See how every idea in the book connects — and where to go next.</span>
			<span class="arrow" aria-hidden="true">→</span>
		</a>
	{/if}
	<div class="row">
		{#if nb.prev}
			<a class="prev" href={chapterHref(nb.prev.id)}>← {nb.prev.num} {nb.prev.title}</a>
		{:else}
			<a class="prev" href={href('/')}>← Home</a>
		{/if}
		<a class="prev" href={href('/map/')}>Map of the journey</a>
	</div>
</footer>

<style>
	.ch-foot {
		max-width: var(--measure);
		margin: 5rem auto 4rem;
		padding: 0 1.25rem;
	}
	.ch-foot :global(.orn) {
		margin: 0 auto 2.2rem;
	}
	.next {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 1.6rem 3.6rem 1.6rem 1.7rem;
		text-decoration: none;
		color: var(--ink);
		transition:
			border-color 0.25s var(--ease),
			transform 0.25s var(--ease);
	}
	.next:hover {
		border-color: var(--line-strong);
		transform: translateY(-2px);
	}
	.nnum {
		font-size: 0.75rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: var(--ink-faint);
		margin-top: 0.3rem;
	}
	.ntitle {
		font-family: var(--font-display);
		font-size: 1.55rem;
		font-weight: 600;
		letter-spacing: 0.03em;
	}
	.nblurb {
		font-family: var(--font-body);
		color: var(--ink-dim);
		font-size: 0.98rem;
		line-height: 1.55;
	}
	.arrow {
		position: absolute;
		right: 1.4rem;
		top: 50%;
		transform: translateY(-50%);
		font-size: 1.6rem;
		color: var(--gold);
		transition: transform 0.25s var(--ease);
	}
	.next:hover .arrow {
		transform: translate(4px, -50%);
	}
	.row {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		margin-top: 1.1rem;
		font-size: 0.84rem;
	}
	.prev {
		color: var(--ink-faint);
		text-decoration: none;
	}
	.prev:hover {
		color: var(--gold-bright);
	}
</style>
