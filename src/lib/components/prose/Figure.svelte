<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		size = 'normal',
		num,
		title = '',
		hint = '',
		id,
		caption,
		children
	}: {
		/** normal = reading column; wide/full break out of it */
		size?: 'normal' | 'wide' | 'full';
		num?: string;
		title?: string;
		/** how to interact, e.g. "Drag to rotate · click edges to toggle" */
		hint?: string;
		id?: string;
		caption?: Snippet;
		children: Snippet;
	} = $props();
</script>

<figure class="figure {size === 'normal' ? '' : size}" {id}>
	<div class="frame">
		<span class="corner tl" aria-hidden="true"></span>
		<span class="corner tr" aria-hidden="true"></span>
		<span class="corner bl" aria-hidden="true"></span>
		<span class="corner br" aria-hidden="true"></span>
		{#if title || hint}
			<div class="f-top ui">
				{#if title}<span class="f-title">{title}</span>{/if}
				{#if hint}
					<span class="f-hint">
						<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true"
							><path
								d="M7 9V4.5a1.5 1.5 0 0 1 3 0V9m0-1.5a1.5 1.5 0 0 1 3 0V10m0-1a1.5 1.5 0 0 1 3 0v3.5A5.5 5.5 0 0 1 10.5 18h-.8a5 5 0 0 1-4-2l-2.2-3a1.5 1.5 0 0 1 2.3-1.9L7 12.5"
								fill="none"
								stroke="currentColor"
								stroke-width="1.3"
								stroke-linecap="round"
								stroke-linejoin="round"
							/></svg
						>
						{hint}
					</span>
				{/if}
			</div>
		{/if}
		<div class="f-body">
			{@render children()}
		</div>
	</div>
	{#if caption}
		<figcaption>
			{#if num}<span class="f-num ui">Figure {num}</span>{/if}
			{@render caption()}
		</figcaption>
	{/if}
</figure>

<style>
	.figure {
		margin: 2.4rem 0 2.6rem;
	}
	/* break out of the reading column, centred on it */
	.figure.wide {
		--w: min(var(--wide), var(--avail, calc(100vw - 2.5rem)));
		width: var(--w);
		margin-left: calc((100% - var(--w)) / 2);
	}
	.figure.full {
		--w: min(var(--full), var(--avail, calc(100vw - 2rem)));
		width: var(--w);
		margin-left: calc((100% - var(--w)) / 2);
	}
	.frame {
		position: relative;
		border-radius: var(--radius);
		background:
			radial-gradient(120% 90% at 50% 0%, rgba(40, 56, 100, 0.28), transparent 70%),
			linear-gradient(180deg, rgba(13, 19, 36, 0.92), rgba(7, 11, 21, 0.94));
		border: 1px solid var(--line);
		box-shadow:
			0 24px 60px -30px rgba(0, 0, 0, 0.95),
			inset 0 1px 0 rgba(255, 255, 255, 0.03);
		overflow: hidden;
	}
	.corner {
		position: absolute;
		width: 14px;
		height: 14px;
		border-color: var(--gold);
		border-style: solid;
		opacity: 0.7;
		pointer-events: none;
		z-index: 3;
	}
	.tl {
		top: 6px;
		left: 6px;
		border-width: 1px 0 0 1px;
		border-top-left-radius: 6px;
	}
	.tr {
		top: 6px;
		right: 6px;
		border-width: 1px 1px 0 0;
		border-top-right-radius: 6px;
	}
	.bl {
		bottom: 6px;
		left: 6px;
		border-width: 0 0 1px 1px;
		border-bottom-left-radius: 6px;
	}
	.br {
		bottom: 6px;
		right: 6px;
		border-width: 0 1px 1px 0;
		border-bottom-right-radius: 6px;
	}
	.f-top {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.75rem 1.2rem 0;
		font-size: 0.74rem;
		position: relative;
		z-index: 2;
	}
	.f-title {
		letter-spacing: 0.16em;
		text-transform: uppercase;
		font-weight: 600;
		color: var(--gold);
	}
	.f-hint {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		color: var(--ink-faint);
		margin-left: auto;
		text-align: right;
	}
	.f-body {
		position: relative;
	}
	figcaption {
		font-size: 0.93rem;
		line-height: 1.6;
		color: var(--ink-dim);
		padding: 0.9rem 0.4rem 0;
		max-width: var(--measure);
		margin: 0 auto;
	}
	.f-num {
		font-size: 0.7rem;
		font-weight: 650;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold);
		margin-right: 0.6rem;
	}
	figcaption :global(p) {
		margin: 0 0 0.5em;
		display: inline;
	}
</style>
