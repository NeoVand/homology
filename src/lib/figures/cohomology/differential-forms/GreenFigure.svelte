<script lang="ts">
	// Figure: Green's theorem, live. Drag a closed loop over a field; the
	// circulation around the loop (or the flux out of it) is computed along the
	// curve, the total curl (or divergence) inside is computed by an area
	// integral, and the two numbers always agree.
	import FieldView from './FieldView.svelte';
	import LoopEditor from './LoopEditor.svelte';
	import { fields } from './fields';
	import {
		closedCatmullRom,
		fluxIntegral,
		fmt,
		lineIntegral,
		regionIntegral,
		windingNumber,
		type Vec2
	} from './calc';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';

	const TAU = Math.PI * 2;
	const ring = (c: Vec2, r: number, n = 6, ph = 0.3): Vec2[] =>
		Array.from({ length: n }, (_, k) => [c[0] + r * Math.cos(ph + (TAU * k) / n), c[1] + r * Math.sin(ph + (TAU * k) / n)] as Vec2);
	const shapes: Record<string, () => Vec2[]> = {
		circle: () => ring([0.15, 0], 1.25),
		blob: () => [
			[-1.35, -0.55],
			[0.2, -1.15],
			[1.55, -0.45],
			[1.2, 0.85],
			[-0.1, 0.55],
			[-1.15, 1.05]
		],
		small: () => ring([1.1, 0], 0.55),
		eight: () =>
			Array.from({ length: 8 }, (_, k) => {
				const t = (TAU * k) / 8 + 0.0001;
				return [1.55 * Math.sin(t), 0.85 * Math.sin(2 * t)] as Vec2;
			})
	};

	let key = $state('eddies');
	let mode = $state<'circ' | 'flux'>('circ');
	let points = $state<Vec2[]>(shapes.blob());
	let innerWidth = $state(1000);

	const preset = $derived(fields[key]);
	const height = $derived(innerWidth < 640 ? 380 : 460);
	const poly = $derived(closedCatmullRom(points, 24));
	const boundary = $derived(mode === 'circ' ? lineIntegral(poly, preset.F) : fluxIntegral(poly, preset.F));
	const inside = $derived(regionIntegral(poly, mode === 'circ' ? preset.curl : preset.div));
	const selfCrossing = $derived.by(() => {
		// sample winding numbers on a coarse grid: any |w| ≠ 0,1 or both signs ⇒ not a simple ccw loop
		const seen = new Set<number>();
		for (let y = -2; y <= 2; y += 0.2) for (let x = -2.6; x <= 2.6; x += 0.2) seen.add(windingNumber(poly, [x, y]));
		seen.delete(0);
		return seen.size > 1 || [...seen].some((w) => Math.abs(w) > 1) ? 'mixed' : seen.has(-1) ? 'cw' : 'ccw';
	});

	const keys = ['rotation', 'eddies', 'shear', 'source', 'sourcesink'];
</script>

<svelte:window bind:innerWidth />

<div class="green">
	<FieldView
		{preset}
		overlay={mode === 'circ' ? 1 : 2}
		{height}
		extent={2.05}
		brightness={0.92}
		particleOptions={{ count: 420 }}
		label="A vector field coloured by its curl or divergence, with a closed loop you can reshape."
	>
		{#snippet fg(v)}
			<svg class="fv-svg" viewBox="0 0 {v.w} {v.h}" role="presentation">
				<LoopEditor bind:points view={v} />
			</svg>
		{/snippet}
	</FieldView>
	<Controls>
		<Segmented
			bind:value={mode}
			label="Theorem"
			options={[
				{ value: 'circ', label: 'Circulation & curl' },
				{ value: 'flux', label: 'Flux & divergence' }
			]}
		/>
		<Segmented bind:value={key} label="Field" options={keys.map((k) => ({ value: k, label: fields[k].label }))} />
	</Controls>
	<Controls>
		<span class="lbl ui">Loop:</span>
		<Button variant="subtle" onclick={() => (points = shapes.circle())}>Circle</Button>
		<Button variant="subtle" onclick={() => (points = shapes.blob())}>Blob</Button>
		<Button variant="subtle" onclick={() => (points = shapes.small())}>Small</Button>
		<Button variant="subtle" onclick={() => (points = shapes.eight())}>Figure eight</Button>
		<Button variant="subtle" onclick={() => (points = points.slice().reverse())}>Reverse direction</Button>
	</Controls>
	<div class="readout">
		<div class="side edge">
			<div class="cap ui">{mode === 'circ' ? 'Circulation around the loop' : 'Flux out through the loop'}</div>
			<div class="eq">
				{#if mode === 'circ'}
					<TeX tex={String.raw`\oint_{\partial R} \mathbf F\cdot d\mathbf r = ${fmt(boundary, 3).replace('−', '-')}`} />
				{:else}
					<TeX tex={String.raw`\oint_{\partial R} \mathbf F\cdot \mathbf n\,ds = ${fmt(boundary, 3).replace('−', '-')}`} />
				{/if}
			</div>
		</div>
		<div class="equals" aria-hidden="true">=</div>
		<div class="side in">
			<div class="cap ui">{mode === 'circ' ? 'Total curl inside' : 'Total divergence inside'}</div>
			<div class="eq">
				{#if mode === 'circ'}
					<TeX tex={String.raw`\iint_R \operatorname{curl}\mathbf F\, dA = ${fmt(inside, 3).replace('−', '-')}`} />
				{:else}
					<TeX tex={String.raw`\iint_R \operatorname{div}\mathbf F\, dA = ${fmt(inside, 3).replace('−', '-')}`} />
				{/if}
			</div>
		</div>
		<p class="note">
			{#if selfCrossing === 'mixed'}
				The loop crosses itself, so each piece of the inside counts as often (and with the sign) the loop winds around it.
			{:else if selfCrossing === 'cw'}
				The loop runs clockwise, so both numbers flip sign: the inside now counts negatively.
			{:else}
				Two very different computations — one along the curve, one over the region inside — and they agree.
			{/if}
		</p>
	</div>
</div>

<style>
	.lbl {
		font-size: 0.76rem;
		color: var(--ink-faint);
		letter-spacing: 0.06em;
	}
	.readout {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 0.4rem 1rem;
		padding: 1rem 1.2rem 0.4rem;
		border-top: 1px solid var(--line-faint);
	}
	.side {
		text-align: center;
	}
	.cap {
		font-size: 0.7rem;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		margin-bottom: 0.3rem;
	}
	.edge .cap {
		color: var(--gold);
	}
	.in .cap {
		color: var(--rose);
	}
	.eq {
		font-size: 1.12rem;
		color: var(--ink-bright);
	}
	.equals {
		font-size: 1.6rem;
		color: var(--gold-bright);
		text-shadow: 0 0 12px var(--gold-glow);
	}
	.note {
		grid-column: 1 / -1;
		text-align: center;
		font-size: 0.92rem;
		color: var(--ink-dim);
		margin: 0.5rem 0 0.4rem;
	}
	@media (max-width: 640px) {
		.readout {
			grid-template-columns: 1fr;
		}
		.equals {
			display: none;
		}
	}
</style>
