<script lang="ts">
	import { chapterHref } from '$lib/util/paths';

	const apps = [
		{
			title: 'Fixed points',
			text: 'Stir a cup of coffee: some point always ends up where it began (Brouwer).',
			ch: 'homology/invariance',
			icon: 'swirl'
		},
		{
			title: 'The shape of data',
			text: 'Persistent homology finds loops and voids hidden in clouds of data points.',
			ch: 'homology/persistence',
			icon: 'cloud'
		},
		{
			title: 'Sensor networks',
			text: 'Detect holes in coverage knowing only which sensors can hear each other.',
			ch: 'cohomology/sheaves',
			icon: 'sensors'
		},
		{
			title: 'Impossible figures',
			text: 'Penrose’s stairs and triangle are cohomology classes in disguise.',
			ch: 'cohomology/cochains',
			icon: 'stairs'
		},
		{
			title: 'Rankings',
			text: 'Separate a consistent ranking from the cycles of “A beats B beats C beats A”.',
			ch: 'big-picture/horizons',
			icon: 'rank'
		},
		{
			title: 'Physics',
			text: 'Magnetic monopoles, quantised conductance and topological materials.',
			ch: 'cohomology/characteristic-classes',
			icon: 'field'
		}
	];
</script>

<div class="apps">
	{#each apps as a (a.title)}
		<a class="app" href={chapterHref(a.ch)}>
			<svg viewBox="0 0 48 48" aria-hidden="true" class="ic">
				{#if a.icon === 'swirl'}
					<circle cx="24" cy="24" r="17" />
					<path d="M24 24c0-4 5-6 8-3s1 10-6 11-12-5-11-11 8-11 14-9" />
					<circle cx="24" cy="24" r="2.2" class="dot" />
				{:else if a.icon === 'cloud'}
					{#each Array(14) as _, i (i)}
						<circle cx={24 + 13 * Math.cos((i / 14) * 6.283) + ((i * 7) % 5) - 2} cy={24 + 13 * Math.sin((i / 14) * 6.283) + ((i * 3) % 4) - 2} r="1.8" class="dot" />
					{/each}
					<circle cx="24" cy="24" r="13" class="faint" />
				{:else if a.icon === 'sensors'}
					<circle cx="15" cy="17" r="8" class="faint" /><circle cx="31" cy="15" r="8" class="faint" /><circle cx="33" cy="31" r="8" class="faint" /><circle cx="16" cy="33" r="8" class="faint" />
					<path d="M15 17L31 15L33 31L16 33Z" />
					{#each [[15, 17], [31, 15], [33, 31], [16, 33]] as [x, y], i (i)}<circle cx={x} cy={y} r="2.2" class="dot" />{/each}
				{:else if a.icon === 'stairs'}
					<path d="M10 34h7v-5h7v-5h7v-5h7v-5" />
					<path d="M38 14v8M38 34H10" class="faint" />
				{:else if a.icon === 'rank'}
					<circle cx="24" cy="11" r="3" class="dot" /><circle cx="12" cy="34" r="3" class="dot" /><circle cx="36" cy="34" r="3" class="dot" />
					<path d="M22 14L14 31M15 34h18M34 31L26 14" />
				{:else}
					<circle cx="24" cy="24" r="4" class="dot" />
					{#each Array(8) as _, i (i)}
						<path d={`M${24 + 7 * Math.cos(i * 0.785)} ${24 + 7 * Math.sin(i * 0.785)} L${24 + 18 * Math.cos(i * 0.785)} ${24 + 18 * Math.sin(i * 0.785)}`} />
					{/each}
				{/if}
			</svg>
			<span class="t">{a.title}</span>
			<span class="d">{a.text}</span>
		</a>
	{/each}
</div>

<style>
	.apps {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
		gap: 0.9rem;
		padding: 1.2rem;
	}
	.app {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 1rem 1.05rem;
		border-radius: 12px;
		border: 1px solid var(--line-faint);
		background: rgba(255, 255, 255, 0.02);
		text-decoration: none !important;
		color: var(--ink);
		transition: all 0.2s var(--ease);
	}
	.app:hover {
		border-color: var(--line-strong);
		background: rgba(216, 178, 110, 0.05);
		transform: translateY(-2px);
	}
	.ic {
		width: 2.6rem;
		height: 2.6rem;
		fill: none;
		stroke: var(--gold-bright);
		stroke-width: 1.6;
		stroke-linecap: round;
		stroke-linejoin: round;
		margin-bottom: 0.2rem;
	}
	.ic .dot {
		fill: var(--gold-bright);
		stroke: none;
	}
	.ic .faint {
		stroke: var(--teal);
		opacity: 0.55;
	}
	.t {
		font-family: var(--font-elegant);
		font-weight: 600;
		font-size: 1.2rem;
		color: var(--gold-bright);
	}
	.d {
		font-size: 0.9rem;
		line-height: 1.5;
		color: var(--ink-dim);
	}
</style>
