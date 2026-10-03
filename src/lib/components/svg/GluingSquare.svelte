<script lang="ts" module>
	export interface Side {
		/** TeX label, e.g. "a" */
		label?: string;
		/** +1: arrow points along +x (bottom/top) or +y-up (left/right); −1: reversed; 0: no arrow */
		dir?: 1 | -1 | 0;
		/** number of chevrons (to tell edge pairs apart) */
		marks?: 1 | 2;
		color?: string;
		/** draw as a free (unglued) boundary edge */
		free?: boolean;
	}
	export type SquarePreset = 'torus' | 'klein' | 'rp2' | 'sphere' | 'cylinder' | 'mobius' | 'plain';

	export const presets: Record<SquarePreset, { bottom: Side; right: Side; top: Side; left: Side }> = {
		torus: {
			bottom: { label: 'a', dir: 1, marks: 1, color: 'var(--gold-bright)' },
			top: { label: 'a', dir: 1, marks: 1, color: 'var(--gold-bright)' },
			left: { label: 'b', dir: 1, marks: 2, color: 'var(--teal)' },
			right: { label: 'b', dir: 1, marks: 2, color: 'var(--teal)' }
		},
		klein: {
			bottom: { label: 'a', dir: 1, marks: 1, color: 'var(--gold-bright)' },
			top: { label: 'a', dir: 1, marks: 1, color: 'var(--gold-bright)' },
			left: { label: 'b', dir: 1, marks: 2, color: 'var(--teal)' },
			right: { label: 'b', dir: -1, marks: 2, color: 'var(--teal)' }
		},
		rp2: {
			bottom: { label: 'a', dir: 1, marks: 1, color: 'var(--gold-bright)' },
			top: { label: 'a', dir: -1, marks: 1, color: 'var(--gold-bright)' },
			left: { label: 'b', dir: -1, marks: 2, color: 'var(--teal)' },
			right: { label: 'b', dir: 1, marks: 2, color: 'var(--teal)' }
		},
		sphere: {
			bottom: { label: 'a', dir: 1, marks: 1, color: 'var(--gold-bright)' },
			left: { label: 'a', dir: 1, marks: 1, color: 'var(--gold-bright)' },
			top: { label: 'b', dir: 1, marks: 2, color: 'var(--teal)' },
			right: { label: 'b', dir: 1, marks: 2, color: 'var(--teal)' }
		},
		cylinder: {
			bottom: { free: true },
			top: { free: true },
			left: { label: 'b', dir: 1, marks: 2, color: 'var(--teal)' },
			right: { label: 'b', dir: 1, marks: 2, color: 'var(--teal)' }
		},
		mobius: {
			bottom: { free: true },
			top: { free: true },
			left: { label: 'b', dir: 1, marks: 2, color: 'var(--teal)' },
			right: { label: 'b', dir: -1, marks: 2, color: 'var(--teal)' }
		},
		plain: { bottom: {}, top: {}, left: {}, right: {} }
	};
</script>

<script lang="ts">
	// A square with arrows on its sides showing how they are glued.
	// Use inside <Svg>. The square occupies [x, x+size] × [y, y+size] in SVG units.
	import SvgTeX from './SvgTeX.svelte';

	let {
		preset = 'torus',
		sides,
		x = 0,
		y = 0,
		size = 200,
		fill = true,
		corners = false
	}: {
		preset?: SquarePreset;
		sides?: Partial<{ bottom: Side; right: Side; top: Side; left: Side }>;
		x?: number;
		y?: number;
		size?: number;
		fill?: boolean;
		/** label the corners with dots (to show which get identified) */
		corners?: boolean;
	} = $props();

	const S = $derived({ ...presets[preset], ...(sides ?? {}) });

	// corners in SVG coordinates (y grows downward): BL, BR, TR, TL
	const BL = $derived([x, y + size] as const);
	const BR = $derived([x + size, y + size] as const);
	const TR = $derived([x + size, y] as const);
	const TL = $derived([x, y] as const);

	function sidePts(which: 'bottom' | 'right' | 'top' | 'left') {
		// returned in the "positive" direction: bottom/top left→right, left/right bottom→top
		if (which === 'bottom') return [BL, BR];
		if (which === 'top') return [TL, TR];
		if (which === 'left') return [BL, TL];
		return [BR, TR];
	}
	function chevrons(which: 'bottom' | 'right' | 'top' | 'left', s: Side) {
		if (!s.dir) return [];
		const [a, b] = sidePts(which);
		const dx = (b[0] - a[0]) * s.dir;
		const dy = (b[1] - a[1]) * s.dir;
		const len = Math.hypot(dx, dy) || 1;
		const ux = dx / len;
		const uy = dy / len;
		const mx = (a[0] + b[0]) / 2;
		const my = (a[1] + b[1]) / 2;
		const out: string[] = [];
		const n = s.marks ?? 1;
		for (let k = 0; k < n; k++) {
			const off = (k - (n - 1) / 2) * 11;
			const cx = mx + ux * off;
			const cy = my + uy * off;
			out.push(
				`M ${cx - ux * 7 - uy * 7} ${cy - uy * 7 + ux * 7} L ${cx + ux * 3} ${cy + uy * 3} L ${cx - ux * 7 + uy * 7} ${cy - uy * 7 - ux * 7}`
			);
		}
		return out;
	}
	function labelPos(which: 'bottom' | 'right' | 'top' | 'left'): [number, number] {
		const m = 22;
		if (which === 'bottom') return [x + size / 2, y + size + m];
		if (which === 'top') return [x + size / 2, y - m];
		if (which === 'left') return [x - m, y + size / 2];
		return [x + size + m, y + size / 2];
	}
	const order = ['bottom', 'right', 'top', 'left'] as const;
	const uid = Math.random().toString(36).slice(2, 8);
</script>

<g class="gsq">
	<defs>
		<linearGradient id="gsq-fill-{uid}" x1="0" y1="0" x2="1" y2="1">
			<stop offset="0" stop-color="#6fd6e8" stop-opacity="0.16" />
			<stop offset="0.5" stop-color="#8f7cf7" stop-opacity="0.14" />
			<stop offset="1" stop-color="#ee8fbf" stop-opacity="0.16" />
		</linearGradient>
	</defs>
	{#if fill}
		<rect {x} {y} width={size} height={size} fill="url(#gsq-fill-{uid})" />
	{/if}
	{#each order as w (w)}
		{@const s = S[w]}
		{@const [a, b] = sidePts(w)}
		<line
			x1={a[0]}
			y1={a[1]}
			x2={b[0]}
			y2={b[1]}
			stroke={s.free ? 'rgba(200,192,170,0.5)' : (s.color ?? 'rgba(200,192,170,0.7)')}
			stroke-width={s.free ? 1.5 : 2.6}
			stroke-dasharray={s.free ? '5 5' : undefined}
			stroke-linecap="round"
		/>
		{#each chevrons(w, s) as d, k (k)}
			<path {d} fill="none" stroke={s.color ?? 'var(--ink)'} stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
		{/each}
		{#if s.label}
			{@const [lx, ly] = labelPos(w)}
			<SvgTeX x={lx} y={ly} tex={s.label} color={s.color ?? 'var(--ink)'} size={18} w={40} h={30} />
		{/if}
	{/each}
	{#if corners}
		{#each [BL, BR, TR, TL] as c, k (k)}
			<circle cx={c[0]} cy={c[1]} r="5" fill="url(#vertex-fill)" stroke="#060912" stroke-width="1.2" />
		{/each}
	{/if}
</g>
