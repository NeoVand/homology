<script lang="ts">
	// A quiet one-line slider: label, a hairline track with a ring thumb, and the
	// value. Discrete sliders with few stops show a tick for every stop.
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
	const stops = $derived.by(() => {
		const n = Math.round((max - min) / step);
		return n >= 2 && n <= 12 && Math.abs(n * step - (max - min)) < 1e-9 ? n : 0;
	});
</script>

<label class="slider ui">
	<span class="lbl">{#if labelSnippet}{@render labelSnippet()}{:else}{label}{/if}</span>
	<span class="rail" style="--p:{pct}%">
		{#if stops}
			<span class="ticks" aria-hidden="true">
				{#each Array(stops + 1) as _, i (i)}
					<i class:past={i / stops <= pct / 100 + 1e-9} style="--i:{i / stops}"></i>
				{/each}
			</span>
		{/if}
		<input
			type="range"
			{min}
			{max}
			{step}
			bind:value
			oninput={() => oninput?.(value)}
			aria-label={label || undefined}
			aria-valuetext={format(value)}
		/>
	</span>
	<span class="val nums">{format(value)}</span>
</label>

<style>
	.slider {
		--thumb: 15px;
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex: 1 1 15rem;
		min-width: min(15rem, 100%);
		min-height: 2rem;
		font-size: 0.76rem;
		cursor: pointer;
	}
	.lbl {
		flex: none;
		max-width: 45%;
		color: var(--ink-dim);
		letter-spacing: 0.02em;
		line-height: 1.3;
	}
	.lbl :global(.katex) {
		font-size: 1.1em;
	}
	.val {
		flex: none;
		min-width: 2.6em;
		text-align: right;
		color: var(--gold-pale);
		font-weight: 600;
		letter-spacing: 0.02em;
	}
	.rail {
		position: relative;
		flex: 1;
		min-width: 5rem;
		display: flex;
		align-items: center;
	}
	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		position: relative;
		width: 100%;
		height: 2rem;
		margin: 0;
		background: transparent;
		cursor: pointer;
		touch-action: pan-y;
	}
	input[type='range']:focus-visible {
		outline: none;
	}
	/* track: gold up to the thumb, a faint hairline after it */
	input[type='range']::-webkit-slider-runnable-track {
		height: 2px;
		border-radius: 2px;
		background: linear-gradient(90deg, #a5803f, var(--gold-bright) var(--p), rgba(235, 229, 213, 0.16) var(--p));
	}
	input[type='range']::-moz-range-track {
		height: 2px;
		border-radius: 2px;
		background: rgba(235, 229, 213, 0.16);
	}
	input[type='range']::-moz-range-progress {
		height: 2px;
		border-radius: 2px;
		background: linear-gradient(90deg, #a5803f, var(--gold-bright));
	}
	/* thumb: a gold bead with a dark ring, so it reads on any figure */
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: var(--thumb);
		height: var(--thumb);
		margin-top: calc(1px - var(--thumb) / 2);
		border-radius: 50%;
		background: var(--gold-bright);
		border: 3px solid #0a0f1d;
		box-shadow:
			0 0 0 1px rgba(242, 208, 143, 0.75),
			0 2px 6px rgba(0, 0, 0, 0.5);
		transition:
			box-shadow 0.15s var(--ease),
			transform 0.15s var(--ease);
	}
	input[type='range']::-moz-range-thumb {
		box-sizing: border-box;
		width: var(--thumb);
		height: var(--thumb);
		border-radius: 50%;
		background: var(--gold-bright);
		border: 3px solid #0a0f1d;
		box-shadow:
			0 0 0 1px rgba(242, 208, 143, 0.75),
			0 2px 6px rgba(0, 0, 0, 0.5);
		transition:
			box-shadow 0.15s var(--ease),
			transform 0.15s var(--ease);
	}
	.slider:hover input::-webkit-slider-thumb,
	input:focus-visible::-webkit-slider-thumb {
		box-shadow:
			0 0 0 1px rgba(242, 208, 143, 0.9),
			0 0 0 6px rgba(242, 208, 143, 0.14),
			0 2px 6px rgba(0, 0, 0, 0.5);
	}
	.slider:hover input::-moz-range-thumb,
	input:focus-visible::-moz-range-thumb {
		box-shadow:
			0 0 0 1px rgba(242, 208, 143, 0.9),
			0 0 0 6px rgba(242, 208, 143, 0.14),
			0 2px 6px rgba(0, 0, 0, 0.5);
	}
	input:active::-webkit-slider-thumb {
		transform: scale(1.12);
	}
	input:active::-moz-range-thumb {
		transform: scale(1.12);
	}
	input:focus-visible::-webkit-slider-thumb {
		outline: 2px solid var(--gold-bright);
		outline-offset: 3px;
	}
	input:focus-visible::-moz-range-thumb {
		outline: 2px solid var(--gold-bright);
		outline-offset: 3px;
	}
	/* one tick per stop, under the track, centred on where the thumb can rest */
	.ticks {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.ticks i {
		position: absolute;
		top: calc(50% + 6px);
		left: calc(var(--thumb) / 2 + (100% - var(--thumb)) * var(--i));
		width: 3px;
		height: 3px;
		margin-left: -1.5px;
		border-radius: 50%;
		background: rgba(235, 229, 213, 0.22);
	}
	.ticks i.past {
		background: rgba(242, 208, 143, 0.7);
	}
	@media (pointer: coarse) {
		.slider {
			--thumb: 20px;
		}
		input[type='range'] {
			height: 2.5rem;
		}
	}
</style>
