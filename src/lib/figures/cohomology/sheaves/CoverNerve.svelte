<script lang="ts">
	// Figure: an open cover by disks, its nerve, and the holes of the union.
	// Drag the disks; the nerve (vertex per disk, edge per overlap, triangle per
	// triple overlap) is redrawn live and its b1 is compared with the holes of
	// the covered region, which are computed independently and exactly.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { nerveOf, holesOf, type Disk } from './nerve';
	import { svgPoint, clamp } from './svgutil';

	const W = 640;
	const H = 420;
	const PAD = 18;

	type Preset = 'ring' | 'field' | 'islands';
	const presets: Record<Preset, { pts: [number, number][]; r: number }> = {
		ring: {
			r: 62,
			pts: Array.from({ length: 7 }, (_, k) => {
				const t = (2 * Math.PI * k) / 7 - Math.PI / 2;
				return [320 + 128 * Math.cos(t), 210 + 118 * Math.sin(t)] as [number, number];
			})
		},
		field: {
			r: 58,
			pts: [
				[90, 90],
				[190, 70],
				[300, 95],
				[420, 80],
				[540, 100],
				[110, 200],
				[235, 185],
				[480, 205],
				[570, 230],
				[95, 315],
				[215, 330],
				[340, 320],
				[455, 330],
				[565, 335],
				[355, 210]
			]
		},
		islands: {
			r: 56,
			pts: [
				[130, 150],
				[210, 120],
				[180, 230],
				[470, 160],
				[540, 230],
				[470, 280],
				[400, 225]
			]
		}
	};

	let preset = $state<Preset>('ring');
	let radius = $state(62);
	let pts = $state<[number, number][]>(presets.ring.pts.map((p) => [...p] as [number, number]));
	let showDisks = $state(true);
	let showNerve = $state(true);
	let dragging = $state<number | null>(null);
	let svg = $state<SVGSVGElement>();
	let grab = { dx: 0, dy: 0 };

	function load(p: Preset) {
		preset = p;
		radius = presets[p].r;
		pts = presets[p].pts.map((q) => [...q] as [number, number]);
	}

	const disks = $derived<Disk[]>(pts.map(([x, y]) => ({ x, y, r: radius })));
	const nerve = $derived(nerveOf(disks));
	const holes = $derived(holesOf(disks));

	function down(i: number, e: PointerEvent) {
		if (!svg) return;
		e.preventDefault();
		(e.currentTarget as Element).setPointerCapture?.(e.pointerId);
		const p = svgPoint(svg, e);
		grab = { dx: pts[i][0] - p.x, dy: pts[i][1] - p.y };
		dragging = i;
	}
	function move(e: PointerEvent) {
		if (dragging === null || !svg) return;
		const p = svgPoint(svg, e);
		pts[dragging] = [clamp(p.x + grab.dx, PAD, W - PAD), clamp(p.y + grab.dy, PAD, H - PAD)];
	}
	function up() {
		dragging = null;
	}
	function key(i: number, e: KeyboardEvent) {
		const step = e.shiftKey ? 20 : 6;
		const d: Record<string, [number, number]> = {
			ArrowLeft: [-step, 0],
			ArrowRight: [step, 0],
			ArrowUp: [0, -step],
			ArrowDown: [0, step]
		};
		const m = d[e.key];
		if (!m) return;
		e.preventDefault();
		pts[i] = [clamp(pts[i][0] + m[0], PAD, W - PAD), clamp(pts[i][1] + m[1], PAD, H - PAD)];
	}
	function addDisk() {
		// put the new sensor where the field is least covered
		let best: [number, number] = [W / 2, H / 2];
		let bestD = -1;
		for (let x = 60; x < W - 40; x += 20)
			for (let y = 50; y < H - 40; y += 20) {
				const d = Math.min(...pts.map(([a, b]) => Math.hypot(a - x, b - y)), 1e9);
				if (d > bestD) {
					bestD = d;
					best = [x, y];
				}
			}
		pts = [...pts, best];
	}
	function removeDisk() {
		if (pts.length > 1) pts = pts.slice(0, -1);
	}

	const tri = (t: [number, number, number]) => t.map((i) => pts[i].join(',')).join(' ');
	const agree = $derived(nerve.b1 === holes.length);
</script>

<div class="wrap">
	<Svg
		bind:svg
		viewBox="0 0 {W} {H}"
		maxHeight={470}
		label="Disks covering part of a field; the nerve of the cover is drawn on top: a vertex for each disk, an edge for each overlap, a filled triangle for each triple overlap. Uncovered pockets enclosed by disks are shaded as holes."
		onpointermove={move}
		onpointerup={up}
		onpointerleave={up}
	>
		<defs>
			<pattern id="cn-grid" width="20" height="20" patternUnits="userSpaceOnUse">
				<circle cx="10" cy="10" r="0.9" fill="rgba(235,229,213,0.16)" />
			</pattern>
			<radialGradient id="cn-disk" cx="50%" cy="50%" r="50%">
				<stop offset="0" stop-color="#5fd6cf" stop-opacity="0.16" />
				<stop offset="0.8" stop-color="#5fd6cf" stop-opacity="0.09" />
				<stop offset="1" stop-color="#5fd6cf" stop-opacity="0.13" />
			</radialGradient>
		</defs>
		<rect x="4" y="4" width={W - 8} height={H - 8} rx="16" fill="url(#cn-grid)" stroke="rgba(216,178,110,0.14)" />

		{#if showDisks}
			<g class="disks">
				{#each disks as d, i (i)}
					<circle cx={d.x} cy={d.y} r={d.r} fill="url(#cn-disk)" />
				{/each}
			</g>
		{/if}

		{#each holes as h, k (k)}
			<path d={h.path} class="hole" filter="url(#glow)" />
		{/each}

		{#if showDisks}
			<g>
				{#each disks as d, i (i)}
					<circle
						cx={d.x}
						cy={d.y}
						r={d.r}
						class="rim"
						class:active={dragging === i}
						role="button"
						tabindex="0"
						aria-label="Disk {i + 1}: drag or use the arrow keys to move it"
						onpointerdown={(e) => down(i, e)}
						onkeydown={(e) => key(i, e)}
					/>
				{/each}
			</g>
		{/if}

		{#if showNerve}
			<g class="nerve" pointer-events="none">
				{#each nerve.triangles as t, k (k)}
					<polygon points={tri(t)} class="tri" />
				{/each}
				{#each nerve.edges as [a, b], k (k)}
					<line x1={pts[a][0]} y1={pts[a][1]} x2={pts[b][0]} y2={pts[b][1]} class="edge" />
				{/each}
				{#each pts as p, i (i)}
					<circle cx={p[0]} cy={p[1]} r="7" fill="url(#vertex-fill)" class="vert" />
				{/each}
			</g>
		{:else}
			<g pointer-events="none">
				{#each pts as p, i (i)}
					<circle cx={p[0]} cy={p[1]} r="4" fill="#5fd6cf" opacity="0.8" />
				{/each}
			</g>
		{/if}
	</Svg>

	<div class="readout ui" aria-live="polite">
		<div class="row">
			<span class="k">Nerve</span>
			<span class="v nums">
				{pts.length} vertices · {nerve.edges.length} edges · {nerve.triangles.length} triangles
			</span>
		</div>
		<div class="row">
			<span class="k">Its homology</span>
			<span class="v"><TeX tex={`b_0 = ${nerve.b0},\\quad \\htmlClass{tx-gold}{b_1 = ${nerve.b1}}`} /></span>
		</div>
		<div class="row">
			<span class="k">Holes in the covered region</span>
			<span class="v nums"><span class="tx-rose">{holes.length}</span></span>
		</div>
		<div class="verdict" class:ok={agree}>
			{#if agree}
				The nerve’s loops that bound nothing match the holes one for one — the nerve theorem at work.
			{:else}
				Two disks are exactly tangent here; nudge one and the counts agree again.
			{/if}
		</div>
	</div>

	<Controls>
		<Segmented
			bind:value={preset}
			options={[
				{ value: 'ring', label: 'Ring' },
				{ value: 'field', label: 'Sensor field' },
				{ value: 'islands', label: 'Islands' }
			]}
			label="Starting configuration"
			onchange={(v) => load(v)}
		/>
		<Slider bind:value={radius} min={30} max={110} step={1} label="Sensor range" format={(v) => `${v}`} />
		<Button onclick={addDisk}>+ Sensor</Button>
		<Button onclick={removeDisk} disabled={pts.length <= 1}>− Sensor</Button>
		<Toggle bind:checked={showDisks} label="Disks" />
		<Toggle bind:checked={showNerve} label="Nerve" />
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.6rem;
	}
	.rim {
		fill: transparent;
		stroke: rgba(95, 214, 207, 0.55);
		stroke-width: 1.4;
		cursor: grab;
		touch-action: none;
		transition: stroke 0.2s;
	}
	.rim:hover,
	.rim:focus-visible {
		stroke: rgba(95, 214, 207, 0.95);
		stroke-width: 2.2;
		outline: none;
	}
	.rim.active {
		stroke: #9ff3ec;
		stroke-width: 2.6;
		cursor: grabbing;
	}
	.hole {
		fill: rgba(242, 141, 182, 0.26);
		stroke: var(--rose);
		stroke-width: 2;
	}
	.tri {
		fill: rgba(242, 208, 143, 0.17);
		stroke: none;
	}
	.edge {
		stroke: var(--gold-bright);
		stroke-width: 2.6;
		stroke-linecap: round;
		filter: drop-shadow(0 0 3px rgba(242, 205, 135, 0.55));
	}
	.vert {
		stroke: #fff6dc;
		stroke-width: 0.8;
	}
	.readout {
		display: grid;
		gap: 0.3rem;
		padding: 0.6rem 1.2rem 0.8rem;
		font-size: 0.82rem;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.2rem 1rem;
		border-bottom: 1px solid var(--line-faint);
		padding-bottom: 0.25rem;
	}
	.k {
		color: var(--ink-dim);
		letter-spacing: 0.03em;
	}
	.v {
		color: var(--ink-bright);
	}
	.verdict {
		margin-top: 0.25rem;
		color: var(--amber);
		font-size: 0.8rem;
	}
	.verdict.ok {
		color: var(--green);
	}
</style>
