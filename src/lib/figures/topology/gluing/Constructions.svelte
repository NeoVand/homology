<script lang="ts">
	// Three ways to build new spaces by gluing: wedge sums, cones and suspensions.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';

	type Kind = 'wedge' | 'cone' | 'susp';
	type XId = 's0' | 'i' | 's1';
	let kind = $state<Kind>('cone');
	let X = $state<XId>('s1');
	let wedgeWith = $state<'circle' | 'sphere'>('circle');
	let t = $state(0.75);

	const e = $derived(t * t * (3 - 2 * t));
	const top = 70;
	const bot = 250;
	const cx = 300;
	const half = 82;
	const ry = 20;
	const mix = (a: number, b: number, s: number) => a + (b - a) * s;

	// how much the top (and, for the suspension, the bottom) has shrunk
	const sTop = $derived(kind === 'wedge' ? 0 : e);
	const sBot = $derived(kind === 'susp' ? e : 0);
	const wTop = $derived(half * (1 - sTop));
	const wBot = $derived(half * (1 - sBot));
	// the suspension of a circle reads better with a rounded waist
	const yTop = $derived(top);
	const yBot = $derived(bot);

	const resultTeX = $derived.by(() => {
		if (kind === 'wedge') return wedgeWith === 'circle' ? 'S^1\\vee S^1 \\;(\\text{a figure eight})' : 'S^2\\vee S^1';
		const name = { s0: 'S^0', i: 'I', s1: 'S^1' }[X];
		if (kind === 'cone') return `C${name} \\cong ${{ s0: 'I', i: 'D^2', s1: 'D^2' }[X]}`;
		return `\\Sigma ${name} \\cong ${{ s0: 'S^1', i: 'D^2', s1: 'S^2' }[X]}`;
	});

	// wedge: two shapes slide together until their base points meet
	const gapW = $derived(mix(150, 0, e));
	const R = 66;
</script>

<div class="cons">
	<Svg viewBox="0 0 600 320" maxHeight={340} label="Building new spaces: a cylinder over a space whose top (and bottom) shrink to points, or two spaces sliding together until two chosen points touch">
		{#if kind === 'wedge'}
			{@const lx = cx - R - gapW / 2}
			{@const rx = cx + R + gapW / 2}
			<circle cx={lx} cy={165} r={R} fill="rgba(116,169,255,0.06)" stroke="var(--blue)" stroke-width="3" />
			{#if wedgeWith === 'circle'}
				<circle cx={rx} cy={165} r={R} fill="rgba(116,169,255,0.06)" stroke="var(--blue)" stroke-width="3" />
			{:else}
				<defs>
					<radialGradient id="cons-sph" cx="38%" cy="35%" r="70%">
						<stop offset="0" stop-color="#bcd6ff" stop-opacity="0.55" />
						<stop offset="0.6" stop-color="#5c6fd6" stop-opacity="0.35" />
						<stop offset="1" stop-color="#1c2550" stop-opacity="0.5" />
					</radialGradient>
				</defs>
				<circle cx={rx} cy={165} r={R} fill="url(#cons-sph)" stroke="var(--blue)" stroke-width="2.4" />
				<ellipse cx={rx} cy={165} rx={R} ry={R * 0.28} fill="none" stroke="rgba(188,214,255,0.5)" stroke-dasharray="5 5" />
			{/if}
			<circle cx={lx + R} cy={165} r="7" fill="url(#vertex-fill)" stroke="#060912" filter="url(#glow)" />
			<circle cx={rx - R} cy={165} r="7" fill="url(#vertex-fill)" stroke="#060912" filter="url(#glow)" />
			{#if e < 0.98}
				<SvgTeX x={lx + R - 12} y={140} tex="x_0" size={15} w={30} h={20} color="var(--gold-bright)" />
				<SvgTeX x={rx - R + 12} y={140} tex="y_0" size={15} w={30} h={20} color="var(--gold-bright)" />
			{:else}
				<SvgTeX x={cx} y={140} tex={'x_0=y_0'} size={15} w={70} h={20} color="var(--gold-bright)" />
			{/if}
		{:else if X === 's0'}
			<!-- two points × I: two segments; their tops (and bottoms) are pulled together -->
			<line x1={cx - wBot} y1={yBot} x2={cx - wTop} y2={yTop} stroke="var(--blue)" stroke-width="3.2" stroke-linecap="round" />
			<line x1={cx + wBot} y1={yBot} x2={cx + wTop} y2={yTop} stroke="var(--blue)" stroke-width="3.2" stroke-linecap="round" />
		{:else if X === 'i'}
			<path d="M {cx - wBot} {yBot} L {cx + wBot} {yBot} L {cx + wTop} {yTop} L {cx - wTop} {yTop} Z" fill="rgba(116,169,255,0.14)" stroke="var(--blue)" stroke-width="2.4" stroke-linejoin="round" />
		{:else}
			<!-- a circle × I: a cylinder whose end circles shrink -->
			<path
				d="M {cx - wBot} {yBot} L {cx - wTop} {yTop} A {wTop} {ry * (wTop / half)} 0 0 1 {cx + wTop} {yTop} L {cx + wBot} {yBot} A {wBot} {ry * (wBot / half)} 0 0 1 {cx - wBot} {yBot} Z"
				fill="rgba(116,169,255,0.12)"
			/>
			<line x1={cx - wBot} y1={yBot} x2={cx - wTop} y2={yTop} stroke="var(--blue)" stroke-width="2.6" />
			<line x1={cx + wBot} y1={yBot} x2={cx + wTop} y2={yTop} stroke="var(--blue)" stroke-width="2.6" />
			<ellipse cx={cx} cy={yBot} rx={Math.max(0.01, wBot)} ry={Math.max(0.01, ry * (wBot / half))} fill="none" stroke={kind === 'susp' ? 'var(--gold-bright)' : 'var(--blue)'} stroke-width="2.6" />
			<ellipse cx={cx} cy={yTop} rx={Math.max(0.01, wTop)} ry={Math.max(0.01, ry * (wTop / half))} fill="none" stroke="var(--gold-bright)" stroke-width="2.6" filter="url(#glow)" />
		{/if}
		{#if kind !== 'wedge'}
			<!-- the end(s) being collapsed -->
			{#if X !== 's1'}
				{#if X === 'i'}
					<line x1={cx - wTop} y1={yTop} x2={cx + wTop} y2={yTop} stroke="var(--gold-bright)" stroke-width="4" stroke-linecap="round" filter="url(#glow)" />
					{#if kind === 'susp'}
						<line x1={cx - wBot} y1={yBot} x2={cx + wBot} y2={yBot} stroke="var(--gold-bright)" stroke-width="4" stroke-linecap="round" filter="url(#glow)" />
					{/if}
				{:else}
					<circle cx={cx - wTop} cy={yTop} r="6" fill="var(--gold-bright)" />
					<circle cx={cx + wTop} cy={yTop} r="6" fill="var(--gold-bright)" />
					{#if kind === 'susp'}
						<circle cx={cx - wBot} cy={yBot} r="6" fill="var(--gold-bright)" />
						<circle cx={cx + wBot} cy={yBot} r="6" fill="var(--gold-bright)" />
					{/if}
				{/if}
			{/if}
			{#if sTop > 0.97}
				<circle cx={cx} cy={yTop} r="8" fill="url(#vertex-fill)" stroke="#060912" filter="url(#glow-strong)" />
			{/if}
			{#if sBot > 0.97}
				<circle cx={cx} cy={yBot} r="8" fill="url(#vertex-fill)" stroke="#060912" filter="url(#glow-strong)" />
			{/if}
			<SvgTeX x={cx + half + 52} y={yTop} tex={'X\\times\\{1\\}'} size={14} w={90} h={22} color="var(--gold-bright)" />
			<SvgTeX x={cx + half + 52} y={yBot} tex={'X\\times\\{0\\}'} size={14} w={90} h={22} color={kind === 'susp' ? 'var(--gold-bright)' : 'var(--ink-dim)'} />
		{/if}
		<SvgTeX x={cx} y={298} tex={resultTeX} size={18} w={420} h={30} color="var(--ink-bright)" />
	</Svg>
	<div class="panel ui">
		<div class="row">
			<Segmented
				bind:value={kind}
				options={[
					{ value: 'wedge', label: 'Wedge sum' },
					{ value: 'cone', label: 'Cone' },
					{ value: 'susp', label: 'Suspension' }
				]}
				label="Construction"
			/>
			{#if kind === 'wedge'}
				<Segmented
					bind:value={wedgeWith}
					options={[
						{ value: 'circle', label: 'circle + circle' },
						{ value: 'sphere', label: 'circle + sphere' }
					]}
					label="Spaces"
				/>
			{:else}
				<Segmented
					bind:value={X}
					options={[
						{ value: 's0', label: 'X = two points' },
						{ value: 'i', label: 'X = interval' },
						{ value: 's1', label: 'X = circle' }
					]}
					label="X"
				/>
			{/if}
		</div>
		<Slider bind:value={t} min={0} max={1} step={0.005} label={kind === 'wedge' ? 'Bring the base points together' : 'Collapse the gold end(s) to a point'} format={(v) => `${Math.round(v * 100)}%`} />
	</div>
</div>

<style>
	.cons {
		padding: 0.6rem 0.6rem 0;
	}
	.panel {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		padding: 0.75rem 1rem 0.9rem;
		border-top: 1px solid var(--line-faint);
		background: rgba(5, 8, 16, 0.45);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 1rem;
	}
</style>
