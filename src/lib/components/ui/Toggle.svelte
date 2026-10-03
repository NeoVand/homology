<script lang="ts">
	let {
		checked = $bindable(false),
		label = '',
		onchange
	}: { checked?: boolean; label?: string; onchange?: (v: boolean) => void } = $props();
</script>

<label class="toggle ui">
	<input type="checkbox" bind:checked onchange={() => onchange?.(checked)} />
	<span class="track" aria-hidden="true"><span class="knob"></span></span>
	<span class="lbl">{label}</span>
</label>

<style>
	.toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		cursor: pointer;
		font-size: 0.78rem;
		color: var(--ink-dim);
		user-select: none;
	}
	input {
		position: absolute;
		opacity: 0;
		width: 1px;
		height: 1px;
	}
	.track {
		width: 2.1rem;
		height: 1.2rem;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.08);
		border: 1px solid rgba(255, 255, 255, 0.12);
		position: relative;
		transition: all 0.2s var(--ease);
		flex: none;
	}
	.knob {
		position: absolute;
		top: 50%;
		left: 0.15rem;
		width: 0.8rem;
		height: 0.8rem;
		border-radius: 50%;
		background: var(--ink-faint);
		transform: translateY(-50%);
		transition: all 0.2s var(--ease);
	}
	input:checked + .track {
		background: rgba(216, 178, 110, 0.25);
		border-color: var(--gold);
	}
	input:checked + .track .knob {
		left: calc(100% - 0.95rem);
		background: var(--gold-bright);
		box-shadow: 0 0 8px var(--gold-glow);
	}
	input:focus-visible + .track {
		outline: 2px solid var(--gold-bright);
		outline-offset: 2px;
	}
	input:checked ~ .lbl {
		color: var(--ink-bright);
	}
</style>
