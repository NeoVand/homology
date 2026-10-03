// Reading progress, remembered per browser. Everything is wrapped in
// try/catch: storage can be unavailable (private mode, blocked cookies).
import { browser } from '$app/environment';

const KEY = 'homology:visited:v1';

function load(): Record<string, number> {
	if (!browser) return {};
	try {
		return JSON.parse(localStorage.getItem(KEY) ?? '{}') ?? {};
	} catch {
		return {};
	}
}

export const progress = $state<{ visited: Record<string, number> }>({ visited: load() });

export function markVisited(id: string) {
	if (!browser) return;
	progress.visited[id] = Date.now();
	try {
		localStorage.setItem(KEY, JSON.stringify(progress.visited));
	} catch {
		/* ignore */
	}
}
