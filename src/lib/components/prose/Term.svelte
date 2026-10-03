<script lang="ts">
	// A glossary term: hover (or tap) to see its definition.
	import type { Snippet } from 'svelte';
	import { loadGlossary, type GlossaryPopEntry } from '$lib/content/glossary-client';
	import { chapterHref, href } from '$lib/util/paths';

	let { t, children }: { t: string; children?: Snippet } = $props();

	let open = $state(false);
	let entry = $state<GlossaryPopEntry | null>(null);
	let missing = $state(false);
	let root: HTMLSpanElement;
	let pop = $state<HTMLSpanElement>();
	let shift = $state(0);
	let below = $state(false);
	let hideTimer: ReturnType<typeof setTimeout> | undefined;

	async function show() {
		clearTimeout(hideTimer);
		open = true;
		if (!entry && !missing) {
			const g = await loadGlossary();
			entry = g[t] ?? null;
			missing = !entry;
		}
		requestAnimationFrame(place);
	}
	function hideSoon() {
		clearTimeout(hideTimer);
		hideTimer = setTimeout(() => (open = false), 160);
	}
	function place() {
		if (!pop || !root) return;
		const r = root.getBoundingClientRect();
		const w = pop.offsetWidth;
		const cx = r.left + r.width / 2;
		const margin = 12;
		const left = cx - w / 2;
		const right = cx + w / 2;
		shift = left < margin ? margin - left : right > window.innerWidth - margin ? window.innerWidth - margin - right : 0;
		below = r.top < pop.offsetHeight + 80;
	}
	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape') open = false;
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (open) open = false;
			else show();
		}
	}
</script>

<span
	class="term"
	bind:this={root}
	role="button"
	tabindex="0"
	aria-expanded={open}
	onpointerenter={(e) => e.pointerType === 'mouse' && show()}
	onpointerleave={(e) => e.pointerType === 'mouse' && hideSoon()}
	onclick={() => (open ? (open = false) : show())}
	onfocus={show}
	onblur={hideSoon}
	onkeydown={onKey}
	>{#if children}{@render children()}{:else}{t}{/if}{#if open}<span
			class="pop ui"
			class:below
			bind:this={pop}
			role="tooltip"
			style="--shift:{shift}px"
			onpointerenter={() => clearTimeout(hideTimer)}
			onpointerleave={hideSoon}
		>
			{#if entry}
				<span class="p-term">{entry.term}</span>
				<span class="p-def">{@html entry.html}</span>
				<span class="p-links">
					{#if entry.num}
						<a href={chapterHref(entry.chapter, entry.anchor)}>Introduced in {entry.num} {entry.title} →</a>
					{/if}
					<a href={href('/glossary/') + '#' + t}>Glossary</a>
				</span>
			{:else if missing}
				<span class="p-def">See the glossary.</span>
			{:else}
				<span class="p-def">…</span>
			{/if}
		</span>{/if}</span
>

<style>
	.term {
		position: relative;
		cursor: help;
		text-decoration: underline dotted;
		text-decoration-color: rgba(244, 215, 156, 0.6);
		text-decoration-thickness: 1.5px;
		text-underline-offset: 0.22em;
		border-radius: 3px;
		transition: background 0.2s var(--ease);
	}
	.term:hover,
	.term[aria-expanded='true'] {
		background: rgba(216, 178, 110, 0.1);
		text-decoration-color: var(--gold-bright);
	}
	.pop {
		position: absolute;
		z-index: 40;
		bottom: calc(100% + 10px);
		left: 50%;
		transform: translateX(calc(-50% + var(--shift)));
		width: min(23rem, 86vw);
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		padding: 0.9rem 1rem 0.8rem;
		background: linear-gradient(180deg, #121a31, #0b1122);
		border: 1px solid var(--line-strong);
		border-radius: 12px;
		box-shadow:
			0 20px 50px -14px rgba(0, 0, 0, 0.95),
			0 0 0 1px rgba(0, 0, 0, 0.4);
		text-align: left;
		font-size: 0.86rem;
		line-height: 1.5;
		color: var(--ink);
		font-style: normal;
		font-weight: 400;
		letter-spacing: 0;
		text-transform: none;
		cursor: default;
		animation: pop-in 0.16s var(--ease);
	}
	.pop.below {
		bottom: auto;
		top: calc(100% + 10px);
	}
	@keyframes pop-in {
		from {
			opacity: 0;
			translate: 0 4px;
		}
	}
	.p-term {
		font-family: var(--font-display);
		font-size: 0.95rem;
		font-weight: 600;
		letter-spacing: 0.05em;
		color: var(--gold-bright);
	}
	.p-def {
		font-family: var(--font-body);
		font-size: 0.98rem;
	}
	.p-links {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.3rem 1rem;
		font-size: 0.74rem;
		padding-top: 0.45rem;
		border-top: 1px solid var(--line-faint);
	}
	.p-links a {
		color: var(--gold);
		text-decoration: none;
	}
	.p-links a:hover {
		color: var(--gold-pale);
		text-decoration: underline;
	}
</style>
