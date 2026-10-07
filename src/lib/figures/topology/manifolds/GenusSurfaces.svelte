<script lang="ts">
	// The classification of closed surfaces as a gallery: the sphere, the torus,
	// genus 2 and 3 (implicit surfaces meshed once, on demand), and the two
	// simplest non-orientable surfaces drawn as immersions in ℝ³.
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { glowTube } from '$lib/three/materials';
	import { boy, kleinBottle, surfaceGeometry } from '$lib/three/surfaces';
	import { tex } from '$lib/katex/render';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import { genusShape, project, surfaceNets } from './implicit';
	import { implicitGlass } from './implicitMaterial';
	import { glass } from '../homotopy/glass';

	type Key = '0' | '1' | '2' | '3' | 'rp2' | 'klein';
	let key = $state<Key>('2');
	let api: { show(k: Key): void } | null = null;

	const options: { value: Key; label: string }[] = [
		{ value: '0', label: 'Sphere' },
		{ value: '1', label: 'Torus' },
		{ value: '2', label: 'Genus 2' },
		{ value: '3', label: 'Genus 3' },
		{ value: 'rp2', label: 'ℝP²' },
		{ value: 'klein', label: 'Klein bottle' }
	];

	const info: Record<Key, { name: string; orient: boolean; chi: number; word: string; note: string }> = {
		'0': { name: 'S^2', orient: true, chi: 2, word: 'aa^{-1}', note: 'Genus 0: no handles. It is the “zero” of connected sum: \\(S^2 \\# M \\cong M\\).' },
		'1': { name: 'T^2', orient: true, chi: 0, word: 'aba^{-1}b^{-1}', note: 'Genus 1: a sphere with one handle.' },
		'2': {
			name: '\\Sigma_2 = T^2 \\# T^2',
			orient: true,
			chi: -2,
			word: 'a_1b_1a_1^{-1}b_1^{-1}\\,a_2b_2a_2^{-1}b_2^{-1}',
			note: 'Genus 2: two handles, the connected sum of two tori.'
		},
		'3': {
			name: '\\Sigma_3 = T^2 \\# T^2 \\# T^2',
			orient: true,
			chi: -4,
			word: 'a_1b_1a_1^{-1}b_1^{-1}\\,a_2b_2a_2^{-1}b_2^{-1}\\,a_3b_3a_3^{-1}b_3^{-1}',
			note: 'Genus 3: three handles.'
		},
		rp2: {
			name: '\\RP^2 = N_1',
			orient: false,
			chi: 1,
			word: 'aa',
			note: 'Drawn as Boy’s surface, an <em>immersion</em>: in \\(\\R^3\\) it has to pass through itself, but the surface itself has no crossings.'
		},
		klein: {
			name: 'K = \\RP^2 \\# \\RP^2 = N_2',
			orient: false,
			chi: 0,
			word: 'abab^{-1}',
			note: 'Drawn with a circle of self-intersection, an artefact of \\(\\R^3\\): in four dimensions the Klein bottle fits without crossing itself.'
		}
	};

	function setup(ctx: SceneContext) {
		const { scene, THREE, container } = ctx;
		ctx.camera.near = 0.5;
		ctx.camera.far = 80;
		ctx.camera.updateProjectionMatrix();
		const root = new THREE.Group();
		scene.add(root);
		const dist = ctx.camera.position.length();
		const aspect = Math.max(0.6, container.clientWidth / Math.max(1, container.clientHeight));
		const visibleW = 2 * dist * Math.tan((ctx.camera.fov * Math.PI) / 360) * aspect;

		interface Built {
			group: InstanceType<typeof THREE.Group>;
			setFade(x: number): void;
		}
		const cache = new Map<Key, Built>();

		function buildGenus(g: number): Built {
			const s = genusShape(g);
			const m = surfaceNets(s.f, s.min, s.max, g >= 3 ? 0.05 : 0.045);
			const geo = new THREE.BufferGeometry();
			geo.setAttribute('position', new THREE.BufferAttribute(m.positions, 3));
			geo.setAttribute('normal', new THREE.BufferAttribute(m.normals, 3));
			geo.setIndex(new THREE.BufferAttribute(m.indices, 1));
			const ig = implicitGlass(geo, { centres: s.centres, R: s.R, grid: g === 0 ? [32, 16] : [28, 14], opacity: 0.82 });
			const group = new THREE.Group();
			group.add(ig.group);
			const loops = new THREE.Group();
			group.add(loops);
			const loopMats: { uniforms: Record<string, { value: number }> }[] = [];
			// a gold loop round each tube and a teal loop round each hole
			for (const c of s.centres) {
				const ring = (fn: (u: number) => [number, number, number], col: 'gold' | 'teal') => {
					const pts: InstanceType<typeof THREE.Vector3>[] = [];
					for (let i = 0; i < 96; i++) {
						const p = fn(i / 96);
						project(s.f, p, 6);
						// lift slightly along the normal
						const e = 1e-4;
						const nx = s.f(p[0] + e, p[1], p[2]) - s.f(p[0] - e, p[1], p[2]);
						const ny = s.f(p[0], p[1] + e, p[2]) - s.f(p[0], p[1] - e, p[2]);
						const nz = s.f(p[0], p[1], p[2] + e) - s.f(p[0], p[1], p[2] - e);
						const L = Math.hypot(nx, ny, nz) || 1;
						pts.push(new THREE.Vector3(p[0] + (0.025 * nx) / L, p[1] + (0.025 * ny) / L, p[2] + (0.025 * nz) / L));
					}
					const tube = glowTube(new THREE.CatmullRomCurve3(pts, true, 'centripetal'), { color: col, closed: true, radius: 0.028, segments: 200 });
					tube.traverse((o) => {
						const mm = (o as InstanceType<typeof THREE.Mesh>).material as unknown as { uniforms?: Record<string, { value: number }> };
						if (mm?.uniforms?.uIntensity) loopMats.push(mm as { uniforms: Record<string, { value: number }> });
					});
					loops.add(tube);
				};
				ring((u) => [c + s.R * Math.cos(2 * Math.PI * u), s.r + 0.05, s.R * Math.sin(2 * Math.PI * u)], 'teal');
				ring((u) => [c, (s.r + 0.05) * Math.sin(2 * Math.PI * u), s.R + (s.r + 0.05) * Math.cos(2 * Math.PI * u)], 'gold');
			}
			const width = g === 0 ? 2.5 : s.max[0] - s.min[0];
			group.scale.setScalar(Math.min(1.12, (0.8 * visibleW) / width));
			return {
				group,
				setFade(x) {
					ig.setFade(x);
					loops.visible = x > 0.35;
					for (const mm of loopMats) mm.uniforms.uIntensity.value = Math.min(1, x * 1.2);
				}
			};
		}

		function buildParam(which: 'rp2' | 'klein'): Built {
			const f = which === 'rp2' ? boy(1.35) : kleinBottle(0.27);
			const geo = surfaceGeometry(f, which === 'rp2' ? 160 : 140, which === 'rp2' ? 80 : 72);
			// one-sided surfaces: no "inner side" (one colour on both faces, so no dark band where the
			// side flips), and the Klein bottle shows its neck passing through the body
			const gl = glass(
				geo,
				{ opacity: which === 'klein' ? 0.62 : 0.8, grid: which === 'rp2' ? [36, 10] : [36, 20], gridStrength: 0.32, layers: which === 'klein' ? 'all' : 'nearest' },
				{ brightness: 1, tintMix: 0 }
			);
			const group = new THREE.Group();
			group.add(gl);
			if (which === 'klein') group.rotation.z = 0;
			const mats = (gl.userData.materials ?? []) as { uniforms: Record<string, { value: number }> }[];
			const base = mats.map((m) => m.uniforms.uBrightness.value);
			const op = mats.map((m) => m.uniforms.uOpacity.value);
			return {
				group,
				setFade(x) {
					mats.forEach((m, i) => {
						m.uniforms.uBrightness.value = base[i] * x;
						m.uniforms.uOpacity.value = op[i] * x;
					});
				}
			};
		}

		let current: Built | null = null;
		let anim: (() => void) | null = null;
		const ease = (x: number) => 1 - Math.pow(1 - x, 3);

		api = {
			show(k) {
				let next = cache.get(k);
				if (!next) {
					next = k === 'rp2' || k === 'klein' ? buildParam(k) : buildGenus(+k);
					cache.set(k, next);
				}
				if (next === current) return;
				anim?.();
				anim = null;
				// tidy up after an interrupted transition
				for (const child of [...root.children]) if (child !== current?.group) root.remove(child);
				const prev = current;
				current = next;
				root.add(next.group);
				if (ctx.reducedMotion) {
					if (prev) root.remove(prev.group);
					next.setFade(1);
					ctx.invalidate();
					return;
				}
				next.setFade(0);
				const s0 = next.group.scale.x;
				let t = 0;
				const nextRef = next;
				anim = ctx.onFrame((_t, dt) => {
					t += dt / 0.7;
					const x = Math.min(1, t);
					prev?.setFade(Math.max(0, 1 - x * 1.6));
					nextRef.setFade(ease(x));
					nextRef.group.scale.setScalar(s0 * (0.94 + 0.06 * ease(x)));
					if (x >= 1) {
						if (prev) root.remove(prev.group);
						nextRef.group.scale.setScalar(s0);
						anim?.();
						anim = null;
					}
				});
			}
		};
		api.show(key);
		return { dispose: () => (api = null) };
	}

	$effect(() => {
		const k = key;
		api?.show(k);
	});

	const cur = $derived(info[key]);
</script>

<div class="wrap">
	<Scene3D
		{setup}
		height={420}
		camera={{ position: [0, 3.4, 6.6], fov: 40 }}
		controls={{ autoRotate: true, autoRotateSpeed: 0.55 }}
		label="A gallery of closed surfaces: sphere, torus, surfaces of genus two and three with a gold loop round each tube and a teal loop round each hole, the projective plane and the Klein bottle"
	/>
	<Controls>
		<Segmented bind:value={key} {options} label="Which closed surface" />
	</Controls>
	<div class="info ui" aria-live="polite">
		<div class="name">{@html tex(cur.name)}</div>
		<dl>
			<div><dt>orientable</dt><dd class={cur.orient ? 'yes' : 'no'}>{cur.orient ? 'yes' : 'no'}</dd></div>
			<div><dt>genus</dt><dd>{key === 'rp2' ? '1 crosscap' : key === 'klein' ? '2 crosscaps' : key}</dd></div>
			<div><dt>Euler characteristic</dt><dd>{@html tex(`\\chi = ${cur.chi}`)}</dd></div>
			<div><dt>gluing word</dt><dd>{@html tex(cur.word)}</dd></div>
		</dl>
		<p class="note">{@html cur.note.replace(/\\\((.+?)\\\)/g, (_m: string, t: string) => tex(t))}</p>
	</div>
</div>

<style>
	.info {
		padding: 0.2rem 1.2rem 1rem;
		background: rgba(5, 8, 16, 0.45);
	}
	.name {
		font-size: 1.15rem;
		color: var(--gold-bright);
		margin-bottom: 0.3rem;
	}
	dl {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1.6rem;
		margin: 0.2rem 0 0.4rem;
		font-size: 0.86rem;
	}
	dl div {
		display: flex;
		gap: 0.5rem;
		align-items: baseline;
	}
	dt {
		color: var(--ink-faint);
		font-size: 0.72rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	dd {
		margin: 0;
		color: var(--ink-bright);
	}
	dd.yes {
		color: var(--green);
	}
	dd.no {
		color: var(--rose);
	}
	.note {
		margin: 0;
		font-size: 0.84rem;
		color: var(--ink-dim);
		line-height: 1.5;
	}
</style>
