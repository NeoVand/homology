<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	import Figure from '$lib/components/prose/Figure.svelte';
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
	import Exercise from '$lib/components/prose/Exercise.svelte';
	import Recap from '$lib/components/prose/Recap.svelte';
	import Term from '$lib/components/prose/Term.svelte';
	import Ref from '$lib/components/prose/Ref.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import CategoryExplorer from '$lib/figures/big-picture/categories/CategoryExplorer.svelte';
	import TwoRoads from '$lib/figures/big-picture/categories/TwoRoads.svelte';
	import FunctorCamera from '$lib/figures/big-picture/categories/FunctorCamera.svelte';
	import BrouwerTriangle from '$lib/figures/big-picture/categories/BrouwerTriangle.svelte';
	import NaturalitySquare from '$lib/figures/big-picture/categories/NaturalitySquare.svelte';
	import UniversalProperty from '$lib/figures/big-picture/categories/UniversalProperty.svelte';

	const reading = [
		{
			title: 'Basic Category Theory',
			author: 'Tom Leinster',
			url: 'https://arxiv.org/abs/1612.09375',
			note: 'The gentlest rigorous introduction, written for readers who have seen a little algebra and topology. Chapter 1 covers this whole chapter; its examples come from exactly the mathematics in this book.',
			kind: 'book',
			free: true
		},
		{
			title: 'Category Theory in Context',
			author: 'Emily Riehl',
			url: 'https://emilyriehl.github.io/files/context.pdf',
			note: 'The next step up: beautifully written, with examples from all over mathematics, including algebraic topology. Chapters 1–3 extend what you met here.',
			kind: 'book',
			free: true
		},
		{
			title: 'Seven Sketches in Compositionality',
			author: 'Brendan Fong and David I. Spivak',
			url: 'https://arxiv.org/abs/1803.05316',
			note: 'Category theory through applications — databases, circuits, resource theories. Shows that dots-and-arrows thinking is not only for topologists.',
			kind: 'book',
			free: true
		},
		{
			title: 'What is Category Theory Anyway? and What is a Natural Transformation?',
			author: 'Tai-Danae Bradley (Math3ma)',
			url: 'https://www.math3ma.com/blog/what-is-category-theory-anyway',
			note: 'Two short, warm blog posts with pictures; the companion post on natural transformations is at math3ma.com/blog/what-is-a-natural-transformation.',
			kind: 'web',
			free: true
		},
		{
			title: 'What is Applied Category Theory?',
			author: 'Tai-Danae Bradley',
			url: 'https://arxiv.org/abs/1809.05923',
			note: 'A friendly tour of where categories show up outside pure mathematics, aimed at newcomers.',
			kind: 'paper',
			free: true
		},
		{
			title: 'Category Theory (Stanford Encyclopedia of Philosophy)',
			author: 'Jean-Pierre Marquis',
			url: 'https://plato.stanford.edu/entries/category-theory/',
			note: 'History and philosophy: where categories came from, and why some people think they belong at the foundations of mathematics.',
			kind: 'web',
			free: true
		},
		{
			title: 'Categories for the Working Mathematician',
			author: 'Saunders Mac Lane',
			note: 'The classic (Springer, 1971; 2nd ed. 1998), by one of the subject’s two founders. Terse, but the source of this chapter’s epigraph and of much of its spirit.',
			kind: 'book'
		},
		{
			title: 'The Joy of Abstraction',
			author: 'Eugenia Cheng',
			note: 'A book-length invitation to category theory for readers without a mathematics degree (Cambridge University Press, 2022).',
			kind: 'book'
		},
		{
			title: 'History of Homological Algebra',
			author: 'Charles A. Weibel',
			url: 'https://metaphor.ethz.ch/x/2025/hs/401-3132-00L/ex/historyweibel.pdf',
			note: 'Tells how Eilenberg and Mac Lane invented functors and natural isomorphisms in 1942 to make sense of the universal coefficient theorem.',
			kind: 'paper',
			free: true
		}
	] as const;
</script>

<Epigraph author="Saunders Mac Lane" source="Categories for the Working Mathematician (2nd ed.), p. 18"
	>As Eilenberg-Mac Lane first observed, ‘category’ has been defined in order to be able to define ‘functor’ and ‘functor’ has been defined in order to be able to define ‘natural transformation’.</Epigraph
>

<p class="lead">
	Look back over this book. Every chapter had two kinds of characters. There were <em>things</em> — sets, groups, vector spaces,
	spaces, simplicial complexes, chain complexes — and there were <em>arrows between things</em> — functions, homomorphisms, linear
	maps, continuous maps, simplicial maps, chain maps. Again and again, the arrows did the real work. This chapter is about what all
	those arrows have in common.
</p>

<p>
	The common pattern has a name: a <dfn>category</dfn>. A map that turns one kind of thing-and-arrow world into another, the way
	homology turns spaces into groups, is a <dfn>functor</dfn>. And a way of comparing two functors that involves no arbitrary
	choices is a <dfn>natural transformation</dfn>. These three ideas were invented in the 1940s by two algebraic topologists, Samuel
	Eilenberg and Saunders Mac Lane, precisely to talk about homology. So in a real sense you are not starting a new subject: you are
	learning the names of things you have been doing since Chapter 1.
</p>

<Ahead>
	<p>
		This chapter gives precise meaning to sentences we have used loosely: “homology is a <em>functor</em>”, “cohomology is
		<em>contravariant</em>”, “the long exact sequence is <em>natural</em>”, “the direct sum is a <em>universal</em> construction”.
		It also explains <em>why</em> such sentences prove theorems — Brouwer’s fixed-point theorem will drop out of a single diagram.
		The next chapter, <Ref to="big-picture/homological-algebra" />, lives inside the kind of category described at the end of this
		one (an <em>abelian</em> category), and the last chapter, <Ref to="big-picture/horizons" />, meets cohomology theories that are
		defined entirely by how they behave on arrows.
	</p>
</Ahead>

<h2 id="all-along">You have been doing category theory all along</h2>

<p>
	Here is a game. For each line below, the left column names some objects and the middle column names the arrows between them.
	Read down the right column: it is always the same three facts.
</p>

<div class="table-wrap">
	<table>
		<thead>
			<tr><th>Objects</th><th>Arrows</th><th>What we always used</th></tr>
		</thead>
		<tbody>
			<tr><td>sets (<Ref to="foundations/sets-and-functions" />)</td><td>functions</td><td rowspan="6" class="same">follow one arrow by another; every object has a do-nothing arrow; brackets don’t matter</td></tr>
			<tr><td>groups, abelian groups</td><td>homomorphisms</td></tr>
			<tr><td>vector spaces</td><td>linear maps (matrices)</td></tr>
			<tr><td>topological spaces</td><td>continuous maps</td></tr>
			<tr><td>simplicial complexes</td><td>simplicial maps</td></tr>
			<tr><td>chain complexes</td><td>chain maps</td></tr>
		</tbody>
	</table>
</div>

<p>
	In every case you can <strong>compose</strong>: if \(f\) goes from \(A\) to \(B\) and \(g\) goes from \(B\) to \(C\), then “first
	\(f\), then \(g\)” is an arrow \(g\circ f\) from \(A\) to \(C\) (read “\(g\) after \(f\)”, as in <Ref
		to="foundations/sets-and-functions"
	/>). A composite of homomorphisms is a homomorphism; a composite of continuous maps is continuous; a product of matrices is a
	matrix. In every case there is an <strong>identity</strong>, the arrow that does nothing. And in every case composition is
	<strong>associative</strong>: following \(f\), then \(g\), then \(h\) gives the same result however you group the steps.
</p>

<p>
	Those three facts sound too obvious to be worth stating. But think about how much of this book rested on them. When we proved
	in <Ref to="homology/invariance" /> that a continuous map \(f\) induces a homomorphism \(f_*\) on homology, the two facts that
	made it useful were
</p>
\[ (g\circ f)_* = g_*\circ f_* \qquad\text{and}\qquad (\id_X)_* = \id_{H_n(X)} . \]
<p>
	Those equations say: homology respects composition and identities. They are statements about arrows, not about holes. Category
	theory is what you get when you take statements like these seriously and study them for their own sake. Its subtitle in this book
	— “the mathematics of mathematics” — is a little grand, but not wrong: it is a language for the patterns that different parts of
	mathematics share.
</p>

<blockquote>
	“Mathematics is the art of giving the same name to different things.” — Henri Poincaré, <em>Science and Method</em> (1908)
</blockquote>

<p>
	Category theory takes Poincaré’s remark literally. A bijection of sets, an isomorphism of groups, a homeomorphism of spaces and a
	homotopy equivalence will all turn out to be “the same thing”: an <em>isomorphism</em> in the appropriate category. Quotients,
	direct sums, kernels and products will turn out to be instances of one idea, the <em>universal property</em>. Seeing the shared
	shape does not do the hard work for you — computing \(H_n(S^n)\) still needed geometry — but it tells you which work needs doing
	and which comes for free.
</p>

<h2 id="categories">Categories: dots and arrows</h2>

<p>
	Let us write down the pattern exactly. Read the definition slowly; after it we will look at many examples, and the figure lets
	you play with three small categories by hand.
</p>

<Definition id="def-category" title="Category">
	<p>A <dfn>category</dfn> \(\mathcal C\) consists of</p>
	<ol>
		<li>a collection of <dfn>objects</dfn>, written \(A, B, C, \dots\);</li>
		<li>
			for every pair of objects \(A, B\), a set \(\mathcal C(A,B)\) of <dfn>arrows</dfn> (also called <dfn>morphisms</dfn>) from
			\(A\) to \(B\). We write \(f\colon A\to B\) and call \(A\) the <em>source</em> and \(B\) the <em>target</em> of \(f\);
		</li>
		<li>for every object \(A\), an <dfn>identity arrow</dfn> \(1_A\colon A\to A\) (also written \(\id_A\));</li>
		<li>
			for every pair of arrows \(f\colon A\to B\) and \(g\colon B\to C\) — the target of the first is the source of the second — a
			<dfn>composite</dfn> \(g\circ f\colon A\to C\),
		</li>
	</ol>
	<p>such that two laws hold for all arrows \(f\colon A\to B\), \(g\colon B\to C\), \(h\colon C\to D\):</p>
	\[ h\circ(g\circ f) = (h\circ g)\circ f \quad\text{(associativity)}, \qquad f\circ 1_A = f = 1_B\circ f \quad\text{(unit laws)}. \]
</Definition>

<Notation title="Reading the definition">
	<p>
		The symbol \(\mathcal C\) is a curly C, used for “some category”. The set \(\mathcal C(A,B)\) is often called a
		<dfn>hom-set</dfn> (“hom” from homomorphism) and is also written \(\Hom_{\mathcal C}(A,B)\). The word <em>collection</em> in item
		1 is deliberate: the objects of \(\Set\), all sets, do not themselves form a set, but we will not need to worry about that
		subtlety. Most important is the order in \(g\circ f\): it is read right to left, “\(g\) after \(f\)”, because for functions
		\((g\circ f)(x) = g(f(x))\) — you apply \(f\) first.
	</p>
</Notation>

<p>
	Notice what the definition does <em>not</em> say. It never says that objects have elements, or that arrows are functions. An arrow
	is just something with a source and a target that can be composed. That freedom is what makes the idea so widely applicable.
</p>

<Figure size="wide" num="1" title="Three small categories" hint="Click arrows head to tail · a third arrow tests associativity">
	<CategoryExplorer />
	{#snippet caption()}
		Click an arrow, then an arrow that starts where the first one ends: the composite lights up in gold. In <em>A small category</em>
		the faint dashed arrows are composites that the axioms force into existence — \(g\circ f\) is a genuine arrow from \(A\) to
		\(C\), different from \(k\). Click three arrows in a row to see both bracketings agree, or click an identity loop to watch it
		change nothing. In <em>Divisors of 12</em> an arrow \(a\to b\) means “\(a\) divides \(b\)”; in <em>A group</em> there is one object
		and the arrows are rotations.
	{/snippet}
</Figure>

<h3 id="gallery">A gallery of categories</h3>

<p>Here are the categories this book has quietly been living in. For each, ask: what are the objects, what are the arrows, how do arrows compose, and what are the identities?</p>

<ul>
	<li>
		<strong>\(\Set\)</strong>: objects are sets, arrows are functions, composition is composition of functions, identities are the
		identity functions \(x\mapsto x\).
	</li>
	<li>
		<strong>\(\Grp\)</strong> and <strong>\(\Ab\)</strong>: objects are groups (respectively abelian groups, <Ref
			to="foundations/groups"
		/>), arrows are <Term t="homomorphism">homomorphisms</Term>. That a composite of homomorphisms is again a homomorphism is a small
		calculation (Exercise 2).
	</li>
	<li>
		<strong>\(\Vect\)</strong>: real vector spaces and linear maps (<Ref to="foundations/linear-algebra" />). There is one such
		category for each field of scalars; the book used \(\R\) and \(\Z/2\).
	</li>
	<li>
		<strong>\(\Top\)</strong>: topological spaces and continuous maps (<Ref to="topology/spaces" />).
	</li>
	<li>
		<strong>\(\mathsf{hTop}\)</strong>, the <dfn>homotopy category</dfn>: the same objects as \(\Top\), but an arrow \(X\to Y\) is a
		<em>homotopy class</em> \([f]\) of continuous maps (<Ref to="topology/homotopy" />). We compose classes by composing
		representatives, \([g]\circ[f] = [g\circ f]\). This is well defined — the answer does not depend on which representatives you
		pick — because if \(f\simeq f'\) and \(g\simeq g'\) then \(g\circ f\simeq g'\circ f'\). Once again a quotient (“declare homotopic
		maps equal”) produces a new world in which to work.
	</li>
	<li>
		<strong>\(\Ch\)</strong>: chain complexes of abelian groups and chain maps (<Ref to="homology/chains" />, <Ref
			to="homology/invariance"
		/>). The next chapter starts here.
	</li>
</ul>

<p>Those are all “sets with structure, and functions that respect it”. Now three categories of a different flavour.</p>

<Example title="A partially ordered set is a category">
	<p>
		A <dfn>partially ordered set</dfn>, or <dfn>poset</dfn>, is a set with a relation \(\le\) that is reflexive (\(a\le a\)),
		transitive (\(a\le b\) and \(b\le c\) give \(a\le c\)) and antisymmetric (\(a\le b\) and \(b\le a\) give \(a=b\)) — the kind of
		relation met in <Ref to="foundations/equivalence" />, but one-directional. Make it a category: the objects are the elements, and
		there is exactly one arrow \(a\to b\) when \(a\le b\), and none otherwise. Composition exists because \(\le\) is transitive;
		identities exist because \(\le\) is reflexive. Associativity is automatic, since between two objects there is at most one arrow.
	</p>
	<p>
		The divisors of 12 under divisibility, \(a\mid b\), form such a category (Figure 1). So do the real numbers under \(\le\). The
		arrows are not functions of any kind: an arrow is simply the fact “\(a\le b\)”.
	</p>
</Example>

<Example title="A group is a category with one object">
	<p>
		Take a group \(G\), for example the three rotations \(e, r, r^2\) of an equilateral triangle. Build a category with a single
		object \(\bigstar\) and one arrow \(\bigstar\to\bigstar\) for each element of the group. Composing arrows means multiplying in
		the group, and the identity arrow is the identity element \(e\). Here the arrows have rich structure and the object has none at
		all: \(\bigstar\) is just a place for arrows to start and end. In this category every arrow can be undone — that is exactly what
		the inverse axiom of a group says.
	</p>
</Example>

<Example title="Matrices form a category">
	<p>
		Let the objects be the natural numbers \(0,1,2,\dots\), and let an arrow \(n\to m\) be an \(m\times n\) real matrix. Compose by
		matrix multiplication: an \(m\times n\) matrix followed by a \(p\times m\) matrix gives the \(p\times n\) product. The identity
		arrow on \(n\) is the \(n\times n\) identity matrix. The associativity axiom is the familiar fact \((AB)C = A(BC)\) from <Ref
			to="foundations/linear-algebra"
		/>. Every boundary matrix \(\partial_k\) of this book was an arrow in this category.
	</p>
</Example>

<Warning title="Three beginner traps">
	<p>
		(1) <em>Arrows need not be functions</em> — in a poset an arrow is a fact, in the matrix category it is a table of numbers.
		(2) <em>Objects need not have elements</em> — the object \(\bigstar\) above has none. (3) <em>Composition is only defined head to
		tail</em>: \(g\circ f\) makes sense only when the target of \(f\) is the source of \(g\). In Figure 1, try to compose \(f\colon
		A\to B\) with \(h\colon C\to D\) and the figure refuses.
	</p>
</Warning>

<h2 id="diagrams">Commutative diagrams, and one word for sameness</h2>

<h3 id="reading-diagrams">Reading a diagram</h3>

<p>
	Mathematicians draw categories the way you would draw a map of roads: dots for objects, arrows for arrows. Such a picture is a
	<dfn>diagram</dfn>. A diagram <dfn>commutes</dfn> if any two routes along arrows with the same starting point and the same end
	point give the same composite. For a square
</p>
\[ \begin{array}{ccc} A & \xrightarrow{\;f\;} & B \\ {\scriptstyle h}\big\downarrow & & \big\downarrow{\scriptstyle g} \\ C & \xrightarrow[\;k\;]{} & D \end{array} \]
<p>
	commuting means one single equation: \(g\circ f = k\circ h\). “Across, then down” equals “down, then across”. For a triangle it
	means that the long side is the composite of the two short ones. This is the same idea that <Term t="commutative-diagram"
		>commutative diagrams</Term
	> had when they first appeared in <Ref to="foundations/sets-and-functions" />; now we will use them constantly.
</p>

<Figure size="wide" num="2" title="All roads agree" hint="Drag the temperature · press “Follow both roads”">
	<TwoRoads />
	{#snippet caption()}
		A commutative square from everyday life. Converting Celsius to Fahrenheit and then warming by \(18^\circ\mathrm F\) gives the
		same reading as warming by \(10^\circ\mathrm C\) and then converting, for every starting temperature: the square commutes.
		Change the right-hand arrow to “\(+10^\circ\mathrm F\)” and it no longer does — a diagram is a <em>claim</em>, and it can be
		false.
	{/snippet}
</Figure>

<p>
	Why draw pictures instead of writing equations? Because in a large diagram there are many routes, and “the diagram commutes” packs
	all their equations into one glance. You have already met several commutative squares in disguise. The definition of a <Term
		t="chain-map">chain map</Term
	> \(f\) between chain complexes (<Ref to="homology/invariance" />) is the statement that every square
</p>
\[ \begin{array}{ccc} C_n & \xrightarrow{\;\partial\;} & C_{n-1} \\ {\scriptstyle f_n}\big\downarrow & & \big\downarrow{\scriptstyle f_{n-1}} \\ D_n & \xrightarrow[\;\partial\;]{} & D_{n-1} \end{array} \qquad\text{commutes:}\qquad f_{n-1}\circ\partial = \partial\circ f_n . \]
<p>
	A <dfn>diagram chase</dfn> is an argument that follows a single element around a diagram: start with \(c\in C_n\), push it across,
	push it down, compare with the other route. Proving that chain maps send cycles to cycles is a two-step chase: if \(\partial c =
	0\), then \(\partial(f_n c) = f_{n-1}(\partial c) = f_{n-1}(0) = 0\). In <Ref to="big-picture/homological-algebra" /> you will
	watch a longer chase, the snake lemma, animated step by step.
</p>

<Warning title="“Commutative” is an overloaded word">
	<p>
		A commutative diagram has nothing to do with commutative groups, where \(ab = ba\). Here “commutes” only means “all routes
		agree”. A diagram can fail to commute even when every object in it is an abelian group.
	</p>
</Warning>

<h3>Isomorphism: one word for every kind of sameness</h3>

<p>
	Throughout the book we needed different words for “the same”: bijection, group isomorphism, linear isomorphism, homeomorphism,
	homotopy equivalence. In category language they are all one word.
</p>

<Definition id="def-iso" title="Isomorphism">
	<p>
		An arrow \(f\colon A\to B\) in a category is an <dfn>isomorphism</dfn> if there is an arrow \(g\colon B\to A\) going back with
		\[ g\circ f = 1_A \qquad\text{and}\qquad f\circ g = 1_B . \]
		Then \(g\) is the <dfn>inverse</dfn> of \(f\), and we say \(A\) and \(B\) are <dfn>isomorphic</dfn>, \(A\cong B\).
	</p>
</Definition>

<p>
	The inverse is unique: if \(g\) and \(g'\) both work, then \(g = g\circ 1_B = g\circ(f\circ g') = (g\circ f)\circ g' = 1_A\circ g' =
	g'\). Notice that this little proof used nothing but the axioms — so it holds in every category at once. Now read the definition
	in each of our categories:
</p>

<div class="table-wrap">
	<table>
		<thead><tr><th>Category</th><th>An isomorphism is…</th></tr></thead>
		<tbody>
			<tr><td>\(\Set\)</td><td>a bijection</td></tr>
			<tr><td>\(\Grp\), \(\Ab\)</td><td>a group isomorphism (<Ref to="foundations/groups" />)</td></tr>
			<tr><td>\(\Vect\)</td><td>an invertible linear map (an invertible matrix)</td></tr>
			<tr><td>\(\Top\)</td><td>a homeomorphism (<Ref to="topology/spaces" />)</td></tr>
			<tr><td>\(\mathsf{hTop}\)</td><td>a homotopy equivalence (<Ref to="topology/homotopy" />)</td></tr>
			<tr><td>a poset</td><td>only the identity arrows (by antisymmetry)</td></tr>
			<tr><td>a group, as a one-object category</td><td>every arrow</td></tr>
		</tbody>
	</table>
</div>

<p>
	The line for \(\mathsf{hTop}\) is worth pausing on. A homotopy equivalence was defined in <Ref to="topology/homotopy" /> as a map
	\(f\colon X\to Y\) with a map \(g\colon Y\to X\) such that \(g\circ f\simeq\id_X\) and \(f\circ g\simeq\id_Y\). In the homotopy
	category, where homotopic maps are <em>equal</em> arrows, that is literally the definition of an isomorphism. The “weaker” notion
	of sameness is the ordinary notion in a different category.
</p>

<Warning title="The inverse must live in the same category">
	<p>
		The map \([0,2\pi)\to S^1\), \(t\mapsto(\cos t,\sin t)\), is a continuous bijection. It is an isomorphism in \(\Set\), but not in
		\(\Top\): its inverse function tears the circle open at \((1,0)\), so it is not continuous. Being an isomorphism is not a property
		of an arrow alone; it depends on which arrows the category allows you to use for the way back.
	</p>
</Warning>

<h2 id="functors">Functors: maps between categories</h2>

<p>
	A category is a world of objects and arrows. A <em>functor</em> is a way of translating one world into another that keeps the
	arrows talking to each other in the same way. It is precisely what homology does.
</p>

<Definition id="def-functor" title="Functor">
	<p>A <dfn>functor</dfn> \(F\colon\mathcal C\to\mathcal D\) from a category \(\mathcal C\) to a category \(\mathcal D\) assigns</p>
	<ul>
		<li>to each object \(A\) of \(\mathcal C\) an object \(F(A)\) of \(\mathcal D\), and</li>
		<li>to each arrow \(f\colon A\to B\) of \(\mathcal C\) an arrow \(F(f)\colon F(A)\to F(B)\) of \(\mathcal D\),</li>
	</ul>
	<p>in such a way that composition and identities are respected:</p>
	\[ F(g\circ f) = F(g)\circ F(f), \qquad F(1_A) = 1_{F(A)} . \]
</Definition>

<p>
	In words: a functor sends dots to dots and arrows to arrows, and it sends every commutative diagram to a commutative diagram.
	(Check this: if \(g\circ f = k\circ h\), apply \(F\) to both sides and use the first rule.) That last sentence is the whole reason
	functors are useful, as we will see shortly. Tom Leinster describes the strategy of algebraic topology in exactly these terms:
</p>

<blockquote>
	“…the strategy is to learn about a space by extracting data from it in some clever way, assembling that data into an algebraic
	structure, then studying the algebraic structure instead of the original space.” — Tom Leinster, <em>Basic Category Theory</em>,
	Examples 1.2.5
</blockquote>

<p>Here are functors you already know, some of them old friends wearing a new badge.</p>

<ul>
	<li>
		<strong>Homology</strong>, \(H_n\colon\Top\to\Ab\). A space \(X\) goes to the group \(H_n(X)\), a map \(f\) goes to \(f_* =
		H_n(f)\). The two functor laws are the equations from <Ref to="homology/invariance" /> quoted above. Because homotopic maps induce
		the same homomorphism, \(H_n\) is even a functor \(\mathsf{hTop}\to\Ab\).
	</li>
	<li>
		<strong>Forgetful functors</strong>, such as \(U\colon\Grp\to\Set\), which sends a group to its underlying set and a homomorphism
		to the same function, simply forgetting that there was an operation. Likewise \(\Ab\to\Grp\), \(\Top\to\Set\), \(\Vect\to\Ab\).
		They sound trivial, and they are; but they let us say precisely “this is the same map, viewed with less structure”.
	</li>
	<li>
		<strong>The free functor</strong> \(\Z[-]\colon\Set\to\Ab\). A set \(S\) goes to the <Term t="free-abelian-group"
			>free abelian group</Term
		> \(\Z[S]\) of formal sums \(n_1s_1+\dots+n_ks_k\) (<Ref to="foundations/abelian-groups" />); a function \(S\to T\) goes to the
		homomorphism that applies it to each symbol and keeps the coefficients. The chain group \(C_k(K)\) is \(\Z[\text{the }
		k\text{-simplices of }K]\).
	</li>
	<li>
		<strong>Path components</strong>, \(\pi_0\colon\Top\to\Set\). A space goes to the set of its path components; a continuous map
		sends paths to paths, so it sends each component into a component.
	</li>
	<li>
		<strong>The fundamental group</strong>, \(\pi_1\colon\Top_*\to\Grp\) (<Ref to="topology/homotopy" />). Here \(\Top_*\) is the
		category of <dfn>based spaces</dfn>: spaces with a chosen point, and continuous maps that send chosen point to chosen point. The
		basepoint is needed because a loop has to start somewhere.
	</li>
	<li>
		<strong>Composites of functors.</strong> Simplicial homology was built in two stages: first the chain complex \(C_\bullet(K)\),
		then its homology. Each stage is a functor — from simplicial complexes to \(\Ch\), and from \(\Ch\) to \(\Ab\) — and \(H_n\) is
		their composite. Functors compose like arrows; categories and functors themselves form a category.
	</li>
</ul>

<p>
	The next figure shows one functor at work on a small diagram. On top are three spaces and two continuous maps. The map \(f\colon
	S^1\to T^2\) wraps the circle \(p\) times around one direction of the torus and \(q\) times around the other: if we think of
	points of the circle as complex numbers \(z\) of size 1, and points of the torus as pairs of them, \(f(z) = (z^p, z^q)\). The map
	\(g\colon T^2\to S^1\) sends \((x,y)\) to \(x^r y^s\): it multiplies angles by \(r\) and \(s\) and adds them. On the bottom is what
	\(H_1\) makes of all this.
</p>

<Figure size="wide" num="3" title="A functor turns spaces into groups" hint="Change p, q (the loop) and r, s (the map)">
	<FunctorCamera />
	{#snippet caption()}
		\(H_1\) sends each circle to \(\Z\), the torus to \(\Z^2\), and each map to a matrix: \(f_*\) sends the generator \(1\) to the
		class \((p,q)\) of the gold loop, and \(g_*(a,b) = ra + sb\). The composite \(g\circ f\) winds the circle \(rp+sq\) times around
		the circle on the right, and \(H_1\) turns it into multiplication by \(rp+sq\) — which is exactly the matrix product
		\(\begin{pmatrix} r & s\end{pmatrix}\begin{pmatrix} p\\ q\end{pmatrix}\). Functoriality, \(H_1(g\circ f) = H_1(g)\circ H_1(f)\),
		holds for every choice you make.
	{/snippet}
</Figure>

<Warning title="A functor must act on arrows too">
	<p>
		A rule that only assigns objects to objects — “send each space to its Euler characteristic”, say — is not yet a functor. The
		power comes from the arrows: a functor must also send every map to a map, compatibly with composition. And it need not be
		injective in any sense: \(H_1\) sends a constant map and many non-constant maps (every map of the circle into a contractible
		space, for instance) to the same zero homomorphism.
	</p>
</Warning>

<h2 id="contravariance">When arrows turn around</h2>

<p>
	One of the four ideas this book keeps restaging is the <em>reversal of arrows</em>. Preimages ran backwards along functions (<Ref
		to="foundations/sets-and-functions"
	/>); the transpose of a matrix ran backwards along a linear map (<Ref to="foundations/linear-algebra" />); differential forms were
	<Term t="pullback">pulled back</Term> along smooth maps (<Ref to="cohomology/differential-forms" />); and cochains, the measurements
	of cohomology, travelled backwards along continuous maps (<Ref to="cohomology/cohomology-groups" />). Category theory has a home for
	all of these.
</p>

<Definition id="def-op" head={opHead}>
	<p>
		For any category \(\mathcal C\), the <dfn>opposite category</dfn> \(\mathcal C\op\) has the same objects, and one arrow \(A\to
		B\) for each arrow \(B\to A\) of \(\mathcal C\): every arrow is simply turned around. Composition is turned around too: the
		composite of \(f\) and \(g\) in \(\mathcal C\op\) is \(f\circ g\) computed in \(\mathcal C\).
	</p>
	<p>
		A <dfn>contravariant functor</dfn> from \(\mathcal C\) to \(\mathcal D\) is a functor \(F\colon\mathcal C\op\to\mathcal D\).
		Spelled out: it sends each arrow \(f\colon A\to B\) to an arrow going the <em>other</em> way, \(F(f)\colon F(B)\to F(A)\), and it
		reverses the order of composition:
		\[ F(g\circ f) = F(f)\circ F(g), \qquad F(1_A) = 1_{F(A)} . \]
		The ordinary functors of the previous section are called <dfn>covariant</dfn> when we want to stress the difference.
	</p>
</Definition>

{#snippet opHead()}The opposite category \(\mathcal C\op\), and contravariant functors{/snippet}

<p>Here is the reversed-arrow thread of the book, now seen as a list of contravariant functors.</p>

<ul>
	<li>
		<strong>Preimage.</strong> Send a set \(S\) to the set \(\mathcal P(S)\) of its subsets, and a function \(f\colon S\to T\) to
		\(f^{-1}\colon\mathcal P(T)\to\mathcal P(S)\), \(B\mapsto f^{-1}(B)\). Then \((g\circ f)^{-1} = f^{-1}\circ g^{-1}\): to find
		what lands in \(B\) after doing \(f\) then \(g\), first pull \(B\) back along \(g\), then along \(f\).
	</li>
	<li>
		<strong>Duals and transposes.</strong> Send a vector space \(V\) to its <Term t="dual-space">dual</Term> \(V^* = \Hom(V,\R)\),
		the space of linear “measurements” \(\varphi\colon V\to\R\), and a linear map \(T\colon V\to W\) to \(T^*\colon W^*\to V^*\),
		\(\varphi\mapsto\varphi\circ T\): to measure a vector of \(V\), push it to \(W\) and measure there. In matrices, \(T^*\) is the
		<Term t="transpose">transpose</Term>, and the rule \((g\circ f)^* = f^*\circ g^*\) is the old identity \((BA)^{\mathsf T} =
		A^{\mathsf T}B^{\mathsf T}\).
	</li>
	<li>
		<strong>Measuring with values in a group.</strong> More generally, for a fixed abelian group \(G\), sending \(A\mapsto\Hom(A,G)\)
		is a contravariant functor \(\Ab\op\to\Ab\). Cochains are exactly this applied to chains: \(C^n(X;G) = \Hom(C_n(X),G)\).
	</li>
	<li>
		<strong>Cohomology</strong>, \(H^n(-;G)\colon\Top\op\to\Ab\). A map \(f\colon X\to Y\) induces \(f^*\colon H^n(Y;G)\to
		H^n(X;G)\), going backwards, with \((g\circ f)^* = f^*\circ g^*\). This is what we meant, back in <Ref
			to="cohomology/cohomology-groups"
		/>, by calling cohomology <em>contravariant</em>.
	</li>
</ul>

<Intuition title="Measurements pull back">
	<p>
		All four examples share one picture. Things that live <em>on</em> a space — subsets, measurements, functions, cochains — can be
		carried backwards along a map \(f\colon X\to Y\): to measure a point \(x\) of \(X\), send it forward to \(f(x)\) and measure
		there. Things that are <em>made of</em> a space’s pieces — points, paths, chains — are carried forwards. So homology, built from
		chains, is covariant; cohomology, built from measurements of chains, is contravariant. (Subscripts push forward, superscripts pull
		back, as <Ref to="prelude/reading-math" /> promised.)
	</p>
</Intuition>

<Figure size="wide" num="4" title="The same diagram, seen by cohomology" hint="Switch between H₁ and H¹ · change p, q, r, s">
	<FunctorCamera mode="contravariant" />
	{#snippet caption()}
		Switch from \(H_1\) to \(H^1\) and every algebraic arrow turns around: \(f^*\colon\Z^2\to\Z\) and \(g^*\colon\Z\to\Z^2\). The
		matrices are transposed — \(f^* = \begin{pmatrix}p&q\end{pmatrix}\), \(g^* = \begin{pmatrix}r\\ s\end{pmatrix}\) — and the
		composite is computed in the reverse order, \((g\circ f)^* = f^*\circ g^*\). Follow the gold labels: the basic measurement on the
		right-hand circle pulls back to the measurement \((r,s)\) on the torus, and then to \(pr+qs\) on the left-hand circle.
	{/snippet}
</Figure>

<p>
	Why should anyone care which way the arrows point? Two answers from earlier chapters. First, contravariance is what made the
	<Term t="cup-product">cup product</Term> possible (<Ref to="cohomology/cup-product" />): to multiply two measurements you only need
	the diagonal map \(X\to X\times X\), which every space has, and a contravariant functor carries it backwards to a multiplication.
	Second, measurements can be <em>restricted</em> to smaller pieces of a space, which is what made sheaves work (<Ref
		to="cohomology/sheaves"
	/>). Direction is not bookkeeping; it is structure.
</p>

<h2 id="functoriality">Functoriality proves theorems</h2>

<p>
	We can now state, in one line, why functors are so effective at proving that things are <em>impossible</em> or <em>different</em>.
</p>

<Proposition id="prop-iso" title="Functors preserve isomorphisms">
	<p>
		If \(f\colon A\to B\) is an isomorphism in \(\mathcal C\) and \(F\colon\mathcal C\to\mathcal D\) is a functor, then \(F(f)\) is
		an isomorphism in \(\mathcal D\). In particular, \(A\cong B\) implies \(F(A)\cong F(B)\).
	</p>
</Proposition>
<Proof>
	<p>
		Let \(g\) be the inverse of \(f\). Then \(F(g)\circ F(f) = F(g\circ f) = F(1_A) = 1_{F(A)}\), using first that \(F\) respects
		composition and then that it respects identities. In the same way \(F(f)\circ F(g) = 1_{F(B)}\). So \(F(g)\) is an inverse of
		\(F(f)\).
	</p>
</Proof>

<p>
	Read the contrapositive (<Ref to="prelude/reading-math" />): <em>if \(F(A)\not\cong F(B)\), then \(A\not\cong B\)</em>. That is the
	logic of every invariant in this book. The circle and the point are not homotopy equivalent, because \(H_1\colon\mathsf{hTop}\to\Ab\)
	sends them to \(\Z\) and \(0\). The torus and the sphere are not homeomorphic, because \(H_1\) gives \(\Z^2\) and \(0\). One small
	proposition, used a hundred times.
</p>

<p>
	Functors do more than tell objects apart. They also show that certain <em>arrows</em> cannot exist, because a functor would carry
	an impossible diagram of spaces to an impossible diagram of groups. Start with a warm-up in one dimension.
</p>

<Example title="Warm-up: you cannot fold an interval onto its two ends">
	<p>
		Is there a continuous map \(r\colon[0,1]\to\{0,1\}\) that fixes both endpoints, \(r(0)=0\) and \(r(1)=1\)? Write \(i\colon\{0,1\}
		\to[0,1]\) for the inclusion of the endpoints. The condition says \(r\circ i = \id_{\{0,1\}}\): the triangle \(\{0,1\}\to
		[0,1]\to\{0,1\}\) commutes. Apply the functor \(\pi_0\): the two-point space has two path components and the interval has one, so
		we would get functions
		\[ \{\text{2 elements}\}\xrightarrow{\ \pi_0(i)\ }\{\text{1 element}\}\xrightarrow{\ \pi_0(r)\ }\{\text{2 elements}\} \]
		whose composite is the identity. Impossible: the first function squashes both elements to one, and nothing afterwards can pull
		them apart again. So no such \(r\) exists. (You have just proved the intermediate value theorem in disguise: a continuous function
		on \([0,1]\) cannot jump from 0 to 1 without passing through values in between.)
	</p>
</Example>

<p>
	Now the real thing. A <Term t="retraction">retraction</Term> of the disk \(D^2\) onto its rim \(S^1\) would be a continuous map
	\(r\colon D^2\to S^1\) that keeps every point of the rim where it is. The figure walks through the argument that none exists. Read
	the top half as geometry and the bottom half as algebra; the functor \(H_1\) is the bridge.
</p>

<Figure size="wide" num="5" title="Brouwer, by functoriality" hint="Step through with ‹ ›, or press play">
	<BrouwerTriangle />
	{#snippet caption()}
		If a retraction \(r\) existed, the triangle of spaces \(S^1\xrightarrow{i}D^2\xrightarrow{r}S^1\) would commute with the
		identity. Applying \(H_1\) gives a commuting triangle \(\Z\to 0\to\Z\) whose long side is the identity of \(\Z\). But anything that
		passes through the zero group comes out as \(0\): the gold \(1\) is crushed in the middle while the identity delivers \(1\).
		Contradiction — so \(r\) does not exist.
	{/snippet}
</Figure>

<Theorem id="thm-no-retraction" label="Theorem (no retraction)">
	<p>There is no continuous map \(r\colon D^2\to S^1\) with \(r(x) = x\) for every \(x\) in \(S^1\).</p>
</Theorem>
<Proof>
	<p>
		Suppose there were. Then \(r\circ i = \id_{S^1}\), where \(i\colon S^1\to D^2\) is the inclusion of the rim. Apply the functor
		\(H_1\): by the functor laws, \(H_1(r)\circ H_1(i) = H_1(r\circ i) = H_1(\id_{S^1}) = \id_{H_1(S^1)}\). Now \(H_1(S^1)\cong\Z\)
		and \(H_1(D^2) = 0\) (<Ref to="homology/homology-groups" />). So the identity map of \(\Z\) would factor as \(\Z\to 0\to\Z\). But
		the only homomorphism out of the zero group sends \(0\) to \(0\), so the composite sends \(1\) to \(0\), not to \(1\). This
		contradiction shows that \(r\) cannot exist.
	</p>
</Proof>

<p>
	From here, Brouwer’s fixed-point theorem is the short geometric step you saw in <Ref to="homology/invariance" />: if a map
	\(f\colon D^2\to D^2\) had no fixed point, then for each \(x\) the ray from \(f(x)\) through \(x\) would hit the rim at a point
	\(r(x)\), and \(r\) would be a retraction. In every dimension the same diagram works with \(H_{n-1}\), since \(H_{n-1}(S^{n-1})\cong\Z\)
	and \(H_{n-1}(D^n) = 0\) for \(n\ge 2\).
</p>

<Remark title="Where the hard work lives">
	<p>
		Notice what category theory did and did not do. It supplied the <em>shape</em> of the argument — a commuting triangle, a functor,
		a contradiction — and that shape is the same for the interval and \(\pi_0\), for the disk and \(H_1\), for the ball and
		\(H_{n-1}\). It did not compute anything. The genuine input was \(H_1(S^1)\cong\Z\) and \(H_1(D^2) = 0\), and that took Part III of
		this book. Category theory mostly <em>organises</em>; it rarely does the hard work by itself.
	</p>
</Remark>

<h2 id="naturality">Natural transformations: no arbitrary choices</h2>

<p>
	Mathematicians often say that some map is “natural” or “canonical”. For a long time this was a matter of taste: a natural map was
	one that did not seem to involve any arbitrary decisions. Eilenberg and Mac Lane made the idea precise, and the precise version is
	one of the most useful concepts in the subject. The cleanest example comes from linear algebra.
</p>

<h3 id="double-dual">Two isomorphisms, one natural</h3>

<p>
	Let \(V\) be a finite-dimensional real vector space. Its dual \(V^*\) is the space of linear measurements \(\varphi\colon V\to\R\),
	and it has the same dimension as \(V\) (<Ref to="foundations/linear-algebra" />). Two vector spaces of the same dimension are
	isomorphic, so \(V\cong V^*\). But try to write down an isomorphism. The usual recipe is: choose a basis \(e_1,\dots,e_n\) of
	\(V\), let \(e_1^*,\dots,e_n^*\) be the dual basis (\(e_i^*\) measures the \(i\)-th coordinate), and send \(e_i\mapsto e_i^*\).
	Call this map \(\beta\). It works — but it depends on the basis you chose. Choose a different basis and you get a different map.
</p>

<p>
	Now take one more step and consider the <dfn>double dual</dfn> \(V^{**} = (V^*)^*\): its elements are measurements of measurements,
	machines that eat a \(\varphi\in V^*\) and return a number. Here there is an isomorphism you can write down with no choices at all.
	A vector \(v\) gives the machine “evaluate at \(v\)”:
</p>
\[ \mathrm{ev}_V\colon V\to V^{**}, \qquad \mathrm{ev}_V(v) = \big(\varphi\mapsto\varphi(v)\big). \]
<p>
	It is linear, and for finite-dimensional \(V\) it is an isomorphism (it is injective, and both sides have the same dimension). No
	basis was mentioned. How do we turn the feeling “\(\mathrm{ev}\) involves no choices but \(\beta\) does” into mathematics?
</p>

<p>
	The answer is to ask how each map behaves when we <em>change perspective</em> — when we move \(V\) by a linear map \(T\colon V\to
	W\). If a construction involves no arbitrary choices, it cannot tell the difference between doing it before or after the move. For
	\(\mathrm{ev}\), that is the claim that the square
</p>
\[ \begin{array}{ccc} V & \xrightarrow{\;\mathrm{ev}_V\;} & V^{**} \\ {\scriptstyle T}\big\downarrow & & \big\downarrow{\scriptstyle T^{**}} \\ W & \xrightarrow[\;\mathrm{ev}_W\;]{} & W^{**} \end{array} \]
<p>
	commutes for <em>every</em> linear map \(T\). Here \(T^{**} = (T^*)^*\) is the double-dual map, \(T^{**}(\xi) = \xi\circ T^*\).
	Check it on a vector \(v\): going across then down gives \(\mathrm{ev}_V(v)\circ T^*\), which eats \(\psi\in W^*\) and returns
	\(\mathrm{ev}_V(v)(T^*\psi) = (T^*\psi)(v) = \psi(Tv)\). Going down then across gives \(\mathrm{ev}_W(Tv)\), which eats \(\psi\)
	and returns \(\psi(Tv)\). The same. That calculation is the entire proof.
</p>

<Definition id="def-nat" head={natHead}>
	<p>
		Let \(F, G\colon\mathcal C\to\mathcal D\) be two functors. A <dfn>natural transformation</dfn> \(\eta\colon F\Rightarrow G\)
		chooses, for every object \(X\) of \(\mathcal C\), an arrow \(\eta_X\colon F(X)\to G(X)\) in \(\mathcal D\) (its
		<em>component</em> at \(X\)), such that for every arrow \(f\colon X\to Y\) the <dfn>naturality square</dfn> commutes:
		\[ G(f)\circ\eta_X = \eta_Y\circ F(f). \]
		If every component \(\eta_X\) is an isomorphism, \(\eta\) is a <dfn>natural isomorphism</dfn>, and \(F\) and \(G\) are naturally
		isomorphic.
	</p>
</Definition>

{#snippet natHead()}Natural transformation \(\eta\colon F\Rightarrow G\){/snippet}

<p>
	The double arrow \(\Rightarrow\) is a reminder that \(\eta\) is an arrow between <em>functors</em>, one level up from arrows between
	objects. Evaluation is a natural isomorphism from the identity functor of finite-dimensional vector spaces to the double-dual
	functor \(V\mapsto V^{**}\) (which is covariant: two reversals cancel).
</p>

<p>
	What about \(\beta\colon V\to V^*\)? Here the double-dual trick is not available: \(V\mapsto V^*\) is contravariant, so there is not
	even a square of the right shape for a general \(T\). We can still test \(\beta\) against changes of perspective that can be
	undone. If \(T\colon V\to V\) is invertible, then \((T^{-1})^*\colon V^*\to V^*\) points the right way, and a choice-free \(\beta\)
	would make the square with \(T\) on the left and \((T^{-1})^*\) on the right commute. The figure lets you test that.
</p>

<Figure size="full" num="6" title="Natural versus chosen" hint="Pick a change of perspective T · drag the vector v">
	<NaturalitySquare />
	{#snippet caption()}
		Left: a vector \(v\) (gold), its image \(Tv\) (blue), and two measurements drawn as stacks of level lines, as in <Ref
			to="cohomology/differential-forms"
		/>. Right: the evaluation square commutes for every \(T\), because in coordinates \(T^{**}\) is just \(T\). The square for the
		dual-basis map \(\beta\) commutes only when \(T\) is a rotation or a reflection: for “Double”, one route gives \(2v\) and the other
		\(\tfrac12 v\). On the left the two stacks then fail to coincide. The reason: \(\beta(v)\) is “take the dot product with \(v\)”, a
		measurement built from lengths and angles, and a general linear map does not preserve lengths and angles.
	{/snippet}
</Figure>

<p>
	So \(V\) and \(V^*\) are isomorphic, but not <em>naturally</em> isomorphic, while \(V\) and \(V^{**}\) are naturally isomorphic. The
	precise statement is this: there is no way to choose isomorphisms \(V\to V^*\), one for every finite-dimensional space, that all
	commute with all invertible linear maps. (Already for \(V=\R\) and \(T\) = doubling, the square forces \(\beta = \tfrac14\beta\), so
	\(\beta=0\).) Mac Lane, describing a similar double-dual map for abelian groups, put it in words: naturality “is just a precise
	expression for the elementary observation that the definition … depends on no artificial choices of bases, generators, or the
	like.”
</p>

<Warning title="Isomorphic is not the same as naturally isomorphic">
	<p>
		Beginners (and experts in a hurry) often treat “isomorphic”, “naturally isomorphic” and “equal” as interchangeable. They are not.
		Two objects can be isomorphic in many ways, none of them preferred; a natural isomorphism is a coherent family of isomorphisms that
		commutes with everything. The distinction matters in practice: you can transport a natural isomorphism along maps, and you cannot
		do that with an arbitrary one.
	</p>
</Warning>

<h3>Naturality in the wild</h3>

<p>Two maps you have used in this book are natural transformations, and their naturality was doing work behind the scenes.</p>

<ul>
	<li>
		<strong>The Hurewicz map.</strong> For a space \(X\) with basepoint \(x_0\), the map \(h_X\colon\pi_1(X,x_0)\to H_1(X)\) sends
		the class of a loop to the class of the loop viewed as a 1-cycle (<Ref to="homology/invariance" />). For any based map \(f\colon
		X\to Y\),
		\[ f_*\circ h_X = h_Y\circ f_* : \]
		map a loop and then view it as a cycle, or view it as a cycle and then map it — the same. So \(h\) is a natural transformation
		between the functors \(\pi_1\) and \(H_1\) (both regarded as functors from based spaces to groups). This is why the Hurewicz
		isomorphism \(\pi_1(X)^{\mathrm{ab}}\cong H_1(X)\) for path-connected \(X\) is compatible with every map you apply.
	</li>
	<li>
		<strong>The connecting homomorphism.</strong> In the long exact sequence of a pair (<Ref to="homology/exact-sequences" />), the
		<Term t="connecting-homomorphism">connecting map</Term> \(\partial\colon H_n(X,A)\to H_{n-1}(A)\) is natural: a map of pairs
		\(f\colon(X,A)\to(Y,B)\) gives a commuting square
		\[ \begin{array}{ccc} H_n(X,A) & \xrightarrow{\;\partial\;} & H_{n-1}(A) \\ {\scriptstyle f_*}\big\downarrow & & \big\downarrow{\scriptstyle f_*} \\ H_n(Y,B) & \xrightarrow[\;\partial\;]{} & H_{n-1}(B) \end{array} \]
		So a map of pairs induces a whole ladder of commuting squares between two long exact sequences. Comparing such ladders is how
		many computations in <Ref to="homology/exact-sequences" /> really work.
	</li>
</ul>

<p>
	Not everything is natural. The Universal Coefficient Theorem of <Ref to="cohomology/cohomology-groups" /> says \(H^n(X;G)\cong
	\Hom(H_n(X),G)\oplus\Ext(H_{n-1}(X),G)\); the isomorphism exists, but the splitting into two pieces cannot be chosen naturally. We
	will meet this in the next chapter.
</p>

<History title="Born from homology">
	<p>
		In 1941 Samuel Eilenberg, a topologist recently arrived from Poland, asked Saunders Mac Lane for a private repeat of a lecture on
		group extensions. He noticed at once that Mac Lane’s algebraic answer coincided with a homology group that Steenrod had computed
		for a space Eilenberg had been studying (the complement of a solenoid). After an all-night session and months of puzzling, they
		explained the coincidence with what we now call the universal coefficient theorem (1942). To
		say precisely that \(\Hom(A,B)\) “varies naturally” with \(A\) and \(B\), they invented functors and natural isomorphisms; in 1945
		they added categories and natural transformations (Weibel’s <em>History of Homological Algebra</em> tells the story). Their 1945
		paper is candid about priorities: “It should be observed first that the whole concept of a category is essentially an auxiliary
		one; our basic concepts are essentially those of a functor and of natural transformation.”
	</p>
</History>

<h2 id="universal-properties">Universal properties: the best solution to a problem</h2>

<p>
	So far we have described objects by what they are made of. Category theory suggests a second description, which turns out to be
	astonishingly powerful: describe an object by <em>how it relates to every other object</em>. The typical shape of such a
	description is: “among all solutions to a certain problem, this one is the best, in the sense that every other solution factors
	through it in exactly one way.” Such a description is called a <dfn>universal property</dfn>.
</p>

<h3>Products</h3>

<p>
	Start with sets \(A\) and \(B\). The Cartesian product \(A\times B\) (<Ref to="foundations/sets-and-functions" />) comes with two
	projections, \(p_1(a,b) = a\) and \(p_2(a,b) = b\). Now suppose some other set \(X\) has a function to each factor, \(f\colon X\to A\)
	and \(g\colon X\to B\). Then there is a function \(X\to A\times B\) that “remembers both”, namely \(x\mapsto(f(x),g(x))\), usually
	written \(\langle f,g\rangle\). It makes both triangles in the diagram commute,
</p>
\[ p_1\circ\langle f,g\rangle = f, \qquad p_2\circ\langle f,g\rangle = g, \]
<p>
	and it is the <em>only</em> function that does: if \(h\colon X\to A\times B\) satisfies \(p_1\circ h = f\) and \(p_2\circ h = g\),
	then the two coordinates of \(h(x)\) are forced to be \(f(x)\) and \(g(x)\). Turn this observation into a definition that never
	mentions elements:
</p>

<Definition id="def-product" title="Product">
	<p>
		In a category, a <dfn>product</dfn> of objects \(A\) and \(B\) is an object \(P\) together with arrows \(p_1\colon P\to A\) and
		\(p_2\colon P\to B\), such that for every object \(X\) and every pair of arrows \(f\colon X\to A\), \(g\colon X\to B\) there is
		<strong>exactly one</strong> arrow \(u\colon X\to P\) with \(p_1\circ u = f\) and \(p_2\circ u = g\).
	</p>
	\[ \begin{array}{ccccc} & & X & & \\ & {\scriptstyle f}\swarrow & \big\downarrow{\scriptstyle u} & \searrow{\scriptstyle g} & \\ A & \xleftarrow[\;p_1\;]{} & P & \xrightarrow[\;p_2\;]{} & B \end{array} \]
</Definition>

<p>Read it as a problem and its best solution. The problem: “an object with an arrow to \(A\) and an arrow to \(B\)”. Every \(X\) with such a pair of arrows is a solution. The product is the solution through which all others pass, uniquely. Now look at products in our categories:</p>

<ul>
	<li>In \(\Set\): the Cartesian product, as we just saw.</li>
	<li>In \(\Ab\): the direct sum \(A\oplus B\) of <Ref to="foundations/abelian-groups" />, with the two coordinate projections.</li>
	<li>In \(\Top\): the product space with the product topology (<Ref to="topology/spaces" />). In fact the product topology is <em>designed</em> to make this work: it is the coarsest topology for which both projections are continuous.</li>
	<li>
		In a poset: a product of \(a\) and \(b\) is an element \(p\le a\), \(p\le b\) such that every \(x\) with \(x\le a\) and \(x\le b\)
		satisfies \(x\le p\) — the <em>greatest lower bound</em>. For the real numbers under \(\le\) it is \(\min(a,b)\); for positive
		integers under divisibility it is the greatest common divisor.
	</li>
</ul>

<Figure size="wide" num="7" title="Universal properties" hint="Product: click an element of X, then a pair · gcd: click two numbers · Kernel: drag g(1)">
	<UniversalProperty />
	{#snippet caption()}
		Three “best solutions”. <em>Product of sets:</em> the purple arrow \(h\) is forced — try to send an element of \(X\) to any other
		pair and a triangle stops commuting. <em>gcd in a poset:</em> among all common divisors of two numbers (violet), the gcd (gold) is
		the one every other divides, along a unique dashed arrow; switch to the coproduct and the lcm plays the same role with arrows
		reversed. <em>Kernel:</em> a map \(g\colon\R\to\R^2\) with \(f\circ g = 0\) factors through the kernel line in exactly one way.
	{/snippet}
</Figure>

<Proposition id="prop-unique" title="Universal objects are unique up to unique isomorphism">
	<p>
		If \((P, p_1, p_2)\) and \((P', p_1', p_2')\) are both products of \(A\) and \(B\), there is exactly one isomorphism \(P\to P'\)
		compatible with the projections.
	</p>
</Proposition>
<Proof>
	<p>
		Use the universal property of \(P'\) on the pair \(p_1, p_2\): there is exactly one \(u\colon P\to P'\) with \(p_i'\circ u = p_i\).
		Likewise there is exactly one \(u'\colon P'\to P\) with \(p_i\circ u' = p_i'\). Then \(u'\circ u\colon P\to P\) satisfies \(p_i\circ
		(u'\circ u) = p_i\). But \(1_P\) satisfies the same equations, and the universal property of \(P\) (with \(X = P\)) says there is
		only <em>one</em> such arrow. So \(u'\circ u = 1_P\), and similarly \(u\circ u' = 1_{P'}\).
	</p>
</Proof>

<p>
	This is why we may say “<em>the</em> product”: any two are isomorphic in one, and only one, compatible way. The same argument works
	for every universal property below.
</p>

<h3 id="coproducts">Coproducts: the same, with arrows reversed</h3>

<p>
	Turn every arrow around and you get the dual notion. A <dfn>coproduct</dfn> of \(A\) and \(B\) is an object \(Q\) with arrows
	\(i_1\colon A\to Q\) and \(i_2\colon B\to Q\) such that any pair \(f\colon A\to X\), \(g\colon B\to X\) factors as \(f = u\circ i_1\),
	\(g = u\circ i_2\) for exactly one \(u\colon Q\to X\). In \(\Set\) and \(\Top\) the coproduct is the disjoint union \(A\sqcup B\):
	a map out of a disjoint union is the same as a map out of each piece. In a poset it is the least upper bound (the lcm for
	divisibility). And in \(\Ab\) it is — again — the direct sum \(A\oplus B\), with the inclusions \(a\mapsto(a,0)\) and \(b\mapsto(0,b)\):
	a homomorphism out of \(A\oplus B\) is a pair of homomorphisms, added together, \(u(a,b) = f(a)+g(b)\). That one object is both the
	product and the coproduct is a special feature of abelian groups; it will reappear in the last section.
</p>

<h3 id="kernels-cokernels">Kernels, cokernels, quotients and free groups</h3>

<p>Four constructions you have used since Part I are universal.</p>

<ul>
	<li>
		<strong>Kernel.</strong> For a homomorphism \(f\colon A\to B\) of abelian groups, the inclusion \(\iota\colon\ker f\to A\)
		satisfies \(f\circ\iota = 0\), and it is the best such map: every \(g\colon X\to A\) with \(f\circ g = 0\) lands inside \(\ker f\),
		so it factors as \(g = \iota\circ\hat g\) for exactly one \(\hat g\colon X\to\ker f\). (The third tab of Figure 7 shows this for a
		linear map \(\R^2\to\R\).)
	</li>
	<li>
		<strong>Cokernel.</strong> Reverse the arrows. The <dfn>cokernel</dfn> of \(f\) is the quotient \(\coker f = B/\im f\), with the
		projection \(\pi\colon B\to\coker f\). It satisfies \(\pi\circ f = 0\), and every \(g\colon B\to Y\) with \(g\circ f = 0\) factors
		as \(g = \bar g\circ\pi\) for exactly one \(\bar g\). The cokernel is the dual twin of the kernel — “what is not reached”, where
		the kernel was “what is crushed”.
	</li>
	<li>
		<strong>Quotients.</strong> A special case you used constantly: a homomorphism out of a quotient group \(G/H\) is the same thing
		as a homomorphism out of \(G\) that sends \(H\) to zero (<Ref to="foundations/abelian-groups" />). Homology \(H_n = Z_n/B_n\) is a
		quotient, and this universal property is exactly why a chain map induces a well-defined map on homology: it sends cycles to cycles
		and boundaries to boundaries, so it kills what needs killing.
	</li>
	<li>
		<strong>Free abelian groups.</strong> A homomorphism out of \(\Z[S]\) is the same thing as an arbitrary function out of \(S\): you
		may send the generators anywhere, and linearity does the rest, uniquely. That is why the boundary operator could be defined just
		by saying what it does to each simplex.
	</li>
</ul>

<KeyIdea>
	<p>
		A universal property defines an object by a <em>job description</em> instead of a recipe: “the best object with arrows to \(A\)
		and \(B\)”, “the best arrow that \(f\) kills”, “the best place to send generators freely”. Recipes differ from category to
		category; job descriptions are the same everywhere, and anything that satisfies one is unique up to unique isomorphism.
	</p>
</KeyIdea>

<Warning title="The best solution need not exist">
	<p>
		A universal property is a specification, not a guarantee. In the category of fields there is no product of \(\Q\) and \(\Z/2\),
		for instance, and in a poset two elements may have no greatest lower bound at all. Part of studying a category is finding out which
		universal constructions it has.
	</p>
</Warning>

<h2 id="abelian-categories">Equivalences, and where homological algebra lives</h2>

<h3>When are two categories “the same”?</h3>

<p>
	Categories and functors form a world of their own, so we can ask our usual question one level up: when are two categories the
	same? An <em>isomorphism</em> of categories — functors \(F\colon\mathcal C\to\mathcal D\) and \(G\colon\mathcal D\to\mathcal C\) with
	\(G\circ F\) and \(F\circ G\) exactly the identity functors — turns out to be far too strict to be useful. The right notion lets the
	round trips be the identity only up to natural isomorphism.
</p>

<Definition id="def-equivalence" title="Equivalence of categories">
	<p>
		Functors \(F\colon\mathcal C\to\mathcal D\) and \(G\colon\mathcal D\to\mathcal C\) form an <dfn>equivalence of categories</dfn>
		if \(G\circ F\) is naturally isomorphic to the identity functor of \(\mathcal C\) and \(F\circ G\) is naturally isomorphic to the
		identity functor of \(\mathcal D\).
	</p>
</Definition>

<p>
	The motivating example is linear algebra itself. Compare the category of finite-dimensional real vector spaces with the matrix
	category from the gallery (objects \(0,1,2,\dots\), arrows matrices). Send \(n\) to \(\R^n\) and a matrix to the linear map it
	defines: every linear map between \(\R^n\) and \(\R^m\) comes from exactly one matrix, and every finite-dimensional space is
	isomorphic to some \(\R^n\). Choosing a basis for every space gives a functor back, and the round trips are naturally isomorphic to
	the identities. So the two categories are equivalent, even though one has a single object for each dimension and the other has
	vast numbers of different-looking spaces of each dimension. This is the precise sense in which “doing linear algebra with
	matrices” loses nothing — and it is the right way to compare categories that are alike but of very different sizes.
</p>

<h3 id="additive-abelian">Additive and abelian categories</h3>

<p>
	Look again at the abelian-group world \(\Ab\). It has features that \(\Set\), \(\Top\) and even \(\Grp\) lack:
</p>
<ul>
	<li>
		<strong>You can add arrows.</strong> Two homomorphisms \(f,g\colon A\to B\) have a sum, \((f+g)(a) = f(a)+g(a)\), and composition
		distributes over this addition. Each hom-set \(\Ab(A,B)\) is itself an abelian group. (In \(\Grp\) this fails: the pointwise
		product of two homomorphisms of a non-abelian group need not be a homomorphism.)
	</li>
	<li>
		<strong>There is a zero object</strong>, the trivial group \(0\), with exactly one arrow to and from every object; composing
		through it gives the zero maps.
	</li>
	<li><strong>Products and coproducts agree</strong>: \(A\oplus B\) is both, as we saw.</li>
	<li>
		<strong>Every arrow has a kernel and a cokernel</strong>, and the first isomorphism theorem holds: the natural map from \(A/\ker
		f\) to \(\im f\) is an isomorphism (<Ref to="foundations/abelian-groups" />).
	</li>
</ul>

<p>
	A category with the first three features (stated with care) is called <dfn>additive</dfn>; one with all four is called
	<dfn>abelian</dfn>. Abelian categories are exactly the places where the words “exact sequence”, “kernel”, “image” and “homology”
	make sense, and where every theorem of the next chapter — the snake lemma, long exact sequences, derived functors — can be proved
	once and for all. Examples include abelian groups, vector spaces, modules over a ring, chain complexes, and sheaves of abelian groups
	on a space (<Ref to="cohomology/sheaves" />). It was the last example that drove the definition: Alexander Grothendieck’s 1957 paper
	“Sur quelques points d’algèbre homologique”, known as the Tôhoku paper, introduced the hierarchy of axioms for abelian categories
	so that sheaf cohomology could be treated with the same tools as the cohomology of spaces.
</p>

<Question>
	<p>
		The direct sum is both a product and a coproduct in \(\Ab\). In \(\Set\), the product \(A\times B\) and the coproduct \(A\sqcup
		B\) are very different: if \(A\) has 3 elements and \(B\) has 2, how many elements does each have? Which numerical operations do
		“product” and “coproduct” become, and why might they coincide for abelian groups but not for sets?
	</p>
</Question>

<p>
	We end where Mac Lane’s epigraph began. Categories were defined so that functors could be defined, and functors so that natural
	transformations could be defined. In this book the payoff of the whole language is a handful of precise sentences: homology is a
	covariant functor \(\Top\to\Ab\); cohomology is a contravariant one; the long exact sequences are natural; direct sums, kernels and
	quotients are universal; and theorems such as Brouwer’s follow by applying a functor to a diagram that cannot exist.
</p>

<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="The real line as a category">
	<p>
		Check that the real numbers with one arrow \(a\to b\) whenever \(a\le b\) form a category. What are the identity arrows? What is
		the composite of \(2\to 5\) and \(5\to 7\)? Which arrows are isomorphisms?
	</p>
	{#snippet hint()}
		<p>Composition is transitivity of \(\le\). For isomorphisms you need an arrow back.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			Composition exists because \(a\le b\) and \(b\le c\) give \(a\le c\); the identity arrow \(a\to a\) exists because \(a\le a\);
			associativity and the unit laws hold automatically, since between two numbers there is at most one arrow. The composite of
			\(2\to 5\) and \(5\to 7\) is the unique arrow \(2\to 7\). If \(a\to b\) is an isomorphism, there is also an arrow \(b\to a\), so
			\(a\le b\) and \(b\le a\), hence \(a = b\). So the only isomorphisms are the identities.
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Abelian groups form a category">
	<p>
		Show that if \(f\colon A\to B\) and \(g\colon B\to C\) are homomorphisms of abelian groups, so is \(g\circ f\), and that the
		identity function is a homomorphism. Why does associativity need no new proof?
	</p>
	{#snippet hint()}
		<p>Compute \((g\circ f)(a + a')\) using the homomorphism property twice.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			\((g\circ f)(a+a') = g(f(a)+f(a')) = g(f(a)) + g(f(a')) = (g\circ f)(a) + (g\circ f)(a')\), using that \(f\), then \(g\), is a
			homomorphism. The identity satisfies \(\id(a+a') = a+a' = \id(a)+\id(a')\). Associativity holds because homomorphisms are in
			particular functions, and composition of functions is associative: both \(h\circ(g\circ f)\) and \((h\circ g)\circ f\) send \(a\)
			to \(h(g(f(a)))\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Duals reverse composition">
	<p>
		For linear maps \(f\colon U\to V\) and \(g\colon V\to W\), the dual maps are \(f^*(\varphi) = \varphi\circ f\) and similarly for
		\(g\). Show that \((g\circ f)^* = f^*\circ g^*\) and \((\id_V)^* = \id_{V^*}\). Which familiar matrix identity is this?
	</p>
	{#snippet solution()}
		<p>
			For \(\psi\in W^*\): \((g\circ f)^*(\psi) = \psi\circ g\circ f\), while \(f^*(g^*(\psi)) = f^*(\psi\circ g) = (\psi\circ g)\circ f\).
			These are equal by associativity of composition. And \((\id_V)^*(\varphi) = \varphi\circ\id_V = \varphi\). So \(V\mapsto V^*\) is a
			contravariant functor. In matrices, the dual map is the transpose, and the identity reads \((BA)^{\mathsf T} = A^{\mathsf
			T}B^{\mathsf T}\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} head={exPi0}>
	<p>
		Explain why a continuous map \(f\colon X\to Y\) sends each path component of \(X\) into a single path component of \(Y\), and
		deduce that \(\pi_0\) is a functor \(\Top\to\Set\). Then use it, as in the text, to show that there is no continuous map from the
		circle \(S^1\) onto the two-point space \(\{0,1\}\) that is surjective.
	</p>
	{#snippet hint()}
		<p>The image of a path is a path. For the second part, think about \(\pi_0(S^1)\).</p>
	{/snippet}
	{#snippet solution()}
		<p>
			If \(x\) and \(x'\) are joined by a path \(\gamma\) in \(X\), then \(f\circ\gamma\) is a path from \(f(x)\) to \(f(x')\) in
			\(Y\). So \(f\) induces a function \(\pi_0(f)\colon\pi_0(X)\to\pi_0(Y)\) sending the component of \(x\) to the component of
			\(f(x)\); this is well defined by what we just said. Composites and identities are respected because \(\pi_0(g\circ f)\) and
			\(\pi_0(g)\circ\pi_0(f)\) both send the component of \(x\) to the component of \(g(f(x))\). For the second part: a surjective
			continuous \(f\colon S^1\to\{0,1\}\) would give a surjective function \(\pi_0(f)\) from the one-element set \(\pi_0(S^1)\) onto
			the two-element set \(\pi_0(\{0,1\})\) — impossible. (Surjectivity of \(f\) passes to \(\pi_0(f)\), since every component of
			\(\{0,1\}\) contains a point \(f(x)\).)
		</p>
	{/snippet}
</Exercise>

{#snippet exPi0()}\(\pi_0\) is a functor{/snippet}

<Exercise level={2} title="Evaluation is natural">
	<p>
		Prove the naturality of \(\mathrm{ev}\): for every linear map \(T\colon V\to W\) and every \(v\in V\), \(T^{**}(\mathrm{ev}_V(v))
		= \mathrm{ev}_W(Tv)\), where \(T^{**}(\xi) = \xi\circ T^*\).
	</p>
	{#snippet solution()}
		<p>
			Both sides are elements of \(W^{**}\), i.e. machines that eat \(\psi\in W^*\). The left side eats \(\psi\) and returns
			\((\mathrm{ev}_V(v)\circ T^*)(\psi) = \mathrm{ev}_V(v)(\psi\circ T) = (\psi\circ T)(v) = \psi(Tv)\). The right side returns
			\(\mathrm{ev}_W(Tv)(\psi) = \psi(Tv)\). They agree on every \(\psi\), so they are equal. Nowhere did we choose a basis.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Products and coproducts in two posets">
	<p>
		(a) In the positive integers ordered by divisibility, show that the product of \(a\) and \(b\) is \(\gcd(a,b)\) and the coproduct
		is \(\operatorname{lcm}(a,b)\). (b) In the real numbers ordered by \(\le\), what are the product and coproduct of \(a\) and \(b\)?
	</p>
	{#snippet solution()}
		<p>
			(a) A product of \(a\) and \(b\) is an element \(p\) with arrows \(p\to a\), \(p\to b\) (so \(p\) divides both) such that every
			\(x\) dividing both also divides \(p\). The gcd has exactly this property: every common divisor divides the gcd. Arrows are
			unique automatically, because a poset has at most one arrow between two elements. Dually, the coproduct is a common multiple that
			divides every common multiple: the lcm. (b) For \(\le\), the product is \(\min(a,b)\) and the coproduct is \(\max(a,b)\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Telling spaces apart with functors">
	<p>
		Use the proposition that functors preserve isomorphisms to show: (a) the plane with one point removed, \(\R^2\setminus\{0\}\), is
		not homeomorphic to \(\R^2\); (b) the circle is not homotopy equivalent to the 2-sphere.
	</p>
	{#snippet hint()}
		<p>
			Which functor sends the two spaces to non-isomorphic groups? Remember that \(\R^2\setminus\{0\}\) deformation retracts onto a
			circle.
		</p>
	{/snippet}
	{#snippet solution()}
		<p>
			(a) \(\R^2\setminus\{0\}\) is homotopy equivalent to \(S^1\), so \(H_1(\R^2\setminus\{0\})\cong\Z\), while \(\R^2\) is
			contractible, so \(H_1(\R^2) = 0\). A homeomorphism would be an isomorphism in \(\Top\), and the functor \(H_1\) would turn it
			into an isomorphism \(\Z\cong 0\), which is false. (b) In \(\mathsf{hTop}\) the functor \(H_1\) sends \(S^1\) to \(\Z\) and \(S^2\)
			to \(0\) (or use \(H_2\): \(0\) versus \(\Z\)). A homotopy equivalence would be an isomorphism in \(\mathsf{hTop}\), giving an
			isomorphism \(\Z\cong 0\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Groups as categories">
	<p>
		Regard groups \(G\) and \(H\) as one-object categories. (a) Show that a functor \(G\to H\) is the same thing as a group
		homomorphism. (b) Show that a natural transformation between two such functors \(F, F'\colon G\to H\) is a single element
		\(h\in H\) with \(F'(g) = h\,F(g)\,h^{-1}\) for every \(g\in G\).
	</p>
	{#snippet solution()}
		<p>
			(a) There is only one object on each side, so the functor must send \(\bigstar\) to \(\bigstar\). On arrows it is a function
			\(F\colon G\to H\), and the functor laws say \(F(g g') = F(g)F(g')\) and \(F(e) = e\): exactly a homomorphism. (b) A natural
			transformation has one component, an arrow \(\eta_\bigstar\colon\bigstar\to\bigstar\) of \(H\), that is, an element \(h\in H\).
			The naturality square for the arrow \(g\) says \(F'(g)\circ h = h\circ F(g)\), i.e. \(F'(g)\,h = h\,F(g)\), i.e. \(F'(g) =
			hF(g)h^{-1}\). So two homomorphisms are naturally isomorphic exactly when they differ by conjugation by a single element (every
			natural transformation here is an isomorphism, since \(h\) is invertible).
		</p>
	{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>
			A <strong>category</strong> has objects, arrows between them, identities and an associative composition. Sets, groups, vector
			spaces, spaces, chain complexes, posets, a single group and matrices all form categories.
		</li>
		<li>
			A diagram <strong>commutes</strong> when all routes between two points agree; diagram chasing is following elements around it.
			An <strong>isomorphism</strong> is an arrow with a two-sided inverse; bijections, homeomorphisms and homotopy equivalences are
			all isomorphisms in suitable categories.
		</li>
		<li>
			A <strong>functor</strong> sends objects to objects and arrows to arrows, preserving composition and identities. \(H_n\) is a
			functor \(\Top\to\Ab\); so are \(\pi_0\), \(\pi_1\) (on based spaces), forgetful and free functors.
		</li>
		<li>
			A <strong>contravariant</strong> functor reverses arrows: preimage, dual space (transpose), \(\Hom(-,G)\) and cohomology
			\(H^n\colon\Top\op\to\Ab\).
		</li>
		<li>
			Functors preserve isomorphisms and commutative diagrams, which is why invariants tell objects apart and why “no retraction
			\(D^2\to S^1\)” follows from \(\Z\to 0\to\Z\).
		</li>
		<li>
			A <strong>natural transformation</strong> is a family of arrows commuting with every map. \(V\to V^{**}\) is natural; any
			isomorphism \(V\to V^*\) needs a choice and is not. The Hurewicz map and connecting homomorphisms are natural.
		</li>
		<li>
			<strong>Universal properties</strong> describe objects as best solutions: products, coproducts, kernels, cokernels, quotients and
			free groups; they are unique up to unique isomorphism.
		</li>
		<li>
			<strong>Equivalence</strong> is the right sameness for categories. <strong>Abelian categories</strong> — abelian groups, vector
			spaces, modules, chain complexes, sheaves — are where homological algebra lives.
		</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading items={[...reading]} />

<style>
	.same {
		vertical-align: middle;
		text-align: center;
		color: var(--gold-bright);
		font-style: italic;
		border-left: 1px solid var(--line-faint);
		background: rgba(216, 178, 110, 0.05);
	}
</style>
