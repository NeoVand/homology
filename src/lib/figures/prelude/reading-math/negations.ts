// Step-by-step negations: push ¬ inward, one rule per step.
// \hole{…} paints the ¬ rose; \cyc{…} paints what just changed gold.

export interface Rule {
	tex: string;
	name: string;
}

export const rules: Rule[] = [
	{ tex: String.raw`\neg\,\forall x\,P \;\equiv\; \exists x\,\neg P`, name: 'not all = some not' },
	{ tex: String.raw`\neg\,\exists x\,P \;\equiv\; \forall x\,\neg P`, name: 'not some = all not' },
	{ tex: String.raw`\neg(P\wedge Q) \;\equiv\; \neg P\vee\neg Q`, name: 'not both = at least one fails' },
	{ tex: String.raw`\neg(P\vee Q) \;\equiv\; \neg P\wedge\neg Q`, name: 'not either = neither' },
	{ tex: String.raw`\neg(P\Rightarrow Q) \;\equiv\; P\wedge\neg Q`, name: 'a broken promise' },
	{ tex: String.raw`\neg(a<b) \;\equiv\; a\ge b`, name: 'negate the basic fact' }
];

export interface Step {
	tex: string;
	/** index into rules, or -1 for "start" / "add ¬" */
	rule: number;
	note: string;
}

export interface Machine {
	id: string;
	label: string;
	steps: Step[];
	/** plain-English reading of the final line */
	english: string;
}

export const machines: Machine[] = [
	{
		id: 'partners',
		label: 'Partners',
		steps: [
			{ tex: String.raw`\forall x\ \exists y:\ x+y=0`, rule: -1, note: 'Start: “every \\(x\\) has a partner \\(y\\) with \\(x+y=0\\).”' },
			{ tex: String.raw`\hole{\neg}\big(\forall x\ \exists y:\ x+y=0\big)`, rule: -1, note: 'Put “not” in front of the whole statement.' },
			{ tex: String.raw`\cyc{\exists x}\ \hole{\neg}\big(\exists y:\ x+y=0\big)`, rule: 0, note: 'Push \\(\\neg\\) past \\(\\forall x\\): it flips to \\(\\exists x\\).' },
			{ tex: String.raw`\exists x\ \cyc{\forall y}\ \hole{\neg}\big(x+y=0\big)`, rule: 1, note: 'Push \\(\\neg\\) past \\(\\exists y\\): it flips to \\(\\forall y\\).' },
			{ tex: String.raw`\exists x\ \forall y:\ \cyc{x+y\neq0}`, rule: 5, note: 'Finally negate the basic fact: \\(\\neg(x+y=0)\\) is \\(x+y\\neq0\\).' }
		],
		english: 'There is an \\(x\\) such that no \\(y\\) at all makes \\(x+y=0\\). (Over \\(\\Z\\) this is false — as it should be, because the original was true.)'
	},
	{
		id: 'loops',
		label: 'Loops on a sphere',
		steps: [
			{ tex: String.raw`\forall\gamma:\ \gamma\ \text{shrinks to a point}`, rule: -1, note: 'Start: “every loop \\(\\gamma\\) on the sphere can be shrunk to a point.”' },
			{ tex: String.raw`\hole{\neg}\big(\forall\gamma:\ \gamma\ \text{shrinks to a point}\big)`, rule: -1, note: 'Negate the whole statement.' },
			{ tex: String.raw`\cyc{\exists\gamma}:\ \hole{\neg}\big(\gamma\ \text{shrinks to a point}\big)`, rule: 0, note: '“Not every” becomes “some … not”.' }
		],
		english: 'There is a loop on the sphere that cannot be shrunk to a point. (Not “no loop can be shrunk” — that is a much stronger, different claim.)'
	},
	{
		id: 'squares',
		label: 'Even squares',
		steps: [
			{ tex: String.raw`\forall n:\ \big(n\ \text{even}\Rightarrow n^2\ \text{even}\big)`, rule: -1, note: 'Start: “if \\(n\\) is even then \\(n^2\\) is even,” for every integer \\(n\\).' },
			{ tex: String.raw`\hole{\neg}\Big(\forall n:\ \big(n\ \text{even}\Rightarrow n^2\ \text{even}\big)\Big)`, rule: -1, note: 'Negate the whole statement.' },
			{ tex: String.raw`\cyc{\exists n}:\ \hole{\neg}\big(n\ \text{even}\Rightarrow n^2\ \text{even}\big)`, rule: 0, note: 'Push \\(\\neg\\) past the quantifier.' },
			{ tex: String.raw`\exists n:\ \big(n\ \text{even}\ \cyc{\wedge}\ \hole{\neg}(n^2\ \text{even})\big)`, rule: 4, note: 'A promise is broken exactly when the “if” holds and the “then” fails.' },
			{ tex: String.raw`\exists n:\ \big(n\ \text{even}\ \wedge\ \cyc{n^2\ \text{odd}}\big)`, rule: 5, note: 'Not even means odd.' }
		],
		english: 'There is an even number whose square is odd. (False — so the original statement is true.)'
	},
	{
		id: 'both',
		label: 'Both positive',
		steps: [
			{ tex: String.raw`x>0\ \wedge\ y>0`, rule: -1, note: 'Start: “\\(x\\) and \\(y\\) are both positive.”' },
			{ tex: String.raw`\hole{\neg}\big(x>0\ \wedge\ y>0\big)`, rule: -1, note: 'Negate it.' },
			{ tex: String.raw`\hole{\neg}(x>0)\ \cyc{\vee}\ \hole{\neg}(y>0)`, rule: 2, note: 'De Morgan: “not both” means “at least one fails”.' },
			{ tex: String.raw`\cyc{x\le0}\ \vee\ \cyc{y\le0}`, rule: 5, note: 'Negate each basic fact: not \\(>\\) is \\(\\le\\).' }
		],
		english: 'At least one of \\(x\\), \\(y\\) is zero or negative. (Not “both are negative”!)'
	},
	{
		id: 'continuity',
		label: 'Continuity (boss level)',
		steps: [
			{
				tex: String.raw`\forall\varepsilon>0\ \exists\delta>0\ \forall x:\ \big(\abs{x-a}<\delta\Rightarrow\abs{f(x)-f(a)}<\varepsilon\big)`,
				rule: -1,
				note: 'Start: the definition of “\\(f\\) is continuous at \\(a\\).” You do not need to understand it yet — just push the \\(\\neg\\) through.'
			},
			{
				tex: String.raw`\hole{\neg}\Big(\forall\varepsilon>0\ \exists\delta>0\ \forall x:\ \big(\abs{x-a}<\delta\Rightarrow\abs{f(x)-f(a)}<\varepsilon\big)\Big)`,
				rule: -1,
				note: 'Negate the whole statement.'
			},
			{
				tex: String.raw`\cyc{\exists\varepsilon>0}\ \hole{\neg}\Big(\exists\delta>0\ \forall x:\ \big(\abs{x-a}<\delta\Rightarrow\abs{f(x)-f(a)}<\varepsilon\big)\Big)`,
				rule: 0,
				note: 'Flip \\(\\forall\\varepsilon\\) to \\(\\exists\\varepsilon\\). The condition \\(\\varepsilon>0\\) stays as it is!'
			},
			{
				tex: String.raw`\exists\varepsilon>0\ \cyc{\forall\delta>0}\ \hole{\neg}\Big(\forall x:\ \big(\abs{x-a}<\delta\Rightarrow\abs{f(x)-f(a)}<\varepsilon\big)\Big)`,
				rule: 1,
				note: 'Flip \\(\\exists\\delta\\) to \\(\\forall\\delta\\).'
			},
			{
				tex: String.raw`\exists\varepsilon>0\ \forall\delta>0\ \cyc{\exists x}:\ \hole{\neg}\big(\abs{x-a}<\delta\Rightarrow\abs{f(x)-f(a)}<\varepsilon\big)`,
				rule: 0,
				note: 'Flip \\(\\forall x\\) to \\(\\exists x\\).'
			},
			{
				tex: String.raw`\exists\varepsilon>0\ \forall\delta>0\ \exists x:\ \big(\abs{x-a}<\delta\ \cyc{\wedge}\ \abs{f(x)-f(a)}\cyc{\ge}\varepsilon\big)`,
				rule: 4,
				note: 'Negate the promise: its “if” holds and its “then” fails.'
			}
		],
		english: 'There is a tolerance \\(\\varepsilon>0\\) such that, however small you choose \\(\\delta>0\\), some \\(x\\) within \\(\\delta\\) of \\(a\\) has \\(f(x)\\) at least \\(\\varepsilon\\) away from \\(f(a)\\): “\\(f\\) jumps at \\(a\\).”'
	}
];
