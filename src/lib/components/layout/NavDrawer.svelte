<script lang="ts">
	import { page } from '$app/state';
	import { fade, fly } from 'svelte/transition';
	import { chapterIdFromRoute } from '$lib/content/toc';
	import { ui } from '$lib/stores/ui.svelte';
	import { href } from '$lib/util/paths';
	import TocList from './TocList.svelte';
	import Logo from './Logo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { CloseIcon } from '$lib/icons';

	const current = $derived(chapterIdFromRoute(page.route.id));

	let drawer: HTMLElement | undefined = $state();

	// A modal drawer: the page behind is inert and does not scroll, focus moves
	// to the current chapter and comes back to the menu button on close.
	$effect(() => {
		if (!ui.navOpen || !drawer) return;
		const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		const behind = [document.querySelector('.topbar'), document.getElementById('main')].filter(
			(el): el is HTMLElement => el instanceof HTMLElement
		);
		for (const el of behind) el.inert = true;
		const body = drawer.querySelector<HTMLElement>('.drawer-body');
		const here = drawer.querySelector<HTMLElement>('a[aria-current="page"]');
		if (body && here) body.scrollTop += here.getBoundingClientRect().top - body.getBoundingClientRect().top - body.clientHeight / 4;
		(here ?? drawer.querySelector<HTMLElement>('.close'))?.focus({ preventScroll: true });

		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') ui.navOpen = false;
		};
		window.addEventListener('keydown', onKey);
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			for (const el of behind) el.inert = false;
			window.removeEventListener('keydown', onKey);
			document.body.style.overflow = prev;
			if (opener?.isConnected) opener.focus({ preventScroll: true });
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
		bind:this={drawer}
		transition:fly={{ x: -320, duration: 260, opacity: 1 }}
	>
		<div class="drawer-head">
			<a class="home ui" href={href('/')} onclick={() => (ui.navOpen = false)}>
				<Logo size={34} />
				<span class="names">
					<span class="eyebrow">An illustrated journey</span>
					<span class="ttl gold-text">Homology &amp; Cohomology</span>
				</span>
			</a>
			<button class="close" aria-label="Close the contents" onclick={() => (ui.navOpen = false)}>
				<Icon icon={CloseIcon} size={18} />
			</button>
		</div>
		<div class="drawer-body">
			<TocList {current} />
			<div class="extras ui">
				<a href={href('/map/')} onclick={() => (ui.navOpen = false)}>Map of the journey</a>
				<a href={href('/cheatsheet/')} onclick={() => (ui.navOpen = false)}>The whole story on one page</a>
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
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 1rem 0.9rem 0.9rem 1.1rem;
		border-bottom: 1px solid var(--line-faint);
	}
	.home {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		min-width: 0;
		text-decoration: none;
	}
	.names {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.ttl {
		font-family: var(--font-display);
		font-size: 1.02rem;
		font-weight: 600;
		letter-spacing: 0.04em;
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
