<script lang="ts">
	import { page } from '$app/state';
	import { chapterById, chapterIdFromRoute } from '$lib/content/toc';
	import { href } from '$lib/util/paths';
	import { ui, setSidebar, syncSidebar } from '$lib/stores/ui.svelte';
	import Logo from './Logo.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { MenuIcon, SearchIcon, SidebarIcon } from '$lib/icons';

	const id = $derived(chapterIdFromRoute(page.route.id));
	const chapter = $derived(chapterById.get(id));
	/** chapter pages have a sidebar on wide screens; other pages use the drawer */
	const book = $derived(page.route.id?.startsWith('/(book)') ?? false);

	let scrolled = $state(false);
	$effect(() => {
		syncSidebar();
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

	const is = (path: string) => page.url.pathname.endsWith(path);
</script>

<header class="topbar ui" class:scrolled>
	{#if book}
		<button
			class="tool t-sidebar"
			aria-label={ui.sidebarOpen ? 'Hide the contents' : 'Show the contents'}
			title={ui.sidebarOpen ? 'Hide the contents' : 'Show the contents'}
			aria-controls="chapter-sidebar"
			aria-expanded={ui.sidebarOpen}
			onclick={() => setSidebar(!ui.sidebarOpen)}
		>
			<Icon icon={SidebarIcon} size={19} />
		</button>
	{/if}
	<button
		class="tool t-drawer"
		class:book
		aria-label="Open the contents"
		aria-expanded={ui.navOpen}
		onclick={() => (ui.navOpen = true)}
	>
		<Icon icon={MenuIcon} size={19} />
	</button>

	<a class="brand" href={href('/')} aria-label="Homology & Cohomology — home">
		<Logo size={28} />
		<span class="wordmark">Homology</span>
	</a>

	{#if chapter}
		<div class="where" aria-hidden="true">
			<span class="sep"></span>
			<span class="num nums">{chapter.num}</span>
			<span class="title">{chapter.title}</span>
		</div>
	{/if}

	<nav class="links" aria-label="Site">
		<button class="search" onclick={() => (ui.searchOpen = true)} aria-label="Search the book (press / or Ctrl K)">
			<Icon icon={SearchIcon} size={15} stroke={1.8} />
			<span class="hide-md">Search</span>
			<kbd class="hide-md">/</kbd>
		</button>
		<a class="hide-xs" href={href('/map/')} class:active={is('/map/')}>Map</a>
		<a href={href('/glossary/')} class:active={is('/glossary/')}>Glossary</a>
		<a class="hide-sm" href={href('/notation/')} class:active={is('/notation/')}>Notation</a>
		<a class="hide-sm" href={href('/sources/')} class:active={is('/sources/')}>Sources</a>
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
		gap: 0.7rem;
		padding: 0 max(1rem, env(safe-area-inset-right)) 0 max(0.75rem, env(safe-area-inset-left));
		background: linear-gradient(180deg, rgba(5, 8, 15, 0.82), rgba(5, 8, 15, 0.6));
		backdrop-filter: blur(14px) saturate(140%);
		-webkit-backdrop-filter: blur(14px) saturate(140%);
		border-bottom: 1px solid transparent;
		transition:
			border-color 0.3s var(--ease),
			background 0.3s var(--ease);
	}
	.topbar.scrolled {
		border-bottom-color: var(--line-faint);
		background: rgba(5, 8, 15, 0.88);
	}
	.tool {
		display: grid;
		place-items: center;
		width: 2.25rem;
		height: 2.25rem;
		border-radius: 9px;
		border: 1px solid transparent;
		background: transparent;
		color: var(--ink-dim);
		cursor: pointer;
		transition:
			background 0.18s var(--ease),
			color 0.18s var(--ease),
			border-color 0.18s var(--ease);
	}
	.tool:hover {
		color: var(--gold-pale);
		background: rgba(216, 178, 110, 0.08);
		border-color: var(--line-faint);
	}
	.t-sidebar {
		display: none;
	}
	.t-sidebar[aria-expanded='true'] {
		color: var(--gold);
	}
	@media (min-width: 64rem) {
		.t-sidebar {
			display: grid;
		}
		.t-drawer.book {
			display: none;
		}
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-left: 0.15rem;
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
		gap: 0.55rem;
		min-width: 0;
		font-size: 0.84rem;
		color: var(--ink-dim);
	}
	.where .sep {
		align-self: center;
		width: 1px;
		height: 1rem;
		margin: 0 0.35rem 0 0.2rem;
		background: var(--line);
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
		align-items: center;
		gap: 0.2rem;
	}
	.links a {
		font-size: 0.8rem;
		letter-spacing: 0.06em;
		color: var(--ink-dim);
		text-decoration: none;
		padding: 0.4rem 0.7rem;
		border-radius: 8px;
		transition:
			color 0.18s var(--ease),
			background 0.18s var(--ease);
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
		height: 2.1rem;
		font-size: 0.8rem;
		color: var(--ink-dim);
		background: rgba(255, 255, 255, 0.03);
		border: 1px solid var(--line-faint);
		border-radius: 9px;
		padding: 0 0.55rem 0 0.6rem;
		margin-right: 0.45rem;
		cursor: pointer;
		transition:
			color 0.18s var(--ease),
			border-color 0.18s var(--ease);
	}
	.search:hover {
		color: var(--gold-pale);
		border-color: var(--line);
	}
	.search kbd {
		font-family: var(--font-ui);
		font-size: 0.68rem;
		line-height: 1.2rem;
		min-width: 1.2rem;
		text-align: center;
		border-radius: 4px;
		border: 1px solid var(--line);
		color: var(--ink-faint);
	}
	@media (max-width: 1060px) {
		.hide-md {
			display: none;
		}
		.search {
			width: 2.1rem;
			padding: 0;
			justify-content: center;
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
		.search {
			margin-right: 0.2rem;
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
