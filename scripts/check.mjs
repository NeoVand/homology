// svelte-check, minus the false alarms inside TeX.
//
// svelte-check does not run our KaTeX markup preprocessor, so TeX braces such as
// \partial_{n+1} look like Svelte {expressions} to it. This wrapper runs
// svelte-check, finds the \( … \) and \[ … \] ranges of each .svelte file, and
// drops diagnostics that fall inside them. Everything else is reported as usual.
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = ['svelte-check', '--tsconfig', './tsconfig.json', '--output', 'machine', ...process.argv.slice(2)];
spawnSync('npx', ['svelte-kit', 'sync'], { stdio: 'inherit' });
const r = spawnSync('npx', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const lines = (r.stdout || '').split('\n');

const cache = new Map();
function mathRanges(file) {
	if (cache.has(file)) return cache.get(file);
	let src = '';
	try {
		src = readFileSync(resolve(file), 'utf8');
	} catch {
		cache.set(file, { src: '', ranges: [] });
		return cache.get(file);
	}
	// blank out script/style so we only scan markup
	const masked = src.replace(/<(script|style)(\s[^>]*)?>[\s\S]*?<\/\1>/g, (m) => ' '.repeat(m.length));
	const ranges = [];
	const bs = (i) => {
		let n = 0;
		for (let j = i - 1; j >= 0 && masked[j] === '\\'; j--) n++;
		return n;
	};
	for (let i = 0; i < masked.length - 1; i++) {
		if (masked[i] !== '\\' || bs(i) % 2 === 1) continue;
		const open = masked[i + 1];
		if (open !== '(' && open !== '[') continue;
		const close = open === '(' ? '\\)' : '\\]';
		let j = i + 2;
		for (;;) {
			j = masked.indexOf(close, j);
			if (j === -1 || bs(j) % 2 === 0) break;
			j++;
		}
		if (j === -1) break;
		ranges.push([i, j + 2]);
		i = j + 1;
	}
	const v = { src, ranges };
	cache.set(file, v);
	return v;
}
function offsetOf(src, line, col) {
	let off = 0;
	let l = 1;
	while (l < line && off < src.length) {
		const nl = src.indexOf('\n', off);
		if (nl === -1) break;
		off = nl + 1;
		l++;
	}
	return off + Math.max(0, col - 1);
}

let errors = 0;
let warnings = 0;
const out = [];
for (const line of lines) {
	const m = line.match(/^\d+ (ERROR|WARNING) "([^"]+)" (\d+):(\d+) "(.*)"$/);
	if (!m) continue;
	const [, kind, file, ln, col, msg] = m;
	if (file.endsWith('.svelte')) {
		const { src, ranges } = mathRanges(file);
		const off = offsetOf(src, +ln, +col);
		if (ranges.some(([a, b]) => off >= a && off <= b)) continue;
	}
	if (kind === 'ERROR') errors++;
	else warnings++;
	out.push(`${kind === 'ERROR' ? '✖' : '⚠'} ${file}:${ln}:${col}\n    ${JSON.parse('"' + msg.replace(/\\'/g, "'") + '"').replace(/\n/g, '\n    ')}`);
}
console.log(out.join('\n'));
console.log(`\nsvelte-check (TeX-aware): ${errors} error(s), ${warnings} warning(s)`);
process.exit(errors ? 1 : 0);
