<script lang="ts">
	// A compact integer stepper: label, −, value, +. Touch targets are 32px.
	import type { Snippet } from 'svelte';
	let {
		value = $bindable(0),
		min = -9,
		max = 9,
		label = '',
		labelSnippet,
		color = 'var(--gold-bright)',
		onchange
	}: {
		value?: number;
		min?: number;
		max?: number;
		label?: string;
		labelSnippet?: Snippet;
		color?: string;
		onchange?: (v: number) => void;
	} = $props();

	function set(v: number) {
		const c = Math.max(min, Math.min(max, v));
		if (c !== value) {
			value = c;
			onchange?.(c);
		}
	}
</script>

<div class="stepper ui" role="group" aria-label={label}>
	<span class="lbl">{#if labelSnippet}{@render labelSnippet()}{:else}{label}{/if}</span>
	<button class="b" aria-label="decrease {label}" disabled={value <= min} onclick={() => set(value - 1)}>−</button>
	<span class="v nums" style="color:{color}" aria-live="polite">{value < 0 ? '−' + Math.abs(value) : value}</span>
	<button class="b" aria-label="increase {label}" disabled={value >= max} onclick={() => set(value + 1)}>+</button>
</div>

<style>
	.stepper {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.8rem;
	}
	.lbl {
		color: var(--ink-dim);
		margin-right: 0.15rem;
	}
	.b {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		border: 1px solid var(--line);
		background: rgba(216, 178, 110, 0.05);
		color: var(--gold-bright);
		cursor: pointer;
		font-size: 1rem;
		line-height: 1;
		display: grid;
		place-items: center;
		transition: all 0.18s var(--ease);
	}
	.b:hover:not(:disabled) {
		background: rgba(216, 178, 110, 0.15);
		border-color: var(--gold);
	}
	.b:disabled {
		opacity: 0.3;
		cursor: default;
	}
	.v {
		min-width: 1.8rem;
		text-align: center;
		font-weight: 650;
		font-size: 1rem;
	}
</style>
