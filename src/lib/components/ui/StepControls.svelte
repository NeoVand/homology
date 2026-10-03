<script lang="ts">
	// Prev / next / play for step-by-step figures.
	import { onDestroy } from 'svelte';
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
	<button class="b" aria-label="Previous step" disabled={step === 0} onclick={() => (stop(), step--)}>‹</button>
	<button class="b play" aria-label={playing ? 'Pause' : 'Play'} onclick={play}>
		{#if playing}
			<svg viewBox="0 0 20 20" width="12" height="12"><path d="M6 4h3v12H6zM11 4h3v12h-3z" fill="currentColor" /></svg>
		{:else}
			<svg viewBox="0 0 20 20" width="12" height="12"><path d="M6 4l10 6-10 6z" fill="currentColor" /></svg>
		{/if}
	</button>
	<button class="b" aria-label="Next step" disabled={step >= count - 1} onclick={() => (stop(), step++)}>›</button>
	<div class="dots" role="tablist">
		{#each Array(count) as _, i (i)}
			<button
				class="dot"
				class:on={i === step}
				class:done={i < step}
				role="tab"
				aria-selected={i === step}
				aria-label={labels[i] ?? `Step ${i + 1}`}
				onclick={() => (stop(), (step = i))}
			></button>
		{/each}
	</div>
	{#if labels[step]}
		<span class="lbl">{labels[step]}</span>
	{/if}
</div>

<style>
	.steps {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.b {
		display: grid;
		place-items: center;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 1px solid var(--line);
		background: rgba(216, 178, 110, 0.05);
		color: var(--gold-bright);
		cursor: pointer;
		font-size: 1.1rem;
		line-height: 1;
		transition: all 0.18s var(--ease);
	}
	.b:hover:not(:disabled) {
		background: rgba(216, 178, 110, 0.15);
		border-color: var(--gold);
	}
	.b:disabled {
		opacity: 0.35;
		cursor: default;
	}
	.play {
		background: linear-gradient(180deg, #f6dca0, #d2a95f);
		color: #1a1206;
		border: 0;
	}
	.dots {
		display: flex;
		gap: 5px;
		margin: 0 0.4rem;
	}
	.dot {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		padding: 0;
		border: 1px solid var(--gold-deep);
		background: transparent;
		cursor: pointer;
	}
	.dot.done {
		background: var(--gold-deep);
	}
	.dot.on {
		background: var(--gold-bright);
		border-color: var(--gold-bright);
		box-shadow: 0 0 8px var(--gold-glow);
	}
	.lbl {
		font-size: 0.8rem;
		color: var(--ink-dim);
	}
</style>
