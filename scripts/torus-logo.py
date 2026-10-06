"""Compute an exact line drawing of a torus seen from above at an angle:
outer silhouette, the visible part of the inner silhouette (the hole), and a
longitude loop on the top of the tube (split into visible / hidden parts).
Orthographic view. Outputs SVG path data in a 48x48 box."""
import math, sys, os

R, r = 1.0, float(sys.argv[1]) if len(sys.argv) > 1 else 0.42
alpha = math.radians(float(sys.argv[2]) if len(sys.argv) > 2 else 32)  # elevation
ca, sa = math.cos(alpha), math.sin(alpha)

def P(th, ph):
    w = R + r * math.cos(ph)
    return (w * math.cos(th), r * math.sin(ph), w * math.sin(th))

def N(th, ph):
    return (math.cos(ph) * math.cos(th), math.sin(ph), math.cos(ph) * math.sin(th))

# view direction towards the camera (camera above and in front, looking at origin)
V = (0.0, sa, ca)

def proj(p):
    x, y, z = p
    # screen X = x; screen Y (down) = -(y*ca - z*sa)
    return (x, -(y * ca - z * sa))

def depth(p):  # larger = closer to camera
    return p[0] * V[0] + p[1] * V[1] + p[2] * V[2]

def visible(p, eps=1e-3):
    """Is point p of the torus visible? March along the ray towards the camera."""
    x, y, z = p
    for k in range(1, 400):
        t = eps + k * 0.01
        q = (x + V[0] * t, y + V[1] * t, z + V[2] * t)
        # inside the solid torus?
        rho = math.hypot(q[0], q[2])
        if (rho - R) ** 2 + q[1] ** 2 < r * r * 0.999:
            return False
    return True

# silhouette: N . V = 0  ->  sin(ph)*sa + cos(ph)*sin(th)*ca = 0
def sil_phis(th):
    base = math.atan2(-math.sin(th) * ca, sa)
    return [base, base + math.pi]

n = 720
outer, inner = [], []
for i in range(n + 1):
    th = 2 * math.pi * i / n
    phs = sil_phis(th)
    # outer silhouette: the one with larger distance from the axis
    pts = [P(th, ph) for ph in phs]
    pts.sort(key=lambda p: -math.hypot(p[0], p[2]))
    outer.append(pts[0])
    inner.append(pts[1])

def to_box(pt2):
    # fit: x in [-(R+r), R+r] -> [4, 44]
    s = 20 / (R + r)
    return (24 + pt2[0] * s, 24 + pt2[1] * s)

def path_segments(points3, vis_check=True):
    segs, cur = [], []
    for p in points3:
        v = visible(p) if vis_check else True
        if v:
            cur.append(to_box(proj(p)))
        elif cur:
            segs.append(cur); cur = []
    if cur:
        segs.append(cur)
    return segs

def d_of(seg, closed=False):
    s = 'M' + ' L'.join(f'{x:.2f} {y:.2f}' for x, y in seg[::int(os.environ.get('STEP', '4'))] + [seg[-1]])
    return s + (' Z' if closed else '')

outer_d = d_of([to_box(proj(p)) for p in outer], closed=True)
inner_segs = path_segments(inner)
# longitude loop on the top of the tube: ph = pi/2 - small (slightly towards outside)
loop = [P(2 * math.pi * i / n, math.radians(float(sys.argv[3]) if len(sys.argv) > 3 else 70)) for i in range(n + 1)]
loop_vis = path_segments(loop)
loop_hidden = []
cur = []
for p in loop:
    if not visible(p):
        cur.append(to_box(proj(p)))
    elif cur:
        loop_hidden.append(cur); cur = []
if cur: loop_hidden.append(cur)

ys = [to_box(proj(p))[1] for p in outer]
print('// r', r, 'alpha', math.degrees(alpha), 'y-extent', round(min(ys), 2), round(max(ys), 2))
print('OUTER', outer_d)
for s in inner_segs:
    if len(s) > 3: print('INNER', d_of(s))
for s in loop_vis:
    if len(s) > 3: print('LOOP', d_of(s))
for s in loop_hidden:
    if len(s) > 3: print('LOOPH', d_of(s))
