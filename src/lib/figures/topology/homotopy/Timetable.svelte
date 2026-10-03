<script lang="ts">
	// Concatenating loops changes the *timetable*. Associativity: the two ways
	// of bracketing three loops differ only in timing, and sliding the
	// breakpoints is a homotopy. Inverses: α followed by α backwards shrinks by
	// turning back earlier and earlier.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import { pathD, type Pt } from './geom';

	let mode = $state<'assoc' | 'inverse'>('assoc');
	let u = $state(0.35);

	// square diagram: s horizontal (time along the loop), t vertical (homotopy time)
	const X0 = 70;
	const Y0 = 40;
	const SZ = 230;
	const sx = (s: number) => X0 + s * SZ;
	const ty = (t: number) => Y0 + (1 - t) * SZ;

	// associativity breakpoints
	const b1 = $derived(0.25 + 0.25 * u);
	const b2 = $derived(0.5 + 0.25 * u);

	// a small loop α in the plane, based at x0 (for the inverse picture)
	const LX = 470;
	const LY = 150;
	const alpha = (f: number): Pt => {
		const th = 2 * Math.PI * f;
		return [LX + 62 * Math.sin(th) + 18 * Math.sin(2 * th), LY - 70 * (1 - Math.cos(th)) * 0.62 - 10 * Math.sin(3 * th) * f];
	};
	const alphaPts = Array.from({ length: 121 }, (_, i) => alpha(i / 120));
	const reach = $derived(1 - u); // how far along α the stage-u path goes
	const reachPts = $derived(Array.from({ length: 81 }, (_, i) => alpha((i / 80) * reach)));

	// shading for the inverse square: how far along α the point is at (s, t)
	const cells = Array.from({ length: 24 }, (_, i) => i);
	const far = (s: number, t: number) => (1 - t) * (1 - Math.abs(2 * s - 1));
</script>

<div class="wrap">
	<Svg viewBox="0 0 620 330" maxHeight={420} label="Timetables of concatenated loops and the homotopies between them">
		<defs>
			<linearGradient id="tt-a" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0" stop-color="#f2d08f" stop-opacity="0.34" />
				<stop offset="1" stop-color="#f2d08f" stop-opacity="0.2" />
			</linearGradient>
			<linearGradient id="tt-b" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0" stop-color="#5fd6cf" stop-opacity="0.34" />
				<stop offset="1" stop-color="#5fd6cf" stop-opacity="0.2" />
			</linearGradient>
			<linearGradient id="tt-c" x1="0" x2="0" y1="0" y2="1">
				<stop offset="0" stop-color="#a493ff" stop-opacity="0.36" />
				<stop offset="1" stop-color="#a493ff" stop-opacity="0.22" />
			</linearGradient>
		</defs>

		{#if mode === 'assoc'}
			<!-- regions of the homotopy square -->
			<path d="M{sx(0)} {ty(0)} L{sx(0.25)} {ty(0)} L{sx(0.5)} {ty(1)} L{sx(0)} {ty(1)} Z" fill="url(#tt-a)" />
			<path d="M{sx(0.25)} {ty(0)} L{sx(0.5)} {ty(0)} L{sx(0.75)} {ty(1)} L{sx(0.5)} {ty(1)} Z" fill="url(#tt-b)" />
			<path d="M{sx(0.5)} {ty(0)} L{sx(1)} {ty(0)} L{sx(1)} {ty(1)} L{sx(0.75)} {ty(1)} Z" fill="url(#tt-c)" />
			<line x1={sx(0.25)} y1={ty(0)} x2={sx(0.5)} y2={ty(1)} stroke="rgba(235,229,213,0.5)" stroke-width="1.2" />
			<line x1={sx(0.5)} y1={ty(0)} x2={sx(0.75)} y2={ty(1)} stroke="rgba(235,229,213,0.5)" stroke-width="1.2" />
			<rect x={X0} y={Y0} width={SZ} height={SZ} fill="none" stroke="rgba(216,178,110,0.45)" />
			<SvgTeX x={sx(0.25) - 34} y={ty(0.5)} tex={String.raw`\cyc{\alpha}`} size={20} w={30} h={28} />
			<SvgTeX x={sx(0.5)} y={ty(0.5)} tex={String.raw`\bdy{\beta}`} size={20} w={30} h={28} />
			<SvgTeX x={sx(0.75) + 34} y={ty(0.5)} tex={String.raw`\chn{\gamma}`} size={20} w={30} h={28} />
			<SvgTeX x={sx(0.5)} y={ty(0) + 22} tex={String.raw`(\alpha\cdot\beta)\cdot\gamma`} size={15} w={130} h={24} />
			<SvgTeX x={sx(0.5)} y={ty(1) - 20} tex={String.raw`\alpha\cdot(\beta\cdot\gamma)`} size={15} w={130} h={24} />
			<SvgTeX x={sx(0) - 34} y={ty(0)} tex="t=0" size={13} w={50} h={20} color="var(--ink-dim)" />
			<SvgTeX x={sx(0) - 34} y={ty(1)} tex="t=1" size={13} w={50} h={20} color="var(--ink-dim)" />
			<SvgTeX x={sx(0)} y={ty(0) + 44} tex="s=0" size={12} w={40} h={18} color="var(--ink-faint)" />
			<SvgTeX x={sx(1)} y={ty(0) + 44} tex="s=1" size={12} w={40} h={18} color="var(--ink-faint)" />
			<!-- scan line at t = u -->
			<line x1={sx(0) - 6} x2={sx(1) + 6} y1={ty(u)} y2={ty(u)} stroke="#fbf6e8" stroke-width="2" />
			<circle cx={sx(b1)} cy={ty(u)} r="4" fill="#fbf6e8" />
			<circle cx={sx(b2)} cy={ty(u)} r="4" fill="#fbf6e8" />

			<!-- the timetable at stage u -->
			<g transform="translate(360 70)">
				<text x="0" y="-14" class="t-ui">THE TIMETABLE AT STAGE t</text>
				{#each [[0, b1, '#f2d08f', String.raw`\alpha`], [b1, b2, '#5fd6cf', String.raw`\beta`], [b2, 1, '#a493ff', String.raw`\gamma`]] as seg, k (k)}
					{@const a = seg[0] as number}
					{@const b = seg[1] as number}
					<rect x={a * 230} y="0" width={(b - a) * 230 - 2} height="30" rx="5" fill={seg[2] as string} fill-opacity="0.28" stroke={seg[2] as string} stroke-width="1.4" />
					<SvgTeX x={((a + b) / 2) * 230} y={15} tex={seg[3] as string} size={16} w={40} h={24} />
					<SvgTeX
						x={((a + b) / 2) * 230}
						y={50}
						tex={String.raw`\times ${(1 / (b - a)).toFixed(1)}`}
						size={12}
						w={60}
						h={18}
						color="var(--ink-dim)"
					/>
				{/each}
				<text x="-10" y="54" text-anchor="end" class="t-ui">speed</text>
				<foreignObject x="0" y="96" width="240" height="130">
					<p class="side ui">
						Each loop is run at a speed that makes the whole trip last one unit of time. Sliding the two breakpoints changes nothing but the
						timing — and that sliding is itself a homotopy.
					</p>
				</foreignObject>
			</g>
		{:else}
			<!-- the inverse: shade by how far along α the point has got -->
			{#each cells as i (i)}
				{#each cells as j (j)}
					{@const s = (i + 0.5) / 24}
					{@const t = (j + 0.5) / 24}
					<rect
						x={sx(i / 24)}
						y={ty((j + 1) / 24)}
						width={SZ / 24 + 0.6}
						height={SZ / 24 + 0.6}
						fill="#f2d08f"
						fill-opacity={0.04 + 0.5 * far(s, t)}
					/>
				{/each}
			{/each}
			<rect x={X0} y={Y0} width={SZ} height={SZ} fill="none" stroke="rgba(216,178,110,0.45)" />
			<path d="M{sx(0)} {ty(0)} L{sx(0.5)} {ty(1)} L{sx(1)} {ty(0)}" fill="none" stroke="rgba(235,229,213,0.35)" stroke-dasharray="4 4" />
			<SvgTeX x={sx(0.5)} y={ty(0) + 22} tex={String.raw`\alpha\cdot\bar\alpha`} size={16} w={80} h={24} />
			<SvgTeX x={sx(0.5)} y={ty(1) - 20} tex={String.raw`\text{constant loop at } x_0`} size={14} w={180} h={24} />
			<SvgTeX x={sx(0) - 34} y={ty(0)} tex="t=0" size={13} w={50} h={20} color="var(--ink-dim)" />
			<SvgTeX x={sx(0) - 34} y={ty(1)} tex="t=1" size={13} w={50} h={20} color="var(--ink-dim)" />
			<line x1={sx(0) - 6} x2={sx(1) + 6} y1={ty(u)} y2={ty(u)} stroke="#fbf6e8" stroke-width="2" />
			<!-- the loop α and the stage-u path: out to a fraction (1 − t) of α, then back -->
			<path d={pathD(alphaPts)} fill="none" stroke="rgba(242,208,143,0.3)" stroke-width="2" stroke-dasharray="5 5" />
			{#if reach > 0.004}
				<path d={pathD(reachPts)} fill="none" stroke="#f2d08f" stroke-width="3.4" filter="url(#glow)" stroke-linecap="round" />
				{@const tip = alpha(reach)}
				<circle cx={tip[0]} cy={tip[1]} r="5" fill="#f28db6" />
				<SvgTeX x={tip[0] + 26} y={tip[1] - 10} tex={String.raw`\text{turn back}`} size={12} w={80} h={18} color="var(--rose)" />
			{/if}
			<circle cx={LX} cy={LY} r="6" fill="url(#vertex-fill)" stroke="#060912" />
			<SvgTeX x={LX} y={LY + 22} tex="x_0" size={15} w={30} h={22} />
			<SvgTeX x={LX + 92} y={LY - 70} tex={String.raw`\cyc{\alpha}`} size={18} w={30} h={24} />
			<foreignObject x="370" y="200" width="240" height="120">
				<p class="side ui">
					At stage <em>t</em> the path runs out along α, turns back after a fraction 1 − t of the way, and retraces its steps. At t = 1 it
					never leaves x₀.
				</p>
			</foreignObject>
		{/if}
	</Svg>
	<Controls>
		<Segmented
			bind:value={mode}
			options={[
				{ value: 'assoc', label: 'Associativity' },
				{ value: 'inverse', label: 'Inverses' }
			]}
			label="Which homotopy"
		/>
		<Slider bind:value={u} min={0} max={1} step={0.005} label="homotopy time t" format={(v) => v.toFixed(2)} />
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.6rem;
	}
	.side {
		margin: 0;
		font-size: 12.5px;
		line-height: 1.5;
		color: var(--ink-dim);
	}
</style>
