<script lang="ts">
	// An on/off switch with its label.
	let {
		checked = $bindable(false),
		label = '',
		onchange
	}: { checked?: boolean; label?: string; onchange?: (v: boolean) => void } = $props();
</script>

<label class="toggle ui">
	<input type="checkbox" role="switch" bind:checked onchange={() => onchange?.(checked)} />
	<span class="track" aria-hidden="true"><span class="knob"></span></span>
	<span class="lbl">{label}</span>
</label>

<style>
	.toggle {
		position: relative;
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		min-height: 2rem;
		font-size: 0.76rem;
		letter-spacing: 0.02em;
		color: var(--ink-dim);
		cursor: pointer;
		user-select: none;
	}
	input {
		position: absolute;
		opacity: 0;
		width: 1px;
		height: 1px;
		margin: 0;
	}
	.track {
		position: relative;
		flex: none;
		width: 1.75rem;
		height: 1rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(235, 229, 213, 0.22);
		transition:
			background 0.18s var(--ease),
			border-color 0.18s var(--ease);
	}
	.knob {
		position: absolute;
		top: 50%;
		left: 2px;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--ink-faint);
		transform: translateY(-50%);
		transition:
			left 0.18s var(--ease),
			background 0.18s var(--ease);
	}
	.toggle:hover .track {
		border-color: rgba(216, 178, 110, 0.55);
	}
	input:checked + .track {
		background: rgba(216, 178, 110, 0.22);
		border-color: rgba(216, 178, 110, 0.8);
	}
	input:checked + .track .knob {
		left: calc(100% - 12px);
		background: var(--gold-bright);
	}
	input:focus-visible + .track {
		outline: 2px solid var(--gold-bright);
		outline-offset: 2px;
	}
	input:checked ~ .lbl {
		color: var(--ink-bright);
	}
	@media (pointer: coarse) {
		.toggle {
			min-height: 2.5rem;
		}
	}
</style>
