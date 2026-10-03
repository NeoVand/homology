<script lang="ts">
	// Graded commutativity for forms: moving a q-form past a p-form takes p·q
	// swaps of 1-forms, and every swap costs a factor −1.
	import { flip } from 'svelte/animate';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import StepControls from '$lib/components/ui/StepControls.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';

	let p = $state(2);
	let q = $state(3);
	let step = $state(0);
	const total = $derived(p * q);

	$effect(() => {
		void p;
		void q;
		step = 0;
	});

	interface Tok {
		id: string;
		tex: string;
		kind: 'a' | 'b';
	}
	const arrangement = $derived.by(() => {
		const a: Tok[] = Array.from({ length: p }, (_, i) => ({ id: `a${i}`, tex: `dx_{${i + 1}}`, kind: 'a' as const }));
		const b: Tok[] = Array.from({ length: q }, (_, i) => ({ id: `b${i}`, tex: `dy_{${i + 1}}`, kind: 'b' as const }));
		// after k swaps: the first ⌊k/p⌋ dy's sit in front; the next one has moved k mod p places left
		const k = Math.min(step, total);
		const done = p ? Math.floor(k / p) : q;
		const partial = p ? k % p : 0;
		const front = b.slice(0, done);
		const moving = done < q ? b[done] : null;
		const rest = b.slice(done + 1);
		const golds = [...a];
		const out: Tok[] = [...front];
		if (moving) {
			const before = golds.slice(0, p - partial);
			const after = golds.slice(p - partial);
			out.push(...before, moving, ...after, ...rest);
		} else out.push(...golds);
		return out;
	});
	const sign = $derived(step % 2 === 0 ? '+' : '-');
	const labels = $derived(Array.from({ length: total + 1 }, (_, k) => (k === 0 ? 'start: α ∧ β' : k === total ? `done: ${k} swaps` : `swap ${k}`)));
</script>

<div class="ss ui">
	<div class="degs">
		<span class="lbl">degree of α</span>
		<Segmented bind:value={p} label="degree of alpha" options={[1, 2, 3].map((v) => ({ value: v, label: String(v) }))} />
		<span class="lbl">degree of β</span>
		<Segmented bind:value={q} label="degree of beta" options={[1, 2, 3].map((v) => ({ value: v, label: String(v) }))} />
	</div>
	<div class="row" aria-live="polite">
		<span class="sg" class:neg={sign === '-'}>{sign === '+' ? '+' : '−'}</span>
		{#each arrangement as t, i (t.id)}
			<span class="cell" animate:flip={{ duration: 450 }}>
				<span class="tok" class:a={t.kind === 'a'} class:b={t.kind === 'b'}><TeX tex={t.tex} /></span>
				<span class="wedge" class:hide={i === arrangement.length - 1} aria-hidden="true"><TeX tex={'\\wedge'} /></span>
			</span>
		{/each}
	</div>
	<StepControls bind:step count={total + 1} {labels} interval={900} />
	<div class="res">
		<TeX tex={`\\alpha\\wedge\\beta = (-1)^{${p}\\cdot ${q}}\\,\\beta\\wedge\\alpha = ${(p * q) % 2 ? '-' : '+'}\\,\\beta\\wedge\\alpha`} />
		<span class="note">{p * q} swaps of neighbouring 1-forms, each one a factor −1</span>
	</div>
</div>

<style>
	.ss {
		display: grid;
		gap: 1rem;
		padding: 1.1rem 1.2rem 1.1rem;
		justify-items: center;
	}
	.degs {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.5rem 0.8rem;
	}
	.lbl {
		font-size: 0.76rem;
		color: var(--ink-dim);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0.35rem;
		min-height: 3.2rem;
		font-family: var(--font-body);
	}
	.sg {
		font-size: 1.6rem;
		width: 1.6rem;
		text-align: center;
		color: var(--green);
		font-weight: 600;
	}
	.sg.neg {
		color: var(--rose);
	}
	.tok {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 3rem;
		height: 2.6rem;
		padding: 0 0.5rem;
		border-radius: 10px;
		font-size: 1.05rem;
		color: var(--ink-bright);
	}
	.tok.a {
		background: rgba(242, 208, 143, 0.13);
		border: 1px solid rgba(242, 208, 143, 0.55);
		box-shadow: 0 0 14px -4px rgba(242, 208, 143, 0.5);
	}
	.tok.b {
		background: rgba(95, 214, 207, 0.12);
		border: 1px solid rgba(95, 214, 207, 0.55);
		box-shadow: 0 0 14px -4px rgba(95, 214, 207, 0.5);
	}
	.cell {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}
	.wedge {
		color: var(--ink-faint);
	}
	.wedge.hide {
		visibility: hidden;
		width: 0;
		margin-left: -0.35rem;
	}
	.res {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		justify-content: center;
		gap: 0.3rem 0.9rem;
		color: var(--ink-bright);
	}
	.note {
		font-size: 0.76rem;
		color: var(--ink-faint);
	}
</style>
