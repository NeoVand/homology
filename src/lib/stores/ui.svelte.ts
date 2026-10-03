// Small shared UI state (Svelte 5 runes in a module).
export interface SectionLink {
	id: string;
	/** heading HTML (may contain KaTeX) */
	html: string;
}

export const ui = $state<{
	navOpen: boolean;
	searchOpen: boolean;
	/** scroll progress through the page, 0–1 */
	progress: number;
	/** h2 sections of the current chapter, collected from the DOM */
	sections: SectionLink[];
	activeSection: string | null;
}>({
	navOpen: false,
	searchOpen: false,
	progress: 0,
	sections: [],
	activeSection: null
});

/** Linked highlighting between prose and figures: <Hl k="a"> sets hl.key. */
export const hl = $state<{ key: string | null }>({ key: null });
