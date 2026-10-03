<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		variant = 'ghost',
		onclick,
		disabled = false,
		title,
		active = false,
		children
	}: {
		variant?: 'ghost' | 'gold' | 'subtle';
		onclick?: (e: MouseEvent) => void;
		disabled?: boolean;
		title?: string;
		active?: boolean;
		children: Snippet;
	} = $props();
</script>

<button class="btn ui {variant}" class:active {onclick} {disabled} {title}>{@render children()}</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		font-size: 0.78rem;
		letter-spacing: 0.04em;
		padding: 0.45rem 0.85rem;
		border-radius: 9px;
		cursor: pointer;
		transition: all 0.18s var(--ease);
		white-space: nowrap;
		line-height: 1.2;
	}
	.btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	.ghost {
		background: rgba(216, 178, 110, 0.05);
		border: 1px solid var(--line);
		color: var(--gold-bright);
	}
	.ghost:hover:not(:disabled),
	.ghost.active {
		background: rgba(216, 178, 110, 0.14);
		border-color: var(--gold);
	}
	.gold {
		border: 0;
		color: #1a1206;
		font-weight: 650;
		background: linear-gradient(180deg, #f6dca0, #d2a95f);
		box-shadow: 0 4px 16px -4px rgba(216, 178, 110, 0.6);
	}
	.gold:hover:not(:disabled) {
		filter: brightness(1.08);
	}
	.subtle {
		border: 1px solid transparent;
		background: transparent;
		color: var(--ink-dim);
	}
	.subtle:hover:not(:disabled),
	.subtle.active {
		color: var(--ink-bright);
		background: rgba(255, 255, 255, 0.05);
	}
</style>
