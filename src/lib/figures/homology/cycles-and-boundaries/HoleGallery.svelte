<script lang="ts">
	// Figure 3.1.7 — "How many holes?" Everyday objects with their rims and
	// loops. Tap rims/loops to select them; the readout says whether the
	// selection bounds something on the object, and how many independent
	// non-bounding loops (b₁) there are.
	import Svg from '$lib/components/svg/Svg.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';

	type Obj = 'straw' | 'trousers' | 'tshirt' | 'mug' | 'ring';
	interface Loop {
		id: string;
		name: string;
		/** ellipse: cx, cy, rx, ry, rotation (deg) */
		e: [number, number, number, number, number];
		/** homology class mod 2, as a bit mask over the object's independent holes */
		cls: number;
	}

	let obj = $state<Obj>('straw');
	let solid = $state(false);
	let sel = $state<string[]>([]);

	const loops: Record<Obj, Loop[]> = {
		straw: [
			{ id: 'top', name: 'top end', e: [300, 46, 40, 12, 0], cls: 1 },
			{ id: 'bottom', name: 'bottom end', e: [300, 296, 40, 12, 0], cls: 1 }
		],
		trousers: [
			{ id: 'waist', name: 'waist', e: [300, 52, 80, 13, 0], cls: 3 },
			{ id: 'left', name: 'left cuff', e: [238, 300, 33, 9, 0], cls: 1 },
			{ id: 'right', name: 'right cuff', e: [362, 300, 33, 9, 0], cls: 2 }
		],
		tshirt: [
			{ id: 'neck', name: 'neck', e: [300, 50, 34, 10, 0], cls: 1 },
			{ id: 'lsleeve', name: 'left sleeve', e: [151, 132, 28, 8, 56], cls: 2 },
			{ id: 'rsleeve', name: 'right sleeve', e: [449, 132, 28, 8, -56], cls: 4 },
			{ id: 'hem', name: 'waist hem', e: [300, 296, 79, 12, 0], cls: 7 }
		],
		mug: [
			{ id: 'rim', name: 'rim of the cup', e: [278, 66, 84, 18, 0], cls: 0 },
			{ id: 'arm', name: 'ring around the handle’s arm', e: [462, 178, 10, 26, 0], cls: 0 },
			{ id: 'hole', name: 'loop around the handle’s hole', e: [399, 178, 22, 44, 0], cls: 1 }
		],
		ring: [
			{ id: 'mer', name: 'meridian (around the tube)', e: [425, 172, 17, 50, 0], cls: 1 },
			{ id: 'lon', name: 'longitude (around the hole)', e: [300, 176, 116, 50, 0], cls: 2 }
		]
	};

	const current = $derived(loops[obj]);
	const selSet = $derived(new Set(sel));
	// class of a loop depends on hollow/solid for the ring
	const clsOf = (l: Loop) => (obj === 'ring' && solid && l.id === 'mer' ? 0 : obj === 'ring' && solid && l.id === 'lon' ? 1 : l.cls);
	const sum = $derived(current.filter((l) => selSet.has(l.id)).reduce((acc, l) => acc ^ clsOf(l), 0));
	const bounds = $derived(sel.length > 0 && sum === 0);

	const facts: Record<Obj, { openings: number | null; b1: number; b2?: number; note: string }> = {
		straw: { openings: 2, b1: 1, note: 'two openings, one hole' },
		trousers: { openings: 3, b1: 2, note: 'three openings, two holes' },
		tshirt: { openings: 4, b1: 3, note: 'four openings, three holes' },
		mug: { openings: null, b1: 1, note: 'a solid lump of ceramic with one hole: the handle' },
		ring: { openings: null, b1: 2, b2: 1, note: '' }
	};
	const f = $derived(facts[obj]);
	const b1 = $derived(obj === 'ring' && solid ? 1 : f.b1);
	const b2 = $derived(obj === 'ring' && !solid ? 1 : 0);

	function toggle(id: string) {
		sel = selSet.has(id) ? sel.filter((x) => x !== id) : [...sel, id];
	}
	function choose(o: Obj) {
		obj = o;
		sel = [];
	}
	const rimsSurface = $derived(obj === 'straw' || obj === 'trousers' || obj === 'tshirt');
	const allRims = $derived(rimsSurface && sel.length === current.length);
	const others = $derived(current.filter((l) => !selSet.has(l.id)).map((l) => l.name));
	const shadeFabric = $derived(rimsSurface && allRims);
	const loopColor = (l: Loop) => (selSet.has(l.id) ? (bounds ? 'var(--teal)' : 'var(--gold-bright)') : 'rgba(235,229,213,0.55)');
</script>

<div class="wrap">
	<Svg viewBox="80 10 440 320" maxHeight={400} label="A drawing of the chosen everyday object with its rims or loops drawn as ellipses that can be selected.">
		<defs>
			<linearGradient id="hg-fabric" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stop-color="#6f8fe8" stop-opacity="0.38" />
				<stop offset="0.55" stop-color="#8a74e6" stop-opacity="0.26" />
				<stop offset="1" stop-color="#d77fb0" stop-opacity="0.22" />
			</linearGradient>
			<linearGradient id="hg-bound" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stop-color="#5fd6cf" stop-opacity="0.55" />
				<stop offset="1" stop-color="#3aa9c9" stop-opacity="0.35" />
			</linearGradient>
			<radialGradient id="hg-ceramic" cx="0.35" cy="0.3" r="0.9">
				<stop offset="0" stop-color="#9fb4ff" stop-opacity="0.45" />
				<stop offset="1" stop-color="#5a4fb8" stop-opacity="0.28" />
			</radialGradient>
		</defs>

		{#key obj}
			<g class="obj" style="--fill: url({shadeFabric ? '#hg-bound' : '#hg-fabric'})">
				{#if obj === 'straw'}
					<path class="body" d="M 260 46 L 260 296 A 40 12 0 0 0 340 296 L 340 46 A 40 12 0 0 1 260 46 Z" />
					{#each [0, 1, 2, 3, 4, 5, 6] as k (k)}
						<path class="stripe" d="M 260 {78 + k * 32} Q 300 {66 + k * 32 + 26} 340 {62 + k * 32}" />
					{/each}
				{:else if obj === 'trousers'}
					<path
						class="body"
						d="M 220 52 L 205 300 A 33 9 0 0 0 271 300 L 300 150 L 329 300 A 33 9 0 0 0 395 300 L 380 52 A 80 13 0 0 1 220 52 Z"
					/>
					<path class="seam" d="M 300 66 L 300 150" />
				{:else if obj === 'tshirt'}
					<path
						class="body"
						d="M 266 50 Q 240 58 212 66 L 128 110 L 174 154 L 222 132 L 221 296 A 79 12 0 0 0 379 296 L 378 132 L 426 154 L 472 110 L 388 66 Q 360 58 334 50 A 34 10 0 0 1 266 50 Z"
					/>
					<path class="seam" d="M 222 132 Q 216 100 212 66 M 378 132 Q 384 100 388 66" />
				{:else if obj === 'mug'}
					<path class="handle" d="M 362 112 C 486 96 490 262 360 246" />
					<path class="handle-hi" d="M 366 118 C 470 108 474 250 364 240" />
					<path class="body ceramic" d="M 194 66 L 208 286 Q 278 312 348 286 L 362 66 A 84 18 0 0 1 194 66 Z" />
					<ellipse class="inside" cx="278" cy="66" rx="78" ry="14" />
					{#if selSet.has('rim')}
						<ellipse class="bound-fill" cx="278" cy="66" rx="78" ry="14" />
					{/if}
					{#if selSet.has('arm')}
						<ellipse class="bound-fill" cx="462" cy="178" rx="10" ry="26" />
					{/if}
				{:else}
					<ellipse class="body" cx="300" cy="176" rx="160" ry="84" />
					<path class="hole-fill" d="M 232 166 Q 300 214 368 166 Q 300 150 232 166 Z" />
					<path class="seam" d="M 226 162 Q 300 216 374 162" />
					<path class="seam" d="M 246 172 Q 300 146 354 172" />
					{#if solid && selSet.has('mer')}
						<ellipse class="bound-fill" cx="425" cy="172" rx="17" ry="50" />
					{/if}
				{/if}

				<!-- rims and loops -->
				{#each current as l (l.id)}
					{@const [cx, cy, rx, ry, rot] = l.e}
					<g transform="rotate({rot} {cx} {cy})">
						{#if selSet.has(l.id)}
							<ellipse {cx} {cy} {rx} {ry} class="halo" style="stroke:{loopColor(l)}" />
						{/if}
						<ellipse
							{cx}
							{cy}
							{rx}
							{ry}
							class="loop"
							class:on={selSet.has(l.id)}
							style="stroke:{loopColor(l)}"
						/>
						<ellipse
							{cx}
							{cy}
							{rx}
							{ry}
							class="hit"
							role="button"
							tabindex="0"
							aria-label="{l.name}{selSet.has(l.id) ? ', selected' : ''}"
							aria-pressed={selSet.has(l.id)}
							onclick={() => toggle(l.id)}
							onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), toggle(l.id))}
						/>
					</g>
				{/each}
			</g>
		{/key}
	</Svg>

	<div class="readout ui" aria-live="polite">
		<div class="facts">
			{#if f.openings !== null}<span>openings: <b>{f.openings}</b></span>{/if}
			<span>independent holes: <TeX tex={String.raw`b_1 = \hole{${b1}}`} /></span>
			{#if b2}<span>voids: <TeX tex={String.raw`b_2 = \hole{${b2}}`} /></span>{/if}
		</div>
		<p class="status">
			{#if sel.length === 0}
				Tap a {rimsSurface ? 'rim' : 'loop'} to select it{rimsSurface ? ' — try selecting several' : ''}.
			{:else if bounds}
				<span class="badge teal">bounds</span>
				{#if rimsSurface}
					All {current.length} rims together are exactly the edge of the {obj === 'tshirt' ? 'shirt' : obj === 'trousers' ? 'trousers' : 'straw'}
					itself: they bound the whole fabric (teal). That single relation is why there is one fewer hole than openings.
				{:else if obj === 'mug'}
					{#if selSet.has('rim') && selSet.has('arm')}Both loops bound: the rim bounds the inside of the cup, the ring bounds a slice through the handle.
					{:else if selSet.has('rim')}The rim is the edge of the cup’s inside surface (teal): it bounds. The cavity of a cup is a dent, not a hole.
					{:else}This ring bounds a slice of solid ceramic cut straight through the handle (teal).{/if}
				{:else}
					The meridian of a <b>solid</b> doughnut bounds a disk-shaped slice of dough (teal).
				{/if}
			{:else}
				<span class="badge rose">bounds nothing</span>
				{#if rimsSurface}
					{#if obj === 'straw'}One end alone bounds nothing on the straw — yet it is homologous to the other end: the two together bound the wall.
					{:else}These rims bound nothing on their own. They are homologous to the remaining rim{others.length === 1 ? '' : 's'} ({others.join(', ')}):
						all of them together bound the fabric.{/if}
				{:else if obj === 'mug'}
					This loop goes around the handle’s hole, and no piece of the mug fills that hole. This is the mug’s one hole.
				{:else if solid}
					The longitude goes around the doughnut’s hole: nothing fills it. A solid doughnut has just this one independent hole.
				{:else}
					On the hollow inner tube neither the meridian nor the longitude bounds, nor does their sum: two independent holes — and the air inside is a
					void.
				{/if}
			{/if}
		</p>
	</div>

	<Controls>
		<Segmented
			value={obj}
			onchange={(v) => choose(v)}
			label="Object"
			options={[
				{ value: 'straw', label: 'Straw' },
				{ value: 'trousers', label: 'Trousers' },
				{ value: 'tshirt', label: 'T-shirt' },
				{ value: 'mug', label: 'Mug' },
				{ value: 'ring', label: 'Inner tube / doughnut' }
			]}
		/>
		{#if obj === 'ring'}
			<Toggle bind:checked={solid} label="Solid (a doughnut, not an inner tube)" onchange={() => (sel = [])} />
		{/if}
	</Controls>
</div>

<style>
	.wrap {
		padding-top: 0.6rem;
	}
	.obj {
		animation: fade 0.45s var(--ease);
	}
	@keyframes fade {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
	}
	.body {
		fill: var(--fill);
		stroke: rgba(235, 229, 213, 0.6);
		stroke-width: 1.5;
		stroke-linejoin: round;
	}
	.ceramic {
		fill: url(#hg-ceramic);
	}
	.stripe {
		fill: none;
		stroke: rgba(242, 141, 182, 0.28);
		stroke-width: 7;
	}
	.seam {
		fill: none;
		stroke: rgba(235, 229, 213, 0.38);
		stroke-width: 1.3;
	}
	.handle {
		fill: none;
		stroke: rgba(126, 140, 230, 0.55);
		stroke-width: 26;
		stroke-linecap: round;
	}
	.handle-hi {
		fill: none;
		stroke: rgba(235, 229, 213, 0.35);
		stroke-width: 1.4;
	}
	.inside {
		fill: rgba(4, 6, 14, 0.7);
		stroke: rgba(235, 229, 213, 0.45);
		stroke-width: 1.2;
	}
	.hole-fill {
		fill: rgba(4, 6, 14, 0.85);
	}
	.bound-fill {
		fill: url(#hg-bound);
		filter: drop-shadow(0 0 6px rgba(95, 214, 207, 0.6));
	}
	.loop {
		fill: none;
		stroke-width: 2.4;
		stroke-dasharray: 6 5;
	}
	.loop.on {
		stroke-width: 3.6;
		stroke-dasharray: none;
	}
	.halo {
		fill: none;
		stroke-width: 12;
		opacity: 0.3;
		filter: blur(3px);
	}
	.hit {
		fill: rgba(0, 0, 0, 0);
		stroke: transparent;
		stroke-width: 22;
		cursor: pointer;
		outline: none;
	}
	.hit:focus-visible {
		stroke: rgba(244, 215, 156, 0.18);
	}
	.readout {
		padding: 0.3rem 1.2rem 0.7rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
	}
	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1.4rem;
		align-items: baseline;
		font-size: 0.95rem;
		color: var(--ink);
	}
	.facts b {
		color: var(--ink-bright);
	}
	.status {
		margin: 0.4rem 0 0;
		line-height: 1.6;
		min-height: 3rem;
	}
	.status b {
		color: var(--ink-bright);
	}
	.badge {
		font-size: 0.68rem;
		font-weight: 650;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		margin-right: 0.35rem;
	}
	.badge.teal {
		color: #062320;
		background: var(--teal);
	}
	.badge.rose {
		color: #2a0816;
		background: var(--rose);
	}
</style>
