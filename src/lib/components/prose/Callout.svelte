<script lang="ts" module>
	export type CalloutKind =
		| 'definition'
		| 'theorem'
		| 'proposition'
		| 'lemma'
		| 'corollary'
		| 'example'
		| 'intuition'
		| 'key'
		| 'warning'
		| 'remark'
		| 'history'
		| 'recap'
		| 'question'
		| 'notation'
		| 'ahead'
		| 'proof';

	export const calloutMeta: Record<CalloutKind, { label: string; color: string; icon: string }> = {
		definition: { label: 'Definition', color: 'var(--gold)', icon: 'def' },
		theorem: { label: 'Theorem', color: 'var(--violet)', icon: 'thm' },
		proposition: { label: 'Proposition', color: 'var(--violet)', icon: 'thm' },
		lemma: { label: 'Lemma', color: 'var(--violet)', icon: 'thm' },
		corollary: { label: 'Corollary', color: 'var(--violet)', icon: 'thm' },
		example: { label: 'Example', color: 'var(--blue)', icon: 'ex' },
		intuition: { label: 'Intuition', color: 'var(--teal)', icon: 'idea' },
		key: { label: 'Key idea', color: 'var(--gold-bright)', icon: 'key' },
		warning: { label: 'Careful', color: 'var(--amber)', icon: 'warn' },
		remark: { label: 'Remark', color: 'var(--ink-faint)', icon: 'rem' },
		history: { label: 'A little history', color: '#c9a77a', icon: 'hist' },
		recap: { label: 'Recap', color: 'var(--gold)', icon: 'recap' },
		question: { label: 'Pause and ponder', color: 'var(--rose)', icon: 'q' },
		notation: { label: 'Notation', color: 'var(--blue)', icon: 'not' },
		ahead: { label: 'Where this is going', color: 'var(--teal)', icon: 'ahead' },
		proof: { label: 'Proof', color: 'var(--ink-dim)', icon: 'proof' }
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		kind = 'remark',
		title = '',
		label,
		head,
		id,
		children
	}: {
		kind?: CalloutKind;
		/** plain-text title (use the `head` snippet if the title contains math) */
		title?: string;
		/** override the label, e.g. "Theorem (Euler)" */
		label?: string;
		head?: Snippet;
		id?: string;
		children: Snippet;
	} = $props();

	const meta = $derived(calloutMeta[kind]);
</script>

<aside class="callout k-{kind}" style="--c:{meta.color}" {id}>
	<div class="c-head ui">
		<span class="icon" aria-hidden="true">
			{#if meta.icon === 'def'}
				<svg viewBox="0 0 20 20"><path d="M10 2 L17 10 L10 18 L3 10 Z" /></svg>
			{:else if meta.icon === 'thm'}
				<svg viewBox="0 0 20 20"
					><path d="M10 2.5l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 7.8l5-.7z" /></svg
				>
			{:else if meta.icon === 'ex'}
				<svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="6.5" /><circle cx="10" cy="10" r="2" class="fill" /></svg>
			{:else if meta.icon === 'idea'}
				<svg viewBox="0 0 20 20"
					><path d="M10 2.5a5.2 5.2 0 0 0-3 9.5c.6.5 1 1.2 1 2V15h4v-1c0-.8.4-1.5 1-2a5.2 5.2 0 0 0-3-9.5z" /><path
						d="M8 17.5h4"
					/></svg
				>
			{:else if meta.icon === 'key'}
				<svg viewBox="0 0 20 20"
					><circle cx="10" cy="10" r="7" /><path d="M10 5.5v9M5.5 10h9" /></svg
				>
			{:else if meta.icon === 'warn'}
				<svg viewBox="0 0 20 20"><path d="M10 3L18 17H2z" /><path d="M10 8.5v4M10 14.6v.2" /></svg>
			{:else if meta.icon === 'hist'}
				<svg viewBox="0 0 20 20"
					><path d="M4 3.5h10a2 2 0 0 1 2 2v11H6a2 2 0 0 1-2-2z" /><path d="M7 7.5h6M7 10.5h6M7 13.5h4" /></svg
				>
			{:else if meta.icon === 'recap'}
				<svg viewBox="0 0 20 20"><path d="M4 6h12M4 10h12M4 14h8" /></svg>
			{:else if meta.icon === 'q'}
				<svg viewBox="0 0 20 20"
					><circle cx="10" cy="10" r="7.5" /><path d="M7.8 8a2.3 2.3 0 1 1 3.2 2.1c-.6.3-1 .8-1 1.5v.6M10 14.6v.2" /></svg
				>
			{:else if meta.icon === 'ahead'}
				<svg viewBox="0 0 20 20"><path d="M3 10h12M11 5.5L15.5 10 11 14.5" /></svg>
			{:else if meta.icon === 'not'}
				<svg viewBox="0 0 20 20"><path d="M4 15l4-10 4 10M5.6 11h4.8M13 9h4M13 13h4" /></svg>
			{:else}
				<svg viewBox="0 0 20 20"><path d="M5 10h10" /></svg>
			{/if}
		</span>
		<span class="label">{label ?? meta.label}</span>
		{#if head || title}
			<span class="title">
				{#if head}{@render head()}{:else}{title}{/if}
			</span>
		{/if}
	</div>
	<div class="c-body">
		{@render children()}
	</div>
</aside>

<style>
	.callout {
		position: relative;
		margin: 1.8rem 0;
		padding: 1.05rem 1.3rem 0.35rem 1.35rem;
		border-radius: var(--radius-sm);
		background:
			linear-gradient(90deg, color-mix(in srgb, var(--c) 9%, transparent), transparent 55%),
			rgba(10, 15, 29, 0.72);
		border: 1px solid color-mix(in srgb, var(--c) 26%, transparent);
		box-shadow: 0 10px 40px -24px rgba(0, 0, 0, 0.9);
	}
	.callout::before {
		content: '';
		position: absolute;
		left: -1px;
		top: 0.9rem;
		bottom: 0.9rem;
		width: 2px;
		border-radius: 2px;
		background: var(--c);
		box-shadow: 0 0 12px color-mix(in srgb, var(--c) 60%, transparent);
	}
	.c-head {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 0.25rem 0.6rem;
		margin-bottom: 0.55rem;
	}
	.icon {
		align-self: center;
		width: 1.05rem;
		height: 1.05rem;
		flex: none;
	}
	.icon svg {
		width: 100%;
		height: 100%;
		fill: none;
		stroke: var(--c);
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.icon .fill {
		fill: var(--c);
	}
	.k-definition .icon svg path {
		fill: color-mix(in srgb, var(--c) 35%, transparent);
	}
	.label {
		font-size: 0.72rem;
		font-weight: 650;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--c);
	}
	.title {
		font-family: var(--font-elegant);
		font-size: 1.18rem;
		font-weight: 600;
		color: var(--ink-bright);
		letter-spacing: 0.005em;
	}
	.c-body {
		font-size: 0.985em;
	}
	.c-body :global(> p:last-child),
	.c-body :global(> ul:last-child),
	.c-body :global(> ol:last-child) {
		margin-bottom: 0.85em;
	}
	.c-body :global(.math-block) {
		margin: 0.7em 0 0.9em;
	}

	/* theorem-like statements: slightly more formal */
	.k-theorem .c-body,
	.k-proposition .c-body,
	.k-lemma .c-body,
	.k-corollary .c-body {
		font-style: italic;
	}
	.k-theorem .c-body :global(.katex),
	.k-proposition .c-body :global(.katex),
	.k-lemma .c-body :global(.katex),
	.k-corollary .c-body :global(.katex) {
		font-style: normal;
	}

	.k-key {
		background:
			radial-gradient(120% 140% at 0% 0%, rgba(242, 208, 143, 0.13), transparent 60%),
			rgba(12, 17, 32, 0.8);
		border-color: rgba(242, 208, 143, 0.42);
	}
	.k-key .c-body {
		font-size: 1.04em;
		color: var(--ink-bright);
	}

	.k-history {
		background:
			linear-gradient(180deg, rgba(201, 167, 122, 0.08), rgba(201, 167, 122, 0.02)),
			rgba(14, 14, 20, 0.75);
	}
	.k-history .c-body {
		font-family: var(--font-elegant);
		font-size: 1.1em;
		line-height: 1.6;
		color: #e2d6bf;
	}

	.k-remark,
	.k-proof {
		background: rgba(10, 15, 29, 0.45);
		border-color: rgba(255, 255, 255, 0.06);
	}
	.k-proof::before {
		display: none;
	}
	.k-proof .c-body :global(> :last-child::after) {
		content: '∎';
		float: right;
		color: var(--gold);
		margin-left: 1em;
	}
</style>
