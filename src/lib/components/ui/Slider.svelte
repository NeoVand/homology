<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		value = $bindable(0),
		min = 0,
		max = 1,
		step = 0.01,
		label = '',
		format = (v: number) => (Math.abs(v) >= 100 || Number.isInteger(v) ? String(v) : v.toFixed(2)),
		labelSnippet,
		oninput
	}: {
		value?: number;
		min?: number;
		max?: number;
		step?: number;
		label?: string;
		format?: (v: number) => string;
		labelSnippet?: Snippet;
		oninput?: (v: number) => void;
	} = $props();

	const pct = $derived(((value - min) / (max - min || 1)) * 100);
</script>

<label class="slider ui">
	<span class="top">
		<span class="lbl">{#if labelSnippet}{@render labelSnippet()}{:else}{label}{/if}</span>
		<span class="val nums">{format(value)}</span>
	</span>
	<input
		type="range"
		{min}
		{max}
		{step}
		bind:value
		oninput={() => oninput?.(value)}
		style="--p:{pct}%"
		aria-label={label}
	/>
</label>

<style>
	.slider {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		min-width: 9rem;
		flex: 1;
	}
	.top {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: 0.8rem;
		font-size: 0.76rem;
	}
	.lbl {
		color: var(--ink-dim);
		letter-spacing: 0.04em;
	}
	.val {
		color: var(--gold-bright);
		font-weight: 600;
	}
	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		width: 100%;
		height: 22px;
		background: transparent;
		cursor: pointer;
		margin: 0;
		touch-action: pan-y;
	}
	input[type='range']::-webkit-slider-runnable-track {
		height: 4px;
		border-radius: 4px;
		background: linear-gradient(90deg, var(--gold) 0 var(--p), rgba(255, 255, 255, 0.1) var(--p) 100%);
	}
	input[type='range']::-moz-range-track {
		height: 4px;
		border-radius: 4px;
		background: rgba(255, 255, 255, 0.1);
	}
	input[type='range']::-moz-range-progress {
		height: 4px;
		border-radius: 4px;
		background: var(--gold);
	}
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 16px;
		height: 16px;
		margin-top: -6px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #fff5dc, #e5be78 55%, #a5803f);
		border: 0;
		box-shadow:
			0 0 0 4px rgba(216, 178, 110, 0.18),
			0 2px 6px rgba(0, 0, 0, 0.6);
		transition: box-shadow 0.15s;
	}
	input[type='range']::-moz-range-thumb {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: radial-gradient(circle at 35% 35%, #fff5dc, #e5be78 55%, #a5803f);
		border: 0;
		box-shadow:
			0 0 0 4px rgba(216, 178, 110, 0.18),
			0 2px 6px rgba(0, 0, 0, 0.6);
	}
	input[type='range']:hover::-webkit-slider-thumb,
	input[type='range']:focus-visible::-webkit-slider-thumb {
		box-shadow:
			0 0 0 6px rgba(216, 178, 110, 0.28),
			0 2px 6px rgba(0, 0, 0, 0.6);
	}
	input[type='range']:focus-visible {
		outline: none;
	}
</style>
