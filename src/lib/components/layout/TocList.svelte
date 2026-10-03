<script lang="ts">
	import { parts } from '$lib/content/toc';
	import { chapterHref } from '$lib/util/paths';
	import { progress } from '$lib/stores/progress.svelte';
	import { ui } from '$lib/stores/ui.svelte';

	let { current = '' }: { current?: string } = $props();
</script>

<nav class="toc ui" aria-label="Table of contents">
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
							class:active={current === ch.id}
							aria-current={current === ch.id ? 'page' : undefined}
							onclick={() => (ui.navOpen = false)}
						>
							<span class="num nums">{ch.num}</span>
							<span class="t">{ch.title}</span>
							{#if progress.visited[ch.id]}
								<span class="seen" title="Visited" aria-label="visited">✦</span>
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
											onclick={() => (ui.navOpen = false)}>{@html s.html}</a
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
	.part {
		margin-bottom: 1.35rem;
	}
	.part-head {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		padding: 0 0.6rem 0.45rem;
		margin-bottom: 0.3rem;
		border-bottom: 1px solid var(--line-faint);
	}
	.numeral {
		font-family: var(--font-display);
		font-weight: 600;
		color: var(--pc);
		min-width: 1.4rem;
		font-size: 0.95rem;
	}
	.part-title {
		font-family: var(--font-display);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		font-size: 0.74rem;
		font-weight: 600;
		color: var(--ink-dim);
	}
	ol {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	a {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		padding: 0.38rem 0.6rem;
		border-radius: 7px;
		color: var(--ink-dim);
		text-decoration: none;
		transition:
			background 0.2s var(--ease),
			color 0.2s var(--ease);
		position: relative;
	}
	a:hover {
		background: rgba(216, 178, 110, 0.07);
		color: var(--ink-bright);
	}
	a.active {
		background: linear-gradient(90deg, rgba(216, 178, 110, 0.16), rgba(216, 178, 110, 0.03));
		color: var(--gold-pale);
	}
	a.active::before {
		content: '';
		position: absolute;
		left: -0.15rem;
		top: 0.45rem;
		bottom: 0.45rem;
		width: 2px;
		border-radius: 2px;
		background: var(--gold-bright);
		box-shadow: 0 0 10px var(--gold-glow);
	}
	.num {
		color: var(--ink-faint);
		font-size: 0.74rem;
		min-width: 1.6rem;
	}
	a.active .num {
		color: var(--gold);
	}
	.t {
		flex: 1;
	}
	.sections {
		list-style: none;
		margin: 0.15rem 0 0.5rem 2.35rem;
		padding: 0 0 0 0.7rem;
		border-left: 1px solid var(--line-faint);
	}
	a.sec {
		padding: 0.22rem 0.5rem;
		font-size: 0.8rem;
		color: var(--ink-faint);
		display: block;
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
		left: -0.78rem;
		top: 0.5rem;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--gold-bright);
		box-shadow: 0 0 8px var(--gold-glow);
	}
	.seen {
		color: var(--gold);
		font-size: 0.62rem;
		opacity: 0.7;
	}
</style>
