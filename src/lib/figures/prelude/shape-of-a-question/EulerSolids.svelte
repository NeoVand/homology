<script lang="ts">
	// Euler's clue: count vertices, edges and faces of a solid. For every
	// "ball-like" polyhedron V − E + F = 2; for a polyhedron with a tunnel, 0.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import { glowPoint, glowTube, iridescent, disposeTree } from '$lib/three/materials';
	import * as THREE from 'three';

	type Kind = 'tetra' | 'cube' | 'octa' | 'dodeca' | 'icosa' | 'frame';
	let kind = $state<Kind>('cube');

	const counts: Record<Kind, { V: number; E: number; F: number; name: string }> = {
		tetra: { V: 4, E: 6, F: 4, name: 'tetrahedron' },
		cube: { V: 8, E: 12, F: 6, name: 'cube' },
		octa: { V: 6, E: 12, F: 8, name: 'octahedron' },
		dodeca: { V: 20, E: 30, F: 12, name: 'dodecahedron' },
		icosa: { V: 12, E: 30, F: 20, name: 'icosahedron' },
		frame: { V: 16, E: 32, F: 16, name: 'picture frame' }
	};
	const c = $derived(counts[kind]);

	/** A square "picture frame": a polyhedron with a tunnel (16 V, 32 E, 16 F). */
	function frameGeometry(): { faces: THREE.BufferGeometry; edges: [THREE.Vector3, THREE.Vector3][] } {
		const o = 1.45;
		const i = 0.55;
		const h = 0.38;
		const ring = (r: number, z: number) => [
			new THREE.Vector3(-r, -r, z),
			new THREE.Vector3(r, -r, z),
			new THREE.Vector3(r, r, z),
			new THREE.Vector3(-r, r, z)
		];
		const OT = ring(o, h);
		const IT = ring(i, h);
		const OB = ring(o, -h);
		const IB = ring(i, -h);
		const quads: THREE.Vector3[][] = [];
		for (let k = 0; k < 4; k++) {
			const n = (k + 1) % 4;
			quads.push([OT[k], OT[n], IT[n], IT[k]]); // top
			quads.push([OB[k], IB[k], IB[n], OB[n]]); // bottom
			quads.push([OT[k], OB[k], OB[n], OT[n]]); // outer side
			quads.push([IT[k], IT[n], IB[n], IB[k]]); // inner side
		}
		const pos: number[] = [];
		for (const [a, b, cc, d] of quads) for (const p of [a, b, cc, a, cc, d]) pos.push(p.x, p.y, p.z);
		const faces = new THREE.BufferGeometry();
		faces.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
		faces.computeVertexNormals();
		const edges: [THREE.Vector3, THREE.Vector3][] = [];
		for (let k = 0; k < 4; k++) {
			const n = (k + 1) % 4;
			edges.push([OT[k], OT[n]], [IT[k], IT[n]], [OB[k], OB[n]], [IB[k], IB[n]]);
			edges.push([OT[k], IT[k]], [OB[k], IB[k]], [OT[k], OB[k]], [IT[k], IB[k]]);
		}
		return { faces, edges };
	}

	function solid(k: Kind): { faces: THREE.BufferGeometry; edges: [THREE.Vector3, THREE.Vector3][] } {
		if (k === 'frame') return frameGeometry();
		const g =
			k === 'tetra'
				? new THREE.TetrahedronGeometry(1.55)
				: k === 'cube'
					? new THREE.BoxGeometry(1.9, 1.9, 1.9)
					: k === 'octa'
						? new THREE.OctahedronGeometry(1.6)
						: k === 'dodeca'
							? new THREE.DodecahedronGeometry(1.55)
							: new THREE.IcosahedronGeometry(1.6);
		const eg = new THREE.EdgesGeometry(g, 10);
		const a = eg.attributes.position.array as Float32Array;
		const edges: [THREE.Vector3, THREE.Vector3][] = [];
		for (let i = 0; i < a.length; i += 6)
			edges.push([new THREE.Vector3(a[i], a[i + 1], a[i + 2]), new THREE.Vector3(a[i + 3], a[i + 4], a[i + 5])]);
		eg.dispose();
		return { faces: g, edges };
	}

	let api: { show(k: Kind): void } | null = null;

	function setup({ scene, invalidate }: SceneContext) {
		const holder = new THREE.Group();
		holder.rotation.set(0.5, 0.4, 0);
		scene.add(holder);
		let current: THREE.Group | null = null;

		const show = (k: Kind) => {
			if (current) {
				holder.remove(current);
				disposeTree(current);
			}
			const { faces, edges } = solid(k);
			const g = new THREE.Group();
			const back = new THREE.Mesh(faces, iridescent({ opacity: 0.5, grid: [0, 0], side: THREE.BackSide, depthWrite: false, brightness: 0.7 }));
			const front = new THREE.Mesh(faces, iridescent({ opacity: 0.62, grid: [0, 0], side: THREE.FrontSide, depthWrite: false }));
			back.renderOrder = 1;
			front.renderOrder = 2;
			g.add(back, front);
			const seen = new Map<string, THREE.Vector3>();
			for (const [a, b] of edges) {
				g.add(glowTube(new THREE.LineCurve3(a, b), { color: 'gold', radius: 0.022, segments: 1, halo: true, haloScale: 2.6 }));
				for (const p of [a, b]) seen.set(p.toArray().map((x) => x.toFixed(3)).join(','), p);
			}
			for (const p of seen.values()) g.add(glowPoint(p.clone(), { color: 'ivory', size: 0.055, halo: 7 }));
			if (k === 'frame') g.rotation.x = -0.9;
			holder.add(g);
			current = g;
			invalidate();
		};
		show(kind);
		api = { show };
		return {
			update(t: number) {
				holder.rotation.y = 0.4 + t * 0.25;
			},
			dispose: () => (api = null)
		};
	}

	$effect(() => {
		const v = kind; // read first, so the effect tracks it even before the scene exists
		api?.show(v);
	});
</script>

<div class="wrap">
	<Scene3D
		{setup}
		height={360}
		camera={{ position: [0, 0.4, 6.4], fov: 38 }}
		label="A rotating polyhedron with glowing edges and vertices; counts of vertices, edges and faces are shown"
	>
		<div class="readout ui nums">
			<div class="nm">{c.name}</div>
			<TeX tex={`V - E + F = ${c.V} - ${c.E} + ${c.F} = ${c.V - c.E + c.F}`} />
		</div>
	</Scene3D>
</div>
<Controls>
	<Segmented
		bind:value={kind}
		options={[
			{ value: 'tetra', label: 'tetrahedron' },
			{ value: 'cube', label: 'cube' },
			{ value: 'octa', label: 'octahedron' },
			{ value: 'dodeca', label: 'dodecahedron' },
			{ value: 'icosa', label: 'icosahedron' },
			{ value: 'frame', label: 'picture frame' }
		]}
		label="Choose a solid"
	/>
</Controls>

<style>
	.wrap {
		position: relative;
	}
	.readout {
		position: absolute;
		left: 1.1rem;
		top: 1rem;
		padding: 0.6rem 0.9rem;
		border-radius: 10px;
		background: rgba(6, 10, 20, 0.72);
		border: 1px solid var(--line);
		backdrop-filter: blur(6px);
		font-size: 1rem;
		color: var(--ink-bright);
	}
	.nm {
		font-size: 0.68rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--gold);
		margin-bottom: 0.25rem;
	}
</style>
