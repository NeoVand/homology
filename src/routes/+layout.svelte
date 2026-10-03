<script lang="ts">
	import '../app.css';
	import Starfield from '$lib/components/layout/Starfield.svelte';
	import TopBar from '$lib/components/layout/TopBar.svelte';
	import NavDrawer from '$lib/components/layout/NavDrawer.svelte';
	import SearchDialog from '$lib/components/layout/SearchDialog.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Homology & Cohomology — an illustrated journey" />
	<meta property="og:image" content="https://neovand.github.io/homology/og.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="https://neovand.github.io/homology/og.png" />
</svelte:head>

<a class="skip ui" href="#main">Skip to content</a>
<Starfield />
<TopBar />
<NavDrawer />
<SearchDialog />

<div id="main" class="page">
	{@render children()}
</div>

<style>
	.page {
		padding-top: var(--topbar-h);
		min-height: 100vh;
	}
	.skip {
		position: absolute;
		left: -999px;
		top: 0.5rem;
		z-index: 100;
		background: var(--bg-3);
		color: var(--gold-bright);
		padding: 0.5rem 0.9rem;
		border-radius: 8px;
		border: 1px solid var(--line);
	}
	.skip:focus {
		left: 0.5rem;
	}
</style>
