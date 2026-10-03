// One shared animation loop for every 3D figure on the page, plus a cap on
// how many WebGL contexts may be alive at once (browsers allow ~16).

export interface LiveScene {
	visible: boolean;
	lastVisible: number;
	/** draw one frame; return true if the scene wants to keep animating */
	frame: (t: number, dt: number) => void;
	/** release the WebGL context (the scene may be re-created later) */
	evict: () => void;
}

const MAX_LIVE = 6;
const live = new Set<LiveScene>();
let raf = 0;
let last = 0;

function loop(now: number) {
	raf = 0;
	const t = now / 1000;
	const dt = last ? Math.min(0.1, t - last) : 1 / 60;
	last = t;
	let any = false;
	for (const s of live) {
		if (!s.visible) continue;
		any = true;
		try {
			s.frame(t, dt);
		} catch (e) {
			console.error('[Scene3D] frame error', e);
		}
	}
	if (any) raf = requestAnimationFrame(loop);
	else last = 0;
}

export function wake() {
	if (!raf && typeof requestAnimationFrame !== 'undefined') raf = requestAnimationFrame(loop);
}

export function register(s: LiveScene) {
	live.add(s);
	enforce();
	wake();
}

export function unregister(s: LiveScene) {
	live.delete(s);
}

function enforce() {
	if (live.size <= MAX_LIVE) return;
	const hidden = [...live].filter((s) => !s.visible).sort((a, b) => a.lastVisible - b.lastVisible);
	while (live.size > MAX_LIVE && hidden.length) {
		const s = hidden.shift()!;
		live.delete(s);
		s.evict();
	}
}
