<script lang="ts">
	// A media-style control for figures that morph from one state to another:
	// play/pause, and a scrub bar with the two end states named at its ends.
	// It owns the animation, so a figure only binds `value`.
	import { onDestroy } from 'svelte';
	import Icon from './Icon.svelte';
	import { PauseIcon, PlayIcon, ResetIcon } from '$lib/icons';

	let {
		value = $bindable(0),
		min = 0,
		max = 1,
		/** seconds for a full run from min to max */
		duration = 3,
		/** what the figure shows at min and at max, e.g. "interval" and "circle" */
		from = '',
		to = '',
		/** what is being played, for screen readers */
		label,
		/** play forwards then backwards forever, instead of stopping at the end */
		loop = false,
		playing = $bindable(false)
	}: {
		value?: number;
		min?: number;
		max?: number;
		duration?: number;
		from?: string;
		to?: string;
		label: string;
		loop?: boolean;
		playing?: boolean;
	} = $props();

	let raf = 0;
	let dir = 1;
	const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
	const atEnd = $derived(value >= max - 1e-6);
	const pct = $derived(((value - min) / (max - min || 1)) * 100);

	function stop() {
		if (raf) cancelAnimationFrame(raf);
		raf = 0;
		playing = false;
	}
	function run() {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			value = atEnd ? min : max;
			return;
		}
		const span = max - min;
		let a = (value - min) / span; // eased position 0..1
		if (!loop && atEnd) a = 0;
		dir = loop ? dir : 1;
		// invert the easing so playback continues from the current position
		let x = a < 0.5 ? Math.sqrt(a / 2) : 1 - Math.sqrt((1 - a) / 2);
		if (dir < 0) x = 1 - x;
		playing = true;
		let last = performance.now();
		const tick = (now: number) => {
			x += (now - last) / 1000 / duration;
			last = now;
			if (x >= 1) {
				if (loop) {
					x -= 1;
					dir = -dir;
				} else {
					value = max;
					stop();
					return;
				}
			}
			const e = ease(x);
			value = min + span * (dir > 0 ? e : 1 - e);
			raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
	}
	function toggle() {
		if (playing) stop();
		else run();
	}
	onDestroy(stop);
</script>

<div class="timeline ui" role="group" aria-label={label}>
	<button type="button" class="play" aria-label={playing ? 'Pause' : atEnd && !loop ? 'Play again' : 'Play'} onclick={toggle}>
		<Icon icon={playing ? PauseIcon : atEnd && !loop ? ResetIcon : PlayIcon} size={15} stroke={1.8} />
	</button>
	{#if from}<span class="end">{from}</span>{/if}
	<input
		type="range"
		{min}
		{max}
		step="any"
		bind:value
		oninput={() => playing && stop()}
		aria-label="{label}: scrub"
		aria-valuetext={from && to ? `${Math.round(pct)}% of the way from ${from} to ${to}` : `${Math.round(pct)}%`}
		style="--p:{pct}%"
	/>
	{#if to}<span class="end">{to}</span>{/if}
</div>

<style>
	.timeline {
		--thumb: 13px;
		display: flex;
		align-items: center;
		gap: 0.7rem;
		flex: 1 1 18rem;
		min-width: min(18rem, 100%);
	}
	.play {
		display: grid;
		place-items: center;
		flex: none;
		width: 2rem;
		height: 2rem;
		padding: 0;
		border-radius: 50%;
		border: 1px solid rgba(216, 178, 110, 0.6);
		background: rgba(216, 178, 110, 0.1);
		color: var(--gold-bright);
		cursor: pointer;
		transition: background 0.15s var(--ease);
	}
	.play:hover {
		background: rgba(216, 178, 110, 0.2);
	}
	.end {
		flex: none;
		font-size: 0.72rem;
		letter-spacing: 0.03em;
		color: var(--ink-faint);
		white-space: nowrap;
	}
	input[type='range'] {
		-webkit-appearance: none;
		appearance: none;
		flex: 1;
		min-width: 4rem;
		height: 2rem;
		margin: 0;
		background: transparent;
		cursor: pointer;
		touch-action: pan-y;
	}
	input[type='range']:focus-visible {
		outline: none;
	}
	input[type='range']::-webkit-slider-runnable-track {
		height: 2px;
		border-radius: 2px;
		background: linear-gradient(90deg, var(--gold-bright) var(--p), rgba(235, 229, 213, 0.16) var(--p));
	}
	input[type='range']::-moz-range-track {
		height: 2px;
		background: rgba(235, 229, 213, 0.16);
	}
	input[type='range']::-moz-range-progress {
		height: 2px;
		background: var(--gold-bright);
	}
	input[type='range']::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: var(--thumb);
		height: var(--thumb);
		margin-top: calc(1px - var(--thumb) / 2);
		border-radius: 50%;
		border: 0;
		background: var(--gold-bright);
		box-shadow: 0 0 0 3px #0a0f1d;
	}
	input[type='range']::-moz-range-thumb {
		width: var(--thumb);
		height: var(--thumb);
		border-radius: 50%;
		border: 0;
		background: var(--gold-bright);
		box-shadow: 0 0 0 3px #0a0f1d;
	}
	input:focus-visible::-webkit-slider-thumb {
		outline: 2px solid var(--gold-bright);
		outline-offset: 3px;
	}
	input:focus-visible::-moz-range-thumb {
		outline: 2px solid var(--gold-bright);
		outline-offset: 3px;
	}
	@media (pointer: coarse) {
		.timeline {
			--thumb: 18px;
		}
		.play {
			width: 2.5rem;
			height: 2.5rem;
		}
		input[type='range'] {
			height: 2.5rem;
		}
	}
</style>
