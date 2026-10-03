<script lang="ts">
	import { goto } from '$app/navigation';
	import { href } from '$lib/util/paths';
	import { ui } from '$lib/stores/ui.svelte';
	import { tick } from 'svelte';
	import { fade, scale } from 'svelte/transition';

	type Item = {
		type: 'chapter' | 'section' | 'term' | 'symbol';
		title: string;
		html?: string;
		text: string;
		path: string;
		hash?: string;
		where: string;
	};

	let items = $state<Item[] | null>(null);
	let q = $state('');
	let sel = $state(0);
	let input = $state<HTMLInputElement>();

	const norm = (s: string) =>
		s
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.toLowerCase();

	async function load() {
		if (items) return;
		try {
			const r = await fetch(href('/search.json'));
			const data: Item[] = await r.json();
			items = data.map((d) => ({ ...d }));
		} catch {
			items = [];
		}
	}

	const typeRank = { chapter: 0, section: 1, term: 2, symbol: 3 } as const;
	const results = $derived.by(() => {
		if (!items) return [];
		const toks = norm(q).split(/\s+/).filter(Boolean);
		if (!toks.length) return items.filter((i) => i.type === 'chapter').slice(0, 8);
		const scored: { it: Item; s: number }[] = [];
		for (const it of items) {
			const t = norm(it.title);
			const b = norm(it.text);
			let s = 0;
			let ok = true;
			for (const tok of toks) {
				if (t.startsWith(tok)) s += 6;
				else if (t.split(/[\s\-–—(),.:]+/).some((w) => w.startsWith(tok))) s += 4;
				else if (t.includes(tok)) s += 3;
				else if (b.includes(tok)) s += 1;
				else {
					ok = false;
					break;
				}
			}
			if (ok) scored.push({ it, s: s - typeRank[it.type] * 0.5 });
		}
		scored.sort((a, b) => b.s - a.s);
		return scored.slice(0, 30).map((x) => x.it);
	});

	$effect(() => {
		void q;
		sel = 0;
	});

	$effect(() => {
		if (!ui.searchOpen) return;
		load();
		tick().then(() => input?.focus());
		const prev = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		return () => {
			document.body.style.overflow = prev;
		};
	});

	$effect(() => {
		const onKey = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement | null;
			const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
			if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing && !ui.searchOpen)) {
				e.preventDefault();
				ui.searchOpen = true;
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	});

	function open(it: Item) {
		ui.searchOpen = false;
		q = '';
		goto(href(it.path) + (it.hash ? `#${it.hash}` : ''));
	}
	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape') ui.searchOpen = false;
		else if (e.key === 'ArrowDown') {
			e.preventDefault();
			sel = Math.min(results.length - 1, sel + 1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			sel = Math.max(0, sel - 1);
		} else if (e.key === 'Enter' && results[sel]) {
			e.preventDefault();
			open(results[sel]);
		}
	}
	const labels = { chapter: 'Chapter', section: 'Section', term: 'Glossary', symbol: 'Symbol' };
</script>

{#if ui.searchOpen}
	<div class="scrim" transition:fade={{ duration: 150 }} onclick={() => (ui.searchOpen = false)} aria-hidden="true"></div>
	<div class="dialog" role="dialog" aria-modal="true" aria-label="Search the book" transition:scale={{ start: 0.97, duration: 180 }}>
		<div class="bar ui">
			<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"
				><circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" stroke-width="1.5" /><path
					d="M13 13l4 4"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
				/></svg
			>
			<input
				bind:this={input}
				bind:value={q}
				onkeydown={onKey}
				placeholder="Search chapters, sections, terms, symbols…"
				aria-label="Search"
				autocomplete="off"
				spellcheck="false"
			/>
			<kbd>esc</kbd>
		</div>
		<ul class="results" role="listbox">
			{#if !items}
				<li class="empty ui">Loading…</li>
			{:else if !results.length}
				<li class="empty ui">Nothing found for “{q}”.</li>
			{/if}
			{#each results as it, i (it.type + it.path + (it.hash ?? '') + it.title)}
				<li role="option" aria-selected={i === sel}>
					<button class="res" class:on={i === sel} onpointerenter={() => (sel = i)} onclick={() => open(it)}>
						<span class="tag ui t-{it.type}">{labels[it.type]}</span>
						<span class="main">
							<span class="ttl">{#if it.html && it.type !== 'term'}{@html it.html}{:else}{it.title}{/if}</span>
							{#if it.type === 'term' && it.html}
								<span class="snip">{@html it.html}</span>
							{:else if it.type === 'symbol'}
								<span class="snip">{it.text.split(' \\')[0]}</span>
							{:else if it.type === 'chapter'}
								<span class="snip">{it.text}</span>
							{/if}
							<span class="where ui">{it.where}</span>
						</span>
					</button>
				</li>
			{/each}
		</ul>
		<div class="foot ui"><kbd>↑</kbd><kbd>↓</kbd> to move · <kbd>enter</kbd> to open · <kbd>/</kbd> or <kbd>ctrl k</kbd> to search anywhere</div>
	</div>
{/if}

<style>
	.scrim {
		position: fixed;
		inset: 0;
		z-index: 70;
		background: rgba(2, 4, 9, 0.66);
		backdrop-filter: blur(4px);
	}
	.dialog {
		position: fixed;
		z-index: 71;
		top: 10vh;
		left: 50%;
		transform: translateX(-50%);
		width: min(44rem, calc(100vw - 1.5rem));
		max-height: 76vh;
		display: flex;
		flex-direction: column;
		background: linear-gradient(180deg, #111a30, #0a1022);
		border: 1px solid var(--line-strong);
		border-radius: 16px;
		box-shadow: 0 40px 120px -20px rgba(0, 0, 0, 0.95);
		overflow: hidden;
	}
	.bar {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		padding: 0.9rem 1.1rem;
		border-bottom: 1px solid var(--line-faint);
		color: var(--gold);
	}
	.bar input {
		flex: 1;
		background: transparent;
		border: 0;
		outline: none;
		color: var(--ink-bright);
		font-size: 1.05rem;
		font-family: var(--font-ui);
	}
	kbd {
		font-family: var(--font-ui);
		font-size: 0.66rem;
		padding: 0.12rem 0.4rem;
		border-radius: 5px;
		border: 1px solid var(--line);
		color: var(--ink-faint);
		background: rgba(255, 255, 255, 0.03);
	}
	.results {
		list-style: none;
		margin: 0;
		padding: 0.4rem;
		overflow-y: auto;
	}
	.empty {
		padding: 1.2rem;
		color: var(--ink-faint);
		font-size: 0.9rem;
		text-align: center;
	}
	.res {
		width: 100%;
		display: flex;
		gap: 0.8rem;
		align-items: flex-start;
		text-align: left;
		padding: 0.6rem 0.75rem;
		border: 0;
		border-radius: 10px;
		background: transparent;
		cursor: pointer;
		color: var(--ink);
	}
	.res.on {
		background: rgba(216, 178, 110, 0.1);
	}
	.tag {
		flex: none;
		width: 4.6rem;
		margin-top: 0.2rem;
		font-size: 0.62rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.t-chapter {
		color: var(--gold);
	}
	.t-section {
		color: var(--blue);
	}
	.t-term {
		color: var(--teal);
	}
	.t-symbol {
		color: var(--violet);
	}
	.main {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		min-width: 0;
	}
	.ttl {
		font-family: var(--font-elegant);
		font-size: 1.12rem;
		font-weight: 600;
		color: var(--ink-bright);
	}
	.snip {
		font-size: 0.86rem;
		color: var(--ink-dim);
		line-height: 1.45;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.where {
		font-size: 0.7rem;
		color: var(--ink-faint);
	}
	.foot {
		padding: 0.6rem 1rem;
		font-size: 0.7rem;
		color: var(--ink-faint);
		border-top: 1px solid var(--line-faint);
		display: flex;
		gap: 0.3rem;
		align-items: center;
		flex-wrap: wrap;
	}
	@media (max-width: 600px) {
		.foot {
			display: none;
		}
		.tag {
			width: 3.6rem;
		}
	}
</style>
