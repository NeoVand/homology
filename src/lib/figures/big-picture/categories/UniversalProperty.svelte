<script lang="ts">
	// Figure: universal properties as "the best solution": the product of two
	// sets, the gcd as a product in a poset (lcm as a coproduct), and the kernel
	// of a linear map — each with its unique arrow making the diagram commute.
	import Svg from '$lib/components/svg/Svg.svelte';
	import SvgTeX from '$lib/components/svg/SvgTeX.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Mark from '$lib/components/ui/Mark.svelte';

	let tab = $state<'set' | 'gcd' | 'ker'>('set');

	// ── 1. product of sets ────────────────────────────────────────────────
	const Xs = ['u', 'v', 'w'];
	const As = ['1', '2', '3'];
	const Bs = ['a', 'b'];
	let fx = $state([0, 2, 2]); // f(u)=1, f(v)=3, f(w)=3
	let gx = $state([1, 0, 1]); // g(u)=b, g(v)=a, g(w)=b
	let h = $state<[number, number][]>([
		[0, 1],
		[2, 0],
		[2, 1]
	]);
	let active = $state(1);
	function resetH() {
		h = Xs.map((_, i) => [fx[i], gx[i]] as [number, number]);
	}
	function setF(i: number, a: number) {
		fx[i] = a;
		resetH();
	}
	function setG(i: number, b: number) {
		gx[i] = b;
		resetH();
	}
	const bad = $derived(Xs.map((_, i) => ({ p1: h[i][0] !== fx[i], p2: h[i][1] !== gx[i] })));
	const allGood = $derived(bad.every((b) => !b.p1 && !b.p2));

	// coordinates (viewBox 640 × 420)
	const XP = (i: number): [number, number] => [254 + i * 70, 62];
	const AP = (i: number): [number, number] => [98, 200 + i * 62];
	const BP = (j: number): [number, number] => [568, 265 + j * 70];
	const PP = (i: number, j: number): [number, number] => [264 + j * 120, 200 + i * 62];

	// ── 2. gcd / lcm in the divisors of 36 ────────────────────────────────
	const divs: { n: number; i: number; j: number }[] = [];
	for (let i = 0; i <= 2; i++) for (let j = 0; j <= 2; j++) divs.push({ n: 2 ** i * 3 ** j, i, j });
	const DP = (i: number, j: number): [number, number] => [320 + 92 * (j - i), 372 - 74 * (i + j)];
	let pa = $state(12);
	let pb = $state(18);
	let coMode = $state<'gcd' | 'lcm'>('gcd'); // product (gcd) or coproduct (lcm)
	const co = $derived(coMode === 'lcm');
	let lastPicked = 1;
	function pickDiv(n: number) {
		if (lastPicked === 0) {
			pb = n;
			lastPicked = 1;
		} else {
			pa = n;
			lastPicked = 0;
		}
	}
	const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a);
	const best = $derived(co ? (pa * pb) / gcd(pa, pb) : gcd(pa, pb));
	const cone = $derived(divs.filter((d) => (co ? d.n % pa === 0 && d.n % pb === 0 : pa % d.n === 0 && pb % d.n === 0)).map((d) => d.n));
	const posOf = (n: number) => {
		const d = divs.find((x) => x.n === n)!;
		return DP(d.i, d.j);
	};

	// ── 3. kernel of f(x, y) = x + y ──────────────────────────────────────
	let wv = $state<[number, number]>([1.5, -1.5]);
	const KS = 44;
	const KC: [number, number] = [170, 190];
	const KX = (x: number) => KC[0] + x * KS;
	const KY = (y: number) => KC[1] - y * KS;
	const fw = $derived(wv[0] + wv[1]);
	const onLine = $derived(Math.abs(fw) < 1e-9);
	let ksvg = $state<SVGSVGElement>();
	let kdrag = false;
	function kpos(e: PointerEvent) {
		if (!ksvg) return;
		const pt = ksvg.createSVGPoint();
		pt.x = e.clientX;
		pt.y = e.clientY;
		const m = ksvg.getScreenCTM();
		if (!m) return;
		const q = pt.matrixTransform(m.inverse());
		const x = Math.round(Math.max(-3.25, Math.min(3.25, (q.x - KC[0]) / KS)) * 4) / 4;
		const y = Math.round(Math.max(-3.25, Math.min(3.25, (KC[1] - q.y) / KS)) * 4) / 4;
		// snap onto the kernel line when close
		wv = Math.abs(x + y) <= 0.25 ? [x, -x] : [x, y];
	}
	const fmt = (x: number) => {
		const s = Number.isInteger(x) ? String(x) : x.toFixed(2).replace(/0$/, '');
		return s.startsWith('-') ? '-' + s.slice(1) : s;
	};
</script>

<div class="up">
	{#if tab === 'set'}
		<Svg viewBox="20 0 640 410" maxHeight={440} label="The product of two finite sets and the unique map into it">
			<!-- boxes -->
			<rect x="214" y="34" width="220" height="56" rx="16" class="box" />
			<SvgTeX x={194} y={62} tex="X" size={18} color="var(--ink)" w={30} h={26} />
			<rect x="70" y="172" width="56" height="180" rx="16" class="box" />
			<SvgTeX x={98} y={372} tex="A" size={18} w={30} h={26} />
			<rect x="530" y="232" width="76" height="136" rx="16" class="box" />
			<SvgTeX x={568} y={388} tex="B" size={18} w={30} h={26} />
			<rect x="206" y="170" width="242" height="186" rx="18" class="box prod" />
			<SvgTeX x={327} y={378} tex={'A\\times B'} size={18} color="var(--violet)" w={80} h={26} />

			<!-- projections: p₁ reads the gold entry, p₂ the teal one -->
			<path d="M 204 300 L 130 300" class="proj" marker-end="url(#arrow-dim)" />
			<path d="M 450 300 L 526 300" class="proj" marker-end="url(#arrow-dim)" />
			<SvgTeX x={166} y={316} tex="p_1" size={14} color="var(--ink-faint)" w={30} h={20} />
			<SvgTeX x={488} y={316} tex="p_2" size={14} color="var(--ink-faint)" w={30} h={20} />

			<!-- maps from X -->
			{#each Xs as _, i (i)}
				{@const [x0, y0] = XP(i)}
				{@const [ax, ay] = AP(fx[i])}
				{@const [bx, by] = BP(gx[i])}
				{@const [hx, hy] = PP(h[i][0], h[i][1])}
				<path d="M {x0 - 8} {y0 + 12} Q {x0 - 140} {y0 + 70} {ax + 16} {ay - 6}" class="mf" class:dim={active !== i} marker-end="url(#arrow-gold)" />
				<path d="M {x0 + 8} {y0 + 12} Q {x0 + 160} {y0 + 70} {bx - 16} {by - 6}" class="mg" class:dim={active !== i} marker-end="url(#arrow-teal)" />
				<path d="M {x0} {y0 + 14} L {hx} {hy - 16}" class="mh" class:wrong={bad[i].p1 || bad[i].p2} class:dim={active !== i} marker-end={bad[i].p1 || bad[i].p2 ? 'url(#arrow-rose)' : 'url(#arrow-violet)'} />
			{/each}

			<!-- elements -->
			{#each Xs as x, i (i)}
				{@const [px, py] = XP(i)}
				<g class="el" class:act={active === i} role="button" tabindex="0" aria-label="element {x}" onclick={() => (active = i)} onkeydown={(e) => e.key === 'Enter' && (active = i)}>
					<circle cx={px} cy={py} r="14" class="dotX" />
					<SvgTeX x={px} y={py} tex={x} size={15} color="#1a1206" w={20} h={20} />
				</g>
			{/each}
			{#each As as a, i (i)}
				{@const [px, py] = AP(i)}
				<circle cx={px} cy={py} r="13" class="dotA" />
				<SvgTeX x={px} y={py} tex={a} size={14} color="#1a1206" w={20} h={20} />
			{/each}
			{#each Bs as b, j (j)}
				{@const [px, py] = BP(j)}
				<circle cx={px} cy={py} r="13" class="dotB" />
				<SvgTeX x={px} y={py} tex={b} size={14} color="#06201e" w={20} h={20} />
			{/each}
			{#each As as a, i (i)}
				{#each Bs as b, j (j)}
					{@const [px, py] = PP(i, j)}
					{@const hit = h[active][0] === i && h[active][1] === j}
					<g class="cell" role="button" tabindex="0" aria-label="pair ({a}, {b})" onclick={() => (h[active] = [i, j])} onkeydown={(e) => e.key === 'Enter' && (h[active] = [i, j])}>
						<rect x={px - 44} y={py - 17} width="88" height="34" rx="10" class="pair" class:hit />
						<SvgTeX x={px} y={py} tex={`(\\cyc{${a}},\\bdy{${b}})`} size={14} color="var(--ink)" w={80} h={22} />
					</g>
				{/each}
			{/each}
		</Svg>
		<div class="readout ui">
			{#if allGood}
				<span class="ok"><Mark ok /> Both triangles commute: <TeX tex={'p_1\\circ h = f,\\; p_2\\circ h = g'} />. Try to find a different <TeX tex="h" /> that also works — click an element of <TeX tex="X" />, then a pair.</span>
			{:else}
				<span class="bad"><Mark ok={false} /> With this <TeX tex="h" />, {bad.map((b, i) => (b.p1 ? `p₁∘h ≠ f at ${Xs[i]}` : b.p2 ? `p₂∘h ≠ g at ${Xs[i]}` : '')).filter(Boolean).join('; ')}. Only the pair <TeX tex={'(f(x), g(x))'} /> works.</span>
				<Button variant="subtle" onclick={resetH}>Restore ⟨f, g⟩</Button>
			{/if}
		</div>
		<div class="table ui">
			{#each Xs as x, i (i)}
				<div class="row" class:act={active === i}>
					<span class="xl">
						<TeX tex={x} />
					</span>
					<span class="fl"><TeX tex={`f(${x}) =`} /></span>
					<Segmented value={fx[i]} label="f of {x}" onchange={(a) => setF(i, a)} options={As.map((a, k) => ({ value: k, label: a }))} />
					<span class="fl"><TeX tex={`g(${x}) =`} /></span>
					<Segmented value={gx[i]} label="g of {x}" onchange={(b) => setG(i, b)} options={Bs.map((b, k) => ({ value: k, label: b }))} />
				</div>
			{/each}
		</div>
	{:else if tab === 'gcd'}
		<Svg viewBox="0 0 640 420" maxHeight={440} label="The divisors of 36 ordered by divisibility; the gcd is a product and the lcm a coproduct">
			{#each divs as d (d.n)}
				{@const [x, y] = DP(d.i, d.j)}
				{#if d.i < 2}
					{@const [x2, y2] = DP(d.i + 1, d.j)}
					<line x1={x} y1={y} x2={x2} y2={y2} class="hasse" />
				{/if}
				{#if d.j < 2}
					{@const [x2, y2] = DP(d.i, d.j + 1)}
					<line x1={x} y1={y} x2={x2} y2={y2} class="hasse" />
				{/if}
			{/each}
			<!-- the unique arrows from every other candidate into the best one -->
			{#each cone.filter((n) => n !== best) as n (n)}
				{@const [x1, y1] = posOf(n)}
				{@const [x2, y2] = posOf(best)}
				<path d={co ? `M ${x2} ${y2 - 20} Q ${(x1 + x2) / 2 + 30} ${(y1 + y2) / 2} ${x1} ${y1 + 22}` : `M ${x1} ${y1 - 22} Q ${(x1 + x2) / 2 + 30} ${(y1 + y2) / 2} ${x2} ${y2 + 22}`} class="uniq" marker-end="url(#arrow-gold)" />
			{/each}
			{#each divs as d (d.n)}
				{@const [x, y] = DP(d.i, d.j)}
				{@const inCone = cone.includes(d.n)}
				{@const isBest = d.n === best}
				{@const isSel = d.n === pa || d.n === pb}
				<g class="dv" role="button" tabindex="0" aria-label="choose {d.n}" onclick={() => pickDiv(d.n)} onkeydown={(e) => e.key === 'Enter' && pickDiv(d.n)}>
					<circle cx={x} cy={y} r={isBest ? 22 : 19} class="dnode" class:cone={inCone} class:best={isBest} class:sel={isSel} />
					<SvgTeX x={x} y={y} tex={String(d.n)} size={15} color={isBest ? '#1a1206' : isSel ? 'var(--teal)' : 'var(--ink)'} w={36} h={22} />
				</g>
			{/each}
			<text x="20" y="30" class="t-ui">ARROW a → b MEANS a DIVIDES b</text>
		</Svg>
		<div class="readout ui">
			{#if !co}
				<span><TeX tex={`\\gcd(${pa}, ${pb}) = ${best}`} />: of all numbers that divide both <b>{pa}</b> and <b>{pb}</b> (violet), the gcd is the one every other divides — the unique dashed arrows. That is the universal property of a <b>product</b>. Click two numbers to change them.</span>
			{:else}
				<span><TeX tex={`\\operatorname{lcm}(${pa}, ${pb}) = ${best}`} />: of all multiples of both <b>{pa}</b> and <b>{pb}</b> (violet), the lcm divides every other — arrows reversed. That is a <b>coproduct</b>. Click two numbers to change them.</span>
			{/if}
		</div>
	{:else}
		<div class="kgrid">
			<Svg viewBox="0 0 340 380" maxHeight={390} label="The plane, the kernel line of f(x,y) = x + y, and a draggable vector" bind:svg={ksvg} onpointermove={(e) => kdrag && kpos(e)} onpointerup={() => (kdrag = false)} onpointerleave={() => (kdrag = false)}>
				<defs><clipPath id="up-kclip"><rect x="14" y="36" width="312" height="308" rx="10" /></clipPath></defs>
				<rect x="14" y="36" width="312" height="308" rx="10" class="bg" />
				<g clip-path="url(#up-kclip)">
					{#each Array.from({ length: 9 }, (_, i) => i - 4) as k (k)}
						<line x1={KX(k)} y1="36" x2={KX(k)} y2="344" class="gridl" />
						<line x1="14" y1={KY(k)} x2="326" y2={KY(k)} class="gridl" />
					{/each}
					<line x1="14" y1={KC[1]} x2="326" y2={KC[1]} class="axis" />
					<line x1={KC[0]} y1="36" x2={KC[0]} y2="344" class="axis" />
					<line x1={KX(-4)} y1={KY(4)} x2={KX(4)} y2={KY(-4)} class="kline" />
				</g>
				<SvgTeX x={KX(-2.6)} y={KY(2.95)} tex={'K = \\ker f'} size={14} color="var(--teal)" w={90} h={22} />
				<path d="M {KC[0]} {KC[1]} L {KX(wv[0])} {KY(wv[1])}" class="wvec" class:on={onLine} marker-end={onLine ? 'url(#arrow-teal)' : 'url(#arrow-gold)'} />
				<circle cx={KX(wv[0])} cy={KY(wv[1])} r="16" class="handle" role="slider" tabindex="0" aria-label="the vector g(1); arrow keys move it" aria-valuenow={wv[0]} aria-valuetext="({wv[0]}, {wv[1]})" onpointerdown={(e) => ((kdrag = true), (e.target as Element).setPointerCapture?.(e.pointerId), kpos(e))} onkeydown={(e) => {
						const d: Record<string, [number, number]> = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, 0.25], ArrowDown: [0, -0.25] };
						const s = d[e.key];
						if (s) {
							e.preventDefault();
							wv = [wv[0] + s[0], wv[1] + s[1]];
						}
					}} />
				<circle cx={KX(wv[0])} cy={KY(wv[1])} r="6" class="knob" class:on={onLine} />
				<SvgTeX x={KX(wv[0]) + 30} y={KY(wv[1]) - 14} tex={'g(1)'} size={13} color={onLine ? 'var(--teal)' : 'var(--gold-bright)'} w={50} h={20} />
				<text x="20" y="24" class="t-ui">THE PLANE ℝ²</text>
			</Svg>
			<Svg viewBox="0 0 300 380" maxHeight={390} label="The commutative diagram of the kernel's universal property">
				<text x="10" y="24" class="t-ui">THE DIAGRAM</text>
				<SvgTeX x={60} y={90} tex={'\\R'} size={18} w={30} h={26} />
				<SvgTeX x={60} y={230} tex="K" size={18} color="var(--teal)" w={30} h={26} />
				<SvgTeX x={180} y={160} tex={'\\R^2'} size={18} w={40} h={26} />
				<SvgTeX x={270} y={160} tex={'\\R'} size={18} w={30} h={26} />
				<path d="M 78 98 L 158 150" class="dg" marker-end="url(#arrow-gold)" />
				<SvgTeX x={124} y={108} tex="g" size={14} color="var(--gold-bright)" w={20} h={20} />
				<path d="M 78 222 L 158 170" class="dg" marker-end="url(#arrow-teal)" />
				<SvgTeX x={124} y={212} tex={'\\iota'} size={14} color="var(--teal)" w={20} h={20} />
				<path d="M 204 160 L 252 160" class="dg" marker-end="url(#arrow-ivory)" />
				<SvgTeX x={228} y={146} tex="f" size={14} w={20} h={20} />
				<path d="M 60 108 L 60 210" class="dg dash" class:ghost={!onLine} marker-end="url(#arrow-violet)" />
				<SvgTeX x={30} y={160} tex={'\\hat g'} size={14} color="var(--violet)" w={20} h={20} />
				<g transform="translate(150 300)">
					{#if onLine}
						<SvgTeX x={0} y={0} tex={`f(g(1)) = ${fmt(wv[0])} + (${fmt(wv[1])}) = 0`} size={13} color="var(--teal)" w={290} h={22} />
						<SvgTeX x={0} y={30} tex={`\\hat g(1) = ${fmt(wv[0])},\\quad g = \\iota\\circ\\hat g`} size={13} color="var(--violet)" w={290} h={22} />
					{:else}
						<SvgTeX x={0} y={0} tex={`f(g(1)) = ${fmt(wv[0])} + (${fmt(wv[1])}) = ${fmt(fw)} \\neq 0`} size={13} color="var(--rose)" w={290} h={22} />
						<SvgTeX x={0} y={30} tex={'\\text{no }\\hat g\\text{ exists}'} size={13} color="var(--ink-faint)" w={290} h={22} />
					{/if}
				</g>
			</Svg>
		</div>
		<div class="readout ui">
			<span>Drag <TeX tex={'g(1)'} />. When <TeX tex={'f\\circ g = 0'} /> the vector lies on the kernel line, and there is exactly one <TeX tex={'\\hat g\\colon \\R\\to K'} /> with <TeX tex={'\\iota\\circ\\hat g = g'} />: its value is the position along <TeX tex="K" />, measured in steps of <TeX tex={'(1,-1)'} />.</span>
		</div>
	{/if}

	<Controls align="between">
		<Segmented
			bind:value={tab}
			label="Which universal property"
			options={[
				{ value: 'set', label: 'Product of sets' },
				{ value: 'gcd', label: 'gcd in a poset' },
				{ value: 'ker', label: 'Kernel' }
			]}
		/>
		{#if tab === 'gcd'}
			<Segmented
				bind:value={coMode}
				label="Product or coproduct"
				options={[
					{ value: 'gcd', label: 'product (gcd)' },
					{ value: 'lcm', label: 'coproduct (lcm)' }
				]}
			/>
		{/if}
	</Controls>
</div>

<style>
	.up {
		padding-top: 0.8rem;
	}
	.box {
		fill: rgba(116, 169, 255, 0.05);
		stroke: rgba(116, 169, 255, 0.3);
		stroke-width: 1.2;
	}
	.box.prod {
		fill: rgba(164, 147, 255, 0.06);
		stroke: rgba(164, 147, 255, 0.45);
	}
	.proj {
		fill: none;
		stroke: rgba(139, 134, 118, 0.45);
		stroke-width: 1.2;
		stroke-dasharray: 3 4;
	}
	.mf,
	.mg,
	.mh {
		fill: none;
		stroke-width: 2;
		transition: opacity 0.25s;
	}
	.mf {
		stroke: #f2d08f;
	}
	.mg {
		stroke: #5fd6cf;
	}
	.mh {
		stroke: #a493ff;
		stroke-width: 2.4;
	}
	.mh.wrong {
		stroke: #f28db6;
	}
	.dim {
		opacity: 0.22;
	}
	.dotX {
		fill: #f4d79c;
		stroke: #0b1122;
		stroke-width: 1.5;
		cursor: pointer;
	}
	.el.act .dotX {
		filter: url(#glow-strong);
		stroke: #fff;
	}
	.dotA {
		fill: #f2d08f;
	}
	.dotB {
		fill: #5fd6cf;
	}
	.pair {
		fill: rgba(164, 147, 255, 0.08);
		stroke: rgba(164, 147, 255, 0.35);
		cursor: pointer;
		transition: all 0.2s;
	}
	.pair:hover {
		fill: rgba(164, 147, 255, 0.2);
	}
	.pair.hit {
		fill: rgba(164, 147, 255, 0.32);
		stroke: #a493ff;
		filter: url(#glow);
	}
	.readout {
		padding: 0.3rem 1.2rem 0.6rem;
		font-size: 0.86rem;
		color: var(--ink-dim);
		text-align: center;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		justify-content: center;
		align-items: center;
	}
	.ok {
		color: var(--green);
	}
	.bad {
		color: var(--rose);
	}
	.table {
		display: grid;
		gap: 0.35rem;
		padding: 0 1rem 0.8rem;
		justify-content: center;
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.3rem 0.6rem;
		padding: 0.2rem 0.5rem;
		border-radius: 8px;
		font-size: 0.85rem;
	}
	.row.act {
		background: rgba(244, 215, 156, 0.06);
	}
	.xl {
		color: var(--gold-bright);
		min-width: 1.2rem;
	}
	.fl {
		color: var(--ink-dim);
	}
	.hasse {
		stroke: rgba(235, 229, 213, 0.22);
		stroke-width: 1.6;
	}
	.uniq {
		fill: none;
		stroke: #f2d08f;
		stroke-width: 1.6;
		stroke-dasharray: 5 4;
		opacity: 0.9;
	}
	.dnode {
		fill: #0d1426;
		stroke: rgba(235, 229, 213, 0.35);
		stroke-width: 1.4;
		cursor: pointer;
		transition: all 0.25s var(--ease);
	}
	.dnode.cone {
		fill: rgba(164, 147, 255, 0.22);
		stroke: #a493ff;
	}
	.dnode.sel {
		stroke: #5fd6cf;
		stroke-width: 2.6;
	}
	.dnode.best {
		fill: #f2d08f;
		stroke: #fff6dc;
		filter: url(#glow-strong);
	}
	.kgrid {
		display: grid;
		grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
		gap: 0.6rem;
		padding: 0 0.8rem;
	}
	@media (max-width: 640px) {
		.kgrid {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	.bg {
		fill: rgba(5, 9, 18, 0.55);
		stroke: rgba(216, 178, 110, 0.18);
	}
	.gridl {
		stroke: rgba(191, 228, 255, 0.06);
	}
	.axis {
		stroke: rgba(235, 229, 213, 0.25);
	}
	.kline {
		stroke: #5fd6cf;
		stroke-width: 2.4;
		filter: url(#glow);
	}
	.wvec {
		stroke: #f2d08f;
		stroke-width: 2.6;
	}
	.wvec.on {
		stroke: #5fd6cf;
	}
	.handle {
		fill: rgba(242, 208, 143, 0.12);
		stroke: rgba(242, 208, 143, 0.5);
		cursor: grab;
		touch-action: none;
	}
	.knob {
		fill: #f2d08f;
		pointer-events: none;
	}
	.knob.on {
		fill: #5fd6cf;
	}
	.dg {
		fill: none;
		stroke: #ebe5d5;
		stroke-width: 1.8;
	}
	.dg.dash {
		stroke: #a493ff;
		stroke-dasharray: 5 4;
		transition: opacity 0.3s;
	}
	.dg.ghost {
		opacity: 0.15;
	}
</style>
