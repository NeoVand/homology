<script lang="ts">
	// Figure: pulling back dx∧dy along polar coordinates φ(r, θ) = (r cos θ, r sin θ).
	// A little grid cell in the (r, θ) rectangle is carried by φ to a curved cell
	// in the plane; its area is r·Δr·Δθ, which is why φ*(dx∧dy) = r dr∧dθ.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { clamp, fmtTeX } from './calc';

	const DR = 0.25;
	const DT = Math.PI / 8;
	const NR = 8; // r from 0 to 2
	const NT = 16; // θ from 0 to 2π

	let i = $state(5); // r index
	let j = $state(1); // θ index

	// left panel: (r, θ) rectangle
	const L = { x: 40, y: 22, w: 240, h: 270 };
	const lx = (r: number) => L.x + (r / 2) * L.w;
	const ly = (t: number) => L.y + L.h - (t / (2 * Math.PI)) * L.h;
	// right panel: the plane
	const C = { x: 160, y: 158, s: 66 };
	const rx = (r: number, t: number) => C.x + C.s * r * Math.cos(t);
	const ry = (r: number, t: number) => C.y - C.s * r * Math.sin(t);

	const r0 = $derived(i * DR);
	const t0 = $derived(j * DT);
	const imageArea = $derived(DT * ((r0 + DR) ** 2 - r0 ** 2) / 2);

	const cellPath = $derived.by(() => {
		const r1 = r0 + DR;
		const t1 = t0 + DT;
		const pts: string[] = [];
		for (let k = 0; k <= 12; k++) pts.push(`${rx(r1, t0 + (DT * k) / 12)} ${ry(r1, t0 + (DT * k) / 12)}`);
		for (let k = 12; k >= 0; k--) pts.push(`${rx(r0, t0 + (DT * k) / 12)} ${ry(r0, t0 + (DT * k) / 12)}`);
		return 'M ' + pts.join(' L ') + ' Z';
	});

	let lsvg: SVGSVGElement | undefined = $state();
	let rsvg: SVGSVGElement | undefined = $state();
	let dragging: 'l' | 'r' | null = null;
	function pt(e: PointerEvent, svg: SVGSVGElement) {
		return new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM()!.inverse());
	}
	function setFromLeft(e: PointerEvent) {
		const p = pt(e, lsvg!);
		const r = ((p.x - L.x) / L.w) * 2;
		const t = ((L.y + L.h - p.y) / L.h) * 2 * Math.PI;
		i = clamp(Math.floor(r / DR), 0, NR - 1);
		j = clamp(Math.floor(t / DT), 0, NT - 1);
	}
	function setFromRight(e: PointerEvent) {
		const p = pt(e, rsvg!);
		const x = (p.x - C.x) / C.s;
		const y = (C.y - p.y) / C.s;
		let t = Math.atan2(y, x);
		if (t < 0) t += 2 * Math.PI;
		i = clamp(Math.floor(Math.hypot(x, y) / DR), 0, NR - 1);
		j = clamp(Math.floor(t / DT), 0, NT - 1);
	}
	function down(e: PointerEvent, which: 'l' | 'r') {
		dragging = which;
		(e.currentTarget as Element).setPointerCapture(e.pointerId);
		if (which === 'l') setFromLeft(e);
		else setFromRight(e);
	}
	function move(e: PointerEvent) {
		if (dragging === 'l') setFromLeft(e);
		else if (dragging === 'r') setFromRight(e);
	}
	function key(e: KeyboardEvent) {
		if (e.key === 'ArrowRight') i = clamp(i + 1, 0, NR - 1);
		else if (e.key === 'ArrowLeft') i = clamp(i - 1, 0, NR - 1);
		else if (e.key === 'ArrowUp') j = (j + 1) % NT;
		else if (e.key === 'ArrowDown') j = (j + NT - 1) % NT;
		else return;
		e.preventDefault();
	}
	const thetaTicks = [
		{ t: 0, tex: '0' },
		{ t: Math.PI, tex: '\\pi' },
		{ t: 2 * Math.PI, tex: '2\\pi' }
	];
</script>

<div class="pull">
	<div class="pb-panel">
		<Svg bind:svg={lsvg} viewBox="0 0 300 330" maxHeight={340} label="The rectangle of polar coordinates r and theta, with one highlighted grid cell.">
			<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
			<g
				role="slider"
				tabindex="0"
				aria-label="Grid cell: arrow keys move it"
				aria-valuenow={i}
				class="pad"
				onpointerdown={(e) => down(e, 'l')}
				onpointermove={move}
				onpointerup={() => (dragging = null)}
				onpointercancel={() => (dragging = null)}
				onkeydown={key}
			>
				<rect x={L.x} y={L.y} width={L.w} height={L.h} class="bg" />
				{#each Array(NR + 1) as _, k (k)}
					<line x1={lx(k * DR)} y1={L.y} x2={lx(k * DR)} y2={L.y + L.h} class="g" />
				{/each}
				{#each Array(NT + 1) as _, k (k)}
					<line x1={L.x} y1={ly(k * DT)} x2={L.x + L.w} y2={ly(k * DT)} class="g" />
				{/each}
				<rect x={lx(r0)} y={ly(t0 + DT)} width={lx(r0 + DR) - lx(r0)} height={ly(t0) - ly(t0 + DT)} class="cell" />
			</g>
			<SvgTeX x={L.x + L.w / 2} y={L.y + L.h + 22} tex="r" color="var(--ink-dim)" size={16} w={30} h={22} />
			<SvgTeX x={L.x + L.w} y={L.y + L.h + 14} tex="2" color="var(--ink-faint)" size={12} w={20} h={18} />
			<SvgTeX x={L.x} y={L.y + L.h + 14} tex="0" color="var(--ink-faint)" size={12} w={20} h={18} />
			{#each thetaTicks as tk (tk.tex)}
				<SvgTeX x={L.x - 16} y={ly(tk.t)} tex={tk.tex} color="var(--ink-faint)" size={12} w={26} h={18} />
			{/each}
			<SvgTeX x={L.x - 26} y={L.y + L.h / 2 + 30} tex={'\\theta'} color="var(--ink-dim)" size={16} w={20} h={22} />
		</Svg>
	</div>
	<div class="arrows" aria-hidden="true">
		<div class="fwd"><TeX tex={String.raw`\xrightarrow{\ \varphi\ }`} /></div>
		<div class="hint ui">points go forward</div>
		<div class="bwd"><TeX tex={String.raw`\xleftarrow{\ \varphi^*\ }`} /></div>
		<div class="hint ui">forms come back</div>
	</div>
	<div class="pb-panel">
		<Svg bind:svg={rsvg} viewBox="0 0 320 330" maxHeight={340} label="The plane with its polar grid; the image of the highlighted cell is a curved wedge.">
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<g class="pad" onpointerdown={(e) => down(e, 'r')} onpointermove={move} onpointerup={() => (dragging = null)} onpointercancel={() => (dragging = null)}>
				<circle cx={C.x} cy={C.y} r={C.s * 2.25} class="bg" />
				{#each Array(NR) as _, k (k)}
					<circle cx={C.x} cy={C.y} r={C.s * (k + 1) * DR} class="g" />
				{/each}
				{#each Array(NT) as _, k (k)}
					<line x1={C.x} y1={C.y} x2={rx(2, k * DT)} y2={ry(2, k * DT)} class="g" />
				{/each}
				<path d={cellPath} class="cell" />
				<circle cx={C.x} cy={C.y} r="2.5" class="origin" />
			</g>
			<SvgTeX x={C.x + C.s * 2.15} y={C.y + 14} tex="x" color="var(--ink-dim)" size={15} w={20} h={20} />
			<SvgTeX x={C.x + 14} y={C.y - C.s * 2.2} tex="y" color="var(--ink-dim)" size={15} w={20} h={20} />
		</Svg>
	</div>
</div>
<div class="readout">
	<div>
		<span class="cap ui">area of the cell in the (r, θ) rectangle</span>
		<TeX tex={String.raw`\Delta r\,\Delta\theta = ${fmtTeX(DR, 2)}\times ${fmtTeX(DT, 3)} = ${fmtTeX(DR * DT, 3)}`} />
	</div>
	<div>
		<span class="cap ui">area of its image in the plane</span>
		<TeX tex={String.raw`\bar r\,\Delta r\,\Delta\theta = ${fmtTeX(r0 + DR / 2, 3)}\times ${fmtTeX(DR * DT, 3)} = ${fmtTeX(imageArea, 3)}`} />
	</div>
</div>

<style>
	.pull {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: center;
		gap: 0 0.5rem;
		padding: 0.6rem 0.6rem 0;
	}
	.pb-panel {
		flex: 1 1 15rem;
		max-width: 21rem;
	}
	.arrows {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.1rem;
		font-size: 1.15rem;
		padding: 0 0.4rem;
	}
	.fwd {
		color: var(--violet);
	}
	.bwd {
		color: var(--gold-bright);
		margin-top: 0.5rem;
	}
	.hint {
		font-size: 0.66rem;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		color: var(--ink-faint);
	}
	.pad {
		cursor: pointer;
		touch-action: none;
		outline: none;
	}
	.bg {
		fill: rgba(116, 169, 255, 0.05);
		stroke: rgba(116, 169, 255, 0.35);
	}
	.g {
		fill: none;
		stroke: rgba(116, 169, 255, 0.22);
		stroke-width: 1;
	}
	.cell {
		fill: rgba(242, 208, 143, 0.45);
		stroke: var(--gold-bright);
		stroke-width: 1.6;
		filter: url(#glow);
		transition: all 0.15s;
	}
	.pad:focus-visible .bg {
		stroke: var(--gold-bright);
	}
	.origin {
		fill: var(--ink-bright);
	}
	.readout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.6rem 1.4rem;
		padding: 0.8rem 1.2rem 1rem;
		border-top: 1px solid var(--line-faint);
		font-size: 1.02rem;
	}
	.readout > div {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.cap {
		font-size: 0.66rem;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--gold);
	}
	@media (max-width: 640px) {
		.readout {
			grid-template-columns: 1fr;
		}
		.arrows {
			flex-direction: row;
			gap: 0.8rem;
		}
	}
</style>
