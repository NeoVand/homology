<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title = '',
		level = 1,
		id,
		head,
		hint,
		solution,
		children
	}: {
		title?: string;
		/** 1 = warm-up, 2 = practice, 3 = challenge */
		level?: 1 | 2 | 3;
		id?: string;
		head?: Snippet;
		hint?: Snippet;
		solution?: Snippet;
		children: Snippet;
	} = $props();

	const levelName = $derived(['', 'Warm-up', 'Practice', 'Challenge'][level]);
</script>

<aside class="exercise" {id}>
	<div class="x-head ui">
		<span class="badge">Exercise</span>
		<span class="lvl" title={levelName} aria-label={levelName}>
			{#each [1, 2, 3] as i (i)}
				<span class="pip" class:on={i <= level}></span>
			{/each}
		</span>
		{#if head || title}
			<span class="title">{#if head}{@render head()}{:else}{title}{/if}</span>
		{/if}
	</div>
	<div class="x-body">
		{@render children()}
	</div>
	{#if hint}
		<details class="reveal hint">
			<summary class="ui"><span>Hint</span></summary>
			<div class="r-body">{@render hint()}</div>
		</details>
	{/if}
	{#if solution}
		<details class="reveal sol">
			<summary class="ui"><span>Solution</span></summary>
			<div class="r-body">{@render solution()}</div>
		</details>
	{/if}
</aside>

<style>
	.exercise {
		margin: 1.8rem 0;
		padding: 1rem 1.3rem 0.6rem;
		border-radius: var(--radius-sm);
		border: 1px dashed rgba(132, 217, 162, 0.35);
		background: linear-gradient(180deg, rgba(132, 217, 162, 0.06), rgba(132, 217, 162, 0.015));
	}
	.x-head {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.3rem 0.7rem;
		margin-bottom: 0.5rem;
	}
	.badge {
		font-size: 0.72rem;
		font-weight: 650;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--green);
	}
	.lvl {
		display: inline-flex;
		gap: 3px;
	}
	.pip {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		border: 1px solid rgba(132, 217, 162, 0.6);
	}
	.pip.on {
		background: var(--green);
		box-shadow: 0 0 6px rgba(132, 217, 162, 0.6);
	}
	.title {
		font-family: var(--font-elegant);
		font-size: 1.15rem;
		font-weight: 600;
		color: var(--ink-bright);
	}
	.x-body :global(> p:last-child) {
		margin-bottom: 0.7em;
	}
	.reveal {
		border-top: 1px solid rgba(132, 217, 162, 0.16);
		padding: 0.15rem 0;
	}
	summary {
		cursor: pointer;
		list-style: none;
		font-size: 0.78rem;
		font-weight: 600;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--green);
		padding: 0.5rem 0;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		user-select: none;
	}
	summary::-webkit-details-marker {
		display: none;
	}
	summary::before {
		content: '';
		width: 0.5rem;
		height: 0.5rem;
		border-right: 1.5px solid currentColor;
		border-bottom: 1.5px solid currentColor;
		transform: rotate(-45deg);
		transition: transform 0.2s var(--ease);
	}
	details[open] > summary::before {
		transform: rotate(45deg);
	}
	.hint summary {
		color: var(--teal);
	}
	summary:hover span {
		text-decoration: underline;
		text-underline-offset: 0.2em;
	}
	.r-body {
		padding: 0.2rem 0 0.6rem 1rem;
		border-left: 1px solid rgba(132, 217, 162, 0.25);
		margin-left: 0.2rem;
		font-size: 0.97em;
	}
	.r-body :global(> p:last-child) {
		margin-bottom: 0.3em;
	}
</style>
