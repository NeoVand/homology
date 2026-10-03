<script lang="ts">
	// Hatcher's thick letters: each thick letter deformation-retracts onto its
	// thin skeleton, and the skeletons sort into three homotopy types.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	type Kind = 0 | 1 | 2; // ≃ point, ≃ circle, ≃ figure eight
	interface Glyph {
		ch: string;
		d: string;
		kind: Kind;
	}
	// skeletons in a 100 × 140 box (sans-serif capitals)
	const glyphs: Glyph[] = [
		{ ch: 'A', kind: 1, d: 'M14 136 L50 8 L86 136 M27.5 88 L72.5 88' },
		{ ch: 'B', kind: 2, d: 'M22 8 L22 136 M22 8 L54 8 C86 8 86 70 54 70 L22 70 M22 70 L58 70 C94 70 94 136 58 136 L22 136' },
		{ ch: 'C', kind: 0, d: 'M84 30 C66 2 16 6 16 72 C16 138 66 142 84 114' },
		{ ch: 'D', kind: 1, d: 'M22 8 L22 136 L48 136 C98 136 98 8 48 8 Z' },
		{ ch: 'E', kind: 0, d: 'M82 8 L22 8 L22 136 L82 136 M22 72 L72 72' },
		{ ch: 'O', kind: 1, d: 'M50 8 C92 8 92 136 50 136 C8 136 8 8 50 8 Z' },
		{ ch: 'P', kind: 1, d: 'M22 136 L22 8 L54 8 C90 8 90 76 54 76 L22 76' },
		{ ch: 'R', kind: 1, d: 'M22 136 L22 8 L54 8 C90 8 90 76 54 76 L22 76 M50 76 L86 136' },
		{ ch: 'T', kind: 0, d: 'M10 8 L90 8 M50 8 L50 136' },
		{ ch: 'X', kind: 0, d: 'M14 8 L86 136 M86 8 L14 136' }
	];

	let melt = $state(0);
	let sorted = $state(false);

	const S = 0.62; // letter scale
	const LW = 100 * S;
	const LH = 140 * S;

	// mixed layout: two rows of five
	function mixedPos(i: number): [number, number] {
		const row = i < 5 ? 0 : 1;
		const col = i % 5;
		return [92 + col * 134 - LW / 2, 58 + row * 128];
	}
	// sorted layout: three columns
	const colX = [112, 362, 614];
	const groupSlots: Record<Kind, [number, number][]> = {
		0: [
			[-54, 0],
			[54, 0],
			[-54, 112],
			[54, 112]
		],
		1: [
			[-86, 0],
			[0, 0],
			[86, 0],
			[-43, 112],
			[43, 112]
		],
		2: [[0, 56]]
	};
	function sortedPos(i: number): [number, number] {
		const g = glyphs[i];
		const k = glyphs.slice(0, i).filter((h) => h.kind === g.kind).length;
		const [dx, dy] = groupSlots[g.kind][k];
		return [colX[g.kind] + dx - LW / 2, 70 + dy];
	}

	const width = $derived(4 + 26 * (1 - melt));
	const heads = [String.raw`\simeq \text{a point}`, String.raw`\simeq S^1`, String.raw`\simeq S^1 \vee S^1`];
</script>

<div class="wrap">
	<Svg viewBox="0 0 720 320" maxHeight={420} label="Ten thick capital letters shrinking onto thin skeleton letters, then sorted into three homotopy types">
		<defs>
			<linearGradient id="lm-fill" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stop-color="#6fd6e8" stop-opacity="0.55" />
				<stop offset="0.45" stop-color="#8f7cf7" stop-opacity="0.5" />
				<stop offset="1" stop-color="#ee8fbf" stop-opacity="0.5" />
			</linearGradient>
		</defs>

		<!-- group headings and model spaces (visible when sorted) -->
		<g class="groups" class:on={sorted}>
			{#each heads as h, k (k)}
				<SvgTeX x={colX[k]} y={30} tex={h} size={17} color="var(--gold-bright)" w={150} h={30} />
				<line x1={colX[k] - 70} x2={colX[k] + 70} y1={48} y2={48} stroke="rgba(216,178,110,0.25)" />
			{/each}
			<line x1="228" x2="228" y1="20" y2="304" stroke="rgba(216,178,110,0.12)" />
			<line x1="504" x2="504" y1="20" y2="304" stroke="rgba(216,178,110,0.12)" />
			<!-- the model spaces -->
			<g filter="url(#glow)">
				<circle cx={colX[0]} cy={292} r="4.5" fill="#f2d08f" />
				<circle cx={colX[1]} cy={292} r="13" fill="none" stroke="#f2d08f" stroke-width="2.4" />
				<circle cx={colX[2] - 12} cy={292} r="12" fill="none" stroke="#f2d08f" stroke-width="2.4" />
				<circle cx={colX[2] + 12} cy={292} r="12" fill="none" stroke="#f2d08f" stroke-width="2.4" />
			</g>
		</g>

		{#each glyphs as g, i (g.ch)}
			{@const p = sorted ? sortedPos(i) : mixedPos(i)}
			<g class="glyph" style="transform: translate({p[0]}px, {p[1]}px)">
				<g transform="scale({S})">
					<path
						d={g.d}
						fill="none"
						stroke="rgba(164,147,255,0.55)"
						stroke-width={width + 3}
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
					<path d={g.d} fill="none" stroke="url(#lm-fill)" stroke-width={width} stroke-linecap="round" stroke-linejoin="round" />
					<path
						d={g.d}
						fill="none"
						stroke="#f4d79c"
						stroke-width={3.4 / Math.max(0.6, S)}
						stroke-linecap="round"
						stroke-linejoin="round"
						filter="url(#glow)"
						opacity={0.35 + 0.65 * melt}
					/>
				</g>
			</g>
		{/each}
	</Svg>
	<Controls>
		<Slider bind:value={melt} min={0} max={1} step={0.01} label="shrink the thick letters" format={(v) => `${Math.round(v * 100)}%`} />
		<Button variant="gold" onclick={() => (sorted = !sorted)}>{sorted ? 'Unsort' : 'Sort by homotopy type'}</Button>
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.6rem;
	}
	.glyph {
		transition: transform 0.85s var(--ease);
	}
	.groups {
		opacity: 0;
		transition: opacity 0.6s var(--ease);
	}
	.groups.on {
		opacity: 1;
	}
</style>
