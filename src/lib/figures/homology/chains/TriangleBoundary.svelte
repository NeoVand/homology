<script lang="ts">
	// Figure 3.2.2 (static) — ∂∂ of a triangle. The triangle [0,1,2] has three
	// edges; the edges have six endpoints; every vertex occurs exactly twice,
	// once with each sign, so ∂∂[0,1,2] = 0. Three stages that sit in a row on
	// wide screens and stack on phones.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';

	type P = [number, number];
	// stage 1: the triangle (0 bottom-left, 1 bottom-right, 2 top)
	const T: P[] = [
		[50, 170],
		[170, 170],
		[110, 66]
	];
	// stage 2: the three edges pulled apart from the centroid
	const sh = (p: P, dx: number, dy: number): P => [p[0] + dx, p[1] + dy];
	const e12: [P, P] = [sh(T[1], 14, -9), sh(T[2], 14, -9)]; // drawn from 1 to 2
	const e20: [P, P] = [sh(T[2], -14, -9), sh(T[0], -14, -9)]; // −[0,2], drawn from 2 to 0
	const e01: [P, P] = [sh(T[0], 0, 17), sh(T[1], 0, 17)]; // drawn from 0 to 1
	const mid = (s: [P, P]): P => [(s[0][0] + s[1][0]) / 2, (s[0][1] + s[1][1]) / 2];
	const path = (s: [P, P]) => `M ${s[0][0]} ${s[0][1]} L ${mid(s)[0]} ${mid(s)[1]} L ${s[1][0]} ${s[1][1]}`;
	// stage 3: six signed endpoints, grouped by vertex
	const groups = [
		{ v: 2, y: 66, terms: ['+', '-'] }, // +2 comes from [1,2], −2 from −[0,2]
		{ v: 1, y: 118, terms: ['-', '+'] }, // −1 comes from [1,2], +1 from [0,1]
		{ v: 0, y: 170, terms: ['+', '-'] } // +0 comes from −[0,2], −0 from [0,1]
	];
	const X = 40;
</script>

<div class="stages">
	<div class="stage">
		<Svg viewBox="0 30 220 200" maxHeight={230} label="A filled triangle with vertices 0, 1, 2 and a circular arrow showing its orientation.">
			<polygon points={T.map((p) => p.join(',')).join(' ')} class="tri" />
			<path d="M 97 140 A 22 22 0 1 0 123 140" class="spin" marker-end="url(#arrow-violet)" />
			{#each T as [x, y], v (v)}
				<circle cx={x} cy={y} r="6.5" class="v" />
			{/each}
			<SvgTeX x={36} y={184} tex="0" size={16} color="var(--ink-dim)" />
			<SvgTeX x={184} y={184} tex="1" size={16} color="var(--ink-dim)" />
			<SvgTeX x={110} y={46} tex="2" size={16} color="var(--ink-dim)" />
			<SvgTeX x={110} y={214} tex={String.raw`\chn{\sigma = [0,1,2]}`} size={17} w={190} />
		</Svg>
	</div>
	<div class="op"><span class="arr" aria-hidden="true">⟶</span><TeX tex={String.raw`\partial`} /></div>
	<div class="stage">
		<Svg viewBox="0 30 220 200" maxHeight={230} label="The three edges of the triangle pulled apart, each with an arrow: plus [1,2], minus [0,2], plus [0,1].">
			{#each [e12, e20, e01] as s, k (k)}
				<path d={path(s)} class="edge" marker-mid="url(#arrowmid-teal)" />
				{#each s as [x, y], j (j)}
					<circle cx={x} cy={y} r="4.5" class="v small" />
				{/each}
			{/each}
			<SvgTeX x={mid(e12)[0] + 30} y={mid(e12)[1] - 14} tex={String.raw`+[1,2]`} size={15} color="var(--teal)" w={80} />
			<SvgTeX x={mid(e20)[0] - 30} y={mid(e20)[1] - 14} tex={String.raw`-[0,2]`} size={15} color="var(--teal)" w={80} />
			<SvgTeX x={mid(e01)[0]} y={e01[0][1] + 19} tex={String.raw`+[0,1]`} size={15} color="var(--teal)" w={80} />
			<SvgTeX x={110} y={218} tex={String.raw`\bdy{\partial\sigma}`} size={17} w={120} />
		</Svg>
	</div>
	<div class="op"><span class="arr" aria-hidden="true">⟶</span><TeX tex={String.raw`\partial`} /></div>
	<div class="stage">
		<Svg viewBox="0 30 220 200" maxHeight={230} label="The six endpoints: vertex 2 appears as plus 2 and minus 2, vertex 1 as minus 1 and plus 1, vertex 0 as plus 0 and minus 0; each pair cancels.">
			{#each groups as g (g.v)}
				<SvgTeX x={X} y={g.y} tex={String.raw`${g.v}\!:`} size={16} color="var(--ink-dim)" w={40} />
				{#each g.terms as s, j (j)}
					<circle cx={X + 42 + j * 48} cy={g.y} r="14" class="term" class:minus={s === '-'} />
					<SvgTeX x={X + 42 + j * 48} y={g.y} tex={s === '+' ? `+${g.v}` : `-${g.v}`} size={14} color={s === '+' ? 'var(--gold-pale)' : 'var(--rose)'} w={40} />
				{/each}
				<path d="M {X + 42} {g.y - 17} Q {X + 66} {g.y - 33} {X + 90} {g.y - 17}" class="pair" />
				<SvgTeX x={X + 138} y={g.y} tex={String.raw`=\;0`} size={16} color="var(--gold-bright)" w={50} />
			{/each}
			<SvgTeX x={110} y={218} tex={String.raw`\cyc{\partial\partial\sigma = 0}`} size={17} w={170} />
		</Svg>
	</div>
</div>

<style>
	.stages {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.2rem;
		padding: 0.8rem 0.6rem 0.4rem;
	}
	.stage {
		flex: 1 1 0;
		min-width: 0;
		max-width: 240px;
	}
	.op {
		flex: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		color: var(--ink);
		font-size: 1.15rem;
		line-height: 1.1;
	}
	.arr {
		color: var(--ink-dim);
		font-size: 1.4rem;
	}
	@media (max-width: 560px) {
		.stages {
			flex-direction: column;
		}
		.stage {
			width: 100%;
			max-width: 250px;
		}
		.arr {
			transform: rotate(90deg);
		}
		.op {
			flex-direction: row;
			gap: 0.4rem;
		}
	}
	.tri {
		fill: rgba(164, 147, 255, 0.32);
		stroke: rgba(164, 147, 255, 0.9);
		stroke-width: 2;
		filter: drop-shadow(0 0 8px rgba(164, 147, 255, 0.35));
	}
	.spin {
		fill: none;
		stroke: var(--violet);
		stroke-width: 1.8;
	}
	.v {
		fill: url(#vertex-fill);
		stroke: rgba(6, 9, 18, 0.9);
		stroke-width: 1.3;
	}
	.v.small {
		stroke-width: 1;
	}
	.edge {
		fill: none;
		stroke: var(--teal);
		stroke-width: 3;
		stroke-linecap: round;
		filter: drop-shadow(0 0 4px rgba(95, 214, 207, 0.5));
	}
	.term {
		fill: rgba(242, 208, 143, 0.12);
		stroke: rgba(242, 208, 143, 0.7);
		stroke-width: 1.3;
	}
	.term.minus {
		fill: rgba(242, 141, 182, 0.12);
		stroke: rgba(242, 141, 182, 0.75);
	}
	.pair {
		fill: none;
		stroke: rgba(235, 229, 213, 0.45);
		stroke-width: 1.3;
		stroke-dasharray: 3 3;
	}
</style>
