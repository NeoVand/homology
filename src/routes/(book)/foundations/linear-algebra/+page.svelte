<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	import Definition from '$lib/components/prose/Definition.svelte';
	import Theorem from '$lib/components/prose/Theorem.svelte';
	import Proof from '$lib/components/prose/Proof.svelte';
	import Example from '$lib/components/prose/Example.svelte';
	import Intuition from '$lib/components/prose/Intuition.svelte';
	import KeyIdea from '$lib/components/prose/KeyIdea.svelte';
	import Warning from '$lib/components/prose/Warning.svelte';
	import Remark from '$lib/components/prose/Remark.svelte';
	import History from '$lib/components/prose/History.svelte';
	import Recap from '$lib/components/prose/Recap.svelte';
	import Question from '$lib/components/prose/Question.svelte';
	import Exercise from '$lib/components/prose/Exercise.svelte';
	import Figure from '$lib/components/prose/Figure.svelte';
	import Term from '$lib/components/prose/Term.svelte';
	import Ref from '$lib/components/prose/Ref.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import LightsOut from '$lib/figures/foundations/linear-algebra/LightsOut.svelte';
	import VectorAdd from '$lib/figures/foundations/linear-algebra/VectorAdd.svelte';
	import SwitchAdder from '$lib/figures/foundations/linear-algebra/SwitchAdder.svelte';
	import SpanTriptych from '$lib/figures/foundations/linear-algebra/SpanTriptych.svelte';
	import LinearMapPlayground from '$lib/figures/foundations/linear-algebra/LinearMapPlayground.svelte';
	import ShadowProjection from '$lib/figures/foundations/linear-algebra/ShadowProjection.svelte';
	import RowReduction from '$lib/figures/foundations/linear-algebra/RowReduction.svelte';
	import SolveByCoset from '$lib/figures/foundations/linear-algebra/SolveByCoset.svelte';
	import QuotientPlane from '$lib/figures/foundations/linear-algebra/QuotientPlane.svelte';
	import CovectorStack from '$lib/figures/foundations/linear-algebra/CovectorStack.svelte';
	import SmithStepper from '$lib/figures/foundations/linear-algebra/SmithStepper.svelte';

	const reading = [
		{
			title: 'Essence of Linear Algebra',
			author: '3Blue1Brown (Grant Sanderson)',
			url: 'https://www.3blue1brown.com/topics/linear-algebra',
			note: 'Sixteen short animated lessons that think of matrices as transformations of a grid. Chapter 7 (column space and null space) and chapter 9 (dot products and duality) match this chapter almost picture for picture. The best first stop.',
			kind: 'video' as const,
			free: true
		},
		{
			title: 'Immersive Linear Algebra',
			author: 'J. Ström, K. Åström and T. Akenine-Möller',
			url: 'https://immersivemath.com/ila/',
			note: 'An online textbook in which every figure can be dragged and rotated. Excellent for building geometric intuition in two and three dimensions.',
			kind: 'interactive' as const,
			free: true
		},
		{
			title: 'Interactive Linear Algebra',
			author: 'Dan Margalit and Joseph Rabinoff',
			url: 'https://textbooks.math.gatech.edu/ila/',
			note: 'A complete first course with many small demonstrations. Particularly clear on row reduction and on solution sets as translated null spaces.',
			kind: 'book' as const,
			free: true
		},
		{
			title: 'Linear Algebra Done Right (4th edition)',
			author: 'Sheldon Axler',
			url: 'https://linear.axler.net/',
			note: 'A clean, proof-based treatment, open access since its fourth edition. Read it after this chapter for full proofs of the exchange lemma, quotient spaces and duality.',
			kind: 'book' as const,
			free: true
		},
		{
			title: 'MIT 18.06 Linear Algebra',
			author: 'Gilbert Strang',
			url: 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/',
			note: "Strang's famous lecture course. His picture of the 'four fundamental subspaces' of a matrix is the duality theorem of this chapter, drawn as a diagram.",
			kind: 'video' as const,
			free: true
		},
		{
			title: 'Turning Lights Out with Linear Algebra',
			author: 'Marlow Anderson and Todd Feil, Mathematics Magazine 71 (1998)',
			url: 'https://doi.org/10.1080/0025570X.1998.11996658',
			note: 'The short classic article behind our Lights Out section: the puzzle as a linear system over ℤ/2, quiet patterns and all.',
			kind: 'paper' as const
		},
		{
			title: 'Computing Homology',
			author: 'Jeremy Kun',
			url: 'https://jeremykun.com/2013/04/10/computing-homology/',
			note: "A programmer's walk from boundary matrices to Betti numbers by row and column reduction: this chapter, put to work. Best read alongside Part III.",
			kind: 'web' as const,
			free: true
		},
		{
			title: 'Hodge Laplacians on graphs',
			author: 'Lek-Heng Lim',
			url: 'https://arxiv.org/abs/1507.05379',
			note: 'An elementary introduction that builds cohomology and Hodge theory on graphs out of nothing but matrices and their transposes. A rewarding read after Part IV.',
			kind: 'paper' as const,
			free: true
		},
		{
			title: 'Graphical Linear Algebra',
			author: 'Paweł Sobociński',
			url: 'https://graphicallinearalgebra.net/',
			note: 'A playful blog that rebuilds linear algebra from string diagrams. A very different and eye-opening angle on matrices, kernels and duality.',
			kind: 'web' as const,
			free: true
		}
	];
</script>

<div class="la">
<Epigraph author="Michael Atiyah" source="Mathematics in the 20th century (2002)"
	>Algebra is the offer made by the devil to the mathematician. The devil says: ‘I will give you this powerful machine, it will answer
	any question you like. All you need to do is give me your soul: give up geometry and you will have this marvellous machine.’</Epigraph
>

<p class="lead">
	Here is a puzzle that fits in a pocket. Twenty-five lights sit in a five-by-five grid. Pressing a light switches it (on becomes
	off, off becomes on), and it also switches its neighbours directly above, below, left and right. Some lights are on. Can you switch
	them all off?
</p>

<Figure num="1.5.1" title="Lights Out" hint="Click a light to press it">
	<LightsOut mode="play" />
	{#snippet caption()}
		The electronic game <em>Lights Out</em>. Each press switches a plus-shaped group of lights. Play a few rounds, on the small
		\(3 \times 3\) board too, and watch for patterns. Does the order of your presses matter? What happens if you press the same light
		twice?
	{/snippet}
</Figure>

<p>
	If you played for a minute, you probably discovered two facts. The <em>order</em> of presses does not matter: in the end each light
	has simply been switched some number of times. And pressing the same button twice does nothing at all: the light and its neighbours
	flip, then flip back. Some boards also start to feel suspicious. Is every arrangement of lights solvable? When one is, how many
	different solutions does it have? And if one is <em>not</em>, how could you ever prove it, short of trying all
	\(2^{25} = 33{,}554{,}432\) possible sets of presses?
</p>

<p>
	This chapter answers all three questions: exactly a quarter of all boards can be solved; every solvable board has exactly four
	solutions; and a board is solvable precisely when it passes two simple parity tests. It does so with a single tool,
	<strong>linear algebra</strong>, the mathematics of things that can be added together and scaled. Linear algebra is arguably the
	most useful subject in all of mathematics, and for this book it is the engine room: almost every computation in homology is a
	computation in linear algebra.
</p>

<p>
	Atiyah’s devil offers algebra as a machine that answers any question, at the price of giving up geometry. In this chapter we take
	the machine but refuse the bargain. Every idea comes with a picture.
</p>

<Ahead>
	<p>
		Homology is computed with linear algebra. In <Ref to="homology/chains" /> a shape becomes a list of <em>boundary matrices</em>
		\(\partial_k\), and in <Ref to="homology/homology-groups" /> its number of \(k\)-dimensional holes turns out to be
		\[ b_k \;=\; n_k - \rank \partial_k - \rank \partial_{k+1}, \]
		a count of building blocks minus two <em>ranks</em>. By the end of this chapter you will know what every symbol in that formula
		means, why the formula is true, and how to compute it by hand; <Ref to="homology/computing" /> lets a machine do it. The second
		half of the chapter, on <em>duality</em>, prepares for cohomology: in <Ref to="cohomology/cohomology-groups" /> the coboundary map
		is literally the <em>transpose</em> \(\partial^{\mathsf T}\) of the boundary matrix, and the parity tests of Lights Out are
		prototypes of cohomology classes. Finally, the <em>Smith normal form</em> at the end of the chapter is how
		<Ref to="homology/computing" /> detects torsion, such as the \(\Z/2\) hidden inside the Klein bottle.
	</p>
</Ahead>

<!-- ───────────────────────────────────────────────────────────────────── -->

<h2 id="vectors">Vectors: arrows, lists and switches</h2>

<p>
	The word <em>vector</em> has three everyday meanings in mathematics. They look different, and the first job of this chapter is to
	convince you that they are one idea.
</p>

<p>
	The first picture is an <strong>arrow</strong>: a displacement, such as “three steps east and one step north”. What matters is the
	length and direction of the trip, not where it starts, but we will usually draw arrows starting from a fixed point called the
	<dfn>origin</dfn>.
</p>

<p>
	The second picture is a <strong>list of numbers</strong>. The trip above is recorded as \((3, 1)\): three units along the horizontal
	axis, one unit up the vertical one. Lists of two numbers describe the plane, lists of three describe space, and nothing stops us
	from using lists of \(n\) numbers for any whole number \(n\). The set of all such lists is written \(\R^n\), read “R-n” or “R to
	the n”. Here \(\R\) stands for the <em>real numbers</em>, all the points of the number line, fractions and \(\sqrt 2\) and \(\pi\)
	included. We print vectors in bold, like \(\mathbf u\) and \(\mathbf v\), to tell them apart from ordinary numbers, and we write
	\(\mathbf 0\) for the zero vector \((0, 0, \dots, 0)\), the trip that goes nowhere.
</p>

<p>Arrows and lists can do two things, and the whole subject is built from these two:</p>
<ul>
	<li>
		<strong>Add.</strong> To add arrows, put them tip to tail: walk along \(\mathbf u\), then along \(\mathbf v\). To add lists, add
		entry by entry: \((3,1) + (-1,2) = (2,3)\). These are the same operation.
	</li>
	<li>
		<strong>Scale.</strong> To multiply an arrow by a number \(c\), stretch it by the factor \(c\), turning it around if \(c\) is
		negative. To multiply a list by \(c\), multiply every entry: \(1.5\,(3,1) = (4.5, 1.5)\). Again, the same operation. The numbers
		we scale by are called <dfn>scalars</dfn>.
	</li>
</ul>

<Figure num="1.5.2" title="Adding arrows, adding lists" hint="Drag u and v · drag the green tip to scale u">
	<VectorAdd />
	{#snippet caption()}
		Walking along \(\mathbf u\) and then along \(\mathbf v\) ends at the same place as walking along \(\mathbf v\) and then along
		\(\mathbf u\): the gold diagonal of the parallelogram, \(\mathbf u + \mathbf v\). The readout computes the same sum with lists.
		The green arrow is \(c\,\mathbf u\): drag its tip and it slides along the line through \(\mathbf u\), never off it.
	{/snippet}
</Figure>

<p>
	An expression built from these two operations, such as \(2\mathbf u - 3\mathbf v\), or \(a\mathbf u + b\mathbf v\) for numbers
	\(a\) and \(b\), is called a <dfn>linear combination</dfn> of \(\mathbf u\) and \(\mathbf v\). Linear combinations are the sentences
	of linear algebra. Almost everything that follows is about which vectors can be written as linear combinations of which others.
</p>

<h3>The rules of the game</h3>

<p>
	Arrows are not the only things that can be added and scaled. Polynomials can: \((x^2 + 1) + (3x - 1) = x^2 + 3x\). So can sound
	waves, temperature maps and, as we will see in a moment, sets of edges in a network. Rather than develop a separate theory for each,
	mathematicians list the rules that adding and scaling always obey, and call anything that obeys them a <em>vector space</em>. Every
	theorem proved from the rules then applies to all of these examples at once.
</p>

<p>
	First we must say which numbers we may scale by. We want to add, subtract, multiply and, crucially, divide by anything except zero,
	with all the familiar rules of arithmetic still true.
</p>

<Definition id="def-field" title="Field">
	<p>
		A <dfn>field</dfn> is a set of “numbers” with an addition and a multiplication that behave like ordinary arithmetic: both
		operations are commutative and associative, multiplication distributes over addition, there are numbers \(0\) and \(1\), every
		number \(a\) has a negative \(-a\), and every number except \(0\) has a reciprocal \(1/a\).
	</p>
</Definition>

<p>
	The rational numbers \(\Q\) (fractions) and the real numbers \(\R\) are fields. The integers \(\Z\) are <em>not</em> a field: the
	number \(2\) has no reciprocal among the integers, because \(\tfrac12\) is not a whole number. Keep that failure in mind. It returns
	at the end of the chapter, where it is responsible for torsion.
</p>

<Definition id="def-vector-space" title="Vector space">
	<p>
		A <dfn>vector space</dfn> over a field \(F\) is a set \(V\), whose elements are called vectors, together with an addition
		\(\mathbf u + \mathbf v\) and a scalar multiplication \(c\,\mathbf v\) (for \(c\) in \(F\)), such that:
	</p>
	<ol>
		<li>
			\(V\) with \(+\) is an <Term t="abelian-group">abelian group</Term>: addition is associative and commutative, there is a zero
			vector \(\mathbf 0\) with \(\mathbf v + \mathbf 0 = \mathbf v\), and every \(\mathbf v\) has a negative \(-\mathbf v\) with
			\(\mathbf v + (-\mathbf v) = \mathbf 0\);
		</li>
		<li>
			scaling cooperates with everything: \(1\,\mathbf v = \mathbf v\), \(a\,(b\,\mathbf v) = (ab)\,\mathbf v\),
			\((a + b)\,\mathbf v = a\mathbf v + b\mathbf v\) and \(a\,(\mathbf u + \mathbf v) = a\mathbf u + a\mathbf v\).
		</li>
	</ol>
</Definition>

<p>
	Read slowly, the definition says only this: you can add vectors and scale them, and none of the usual algebra goes wrong.
	\(\R^n\) is a vector space over \(\R\), and \(\Q^n\), lists of fractions, is one over \(\Q\). A non-example is worth meeting early:
	the grid points \(\Z^2\), pairs of integers, can be added and form an abelian group (the
	<Term t="free-abelian-group">free abelian group</Term> of <Ref to="foundations/abelian-groups" />), but scaling by \(\tfrac12\)
	knocks \((1, 0)\) off the grid. So \(\Z^2\) is not a vector space over \(\Q\) or \(\R\).
</p>

<h3>Vectors that are switches: the field \(\Z/2\)</h3>

<p>
	Now for a field you may not have met. In <Ref to="foundations/groups" /> you saw
	<Term t="integers-mod-n">clock arithmetic</Term> with two hours,
	\(\Z/2 = \set{0, 1}\) (read “Z mod 2”), in which \(1 + 1 = 0\). Think “odd plus odd is even”. Multiplication is the obvious one: \(0 \cdot 0 =
	0 \cdot 1 = 0\) and \(1 \cdot 1 = 1\). This tiny number system is a field, because its only nonzero number is \(1\), whose
	reciprocal is \(1\) itself. So it is a perfectly good choice of scalars. Many books write it \(\F_2\), read “F-two”, the F standing
	for field; in this book we write \(\Z/2\).
</p>

<p>
	A vector over \(\Z/2\) is a list of 0s and 1s, such as \((1,0,1,1,0,0)\). Picture it as a row of six switches, or as the set of
	positions that are switched on: label the positions \(a, b, c, d, e, f\), and this vector is the set \(\set{a, c, d}\). Adding two
	such vectors entry by entry, with \(1 + 1 = 0\), switches on exactly the positions that are on in one vector or the other
	<em>but not in both</em>. For sets this operation has a name: the <dfn>symmetric difference</dfn>.
</p>

<Figure num="1.5.3" title="Vectors over ℤ/2 are rows of switches" hint="Click the switches">
	<SwitchAdder />
	{#snippet caption()}
		Adding over \(\Z/2\). A switch is on in \(\mathbf u + \mathbf v\) when it is on in exactly one of the two; where both are on they
		cancel, since \(1 + 1 = 0\). Press <em>Make v equal to u</em>: every vector is its own negative, \(\mathbf v + \mathbf v =
		\mathbf 0\).
	{/snippet}
</Figure>

<p>
	Two features of \(\Z/2\) are worth savouring. First, \(\mathbf v + \mathbf v = \mathbf 0\) for every vector, so
	\(-\mathbf v = \mathbf v\): there are no minus signs, ever. Second, there are only finitely many vectors. Each of the \(n\) entries
	is 0 or 1, so the space \((\Z/2)^n\) of lists of \(n\) bits has exactly \(2^n\) elements.
</p>

<p>
	Both features are visible in Lights Out. A board is a list of 25 bits (on or off), so the boards form the vector space
	\((\Z/2)^{25}\). A <em>plan of presses</em>, saying which buttons to press, is also a list of 25 bits, because the order of presses
	does not matter and pressing a button twice is the same as not pressing it, exactly as \(1 + 1 = 0\). Lights Out lives entirely in
	\(\Z/2\).
</p>

<Intuition title="Why homology cares about switches">
	<p>
		In <Ref to="homology/chains" /> a <em>chain</em> on a shape will be a set of its edges, or of its triangles, added exactly like the
		switches above: two copies of the same edge cancel. Working over \(\Z/2\) lets us ignore which way the edges point, and it is how
		homology is first computed in this book.
	</p>
</Intuition>

<Warning>
	<p>
		Over \(\Z/2\) you cannot draw vectors as arrows, and words like “positive”, “length” or “angle” mean nothing. That is fine: the
		definition of a vector space never mentions arrows. Pictures are servants, not masters. We will use arrows in the plane to build
		intuition, and then check that the reasoning used nothing but the rules.
	</p>
</Warning>

<!-- ───────────────────────────────────────────────────────────────────── -->

<h2 id="span-and-basis">Span, independence, basis, dimension</h2>

<p>Given a few vectors, what can you build from them? That question organizes the next four definitions.</p>

<Definition id="def-span" title="Span">
	<p>
		The <dfn>span</dfn> of vectors \(\mathbf v_1, \dots, \mathbf v_k\) is the set of all their linear combinations
		\(a_1\mathbf v_1 + \dots + a_k\mathbf v_k\), where the scalars \(a_1, \dots, a_k\) may be anything:
		\[ \begin{aligned} \operatorname{span}&\set{\mathbf v_1,\dots,\mathbf v_k} \\ &= \setb{\textstyle\sum_i a_i\mathbf v_i}{a_i \text{ scalars}}. \end{aligned} \]
	</p>
</Definition>

<p>
	Two pieces of notation appear here. In this <Term t="set-builder-notation">set-builder notation</Term> the vertical bar is read
	“such that”: the span is the set of all sums such that the \(a_i\) are scalars. And \(\sum_i a_i\mathbf v_i\), with a capital
	sigma, is shorthand for the sum \(a_1\mathbf v_1 + \dots + a_k\mathbf v_k\): “add up \(a_i\mathbf v_i\) over all values of \(i\)”.
	The span of a single nonzero vector \(\mathbf v\) consists of its multiples \(c\,\mathbf v\): a line through the origin. The span of
	two vectors pointing in different directions is the whole plane, because any point can be reached by going some distance along one
	and then some distance along the other. But if the second vector lies on the line of the first, it adds nothing new, and the span
	is still only a line.
</p>

<Figure num="1.5.4" title="Three spans">
	<SpanTriptych />
	{#snippet caption()}
		The span is everything you can reach with linear combinations. Left: the multiples of one vector fill a line. Middle: two vectors
		pointing in different directions reach every point of the plane. The gold point is \(1.5\,\mathbf v + \mathbf w\): go one and a
		half steps along \(\mathbf v\), then one step along \(\mathbf w\). The grey dots are the combinations \(a\mathbf v + b\mathbf w\)
		with whole numbers \(a, b\), and fractions fill in everything between them. Right: \(\mathbf w\) is a multiple of \(\mathbf v\),
		so it brings nothing new.
	{/snippet}
</Figure>

<p>
	A span is always a <dfn>subspace</dfn>: a subset of a vector space that contains \(\mathbf 0\) and is closed under addition and
	scaling, meaning that adding or scaling its vectors never leads out of it. In the plane the subspaces are the origin on its own, the
	lines through the origin, and the whole plane. A line that misses the origin is not a subspace, since it does not contain
	\(\mathbf 0\). Neither is the union of two different lines through the origin: add a vector from each line and you land on neither.
</p>

<p>
	The right-hand panel shows waste: \(\mathbf w\) is redundant. Redundancy has a precise form. There, \(\mathbf w = -\tfrac34\mathbf
	v\), so \(\tfrac34\mathbf v + \mathbf w = \mathbf 0\): a combination of the vectors whose coefficients are <em>not all zero</em>
	produces the zero vector.
</p>

<Definition id="def-independence" title="Linear independence">
	<p>
		Vectors \(\mathbf v_1, \dots, \mathbf v_k\) are <dfn>linearly independent</dfn> if the only way to make the zero vector,
		\[ a_1 \mathbf v_1 + \dots + a_k \mathbf v_k = \mathbf 0, \]
		is the boring way, \(a_1 = \dots = a_k = 0\). Otherwise they are <dfn>linearly dependent</dfn>.
	</p>
</Definition>

<p>
	Dependent vectors always contain a redundant one. If \(a_1\mathbf v_1 + \dots + a_k\mathbf v_k = \mathbf 0\) with, say,
	\(a_j \neq 0\), move \(a_j\mathbf v_j\) to the other side and divide by \(a_j\) (division, the field property, at work): this writes
	\(\mathbf v_j\) as a combination of the others. For example, \((1,0)\) and \((0,1)\) are independent, while \((1,2)\) and \((2,4)\)
	are dependent, because \(2\,(1,2) - (2,4) = (0,0)\).
</p>

<p>
	Over \(\Z/2\), the three vectors \((1,1,0)\), \((0,1,1)\) and \((1,0,1)\) are dependent: their sum is \((0,0,0)\), because each
	position is switched on exactly twice. Remember this little dependency. If the three positions are the corners of a triangle, and
	each vector is an edge (recorded as the set of its two endpoints), the dependency says that the three edges together close up into a
	loop: every corner is touched twice. Loops in this sense are what homology counts.
</p>

<Definition id="def-basis" title="Basis and dimension">
	<p>
		A <dfn>basis</dfn> of a vector space \(V\) is a list of vectors that is linearly independent and spans \(V\). The number of vectors
		in a basis is the <dfn>dimension</dfn> of \(V\), written \(\dim V\).
	</p>
</Definition>

<p>
	Two facts make this definition work. First, given a basis \(\mathbf v_1, \dots, \mathbf v_n\), every vector can be written as
	\(a_1\mathbf v_1 + \dots + a_n\mathbf v_n\) in exactly <em>one</em> way. There is at least one way, because a basis spans; and if
	there were two different ways, subtracting one from the other would give a combination equal to \(\mathbf 0\) with coefficients not
	all zero, which independence forbids. The numbers \(a_1, \dots, a_n\) are the <dfn>coordinates</dfn> of the vector in that basis.
	Second, every basis of a given space has the same number of vectors. This is a genuine theorem (it is often called the
	<em>exchange lemma</em>), which we shall use without proof. It also shows that in a space of dimension \(n\), any \(n + 1\) vectors
	are dependent. So “the dimension” is well defined: it counts the <em>degrees of freedom</em>, the number of independent numbers you
	need to pin down a vector.
</p>

<p>
	The <dfn>standard basis</dfn> of \(\R^2\) is \(\mathbf e_1 = (1,0)\), \(\mathbf e_2 = (0,1)\), and in general \(\dim \R^n = n\). A
	line through the origin has dimension 1, a plane through the origin dimension 2, and the space \(\set{\mathbf 0}\) dimension 0 (its
	basis is the empty list). Over \(\Z/2\), \(\dim (\Z/2)^n = n\), with a basis made of the lists that contain a single 1. A subspace
	of dimension \(d\) over \(\Z/2\) contains exactly \(2^d\) vectors, one for each choice of its \(d\) coordinates.
</p>

<Question>
	<p>
		Can three vectors in the plane be linearly independent? Think before reading on. They cannot: the plane has dimension 2, and in
		a space of dimension 2 any three vectors are dependent. One of them is always a combination of the other two.
	</p>
</Question>

<Remark title="Bases over ℤ">
	<p>
		In <Ref to="foundations/abelian-groups" /> you met bases and rank for free abelian groups such as \(\Z^n\). Vector spaces are the
		friendly version of that story: over a field, every independent list can be extended to a basis. Over \(\Z\) this fails. The
		subgroup \(2\Z\) of even numbers has the basis \(\set{2}\), yet \(\set{2}\) cannot be extended to a basis of \(\Z\), whose only
		bases are \(\set{1}\) and \(\set{-1}\). The last section of this chapter measures exactly this gap.
	</p>
</Remark>

<!-- ───────────────────────────────────────────────────────────────────── -->

<h2 id="linear-maps">Linear maps: transformations that keep the grid</h2>

<p>
	Now that we have vector spaces, we want the functions between them that respect their structure. Picture the plane covered by a
	square grid, and imagine moving every point of the plane somewhere else. Most ways of doing this crumple the grid. The
	<em>linear</em> ones keep it a grid: lines stay straight, parallel lines stay parallel, evenly spaced lines stay evenly spaced, and
	the origin stays where it is. Such a map may rotate, stretch, shear, reflect or even flatten the plane, but it never bends anything.
</p>

<Definition id="def-linear-map" title="Linear map">
	<p>
		A function \(T\colon V \to W\) between vector spaces over the same field is <dfn>linear</dfn> if
		\[ \begin{gathered} T(\mathbf u + \mathbf v) = T(\mathbf u) + T(\mathbf v), \\ T(c\,\mathbf v) = c\,T(\mathbf v) \end{gathered} \]
		for all vectors \(\mathbf u, \mathbf v\) and all scalars \(c\). In words: adding and then transforming gives the same result as
		transforming and then adding, and the same goes for scaling.
	</p>
</Definition>

<p>
	Here \(T\colon V \to W\) is read “T, from V to W”: \(V\) is the <em>domain</em>, where the inputs live, and \(W\) is the
	<em>codomain</em>, where the outputs live, as in <Ref to="foundations/sets-and-functions" />. Taking \(c = 0\) shows that
	\(T(\mathbf 0) = \mathbf 0\): a linear map always fixes the origin. Combining the two rules gives
	\(T(a\mathbf u + b\mathbf v) = a\,T(\mathbf u) + b\,T(\mathbf v)\): linear maps turn linear combinations into linear combinations.
	In particular a linear map is a <Term t="homomorphism">homomorphism</Term> of the underlying abelian groups, as in
	<Ref to="foundations/groups" />, which in addition respects scaling.
</p>

<p>
	Here is the fact that makes linear maps easy to handle: <strong>a linear map is completely determined by what it does to a
	basis.</strong> In the plane every vector is \(x\,\mathbf e_1 + y\,\mathbf e_2\), so
	\[ T(x\,\mathbf e_1 + y\,\mathbf e_2) = x\,T(\mathbf e_1) + y\,T(\mathbf e_2). \]
	Know where the two basis vectors land and you know where everything lands. So we record the two landing spots side by side, as the
	columns of a table of numbers. That table is the <dfn>matrix</dfn> of \(T\).
</p>

<Figure num="1.5.5" title="A linear map is a grid that stays a grid" hint="Drag the arrow tips · try a preset · play the map">
	<LinearMapPlayground />
	{#snippet caption()}
		Drag where \(\mathbf e_1\) and \(\mathbf e_2\) land: the whole grid follows, and the matrix \(A\) records the two landing spots as
		its columns. Try <em>Flatten</em>, or drag one arrow onto the line of the other. The plane collapses onto the
		<span class="tx-gold">gold line</span> (the image), while the <span class="tx-teal">teal line</span> (the kernel) is crushed to the
		origin. The determinant is the area of the violet parallelogram, the image of the unit square, counted negative when the map flips
		the plane over (the parallelogram then turns rose); it is \(0\) exactly when the plane is flattened.
	{/snippet}
</Figure>

<h3>Multiplying a matrix by a vector</h3>

<p>
	A matrix with \(m\) rows and \(n\) columns, an “\(m \times n\) matrix” (read “m by n”), describes a linear map \(\R^n \to \R^m\),
	with \(n\) inputs and \(m\) outputs. Its columns are the images of \(\mathbf e_1, \dots, \mathbf e_n\), so they live in the codomain
	\(\R^m\). The entry in row \(i\) and column \(j\) is written \(a_{ij}\). To apply the map to a vector \(\mathbf x\), take that
	combination of the columns: if \(\mathbf a_1, \dots, \mathbf a_n\) are the columns, then
	\[ A\mathbf x = x_1\,\mathbf a_1 + x_2\,\mathbf a_2 + \dots + x_n\,\mathbf a_n. \]
	For example,
	\[ \begin{aligned} \begin{pmatrix} 1 & 2 \\ 2 & 4 \end{pmatrix}\begin{pmatrix} 3 \\ -1 \end{pmatrix} &= 3\begin{pmatrix} 1 \\ 2 \end{pmatrix} - 1\begin{pmatrix} 2 \\ 4 \end{pmatrix} \\ &= \begin{pmatrix} 1 \\ 2 \end{pmatrix}. \end{aligned} \]
	The same answer comes out row by row: entry \(i\) of \(A\mathbf x\) is \(a_{i1}x_1 + \dots + a_{in}x_n\), the
	<em>dot product</em> of row \(i\) with \(\mathbf x\). Here \(1\cdot 3 + 2\cdot(-1) = 1\) and \(2 \cdot 3 + 4\cdot(-1) = 2\). Both
	ways of computing are worth knowing, but the column way is the one that explains things.
</p>

<Example title="A small zoo of maps of the plane">
	<div class="zoo">
		<div>\[ \underbrace{\begin{pmatrix} 0 & -1 \\ 1 & 0 \end{pmatrix}}_{\text{rotate by }90^\circ} \]</div>
		<div>\[ \underbrace{\begin{pmatrix} 1 & 1 \\ 0 & 1 \end{pmatrix}}_{\text{shear}} \]</div>
		<div>\[ \underbrace{\begin{pmatrix} 1 & 0 \\ 0 & 0 \end{pmatrix}}_{\text{project onto the }x\text{-axis}} \]</div>
		<div>\[ \underbrace{\begin{pmatrix} 1 & 2 \\ 2 & 4 \end{pmatrix}}_{\text{flatten onto a line}} \]</div>
	</div>
	<p>
		Check the first: the rotation sends \(\mathbf e_1 = (1,0)\) to its first column \((0,1)\), a quarter turn anticlockwise, and
		\(\mathbf e_2 = (0,1)\) to its second column \((-1,0)\). Three of the four are presets in the figure above; to make the projection,
		press <em>Identity</em> and then drag the tip of the blue arrow to the origin.
	</p>
</Example>

<p>
	One number summarizes how a map of the plane changes areas. The unit square, spanned by \(\mathbf e_1\) and \(\mathbf e_2\), goes to
	the parallelogram spanned by the two columns. Its area, with a sign attached, is the <dfn>determinant</dfn>
	\[ \det\begin{pmatrix} a & b \\ c & d \end{pmatrix} = ad - bc. \]
	Every region’s area is multiplied by \(\abs{\det A}\). The sign is negative when the map flips the plane over, like a mirror. And
	\(\det A = 0\) exactly when the parallelogram is squashed flat, which happens exactly when the two columns lie on one line, that is,
	when they are linearly dependent. (Determinants exist for square matrices of every size, where they measure volumes, but we will
	need only the \(2 \times 2\) case.)
</p>

<p>
	Everything works the same way over \(\Z/2\): a matrix is a table of 0s and 1s, and the arithmetic uses \(1 + 1 = 0\). Lights Out is
	our example. Pressing the buttons of a plan \(\mathbf x\) changes the board by the sum of the effects of the individual buttons,
	because each light ends up switched once for each pressed button that touches it, and only the parity of that count matters. So
	“plan of presses \(\mapsto\) change of lights” (the arrow \(\mapsto\) is read “goes to”) is a linear map
	\((\Z/2)^{25} \to (\Z/2)^{25}\). Its matrix \(A\) is
	\(25 \times 25\), and column \(j\) is the plus-shaped pattern of lights switched by button \(j\). The figure in the Lights Out section
	below can show you this matrix.
</p>

<h3>Matrix multiplication is composition</h3>

<p>
	Apply one linear map and then another: \(\mathbf x \mapsto B\mathbf x \mapsto A(B\mathbf x)\). The result is again linear, so it has
	a matrix, which we call the <dfn>product</dfn> \(AB\). Since the columns of a matrix are the images of the basis vectors, column \(j\)
	of \(AB\) is \(A\) applied to column \(j\) of \(B\). Working this out entry by entry gives the familiar rule
	\[ (AB)_{ij} = a_{i1}b_{1j} + a_{i2}b_{2j} + \dots + a_{ik}b_{kj}, \]
	row \(i\) of \(A\) times column \(j\) of \(B\). The sizes must fit: an \(m \times k\) matrix times a \(k \times n\) matrix is an
	\(m \times n\) matrix, because the \(k\) outputs of \(B\) must be the \(k\) inputs of \(A\).
</p>

<p>
	Notice the order. \(AB\) means “first \(B\), then \(A\)”, just like the <Term t="composition">composition</Term> \(g \circ f\) of
	<Ref to="foundations/sets-and-functions" />, read “g after f”. And order matters. With the rotation \(R\) and the shear \(S\) from the
	zoo,
	\[ RS = \begin{pmatrix} 0 & -1 \\ 1 & 1 \end{pmatrix} \neq \begin{pmatrix} 1 & -1 \\ 1 & 0 \end{pmatrix} = SR: \]
	shearing and then rotating is not the same as rotating and then shearing. The matrix that does nothing, with 1s down the diagonal and
	0s elsewhere, is the <dfn>identity matrix</dfn> \(I\).
</p>

<Remark title="Looking ahead">
	<p>
		In <Ref to="homology/chains" /> the slogan “the boundary of a boundary is zero” becomes a statement about multiplying matrices:
		\(\partial_{k-1}\,\partial_k = 0\), the zero matrix.
	</p>
</Remark>

<!-- ───────────────────────────────────────────────────────────────────── -->

<h2 id="kernel-and-image">Kernel and image: what is crushed, what is reached</h2>

<p>
	Every question about Lights Out is a question about two subspaces that come with any linear map. One lives in the domain and records
	what the map <em>loses</em>. The other lives in the codomain and records what the map <em>can do</em>.
</p>

<Definition id="def-kernel-image" title="Kernel, image, rank, nullity">
	<p>Let \(A\) be a linear map (or a matrix) from \(V\) to \(W\).</p>
	<ul>
		<li>
			The <dfn>kernel</dfn> \(\ker A = \setb{\mathbf x \in V}{A\mathbf x = \mathbf 0}\) is the set of inputs sent to zero. Its
			dimension is the <dfn>nullity</dfn> of \(A\).
		</li>
		<li>
			The <dfn>image</dfn> \(\im A = \setb{A\mathbf x}{\mathbf x \in V}\) is the set of outputs that can be reached. Its dimension is
			the <dfn>rank</dfn> of \(A\).
		</li>
	</ul>
</Definition>

<p>
	Both are subspaces. If \(A\mathbf x = \mathbf 0\) and \(A\mathbf y = \mathbf 0\), then \(A(\mathbf x + \mathbf y) = \mathbf 0 +
	\mathbf 0 = \mathbf 0\) and \(A(c\,\mathbf x) = c\,\mathbf 0 = \mathbf 0\), so the kernel is closed under adding and scaling; the
	image is similar. You met kernels and images of homomorphisms in <Ref to="foundations/groups" />. A linear map is a homomorphism, and
	these are the same <Term t="kernel">kernel</Term> and image, now with dimensions attached.
</p>

<p>The kernel deserves several pictures, because homology will lean on all of them.</p>
<ul>
	<li>
		<strong>What gets crushed.</strong> The kernel is everything the map squashes onto the origin: the teal line in the playground
		above.
	</li>
	<li>
		<strong>Solutions of the homogeneous equation.</strong> The kernel is the set of solutions of \(A\mathbf x = \mathbf 0\), the
		equation with nothing on the right-hand side; “homogeneous” means exactly that.
	</li>
	<li>
		<strong>Quiet patterns.</strong> In Lights Out, the kernel is the set of plans of presses that change nothing at all. The
		\(5 \times 5\) board has a few of these, and they are the reason that not every board is solvable.
	</li>
</ul>

<p>
	The image also has a concrete description. Since \(A\mathbf x\) is a combination of the columns of \(A\), the image is the span of
	the columns, which is why it is also called the <dfn>column space</dfn>; the rank is the number of independent columns. In Lights
	Out, the image is the set of boards you can produce from the dark board by pressing buttons. Since pressing the same buttons again
	undoes them, it is exactly the set of boards that can be switched off: the solvable boards.
</p>

<Example title="Kernel and image of a flattening map">
	<p>
		Take \(A = \begin{pmatrix} 1 & 2 \\ 2 & 4\end{pmatrix}\). Its second column is twice the first, so the image is the line spanned
		by \((1, 2)\), and the rank is 1. The relation \(2\,(\text{column 1}) - (\text{column 2}) = \mathbf 0\) says \(A(2, -1) =
		\mathbf 0\), so the kernel is the line spanned by \((2, -1)\), and the nullity is 1. For the rotation by \(90^\circ\), by contrast,
		the kernel is \(\set{\mathbf 0}\) and the image is the whole plane (rank 2, nullity 0); for the zero matrix it is the other way
		round.
	</p>
</Example>

<p>
	The kernel tells you exactly how much information a map destroys. If \(A\mathbf x = A\mathbf y\), then \(A(\mathbf x - \mathbf y) =
	\mathbf 0\), so \(\mathbf x - \mathbf y\) lies in the kernel. Conversely, adding a kernel vector to an input never changes the
	output. So \(A\) is <Term t="injective">injective</Term> (different inputs give different outputs) exactly when
	\(\ker A = \set{\mathbf 0}\), and \(A\) is <Term t="surjective">surjective</Term> (every output is reached) exactly when \(\im A\) is
	all of \(W\).
</p>

<p>
	Here is a picture that ties kernel and image together: a linear map from space to itself, of rank 2. It works like a shadow cast by
	slanted sunlight. Every point slides along one fixed direction until it reaches the floor.
</p>

<Figure num="1.5.6" title="Crushing one dimension" hint="Play or scrub the map · drag to rotate">
	<ShadowProjection />
	{#snippet caption()}
		A rank-2 map of three-dimensional space. Apply it, and every point slides along the slanted direction until it reaches the floor.
		The <span class="tx-gold">golden floor</span> is the image: 2 dimensions survive. The <span class="tx-teal">teal line</span>
		through the origin is the kernel, crushed to a single point: 1 dimension is lost. And \(3 = 2 + 1\). The thin teal lines parallel
		to the kernel collapse to single gold points as well; remember them when we reach quotient spaces.
	{/snippet}
</Figure>

<p>
	Count dimensions in the picture. Space has 3. The floor, which is the image, has 2. The line that collapses, the kernel, has 1. And
	\(3 = 2 + 1\). That is no coincidence.
</p>

<Theorem id="thm-rank-nullity" title="Rank–nullity">
	<p>
		For a linear map \(A\colon V \to W\) with \(V\) finite-dimensional,
		\[ \dim V \;=\; \rank A \;+\; \operatorname{nullity} A. \]
	</p>
</Theorem>

<KeyIdea>
	<p>
		<strong>Conservation of dimension.</strong> Every input dimension is either crushed into the kernel or survives into the image.
		None is created, and none disappears without trace.
	</p>
</KeyIdea>

<Proof>
	<p>
		Choose a basis \(\mathbf k_1, \dots, \mathbf k_p\) of the kernel, and keep adding vectors \(\mathbf v_1, \dots, \mathbf v_r\), each
		outside the span of those already chosen, until the list is a basis of all of \(V\). Then \(\dim V = p + r\), and it remains to
		show that \(A\mathbf v_1, \dots, A\mathbf v_r\) is a basis of the image, so that \(\rank A = r\).
	</p>
	<p>
		<em>They span the image.</em> Any input can be written \(\mathbf x = \sum_i a_i \mathbf k_i + \sum_j b_j \mathbf v_j\), and \(A\)
		kills every \(\mathbf k_i\), so \(A\mathbf x = \sum_j b_j\, A\mathbf v_j\). <em>They are independent.</em> If
		\(\sum_j b_j\, A\mathbf v_j = \mathbf 0\), then \(A\big(\sum_j b_j \mathbf v_j\big) = \mathbf 0\), so \(\sum_j b_j\mathbf v_j\) lies
		in the kernel and is a combination of the \(\mathbf k_i\). Because the whole list is a basis, that is possible only if every
		\(b_j = 0\).
	</p>
</Proof>

<Warning>
	<p>
		Three classic slips. (1) Rank and nullity add up to the dimension of the <em>domain</em>, not of the codomain: for a \(3 \times
		5\) matrix, \(5 = \rank + \operatorname{nullity}\). (2) The kernel is never empty; it always contains \(\mathbf 0\). A “trivial
		kernel” means \(\ker A = \set{\mathbf 0}\). (3) The kernel lives in the domain and the image in the codomain, so in general the two
		cannot even be compared.
	</p>
</Warning>

<p>
	Rank–nullity already answers questions without any computation. A linear map \(\R^5 \to \R^3\) can never be injective: its rank is
	at most 3, so its nullity is at least \(5 - 3 = 2\). A linear map \(\R^3 \to \R^5\) can never be surjective: its rank is at most 3,
	short of 5. And a map from a finite-dimensional space to itself is injective exactly when it is surjective, since nullity 0 means
	rank equal to the full dimension.
</p>

<!-- ───────────────────────────────────────────────────────────────────── -->

<h2 id="row-reduction">Row reduction: the universal tool</h2>

<p>
	So far we have found kernels by staring. That works for \(2 \times 2\) matrices and fails long before \(25 \times 25\). We need a
	mechanical procedure that computes ranks, kernels and images of any matrix, over any field. It is called <dfn>row reduction</dfn>, or
	Gaussian elimination, and it is the same elimination you may have used at school to solve two equations in two unknowns.
</p>

<History>
	<p>
		The method is about two thousand years old. It appears in Chapter Eight, “Rectangular Arrays”, of the Chinese classic <em>The Nine
		Chapters on the Mathematical Art</em>, parts of which go back to around 150 BCE, and it was commented on by Liu Hui in the third
		century. Gauss devised a notation for systematic elimination in 1810, for least-squares problems, but the school method was named
		after him only in the 1950s, through a confusion about its history.
	</p>
</History>

<p>
	A matrix stands for a system of equations. The matrix with rows \((1, 2, 1, 3)\), \((2, 4, 0, 2)\) and \((3, 6, 1, 5)\) stands for the
	homogeneous system
	\[ \begin{aligned} x_1 + 2x_2 + x_3 + 3x_4 &= 0,\\ 2x_1 + 4x_2 \phantom{{}+x_3} + 2x_4 &= 0,\\ 3x_1 + 6x_2 + x_3 + 5x_4 &= 0, \end{aligned} \]
	whose solutions form the kernel. We may change the system in three ways without changing its solutions:
</p>
<ol>
	<li><strong>swap</strong> two rows (list the equations in a different order);</li>
	<li><strong>scale</strong> a row by a nonzero number (multiply an equation through);</li>
	<li><strong>add</strong> a multiple of one row to another (add a multiple of one equation to another).</li>
</ol>
<p>
	Each operation can be undone by another of the same kind: swap back, scale by the reciprocal, subtract what you added. So no
	solution is ever created or lost, and <strong>the kernel does not change</strong>. Then, by rank–nullity, the rank (the number of
	columns minus the nullity) does not change either.
</p>

<p>
	The goal is a staircase called the <dfn>reduced row echelon form</dfn>. Each nonzero row begins with a 1, called a
	<dfn>pivot</dfn>; each pivot sits to the right of the pivot above it; and each pivot is the only nonzero entry in its column. The
	recipe:
</p>
<ol>
	<li>Go through the columns from left to right, keeping track of the first row that does not have a pivot yet.</li>
	<li>
		In the current column, look for a nonzero entry in that row or below it. If there is none, the column gets no pivot: move on to the
		next column.
	</li>
	<li>Otherwise, swap that entry’s row up into place and divide the row by the entry, so that the pivot is 1.</li>
	<li>
		Subtract multiples of the pivot row from every other row to make the rest of the column 0. Then move on to the next row and the
		next column.
	</li>
</ol>

<p>
	Let us run it on the system above. Column 1 already has a 1 in row 1, so we clear the rest of the column with
	\(R_2 \leftarrow R_2 - 2R_1\) and \(R_3 \leftarrow R_3 - 3R_1\) (read: “replace row 2 by row 2 minus twice row 1”, and so on):
	\[ \begin{pmatrix} 1 & 2 & 1 & 3 \\ 2 & 4 & 0 & 2 \\ 3 & 6 & 1 & 5 \end{pmatrix} \to \begin{pmatrix} 1 & 2 & 1 & 3 \\ 0 & 0 & -2 & -4 \\ 0 & 0 & -2 & -4 \end{pmatrix}. \]
	Column 2 has only zeros below row 1, so it gets no pivot. In column 3, the entry \(-2\) in row 2 becomes a pivot after
	\(R_2 \leftarrow -\tfrac12 R_2\), and then \(R_1 \leftarrow R_1 - R_2\) and \(R_3 \leftarrow R_3 + 2R_2\) clear its column:
	\[ \to \begin{pmatrix} 1 & 2 & 1 & 3 \\ 0 & 0 & 1 & 2 \\ 0 & 0 & -2 & -4 \end{pmatrix} \to \begin{pmatrix} \cyc{1} & 2 & 0 & 1 \\ 0 & 0 & \cyc{1} & 2 \\ 0 & 0 & 0 & 0 \end{pmatrix}. \]
	Column 4 has only a zero in the one remaining row, so it gets no pivot. Done: two pivots, in columns 1 and 3. You can replay every
	step in the figure.
</p>

<Figure num="1.5.7" title="Row reduction, one step at a time" hint="Step through">
	<RowReduction />
	{#snippet caption()}
		Each step performs the row operations shown above the matrix; changed rows are tinted, the current pivot glows gold. At the end,
		the pivots give the rank, the pivot columns <em>of the original matrix</em> give a basis of the image, and each free variable gives
		a vector of the kernel. Compare the two triangle matrices over \(\Q\) and over \(\Z/2\).
	{/snippet}
</Figure>

<p>Now read off the answers from the staircase.</p>
<ul>
	<li><strong>Rank</strong> = the number of pivots, here 2.</li>
	<li>
		<strong>Kernel.</strong> The columns without pivots belong to <dfn>free variables</dfn>, here \(x_2\) and \(x_4\), which may take
		any values. The pivot rows then determine the rest: \(x_1 = -2x_2 - x_4\) and \(x_3 = -2x_4\). Setting one free variable to 1 and
		the others to 0 gives one kernel vector for each free variable,
		\[ \begin{aligned} x_2 = 1,\ x_4 = 0 &:\quad (-2,\,1,\,0,\,0), \\ x_2 = 0,\ x_4 = 1 &:\quad (-1,\,0,\,-2,\,1), \end{aligned} \]
		and these form a basis of the kernel. The nullity is the number of free variables, 2.
	</li>
	<li>
		<strong>Image.</strong> The pivot columns of the <em>original</em> matrix, here \((1,2,3)\) and \((1,0,1)\), form a basis of the
		image.
	</li>
	<li>
		<strong>Check.</strong> 4 columns = 2 pivot columns + 2 free columns. Rank–nullity is visible in the staircase.
	</li>
</ul>

<Warning>
	<p>
		Row operations keep the kernel, but they change the column space: the reduced matrix above has a zero last row, while the original
		columns do not lie in the plane “third entry = 0”. What survives is the <em>relationships</em> among the columns, since a relation
		among the columns is exactly a kernel vector. That is why the pivot columns of the reduced matrix tell you <em>which</em> columns to
		take, but you must take them from the original matrix.
	</p>
</Warning>

<h3>Row reduction over \(\Z/2\)</h3>

<p>
	Over \(\Z/2\) the procedure is even simpler. The only nonzero number is 1, so there is never anything to divide by, and adding a row
	is the same as subtracting it. Row reduction becomes: find a 1, swap it into place, and add its row to every other row that has a 1
	in that column. Here is the “triangle matrix”, whose columns are the three edges of a triangle, each edge recorded by its two
	corners:
	\[ \begin{aligned} \begin{pmatrix} 1 & 1 & 0 \\ 1 & 0 & 1 \\ 0 & 1 & 1 \end{pmatrix} &\xrightarrow{R_2 \leftarrow R_2 + R_1} \begin{pmatrix} 1 & 1 & 0 \\ 0 & 1 & 1 \\ 0 & 1 & 1 \end{pmatrix} \\[4pt] &\xrightarrow{\substack{R_1 \leftarrow R_1 + R_2 \\ R_3 \leftarrow R_3 + R_2}} \begin{pmatrix} \cyc{1} & 0 & 1 \\ 0 & \cyc{1} & 1 \\ 0 & 0 & 0 \end{pmatrix}. \end{aligned} \]
	Rank 2. The free variable \(x_3\) gives the kernel vector \((1,1,1)\): all three edges together, the loop around the triangle. The
	kernel is \(\set{(0,0,0),\ (1,1,1)}\).
</p>

<p>
	Now switch the stepper to \(\Q\), keeping the same matrix: it has rank 3, and its kernel is only \(\mathbf 0\). <strong>The same
	table of numbers can have different ranks over different fields.</strong> Here the culprit is the determinant of this
	\(3 \times 3\) matrix, which is \(-2\): that is not zero in \(\Q\), but it is zero in \(\Z/2\). It is our first glimpse of something
	the last section explains: the number 2 behaves very differently in different number systems. (The <em>signed</em> version of the
	matrix, with \(-1\)s, which is the one homology will use, has rank 2 over both.)
</p>

<!-- ───────────────────────────────────────────────────────────────────── -->

<h2 id="solving">Solving \(A\mathbf x = \mathbf b\)</h2>

<p>
	Kernels answer the question “which inputs give zero?”. Most real questions ask instead: given a target \(\mathbf b\), which inputs
	give \(\mathbf b\)? In Lights Out, \(\mathbf b\) is the board in front of you, and you want a plan \(\mathbf x\) with
	\(A\mathbf x = \mathbf b\). Pressing \(\mathbf x\) adds \(A\mathbf x\) to the board, and \(\mathbf b + \mathbf b = \mathbf 0\) over
	\(\Z/2\), so the board goes dark exactly when \(A\mathbf x = \mathbf b\). Two questions: is there a solution, and if so, how many?
</p>

<p><strong>Existence</strong> is a matter of definitions: there is a solution exactly when \(\mathbf b\) lies in the image of \(A\).</p>

<p>
	<strong>How many</strong> is answered by the kernel. Suppose \(\mathbf x_p\) is one solution, a <dfn>particular solution</dfn>. If
	\(\mathbf k\) is in the kernel, then \(A(\mathbf x_p + \mathbf k) = \mathbf b + \mathbf 0 = \mathbf b\), so \(\mathbf x_p + \mathbf
	k\) is a solution too. Conversely, if \(A\mathbf x = \mathbf b\), then \(A(\mathbf x - \mathbf x_p) = \mathbf b - \mathbf b =
	\mathbf 0\), so \(\mathbf x\) is \(\mathbf x_p\) plus a vector of the kernel. Therefore
	\[ \setb{\mathbf x}{A\mathbf x = \mathbf b} \;=\; \mathbf x_p + \ker A, \]
	a copy of the kernel slid over to pass through \(\mathbf x_p\). In the language of <Ref to="foundations/abelian-groups" />, the
	solution set is a <Term t="coset">coset</Term> of the kernel. All solutions differ by something invisible to \(A\).
</p>

<Figure num="1.5.8" title="Solutions form a shifted copy of the kernel" hint="Drag b and x">
	<SolveByCoset />
	{#snippet caption()}
		This \(A\) flattens the plane onto its image, the <span class="tx-gold">gold line</span> on the right. Put \(\mathbf b\) on that
		line and the solutions appear on the left: a gold line parallel to the <span class="tx-teal">teal kernel</span>. Drag
		\(\mathbf x\) along it and \(A\mathbf x\) stays on \(\mathbf b\). Move \(\mathbf b\) off the line and there is no solution; a
		<span class="tx-rose">rose measurement</span> appears that proves it, a hint of the duality section to come.
	{/snippet}
</Figure>

<p>
	So over \(\R\) or \(\Q\) there are exactly three possibilities: no solution (\(\mathbf b\) is not in the image), exactly one (the
	kernel is \(\set{\mathbf 0}\)), or infinitely many (the kernel is a line or bigger). Over \(\Z/2\) the count is finite: a kernel of
	dimension \(d\) has \(2^d\) elements, so a solvable equation has exactly \(2^d\) solutions.
</p>

<p>
	In practice we find solutions by row reducing the <dfn>augmented matrix</dfn> \([\,A \mid \mathbf b\,]\): the matrix \(A\) with
	\(\mathbf b\) attached as an extra column, doing every operation to both. If a row of the form \([\,0\ \cdots\ 0 \mid 1\,]\) appears,
	it says “\(0 = 1\)”, and there is no solution. Otherwise, set the free variables to 0 and read off a particular solution.
</p>

<Example title="A small system over ℤ/2">
	<p>
		Solve \(x + y = 1\), \(y + z = 0\), \(x + z = 1\) over \(\Z/2\). Adding the first equation to the third gives \(y + z = 0\), the
		same as the second equation, so one equation is redundant and \(z\) is free. Taking \(z = 0\) gives \((x,y,z) = (1,0,0)\), and
		taking \(z = 1\) gives \((0,1,1)\). The solution set is \((1,0,0) + \set{(0,0,0),\ (1,1,1)}\), a coset of the triangle’s kernel,
		with \(2^1 = 2\) elements, as promised.
	</p>
</Example>

<!-- ───────────────────────────────────────────────────────────────────── -->

<h2 id="quotient-spaces">Quotient spaces: blurring out a subspace</h2>

<p>
	In the last figure, all the points of one gold line are “the same” as far as \(A\) is concerned, since \(A\) sends them all to the
	same \(\mathbf b\). It is natural to treat each such line as a single object. You have done this kind of thing twice already: in
	<Ref to="foundations/equivalence" /> you formed <Term t="quotient-set">quotient sets</Term> by declaring equivalent things equal, and in
	<Ref to="foundations/abelian-groups" /> you formed <Term t="quotient-group">quotient groups</Term> \(G/H\) by collapsing a subgroup.
	Vector spaces have quotients too, and they are where homology lives.
</p>

<Definition id="def-quotient-space" title="Quotient space">
	<p>
		Let \(W\) be a subspace of \(V\). Call two vectors equivalent, \(\mathbf v \sim \mathbf v'\), when their difference
		\(\mathbf v - \mathbf v'\) lies in \(W\). The <Term t="equivalence-class">equivalence class</Term> of \(\mathbf v\) is the coset
		\(\mathbf v + W = \setb{\mathbf v + \mathbf w}{\mathbf w \in W}\), a parallel copy of \(W\) passing through \(\mathbf v\). The
		<dfn>quotient space</dfn> \(V/W\), read “V mod W”, is the set of these cosets, with
		\[ \begin{gathered} (\mathbf u + W) + (\mathbf v + W) = (\mathbf u + \mathbf v) + W, \\ c\,(\mathbf v + W) = c\,\mathbf v + W. \end{gathered} \]
	</p>
</Definition>

<p>
	As with quotient groups, we must check that these operations are <em>well defined</em>: if we pick different representatives of the
	same cosets, the answer must not change. It does not, because \(W\) is closed under adding and scaling. Changing \(\mathbf u\) and
	\(\mathbf v\) by elements of \(W\) changes \(\mathbf u + \mathbf v\) and \(c\,\mathbf v\) by elements of \(W\) too. So \(V/W\) is
	again a vector space, and its zero is the coset \(\mathbf 0 + W\), which is \(W\) itself.
</p>

<Figure num="1.5.9" title="The plane modulo a line" hint="Drag p and q">
	<QuotientPlane />
	{#snippet caption()}
		Here \(W\) is the <span class="tx-teal">teal line</span>, and each element of \(\R^2/W\) is a whole line parallel to it. Sliding
		\(\mathbf p\) along its line does not change its coset. Every such line crosses the horizontal axis exactly once, and adding cosets
		adds the crossing points: \(\R^2/W\) is a copy of the number line, of dimension \(2 - 1 = 1\).
	{/snippet}
</Figure>

<p>
	The figure illustrates the general rule. A quotient forgets the directions inside \(W\) and remembers the rest, so dimensions
	subtract:
	\[ \dim V/W = \dim V - \dim W. \]
	To see it, extend a basis \(\mathbf w_1, \dots, \mathbf w_m\) of \(W\) to a basis of \(V\) by adding vectors
	\(\mathbf v_1, \dots, \mathbf v_r\); then the cosets \(\mathbf v_1 + W, \dots, \mathbf v_r + W\) form a basis of \(V/W\). Over
	\(\Z/2\) you can even count: the cosets split \(V\) into pieces of \(2^{\dim W}\) vectors each, so \(V/W\) has
	\(2^{\dim V}/2^{\dim W}\) elements. For instance, \((\Z/2)^3\) modulo \(\set{000, 111}\) has \(8/2 = 4\) elements.
</p>

<p>
	Look back at the shadow figure with this in mind. Each thin teal line, parallel to the kernel, is a coset of the kernel, and the map
	squashes each of them to a single point of the floor. Different lines land on different points, and every point of the floor is hit.
	So the cosets of the kernel correspond exactly to the points of the image:
	\[ V/\ker A \;\cong\; \im A, \]
	where \(\cong\) is read “is <Term t="isomorphism">isomorphic</Term> to”: the two are the same vector space in different clothes.
	This is the
	<Term t="first-isomorphism-theorem">first isomorphism theorem</Term> of <Ref to="foundations/abelian-groups" />, for vector spaces. Take the dimensions of both sides and you get \(\dim V - \operatorname{nullity} A = \rank A\): rank–nullity again,
	seen from a new angle.
</p>

<KeyIdea>
	<p>
		<strong>Homology is a quotient.</strong> In <Ref to="homology/homology-groups" />, the \(k\)-th homology of a shape is
		\(H_k = Z_k/B_k\): the <span class="tx-gold">cycles</span> \(Z_k = \ker \partial_k\) modulo the
		<span class="tx-teal">boundaries</span> \(B_k = \im \partial_{k+1}\). Over a field, this chapter has already computed its
		dimension:
		\[ \begin{aligned} \dim H_k &= \dim \ker\partial_k - \dim \im \partial_{k+1} \\ &= n_k - \rank \partial_k - \rank \partial_{k+1}. \end{aligned} \]
		The first line is the dimension of a quotient. In the second, \(n_k\), the number of \(k\)-dimensional pieces, is the dimension of
		the domain of \(\partial_k\), so rank–nullity turns \(\dim\ker\partial_k\) into \(n_k - \rank\partial_k\); and
		\(\dim\im\partial_{k+1}\) is \(\rank\partial_{k+1}\) by definition. That is the formula from the start of the chapter.
	</p>
</KeyIdea>

<Example title="A preview: one hole in a triangle">
	<p>
		Take a hollow triangle with corners \(a, b, c\) and edges \(ab, bc, ca\), and work over \(\Z/2\). Its “boundary map” sends each
		edge to its two corners; its matrix is the triangle matrix we row reduced, of rank 2. Its kernel, the cycles, is
		\(\set{0,\ ab + bc + ca}\): the loop around the triangle. There are no filled-in triangles, so there are no boundaries yet, and
		\(\dim H_1 = 3 - 2 - 0 = 1\): one hole. Now fill the triangle in. The new face has boundary \(ab + bc + ca\), so the loop becomes a
		boundary and \(\dim H_1 = 3 - 2 - 1 = 0\): the hole is gone. Part III of this book is built on exactly this computation.
	</p>
</Example>

<!-- ───────────────────────────────────────────────────────────────────── -->

<h2 id="lights-out">Lights Out, solved</h2>

<p>We now have every tool needed to settle the puzzle. Translate it into linear algebra over \(\Z/2\):</p>
<ul>
	<li>a board is a vector \(\mathbf b\) in \((\Z/2)^{25}\), with 1 for on;</li>
	<li>a plan of presses is a vector \(\mathbf x\) in \((\Z/2)^{25}\), with 1 for press;</li>
	<li>
		the effect of a plan is \(A\mathbf x\), where column \(j\) of the \(25 \times 25\) matrix \(A\) is the plus-shaped set of lights
		around button \(j\);
	</li>
	<li>the board can be switched off exactly when \(A\mathbf x = \mathbf b\) has a solution.</li>
</ul>

<p>
	Row reducing \(A\) over \(\Z/2\) takes a long afternoon by hand and a millisecond by machine. (This book’s code does it, and its tests
	check every number in this section.) The result is: <strong>rank 23, nullity 2.</strong> Everything else follows from the theorems
	we have proved.
</p>

<ol>
	<li>
		<strong>Quiet patterns.</strong> The kernel has dimension 2, so it has \(2^2 = 4\) elements: “press nothing” and three non-trivial
		<dfn>quiet patterns</dfn>, plans that leave every light exactly as it was. Show them in the figure below and press one: nothing
		changes, because every light is switched an even number of times.
	</li>
	<li>
		<strong>Solvable boards.</strong> The image has dimension 23, so exactly \(2^{23}\) of the \(2^{25}\) boards are solvable:
		<em>one board in four</em>.
	</li>
	<li>
		<strong>Number of solutions.</strong> The solutions of a solvable board form a coset of the kernel, so every solvable board has
		exactly 4 solutions. The figure’s solver uses the one with the fewest presses. The board with every light on, for instance, is
		solvable, and its shortest solution takes 15 presses.
	</li>
</ol>

<Figure num="1.5.10" title="Lights Out under the X-ray" hint="Click to press · tap a check">
	<LightsOut mode="full" />
	{#snippet caption()}
		The full machinery, starting from the board with every light on. <em>Solve it</em> presses the shortest solution; switch on
		<em>show the presses</em> to see it as violet rings. <em>Show a quiet pattern</em> marks a <span class="tx-teal">kernel</span>
		element with teal dots, and <em>Press it</em> shows that it changes nothing. The two <span class="tx-rose">parity checks</span>
		decide solvability, as the next section explains. <em>X-ray</em> displays the matrix \(A\) itself. Switch to <em>paint lights</em>
		to set up any board you like, including unsolvable ones.
	{/snippet}
</Figure>

<p>
	Other sizes behave differently, and the figure lets you compare. On the \(3 \times 3\) board the matrix has rank 9 and nullity 0.
	There are no quiet patterns, so every board is solvable, in exactly one way. On the \(4 \times 4\) board the nullity is 4: sixteen
	quiet patterns, and only one board in sixteen is solvable. For \(n \times n\) boards with \(n = 1, 2, \dots, 9\) the nullities are
	\(0, 0, 0, 4, 2, 0, 0, 0, 8\), and the sequence continues irregularly.
</p>

<Remark title="An experiment">
	<p>
		Switch to <em>paint lights</em>, clear the \(5 \times 5\) board, and light a single lamp. Only five positions give a solvable
		board: the centre and the four cells diagonally next to it. Every other single light fails a parity check. By the end of the next
		section you will be able to see why at a glance.
	</p>
</Remark>

<History>
	<p>
		<em>Lights Out</em> was released as an electronic toy by Tiger Electronics in 1995. Three years later, Marlow Anderson and Todd
		Feil analysed it with linear algebra in <em>Mathematics Magazine</em>, in an article called “Turning Lights Out with Linear
		Algebra”. They proved that not every board is solvable and that every solvable \(5 \times 5\) board has exactly four solutions:
		the two facts we have just read off from rank 23 and nullity 2.
	</p>
</History>

<!-- ───────────────────────────────────────────────────────────────────── -->

<h2 id="duality">Duality: measurements and reversed arrows</h2>

<p>
	One question is still open. When a board is <em>not</em> solvable, how can we be sure? “A computer row reduced a big matrix” is
	convincing, but it does not explain anything. We would like a <em>certificate</em>: a short reason that anyone can check by hand.
</p>

<h3>Certificates of impossibility</h3>

<p>
	Here is one. Look at the twelve cells in columns 1, 3 and 5 of the board, leaving out the middle row: the cells of “check 1” in the
	Lights Out figure above. Every button’s plus shape covers an <em>even</em> number of these cells, either 0 or 2; check a few. So every press changes
	the number of lit lights among those twelve cells by an even amount, and the <em>parity</em> of that number, even or odd, never
	changes however you press. The dark board has 0 lights on there, an even number. So a board with an odd number of lit lights among
	those cells can never be switched off. Checking that takes ten seconds, however many plans of presses there are.
</p>

<p>
	The count we just used is a <em>linear measurement</em> of the board: add up the bits in those twelve positions, in \(\Z/2\).
	Measuring the sum of two boards gives the sum of the two measurements, so this is a linear map from \((\Z/2)^{25}\) to \(\Z/2\). The
	certificate worked because the measurement gives 0 on everything the buttons can make, but not on our board. Measurements like this
	deserve a name and a space of their own.
</p>

<h3>Covectors: the dual space</h3>

<Definition id="def-dual-space" title="Dual space">
	<p>
		A <dfn>covector</dfn> on a vector space \(V\) over a field \(F\), also called a <dfn>linear functional</dfn> or a dual vector, is a
		linear map \(\varphi\colon V \to F\): a linear measurement that turns each vector into a number. The covectors on \(V\) form a
		vector space, the <dfn>dual space</dfn> \(V^*\) (read “V star”), with \((\varphi + \psi)(\mathbf v) = \varphi(\mathbf v) +
		\psi(\mathbf v)\) and \((c\,\varphi)(\mathbf v) = c\,\varphi(\mathbf v)\).
	</p>
</Definition>

<p>
	(\(\varphi\) and \(\psi\) are the Greek letters phi and psi.) On \(\R^2\), every covector has the form \(\varphi(x, y) = ax + by\)
	for two numbers \(a\) and \(b\), because, like any linear map, it is determined by its values on \(\mathbf e_1\) and \(\mathbf e_2\).
	Its matrix is a single row, \(\begin{pmatrix} a & b \end{pmatrix}\), and measuring a vector means multiplying that row by the column
	\(\mathbf v\). So <strong>vectors are columns and covectors are rows</strong>. On \(\R^n\) a covector is a row of \(n\) numbers, so
	\(\dim V^* = \dim V\) for finite-dimensional spaces, which are the only ones we use.
</p>

<p>
	How should we picture a covector? Not as an arrow. Draw instead the places where it takes the values \(\dots, -1, 0, 1, 2, \dots\).
	For \(\varphi(x,y) = ax + by\) these are evenly spaced parallel lines: a <em>stack</em>. The value \(\varphi(\mathbf v)\) is the level
	that the tip of \(\mathbf v\) reaches, starting from line 0 at its tail: it counts the lines the arrow crosses (with a sign, negative
	if it goes down the numbering), plus a fraction for the last partial step. The covector is a ruler, and the lines are its marks.
</p>

<Figure num="1.5.11" title="A covector is a stack of lines" hint="Drag v and the blue handle">
	<CovectorStack mode="measure" />
	{#snippet caption()}
		The covector \(\varphi\) drawn as its level lines \(\varphi = 0, \pm1, \pm2, \dots\). Its value on \(\mathbf v\) is the level the
		tip of \(\mathbf v\) reaches: the gold dots mark the whole lines it crosses on the way. A <em>bigger</em> covector has
		<em>denser</em> lines: doubling \(\varphi\) doubles every measurement by packing the lines twice as tightly. Turn \(\mathbf v\) to
		run along the lines, and \(\varphi(\mathbf v) = 0\).
	{/snippet}
</Figure>

<Warning>
	<p>
		A covector is not a vector in disguise. Change units from metres to centimetres: the coordinates of every vector become 100 times
		bigger, but the coefficients of a covector must become 100 times <em>smaller</em>, so that the measured values stay the same.
		Vectors and covectors change in opposite ways. On \(\R^n\) you can turn a row into a column by tipping it over, but that trick
		depends on the coordinates you happen to use.
	</p>
</Warning>

<p>
	Given a basis \(\mathbf e_1, \dots, \mathbf e_n\) of \(V\), the most useful covectors are the coordinate readers: \(\mathbf e_i^*\)
	reads off the \(i\)-th coordinate. They satisfy \(\mathbf e_i^*(\mathbf e_j) = 1\) when \(i = j\) and \(0\) otherwise, and they form
	a basis of \(V^*\), called the <dfn>dual basis</dfn>. On \(\R^2\) with the standard basis, \(\mathbf e_1^*(x,y) = x\) and
	\(\mathbf e_2^*(x,y) = y\).
</p>

<Example title="The dual basis depends on the whole basis">
	<p>
		For the basis \(\mathbf b_1 = (1,0)\), \(\mathbf b_2 = (1,1)\) of \(\R^2\), the dual basis is \(\mathbf b_1^*(x,y) = x - y\) and
		\(\mathbf b_2^*(x,y) = y\). Check: \(\mathbf b_1^*(1,0) = 1\), \(\mathbf b_1^*(1,1) = 0\), \(\mathbf b_2^*(1,0) = 0\),
		\(\mathbf b_2^*(1,1) = 1\). Notice that \(\mathbf b_1 = \mathbf e_1\), and yet \(\mathbf b_1^* \neq \mathbf e_1^*\): a coordinate
		reader depends on all the basis vectors, not only on its own.
	</p>
</Example>

<h3>The transpose: pulling measurements back</h3>

<p>
	Linear maps act on measurements too, but backwards. Suppose \(A\colon V \to W\), and \(\varphi\) is a measurement on \(W\). Then
	“first apply \(A\), then measure with \(\varphi\)” is a measurement on \(V\): the composite \(\varphi \circ A\). So \(A\) gives a map
	going the other way,
	\[ A^{\mathsf T}\colon W^* \to V^*, \qquad \varphi \mapsto \varphi \circ A, \]
	called the <dfn>transpose</dfn>, or dual map, of \(A\). The arrow reverses: \(A\) carries vectors forward from \(V\) to \(W\), and
	\(A^{\mathsf T}\) carries measurements back from \(W\) to \(V\). We say that \(A^{\mathsf T}\) <dfn>pulls back</dfn> \(\varphi\).
</p>

<p>
	In matrices: if \(\varphi\) is the row \(\mathbf y\), then \(\varphi \circ A\) is the row \(\mathbf y A\). Written as a column, that is
	\(A^{\mathsf T}\mathbf y\), where \(A^{\mathsf T}\) is the matrix \(A\) flipped across its diagonal: the entry in row \(i\) and column
	\(j\) of \(A^{\mathsf T}\) is the entry in row \(j\) and column \(i\) of \(A\). So the transpose you may know as “swap rows and
	columns” is exactly the act of pulling measurements back.
</p>

<Figure num="1.5.12" title="Pulling a measurement back" hint="Drag v and φ · change A">
	<CovectorStack mode="pullback" />
	{#snippet caption()}
		\(A\) carries \(\mathbf v\) forward to \(A\mathbf v\); the transpose carries the measurement \(\varphi\) back to
		\(A^{\mathsf T}\varphi = \varphi\circ A\). Its lines, on the left, are exactly the points that \(A\) sends onto \(\varphi\)’s
		lines on the right, so both sides always count the same crossings: \((A^{\mathsf T}\varphi)(\mathbf v) = \varphi(A\mathbf v)\).
		With the rank-1 map, make \(\varphi\) vanish on the image, and the pulled-back measurement becomes zero.
	{/snippet}
</Figure>

<p>
	Because the arrows reverse, so does the order of composition. Applying \(B\) and then \(A\) to vectors means pulling measurements back
	along \(A\) first and then along \(B\):
	\[ (AB)^{\mathsf T} = B^{\mathsf T}A^{\mathsf T}. \]
	Think of socks and shoes: you put on your socks and then your shoes, but you take off your shoes and then your socks. One more fact,
	which row reduction makes visible: \(\rank A^{\mathsf T} = \rank A\). The rank of \(A^{\mathsf T}\) is the number of independent
	<em>rows</em> of \(A\). Row operations do not change the span of the rows, and in the reduced row echelon form the nonzero rows, one
	per pivot, are visibly independent. So the number of independent rows is the number of pivots, which is \(\rank A\).
</p>

<h3>Which targets can be reached?</h3>

<p>
	Now we can state the theorem the Lights Out certificate was hinting at. If \(\mathbf b = A\mathbf x\) can be reached, then any
	measurement \(\varphi\) that is blind to everything \(A\) produces, meaning \(\varphi \circ A = 0\), or \(A^{\mathsf T}\varphi =
	0\), is also blind to \(\mathbf b\). The remarkable part is the converse: if no such measurement sees \(\mathbf b\), then
	\(\mathbf b\) can be reached. Whenever something is impossible, a certificate of its impossibility exists.
</p>

<Theorem id="thm-duality" title="Solvability and duality">
	<p>
		Let \(A\colon V \to W\) be a linear map between finite-dimensional spaces. Then \(A\mathbf x = \mathbf b\) has a solution if and
		only if \(\varphi(\mathbf b) = 0\) for every measurement \(\varphi\) with \(A^{\mathsf T}\varphi = 0\). In symbols,
		\[ \im A = (\ker A^{\mathsf T})^{\perp}, \]
		where, for a set \(U\) of covectors, \(U^\perp\) (read “U perp”), the <dfn>annihilator</dfn> of \(U\), is the set of vectors that
		every covector in \(U\) sends to 0.
	</p>
</Theorem>

<Proof>
	<p>
		If \(\mathbf b = A\mathbf x\) and \(A^{\mathsf T}\varphi = 0\), then \(\varphi(\mathbf b) = \varphi(A\mathbf x) = (A^{\mathsf
		T}\varphi)(\mathbf x) = 0\). So \(\im A\) sits inside \((\ker A^{\mathsf T})^\perp\). To show that they are equal, we count
		dimensions. Let \(m = \dim W\) and \(r = \rank A\). By rank–nullity for \(A^{\mathsf T}\colon W^* \to V^*\), whose domain has
		dimension \(m\), the kernel of \(A^{\mathsf T}\) has dimension \(m - \rank A^{\mathsf T} = m - r\). Choose a basis
		\(\varphi_1, \dots, \varphi_{m-r}\) of it. Then \((\ker A^{\mathsf T})^\perp\) is the set of solutions of the \(m - r\) equations
		\(\varphi_1(\mathbf w) = 0, \dots, \varphi_{m-r}(\mathbf w) = 0\): the kernel of a matrix with \(m\) columns and \(m - r\)
		independent rows. That matrix has rank \(m - r\), so by rank–nullity its kernel has dimension \(m - (m - r) = r\). A subspace of
		dimension \(r\) inside another subspace of dimension \(r\) must be all of it.
	</p>
</Proof>

<p>
	In the figure on solving equations, the measurement \(y(u, v) = 2u - v\) gives 0 on both columns of
	\(A = \begin{pmatrix}1&2\\2&4\end{pmatrix}\), so \(A^{\mathsf T}y = 0\), and every \(\mathbf b\) with \(y(\mathbf b) \neq 0\) is out
	of reach. The theorem adds that when every such measurement gives 0, as it does on the gold line, a solution exists.
</p>

<p>
	For Lights Out the theorem becomes beautifully concrete, thanks to a symmetry: button \(i\) switches light \(j\) exactly when button
	\(j\) switches light \(i\), since both say that the two cells are equal or neighbours. So the matrix equals its own transpose,
	\(A^{\mathsf T} = A\), and the measurements that are blind to every button are exactly the measurements “add up the lights in a
	quiet pattern”. Two quiet patterns span the kernel, so:
</p>

<KeyIdea>
	<p>
		A \(5 \times 5\) Lights Out board is solvable if and only if it has an even number of lit lights among the cells of each of two
		quiet patterns: <span class="tx-rose">check 1</span>, columns 1, 3 and 5 without the middle row, and
		<span class="tx-rose">check 2</span>, rows 1, 3 and 5 without the middle column.
	</p>
</KeyIdea>

<p>
	The third non-trivial quiet pattern is the sum of these two, so its check is the sum of their checks and tells us nothing new. The
	cells that belong to neither pattern are the centre and its four diagonal neighbours, and that is why a single light can be switched
	off on its own exactly there. Notice also the double role of a quiet pattern. As a set of <em>presses</em>, it is an element of the
	kernel of \(A\): it changes nothing. As a set of <em>cells to count</em>, it is a measurement in the kernel of \(A^{\mathsf T}\): it
	detects unsolvable boards. Only the symmetry \(A = A^{\mathsf T}\) allows one pattern to play both parts.
</p>

<Warning>
	<p>
		The symbol \(\perp\) suggests “perpendicular”, but over \(\Z/2\) that picture misleads: a nonzero vector can measure itself as zero,
		for example \((1,1)\cdot(1,1) = 1 + 1 = 0\). That is why we stated the theorem in terms of measurements, which make sense over every
		field, rather than angles.
	</p>
</Warning>

<h3>The seed of cohomology</h3>

<p>
	Here, in plain words, is why this section matters for the rest of the book. Homology will ask: which cycles are boundaries? That is a
	question about the image of a boundary map \(\partial\), exactly like “which boards are solvable?”. Cohomology asks the dual question,
	with all the arrows reversed. Its objects, called <em>cochains</em>, are measurements on chains, and its basic map, the coboundary, is
	the transpose \(\delta = \partial^{\mathsf T}\). A measurement that gives 0 on every boundary but not on some cycle \(z\) is a
	certificate that \(z\) is not a boundary, that \(z\) goes around a hole, in exactly the way that a parity check certifies that a
	board can never be switched off.
</p>

<KeyIdea>
	<p>
		<strong>Duality is the seed of cohomology.</strong> Kernels and images of \(\partial\) give homology; kernels and images of its
		transpose \(\partial^{\mathsf T}\) give cohomology. The parity checks of Lights Out are prototypes of cohomology classes:
		measurements that see what no combination of boundaries can produce. <Ref to="cohomology/cochains" /> and
		<Ref to="cohomology/cohomology-groups" /> grow this seed.
	</p>
</KeyIdea>

<!-- ───────────────────────────────────────────────────────────────────── -->

<h2 id="smith-normal-form">Linear algebra over \(\Z\): the Smith normal form</h2>

<p>
	Everything so far relied on a field: we divided freely, for instance to turn pivots into 1s. But homology is most informative with
	integer coefficients. Chains will be <Term t="formal-sum">formal sums</Term> with whole-number coefficients, elements of the free
	abelian groups of
	<Ref to="foundations/abelian-groups" />, and boundary matrices will have integer entries. In \(\Z\) we may not divide, and that
	changes the story.
</p>

<p>The smallest example says it all: the \(1 \times 1\) matrix \((2)\), the map “multiply by 2”.</p>
<ul>
	<li>Over \(\Q\) it is invertible, since its inverse multiplies by \(\tfrac12\): kernel 0, image everything.</li>
	<li>Over \(\Z/2\) it is the zero map, because \(2 = 0\) there: kernel everything, image 0.</li>
	<li>
		Over \(\Z\) it is neither. The map \(x \mapsto 2x\) is injective, but its image is the even numbers \(2\Z\), and the leftover
		\(\Z/2\Z = \Z/2\) is not zero. That leftover is a <Term t="torsion-element">torsion</Term> group: it has a nonzero element, the class of
		1, which becomes zero when doubled.
	</li>
</ul>
<p>Torsion is information that division destroys. To keep it, we must work with integer operations only.</p>

<p>Which operations are allowed? The integer versions of the row operations, and now the same operations on columns as well:</p>
<ol>
	<li>swap two rows, or two columns;</li>
	<li>multiply a row, or a column, by \(-1\) (the only integers with integer reciprocals are \(\pm 1\));</li>
	<li>add an integer multiple of one row to another, or of one column to another.</li>
</ol>
<p>
	Each of these can be undone by an operation of the same kind. Row operations change the basis of the codomain \(\Z^m\), and column
	operations change the basis of the domain \(\Z^n\). Why allow columns now? Because we are no longer solving one particular equation.
	We want the <em>structure</em> of the map, its kernel and its cokernel, and we are free to choose convenient bases at both ends. The
	<dfn>cokernel</dfn> of \(A\colon \Z^n \to \Z^m\) is the quotient \(\Z^m/\im A\): the codomain with the image collapsed, “what is left
	over”.
</p>

<Theorem id="thm-smith" title="Smith normal form">
	<p>
		Every integer matrix \(A\) can be brought, by integer row and column operations, to a diagonal form
		\[ \begin{gathered} \begin{pmatrix} d_1 & & & \\ & \ddots & & \\ & & d_r & \\ & & & 0 \end{pmatrix}, \\[4pt] d_1 \mid d_2 \mid \cdots \mid d_r, \end{gathered} \]
		with positive integers \(d_i\), each dividing the next (\(d_1 \mid d_2\) is read “\(d_1\) divides \(d_2\)”), and zeros everywhere
		else. The numbers \(d_1, \dots, d_r\), called the <dfn>invariant factors</dfn>, depend only on \(A\), not on the operations chosen.
		Consequently, for \(A\colon \Z^n \to \Z^m\),
		\[ \begin{aligned} \Z^m/\im A &\cong \Z/d_1 \oplus \dots \oplus \Z/d_r \oplus \Z^{m-r}, \\ \ker A &\cong \Z^{n-r}. \end{aligned} \]
	</p>
</Theorem>

<p>
	This diagonal form is the <dfn>Smith normal form</dfn>, after Henry John Stephen Smith, who introduced it in 1861. We abbreviate a
	diagonal matrix by listing its diagonal, as in \(\operatorname{diag}(d_1, \dots, d_r)\); the symbol \(\oplus\) is the
	<Term t="direct-sum">direct sum</Term> of <Ref to="foundations/abelian-groups" />, and \(\Z/1\) is the group with one element.
	Reading off the answer is easy once the matrix is diagonal, because the map then does independent things to independent
	coordinates: it multiplies the \(i\)-th coordinate by \(d_i\). A factor \(d_i = 1\) leaves nothing behind, since \(\Z/1 = 0\). A factor \(d_i > 1\) leaves the
	torsion \(\Z/d_i\). And each of the \(m - r\) rows without a diagonal entry leaves a whole free copy of \(\Z\).
</p>

<p>
	The algorithm imitates row reduction, with division replaced by division <em>with remainder</em>. Move the smallest nonzero entry to
	the top-left corner. Subtract whole multiples of its row and column to shrink the other entries of that row and column to their
	remainders. If any remainder is nonzero, it is smaller than the pivot: make it the new pivot and repeat. Since the entries keep
	shrinking, this stops, leaving the pivot alone in its row and column. Then make sure that the pivot divides every remaining entry (if
	not, add a row to bring an offending entry into play and clear again), and move on to the rest of the matrix.
</p>

<Example title="A parity obstruction">
	<p>
		The map \((x, y) \mapsto (x + y,\ x - y)\) on \(\Z^2\) has the matrix \(\begin{pmatrix} 1 & 1 \\ 1 & -1\end{pmatrix}\). Three
		integer operations finish it:
		\[ \begin{aligned} \begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix} &\xrightarrow{R_2 \leftarrow R_2 - R_1} \begin{pmatrix} 1 & 1 \\ 0 & -2 \end{pmatrix} \\[4pt] &\xrightarrow{C_2 \leftarrow C_2 - C_1} \begin{pmatrix} 1 & 0 \\ 0 & -2 \end{pmatrix} \\[4pt] &\xrightarrow{R_2 \leftarrow -R_2} \begin{pmatrix} 1 & 0 \\ 0 & 2 \end{pmatrix}. \end{aligned} \]
		So \(\Z^2/\im A \cong \Z/1 \oplus \Z/2 \cong \Z/2\). Indeed, \(x + y\) and \(x - y\) always have the same parity, since their
		difference \(2y\) is even. The reachable pairs \((a, b)\) are exactly those with \(a + b\) even, and the leftover \(\Z/2\) is “the
		parity of \(a + b\)”. Over \(\Q\) the same matrix is invertible (its determinant is \(-2 \neq 0\)) and every pair is reachable:
		the obstruction is invisible to fractions.
	</p>
</Example>

<Figure num="1.5.13" title="The Smith normal form, step by step" hint="Step through">
	<SmithStepper />
	{#snippet caption()}
		Only integer operations: each step is shown above the matrix, remainders become new pivots, and finished diagonal entries turn
		gold. At the end the figure reads off the cokernel and its <span class="tx-rose">torsion</span>. Try the \(\Z/2 \oplus \Z/3\)
		example, where the divisibility rule turns \(\operatorname{diag}(2, 3)\) into \(\operatorname{diag}(1, 6)\), and the
		\(3 \times 3\) example, whose cokernel \(\Z/2 \oplus \Z/6 \oplus \Z/12\) has \(144 = \abs{\det A}\) elements.
	{/snippet}
</Figure>

<p>
	This is the algorithm behind the <Term t="classification-of-abelian-groups">classification theorem</Term> of
	<Ref to="foundations/abelian-groups" />: every finitely generated abelian group is
	\(\Z^r \oplus \Z/d_1 \oplus \dots \oplus \Z/d_k\) with \(d_1 \mid d_2 \mid \cdots\). Describe the group by generators and
	relations, write the relations as the columns of a matrix, and the Smith normal form reads off the decomposition. For instance, the
	group \(\Z^2/\langle (2,4), (6,8) \rangle\), integer pairs modulo the subgroup generated by \((2,4)\) and \((6,8)\), comes from the
	matrix with those two columns. Its Smith form is \(\operatorname{diag}(2, 4)\), so the group is \(\Z/2 \oplus \Z/4\), with
	\(8 = \abs{\det}\) elements.
</p>

<p>
	It is also how homology finds torsion. In <Ref to="homology/computing" /> you will meet the Klein bottle built from one vertex, two
	edges \(a, b\) and one face whose boundary is \(2a + 0b\). Its boundary matrix is the single column \((2, 0)\), already in Smith form
	with \(d_1 = 2\). With only one vertex, every combination of edges is a cycle, so the first homology, cycles modulo boundaries, is
	\(\Z^2/\im \partial_2 \cong \Z \oplus \Z/2\): one ordinary loop, and one loop that becomes a boundary when it is traversed twice. The real projective plane gives the \(1 \times 1\) matrix \((2)\) and the torsion
	\(\Z/2\).
</p>

<p>
	Finally, the Smith form explains the puzzle of the triangle matrix. Over \(\Q\), the rank of an integer matrix is the number of its
	invariant factors, since each \(d_i\) can be divided away. Over \(\Z/2\), the even factors become 0, so the rank is the number of
	<em>odd</em> invariant factors. The triangle matrix has invariant factors \(1, 1, 2\): rank 3 over \(\Q\), rank 2 over \(\Z/2\).
	Ranks over \(\Z/2\) and over \(\Q\) differ exactly when some \(d_i\) is even, that is, when there is 2-torsion around. That is why
	mod-2 homology and rational homology can disagree, and why integer homology, which sees the \(d_i\) themselves, knows more than
	either.
</p>

<Warning>
	<p>
		Row reduction over \(\Q\) computes ranks correctly, but it erases torsion. Never conclude “there is no torsion” from a computation
		with fractions.
	</p>
</Warning>

<Remark title="Torsion and duality">
	<p>
		Measurements with values in \(\Z\) cannot see torsion: a homomorphism \(\varphi\colon \Z/2 \to \Z\) must send the class of 1 to an
		integer \(g\) with \(2g = \varphi(1 + 1) = \varphi(0) = 0\), so \(g = 0\). Yet torsion is not lost under duality; it moves. Take
		the map “multiply by 2” from the 2-dimensional piece of the real projective plane to its 1-dimensional piece. Its cokernel, the
		torsion \(\Z/2\), sits in degree 1. The transpose is again “multiply by 2”, but it points the other way, from degree 1 to degree 2,
		so the same \(\Z/2\) reappears as a cokernel in degree 2. This shift of torsion up by one degree is the Universal Coefficient
		Theorem of <Ref to="cohomology/cohomology-groups" />, in miniature.
	</p>
</Remark>

<!-- ───────────────────────────────────────────────────────────────────── -->

<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Switches">
	<p>
		Over \(\Z/2\), compute \((1,0,1,1) + (0,1,1,0)\). Write both vectors and the answer as subsets of \(\set{1,2,3,4}\), and check that
		the answer is their symmetric difference. Then explain why \(\mathbf v + \mathbf v = \mathbf 0\) for every vector over \(\Z/2\).
	</p>
	{#snippet solution()}
		<p>
			Entry by entry, \((1+0,\ 0+1,\ 1+1,\ 1+0) = (1,1,0,1)\). As sets, \(\set{1,3,4} + \set{2,3} = \set{1,2,4}\): position 3 was in
			both sets and cancelled, while 1, 4 and 2 were each in exactly one. Every entry of \(\mathbf v + \mathbf v\) is either
			\(0 + 0 = 0\) or \(1 + 1 = 0\), so \(\mathbf v + \mathbf v = \mathbf 0\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Counting dimensions">
	<p>
		(a) A \(3 \times 5\) matrix has rank 2. What is its nullity? (b) Can a linear map \(\R^5 \to \R^3\) be injective? (c) Can a linear
		map \(\R^3 \to \R^5\) be surjective? (d) A \(4 \times 4\) matrix has a nonzero vector in its kernel. Can it be surjective?
	</p>
	{#snippet hint()}
		<p>Rank and nullity add up to the dimension of the domain, which is the number of columns.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			(a) A \(3 \times 5\) matrix is a map \(\R^5 \to \R^3\), so its nullity is \(5 - 2 = 3\). (b) No. The image lies in \(\R^3\), so
			the rank is at most 3 and the nullity is at least \(5 - 3 = 2\); some nonzero vector is sent to \(\mathbf 0\). (c) No. The rank
			is \(3 - \text{nullity} \le 3 < 5\). (d) No. The nullity is at least 1, so the rank is at most \(4 - 1 = 3 < 4\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="A flattening map">
	<p>
		Let \(A = \begin{pmatrix}1&2\\2&4\end{pmatrix}\). (a) Find the kernel and the image of \(A\) and check rank–nullity. (b) Find all
		solutions of \(A\mathbf x = (3, 6)\). (c) Show that \(A\mathbf x = (1, 0)\) has no solution by finding a measurement that certifies
		it.
	</p>
	{#snippet solution()}
		<p>
			(a) The second column \((2,4)\) is twice the first, \((1,2)\), so the image is the line spanned by \((1,2)\) and the rank is 1.
			The relation \(2\,(\text{column 1}) - (\text{column 2}) = \mathbf 0\) gives the kernel, the line spanned by \((2,-1)\), so the
			nullity is 1, and \(2 = 1 + 1\).
		</p>
		<p>
			(b) \((3,6) = 3\,(1,2) = A(3,0)\), so \(\mathbf x_p = (3, 0)\) is a particular solution and all solutions are
			\((3,0) + t\,(2,-1) = (3 + 2t,\ -t)\) for real \(t\). Check: \(A(3+2t, -t) = (3 + 2t - 2t,\ 6 + 4t - 4t) = (3,6)\).
		</p>
		<p>
			(c) The measurement \(y(u,v) = 2u - v\) gives \(y(1,2) = 0\) and \(y(2,4) = 0\), so it gives 0 on every \(A\mathbf x\). But
			\(y(1,0) = 2 \neq 0\). If \(A\mathbf x = (1,0)\) we would get \(2 = y(A\mathbf x) = 0\), which is absurd.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="An impossible system over ℤ/2">
	<p>
		(a) Show that the system \(x + y = 1\), \(y + z = 1\), \(x + z = 1\) has no solution over \(\Z/2\), and find the measurement that
		certifies it. (b) Change the last equation to \(x + z = 0\) and find all solutions.
	</p>
	{#snippet hint()}
		<p>What happens when you add all three equations?</p>
	{/snippet}
	{#snippet solution()}
		<p>
			(a) Adding the three equations gives \(2x + 2y + 2z = 3\), that is, \(0 = 1\) over \(\Z/2\). The certificate is the measurement
			“add all three equations”, the covector \((1,1,1)\) on the right-hand sides: each column of the system’s matrix has two 1s, so this
			measurement gives 0 on every column, but it gives \(1 + 1 + 1 = 1\) on the target \((1,1,1)\). (In the language of the triangle,
			each edge touches two corners, so a set of edges always touches an even total number of corners.)
		</p>
		<p>
			(b) Now the three right-hand sides add up to \(1 + 1 + 0 = 0\), and the system is solvable. The last equation says \(z = x\) and
			the first says \(y = 1 + x\). With \(x\) free: \(x = 0\) gives \((0,1,0)\) and \(x = 1\) gives \((1,0,1)\). The solution set is
			\((0,1,0) + \set{(0,0,0),\ (1,1,1)}\), a coset of the kernel.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Lights Out on a 2 × 2 board">
	<p>
		On a \(2 \times 2\) board, number the cells \(1, 2\) (top row) and \(3, 4\) (bottom row); each cell has two neighbours. (a) Write
		down the \(4 \times 4\) matrix \(A\). (b) Show that pressing buttons 1, 2 and 3 lights only cell 1. (c) Conclude that every board
		is solvable in exactly one way.
	</p>
	{#snippet solution()}
		<p>
			(a) Button 1 switches cells \(\set{1,2,3}\), button 2 switches \(\set{1,2,4}\), button 3 switches \(\set{1,3,4}\) and button 4
			switches \(\set{2,3,4}\). These are the columns:
			\[ A = \begin{pmatrix} 1 & 1 & 1 & 0 \\ 1 & 1 & 0 & 1 \\ 1 & 0 & 1 & 1 \\ 0 & 1 & 1 & 1 \end{pmatrix}. \]
			(b) Cell 1 is switched by buttons 1, 2 and 3, three times, so it ends up on. Cell 2 is switched by buttons 1 and 2, cell 3 by
			buttons 1 and 3, and cell 4 by buttons 2 and 3: twice each, so they end up off. (c) By symmetry, pressing every button except the
			one diagonally opposite a cell lights that cell alone. So every single light is in the image, and every board, being a sum of
			single lights, is in the image too. The rank is 4, so by rank–nullity the nullity is 0, and each board has exactly one solution.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="A dual basis">
	<p>
		Find the dual basis of \(\mathbf b_1 = (2,1)\), \(\mathbf b_2 = (1,1)\) in \(\R^2\). Then use it to write \(\mathbf v = (3, 1)\) in
		the basis \(\mathbf b_1, \mathbf b_2\).
	</p>
	{#snippet hint()}
		<p>Write \(\mathbf b_1^*(x,y) = ax + cy\) and solve \(\mathbf b_1^*(\mathbf b_1) = 1\), \(\mathbf b_1^*(\mathbf b_2) = 0\).</p>
	{/snippet}
	{#snippet solution()}
		<p>
			For \(\mathbf b_1^* = ax + cy\): \(2a + c = 1\) and \(a + c = 0\), so \(a = 1\), \(c = -1\), and \(\mathbf b_1^*(x,y) = x - y\).
			For \(\mathbf b_2^*\): \(2a + c = 0\) and \(a + c = 1\), so \(a = -1\), \(c = 2\), and \(\mathbf b_2^*(x,y) = -x + 2y\). The dual
			basis vectors are the coordinate readers: \(\mathbf b_1^*(3,1) = 2\) and \(\mathbf b_2^*(3,1) = -1\), so
			\((3,1) = 2\,(2,1) - (1,1)\), which is easy to confirm.
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Gradients on a triangle">
	<p>
		A hollow triangle has vertices \(0, 1, 2\) and edges \([0,1]\), \([0,2]\), \([1,2]\), each pointing from the smaller label to the
		larger. Its signed boundary matrix sends an edge \([i,j]\) to \(v_j - v_i\). With rows \(v_0, v_1, v_2\) and columns \([0,1]\),
		\([0,2]\), \([1,2]\), it is
		\[ D = \begin{pmatrix} -1 & -1 & 0 \\ 1 & 0 & -1 \\ 0 & 1 & 1 \end{pmatrix}. \]
		(a) Find the rank and kernel of \(D\) over \(\Q\), and interpret the kernel. (b) For numbers \(f = (f_0, f_1, f_2)\) placed on
		the vertices, compute \(D^{\mathsf T} f\) and interpret it. (c) Find \(\ker D^{\mathsf T}\). (d) Use the duality theorem to decide
		which labellings \(g = (g_{01}, g_{02}, g_{12})\) of the edges have the form \(D^{\mathsf T} f\).
	</p>
	{#snippet solution()}
		<p>
			(a) Row reduction (it is the preset “triangle, signed” in the stepper) gives rank 2 and a kernel spanned by \((1, -1, 1)\), that
			is, \([0,1] - [0,2] + [1,2]\). This is the walk \(0 \to 1 \to 2 \to 0\) around the triangle, with the edge \([0,2]\) traversed
			backwards: a loop.
		</p>
		<p>
			(b) \(D^{\mathsf T} f = (f_1 - f_0,\ f_2 - f_0,\ f_2 - f_1)\): on each edge, the value at its end minus the value at its start. It
			is a discrete <em>gradient</em>, recording how \(f\) changes along each edge.
		</p>
		<p>
			(c) \(D^{\mathsf T} f = 0\) exactly when \(f_0 = f_1 = f_2\): the constant labellings, a space of dimension 1, one dimension for
			each connected piece of the shape.
		</p>
		<p>
			(d) Apply the theorem to \(D^{\mathsf T}\), whose transpose is \(D\): \(g\) is in the image of \(D^{\mathsf T}\) exactly when
			every vector of \(\ker D\) measures \(g\) as zero. Since \(\ker D\) is spanned by the loop \((1,-1,1)\), the condition is
			\(g_{01} - g_{02} + g_{12} = 0\): the total change around the loop must be zero. For example, \(g = (1, 0, 0)\) is not a gradient.
			Here the loop, an element of the kernel of \(D\), plays the role of the certificate. The constant labellings and the single
			condition around the loop are the cohomology groups \(H^0\) and \(H^1\) of a circle in disguise; see
			<Ref to="cohomology/cochains" />.
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Torsion by hand">
	<p>
		(a) Compute the Smith normal form of \(\begin{pmatrix} 2 & 6 \\ 4 & 8 \end{pmatrix}\) with integer row and column operations, and
		identify the group \(\Z^2/\langle (2,4), (6,8) \rangle\). (b) Check that the number of elements of the group equals
		\(\abs{\det}\). (c) What is the rank of this matrix over \(\Q\), and over \(\Z/2\)? Explain both answers with the invariant
		factors.
	</p>
	{#snippet solution()}
		<p>
			(a) \(R_2 \leftarrow R_2 - 2R_1\) gives \(\begin{pmatrix} 2 & 6 \\ 0 & -4 \end{pmatrix}\); \(C_2 \leftarrow C_2 - 3C_1\) gives
			\(\begin{pmatrix} 2 & 0 \\ 0 & -4 \end{pmatrix}\); \(R_2 \leftarrow -R_2\) gives \(\operatorname{diag}(2, 4)\), and \(2 \mid 4\).
			The columns of the matrix are the relations \((2,4)\) and \((6,8)\), so the group is \(\Z/2 \oplus \Z/4\). (b) It has
			\(2 \cdot 4 = 8\) elements, and \(\det = 2\cdot 8 - 6 \cdot 4 = -8\). (c) Over \(\Q\) the rank is 2, the number of invariant
			factors (the determinant is not zero). Over \(\Z/2\) both invariant factors are even, so the rank is 0; indeed every entry of the
			matrix is even, so modulo 2 it is the zero matrix.
		</p>
	{/snippet}
</Exercise>

<!-- ───────────────────────────────────────────────────────────────────── -->

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>
			Vectors can be added and scaled. A <strong>vector space</strong> is anything where that works with the usual rules, over a
			<strong>field</strong> of scalars such as \(\R\), \(\Q\) or \(\Z/2\). Over \(\Z/2\), vectors are rows of switches, or sets, and
			addition is symmetric difference.
		</li>
		<li>
			<strong>Span</strong>, <strong>independence</strong> and <strong>basis</strong> describe what vectors can build; the
			<strong>dimension</strong> is the size of any basis.
		</li>
		<li>
			A <strong>linear map</strong> keeps the grid a grid. It is determined by the images of a basis, which are the columns of its
			<strong>matrix</strong>; the matrix product \(AB\) is the composition “A after B”.
		</li>
		<li>
			The <strong>kernel</strong> is what gets crushed (the solutions of \(A\mathbf x = \mathbf 0\), the quiet patterns); the
			<strong>image</strong> is what can be reached (the column space). <strong>Rank–nullity</strong>: rank + nullity = dimension of the
			domain.
		</li>
		<li>
			<strong>Row reduction</strong> computes ranks, kernels and images over any field; the same matrix can have different ranks over
			different fields.
		</li>
		<li>
			\(A\mathbf x = \mathbf b\) has no solution, or a whole <strong>coset</strong> \(\mathbf x_p + \ker A\) of them.
		</li>
		<li>
			A <strong>quotient space</strong> \(V/W\) blurs out \(W\), and dimensions subtract. \(V/\ker A \cong \im A\). Homology
			\(H_k = Z_k/B_k\) has dimension \(n_k - \rank\partial_k - \rank\partial_{k+1}\).
		</li>
		<li>
			<strong>Lights Out</strong> on a \(5 \times 5\) board: rank 23 and nullity 2, so one board in four is solvable, each in exactly
			four ways, and two parity checks decide which.
		</li>
		<li>
			<strong>Duality</strong>: covectors are measurements, drawn as stacks of lines; the <strong>transpose</strong> pulls them back,
			reversing arrows; and \(\im A = (\ker A^{\mathsf T})^\perp\) guarantees certificates of impossibility. This is the seed of
			cohomology.
		</li>
		<li>
			Over \(\Z\) we may not divide. The <strong>Smith normal form</strong> \(\operatorname{diag}(d_1, \dots, d_r)\), with
			\(d_1 \mid d_2 \mid \cdots\), reveals \(\Z^{m-r} \oplus \Z/d_1 \oplus \dots \oplus \Z/d_r\): the source of torsion in homology.
		</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading items={reading} />
</div>

<style>
	/* the four little maps of the "zoo" example wrap onto two rows on narrow screens */
	.zoo {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 0 2rem;
		margin: 0.1rem 0 0.3rem;
	}
	.zoo :global(.math-block) {
		margin: 0.3em 0;
	}
	/* on phones, display formulas are set a little smaller so that they fit the column */
	@media (max-width: 560px) {
		.la :global(.math-block) {
			--math-scale: 1;
		}
	}
</style>
