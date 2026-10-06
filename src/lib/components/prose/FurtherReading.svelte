<script lang="ts">
	// An annotated reading list for the end of a chapter.
	export interface Reading {
		title: string;
		author: string;
		url?: string;
		/** one line on why it is worth reading, and at what level */
		note: string;
		kind?: 'book' | 'paper' | 'notes' | 'video' | 'web' | 'interactive';
		free?: boolean;
	}
	let { items }: { items: Reading[] } = $props();
	const icons: Record<string, string> = {
		book: '📖',
		paper: '📄',
		notes: '📝',
		video: '▶',
		web: '🌐',
		interactive: '✦'
	};
</script>

<ul class="reading">
	{#each items as r (r.title)}
		<li>
			<span class="kind ui" aria-hidden="true">{icons[r.kind ?? 'web']}</span>
			<div class="body">
				<div class="head">
					{#if r.url}<a href={r.url} target="_blank" rel="noopener noreferrer">{r.title}</a>{:else}<span class="t">{r.title}</span>{/if}
					<span class="by">— {r.author}</span>
					{#if r.free}<span class="free ui">free</span>{/if}
				</div>
				<div class="note">{r.note}</div>
			</div>
		</li>
	{/each}
</ul>

<style>
	.reading {
		list-style: none;
		padding: 0 !important;
		margin: 1rem 0 1.5rem;
	}
	.reading li {
		display: flex;
		gap: 0.8rem;
		padding: 0.7rem 0;
		border-bottom: 1px solid var(--line-faint);
	}
	.reading li::before {
		display: none;
	}
	.kind {
		flex: none;
		width: 1.4rem;
		text-align: center;
		opacity: 0.8;
		font-size: 0.95rem;
		filter: grayscale(0.3);
	}
	.head {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.2rem 0.5rem;
	}
	.t {
		color: var(--ink-bright);
		font-style: italic;
	}
	.head a {
		font-style: italic;
	}
	.by {
		color: var(--ink-dim);
		font-size: 0.92em;
	}
	.free {
		font-size: 0.62rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--green);
		border: 1px solid rgba(132, 217, 162, 0.4);
		border-radius: 999px;
		padding: 0.05rem 0.45rem;
	}
	.note {
		color: var(--ink-dim);
		font-size: 0.92em;
		line-height: 1.55;
		margin-top: 0.15rem;
	}
	/* long titles, author lists or addresses must wrap on phones */
	.body {
		min-width: 0;
		overflow-wrap: anywhere;
	}
</style>
