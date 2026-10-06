<script lang="ts" generics="T extends string | number">
	// A row of mutually exclusive choices (a radio group drawn as a segmented
	// control). Arrow keys move the choice, as in any radio group.
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

	let root: HTMLElement | undefined = $state();

	function choose(v: T) {
		if (v === value) return;
		value = v;
		onchange?.(v);
	}

	function onkeydown(e: KeyboardEvent) {
		const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
		if (!d) return;
		e.preventDefault();
		const i = options.findIndex((o) => o.value === value);
		const next = options[(i + d + options.length) % options.length];
		choose(next.value);
		root?.querySelectorAll<HTMLElement>('[role="radio"]')[options.indexOf(next)]?.focus();
	}
</script>

<div class="seg ui" role="radiogroup" aria-label={label || undefined} bind:this={root}>
	{#each options as o, i (o.value)}
		<button
			type="button"
			role="radio"
			aria-checked={value === o.value}
			tabindex={value === o.value || (i === 0 && !options.some((x) => x.value === value)) ? 0 : -1}
			class:on={value === o.value}
			{onkeydown}
			onclick={() => choose(o.value)}>{o.label}</button
		>
	{/each}
</div>

<style>
	.seg {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 2px;
		padding: 2px;
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.025);
		border: 1px solid var(--line-faint);
	}
	button {
		min-height: 1.75rem;
		padding: 0.25rem 0.7rem;
		border: 0;
		border-radius: 8px;
		background: transparent;
		color: var(--ink-dim);
		font-size: 0.76rem;
		letter-spacing: 0.02em;
		line-height: 1.2;
		white-space: nowrap;
		cursor: pointer;
		transition:
			color 0.15s var(--ease),
			background 0.15s var(--ease),
			box-shadow 0.15s var(--ease);
	}
	button:hover {
		color: var(--ink-bright);
		background: rgba(255, 255, 255, 0.04);
	}
	button.on {
		color: #fbe8c0;
		background: rgba(216, 178, 110, 0.16);
		box-shadow: inset 0 0 0 1px rgba(216, 178, 110, 0.5);
	}
	button:focus-visible {
		outline-offset: 0;
	}
	@media (pointer: coarse) {
		button {
			min-height: 2.25rem;
		}
	}
</style>
