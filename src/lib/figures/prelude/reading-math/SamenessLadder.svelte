<script lang="ts">
	// Levels of sameness: =, ≅, ≃ from strict to loose, plus := and ∼, which do different jobs.
	import { renderMathInText, tex } from '$lib/katex/render';

	const rungs = [
		{
			sym: '=',
			name: 'equal',
			say: 'equals',
			text: 'Literally the same object, perhaps with two names.',
			ex: String.raw`\(2+2=4\), \(\ \{1,2\}=\{2,1\}\)`,
			pic: 'eq'
		},
		{
			sym: '\\cong',
			name: 'isomorphic / homeomorphic',
			say: 'is isomorphic to',
			text: 'Different objects with exactly the same structure, matched up by a reversible map that respects it.',
			ex: 'a coffee mug \\(\\cong\\) a doughnut',
			pic: 'cup'
		},
		{
			sym: '\\simeq',
			name: 'homotopy equivalent',
			say: 'is homotopy equivalent to',
			text: 'The same once you allow continuous squashing. Coarser still: it cannot tell a disk from a point.',
			ex: 'a disk \\(\\simeq\\) a point',
			pic: 'disk'
		}
	];
	const others = [
		{
			sym: ':=',
			name: 'is defined to be',
			text: 'Not a claim at all, but an act of naming: the left side is a new name for the right side.',
			ex: '\\(f(x) := x^2\\)'
		},
		{
			sym: '\\sim',
			name: 'is equivalent to (under a chosen rule)',
			text: 'Declared the same by an equivalence relation you choose. The subject of §1.2.',
			ex: '\\(3\\sim7\\) (same parity), \\(\\tfrac12\\sim\\tfrac24\\)'
		}
	];
</script>

<div class="ladder">
	<div class="spectrum ui" aria-hidden="true">
		<span>strict</span>
		<span class="bar"></span>
		<span>loose</span>
	</div>
	<div class="rungs">
		{#each rungs as r (r.sym)}
			<div class="rung">
				<div class="top">
					<span class="sym">{@html tex(r.sym)}</span>
					<svg viewBox="0 0 84 48" class="pic" aria-hidden="true">
						{#if r.pic === 'eq'}
							<text x="6" y="16" class="t">2+2</text>
							<text x="58" y="16" class="t">4</text>
							<path d="M 18 21 Q 26 34 38 36" class="ar" />
							<path d="M 62 21 Q 56 34 46 36" class="ar" />
							<circle cx="42" cy="38" r="5.5" class="dot" />
						{:else if r.pic === 'cup'}
							<rect x="6" y="12" width="22" height="26" rx="5" class="shape" />
							<path d="M 28 18 q 11 2 0 14" class="shape hollow" />
							<ellipse cx="62" cy="26" rx="18" ry="11" class="shape" />
							<ellipse cx="62" cy="25" rx="6" ry="2.6" class="hole" />
						{:else}
							<circle cx="22" cy="26" r="15" class="shape" />
							<path d="M 42 26 H 56" class="ar" />
							<path d="M 52 22 L 57 26 L 52 30" class="ar" />
							<circle cx="70" cy="26" r="3.5" class="dot" />
						{/if}
					</svg>
				</div>
				<div class="name">{r.name}</div>
				<div class="say ui">say “{r.say}”</div>
				<p class="text">{r.text}</p>
				<p class="ex">{@html renderMathInText(r.ex)}</p>
			</div>
		{/each}
	</div>
	<div class="others">
		{#each others as o (o.sym)}
			<div class="other">
				<span class="sym small">{@html tex(o.sym)}</span>
				<div>
					<div class="name">{o.name}</div>
					<p class="text">{o.text} <span class="ex inline">{@html renderMathInText(o.ex)}</span></p>
				</div>
			</div>
		{/each}
	</div>
</div>

<style>
	.ladder {
		padding: 1.1rem 1.1rem 1rem;
	}
	.spectrum {
		display: flex;
		align-items: center;
		gap: 0.7rem;
		font-size: 0.68rem;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--ink-faint);
		margin: 0 0.4rem 0.7rem;
	}
	.bar {
		flex: 1;
		height: 3px;
		border-radius: 3px;
		background: linear-gradient(90deg, var(--gold-bright), var(--teal), var(--violet));
		box-shadow: 0 0 12px rgba(164, 147, 255, 0.35);
	}
	.rungs {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.6rem;
	}
	@media (max-width: 640px) {
		.rungs {
			grid-template-columns: 1fr;
		}
	}
	.rung {
		padding: 0.8rem 0.9rem 0.6rem;
		border-radius: 12px;
		border: 1px solid var(--line-faint);
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01));
	}
	.top {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.sym {
		font-size: 2.1rem;
		color: var(--gold-bright);
		line-height: 1;
	}
	.sym.small {
		font-size: 1.6rem;
		min-width: 2.6rem;
	}
	.pic {
		width: 84px;
		height: 48px;
	}
	.t {
		font-family: var(--font-ui);
		font-size: 11px;
		fill: var(--ink-dim);
	}
	.ar {
		fill: none;
		stroke: var(--ink-faint);
		stroke-width: 1.3;
	}
	.dot {
		fill: #f2d08f;
		filter: drop-shadow(0 0 4px rgba(242, 208, 143, 0.8));
	}
	.shape {
		fill: rgba(164, 147, 255, 0.22);
		stroke: rgba(200, 192, 255, 0.8);
		stroke-width: 1.4;
	}
	.shape.hollow {
		fill: none;
	}
	.hole {
		fill: #0b1122;
		stroke: rgba(200, 192, 255, 0.8);
		stroke-width: 1.2;
	}
	.name {
		margin-top: 0.4rem;
		font-family: var(--font-elegant);
		font-size: 1.12rem;
		font-weight: 600;
		color: var(--ink-bright);
	}
	.say {
		font-size: 0.72rem;
		color: var(--gold);
		letter-spacing: 0.04em;
	}
	.text {
		margin: 0.35rem 0 0.25rem !important;
		font-size: 0.88rem;
		line-height: 1.45;
		color: var(--ink-dim);
	}
	.ex {
		margin: 0 !important;
		font-size: 0.9rem;
		color: var(--ink);
	}
	.ex.inline {
		white-space: nowrap;
	}
	.others {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.6rem;
		margin-top: 0.7rem;
	}
	@media (max-width: 640px) {
		.others {
			grid-template-columns: 1fr;
		}
	}
	.other {
		display: flex;
		gap: 0.8rem;
		align-items: flex-start;
		padding: 0.7rem 0.9rem;
		border-radius: 12px;
		border: 1px dashed var(--line);
		background: rgba(116, 169, 255, 0.03);
	}
	.other .name {
		margin-top: 0;
	}
</style>
