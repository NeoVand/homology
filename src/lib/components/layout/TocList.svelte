<script lang="ts">
	import { parts } from '$lib/content/toc';
	import { chapterHref } from '$lib/util/paths';
	import { progress } from '$lib/stores/progress.svelte';
	import { ui, smoothNextJump } from '$lib/stores/ui.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { VisitedIcon } from '$lib/icons';

	let { current = '' }: { current?: string } = $props();

	let nav: HTMLElement | undefined = $state();

	// When a chapter is chosen here, the previous chapter's section list folds
	// away above it. Keep the chosen link under the pointer instead of letting
	// the list jump.
	let anchor: { id: string; top: number } | null = null;

	function choose(e: MouseEvent, id: string) {
		ui.navOpen = false;
		anchor = { id, top: (e.currentTarget as HTMLElement).getBoundingClientRect().top };
	}

	function scroller(el: HTMLElement): HTMLElement | null {
		for (let p = el.parentElement; p; p = p.parentElement) {
			const oy = getComputedStyle(p).overflowY;
			if ((oy === 'auto' || oy === 'scroll') && p.scrollHeight > p.clientHeight) return p;
		}
		return null;
	}

	$effect(() => {
		const id = current;
		if (!anchor || anchor.id !== id || !nav) return;
		const a = nav.querySelector<HTMLElement>('a[aria-current="page"]');
		const box = a && scroller(a);
		if (a && box) box.scrollTop += a.getBoundingClientRect().top - anchor.top;
		anchor = null;
	});
</script>

<nav class="toc ui" aria-label="Table of contents" bind:this={nav}>
	{#each parts as part (part.id)}
		<section class="part" style="--pc:{part.color}">
			<div class="part-head">
				<span class="numeral">{part.numeral}</span>
				<span class="part-title">{part.title}</span>
			</div>
			<ol>
				{#each part.chapters as ch (ch.id)}
					<li>
						<a
							href={chapterHref(ch.id)}
							class="ch"
							class:active={current === ch.id}
							aria-current={current === ch.id ? 'page' : undefined}
							onclick={(e) => choose(e, ch.id)}
						>
							<span class="num nums">{ch.num}</span>
							<span class="t">{ch.title}</span>
							{#if progress.visited[ch.id] && current !== ch.id}
								<Icon icon={VisitedIcon} size={13} stroke={2} class="seen" label="visited" />
							{/if}
						</a>
						{#if current === ch.id && ui.sections.length}
							<ul class="sections">
								{#each ui.sections as s (s.id)}
									<li>
										<a
											href={'#' + s.id}
											class="sec"
											class:on={ui.activeSection === s.id}
											aria-current={ui.activeSection === s.id ? 'location' : undefined}
											onclick={() => {
												ui.navOpen = false;
												smoothNextJump();
											}}>{@html s.html}</a
										>
									</li>
								{/each}
							</ul>
						{/if}
					</li>
				{/each}
			</ol>
		</section>
	{/each}
</nav>

<style>
	.toc {
		font-size: 0.86rem;
		line-height: 1.35;
	}
	.part + .part {
		margin-top: 1.4rem;
	}
	.part-head {
		display: flex;
		align-items: baseline;
		gap: 0.55rem;
		padding: 0 0.6rem 0.5rem;
		margin-bottom: 0.3rem;
		border-bottom: 1px solid var(--line-faint);
	}
	.numeral {
		font-family: var(--font-display);
		font-weight: 600;
		color: var(--pc);
		min-width: 1.5rem;
		font-size: 0.9rem;
	}
	.part-title {
		font-family: var(--font-display);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		font-size: 0.72rem;
		font-weight: 600;
		color: var(--ink-dim);
	}
	ol,
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	a {
		position: relative;
		display: flex;
		align-items: baseline;
		gap: 0.55rem;
		padding: 0.4rem 0.6rem;
		border-radius: 7px;
		color: var(--ink-dim);
		text-decoration: none;
		transition:
			background 0.18s var(--ease),
			color 0.18s var(--ease);
	}
	a:hover {
		background: rgba(216, 178, 110, 0.07);
		color: var(--ink-bright);
	}
	a.active {
		background: linear-gradient(90deg, rgba(216, 178, 110, 0.15), rgba(216, 178, 110, 0.03));
		color: var(--gold-pale);
	}
	a.active::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.45rem;
		bottom: 0.45rem;
		width: 2px;
		border-radius: 2px;
		background: var(--gold-bright);
	}
	.num {
		flex: none;
		min-width: 1.5rem;
		color: var(--ink-faint);
		font-size: 0.74rem;
	}
	a.active .num {
		color: var(--gold);
	}
	.t {
		flex: 1;
		min-width: 0;
	}
	a :global(.seen) {
		align-self: center;
		color: var(--gold);
		opacity: 0.55;
	}
	.sections {
		margin: 0.2rem 0 0.55rem 1.45rem;
		padding-left: 0.65rem;
		border-left: 1px solid var(--line-faint);
	}
	a.sec {
		display: block;
		padding: 0.26rem 0.5rem;
		font-size: 0.8rem;
		color: var(--ink-faint);
	}
	a.sec:hover {
		color: var(--ink-bright);
	}
	a.sec :global(.katex) {
		font-size: 1em;
	}
	a.sec.on {
		color: var(--gold-bright);
		background: transparent;
	}
	a.sec.on::before {
		content: '';
		position: absolute;
		left: calc(-0.65rem - 1px);
		top: 0.3rem;
		bottom: 0.3rem;
		width: 1px;
		background: var(--gold-bright);
	}
</style>
