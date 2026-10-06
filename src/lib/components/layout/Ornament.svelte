<script lang="ts">
	// A small gold flourish used as a divider.
	let { width = 220, class: cls = '' }: { width?: number; class?: string } = $props();
	const uid = $props.id();
</script>

<svg class="ornament {cls}" viewBox="0 0 220 18" {width} height={(width * 18) / 220} aria-hidden="true">
	<defs>
		<linearGradient id="{uid}-l" x1="0" x2="1">
			<stop offset="0" stop-color="#d8b26e" stop-opacity="0" />
			<stop offset="1" stop-color="#d8b26e" stop-opacity="0.9" />
		</linearGradient>
		<linearGradient id="{uid}-r" x1="1" x2="0">
			<stop offset="0" stop-color="#d8b26e" stop-opacity="0" />
			<stop offset="1" stop-color="#d8b26e" stop-opacity="0.9" />
		</linearGradient>
	</defs>
	<path d="M4 9 H86" stroke="url(#{uid}-l)" stroke-width="1" />
	<path d="M134 9 H216" stroke="url(#{uid}-r)" stroke-width="1" />
	<path d="M90 9 q6 -6 12 0 q-6 6 -12 0z" fill="none" stroke="#d8b26e" stroke-width="0.9" />
	<path d="M130 9 q-6 -6 -12 0 q6 6 12 0z" fill="none" stroke="#d8b26e" stroke-width="0.9" />
	<path d="M110 2.5 L116.5 9 L110 15.5 L103.5 9 Z" fill="#f2d08f" />
	<circle cx="110" cy="9" r="1.6" fill="#fff4da" />
</svg>

<style>
	.ornament {
		display: block;
		filter: drop-shadow(0 0 6px rgba(242, 208, 143, 0.35));
	}
</style>
