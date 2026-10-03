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
	import History from '$lib/components/prose/History.svelte';
	import Question from '$lib/components/prose/Question.svelte';
	import Notation from '$lib/components/prose/Notation.svelte';
	import Recap from '$lib/components/prose/Recap.svelte';
	import Exercise from '$lib/components/prose/Exercise.svelte';
	import Figure from '$lib/components/prose/Figure.svelte';
	import Term from '$lib/components/prose/Term.svelte';
	import Ref from '$lib/components/prose/Ref.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import VennLab from '$lib/figures/foundations/sets-and-functions/VennLab.svelte';
	import ProductGrid from '$lib/figures/foundations/sets-and-functions/ProductGrid.svelte';
	import TorusProduct from '$lib/figures/foundations/sets-and-functions/TorusProduct.svelte';
	import MapGallery from '$lib/figures/foundations/sets-and-functions/MapGallery.svelte';
	import ArrowLab from '$lib/figures/foundations/sets-and-functions/ArrowLab.svelte';
	import PreimageGraph from '$lib/figures/foundations/sets-and-functions/PreimageGraph.svelte';
	import CompositionAnimator from '$lib/figures/foundations/sets-and-functions/CompositionAnimator.svelte';
	import CommutativeSquare from '$lib/figures/foundations/sets-and-functions/CommutativeSquare.svelte';
	import CountingZigZag from '$lib/figures/foundations/sets-and-functions/CountingZigZag.svelte';

	const reading = [
		{
			title: 'Book of Proof, Chapters 1, 12 and 14',
			author: 'Richard Hammack',
			url: 'https://richardhammack.github.io/BookOfProof/',
			note: 'Sets (Ch. 1), functions, images and preimages (Ch. 12) and cardinality (Ch. 14), at exactly this level, with many worked exercises. Free.',
			kind: 'book' as const,
			free: true
		},
		{
			title: 'How to Prove It: A Structured Approach',
			author: 'Daniel J. Velleman',
			url: 'https://www.cambridge.org/core/books/how-to-prove-it/6D2965D625C6836CD4A785A2C843B3DA',
			note: 'Chapters 1, 5 and 8 cover sets, functions and countability, always showing how to turn definitions into proofs.',
			kind: 'book' as const
		},
		{
			title: 'Proofs: A Long-Form Mathematics Textbook',
			author: 'Jay Cummings',
			url: 'https://longformmath.com/proofs-book/',
			note: 'Conversational and generous with “scratch work”; its chapters on sets, functions and cardinality read like a patient tutor.',
			kind: 'book' as const
		},
		{
			title: 'A Survey of Venn Diagrams',
			author: 'Frank Ruskey and Mark Weston',
			url: 'https://www.combinatorics.org/files/Surveys/ds5/ds5v3-2005/VennEJC.html',
			note: 'For the curious: why four circles cannot make a Venn diagram, and the beautiful symmetric diagrams that can.',
			kind: 'web' as const,
			free: true
		},
		{
			title: 'There’s more to mathematics than rigour and proofs',
			author: 'Terence Tao',
			url: 'https://terrytao.wordpress.com/career-advice/theres-more-to-mathematics-than-rigour-and-proofs/',
			note: 'A short essay on why careful definitions like the ones in this chapter sharpen intuition rather than replace it.',
			kind: 'web' as const,
			free: true
		}
	];
</script>

<Epigraph author="David Hilbert" source="as reported by Otto Blumenthal (1935)">One must always be able to say, instead of ‘points, straight lines, and planes’, ‘tables, chairs, and beer mugs’.</Epigraph>

<p class="lead">
	Every object in this book — a triangle, a doughnut, a family of loops, a group of symmetries — is a <em>set</em> with some
	extra structure, and every way of comparing two objects is a <em>function</em>. This chapter teaches those two words slowly
	and carefully, with pictures, because every later chapter is written in them.
</p>

<Ahead>
	<p>
		Nearly every idea here returns. <strong>Preimages</strong> are how continuity will be defined in <Ref to="topology/spaces" />,
		and “pulling back” along a function is the engine of cohomology (<Ref to="cohomology/cochains" />). <strong
			>Injective and surjective</strong
		> grow up into <em>kernel</em> and <em>image</em> (<Ref to="foundations/groups" />). <strong>Bijections</strong> are the
		model for every notion of “same shape.” The <strong>Cartesian product</strong> of two circles is the torus. And
		<strong>commutative diagrams</strong> are the language in which homology’s greatest property — that it turns maps of spaces
		into maps of groups — is stated (<Ref to="homology/invariance" />).
	</p>
</Ahead>

<h2 id="sets">Sets: collections of things</h2>

<p>
	A <em>set</em> is a collection of things. The things in it are called its <em>elements</em> (or <em>members</em>). That is
	really all there is to it — but the word “collection” hides two important decisions, so let us make them explicit:
</p>

<ul>
	<li>
		<strong>A set knows only who is in it.</strong> Order does not matter, and neither does repetition. The only question you
		can ask a set is “is this thing one of your elements?”, and the answer is always yes or no.
	</li>
	<li>
		<strong>Anything can be an element.</strong> Numbers, points, words, shapes, functions — even other sets. This is Hilbert’s
		point in the epigraph: mathematics never cares what its objects <em>are</em>, only how they are related. A set of beer mugs is
		as good a set as a set of numbers.
	</li>
</ul>

<Definition title="Set, element" id="def-set">
	<p>
		A <dfn>set</dfn> is a collection of objects, called its <dfn>elements</dfn>. We write \(x\in X\), read “\(x\) is an element
		of \(X\)” or simply “\(x\) in \(X\),” when \(x\) is one of the elements of \(X\), and \(x\notin X\) when it is not. Two sets
		are <em>equal</em> when they have exactly the same elements.
	</p>
</Definition>

<p>
	The simplest way to describe a small set is to list its elements between curly braces, separated by commas. This is called
	<em>roster notation</em>:
</p>
\[ X = \set{1, 2, 3}, \qquad 2 \in X, \qquad 7 \notin X. \]
<p>
	Because a set only records membership, \(\set{1,2,3}\), \(\set{3,1,2}\) and \(\set{1,1,2,3}\) are three names for the same
	set: each has exactly the elements \(1\), \(2\) and \(3\). Listing an element twice does not put it in twice.
</p>

<p>
	For large or infinite sets we use “…” to say “continue the obvious pattern,” as in \(\set{1,2,3,\dots,100}\) or the set of
	all integers \(\set{\dots,-2,-1,0,1,2,\dots}\). Use the dots only when the pattern really is obvious.
</p>

<Example title="Sets of strange things">
	<p>All of the following are perfectly good sets:</p>
	<ul>
		<li>\(\set{\text{red}, \text{green}, \text{blue}}\), a set with three elements;</li>
		<li>\(\set{\pi, 7, \text{Paris}}\), a set whose elements have nothing in common except that we put them together;</li>
		<li>
			\(\set{1, \set{1}}\), a set with <em>two</em> elements: the number \(1\), and the set whose only element is \(1\). A box
			containing an apple is not the same thing as an apple.
		</li>
	</ul>
</Example>

<h3>The empty set</h3>

<p>
	There is exactly one set with no elements at all. It is called the <dfn>empty set</dfn> and written \(\varnothing\) (or
	sometimes \(\set{}\)). It may seem like a joke, but it is indispensable: it is the answer to questions such as “which real
	numbers satisfy \(x^2 = -1\)?”, and it will later play the role of zero for sets. Careful: \(\set{\varnothing}\) is
	<em>not</em> empty — it is an empty box inside a box, a set with one element.
</p>

<h3>The number systems</h3>

<Notation title="The number systems">
	<p>Four sets of numbers have permanent names, written in “blackboard bold” letters:</p>
	<ul>
		<li>\(\N = \set{0,1,2,3,\dots}\), the <em>natural numbers</em>. (Some books start at \(1\); in this book \(\N\) includes \(0\).)</li>
		<li>\(\Z = \set{\dots,-2,-1,0,1,2,\dots}\), the <em>integers</em> (from the German <em>Zahlen</em>, “numbers”).</li>
		<li>\(\Q\), the <em>rational numbers</em>: fractions \(\tfrac ab\) of integers with \(b\neq0\) (\(\Q\) for “quotient”).</li>
		<li>\(\R\), the <em>real numbers</em>: all the points of the number line, including \(\sqrt2\) and \(\pi\).</li>
	</ul>
	<p>
		Each sits inside the next: every natural number is an integer, every integer is a fraction (\(5 = \tfrac51\)), and every
		fraction is a real number. We also use <em>intervals</em> of real numbers: \([a,b]\) contains both endpoints, \((a,b)\) contains
		neither, and \([a,b)\) contains \(a\) but not \(b\). The <em>unit interval</em> \(I = [0,1]\) will be everywhere in this
		book.
	</p>
</Notation>

<h3>Set-builder notation</h3>

<p>
	Most sets are described not by listing their elements but by a property the elements share. The notation for this is called
	<em>set-builder notation</em>:
</p>
\[ \setb{x \in X}{P(x)} \]
<p>
	read “the set of all \(x\) in \(X\) such that \(P(x)\).” The vertical bar means “such that”; some books use a colon instead,
	writing \(\{x\in X : P(x)\}\). Here \(X\) is a set we already know, and \(P(x)\) is a statement about \(x\) that is either true
	or false. The new set contains exactly those elements of \(X\) for which \(P(x)\) is true.
</p>

<Example title="Reading set-builder notation">
	<ul>
		<li>
			\(\setb{n\in\Z}{n = 2k \text{ for some } k\in\Z}\) is “the set of integers that are twice an integer” — the even numbers
			\(\set{\dots,-4,-2,0,2,4,\dots}\).
		</li>
		<li>\(\setb{x\in\R}{x^2<4}\) is the set of real numbers whose square is less than \(4\): the open interval \((-2,2)\).</li>
		<li>\(\setb{x\in\R}{x^2 = -1} = \varnothing\): no real number qualifies.</li>
		<li>
			\(S^1 = \setb{(x,y)\in\R^2}{x^2+y^2=1}\) is the set of points of the plane at distance \(1\) from the origin: the unit
			circle. (We will explain \(\R^2\) properly in a moment.) This set will be the star of many chapters.
		</li>
	</ul>
</Example>

<h3 id="subsets">Subsets</h3>

<p>
	The most basic relationship between two sets is that one is contained in the other.
</p>

<Definition title="Subset" id="def-subset">
	<p>
		\(A\) is a <dfn>subset</dfn> of \(B\), written \(A\subseteq B\) and read “\(A\) is contained in \(B\),” if every element of
		\(A\) is also an element of \(B\). If moreover \(A\neq B\), we say \(A\) is a <em>proper</em> subset and may write
		\(A\subsetneq B\).
	</p>
</Definition>

<ul>
	<li>\(\set{1,3}\subseteq\set{1,2,3}\), and \(\N\subseteq\Z\subseteq\Q\subseteq\R\).</li>
	<li>Every set is a subset of itself: \(A\subseteq A\).</li>
	<li>
		The empty set is a subset of every set: \(\varnothing\subseteq A\). Why? The definition demands “every element of \(\varnothing\)
		is in \(A\).” Since \(\varnothing\) has no elements, there is nothing to check, and the statement is true — this is a <Term
			t="vacuous-truth">vacuous truth</Term
		>, as explained in <Ref to="prelude/reading-math" />.
	</li>
</ul>

<Warning title="∈ is not ⊆">
	<p>
		\(\in\) relates an <em>element</em> to a set; \(\subseteq\) relates a <em>set</em> to a set. So \(1\in\set{1,2}\) and
		\(\set1\subseteq\set{1,2}\), but \(1\subseteq\set{1,2}\) is meaningless and \(\set1\in\set{1,2}\) is false. A second warning:
		some authors write \(A\subset B\) for “subset” and others for “proper subset.” In this book we avoid the ambiguity by always
		writing \(\subseteq\) or \(\subsetneq\).
	</p>
</Warning>

<p>
	Since two sets are equal exactly when they have the same elements, \(A = B\) means precisely that \(A\subseteq B\)
	<em>and</em> \(B\subseteq A\). This gives the standard way to prove that two sets are equal, the <Term
		t="double-inclusion">double inclusion</Term
	> proof: show that every element of the first is in the second, then that every element of the second is in the first. You
	will see this proof shape many times.
</p>

<h2 id="operations">Union, intersection, difference, complement</h2>

<p>
	Just as numbers can be added and multiplied, sets can be combined to make new sets. There are four basic operations. In each
	definition, read the set-builder notation aloud; the symbols are shorthand for ordinary words.
</p>

<Definition title="Union, intersection, difference, complement" id="def-set-operations">
	<p>For sets \(A\) and \(B\):</p>
	<ul>
		<li>the <dfn>union</dfn> \(A\cup B = \setb{x}{x\in A \text{ or } x\in B}\) (“\(A\) union \(B\)”) collects everything in either set;</li>
		<li>the <dfn>intersection</dfn> \(A\cap B = \setb{x}{x\in A\text{ and }x\in B}\) (“\(A\) intersect \(B\)”) keeps what they share;</li>
		<li>the <dfn>difference</dfn> \(A\setminus B = \setb{x\in A}{x\notin B}\) (“\(A\) minus \(B\)”) removes from \(A\) whatever is in \(B\);</li>
		<li>
			if all the sets we are discussing live inside one big set \(U\) (a <em>universe</em>), the <dfn>complement</dfn> of \(A\) is
			\(A^c = U\setminus A\), everything in the universe that is not in \(A\).
		</li>
	</ul>
	<p>Two sets with no common element, \(A\cap B = \varnothing\), are called <em>disjoint</em>.</p>
</Definition>

<p>
	The “or” in the definition of union is <em>inclusive</em>: an element that is in both \(A\) and \(B\) is certainly in \(A\cup
	B\). This is the standard meaning of “or” in mathematics (see <Ref to="prelude/reading-math" />). The pictures that make these
	operations vivid are <em>Venn diagrams</em>: draw the universe as a rectangle and each set as a disk; then each operation
	shades a region.
</p>

<Figure size="wide" title="A Venn diagram laboratory" hint="Choose an operation · switch on a third set" num="1.1.1">
	<VennLab />
	{#snippet caption()}
		The universe is \(U = \set{1,\dots,12}\), with \(A\) the even numbers and \(B\) the multiples of \(3\). Each button shades a
		set and lists its elements. Compare \((A\cup B)^c\) with \(A^c\cap B^c\): they always shade the same region. With three sets,
		notice the middle region \(A\cap B\cap C\) is drawn but empty — a picture of a set is not the set.
	{/snippet}
</Figure>

<p>
	Playing with the figure, you discover <em>laws</em> — equations between sets that hold no matter what the sets are. The two
	most useful are named after Augustus De Morgan:
</p>
\[ (A\cup B)^c = A^c\cap B^c, \qquad (A\cap B)^c = A^c\cup B^c. \]
<p>
	In words: not being in either set is the same as being outside both; not being in both is the same as being outside at least
	one. If you have read <Ref to="prelude/reading-math" />, you will recognize these as the rules for negating “or” and “and.”
	That is no coincidence: \(x\in A\cup B\) <em>is</em> the statement “\(x\in A\) or \(x\in B\),” so set operations are logical
	connectives in disguise.
</p>

<Proof title="of the first De Morgan law, by double inclusion">
	<p>
		(\(\subseteq\)) Let \(x\in(A\cup B)^c\). Then \(x\) is not in \(A\cup B\), so it is not true that “\(x\in A\) or \(x\in B\).”
		Hence \(x\notin A\) and \(x\notin B\), that is, \(x\in A^c\) and \(x\in B^c\), so \(x\in A^c\cap B^c\).
	</p>
	<p>
		(\(\supseteq\)) Let \(x\in A^c\cap B^c\). Then \(x\notin A\) and \(x\notin B\), so \(x\) is in neither set, so \(x\notin
		A\cup B\), that is, \(x\in(A\cup B)^c\).
	</p>
</Proof>

<Warning title="Pictures illustrate; they do not prove">
	<p>
		Venn diagrams are wonderful for two or three sets and useless beyond that: four circles in the plane can make at most 14 of
		the 16 regions needed to show every combination of four sets, so a correct diagram needs other shapes. More importantly, a
		diagram always draws every region, even when the region is empty, and it cannot show infinite or complicated sets. Use the
		pictures to <em>guess</em>; use the definitions (as in the proof above) to <em>know</em>.
	</p>
</Warning>

<p>
	Unions and intersections also make sense for more than two sets — even infinitely many. If \(A_1, A_2, A_3,\dots\) are sets,
	\(\bigcup_n A_n\) is the set of things lying in <em>at least one</em> \(A_n\), and \(\bigcap_n A_n\) the set of things lying
	in <em>every</em> \(A_n\). For example, the intervals \([\tfrac1n, 1]\) grow as \(n\) grows, and their union is \(\bigcup_{n\ge1}
	[\tfrac1n,1] = (0,1]\): every number between \(0\) and \(1\) eventually gets included, but \(0\) itself never does. Such unions
	will appear when we glue spaces together out of many pieces.
</p>

<h2 id="products">Ordered pairs and the Cartesian product</h2>

<p>
	A set does not remember order. Very often, though, order matters: the point \((2,5)\) in the plane is not the point \((5,2)\).
	So we introduce a new kind of object.
</p>

<Definition title="Ordered pair, Cartesian product" id="def-product">
	<p>
		An <dfn>ordered pair</dfn> \((a,b)\) consists of a first entry \(a\) and a second entry \(b\); two ordered pairs are equal,
		\((a,b) = (c,d)\), exactly when \(a = c\) and \(b = d\). The <dfn>Cartesian product</dfn> of sets \(A\) and \(B\) is the set
		of all ordered pairs with first entry in \(A\) and second entry in \(B\):
	</p>
	\[ A\times B = \setb{(a,b)}{a\in A,\ b\in B}, \]
	<p>read “\(A\) cross \(B\).”</p>
</Definition>

<p>
	The best picture of a product is a grid. Put the elements of \(A\) along a horizontal axis and the elements of \(B\) along a
	vertical axis; then each dot of the grid is one ordered pair. In particular, if \(A\) has \(m\) elements and \(B\) has \(n\),
	the grid has \(m\) columns and \(n\) rows, so
</p>
\[ \abs{A\times B} = \abs{A}\cdot\abs{B}, \]
<p>where \(\abs{X}\) (read “the size of \(X\)”) denotes the number of elements of a finite set.</p>

<Figure size="wide" title="A × B is a grid" hint="Tap a dot · change the sizes · swap the order" num="1.1.2">
	<ProductGrid />
	{#snippet caption()}
		Every dot is an ordered pair. The dashed lines drop from a dot to its two coordinates: reading off the first coordinate and
		the second coordinate are the two <em>projections</em> \(A\times B\to A\) and \(A\times B\to B\). Swapping to \(B\times A\)
		transposes the grid: \((3,b)\) and \((b,3)\) are different pairs in different sets.
	{/snippet}
</Figure>

<p>
	The most famous product is the plane, \(\R^2 = \R\times\R\), the set of all pairs \((x,y)\) of real numbers. Likewise \(\R^3\)
	is the set of triples \((x,y,z)\), and \(\R^n\) the set of \(n\)-tuples. The unit square is the product of two unit intervals,
	\(I\times I = [0,1]\times[0,1]\).
</p>

<History title="Descartes’ grid">
	<p>
		The product is named after René Descartes, whose <em>La Géométrie</em> (1637) showed how to describe points of the plane by
		pairs of numbers and curves by equations — turning geometry into algebra. Every graph you have ever drawn lives in his grid,
		\(\R\times\R\).
	</p>
</History>

<p>
	Products of shapes are shapes. Here is the example that matters most for us. A point of the circle \(S^1\) can be described by
	an angle; a point of \(S^1\times S^1\) is therefore a <em>pair</em> of angles \((\theta,\varphi)\). And there is a surface whose
	points are described by exactly such pairs: the torus. Going once around the doughnut’s hole changes the first angle; going once
	around its tube changes the second.
</p>

<Figure size="wide" title="The torus is a product of two circles" hint="Turn the dials · drag the torus to rotate" num="1.1.3">
	<TorusProduct />
	{#snippet caption()}
		Each point of the torus is an ordered pair: an angle \(\theta\) on the first circle and an angle \(\varphi\) on the second.
		Fixing \(\varphi\) and letting \(\theta\) vary traces the gold circle — a “row” of the product, just like a row of the grid
		above; fixing \(\theta\) traces the teal “column.” So \(T^2 = S^1\times S^1\).
	{/snippet}
</Figure>

<h2 id="functions">Functions: rules with a domain and a codomain</h2>

<p>
	Sets on their own are just bags of elements. Mathematics happens when we <em>compare</em> sets, and the tool for comparing is
	the function. You probably met functions as formulas like \(f(x) = x^2\). That is one way to describe a function, but the
	idea is both simpler and more general.
</p>

<Definition title="Function" id="def-function">
	<p>
		A <dfn>function</dfn> (or <dfn>map</dfn>) \(f\) from a set \(X\) to a set \(Y\) is a rule that assigns to <em>each</em>
		element \(x\in X\) <em>exactly one</em> element \(f(x)\in Y\). We write \(f\colon X\to Y\), read “\(f\) from \(X\) to \(Y\).”
		The set \(X\) is the <dfn>domain</dfn> of \(f\) and \(Y\) is its <dfn>codomain</dfn>. The element \(f(x)\) is the
		<em>value</em> of \(f\) at \(x\), or the <em>image</em> of \(x\).
	</p>
</Definition>

<p>
	The definition contains two demands, and both matter. <strong>Every</strong> element of the domain must be assigned something
	— no input is left out. And each is assigned <strong>exactly one</strong> thing — no input gets two outputs. Nothing at all is
	demanded of the codomain: some elements of \(Y\) may be hit many times, others never.
</p>

<Notation title="Two kinds of arrow">
	<p>
		To specify a function we often write \(x\mapsto x^2\), read “\(x\) maps to \(x\) squared.” The barred arrow \(\mapsto\) goes
		between <em>elements</em> and says where one element goes; the plain arrow \(\to\) goes between <em>sets</em> and says where
		the whole function goes from and to. A complete description reads: \(f\colon\R\to\R\), \(x\mapsto x^2\).
	</p>
</Notation>

<p>The best way to see the two demands is an <em>arrow diagram</em>: dots for the elements, an arrow from each \(x\) to \(f(x)\).</p>

<Figure size="wide" title="Six arrow diagrams" num="1.1.4">
	<MapGallery />
	{#snippet caption()}
		The first two diagrams are not functions: one element of \(X\) has no arrow, or two. The other four are functions, sorted by
		two questions you will meet in a moment — do two arrows ever land on the same point (amber), and is some point of \(Y\) never
		hit (dashed violet)?
	{/snippet}
</Figure>

<Example title="A gallery of functions">
	<ul>
		<li>\(f\colon\R\to\R\), \(f(x) = x^2\). Every real number has exactly one square.</li>
		<li>
			<em>Birthday</em>: from the set of all people to the set of 366 possible days of the year. No formula, but a perfectly good
			function: each person has exactly one birthday.
		</li>
		<li>A <em>constant</em> function \(c\colon X\to Y\), \(c(x) = y_0\) for every \(x\): everything goes to the same place.</li>
		<li>
			The <dfn>identity</dfn> function \(\id_X\colon X\to X\), \(\id_X(x) = x\): every element stays where it is. It sounds
			pointless, but it plays the role that the number \(1\) plays for multiplication.
		</li>
		<li>
			If \(A\subseteq X\), the <em>inclusion</em> \(\iota\colon A\to X\), \(\iota(a) = a\) (\(\iota\) is the Greek letter iota),
			regards each element of \(A\) as an element of the bigger set \(X\).
		</li>
		<li>
			The <em>projections</em> of a product, \(p_1\colon A\times B\to A\), \((a,b)\mapsto a\), and \(p_2\colon A\times B\to B\),
			\((a,b)\mapsto b\), read off one coordinate.
		</li>
	</ul>
</Example>

<Example title="A non-example, and how to repair it">
	<p>
		Is “the square root” a function \(\R\to\R\)? No, for two reasons. The input \(-4\) has no square root at all (an input with
		no arrow), and the input \(4\) has two, \(2\) and \(-2\) (an input with two arrows). Both defects can be repaired by changing
		the domain and making a choice: \(\sqrt{\phantom{x}}\colon[0,\infty)\to\R\), sending \(x\) to its <em>non-negative</em> square
		root, is a function.
	</p>
</Example>

<KeyIdea>
	<p>
		A function is not a formula. It is three pieces of data: a domain, a codomain, and an assignment of exactly one output to
		each input. The same formula with a different domain or codomain is a different function — and, as we are about to see, it can
		have completely different properties.
	</p>
</KeyIdea>

<Remark title="What a function “really” is">
	<p>
		In the foundations of mathematics, a function \(f\colon X\to Y\) is defined to be its <em>graph</em>: the subset
		\(\setb{(x,f(x))}{x\in X}\subseteq X\times Y\). The two demands become: for each \(x\in X\) there is exactly one pair in the
		graph with first entry \(x\). This makes “function” a kind of set, so that nothing beyond sets is needed. In practice, think of
		arrows.
	</p>
</Remark>

<h2 id="kinds">Injective, surjective, bijective</h2>

<p>
	Two natural questions can be asked of any function, and they are the questions marked in the gallery: <em>do different inputs
	ever collide?</em> and <em>is anything in the codomain missed?</em>
</p>

<Definition title="Injective, surjective, bijective" id="def-injective">
	<p>Let \(f\colon X\to Y\).</p>
	<ul>
		<li>
			\(f\) is <dfn>injective</dfn> (or <em>one-to-one</em>) if different inputs always give different outputs: for all
			\(x,x'\in X\), if \(f(x) = f(x')\) then \(x = x'\). <em>No collisions.</em>
		</li>
		<li>
			\(f\) is <dfn>surjective</dfn> (or <em>onto</em>) if every element of the codomain is hit: for every \(y\in Y\) there is some
			\(x\in X\) with \(f(x) = y\). <em>No misses.</em>
		</li>
		<li>
			\(f\) is <dfn>bijective</dfn> if it is both injective and surjective. <em>A perfect matching</em>: every element of \(Y\) is
			hit by exactly one element of \(X\).
		</li>
	</ul>
</Definition>

<p>
	Read the definition of injective in its other form, the <Term t="contrapositive">contrapositive</Term>: if \(x\neq x'\) then
	\(f(x)\neq f(x')\). That is the “no collisions” picture. And notice the order of the quantifiers in “surjective”: <em>for
	every</em> \(y\) <em>there is</em> an \(x\). The \(x\) is allowed to depend on \(y\); swapping the order would say something
	quite different (see <Ref to="prelude/reading-math" hash="quantifiers" />). Injections are sometimes drawn with a hooked arrow,
	\(X\hookrightarrow Y\), and surjections with a double-headed one, \(X\twoheadrightarrow Y\).
</p>

<Figure size="wide" title="The arrow-diagram lab" hint="Tap a dot in X, then a dot in Y, to draw or erase an arrow" num="1.1.5" id="fig-arrow-lab">
	<ArrowLab />
	{#snippet caption()}
		Draw any arrows you like between \(X\) and \(Y\). The badges decide whether you have drawn a function and, if so, whether it is
		injective, surjective or bijective, naming a witness whenever the answer is no. Can you make a bijection when \(X\) and \(Y\)
		have different sizes? (Try, then read the pigeonhole principle below.) The other two modes explore images and preimages.
	{/snippet}
</Figure>

<Example title="One formula, four functions">
	<p>The formula \(x\mapsto x^2\) gives four different functions, depending on the domain and codomain:</p>
	<div class="table-wrap">
		<table>
			<thead><tr><th>Function</th><th>Injective?</th><th>Surjective?</th></tr></thead>
			<tbody>
				<tr><td>\(\R\to\R\)</td><td>no: \((-2)^2 = 2^2\)</td><td>no: \(-1\) is missed</td></tr>
				<tr><td>\([0,\infty)\to\R\)</td><td>yes</td><td>no: \(-1\) is missed</td></tr>
				<tr><td>\(\R\to[0,\infty)\)</td><td>no: \((-2)^2 = 2^2\)</td><td>yes</td></tr>
				<tr><td>\([0,\infty)\to[0,\infty)\)</td><td>yes</td><td>yes: a bijection</td></tr>
			</tbody>
		</table>
	</div>
	<p>
		Shrinking the domain removes collisions; shrinking the codomain removes misses. Being injective or surjective is a property
		of the whole package, not of the formula.
	</p>
</Example>

<h3>The pigeonhole principle</h3>

<p>
	For finite sets, injectivity has a famous consequence. If you put 10 pigeons into 9 holes, some hole receives at least two
	pigeons. In our language:
</p>

<Proposition title="Pigeonhole principle" id="prop-pigeonhole">
	<p>If \(X\) and \(Y\) are finite and \(\abs{X}>\abs{Y}\), then no function \(X\to Y\) is injective.</p>
</Proposition>

<p>
	For example, among any 367 people, two share a birthday (there are only 366 possible days). Turned around: an injection
	\(X\to Y\) between finite sets forces \(\abs{X}\le\abs{Y}\), a surjection forces \(\abs{X}\ge\abs{Y}\), and a bijection forces
	\(\abs{X}=\abs{Y}\). This last fact is the real meaning of counting, as we will see at the end of the chapter.
</p>

<h2 id="images-preimages">Images and preimages</h2>

<p>
	A function sends elements to elements. It also sends <em>sets</em> to sets, in two directions — and the backwards direction
	turns out to be the more important one.
</p>

<Definition title="Image and preimage" id="def-preimage">
	<p>Let \(f\colon X\to Y\), let \(A\subseteq X\) and \(B\subseteq Y\).</p>
	<ul>
		<li>
			The <dfn>image</dfn> of \(A\) is \(f(A) = \setb{f(a)}{a\in A}\subseteq Y\): <em>where the elements of \(A\) land</em>. The
			image of the whole domain, \(f(X)\), is called the image (or range) of \(f\).
		</li>
		<li>
			The <dfn>preimage</dfn> of \(B\) is \(f^{-1}(B) = \setb{x\in X}{f(x)\in B}\subseteq X\): <em>everyone who lands in
			\(B\)</em>.
		</li>
	</ul>
</Definition>

<p>
	Images go forward, from subsets of \(X\) to subsets of \(Y\). Preimages go backward, from subsets of \(Y\) to subsets of \(X\).
	The notation \(f^{-1}\) suggests an inverse function, but no inverse is needed: as Hammack puts it in <em>Book of Proof</em>,
	\(f^{-1}(B)\) “has a meaning even if \(f\) is not invertible.” To compute it, you never undo \(f\); you simply go through the
	elements of \(X\) one at a time and ask each one, “do you land in \(B\)?”
</p>

<Example title="Images and preimages under squaring">
	<p>For \(f\colon\R\to\R\), \(f(x) = x^2\):</p>
	<ul>
		<li>\(f([-1,2]) = [0,4]\): the squares of numbers between \(-1\) and \(2\) fill out everything from \(0\) to \(4\).</li>
		<li>\(f^{-1}([1,4]) = [-2,-1]\cup[1,2]\): a number has square between \(1\) and \(4\) when its size is between \(1\) and \(2\), on either side of zero.</li>
		<li>\(f^{-1}(\set4) = \set{-2,2}\), and \(f^{-1}([-3,-1]) = \varnothing\): no square is negative.</li>
	</ul>
</Example>

<Figure size="wide" title="Image and preimage on a graph" hint="Drag the round handles · switch modes" num="1.1.6">
	<PreimageGraph />
	{#snippet caption()}
		The preimage of an interval \(B\) on the vertical axis: draw the band, see where it cuts the curve, and drop down to the
		horizontal axis. Watch the answer change from two pieces to one piece to nothing as you move \(B\) down. In image mode, an
		interval \(A\) is carried up to \(f(A)\).
	{/snippet}
</Figure>

<p>
	The arrow-diagram lab above has image and preimage modes too: switch to them and try a function that is not injective. The
	preimage of a single point, \(f^{-1}(\set{y})\), is the set of all solutions of the equation \(f(x) = y\). This gives a neat
	way to restate the last section: \(f\) is surjective when every \(f^{-1}(\set y)\) is non-empty, and injective when every
	\(f^{-1}(\set y)\) has at most one element.
</p>

<h3>Preimages are better behaved than images</h3>

<p>Preimages respect every set operation:</p>
\[ f^{-1}(B\cup C) = f^{-1}(B)\cup f^{-1}(C),\qquad f^{-1}(B\cap C) = f^{-1}(B)\cap f^{-1}(C),\qquad f^{-1}(B^c) = f^{-1}(B)^c. \]
<p>
	Each one is a one-line check, because membership of \(x\) in a preimage is decided by a single question about the single
	element \(f(x)\). For instance, \(x\in f^{-1}(B\cap C)\) means \(f(x)\in B\cap C\), which means \(f(x)\in B\) and \(f(x)\in C\),
	which means \(x\in f^{-1}(B)\) and \(x\in f^{-1}(C)\).
</p>

<p>
	Images respect unions, \(f(A\cup A') = f(A)\cup f(A')\), but <em>not</em> intersections. Take \(f(x) = x^2\), \(A = \set{-1}\)
	and \(A' = \set{1}\). Then \(A\cap A' = \varnothing\), so \(f(A\cap A') = \varnothing\); but \(f(A) = f(A') = \set1\), so
	\(f(A)\cap f(A') = \set1\). The collision \(f(-1) = f(1)\) is to blame: two different inputs merged, and the image cannot tell
	that they came from disjoint sets.
</p>

<Intuition title="Why topology prefers preimages">
	<p>
		This asymmetry is not a curiosity. In <Ref to="topology/spaces" /> we will define a function between shapes to be
		<em>continuous</em> when the preimage of every “open” set is open — precisely because preimages, unlike images, behave well.
		And in cohomology, measurements on a space are carried <em>backwards</em> along maps, exactly like preimages: if
		\(g\colon Y\to\R\) is a temperature reading on \(Y\), then \(g\circ f\) is a temperature reading on \(X\). Remember the
		slogan: <em>points push forward; questions pull back.</em>
	</p>
</Intuition>

<h2 id="composition">Composition and inverses</h2>

<p>
	If \(f\) takes you from \(X\) to \(Y\), and \(g\) takes you from \(Y\) onward to \(Z\), you can do one after the other.
</p>

<Definition title="Composition" id="def-composition">
	<p>
		Given \(f\colon X\to Y\) and \(g\colon Y\to Z\), their <dfn>composite</dfn> is the function \(g\circ f\colon X\to Z\)
		defined by
	</p>
	\[ (g\circ f)(x) = g\big(f(x)\big). \]
	<p>Read \(g\circ f\) as “\(g\) after \(f\)” (or “\(g\) composed with \(f\)”).</p>
</Definition>

<p>
	The order looks backwards at first: \(g\circ f\) means <em>first</em> \(f\), <em>then</em> \(g\). The reason is that we write
	functions on the left of their inputs. In \(g(f(x))\), the function closest to \(x\) acts first. Reading “\(g\) after \(f\)”
	keeps you right. Notice also the requirement that \(f\) lands where \(g\) starts: the codomain of \(f\) must be the domain of
	\(g\).
</p>

<Figure size="wide" title="Composition, step by step" hint="Step or play · tap a person to trace them" num="1.1.7">
	<CompositionAnimator />
	{#snippet caption()}
		\(f\) sends each person to their city, \(g\) sends each city to its country; the composite \(g\circ f\) sends each person
		directly to their country. The middle set is used and then forgotten. (Rio is in \(Y\) but nobody lives there; \(g\) still
		has to say where it goes, and \(g\circ f\) does not care.)
	{/snippet}
</Figure>

<Example title="Order matters">
	<p>
		Let \(f,g\colon\R\to\R\) with \(f(x) = x+1\) and \(g(x) = x^2\). Then \((g\circ f)(x) = g(x+1) = (x+1)^2\), while \((f\circ
		g)(x) = f(x^2) = x^2+1\). At \(x = 1\) these give \(4\) and \(2\). So \(g\circ f\neq f\circ g\): adding one and then squaring is
		not the same as squaring and then adding one.
	</p>
</Example>

<p>Composition has two properties that make it behave like multiplication of numbers (except that the order matters):</p>

<ul>
	<li>
		<strong>Associativity.</strong> For \(f\colon X\to Y\), \(g\colon Y\to Z\), \(h\colon Z\to W\): \(h\circ(g\circ f) = (h\circ
		g)\circ f\), because both send \(x\) to \(h(g(f(x)))\). So we can drop the parentheses and write \(h\circ g\circ f\).
	</li>
	<li>
		<strong>Identities.</strong> \(f\circ\id_X = f\) and \(\id_Y\circ f = f\): doing nothing before or after \(f\) changes
		nothing.
	</li>
</ul>

<h3 id="inverses">Undoing a function: inverses</h3>

<p>
	Some functions can be undone. Doubling, \(x\mapsto 2x\) on \(\R\), is undone by halving. Squaring on \(\R\) cannot be undone:
	from the output \(4\) you cannot tell whether the input was \(2\) or \(-2\).
</p>

<Definition title="Inverse function" id="def-inverse">
	<p>
		A function \(g\colon Y\to X\) is an <dfn>inverse</dfn> of \(f\colon X\to Y\) if \(g\circ f = \id_X\) and \(f\circ g = \id_Y\):
		doing \(f\) then \(g\) brings every \(x\) back to itself, and doing \(g\) then \(f\) brings every \(y\) back to itself.
	</p>
</Definition>

<Theorem title="Which functions can be undone" id="thm-inverse">
	<p>A function has an inverse if and only if it is bijective. In that case the inverse is unique, and we call it \(f^{-1}\).</p>
</Theorem>

<Proof>
	<p>
		Suppose \(f\) has an inverse \(g\). If \(f(x) = f(x')\), apply \(g\): \(x = g(f(x)) = g(f(x')) = x'\), so \(f\) is injective.
		Any \(y\in Y\) equals \(f(g(y))\), so it is hit: \(f\) is surjective.
	</p>
	<p>
		Conversely, suppose \(f\) is bijective. Then each \(y\in Y\) is hit by exactly one \(x\in X\) — at least one by surjectivity,
		at most one by injectivity. Define \(g(y)\) to be that \(x\). Then \(g(f(x)) = x\) and \(f(g(y)) = y\) by construction. If
		\(g'\) were another inverse, then \(g' = g'\circ\id_Y = g'\circ f\circ g = \id_X\circ g = g\), so the inverse is unique.
	</p>
</Proof>

<p>
	In the arrow picture, inverting a bijection simply means <em>reversing every arrow</em>. That only produces a function when
	every element of \(Y\) receives exactly one arrow, which is exactly bijectivity.
</p>

<Warning title="Two meanings of f⁻¹">
	<p>
		The symbol \(f^{-1}\) is used for two different things. Applied to a <em>set</em>, \(f^{-1}(B)\) is the preimage, which
		<em>always</em> exists. Applied to an <em>element</em>, \(f^{-1}(y)\) is the value of the inverse function, which exists
		<em>only</em> when \(f\) is bijective. When \(f\) is bijective the two agree: \(f^{-1}(\set y) = \set{f^{-1}(y)}\). (A third
		meaning, \(1/f(x)\), is never intended in this book.)
	</p>
</Warning>

<p>
	Bijections are the mathematical meaning of “the same, up to renaming.” If there is a bijection between two sets, then as
	<em>sets</em> they are indistinguishable: rename each element of \(X\) by its partner in \(Y\). Every later notion of sameness —
	isomorphic groups, homeomorphic spaces — is a bijection that also respects some extra structure.
</p>

<h2 id="diagrams">Dots and arrows: commutative diagrams</h2>

<p>
	When several sets and functions are in play at once, mathematicians draw them as a <em>diagram</em>: a dot (or a letter) for
	each set, an arrow for each function. A path of arrows stands for the composite of its functions.
</p>

<Definition title="Commutative diagram" id="def-commutative-diagram">
	<p>
		A diagram of sets and functions <dfn>commutes</dfn> if, whenever two paths of arrows start at the same set and end at the
		same set, their composites are equal. For the square
	</p>
	\[
	\begin{CD}
	A @>{f}>> B \\
	@V{h}VV @VV{g}V \\
	C @>{k}>> D
	\end{CD}
	\]
	<p>this means \(g\circ f = k\circ h\): going right then down gives the same function as going down then right.</p>
</Definition>

<p>
	“Commutes” here has nothing to do with \(a+b = b+a\). It means “all roads lead to the same place”: start with any element of
	the top-left set, follow either path, and you arrive at the same element of the bottom-right set. And “any element” is the
	crucial part.
</p>

<Figure size="wide" title="All roads lead to the same place" hint="Pick x · change the bottom map · press the gold button" num="1.1.8">
	<CommutativeSquare />
	{#snippet caption()}
		Four copies of \(\Z\) and four maps. With \(k(y) = y+2\) both roads send \(x\) to \(2x+2\), for every \(x\): the square
		commutes. With \(k(y) = 2y\) the roads agree at \(x=1\) but nowhere else — and agreeing at one input is not enough.
	{/snippet}
</Figure>

<p>
	It is worth knowing the vocabulary that grows out of these pictures, because you will meet it again. Sets are the
	<em>objects</em>, functions are the <em>arrows</em>, arrows can be composed when they meet end to end, composition is
	associative, and every object has an identity arrow. A collection of objects and arrows with these properties is called a
	<em>category</em>; sets and functions form the most basic one. In <Ref to="big-picture/categories" /> we will make this precise,
	and in <Ref to="homology/invariance" /> we will see homology turn a commutative diagram of spaces into a commutative diagram of
	groups — which is how it proves theorems.
</p>

<h2 id="counting">Counting: finite and infinite</h2>

<p>
	What does it mean to say a set has five elements? When a child counts five apples, they point at the apples one at a time
	while saying “one, two, three, four, five.” They are building a bijection between the apples and the set \(\set{1,2,3,4,5}\).
	That is the definition.
</p>

<Definition title="Cardinality" id="def-cardinality">
	<p>
		A set \(X\) has \(n\) elements, written \(\abs{X} = n\), if there is a bijection \(\set{1,2,\dots,n}\to X\) (and
		\(\abs{\varnothing} = 0\)). Such a set is <em>finite</em>. More generally, two sets have the <dfn>same cardinality</dfn> (the
		same size) if there is a bijection between them.
	</p>
</Definition>

<p>For finite sets, a few counting rules will be used constantly:</p>

<ul>
	<li>\(\abs{A\cup B} = \abs{A}+\abs{B}-\abs{A\cap B}\): add the sizes, then subtract what was counted twice.</li>
	<li>\(\abs{A\times B} = \abs A\cdot\abs B\), the grid.</li>
	<li>
		There are \(\abs{Y}^{\abs{X}}\) functions \(X\to Y\): each of the \(\abs X\) elements of \(X\) independently chooses one of the
		\(\abs Y\) possible destinations.
	</li>
	<li>
		A set with \(n\) elements has \(2^n\) subsets. Each subset is decided by \(n\) independent yes/no switches, one per element
		(“in or out?”). The set of all subsets of \(X\) is called its <dfn>power set</dfn>, \(\mathcal P(X)\). This “subsets are
		strings of switches” idea will reappear when we compute holes with on/off labels in <Ref to="homology/chains" />.
	</li>
</ul>

<h3>Infinite sets</h3>

<p>
	The definition “same size means there is a bijection” makes sense for infinite sets too, and it leads to surprises. The map
	\(n\mapsto 2n\) is a bijection from \(\N\) to the even natural numbers, so there are “as many” even numbers as natural
	numbers, although the evens are a proper subset. Infinite sets can have the same size as a part of themselves.
</p>

<p>
	A set is called <dfn>countable</dfn> if it is finite or has the same cardinality as \(\N\): if its elements can be listed as a
	first, a second, a third, and so on, with every element appearing somewhere in the list. The integers are countable, even
	though they stretch infinitely far in both directions: just alternate.
</p>

<Figure size="wide" title="Listing the integers" num="1.1.9">
	<CountingZigZag />
	{#snippet caption()}
		Hop outward from \(0\), alternating sides: \(0, 1, -1, 2, -2, \dots\). Every integer is reached after finitely many hops, so
		this listing is a bijection \(\N\to\Z\): position \(2k-1\) holds \(k\), and position \(2k\) holds \(-k\).
	{/snippet}
</Figure>

<p>
	With more cleverness, the rational numbers \(\Q\) can be listed too (the exercise “Listing all pairs” below shows the key
	trick). But not everything is
	countable. In 1891 Georg Cantor gave a famously short argument that the real numbers cannot be listed: given any list of real
	numbers between \(0\) and \(1\), written as decimals, build a new number whose first digit differs from the first digit of the
	first number, whose second digit differs from the second digit of the second number, and so on. This new number differs from
	every number on the list, so the list was incomplete. Sets like \(\R\) are called <em>uncountable</em>.
</p>

<Remark title="Why this matters for homology">
	<p>
		A circle, a sphere, a doughnut each have uncountably many points. Yet the computations in this book use only finitely many
		pieces — vertices, edges, triangles. Part of the magic of homology is that finite combinatorial data captures the holes of
		these enormous sets exactly.
	</p>
</Remark>

<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Operations by hand">
	<p>
		In the universe \(U = \set{1,2,3,4,5,6}\), let \(A = \set{1,2,3,4}\) and \(B = \set{3,4,5}\). Compute \(A\cup B\), \(A\cap B\),
		\(A\setminus B\), \(B\setminus A\), \(A^c\), and \((A\setminus B)\cup(B\setminus A)\).
	</p>
	{#snippet solution()}
		<p>
			\(A\cup B = \set{1,2,3,4,5}\), \(A\cap B = \set{3,4}\), \(A\setminus B = \set{1,2}\), \(B\setminus A = \set5\), \(A^c =
			\set{5,6}\), and \((A\setminus B)\cup(B\setminus A) = \set{1,2,5}\): the elements in exactly one of the two sets.
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Elements versus subsets">
	<p>True or false?</p>
	<ol type="a">
		<li>\(\varnothing\subseteq\set1\)</li>
		<li>\(\varnothing\in\set1\)</li>
		<li>\(\set1\subseteq\set{1,\set1}\)</li>
		<li>\(\set1\in\set{1,\set1}\)</li>
		<li>\(\set{\varnothing,\set\varnothing}\) has two elements.</li>
	</ol>
	{#snippet solution()}
		<ol type="a">
			<li>True: the empty set is a subset of every set (vacuously).</li>
			<li>False: the only element of \(\set1\) is the number \(1\).</li>
			<li>True: the only element of \(\set1\), namely \(1\), is an element of \(\set{1,\set1}\).</li>
			<li>True: \(\set1\) is literally one of the two listed elements.</li>
			<li>True: its elements are \(\varnothing\) and \(\set\varnothing\), which are different (one is empty, the other is not).</li>
		</ol>
	{/snippet}
</Exercise>

<Exercise level={2} title="Classify these functions">
	<p>Decide whether each function is injective, surjective, both or neither.</p>
	<ol type="a">
		<li>\(f\colon\Z\to\Z\), \(f(n) = 2n\).</li>
		<li>\(g\colon\Z\to\Z\), \(g(n) = n+5\).</li>
		<li>\(p\colon\R^2\to\R\), \(p(x,y) = x\).</li>
		<li>\(h\colon\R\to\R\), \(h(x) = x^3\).</li>
	</ol>
	{#snippet solution()}
		<ol type="a">
			<li>Injective (\(2n = 2m\) forces \(n = m\)), not surjective (odd numbers are missed).</li>
			<li>Bijective, with inverse \(n\mapsto n-5\).</li>
			<li>Surjective (\(x = p(x,0)\)), not injective (\(p(1,0) = p(1,7)\)): the preimage of a point \(x\) is a whole vertical line.</li>
			<li>Bijective: every real number has exactly one real cube root, so \(h^{-1}(y) = \sqrt[3]{y}\).</li>
		</ol>
	{/snippet}
</Exercise>

<Exercise level={2} title="Compositions keep their properties">
	<p>
		Let \(f\colon X\to Y\) and \(g\colon Y\to Z\). Show: (a) if \(f\) and \(g\) are injective, so is \(g\circ f\); (b) if \(f\) and
		\(g\) are surjective, so is \(g\circ f\). Conclude that a composite of bijections is a bijection.
	</p>
	{#snippet solution()}
		<p>
			(a) Suppose \(g(f(x)) = g(f(x'))\). Since \(g\) is injective, \(f(x) = f(x')\); since \(f\) is injective, \(x = x'\). (b) Let
			\(z\in Z\). Since \(g\) is surjective, \(z = g(y)\) for some \(y\in Y\); since \(f\) is surjective, \(y = f(x)\) for some
			\(x\in X\). Then \(z = g(f(x))\). A bijection is both, so (a) and (b) together give the last claim.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Images and intersections">
	<p>
		Show that \(f(A\cap A')\subseteq f(A)\cap f(A')\) for every function \(f\) and all subsets \(A, A'\) of its domain. Then show
		that equality holds when \(f\) is injective.
	</p>
	{#snippet solution()}
		<p>
			If \(y\in f(A\cap A')\), then \(y = f(x)\) with \(x\) in both \(A\) and \(A'\), so \(y\in f(A)\) and \(y\in f(A')\). For the
			reverse inclusion when \(f\) is injective: if \(y\in f(A)\cap f(A')\) then \(y = f(a) = f(a')\) with \(a\in A\), \(a'\in
			A'\); injectivity gives \(a = a'\), which therefore lies in \(A\cap A'\), so \(y\in f(A\cap A')\). (The example \(x^2\),
			\(A = \set{-1}\), \(A' = \set1\) in the text shows the inclusion can be strict without injectivity.)
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Counting functions">
	<p>
		How many functions are there from \(\set{1,2,3}\) to \(\set{a,b}\)? How many of them are injective? Surjective? Answer the same
		questions for functions from \(\set{a,b}\) to \(\set{1,2,3}\).
	</p>
	{#snippet solution()}
		<p>
			From \(\set{1,2,3}\) to \(\set{a,b}\): \(2^3 = 8\) functions; none is injective (pigeonhole); all except the two constant
			functions are surjective, so \(6\). From \(\set{a,b}\) to \(\set{1,2,3}\): \(3^2 = 9\) functions; injective ones choose
			two different values, \(3\cdot2 = 6\); none is surjective (two elements cannot hit three).
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Preimages under squaring">
	<p>For \(f\colon\R\to\R\), \(f(x) = x^2\), find \(f^{-1}(\set0)\), \(f^{-1}([0,9])\), \(f^{-1}((4,\infty))\) and \(f\big(f^{-1}([-1,4])\big)\).</p>
	{#snippet solution()}
		<p>
			\(f^{-1}(\set0) = \set0\); \(f^{-1}([0,9]) = [-3,3]\); \(f^{-1}((4,\infty)) = (-\infty,-2)\cup(2,\infty)\). Finally
			\(f^{-1}([-1,4]) = [-2,2]\), whose image is \([0,4]\) — not the original \([-1,4]\). In general \(f(f^{-1}(B))\subseteq B\),
			with equality exactly for the parts of \(B\) that are actually hit.
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Listing all pairs">
	<p>
		Show that \(\N\times\N\) is countable: describe a list in which every pair \((m,n)\) of natural numbers appears exactly once.
		Use it to explain why \(\Q\) is countable.
	</p>
	{#snippet hint()}
		<p>Draw the grid \(\N\times\N\) and list it diagonal by diagonal: the pairs with \(m+n = 0\), then \(m+n = 1\), and so on.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			List the pairs by the value of \(m+n\): first \((0,0)\); then \((0,1),(1,0)\); then \((0,2),(1,1),(2,0)\); and so on. The
			diagonal \(m+n = s\) contains exactly \(s+1\) pairs, so every pair \((m,n)\) appears after finitely many steps (in the
			diagonal \(s = m+n\)), and exactly once. For \(\Q\): every rational number can be written as \(\pm\frac{m}{n}\) with
			\(m\in\N\), \(n\ge1\); list the pairs \((m,n)\) diagonal by diagonal, write down \(\frac mn\) and \(-\frac mn\) for each, and
			skip any number already written (such as \(\frac24\) after \(\frac12\)). Every rational appears exactly once.
		</p>
	{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>
			A <strong>set</strong> is determined by its elements (\(x\in X\)); order and repetition do not matter. \(\varnothing\) has no
			elements. Set-builder notation \(\setb{x\in X}{P(x)}\) carves a set out of a bigger one.
		</li>
		<li>
			\(A\subseteq B\) means every element of \(A\) is in \(B\); \(A = B\) means \(A\subseteq B\) and \(B\subseteq A\) (double
			inclusion).
		</li>
		<li>
			\(\cup,\ \cap,\ \setminus\) and complement are “or,” “and,” “but not,” and “not” for sets; De Morgan’s laws are the negation
			rules of logic.
		</li>
		<li>\(A\times B\) is the set of ordered pairs, a grid with \(\abs A\cdot\abs B\) dots; the torus is \(S^1\times S^1\).</li>
		<li>
			A <strong>function</strong> \(f\colon X\to Y\) assigns exactly one output to each input. It is <strong>injective</strong> (no
			collisions), <strong>surjective</strong> (no misses), or <strong>bijective</strong> (both) — properties that depend on the
			domain and codomain, not just the formula.
		</li>
		<li>
			<strong>Images</strong> \(f(A)\) push forward; <strong>preimages</strong> \(f^{-1}(B)\) pull back, always exist, and respect
			all set operations.
		</li>
		<li>
			\(g\circ f\) is “\(g\) after \(f\)”; composition is associative with identities \(\id_X\). Bijections are exactly the
			functions with inverses.
		</li>
		<li>
			A diagram <strong>commutes</strong> when all paths with the same ends give the same composite. Counting is building a
			bijection; \(\Z\) and \(\Q\) are countable, \(\R\) is not.
		</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading items={reading} />
