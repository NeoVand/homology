<script lang="ts">
	// Previous / play / next for step-by-step figures, with one dot per step.
	import { onDestroy } from 'svelte';
	import Icon from './Icon.svelte';
	import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from '$lib/icons';

	let {
		step = $bindable(0),
		count,
		labels = [],
		interval = 1800,
		loop = false
	}: { step?: number; count: number; labels?: string[]; interval?: number; loop?: boolean } = $props();

	let playing = $state(false);
	let timer: ReturnType<typeof setInterval> | undefined;

	function play() {
		if (playing) return stop();
		playing = true;
		if (step >= count - 1) step = 0;
		timer = setInterval(() => {
			if (step < count - 1) step++;
			else if (loop) step = 0;
			else stop();
		}, interval);
	}
	function stop() {
		playing = false;
		clearInterval(timer);
	}
	onDestroy(stop);
</script>

<div class="steps ui">
	<div class="btns">
		<button type="button" class="b" aria-label="Previous step" disabled={step === 0} onclick={() => (stop(), step--)}>
			<Icon icon={ChevronLeftIcon} size={16} stroke={1.8} />
		</button>
		<button type="button" class="b play" class:on={playing} aria-label={playing ? 'Pause' : 'Play'} onclick={play}>
			<Icon icon={playing ? PauseIcon : PlayIcon} size={15} stroke={1.8} />
		</button>
		<button type="button" class="b" aria-label="Next step" disabled={step >= count - 1} onclick={() => (stop(), step++)}>
			<Icon icon={ChevronRightIcon} size={16} stroke={1.8} />
		</button>
	</div>
	<div class="dots">
		{#each Array(count) as _, i (i)}
			<button
				type="button"
				class="dot"
				class:on={i === step}
				class:done={i < step}
				aria-label={labels[i] ? `Step ${i + 1}: ${labels[i]}` : `Step ${i + 1}`}
				aria-current={i === step ? 'step' : undefined}
				onclick={() => (stop(), (step = i))}
			></button>
		{/each}
	</div>
	{#if labels[step]}
		<span class="lbl" aria-live="polite">{labels[step]}</span>
	{/if}
</div>

<style>
	.steps {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem 0.9rem;
		min-height: 2rem;
	}
	.btns {
		display: flex;
		gap: 0.3rem;
	}
	.b {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		padding: 0;
		border-radius: 50%;
		border: 1px solid rgba(216, 178, 110, 0.32);
		background: transparent;
		color: var(--gold-pale);
		cursor: pointer;
		transition:
			background 0.15s var(--ease),
			border-color 0.15s var(--ease);
	}
	.b:hover:not(:disabled) {
		background: rgba(216, 178, 110, 0.1);
		border-color: rgba(216, 178, 110, 0.65);
	}
	.b:disabled {
		opacity: 0.32;
		cursor: default;
	}
	.play {
		border-color: rgba(216, 178, 110, 0.7);
		color: var(--gold-bright);
	}
	.play.on {
		background: rgba(216, 178, 110, 0.16);
	}
	.dots {
		display: flex;
		align-items: center;
	}
	/* 8px dots in 20px hit areas */
	.dot {
		position: relative;
		width: 1.25rem;
		height: 1.25rem;
		padding: 0;
		border: 0;
		background: transparent;
		cursor: pointer;
	}
	.dot::after {
		content: '';
		position: absolute;
		inset: 50% auto auto 50%;
		width: 7px;
		height: 7px;
		margin: -3.5px 0 0 -3.5px;
		border-radius: 50%;
		border: 1px solid rgba(216, 178, 110, 0.55);
		transition:
			background 0.15s var(--ease),
			transform 0.15s var(--ease);
	}
	.dot:hover::after {
		transform: scale(1.25);
	}
	.dot.done::after {
		background: rgba(216, 178, 110, 0.55);
		border-color: transparent;
	}
	.dot.on::after {
		background: var(--gold-bright);
		border-color: var(--gold-bright);
		transform: scale(1.2);
	}
	.lbl {
		font-size: 0.8rem;
		color: var(--ink-dim);
	}
	@media (pointer: coarse) {
		.b {
			width: 2.5rem;
			height: 2.5rem;
		}
		.dot {
			width: 1.6rem;
			height: 1.6rem;
		}
	}
</style>
