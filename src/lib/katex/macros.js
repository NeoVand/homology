// Shared KaTeX macros — used both by the build-time preprocessor and by the
// runtime <TeX> component, so formulas look identical everywhere.

/** @type {Record<string, string>} */
export const macros = {
	'\\N': '\\mathbb{N}',
	'\\Z': '\\mathbb{Z}',
	'\\Q': '\\mathbb{Q}',
	'\\R': '\\mathbb{R}',
	'\\C': '\\mathbb{C}',
	'\\F': '\\mathbb{F}',
	'\\RP': '\\mathbb{RP}',
	'\\CP': '\\mathbb{CP}',
	'\\im': '\\operatorname{im}',
	'\\coker': '\\operatorname{coker}',
	'\\rank': '\\operatorname{rank}',
	'\\Hom': '\\operatorname{Hom}',
	'\\Ext': '\\operatorname{Ext}',
	'\\Tor': '\\operatorname{Tor}',
	'\\id': '\\mathrm{id}',
	'\\dR': '\\mathrm{dR}',
	'\\sgn': '\\operatorname{sgn}',
	'\\supp': '\\operatorname{supp}',
	'\\Int': '\\operatorname{Int}',
	'\\cl': '\\operatorname{cl}',
	'\\vol': '\\operatorname{vol}',
	'\\Ob': '\\operatorname{Ob}',
	'\\op': '^{\\mathrm{op}}',
	'\\cat': '\\mathsf{#1}',
	'\\Set': '\\mathsf{Set}',
	'\\Top': '\\mathsf{Top}',
	'\\Grp': '\\mathsf{Grp}',
	'\\Ab': '\\mathsf{Ab}',
	'\\Vect': '\\mathsf{Vect}',
	'\\Ch': '\\mathsf{Ch}',
	'\\lra': '\\longrightarrow',
	'\\xto': '\\xrightarrow{#1}',
	'\\ip': '\\langle #1,\\, #2 \\rangle',
	'\\abs': '\\left\\lvert #1 \\right\\rvert',
	'\\norm': '\\left\\lVert #1 \\right\\rVert',
	'\\set': '\\left\\{ #1 \\right\\}',
	'\\setb': '\\left\\{ #1 \\;\\middle|\\; #2 \\right\\}',
	// colour helpers that match the book's semantic palette (see app.css)
	'\\cyc': '\\htmlClass{tx-gold}{#1}',
	'\\bdy': '\\htmlClass{tx-teal}{#1}',
	'\\chn': '\\htmlClass{tx-violet}{#1}',
	'\\hole': '\\htmlClass{tx-rose}{#1}',
	'\\hlb': '\\htmlClass{tx-blue}{#1}',
	'\\hlg': '\\htmlClass{tx-green}{#1}'
};

/**
 * KaTeX options shared by build-time and runtime rendering.
 * @type {import('katex').KatexOptions}
 */
export const katexOptions = {
	macros,
	trust: true,
	strict: 'ignore',
	output: 'htmlAndMathml',
	throwOnError: true
};
