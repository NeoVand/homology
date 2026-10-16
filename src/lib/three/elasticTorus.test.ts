import { describe, expect, it } from "vitest";
import { ElasticTorus } from "./elasticTorus";

const R = 1.55;
const r = 0.6;

/** pull the outer equator at u = 0 straight out by `amount`, hold, let go */
function pullAndRelease(amount: number) {
  const s = new ElasticTorus({ R, r });
  const [gx, gy, gz] = s.grab(0, 0);
  const dt = 1 / 60;
  for (let f = 0; f < 60; f++) {
    s.moveTo(gx + amount * Math.min(1, f / 20), gy, gz);
    s.step(dt);
  }
  const k = s.idx(0, 0) * 3;
  const held = s.x[k] - s.rest[k];
  // how far the pull spreads: displacement 3 cells (≈ 0.6) round the ring, relative to the peak
  const k4 = s.idx(3, 0) * 3;
  const spread =
    Math.hypot(s.x[k4] - s.rest[k4], s.x[k4 + 2] - s.rest[k4 + 2]) / held;
  s.release();
  let minX = Infinity;
  let settle = -1;
  const trace: number[] = [];
  for (let f = 1; f <= 240; f++) {
    s.step(dt);
    const d = s.x[k] - s.rest[k];
    trace.push(d);
    minX = Math.min(minX, d);
    if (
      settle < 0 &&
      f > 3 &&
      Math.abs(d) < 0.02 * held &&
      trace.slice(-6).every((t) => Math.abs(t) < 0.02 * held)
    )
      settle = f * dt;
  }
  return { held, spread, overshoot: -minX / held, settle, asleep: s.asleep };
}

describe("the elastic torus", () => {
  it("starts at rest and asleep", () => {
    const s = new ElasticTorus({ R, r });
    expect(s.maxDisplacement()).toBe(0);
    expect(s.step(1 / 60)).toBe(false);
  });

  it("follows a grab, with a smooth bulge around it", () => {
    const { held, spread } = pullAndRelease(0.9);
    // it follows the pointer, stiffening as it stretches: reach · tanh(0.9 / reach), reach 1.2
    expect(held).toBeCloseTo(1.2 * Math.tanh(0.9 / 1.2), 1);
    // a soft hill, not a spike and not the whole ring
    expect(spread).toBeGreaterThan(0.15);
    expect(spread).toBeLessThan(0.75);
  });

  it("springs back like firm rubber: at most one small dip past rest, still within half a second", () => {
    const { overshoot, settle, asleep } = pullAndRelease(0.9);
    expect(overshoot).toBeLessThan(0.1);
    expect(settle).toBeGreaterThan(0);
    expect(settle).toBeLessThan(0.5);
    expect(asleep).toBe(true);
  });

  it("does not fold over, however hard it is yanked", () => {
    const yanks: [number, number, [number, number, number]][] = [
      [0, 0, [3, 0, 0]], // outward
      [0, 0, [-3, 0, 0]], // straight in, through the tube
      [0, 0, [0, 0, 3]], // sideways
      [0, 0.25, [0, 3, 0]], // up from the top
      [0, 0.5, [3.5, 0, 0]], // the inner side, across the hole and through the tube
      [0.1, 0.1, [2, 2, 2]],
      [0.3, 0.25, [1.5, -2.5, 1]],
      [0.3, 0.25, [0, 0, -3]],
    ];
    const folded = yanks.map(([u, v, d]) => {
      const s = new ElasticTorus({ R, r });
      const g = s.grab(u, v);
      for (let f = 0; f < 45; f++) {
        const k = Math.min(1, f / 15);
        s.moveTo(g[0] + d[0] * k, g[1] + d[1] * k, g[2] + d[2] * k);
        s.step(1 / 60);
      }
      return s.folds();
    });
    // at most a wrinkle of a few cells (out of 704) beside the fingertip
    expect(Math.max(...folded)).toBeLessThanOrEqual(4);
    expect(folded.filter((c) => c > 0).length).toBeLessThanOrEqual(1);
  });

  it("is stable for a hard yank and a slow frame", () => {
    const s = new ElasticTorus({ R, r });
    const [gx, gy, gz] = s.grab(0.3, 0.6);
    s.moveTo(gx + 2.2, gy - 1.5, gz + 1);
    for (let f = 0; f < 30; f++) s.step(1 / 20);
    s.release();
    for (let f = 0; f < 120; f++) s.step(1 / 20);
    expect(Number.isFinite(s.maxDisplacement())).toBe(true);
    expect(s.maxDisplacement()).toBeLessThan(0.01);
  });
});
