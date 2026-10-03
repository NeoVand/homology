<script lang="ts">
	// The circle as the union of two overlapping arcs U (upper) and V (lower).
	// Their intersection has two pieces. The loop z splits as u + v, and the
	// connecting map sends [z] to [∂u] = [p] − [q] in H₀(U ∩ V).
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';

	const C: [number, number] = [200, 160];
	const R = 108;
	const pt = (deg: number, r = R): [number, number] => {
		const t = (deg * Math.PI) / 180;
		return [C[0] + r * Math.cos(t), C[1] - r * Math.sin(t)];
	};
	/** arc from a to b degrees (counterclockwise on screen) at radius r */
	const arc = (a: number, b: number, r: number) => {
		const p = pt(a, r);
		const q = pt(b, r);
		const large = b - a > 180 ? 1 : 0;
		return `M ${p[0]} ${p[1]} A ${r} ${r} 0 ${large} 0 ${q[0]} ${q[1]}`;
	};
	const p = pt(180);
	const q = pt(0);
	const chev = (deg: number, r = R) => {
		// small arrowhead pointing counterclockwise at angle deg
		const t = (deg * Math.PI) / 180;
		const [x, y] = pt(deg, r);
		const ux = -Math.sin(t);
		const uy = -Math.cos(t); // screen direction of increasing angle
		return `M ${x - ux * 7 - uy * 6} ${y - uy * 7 + ux * 6} L ${x + ux * 4} ${y + uy * 4} L ${x - ux * 7 + uy * 6} ${y - uy * 7 - ux * 6}`;
	};
</script>

<Svg viewBox="0 0 400 330" maxHeight={360} label="A circle covered by two overlapping arcs U and V; their overlap has two pieces">
	<!-- the two open sets, drawn as wide translucent bands slightly off the circle -->
	<path d={arc(-24, 204, R + 14)} class="u" />
	<path d={arc(156, 384, R - 14)} class="v" />
	<!-- the overlap: two short arcs -->
	<path d={arc(156, 204, R)} class="w" />
	<path d={arc(-24, 24, R)} class="w" />
	<!-- the loop z = u + v -->
	<path d={arc(0, 180, R)} class="loop u-part" />
	<path d={arc(180, 360, R)} class="loop v-part" />
	<path d={chev(90)} class="chev up" />
	<path d={chev(270)} class="chev vp" />
	<circle cx={p[0]} cy={p[1]} r="6" class="pt" />
	<circle cx={q[0]} cy={q[1]} r="6" class="pt" />
	<SvgTeX x={p[0] - 22} y={p[1]} tex={'p'} size={18} color="var(--gold-bright)" w={24} h={26} />
	<SvgTeX x={q[0] + 22} y={q[1]} tex={'q'} size={18} color="var(--gold-bright)" w={24} h={26} />
	<SvgTeX x={C[0]} y={C[1] - R - 34} tex={'U'} size={19} color="var(--blue)" w={30} h={26} />
	<SvgTeX x={C[0]} y={C[1] + R + 32} tex={'V'} size={19} color="var(--violet)" w={30} h={26} />
	<SvgTeX x={C[0]} y={C[1] - R + 22} tex={'u'} size={17} color="var(--blue)" w={30} h={24} />
	<SvgTeX x={C[0]} y={C[1] + R - 22} tex={'v'} size={17} color="var(--violet)" w={30} h={24} />
	<SvgTeX x={C[0]} y={C[1] - 12} tex={'z = u + v'} size={17} color="var(--ink-bright)" w={120} h={26} />
	<SvgTeX x={C[0]} y={C[1] + 16} tex={'\\partial u = p - q'} size={16} color="var(--gold-bright)" w={140} h={26} />
	<SvgTeX x={C[0] + 150} y={C[1] - 50} tex={'U\\cap V'} size={14} color="var(--gold-bright)" w={70} h={22} />
</Svg>

<style>
	.u {
		fill: none;
		stroke: rgba(116, 169, 255, 0.35);
		stroke-width: 16;
		stroke-linecap: round;
	}
	.v {
		fill: none;
		stroke: rgba(164, 147, 255, 0.35);
		stroke-width: 16;
		stroke-linecap: round;
	}
	.w {
		fill: none;
		stroke: rgba(244, 215, 156, 0.85);
		stroke-width: 9;
		stroke-linecap: round;
		filter: url(#glow);
	}
	.loop {
		fill: none;
		stroke-width: 3;
	}
	.u-part {
		stroke: var(--blue);
	}
	.v-part {
		stroke: var(--violet);
	}
	.chev {
		fill: none;
		stroke-width: 2.4;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	.chev.up {
		stroke: var(--blue);
	}
	.chev.vp {
		stroke: var(--violet);
	}
	.pt {
		fill: url(#vertex-fill);
		stroke: #060912;
		stroke-width: 1.4;
	}
</style>
