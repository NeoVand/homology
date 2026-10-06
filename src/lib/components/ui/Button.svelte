<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from './Icon.svelte';

	type IconNode = readonly (readonly [string, Readonly<Record<string, string | number>>])[];

	let {
		variant = 'ghost',
		onclick,
		disabled = false,
		title,
		active = false,
		icon,
		children
	}: {
		/** ghost: outlined (the default) · gold: the one main action · subtle: text only */
		variant?: 'ghost' | 'gold' | 'subtle';
		onclick?: (e: MouseEvent) => void;
		disabled?: boolean;
		title?: string;
		/** pressed state, for buttons that switch something on */
		active?: boolean;
		/** an icon from $lib/icons, drawn before the label */
		icon?: IconNode;
		children: Snippet;
	} = $props();
</script>

<button type="button" class="btn ui {variant}" class:active {onclick} {disabled} {title}
	>{#if icon}<Icon {icon} size={15} stroke={1.7} />{/if}{@render children()}</button
>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.4rem;
		min-height: 2rem;
		padding: 0.3rem 0.8rem;
		border-radius: 9px;
		font-size: 0.76rem;
		letter-spacing: 0.03em;
		line-height: 1.2;
		white-space: nowrap;
		cursor: pointer;
		transition:
			color 0.15s var(--ease),
			background 0.15s var(--ease),
			border-color 0.15s var(--ease),
			box-shadow 0.15s var(--ease),
			filter 0.15s var(--ease);
	}
	.btn:disabled {
		opacity: 0.38;
		cursor: not-allowed;
	}
	.ghost {
		border: 1px solid rgba(216, 178, 110, 0.32);
		background: transparent;
		color: var(--gold-pale);
	}
	.ghost:hover:not(:disabled) {
		border-color: rgba(216, 178, 110, 0.62);
		background: rgba(216, 178, 110, 0.08);
	}
	.ghost.active {
		color: #fbe8c0;
		border-color: rgba(216, 178, 110, 0.7);
		background: rgba(216, 178, 110, 0.16);
	}
	.gold {
		border: 1px solid #e9c780;
		color: #1b1407;
		font-weight: 650;
		background: linear-gradient(180deg, #f5dba2, #d4aa62);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
	}
	.gold:hover:not(:disabled) {
		filter: brightness(1.07);
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
	@media (pointer: coarse) {
		.btn {
			min-height: 2.5rem;
		}
	}
</style>
