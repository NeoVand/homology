// A coffee mug that turns into a doughnut, rendered by ray marching a signed
// distance field. The morph is staged so that it never tears or glues:
//   s1  the cup's dent (cavity) slides up and out — the dent is not a hole;
//   s2  the body shrinks while the handle's ring thickens into the doughnut;
//   s3  what is left of the body sinks inside the doughnut's tube.
// The handle's hole can never close: the line through the ring's centre (along z)
// stays at least min(c.x − rb, R − r) ≥ 0.3 away from both pieces, while the
// smooth union moves surfaces by at most k/4 ≤ 0.075. A gold loop threads the
// hole the whole time — the "cycle" that detects it.

export const cupVertex = /* glsl */ `
	void main() {
		gl_Position = vec4(position.xy, 0.0, 1.0);
	}
`;

export const cupFragment = /* glsl */ `
	precision highp float;
	uniform float uT;
	uniform float uTime;
	uniform vec2 uRes;
	uniform vec3 uCamPos;
	uniform mat4 uInvProj;
	uniform mat4 uCamWorld;
	uniform float uLoop;

	float sdRoundCyl(vec3 p, float r, float h, float rr) {
		vec2 d = vec2(length(p.xz) - r + rr, abs(p.y) - h + rr);
		return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - rr;
	}
	float smin(float a, float b, float k) {
		float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
		return mix(b, a, h) - k * h * (1.0 - h);
	}
	float smax(float a, float b, float k) { return -smin(-a, -b, k); }

	// morph state, computed once per pixel
	float s1, s2, s3, rb, hb, R, r, ky, kk;
	vec3 c, shift;

	void setup() {
		s1 = smoothstep(0.0, 0.32, uT);
		s2 = smoothstep(0.22, 0.9, uT);
		s3 = smoothstep(0.78, 1.0, uT);
		rb = mix(0.95, 0.43, s2) * mix(1.0, 0.55, s3);
		hb = mix(1.05, 0.43, s2) * mix(1.0, 0.55, s3);
		c = vec3(mix(1.25, 1.0, s2), mix(0.04, 0.0, s2), 0.0);
		R = mix(0.47, 1.0, s2);
		r = mix(0.115, 0.43, s2);
		ky = mix(1.3, 1.0, s2);           // the mug's handle is a little taller than wide
		kk = mix(0.06, 0.28, s2);         // blending radius of the smooth union
		shift = vec3(mix(0.42, 1.0, s2), 0.0, 0.0);
	}

	float ringSD(vec3 p) {
		vec3 q = p - c;
		q.y /= ky;
		vec2 w = vec2(length(q.xy) - R, q.z);
		return (length(w) - r) * mix(0.8, 1.0, s2);
	}

	float surfaceSD(vec3 p) {
		float body = sdRoundCyl(p, rb, hb, mix(0.07, 0.3, s2));
		float cav = sdRoundCyl(p - vec3(0.0, mix(0.19, 2.7, s1), 0.0), rb - 0.1, hb, 0.08);
		body = smax(body, -cav, 0.04);
		float ring = ringSD(p);
		// only the outer part of the ring shows on the mug; the cut slides away as it grows
		ring = max(ring, mix(rb - 0.04, -4.0, s2) - p.x);
		return smin(body, ring, kk);
	}

	float loopSD(vec3 p) {
		// a thin ring around the handle's tube, low on its outer side
		const float al = -0.62;
		vec3 q = p - c;
		q.y /= ky;
		vec3 er = vec3(cos(al), sin(al), 0.0);
		vec3 et = vec3(-sin(al), cos(al), 0.0);
		vec3 dq = q - R * er;
		float a = dot(dq, er);
		float b = dq.z;
		float h = dot(dq, et);
		float rho = r + 0.065;
		return (length(vec2(length(vec2(a, b)) - rho, h)) - 0.022) * 0.85;
	}
	vec3 loopNormal(vec3 p) {
		const vec2 k = vec2(1.0, -1.0);
		const float e = 0.001;
		return normalize(k.xyy * loopSD(p + k.xyy * e) + k.yyx * loopSD(p + k.yyx * e) +
			k.yxy * loopSD(p + k.yxy * e) + k.xxx * loopSD(p + k.xxx * e));
	}

	vec2 map(vec3 p) {
		float a = surfaceSD(p);
		float b = uLoop > 0.5 ? loopSD(p) : 1e3;
		return a < b ? vec2(a, 1.0) : vec2(b, 2.0);
	}

	vec3 normalAt(vec3 p) {
		const vec2 k = vec2(1.0, -1.0);
		const float e = 0.0015;
		return normalize(k.xyy * surfaceSD(p + k.xyy * e) + k.yyx * surfaceSD(p + k.yyx * e) +
			k.yxy * surfaceSD(p + k.yxy * e) + k.xxx * surfaceSD(p + k.xxx * e));
	}

	vec3 film(float t) {
		return 0.52 + 0.48 * cos(6.28318 * (t + vec3(0.02, 0.36, 0.62)));
	}
	float lineAA(float x) {
		float w = fwidth(x);
		float d = abs(fract(x - 0.5) - 0.5) / max(w, 1e-4);
		return 1.0 - smoothstep(0.0, 1.3, d);
	}

	vec3 shade(vec3 p, vec3 N, vec3 V) {
		float ndv = clamp(dot(N, V), 0.0, 1.0);
		float fres = pow(1.0 - ndv, 2.2);
		vec3 L1 = normalize(vec3(-0.45, 0.85, 0.55));
		vec3 L2 = normalize(vec3(0.75, 0.15, -0.45));
		float diff = 0.5 + 0.5 * dot(N, L1);
		float spec = pow(max(dot(N, normalize(L1 + V)), 0.0), 60.0);
		float spec2 = pow(max(dot(N, normalize(L2 + V)), 0.0), 22.0);
		float phase = 1.1 * (1.0 - ndv) * 0.9 + 0.06 * sin(p.y * 1.7 + p.x * 0.9 + uTime * 0.25);
		vec3 sheen = film(phase);
		vec3 deep = vec3(0.05, 0.08, 0.2);
		vec3 body = mix(deep, vec3(0.16, 0.22, 0.52), diff);
		vec3 col = body * (0.55 + 0.45 * diff);
		col += sheen * (0.28 + 0.72 * fres) * 0.85;
		col += vec3(1.0, 0.96, 0.88) * spec * 0.8;
		col += sheen * spec2 * 0.35;
		// a soft sky reflection keeps it glassy
		vec3 Rf = reflect(-V, N);
		col += mix(vec3(0.02, 0.03, 0.08), vec3(0.25, 0.3, 0.55), 0.5 + 0.5 * Rf.y) * fres * 0.5;
		// grid: cylinder lines on the mug, torus lines on the doughnut
		vec3 q = p - c;
		q.y /= ky;
		float phi = atan(q.y, q.x) / 6.28318;
		float psi = atan(q.z, length(q.xy) - R) / 6.28318;
		float gT = max(lineAA(phi * 24.0), lineAA(psi * 12.0));
		float th = atan(p.z, p.x) / 6.28318;
		float gM = max(lineAA(th * 24.0), lineAA(p.y * 5.0));
		float g = mix(gM, gT, smoothstep(0.35, 0.75, uT));
		col += vec3(0.75, 0.89, 1.0) * g * 0.28 * (0.55 + 0.45 * fres);
		col += vec3(0.55, 0.78, 1.0) * pow(fres, 3.0) * 0.6;
		return col;
	}

	void main() {
		setup();
		vec2 ndc = (gl_FragCoord.xy / uRes) * 2.0 - 1.0;
		vec4 vp = uInvProj * vec4(ndc, 1.0, 1.0);
		vec3 rd = normalize((uCamWorld * vec4(normalize(vp.xyz / vp.w), 0.0)).xyz);
		vec3 ro = uCamPos + shift;   // march in the object's frame (kept centred on screen)
		// bounding sphere
		vec3 oc = ro - vec3(shift.x, 0.0, 0.0);
		float bR = 2.75;
		float bb = dot(oc, rd);
		float cc = dot(oc, oc) - bR * bR;
		float disc = bb * bb - cc;
		if (disc < 0.0) { gl_FragColor = vec4(0.0); return; }
		float t = max(0.0, -bb - sqrt(disc));
		float tEnd = -bb + sqrt(disc);
		float pix = 1.6 / uRes.y;    // roughly the angle of one pixel
		float minCov = 1e9;
		float glow = 0.0;
		vec2 h = vec2(1e9, 0.0);
		bool hit = false;
		for (int i = 0; i < 110; i++) {
			vec3 p = ro + rd * t;
			h = map(p);
			if (uLoop > 0.5) {
				float dl = max(loopSD(p), 0.0);
				glow += exp(-dl * 30.0) * 0.028 * min(h.x * 18.0, 1.0);
			}
			minCov = min(minCov, h.x / (pix * t));
			if (h.x < 0.0008 * t) { hit = true; break; }
			t += h.x * 0.85;
			if (t > tEnd) break;
		}
		vec3 gold = vec3(0.953, 0.769, 0.424); // palette gold #f3c46c, as the glow tubes use
		if (hit) {
			vec3 p = ro + rd * t;
			vec3 V = -rd;
			if (h.y > 1.5) {
				vec3 Nl = loopNormal(p);
				float c1 = abs(dot(Nl, V));
				vec3 lc = gold * (0.62 + 0.5 * pow(c1, 1.4)) + mix(gold, vec3(1.0), 0.4) * pow(c1, 12.0) * 0.18;
				gl_FragColor = vec4(lc, 1.0);
				return;
			}
			vec3 N = normalAt(p);
			vec3 col = shade(p, N, V);
			col += gold * min(glow, 1.0) * 0.45;
			gl_FragColor = vec4(col, 1.0);
		} else {
			// soft anti-aliased silhouette and the loop's halo
			float cov = 1.0 - smoothstep(0.0, 1.0, minCov);
			float gw = min(glow, 1.0) * 0.8;
			vec3 col = vec3(0.45, 0.62, 0.95) * cov * 0.8 + gold * gw;
			float a = clamp(max(cov * 0.8, gw), 0.0, 1.0);
			gl_FragColor = vec4(col, a);
		}
	}
`;
