// GPU flow visualisation for planar vector fields:
//  • an animated line-integral-convolution (LIC) background drawn by a
//    full-screen fragment shader (Cabral–Leedom 1993; the travelling ripple
//    is the Forssell–Cohen animation trick), tinted by speed, curl or
//    divergence, with optional level lines of a potential;
//  • a few hundred glowing particles with fading trails, advected on the CPU.
import * as THREE from 'three';
import { FIELD_GLSL, type FieldPreset } from './fields';
import type { Vec2 } from './calc';

export const OVERLAY = { flow: 0, curl: 1, div: 2, potential: 3 } as const;

const vert = /* glsl */ `
	void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const frag = /* glsl */ `
	precision highp float;
	uniform float uT;
	uniform vec2 uRes;
	uniform float uExtent;
	uniform vec2 uCenter;
	uniform int uField;
	uniform int uOverlay;
	uniform float uBright;
	uniform float uMask;

	${FIELD_GLSL}

	float hash12(vec2 p) {
		vec3 p3 = fract(vec3(p.xyx) * 0.1031);
		p3 += dot(p3, p3.yzx + 33.33);
		return fract((p3.x + p3.y) * p3.z);
	}

	void main() {
		float m = min(uRes.x, uRes.y);
		float px = 2.0 * uExtent / m;            // world size of one device pixel
		vec2 p = (gl_FragCoord.xy - 0.5 * uRes) * px + uCenter;

		// ── line integral convolution ──
		float cell = 1.7 * px;
		float h = 1.1 * cell;
		const int N = 22;
		float acc = 0.0;
		float wsum = 0.0;
		for (int dir = -1; dir <= 1; dir += 2) {
			vec2 q = p;
			for (int i = 0; i < N; i++) {
				float s = float(i) / float(N);
				float w = (0.5 + 0.5 * cos(3.14159265 * s)) *
					(0.6 + 0.4 * sin(6.2831853 * (float(dir) * s * 1.5 - uT * 0.5)));
				acc += w * hash12(floor(q / cell));
				wsum += w;
				vec2 f = field(q);
				float l = length(f);
				if (l < 1e-7) break;
				q += float(dir) * h * f / l;
			}
		}
		float lic = clamp((acc / wsum - 0.5) * 3.1 + 0.5, 0.0, 1.0);

		vec2 F = field(p);
		float speed = length(F);
		// where the field is (numerically) zero its direction means nothing: calm the texture
		lic = mix(0.3, lic, smoothstep(1e-4, 3e-3, speed));
		vec3 deep = vec3(0.07, 0.10, 0.24);
		vec3 base;
		if (uOverlay == 1) {
			float c = tanh(curlF(p) * 0.8);
			vec3 pos = vec3(0.95, 0.45, 0.66);   // rose: counterclockwise
			vec3 neg = vec3(0.30, 0.82, 0.80);   // teal: clockwise
			base = mix(vec3(0.36, 0.40, 0.58), c > 0.0 ? pos : neg, clamp(abs(c) * 1.15, 0.0, 1.0));
		} else if (uOverlay == 2) {
			float d = tanh(divF(p) * 0.6);
			vec3 pos = vec3(1.0, 0.80, 0.45);    // gold: source
			vec3 neg = vec3(0.42, 0.62, 1.0);    // blue: sink
			base = mix(vec3(0.36, 0.40, 0.58), d > 0.0 ? pos : neg, clamp(abs(d) * 1.15, 0.0, 1.0));
		} else {
			float t = clamp(0.55 * log(1.0 + 2.2 * speed), 0.0, 1.0);
			vec3 mid = vec3(0.50, 0.42, 0.95);
			vec3 hot = vec3(1.0, 0.82, 0.50);
			base = t < 0.5 ? mix(vec3(0.20, 0.42, 0.85), mid, t * 2.0) : mix(mid, hot, t * 2.0 - 1.0);
		}
		vec3 col = deep + base * (0.03 + 0.92 * lic * lic);

		// level lines of a potential (where one exists)
		if (uOverlay == 3 && hasPot()) {
			float sp = potSpacing();
			float v = potF(p) / sp;
			float d = abs(fract(v + 0.5) - 0.5) * sp / max(speed * px, 1e-6);
			float line = 1.0 - smoothstep(0.6, 1.7, d);
			col = mix(col, vec3(0.45, 0.95, 0.90), line * 0.85);
		}

		// soft vignette, and hide singular points
		vec2 uv = gl_FragCoord.xy / uRes - 0.5;
		col *= 1.0 - 0.35 * dot(uv, uv);
		if (uField == 5) col *= smoothstep(0.035, 0.11, length(p)) * uMask + (1.0 - uMask);
		gl_FragColor = vec4(col * uBright, 1.0);
	}
`;

export function licMaterial(preset: FieldPreset, overlay = 0, extent = 2.2): THREE.ShaderMaterial {
	return new THREE.ShaderMaterial({
		vertexShader: vert,
		fragmentShader: frag,
		uniforms: {
			uT: { value: 0 },
			uRes: { value: new THREE.Vector2(1, 1) },
			uExtent: { value: extent },
			uCenter: { value: new THREE.Vector2(0, 0) },
			uField: { value: preset.id },
			uOverlay: { value: overlay },
			uBright: { value: 1 },
			uMask: { value: 1 }
		},
		depthTest: false,
		depthWrite: false
	});
}

/** A full-screen quad carrying the LIC material. */
export function licQuad(mat: THREE.ShaderMaterial): THREE.Mesh {
	const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
	mesh.frustumCulled = false;
	mesh.renderOrder = -10;
	return mesh;
}

// ── particles ──────────────────────────────────────────────────────────────

const pVert = /* glsl */ `
	attribute float aAlpha;
	uniform vec2 uClip;
	uniform vec2 uCenter;
	uniform float uSize;
	varying float vA;
	void main() {
		vA = aAlpha;
		gl_Position = vec4((position.xy - uCenter) * uClip, 0.0, 1.0);
		gl_PointSize = uSize;
	}
`;
const pFrag = /* glsl */ `
	uniform vec3 uColor;
	varying float vA;
	void main() {
		vec2 d = gl_PointCoord - 0.5;
		float r = length(d);
		float a = smoothstep(0.5, 0.04, r);
		a = a * a * 1.25;
		gl_FragColor = vec4(uColor * a * vA, a * vA);
	}
`;
const lFrag = /* glsl */ `
	uniform vec3 uColor;
	varying float vA;
	void main() { gl_FragColor = vec4(uColor * vA, vA); }
`;

export interface ParticleOptions {
	count?: number;
	trail?: number;
	color?: number;
	size?: number;
	/** world units per second at unit field strength */
	speed?: number;
	/** cap on the speed (world units / s) */
	maxSpeed?: number;
	/** never spawn within this distance of these points */
	avoid?: Vec2[];
	avoidRadius?: number;
}

export class FlowParticles {
	group = new THREE.Group();
	private n: number;
	private K: number;
	private pos: Float32Array; // n × K × 2 history (index 0 = newest)
	private age: Float32Array;
	private life: Float32Array;
	private headGeo: THREE.BufferGeometry;
	private lineGeo: THREE.BufferGeometry;
	private headPos: Float32Array;
	private headA: Float32Array;
	private linePos: Float32Array;
	private lineA: Float32Array;
	readonly materials: THREE.ShaderMaterial[] = [];
	private o: Required<Omit<ParticleOptions, 'avoid'>> & { avoid: Vec2[] };
	private rand = mulberry(7);

	constructor(o: ParticleOptions = {}) {
		this.o = {
			count: o.count ?? 600,
			trail: o.trail ?? 10,
			color: o.color ?? 0xf6dca0,
			size: o.size ?? 7,
			speed: o.speed ?? 0.45,
			maxSpeed: o.maxSpeed ?? 1.4,
			avoid: o.avoid ?? [],
			avoidRadius: o.avoidRadius ?? 0.12
		};
		this.n = this.o.count;
		this.K = this.o.trail;
		this.pos = new Float32Array(this.n * this.K * 2);
		this.age = new Float32Array(this.n);
		this.life = new Float32Array(this.n);
		this.headPos = new Float32Array(this.n * 3);
		this.headA = new Float32Array(this.n);
		this.linePos = new Float32Array(this.n * (this.K - 1) * 2 * 3);
		this.lineA = new Float32Array(this.n * (this.K - 1) * 2);

		const uniforms = () => ({
			uClip: { value: new THREE.Vector2(1, 1) },
			uCenter: { value: new THREE.Vector2(0, 0) },
			uSize: { value: this.o.size },
			uColor: { value: new THREE.Color(this.o.color) }
		});
		const blend = { transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending };
		const headMat = new THREE.ShaderMaterial({ vertexShader: pVert, fragmentShader: pFrag, uniforms: uniforms(), ...blend });
		const lineMat = new THREE.ShaderMaterial({ vertexShader: pVert, fragmentShader: lFrag, uniforms: uniforms(), ...blend });
		this.materials.push(headMat, lineMat);

		this.headGeo = new THREE.BufferGeometry();
		this.headGeo.setAttribute('position', new THREE.BufferAttribute(this.headPos, 3).setUsage(THREE.DynamicDrawUsage));
		this.headGeo.setAttribute('aAlpha', new THREE.BufferAttribute(this.headA, 1).setUsage(THREE.DynamicDrawUsage));
		this.lineGeo = new THREE.BufferGeometry();
		this.lineGeo.setAttribute('position', new THREE.BufferAttribute(this.linePos, 3).setUsage(THREE.DynamicDrawUsage));
		this.lineGeo.setAttribute('aAlpha', new THREE.BufferAttribute(this.lineA, 1).setUsage(THREE.DynamicDrawUsage));
		const heads = new THREE.Points(this.headGeo, headMat);
		const lines = new THREE.LineSegments(this.lineGeo, lineMat);
		heads.frustumCulled = lines.frustumCulled = false;
		heads.renderOrder = 6;
		lines.renderOrder = 5;
		this.group.add(lines, heads);
	}

	/** Map world → clip: clip = (p − center) · clip */
	setView(clip: [number, number], center: Vec2 = [0, 0], dpr = 1) {
		for (const m of this.materials) {
			m.uniforms.uClip.value.set(clip[0], clip[1]);
			m.uniforms.uCenter.value.set(center[0], center[1]);
			m.uniforms.uSize.value = this.o.size * dpr;
		}
	}

	setColor(c: number) {
		for (const m of this.materials) m.uniforms.uColor.value.setHex(c);
	}

	private spawn(i: number, box: [number, number, number, number], F: (x: number, y: number) => Vec2) {
		const [x0, x1, y0, y1] = box;
		let x = 0;
		let y = 0;
		for (let tries = 0; tries < 12; tries++) {
			x = x0 + (x1 - x0) * this.rand();
			y = y0 + (y1 - y0) * this.rand();
			const v = F(x, y);
			const ok =
				this.o.avoid.every((a) => Math.hypot(x - a[0], y - a[1]) > this.o.avoidRadius * 2.5) &&
				isFinite(v[0]) &&
				Math.hypot(v[0], v[1]) > 1e-3;
			if (ok) break;
		}
		const base = i * this.K * 2;
		for (let k = 0; k < this.K; k++) {
			this.pos[base + 2 * k] = x;
			this.pos[base + 2 * k + 1] = y;
		}
		this.age[i] = 0;
		this.life[i] = 2.2 + 3.2 * this.rand();
	}

	/** Scatter all particles (with random ages, so they don't pulse together). */
	reset(box: [number, number, number, number], F: (x: number, y: number) => Vec2) {
		for (let i = 0; i < this.n; i++) {
			this.spawn(i, box, F);
			this.age[i] = this.rand() * this.life[i];
		}
	}

	step(dt: number, box: [number, number, number, number], F: (x: number, y: number) => Vec2) {
		const { speed, maxSpeed, avoid, avoidRadius } = this.o;
		const vel = (x: number, y: number): Vec2 => {
			const v = F(x, y);
			const m = Math.hypot(v[0], v[1]) * speed;
			const k = m > maxSpeed ? (maxSpeed / m) * speed : speed;
			return [v[0] * k, v[1] * k];
		};
		const [x0, x1, y0, y1] = box;
		const padX = (x1 - x0) * 0.04;
		const padY = (y1 - y0) * 0.04;
		let li = 0;
		for (let i = 0; i < this.n; i++) {
			const base = i * this.K * 2;
			// shift history
			for (let k = this.K - 1; k > 0; k--) {
				this.pos[base + 2 * k] = this.pos[base + 2 * (k - 1)];
				this.pos[base + 2 * k + 1] = this.pos[base + 2 * (k - 1) + 1];
			}
			let x = this.pos[base];
			let y = this.pos[base + 1];
			// midpoint (RK2) step
			const a = vel(x, y);
			const b = vel(x + a[0] * dt * 0.5, y + a[1] * dt * 0.5);
			x += b[0] * dt;
			y += b[1] * dt;
			this.pos[base] = x;
			this.pos[base + 1] = y;
			this.age[i] += dt;
			const out = x < x0 - padX || x > x1 + padX || y < y0 - padY || y > y1 + padY || !isFinite(x) || !isFinite(y);
			const near = avoid.some((p) => Math.hypot(x - p[0], y - p[1]) < avoidRadius);
			if (this.age[i] > this.life[i] || out || near) this.spawn(i, box, F);

			// alpha: fade in and out over the lifetime
			const t = this.age[i] / this.life[i];
			const A = Math.min(1, t * 5) * Math.min(1, (1 - t) * 4);
			this.headPos[3 * i] = this.pos[base];
			this.headPos[3 * i + 1] = this.pos[base + 1];
			this.headPos[3 * i + 2] = 0;
			this.headA[i] = A * 0.95;
			for (let k = 0; k < this.K - 1; k++) {
				const fa = A * (1 - k / (this.K - 1)) * 0.8;
				const fb = A * (1 - (k + 1) / (this.K - 1)) * 0.8;
				this.linePos[3 * li] = this.pos[base + 2 * k];
				this.linePos[3 * li + 1] = this.pos[base + 2 * k + 1];
				this.linePos[3 * li + 2] = 0;
				this.lineA[li] = fa;
				li++;
				this.linePos[3 * li] = this.pos[base + 2 * k + 2];
				this.linePos[3 * li + 1] = this.pos[base + 2 * k + 3];
				this.linePos[3 * li + 2] = 0;
				this.lineA[li] = fb;
				li++;
			}
		}
		(this.headGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
		(this.headGeo.attributes.aAlpha as THREE.BufferAttribute).needsUpdate = true;
		(this.lineGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
		(this.lineGeo.attributes.aAlpha as THREE.BufferAttribute).needsUpdate = true;
	}
}

/** Tiny deterministic PRNG. */
export function mulberry(seed: number) {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}
