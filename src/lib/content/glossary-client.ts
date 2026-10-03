import { href } from '$lib/util/paths';

export interface GlossaryPopEntry {
	term: string;
	html: string;
	chapter: string;
	num: string;
	title: string;
	anchor?: string;
}

let promise: Promise<Record<string, GlossaryPopEntry>> | null = null;

export function loadGlossary(): Promise<Record<string, GlossaryPopEntry>> {
	promise ??= fetch(href('/glossary.json'))
		.then((r) => (r.ok ? r.json() : {}))
		.catch(() => {
			promise = null;
			return {};
		});
	return promise;
}
