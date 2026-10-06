<script lang="ts">
	import { page } from '$app/state';
	import { chapterById, chapterIdFromRoute } from '$lib/content/toc';
	import { href } from '$lib/util/paths';
	import { ui } from '$lib/stores/ui.svelte';

	const id = $derived(chapterIdFromRoute(page.route.id));
	const chapter = $derived(chapterById.get(id));

	let scrolled = $state(false);
	$effect(() => {
		const onScroll = () => {
			scrolled = window.scrollY > 8;
			const doc = document.documentElement;
			const max = doc.scrollHeight - window.innerHeight;
			ui.progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', onScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', onScroll);
		};
	});
</script>

<header class="topbar ui" class:scrolled>
	<button
		class="menu"
		aria-label="Open table of contents"
		aria-expanded={ui.navOpen}
		onclick={() => (ui.navOpen = !ui.navOpen)}
	>
		<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
			<path d="M4 7h16M4 12h11M4 17h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
		</svg>
	</button>

	<a class="brand" href={href('/')}>
		<svg class="glyph" viewBox="0 0 64 64" width="26" height="26" aria-hidden="true">
			<defs>
				<linearGradient id="tb-t" x1="0" y1="0" x2="1" y2="1">
					<stop offset="0" stop-color="#6fd6e8" />
					<stop offset=".5" stop-color="#8f7cf7" />
					<stop offset="1" stop-color="#ee8fbf" />
				</linearGradient>
			</defs>
			<ellipse cx="32" cy="33" rx="24" ry="14" fill="none" stroke="url(#tb-t)" stroke-width="7" />
			<path d="M32 19 C 38.5 25, 38.5 41, 32 47" fill="none" stroke="#f2d08f" stroke-width="2.6" stroke-linecap="round" />
		</svg>
		<span class="wordmark">Homology</span>
	</a>

	{#if chapter}
		<div class="where" aria-hidden="true">
			<span class="sep">/</span>
			<span class="num nums">{chapter.num}</span>
			<span class="title">{chapter.title}</span>
		</div>
	{/if}

	<nav class="links" aria-label="Site">
		<button class="search" onclick={() => (ui.searchOpen = true)} aria-label="Search the book (/ or Ctrl K)">
			<svg viewBox="0 0 20 20" width="15" height="15" aria-hidden="true"
				><circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" stroke-width="1.6" /><path
					d="M13 13l4 4"
					stroke="currentColor"
					stroke-width="1.6"
					stroke-linecap="round"
				/></svg
			>
			<span class="hide-md">Search</span>
			<kbd class="hide-md">/</kbd>
		</button>
		<a class="hide-xs" href={href('/map/')} class:active={page.url.pathname.endsWith('/map/')}>Map</a>
		<a href={href('/glossary/')} class:active={page.url.pathname.endsWith('/glossary/')}>Glossary</a>
		<a class="hide-sm" href={href('/notation/')} class:active={page.url.pathname.endsWith('/notation/')}>Notation</a>
		<a class="hide-sm" href={href('/sources/')} class:active={page.url.pathname.endsWith('/sources/')}>Sources</a>
	</nav>

	<div class="bar" style="transform: scaleX({ui.progress})" aria-hidden="true"></div>
</header>

<style>
	.topbar {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: var(--topbar-h);
		z-index: 50;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0 max(1rem, env(safe-area-inset-right)) 0 max(0.75rem, env(safe-area-inset-left));
		background: linear-gradient(180deg, rgba(5, 8, 15, 0.82), rgba(5, 8, 15, 0.55));
		backdrop-filter: blur(14px) saturate(140%);
		-webkit-backdrop-filter: blur(14px) saturate(140%);
		border-bottom: 1px solid transparent;
		transition:
			border-color 0.3s var(--ease),
			background 0.3s var(--ease);
	}
	.topbar.scrolled {
		border-bottom-color: var(--line-faint);
		background: rgba(5, 8, 15, 0.86);
	}
	.menu {
		display: grid;
		place-items: center;
		width: 2.4rem;
		height: 2.4rem;
		border-radius: 10px;
		border: 1px solid var(--line-faint);
		background: rgba(216, 178, 110, 0.04);
		color: var(--gold-bright);
		cursor: pointer;
		transition: background 0.2s var(--ease);
	}
	.menu:hover {
		background: rgba(216, 178, 110, 0.12);
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		text-decoration: none;
	}
	.wordmark {
		font-family: var(--font-display);
		font-weight: 600;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		font-size: 0.92rem;
		background: linear-gradient(180deg, #fff3d6 0%, #f2d08f 45%, #c4974c 100%);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
	.where {
		display: flex;
		align-items: baseline;
		gap: 0.5rem;
		min-width: 0;
		font-size: 0.84rem;
		color: var(--ink-dim);
	}
	.where .sep {
		color: var(--ink-ghost);
	}
	.where .num {
		color: var(--gold);
		font-size: 0.78rem;
	}
	.where .title {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.links {
		margin-left: auto;
		display: flex;
		gap: 0.25rem;
	}
	.links a {
		font-size: 0.8rem;
		letter-spacing: 0.06em;
		color: var(--ink-dim);
		text-decoration: none;
		padding: 0.4rem 0.7rem;
		border-radius: 8px;
		transition:
			color 0.2s var(--ease),
			background 0.2s var(--ease);
	}
	.links a:hover,
	.links a.active {
		color: var(--gold-pale);
		background: rgba(216, 178, 110, 0.08);
	}
	.search {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		font-size: 0.8rem;
		color: var(--ink-dim);
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--line-faint);
		border-radius: 9px;
		padding: 0.35rem 0.6rem;
		margin-right: 0.4rem;
		cursor: pointer;
		transition: all 0.2s var(--ease);
	}
	.search:hover {
		color: var(--gold-pale);
		border-color: var(--line);
	}
	.search kbd {
		font-family: var(--font-ui);
		font-size: 0.66rem;
		padding: 0 0.35rem;
		border-radius: 4px;
		border: 1px solid var(--line);
		color: var(--ink-faint);
	}
	@media (max-width: 1060px) {
		.hide-md {
			display: none;
		}
	}
	.bar {
		position: absolute;
		left: 0;
		right: 0;
		bottom: -1px;
		height: 2px;
		transform-origin: 0 50%;
		background: linear-gradient(90deg, #a5803f, #f4d79c, #fff1cf);
		box-shadow: 0 0 10px rgba(244, 215, 156, 0.6);
		pointer-events: none;
	}
	@media (max-width: 860px) {
		.where {
			display: none;
		}
	}
	@media (max-width: 560px) {
		.hide-sm {
			display: none;
		}
		.wordmark {
			font-size: 0.8rem;
			letter-spacing: 0.12em;
		}
		.links a {
			padding: 0.4rem 0.5rem;
		}
	}
	/* the smallest phones: the map is one tap away in the menu */
	@media (max-width: 360px) {
		.hide-xs {
			display: none;
		}
		.links a {
			padding: 0.4rem 0.35rem;
		}
	}
</style>
