<script lang="ts" generics="T extends string | number">
	let {
		value = $bindable(),
		options,
		label = '',
		onchange
	}: {
		value: T;
		options: { value: T; label: string }[];
		label?: string;
		onchange?: (v: T) => void;
	} = $props();
</script>

<div class="seg ui" role="radiogroup" aria-label={label}>
	{#each options as o (o.value)}
		<button
			role="radio"
			aria-checked={value === o.value}
			class:on={value === o.value}
			onclick={() => {
				value = o.value;
				onchange?.(o.value);
			}}>{o.label}</button
		>
	{/each}
</div>

<style>
	.seg {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 2px;
		padding: 3px;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.04);
		border: 1px solid var(--line-faint);
	}
	button {
		border: 0;
		background: transparent;
		color: var(--ink-dim);
		font-size: 0.76rem;
		letter-spacing: 0.03em;
		padding: 0.38rem 0.75rem;
		border-radius: 7px;
		cursor: pointer;
		transition: all 0.18s var(--ease);
		white-space: nowrap;
	}
	button:hover {
		color: var(--ink-bright);
		background: rgba(255, 255, 255, 0.05);
	}
	button.on {
		color: #1a1206;
		background: linear-gradient(180deg, #f6dca0, #d2a95f);
		box-shadow: 0 2px 10px -2px rgba(216, 178, 110, 0.6);
		font-weight: 600;
	}
</style>
