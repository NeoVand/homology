// Small shared UI state (Svelte 5 runes in a module).
export interface SectionLink {
	id: string;
	/** heading HTML (may contain KaTeX) */
	html: string;
}

export const ui = $state<{
	navOpen: boolean;
	searchOpen: boolean;
	/** the chapter sidebar on wide screens; mirrors html[data-sidebar] */
	sidebarOpen: boolean;
	/** scroll progress through the page, 0–1 */
	progress: number;
	/** h2 sections of the current chapter, collected from the DOM */
	sections: SectionLink[];
	activeSection: string | null;
}>({
	navOpen: false,
	searchOpen: false,
	sidebarOpen: true,
	progress: 0,
	sections: [],
	activeSection: null
});

const SIDEBAR_KEY = 'hc-sidebar';

/** Read the sidebar state that the inline script in app.html restored. */
export function syncSidebar() {
	ui.sidebarOpen = document.documentElement.dataset.sidebar !== 'closed';
}

/** Show or hide the chapter sidebar and remember the choice. The layout keys
 *  on html[data-sidebar], so the first paint of the next page is already right. */
export function setSidebar(open: boolean) {
	ui.sidebarOpen = open;
	if (open) delete document.documentElement.dataset.sidebar;
	else document.documentElement.dataset.sidebar = 'closed';
	try {
		if (open) localStorage.removeItem(SIDEBAR_KEY);
		else localStorage.setItem(SIDEBAR_KEY, 'closed');
	} catch {
		// storage blocked: the choice lasts for this visit only
	}
}

/** Scroll smoothly to an in-page anchor the browser is about to jump to. CSS
 *  smooth scrolling stays off globally, so page changes never animate. */
export function smoothNextJump() {
	if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
	const root = document.documentElement;
	root.style.scrollBehavior = 'smooth';
	let timer = 0;
	const done = () => {
		root.style.scrollBehavior = '';
		window.removeEventListener('scrollend', done);
		clearTimeout(timer);
	};
	window.addEventListener('scrollend', done);
	timer = window.setTimeout(done, 1200);
}

/** Linked highlighting between prose and figures: <Hl k="a"> sets hl.key. */
export const hl = $state<{ key: string | null }>({ key: null });
