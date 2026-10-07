<script lang="ts">
	// The anatomy of a chain complex: each C_k contains the cycles Z_k, which
	// contain the boundaries B_k. ∂_{k+1} maps all of C_{k+1} onto B_k, and
	// crushes Z_{k+1} to 0. The rose ring Z_k ∖ B_k is what homology measures.
	// Drawn left-to-right on wide screens and top-to-bottom on phones.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';

	const names = [2, 1, 0];
	const label =
		'Three chain groups C2, C1, C0 drawn as ovals. Inside each is a smaller gold oval of cycles Z, and inside that a teal oval of boundaries B. The boundary map sends all of C2 onto B1 and crushes Z2 to zero, and likewise from C1 to C0.';

	interface Layout {
		vertical: boolean;
		/** centres of the three ovals */
		c: [number, number][];
		/** radii along / across the flow */
		C: { a: number; b: number };
		Z: { a: number; b: number };
		B: { a: number; b: number };
	}
	const H: Layout = {
		vertical: false,
		c: [
			[190, 236],
			[470, 236],
			[750, 236]
		],
		C: { a: 118, b: 150 },
		Z: { a: 82, b: 106 },
		B: { a: 40, b: 54 }
	};
	const V: Layout = {
		vertical: true,
		c: [
			[250, 150],
			[250, 450],
			[250, 750]
		],
		C: { a: 112, b: 168 },
		Z: { a: 78, b: 120 },
		B: { a: 38, b: 60 }
	};
	// map (along, across) offsets to screen coordinates
	const P = (L: Layout, k: number, along: number, across: number): [number, number] =>
		L.vertical ? [L.c[k][0] + across, L.c[k][1] + along] : [L.c[k][0] + along, L.c[k][1] + across];
	const rx = (L: Layout, e: { a: number; b: number }) => (L.vertical ? e.b : e.a);
	const ry = (L: Layout, e: { a: number; b: number }) => (L.vertical ? e.a : e.b);

	function funnel(L: Layout, k: number) {
		const a0 = L.C.a * 0.93;
		const b1 = -L.B.a * 0.82;
		const s0 = L.C.b * 0.42;
		const s1 = L.B.b * 0.62;
		const p = (along: number, across: number, kk: number) => P(L, kk, along, across).join(' ');
		return `M ${p(a0, -s0, k)} C ${p(a0 + 80, -s0, k)} ${p(b1 - 70, -s1, k + 1)} ${p(b1, -s1, k + 1)} L ${p(b1, s1, k + 1)} C ${p(b1 - 70, s1, k + 1)} ${p(a0 + 80, s0, k)} ${p(a0, s0, k)} Z`;
	}
	function crush(L: Layout, k: number, side: number) {
		const a = L.Z.a * 0.5;
		const s = side * L.Z.b * 0.76;
		const q = (along: number, across: number, kk: number) => P(L, kk, along, across).join(' ');
		return `M ${q(a, s, k)} C ${q(a + 110, s + side * 22, k)} ${q(-90, side * 30, k + 1)} ${q(-8, side * 3, k + 1)}`;
	}
	function arrow(L: Layout, k: number): [number, number, number, number] {
		if (L.vertical) {
			const x = L.c[k][0] - L.C.b - 22;
			return [x, L.c[k][1] + 70, x, L.c[k + 1][1] - 70];
		}
		const y = L.c[k][1] - L.C.b - 10;
		return [L.c[k][0] + 62, y, L.c[k + 1][0] - 62, y];
	}
</script>

{#snippet diagram(L: Layout)}
	<defs>
		<linearGradient id="ccd-funnel-{L.vertical ? 'v' : 'h'}" x1="0" x2={L.vertical ? 0 : 1} y1="0" y2={L.vertical ? 1 : 0}>
			<stop offset="0" stop-color="#5fd6cf" stop-opacity="0.04" />
			<stop offset="0.6" stop-color="#5fd6cf" stop-opacity="0.14" />
			<stop offset="1" stop-color="#5fd6cf" stop-opacity="0.32" />
		</linearGradient>
		<radialGradient id="ccd-c-{L.vertical ? 'v' : 'h'}" cx="50%" cy="40%" r="65%">
			<stop offset="0" stop-color="#1b2748" stop-opacity="0.9" />
			<stop offset="1" stop-color="#0c1222" stop-opacity="0.75" />
		</radialGradient>
	</defs>
	{#each L.c as [x, y], k (k)}
		<!-- in C_0 every chain is a cycle (∂_0 = 0), so Z_0 fills C_0 -->
		{@const Zk = k === 2 ? { a: L.C.a - 7, b: L.C.b - 7 } : L.Z}
		<ellipse cx={x} cy={y} rx={rx(L, L.C)} ry={ry(L, L.C)} fill="url(#ccd-c-{L.vertical ? 'v' : 'h'})" stroke="rgba(164,147,255,0.6)" stroke-width="2.2" />
		<ellipse cx={x} cy={y} rx={rx(L, Zk)} ry={ry(L, Zk)} fill="rgba(242,141,182,0.17)" stroke="var(--gold-bright)" stroke-width="2.4" stroke-dasharray="7 5" />
		<ellipse cx={x} cy={y} rx={rx(L, L.B)} ry={ry(L, L.B)} fill="rgba(95,214,207,0.3)" stroke="var(--teal)" stroke-width="2" />
		{#if L.vertical}
			<SvgTeX x={x + L.C.b + 30} y={y - L.C.a + 6} tex={`C_${names[k]}`} size={34} color="var(--violet)" w={80} />
			{#if k === 2}
				<SvgTeX x={x} y={y - Zk.a + 30} tex={'Z_0 = C_0'} size={25} color="var(--gold-bright)" w={140} />
			{:else}
				<SvgTeX x={x - Zk.b + 34} y={y} tex={`Z_${names[k]}`} size={27} color="var(--gold-bright)" w={60} />
			{/if}
			<SvgTeX x={x} y={y - 28} tex={`B_${names[k]}`} size={24} color="var(--teal)" w={60} />
			<SvgTeX x={x + L.Z.b - 46} y={y + 2} tex={'\\text{holes}'} size={20} color="var(--rose)" w={90} />
		{:else}
			<SvgTeX x={x} y={y - L.C.b - 24} tex={`C_${names[k]}`} size={30} color="var(--violet)" w={80} />
			<SvgTeX x={x} y={y - Zk.b + 24} tex={k === 2 ? 'Z_0 = C_0' : `Z_${names[k]}`} size={23} color="var(--gold-bright)" w={k === 2 ? 130 : 60} />
			<SvgTeX x={x} y={y - 28} tex={`B_${names[k]}`} size={20} color="var(--teal)" w={60} />
			<SvgTeX x={x} y={y + L.Z.b - 32} tex={'\\text{holes}'} size={17} color="var(--rose)" w={90} />
		{/if}
	{/each}
	{#each [0, 1] as k (k)}
		{@const [x1, y1, x2, y2] = arrow(L, k)}
		<path d={funnel(L, k)} fill="url(#ccd-funnel-{L.vertical ? 'v' : 'h'})" stroke="rgba(95,214,207,0.45)" stroke-width="1.2" />
		<path d={crush(L, k, -1)} fill="none" stroke="var(--gold)" stroke-width="1.7" stroke-dasharray="4 4" marker-end="url(#arrow-gold)" />
		<path d={crush(L, k, 1)} fill="none" stroke="var(--gold)" stroke-width="1.7" stroke-dasharray="4 4" marker-end="url(#arrow-gold)" />
		<line {x1} {y1} {x2} {y2} stroke="var(--ink-dim)" stroke-width="2" marker-end="url(#arrow-ivory)" />
		{#if L.vertical}
			<SvgTeX x={x1 - 26} y={(y1 + y2) / 2} tex={`\\partial_${names[k]}`} size={28} color="var(--ink-bright)" w={56} />
		{:else}
			<SvgTeX x={(x1 + x2) / 2} y={y1 - 22} tex={`\\partial_${names[k]}`} size={24} color="var(--ink-bright)" w={50} />
		{/if}
	{/each}
	{#each L.c as [x, y], k (k)}
		<circle cx={x} cy={y} r="5.5" fill="var(--ink-bright)" filter="url(#glow)" />
		<SvgTeX x={x + 16} y={y + 2} tex="0" size={L.vertical ? 20 : 17} color="var(--ink-bright)" w={20} anchor="start" />
	{/each}
{/snippet}

<div class="ccd">
	<div class="wide">
		<Svg viewBox="0 0 940 440" maxHeight={440} {label}>
			<line x1="12" y1={236} x2={190 - 118 - 10} y2={236} stroke="var(--ink-faint)" stroke-width="2" marker-end="url(#arrow-dim)" />
			<SvgTeX x={36} y={214} tex={'\\partial_3'} size={22} color="var(--ink-faint)" w={40} />
			<line x1={750 + 118 + 10} y1={236} x2="928" y2={236} stroke="var(--ink-faint)" stroke-width="2" marker-end="url(#arrow-dim)" />
			<SvgTeX x={904} y={214} tex={'\\partial_0'} size={22} color="var(--ink-faint)" w={40} />
			<SvgTeX x={918} y={260} tex="0" size={20} color="var(--ink-faint)" w={30} />
			{@render diagram(H)}
			<SvgTeX x={470} y={416} tex={'Z_k = \\ker \\partial_k \\;\\supseteq\\; B_k = \\im \\partial_{k+1}'} size={21} color="var(--ink)" w={460} />
		</Svg>
	</div>
	<div class="tall">
		<Svg viewBox="0 0 500 960" maxHeight={900} {label}>
			{@render diagram(V)}
			<SvgTeX x={250} y={935} tex={'Z_k = \\ker \\partial_k \\;\\supseteq\\; B_k = \\im \\partial_{k+1}'} size={24} color="var(--ink)" w={460} />
		</Svg>
	</div>
</div>

<style>
	.tall {
		display: none;
		padding: 0.6rem 0.4rem 0.4rem;
	}
	@media (max-width: 600px) {
		.wide {
			display: none;
		}
		.tall {
			display: block;
		}
	}
</style>
