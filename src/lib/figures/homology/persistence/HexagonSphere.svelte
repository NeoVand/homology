<script lang="ts">
	// Six evenly spaced points: at radius √3/2 ≤ r < 1 the Vietoris–Rips complex
	// joins every pair except opposite points, and the result is an octahedron —
	// a hollow 2-sphere that the data does not have.
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';

	const C = 130; // centre of each 260×250 panel
	const CY = 118;
	const R = 84;
	const hex = Array.from({ length: 6 }, (_, k) => [C + R * Math.cos((Math.PI * k) / 3), CY - R * Math.sin((Math.PI * k) / 3)]);
	const pairs: [number, number][] = [];
	for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) if (j - i !== 3) pairs.push([i, j]);
	const faces = [
		[0, 1, 2],
		[1, 2, 3],
		[2, 3, 4],
		[3, 4, 5],
		[4, 5, 0],
		[5, 0, 1],
		[0, 2, 4],
		[1, 3, 5]
	];
	const facePath = (f: number[], P: number[][]) => `M ${P[f[0]].join(' ')} L ${P[f[1]].join(' ')} L ${P[f[2]].join(' ')} Z`;

	// the same complex drawn as an octahedron: opposite points (0,3), (1,4), (2,5)
	// become opposite vertices
	const oct: number[][] = [];
	oct[0] = [C, CY - 94]; // top
	oct[3] = [C, CY + 94]; // bottom
	oct[1] = [C - 94, CY + 6]; // equator, in the cyclic order 1, 2, 4, 5
	oct[2] = [C - 26, CY + 34];
	oct[4] = [C + 94, CY - 6];
	oct[5] = [C + 26, CY - 34];
	const front = [
		[0, 1, 2],
		[0, 2, 4],
		[3, 1, 2],
		[3, 2, 4]
	];
	const back = [
		[0, 4, 5],
		[0, 5, 1],
		[3, 4, 5],
		[3, 5, 1]
	];
	const backEdges: [number, number][] = [
		[5, 0],
		[5, 3],
		[5, 1],
		[5, 4]
	];
	const frontEdges: [number, number][] = [
		[0, 1],
		[0, 2],
		[0, 4],
		[3, 1],
		[3, 2],
		[3, 4],
		[1, 2],
		[2, 4]
	];
	const lab = (P: number[][], i: number, d = 18): [number, number] => {
		const vx = P[i][0] - C;
		const vy = P[i][1] - CY;
		const L = Math.hypot(vx, vy) || 1;
		return [P[i][0] + (vx / L) * d, P[i][1] + (vy / L) * d];
	};
</script>

<div class="hs-wrap">
<div class="hs">
	<figure class="pnl">
		<svg viewBox="0 0 260 250" role="img" aria-label="Six points on a circle, joined by every edge except the three long diagonals">
			{#each faces as f, k (k)}
				<path d={facePath(f, hex)} fill="rgba(140, 150, 255, 0.07)" />
			{/each}
			{#each pairs as [i, j] (i + '-' + j)}
				<line x1={hex[i][0]} y1={hex[i][1]} x2={hex[j][0]} y2={hex[j][1]} class="e" />
			{/each}
			{#each [0, 1, 2] as i (i)}
				<line x1={hex[i][0]} y1={hex[i][1]} x2={hex[i + 3][0]} y2={hex[i + 3][1]} class="missing" />
			{/each}
			{#each hex as [x, y], i (i)}
				{@const [lx, ly] = lab(hex, i)}
				<circle cx={x} cy={y} r="5.5" class="v" />
				<SvgTeX x={lx} y={ly} tex={String(i)} size={16} color="var(--ink-bright)" w={24} h={22} />
			{/each}
		</svg>
		<figcaption class="ui">in the plane: it looks filled</figcaption>
	</figure>

	<div class="arrow" aria-hidden="true">
		<span class="r"><TeX tex="r = 0.9" /></span>
		<svg viewBox="0 0 80 50">
			<path d="M 8 32 C 28 16, 52 16, 72 30" />
			<path d="M 64 25.5 L 72.5 30.5 L 63 34" />
		</svg>
	</div>

	<figure class="pnl">
		<svg viewBox="0 0 260 250" role="img" aria-label="The same complex redrawn as a hollow octahedron">
			<defs>
				<radialGradient id="hs-face" cx="35%" cy="30%" r="80%">
					<stop offset="0" stop-color="#a493ff" stop-opacity="0.45" />
					<stop offset="1" stop-color="#5fd6cf" stop-opacity="0.18" />
				</radialGradient>
			</defs>
			{#each back as f, k (k)}
				<path d={facePath(f, oct)} fill="rgba(116, 150, 255, 0.05)" />
			{/each}
			{#each backEdges as [i, j] (i + '-' + j)}
				<line x1={oct[i][0]} y1={oct[i][1]} x2={oct[j][0]} y2={oct[j][1]} class="e back" />
			{/each}
			{#each front as f, k (k)}
				<path d={facePath(f, oct)} fill="url(#hs-face)" />
			{/each}
			{#each frontEdges as [i, j] (i + '-' + j)}
				<line x1={oct[i][0]} y1={oct[i][1]} x2={oct[j][0]} y2={oct[j][1]} class="e" />
			{/each}
			{#each [0, 1, 2, 3, 4, 5] as i (i)}
				{@const [lx, ly] = lab(oct, i, 18)}
				<circle cx={oct[i][0]} cy={oct[i][1]} r={i === 5 ? 4.5 : 5.5} class="v" class:far={i === 5} />
				<SvgTeX x={lx} y={ly} tex={String(i)} size={16} color={i === 5 ? 'var(--ink-faint)' : 'var(--ink-bright)'} w={24} h={22} />
			{/each}
		</svg>
		<figcaption class="ui">as it really is: a hollow octahedron</figcaption>
	</figure>
</div>
</div>

<style>
	.hs-wrap {
		container-type: inline-size;
	}
	.hs {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 4.5rem minmax(0, 1fr);
		align-items: center;
		gap: 0.2rem;
		padding: 0.9rem 1rem 0.6rem;
	}
	.pnl {
		margin: 0;
		min-width: 0;
		text-align: center;
	}
	.pnl svg {
		display: block;
		width: 100%;
		max-width: 300px;
		height: auto;
		margin: 0 auto;
		overflow: visible;
	}
	figcaption {
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		color: var(--ink-faint);
		margin-top: 0.2rem;
	}
	.arrow {
		text-align: center;
		color: var(--ink-dim);
		font-size: 0.85rem;
	}
	.arrow svg {
		display: block;
		width: 100%;
		height: auto;
		fill: none;
		stroke: var(--gold);
		stroke-width: 2;
		stroke-linecap: round;
	}
	.e {
		stroke: rgba(235, 229, 213, 0.75);
		stroke-width: 1.6;
		stroke-linecap: round;
	}
	.e.back {
		stroke: rgba(235, 229, 213, 0.3);
		stroke-dasharray: 4 4;
	}
	.missing {
		stroke: rgba(242, 141, 182, 0.55);
		stroke-width: 1.2;
		stroke-dasharray: 2 5;
	}
	.v {
		fill: #fff8e8;
		stroke: rgba(165, 128, 63, 0.95);
		stroke-width: 1.4;
	}
	.v.far {
		opacity: 0.6;
	}
	@container (max-width: 520px) {
		.hs {
			grid-template-columns: minmax(0, 1fr);
			gap: 0.6rem;
		}
		.arrow {
			display: flex;
			align-items: center;
			justify-content: center;
			gap: 0.6rem;
		}
		.arrow svg {
			width: 3rem;
			transform: rotate(90deg);
		}
	}
</style>
