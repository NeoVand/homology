// The book's symbol dictionary and its Greek letters, with how to say them.

export type Cat = 'logic' | 'sets' | 'maps' | 'same' | 'numbers' | 'later';

export interface Sym {
	tex: string;
	say: string;
	mean: string;
	cat: Cat;
	where?: string;
}

export const categories: { value: Cat | 'all'; label: string }[] = [
	{ value: 'all', label: 'All' },
	{ value: 'logic', label: 'Logic' },
	{ value: 'sets', label: 'Sets' },
	{ value: 'maps', label: 'Functions' },
	{ value: 'same', label: 'Sameness' },
	{ value: 'numbers', label: 'Numbers' },
	{ value: 'later', label: 'Coming later' }
];

export const symbols: Sym[] = [
	{ tex: '\\wedge', say: 'and', mean: 'Both statements hold.', cat: 'logic', where: 'prelude/reading-math' },
	{ tex: '\\vee', say: 'or', mean: 'At least one holds (inclusive “or”).', cat: 'logic', where: 'prelude/reading-math' },
	{ tex: '\\neg', say: 'not', mean: 'The statement fails.', cat: 'logic', where: 'prelude/reading-math' },
	{ tex: '\\Rightarrow', say: 'implies; if … then', mean: 'A promise: whenever the left holds, so does the right.', cat: 'logic', where: 'prelude/reading-math' },
	{ tex: '\\iff', say: 'if and only if', mean: 'Both directions: the two statements are equivalent.', cat: 'logic', where: 'prelude/reading-math' },
	{ tex: '\\forall', say: 'for all', mean: 'For every element (an upside-down A).', cat: 'logic', where: 'prelude/reading-math' },
	{ tex: '\\exists', say: 'there exists', mean: 'For at least one element (a backwards E).', cat: 'logic', where: 'prelude/reading-math' },
	{ tex: '\\exists!', say: 'there exists exactly one', mean: 'One, and only one.', cat: 'logic', where: 'prelude/reading-math' },
	{ tex: '\\blacksquare', say: '(end of proof)', mean: 'The proof is finished. Also written □ or “QED”.', cat: 'logic', where: 'prelude/reading-math' },
	{ tex: '\\in', say: 'is an element of; in', mean: '\\(x\\in X\\): \\(x\\) is one of the things in \\(X\\).', cat: 'sets', where: 'foundations/sets-and-functions' },
	{ tex: '\\notin', say: 'is not in', mean: 'Not an element.', cat: 'sets', where: 'foundations/sets-and-functions' },
	{ tex: '\\subseteq', say: 'is a subset of', mean: 'Everything in the left is in the right.', cat: 'sets', where: 'foundations/sets-and-functions' },
	{ tex: '\\varnothing', say: 'the empty set', mean: 'The set with no elements.', cat: 'sets', where: 'foundations/sets-and-functions' },
	{ tex: '\\cup', say: 'union', mean: 'Everything in either set.', cat: 'sets', where: 'foundations/sets-and-functions' },
	{ tex: '\\cap', say: 'intersect', mean: 'What two sets share.', cat: 'sets', where: 'foundations/sets-and-functions' },
	{ tex: '\\setminus', say: 'minus', mean: '\\(A\\setminus B\\): \\(A\\) with \\(B\\)’s elements removed.', cat: 'sets', where: 'foundations/sets-and-functions' },
	{ tex: '\\times', say: 'cross', mean: 'Cartesian product: all ordered pairs.', cat: 'sets', where: 'foundations/sets-and-functions' },
	{ tex: '\\{x \\mid P(x)\\}', say: 'the set of x such that P of x', mean: 'Set-builder notation.', cat: 'sets', where: 'foundations/sets-and-functions' },
	{ tex: '\\lvert X\\rvert', say: 'the size of X', mean: 'Number of elements. (On a number, \\(\\lvert x\\rvert\\) is its absolute value.)', cat: 'sets', where: 'foundations/sets-and-functions' },
	{ tex: 'f\\colon X\\to Y', say: 'f from X to Y', mean: 'A function with domain \\(X\\), codomain \\(Y\\).', cat: 'maps', where: 'foundations/sets-and-functions' },
	{ tex: 'x\\mapsto x^2', say: 'x maps to x squared', mean: 'Where one element goes.', cat: 'maps', where: 'foundations/sets-and-functions' },
	{ tex: 'g\\circ f', say: 'g after f', mean: 'Do \\(f\\) first, then \\(g\\).', cat: 'maps', where: 'foundations/sets-and-functions' },
	{ tex: 'f^{-1}(B)', say: 'the preimage of B', mean: 'Everything that lands in \\(B\\). Needs no inverse.', cat: 'maps', where: 'foundations/sets-and-functions' },
	{ tex: '\\id_X', say: 'the identity on X', mean: 'The map that changes nothing.', cat: 'maps', where: 'foundations/sets-and-functions' },
	{ tex: '\\hookrightarrow', say: 'injects into', mean: 'An injective map (often an inclusion).', cat: 'maps', where: 'foundations/sets-and-functions' },
	{ tex: '\\twoheadrightarrow', say: 'surjects onto', mean: 'A surjective map.', cat: 'maps', where: 'foundations/sets-and-functions' },
	{ tex: '=', say: 'equals', mean: 'Literally the same thing.', cat: 'same' },
	{ tex: ':=', say: 'is defined to be', mean: 'Not a claim but a naming: the left side is a new name for the right.', cat: 'same', where: 'prelude/reading-math' },
	{ tex: '\\cong', say: 'is isomorphic (homeomorphic) to', mean: 'The same structure, via a perfect matching that respects it.', cat: 'same', where: 'topology/spaces' },
	{ tex: '\\simeq', say: 'is homotopy equivalent to', mean: 'The same up to continuous deformation.', cat: 'same', where: 'topology/homotopy' },
	{ tex: '\\sim', say: 'is related to; twiddle', mean: 'Declared the same by a chosen rule (an equivalence relation).', cat: 'same', where: 'foundations/equivalence' },
	{ tex: '\\equiv', say: 'is congruent to', mean: '\\(a\\equiv b \\pmod n\\): \\(n\\) divides \\(a-b\\).', cat: 'same', where: 'foundations/equivalence' },
	{ tex: '\\N', say: 'N', mean: 'Natural numbers \\(0,1,2,\\dots\\)', cat: 'numbers', where: 'foundations/sets-and-functions' },
	{ tex: '\\Z', say: 'Z', mean: 'Integers \\(\\dots,-1,0,1,\\dots\\) (German *Zahlen*).', cat: 'numbers', where: 'foundations/sets-and-functions' },
	{ tex: '\\Q', say: 'Q', mean: 'Rational numbers (fractions).', cat: 'numbers', where: 'foundations/sets-and-functions' },
	{ tex: '\\R', say: 'R', mean: 'Real numbers: the whole number line.', cat: 'numbers', where: 'foundations/sets-and-functions' },
	{ tex: '\\Z/n', say: 'Z mod n', mean: 'Integers modulo \\(n\\): clock arithmetic.', cat: 'numbers', where: 'foundations/equivalence' },
	{ tex: 'n\\mid m', say: 'n divides m', mean: '\\(m\\) is a whole multiple of \\(n\\).', cat: 'numbers', where: 'foundations/equivalence' },
	{ tex: '\\textstyle\\sum_{i=1}^{n}', say: 'the sum from i equals 1 to n', mean: 'Add up the terms for \\(i=1,2,\\dots,n\\).', cat: 'numbers' },
	{ tex: '\\oplus', say: 'direct sum', mean: 'Put two groups side by side.', cat: 'later', where: 'foundations/abelian-groups' },
	{ tex: '\\ker', say: 'kernel', mean: 'What a map sends to zero.', cat: 'later', where: 'foundations/groups' },
	{ tex: '\\im', say: 'image', mean: 'What a map reaches.', cat: 'later', where: 'foundations/groups' },
	{ tex: '\\partial', say: 'boundary (or partial)', mean: 'The boundary map of homology.', cat: 'later', where: 'homology/chains' },
	{ tex: '\\delta', say: 'delta; coboundary', mean: 'The coboundary map of cohomology.', cat: 'later', where: 'cohomology/cochains' },
	{ tex: 'H_n', say: 'H n', mean: 'Homology in dimension \\(n\\) (subscript).', cat: 'later', where: 'homology/homology-groups' },
	{ tex: 'H^n', say: 'H upper n', mean: 'Cohomology in dimension \\(n\\) (superscript).', cat: 'later', where: 'cohomology/cohomology-groups' },
	{ tex: 'f_*', say: 'f lower star', mean: 'What a map does to homology: pushes forward.', cat: 'later', where: 'homology/invariance' },
	{ tex: 'f^*', say: 'f upper star', mean: 'What a map does to cohomology: pulls back.', cat: 'later', where: 'cohomology/cohomology-groups' }
];

export interface Greek {
	lower: string;
	upper?: string;
	name: string;
	say: string;
	role: string;
}

export const greek: Greek[] = [
	{ lower: '\\alpha', name: 'alpha', say: 'AL-fuh', role: 'paths and loops; angles' },
	{ lower: '\\beta', name: 'beta', say: 'BAY-tuh', role: 'loops; \\(\\beta_k\\) for Betti numbers in data science' },
	{ lower: '\\gamma', upper: '\\Gamma', name: 'gamma', say: 'GAM-uh', role: 'paths and loops: \\(\\gamma\\colon[0,1]\\to X\\)' },
	{ lower: '\\delta', upper: '\\Delta', name: 'delta', say: 'DEL-tuh', role: '\\(\\delta\\): coboundary, or a small distance; \\(\\Delta^n\\): the standard simplex' },
	{ lower: '\\varepsilon', name: 'epsilon', say: 'EP-sih-lon', role: 'a small positive number' },
	{ lower: '\\eta', name: 'eta', say: 'AY-tuh', role: 'differential forms; natural transformations' },
	{ lower: '\\theta', name: 'theta', say: 'THAY-tuh', role: 'angles' },
	{ lower: '\\iota', name: 'iota', say: 'eye-OH-tuh', role: 'inclusion maps \\(\\iota\\colon A\\hookrightarrow X\\)' },
	{ lower: '\\lambda', name: 'lambda', say: 'LAM-duh', role: 'numbers that scale (scalars)' },
	{ lower: '\\pi', upper: '\\Pi', name: 'pi', say: 'pie', role: '\\(3.14159\\ldots\\); projections; \\(\\pi_1\\), the fundamental group' },
	{ lower: '\\sigma', upper: '\\Sigma', name: 'sigma', say: 'SIG-muh', role: '\\(\\sigma\\): a simplex; \\(\\Sigma\\): a sum, or the genus-\\(g\\) surface \\(\\Sigma_g\\)' },
	{ lower: '\\tau', name: 'tau', say: 'tow (rhymes with cow)', role: 'another simplex, next to \\(\\sigma\\)' },
	{ lower: '\\varphi', name: 'phi', say: 'fie (or fee)', role: 'maps, charts and cochains' },
	{ lower: '\\psi', name: 'psi', say: 'sigh (or psy)', role: 'more maps' },
	{ lower: '\\chi', name: 'chi', say: 'kye (rhymes with sky)', role: 'the Euler characteristic \\(\\chi(X)\\)' },
	{ lower: '\\omega', upper: '\\Omega', name: 'omega', say: 'oh-MAY-guh', role: '\\(\\omega\\): a differential form; \\(\\Omega^k(M)\\): all \\(k\\)-forms on \\(M\\)' }
];
