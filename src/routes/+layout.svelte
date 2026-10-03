<script lang="ts">
	import '../app.css';
	import Starfield from '$lib/components/layout/Starfield.svelte';
	import TopBar from '$lib/components/layout/TopBar.svelte';
	import NavDrawer from '$lib/components/layout/NavDrawer.svelte';
	import SearchDialog from '$lib/components/layout/SearchDialog.svelte';

	let { children } = $props();
</script>

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
