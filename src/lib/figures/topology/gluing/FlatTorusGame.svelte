<script lang="ts">
	// A Jeff-Weeks-style flight game on a glued square. Fly off one edge and you
	// come back through the edge it is glued to — mirror-reversed if the arrows say so.
	import { onMount } from 'svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	type Mode = 'torus' | 'klein' | 'rp2';
	let mode = $state<Mode>('torus');
	let ghosts = $state(true);
	let crossings = $state(0);
	let mirrored = $state(false);
	let canvas: HTMLCanvasElement;
	let wrap: HTMLDivElement;

	// how each edge is glued: crossing the top/bottom edge flips x for Klein and ℝP²;
	// crossing left/right flips y for ℝP² only (same conventions as the workshop)
	const flipsTB: Record<Mode, boolean> = { torus: false, klein: true, rp2: true };
	const flipsLR: Record<Mode, boolean> = { torus: false, klein: false, rp2: true };

	// ship state in square coordinates [0,1)², y up
	const ship = { x: 0.32, y: 0.38, a: 0.55, vx: 0.08, vy: 0.05, mir: false };
	const keys = { left: false, right: false, thrust: false };
	let pilot = true; // autopilot until the reader takes over
	const trail: { x: number; y: number; brk: boolean }[] = [];

	function resetShip() {
		ship.x = 0.32;
		ship.y = 0.38;
		ship.a = 0.55;
		ship.vx = 0.08;
		ship.vy = 0.05;
		ship.mir = false;
		trail.length = 0;
		crossings = 0;
		mirrored = false;
	}

	function step(dt: number, t: number) {
		if (pilot) {
			// a gentle looping flight that keeps crossing edges
			ship.a += dt * (0.5 + 0.45 * Math.sin(t * 0.37));
			const sp = 0.12;
			ship.vx += (Math.cos(ship.a) * sp - ship.vx) * dt * 0.9;
			ship.vy += (Math.sin(ship.a) * sp - ship.vy) * dt * 0.9;
		} else {
			if (keys.left) ship.a += dt * 2.6;
			if (keys.right) ship.a -= dt * 2.6;
			if (keys.thrust) {
				ship.vx += Math.cos(ship.a) * dt * 0.35;
				ship.vy += Math.sin(ship.a) * dt * 0.35;
			}
			const s = Math.hypot(ship.vx, ship.vy);
			const max = 0.42;
			if (s > max) {
				ship.vx *= max / s;
				ship.vy *= max / s;
			}
			ship.vx *= 1 - dt * 0.25;
			ship.vy *= 1 - dt * 0.25;
		}
		ship.x += ship.vx * dt;
		ship.y += ship.vy * dt;
		let crossed = false;
		if (ship.x >= 1 || ship.x < 0) {
			ship.x -= Math.floor(ship.x);
			if (flipsLR[mode]) {
				ship.y = 1 - ship.y;
				ship.vy = -ship.vy;
				ship.a = -ship.a;
				ship.mir = !ship.mir;
			}
			crossed = true;
		}
		if (ship.y >= 1 || ship.y < 0) {
			ship.y -= Math.floor(ship.y);
			if (flipsTB[mode]) {
				ship.x = 1 - ship.x;
				ship.vx = -ship.vx;
				ship.a = Math.PI - ship.a;
				ship.mir = !ship.mir;
			}
			crossed = true;
		}
		if (crossed) {
			crossings++;
			mirrored = ship.mir;
		}
		trail.push({ x: ship.x, y: ship.y, brk: crossed });
		if (trail.length > 420) trail.shift();
	}

	// ── drawing ──────────────────────────────────────────────────────────────
	const GOLD = '#f4d79c';
	const TEAL = '#5fd6cf';
	const ROSE = '#f28db6';

	function draw(ctx: CanvasRenderingContext2D, W: number) {
		const showGhosts = ghosts && mode !== 'rp2';
		const n = showGhosts ? 3 : 1;
		const pad = W * 0.04;
		const S = (W - 2 * pad) / n; // size of one copy of the square
		ctx.clearRect(0, 0, W, W);
		// copies: (i, j) = column, row offsets from the centre copy
		const copies: { i: number; j: number }[] = [];
		const r = showGhosts ? 1 : 0;
		for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) copies.push({ i, j });
		for (const { i, j } of copies) {
			const main = i === 0 && j === 0;
			const x0 = pad + (i + r) * S;
			const y0 = pad + (r - j) * S; // row j above the centre is drawn higher
			// in the Klein bottle, copies in odd rows are mirror images (x ↦ 1 − x)
			const mx = mode === 'klein' && Math.abs(j) % 2 === 1;
			ctx.save();
			ctx.translate(x0, y0);
			ctx.globalAlpha = main ? 1 : 0.38;
			drawSquare(ctx, S, main, mx);
			// map square coords → this copy
			const X = (x: number) => (mx ? 1 - x : x) * S;
			const Y = (y: number) => (1 - y) * S;
			ctx.beginPath();
			ctx.rect(0, 0, S, S);
			ctx.clip();
			drawTrail(ctx, X, Y, S);
			drawShip(ctx, X(ship.x), Y(ship.y), mx ? Math.PI - ship.a : ship.a, S, ship.mir !== mx);
			ctx.restore();
		}
	}

	function drawSquare(ctx: CanvasRenderingContext2D, S: number, main: boolean, mx: boolean) {
		const g = ctx.createLinearGradient(0, 0, S, S);
		g.addColorStop(0, 'rgba(111,214,232,0.10)');
		g.addColorStop(0.5, 'rgba(143,124,247,0.09)');
		g.addColorStop(1, 'rgba(238,143,191,0.10)');
		ctx.fillStyle = g;
		ctx.fillRect(0, 0, S, S);
		ctx.strokeStyle = 'rgba(191,228,255,0.07)';
		ctx.lineWidth = 1;
		for (let k = 1; k < 8; k++) {
			ctx.beginPath();
			ctx.moveTo((k * S) / 8, 0);
			ctx.lineTo((k * S) / 8, S);
			ctx.moveTo(0, (k * S) / 8);
			ctx.lineTo(S, (k * S) / 8);
			ctx.stroke();
		}
		// edges with arrows (bottom/top = a gold, left/right = b teal)
		const lw = Math.max(2, S * 0.008);
		const edge = (x1: number, y1: number, x2: number, y2: number, col: string, dir: number, marks: number) => {
			ctx.strokeStyle = col;
			ctx.lineWidth = lw;
			ctx.beginPath();
			ctx.moveTo(x1, y1);
			ctx.lineTo(x2, y2);
			ctx.stroke();
			const ux = ((x2 - x1) / S) * dir;
			const uy = ((y2 - y1) / S) * dir;
			const cx = (x1 + x2) / 2;
			const cy = (y1 + y2) / 2;
			const h = S * 0.035;
			for (let k = 0; k < marks; k++) {
				const off = (k - (marks - 1) / 2) * h * 1.3;
				const px = cx + ux * off;
				const py = cy + uy * off;
				ctx.beginPath();
				ctx.moveTo(px - ux * h - uy * h, py - uy * h + ux * h);
				ctx.lineTo(px + ux * h * 0.4, py + uy * h * 0.4);
				ctx.lineTo(px - ux * h + uy * h, py - uy * h - ux * h);
				ctx.stroke();
			}
		};
		if (!main) ctx.globalAlpha *= 0.8;
		// bottom: left→right; top: left→right unless flipped
		const tbFlip = flipsTB[mode];
		const lrFlip = flipsLR[mode];
		const s = mx ? -1 : 1;
		edge(0, S, S, S, GOLD, s, 1);
		edge(0, 0, S, 0, GOLD, tbFlip ? -s : s, 1);
		// left: bottom→top (in canvas: from y=S to y=0); right likewise, reversed for ℝP²
		edge(0, S, 0, 0, TEAL, lrFlip ? -1 : 1, 2);
		edge(S, S, S, 0, TEAL, 1, 2);
	}

	function drawTrail(ctx: CanvasRenderingContext2D, X: (x: number) => number, Y: (y: number) => number, S: number) {
		ctx.lineCap = 'round';
		for (let k = 1; k < trail.length; k++) {
			if (trail[k].brk) continue;
			const a = trail[k - 1];
			const b = trail[k];
			const f = k / trail.length;
			ctx.strokeStyle = `rgba(244,215,156,${0.05 + 0.75 * f * f})`;
			ctx.lineWidth = Math.max(1.5, S * 0.007) * (0.4 + f);
			ctx.beginPath();
			ctx.moveTo(X(a.x), Y(a.y));
			ctx.lineTo(X(b.x), Y(b.y));
			ctx.stroke();
		}
	}

	function drawShip(ctx: CanvasRenderingContext2D, x: number, y: number, a: number, S: number, mir: boolean) {
		const L = S * 0.06;
		ctx.save();
		ctx.translate(x, y);
		ctx.rotate(-a);
		if (mir) ctx.scale(1, -1);
		// glow
		const g = ctx.createRadialGradient(0, 0, 0, 0, 0, L * 2.2);
		g.addColorStop(0, 'rgba(255,240,210,0.35)');
		g.addColorStop(1, 'rgba(255,240,210,0)');
		ctx.fillStyle = g;
		ctx.beginPath();
		ctx.arc(0, 0, L * 2.2, 0, Math.PI * 2);
		ctx.fill();
		// body
		ctx.fillStyle = '#fbf6e8';
		ctx.beginPath();
		ctx.moveTo(L, 0);
		ctx.lineTo(-L * 0.7, L * 0.62);
		ctx.lineTo(-L * 0.35, 0);
		ctx.lineTo(-L * 0.7, -L * 0.62);
		ctx.closePath();
		ctx.fill();
		// a rose stripe on the left wing only — so mirror images look different
		ctx.fillStyle = ROSE;
		ctx.beginPath();
		ctx.moveTo(L * 0.25, -L * 0.14);
		ctx.lineTo(-L * 0.7, -L * 0.62);
		ctx.lineTo(-L * 0.42, -L * 0.18);
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle = TEAL;
		ctx.beginPath();
		ctx.arc(L * 0.18, L * 0.12, L * 0.11, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	}

	onMount(() => {
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) pilot = false;
		const ctx = canvas.getContext('2d')!;
		let W = 400;
		let dpr = 1;
		const resize = () => {
			const r = wrap.getBoundingClientRect();
			W = Math.max(200, Math.min(r.width, 480));
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = Math.round(W * dpr);
			canvas.height = Math.round(W * dpr);
			canvas.style.width = W + 'px';
			canvas.style.height = W + 'px';
		};
		const ro = new ResizeObserver(resize);
		ro.observe(wrap);
		resize();
		let raf = 0;
		let last = 0;
		let visible = false;
		let t = 0;
		const frame = (now: number) => {
			raf = 0;
			if (!visible) return;
			const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
			last = now;
			t += dt;
			if (!(reduced && pilot)) step(dt, t);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			draw(ctx, W);
			raf = requestAnimationFrame(frame);
		};
		const io = new IntersectionObserver(([e]) => {
			visible = e.isIntersecting;
			last = 0;
			if (visible && !raf) raf = requestAnimationFrame(frame);
		});
		io.observe(canvas);
		// draw once even before the first frame
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		draw(ctx, W);
		return () => {
			io.disconnect();
			ro.disconnect();
			cancelAnimationFrame(raf);
		};
	});

	function onKey(e: KeyboardEvent, down: boolean) {
		const k = e.key;
		const map: Record<string, keyof typeof keys> = {
			ArrowLeft: 'left',
			a: 'left',
			ArrowRight: 'right',
			d: 'right',
			ArrowUp: 'thrust',
			w: 'thrust',
			' ': 'thrust'
		};
		const which = map[k];
		if (!which) return;
		e.preventDefault();
		pilot = false;
		keys[which] = down;
	}
	function hold(which: keyof typeof keys, on: boolean) {
		pilot = false;
		keys[which] = on;
	}
</script>

<div class="game">
	<div class="stage" bind:this={wrap}>
		<canvas
			bind:this={canvas}
			tabindex="0"
			aria-label="A small spaceship flying on a square whose opposite edges are glued. Use the arrow keys to steer."
			onkeydown={(e) => onKey(e, true)}
			onkeyup={(e) => onKey(e, false)}
			onblur={() => {
				keys.left = keys.right = keys.thrust = false;
			}}
		></canvas>
	</div>
	<div class="side ui">
		<Segmented
			bind:value={mode}
			options={[
				{ value: 'torus', label: 'Torus' },
				{ value: 'klein', label: 'Klein bottle' },
				{ value: 'rp2', label: 'Projective plane' }
			]}
			label="Gluing"
			onchange={() => resetShip()}
		/>
		<Toggle bind:checked={ghosts} label={mode === 'rp2' ? 'Neighbouring copies (not for ℝP²)' : 'Show neighbouring copies'} />
		<div class="pad" aria-label="Steering">
			<button
				class="key"
				aria-label="Turn left"
				onpointerdown={() => hold('left', true)}
				onpointerup={() => hold('left', false)}
				onpointerleave={() => (keys.left = false)}>⟲</button
			>
			<button
				class="key thrust"
				aria-label="Thrust"
				onpointerdown={() => hold('thrust', true)}
				onpointerup={() => hold('thrust', false)}
				onpointerleave={() => (keys.thrust = false)}>Thrust</button
			>
			<button
				class="key"
				aria-label="Turn right"
				onpointerdown={() => hold('right', true)}
				onpointerup={() => hold('right', false)}
				onpointerleave={() => (keys.right = false)}>⟳</button
			>
		</div>
		<p class="read" aria-live="polite">
			Edges crossed: <b>{crossings}</b><br />
			The ship is {#if mirrored}<b class="mir">its own mirror image</b> — the rose stripe is on the other wing{:else}<b>the right way round</b>{/if}.
		</p>
		<Button variant="subtle" onclick={() => resetShip()}>Restart</Button>
	</div>
</div>

<style>
	.game {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(12rem, 15rem);
		gap: 1rem;
		align-items: center;
		padding: 0.8rem 1rem 1rem;
	}
	.stage {
		display: flex;
		justify-content: center;
		min-width: 0;
	}
	canvas {
		display: block;
		border-radius: 10px;
		outline: none;
		touch-action: manipulation;
	}
	canvas:focus-visible {
		box-shadow: 0 0 0 2px var(--gold-bright);
	}
	.side {
		display: flex;
		flex-direction: column;
		gap: 0.8rem;
		font-size: 0.82rem;
	}
	.pad {
		display: flex;
		gap: 0.4rem;
	}
	.key {
		flex: 1;
		min-height: 2.6rem;
		border-radius: 10px;
		border: 1px solid var(--line);
		background: rgba(216, 178, 110, 0.06);
		color: var(--gold-bright);
		font-size: 1.1rem;
		cursor: pointer;
		user-select: none;
		touch-action: none;
	}
	.key.thrust {
		flex: 1.6;
		font-size: 0.78rem;
		letter-spacing: 0.06em;
	}
	.key:active {
		background: rgba(216, 178, 110, 0.2);
	}
	.read {
		margin: 0;
		color: var(--ink-dim);
		line-height: 1.55;
	}
	.read b {
		color: var(--gold-bright);
	}
	.read b.mir {
		color: var(--rose);
	}
	@media (max-width: 640px) {
		.game {
			grid-template-columns: 1fr;
		}
	}
</style>
