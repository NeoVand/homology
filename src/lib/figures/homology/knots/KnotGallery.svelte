<script lang="ts">
	// A gallery of knots and links in space, from the book's table: turn them
	// over, read their names and crossing numbers, and take one ring away from
	// the Borromean rings to watch the other two fall apart.
	import { untrack } from 'svelte';
	import Scene3D, { type SceneContext, type LabelHandle } from '$lib/components/three/Scene3D.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { glowTube, disposeTree } from '$lib/three/materials';
	import { knots, knotById } from '$lib/knots/table';
	import { borromeanEllipses } from '$lib/knots/curves';
	import { tex } from '$lib/katex/render';
	import type { V3 } from '$lib/knots/diagram';
	import { closedCurve } from './kit';

	const shown = ['unknot', '3_1', '4_1', '5_1', '5_2', '6_1', '6_2', '6_3', 'granny', 'square', 'hopf', 'solomon', 'whitehead', 'borromean'];
	let id = $state('3_1');
	let parted = $state(false);
	const k = $derived(knotById.get(id)!);
	const colours = ['gold', 'teal', 'violet'] as const;

	function shape(id: string): V3[][] {
		const comps = id === 'borromean' ? borromeanEllipses(1.7, 0.8) : knotById.get(id)!.build();
		// scale every knot to the same size
		let R = 0;
		for (const c of comps) for (const p of c) R = Math.max(R, Math.hypot(p[0], p[1], p[2]));
		const s = 1.75 / R;
		return comps.map((c) => c.map(([x, y, z]) => [x * s, y * s, z * s] as V3));
	}

	let api: { build(): void; wake(): void } | null = null;

	function setup(ctx: SceneContext) {
		const { scene, THREE } = ctx;
		const root = new THREE.Group();
		scene.add(root);
		let parts: InstanceType<typeof THREE.Group>[] = [];
		let label: LabelHandle | null = null;
		let part = 0; // 0 → 1 as the Borromean rings come apart
		function build() {
			disposeTree(root);
			root.clear();
			const comps = shape(id);
			parts = comps.map((c, i) => {
				const g = new THREE.Group();
				g.add(glowTube(closedCurve(c), { color: colours[i % 3], closed: true, radius: 0.085, segments: 600, haloScale: 2.2, xray: 0 }));
				root.add(g);
				return g;
			});
			// the knot lies in the xy-plane seen from +z; tip it towards the viewer a little
			root.rotation.set(-0.35, 0, 0);
			part = parted ? 1 : 0;
			place();
			label?.remove();
			label = ctx.label(new THREE.Vector3(0, -2.35, 0), tex(/^L/.test(k.name) ? `\\mathrm{${k.name}}` : k.name), { className: 'gold' });
			ctx.invalidate();
		}
		function place() {
			if (id !== 'borromean' || parts.length < 3) return;
			const e = part * part * (3 - 2 * part);
			// the third ring fades away; then the second, no longer held, slides off along x
			parts[2].visible = e < 0.98;
			parts[2].scale.setScalar(1 - 0.25 * e);
			parts[2].traverse((o) => {
				const m = (o as InstanceType<typeof THREE.Mesh>).material as { uniforms?: { uOpacity?: { value: number }; uIntensity?: { value: number } } } | undefined;
				if (m?.uniforms?.uIntensity) m.uniforms.uIntensity.value = 1 - e;
			});
			const slide = Math.max(0, (e - 0.35) / 0.65);
			parts[1].position.set(2.2 * slide, 0, 0);
			parts[0].position.set(-1.0 * slide, 0, 0);
		}
		const off = ctx.onFrame((_t, dt) => {
			const target = parted ? 1 : 0;
			if (Math.abs(part - target) < 1e-3) return false;
			part += Math.sign(target - part) * Math.min(Math.abs(target - part), dt / 1.6);
			place();
			return true;
		});
		api = { build, wake: () => ctx.invalidate() };
		build();
		return {
			dispose() {
				off();
				api = null;
				label?.remove();
			}
		};
	}

	$effect(() => {
		void id;
		untrack(() => {
			parted = false;
			api?.build();
		});
	});
	$effect(() => {
		void parted;
		untrack(() => api?.wake());
	});

	const sub = (n: string) => n.replace(/_(\d+)/g, (_, d) => String.fromCharCode(...[...d].map((c: string) => 0x2080 + +c)));
</script>

<div class="kg">
	<Scene3D
		{setup}
		height={420}
		animate
		camera={{ position: [0, 0.6, 6.4], fov: 40 }}
		controls={{ autoRotate: true, autoRotateSpeed: 0.55 }}
		label="A knot or link drawn as a glowing tube in space, turning slowly; it can be chosen from a list of knots and links."
	/>
	<p class="about ui" aria-live="polite">
		<strong>{k.common ? k.common[0].toUpperCase() + k.common.slice(1) : sub(k.name)}</strong>
		· {k.crossings === 0 ? 'no crossings' : `${k.crossings} crossings in its simplest drawing`}
		{#if k.components > 1}· {k.components} components{/if}
	</p>
	<div class="chips ui" role="radiogroup" aria-label="Which knot or link">
		{#each shown as s (s)}
			{@const kk = knots.find((x) => x.id === s)!}
			<button role="radio" aria-checked={id === s} class:on={id === s} onclick={() => (id = s)} title={kk.common ?? kk.name}>
				{s === 'granny' ? 'granny' : s === 'square' ? 'square' : s === 'hopf' ? 'Hopf' : s === 'solomon' ? 'Solomon' : s === 'whitehead' ? 'Whitehead' : s === 'borromean' ? 'Borromean' : sub(kk.name)}
			</button>
		{/each}
	</div>
	{#if id === 'borromean'}
		<div class="act ui">
			<Button onclick={() => (parted = !parted)}>{parted ? 'Put the ring back' : 'Take one ring away'}</Button>
		</div>
	{/if}
</div>

<style>
	.kg {
		display: grid;
	}
	.about {
		margin: 0.2rem 1rem 0.5rem;
		text-align: center;
		font-size: 0.86rem;
		color: var(--ink-dim);
	}
	.about strong {
		color: var(--gold-bright);
		font-weight: 600;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0.35rem;
		padding: 0 1rem 0.8rem;
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
		justify-content: center;
		padding-bottom: 0.9rem;
	}
</style>
