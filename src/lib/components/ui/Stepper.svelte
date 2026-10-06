<script lang="ts">
	// A compact integer stepper: label, −, value, +. For small whole numbers
	// this is clearer than a slider: every value is one deliberate press away.
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';
	import { MinusIcon, PlusIcon } from '$lib/icons';

	let {
		value = $bindable(0),
		min = -9,
		max = 9,
		label = '',
		labelSnippet,
		color = 'var(--gold-bright)',
		format = (v: number) => (v < 0 ? '−' + Math.abs(v) : String(v)),
		onchange
	}: {
		value?: number;
		min?: number;
		max?: number;
		label?: string;
		labelSnippet?: Snippet;
		color?: string;
		format?: (v: number) => string;
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

<div class="stepper ui" role="group" aria-label={label || undefined}>
	<span class="lbl">{#if labelSnippet}{@render labelSnippet()}{:else}{label}{/if}</span>
	<span class="box">
		<button type="button" class="b" aria-label="Decrease {label}" disabled={value <= min} onclick={() => set(value - 1)}>
			<Icon icon={MinusIcon} size={14} stroke={1.8} />
		</button>
		<span class="v nums" style="color:{color}" aria-live="polite">{format(value)}</span>
		<button type="button" class="b" aria-label="Increase {label}" disabled={value >= max} onclick={() => set(value + 1)}>
			<Icon icon={PlusIcon} size={14} stroke={1.8} />
		</button>
	</span>
</div>

<style>
	.stepper {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		min-height: 2rem;
		font-size: 0.76rem;
	}
	.lbl {
		color: var(--ink-dim);
		letter-spacing: 0.02em;
	}
	.lbl :global(.katex) {
		font-size: 1.1em;
	}
	.box {
		display: inline-flex;
		align-items: center;
		padding: 2px;
		border-radius: 10px;
		border: 1px solid var(--line-faint);
		background: rgba(255, 255, 255, 0.025);
	}
	.b {
		display: grid;
		place-items: center;
		width: 1.75rem;
		height: 1.75rem;
		padding: 0;
		border: 0;
		border-radius: 8px;
		background: transparent;
		color: var(--gold-pale);
		cursor: pointer;
		transition: background 0.15s var(--ease);
	}
	.b:hover:not(:disabled) {
		background: rgba(216, 178, 110, 0.12);
	}
	.b:disabled {
		opacity: 0.3;
		cursor: default;
	}
	.v {
		min-width: 2rem;
		text-align: center;
		font-size: 0.92rem;
		font-weight: 650;
	}
	@media (pointer: coarse) {
		.b {
			width: 2.25rem;
			height: 2.25rem;
		}
	}
</style>
