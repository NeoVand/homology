<script lang="ts">
	// A fixed, hand-drawn night sky behind the whole site. Drawn once into a
	// canvas (and again on resize) — no per-frame cost.
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let twinkles = $state<{ x: number; y: number; d: number; s: number; c: string }[]>([]);

	function mulberry32(a: number) {
		return function () {
			a |= 0;
			a = (a + 0x6d2b79f5) | 0;
			let t = Math.imul(a ^ (a >>> 15), 1 | a);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}

	function draw() {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const w = window.innerWidth;
		const h = window.innerHeight;
		canvas.width = Math.floor(w * dpr);
		canvas.height = Math.floor(h * dpr);
		canvas.style.width = w + 'px';
		canvas.style.height = h + 'px';
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, w, h);
		const rand = mulberry32(1895); // the year of Analysis Situs

		// faint nebulae
		const nebulae = [
			{ x: 0.82, y: 0.22, r: 0.42, c: [120, 96, 235], a: 0.05 },
			{ x: 0.12, y: 0.7, r: 0.5, c: [60, 150, 200], a: 0.045 },
			{ x: 0.55, y: 0.95, r: 0.45, c: [220, 120, 170], a: 0.03 },
			{ x: 0.5, y: 0.0, r: 0.4, c: [235, 190, 110], a: 0.05 }
		];
		for (const n of nebulae) {
			const g = ctx.createRadialGradient(n.x * w, n.y * h, 0, n.x * w, n.y * h, n.r * Math.max(w, h));
			g.addColorStop(0, `rgba(${n.c.join(',')},${n.a})`);
			g.addColorStop(1, `rgba(${n.c.join(',')},0)`);
			ctx.fillStyle = g;
			ctx.fillRect(0, 0, w, h);
		}

		// stars
		const count = Math.round((w * h) / 2600);
		for (let i = 0; i < count; i++) {
			const x = rand() * w;
			const y = rand() * h;
			const m = Math.pow(rand(), 3.2); // most stars are faint
			const r = 0.25 + m * 1.25;
			const tint = rand();
			const col =
				tint < 0.12 ? '255,226,170' : tint < 0.24 ? '190,210,255' : tint < 0.3 ? '255,200,225' : '240,238,230';
			ctx.globalAlpha = 0.18 + m * 0.75;
			ctx.fillStyle = `rgb(${col})`;
			ctx.beginPath();
			ctx.arc(x, y, r, 0, Math.PI * 2);
			ctx.fill();
			if (m > 0.55) {
				// a soft halo on the brightest
				const g = ctx.createRadialGradient(x, y, 0, x, y, r * 6);
				g.addColorStop(0, `rgba(${col},0.25)`);
				g.addColorStop(1, `rgba(${col},0)`);
				ctx.fillStyle = g;
				ctx.globalAlpha = 1;
				ctx.fillRect(x - r * 6, y - r * 6, r * 12, r * 12);
			}
		}
		ctx.globalAlpha = 1;

		const tw: typeof twinkles = [];
		for (let i = 0; i < 14; i++) {
			tw.push({
				x: rand() * 100,
				y: rand() * 100,
				d: 3 + rand() * 6,
				s: rand() * 6,
				c: rand() < 0.5 ? 'var(--gold-pale)' : '#dfe8ff'
			});
		}
		twinkles = tw;
	}

	onMount(() => {
		draw();
		let t: ReturnType<typeof setTimeout>;
		let lastW = window.innerWidth;
		const onResize = () => {
			// mobile browsers fire resize when the URL bar hides; only redraw on width change
			if (Math.abs(window.innerWidth - lastW) < 2 && canvas.height > 0) return;
			lastW = window.innerWidth;
			clearTimeout(t);
			t = setTimeout(draw, 150);
		};
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
			clearTimeout(t);
		};
	});
</script>

<div class="sky" aria-hidden="true">
	<canvas bind:this={canvas}></canvas>
	{#each twinkles as s, i (i)}
		<span
			class="tw"
			style="left:{s.x}%; top:{s.y}%; animation-duration:{s.d}s; animation-delay:-{s.s}s; --c:{s.c}"
		></span>
	{/each}
</div>

<style>
	.sky {
		position: fixed;
		inset: 0;
		z-index: -1;
		pointer-events: none;
		overflow: hidden;
	}
	canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}
	.tw {
		position: absolute;
		width: 2px;
		height: 2px;
		border-radius: 50%;
		background: var(--c);
		box-shadow:
			0 0 6px 1px var(--c),
			0 0 14px 2px rgba(255, 240, 200, 0.25);
		animation: twinkle ease-in-out infinite;
		opacity: 0.2;
	}
	@keyframes twinkle {
		0%,
		100% {
			opacity: 0.15;
			transform: scale(0.8);
		}
		50% {
			opacity: 0.95;
			transform: scale(1.25);
		}
	}
</style>
