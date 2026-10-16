// An elastic torus surface, simulated with XPBD (extended position-based
// dynamics; Macklin, Müller & Chentanez 2016, run as "small steps": many
// substeps, one constraint pass each; Macklin et al. 2019).
//
// The tube's wall is two grids of particles over the torus's (u, v) parameters:
// the skin, and a layer half-way to the tube's centre. Distance constraints make
// each layer a rubber sheet (stretch along u and v, shear along the diagonals,
// bending across two cells) and bind the layers together straight through the
// wall and on the slant; that thickness is what keeps the skin from folding when
// it is pushed or dragged sideways. Every particle is tied to its rest position
// by a soft zero-length spring (an elastic core), and nothing may pass through
// the middle of the tube (a collision with the centre circle). A grab pins a
// small round patch of skin to the pointer. How wide the bulge spreads, how fast
// it springs back and how much it overshoots all follow from these material
// constants; nothing is animated by hand.
//
// Only the deformation is simulated, in the torus's own frame; turning the
// torus as a whole is done outside, as a rigid rotation.

const TAU = Math.PI * 2;

export interface ElasticOptions {
  /** ring and tube radii */
  R: number;
  r: number;
  /** particles around the ring and around the tube */
  nu?: number;
  nv?: number;
  /** compliances (inverse stiffness, per unit mass): sheet, bending, rest anchor */
  stretchCompliance?: number;
  bendCompliance?: number;
  anchorCompliance?: number;
  /** viscous damping of particle velocities, per second */
  damping?: number;
  /** radius of the fingertip that grabs the surface */
  fingertip?: number;
  /** depths of the particle layers below the surface, as fractions of the tube
   *  radius (the first must be 0, the surface): the wall's thickness is what
   *  keeps it from folding when pushed or dragged sideways */
  layers?: number[];
  /** compliance of the rest anchors of the inner layers (the firmer core) */
  coreAnchorCompliance?: number;
  /** rubber stiffens as it stretches: however far the pointer goes, the grabbed
   *  point gets at most this far from rest (reach · tanh(distance / reach)) */
  reach?: number;
  /** substeps per frame */
  substeps?: number;
}

export class ElasticTorus {
  readonly nu: number;
  readonly nv: number;
  /** particles in the surface layer (the first n of all particles) */
  readonly n: number;
  /** particles in all layers */
  readonly np: number;
  /** grid spacing around the ring and around the tube, at rest */
  readonly cellU: number;
  readonly cellV: number;
  /** rest positions of every particle, and rest normals of the surface (object space) */
  readonly rest: Float32Array;
  readonly restN: Float32Array;
  /** current positions and velocities */
  readonly x: Float32Array;
  readonly v: Float32Array;
  private prev: Float32Array;
  private ci: Int32Array;
  private cj: Int32Array;
  private cl: Float32Array;
  private ca: Float32Array;
  private anchorA: Float32Array;
  private damping: number;
  private substeps: number;
  /** pinned particles: index, and its offset from the grab point at rest */
  private pins: { i: number; ox: number; oy: number; oz: number; w: number }[] =
    [];
  private target = [0, 0, 0];
  private grabRest = [0, 0, 0];
  private grabN = [0, 0, 1];
  private R: number;
  private r: number;
  private depths: number[];
  private fingertip: number;
  private reach: number;
  /** true once the sheet has come to rest and stopped simulating */
  asleep = true;

  constructor(o: ElasticOptions) {
    this.nu = o.nu ?? 44;
    this.nv = o.nv ?? 16;
    this.n = this.nu * this.nv;
    const depths = o.layers ?? [0, 0.5];
    this.R = o.R;
    this.r = o.r;
    this.depths = depths;
    this.np = this.n * depths.length;
    this.cellU = (TAU * (o.R - o.r)) / this.nu;
    this.cellV = (TAU * o.r) / this.nv;
    // a firm rubber: released, it is half-way home in 0.05 s, dips ~5% past rest once,
    // and is still within 0.3 s (see elasticTorus.test.ts)
    const skinA = o.anchorCompliance ?? 1 / 240;
    const coreA = o.coreAnchorCompliance ?? 1 / 600;
    this.anchorA = new Float32Array(this.np);
    for (let k = 0; k < this.np; k++)
      this.anchorA[k] = k < this.n ? skinA : coreA;
    this.damping = o.damping ?? 30;
    this.substeps = o.substeps ?? 6;
    this.fingertip = o.fingertip ?? 0.34;
    this.reach = o.reach ?? 1.2;
    this.rest = new Float32Array(this.np * 3);
    this.restN = new Float32Array(this.n * 3);
    for (let l = 0; l < depths.length; l++)
      for (let j = 0; j < this.nv; j++)
        for (let i = 0; i < this.nu; i++) {
          const k = (l * this.n + this.idx(i, j)) * 3;
          const th = (TAU * i) / this.nu;
          const ph = (TAU * j) / this.nv;
          const rr = o.r * (1 - depths[l]);
          const w = o.R + rr * Math.cos(ph);
          this.rest[k] = w * Math.cos(th);
          this.rest[k + 1] = rr * Math.sin(ph);
          this.rest[k + 2] = w * Math.sin(th);
          if (l === 0) {
            this.restN[k] = Math.cos(ph) * Math.cos(th);
            this.restN[k + 1] = Math.sin(ph);
            this.restN[k + 2] = Math.cos(ph) * Math.sin(th);
          }
        }
    this.x = this.rest.slice();
    this.v = new Float32Array(this.np * 3);
    this.prev = new Float32Array(this.np * 3);

    const sA = o.stretchCompliance ?? 1 / 4800;
    const bA = o.bendCompliance ?? 1 / 900;
    const I: number[] = [];
    const J: number[] = [];
    const A: number[] = [];
    const link = (a: number, b: number, alpha: number) => {
      I.push(a);
      J.push(b);
      A.push(alpha);
    };
    const at = (l: number, i: number, j: number) => l * this.n + this.idx(i, j);
    for (let l = 0; l < depths.length; l++)
      for (let j = 0; j < this.nv; j++)
        for (let i = 0; i < this.nu; i++) {
          const a = at(l, i, j);
          link(a, at(l, i + 1, j), sA); // stretch
          link(a, at(l, i, j + 1), sA);
          link(a, at(l, i + 1, j + 1), sA); // shear
          link(a, at(l, i + 1, j - 1), sA);
          link(a, at(l, i + 2, j), bA); // bending
          link(a, at(l, i, j + 2), bA);
          if (l + 1 < depths.length) {
            // through the wall: straight in, and slanting, so it resists shear too
            link(a, at(l + 1, i, j), sA);
            link(a, at(l + 1, i + 1, j), sA);
            link(a, at(l + 1, i - 1, j), sA);
            link(a, at(l + 1, i, j + 1), sA);
            link(a, at(l + 1, i, j - 1), sA);
          }
        }
    this.ci = Int32Array.from(I);
    this.cj = Int32Array.from(J);
    this.ca = Float32Array.from(A);
    this.cl = new Float32Array(I.length);
    for (let c = 0; c < I.length; c++)
      this.cl[c] = this.dist(this.rest, I[c], J[c]);
  }

  private anchorCache = { h2: -1, f: new Float32Array(0) };
  /** XPBD factor of each rest anchor for substep h (unit masses): 1 / (1 + α / h²) */
  private anchorFactor(h2: number) {
    if (this.anchorCache.h2 !== h2) {
      const f = new Float32Array(this.np);
      for (let p = 0; p < this.np; p++) f[p] = 1 / (1 + this.anchorA[p] / h2);
      this.anchorCache = { h2, f };
    }
    return this.anchorCache.f;
  }

  /** keep each layer at least a fixed distance from the tube's centre circle */
  private collideCore() {
    const { x, n, R, r } = this;
    for (let l = 0; l < this.depths.length; l++) {
      const min = r * Math.max(0.15, 0.55 - this.depths[l]);
      for (let p = l * n, k = l * n * 3; p < (l + 1) * n; p++, k += 3) {
        const px = x[k];
        const py = x[k + 1];
        const pz = x[k + 2];
        const rho = Math.sqrt(px * px + pz * pz) || 1e-9;
        // nearest point of the centre circle
        const cx = (px / rho) * R;
        const cz = (pz / rho) * R;
        const ex = px - cx;
        const ez = pz - cz;
        const d = Math.sqrt(ex * ex + py * py + ez * ez);
        if (d < min && d > 1e-9) {
          const s = min / d;
          x[k] = cx + ex * s;
          x[k + 1] = py * s;
          x[k + 2] = cz + ez * s;
        }
      }
    }
  }

  /** particle index of surface grid cell (i, j), wrapping both ways */
  idx(i: number, j: number) {
    const a = ((i % this.nu) + this.nu) % this.nu;
    const b = ((j % this.nv) + this.nv) % this.nv;
    return b * this.nu + a;
  }

  private dist(p: Float32Array, a: number, b: number) {
    const dx = p[b * 3] - p[a * 3];
    const dy = p[b * 3 + 1] - p[a * 3 + 1];
    const dz = p[b * 3 + 2] - p[a * 3 + 2];
    return Math.hypot(dx, dy, dz);
  }

  /**
   * Pin the patch around parameter (u, v) to the pointer, like a fingertip
   * pressed into the rubber.
   */
  grab(u: number, v: number) {
    const gi = Math.round(u * this.nu);
    const gj = Math.round(v * this.nv);
    const c = this.idx(gi, gj) * 3;
    this.pins = [];
    // a round fingertip of the given radius (in space, whatever the grid), held
    // firmly at the centre and softly at the rim
    const rho = this.fingertip;
    const span = Math.ceil((1.6 * rho) / Math.min(this.cellU, this.cellV));
    for (let dj = -span; dj <= span; dj++)
      for (let di = -span; di <= span; di++) {
        const i = this.idx(gi + di, gj + dj);
        const ox = this.rest[i * 3] - this.rest[c];
        const oy = this.rest[i * 3 + 1] - this.rest[c + 1];
        const oz = this.rest[i * 3 + 2] - this.rest[c + 2];
        const d2 = (ox * ox + oy * oy + oz * oz) / (rho * rho);
        if (d2 > 2.56) continue;
        this.pins.push({ i, ox, oy, oz, w: Math.exp(-d2) });
      }
    this.grabRest = [this.rest[c], this.rest[c + 1], this.rest[c + 2]];
    this.grabN = [this.restN[c], this.restN[c + 1], this.restN[c + 2]];
    // hold it where it is now (it may still be moving from an earlier pull)
    this.target = [this.x[c], this.x[c + 1], this.x[c + 2]];
    this.asleep = false;
    return [this.rest[c], this.rest[c + 1], this.rest[c + 2]] as const;
  }

  /**
   * Where the pointer wants the grabbed point (object space). Rubber gives way
   * by different amounts in different directions: pulled outward it stretches
   * a long way, sheared sideways it stiffens sooner, and pressed inward it only
   * dents (the core is solid). Each response saturates smoothly (a · tanh(d / a)).
   */
  moveTo(x: number, y: number, z: number) {
    const [gx, gy, gz] = this.grabRest;
    const [nx, ny, nz] = this.grabN;
    const dx = x - gx;
    const dy = y - gy;
    const dz = z - gz;
    const dn = dx * nx + dy * ny + dz * nz;
    const tx = dx - dn * nx;
    const ty = dy - dn * ny;
    const tz = dz - dn * nz;
    const dt = Math.sqrt(tx * tx + ty * ty + tz * tz);
    const soft = (d: number, a: number) => a * Math.tanh(d / a);
    const n = dn >= 0 ? soft(dn, this.reach) : -soft(-dn, 0.3 * this.r);
    const t = dt > 1e-9 ? soft(dt, 0.45 * this.reach) / dt : 1;
    this.target = [
      gx + nx * n + tx * t,
      gy + ny * n + ty * t,
      gz + nz * n + tz * t,
    ];
  }

  release() {
    this.pins = [];
  }

  get holding() {
    return this.pins.length > 0;
  }

  /** advance by dt seconds; returns true while anything moves */
  step(dt: number): boolean {
    if (this.asleep) return false;
    const { x, v, prev, ci, cj, cl, ca, rest } = this;
    const h = dt / this.substeps;
    const h2 = h * h;
    const damp = Math.exp(-this.damping * h);
    const anchor = this.anchorFactor(h2);
    for (let s = 0; s < this.substeps; s++) {
      // predict
      for (let k = 0; k < x.length; k++) {
        v[k] *= damp;
        prev[k] = x[k];
        x[k] += v[k] * h;
      }
      // rest anchors (zero-length springs): C = |x − x₀|
      for (let p = 0, k = 0; p < this.np; p++, k += 3) {
        const f = anchor[p];
        x[k] += (rest[k] - x[k]) * f;
        x[k + 1] += (rest[k + 1] - x[k + 1]) * f;
        x[k + 2] += (rest[k + 2] - x[k + 2]) * f;
      }
      // sheet: stretch, shear, bending
      for (let c = 0; c < ci.length; c++) {
        const a = ci[c] * 3;
        const b = cj[c] * 3;
        const dx = x[b] - x[a];
        const dy = x[b + 1] - x[a + 1];
        const dz = x[b + 2] - x[a + 2];
        const L = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (L < 1e-9) continue;
        // two unit masses: Δλ = −C / (w₁ + w₂ + α/h²)
        const corr = -(L - cl[c]) / (2 + ca[c] / h2) / L;
        x[a] -= dx * corr;
        x[a + 1] -= dy * corr;
        x[a + 2] -= dz * corr;
        x[b] += dx * corr;
        x[b + 1] += dy * corr;
        x[b + 2] += dz * corr;
      }
      // the solid core: nothing passes through the middle of the tube
      this.collideCore();
      // the fingertip
      for (const p of this.pins) {
        const k = p.i * 3;
        x[k] += (this.target[0] + p.ox - x[k]) * p.w;
        x[k + 1] += (this.target[1] + p.oy - x[k + 1]) * p.w;
        x[k + 2] += (this.target[2] + p.oz - x[k + 2]) * p.w;
      }
      for (let k = 0; k < x.length; k++) v[k] = (x[k] - prev[k]) / h;
    }
    // asleep once released and still
    if (!this.pins.length) {
      let maxD = 0;
      let maxV = 0;
      for (let k = 0; k < x.length; k++) {
        maxD = Math.max(maxD, Math.abs(x[k] - rest[k]));
        maxV = Math.max(maxV, Math.abs(v[k]));
      }
      if (maxD < 2e-4 && maxV < 2e-3) {
        x.set(rest);
        v.fill(0);
        this.asleep = true;
      }
    }
    return true;
  }

  /**
   * How many grid cells have folded over (turned inside out): their (u, v)
   * orientation has reversed compared with rest. Zero for a healthy surface.
   */
  folds() {
    const { x, rest } = this;
    let count = 0;
    const cross = (
      p: Float32Array,
      a: number,
      b: number,
      c: number,
      d: number,
    ) => {
      const e1x = p[a] - p[b];
      const e1y = p[a + 1] - p[b + 1];
      const e1z = p[a + 2] - p[b + 2];
      const e2x = p[c] - p[d];
      const e2y = p[c + 1] - p[d + 1];
      const e2z = p[c + 2] - p[d + 2];
      return [
        e1y * e2z - e1z * e2y,
        e1z * e2x - e1x * e2z,
        e1x * e2y - e1y * e2x,
      ];
    };
    for (let j = 0; j < this.nv; j++)
      for (let i = 0; i < this.nu; i++) {
        const a = this.idx(i + 1, j) * 3;
        const b = this.idx(i, j) * 3;
        const c = this.idx(i, j + 1) * 3;
        const n0 = cross(rest, a, b, c, b);
        const n1 = cross(x, a, b, c, b);
        if (n0[0] * n1[0] + n0[1] * n1[1] + n0[2] * n1[2] <= 0) count++;
      }
    return count;
  }

  /** the largest distance of any particle from its rest position */
  maxDisplacement() {
    let m = 0;
    for (let k = 0; k < this.n; k++)
      m = Math.max(
        m,
        Math.hypot(
          this.x[k * 3] - this.rest[k * 3],
          this.x[k * 3 + 1] - this.rest[k * 3 + 1],
          this.x[k * 3 + 2] - this.rest[k * 3 + 2],
        ),
      );
    return m;
  }

  /**
   * Fill displacement and normal-change fields, one texel per particle
   * (RGBA, row-major in (i, j)): what the shader adds to each vertex.
   */
  fields(disp: Float32Array, dn: Float32Array) {
    const { x, rest, restN, nu, nv } = this;
    const e1 = [0, 0, 0];
    const e2 = [0, 0, 0];
    for (let j = 0; j < nv; j++)
      for (let i = 0; i < nu; i++) {
        const k = this.idx(i, j);
        const a = this.idx(i + 1, j) * 3;
        const b = this.idx(i - 1, j) * 3;
        const c = this.idx(i, j + 1) * 3;
        const d = this.idx(i, j - 1) * 3;
        for (let q = 0; q < 3; q++) {
          e1[q] = x[a + q] - x[b + q];
          e2[q] = x[c + q] - x[d + q];
        }
        let nx = e1[1] * e2[2] - e1[2] * e2[1];
        let ny = e1[2] * e2[0] - e1[0] * e2[2];
        let nz = e1[0] * e2[1] - e1[1] * e2[0];
        const len = Math.hypot(nx, ny, nz) || 1;
        nx /= len;
        ny /= len;
        nz /= len;
        // face the same way as the rest normal
        if (
          nx * restN[k * 3] + ny * restN[k * 3 + 1] + nz * restN[k * 3 + 2] <
          0
        )
          [nx, ny, nz] = [-nx, -ny, -nz];
        const t = k * 4;
        disp[t] = x[k * 3] - rest[k * 3];
        disp[t + 1] = x[k * 3 + 1] - rest[k * 3 + 1];
        disp[t + 2] = x[k * 3 + 2] - rest[k * 3 + 2];
        dn[t] = nx - restN[k * 3];
        dn[t + 1] = ny - restN[k * 3 + 1];
        dn[t + 2] = nz - restN[k * 3 + 2];
      }
  }

  /** bilinear sample of a field at (u, v), exactly as the GPU filters it */
  sample(
    field: Float32Array,
    u: number,
    v: number,
    out: [number, number, number],
  ) {
    const fu = (((u % 1) + 1) % 1) * this.nu;
    const fv = (((v % 1) + 1) % 1) * this.nv;
    const i0 = Math.floor(fu);
    const j0 = Math.floor(fv);
    const a = fu - i0;
    const b = fv - j0;
    const k00 = this.idx(i0, j0) * 4;
    const k10 = this.idx(i0 + 1, j0) * 4;
    const k01 = this.idx(i0, j0 + 1) * 4;
    const k11 = this.idx(i0 + 1, j0 + 1) * 4;
    for (let q = 0; q < 3; q++)
      out[q] =
        (1 - a) * (1 - b) * field[k00 + q] +
        a * (1 - b) * field[k10 + q] +
        (1 - a) * b * field[k01 + q] +
        a * b * field[k11 + q];
    return out;
  }
}
