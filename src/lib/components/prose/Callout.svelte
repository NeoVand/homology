<script lang="ts" module>
	import {
		AheadIcon,
		DefinitionIcon,
		ExampleIcon,
		HistoryIcon,
		IntuitionIcon,
		KeyIdeaIcon,
		NotationIcon,
		QuestionIcon,
		RecapIcon,
		RemarkIcon,
		TheoremIcon,
		WarningIcon
	} from '$lib/icons';

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

	type IconNode = typeof RemarkIcon;

	export const calloutMeta: Record<CalloutKind, { label: string; color: string; icon: IconNode | null }> = {
		definition: { label: 'Definition', color: 'var(--gold)', icon: DefinitionIcon },
		theorem: { label: 'Theorem', color: 'var(--violet)', icon: TheoremIcon },
		proposition: { label: 'Proposition', color: 'var(--violet)', icon: TheoremIcon },
		lemma: { label: 'Lemma', color: 'var(--violet)', icon: TheoremIcon },
		corollary: { label: 'Corollary', color: 'var(--violet)', icon: TheoremIcon },
		example: { label: 'Example', color: 'var(--blue)', icon: ExampleIcon },
		intuition: { label: 'Intuition', color: 'var(--teal)', icon: IntuitionIcon },
		key: { label: 'Key idea', color: 'var(--gold-bright)', icon: KeyIdeaIcon },
		warning: { label: 'Careful', color: 'var(--amber)', icon: WarningIcon },
		remark: { label: 'Remark', color: 'var(--ink-faint)', icon: RemarkIcon },
		history: { label: 'A little history', color: '#c9a77a', icon: HistoryIcon },
		recap: { label: 'Recap', color: 'var(--gold)', icon: RecapIcon },
		question: { label: 'Pause and ponder', color: 'var(--rose)', icon: QuestionIcon },
		notation: { label: 'Notation', color: 'var(--blue)', icon: NotationIcon },
		ahead: { label: 'Where this is going', color: 'var(--teal)', icon: AheadIcon },
		proof: { label: 'Proof', color: 'var(--ink-dim)', icon: null }
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

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
		{#if meta.icon}<Icon icon={meta.icon} size={17} class="c-icon" />{/if}
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
	.c-head :global(.c-icon) {
		align-self: center;
		color: var(--c);
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
