<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	import Definition from '$lib/components/prose/Definition.svelte';
	import Theorem from '$lib/components/prose/Theorem.svelte';
	import Lemma from '$lib/components/prose/Lemma.svelte';
	import Proposition from '$lib/components/prose/Proposition.svelte';
	import Proof from '$lib/components/prose/Proof.svelte';
	import Example from '$lib/components/prose/Example.svelte';
	import Intuition from '$lib/components/prose/Intuition.svelte';
	import KeyIdea from '$lib/components/prose/KeyIdea.svelte';
	import Warning from '$lib/components/prose/Warning.svelte';
	import Remark from '$lib/components/prose/Remark.svelte';
	import History from '$lib/components/prose/History.svelte';
	import Question from '$lib/components/prose/Question.svelte';
	import Notation from '$lib/components/prose/Notation.svelte';
	import Recap from '$lib/components/prose/Recap.svelte';
	import Exercise from '$lib/components/prose/Exercise.svelte';
	import Figure from '$lib/components/prose/Figure.svelte';
	import Term from '$lib/components/prose/Term.svelte';
	import Ref from '$lib/components/prose/Ref.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import Cite from '$lib/components/prose/Cite.svelte';
	import RelationChecker from '$lib/figures/foundations/equivalence/RelationChecker.svelte';
	import PartitionPainter from '$lib/figures/foundations/equivalence/PartitionPainter.svelte';
	import NecklaceClasses from '$lib/figures/foundations/equivalence/NecklaceClasses.svelte';
	import WellDefinedTester from '$lib/figures/foundations/equivalence/WellDefinedTester.svelte';
	import IntervalToCircle from '$lib/figures/foundations/equivalence/IntervalToCircle.svelte';
	import HelixQuotient from '$lib/figures/foundations/equivalence/HelixQuotient.svelte';
	import SquareToTorus from '$lib/figures/foundations/equivalence/SquareToTorus.svelte';

	const reading = [
		{
			title: 'Book of Proof, Chapter 11: Relations',
			author: 'Richard Hammack',
			url: 'https://richardhammack.github.io/BookOfProof/',
			note: 'A patient, free undergraduate text. Sections 11.3–11.5 cover equivalence relations, classes and partitions, and the integers modulo n, with many exercises (the odd-numbered ones are solved at the back).',
			kind: 'book' as const,
			free: true
		},
		{
			title: 'How to Prove It: A Structured Approach',
			author: 'Daniel J. Velleman',
			url: 'https://www.cambridge.org/core/books/how-to-prove-it/6D2965D625C6836CD4A785A2C843B3DA',
			note: 'Chapter 4 (“Relations”) builds equivalence relations from the logic up; excellent if you want to practise writing the proofs in this chapter yourself.',
			kind: 'book' as const
		},
		{
			title: 'What’s a Quotient Group, Really? (Parts 1 and 2)',
			author: 'Tai-Danae Bradley, Math3ma',
			url: 'https://www.math3ma.com/blog/whats-a-quotient-group-really-part-1',
			note: 'Two short, friendly blog posts (2016) built on one picture: a quotient is the set of “piles”. Written for groups (our §1.4), but Part 1 is mostly about this chapter’s idea.',
			kind: 'web' as const,
			free: true
		},
		{
			title: 'Quotient Groups',
			author: 'Keith Conrad',
			url: 'https://kconrad.math.uconn.edu/blurbs/grouptheory/quotientgroups.pdf',
			note: 'A careful expository note that stresses well-definedness and the “wrapping ℝ onto a circle” picture. A good bridge to §1.4.',
			kind: 'notes' as const,
			free: true
		},
		{
			title: 'Torus Games',
			author: 'Jeff Weeks',
			url: 'https://www.geometrygames.org/TorusGames/',
			note: 'Free games played on a square whose opposite sides are glued: the best way to feel at home on the quotient that becomes a torus.',
			kind: 'interactive' as const,
			free: true
		},
		{
			title: 'This open problem taught me what topology is (the inscribed rectangle problem)',
			author: '3Blue1Brown (Grant Sanderson)',
			url: 'https://www.3blue1brown.com/lessons/inscribed-rect-v2/',
			note: 'Builds a torus and a Möbius strip out of pairs of points on a loop: gluing and quotients used to solve a real problem.',
			kind: 'video' as const,
			free: true
		}
	];
</script>

<Epigraph author="Henri Poincaré" source="Science and Method (1908), translated by G. B. Halsted"
	>…mathematics is the art of giving the same name to different things.</Epigraph
>

<p class="lead">
	Is \(\tfrac12\) the same number as \(\tfrac24\)? Is three o’clock the same time as fifteen o’clock? Is a coffee mug the same
	shape as a doughnut? Each time the honest answer is “yes — once you decide what to ignore.” This chapter is about making
	that decision precisely, and about what happens next: a whole pile of different things, declared to be the same, becomes
	a single new object.
</p>

<Ahead>
	<p>
		This chapter plants the single most important idea of the book. Declaring things the same and then treating each pile as
		one object is called taking a <em>quotient</em>, and it is the first of the book’s four recurring ideas. You will meet it
		again when we build the clock groups \(\Z/n\) (<Ref to="foundations/groups" />) and quotient groups (<Ref
			to="foundations/abelian-groups"
		/>), when we glue the sides of a square into a torus (<Ref to="topology/gluing" />), and above all in homology itself
		(<Ref to="homology/homology-groups" />), where two loops are declared “the same” when together they enclose a region:
		\(H_n = Z_n/B_n\) is literally a quotient. The “well-defined” check of this chapter is what later makes maps between
		homology groups possible.
	</p>
</Ahead>

<h2 id="same-up-to">Same, up to what?</h2>

<p>
	Mathematicians say “the same” all the time, and they almost never mean “identical.” They mean <em>the same up to</em> something:
	the same up to a whole number of days, the same up to cancelling a common factor, the same up to stretching and bending. The
	phrase “up to” names what we have agreed to ignore.
</p>

<ul>
	<li>
		<strong>Clocks.</strong> A wall clock ignores whole turns of its hand: 3 o’clock and 15 o’clock (and 27 o’clock, if you kept
		counting) all point the hand at the same place. The clock treats hours that differ by a multiple of 12 as the same.
	</li>
	<li>
		<strong>Fractions.</strong> \(\tfrac12\), \(\tfrac24\) and \(\tfrac{-3}{-6}\) are written differently, but every one of them
		describes the same amount. A fraction ignores common factors of its top and bottom.
	</li>
	<li>
		<strong>Shapes.</strong> In <Ref to="prelude/shape-of-a-question" /> a topologist declared the coffee mug and the doughnut the
		same, because one can be bent into the other without tearing. Topology ignores bending and stretching.
	</li>
	<li>
		<strong>Parity.</strong> For many purposes the only thing that matters about a whole number is whether it is even or odd. Then
		2, 8 and −40 are “the same”, and so are 1, 7 and 101.
	</li>
</ul>

<p>
	In every case, many different things get one shared name, which is exactly what Poincaré meant in the epigraph <Cite
		k="poincare1908"
		loc="bk I, ch. II"
	/>. But “declaring things the same” cannot be done carelessly. Suppose you decided that two numbers are the same whenever they are
	close, say within \(0.1\) of each other. Then \(0\) would be the same as \(0.1\), which is the same as \(0.2\), which is the same
	as \(0.3\), … and after a thousand small steps, \(0\) would be “the same” as \(100\). A notion of sameness that lets every
	number be the same as every other is useless. So sameness must obey some rules, and finding the right rules is our first job.
</p>

<p>We take the idea in five steps, in the order in which the rest of the book will use them:</p>

<ol>
	<li>say precisely what “declaring things the same” means (an <em>equivalence relation</em>);</li>
	<li>see what it does to a set: it sorts it into non-overlapping piles (<em>classes</em>, forming a <em>partition</em>);</li>
	<li>make a new set whose elements are the piles (the <em>quotient set</em>);</li>
	<li>learn the one safety check you need before computing with piles (<em>well-definedness</em>);</li>
	<li>use all of this to build shapes by gluing (a preview of <Ref to="topology/gluing" />).</li>
</ol>

<h2 id="relations">Relations: a yes-or-no question about pairs</h2>

<p>
	Before we can talk about sameness, we need a way to talk about <em>any</em> connection between elements of a set. Think of a
	question that can be asked about two things \(x\) and \(y\), in that order, and that always has a definite yes-or-no answer:
</p>

<ul>
	<li>“Is \(x\) less than \(y\)?” (asked about numbers)</li>
	<li>“Does \(x\) divide \(y\)?” (asked about whole numbers)</li>
	<li>“Was \(x\) born on the same day of the year as \(y\)?” (asked about people)</li>
	<li>“Do \(x\) and \(y\) leave the same remainder when divided by 3?” (asked about integers)</li>
</ul>

<p>
	Such a question is completely described by listing the pairs for which the answer is “yes.” That list is a collection of
	ordered pairs \((x, y)\) — a subset of the <Term t="cartesian-product">Cartesian product</Term> \(X\times X\) that you met in
	<Ref to="foundations/sets-and-functions" />. And that is precisely the definition.
</p>

<Definition title="Relation" id="def-relation">
	<p>
		A <dfn>relation</dfn> on a set \(X\) is a subset \(R \subseteq X \times X\). When the pair \((x,y)\) belongs to \(R\) we say
		“\(x\) is related to \(y\)” and write \(x \mathrel{R} y\), or, more often in this book, \(x \sim y\) (read “\(x\) is related to
		\(y\)” or “\(x\) twiddle \(y\)”).
	</p>
</Definition>

<p>
	The symbol \(\sim\) is called a <em>tilde</em>. When we use it for a relation, think of it as a fill-in-the-blank: \(x\sim y\)
	is the statement “the answer to our question about \((x,y)\) is yes,” and \(x \not\sim y\) means “the answer is no.”
</p>

<Example title="“Less than” on four numbers">
	<p>
		Take \(X = \set{1,2,3,4}\) and the question “is \(x<y\)?” The answer is yes for exactly six ordered pairs, so the relation is
	</p>
	\[ R = \set{(1,2),\ (1,3),\ (1,4),\ (2,3),\ (2,4),\ (3,4)} \subseteq X\times X. \]
	<p>
		Notice that the <em>order</em> inside a pair matters: \((1,2)\in R\) because \(1<2\), but \((2,1)\notin R\). A relation is a
		question about <em>ordered</em> pairs, and it is allowed to be lopsided.
	</p>
</Example>

<p>There are two pictures of a relation that we will use constantly, and the next figure shows both side by side.</p>

<ul>
	<li>
		<strong>The table.</strong> Draw the grid \(X\times X\): one row for each \(x\), one column for each \(y\). Mark the cell in row
		\(x\) and column \(y\) when \(x\sim y\). The relation <em>is</em> the set of marked cells.
	</li>
	<li>
		<strong>The arrows.</strong> Draw each element as a dot and draw an arrow \(x\to y\) whenever \(x\sim y\). If \(x\sim x\), the
		arrow starts and ends at the same dot: a little loop.
	</li>
</ul>

<h2 id="equivalence-relations">Three rules for sameness</h2>

<p>
	Most relations have nothing to do with sameness: “less than” certainly doesn’t. So let us ask: what must be true of a question
	like “are \(x\) and \(y\) the same (in the way we care about)?” Three things, which you have known all your life without
	saying them out loud.
</p>

<ol>
	<li><strong>Everything is the same as itself.</strong> Whatever we ignore, \(x\) never differs from \(x\).</li>
	<li><strong>Sameness goes both ways.</strong> If \(x\) is the same as \(y\), then \(y\) is the same as \(x\).</li>
	<li>
		<strong>Sameness can be chained.</strong> If \(x\) is the same as \(y\), and \(y\) is the same as \(z\), then \(x\) is the same
		as \(z\).
	</li>
</ol>

<p>
	The third rule is the one that failed for “close to” in the first section. These three rules are the entire definition.
</p>

<Definition title="Equivalence relation" id="def-equivalence-relation">
	<p>A relation \(\sim\) on a set \(X\) is an <dfn>equivalence relation</dfn> if it is</p>
	<ol>
		<li><strong>reflexive:</strong> \(x\sim x\) for every \(x\in X\);</li>
		<li><strong>symmetric:</strong> for all \(x,y\in X\), if \(x\sim y\) then \(y\sim x\);</li>
		<li><strong>transitive:</strong> for all \(x,y,z\in X\), if \(x\sim y\) and \(y\sim z\) then \(x\sim z\).</li>
	</ol>
	<p>When \(\sim\) is an equivalence relation and \(x\sim y\), we say \(x\) and \(y\) are <em>equivalent</em>.</p>
</Definition>

<p>
	Each rule has a shape in each picture, and learning to see these shapes makes checking the rules almost effortless.
</p>

<ul>
	<li>
		<strong>Reflexive:</strong> every cell on the diagonal of the table is marked; in the arrow picture, every dot carries a
		loop.
	</li>
	<li>
		<strong>Symmetric:</strong> the table is a mirror image of itself across the diagonal; in the arrow picture, every arrow has a
		partner coming back.
	</li>
	<li>
		<strong>Transitive:</strong> whenever you can walk \(x\to y\to z\) in two steps, there is also a one-step shortcut
		\(x\to z\).
	</li>
</ul>

<Figure title="Three rules, checked live" hint="Tap cells to add or remove pairs · try the presets" num="1.2.1" id="fig-relations">
	<RelationChecker />
	{#snippet caption()}
		A relation on \(\set{1,2,3,4}\), drawn as a table and as arrows. The three lights test the rules; when one
		fails, a <em>witness</em> is highlighted: the gold arrows exist, the dashed rose arrow is the one the rule demands but which is
		missing. “Close it up” adds exactly the pairs the rules force (shown in violet). Try <span class="nw">“\(|x-y|\le 1\)”:</span> it is
		reflexive and symmetric, yet fails transitivity, just like “close to.”
	{/snippet}
</Figure>

<h3>The star example: same remainder</h3>

<p>
	Fix a whole number \(n\ge1\). Two integers are <em>congruent modulo \(n\)</em> if they leave the same remainder when divided by
	\(n\). With \(n = 3\): \(7\) and \(13\) are congruent (both leave remainder \(1\)), while \(7\) and \(8\) are not.
</p>

<p>
	There is a neater way to say this that avoids talking about remainders. Two integers leave the same remainder when divided by
	\(n\) exactly when their difference is a multiple of \(n\): \(13 - 7 = 6 = 3\cdot 2\). We write \(n\mid m\), read “\(n\)
	divides \(m\),” to mean that \(m = nk\) for some integer \(k\). (Careful: \(n \mid m\) is a statement, true or false; it is not
	the fraction \(n/m\).)
</p>

<Notation title="Congruence">
	<p>
		We write \(x\equiv y \pmod n\), read “\(x\) is congruent to \(y\) modulo \(n\),” to mean \(n\mid (x-y)\). For example
		\(15\equiv 3 \pmod{12}\) — fifteen o’clock is three o’clock — and \(-1\equiv 2\pmod 3\).
	</p>
</Notation>

<Proposition id="prop-congruence">
	{#snippet head()}Congruence modulo \(n\) is an equivalence relation on \(\Z\){/snippet}
	<p>For every \(n\ge 1\), the relation \(x\sim y \iff n\mid(x-y)\) on the integers \(\Z\) is reflexive, symmetric and transitive.</p>
</Proposition>

<Proof>
	<p>
		<strong>Reflexive.</strong> For any integer \(x\), \(x - x = 0 = n\cdot 0\), so \(n\mid (x-x)\), that is, \(x\sim x\).
	</p>
	<p>
		<strong>Symmetric.</strong> Suppose \(x\sim y\), so \(x - y = nk\) for some integer \(k\). Then \(y - x = -(x-y) = n\cdot(-k)\),
		and \(-k\) is an integer, so \(y\sim x\).
	</p>
	<p>
		<strong>Transitive.</strong> Suppose \(x\sim y\) and \(y\sim z\): \(x-y = nk\) and \(y - z = n\ell\) for integers \(k,\ell\).
		Adding the two equations, the \(y\)’s cancel: \(x - z = nk + n\ell = n(k+\ell)\). So \(x\sim z\).
	</p>
</Proof>

<p>
	Notice how each rule used a different everyday fact: \(0\) is a multiple of anything; the negative of a multiple is a multiple;
	the sum of two multiples is a multiple. That is the typical shape of such proofs: each of the three rules is a small, separate
	check.
</p>

<History title="Gauss and the triple bar">
	<p>
		The symbol \(\equiv\) for congruence was introduced by Carl Friedrich Gauss, aged twenty-four, in his <em
			>Disquisitiones Arithmeticae</em
		> of 1801, the book that made arithmetic modulo \(n\) a systematic theory. A footnote explains the choice: “We have adopted
		this sign because of the great analogy that is found between equality and congruence.” Adrien-Marie Legendre, Gauss adds,
		had for the same reason simply used the equals sign itself, which Gauss “hesitated to imitate, lest ambiguity arise” <Cite
			k="gauss1801"
			loc="art. 2"
		/>. (The translations from Gauss’s Latin are ours.) So the third bar says: equal, in the one respect we care about.
	</p>
</History>

<h3>More examples</h3>

<ul>
	<li>
		<strong>Equality</strong>, \(x\sim y \iff x = y\), is an equivalence relation. It is the strictest one: it declares nothing the
		same except a thing and itself.
	</li>
	<li>
		<strong>“Everything is related to everything”</strong> is also an equivalence relation, the most generous one: it declares all
		elements the same.
	</li>
	<li>
		<strong>Same colour</strong> on a bag of marbles; <strong>same birthday</strong> on a set of people; <strong
			>same number of letters</strong
		> on a set of words. Any relation of the form “\(x\) and \(y\) give the same answer to a fixed question” is an equivalence
		relation, and the three rules hold for three small reasons: an answer equals itself, equality goes both ways, and equalities
		chain.
	</li>
	<li>
		<strong>Same distance from the origin</strong>, for points of the plane: \((x,y)\sim(x',y')\) when \(x^2+y^2 = x'^2+y'^2\).
		This is again “same answer to a question” — the question being “how far are you from \(0\)?”
	</li>
</ul>

<p>
	That last pattern is so useful that it deserves to be said in general. If \(f\colon X\to Y\) is any <Term t="function"
		>function</Term
	>, then
</p>
\[ x\sim x' \iff f(x) = f(x') \]
<p>
	is an equivalence relation on \(X\): “same output.” Every function quietly sorts its inputs into groups, one group for each
	output it actually produces. Remember this; it comes back at the end of the chapter.
</p>

<h3>Non-examples, each failing exactly one rule</h3>

<p>
	The best way to understand a definition with several conditions is to look at examples that satisfy all but one of them. Each
	of the following fails exactly one rule. (The first two are presets in Figure 1.2.1, on four numbers.)
</p>

<div class="table-wrap">
	<table>
		<thead>
			<tr><th>Relation</th><th>Reflexive?</th><th>Symmetric?</th><th>Transitive?</th></tr>
		</thead>
		<tbody>
			<tr>
				<td>\(x\le y\) on \(\Z\)</td>
				<td>yes</td>
				<td><strong>no</strong>: \(1\le 2\) but \(2\not\le 1\)</td>
				<td>yes</td>
			</tr>
			<tr>
				<td>\(\abs{x-y}\le 1\) on \(\Z\) (“close to”)</td>
				<td>yes</td>
				<td>yes</td>
				<td><strong>no</strong>: \(1\sim2\), \(2\sim3\), but \(1\not\sim3\)</td>
			</tr>
			<tr>
				<td>\(xy>0\) on \(\R\) (“same strict sign”)</td>
				<td><strong>no</strong>: \(0\cdot 0 = 0\), so \(0\not\sim 0\)</td>
				<td>yes</td>
				<td>yes</td>
			</tr>
		</tbody>
	</table>
</div>

<p>
	The third row is the subtle one. For nonzero numbers, \(xy>0\) says “\(x\) and \(y\) have the same sign,” which is a perfectly
	good sameness. It fails reflexivity at a single point, \(0\), which is related to nothing at all — not even itself. And that
	single point is enough to disqualify it.
</p>

<Warning title="A famous false proof">
	<p>
		Here is an argument that seems to show that symmetry and transitivity together imply reflexivity, so that the first rule is
		redundant: “Take any \(x\). Pick \(y\) with \(x\sim y\). By symmetry \(y\sim x\). By transitivity, \(x\sim y\) and \(y \sim x\)
		give \(x\sim x\).”
	</p>
	<p>
		The mistake is the word “pick.” The argument assumes that \(x\) is related to <em>something</em>. If \(x\) is related to
		nothing — like \(0\) in the third row of the table, or the element \(2\) in the relation \(\set{(1,1)}\) on \(\set{1,2}\) —
		there is no \(y\) to pick, and the argument never starts. So the reflexive rule is genuinely needed. (Try the preset “only
		1 ∼ 1” in the figure.)
	</p>
</Warning>

<Question title="Is “is a sibling of” an equivalence relation?">
	<p>
		Think before you read on. Are you your own sibling? Most people would say no — so the relation is not reflexive.
		Transitivity fails too, and half-siblings show it: Ann and Ben can share a mother, and Ben and Cara a father, while Ann
		and Cara share no parent at all. Now consider instead “has the same two parents as.” This is a “same answer to a question” relation,
		so it <em>is</em> an equivalence relation, and its piles are exactly the families of full siblings, each person included in
		their own pile. Small changes of wording matter.
	</p>
</Question>

<h2 id="classes">Classes and partitions</h2>

<p>
	Once we have an equivalence relation, every element has a <em>pile</em>: all the things it is equivalent to. These piles are
	the heart of the matter.
</p>

<Definition title="Equivalence class" id="def-class">
	<p>Let \(\sim\) be an equivalence relation on \(X\). The <dfn>equivalence class</dfn> of an element \(x \in X\) is the set</p>
	\[ [x] = \setb{y \in X}{y\sim x}, \]
	<p>
		read “the class of \(x\).” Any element of a class is called a <dfn>representative</dfn> of that class.
	</p>
</Definition>

<p>
	(The notation \(\setb{y\in X}{y\sim x}\) is the set-builder notation of <Ref to="foundations/sets-and-functions" />: “the set of
	all \(y\) in \(X\) such that \(y\sim x\).”)
</p>

<Example title="The three classes modulo 3">
	<p>For congruence modulo \(3\) on \(\Z\) there are exactly three classes:</p>
	\[
	\begin{aligned}
	[0] &= \set{\dots,-6,-3,0,3,6,9,\dots} && \text{(multiples of 3)}\\
	[1] &= \set{\dots,-5,-2,1,4,7,10,\dots} && \text{(remainder 1)}\\
	[2] &= \set{\dots,-4,-1,2,5,8,11,\dots} && \text{(remainder 2)}
	\end{aligned}
	\]
	<p>
		Look at what happens if you ask for the class of \(4\): it is \(\set{\dots,-5,-2,1,4,7,\dots}\), the very same set as \([1]\).
		So \([4] = [1]\), and also \([7] = [1]\) and \([-2] = [1]\). One class, many names: <em>every</em> member of a class can be used
		to name it. This is the source of both the power and the danger of quotients.
	</p>
</Example>

<Question title="Check yourself: how many classes?">
	<p>
		How many classes does congruence modulo \(1\) have? Modulo \(2\)? And equality on \(\Z\)? Every difference is a multiple of
		\(1\), so modulo \(1\) all integers are equivalent: <em>one</em> class, the whole of \(\Z\). Modulo \(2\) there are two classes,
		the evens and the odds. Equality has infinitely many classes, each containing a single integer.
	</p>
</Question>

<p>
	Two facts keep classes tidy. The first says that “same class” and “equivalent” are the same thing; the second says that
	classes never partly overlap.
</p>

<Lemma id="lem-same-class">
	{#snippet head()}Equal classes are equivalent elements{/snippet}
	<p>For all \(x, y\in X\): \([x]=[y]\) if and only if \(x\sim y\).</p>
</Lemma>

<Proof>
	<p>
		(\(\Rightarrow\)) Suppose \([x]=[y]\). By reflexivity \(x\sim x\), so \(x\in[x]\). Since \([x]=[y]\), also \(x\in[y]\), which
		by definition means \(x\sim y\).
	</p>
	<p>
		(\(\Leftarrow\)) Suppose \(x\sim y\). We show \([x]\subseteq[y]\): if \(z\in[x]\) then \(z\sim x\); together with \(x\sim y\),
		transitivity gives \(z\sim y\), so \(z\in[y]\). By symmetry we also have \(y\sim x\), and the same argument with the roles
		swapped gives \([y]\subseteq[x]\). Two sets each contained in the other are equal: \([x]=[y]\). (This is the “double inclusion”
		proof shape from <Ref to="prelude/reading-math" />.)
	</p>
</Proof>

<Theorem id="thm-classes-partition">
	{#snippet head()}Classes never partly overlap{/snippet}
	<p>
		Let \(\sim\) be an equivalence relation on \(X\). Every element of \(X\) lies in some class, and any two classes are either
		equal or disjoint (they have no element in common).
	</p>
</Theorem>

<Proof>
	<p>
		Every \(x\) lies in its own class \([x]\), by reflexivity. Now suppose two classes \([x]\) and \([y]\) share some element
		\(z\). Then \(z\sim x\) and \(z\sim y\). By symmetry \(x\sim z\), and by transitivity (\(x\sim z\), \(z\sim y\)) we get
		\(x\sim y\). By the lemma, \([x] = [y]\). So two classes that overlap at all are completely equal.
	</p>
</Proof>

<p>
	A way of chopping a set into non-overlapping pieces has a name, and the theorem says that the classes are such a chopping.
</p>

<Definition title="Partition" id="def-partition">
	<p>
		A <dfn>partition</dfn> of a set \(X\) is a collection of subsets of \(X\), called its <em>blocks</em>, such that every block
		is non-empty, any two different blocks are disjoint, and every element of \(X\) lies in some block.
	</p>
</Definition>

<p>
	So every equivalence relation gives a partition (its classes). The surprise is that it also works backwards, so that
	equivalence relations and partitions are really the same thing in two costumes <Cite k="hammack2018" loc="§11.4" />.
</p>

<Theorem title="Equivalence relations are partitions" id="thm-eq-partition">
	<p>
		Every equivalence relation on \(X\) determines a partition of \(X\) — its classes. Conversely, every partition of \(X\)
		determines an equivalence relation, “\(x\sim y\) if \(x\) and \(y\) lie in the same block,” and its classes are exactly the
		blocks. Going there and back returns what you started with.
	</p>
</Theorem>

<Proof>
	<p>
		The first half is the theorem above. For the second, start with a partition and define \(x\sim y\) when \(x\) and \(y\) are in
		the same block. This is a “same answer to a question” relation (the question being “which block are you in?” — there is
		exactly one answer, because the blocks are disjoint and cover \(X\)), so it is an equivalence relation, and the class of \(x\)
		is the block containing \(x\). Finally, starting from an equivalence relation, forming its partition into classes, and then
		forming “same block,” gives back “same class,” which by the lemma is the original relation.
	</p>
</Proof>

<Intuition title="Piles and surveys">
	<p>
		Imagine handing a survey with one question to everyone in a room — “what colour is your shirt?” — and asking people to stand
		together with those who gave the same answer. The groups that form are the classes. Nobody stands in two groups, nobody is
		left out, and two people are “equivalent” exactly when they stand together. An equivalence relation is the survey; the
		partition is the room after everyone has moved.
	</p>
</Intuition>

<p>
	The next figure lets you choose a relation and paints each element with the colour of its class. Ignore the “Collapse” button
	for a moment; it is the subject of the next section.
</p>

<Figure title="The partition painter" hint="Choose a relation · tap a point to see its class · then collapse" num="1.2.2">
	<PartitionPainter />
	{#snippet caption()}
		Three equivalence relations, each painting its set by classes: integers with the same remainder modulo \(n\) (try several
		\(n\)), marbles of the same colour, and lattice points at the same distance from \(0\). Tap any element to light up its whole
		class. Then press <em>Collapse</em>: each class flies together into a single point, and the arrows show where every element
		went — the projection \(q\) onto the quotient set \(X/{\sim}\).
	{/snippet}
</Figure>

<h2 id="quotient">The quotient set: one point per class</h2>

<p>
	Here is the bold step. We have sorted \(X\) into piles. Now we build a brand-new set whose elements <em>are the piles
	themselves</em>.
</p>

<Definition title="Quotient set and projection" id="def-quotient">
	<p>
		Let \(\sim\) be an equivalence relation on \(X\). The <dfn>quotient set</dfn> of \(X\) by \(\sim\) is the set of all
		equivalence classes,
	</p>
	\[ X/{\sim} \;=\; \setb{[x]}{x\in X}, \]
	<p>
		read “\(X\) modulo twiddle” or “\(X\) mod \(\sim\).” The <dfn>projection</dfn> (or <em>quotient map</em>) is the function
	</p>
	\[ q\colon X\to X/{\sim},\qquad q(x) = [x], \]
	<p>which sends each element to its class.</p>
</Definition>

<p>
	Two properties of \(q\) are immediate, and they are worth saying slowly because they summarize everything so far.
</p>

<ul>
	<li>
		\(q\) is <Term t="surjective">surjective</Term>: every class is the class of something (namely of any of its representatives).
	</li>
	<li>
		\(q(x) = q(y)\) exactly when \(x\sim y\). That is the lemma above, rewritten: the projection “forgets” precisely the
		differences we declared unimportant, and nothing else.
	</li>
</ul>

<Question title="Check yourself: when does q forget nothing?">
	<p>
		When is the projection \(q\) <Term t="injective">injective</Term>? Exactly when \(q(x) = q(y)\) forces \(x = y\), that is, when
		\(x\sim y\) only for \(x = y\): when the relation is equality, and every class has a single member. Then \(X/{\sim}\) is just
		\(X\) with each element \(x\) renamed \([x]\). Every interesting quotient forgets something.
	</p>
</Question>

<p>
	Look back at the partition painter and press <em>Collapse</em>. Each pile shrinks to a single point; the arrows that remain are
	\(q\). In the first mode you get \(\Z/n\), sitting on a clock face. In the third mode the collapse has a geometric meaning:
	every lattice point swings round its circle to the positive \(x\)-axis, so points at the same distance land on the same spot,
	and the quotient becomes a row of points on a ray, one per distance.
</p>

<KeyIdea>
	<p>
		<strong>A class is one thing.</strong> As a subset of \(X\), the class \([1]\in\Z/3\) contains infinitely many integers. As an
		element of the quotient set \(\Z/3\), it is a single point — one of exactly three. Learning to hold both views at once, and to
		switch between them at will, is the main skill this chapter teaches.
	</p>
</KeyIdea>

<h3>The hardest step, and how to take it</h3>

<p>
	Researchers who study how people learn this material keep finding the same sticking point: students can compute a class as a
	list, but find it hard to treat the whole class as a single object that can itself be an element of a set, be added, or be fed
	into a function <Cite k="dubinsky1994" />. If that feels strange to you, you are in good company. Here are three ways to make
	it feel natural.
</p>

<ul>
	<li>
		<strong>Sealed envelopes.</strong> Put each pile into an envelope and seal it. The quotient set is the set of envelopes. You can
		count envelopes, line them up, or hand one to a friend, without opening any of them — even if one contains infinitely many
		slips of paper.
	</li>
	<li>
		<strong>Names on the outside.</strong> To refer to an envelope you write a name on it, and any slip inside will do: \([1]\),
		\([4]\) and \([-2]\) are three labels for the same envelope. A label is not the envelope.
	</li>
	<li>
		<strong>Positions on a clock.</strong> \(\Z/12\) is the set of 12 positions of a clock hand. The position “3 o’clock” is one
		thing, even though infinitely many hour-counts (3, 15, 27, −9, …) put the hand there.
	</li>
</ul>

<p>
	All three pictures describe the same set \(\Z/n\). Which one is “right”? All of them; good mathematicians switch between them
	constantly. What matters is knowing which operations are safe in which picture — and that is exactly the question of the next
	section.
</p>

<Notation title="The integers modulo n">
	<p>
		The quotient of \(\Z\) by congruence modulo \(n\) is written \(\Z/n\) and read “Z mod n.” It has exactly \(n\) elements,
	</p>
	\[ \Z/n = \set{[0],[1],[2],\dots,[n-1]}, \]
	<p>
		because every integer leaves one of the remainders \(0,1,\dots,n-1\). Other books write \(\Z/n\Z\) or \(\Z_n\); in this book we
		always write \(\Z/n\). The two-element set \(\Z/2 = \set{[0],[1]} = \set{\text{even},\text{odd}}\) will be a hero of later
		chapters, where it is also written \(\mathbb F_2\).
	</p>
</Notation>

<Warning title="ℤ/n is not a set of numbers">
	<p>
		It is tempting to say “\(\Z/3\) is just \(\set{0,1,2}\).” As a <em>shorthand</em> this is fine, and we will often write \(0, 1,
		2\) for \([0],[1],[2]\). But the elements of \(\Z/3\) are classes, not the integers \(0, 1, 2\). The difference shows up the
		moment you compute: in \(\Z/3\), \([2]+[2] = [4] = [1]\), whereas the integer \(2+2\) is \(4\), which is not one of \(0,1,2\)
		at all. The integers \(0,1,2\) are merely convenient representatives, one from each envelope.
	</p>
</Warning>

<h3>Fractions are classes</h3>

<p>
	Here is an example you have used since childhood without knowing it was a quotient. A fraction is written with an integer on
	top and a nonzero integer on the bottom, so it is described by a pair \((a, b)\) with \(b\neq 0\). But different pairs describe
	the same fraction: \((1,2)\), \((2,4)\) and \((-3,-6)\) all describe one half. When do \((a,b)\) and \((c,d)\) describe the same
	fraction? When \(\frac ab = \frac cd\), which — multiplying both sides by \(bd\) — says \(ad = bc\). That condition involves no
	division at all, so we can use it as a definition.
</p>

<Example title="The rational numbers as a quotient">
	<p>On the set of pairs \(P = \setb{(a,b)}{a,b\in\Z,\ b\neq 0}\), define</p>
	\[ (a,b)\sim(c,d) \iff ad = bc. \]
	<p>
		Reflexive: \(ab = ba\). Symmetric: if \(ad = bc\) then \(cb = da\). Transitive: suppose \(ad = bc\) and \(cf = de\). Multiply
		the first equation by \(f\): \(adf = bcf = b(cf) = b(de)\). So \(d(af) = d(be)\), and since \(d\neq 0\) we may cancel \(d\) to
		get \(af = be\), that is, \((a,b)\sim(e,f)\). (Notice where \(d\neq0\) was used: without it, transitivity would fail.)
	</p>
	<p>
		The quotient set \(P/{\sim}\) <em>is</em> the set of rational numbers \(\Q\), and the fraction \(\tfrac12\) <em>is</em> the
		class \([(1,2)] = \set{(1,2),(2,4),(3,6),(-1,-2),\dots}\). Writing a fraction “in lowest terms” is simply choosing a favourite
		representative.
	</p>
</Example>

<h3>The same up to rotation</h3>

<p>
	For a final example, colour each corner of a square gold or violet. There are \(2\times2\times2\times2=16\) colourings. But
	suppose the square is a necklace of four beads that can be turned: then a colouring and its rotations should count as the same
	necklace. “Can be turned into each other by a rotation” is an equivalence relation (turning by nothing is a rotation; a rotation
	can be undone by turning back; two rotations in a row make a rotation). How many different necklaces are there?
</p>

<Figure title="Same up to rotation" hint="Switch stages · tap a necklace to light up its class" num="1.2.3">
	<NecklaceClasses />
	{#snippet caption()}
		The 16 colourings of a square’s corners, sorted into classes of colourings that differ by a rotation. The class sizes are
		\(1,4,4,2,4,1\): a necklace with all beads alike has only itself in its class, and the alternating necklace has just two
		members. Collapsing each class to one point gives the quotient set: exactly 6 necklaces.
	{/snippet}
</Figure>

<p>
	Notice that the classes have different sizes. Nothing in the definition requires classes to be the same size — only that they
	don’t overlap and that together they cover everything.
</p>

<p>
	There is a way to get the answer 6 without drawing a single necklace. For each of the four rotations, count the colourings it
	leaves unchanged: turning by nothing fixes all \(16\), a quarter turn either way fixes only the \(2\) one-colour necklaces, and
	a half turn fixes \(4\) (opposite corners must match). The average, \((16+2+4+2)/4\), is exactly \(6\). That this always works
	is <em>Burnside’s counting theorem</em>, one of the first rewards of the groups of the next chapter <Cite
		k="judson2025"
		loc="§14.3"
	/>.
</p>

<h2 id="well-defined">Functions on classes: the well-definedness check</h2>

<p>
	We now want to <em>compute</em> with classes, and the natural way is through representatives: to tell what a function does to a
	class, say what it does to a member of the class. But a class has many members. The rule had better give the same answer no
	matter which member you ask.
</p>

<Example title="A rule that works, and one that doesn’t">
	<p>
		<strong>On \(\Z/4\):</strong> define \(f([x]) = \) “even” if \(x\) is even, “odd” if \(x\) is odd. Is this a legitimate rule?
		The class \([1]\) has members \(\dots,-3,1,5,9,\dots\) — all odd. The class \([2]\) has members \(\dots,-2,2,6,10,\dots\) — all
		even. In general, members of one class differ by multiples of \(4\), and adding a multiple of \(4\) never changes whether a
		number is even. Every member gives the same answer. The rule works.
	</p>
	<p>
		<strong>On \(\Z/3\):</strong> try the same rule. The class \([0]\) contains \(0\) (even) and \(3\) (odd). So is \(f([0])\)
		even or odd? It depends on which name you used for the class, even though \([0]\) and \([3]\) are the very same element of
		\(\Z/3\). The “rule” does not define a function at all.
	</p>
</Example>

<Definition title="Well-defined" id="def-well-defined">
	<p>
		Let \(\sim\) be an equivalence relation on \(X\) and let \(F\colon X\to Y\) be a function. The rule \(f([x]) = F(x)\) is
		<dfn>well-defined</dfn> on \(X/{\sim}\) if equivalent elements give equal answers:
	</p>
	\[ x\sim x' \;\Longrightarrow\; F(x) = F(x'). \]
	<p>In that case \(f\colon X/{\sim}\to Y\) is a genuine function.</p>
</Definition>

<p>
	The name is a little misleading: “well-defined” does not mean “defined nicely.” It means “actually defined” — that the recipe,
	which secretly depended on a choice of representative, turns out not to depend on that choice. Whenever a mathematician defines
	something on classes using representatives, the very next sentence of the proof is the <Term t="well-defined"
		>well-definedness</Term
	> check. (You met the word as a proof shape in <Ref to="prelude/reading-math" />.)
</p>

<Figure title="Ask every representative" hint="Pick a rule · change n · look for rose clashes" num="1.2.4">
	<WellDefinedTester />
	{#snippet caption()}
		A rule on \(\Z/n\) given by a formula in a representative \(x\). For each class we ask four representatives,
		\(k-n,\ k,\ k+n,\ k+2n\); if they disagree, the class turns rose. Discover the pattern: “remainder mod \(m\)” is well defined
		on \(\Z/n\) exactly when \(m\) divides \(n\), while \([x]\mapsto[2x]\) and \([x]\mapsto[x^2]\) always work.
	{/snippet}
</Figure>

<h3>More checks</h3>

<ul>
	<li>
		<strong>Fractions, badly.</strong> “The numerator of a fraction” is not well defined: \(\tfrac12 = \tfrac24\), but the
		numerators are \(1\) and \(2\). Neither is “add the top and the bottom”: <span class="nw">\(1+2\neq 2+4\).</span> Both rules
		secretly depend on how the fraction is written.
	</li>
	<li>
		<strong>Fractions, well.</strong> “The decimal value \(a\div b\)” is well defined: if \(ad = bc\) then \(a\div b = c \div d\).
		So is the usual addition \(\frac ab+\frac cd = \frac{ad+bc}{bd}\), although proving it takes a few lines (see the exercise
		“Adding fractions is well defined”).
	</li>
	<li>
		<strong>Clock addition.</strong> On \(\Z/n\) define \([x]+[y] = [x+y]\). If we change representatives, \(x' = x + kn\) and \(y' =
		y + \ell n\), then \(x'+y' = (x+y) + (k+\ell)n\), which is congruent to \(x+y\). So the answer does not depend on the
		representatives: clock addition is well defined. This tiny check is what makes \(\Z/n\) into a number system with its own
		arithmetic, the subject of <Ref to="foundations/groups" />.
	</li>
</ul>

<p>
	There is a tidy way to package the whole idea. A function \(F\colon X\to Y\) that gives equal answers on equivalent elements is
	said to be <em>constant on classes</em>. Such a function “factors through” the quotient:
</p>

<Theorem title="Functions out of a quotient" id="thm-descent">
	<p>
		Let \(\sim\) be an equivalence relation on \(X\), with projection \(q\colon X\to X/{\sim}\), and let \(F\colon X\to Y\) be
		constant on classes. Then there is exactly one function \(f\colon X/{\sim}\to Y\) with \(f\circ q = F\), namely \(f([x]) =
		F(x)\). In a picture, the following square of arrows <Term t="commutative-diagram">commutes</Term>: both paths from the top-left
		corner to the bottom-right corner give the same result.
	</p>
	\[
	\begin{CD}
	X @>{F}>> Y \\
	@V{q}VV @| \\
	X/{\sim} @>{f}>> Y
	\end{CD}
	\]
</Theorem>

<Proof>
	<p>
		The recipe \(f([x]) = F(x)\) is well defined precisely because \(F\) is constant on classes, and then \(f(q(x)) = f([x]) =
		F(x)\) for every \(x\), so \(f\circ q = F\). It is the only possibility: if \(g\circ q = F\) too, then for any class \([x]\),
		\(g([x]) = g(q(x)) = F(x) = f([x])\).
	</p>
</Proof>

<p>
	Read the theorem as a recipe for building functions on a quotient: <em>find a function on the original set that ignores
	exactly the differences you declared unimportant, and it automatically becomes a function on the classes.</em> This is how
	almost every function on a quotient in this book will be built, including the maps between homology groups in <Ref
		to="homology/invariance"
	/>.
</p>

<h2 id="gluing">Gluing: making shapes by declaring points the same</h2>

<p>
	So far our quotients have been sets of numbers or necklaces. Now apply the same idea to the points of a shape, and something
	visual happens: declaring points the same <em>glues</em> them together.
</p>

<h3>An interval becomes a circle</h3>

<p>
	Take the interval \(I = [0,1]\), all real numbers from \(0\) to \(1\). Declare the two endpoints the same, \(0\sim1\), and
	declare nothing else (every point is, of course, still the same as itself). The classes are
</p>
\[ \set{0,1}\qquad\text{and}\qquad \set{x}\ \text{ for each } 0<x<1. \]
<p>
	So the quotient \(I/{\sim}\) has one point for the pair of endpoints and one point for each interior point. Picture a piece of
	string whose two ends are tied together: a loop. The quotient of an interval by “its ends are the same” is a circle.
</p>

<Figure title="Gluing the ends" hint="Play or scrub the gluing" num="1.2.5">
	<IntervalToCircle />
	{#snippet caption()}
		Bending the interval changes nothing about which points are the same; only when the ends meet do \(0\) and \(1\) become a
		single point, and the interval becomes a circle. The marks \(\tfrac14,\tfrac12,\tfrac34\) show that the points in between are
		untouched.
	{/snippet}
</Figure>

<Remark title="An honest caveat">
	<p>
		Strictly speaking, a quotient <em>set</em> is only a set: a bag of points with no sense of which points are near which. To say
		that \(I/{\sim}\) is a circle <em>as a shape</em>, we need to carry over the idea of nearness from \(I\), which is exactly
		what the <em>quotient topology</em> of <Ref to="topology/gluing" /> does <Cite k="munkres2000" loc="§22" />. In this chapter, read “is a circle” as “has one point
		for every point of a circle, arranged the way the picture suggests.”
	</p>
</Remark>

<h3>Winding the real line</h3>

<p>
	Here is a second road to the circle. On the whole real line \(\R\), declare two numbers the same when they differ by a whole
	number:
</p>
\[ s\sim t \iff s - t\in\Z. \]
<p>
	(This is an equivalence relation for the same reasons as congruence: \(0\) is a whole number, the negative of a whole number is
	a whole number, and so is the sum of two.) The class of \(0.3\) is \(\set{\dots,-1.7,-0.7,0.3,1.3,2.3,\dots}\), often written
	\(0.3+\Z\). Every class has exactly one representative in \([0,1)\), so you might think the quotient \(\R/\Z\) “is” the
	interval \([0,1)\). But walk along \(\R\) from \(0\) to \(1\): when you reach \(1\), you are back in the class of \(0\). The
	quotient closes up into a circle, just like the glued interval.
</p>

<p>
	The figure below makes this visible by winding the line around a cylinder, one unit per turn, like a spring. Numbers in the
	same class sit directly above one another, on one vertical line. The projection \(q\) simply drops every point straight down
	onto the floor, where its shadow traces a circle. The integers wound the same way, with \(n\) points per turn, give \(\Z/n\):
	exactly the clock face of the partition painter.
</p>

<Figure title="Winding the line" hint="Drag to rotate · change n or t · press Project" num="1.2.6">
	<HelixQuotient />
	{#snippet caption()}
		The integers (or the real numbers) wound into a helix. Every class is a vertical “fibre”: in \(\Z\) with \(n = 5\), the
		integers \(-5, 0, 5\) sit on one line above \([0]\). Pressing <em>Project</em> squashes the spring flat; what survives is one
		point per class — the circle \(\R/\Z\), or the \(n\) points of \(\Z/n\).
	{/snippet}
</Figure>

<h3>A square becomes a torus</h3>

<p>
	Now take a filled square and glue its left side to its right side, point by point at the same height, and its bottom to its
	top, point by point at the same horizontal position. The left–right gluing alone rolls the square into a tube (a cylinder); the
	bottom–top gluing then joins the two ends of the tube into a doughnut surface — a <em>torus</em>. We will carry this out
	carefully, with pictures in three dimensions, in <Ref to="topology/gluing" />. For now there is one subtle point that only
	equivalence relations can settle.
</p>

<p>
	Our gluing instructions — “each left point is the same as the right point at the same height,” and so on — are a relation, but
	not an equivalence relation: they do not say that a point is the same as itself, and they are not transitive. We use the
	smallest equivalence relation that contains them, the one you get by adding everything the three rules force. (The
	“close it up” button in <a href="#fig-relations">Figure 1.2.1</a> does exactly this.) Formally:
</p>

<Definition title="Generated equivalence relation" id="def-generated">
	<p>
		Given any relation \(R\) on \(X\), the <dfn>equivalence relation generated by \(R\)</dfn> is the smallest equivalence relation
		containing \(R\). Concretely, \(x\sim y\) when \(x = y\) or when you can walk from \(x\) to \(y\) in finitely many steps, each
		step following a pair of \(R\) in either direction.
	</p>
</Definition>

<p>
	Now watch the corners. The bottom-left corner is glued to the bottom-right corner (left side to right side, at the bottom). It is
	also glued to the top-left corner (bottom to top, at the left). And the top-left corner is glued to the top-right corner. By
	transitivity, <em>all four corners become a single point</em>. A common mistake is to say the corners give two points, or
	four; the chain of gluings says one.
</p>

<Figure title="A square becomes a torus" num="1.2.7">
	<SquareToTorus />
	{#snippet caption()}
		Gluing the sides marked \(a\) to each other and the sides marked \(b\) to each other, matching the arrows. Points with the
		same symbol become one point: the two \(p\text{’s}\), the two \(q\text{’s}\), and all four corners, which become the single point \(v\) of
		the torus where the loops \(a\) and \(b\) cross. (A preview of <Ref to="topology/gluing" />.)
	{/snippet}
</Figure>

<h2 id="the-big-idea">Why this is the most important idea in the book</h2>

<p>
	Step back and look at what we did. We started with a set, declared some of its elements the same, and obtained a new set with
	fewer, “coarser” elements — one for each pile. We checked that recipes using representatives were safe. And we saw that the
	same construction builds circles and tori out of intervals and squares.
</p>

<p>
	This is the first of the four ideas that run through the whole book, and it will return in every part of it:
</p>

<ul>
	<li>
		<strong>Arithmetic</strong> (<Ref to="foundations/groups" /> and <Ref to="foundations/abelian-groups" />): \(\Z/n\) gets its
		addition from the well-defined rule \([x]+[y]=[x+y]\), and every abelian group can be divided by a subgroup in the same way.
	</li>
	<li>
		<strong>Shapes</strong> (<Ref to="topology/gluing" />): cylinders, Möbius bands, tori, Klein bottles and projective planes are
		all quotients of a square by different gluing instructions.
	</li>
	<li>
		<strong>Homology</strong> (<Ref to="homology/homology-groups" />): a loop on a surface may or may not enclose a region. Two
		loops are declared the same when together they form the edge of a region between them. The piles of loops that result are the
		elements of the first <Term t="homology">homology</Term> group, and each pile — like \([1]\in\Z/3\) — is one object with
		infinitely many names. The formula \(H_n = Z_n/B_n\) at the centre of the book is this chapter’s \(X/{\sim}\) with new
		letters.
	</li>
</ul>

<p>
	When you get there, you will already know the moves: choose a representative, do the computation, and check that the answer
	does not depend on the choice.
</p>

<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Which are equivalence relations?">
	<p>For each relation, decide whether it is an equivalence relation. If it is, describe its classes; if not, name a rule that fails and give a witness.</p>
	<ol type="a">
		<li>On English words: “has the same number of letters as.”</li>
		<li>On \(\Z\): \(x\sim y\) if \(x-y\) is even.</li>
		<li>On \(\Z\): \(x\sim y\) if \(x-y\) is odd.</li>
		<li>On the positive integers: \(x\sim y\) if \(x\) divides \(y\).</li>
		<li>On \(\R\): \(x\sim y\) if \(x^2 = y^2\).</li>
	</ol>
	{#snippet hint()}
		<p>Look for “same answer to a question” relations: those are automatically equivalence relations.</p>
	{/snippet}
	{#snippet solution()}
		<ol type="a">
			<li>Yes (“same answer to: how many letters?”). One class for each word length: all three-letter words form one class, and so on.</li>
			<li>Yes; it is congruence modulo 2. Two classes: the even integers and the odd integers.</li>
			<li>No. Not reflexive: \(0 - 0 = 0\) is even, so \(0\not\sim 0\). (Not transitive either: \(0\sim1\) and \(1\sim2\), but \(0\not\sim2\).)</li>
			<li>No. Reflexive and transitive, but not symmetric: \(1\) divides \(2\), but \(2\) does not divide \(1\).</li>
			<li>Yes (“same answer to: what is your square?”). The classes are \(\set{0}\) and the pairs \(\set{x,-x}\) for \(x>0\).</li>
		</ol>
	{/snippet}
</Exercise>

<Exercise level={1} title="Close it up">
	<p>
		On \(X = \set{a,b,c,d}\), find the equivalence relation generated by \(a\sim b\) and \(b\sim c\). List its classes, and count
		how many ordered pairs it contains.
	</p>
	{#snippet solution()}
		<p>
			Transitivity forces \(a\sim c\), symmetry forces the reverse pairs, and reflexivity adds \(x\sim x\) for all four elements.
			Nothing ever connects \(d\) to the others. The classes are \(\set{a,b,c}\) and \(\set{d}\). The relation consists of all
			\(3\times3 = 9\) ordered pairs inside \(\set{a,b,c}\), plus \((d,d)\): ten pairs in all.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="All the ways to be the same">
	<p>
		How many different equivalence relations are there on the three-element set \(\set{1,2,3}\)? List them by their classes.
	</p>
	{#snippet hint()}
		<p>By the theorem on partitions, you may count partitions instead.</p>
	{/snippet}
	{#snippet solution()}
		<p>Equivalence relations correspond to partitions, and \(\set{1,2,3}\) has five partitions:</p>
		\[
		\set{\set1,\set2,\set3},\quad \set{\set{1,2},\set3},\quad \set{\set{1,3},\set2},\quad \set{\set{2,3},\set1},\quad \set{\set{1,2,3}}.
		\]
		<p>The first is equality; the last is “everything is related.” So there are five equivalence relations.</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Rules on ℤ/6">
	<p>Which of the following rules are well defined on \(\Z/6\)? Justify each answer.</p>
	<ol type="a">
		<li>\([n]\mapsto\) the remainder of \(n\) on division by \(3\).</li>
		<li>\([n]\mapsto\) the remainder of \(n\) on division by \(4\).</li>
		<li>\([n]\mapsto[2n]\in\Z/6\).</li>
		<li>\([n]\mapsto[n]\in\Z/3\) (a class modulo 6 goes to a class modulo 3).</li>
	</ol>
	{#snippet solution()}
		<ol type="a">
			<li>
				Well defined. Two representatives differ by \(6k\), and \(6k\) is a multiple of \(3\), so they leave the same remainder
				on division by \(3\).
			</li>
			<li>
				Not well defined: \([0] = [6]\), but \(0\) leaves remainder \(0\) and \(6\) leaves remainder \(2\) on division by \(4\).
			</li>
			<li>Well defined: if \(n' = n + 6k\), then \(2n' = 2n + 6(2k)\), so \([2n'] = [2n]\) in \(\Z/6\).</li>
			<li>
				Well defined: if \(n' = n+6k\) then \(n' - n = 3(2k)\) is a multiple of \(3\), so \([n'] = [n]\) in \(\Z/3\). (The
				reverse rule \(\Z/3\to\Z/6\), \([n]\mapsto[n]\), is <em>not</em> well defined: \([0]=[3]\) in \(\Z/3\) but \([0]\neq[3]\) in
				\(\Z/6\).)
			</li>
		</ol>
	{/snippet}
</Exercise>

<Exercise level={2} title="Adding fractions is well defined">
	<p>
		Using pairs \((a,b)\) with \(b\neq0\) and \((a,b)\sim(c,d)\iff ad=bc\), show that the rule \([(a,b)] + [(c,d)] =
		[(ad+bc,\ bd)]\) is well defined. (Change one representative at a time.)
	</p>
	{#snippet solution()}
		<p>
			Replace \((a,b)\) by an equivalent pair \((a',b')\), so \(ab' = a'b\), and keep \((c,d)\). We must show
			\((ad+bc,\ bd)\sim(a'd+b'c,\ b'd)\), that is,
		</p>
		\[ (ad+bc)\,b'd \;=\; bd\,(a'd+b'c). \]
		<p>
			Expand both sides: the left is \(ab'd^2 + bb'cd\), the right is \(a'bd^2 + bb'cd\). The terms \(bb'cd\) match, and
			\(ab'd^2 = a'bd^2\) because \(ab' = a'b\). So the two sides are equal. Changing \((c,d)\) is the same computation with the
			roles swapped, and changing both is changing one and then the other. (Also note \(bd\neq0\), so the answer is a legal
			pair.)
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="The plane, wrapped twice">
	<p>
		On \(\R^2\) declare \((x,y)\sim(x',y')\) when \(x - x'\in\Z\) and \(y-y'\in\Z\). Show that every class has exactly one
		representative in the half-open square \([0,1)\times[0,1)\). Which points of the closed square \([0,1]\times[0,1]\) are
		equivalent to each other, and what does that suggest the quotient \(\R^2/{\sim}\) looks like?
	</p>
	{#snippet solution()}
		<p>
			Every real number \(x\) can be written uniquely as \(x = m + r\) with \(m\in\Z\) and \(0\le r<1\) (take \(m\) to be the
			largest integer not exceeding \(x\)). Doing this to both coordinates gives the unique representative \((r,s)\in[0,1)^2\) of
			the class of \((x,y)\). In the closed square, a point \((0,y)\) on the left side is equivalent to \((1,y)\) on the right
			side, a point \((x,0)\) on the bottom to \((x,1)\) on the top, and all four corners to each other. That is exactly the
			gluing of Figure 1.2.7: the quotient is a torus.
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Counting corners">
	<p>
		A square has its four corners labelled \(BL, BR, TR, TL\) (bottom-left, and so on). (a) If we glue only the left side to the
		right side (at the same heights), how many classes do the corners form? (b) If we glue left to right and bottom to top, how
		many?
	</p>
	{#snippet solution()}
		<p>
			(a) Two: \(\set{BL,BR}\) and \(\set{TL,TR}\). The tube has two boundary circles, and each contains one of these points.
			(b) One: \(BL\sim BR\) and \(TL\sim TR\) from the first gluing, \(BL\sim TL\) and \(BR\sim TR\) from the second, and
			transitivity joins all four.
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Every function is a quotient in disguise">
	<p>
		Let \(f\colon X\to Y\) be any function, and let \(x\sim x'\) mean \(f(x)=f(x')\). Show that the rule \(\bar f([x]) = f(x)\)
		defines a well-defined function \(\bar f\colon X/{\sim}\to f(X)\), and that \(\bar f\) is a bijection onto the image \(f(X)\).
	</p>
	{#snippet hint()}
		<p>Well-definedness is immediate from the definition of \(\sim\). For injectivity, use the lemma \([x]=[x']\iff x\sim x'\).</p>
	{/snippet}
	{#snippet solution()}
		<p>
			<em>Well defined:</em> if \(x\sim x'\) then \(f(x) = f(x')\) by the very definition of \(\sim\). <em>Surjective onto
			\(f(X)\):</em> any element of \(f(X)\) is \(f(x) = \bar f([x])\) for some \(x\). <em>Injective:</em> if \(\bar f([x]) =
			\bar f([x'])\) then \(f(x)=f(x')\), so \(x\sim x'\), so \([x]=[x']\). Hence the quotient of \(X\) by “same output” is in
			perfect one-to-one correspondence with the set of outputs. This little fact grows up into the <em>First Isomorphism
			Theorem</em> of <Ref to="foundations/abelian-groups" />.
		</p>
	{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>A <strong>relation</strong> on \(X\) is a set of ordered pairs, \(R\subseteq X\times X\); we write \(x\sim y\) for \((x,y)\in R\).</li>
		<li>
			An <strong>equivalence relation</strong> is reflexive, symmetric and transitive — the three rules every notion of “the same”
			must obey. “Same answer to a question” relations, such as congruence modulo \(n\), are always equivalence relations.
		</li>
		<li>
			The <strong>class</strong> \([x]\) collects everything equivalent to \(x\). Classes are equal or disjoint and cover \(X\):
			they form a <strong>partition</strong>, and partitions and equivalence relations are the same thing.
		</li>
		<li>
			The <strong>quotient set</strong> \(X/{\sim}\) has one element per class; the <strong>projection</strong> \(q(x) = [x]\) is
			surjective and \(q(x)=q(y)\iff x\sim y\). A class is <em>one</em> element of the quotient, however many members it has.
		</li>
		<li>
			A rule on classes given through representatives is <strong>well defined</strong> when equivalent representatives give equal
			answers; then it factors through \(q\).
		</li>
		<li>
			<strong>Gluing</strong> is taking a quotient of a shape: \([0,1]\) with \(0\sim1\) and \(\R/\Z\) are circles, and a square
			with opposite sides glued is a torus (with all four corners becoming one point).
		</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading items={reading} />

<style>
	/* keep short formulas together with their punctuation */
	.nw {
		white-space: nowrap;
	}
</style>
