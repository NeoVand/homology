<script lang="ts">
	// What the map's panel says about the station in focus: the chapter, and the
	// chapters on either side of it in the prerequisite graph.
	import { chapterById } from '$lib/content/toc';
	import { chapterHref } from '$lib/util/paths';
	import Icon from '$lib/components/ui/Icon.svelte';
	import { ArrowRightIcon, CloseIcon, VisitedIcon } from '$lib/icons';
	import { dependents } from './layout';

	let {
		id,
		up,
		down,
		visited,
		mode,
		onclose
	}: {
		id: string;
		/** everything upstream / downstream, as from layout.ts */
		up: Map<string, number>;
		down: Map<string, number>;
		visited: boolean;
		/** how the station came into focus */
		mode: 'hover' | 'key' | 'tap';
		onclose?: () => void;
	} = $props();

	const ch = $derived(chapterById.get(id)!);
	const before = $derived(ch.prereqs.map((p) => chapterById.get(p)!));
	const after = $derived(dependents(id).map((p) => chapterById.get(p)!));
</script>

<div class="sc ui" style="--pc:{ch.part.color}">
	{#if mode === 'tap' && onclose}
		<button class="x" type="button" aria-label="Close" onclick={onclose}><Icon icon={CloseIcon} size={16} /></button>
	{/if}
	<div class="main">
		<div class="where">{ch.part.numeral === '0' ? 'Prelude' : `Part ${ch.part.numeral} · ${ch.part.title}`}</div>
		<h2 class="title"><span class="num nums">{ch.num}</span>{ch.title}</h2>
		<p class="sub">{ch.subtitle}</p>
		<p class="blurb">{ch.blurb}</p>
		<p class="facts">
			about {ch.minutes} minutes
			{#if visited}<span class="seen"><Icon icon={VisitedIcon} size={13} stroke={2.2} /> visited</span>{/if}
		</p>
		{#if mode === 'tap'}
			<a class="go" href={chapterHref(id)}>Open the chapter <Icon icon={ArrowRightIcon} size={16} /></a>
		{/if}
	</div>

	<div class="rel">
		<section class="anc">
			<h3><i></i>Builds on</h3>
			{#if before.length}
				<ul>
					{#each before as c (c.id)}
						<li><span class="n nums">{c.num}</span>{c.title}</li>
					{/each}
				</ul>
				{#if up.size > before.length}<p class="more">and {up.size - before.length} more further back</p>{/if}
			{:else}
				<p class="more">Nothing: a place to start.</p>
			{/if}
		</section>
		<section class="desc">
			<h3><i></i>Leads to</h3>
			{#if after.length}
				<ul>
					{#each after as c (c.id)}
						<li><span class="n nums">{c.num}</span>{c.title}</li>
					{/each}
				</ul>
				{#if down.size > after.length}<p class="more">and {down.size - after.length} more further on</p>{/if}
			{:else}
				<p class="more">Nothing further in this book.</p>
			{/if}
		</section>
		{#if mode !== 'tap'}
			<p class="how">{mode === 'key' ? 'Press Enter to open it.' : 'Click the station to open it.'}</p>
		{/if}
	</div>
</div>

<style>
	.sc,
	.main {
		display: grid;
		gap: 0.1rem;
	}
	.sc {
		position: relative;
	}
	.where {
		padding-right: 1.6rem;
		font-size: 0.68rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--pc);
		min-height: 1.4rem;
	}
	.x {
		position: absolute;
		z-index: 1;
		top: -0.45rem;
		right: -0.55rem;
		display: grid;
		place-items: center;
		width: 1.9rem;
		height: 1.9rem;
		border: 0;
		border-radius: 50%;
		background: none;
		color: var(--ink-faint);
		cursor: pointer;
	}
	.x:hover {
		color: var(--ink);
		background: rgba(255, 255, 255, 0.05);
	}
	.title {
		margin: 0.2rem 0 0;
		font-family: var(--font-display);
		font-size: 1.28rem;
		font-weight: 500;
		line-height: 1.25;
		letter-spacing: 0.02em;
		color: var(--gold-bright);
	}
	.num {
		font-family: var(--font-ui);
		font-size: 0.8rem;
		font-weight: 600;
		letter-spacing: 0;
		color: var(--pc);
		margin-right: 0.5rem;
		vertical-align: 0.15em;
	}
	.sub {
		margin: 0.15rem 0 0;
		font-family: var(--font-elegant);
		font-style: italic;
		font-size: 1.08rem;
		line-height: 1.35;
		color: var(--ink-dim);
	}
	.blurb {
		margin: 0.55rem 0 0;
		font-family: var(--font-body);
		font-size: 0.88rem;
		line-height: 1.6;
		color: var(--ink);
	}
	.facts {
		display: flex;
		gap: 0.9rem;
		margin: 0.5rem 0 0;
		font-size: 0.74rem;
		color: var(--ink-faint);
	}
	.seen {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		color: var(--gold);
	}
	.rel {
		display: grid;
		gap: 0.75rem;
		margin-top: 0.85rem;
		padding-top: 0.85rem;
		border-top: 1px solid var(--line-faint);
	}
	h3 {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		margin: 0 0 0.3rem;
		font-size: 0.66rem;
		font-weight: 600;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	h3 i {
		width: 1.1rem;
		height: 2px;
		border-radius: 2px;
	}
	.anc h3 i {
		background: var(--gold-bright);
		box-shadow: 0 0 6px var(--gold-glow);
	}
	.desc h3 i {
		background: var(--teal);
		box-shadow: 0 0 6px rgba(95, 214, 207, 0.4);
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.15rem;
	}
	li {
		display: grid;
		grid-template-columns: 1.9rem 1fr;
		align-items: baseline;
		font-family: var(--font-elegant);
		font-size: 1.02rem;
		font-weight: 600;
		line-height: 1.3;
	}
	.anc li {
		color: var(--gold-pale);
	}
	.desc li {
		color: #c4f0ec;
	}
	.n {
		font-family: var(--font-ui);
		font-size: 0.74rem;
		font-weight: 600;
		color: var(--ink-faint);
	}
	.more {
		margin: 0.15rem 0 0;
		font-size: 0.74rem;
		color: var(--ink-faint);
	}
	.how {
		margin: 0.2rem 0 0;
		font-size: 0.72rem;
		color: var(--ink-ghost);
	}
	.go {
		display: inline-flex;
		justify-self: start;
		align-items: center;
		gap: 0.4rem;
		margin-top: 0.9rem;
		padding: 0.5rem 0.9rem;
		border: 1px solid var(--line-strong);
		border-radius: 999px;
		background: rgba(216, 178, 110, 0.1);
		color: var(--gold-pale);
		font-size: 0.85rem;
		text-decoration: none;
	}
</style>
