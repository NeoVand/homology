<script lang="ts">
	// An inline citation, author–year style: (Hatcher 2002, §2.1).
	//   <Cite k="hatcher2002" />                 → (Hatcher 2002)
	//   <Cite k="hatcher2002" loc="Thm 2.10" />  → (Hatcher 2002, Thm 2.10)
	//   <Cite k="betti1870,poincare1895" />      → (Betti 1870; Poincaré 1895)
	//   <Cite k="poincare1895" text />           → Poincaré (1895)
	// Each name links to the chapter's reference list; with a mouse or the
	// keyboard, a card with the full reference opens on the spot.
	import { authorLabel, authorList, getWork, workLink, type Work } from '$lib/content/bib';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { ArrowRightIcon } from '$lib/icons';

	let { k, loc = '', text = false }: { k: string; loc?: string; text?: boolean } = $props();

	const works: Work[] = $derived(
		k.split(',').map((key) => {
			const w = getWork(key.trim());
			if (!w) throw new Error(`[Cite] unknown bibliography key "${key.trim()}"`);
			return w;
		})
	);

	let open = $state<string | null>(null);
	let hideTimer: ReturnType<typeof setTimeout> | undefined;
	const show = (key: string) => {
		clearTimeout(hideTimer);
		open = key;
	};
	const hideSoon = () => {
		clearTimeout(hideTimer);
		hideTimer = setTimeout(() => (open = null), 160);
	};
	// keep the card inside the window
	function fit(card: HTMLElement) {
		const r = card.getBoundingClientRect();
		const m = 12;
		const dx = r.left < m ? m - r.left : r.right > window.innerWidth - m ? window.innerWidth - m - r.right : 0;
		card.style.setProperty('--dx', `${dx}px`);
		if (r.top < 64) card.classList.add('below');
	}
	const linkLabel = (w: Work) => (w.free ? 'Read it free' : w.url ? 'Publisher’s page' : w.doi ? 'DOI' : 'arXiv');
</script>

{#snippet one(w: Work, last: boolean)}
	<span
		class="c-work"
		role="presentation"
		onpointerenter={(e) => e.pointerType === 'mouse' && show(w.key)}
		onpointerleave={(e) => e.pointerType === 'mouse' && hideSoon()}
		onfocusin={() => show(w.key)}
		onfocusout={hideSoon}
		><a class="c-link" href="#ref-{w.key}"
			>{authorLabel(w)}{#if text}&nbsp;({w.year}{#if loc && last}, {loc}{/if}){:else}&nbsp;{w.year}{/if}</a
		>{#if open === w.key}
			{@const link = workLink(w)}
			<span class="c-card ui" role="note" {@attach fit}>
				<span class="c-who">{authorList(w)} ({w.year})</span>
				<span class="c-title">{w.title}</span>
				{#if w.venue}<span class="c-venue">{w.venue}</span>{/if}
				{#if link}
					<a class="c-out" href={link} target="_blank" rel="noopener noreferrer"
						>{linkLabel(w)}<Icon icon={ArrowRightIcon} size={13} stroke={1.8} /></a
					>
				{/if}
			</span>
		{/if}</span
	>
{/snippet}

<span class="cite"
	>{#if !text}({/if}{#each works as w, i (w.key)}{#if i > 0}; {/if}{@render one(w, i === works.length - 1)}{/each}{#if !text}{#if loc}, {loc}{/if}){/if}</span
>

<style>
	.cite {
		font-size: 0.9em;
		color: var(--ink-dim);
		white-space: normal;
	}
	.c-work {
		position: relative;
		white-space: nowrap;
	}
	.c-link {
		color: inherit;
		text-decoration: underline dotted rgba(216, 178, 110, 0.55);
		text-underline-offset: 0.18em;
	}
	.c-link:hover,
	.c-link:focus-visible {
		color: var(--gold-pale);
	}
	.c-card {
		position: absolute;
		z-index: 40;
		left: 50%;
		bottom: calc(100% + 0.5rem);
		transform: translateX(calc(-50% + var(--dx, 0px)));
		width: min(20rem, 80vw);
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding: 0.75rem 0.9rem 0.8rem;
		border-radius: 10px;
		border: 1px solid var(--line);
		background: rgba(9, 13, 25, 0.97);
		box-shadow: 0 18px 40px -16px rgba(0, 0, 0, 0.9);
		font-size: 0.78rem;
		line-height: 1.45;
		white-space: normal;
		text-align: left;
		color: var(--ink-dim);
	}
	.c-card:global(.below) {
		bottom: auto;
		top: calc(100% + 0.5rem);
	}
	.c-who {
		color: var(--ink);
	}
	.c-title {
		font-family: var(--font-body);
		font-style: italic;
		font-size: 0.95rem;
		color: var(--ink-bright);
	}
	.c-out {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		align-self: flex-start;
		margin-top: 0.2rem;
		color: var(--gold);
		text-decoration: none;
	}
	.c-out:hover {
		color: var(--gold-pale);
	}
	@media print {
		.c-card {
			display: none;
		}
	}
</style>
