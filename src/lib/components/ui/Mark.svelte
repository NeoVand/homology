<script lang="ts">
	// A check or a cross, in the colour of the surrounding text. For verdicts
	// such as "holds / fails" next to a statement.
	import Icon from './Icon.svelte';
	import { CheckIcon, CrossIcon } from '$lib/icons';

	let { ok, size = 14, label }: { ok: boolean; size?: number; label?: string } = $props();
</script>

<Icon icon={ok ? CheckIcon : CrossIcon} {size} stroke={2.2} class="mark" label={label ?? (ok ? 'yes' : 'no')} />

<style>
	:global(.icon.mark) {
		vertical-align: -0.12em;
	}
</style>
