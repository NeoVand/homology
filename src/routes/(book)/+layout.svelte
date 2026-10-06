<script lang="ts">
	import { page } from '$app/state';
	import { tick } from 'svelte';
	import { chapterById, chapterIdFromRoute } from '$lib/content/toc';
	import { ui } from '$lib/stores/ui.svelte';
	import { markVisited } from '$lib/stores/progress.svelte';
	import ChapterHeader from '$lib/components/layout/ChapterHeader.svelte';
	import ChapterFooter from '$lib/components/layout/ChapterFooter.svelte';
	import TocList from '$lib/components/layout/TocList.svelte';

	let { children } = $props();

	const id = $derived(chapterIdFromRoute(page.route.id));
	const chapter = $derived(chapterById.get(id));

	let article: HTMLElement | undefined = $state();
	let sidebarInner: HTMLElement | undefined = $state();

	// keep the current chapter in view in the (independently scrolling) sidebar
	$effect(() => {
		void id;
		void ui.sidebarOpen;
		if (!sidebarInner) return;
		tick().then(() => {
			const el = sidebarInner?.querySelector<HTMLElement>('a[aria-current="page"]');
			if (!el || !sidebarInner) return;
			const box = sidebarInner.getBoundingClientRect();
			const r = el.getBoundingClientRect();
			if (r.top >= box.top + 40 && r.bottom <= box.bottom - 40) return;
			sidebarInner.scrollTop += r.top - box.top - box.height / 4;
		});
	});

	// Collect the h2 sections for the sidebar and keep the active one in sync:
	// the active section is the last heading above ~35% of the viewport.
	$effect(() => {
		const currentId = id; // re-run on navigation
		if (!article) return;
		let cancelled = false;
		let heads: HTMLHeadingElement[] = [];
		let raf = 0;
		const update = () => {
			raf = 0;
			const line = window.innerHeight * 0.35;
			let active = heads[0]?.id ?? null;
			for (const h of heads) {
				if (h.getBoundingClientRect().top <= line) active = h.id;
				else break;
			}
			ui.activeSection = active;
		};
		const onScroll = () => {
			if (!raf) raf = requestAnimationFrame(update);
		};
		tick().then(() => {
			if (cancelled || !article) return;
			markVisited(currentId);
			heads = Array.from(article.querySelectorAll<HTMLHeadingElement>('h2[id]'));
			ui.sections = heads.map((h) => {
				const clone = h.cloneNode(true) as HTMLElement;
				clone.querySelectorAll('.katex-mathml, .sec-num, .anchor').forEach((n) => n.remove());
				return { id: h.id, html: clone.innerHTML };
			});
			update();
			window.addEventListener('scroll', onScroll, { passive: true });
			window.addEventListener('resize', onScroll, { passive: true });
		});
		return () => {
			cancelled = true;
			cancelAnimationFrame(raf);
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
			ui.sections = [];
		};
	});
</script>

<svelte:head>
	{#if chapter}
		<title>{chapter.num} {chapter.title} · Homology &amp; Cohomology</title>
		<meta name="description" content={chapter.blurb} />
		<meta property="og:title" content="{chapter.title} — Homology & Cohomology" />
		<meta property="og:description" content={chapter.blurb} />
	{/if}
</svelte:head>

<div class="book">
	<aside id="chapter-sidebar" class="sidebar" aria-label="Chapters">
		<div class="sidebar-inner" bind:this={sidebarInner}>
			<TocList current={id} />
		</div>
	</aside>
	<main class="main">
		{#if chapter}
			<ChapterHeader {chapter} />
		{/if}
		<article class="prose chapter" bind:this={article}>
			{@render children()}
		</article>
		<ChapterFooter {id} />
	</main>
</div>

<style>
	.book {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
	}
	.sidebar {
		display: none;
	}
	/* The main column is a size container: figure plates are sized against it
	   (100cqi), never against the viewport, so they fit with or without the
	   sidebar and never cause sideways scrolling. */
	.main {
		min-width: 0;
		padding: 0 clamp(1rem, 4vw, 2.5rem);
		container-type: inline-size;
	}
	/* From 1024px the contents stay beside the text, unless the reader hid them
	   (html[data-sidebar='closed'], restored before first paint by app.html). */
	@media (min-width: 64rem) {
		:global(html:not([data-sidebar='closed'])) .book {
			grid-template-columns: var(--sidebar-w) minmax(0, 1fr);
		}
		:global(html:not([data-sidebar='closed'])) .sidebar {
			display: block;
		}
	}
	.sidebar-inner {
		position: sticky;
		top: var(--topbar-h);
		height: calc(100vh - var(--topbar-h));
		height: calc(100dvh - var(--topbar-h));
		overflow-y: auto;
		overscroll-behavior: contain;
		padding: 1.5rem 0.75rem 3rem 0.9rem;
		border-right: 1px solid var(--line-faint);
		background: linear-gradient(90deg, rgba(4, 6, 12, 0.55), rgba(4, 6, 12, 0.25));
		scrollbar-width: thin;
		scrollbar-color: transparent transparent;
	}
	.sidebar-inner:hover,
	.sidebar-inner:focus-within {
		scrollbar-color: rgba(216, 178, 110, 0.25) transparent;
	}

	/* automatic section numbering for h2 inside chapters */
	.chapter {
		counter-reset: sec;
	}
	.chapter :global(h2[id]) {
		counter-increment: sec;
	}
	.chapter :global(h2[id]::before) {
		content: counter(sec, decimal-leading-zero);
		display: block;
		font-family: var(--font-ui);
		font-size: 0.7rem;
		letter-spacing: 0.3em;
		color: var(--gold-deep);
		margin-bottom: 0.45rem;
		font-weight: 600;
	}
	.chapter :global(h2[id]::after) {
		content: '';
		display: block;
		width: 3.2rem;
		height: 1px;
		margin-top: 0.85rem;
		background: linear-gradient(90deg, var(--gold), transparent);
	}
</style>
