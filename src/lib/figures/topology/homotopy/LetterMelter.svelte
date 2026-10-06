<script lang="ts">
	// Hatcher's thick letters: each thick letter deformation-retracts onto its
	// thin skeleton (the thick stroke shrinks evenly onto its centre line), and
	// the skeletons sort into three homotopy types. Tap a letter to shrink it.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	type Kind = 0 | 1 | 2; // ≃ point, ≃ circle, ≃ figure eight
	interface Glyph {
		ch: string;
		/** centre line of the letter, in a 100 × 140 box */
		d: string;
		kind: Kind;
	}
	// The thick letter is this centre line stroked at width THICK; every counter
	// (the holes of A, B, D, O, P, R) stays open at that width.
	const glyphs: Glyph[] = [
		{ ch: 'A', kind: 1, d: 'M10 134 L50 8 L90 134 M24.6 100 L75.4 100' },
		{ ch: 'B', kind: 2, d: 'M20 8 L20 134 M20 8 L54 8 C84 8 84 68 54 68 L20 68 M20 68 L58 68 C90 68 90 134 58 134 L20 134' },
		{ ch: 'C', kind: 0, d: 'M84 32 C68 4 16 6 16 71 C16 136 68 138 84 110' },
		{ ch: 'D', kind: 1, d: 'M20 8 L20 134 L46 134 C96 134 96 8 46 8 Z' },
		{ ch: 'E', kind: 0, d: 'M82 8 L20 8 L20 134 L82 134 M20 71 L72 71' },
		{ ch: 'O', kind: 1, d: 'M50 8 C90 8 90 134 50 134 C10 134 10 8 50 8 Z' },
		{ ch: 'P', kind: 1, d: 'M20 134 L20 8 L54 8 C88 8 88 76 54 76 L20 76' },
		{ ch: 'R', kind: 1, d: 'M20 134 L20 8 L54 8 C88 8 88 76 54 76 L20 76 M50 76 L86 134' },
		{ ch: 'T', kind: 0, d: 'M10 8 L90 8 M50 8 L50 134' },
		{ ch: 'X', kind: 0, d: 'M14 8 L86 134 M86 8 L14 134' }
	];
	const THICK = 20;
	const THIN = 3.2;

	const S = 0.64; // letter scale
	const LW = 100 * S;
	const LH = 140 * S;

	let melted = $state<Record<string, boolean>>({});
	let sorted = $state(false);
	const allMelted = $derived(glyphs.every((g) => melted[g.ch]));

	function toggle(ch: string) {
		melted[ch] = !melted[ch];
	}
	function meltAll() {
		const to = !allMelted;
		for (const g of glyphs) melted[g.ch] = to;
	}

	// mixed layout: two rows of five
	function mixedPos(i: number): [number, number] {
		const row = i < 5 ? 0 : 1;
		const col = i % 5;
		return [360 + (col - 2) * 130 - LW / 2, 46 + row * 142];
	}
	// sorted layout: three columns
	const colX = [118, 360, 602];
	const groupSlots: Record<Kind, [number, number][]> = {
		0: [
			[-44, 0],
			[44, 0],
			[-44, 114],
			[44, 114]
		],
		1: [
			[-80, 0],
			[0, 0],
			[80, 0],
			[-40, 114],
			[40, 114]
		],
		2: [[0, 57]]
	};
	function sortedPos(i: number): [number, number] {
		const g = glyphs[i];
		const k = glyphs.slice(0, i).filter((h) => h.kind === g.kind).length;
		const [dx, dy] = groupSlots[g.kind][k];
		return [colX[g.kind] + dx - LW / 2, 62 + dy];
	}

	const types = [String.raw`\simeq \text{point}`, String.raw`\simeq S^1`, String.raw`\simeq S^1 \vee S^1`];
	const heads = [String.raw`\simeq \text{a point}`, String.raw`\simeq S^1`, String.raw`\simeq S^1 \vee S^1`];
</script>

<div class="wrap">
	<Svg viewBox="0 0 720 340" maxHeight={440} label="Ten thick capital letters; each can shrink onto its thin skeleton, and the letters sort into three homotopy types">
		<defs>
			<linearGradient id="lm-fill" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stop-color="#6fd6e8" stop-opacity="0.62" />
				<stop offset="0.5" stop-color="#8f7cf7" stop-opacity="0.56" />
				<stop offset="1" stop-color="#ee8fbf" stop-opacity="0.58" />
			</linearGradient>
		</defs>

		<!-- group headings and model spaces (visible when sorted) -->
		<g class="groups" class:on={sorted} aria-hidden={!sorted}>
			{#each heads as h, k (k)}
				<SvgTeX x={colX[k]} y={26} tex={h} size={17} color="var(--gold-bright)" w={150} h={30} />
			{/each}
			<line x1="239" x2="239" y1="14" y2="326" stroke="rgba(216,178,110,0.14)" />
			<line x1="481" x2="481" y1="14" y2="326" stroke="rgba(216,178,110,0.14)" />
			<g filter="url(#glow)">
				<circle cx={colX[0]} cy={310} r="4.5" fill="var(--gold-bright)" />
				<circle cx={colX[1]} cy={310} r="12" fill="none" stroke="var(--gold-bright)" stroke-width="2.4" />
				<circle cx={colX[2] - 11} cy={310} r="11" fill="none" stroke="var(--gold-bright)" stroke-width="2.4" />
				<circle cx={colX[2] + 11} cy={310} r="11" fill="none" stroke="var(--gold-bright)" stroke-width="2.4" />
			</g>
		</g>

		{#each glyphs as g, i (g.ch)}
			{@const p = sorted ? sortedPos(i) : mixedPos(i)}
			{@const on = !!melted[g.ch]}
			<g
				class="glyph"
				class:on
				style="transform: translate({p[0]}px, {p[1]}px)"
				role="button"
				tabindex="0"
				aria-pressed={on}
				aria-label="Letter {g.ch}: {on ? 'thicken it again' : 'shrink it onto its skeleton'}"
				onclick={() => toggle(g.ch)}
				onkeydown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						toggle(g.ch);
					}
				}}
			>
				<rect class="hit" x="-10" y="-8" width={LW + 20} height={LH + 16} rx="10" />
				<g transform="scale({S})">
					<path class="rim" d={g.d} style="stroke-width: {on ? 0 : THICK + 3}px" />
					<path class="body" d={g.d} style="stroke-width: {on ? THIN : THICK}px" />
					<path class="bone" d={g.d} />
				</g>
				<g class="type" class:show={on && !sorted}>
					<SvgTeX x={LW / 2} y={LH + 16} tex={types[g.kind]} size={13} color="var(--gold)" w={110} h={22} />
				</g>
			</g>
		{/each}
	</Svg>
	<Controls>
		<Button variant="gold" onclick={meltAll}>{allMelted ? 'Thicken all' : 'Shrink all'}</Button>
		<Button active={sorted} onclick={() => (sorted = !sorted)}>{sorted ? 'Unsort' : 'Sort by homotopy type'}</Button>
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.3rem;
	}
	.glyph {
		cursor: pointer;
		outline: none;
		transition: transform 0.8s var(--ease);
	}
	.hit {
		fill: transparent;
		stroke: transparent;
		transition: fill 0.2s var(--ease);
	}
	.glyph:hover .hit {
		fill: rgba(216, 178, 110, 0.05);
	}
	.glyph:focus-visible .hit {
		stroke: var(--gold-bright);
		stroke-width: 1.5;
	}
	.glyph path {
		fill: none;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.rim {
		stroke: rgba(164, 147, 255, 0.6);
		transition: stroke-width 0.9s var(--ease);
	}
	.body {
		stroke: url(#lm-fill);
		transition: stroke-width 0.9s var(--ease);
	}
	.bone {
		stroke: #f4d79c;
		stroke-width: 2.4px;
		opacity: 0.45;
		transition: opacity 0.6s var(--ease);
	}
	.glyph.on .bone {
		opacity: 1;
		filter: url(#glow);
	}
	.type {
		opacity: 0;
		transition: opacity 0.4s var(--ease);
	}
	.type.show {
		opacity: 1;
		transition-delay: 0.5s;
	}
	.groups {
		opacity: 0;
		transition: opacity 0.6s var(--ease);
	}
	.groups.on {
		opacity: 1;
	}
</style>
