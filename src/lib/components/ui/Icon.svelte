<script lang="ts">
	// An icon from the Hugeicons free set (MIT), rendered straight into the markup
	// so that it is present in the prerendered HTML (no flash while scripts load).
	// Import icons from '$lib/icons'.
	type IconNode = readonly (readonly [string, Readonly<Record<string, string | number>>])[];

	let {
		icon,
		size = 18,
		stroke = 1.5,
		label,
		class: cls = ''
	}: {
		icon: IconNode;
		size?: number | string;
		/** stroke width in icon units (the set is drawn at 1.5) */
		stroke?: number;
		/** accessible name; omit for decorative icons */
		label?: string;
		class?: string;
	} = $props();

	const KEBAB: Record<string, string> = {
		strokeWidth: 'stroke-width',
		strokeLinecap: 'stroke-linecap',
		strokeLinejoin: 'stroke-linejoin',
		strokeMiterlimit: 'stroke-miterlimit',
		fillRule: 'fill-rule',
		clipRule: 'clip-rule',
		fillOpacity: 'fill-opacity',
		strokeOpacity: 'stroke-opacity'
	};

	const nodes = $derived(
		icon.map(([tag, attrs]) => {
			const out: Record<string, string | number> = {};
			for (const [k, v] of Object.entries(attrs)) {
				if (k === 'key') continue;
				out[KEBAB[k] ?? k] = k === 'strokeWidth' ? stroke : v;
			}
			return { tag, attrs: out };
		})
	);
</script>

<svg
	class="icon {cls}"
	viewBox="0 0 24 24"
	width={size}
	height={size}
	fill="none"
	role={label ? 'img' : undefined}
	aria-label={label}
	aria-hidden={label ? undefined : 'true'}
	focusable="false"
>
	{#each nodes as n, i (i)}
		<svelte:element this={n.tag} xmlns="http://www.w3.org/2000/svg" {...n.attrs} />
	{/each}
</svg>

<style>
	.icon {
		display: inline-block;
		flex: none;
		vertical-align: middle;
	}
</style>
