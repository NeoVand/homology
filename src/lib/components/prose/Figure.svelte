<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { HintIcon, TapIcon } from '$lib/icons';

	let {
		num,
		title = '',
		hint = '',
		id,
		caption,
		children
	}: {
		num?: string;
		title?: string;
		/** how to interact, e.g. "Drag to rotate · click edges to toggle" */
		hint?: string;
		id?: string;
		caption?: Snippet;
		children: Snippet;
	} = $props();
</script>

<!-- Every plate in the book has the same width, --plate, centred on the
     reading column and never wider than the main column (100cqi). -->
<figure class="figure" {id}>
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
						<Icon icon={HintIcon} size={14} class="pointer" />
						<Icon icon={TapIcon} size={14} class="touch" />
						<span>{hint}</span>
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
		--w: min(var(--plate), 100cqi);
		width: var(--w);
		margin: 2.5rem 0 2.6rem calc((100% - var(--w)) / 2);
		container: figure / inline-size;
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
		position: relative;
		z-index: 2;
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 0.4rem 1.25rem;
		padding: 0.8rem 1.25rem 0;
		font-size: 0.74rem;
		line-height: 1.45;
	}
	.f-title {
		flex: none;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		font-weight: 600;
		color: var(--gold);
	}
	.f-hint {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
		min-width: 0;
		color: var(--ink-faint);
		text-align: right;
	}
	.f-hint :global(.icon) {
		align-self: center;
		opacity: 0.8;
	}
	.f-hint :global(.touch) {
		display: none;
	}
	@media (hover: none) {
		.f-hint :global(.pointer) {
			display: none;
		}
		.f-hint :global(.touch) {
			display: inline-block;
		}
	}
	/* narrow plates: the hint goes under the title, left-aligned */
	@container figure (max-width: 38rem) {
		.f-top {
			flex-direction: column;
			align-items: flex-start;
			padding: 0.75rem 1rem 0;
		}
		.f-hint {
			text-align: left;
		}
	}
	.f-body {
		position: relative;
	}
	figcaption {
		max-width: var(--measure);
		margin: 0 auto;
		padding: 0.95rem 0.4rem 0;
		font-size: 0.93rem;
		line-height: 1.6;
		color: var(--ink-dim);
	}
	.f-num {
		margin-right: 0.6rem;
		font-size: 0.7rem;
		font-weight: 650;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold);
	}
	figcaption :global(p) {
		display: inline;
		margin: 0 0 0.5em;
	}
</style>
