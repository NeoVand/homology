<script lang="ts">
	import { page } from '$app/state';
	import { fade, fly } from 'svelte/transition';
	import { chapterIdFromRoute } from '$lib/content/toc';
	import { ui } from '$lib/stores/ui.svelte';
	import { href } from '$lib/util/paths';
	import TocList from './TocList.svelte';

	const current = $derived(chapterIdFromRoute(page.route.id));

	$effect(() => {
		if (!ui.navOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') ui.navOpen = false;
		};
		window.addEventListener('keydown', onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			window.removeEventListener('keydown', onKey);
			document.body.style.overflow = prev;
		};
	});
</script>

{#if ui.navOpen}
	<div class="scrim" transition:fade={{ duration: 180 }} onclick={() => (ui.navOpen = false)} aria-hidden="true"></div>
	<div
		class="drawer"
		role="dialog"
		aria-modal="true"
		aria-label="Table of contents"
		transition:fly={{ x: -320, duration: 260, opacity: 1 }}
	>
		<div class="drawer-head">
			<a class="home ui" href={href('/')} onclick={() => (ui.navOpen = false)}>
				<span class="eyebrow">An illustrated journey</span>
				<span class="ttl gold-text">Homology &amp; Cohomology</span>
			</a>
			<button class="close" aria-label="Close" onclick={() => (ui.navOpen = false)}>
				<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
					<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
				</svg>
			</button>
		</div>
		<div class="drawer-body">
			<TocList {current} />
			<div class="extras ui">
				<a href={href('/map/')} onclick={() => (ui.navOpen = false)}>Map of the journey</a>
				<a href={href('/glossary/')} onclick={() => (ui.navOpen = false)}>Glossary</a>
				<a href={href('/notation/')} onclick={() => (ui.navOpen = false)}>Notation</a>
				<a href={href('/sources/')} onclick={() => (ui.navOpen = false)}>Sources &amp; further reading</a>
			</div>
		</div>
	</div>
{/if}

<style>
	.scrim {
		position: fixed;
		inset: 0;
		z-index: 60;
		background: rgba(2, 4, 9, 0.6);
		backdrop-filter: blur(3px);
	}
	.drawer {
		position: fixed;
		z-index: 61;
		top: 0;
		bottom: 0;
		left: 0;
		width: min(22rem, 88vw);
		display: flex;
		flex-direction: column;
		background: linear-gradient(180deg, #0b1122, #070b16);
		border-right: 1px solid var(--line);
		box-shadow: 30px 0 80px -30px rgba(0, 0, 0, 0.9);
	}
	.drawer-head {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		padding: 1.1rem 1rem 0.9rem 1.2rem;
		border-bottom: 1px solid var(--line-faint);
	}
	.home {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		text-decoration: none;
	}
	.ttl {
		font-family: var(--font-display);
		font-size: 1.12rem;
		font-weight: 600;
		letter-spacing: 0.05em;
	}
	.close {
		display: grid;
		place-items: center;
		width: 2.1rem;
		height: 2.1rem;
		border-radius: 9px;
		border: 1px solid var(--line-faint);
		background: transparent;
		color: var(--ink-dim);
		cursor: pointer;
	}
	.close:hover {
		color: var(--gold-bright);
		background: rgba(216, 178, 110, 0.08);
	}
	.drawer-body {
		overflow-y: auto;
		padding: 1rem 0.6rem 2rem;
		flex: 1;
	}
	.extras {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding: 0.6rem 0.6rem 0;
		border-top: 1px solid var(--line-faint);
	}
	.extras a {
		font-size: 0.86rem;
		color: var(--gold);
		text-decoration: none;
		padding: 0.35rem 0;
	}
	.extras a:hover {
		color: var(--gold-pale);
	}
</style>
