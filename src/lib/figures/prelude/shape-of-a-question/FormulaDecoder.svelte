<script lang="ts">
	// The destination formula, decoded piece by piece. Hover, focus or tap a
	// piece to read what it means in plain words.
	type Piece = 'H' | 'eq' | 'ker' | 'over' | 'im';
	let active = $state<Piece>('H');

	const info: Record<Piece, { title: string; body: string; chapter: string }> = {
		H: {
			title: 'the n-dimensional holes of the shape X',
			body: 'A list of all the essentially different n-dimensional holes of X, packaged so that holes can be added and compared. For n = 1 these are the loops that go around tunnels; for n = 2, the hollow cavities.',
			chapter: 'Chapter 3.3'
		},
		eq: {
			title: 'is defined to be',
			body: 'The left side is a new name; the right side says how to build it.',
			chapter: 'Chapter 0.2'
		},
		ker: {
			title: 'the cycles: pieces with no boundary',
			body: 'All the closed loops (and closed surfaces, and their higher cousins) you can draw on X out of its building blocks — anything whose boundary is empty. The ∂ is the “boundary” operator; “ker” collects what it sends to zero.',
			chapter: 'Chapter 3.2'
		},
		over: {
			title: 'modulo: treat these as zero',
			body: 'Divide out: two cycles count as the same when they differ by something on the right-hand side. This is the same move as calling 13 o’clock and 1 o’clock the same hour.',
			chapter: 'Chapter 1.2 & 1.4'
		},
		im: {
			title: 'the boundaries: cycles that enclose something',
			body: 'All the cycles that are the edge of a filled-in piece of X, one dimension up. They enclose a region of the shape itself, so they surround no hole.',
			chapter: 'Chapter 3.1'
		}
	};
	const order: Piece[] = ['H', 'eq', 'ker', 'over', 'im'];
</script>

<div class="decoder">
	<div class="formula" role="group" aria-label="The formula: H n of X equals the kernel of boundary n modulo the image of boundary n plus one, piece by piece">
		{#each order as p (p)}
			<button
				class="piece p-{p}"
				class:on={active === p}
				onpointerenter={() => (active = p)}
				onfocus={() => (active = p)}
				onclick={() => (active = p)}
				aria-label={info[p].title}
			>
				{#if p === 'H'}\(H_n(X)\){:else if p === 'eq'}\(=\){:else if p === 'ker'}\(\ker \partial_n\){:else if p === 'over'}\(\big/\){:else}\(\im \partial_{n+1}\){/if}
			</button>
		{/each}
	</div>
	<div class="explain">
		<div class="e-title p-{active}">{info[active].title}</div>
		<p>{info[active].body}</p>
		<div class="e-where ui">explained fully in {info[active].chapter}</div>
	</div>
</div>

<style>
	.decoder {
		padding: 1.6rem 1.2rem 1.2rem;
	}
	.formula {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.2rem;
		font-size: clamp(1.4rem, 1rem + 2.4vw, 2.4rem);
		margin-bottom: 1.3rem;
	}
	.piece {
		border: 1px solid transparent;
		background: transparent;
		border-radius: 10px;
		padding: 0.15rem 0.45rem;
		cursor: pointer;
		color: var(--ink-bright);
		transition: all 0.2s var(--ease);
		font-size: 1em;
	}
	.piece :global(.katex) {
		font-size: 1em;
	}
	.piece:hover,
	.piece.on {
		background: rgba(255, 255, 255, 0.04);
		border-color: var(--line);
	}
	.p-H {
		color: var(--rose);
	}
	.p-ker {
		color: var(--gold-bright);
	}
	.p-im {
		color: var(--teal);
	}
	.p-eq,
	.p-over {
		color: var(--ink);
	}
	.piece.on.p-H {
		box-shadow: 0 0 24px -6px var(--rose);
	}
	.piece.on.p-ker {
		box-shadow: 0 0 24px -6px var(--gold-bright);
	}
	.piece.on.p-im {
		box-shadow: 0 0 24px -6px var(--teal);
	}
	.explain {
		max-width: 36rem;
		margin: 0 auto;
		min-height: 9.5rem;
		text-align: center;
	}
	.e-title {
		font-family: var(--font-elegant);
		font-size: 1.35rem;
		font-weight: 600;
		margin-bottom: 0.4rem;
	}
	.explain p {
		margin: 0 0 0.6rem;
		color: var(--ink);
		font-size: 0.98rem;
		line-height: 1.6;
	}
	.e-where {
		font-size: 0.72rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
</style>
