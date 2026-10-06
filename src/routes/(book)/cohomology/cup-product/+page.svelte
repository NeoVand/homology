<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	import Definition from '$lib/components/prose/Definition.svelte';
	import Theorem from '$lib/components/prose/Theorem.svelte';
	import Proposition from '$lib/components/prose/Proposition.svelte';
	import Corollary from '$lib/components/prose/Corollary.svelte';
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
	import BandsTorus from '$lib/figures/cohomology/cup-product/BandsTorus.svelte';
	import FrontBack from '$lib/figures/cohomology/cup-product/FrontBack.svelte';
	import GridCup from '$lib/figures/cohomology/cup-product/GridCup.svelte';
	import TorusVsWedge from '$lib/figures/cohomology/cup-product/TorusVsWedge.svelte';
	import CupTable from '$lib/figures/cohomology/cup-product/CupTable.svelte';
	import PushOff from '$lib/figures/cohomology/cup-product/PushOff.svelte';
	import SignShuffle from '$lib/figures/cohomology/cup-product/SignShuffle.svelte';

	const reading = [
		{
			title: 'Algebraic Topology, §3.2 “Cup Product”',
			author: 'Allen Hatcher (2002)',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/AT.pdf',
			note: 'The standard reference: the simplicial and singular cup product, the Leibniz formula, graded commutativity, the rings of surfaces, ℝPⁿ and ℂPⁿ, and the Künneth formula. Graduate level, but Examples 3.7–3.9 are very readable after this chapter.',
			kind: 'book' as const,
			free: true
		},
		{
			title: 'Cup product and intersections',
			author: 'Michael Hutchings (2011)',
			url: 'https://math.berkeley.edu/~hutching/teach/215b-2011/cup.pdf',
			note: 'A short handout explaining why the cup product is “intersection of Poincaré duals”, with the torus and ℂPⁿ worked out. The best next step after the last section of this chapter.',
			kind: 'notes' as const,
			free: true
		},
		{
			title: 'Differential Forms in Algebraic Topology',
			author: 'Raoul Bott and Loring Tu (Springer GTM 82, 1982)',
			url: 'https://books.google.com/books/about/Differential_Forms_in_Algebraic_Topology.html?id=COuPBAAAQBAJ',
			note: 'Builds the whole subject from wedge products of forms, exactly the smooth picture of our second section. The Künneth formula and the cohomology of projective spaces appear early and visually.',
			kind: 'book' as const
		},
		{
			title: 'The Essence of de Rham Cohomology',
			author: 'Anton Petrov (2024)',
			url: 'https://arxiv.org/abs/2411.06296',
			note: 'A student-level exposition of de Rham cohomology that includes products, Künneth and Poincaré duality — a gentle bridge between this chapter and the next.',
			kind: 'paper' as const,
			free: true
		},
		{
			title: 'History of Homological Algebra',
			author: 'Charles Weibel',
			url: 'https://metaphor.ethz.ch/x/2025/hs/401-3132-00L/ex/historyweibel.pdf',
			note: 'Where the history box of this chapter comes from: Alexander and Kolmogorov in Moscow in 1935, and Whitney naming “cup” and “cap”.',
			kind: 'paper' as const,
			free: true
		}
	];
</script>

<Epigraph author="Allen Hatcher" source="Algebraic Topology (2002)">What is a little surprising is that contravariance leads to extra structure in cohomology.</Epigraph>

<p class="lead">
	Here are two shapes. The first is the surface of a doughnut, the torus. The second is a balloon
	with two key rings hanging from the knot: a sphere with two circles attached at a single point.
	Feed both into every machine this book has built so far and the answers come out identical — one
	piece, two independent loops, one enclosed void. Their homology groups agree, their cohomology
	groups agree, even their Euler characteristics agree. And yet nobody would mistake one for the
	other.
</p>

<p class="lead">
	This chapter is about the extra structure that tells them apart. The idea is disarmingly simple.
	Chains are <em>places</em> and cochains are <em>measurements</em>. You cannot multiply two places
	— but you can multiply two measurements.
</p>

<Ahead>
	<p>
		Cohomology classes can be multiplied. The multiplication is called the <strong>cup product</strong>,
		and it turns the cohomology of every space into a <em>ring</em>: a number system with both
		addition and multiplication. That ring is a far sharper invariant than the groups alone. It
		separates the torus from the balloon with key rings, and the torus from the Klein bottle. It has a
		beautiful geometric meaning: multiplying two classes counts the places where their “fences” cross.
		It is the doorway to Poincaré duality in <Ref to="cohomology/poincare-duality" />, to the
		characteristic classes of <Ref to="cohomology/characteristic-classes" />, and to almost all of modern
		algebraic topology, where cohomology is nearly always used as a ring.
	</p>
</Ahead>

<h2 id="same-numbers">Same numbers, different shapes</h2>

<p>
	Let us meet the two shapes properly. The <dfn>torus</dfn> \(T^2\) is the surface of a doughnut;
	in <Ref to="topology/gluing" /> we built it from a square by gluing opposite sides. The second
	shape is written \(S^1\vee S^1\vee S^2\) and read “S-one wedge S-one wedge S-two”. It is a
	<Term t="wedge-sum">wedge</Term>: take a sphere \(S^2\) and two circles \(S^1\), pick one point on
	each, and glue those three points together into a single point. Nothing else is glued.
</p>

<Figure num="4.5.1" title="Same groups" hint="Drag to rotate · switch to “Multiply”">
	<TorusVsWedge />
	{#snippet caption()}
		The torus \(T^2\) and the wedge \(S^1\vee S^1\vee S^2\). Counting holes gives the same answer for
		both: one loop of each colour, one enclosed void. Switch to the product view: on the torus the
		two fences cross, so \(\alpha\smile\beta\neq 0\); on the wedge they sit on different circles and
		never meet, so \(\alpha\smile\beta=0\).
	{/snippet}
</Figure>

<p>
	Now compute. Both shapes are connected, so \(H_0=\Z\). The torus has two independent loops — around
	the hole and around the tube — and the wedge has two as well, one in each circle. So \(H_1=\Z^2\)
	for both. The torus encloses a void, and so does the sphere inside the wedge: \(H_2=\Z\) for both
	(<Ref to="homology/homology-groups" /> did the torus; the wedge is the same computation done one
	piece at a time). None of these groups has torsion, so the Universal Coefficient Theorem of
	<Ref to="cohomology/cohomology-groups" /> says that cohomology is the same as homology here:
</p>
\[ H^0 = \Z, \qquad H^1 = \Z^2, \qquad H^2 = \Z \qquad\text{for both } T^2 \text{ and } S^1\vee S^1\vee S^2. \]
<p>
	Even the Euler characteristic, \(\chi = 1-2+1 = 0\), agrees.
</p>

<p>
	Are the two shapes secretly the same? Not as rubber sheets: the wedge has a special point, the
	knot of the balloon, and removing it breaks the wedge into three pieces, while removing any single
	point from the torus leaves it in one piece. But that argument only shows that the shapes are not
	<em>homeomorphic</em>. The question that homology is built to answer is the coarser one from
	<Ref to="topology/homotopy" />: could the two shapes be
	<Term t="homotopy-equivalence">homotopy equivalent</Term>, the way a solid ball is homotopy equivalent
	to a point? Every homotopy invariant we have computed says “maybe”.
</p>

<Question>
	<p>
		Homology and cohomology have shown us numbers: ranks of groups. Is there anything else in
		cohomology — some piece of structure beyond “how many classes” — that the two shapes could
		disagree on?
	</p>
</Question>

<Remark>
	<p>
		For these two particular shapes the fundamental group of <Ref to="topology/homotopy" /> also
		settles the question: loops on the torus commute, loops in two circles joined at a point do not.
		But there are pairs of spaces with no loops at all — the complex projective plane \(\CP^2\) and
		\(S^2\vee S^4\), which we meet at the end of this chapter — that have identical groups and identical
		fundamental groups. The tool of this chapter separates those too.
	</p>
</Remark>

<h2 id="multiplying">Places cannot be multiplied; measurements can</h2>

<p>
	Recall the slogan of <Ref to="cohomology/cochains" />: a <Term t="chain">chain</Term> is a
	<em>place</em> — a path, a region, a weighted list of simplices — and a
	<Term t="cochain">cochain</Term> is a <em>measurement</em> — a rule assigning a number to each
	simplex, which you then add up over a chain. The pairing \(\ip{\varphi}{c}\), read “phi paired
	with c”, is the result of measuring \(c\) with \(\varphi\): integrating \(\varphi\) over \(c\).
</p>

<p>
	Measurements have a talent that places lack: two of them can be <em>multiplied</em>. If \(f\) is
	the temperature at each point of a room and \(g\) is the humidity, then \(f\cdot g\) is a new
	measurement, defined by \((f\cdot g)(x) = f(x)\,g(x)\). The trick that makes this work is that both
	\(f\) and \(g\) can be evaluated <em>at the same point</em> \(x\).
</p>

<p>
	Try the same with places and it falls apart. What would “this edge times that triangle” be? The
	honest answer is a pair — an edge and a triangle — which is a place in the product space
	\(X\times X\), not in \(X\). To come back to \(X\) we would need a map \(X\times X\to X\), a way of
	combining two points into one, and a general space has no such map. Measurements go the other way:
	they <em>pull back</em> along maps (that is contravariance, from <Ref to="cohomology/cohomology-groups" />),
	and every space has the <dfn>diagonal map</dfn> \(X\to X\times X\), \(x\mapsto(x,x)\), which is exactly
	“evaluate both at the same point”. This is the surprise in the epigraph: cohomology runs backwards,
	and because it runs backwards it can multiply.
</p>

<p>
	There is one more feature to notice before we start. Measurements come in degrees: a 0-cochain
	measures points, a 1-cochain measures edges, a 2-cochain measures triangles. When we multiply, the
	degrees <em>add</em>, just as multiplying a length by a length gives an area. A product of a
	\(p\)-measurement and a \(q\)-measurement will be a \((p+q)\)-measurement.
</p>

<Intuition title="Three pictures of one product">
	<p>The cup product will appear in three guises in this chapter, and it pays to keep all three in mind:</p>
	<ul>
		<li>
			<strong>Densities.</strong> For smooth shapes, cohomology classes are represented by
			differential forms, and the product is the wedge product of forms — length times width is area.
		</li>
		<li>
			<strong>A recipe.</strong> On a triangulated shape, the product is computed one simplex at a time
			by a “front face times back face” rule. This works for any space and any coefficients.
		</li>
		<li>
			<strong>Crossings.</strong> On a surface, a degree-1 class can be drawn as a fence, and the product
			of two classes counts — with signs — the points where the two fences cross.
		</li>
	</ul>
</Intuition>

<h2 id="forms">The smooth version: wedging closed forms</h2>

<p>
	Start where the picture is clearest. In <Ref to="cohomology/differential-forms" /> we met the
	<Term t="wedge-product">wedge product</Term>: a \(k\)-form \(\alpha\) and an \(l\)-form \(\beta\)
	combine into a \((k+l)\)-form \(\alpha\wedge\beta\). It is bilinear, associative, and anticommutes
	in the graded sense:
</p>
\[ \alpha\wedge\beta = (-1)^{kl}\,\beta\wedge\alpha, \]
<p>so in particular</p>
\[ dx\wedge dy = -\,dy\wedge dx, \qquad dx\wedge dx = 0. \]
<p>
	We also met the <Term t="exterior-derivative">exterior derivative</Term> \(d\), and the rule that tells
	\(d\) how to act on a product — the <em>Leibniz rule</em>, the grown-up version of the product rule
	\((fg)' = f'g + fg'\) from calculus:
</p>
\[ d(\alpha\wedge\beta) = d\alpha\wedge\beta + (-1)^{k}\,\alpha\wedge d\beta \qquad (\alpha \text{ a } k\text{-form}). \]
<p>
	The sign is the price of moving \(d\), a symbol of degree one, past the \(k\) one-forms \(dx_i\) that make up \(\alpha\).
</p>

<p>
	Now recall from <Ref to="cohomology/de-rham" /> that a form is <Term t="closed-form">closed</Term>
	if \(d\alpha=0\) and <Term t="exact-form">exact</Term> if \(\alpha=d\eta\) for some \(\eta\), and that
	de Rham cohomology \(H^k_{\dR}(M)\) is closed forms modulo exact ones. The Leibniz rule gives us two
	facts at once.
</p>

<ol>
	<li>
		<strong>Closed times closed is closed.</strong> If \(d\alpha=0\) and \(d\beta=0\), both terms on
		the right vanish, so \(d(\alpha\wedge\beta)=0\).
	</li>
	<li>
		<strong>Exact times closed is exact.</strong> If \(d\beta=0\), then
		\(d(\eta\wedge\beta) = d\eta\wedge\beta \pm \eta\wedge d\beta = d\eta\wedge\beta\). So
		\(d\eta\wedge\beta\) is the derivative of something: it is exact. The same works on the other side.
	</li>
</ol>

<p>
	Together they say that multiplying cohomology <em>classes</em> makes sense:
	\([\alpha]\cdot[\beta] := [\alpha\wedge\beta]\). If you replace \(\alpha\) by another representative
	\(\alpha + d\eta\) of the same class, the product changes by \(d\eta\wedge\beta\), which is exact — so
	the class of the product does not change. This is the pattern we will copy in the combinatorial
	world: <em>a product rule for the derivative is exactly what lets products descend to cohomology.</em>
</p>

<Example title="The flat torus">
	<p>
		Think of the torus as the plane with coordinates \((x,y)\), wrapped up so that \(x\) and
		\(x+1\) are the same point, and so are \(y\) and \(y+1\). The forms \(dx\) and \(dy\) make sense
		on the torus (the coordinates themselves do not — \(x\) jumps by \(1\) as you go around — but their
		differentials do). Both are closed, and neither is exact: integrating \(dx\) once around the loop
		in the \(x\)-direction gives \(1\), and an exact form integrates to \(0\) around every loop.
	</p>
	<p>
		Their wedge product \(dx\wedge dy\) is the <em>area form</em>, and
		\(\int_{T^2} dx\wedge dy = \text{area} = 1 \neq 0.\) An exact 2-form would integrate to \(0\) over
		the whole closed surface (by Stokes’ theorem), so \([dx]\cdot[dy]\) is a nonzero class; it generates
		\(H^2_{\dR}(T^2)\cong\R\). Meanwhile \([dx]\cdot[dx] = [dx\wedge dx] = 0\) and
		\([dy]\cdot[dx] = -[dx]\cdot[dy]\). Hold on to these three facts: they are the whole multiplication
		table of the torus, and we are about to find them again with nothing but triangles and integers.
	</p>
</Example>

<p>
	Forms have two limitations. They need a smooth manifold to live on — our balloon with key rings is
	not one, because of its special point — and they only ever produce real numbers, so they are blind
	to integer and mod-2 phenomena. We want a product that works for any triangulated space and any
	coefficients. That is the cup product.
</p>

<h2 id="front-and-back">Front face times back face</h2>

<p>
	How should two 1-cochains \(\varphi\) and \(\psi\) combine into a number on a triangle? Take the
	wedge product as a guide: \(dx\wedge dy\) on a little rectangle multiplies the width, measured along
	one side, by the height, measured along an adjacent side. On a triangle there is a natural pair of
	adjacent sides once we know which vertex comes first. Walk from \(v_0\) to \(v_1\) and measure with
	\(\varphi\); then walk on from \(v_1\) to \(v_2\) and measure with \(\psi\); multiply.
</p>

<Definition id="def-cup" title="Cup product of 1-cochains">
	<p>
		Let \(\varphi\) and \(\psi\) be 1-cochains on a complex whose simplices have ordered vertices. Their
		<dfn>cup product</dfn> \(\varphi\smile\psi\), read “phi cup psi”, is the 2-cochain whose value on a
		triangle \(\sigma=[v_0,v_1,v_2]\) is
	</p>
	\[ (\varphi\smile\psi)([v_0,v_1,v_2]) = \varphi([v_0,v_1])\cdot\psi([v_1,v_2]). \]
	<p>
		The edge \([v_0,v_1]\) is the <dfn>front face</dfn> of \(\sigma\) and \([v_1,v_2]\) is its
		<dfn>back face</dfn>. The third edge, \([v_0,v_2]\), is not consulted at all.
	</p>
</Definition>

<p>
	The ordering of the vertices matters, so we use the book’s convention: in a simplicial complex the
	vertices carry integer labels and every simplex is written in increasing order; in a
	<Term t="delta-complex">Δ-complex</Term> each simplex comes with its own order, indicated by arrows on
	its edges (an edge points from the earlier vertex to the later one). Play with the triangle below.
</p>

<Figure num="4.5.2" title="Front face × back face" hint="Use − and + to change the values · swap the order">
	<FrontBack />
	{#snippet caption()}
		The product reads the left factor on the front face \([v_0,v_1]\) and the right factor on the back
		face \([v_1,v_2]\), and multiplies. Change the values on the long edge, or \(\psi\) on the front
		edge: nothing happens. Swap the order and the answer usually changes — the cup product is not
		commutative on the nose.
	{/snippet}
</Figure>

<p>
	The same recipe works in every degree. A \(p\)-cochain eats a \(p\)-simplex and a \(q\)-cochain eats a
	\(q\)-simplex; a \((p+q)\)-simplex has a front \(p\)-face and a back \(q\)-face which share exactly one
	vertex, the vertex \(v_p\):
</p>

<Definition title="Cup product in general">
	<p>
		For a \(p\)-cochain \(\varphi\) and a \(q\)-cochain \(\psi\) (with coefficients in \(\Z\), \(\Z/2\),
		\(\Q\) or \(\R\) — anything in which we can multiply), \(\varphi\smile\psi\) is the
		\((p+q)\)-cochain
	</p>
	\[ (\varphi\smile\psi)([v_0,\dots,v_{p+q}]) = \varphi([v_0,\dots,v_p])\cdot\psi([v_p,\dots,v_{p+q}]). \]
</Definition>

<p>Three small cases show that nothing strange is going on.</p>

<ul>
	<li>
		<strong>Degrees 0 and 0.</strong> A 0-cochain is a function on vertices, and
		\((f\smile g)([v_0]) = f(v_0)\,g(v_0)\): the cup product of two functions is their ordinary
		pointwise product. The temperature-times-humidity product of the previous section is a special case.
	</li>
	<li>
		<strong>Degrees 0 and 1.</strong> \((f\smile\varphi)([v_0,v_1]) = f(v_0)\,\varphi([v_0,v_1])\):
		multiply the measurement on each edge by the value of \(f\) at its starting point. Likewise
		\((\varphi\smile f)([v_0,v_1]) = \varphi([v_0,v_1])\,f(v_1)\) uses the end point.
	</li>
	<li>
		<strong>The constant function \(1\).</strong> Taking \(f=1\) everywhere gives
		\(1\smile\varphi=\varphi=\varphi\smile 1\). The constant function is a <em>unit</em>: multiplying by
		it does nothing.
	</li>
</ul>

<Proposition title="Basic laws">
	<p>
		The cup product is <strong>distributive</strong> (\(\varphi\smile(\psi+\psi') = \varphi\smile\psi +
		\varphi\smile\psi'\), and likewise on the left), <strong>associative</strong>
		(\((\varphi\smile\psi)\smile\chi = \varphi\smile(\psi\smile\chi)\)), and has the constant cochain
		\(1\) as a <strong>unit</strong>.
	</p>
</Proposition>

<Proof>
	<p>
		Distributivity holds because the formula is a product of a value of \(\varphi\) and a value of
		\(\psi\), and multiplication of numbers distributes over addition. For associativity, evaluate both
		sides on a simplex \([v_0,\dots,v_{p+q+r}]\): both equal
		\(\varphi([v_0..v_p])\cdot\psi([v_p..v_{p+q}])\cdot\chi([v_{p+q}..v_{p+q+r}])\) — the front, the
		middle and the back piece. The unit law is the computation in the list above.
	</p>
</Proof>

<Warning title="Not commutative on the nose">
	<p>
		In the figure, set \(\varphi\) to \(2,1,3\) and \(\psi\) to \(-1,3,2\) on the three edges. Then
		\((\varphi\smile\psi)(\sigma)=2\cdot 3 = 6\) but \((\psi\smile\varphi)(\sigma) = (-1)\cdot 1 = -1\).
		At the level of cochains the order of the factors matters. What survives in cohomology is subtler,
		and more interesting: we will see that the order matters <em>only up to a sign</em>.
	</p>
</Warning>

<h2 id="leibniz">Cocycles times cocycles</h2>

<p>
	We want to multiply cohomology classes, not just cochains. Remember that a class is represented by a
	<Term t="cocycle">cocycle</Term> (a cochain with \(\delta\varphi=0\)), and that two cocycles represent
	the same class when they differ by a <Term t="coboundary">coboundary</Term> \(\delta\eta\). So we need
	the same two facts that made the wedge product work: cocycle times cocycle should be a cocycle, and
	changing a factor by a coboundary should change the product by a coboundary. Both follow from one
	formula — the combinatorial twin of the Leibniz rule.
</p>

<Theorem id="leibniz-rule" label="Theorem (Leibniz rule)">
	<p>For a \(p\)-cochain \(\varphi\) and a \(q\)-cochain \(\psi\),</p>
	\[ \delta(\varphi\smile\psi) = \delta\varphi\smile\psi + (-1)^{p}\,\varphi\smile\delta\psi. \]
</Theorem>

<p>
	Before the general argument, let us check the first interesting case by hand, so that nothing is
	hidden. Take \(p=q=1\). Then both sides are 3-cochains, so we evaluate them on a tetrahedron
	\(\sigma=[v_0,v_1,v_2,v_3]\). To keep the formulas short, write \(\varphi_{ij}\) for
	\(\varphi([v_i,v_j])\) and \(\psi_{ij}\) for \(\psi([v_i,v_j])\).
</p>

<Proof label="Proof for two 1-cochains">
	<p>
		<strong>Left side.</strong> By definition of \(\delta\), we evaluate \(\varphi\smile\psi\) on the
		boundary \(\partial\sigma = [v_1,v_2,v_3]-[v_0,v_2,v_3]+[v_0,v_1,v_3]-[v_0,v_1,v_2]\), using front
		face times back face on each of the four triangles:
	</p>
	\[ \delta(\varphi\smile\psi)(\sigma) = \varphi_{12}\psi_{23} - \varphi_{02}\psi_{23} + \varphi_{01}\psi_{13} - \varphi_{01}\psi_{12}. \]
	<p>
		<strong>First term on the right.</strong> \(\delta\varphi\) is a 2-cochain, so it reads the front
		<em>triangle</em> \([v_0,v_1,v_2]\), and \(\psi\) reads the back edge \([v_2,v_3]\):
	</p>
	\[ (\delta\varphi\smile\psi)(\sigma) = (\varphi_{12}-\varphi_{02}+\varphi_{01})\,\psi_{23}. \]
	<p>
		<strong>Second term on the right.</strong> Here \(\varphi\) reads the front edge \([v_0,v_1]\) and
		\(\delta\psi\) reads the back triangle \([v_1,v_2,v_3]\); the sign is \((-1)^1=-1\):
	</p>
	\[ -(\varphi\smile\delta\psi)(\sigma) = -\varphi_{01}\,(\psi_{23}-\psi_{13}+\psi_{12}). \]
	<p>
		<strong>Add.</strong> Expanding, the two terms \(\varphi_{01}\psi_{23}\) and \(-\varphi_{01}\psi_{23}\)
		cancel, and what remains is \(\varphi_{12}\psi_{23} - \varphi_{02}\psi_{23} + \varphi_{01}\psi_{13} -
		\varphi_{01}\psi_{12}\) — exactly the left side.
	</p>
</Proof>

<p>
	The general proof is the same bookkeeping on a \((p+q+1)\)-simplex. The left side is a sum over the
	faces of \(\sigma\) obtained by deleting one vertex. Deleting a vertex from the front part gives the
	terms of \(\delta\varphi\smile\psi\); deleting a vertex from the back part gives the terms of
	\(\varphi\smile\delta\psi\), each shifted in sign by \((-1)^p\) because it sits \(p\) places further
	along. The two sums share one extra pair of terms — deleting the very last front vertex, or the very
	first back vertex — and that pair cancels, just as \(\varphi_{01}\psi_{23}\) did above. (Hatcher writes
	this out in full as Lemma 3.6 of his book; our test suite also checks the formula numerically in every
	degree on a 4-simplex and on the 3-sphere.)
</p>

<Corollary title="Products descend to cohomology">
	<p>
		If \(\varphi\) and \(\psi\) are cocycles, so is \(\varphi\smile\psi\). If moreover \(\eta\) and
		\(\theta\) are any cochains, then
		\((\varphi+\delta\eta)\smile(\psi+\delta\theta)\) differs from \(\varphi\smile\psi\) by a coboundary.
		So the rule
	</p>
	\[ [\varphi]\smile[\psi] := [\varphi\smile\psi] \]
	<p>is a well-defined product of cohomology classes, \(H^p\times H^q\to H^{p+q}\).</p>
</Corollary>

<Proof>
	<p>
		If \(\delta\varphi=\delta\psi=0\), both terms of the Leibniz rule vanish. For the second claim,
		expand the product into four pieces. The extra pieces are coboundaries:
		\(\delta\eta\smile\psi = \delta(\eta\smile\psi)\), because the Leibniz rule gives
		\(\delta(\eta\smile\psi) = \delta\eta\smile\psi \pm \eta\smile\delta\psi\) and \(\delta\psi = 0\);
		similarly \(\varphi\smile\delta\theta = (-1)^p\,\delta(\varphi\smile\theta)\) because \(\delta\varphi=0\);
		and \(\delta\eta\smile\delta\theta = \delta(\eta\smile\delta\theta)\) because \(\delta\delta\theta = 0\).
	</p>
</Proof>

<h3 id="rings">A new kind of algebra: rings</h3>

<p>
	We now have, on the cohomology of any space, an addition (from the group structure) and a
	multiplication (the cup product). Algebraists have a name for a number system of that kind. It is the
	one piece of algebra this chapter needs that the earlier chapters did not, so here it is, just in time.
</p>

<Definition id="def-ring" title="Ring">
	<p>
		A <dfn>ring</dfn> is an abelian group \(R\) (written additively) together with a multiplication
		\(R\times R\to R\), \((a,b)\mapsto ab\), that is associative, distributes over addition on both
		sides, and has a unit element \(1\) with \(1a=a=a1\). The ring is <dfn>commutative</dfn> if
		\(ab=ba\) for all \(a,b\).
	</p>
</Definition>

<p>
	You have used rings all your life: the integers \(\Z\), the clock numbers \(\Z/n\) (where you can
	multiply as well as add), the real numbers, polynomials \(\R[x]\), real-valued functions on a set
	(multiplied pointwise). Square matrices form a ring that is not commutative. The cohomology ring is
	slightly special because its elements come with degrees.
</p>

<Definition id="def-cohomology-ring" title="Graded ring; the cohomology ring">
	<p>
		A <dfn>graded ring</dfn> is a ring that is a direct sum of pieces \(R=R^0\oplus R^1\oplus R^2\oplus\cdots\)
		with \(R^p\cdot R^q\subseteq R^{p+q}\). For a space \(X\) and a commutative ring of coefficients
		\(R\) (such as \(\Z\), \(\Z/2\), \(\Q\), \(\R\)), the <dfn>cohomology ring</dfn> is
	</p>
	\[ H^*(X;R) = H^0(X;R)\oplus H^1(X;R)\oplus H^2(X;R)\oplus\cdots \]
	<p>
		with the cup product as multiplication. The class of the constant cochain \(1\) is its unit. An
		element of \(H^p\) is said to have <dfn>degree</dfn> \(p\).
	</p>
</Definition>

<p>
	Three facts make this ring a genuine invariant of the space, not of the triangulation we happened to
	draw. We state them without proof; they are proved in Hatcher’s §3.2 using singular cohomology.
</p>

<Theorem title="The ring is an invariant">
	<ul>
		<li>
			The cohomology ring does not depend on the triangulation, or on how its vertices are ordered.
		</li>
		<li>
			A continuous map \(f\colon X\to Y\) induces a <dfn>ring homomorphism</dfn>
			\(f^*\colon H^*(Y)\to H^*(X)\): it respects degrees, sums and products,
			\(f^*(\alpha\smile\beta)=f^*\alpha\smile f^*\beta\).
		</li>
		<li>
			Consequently, homotopy equivalent spaces have isomorphic cohomology rings. And for a smooth
			manifold, de Rham’s isomorphism \(H^*_{\dR}(M)\cong H^*(M;\R)\) turns wedge products into cup
			products.
		</li>
	</ul>
</Theorem>

<h2 id="torus">The ring of the torus, by hand</h2>

<p>
	Time to compute. We use the torus from <Ref to="homology/homology-groups" />: a square cut into
	\(3\times 3\) cells, each cell cut by its diagonal into two triangles, with opposite sides of the
	square glued. To order the vertices of every triangle we use arrows, as in a Δ-complex: every edge
	points <em>right</em>, <em>up</em> or <em>up-and-right</em>. Then every triangle is one of two kinds:
</p>
<ul>
	<li>a <strong>lower triangle \(L\)</strong>, whose arrows run right and then up: front face horizontal, back face vertical;</li>
	<li>an <strong>upper triangle \(U\)</strong>, whose arrows run up and then right: front face vertical, back face horizontal.</li>
</ul>
<p>
	(With integer labels in increasing order this tidy arrangement is impossible — going once around the
	torus you would have to come back to a smaller label — which is why we allow ourselves the Δ-complex
	ordering. The answers in cohomology are the same either way; our code checks that too.)
</p>

<h3 id="fences">Two fences</h3>

<p>
	Next we need two cocycles representing a basis of \(H^1(T^2;\Z)\). They are easiest to describe by a
	picture that goes back to Hatcher’s introduction to cohomology. Draw a curve on the surface that
	crosses edges transversally — a <dfn>fence</dfn> — and give it a direction in which crossing it counts
	\(+1\). The cochain of the fence assigns to each edge the number of times the edge crosses the fence,
	counted with sign. A fence that closes up is always a cocycle: whenever the fence enters a triangle it
	must leave it again, so going once around the boundary of the triangle you cross it as often in one
	direction as in the other, and the signed count is zero.
</p>

<ul>
	<li>
		\(\cyc{\alpha}\) is a vertical fence, counting \(+1\) whenever you cross it from left to right. It is
		\(1\) on the horizontal and diagonal edges of one column, and \(0\) elsewhere.
	</li>
	<li>
		\(\bdy{\beta}\) is a horizontal fence, counting \(+1\) whenever you cross it upwards. It is \(1\) on
		the vertical and diagonal edges of one row, and \(0\) elsewhere.
	</li>
</ul>

<p>
	Check the cocycle condition on one lower triangle of \(\alpha\)’s column:
	\((\delta\alpha)(L) = \alpha(\text{back}) - \alpha(\text{long}) + \alpha(\text{front}) = 0 - 1 + 1 = 0\).
	Every other triangle works the same way. Measured on the two basic loops of the torus — the loop
	\(a\) running once around horizontally and the loop \(b\) running once around vertically — they give
</p>
\[ \alpha(a) = 1,\quad \alpha(b) = 0,\qquad \beta(a) = 0,\quad \beta(b) = 1, \]
<p>
	because \(a\) crosses the vertical fence once and the horizontal fence never, and vice versa. By the
	Universal Coefficient Theorem, \(H^1(T^2;\Z)\) is the group of homomorphisms \(H_1(T^2)\to\Z\), and
	\(\alpha,\beta\) are the classes “dual” to the basis \(a, b\) of \(H_1\); so they form a basis of
	\(H^1(T^2;\Z)\cong\Z^2\).
</p>

<h3 id="the-products">The four products</h3>

<p>
	Now apply the recipe. On a lower triangle \(L\), the front face is horizontal and the back face is
	vertical, so
</p>
\[ (\alpha\smile\beta)(L) = \alpha(\text{horizontal edge})\cdot\beta(\text{vertical edge}), \]
<p>
	which is \(1\) exactly when the horizontal edge lies in \(\alpha\)’s column <em>and</em> the vertical
	edge lies in \(\beta\)’s row — that is, for the single lower triangle in the cell where the two fences
	cross — and \(0\) for all the others. On an upper triangle the front face is vertical, and \(\alpha\)
	vanishes on vertical edges, so \((\alpha\smile\beta)(U)=0\) always. The whole 2-cochain
	\(\alpha\smile\beta\) is concentrated on one triangle: <strong>the product lives where the fences
	cross.</strong>
</p>

<Figure num="4.5.3" title="The torus, triangle by triangle" hint="Choose a product · move the fences · tap a triangle">
	<GridCup />
	{#snippet caption()}
		The number in each triangle is the value of the chosen product there: left factor on the front face
		times right factor on the back face. For \(\alpha\smile\beta\) only the lower triangle of the
		crossing cell lights up; for \(\beta\smile\alpha\) it is the upper one; the squares vanish
		everywhere. Moving a fence moves the lit triangle, but the total over the torus never changes.
	{/snippet}
</Figure>

<p>
	To turn this 2-cochain into an element of \(H^2(T^2;\Z)\cong\Z\), add it up over the whole surface,
	with every triangle oriented the same way (counterclockwise). That total is unchanged by adding a
	coboundary — \(\ip{\delta\eta}{[T^2]} = \ip{\eta}{\partial[T^2]} = 0\), since the closed surface has no
	boundary — and it identifies \(H^2(T^2;\Z)\) with \(\Z\). With our arrows the lower triangles run
	counterclockwise and the upper ones clockwise, so the oriented sum of all triangles — the
	<em>fundamental class</em>, which <Ref to="cohomology/poincare-duality" /> studies in its own right —
	is \([T^2] = \sum L - \sum U\). Let \(\gamma\) denote the generator of \(H^2(T^2;\Z)\) with
	\(\ip{\gamma}{[T^2]}=1\). Then
</p>
\[ \ip{\alpha\smile\beta}{[T^2]} = 1 - 0 = +1, \qquad\text{so}\qquad \alpha\smile\beta = \gamma. \]
<p>
	Running the same recipe for the other three products (the figure does it for you):
</p>
<ul>
	<li>
		\(\beta\smile\alpha\) is \(1\) only on the <em>upper</em> triangle of the crossing cell, where the
		front face is vertical (\(\beta=1\)) and the back face horizontal (\(\alpha=1\)). Upper triangles
		count with a minus sign, so \(\beta\smile\alpha = -\gamma\).
	</li>
	<li>
		\(\alpha\smile\alpha\) needs \(\alpha\neq 0\) on both the front and the back face of some triangle. But
		front and back always point in different directions — one horizontal, one vertical — and \(\alpha\)
		vanishes on vertical edges. So \(\alpha\smile\alpha=0\), already as a cochain. The same goes for
		\(\beta\smile\beta=0\).
	</li>
</ul>

<KeyIdea>
	<p>The cohomology ring of the torus has basis \(1, \alpha, \beta, \gamma\), with multiplication</p>
	\[ \alpha\smile\alpha = 0,\qquad \beta\smile\beta = 0,\qquad \alpha\smile\beta = \gamma = -\,\beta\smile\alpha. \]
	<p>
		This is exactly the table of \([dx]\) and \([dy]\) on the flat torus — the same ring, found once with
		calculus and once with triangles and integers. Algebraists call it the <dfn>exterior algebra</dfn> on
		two generators, \(\Lambda[\alpha,\beta]\): generators that square to zero and anticommute.
	</p>
</KeyIdea>

<h3 id="bands">The same computation on a round torus</h3>

<p>
	Here is the same story on a round, glassy torus. The gold band is the fence \(\alpha\), running around
	the tube; the teal band is \(\beta\), running around the hole. The little chevrons on each band point in
	the direction in which crossing it counts \(+1\). Where the bands cross, a rose patch glows: that is the
	support of \(\alpha\smile\beta\).
</p>

<Figure num="4.5.4" title="Bands on a torus" hint="Drag to rotate · slide and bend the bands · switch products">
	<BandsTorus />
	{#snippet caption()}
		Two fences on a torus and their crossings. The first readout counts crossings with signs; the second
		computes the cup product honestly, by front face × back face on a \(12\times 12\) triangulation
		built from the bands. Slide the bands anywhere and the answer stays \(+1\). Bend \(\alpha\) into an S
		until it crosses \(\beta\) three times: the signs read \(+1-1+1\), and the total is still \(+1\). For
		\(\alpha\smile\alpha\), a pushed-off copy \(\alpha'\) never meets \(\alpha\): the square is zero.
	{/snippet}
</Figure>

<h3 id="graded">Order matters — but only up to sign</h3>

<p>
	On the torus, swapping the factors changed the sign: \(\beta\smile\alpha=-\alpha\smile\beta\). For forms
	we knew in advance that this had to happen, because \(dx\) and \(dy\) anticommute. In general, moving a
	\(q\)-form past a \(p\)-form means sliding each of its \(q\) factors \(dy_j\) past each of the \(p\) factors
	\(dx_i\) — that is \(pq\) swaps of neighbours, each one a factor \(-1\).
</p>

<Figure num="4.5.5" title="Counting the swaps" hint="Pick degrees · step through the swaps">
	<SignShuffle />
	{#snippet caption()}
		Moving \(\beta\) (teal, degree \(q\)) past \(\alpha\) (gold, degree \(p\)) one neighbouring swap at a
		time. Each swap of two 1-forms flips the sign; there are \(pq\) of them, so
		\(\alpha\wedge\beta=(-1)^{pq}\beta\wedge\alpha\).
	{/snippet}
</Figure>

<p>The cup product obeys the same law — not on cochains, but on cohomology classes.</p>

<Theorem label="Theorem (graded commutativity)">
	<p>For \(\alpha\in H^p(X;R)\) and \(\beta\in H^q(X;R)\), with \(R\) commutative,</p>
	\[ \alpha\smile\beta = (-1)^{pq}\,\beta\smile\alpha. \]
</Theorem>

<Proof label="Proof sketch">
	<p>
		For smooth manifolds and real coefficients this is the anticommutativity of forms, carried over by de
		Rham’s theorem. For simplicial cochains the front-and-back recipe is lopsided — it treats the first
		vertex and the last vertex differently — so \(\varphi\smile\psi\) and \(\pm\psi\smile\varphi\) are
		genuinely different cochains, as Figure 4.5.2 showed. The proof (Hatcher, Theorem 3.11) compares the
		recipe with the same recipe applied to the simplex with its vertices listed in reverse order, and
		builds an explicit “chain homotopy” between the two, which shows that the difference is always a
		coboundary when \(\varphi,\psi\) are cocycles. The sign \((-1)^{pq}\) is the sign of the
		reversal, counted carefully. We do not reproduce it here.
	</p>
</Proof>

<p>Two consequences are worth stating separately, because the rest of the chapter turns on them.</p>

<Corollary title="Squares of odd classes">
	<p>
		If \(\alpha\) has odd degree \(p\), then \(\alpha\smile\alpha = (-1)^{p^2}\alpha\smile\alpha =
		-\alpha\smile\alpha\), so \(2(\alpha\smile\alpha)=0\). With \(\Z\) or \(\R\) coefficients, whenever
		\(H^{2p}\) has no elements of order two (on every closed orientable surface, \(H^2\cong\Z\)), this
		forces \(\alpha\smile\alpha=0\).
	</p>
</Corollary>

<Warning title="Except mod 2">
	<p>
		With \(\Z/2\) coefficients, \(-1=+1\), and the equation \(\alpha\smile\alpha=-\alpha\smile\alpha\) says
		nothing at all. Graded commutativity no longer forbids a degree-1 class from having a nonzero square,
		and we will meet surfaces where squares survive.
	</p>
</Warning>

<p>
	Let us double-check the corollary on the torus with a general class. Every element of
	\(H^1(T^2;\Z)\) is \(m\alpha+n\beta\) for integers \(m,n\). Expanding with distributivity,
</p>
\[ (m\alpha+n\beta)\smile(m\alpha+n\beta) = m^2\,\alpha^2 + mn\,(\alpha\beta+\beta\alpha) + n^2\,\beta^2 = 0 + mn(\gamma-\gamma)+0 = 0. \]
<p>Every degree-1 class on the torus squares to zero, as promised.</p>

<h2 id="rings-tell-apart">Same groups, different rings</h2>

<p>
	Back to the puzzle from the start of the chapter. Switch Figure 4.5.1 to the product view and look at
	the wedge \(S^1\vee S^1\vee S^2\). Its two degree-1 classes \(\alpha\) and \(\beta\) can be represented by
	“gates”: \(\alpha\) is \(1\) on a single edge of the first circle and \(0\) elsewhere, \(\beta\) the same on
	the second circle. (A gate is a fence on a 1-dimensional piece: a single point you either pass or not.)
	Every triangle of the wedge lies in the sphere, and on the sphere’s edges both cochains are zero. So
	every product of degree-1 classes vanishes on every triangle:
</p>
\[ \alpha\smile\alpha = \alpha\smile\beta = \beta\smile\alpha = \beta\smile\beta = 0 \quad\text{in } H^2(S^1\vee S^1\vee S^2). \]

<Theorem label="Theorem">
	<p>The torus and the wedge \(S^1\vee S^1\vee S^2\) are not homotopy equivalent.</p>
</Theorem>

<Proof>
	<p>
		A homotopy equivalence would induce an isomorphism of cohomology rings, \(H^*(T^2)\cong
		H^*(S^1\vee S^1\vee S^2)\), sending degree-1 classes to degree-1 classes and products to products. In
		the torus there are degree-1 classes with a nonzero product, \(\alpha\smile\beta=\gamma\). Their images
		would be degree-1 classes of the wedge with a nonzero product — but every such product in the wedge is
		zero, and an isomorphism cannot send the nonzero class \(\gamma\) to \(0\).
	</p>
</Proof>

<p>
	The groups were identical; the multiplication was not. That is the whole point of the chapter, and it
	is worth exploring on more spaces. In the explorer below, every entry of every table is computed by
	the front-face/back-face recipe on a triangulation of the pictured polygon, from the fences drawn on
	it; choose an entry to see the fences involved and where they cross.
</p>

<Figure num="4.5.6" title="Multiplication tables" hint="Pick a space · tap an entry of the table">
	<CupTable />
	{#snippet caption()}
		Products of degree-1 classes for six spaces. Over \(\Z\), entries are multiples of the generator
		\(\gamma\) of \(H^2\), with signs; over \(\Z/2\) they are \(0\) or \(\gamma\). A diagonal entry is a
		square, shown with the fence and a pushed-off copy of it.
	{/snippet}
</Figure>

<p>
	The genus-two surface \(\Sigma_2\) (two handles) has four degree-1 classes, and its table consists of
	two copies of the torus table, one per handle: fences on different handles never meet. The same is true
	for \(\Sigma_g\), with \(g\) copies. So, exactly as for the torus, \(\Sigma_g\) and a wedge of \(2g\) circles
	and one sphere have the same groups, namely \(\Z,\ \Z^{2g},\ \Z\), but different rings, and they are not
	homotopy equivalent.
</p>

<h3 id="kunneth">Products of spaces: a glimpse of Künneth</h3>

<p>
	The torus is a product, \(T^2 = S^1\times S^1\), and its ring is built from the rings of the two
	circles. If \(p_1, p_2\colon X\times Y\to X, Y\) are the two projections, then for classes \(a\) on \(X\)
	and \(b\) on \(Y\) the <dfn>cross product</dfn> \(a\times b = p_1^*a\smile p_2^*b\) is a class on the
	product. The circle has \(H^*(S^1)\) with basis \(1, a\) and \(a\smile a=0\); the four cross products
	\(1\times 1,\ a\times 1,\ 1\times a,\ a\times a\) are precisely \(1, \alpha, \beta, \gamma\) on the torus.
</p>

<Theorem label="Theorem (Künneth, a glimpse)">
	<p>
		With coefficients in a field \(F\) (such as \(\Q\), \(\R\), \(\Z/2\)) and spaces built from finitely many
		cells, the cross products of basis elements form a basis of the cohomology of the product:
		\(H^*(X\times Y;F)\cong H^*(X;F)\otimes H^*(Y;F)\), and this is an isomorphism of rings.
	</p>
</Theorem>

<p>
	In words: the classes of \(X\times Y\) are all possible products of a class from \(X\) with a class from
	\(Y\), with degrees adding. The \(n\)-dimensional torus \(T^n=(S^1)^n\) therefore has the exterior algebra on
	\(n\) generators as its ring, and \(b_k(T^n)=\binom{n}{k}\): for \(T^3\), the Betti numbers are
	\(1,3,3,1\). The precise statement, and what changes with \(\Z\) coefficients, is in
	<Ref to="big-picture/homological-algebra" />.
</p>

<h2 id="mod-two">When a square survives</h2>

<p>
	Now for the surprise promised by the warning. Let us work with \(\Z/2\) coefficients (also written
	\(\mathbb F_2\)), where signs disappear and \(1+1=0\).
</p>

<h3 id="rp2">The projective plane</h3>

<p>
	The real <Term t="real-projective-plane">projective plane</Term> \(\RP^2\) is a square whose opposite sides
	are glued with a twist each way: the point \((x,0)\) on the bottom is glued to \((1-x,1)\) on the top, and
	\((0,y)\) on the left to \((1,1-y)\) on the right. In <Ref to="cohomology/cohomology-groups" /> we found
	\(H^k(\RP^2;\Z/2)\cong\Z/2\) for \(k=0,1,2\). Call the nonzero degree-1 class \(x\). What is
	\(x\smile x\)?
</p>

<p>
	Use the smallest model, Hatcher’s: cut the square along the diagonal from \((1,0)\) to \((0,1)\) into
	two triangles. The corners become two vertices — \(v\), made of \((0,0)\) and \((1,1)\), and \(w\), made of
	\((1,0)\) and \((0,1)\) — and there are three edges: \(a\) (the bottom, glued to the top), \(b\) (the left
	side, glued to the right) and \(c\) (the diagonal). The two triangles, with their vertices in order, are
</p>
\[ T_1 = [(0,0),(1,0),(0,1)], \qquad T_2 = [(1,1),(1,0),(0,1)]. \]
<p>
	The front face of \(T_1\) is the bottom edge \(a\) and its back face the diagonal \(c\); the front face of
	\(T_2\) is the right edge \(b\) and its back face is again \(c\).
</p>

<p>
	Mod 2, a 1-cochain \(\varphi\) is a cocycle when its values on the three edges of each triangle add to
	\(0\); both triangles have edges \(a,b,c\), so the condition is \(\varphi(a)+\varphi(b)+\varphi(c)=0\).
	The cochain \(\varphi\) with \(\varphi(a)=1,\ \varphi(b)=0,\ \varphi(c)=1\) satisfies it, and it is not a
	coboundary (the only nonzero coboundary is \(\delta\) of the function that is \(1\) at \(w\), which is
	\(1\) on \(a\) and \(b\) and \(0\) on \(c\)). So \(x=[\varphi]\). Now multiply:
</p>
\[ (\varphi\smile\varphi)(T_1) = \varphi(a)\,\varphi(c) = 1\cdot 1 = 1, \qquad (\varphi\smile\varphi)(T_2) = \varphi(b)\,\varphi(c) = 0\cdot 1 = 0. \]
<p>
	Mod 2 every triangle counts with coefficient \(1\) in the fundamental class \([\RP^2]=T_1+T_2\), so
	\(\ip{x\smile x}{[\RP^2]} = 1 + 0 = 1\neq 0\). <strong>The square of \(x\) is the nonzero class
	in \(H^2(\RP^2;\Z/2)\).</strong> (Try the other representative, \(1\) on \(b\) and \(c\): you get \(0+1=1\)
	again, as you must.)
</p>

<p>
	The fence picture explains why. A fence for \(x\) is a “line”: a curve running from a point of the
	boundary straight across to the opposite, glued point. To compute \(x\smile x\) we need a second copy of
	the fence pushed slightly off the first — and any two such lines cross exactly once, because their four
	end points on the boundary interleave. In projective geometry this is the famous rule that <em>any two
	lines in the projective plane meet in exactly one point</em>. Choose \(\RP^2\) in the explorer above to see
	it.
</p>

<Definition title="Truncated polynomial ring">
	<p>
		\(\Z/2[x]/(x^{n+1})\) denotes polynomials in \(x\) with coefficients in \(\Z/2\), where \(x^{n+1}\) and all
		higher powers are declared to be \(0\). Its elements are sums of \(1, x, x^2, \dots, x^n\).
	</p>
</Definition>

<p>
	Since \(\RP^2\) is two-dimensional there is no \(H^3\), so \(x^3=0\), and the ring is
	\(H^*(\RP^2;\Z/2) = \Z/2[x]/(x^3)\): the classes are \(1, x, x^2\), and the square of the degree-1 class is
	the degree-2 class.
</p>

<h3 id="klein">The Klein bottle versus the torus</h3>

<p>
	The <Term t="klein-bottle">Klein bottle</Term> \(K\) is the square glued straight top-to-bottom and with a
	flip left-to-right. Its mod-2 cohomology groups are \(\Z/2,\ (\Z/2)^2,\ \Z/2\) — exactly the same as the
	torus mod 2. Take \(\alpha\) to be a vertical fence (crossing the edge \(a\)) and \(\beta\) a fence that
	crosses the twisted edge \(b\). Over \(\Z/2\) the cup products, written as a table, are
</p>
\[ T^2:\ \begin{pmatrix} \alpha^2 & \alpha\beta \\ \beta\alpha & \beta^2 \end{pmatrix} = \begin{pmatrix} 0 & 1\\ 1 & 0\end{pmatrix}, \qquad K:\ \begin{pmatrix} \alpha^2 & \alpha\beta \\ \beta\alpha & \beta^2 \end{pmatrix} = \begin{pmatrix} 0 & 1\\ 1 & 1\end{pmatrix}. \]
<p>
	(Mod 2, \(\alpha\beta=\beta\alpha\), so the tables are symmetric.) On the torus every square vanishes; on the
	Klein bottle \(\beta\smile\beta\neq 0\). The figure shows why: the fence \(\beta\) runs through the twisted
	gluing, and when you try to slide a copy of it off itself, the copy comes back upside down on the other
	side and has to cross the original.
</p>

<Figure num="4.5.7" title="Pushing a fence off itself" hint="Choose the fence · drag the slider">
	<PushOff />
	{#snippet caption()}
		On the torus, every fence can be slid off itself, so every square is zero. On the Klein bottle the
		fence \(\beta\) passes through the flip: wherever the copy leaves on the right, it re-enters on the left
		at the mirrored height (the small circles), and it must cross \(\beta\) once. The tables underneath are
		the full mod-2 cup products, computed by front face × back face.
	{/snippet}
</Figure>

<p>
	Here is a way to see that the difference is real, not an artefact of the chosen basis. Mod 2,
	\((x+y)^2 = x^2 + xy + yx + y^2 = x^2 + y^2\) (since \(xy=yx\) and \(2xy=0\)), so the rule “square a
	degree-1 class” is additive. On the torus it sends every class to \(0\). On the Klein bottle it sends
	\(\beta\) and \(\alpha+\beta\) to the generator. No change of basis can turn one table into the other, so
	\(K\) and \(T^2\) are told apart even by \(\Z/2\) cohomology, where their groups agree.
</p>

<Remark>
	<p>
		The squaring map detects one-sidedness. A fence whose square is nonzero is one whose thin neighbourhood
		is a Möbius band rather than a ribbon — that is exactly why its push-off cannot escape. This is the
		first glimpse of <em>Wu’s formula</em>, \(x\smile x = w_1\smile x\) on a closed surface, where \(w_1\) is the
		class that measures orientability; we meet \(w_1\) in <Ref to="cohomology/characteristic-classes" />.
	</p>
</Remark>

<h3 id="projective-spaces">Projective spaces of every dimension</h3>

<p>
	The projective plane is the first of a family. The real projective space \(\RP^n\) is the set of lines
	through the origin in \(\R^{n+1}\), and the complex projective space \(\CP^n\) is the set of complex
	lines through the origin in \(\C^{n+1}\) — a space of real dimension \(2n\). Their cohomology rings are as
	simple as rings can be, and we state them without proof (Hatcher proves them as Theorem 3.19, in three different ways):
</p>
\[ H^*(\RP^n;\Z/2) = \Z/2[x]/(x^{n+1}),\ \ |x|=1, \qquad\qquad H^*(\CP^n;\Z) = \Z[x]/(x^{n+1}),\ \ |x|=2. \]
<p>
	Here \(|x|\) is the degree of \(x\). In both cases every power \(x, x^2, \dots, x^n\) is nonzero, and the top
	power \(x^n\) generates the top cohomology. The geometric reason is the one we saw in \(\RP^2\): \(x\) is
	the class of a “hyperplane”, a copy of \(\RP^{n-1}\) or \(\CP^{n-1}\) sitting inside, and \(x^k\)
	corresponds to the intersection of \(k\) hyperplanes in general position, which is a projective subspace
	of codimension \(k\). Intersecting \(n\) of them leaves a single point.
</p>

<p>
	This settles the second pair of look-alikes mentioned at the start. Both \(\CP^2\) and \(S^2\vee S^4\) have
	cohomology \(\Z\) in degrees \(0,2,4\) and nothing else. In \(\CP^2\), the square of the degree-2 generator
	is the degree-4 generator; in \(S^2\vee S^4\), the degree-2 class lives on the \(S^2\), where there is no room
	for a degree-4 class, so its square is \(0\). Different rings — so \(\CP^2\) and \(S^2\vee S^4\) are not
	homotopy equivalent, even though neither has any loops at all. The ring of \(\RP^n\) also has famous
	applications; one of them is a short proof of the Borsuk–Ulam theorem (every continuous map
	\(S^n\to\R^n\) sends some pair of opposite points to the same place).
</p>

<History>
	<p>
		Cohomology and its product were born together. At the first International Topological Conference in
		Moscow, on 4–10 September 1935, James Alexander gave a talk titled “On the ring of a complex and the
		combinatory theory of integration”, and Andrey Kolmogorov, in a talk on “Homology rings in closed
		sets”, presented the same circle of ideas independently. In Charles Weibel’s words: “The fourth great advance in 1935 was the discovery of
		cohomology theory and cup products, simultaneously and independently by Alexander and Kolmogoroff.”
		Those first formulas, Weibel adds, were “completely ad hoc, and also not exactly correct”; Eduard Čech
		and Hassler Whitney soon found the right ones. Whitney’s paper <em>On products in a complex</em>
		(1937–38) introduced the words <em>coboundary</em> and <em>cocycle</em>, the very Leibniz rule we
		proved above, and the symbols \(\smile\) and \(\frown\), “prophetically suggesting that ‘we might
		call \(\smile\) “cup” and \(\frown\) “cap”.’”
	</p>
</History>

<h2 id="intersections">What a cup product counts</h2>

<p>
	Look back over the examples. On the torus, \(\alpha\smile\beta\) was supported exactly where the two fences
	crossed, and the signed number of crossings was the answer — even when we bent \(\alpha\) so that it
	crossed \(\beta\) three times. On the wedge, the fences never met and the product was zero. On \(\RP^2\)
	and the Klein bottle, the squares were nonzero precisely when a fence could not be pushed off itself.
	These are all instances of a single principle.
</p>

<KeyIdea>
	<p>
		On a closed surface, draw a degree-1 class \(\alpha\) as a fence \(F_\alpha\) and \(\beta\) as a fence
		\(F_\beta\), in general position. Then
	</p>
	\[ \ip{\alpha\smile\beta}{[M]} = \text{the number of points where } F_\alpha \text{ crosses } F_\beta, \]
	<p>
		counted with signs over \(\Z\) (and simply counted, mod 2, over \(\Z/2\)). To square a class, cross its
		fence with a pushed-off copy of itself.
	</p>
</KeyIdea>

<p>
	Michael Hutchings, in his notes on the subject, states the general version as “cup product is Poincaré
	dual to intersection of submanifolds”, and adds: “This is arguably the most important thing to know about
	cup product.” In an \(n\)-dimensional manifold, a class of degree \(p\) can often be drawn as an
	\((n-p)\)-dimensional “wall” (a fence is the case \(n=2\), \(p=1\)); the product of a degree-\(p\) and a
	degree-\(q\) class is drawn by intersecting the walls, which leaves something of dimension
	\(n-p-q\). Making this precise — saying exactly which wall belongs to which class — is the subject of the
	next chapter, <Ref to="cohomology/poincare-duality" />.
</p>

<p>
	A word on the signs, since we have been careful to get them right. Our fence for \(\alpha\) runs upwards
	and counts crossings from left to right; the fence for \(\beta\) runs leftwards and counts crossings
	upwards. With the counterclockwise orientation of the torus, every crossing of the two fences in the
	figures counts \(+1\) when the second fence passes from the right of the first to its left. If you
	change any one of these conventions, some signs flip — which is why books disagree about signs, and why
	every serious calculation states its conventions first.
</p>

<Warning title="A picture, not a definition">
	<p>
		Fences are a superb way to <em>think</em> about cup products on surfaces, but they are not how the cup
		product is defined, and they do not always exist: on a space that is not a manifold (the wedge) the
		“fences” degenerate into gates on circles, and with \(\Z\) coefficients a fence needs a consistent
		crossing direction, which the twisted surfaces do not allow. The definition is the front-face/back-face
		recipe, which works for every space and every coefficient ring.
	</p>
</Warning>

<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Front and back">
	<p>
		On a triangle \([v_0,v_1,v_2]\), the 1-cochain \(\varphi\) takes the values \(3, -2, 1\) on the edges
		\([v_0,v_1],[v_1,v_2],[v_0,v_2]\), and \(\psi\) takes the values \(4, 5, -1\). Compute
		\((\varphi\smile\psi)(\sigma)\) and \((\psi\smile\varphi)(\sigma)\).
	</p>
	{#snippet solution()}
		<p>
			\((\varphi\smile\psi)(\sigma)=\varphi([v_0,v_1])\,\psi([v_1,v_2]) = 3\cdot 5 = 15\), while
			\((\psi\smile\varphi)(\sigma)=\psi([v_0,v_1])\,\varphi([v_1,v_2]) = 4\cdot(-2) = -8\). The long edge
			values \(1\) and \(-1\) play no role.
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Functions acting on edges">
	<p>
		Let \(f\) be the 0-cochain that is \(1\) at the vertex \(v\) and \(0\) at every other vertex, and let
		\(\varphi\) be any 1-cochain. Describe \(f\smile\varphi\) and \(\varphi\smile f\) in words. What are they
		when \(f\) is the constant function \(1\)?
	</p>
	{#snippet solution()}
		<p>
			\((f\smile\varphi)([u,w]) = f(u)\varphi([u,w])\): it keeps \(\varphi\) on the edges that <em>start</em> at
			\(v\) and is \(0\) on all other edges. Similarly \(\varphi\smile f\) keeps \(\varphi\) on the edges that
			<em>end</em> at \(v\). When \(f=1\), both keep everything: \(1\smile\varphi=\varphi=\varphi\smile 1\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="The Leibniz rule in low degree">
	<p>
		Let \(f\) be a 0-cochain and \(\varphi\) a 1-cochain. Check directly, on a triangle
		\([v_0,v_1,v_2]\), that \(\delta(f\smile\varphi) = \delta f\smile\varphi + f\smile\delta\varphi\).
	</p>
	{#snippet hint()}
		<p>Write \(f_i=f(v_i)\) and \(\varphi_{ij}=\varphi([v_i,v_j])\), and expand both sides.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			Left side: \((f\smile\varphi)\) is \(f_1\varphi_{12}\), \(f_0\varphi_{02}\), \(f_0\varphi_{01}\) on the three
			edges, so \(\delta(f\smile\varphi)(\sigma) = f_1\varphi_{12} - f_0\varphi_{02} + f_0\varphi_{01}\). Right
			side: \((\delta f\smile\varphi)(\sigma) = (\delta f)([v_0,v_1])\,\varphi([v_1,v_2]) = (f_1-f_0)\varphi_{12}\),
			and \((f\smile\delta\varphi)(\sigma) = f_0(\varphi_{12}-\varphi_{02}+\varphi_{01})\). Their sum is
			\(f_1\varphi_{12} - f_0\varphi_{12} + f_0\varphi_{12} - f_0\varphi_{02} + f_0\varphi_{01}\), which equals the
			left side.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Every product on the torus">
	<p>
		In \(H^*(T^2;\Z)\), compute \((m\alpha+n\beta)\smile(p\alpha+q\beta)\) for integers \(m,n,p,q\). For which
		pairs of classes is the product a generator of \(H^2\)?
	</p>
	{#snippet solution()}
		<p>
			By distributivity, the product is \(mp\,\alpha^2 + mq\,\alpha\beta + np\,\beta\alpha + nq\,\beta^2 =
			(mq - np)\,\gamma\), the determinant of \(\begin{pmatrix} m&n\\ p&q\end{pmatrix}\) times \(\gamma\). It
			generates \(H^2\cong\Z\) exactly when \(mq-np=\pm 1\), that is, when the two classes form a basis of
			\(H^1(T^2;\Z)\). In particular every square vanishes (take \(p=m\), \(q=n\)).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Rings tell them apart">
	<p>
		Write out a complete proof that \(\CP^2\) and \(S^2\vee S^4\) are not homotopy equivalent, assuming the
		ring of \(\CP^2\) and the fact that all of the cohomology of \(S^2\vee S^4\) in degrees \(2\) and \(4\) comes
		from the two spheres separately.
	</p>
	{#snippet solution()}
		<p>
			Both spaces have \(H^2\cong\Z\) and \(H^4\cong\Z\). In \(\CP^2\) the generator \(x\) of \(H^2\) satisfies:
			\(x^2\) generates \(H^4\). In \(S^2\vee S^4\), let \(r\colon S^2\vee S^4\to S^2\) crush the \(S^4\) to a
			point; a generator of \(H^2\) is \(y=r^*(u)\) for a generator \(u\) of \(H^2(S^2)\). Then
			\(y^2=r^*(u^2)=r^*(0)=0\), because \(H^4(S^2)=0\). A homotopy equivalence would give a ring
			isomorphism \(f^*\) with \(f^*(x)=\pm y\) (an isomorphism \(\Z\to\Z\) sends a generator to \(\pm\) a
			generator), and then \(f^*(x^2) = f^*(x)^2 = y^2 = 0\), contradicting that \(f^*\) is injective and
			\(x^2\neq 0\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Squares mod 2 on the projective plane">
	<p>
		Using the two-triangle model of \(\RP^2\) from the text, list all four mod-2 cocycles. Which two represent
		\(x\)? Compute \(\varphi\smile\varphi\) on \([\RP^2]=T_1+T_2\) for each of them.
	</p>
	{#snippet solution()}
		<p>
			The cocycle condition is \(\varphi(a)+\varphi(b)+\varphi(c)=0\), with solutions (values on \(a,b,c\))
			\((0,0,0)\), \((1,1,0)\), \((1,0,1)\), \((0,1,1)\). The first two are coboundaries (of the zero function
			and of the function that is \(1\) at \(w\)), so \((1,0,1)\) and \((0,1,1)\) represent \(x\). For
			\((1,0,1)\): \(T_1\) gives \(\varphi(a)\varphi(c)=1\), \(T_2\) gives \(\varphi(b)\varphi(c)=0\), total \(1\).
			For \((0,1,1)\): \(T_1\) gives \(0\cdot 1=0\), \(T_2\) gives \(1\cdot 1=1\), total \(1\). Both say \(x^2\neq 0\);
			and the coboundary \((1,1,0)\) gives \(1\cdot 0+1\cdot 0=0\), as a coboundary must.
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="The Klein bottle by hand">
	<p>
		Use Hatcher’s model of the Klein bottle: a square with one vertex, edges \(a\) (bottom and top, glued
		straight), \(b\) (left and right, glued with a flip) and the diagonal \(c\), cut into two triangles whose
		ordered vertices give \(L\): front face \(c\), back face \(b\), long edge \(a\); and \(U\): front face \(b\),
		back face \(a\), long edge \(c\). Mod 2, the cocycle condition is \(x+y+z=0\) for values \((x,y,z)\) on
		\((a,b,c)\), and there are no nonzero coboundaries (there is only one vertex). With
		\(\alpha=(1,0,1)\) and \(\beta=(0,1,1)\), compute the full mod-2 cup product table on \([K]=L+U\).
	</p>
	{#snippet solution()}
		<p>
			Products are front \(\times\) back: on \(L\) it is (value on \(c\)) \(\times\) (value on \(b\)); on \(U\) it is
			(value on \(b\)) \(\times\) (value on \(a\)).
		</p>
		<ul>
			<li>\(\alpha\alpha\): \(L\): \(1\cdot 0=0\); \(U\): \(0\cdot 1=0\). Total \(0\).</li>
			<li>\(\alpha\beta\): \(L\): \(1\cdot 1=1\); \(U\): \(0\cdot 0=0\). Total \(1\).</li>
			<li>\(\beta\alpha\): \(L\): \(1\cdot 0=0\); \(U\): \(1\cdot 1=1\). Total \(1\).</li>
			<li>\(\beta\beta\): \(L\): \(1\cdot 1=1\); \(U\): \(1\cdot 0=0\). Total \(1\).</li>
		</ul>
		<p>
			So the table is \(\begin{pmatrix}0&1\\1&1\end{pmatrix}\), with \(\beta^2\neq 0\), matching the explorer. The
			class \(\beta\) is the one that measures the twisted edge \(b\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="The three-dimensional torus">
	<p>
		Use the Künneth theorem to find the Betti numbers of \(T^3=S^1\times S^1\times S^1\) and a basis of its
		cohomology. Which products of degree-1 classes are nonzero? Check that \(\chi(T^3)=0\).
	</p>
	{#snippet solution()}
		<p>
			Each circle contributes a class \(a_i\) of degree 1 with \(a_i^2=0\). The products give the basis
			\(1\); \(\alpha_1,\alpha_2,\alpha_3\); \(\alpha_1\alpha_2,\ \alpha_1\alpha_3,\ \alpha_2\alpha_3\);
			\(\alpha_1\alpha_2\alpha_3\), so the Betti numbers are \(1,3,3,1\) and \(\chi = 1-3+3-1 = 0\). The products
			\(\alpha_i\alpha_j\) with \(i\neq j\) are nonzero (and \(\alpha_j\alpha_i = -\alpha_i\alpha_j\)); all squares
			vanish; and the product of all three generates \(H^3\).
		</p>
	{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>
			Measurements can be multiplied, places cannot. The cup product of a \(p\)-cochain and a \(q\)-cochain is
			the \((p+q)\)-cochain \((\varphi\smile\psi)([v_0..v_{p+q}])=\varphi([v_0..v_p])\,\psi([v_p..v_{p+q}])\):
			front face times back face.
		</li>
		<li>
			The Leibniz rule \(\delta(\varphi\smile\psi)=\delta\varphi\smile\psi+(-1)^p\varphi\smile\delta\psi\) makes
			cocycles multiply to cocycles and coboundaries absorb, so the product passes to cohomology and makes
			\(H^*(X;R)\) a graded ring with unit — an invariant of homotopy type.
		</li>
		<li>
			For smooth manifolds the cup product is the wedge product of closed forms. On the torus,
			\(\alpha^2=\beta^2=0\) and \(\alpha\beta=-\beta\alpha=\gamma\): the exterior algebra, exactly like \(dx,dy\).
		</li>
		<li>
			Graded commutativity: \(\alpha\smile\beta=(-1)^{pq}\beta\smile\alpha\) for classes. Odd classes square to
			zero over \(\Z\) when there is no 2-torsion — but not over \(\Z/2\).
		</li>
		<li>
			Rings separate spaces that groups cannot: \(T^2\not\simeq S^1\vee S^1\vee S^2\), \(\CP^2\not\simeq
			S^2\vee S^4\), and mod 2 the Klein bottle’s table \(\left(\begin{smallmatrix}0&1\\1&1\end{smallmatrix}\right)\)
			differs from the torus’s \(\left(\begin{smallmatrix}0&1\\1&0\end{smallmatrix}\right)\).
		</li>
		<li>
			\(H^*(\RP^n;\Z/2)=\Z/2[x]/(x^{n+1})\) and \(H^*(\CP^n;\Z)=\Z[x]/(x^{n+1})\); on \(\RP^2\), \(x^2\neq0\).
		</li>
		<li>
			Geometrically, the cup product of two classes on a surface counts the crossings of their fences; a square
			counts the crossings of a fence with its push-off. Making this precise is Poincaré duality.
		</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading items={reading} />
