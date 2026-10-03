import type { GlossaryEntry } from './types';

const chapter = 'prelude/reading-math';

export const entries: GlossaryEntry[] = [
	{
		key: 'statement',
		term: 'Statement',
		def: 'A sentence that is definitely true or definitely false, such as “7 is prime”. “\\(x>3\\)” becomes a statement only once we know which \\(x\\) is meant.',
		chapter,
		anchor: 'logic',
		see: ['universal-quantifier']
	},
	{
		key: 'definition',
		term: 'Definition',
		def: 'A precise membership test that introduces a new word. By an almost-universal convention, definitions are written with “if” but mean “if and only if”.',
		chapter,
		anchor: 'building-blocks',
		see: ['theorem']
	},
	{
		key: 'theorem',
		term: 'Theorem, proposition, lemma, corollary',
		def: 'True statements with proofs, labelled by importance: a *theorem* is a major result, a *proposition* a lesser one, a *lemma* a stepping stone, a *corollary* a quick consequence.',
		chapter,
		anchor: 'building-blocks',
		see: ['proof', 'hypothesis']
	},
	{
		key: 'hypothesis',
		term: 'Hypothesis and conclusion',
		def: 'In “if [hypotheses], then [conclusion]”, the hypotheses are what may be assumed and the conclusion is what follows. A theorem may be used only when all its hypotheses are checked.',
		chapter,
		anchor: 'building-blocks',
		see: ['implication']
	},
	{
		key: 'proof',
		term: 'Proof',
		def: 'An argument, each step justified by definitions, earlier results or logic, that convinces a careful skeptic. Its end is marked ∎.',
		chapter,
		anchor: 'proofs',
		see: ['proof-by-contradiction', 'induction']
	},
	{
		key: 'conjunction',
		term: 'And, or, not (∧, ∨, ¬)',
		def: '\\(P\\wedge Q\\) holds when both hold; \\(P\\vee Q\\) when at least one holds (“or” is inclusive); \\(\\neg P\\) when \\(P\\) fails. De Morgan: \\(\\neg(P\\wedge Q)\\equiv\\neg P\\vee\\neg Q\\).',
		chapter,
		anchor: 'logic',
		see: ['negation']
	},
	{
		key: 'implication',
		term: 'Implication (⇒)',
		def: '\\(P\\Rightarrow Q\\), “if \\(P\\) then \\(Q\\)”: a promise that is broken only when \\(P\\) is true and \\(Q\\) is false. Also read “\\(P\\) only if \\(Q\\)”, “\\(P\\) is sufficient for \\(Q\\)”.',
		chapter,
		anchor: 'logic',
		see: ['vacuous-truth', 'converse', 'contrapositive']
	},
	{
		key: 'vacuous-truth',
		term: 'Vacuous truth',
		def: 'An implication whose hypothesis is false is true, because its promise cannot be broken. So “every element of \\(\\varnothing\\) is purple” is true.',
		chapter,
		anchor: 'logic',
		see: ['implication']
	},
	{
		key: 'converse',
		term: 'Converse',
		def: 'The converse of \\(P\\Rightarrow Q\\) is \\(Q\\Rightarrow P\\). It is a different statement and may be false when the original is true.',
		chapter,
		anchor: 'logic',
		see: ['contrapositive']
	},
	{
		key: 'contrapositive',
		term: 'Contrapositive',
		def: 'The contrapositive of \\(P\\Rightarrow Q\\) is \\(\\neg Q\\Rightarrow\\neg P\\). It always says the same thing as the original — which is how invariants prove that two shapes are different.',
		chapter,
		anchor: 'logic',
		see: ['converse', 'implication']
	},
	{
		key: 'if-and-only-if',
		term: 'If and only if (⇔, iff)',
		def: '\\(P\\iff Q\\) means \\(P\\Rightarrow Q\\) and \\(Q\\Rightarrow P\\): the two statements are equivalent, each necessary and sufficient for the other.',
		chapter,
		anchor: 'logic',
		see: ['implication']
	},
	{
		key: 'universal-quantifier',
		term: 'For all (∀)',
		def: '\\(\\forall x\\), “for every \\(x\\)”. To prove a ∀-statement, argue for an arbitrary \\(x\\); to disprove it, one counterexample is enough.',
		chapter,
		anchor: 'quantifiers',
		see: ['existential-quantifier', 'counterexample']
	},
	{
		key: 'existential-quantifier',
		term: 'There exists (∃, ∃!)',
		def: '\\(\\exists x\\), “there is at least one \\(x\\)”; \\(\\exists!\\,x\\), “there is exactly one”. The order of quantifiers matters: \\(\\forall x\\,\\exists y\\) lets \\(y\\) depend on \\(x\\).',
		chapter,
		anchor: 'quantifiers',
		see: ['universal-quantifier']
	},
	{
		key: 'counterexample',
		term: 'Counterexample',
		def: 'A single case in which a “for all” statement fails. One counterexample disproves it; no number of examples proves it.',
		chapter,
		anchor: 'quantifiers',
		see: ['universal-quantifier']
	},
	{
		key: 'negation',
		term: 'Negation',
		def: 'The statement that says the opposite. Push \\(\\neg\\) inward: \\(\\neg\\forall\\) becomes \\(\\exists\\neg\\), \\(\\neg\\exists\\) becomes \\(\\forall\\neg\\), and \\(\\neg(P\\Rightarrow Q)\\) becomes \\(P\\wedge\\neg Q\\).',
		chapter,
		anchor: 'negation',
		see: ['conjunction', 'universal-quantifier']
	},
	{
		key: 'proof-by-contrapositive',
		term: 'Proof by contrapositive',
		def: 'Proving \\(P\\Rightarrow Q\\) by proving the equivalent \\(\\neg Q\\Rightarrow\\neg P\\) instead.',
		chapter,
		anchor: 'proofs',
		see: ['contrapositive', 'proof']
	},
	{
		key: 'proof-by-contradiction',
		term: 'Proof by contradiction',
		def: 'Assume the statement is false and derive an impossibility; then the statement must be true. Classic example: \\(\\sqrt2\\) is irrational.',
		chapter,
		anchor: 'proofs',
		see: ['proof']
	},
	{
		key: 'double-inclusion',
		term: 'Double inclusion',
		def: 'To show two sets are equal, show every element of the first is in the second and every element of the second is in the first: \\(A\\subseteq B\\) and \\(B\\subseteq A\\).',
		chapter,
		anchor: 'proofs',
		see: ['proof']
	},
	{
		key: 'induction',
		term: 'Induction',
		def: 'To prove a statement for all \\(n = 1,2,3,\\dots\\): prove it for \\(n=1\\) (base case) and show that truth for \\(n\\) implies truth for \\(n+1\\) (inductive step). Like a row of falling dominoes.',
		chapter,
		anchor: 'proofs',
		see: ['proof']
	},
	{
		key: 'well-defined',
		term: 'Well-defined',
		def: 'A rule is well defined when it gives one unambiguous answer, however its input is presented. A rule on equivalence classes, \\(f([x]) = F(x)\\), is well defined when equivalent representatives give the same answer.',
		chapter,
		anchor: 'proofs',
		see: ['proof']
	},
	{
		key: 'defined-as',
		term: 'Defined as (:=)',
		def: '\\(A := B\\) means “\\(A\\) is defined to be \\(B\\)”: not a claim but the introduction of a new name.',
		chapter,
		anchor: 'sameness'
	},
	{
		key: 'push-forward-pull-back',
		term: 'Subscripts push forward, superscripts pull back',
		def: 'Along a map \\(f\\colon X\\to Y\\), points travel forward and measurements travel backward (\\(g\\mapsto g\\circ f\\)). Homology uses lower indices and \\(f_*\\); cohomology uses upper indices and \\(f^*\\).',
		chapter,
		anchor: 'sameness'
	}
];
