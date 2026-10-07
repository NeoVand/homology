<script lang="ts">
	// Three ways to measure distance in the plane, and their unit balls.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';

	const B = 38; // block size
	const ox = 34;
	const oy = 46;
	const A: [number, number] = [ox + 1 * B, oy + 4 * B];
	const Bp: [number, number] = [ox + 5 * B, oy + 1 * B];
	const cx = 486;
	const cy = 160;
	const u = 96;
	// on narrow plates the two panels stack, so each can be drawn larger
	let cw = $state(800);
	const narrow = $derived(cw < 520);
</script>

<div bind:clientWidth={cw}>
	<Svg viewBox={narrow ? '0 0 300 590' : '0 0 640 320'} maxHeight={narrow ? 680 : 360} label="Left: a city grid where a taxi from A to B must drive 7 blocks although the straight-line distance is 5. Right: the unit balls of the straight-line, taxicab and max distances: a disk, a diamond and a square">
		<!-- city -->
		{#each Array(6) as _, i (i)}
			{#each Array(4) as _, j (j)}
				<rect x={ox + i * B + 5} y={oy + j * B + 5} width={B - 10} height={B - 10} rx="3" fill="rgba(116,169,255,0.07)" stroke="rgba(116,169,255,0.16)" />
			{/each}
		{/each}
		{#each Array(7) as _, i (i)}
			<line x1={ox + i * B} y1={oy} x2={ox + i * B} y2={oy + 4 * B} stroke="rgba(200,192,170,0.18)" />
		{/each}
		{#each Array(5) as _, j (j)}
			<line x1={ox} y1={oy + j * B} x2={ox + 6 * B} y2={oy + j * B} stroke="rgba(200,192,170,0.18)" />
		{/each}
		<!-- taxi route: 4 blocks east, 3 north (any staircase is as long) -->
		<polyline
			points="{A[0]},{A[1]} {A[0] + 2 * B},{A[1]} {A[0] + 2 * B},{A[1] - 2 * B} {A[0] + 4 * B},{A[1] - 2 * B} {A[0] + 4 * B},{A[1] - 3 * B}"
			fill="none"
			stroke="var(--teal)"
			stroke-width="3.5"
			stroke-linejoin="round"
			filter="url(#glow)"
		/>
		<line x1={A[0]} y1={A[1]} x2={Bp[0]} y2={Bp[1]} stroke="var(--gold-bright)" stroke-width="2.4" stroke-dasharray="7 6" />
		<circle cx={A[0]} cy={A[1]} r="6.5" fill="url(#vertex-fill)" stroke="#060912" />
		<circle cx={Bp[0]} cy={Bp[1]} r="6.5" fill="url(#vertex-fill)" stroke="#060912" />
		<SvgTeX x={A[0] - 14} y={A[1] + 16} tex="A" size={16} color="var(--ink-bright)" w={20} h={20} />
		<SvgTeX x={Bp[0] + 14} y={Bp[1] - 14} tex="B" size={16} color="var(--ink-bright)" w={20} h={20} />
		<SvgTeX x={ox + 3 * B} y={oy + 4 * B + 34} tex={'\\cyc{d_2(A,B)=\\sqrt{4^2+3^2}=5}'} size={14} w={260} h={24} />
		<SvgTeX x={ox + 3 * B} y={oy + 4 * B + 60} tex={'\\bdy{d_1(A,B)=4+3=7}'} size={14} w={260} h={24} />
		<text x={ox} y={26} class="t-ui">A TAXI RIDE</text>

		<!-- unit balls (below the city on narrow plates) -->
		<g transform={narrow ? 'translate(-338 280)' : undefined}>
			<text x={cx - u - 20} y={26} class="t-ui">BALLS OF RADIUS 1</text>
			<rect x={cx - u} y={cy - u} width={2 * u} height={2 * u} fill="rgba(164,147,255,0.07)" stroke="var(--violet)" stroke-width="2.2" />
			<circle cx={cx} cy={cy} r={u} fill="rgba(242,208,143,0.08)" stroke="var(--gold-bright)" stroke-width="2.4" filter="url(#glow)" />
			<path d="M {cx - u} {cy} L {cx} {cy - u} L {cx + u} {cy} L {cx} {cy + u} Z" fill="rgba(95,214,207,0.1)" stroke="var(--teal)" stroke-width="2.4" />
			<circle cx={cx} cy={cy} r="4" fill="var(--ink-bright)" />
			<SvgTeX x={cx + 12} y={cy + 12} tex="x" size={14} color="var(--ink-bright)" w={16} h={18} />
			<SvgTeX x={cx + u + 8} y={cy - u + 10} tex={'\\chn{d_\\infty}'} size={14} w={40} h={22} anchor="start" />
			<SvgTeX x={cx + 0.76 * u} y={cy - 0.76 * u - 10} tex={'\\cyc{d_2}'} size={14} w={30} h={22} anchor="start" />
			<SvgTeX x={cx + 0.5 * u + 6} y={cy - 0.5 * u + 12} tex={'\\bdy{d_1}'} size={14} w={30} h={22} anchor="start" />
			<SvgTeX x={cx} y={cy + u + 30} tex={'\\bdy{\\lozenge}\\subset\\cyc{\\bigcirc}\\subset\\chn{\\square}'} size={16} w={200} h={26} />
		</g>
	</Svg>
</div>
