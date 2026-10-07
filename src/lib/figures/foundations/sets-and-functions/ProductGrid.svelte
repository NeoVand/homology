<script lang="ts">
	// The Cartesian product A × B as a grid of dots: one dot per ordered pair.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Stepper from '$lib/components/ui/Stepper.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import { renderMathInText } from '$lib/katex/render';

	let m = $state(4);
	let n = $state(3);
	let swapped = $state(false);
	let pick = $state<[number, number] | null>([2, 1]);

	const letters = ['a', 'b', 'c', 'd', 'e'];
	const Aname = (i: number) => String(i + 1);
	const Bname = (j: number) => letters[j];

	// horizontal axis = first factor, vertical axis = second factor
	const cols = $derived(swapped ? n : m);
	const rows = $derived(swapped ? m : n);
	const colName = (i: number) => (swapped ? Bname(i) : Aname(i));
	const rowName = (j: number) => (swapped ? Aname(j) : Bname(j));

	const X0 = 96;
	const DX = 50;
	const DY = 44;
	// the grid hangs from the top; the canvas grows with the number of rows
	const Y0 = $derived(70 + (rows - 1) * DY);
	const VH = $derived(Y0 + 52);
	const px = (i: number) => X0 + i * DX;
	const py = (j: number) => Y0 - j * DY;

	$effect(() => {
		// keep the picked pair inside the grid when sizes change
		if (pick && (pick[0] >= cols || pick[1] >= rows)) pick = null;
	});

	const first = $derived(swapped ? 'B' : 'A');
	const second = $derived(swapped ? 'A' : 'B');
	const readout = $derived.by(() => {
		const count = String.raw`\(\lvert ${first}\times ${second}\rvert = \lvert ${first}\rvert\cdot\lvert ${second}\rvert = ${cols}\cdot ${rows} = ${cols * rows}\)`;
		if (!pick) return { main: count, sub: 'Tap a dot to read its pair.' };
		const [i, j] = pick;
		const pair = String.raw`\((${colName(i)},\,${rowName(j)})\)`;
		const flipped = String.raw`\((${rowName(j)},\,${colName(i)})\)`;
		return {
			main: count,
			sub: `This dot is the ordered pair ${pair}: first coordinate ${String.raw`\(${colName(i)}\in ${first}\)`}, second ${String.raw`\(${rowName(j)}\in ${second}\)`}. Order matters: ${flipped} is a different pair${swapped ? ', living in A × B instead' : ', living in B × A'}.`
		};
	});
</script>

<div class="pg">
	<Svg viewBox="0 0 420 {VH}" maxHeight={380} label="The Cartesian product drawn as a grid of dots, one for each ordered pair">
		<!-- axes -->
		<line x1={X0 - 34} y1={Y0 + 22} x2={X0 + (cols - 1) * DX + 30} y2={Y0 + 22} class="axis" />
		<line x1={X0 - 34} y1={Y0 + 22} x2={X0 - 34} y2={Y0 - (rows - 1) * DY - 26} class="axis" />
		<text x={X0 + (cols - 1) * DX + 44} y={Y0 + 27} class="axname">{first}</text>
		<text x={X0 - 34} y={Y0 - (rows - 1) * DY - 36} class="axname">{second}</text>

		{#each Array(cols) as _, i (i)}
			<g class="tick" class:hot={pick?.[0] === i}>
				<circle cx={px(i)} cy={Y0 + 22} r="11" class="tdot" />
				<text x={px(i)} y={Y0 + 26} class="tlbl">{colName(i)}</text>
			</g>
		{/each}
		{#each Array(rows) as _, j (j)}
			<g class="tick" class:hot={pick?.[1] === j}>
				<circle cx={X0 - 34} cy={py(j)} r="11" class="tdot" />
				<text x={X0 - 34} y={py(j) + 4} class="tlbl">{rowName(j)}</text>
			</g>
		{/each}

		{#if pick}
			<line x1={px(pick[0])} y1={Y0 + 10} x2={px(pick[0])} y2={py(pick[1])} class="guide" />
			<line x1={X0 - 22} y1={py(pick[1])} x2={px(pick[0])} y2={py(pick[1])} class="guide" />
		{/if}

		{#each Array(cols) as _, i (i)}
			{#each Array(rows) as __, j (j)}
				{@const on = pick?.[0] === i && pick?.[1] === j}
				{@const line = pick !== null && (pick[0] === i || pick[1] === j)}
				<g
					class="pt"
					class:on
					class:line
					role="button"
					tabindex="0"
					aria-label="pair ({colName(i)}, {rowName(j)})"
					onclick={() => (pick = on ? null : [i, j])}
					onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), (pick = [i, j]))}
				>
					<circle cx={px(i)} cy={py(j)} r="16" class="hit" />
					<circle cx={px(i)} cy={py(j)} r={on ? 9 : 6.5} class="d" />
				</g>
			{/each}
		{/each}
		{#if pick}
			<text x={px(pick[0])} y={py(pick[1]) - 15} class="plbl">({colName(pick[0])}, {rowName(pick[1])})</text>
		{/if}
	</Svg>
	<div class="readout" aria-live="polite">
		<div class="main">{@html renderMathInText(readout.main)}</div>
		<div class="sub">{@html renderMathInText(readout.sub)}</div>
	</div>
	<Controls>
		<Stepper bind:value={m} min={1} max={6} label="size of A" />
		<Stepper bind:value={n} min={1} max={5} label="size of B" />
		<Toggle bind:checked={swapped} label="show B × A instead" />
	</Controls>
</div>

<style>
	.pg > :global(svg) {
		padding: 0.8rem 0.5rem 0;
	}
	.axis {
		stroke: rgba(200, 192, 170, 0.35);
		stroke-width: 1.2;
	}
	.axname {
		font-family: var(--font-elegant);
		font-style: italic;
		font-size: 20px !important;
		fill: var(--gold) !important;
		text-anchor: middle;
	}
	.tdot {
		fill: rgba(20, 28, 52, 0.95);
		stroke: rgba(200, 192, 170, 0.4);
		stroke-width: 1.1;
		transition: all 0.2s;
	}
	.tlbl {
		font-family: var(--font-ui);
		font-size: 11.5px !important;
		font-weight: 650;
		fill: var(--ink-dim) !important;
		text-anchor: middle;
	}
	.tick.hot .tdot {
		fill: var(--teal);
		stroke: #dffaf7;
	}
	.tick.hot .tlbl {
		fill: #06201e !important;
	}
	.guide {
		stroke: var(--teal);
		stroke-width: 1.3;
		stroke-dasharray: 3 4;
		opacity: 0.8;
	}
	.pt {
		cursor: pointer;
	}
	.pt:focus {
		outline: none;
	}
	.hit {
		fill: transparent;
	}
	.d {
		fill: url(#vertex-fill);
		stroke: rgba(6, 9, 18, 0.85);
		stroke-width: 1.2;
		transition: r 0.15s;
	}
	.pt.line .d {
		filter: drop-shadow(0 0 4px rgba(95, 214, 207, 0.6));
	}
	.pt.on .d {
		stroke: #fff;
		stroke-width: 1.8;
	}
	.pt:hover .d,
	.pt:focus-visible .d {
		stroke: #fff;
	}
	.plbl {
		font-family: var(--font-ui);
		font-size: 12px !important;
		font-weight: 650;
		fill: var(--gold-bright) !important;
		text-anchor: middle;
		paint-order: stroke;
		stroke: #070b15;
		stroke-width: 4px;
	}
	/* phones: the grid shrinks, so its lettering grows */
	@container figure (max-width: 34rem) {
		.tlbl {
			font-size: 14px !important;
			transform: translateY(1px);
		}
		.plbl {
			font-size: 15px !important;
		}
	}
	.readout {
		padding: 0.5rem 1.2rem 0.8rem;
		text-align: center;
		min-height: 4.6rem;
	}
	.main {
		font-size: 1.05rem;
		color: var(--ink-bright);
	}
	.sub {
		font-size: 0.9rem;
		color: var(--ink-dim);
		margin-top: 0.2rem;
	}
</style>
