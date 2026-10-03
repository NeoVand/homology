// Quick quality metrics for every chapter: prose words, sections, figures,
// exercises, formal statements, glossary entries. Run: node scripts/chapter-stats.mjs
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const toc = readFileSync(join(root, 'src/lib/content/toc.ts'), 'utf8');
const ids = [...toc.matchAll(/id: '([a-z-]+\/[a-z-]+)'/g)].map((m) => m[1]);

const rows = [];
for (const id of ids) {
	const file = join(root, 'src/routes/(book)', id, '+page.svelte');
	if (!existsSync(file)) continue;
	const src = readFileSync(file, 'utf8');
	const body = src.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
	const prose = body
		.replace(/\\\[[\s\S]*?\\\]/g, ' ')
		.replace(/\\\([\s\S]*?\\\)/g, ' x ')
		.replace(/\{[^{}]*\}/g, ' ')
		.replace(/<[^>]+>/g, ' ');
	const words = prose.split(/\s+/).filter((w) => /[A-Za-z]/.test(w)).length;
	const count = (re) => (body.match(re) ?? []).length;
	const figDir = join(root, 'src/lib/figures', id);
	const figFiles = existsSync(figDir) ? readdirSync(figDir).filter((f) => f.endsWith('.svelte')).length : 0;
	const glossFile = join(root, 'src/lib/content/glossary', id.replace('/', '--') + '.ts');
	const gloss = existsSync(glossFile) ? (readFileSync(glossFile, 'utf8').match(/\bkey:/g) ?? []).length : 0;
	rows.push({
		id,
		words,
		h2: count(/<h2 /g),
		figures: count(/<Figure[\s>]/g),
		scene3d: count(/<Scene3D[\s>]/g) + (src.match(/import \w+ from '\$lib\/figures/g) ?? []).length,
		figComponents: figFiles,
		exercises: count(/<Exercise[\s>]/g),
		defs: count(/<Definition[\s>]/g),
		thms: count(/<(Theorem|Proposition|Lemma|Corollary)[\s>]/g),
		terms: count(/<Term /g),
		gloss
	});
}
const pad = (s, n) => String(s).padEnd(n);
console.log(
	pad('chapter', 38) + pad('words', 7) + pad('h2', 4) + pad('figs', 6) + pad('figC', 6) + pad('ex', 4) + pad('defs', 6) + pad('thms', 6) + pad('terms', 7) + 'gloss'
);
let total = 0;
for (const r of rows) {
	total += r.words;
	console.log(
		pad(r.id, 38) + pad(r.words, 7) + pad(r.h2, 4) + pad(r.figures, 6) + pad(r.figComponents, 6) + pad(r.exercises, 4) + pad(r.defs, 6) + pad(r.thms, 6) + pad(r.terms, 7) + r.gloss
	);
}
console.log(`\n${rows.length} chapters, ${total} words of prose`);
