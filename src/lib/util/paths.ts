import { resolve } from '$app/paths';

/** Base-aware href for an internal pathname like "/homology/chains/". */
export function href(path: string): string {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return resolve(path as any);
}

/** Pathname for a chapter id, e.g. "homology/chains" → "/homology/chains/". */
export function chapterPath(id: string): string {
	return `/${id}/`;
}

/** Base-aware href for a chapter id, optionally with a #hash. */
export function chapterHref(id: string, hash?: string): string {
	return href(chapterPath(id)) + (hash ? `#${hash}` : '');
}
