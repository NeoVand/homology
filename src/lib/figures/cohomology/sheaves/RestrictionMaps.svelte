<script lang="ts">
	// Static figure: a presheaf in one picture. Open sets shrink going down
	// (W ⊂ V ⊂ U, inclusions point up); data restricts going down — the
	// arrows of a presheaf run against the inclusions.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';

	const X0 = 120;
	const X1 = 450;
	const sx = (t: number) => X0 + (X1 - X0) * (t / 10);
	const f = (t: number) => 0.9 * Math.sin(t * 0.9) + 0.35 * Math.cos(2.1 * t + 0.4);
	const rows = [
		{ name: 'U', a: 0.4, b: 9.6, y: 70, c: 'var(--violet)' },
		{ name: 'V', a: 2.2, b: 7.4, y: 175, c: 'var(--blue)' },
		{ name: 'W', a: 3.6, b: 5.9, y: 280, c: 'var(--teal)' }
	];
	function curve(a: number, b: number, y0: number) {
		const n = 80;
		let d = '';
		for (let i = 0; i <= n; i++) {
			const t = a + ((b - a) * i) / n;
			d += `${i ? 'L' : 'M'} ${sx(t).toFixed(1)} ${(y0 - 26 * f(t)).toFixed(1)} `;
		}
		return d;
	}
</script>

<Svg viewBox="0 0 640 340" maxHeight={380} label="Three nested open intervals W inside V inside U, each carrying the same function cut down to it. Inclusions point up the page; restriction maps point down.">
	{#each rows as r, i (r.name)}
		<line x1={sx(0)} y1={r.y + 36} x2={sx(10)} y2={r.y + 36} stroke="rgba(235,229,213,0.15)" />
		<line x1={sx(r.a)} y1={r.y + 36} x2={sx(r.b)} y2={r.y + 36} stroke={r.c} stroke-width="6" stroke-linecap="round" opacity="0.9" />
		<circle cx={sx(r.a)} cy={r.y + 36} r="5" fill="#0b1020" stroke={r.c} stroke-width="2" />
		<circle cx={sx(r.b)} cy={r.y + 36} r="5" fill="#0b1020" stroke={r.c} stroke-width="2" />
		<path d={curve(r.a, r.b, r.y)} stroke="var(--gold-bright)" stroke-width="2.6" fill="none" filter="url(#glow)" />
		<SvgTeX x={X0 - 40} y={r.y + 36} tex={r.name} size={22} color={r.c} w={40} />
		<SvgTeX
			x={X1 + 30}
			y={r.y + 4}
			tex={i === 0 ? 's \\in F(U)' : i === 1 ? 's|_V \\in F(V)' : 's|_W \\in F(W)'}
			size={15}
			color="var(--gold-bright)"
			w={120}
			anchor="start"
		/>
		{#if i < 2}
			<!-- restriction: down, on the right -->
			<line x1={X1 + 74} y1={r.y + 30} x2={X1 + 74} y2={r.y + 82} stroke="var(--gold-bright)" stroke-width="2" marker-end="url(#arrow-gold)" />
			<SvgTeX x={X1 + 84} y={r.y + 56} tex={'\\text{restrict}'} size={13} color="var(--ink-dim)" w={70} anchor="start" />
			<!-- inclusion: up, on the left -->
			<line x1={X0 - 40} y1={r.y + 119} x2={X0 - 40} y2={r.y + 60} stroke="var(--ink-faint)" stroke-width="1.6" marker-end="url(#arrow-dim)" />
			<SvgTeX x={X0 - 50} y={r.y + 90} tex={'\\text{inside}'} size={12} color="var(--ink-faint)" w={30} anchor="end" />
		{/if}
	{/each}
</Svg>
