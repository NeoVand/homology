<script lang="ts">
	// A knot tangled up and then let go: its strands push one another away (the
	// tangent-point energy) and it relaxes, live, into the shape the knot wants,
	// without ever passing through itself. The flow runs in a worker
	// ($lib/knots/live.worker.ts); this draws each new shape as it arrives, then
	// says which knot it was, and can lay it flat as a table of knots draws it.
	import { untrack } from 'svelte';
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { DynTube } from '$lib/three/dynTube';
	import { knotGaps } from '$lib/three/gaps';
	import { knotById } from '$lib/knots/table';
	import { tex } from '$lib/katex/render';
	import type { FromWorker, ToWorker } from '$lib/knots/live.worker';

	const choices = ['unknot', '3_1', '4_1', '5_2', '6_1', 'surprise'] as const;
	type Choice = (typeof choices)[number];
	const hidden = ['unknot', '3_1', '4_1', '5_1', '5_2', '6_1', '6_2', '6_3', '7_1'];
	let which = $state<Choice>('3_1');
	let seed = $state(7);
	let actual = $state('3_1');
	let E = $state(0);
	let E0 = $state(0);
	let steps = $state(0);
	let settled = $state(false);
	let flat = $state(false);
	let running = $state(false);
	let named = $state<{ id: string; mirror: boolean; crossings: number } | null>(null);
	let history = $state<number[]>([]);

	const sub = (n: string) => n.replace(/_(\d+)/g, (_, d) => String.fromCharCode(...[...d].map((c: string) => 0x2080 + +c)));
	const label = (c: Choice) => (c === 'unknot' ? '0₁' : c === 'surprise' ? 'a surprise' : sub(c));
	const nameOf = (id: string) => {
		if (id === 'unknot') return 'the unknot';
		const k = knotById.get(id);
		return k ? `${k.common ?? 'the knot'} ${tex(k.name)}` : 'a knot outside this chapter’s table';
	};

	let worker: Worker | null = null;
	const send = (m: ToWorker) => worker?.postMessage(m);
	let draw: ((comps: Float32Array[]) => void) | null = null;

	function start(c: Choice, s: number) {
		actual = c === 'surprise' ? hidden[s % hidden.length] : c;
		named = null;
		settled = false;
		flat = false;
		running = false;
		steps = 0;
		history = [];
		send({ type: 'tangle', id: actual, seed: s });
	}
	function go() {
		running = true;
		send({ type: 'run' });
	}
	function pause() {
		running = false;
		send({ type: 'pause' });
	}

	function setup(ctx: SceneContext) {
		const { scene, THREE } = ctx;
		const turn = new THREE.Group();
		const root = new THREE.Group();
		turn.add(root);
		scene.add(turn);
		root.rotation.x = -0.35;
		const gaps = knotGaps(ctx);
		const SAMPLES = 480;
		const tube = new DynTube(SAMPLES, { color: 'gold', radius: 0.08, closed: true, haloScale: 2.2, xray: 0, gaps });
		root.add(tube.group);
		// the shape arrives in the solver's units; it is shown centred and at a steady size, eased so that
		// the picture does not jump as the knot grows or shrinks
		let scale = 0;
		const centre = new THREE.Vector3();
		const target = new THREE.Vector3();
		const curve = new THREE.CatmullRomCurve3([], true, 'centripetal');
		const tmp = new THREE.Vector3();
		let pts: InstanceType<typeof THREE.Vector3>[] = [];
		draw = (comps) => {
			const c = comps[0];
			const n = c.length / 3;
			if (pts.length !== n) pts = Array.from({ length: n }, () => new THREE.Vector3());
			target.set(0, 0, 0);
			for (let i = 0; i < n; i++) {
				pts[i].set(c[3 * i], c[3 * i + 1], c[3 * i + 2]);
				target.add(pts[i]);
			}
			target.divideScalar(n);
			let R = 0;
			for (const p of pts) R = Math.max(R, p.distanceTo(target));
			const want = 1.75 / R;
			scale = scale ? scale + (want - scale) * 0.2 : want;
			centre.lerp(target, scale === want ? 1 : 0.2);
			curve.points = pts;
			for (let i = 0; i < SAMPLES; i++) {
				curve.getPoint(i / SAMPLES, tmp);
				tube.points[3 * i] = (tmp.x - centre.x) * scale;
				tube.points[3 * i + 1] = (tmp.y - centre.y) * scale;
				tube.points[3 * i + 2] = (tmp.z - centre.z) * scale;
			}
			tube.update();
			ctx.invalidate();
		};
		// turning slowly; lying flat, it rocks instead of showing its edge
		const off = ctx.onFrame((t, dt) => {
			if (ctx.reducedMotion) return false;
			if (flat) {
				turn.rotation.y += (0.5 * Math.sin(0.3 * t) - turn.rotation.y) * Math.min(1, dt * 2);
			} else turn.rotation.y += 0.07 * dt;
		});

		worker = new Worker(new URL('../../../knots/live.worker.ts', import.meta.url), { type: 'module' });
		worker.onmessage = (e: MessageEvent<FromWorker>) => {
			const m = e.data;
			if (m.type === 'shape') {
				draw?.(m.comps);
				E = m.E;
				steps = m.steps;
				settled = m.settled;
				flat = m.flat;
				if (m.steps === 0) E0 = m.E;
				if (m.steps % 2 === 0) history = [...history.slice(-299), m.E];
				if (m.settled) running = false;
			} else named = m;
		};
		untrack(() => start(which, seed));
		// let go by itself, a moment after the tangle comes into view
		const auto = ctx.reducedMotion ? null : setTimeout(go, 1600);
		return {
			dispose() {
				off();
				if (auto) clearTimeout(auto);
				worker?.terminate();
				worker = null;
				draw = null;
				gaps.dispose();
			}
		};
	}

	function choose(c: Choice) {
		which = c;
		seed = seed + 1;
		start(c, seed);
		if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(go, 900);
	}
	function again() {
		choose(which);
	}

	// the energy falling, on a log scale, as a little line
	const spark = $derived.by(() => {
		if (history.length < 2) return '';
		const lo = Math.log(Math.min(...history));
		const hi = Math.log(Math.max(...history));
		const span = hi - lo || 1;
		return history.map((e, i) => `${i ? 'L' : 'M'} ${((i / (history.length - 1)) * 100).toFixed(1)} ${(2 + (26 * (hi - Math.log(e))) / span).toFixed(1)}`).join(' ');
	});
	const status = $derived.by(() => {
		const said = named
			? named.id === 'unknot'
				? 'It came undone: a round circle, the unknot.'
				: `It is ${named.mirror ? 'the mirror image of ' : ''}${nameOf(named.id)}, as its Jones polynomial says.`
			: '';
		if (flat) return settled ? `${said} Now it lies flat, as a table of knots draws it.` : 'Lying down…';
		if (said) return said;
		if (settled) return 'Settled.';
		if (running) return which === 'surprise' ? 'Relaxing… which knot is it?' : 'Relaxing…';
		return steps === 0 ? 'Tangled up.' : 'Paused.';
	});
</script>

<div class="lr">
	<Scene3D {setup} height={420} animate camera={{ position: [0, 0.6, 6.4], fov: 40 }} controls={{}} label="A knot, tangled up, relaxing as its strands push one another apart, until it settles into its simplest shape." />
	<div class="read ui" aria-live="polite">
		<p class="status">{@html status}</p>
		<p class="nums">
			<span>energy <b>{E ? E.toFixed(E < 100 ? 2 : 0) : '–'}</b>{#if E0 && steps}<span class="from">from {E0.toFixed(0)}</span>{/if}</span>
			<span>step <b>{steps}</b></span>
			<svg viewBox="0 0 100 30" class="spark" aria-hidden="true"><path d={spark} /></svg>
		</p>
	</div>
	<div class="chips ui" role="radiogroup" aria-label="Which knot to tangle">
		{#each choices as c (c)}
			<button role="radio" aria-checked={which === c} class:on={which === c} onclick={() => choose(c)}>{label(c)}</button>
		{/each}
	</div>
	<div class="act ui">
		{#if running}
			<Button onclick={pause}>Pause</Button>
		{:else if !settled}
			<Button onclick={go}>{steps ? 'Go on' : 'Let it go'}</Button>
		{/if}
		<Button onclick={again}>Tangle it again</Button>
		<Button onclick={() => send({ type: 'flatten' })} disabled={flat || !settled}>Lay it flat</Button>
	</div>
</div>

<style>
	.lr {
		display: grid;
	}
	.read {
		display: grid;
		justify-items: center;
		gap: 0.2rem;
		margin: 0.2rem 1rem 0.5rem;
		text-align: center;
	}
	.status {
		margin: 0;
		font-size: 0.9rem;
		color: var(--ink-bright);
		min-height: 1.4em;
	}
	.nums {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin: 0;
		font-size: 0.8rem;
		color: var(--ink-dim);
		font-variant-numeric: tabular-nums;
	}
	.nums b {
		color: var(--gold-bright);
		font-weight: 600;
	}
	.from {
		margin-left: 0.3em;
		color: var(--ink-faint);
	}
	.spark {
		width: 6rem;
		height: 1.6rem;
	}
	.spark path {
		fill: none;
		stroke: var(--gold);
		stroke-width: 1.4;
		vector-effect: non-scaling-stroke;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.35rem;
		padding: 0 1rem 0.6rem;
	}
	.chips button {
		font: inherit;
		font-size: 0.8rem;
		padding: 0.28rem 0.65rem;
		border-radius: 999px;
		border: 1px solid var(--line-faint);
		background: rgba(255, 255, 255, 0.02);
		color: var(--ink-dim);
		cursor: pointer;
	}
	.chips button:hover {
		color: var(--ink-bright);
		border-color: var(--line);
	}
	.chips button.on {
		color: var(--gold-bright);
		border-color: var(--line-strong);
		background: rgba(216, 178, 110, 0.12);
	}
	.act {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.5rem;
		padding-bottom: 0.9rem;
	}
</style>
