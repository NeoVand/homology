<script lang="ts">
	// A glowing vector arrow from `from` to `to` (world coordinates).
	import { headPoints, shaftEnd } from './arrow';
	import type { V2, View } from './geom';

	let {
		view,
		from = [0, 0],
		to,
		color = '#a493ff',
		width = 3,
		head = 12,
		glow = true,
		dashed = false,
		opacity = 1
	}: {
		view: View;
		from?: V2;
		to: V2;
		color?: string;
		width?: number;
		head?: number;
		glow?: boolean;
		dashed?: boolean;
		opacity?: number;
	} = $props();

	const x0 = $derived(view.X(from[0]));
	const y0 = $derived(view.Y(from[1]));
	const x1 = $derived(view.X(to[0]));
	const y1 = $derived(view.Y(to[1]));
	const tiny = $derived(Math.hypot(x1 - x0, y1 - y0) < 2);
	const end = $derived(shaftEnd(x0, y0, x1, y1, head));
</script>

{#if !tiny}
	<g class="arrow" style="--ac:{color}; opacity:{opacity}">
		{#if glow}
			<line class="halo" x1={x0} y1={y0} x2={end[0]} y2={end[1]} stroke-width={width * 3.2} />
		{/if}
		<line
			class="shaft"
			x1={x0}
			y1={y0}
			x2={end[0]}
			y2={end[1]}
			stroke-width={width}
			stroke-dasharray={dashed ? '6 5' : undefined}
		/>
		<polygon class="head" points={headPoints(x1, y1, x1 - x0, y1 - y0, head)} />
	</g>
{/if}

<style>
	.arrow {
		pointer-events: none;
	}
	.halo {
		stroke: var(--ac);
		opacity: 0.18;
		stroke-linecap: round;
	}
	.shaft {
		stroke: var(--ac);
		stroke-linecap: round;
	}
	.head {
		fill: var(--ac);
		filter: drop-shadow(0 0 4px var(--ac));
	}
</style>
