// Data for the formula decoder: each formula is a TeX template whose @i
// placeholders are filled with token i (wrapped in \htmlClass so it can be
// hovered), plus a spoken reading and a meaning for every token.

export interface Token {
	/** TeX of the token */
	tex: string;
	/** how to say it aloud (a phrase of the spoken sentence) */
	say: string;
	/** what it means here; may contain \( \) math */
	mean: string;
	/** chapter id where the idea is introduced */
	where?: string;
}

export interface Formula {
	id: string;
	label: string;
	template: string;
	tokens: Token[];
	/** one-sentence gloss of the whole formula; may contain \( \) math */
	gloss: string;
}

export const formulas: Formula[] = [
	{
		id: 'destination',
		label: 'The destination',
		template: '@0_{@1}@2 @3 @4@5 @6 @7@8',
		tokens: [
			{
				tex: 'H',
				say: 'H',
				mean: '**Homology**: a machine that takes a shape and produces an algebraic object, a group, that records its holes.',
				where: 'homology/homology-groups'
			},
			{
				tex: 'n',
				say: 'sub n',
				mean: 'A subscript naming the **dimension** we ask about: \\(n=0\\) counts pieces, \\(n=1\\) counts loops around holes, \\(n=2\\) counts hollow cavities.'
			},
			{
				tex: '(X)',
				say: 'of X',
				mean: 'The **space** being studied: a circle, a sphere, a doughnut, a cloud of data points. The parentheses say “applied to \\(X\\)”. Together, \\(H_n(X)\\) is usually read “the \\(n\\)-th homology of \\(X\\)”.'
			},
			{
				tex: '=',
				say: 'is',
				mean: 'Here “is defined to be”: this equation is the **definition** of homology. (Some authors would write \\(:=\\).)'
			},
			{
				tex: '\\ker',
				say: 'the kernel of',
				mean: 'The **kernel** of a map: everything the map sends to zero — what it crushes. Here: the loops (and higher “cycles”) that have no boundary.',
				where: 'foundations/groups'
			},
			{
				tex: '\\partial_n',
				say: 'boundary n',
				mean: 'The **boundary map** in dimension \\(n\\) (\\(\\partial\\) is a curly d, read “boundary” or “partial”). It sends each \\(n\\)-dimensional piece to its edge.',
				where: 'homology/chains'
			},
			{
				tex: '/',
				say: 'modulo',
				mean: 'A **quotient**: declare certain things to be the same (the idea of §1.2). Two cycles count as the same hole if they differ by a boundary.',
				where: 'foundations/equivalence'
			},
			{
				tex: '\\im',
				say: 'the image of',
				mean: 'The **image** of a map: everything it actually reaches. Here: the cycles that are boundaries of something one dimension up — the ones that enclose nothing interesting.',
				where: 'foundations/sets-and-functions'
			},
			{
				tex: '\\partial_{n+1}',
				say: 'boundary n plus one',
				mean: 'The boundary map one dimension higher: it takes \\((n+1)\\)-dimensional pieces to their \\(n\\)-dimensional edges.',
				where: 'homology/chains'
			}
		],
		gloss: 'The \\(n\\)-dimensional holes of \\(X\\) are the \\(n\\)-dimensional cycles (things with no boundary), where two cycles count as the same when they differ by a boundary.'
	},
	{
		id: 'function',
		label: 'A function',
		template: '@0 @1 @2 @3 @4,\\quad @5 @6 @7',
		tokens: [
			{ tex: 'f', say: 'f', mean: 'The **name** of the function.' },
			{ tex: '\\colon', say: 'from', mean: 'The colon announces where the function goes from and to.' },
			{ tex: '\\R', say: 'R', mean: 'The **domain**: the real numbers \\(\\R\\), where inputs come from.', where: 'foundations/sets-and-functions' },
			{ tex: '\\to', say: 'to', mean: 'The plain arrow goes between **sets**: from the domain to the codomain.' },
			{ tex: '\\R', say: 'R,', mean: 'The **codomain**: where outputs are allowed to land (again the real numbers).', where: 'foundations/sets-and-functions' },
			{ tex: 'x', say: 'x', mean: 'A typical **input**, a real number.' },
			{ tex: '\\mapsto', say: 'maps to', mean: 'The barred arrow goes between **elements**: it says where one input goes.' },
			{ tex: 'x^2', say: 'x squared', mean: 'The **output** for the input \\(x\\): its square.' }
		],
		gloss: 'A function \\(f\\) from the real numbers to the real numbers that sends each number to its square.'
	},
	{
		id: 'set',
		label: 'A set',
		template: '@0 @1 @2 @3 @4 @5 @6 @7',
		tokens: [
			{ tex: '\\{', say: 'the set of all', mean: 'A curly brace opens a **set**.', where: 'foundations/sets-and-functions' },
			{ tex: 'n', say: 'n', mean: 'The name for a typical element we are about to describe.' },
			{ tex: '\\in', say: 'in', mean: '**Is an element of**.' },
			{ tex: '\\Z', say: 'Z', mean: 'The **integers** \\(\\dots,-2,-1,0,1,2,\\dots\\): where \\(n\\) is taken from.' },
			{ tex: '\\mid', say: 'such that', mean: 'The bar reads “**such that**”; what follows is the condition. (Some books use a colon.)' },
			{ tex: 'n = 2k', say: 'n equals 2k', mean: 'The condition: \\(n\\) is twice something…' },
			{ tex: '\\text{ for some } k\\in\\Z', say: 'for some integer k', mean: '…where that something is an integer. “For some” is the quantifier \\(\\exists\\).' },
			{ tex: '\\}', say: '.', mean: 'The closing brace ends the set.' }
		],
		gloss: 'The set of all integers that are twice an integer: the even numbers \\(\\{\\dots,-4,-2,0,2,4,\\dots\\}\\).'
	},
	{
		id: 'quantifiers',
		label: 'A promise',
		template: '@0 @1 @2 @3\\ @4 @5 @6 @7 @8',
		tokens: [
			{ tex: '\\forall', say: 'for every', mean: 'The **universal quantifier**: “for every” (an upside-down A, for “all”).' },
			{ tex: 'x', say: 'x', mean: 'The variable it governs.' },
			{ tex: '\\in', say: 'in', mean: '**Is an element of**.' },
			{ tex: '\\Z', say: 'Z', mean: 'The integers.' },
			{ tex: '\\exists', say: 'there is', mean: 'The **existential quantifier**: “there exists” (a backwards E). Because it comes after \\(\\forall x\\), the \\(y\\) may depend on \\(x\\).' },
			{ tex: 'y', say: 'y', mean: 'The variable it governs.' },
			{ tex: '\\in', say: 'in', mean: '**Is an element of**.' },
			{ tex: '\\Z\\colon', say: 'Z such that', mean: 'The integers; the colon reads “such that”.' },
			{ tex: 'x+y=0', say: 'x plus y equals zero.', mean: 'The property \\(y\\) must have. Here \\(y=-x\\) works, so the statement is true.' }
		],
		gloss: 'Every integer has a partner that adds up with it to zero. (True: take \\(y=-x\\).)'
	},
	{
		id: 'kernel',
		label: 'A kernel',
		template: '@0 @1 @2 @3 @4 @5 @6 @7 @8 @9',
		tokens: [
			{ tex: '\\ker', say: 'the kernel of', mean: 'The **kernel** of a map: what it sends to zero.', where: 'foundations/groups' },
			{ tex: '\\varphi', say: 'phi', mean: 'A Greek letter phi naming a **map** (Greek letters often name maps).' },
			{ tex: '=', say: 'is', mean: 'Here, as often, “is by definition”.' },
			{ tex: '\\{', say: 'the set of all', mean: 'Opens a set.' },
			{ tex: 'g', say: 'g', mean: 'A typical element.' },
			{ tex: '\\in', say: 'in', mean: '**Is an element of**.' },
			{ tex: 'G', say: 'G', mean: 'A **group** \\(G\\), the domain of \\(\\varphi\\).', where: 'foundations/groups' },
			{ tex: '\\mid', say: 'such that', mean: '“Such that.”' },
			{ tex: '\\varphi(g)=0', say: 'phi of g is zero', mean: 'The condition: \\(\\varphi\\) sends \\(g\\) to zero.' },
			{ tex: '\\}', say: '.', mean: 'Closes the set.' }
		],
		gloss: 'The kernel of \\(\\varphi\\) is the set of all elements \\(g\\) of \\(G\\) that \\(\\varphi\\) sends to zero.'
	}
];

/** Build the full TeX with every token wrapped (and the active one marked). */
export function buildTeX(f: Formula, active: number | null): string {
	return f.template.replace(/@(\d+)/g, (_, d: string) => {
		const i = Number(d);
		const t = f.tokens[i];
		return `\\htmlClass{tk tk-${i}${i === active ? ' on' : ''}}{${t.tex}}`;
	});
}
