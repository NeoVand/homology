<script lang="ts">
	// A continuous bijection that is not a homeomorphism: wrapping [0, 1) once
	// around the circle. A small arc around p pulls back to two far-apart pieces.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';

	const x0 = 46;
	const x1 = 266;
	const y = 150;
	const eps = 0.12;
	const cx = 500;
	const cy = 150;
	const R = 92;
	const arc = (a0: number, a1: number) => {
		const p = (a: number) => `${cx + R * Math.cos(a)} ${cy - R * Math.sin(a)}`;
		return `M ${p(a0)} A ${R} ${R} 0 0 0 ${p(a1)}`;
	};
	const A = eps * Math.PI * 2;
</script>

<Svg viewBox="0 0 640 290" maxHeight={330} label="The interval from 0 to 1, with 0 included and 1 left out, wrapped once around a circle. A small arc around the point where the ends meet comes from two separate pieces at the two ends of the interval">
	<!-- the interval -->
	<line x1={x0} y1={y} x2={x1} y2={y} stroke="var(--ink)" stroke-width="3" stroke-linecap="round" />
	<line x1={x0} y1={y} x2={x0 + eps * (x1 - x0)} y2={y} stroke="var(--teal)" stroke-width="7" stroke-linecap="round" filter="url(#glow)" />
	<line x1={x1 - eps * (x1 - x0)} y1={y} x2={x1} y2={y} stroke="var(--teal)" stroke-width="7" filter="url(#glow)" />
	<circle cx={x0} cy={y} r="6" fill="var(--gold-bright)" stroke="#060912" stroke-width="1.4" />
	<circle cx={x1} cy={y} r="6" fill="#0b1020" stroke="var(--ink)" stroke-width="2" />
	<SvgTeX x={x0} y={y + 26} tex="0" size={15} w={20} h={20} />
	<SvgTeX x={x1} y={y + 26} tex="1" size={15} w={20} h={20} />
	<SvgTeX x={(x0 + x1) / 2} y={y - 34} tex={'[0,1)'} size={17} w={80} h={24} />
	<SvgTeX x={(x0 + x1) / 2} y={y + 66} tex={'\\bdy{f^{-1}(U)=[0,\\varepsilon)\\cup(1-\\varepsilon,1)}'} size={14} w={260} h={24} />
	<text x={(x0 + x1) / 2} y={y + 92} text-anchor="middle" class="t-ui">TWO PIECES, FAR APART</text>

	<!-- the arrow -->
	<path d="M 300 {y - 6} C 340 {y - 40}, 378 {y - 40}, 392 {y - 10}" fill="none" stroke="var(--gold)" stroke-width="2" marker-end="url(#arrow-gold)" />
	<SvgTeX x={346} y={y - 54} tex={'f(t)=(\\cos 2\\pi t,\\ \\sin 2\\pi t)'} size={14} w={210} h={24} color="var(--gold-bright)" />

	<!-- the circle -->
	<circle {cx} {cy} r={R} fill="none" stroke="var(--ink)" stroke-width="3" />
	<path d={arc(-A, A)} fill="none" stroke="var(--teal)" stroke-width="7" stroke-linecap="round" filter="url(#glow)" />
	<circle cx={cx + R} cy={cy} r="6" fill="var(--gold-bright)" stroke="#060912" stroke-width="1.4" />
	<SvgTeX x={cx + R + 22} y={cy} tex="p" size={16} w={20} h={20} color="var(--gold-bright)" />
	<SvgTeX x={cx + R + 34} y={cy - 46} tex={'\\bdy{U}'} size={16} w={24} h={22} />
	<SvgTeX x={cx} y={cy + R + 30} tex={'S^1'} size={16} w={40} h={22} />
	<text x={cx} y={cy + 4} text-anchor="middle" class="t-ui">ONE PIECE</text>
</Svg>
