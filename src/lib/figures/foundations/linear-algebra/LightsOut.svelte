<script lang="ts">
	// Lights Out, with the linear algebra switched on.
	//   mode "play": just the game.
	//   mode "full": solver, quiet patterns (the kernel), parity checks
	//                (measurements from the kernel of the transpose), and an
	//                X-ray of the matrix A.
	import { onMount } from 'svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Segmented from '$lib/components/ui/Segmented.svelte';
	import Toggle from '$lib/components/ui/Toggle.svelte';
	import Controls from '$lib/components/ui/Controls.svelte';
	import { analyse, applyPresses, bits, popcount, pressMask, QUIET_5 } from './lightsout';

	let { mode = 'full', size = 5 }: { mode?: 'play' | 'full'; size?: 3 | 4 | 5 } = $props();

	// svelte-ignore state_referenced_locally
	let n = $state<3 | 4 | 5>(size);
	let board = $state(0);
	let tool = $state<'press' | 'paint'>('press');
	let showSol = $state(false);
	let showMatrix = $state(false);
	let quietIdx = $state(-1);
	let hoverCheck = $state(-1);
	let hoverCell = $state(-1);
	let moves = $state(0);
	let flash = $state(0); // bitmask of cells that just changed
	let busy = $state(false);
	let timers: ReturnType<typeof setTimeout>[] = [];

	const A = $derived(analyse(n));
	const N = $derived(n * n);
	const cells = $derived(Array.from({ length: N }, (_, i) => i));
	const solvable = $derived(A.solve(board) !== null);
	const sol = $derived(showSol ? A.solveMinimal(board) : null);
	const quietList = $derived(A.quietPatterns().filter((q) => q !== 0));
	const quiet = $derived(quietIdx >= 0 && quietIdx < quietList.length ? quietList[quietIdx] : 0);
	// the parity checks: for 5×5 use the two symmetric patterns described in the text
	const checks = $derived(n === 5 ? [QUIET_5.q2, QUIET_5.q1 ^ QUIET_5.q2] : A.kernel);
	const counts = $derived(checks.map((q) => popcount(board & q)));
	const failing = $derived(counts.map((c, i) => (c % 2 === 1 ? i : -1)).filter((i) => i >= 0));
	const lit = $derived(popcount(board));
	const highlight = $derived(hoverCheck >= 0 ? checks[hoverCheck] ?? 0 : 0);

	onMount(() => {
		if (mode === 'play') randomSolvable();
		else board = (1 << (n * n)) - 1; // every light on: solvable, in 15 presses at best (5×5)
		return () => timers.forEach(clearTimeout);
	});

	function stopAnim() {
		timers.forEach(clearTimeout);
		timers = [];
		busy = false;
	}
	function doFlash(mask: number) {
		flash = mask;
		const id = setTimeout(() => (flash = 0), 380);
		timers.push(id);
	}
	function click(i: number) {
		if (busy) stopAnim();
		if (tool === 'paint' && mode === 'full') {
			board ^= 1 << i;
			doFlash(1 << i);
		} else {
			board ^= pressMask(n, i);
			doFlash(pressMask(n, i));
			moves++;
		}
	}
	function setSize(m: 3 | 4 | 5) {
		stopAnim();
		n = m;
		quietIdx = -1;
		hoverCheck = -1;
		if (mode === 'play') randomSolvable();
		else board = 0;
	}
	function randomBoard() {
		stopAnim();
		board = Math.floor(Math.random() * (1 << N));
		moves = 0;
	}
	function randomSolvable() {
		stopAnim();
		let b = 0;
		do b = applyPresses(n, Math.floor(Math.random() * (1 << (n * n))));
		while (popcount(b) < Math.min(6, n * n - 2));
		board = b;
		moves = 0;
	}
	/** press the cells of `mask` one after another */
	function pressSequence(mask: number) {
		stopAnim();
		const seq = bits(mask);
		if (!seq.length) return;
		busy = true;
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const gap = reduced ? 0 : 300;
		seq.forEach((i, k) => {
			timers.push(
				setTimeout(() => {
					board ^= pressMask(n, i);
					doFlash(pressMask(n, i));
					moves++;
					if (k === seq.length - 1) busy = false;
				}, gap * (k + 1))
			);
		});
	}
	function solveIt() {
		const x = A.solveMinimal(board);
		if (x !== null) pressSequence(x);
	}
	function nextQuiet() {
		quietIdx = (quietIdx + 1) % (quietList.length + 1);
		if (quietIdx === quietList.length) quietIdx = -1;
	}
	const sizeOptions: { value: 3 | 4 | 5; label: string }[] = [
		{ value: 3, label: '3 × 3' },
		{ value: 4, label: '4 × 4' },
		{ value: 5, label: '5 × 5' }
	];
	const pow = (k: number) => `2^{${k}}`;
</script>

<div class="lo" class:play={mode === 'play'}>
	<div class="boardwrap">
		<div class="board" style="--n:{n}" role="grid" aria-label="Lights Out board, {n} by {n}">
			{#each cells as i (i)}
				{@const on = ((board >>> i) & 1) === 1}
				<button
					class="cell"
					class:on
					class:flash={((flash >>> i) & 1) === 1}
					class:sol={sol !== null && ((sol >>> i) & 1) === 1}
					class:quiet={((quiet >>> i) & 1) === 1}
					class:check={((highlight >>> i) & 1) === 1}
					class:col={hoverCell >= 0 && showMatrix && ((pressMask(n, hoverCell) >>> i) & 1) === 1}
					aria-label="row {Math.floor(i / n) + 1}, column {(i % n) + 1}: light {on ? 'on' : 'off'}"
					onclick={() => click(i)}
					onpointerenter={() => (hoverCell = i)}
					onpointerleave={() => (hoverCell = -1)}
				>
					<span class="lamp"></span>
					{#if sol !== null && ((sol >>> i) & 1) === 1}<span class="mark" aria-hidden="true"></span>{/if}
					{#if ((quiet >>> i) & 1) === 1}<span class="qdot" aria-hidden="true"></span>{/if}
				</button>
			{/each}
		</div>
		<div class="status ui">
			{#if mode === 'play'}
				{#if lit === 0}
					<span class="win">All dark — solved in {moves} press{moves === 1 ? '' : 'es'}!</span>
				{:else}
					<span>{lit} light{lit === 1 ? '' : 's'} on · {moves} press{moves === 1 ? '' : 'es'} so far</span>
				{/if}
			{:else if lit === 0}
				<span class="win">All lights off.</span>
			{:else if solvable}
				<span class="okc">Solvable</span> · fewest presses: {popcount(A.solveMinimal(board) ?? 0)}
			{:else}
				<span class="bad">Not solvable</span> · fails check {failing.map((i) => i + 1).join(' and ')}
			{/if}
		</div>
	</div>

	{#if mode === 'full'}
		<div class="side ui">
			<div class="facts">
				<TeX
					tex={`\\text{rank } ${A.rank},\\quad \\text{nullity } ${A.nullity}`}
				/>
				<div class="sub">
					{#if A.nullity === 0}
						Every one of the <TeX tex={pow(N)} /> boards is solvable, in exactly one way.
					{:else}
						Solvable boards: <TeX tex={`${pow(A.rank)}`} /> of <TeX tex={pow(N)} /> (one in
						<TeX tex={pow(A.nullity)} />), each in <TeX tex={pow(A.nullity)} /> = {2 ** A.nullity} ways.
					{/if}
				</div>
			</div>

			{#if checks.length}
				<div class="checks">
					<div class="h">Parity checks</div>
					{#each checks as q, k (k)}
						<button
							class="chk"
							class:pass={counts[k] % 2 === 0}
							class:fail={counts[k] % 2 === 1}
							onpointerenter={() => (hoverCheck = k)}
							onpointerleave={() => (hoverCheck = -1)}
							onfocus={() => (hoverCheck = k)}
							onblur={() => (hoverCheck = -1)}
							onclick={() => (hoverCheck = hoverCheck === k ? -1 : k)}
						>
							<span class="nm">check {k + 1}</span>
							<span class="ct">{counts[k]} of {popcount(q)} cells lit</span>
							<span class="verdict">{counts[k] % 2 === 0 ? 'even ✓' : 'odd ✗'}</span>
						</button>
					{/each}
					<div class="hint">Hover (or tap) a check to outline its cells. A board is solvable exactly when every check is even.</div>
				</div>
			{/if}

			{#if quietList.length}
				<div class="quietbox">
					<div class="h">Quiet patterns (the kernel)</div>
					<div class="qrow">
						<Button variant="ghost" onclick={nextQuiet}>
							{quietIdx < 0 ? 'Show a quiet pattern' : `Pattern ${quietIdx + 1} of ${quietList.length}`}
						</Button>
						<Button variant="subtle" onclick={() => pressSequence(quiet)} disabled={quietIdx < 0 || busy}>Press it</Button>
					</div>
					<div class="hint">
						Pressing every teal-dotted button changes nothing at all: each light is toggled an even number of times.
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

{#if mode === 'full' && showMatrix}
	<div class="xray ui">
		<div class="h">The matrix <TeX tex={'A'} /> ({N} × {N}): column <TeX tex={'j'} /> = the lights toggled by button <TeX tex={'j'} /></div>
		<svg viewBox="0 0 {N * 10 + 2} {N * 10 + 2}" class="mat" role="img" aria-label="The {N} by {N} Lights Out matrix; hover a cell of the board to highlight its column">
			{#each cells as i (i)}
				{#each cells as j (j)}
					{@const one = ((pressMask(n, j) >>> i) & 1) === 1}
					<rect
						x={1 + j * 10}
						y={1 + i * 10}
						width="9"
						height="9"
						rx="1.5"
						class:one
						class:hcol={j === hoverCell}
						class:hrow={((board >>> i) & 1) === 1 && j === hoverCell}
					/>
				{/each}
			{/each}
		</svg>
		<div class="hint">Hover a cell of the board: its column lights up. <TeX tex={'A'} /> is symmetric — the picture is unchanged by flipping it across its diagonal.</div>
	</div>
{/if}

<Controls>
	<Segmented value={n} options={sizeOptions} label="board size" onchange={(v) => setSize(v)} />
	{#if mode === 'full'}
		<Segmented
			bind:value={tool}
			label="what a click does"
			options={[
				{ value: 'press', label: 'press buttons' },
				{ value: 'paint', label: 'paint lights' }
			]}
		/>
	{/if}
	<Button variant="subtle" onclick={randomSolvable}>New puzzle</Button>
	{#if mode === 'full'}
		<Button variant="subtle" onclick={randomBoard}>Any random board</Button>
	{/if}
	<Button variant="subtle" onclick={() => (stopAnim(), (board = 0), (moves = 0))}>Clear</Button>
	{#if mode === 'full'}
		<Button variant="gold" onclick={solveIt} disabled={!solvable || lit === 0 || busy}>Solve it</Button>
		<Toggle bind:checked={showSol} label="show the presses" />
		<Toggle bind:checked={showMatrix} label="X-ray: show the matrix" />
	{/if}
</Controls>

<style>
	.lo {
		display: grid;
		grid-template-columns: auto minmax(0, 1fr);
		gap: 1.4rem 2rem;
		align-items: start;
		justify-content: center;
		padding: 1.3rem 1.4rem 1rem;
	}
	.lo.play {
		grid-template-columns: auto;
	}
	@media (max-width: 760px) {
		.lo {
			grid-template-columns: minmax(0, 1fr);
			justify-items: center;
			padding: 1rem 0.7rem 0.8rem;
		}
	}
	.boardwrap {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.7rem;
	}
	.board {
		--cell: min(3.6rem, calc((100vw - 4.5rem) / var(--n) - 6px));
		display: grid;
		grid-template-columns: repeat(var(--n), var(--cell));
		gap: 6px;
		padding: 10px;
		border-radius: 14px;
		background: linear-gradient(180deg, rgba(20, 28, 52, 0.9), rgba(8, 12, 24, 0.95));
		border: 1px solid var(--line);
		box-shadow:
			inset 0 1px 0 rgba(255, 255, 255, 0.04),
			0 20px 40px -24px rgba(0, 0, 0, 0.9);
	}
	.cell {
		position: relative;
		width: var(--cell);
		height: var(--cell);
		border-radius: 10px;
		border: 1px solid rgba(255, 255, 255, 0.07);
		background: radial-gradient(circle at 50% 40%, #182240, #0b1122);
		cursor: pointer;
		padding: 0;
		display: grid;
		place-items: center;
		transition:
			background 0.25s var(--ease),
			box-shadow 0.25s var(--ease),
			border-color 0.2s;
	}
	.cell:hover {
		border-color: rgba(242, 208, 143, 0.45);
	}
	.lamp {
		width: 46%;
		height: 46%;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.04);
		transition: all 0.25s var(--ease);
	}
	.cell.on {
		background: radial-gradient(circle at 50% 40%, #4a3a1c, #1d1810 75%);
		border-color: rgba(242, 208, 143, 0.55);
		box-shadow:
			0 0 18px -2px rgba(242, 208, 143, 0.55),
			inset 0 0 12px rgba(255, 220, 150, 0.25);
	}
	.cell.on .lamp {
		width: 62%;
		height: 62%;
		background: radial-gradient(circle at 40% 35%, #fffaf0, #f6d690 45%, #c99a4a 80%);
		box-shadow: 0 0 16px rgba(255, 214, 140, 0.8);
	}
	.cell.flash {
		animation: pulse 0.38s var(--ease);
	}
	@keyframes pulse {
		50% {
			transform: scale(0.92);
		}
	}
	.cell.quiet {
		box-shadow: inset 0 0 0 2px rgba(95, 214, 207, 0.85);
	}
	.cell.quiet.on {
		box-shadow:
			inset 0 0 0 2px rgba(95, 214, 207, 0.85),
			0 0 18px -2px rgba(242, 208, 143, 0.55);
	}
	.qdot {
		position: absolute;
		top: 5px;
		left: 5px;
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--teal);
		box-shadow: 0 0 6px var(--teal);
	}
	.cell.check {
		outline: 2px dashed var(--rose);
		outline-offset: -4px;
	}
	.cell.col {
		outline: 2px solid var(--blue);
		outline-offset: -4px;
	}
	.mark {
		position: absolute;
		inset: 18%;
		border-radius: 50%;
		border: 2.5px solid var(--violet);
		box-shadow: 0 0 10px var(--violet);
		pointer-events: none;
	}
	.status {
		font-size: 0.8rem;
		color: var(--ink-dim);
		text-align: center;
		min-height: 1.3rem;
	}
	.win,
	.okc {
		color: var(--green);
		font-weight: 650;
	}
	.bad {
		color: var(--rose);
		font-weight: 650;
	}
	.side {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		font-size: 0.84rem;
		color: var(--ink-dim);
		max-width: 26rem;
		width: 100%;
	}
	.facts {
		color: var(--ink);
	}
	.sub {
		color: var(--ink-dim);
		margin-top: 0.25rem;
		line-height: 1.5;
	}
	.h {
		font-size: 0.68rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		font-weight: 650;
		color: var(--gold);
		margin-bottom: 0.45rem;
	}
	.checks {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.chk {
		display: grid;
		grid-template-columns: 4.6rem minmax(0, 1fr) auto;
		gap: 0.5rem;
		align-items: center;
		text-align: left;
		padding: 0.45rem 0.7rem;
		border-radius: 8px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(255, 255, 255, 0.025);
		cursor: pointer;
		font-size: 0.8rem;
		transition: all 0.2s var(--ease);
	}
	.chk:hover,
	.chk:focus-visible {
		border-color: var(--rose);
	}
	.chk .nm {
		color: var(--rose);
		font-weight: 650;
		letter-spacing: 0.04em;
	}
	.chk .ct {
		color: var(--ink-dim);
	}
	.chk.pass .verdict {
		color: var(--green);
		font-weight: 650;
	}
	.chk.fail .verdict {
		color: var(--rose);
		font-weight: 650;
	}
	.hint {
		font-size: 0.74rem;
		color: var(--ink-faint);
		line-height: 1.45;
		margin-top: 0.2rem;
	}
	.qrow {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.xray {
		padding: 0 1.4rem 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
	}
	.mat {
		width: min(100%, 300px);
		height: auto;
		display: block;
	}
	.mat rect {
		fill: rgba(255, 255, 255, 0.04);
	}
	.mat rect.one {
		fill: rgba(116, 169, 255, 0.55);
	}
	.mat rect.hcol {
		fill: rgba(116, 169, 255, 0.12);
	}
	.mat rect.one.hcol {
		fill: var(--gold-bright);
	}
</style>
