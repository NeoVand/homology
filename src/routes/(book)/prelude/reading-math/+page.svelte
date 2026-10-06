<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	import Definition from '$lib/components/prose/Definition.svelte';
	import Theorem from '$lib/components/prose/Theorem.svelte';
	import Proposition from '$lib/components/prose/Proposition.svelte';
	import Proof from '$lib/components/prose/Proof.svelte';
	import Example from '$lib/components/prose/Example.svelte';
	import Intuition from '$lib/components/prose/Intuition.svelte';
	import KeyIdea from '$lib/components/prose/KeyIdea.svelte';
	import Warning from '$lib/components/prose/Warning.svelte';
	import Remark from '$lib/components/prose/Remark.svelte';
	import Question from '$lib/components/prose/Question.svelte';
	import Recap from '$lib/components/prose/Recap.svelte';
	import Exercise from '$lib/components/prose/Exercise.svelte';
	import Figure from '$lib/components/prose/Figure.svelte';
	import Term from '$lib/components/prose/Term.svelte';
	import Ref from '$lib/components/prose/Ref.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import FormulaDecoder from '$lib/figures/prelude/reading-math/FormulaDecoder.svelte';
	import QuantifierDuel from '$lib/figures/prelude/reading-math/QuantifierDuel.svelte';
	import NegationMachine from '$lib/figures/prelude/reading-math/NegationMachine.svelte';
	import PromiseCards from '$lib/figures/prelude/reading-math/PromiseCards.svelte';
	import WasonCards from '$lib/figures/prelude/reading-math/WasonCards.svelte';
	import SymbolAtlas from '$lib/figures/prelude/reading-math/SymbolAtlas.svelte';
	import SamenessLadder from '$lib/figures/prelude/reading-math/SamenessLadder.svelte';
	import PushPull from '$lib/figures/prelude/reading-math/PushPull.svelte';
	import InductionSquares from '$lib/figures/prelude/reading-math/InductionSquares.svelte';

	const reading = [
		{
			title: 'Book of Proof, Chapters 2 and 4–10',
			author: 'Richard Hammack',
			url: 'https://richardhammack.github.io/BookOfProof/',
			note: 'Logic, quantifiers and every proof shape in this chapter (direct, contrapositive, contradiction, induction), explained slowly with many exercises. The best free companion to this chapter.',
			kind: 'book' as const,
			free: true
		},
		{
			title: 'How to Prove It: A Structured Approach',
			author: 'Daniel J. Velleman',
			url: 'https://www.cambridge.org/core/books/how-to-prove-it/6D2965D625C6836CD4A785A2C843B3DA',
			note: 'Teaches proofs by analysing the logical form of statements — exactly the skill of the quantifier and negation sections, developed in depth.',
			kind: 'book' as const
		},
		{
			title: 'Reading Mathematics (Mathematical Communication)',
			author: 'MAA Mathematical Communication project',
			url: 'https://mathcomm.org/writing/reading-mathematics/',
			note: 'A gathering of advice on reading mathematics, including Simonson and Gouvêa’s essay “How to Read Mathematics” (“don’t miss the big picture”, “make the idea your own”).',
			kind: 'web' as const,
			free: true
		},
		{
			title: 'Proofs: A Long-Form Mathematics Textbook',
			author: 'Jay Cummings',
			url: 'https://longformmath.com/proofs-book/',
			note: 'A friendly, chatty introduction to proofs that shows the “scratch work” behind each one — how proofs are found, not just how they are written.',
			kind: 'book' as const
		},
		{
			title: 'There’s more to mathematics than rigour and proofs',
			author: 'Terence Tao',
			url: 'https://terrytao.wordpress.com/career-advice/theres-more-to-mathematics-than-rigour-and-proofs/',
			note: 'The three stages of mathematical education — pre-rigorous, rigorous, post-rigorous — and why rigour should sharpen intuition, not replace it.',
			kind: 'web' as const,
			free: true
		},
		{
			title: 'On proof and progress in mathematics',
			author: 'William P. Thurston',
			url: 'https://arxiv.org/abs/math/9404236',
			note: 'A great mathematician on what it means to understand mathematics, and the many ways people think about the same idea.',
			kind: 'paper' as const,
			free: true
		}
	];
</script>

<Epigraph author="Paul Halmos" source="I Want to Be a Mathematician (1985)">Don’t just read it; fight it! Ask your own question, look for your own examples, discover your own proofs.</Epigraph>

<p class="lead">
	Mathematics is written in a language of its own: a few hundred symbols, a few dozen stock phrases, and a very precise logic.
	None of it is hard, but it is dense. A single line such as \(H_n(X) = \ker\partial_n/\im\partial_{n+1}\) — the formula this
	whole book is travelling towards — packs in a paragraph of meaning. This chapter is your phrasebook and survival guide. You do
	not need to memorize it; come back whenever a symbol or a sentence stops you.
</p>

<Ahead>
	<p>
		Every chapter is written in this language, and three items in particular will carry real weight later. The
		<strong>contrapositive</strong> is how all of algebraic topology tells shapes apart: “if two shapes were the same, their holes
		would match; their holes do not match; so the shapes are different” (<Ref to="homology/invariance" />). The
		<strong>well-defined</strong> check is the safety test behind every construction with classes (<Ref
			to="foundations/equivalence"
		/>). And the reflex <strong>subscripts push forward, superscripts pull back</strong> is the difference between homology
		(Part III) and cohomology (Part IV).
	</p>
</Ahead>

<h2 id="building-blocks">What a page of mathematics is made of</h2>

<p>
	A page of a novel is a stream of sentences. A page of mathematics is built from a handful of standard blocks, each with a
	label, and each with a different job. Knowing the job tells you how to read the block.
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th>Block</th><th>Its job</th><th>How to read it</th></tr></thead>
		<tbody>
			<tr><td><strong>Definition</strong></td><td>Introduces a new word by saying exactly which things qualify.</td><td>Slowly. Find an example and a non-example before moving on.</td></tr>
			<tr><td><strong>Theorem</strong></td><td>An important true statement, with a proof.</td><td>Separate the hypotheses (what is assumed) from the conclusion (what follows).</td></tr>
			<tr><td><strong>Proposition</strong></td><td>A true statement of medium importance.</td><td>Like a theorem, but less famous.</td></tr>
			<tr><td><strong>Lemma</strong></td><td>A stepping stone: a result proved mainly to help prove something else.</td><td>Ask what it is for; look ahead to where it is used.</td></tr>
			<tr><td><strong>Corollary</strong></td><td>A quick consequence of a theorem just proved.</td><td>Check that you can see why it follows.</td></tr>
			<tr><td><strong>Proof</strong></td><td>The argument that a statement is true. Ends with ∎.</td><td>Line by line, with a pencil. Every step should be justified.</td></tr>
			<tr><td><strong>Example / Non-example</strong></td><td>A specific object that does (or does not) satisfy a definition.</td><td>Check it yourself against the definition.</td></tr>
			<tr><td><strong>Remark</strong></td><td>A comment: context, warnings, connections.</td><td>Optional on a first reading, often illuminating on a second.</td></tr>
		</tbody>
	</table>
</div>

<p>
	The words “theorem,” “proposition” and “lemma” describe the <em>importance</em> of a result, not its kind: all three are true
	statements with proofs. In this book each block lives in its own coloured box, so you can always see what kind of sentence you
	are reading.
</p>

<h3>Definitions are membership tests</h3>

<p>
	A mathematical definition is not a vague description; it is a <em>test</em>. Each clause is a box to tick, and an object
	qualifies exactly when every box is ticked. Here is a definition you have known since childhood, written the way a mathematician
	would write it.
</p>

<Definition title="Even number" id="def-even">
	<p>An integer \(n\) is <dfn>even</dfn> if \(n = 2k\) for some integer \(k\).</p>
</Definition>

<p>
	Run some objects through the test. Is \(6\) even? Yes: \(6 = 2\cdot 3\), and \(3\) is an integer. Is \(7\)? No integer \(k\)
	has \(2k = 7\) (the only solution, \(3.5\), is not an integer). Is \(0\) even? Yes, \(0 = 2\cdot0\) — something people often
	doubt, but the definition settles it. Is \(-4\) even? Yes, \(-4 = 2\cdot(-2)\). The most instructive cases are the
	<em>non-examples</em> that almost qualify: they show you what each clause is for.
</p>

<p>
	There is one convention you must know. Read literally, “\(n\) is even <em>if</em> \(n = 2k\)” only says that numbers of the
	form \(2k\) are even; it does not seem to say that every even number has this form. But it is meant both ways. As Richard
	Hammack puts it in <em>Book of Proof</em>, “it is an almost-universal convention that definitions are phrased in the conditional
	form, even though they are interpreted as being in the biconditional form.” In a definition, “if” means “if and only if.”
</p>

<h3>Theorems have hypotheses and a conclusion</h3>

<p>
	Most theorems have the shape “<em>if</em> [hypotheses], <em>then</em> [conclusion].” The hypotheses are what you are allowed to
	assume; the conclusion is what you get. You can take a theorem apart this way even when you do not understand its words. For
	example, a theorem from topology says:
</p>

<Theorem>
	<p>If \(f\colon X\to Y\) is continuous and \(X\) is compact, then \(f(X)\) is compact.</p>
</Theorem>

<p>
	You do not yet know what “continuous” or “compact” mean (that is <Ref to="topology/spaces" />), yet you can already say: there
	are two hypotheses, “\(f\) is continuous” and “\(X\) is compact,” and one conclusion, “\(f(X)\) is compact.” Before you can use a
	theorem, you must check <em>all</em> of its hypotheses. Halmos’s questions are worth asking every time: is each hypothesis
	really necessary, and where does the proof use it?
</p>

<h2 id="logic">The logic of mathematical sentences</h2>

<p>
	A <dfn>statement</dfn> is a sentence that is definitely true or definitely false. “\(7\) is a prime number” is a true statement;
	“\(2+2=5\)” is a false one. “\(x>3\)” is not yet a statement — its truth depends on \(x\) — but it becomes one as soon as \(x\)
	is known, or as soon as we say “for every \(x\)” or “for some \(x\)” in front of it (the subject of the next section).
	Statements are combined with a few small words, and mathematics gives each of them an exact meaning.
</p>

<h3>And, or, not</h3>

<ul>
	<li>
		“\(P\) <strong>and</strong> \(Q\),” written \(P\wedge Q\), is true when both \(P\) and \(Q\) are true. (The symbol \(\wedge\)
		looks like an A, for “and.”)
	</li>
	<li>
		“\(P\) <strong>or</strong> \(Q\),” written \(P\vee Q\), is true when at least one of them is true — <em>including</em> when both
		are. This is the <em>inclusive</em> or. In everyday speech, “tea or coffee?” usually means one or the other, not both; in
		mathematics “or” always allows both.
	</li>
	<li>“<strong>not</strong> \(P\),” written \(\neg P\), is true exactly when \(P\) is false.</li>
</ul>

<p>
	Negating “and” and “or” follows two rules called De Morgan’s laws: “not (\(P\) and \(Q\))” means “not \(P\), or not \(Q\)” — at
	least one fails — and “not (\(P\) or \(Q\))” means “not \(P\), and not \(Q\)” — both fail. If someone says “it is not true that I
	speak French and German,” they might speak neither, or only one.
</p>

<h3>If … then: an implication is a promise</h3>

<p>
	The most important little word in mathematics is “if.” The statement “if \(P\) then \(Q\),” written \(P\Rightarrow Q\) and read
	“\(P\) implies \(Q\),” is best understood as a <em>promise</em>: whenever \(P\) happens, \(Q\) will happen too. A promise is
	broken in exactly one situation — when \(P\) happens and \(Q\) does not. In every other situation the promise is kept.
</p>

<Figure title="Promises kept and broken" hint="Judge each situation · then compare the columns" num="0.2.1">
	<PromiseCards />
	{#snippet caption()}
		The promise \(P\Rightarrow Q\) in four situations. Only the second card breaks it. The last two — no rain at all — keep it
		automatically: the promise said nothing about dry days. Add the columns for the converse \(Q\Rightarrow P\) and the
		contrapositive \(\neg Q\Rightarrow\neg P\): the contrapositive agrees with the promise in every row, the converse does not.
	{/snippet}
</Figure>

<p>
	The last two cards are the ones people find strange. If it does not rain, the promise “if it rains, I bring an umbrella” cannot
	have been broken, whatever I did. In logic, “not broken” counts as true. A statement \(P\Rightarrow Q\) whose hypothesis \(P\) is
	false is called <dfn>vacuously true</dfn>. So “if \(2+2 = 5\), then the Moon is made of cheese” is a true statement — a
	silly one, but true.
</p>

<p>
	This convention is not a trick; it is exactly what mathematics needs. Consider “every element of the empty set is purple.” Is it
	true? It says: for every \(x\), if \(x\) is in the empty set, then \(x\) is purple. Since nothing is in the empty set, the “if”
	is never satisfied, and the promise is never broken. So the statement is (vacuously) true — and so is every statement of the
	form “every element of the empty set has property such-and-such.” This will matter: the empty set, and the empty shape, have
	all properties of this kind.
</p>

<p>There are many ways to say \(P\Rightarrow Q\) in words, and you will meet all of them:</p>

<ul>
	<li>if \(P\), then \(Q\); \(\quad Q\) if \(P\); \(\quad Q\) whenever \(P\);</li>
	<li>\(P\) implies \(Q\); \(\quad P\) only if \(Q\);</li>
	<li>\(P\) is <em>sufficient</em> for \(Q\); \(\quad Q\) is <em>necessary</em> for \(P\).</li>
</ul>

<p>
	“\(P\) only if \(Q\)” trips everyone up at first: it means that \(P\) cannot happen without \(Q\), which is the same promise as
	\(P\Rightarrow Q\).
</p>

<h3>Converse and contrapositive</h3>

<p>Every implication \(P\Rightarrow Q\) has two famous relatives:</p>

<ul>
	<li>its <dfn>converse</dfn>, \(Q\Rightarrow P\), which swaps the two sides;</li>
	<li>its <dfn>contrapositive</dfn>, \(\neg Q\Rightarrow\neg P\), which swaps them <em>and</em> negates both.</li>
</ul>

<Example title="One true statement, two relatives">
	<p>
		<strong>Statement:</strong> if \(n\) is divisible by \(4\), then \(n\) is even. True: \(n = 4k = 2(2k)\).
	</p>
	<p>
		<strong>Converse:</strong> if \(n\) is even, then \(n\) is divisible by \(4\). False: \(6\) is even but not divisible by \(4\).
	</p>
	<p>
		<strong>Contrapositive:</strong> if \(n\) is not even (odd), then \(n\) is not divisible by \(4\). True — and it must be,
		because it says exactly the same thing as the statement.
	</p>
</Example>

<Question title="Check yourself: which says the same thing?">
	<p>
		Take the statement “every square is a rectangle” — that is, “if a shape is a square, then it is a rectangle.” Which of these
		says the same thing? (a) Every rectangle is a square. (b) Anything that is not a rectangle is not a square. (c) Anything that is
		not a square is not a rectangle. Only (b), the contrapositive. Statement (a) is the converse, and (c) is the contrapositive of the
		converse; both are false (think of a long thin rectangle).
	</p>
</Question>

<p>
	An implication and its contrapositive are always both true or both false: “every \(P\) is a \(Q\)” and “anything that is not a
	\(Q\) is not a \(P\)” are the same promise, seen from opposite ends. The converse is a different promise altogether, and it can
	fail even when the original holds. Confusing a statement with its converse is the single most common error in reasoning, in and
	out of mathematics. Try the next puzzle before reading its explanation.
</p>

<Figure title="Which cards must you turn over?" hint="Tap the cards you would turn · then check" num="0.2.2">
	<WasonCards />
	{#snippet caption()}
		A version of the psychologist Peter Wason’s selection task (1966). The rule is a promise \(P\Rightarrow Q\) with \(P\) =
		“even” and \(Q\) = “gold.” Only two cards can break it: the even card (check \(P\Rightarrow Q\)) and the violet card (check the
		contrapositive, “not gold ⇒ not even”). Turning the gold card tests the converse, which nobody promised.
	{/snippet}
</Figure>

<KeyIdea>
	<p>
		<strong>The contrapositive is how <Term t="invariant">invariants</Term> work.</strong> Much of this book proves theorems of the shape “if two spaces are the
		same shape, then they have the same number of holes (of each dimension).” Its contrapositive is the useful part: “if two spaces
		have different numbers of holes, then they are not the same shape.” That is how we will prove, beyond doubt, that a sphere is not
		a doughnut. But beware the converse, “same holes ⇒ same shape,” which is false: a single point and a solid disk have no holes of
		any kind, yet a point is not a disk.
	</p>
</KeyIdea>

<h3>If and only if</h3>

<p>
	When a promise holds in both directions — \(P\Rightarrow Q\) and \(Q\Rightarrow P\) — we write \(P\iff Q\) and say “\(P\) if and
	only if \(Q\),” often shortened to “\(P\) iff \(Q\).” It means \(P\) and \(Q\) are true in exactly the same situations: they are
	<em>equivalent</em>, and each is both necessary and sufficient for the other. To prove an “iff,” you prove two implications, one
	in each direction; proofs often label them (\(\Rightarrow\)) and (\(\Leftarrow\)).
</p>

<h2 id="quantifiers">Quantifiers: for all, there exists</h2>

<p>
	A sentence like “\(x^2\ge0\)” becomes a statement once we say <em>which</em> \(x\) we mean. Two symbols do almost all of this work.
</p>

<ul>
	<li>
		\(\forall\), read “<strong>for all</strong>” or “for every” (an upside-down A, for <em>all</em>). “\(\forall x\in\R,\ x^2\ge 0\)”
		says every real number has a non-negative square. True.
	</li>
	<li>
		\(\exists\), read “<strong>there exists</strong>” or “for some” (a backwards E, for <em>exists</em>). “\(\exists x\in\Z,\ x^2 =
		4\)” says some integer has square \(4\). True: \(x=2\) works (so does \(-2\)). “There exists” means <em>at least one</em>.
	</li>
	<li>
		\(\exists!\), read “there exists exactly one.” “\(\exists! x\in\R,\ x^3 = 8\)” is true (only \(x=2\)), but “\(\exists!
		x\in\R,\ x^2=4\)” is false: there are two.
	</li>
</ul>

<p>
	The phrase “\(\in\R\)” (“in the real numbers”) names the <em>domain</em> the variable ranges over, and it matters: “\(\exists x,\
	x^2 = 2\)” is true over the real numbers (\(x=\sqrt2\)) but false over the fractions, as we prove below.
</p>

<h3>Proving and disproving</h3>

<p>Each quantifier tells you exactly what a proof or a disproof must do:</p>

<ul>
	<li>
		To <strong>prove</strong> “for all \(x\), …”: take an <em>arbitrary</em> \(x\) (“let \(x\) be any real number”) and argue for it
		without using anything special about it. Checking examples, however many, is not a proof.
	</li>
	<li>To <strong>disprove</strong> “for all \(x\), …”: find a single <dfn>counterexample</dfn>, one \(x\) for which it fails.</li>
	<li>To <strong>prove</strong> “there exists \(x\), …”: exhibit one \(x\) that works.</li>
	<li>To <strong>disprove</strong> “there exists \(x\), …”: show that every \(x\) fails — which is a “for all” statement.</li>
</ul>

<Question title="Check yourself: quantifiers over nothing">
	<p>
		Is “for every \(x\) in the empty set, \(x\neq x\)” true? It is the promise “if \(x\) is in the empty set, then \(x\neq x\),”
		and nothing is ever in the empty set, so the promise is never broken: true, vacuously. And “there exists \(x\) in the empty set
		with \(x=x\)” is false, because there is nothing to exhibit. Over the empty set every “for all” statement is true and every
		“there exists” statement is false.
	</p>
</Question>

<h3>Order matters</h3>

<p>
	When a sentence has several quantifiers, their order changes its meaning completely. Compare: “everyone has a mother” and “there is
	someone who is everyone’s mother.” In symbols, with \(x\) and \(y\) ranging over people:
</p>
\[ \forall x\ \exists y:\ y \text{ is the mother of } x \qquad\text{versus}\qquad \exists y\ \forall x:\ y\text{ is the mother of } x. \]
<p>
	The first is true; the second is absurd. The difference is <em>who chooses first</em>. In the first, \(y\) is chosen after \(x\),
	so it may depend on \(x\) — each person has their own mother. In the second, one \(y\) must be chosen before seeing any \(x\), and
	it must work for all of them.
</p>

<p>
	This is best understood as a game. You play \(\exists\): your job is to find the values that make the statement true. A Skeptic
	plays \(\forall\): their job is to choose values that make it false. The quantifiers, read left to right, say who moves when. The
	statement is true exactly when you have a strategy that always wins.
</p>

<Figure title="The quantifier duel" hint="Play several rounds · then swap the order of the quantifiers" num="0.2.3">
	<QuantifierDuel />
	{#snippet caption()}
		With \(\forall x\ \exists y\), the Skeptic chooses \(x\) first and you reply — and you can always win, with \(y=-x\). With
		\(\exists y\ \forall x\), you must commit to \(y\) first, and the Skeptic always finds an \(x\) that defeats it. Same symbols,
		different order, opposite truth values. (Try the property \(y>x\) too: there is no largest integer.)
	{/snippet}
</Figure>

<Remark title="Why this matters later">
	<p>
		Some of the most important definitions in mathematics are long chains of alternating quantifiers. The definition of
		continuity, “\(\forall\varepsilon>0\ \exists\delta>0\ \forall x\ \dots\)”, is a three-move game between you and a Skeptic. Once
		you see quantifiers as moves in a game, such definitions stop being frightening.
	</p>
</Remark>

<h3 id="negation">Negating a statement, mechanically</h3>

<p>
	To disprove a statement, you prove its negation. So you need to be able to write the negation of a complicated statement, and do
	it reliably. The good news is that it is completely mechanical: write “not” in front, then push it inward one step at a time
	using a handful of rules. Each time “not” passes a quantifier, the quantifier flips:
</p>
\[ \neg\,\forall x\,P(x)\ \equiv\ \exists x\,\neg P(x), \qquad \neg\,\exists x\,P(x)\ \equiv\ \forall x\,\neg P(x). \]
<p>
	(The symbol \(\equiv\) here means “says the same thing as.”) “Not everyone passed” means “someone did not pass”; “nobody passed” —
	“there is no one who passed” — means “everyone failed.” When “not” passes “and,” “or,” or “if … then,” it uses De Morgan’s laws
	and the broken-promise rule \(\neg(P\Rightarrow Q)\equiv P\wedge\neg Q\).
</p>

<Figure title="The negation machine" hint="Step through · choose another statement" num="0.2.4">
	<NegationMachine />
	{#snippet caption()}
		The \(\hole{\neg}\) moves inward one step at a time; each step uses one rule (lit up below), and what just changed is shown in
		gold. Notice in the “boss level” that negating “\(\forall\varepsilon>0\)” gives “\(\exists\varepsilon>0\)”: the condition
		\(\varepsilon>0\) stays exactly as it was.
	{/snippet}
</Figure>

<Warning title="Three classic mistakes">
	<ul>
		<li>
			The negation of “every loop can be shrunk” is “<em>some</em> loop cannot be shrunk,” not “no loop can be shrunk.” The second
			is much stronger.
		</li>
		<li>
			The negation of “if \(P\) then \(Q\)” is “\(P\) and not \(Q\)” — the promise was made and broken — not “if \(P\) then not
			\(Q\).”
		</li>
		<li>The negation of “\(x\) and \(y\) are both positive” is “at least one of them is not positive,” not “both are negative.”</li>
	</ul>
</Warning>

<h2 id="proofs">The shapes of proofs</h2>

<p>
	A proof is an argument that would convince a careful, skeptical reader, in which every step follows from definitions, from results
	already proved, or from logic. Henri Poincaré put the division of labour well: “It is by logic that we prove, but by intuition that
	we discover.” Finding a proof is an act of imagination; writing it down is an act of logic. Most proofs you will meet in this book
	have one of six shapes, and recognizing the shape is half of understanding the proof.
</p>

<h3>Direct proof</h3>

<p>To prove \(P\Rightarrow Q\): assume \(P\), and reason forward until you reach \(Q\).</p>

<Proposition id="prop-even-square">
	{#snippet head()}If \(n\) is even, then \(n^2\) is even{/snippet}
	<p>For every integer \(n\): if \(n\) is even, then \(n^2\) is even.</p>
</Proposition>

<Proof>
	<p>
		Assume \(n\) is even. By definition, \(n = 2k\) for some integer \(k\). Then \(n^2 = 4k^2 = 2\,(2k^2)\), and \(2k^2\) is an
		integer, so \(n^2\) is even.
	</p>
</Proof>

<p>
	Notice the move in the first line: we replaced the word “even” by its definition. Unpacking definitions is the first step of
	almost every proof.
</p>

<h3>Proof by contrapositive</h3>

<p>
	To prove \(P\Rightarrow Q\), it is enough to prove the contrapositive \(\neg Q\Rightarrow\neg P\), since the two say the same
	thing. This is useful when “not \(Q\)” gives you something concrete to work with.
</p>

<Proposition id="prop-square-even">
	{#snippet head()}If \(n^2\) is even, then \(n\) is even{/snippet}
	<p>For every integer \(n\): if \(n^2\) is even, then \(n\) is even.</p>
</Proposition>

<Proof>
	<p>
		We prove the contrapositive: if \(n\) is odd, then \(n^2\) is odd. Assume \(n\) is odd, so \(n = 2k+1\) for some integer \(k\).
		Then \(n^2 = 4k^2+4k+1 = 2(2k^2+2k)+1\), which is odd.
	</p>
</Proof>

<p>
	Trying to prove this directly is awkward: knowing that \(n^2\) is even tells you little about \(n\) itself. The contrapositive
	turns the problem around into something easy. Invariants in topology work exactly this way.
</p>

<h3>Proof by contradiction</h3>

<p>
	To prove a statement, assume it is <em>false</em> and derive something impossible. Since logic never leads from truths to
	impossibilities, the assumption must have been wrong.
</p>

<Theorem title="√2 is irrational" id="thm-sqrt2">
	<p>There is no fraction \(\frac ab\) of integers with \(\left(\frac ab\right)^2 = 2\).</p>
</Theorem>

<Proof>
	<p>
		Suppose, for a contradiction, that \(\sqrt2 = \frac ab\) for integers \(a, b\) with \(b\neq0\). Cancelling common factors, we may
		assume the fraction is in lowest terms: \(a\) and \(b\) are not both even. Squaring, \(a^2 = 2b^2\), so \(a^2\) is even. By the
		previous proposition, \(a\) is even: \(a = 2c\). Then \(4c^2 = 2b^2\), so \(b^2 = 2c^2\) is even, and again \(b\) is even. Now
		both \(a\) and \(b\) are even — contradicting lowest terms. So no such fraction exists.
	</p>
</Proof>

<h3>Double inclusion</h3>

<p>
	To show that two collections of objects are the same, show that everything in the first belongs to the second, and everything in
	the second belongs to the first. For instance: <em>the numbers that are sums of two consecutive integers are exactly the odd
	numbers.</em> First direction: \(m + (m+1) = 2m+1\) is odd. Second direction: an odd number \(2k+1\) equals \(k + (k+1)\). Both
	inclusions hold, so the two collections coincide. In <Ref to="foundations/sets-and-functions" /> this becomes the standard way
	to prove two sets equal.
</p>

<h3>Induction</h3>

<p>
	To prove that a statement holds for every natural number \(n = 1, 2, 3,\dots\), it is enough to prove two things: the <em>base
	case</em>, that it holds for \(n = 1\); and the <em>inductive step</em>, that whenever it holds for some \(n\), it also holds for
	\(n+1\). Think of an infinite row of dominoes: the first one falls, and each falling domino knocks over the next. Then all of them
	fall.
</p>

<Figure title="Odd numbers make squares" hint="Slide n" num="0.2.5">
	<InductionSquares />
	{#snippet caption()}
		Each odd number \(2n-1\) is an L-shaped layer that turns an \((n-1)\times(n-1)\) square into an \(n\times n\) square. That
		picture <em>is</em> the inductive step of the proof below.
	{/snippet}
</Figure>

<Proposition id="prop-odd-sum">
	{#snippet head()}The sum of the first \(n\) odd numbers is \(n^2\){/snippet}
	<p>For every \(n\ge1\): \(1+3+5+\dots+(2n-1) = n^2\).</p>
</Proposition>

<Proof>
	<p>
		<em>Base case</em>, \(n=1\): the sum is \(1 = 1^2\). <em>Inductive step</em>: suppose the formula holds for some \(n\), so that
		\(1+3+\dots+(2n-1) = n^2\). Adding the next odd number, \(2(n+1)-1 = 2n+1\), gives \(n^2+2n+1 = (n+1)^2\), which is the formula
		for \(n+1\). By induction, the formula holds for every \(n\).
	</p>
</Proof>

<h3>“Well-defined”</h3>

<p>
	The last shape is not a proof of a theorem but a check on a definition. Sometimes we try to define something by a rule that seems
	to depend on a choice. The rule is <dfn>well-defined</dfn> if it gives one and the same answer whatever choice is made. For
	example, “the numerator of a fraction” is <em>not</em> well-defined: \(\tfrac12\) and \(\tfrac24\) are the same number, but
	their numerators are \(1\) and \(2\). Such checks are everywhere once we start “declaring things the same” in <Ref
		to="foundations/equivalence"
	/>, and every map between homology groups must pass one.
</p>

<h2 id="symbols">A dictionary of symbols</h2>

<p>
	Every symbol is an abbreviation for words, and every formula can be read aloud as a sentence. When you meet a formula, try reading
	it out loud, slowly; if you cannot, find the symbol that stops you. The dictionary below lists the symbols used throughout this
	book, with how to say them and where they are explained (the small § numbers).
</p>

<Figure title="The symbol dictionary" hint="Filter by kind · the § number links to where each symbol is explained" num="0.2.6">
	<SymbolAtlas />
	{#snippet caption()}
		Read each symbol aloud as you meet it. Those under “Coming later” will mean little now; by the end of Part III they will be old
		friends.
	{/snippet}
</Figure>

<h3>Greek letters and their jobs</h3>

<p>
	Mathematicians run out of Latin letters quickly, so Greek ones are everywhere. Each tends to have a typical job, which gives you a
	head start: a \(\gamma\) is probably a path, a \(\sigma\) probably a simplex, an \(\varepsilon\) probably small. Here are the ones
	this book uses, with a common English pronunciation.
</p>

<Figure title="Greek letters by role" num="0.2.7">
	<SymbolAtlas mode="greek" />
	{#snippet caption()}
		Lowercase and (where used) capital forms. These are habits, not laws: a letter can be used for anything, but a writer who uses
		\(\varepsilon\) for a large number is being unkind.
	{/snippet}
</Figure>

<h3>One symbol, several meanings</h3>

<p>
	A few symbols do several different jobs. Context always decides, but it helps to be warned:
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th>Symbol</th><th>Meanings</th></tr></thead>
		<tbody>
			<tr><td>\(f^{-1}\)</td><td>the inverse of a function (only when it has one); the preimage of a set (always); \(1/f\) in calculus</td></tr>
			<tr><td>\(\partial\)</td><td>the boundary map of homology; the boundary of a shape; a partial derivative</td></tr>
			<tr><td>\(\wedge\)</td><td>“and” in logic; the wedge product of differential forms</td></tr>
			<tr><td>\(/\)</td><td>division; a quotient (“modulo”), as in \(\Z/n\) or \(X/{\sim}\)</td></tr>
			<tr><td>\(\mid\)</td><td>“such that” inside braces; “divides,” as in \(3\mid 12\)</td></tr>
			<tr><td>\((a,b)\)</td><td>an ordered pair; an open interval of real numbers</td></tr>
			<tr><td>\(x_1,\ x^2\)</td><td>subscripts are labels (“\(x\) one”); superscripts are often powers (“\(x\) squared”) — but in \(H^n\) a superscript is a label too</td></tr>
		</tbody>
	</table>
</div>

<h2 id="sameness">Sameness, and which way the arrows go</h2>

<p>
	“The same” is the most important and most slippery phrase in mathematics. The equals sign is only the strictest of several
	sameness symbols, and choosing the right notion of sameness is often the whole art of a subject. Topology is the art of choosing a
	very generous one.
</p>

<Figure title="Levels of sameness" num="0.2.8">
	<SamenessLadder />
	{#snippet caption()}
		From strict to loose: equal, isomorphic (for spaces, homeomorphic), homotopy equivalent. Each looser notion forgets more, so
		more things count as the same. The definition sign \(:=\) and the equivalence sign \(\sim\) do different jobs: one names, the
		other declares a chosen kind of sameness.
	{/snippet}
</Figure>

<p>
	The equivalence sign \(\sim\) will be the hero of <Ref to="foundations/equivalence" />, where we learn how to declare things the
	same and what happens when we do. The symbols \(\cong\) and \(\simeq\) are introduced properly in <Ref to="topology/spaces" /> and
	<Ref to="topology/homotopy" />.
</p>

<h3>Subscripts push forward, superscripts pull back</h3>

<p>
	Here is a reflex worth building now, long before it is needed. Suppose \(f\colon X\to Y\) is a function. Two kinds of things can
	be transported along it, and they go in <em>opposite</em> directions.
</p>

<ul>
	<li>
		<strong>Points go forward.</strong> A point \(x\) of \(X\) is carried to the point \(f(x)\) of \(Y\). So is anything built from
		points: a set, a path, a loop.
	</li>
	<li>
		<strong>Measurements come back.</strong> If \(g\) assigns a number to every point of \(Y\) — a temperature, say — then \(g\circ
		f\) assigns a number to every point of \(X\): to measure at \(x\), go to \(f(x)\) and read \(g\) there. The function \(f\) went
		from \(X\) to \(Y\), but the measurement travelled from \(Y\) to \(X\).
	</li>
</ul>

<Figure title="Points forward, measurements back" hint="Switch direction · replay" num="0.2.9">
	<PushPull />
	{#snippet caption()}
		The same map \(f\colon X\to Y\) carries points forward and measurements backward. Homology is built from things made of points
		and uses subscripts, \(H_n\) and \(f_*\); cohomology is built from measurements and uses superscripts, \(H^n\) and \(f^*\).
	{/snippet}
</Figure>

<Intuition title="A reflex for Parts III and IV">
	<p>
		Throughout the book: a <em>lower</em> index means things that are pushed <em>along</em> a map, in its direction (\(C_n,\ H_n,\
		f_*\)); an <em>upper</em> index means measurements that are pulled <em>back</em> against it (\(C^n,\ H^n,\ f^*\)). When you see
		a superscript, expect the arrows to turn around.
	</p>
</Intuition>

<h2 id="reading">How to read a mathematics book</h2>

<p>
	Mathematics is not read like a novel. A page can take as long as a chapter of fiction, and that is not a sign that something is
	wrong. Here is some advice that generations of mathematicians have found useful.
</p>

<ul>
	<li>
		<strong>Fight it.</strong> Paul Halmos’s advice, from the epigraph, continues with a list of questions to ask of every result:
		“Is the hypothesis necessary? Is the converse true? What happens in the classical special case? What about the degenerate cases?
		Where does the proof use the hypothesis?” You now know what every word in those questions means.
	</li>
	<li>
		<strong>Examples first.</strong> When you meet a definition, stop and build an example, and a non-example. When you meet a theorem,
		test it on the simplest case you can think of, and on a silly one (the empty set, a single point).
	</li>
	<li>
		<strong>Keep a pencil.</strong> Redo each computation. Draw the pictures. Fill in the steps the author skipped (“clearly” and
		“it is easy to see” mean “check this yourself”).
	</li>
	<li>
		<strong>Statement before proof.</strong> Make sure you understand <em>what</em> a theorem says, and why anyone would want it,
		before worrying about <em>why</em> it is true. On a first reading it is fine to skip a proof and come back.
	</li>
	<li>
		<strong>Don’t miss the big picture; make the idea your own.</strong> These two pieces of advice come from Shai Simonson and
		Fernando Gouvêa’s essay <em>How to Read Mathematics</em>. Ask where a section is going, and try to say each idea in your own
		words.
	</li>
	<li>
		<strong>Being stuck is normal.</strong> Every mathematician spends most of their time not understanding something. Being stuck
		is not a sign of failure; it is what thinking feels like. Move on, and come back.
	</li>
</ul>

<Remark title="Rigour and intuition">
	<p>
		Terence Tao describes three stages of mathematical education: a <em>pre-rigorous</em> stage of examples and intuition, a
		<em>rigorous</em> stage of precise definitions and proofs, and a <em>post-rigorous</em> stage in which you return to intuition,
		now trustworthy. “The point of rigour is <em>not</em> to destroy all intuition; instead, it should be used to destroy
		<em>bad</em> intuition while clarifying and elevating <em>good</em> intuition.” This book tries to give you both at every step:
		a picture first, then the precise version, then the picture again.
	</p>
</Remark>

<p>
	The book itself is built to help you read it this way. Dotted underlined words open a definition when you hover or tap them;
	links like <Ref to="foundations/equivalence" /> take you to where an idea is explained; every exercise has a hidden solution, which
	you should open only after an honest attempt; and every figure is something to play with, not just to look at.
</p>

<h2 id="destination">A first look at the destination</h2>

<p>
	Here, finally, is the formula at the centre of this book: the definition of <Term t="homology">homology</Term>. In <Ref
		to="prelude/shape-of-a-question"
	/> you saw what its pieces mean. Now read it the way a mathematician does: symbol by symbol, aloud. You are not expected to
	understand it yet — only to <em>read</em> it. Step through it, or hover over any symbol.
</p>

<Figure title="The formula decoder" hint="Hover or tap a symbol · step through · try other formulas" num="0.2.10">
	<FormulaDecoder />
	{#snippet caption()}
		“\(H\) sub \(n\) of \(X\) is the kernel of boundary \(n\), modulo the image of boundary \(n\) plus one.” Each piece names an idea
		with its own chapter: kernel and image (<Ref to="foundations/groups" />), quotients (<Ref to="foundations/equivalence" />), the
		boundary map (<Ref to="homology/chains" />). The other formulas are warm-ups for reading notation aloud.
	{/snippet}
</Figure>

<p>
	Read in words, the formula says: <em>the holes of a shape are the cycles that have no boundary, where two cycles count as the same
	if they differ by a boundary.</em> Every word in that sentence will be given an exact meaning, a picture, and a set of examples
	you can play with. By the end of Part III, \(H_n(X) = \ker\partial_n/\im\partial_{n+1}\) will read as naturally as \(2+2=4\).
</p>

<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Read it aloud">
	<p>Read each line aloud as an English sentence, then say what it means.</p>
	<ol type="a">
		<li>\(f\colon\R\to\R,\ x\mapsto x^2+1\)</li>
		<li>\(\setb{n\in\Z}{n = 3k+1 \text{ for some } k\in\Z}\)</li>
		<li>\(\forall x\in\R\ \ \exists n\in\N:\ n>x\)</li>
	</ol>
	{#snippet solution()}
		<ol type="a">
			<li>“\(f\) from \(\R\) to \(\R\), \(x\) maps to \(x\) squared plus one”: the function that adds one to the square of a real number.</li>
			<li>
				“The set of all integers \(n\) such that \(n\) equals \(3k\) plus \(1\) for some integer \(k\)”: the integers leaving
				remainder \(1\) on division by \(3\), that is \(\set{\dots,-5,-2,1,4,7,\dots}\).
			</li>
			<li>“For every real number \(x\) there is a natural number \(n\) bigger than \(x\)”: there is no real number beyond all the natural numbers. (True.)</li>
		</ol>
	{/snippet}
</Exercise>

<Exercise level={1} title="Hypotheses and conclusion">
	<p>
		“If \(f\colon X\to Y\) is continuous and \(X\) is connected, then \(f(X)\) is connected.” Without knowing what the words mean,
		list the hypotheses and the conclusion. Then write the contrapositive.
	</p>
	{#snippet solution()}
		<p>
			Hypotheses: \(f\colon X\to Y\) is continuous; \(X\) is connected. Conclusion: \(f(X)\) is connected. Contrapositive (keeping
			“\(f\) is continuous” as a standing assumption): if \(f\colon X\to Y\) is continuous and \(f(X)\) is not connected, then
			\(X\) is not connected.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Converse and contrapositive">
	<p>
		Consider: “If a shape is contractible, then every loop in it can be shrunk to a point.” (You do not need to know what
		“contractible” means.) Write the converse and the contrapositive. Which of the two is guaranteed to be true if the original is?
	</p>
	{#snippet solution()}
		<p>
			Converse: “If every loop in a shape can be shrunk to a point, then the shape is contractible.” Contrapositive: “If some loop in a
			shape cannot be shrunk to a point, then the shape is not contractible.” The contrapositive is guaranteed to be true, since it is
			equivalent to the original. The converse is not — and in fact it is false: on a sphere every loop can be shrunk to a point, yet
			the sphere is not contractible (<Ref to="topology/homotopy" />).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Negate">
	<p>Write the negation of each statement, with the “not” pushed all the way in.</p>
	<ol type="a">
		<li>Every loop on the sphere can be shrunk to a point.</li>
		<li>There is a number larger than every integer.</li>
		<li>If it rains, the match is cancelled.</li>
		<li>\(\forall x\in\R\ \exists y\in\R:\ y^2 = x\).</li>
	</ol>
	{#snippet solution()}
		<ol type="a">
			<li>There is a loop on the sphere that cannot be shrunk to a point.</li>
			<li>For every number, there is an integer at least as large as it. (Not “there is no number…”, which is the same thing said less usefully.)</li>
			<li>It rains and the match is not cancelled.</li>
			<li>
				\(\exists x\in\R\ \forall y\in\R:\ y^2\neq x\). This negation is true (take \(x=-1\)), so the original statement was false.
			</li>
		</ol>
	{/snippet}
</Exercise>

<Exercise level={1} title="Vacuous truth">
	<p>True or false? (a) Every element of the empty set is purple. (b) If \(2+2=5\), then \(1=1\). (c) If \(1=1\), then \(2+2=5\).</p>
	{#snippet solution()}
		<p>
			(a) True, vacuously: there is no element to check. (b) True: the hypothesis is false, so the promise cannot be broken (and the
			conclusion happens to be true anyway). (c) False: the hypothesis is true and the conclusion false — the one way to break a promise.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Who moves first?">
	<p>Decide whether each statement is true.</p>
	<ol type="a">
		<li>\(\forall x\in\Z\ \exists y\in\Z:\ y>x\)</li>
		<li>\(\exists y\in\Z\ \forall x\in\Z:\ y>x\)</li>
		<li>\(\exists x\in\N\ \forall y\in\N:\ x\le y\)</li>
		<li>\(\exists x\in\Z\ \forall y\in\Z:\ x\le y\)</li>
	</ol>
	{#snippet solution()}
		<ol type="a">
			<li>True: reply to \(x\) with \(y = x+1\).</li>
			<li>False: whatever \(y\) you commit to, the Skeptic plays \(x = y\).</li>
			<li>True: \(x = 0\) is at most every natural number. (Remember that in this book \(\N\) starts at \(0\).)</li>
			<li>False: whatever \(x\) you choose, the Skeptic plays \(y = x-1\). The integers have no smallest element.</li>
		</ol>
	{/snippet}
</Exercise>

<Exercise level={2} title="Your first induction">
	<p>Prove by induction that \(1+2+3+\dots+n = \dfrac{n(n+1)}{2}\) for every \(n\ge1\).</p>
	{#snippet hint()}
		<p>For the inductive step, add \(n+1\) to both sides of the formula for \(n\) and simplify.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			Base case: for \(n=1\) both sides equal \(1\). Inductive step: assume \(1+\dots+n = \frac{n(n+1)}2\). Then
		</p>
		\[ 1+\dots+n+(n+1) = \frac{n(n+1)}{2} + (n+1) = \frac{n(n+1) + 2(n+1)}{2} = \frac{(n+1)(n+2)}{2}, \]
		<p>which is the formula for \(n+1\). By induction it holds for all \(n\ge1\).</p>
	{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>
			Mathematical text is built from labelled blocks: definitions (membership tests, where “if” means “iff”), theorems, lemmas,
			corollaries, proofs, examples and non-examples.
		</li>
		<li>
			\(\wedge\), \(\vee\), \(\neg\) are and, (inclusive) or, not. An implication \(P\Rightarrow Q\) is a promise, broken only when
			\(P\) holds and \(Q\) fails; with \(P\) false it is vacuously true.
		</li>
		<li>
			The contrapositive \(\neg Q\Rightarrow\neg P\) says the same as \(P\Rightarrow Q\); the converse \(Q\Rightarrow P\) does not.
			Invariants separate shapes through the contrapositive.
		</li>
		<li>
			\(\forall\) and \(\exists\) are moves in a game; their order decides who moves first. Negation flips each quantifier as it
			passes, and turns \(P\Rightarrow Q\) into \(P\wedge\neg Q\).
		</li>
		<li>Proof shapes: direct, contrapositive, contradiction, double inclusion, induction, and the well-definedness check.</li>
		<li>
			Sameness comes in levels: \(=\), \(\cong\), \(\simeq\), plus \(:=\) (naming) and \(\sim\) (a chosen equivalence). Subscripts
			push forward; superscripts pull back.
		</li>
		<li>Read actively: examples first, pencil in hand, statement before proof — and fight it.</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading items={reading} />
