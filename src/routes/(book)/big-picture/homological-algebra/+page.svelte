<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	import Figure from '$lib/components/prose/Figure.svelte';
	import Definition from '$lib/components/prose/Definition.svelte';
	import Theorem from '$lib/components/prose/Theorem.svelte';
	import Proposition from '$lib/components/prose/Proposition.svelte';
	import Lemma from '$lib/components/prose/Lemma.svelte';
	import Proof from '$lib/components/prose/Proof.svelte';
	import Example from '$lib/components/prose/Example.svelte';
	import Intuition from '$lib/components/prose/Intuition.svelte';
	import KeyIdea from '$lib/components/prose/KeyIdea.svelte';
	import Warning from '$lib/components/prose/Warning.svelte';
	import Remark from '$lib/components/prose/Remark.svelte';
	import History from '$lib/components/prose/History.svelte';
	import Question from '$lib/components/prose/Question.svelte';
	import Exercise from '$lib/components/prose/Exercise.svelte';
	import Recap from '$lib/components/prose/Recap.svelte';
	import Term from '$lib/components/prose/Term.svelte';
	import Ref from '$lib/components/prose/Ref.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import Cite from '$lib/components/prose/Cite.svelte';
	import ChainHomotopyLadder from '$lib/figures/big-picture/homological-algebra/ChainHomotopyLadder.svelte';
	import SnakeLemma from '$lib/figures/big-picture/homological-algebra/SnakeLemma.svelte';
	import TorExtCalculator from '$lib/figures/big-picture/homological-algebra/TorExtCalculator.svelte';
	import UCTExplorer from '$lib/figures/big-picture/homological-algebra/UCTExplorer.svelte';
	import KunnethGrid from '$lib/figures/big-picture/homological-algebra/KunnethGrid.svelte';
	import SpectralPages from '$lib/figures/big-picture/homological-algebra/SpectralPages.svelte';
	import AxiomsProof from '$lib/figures/big-picture/homological-algebra/AxiomsProof.svelte';

	const reading = [
		{
			title: 'An Introduction to Homological Algebra',
			author: 'Charles A. Weibel',
			url: 'https://doi.org/10.1017/CBO9781139644136',
			note: 'The standard graduate text (Cambridge University Press, 1994). Chapters 1–3 cover chain complexes, the snake lemma (Lemma 1.3.2), resolutions, Tor and Ext; Chapter 5 is a thorough treatment of spectral sequences. Read it after this chapter, with Hatcher open beside it for the topology.',
			kind: 'book'
		},
		{
			title: 'Algebraic Topology, §2.3, §3.1, §3.A–3.B',
			author: 'Allen Hatcher',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/AT.pdf',
			note: 'The axioms for homology (§2.3), the universal coefficient theorem for cohomology (§3.1), and the versions for homology and for products (§3.A, §3.B), with full proofs. The natural next step from this chapter.',
			kind: 'book',
			free: true
		},
		{
			title: 'You Could Have Invented Spectral Sequences',
			author: 'Timothy Y. Chow',
			url: 'https://www.ams.org/notices/200601/fea-chow.pdf',
			note: 'Five pages in the Notices of the AMS (2006) that derive the spectral sequence of a filtered complex from scratch, the way you might have found it yourself. The best first reading after Figure 5.2.6.',
			kind: 'paper',
			free: true
		},
		{
			title: 'Spectral Sequences: Friend or Foe?',
			author: 'Ravi Vakil',
			url: 'https://math.stanford.edu/~vakil/0708-216/216ss.pdf',
			note: 'Twelve short, funny, practical pages: the spectral sequence of a double complex, used to re-prove facts you already know (the snake lemma among them). The source of this chapter’s joke about spectres.',
			kind: 'notes',
			free: true
		},
		{
			title: 'Spectral Sequences in Algebraic Topology (Chapter 5)',
			author: 'Allen Hatcher',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/SSpage.html',
			note: 'The Serre spectral sequence and its applications, including homotopy groups of spheres, in Hatcher’s unhurried style. Unfinished, free, and best read after his main book.',
			kind: 'notes',
			free: true
		},
		{
			title: 'A User’s Guide to Spectral Sequences',
			author: 'John McCleary',
			url: 'https://doi.org/10.1017/CBO9780511626289',
			note: 'The encyclopedic reference (2nd edition, Cambridge University Press, 2001), with history and many worked applications. For looking things up rather than reading straight through.',
			kind: 'book'
		},
		{
			title: 'Differential Forms in Algebraic Topology',
			author: 'Raoul Bott and Loring W. Tu',
			url: 'https://doi.org/10.1007/978-1-4757-3951-0',
			note: 'Springer GTM 82 (1982). Builds spectral sequences from the Čech–de Rham double complex, with pictures; the natural bridge from this book’s Part IV.',
			kind: 'book'
		},
		{
			title: 'History of Homological Algebra',
			author: 'Charles A. Weibel',
			url: 'https://metaphor.ethz.ch/x/2025/hs/401-3132-00L/ex/historyweibel.pdf',
			note: 'Where Tor, Ext, the axioms, abelian categories and spectral sequences came from, with exact dates and the people involved (in I. M. James, ed., History of Topology, 1999).',
			kind: 'paper',
			free: true
		},
		{
			title: 'Leray in Oflag XVIIA: The Origins of Sheaf Theory, Sheaf Cohomology, and Spectral Sequences',
			author: 'Haynes Miller',
			url: 'https://math.mit.edu/~hrm/papers/ss.pdf',
			note: 'How a prisoner-of-war camp produced two of the tools in this chapter: a historian’s account with the mathematics explained (Gazette des Mathématiciens, 2000).',
			kind: 'paper',
			free: true
		},
		{
			title: 'Foundations of Algebraic Topology',
			author: 'Samuel Eilenberg and Norman Steenrod',
			url: 'https://doi.org/10.1515/9781400877492',
			note: 'Princeton University Press, 1952: the book that axiomatised homology, following the authors’ 1945 announcement. Historically important; Hatcher is easier to learn from.',
			kind: 'book'
		}
	] as const;
</script>

<Epigraph author="Alexander Grothendieck" source="Récoltes et Semailles, pp. 552–3, translated by Colin McLarty"
	>The unknown thing to be known appeared to me as some stretch of earth or hard marl, resisting penetration… the sea advances
	insensibly in silence, nothing seems to happen, nothing moves, the water is so far off you hardly hear it… yet it finally surrounds
	the resistant substance.</Epigraph
>

<p class="lead">
	Homology began as a way to count holes. Along the way it produced an algebraic machine — chain complexes, kernels modulo images,
	exact sequences — that turned out to be useful far beyond topology. This chapter takes that machine out of its case, cleans it, and
	looks at it on its own: what it does, why it works, and the four or five big theorems it makes almost automatic.
</p>

<p>
	You have already met many of the parts. <Term t="chain-complex">Chain complexes</Term> and <Term t="chain-map">chain maps</Term> came
	in <Ref to="homology/chains" /> and <Ref
		to="homology/invariance"
	/>; <Term t="exact-sequence">exact sequences</Term> and the <Term t="connecting-homomorphism">connecting map</Term> in <Ref
		to="homology/exact-sequences"
	/>; the universal coefficient theorem for
	cohomology, with its mysterious \(\Ext\), in <Ref to="cohomology/cohomology-groups" />. Now, with the language of <Ref
		to="big-picture/categories"
	/> in hand, we can see how the pieces fit, and meet the two functors, \(\Tor\) and \(\Ext\), that measure what is lost when you change
	coefficients — plus spectral sequences, the great computing engine, and the five axioms that say what “a homology theory” is.
</p>

<Ahead>
	<p>
		This chapter explains rules that earlier chapters could only observe. Why does \(\RP^2\) acquire an extra \(H_2\) when you work
		mod 2 (<Ref to="homology/computing" />)? Why does torsion in homology show up one degree higher in cohomology (<Ref
			to="cohomology/cohomology-groups"
		/>)? Why are singular, simplicial and cellular homology all the same? And it sets up <Ref to="big-picture/horizons" />, where
		spectral sequences compute homotopy groups and where dropping one axiom opens the door to K-theory and cobordism.
	</p>
</Ahead>

<h2 id="chain-complexes">Chain complexes, as a category</h2>

<p>Let us restate the definitions from Part III in the abstract, without any space in sight.</p>

<Definition id="def-complex" title="Chain complex, chain map">
	<p>
		A <dfn>chain complex</dfn> \(C\) is a sequence of abelian groups and homomorphisms
		\[ \cdots \xrightarrow{\;\partial_{n+2}\;} C_{n+1} \xrightarrow{\;\partial_{n+1}\;} C_n \xrightarrow{\;\partial_n\;} C_{n-1} \xrightarrow{\;\partial_{n-1}\;}\cdots \]
		such that \(\partial_n\circ\partial_{n+1} = 0\) for every \(n\) — “a boundary has no boundary”. Its <dfn>homology</dfn> is
		\(H_n(C) = \ker\partial_n/\im\partial_{n+1}\). A <dfn>chain map</dfn> \(f\colon C\to D\) is a family of homomorphisms \(f_n\colon
		C_n\to D_n\) with \(\partial\circ f_n = f_{n-1}\circ\partial\) for all \(n\): every square in the ladder between the two complexes
		commutes.
	</p>
</Definition>

<p>
	Chain complexes and chain maps form a category, \(\Ch\) (composition is done degree by degree; the identity is the identity in each
	degree). And homology is a functor on it, \(H_n\colon\Ch\to\Ab\): a chain map sends cycles to cycles (\(\partial f z = f\partial z
	= 0\)) and boundaries to boundaries (\(f\partial c = \partial f c\)), so it induces \(f_*[z] = [f z]\), and \((g\circ f)_* = g_*\circ
	f_*\). The homology of a simplicial complex was the composite of two functors: first chains, then homology.
</p>

<p>
	Here is the sentence that organises this entire chapter. A complex is called <dfn>exact</dfn> at \(C_n\) if \(\im\partial_{n+1} =
	\ker\partial_n\) — exactly the condition met in <Ref to="foundations/abelian-groups" />. In a chain complex we always have
	\(\im\partial_{n+1}\subseteq\ker\partial_n\), and the homology \(H_n(C)\) is the quotient of the second by the first. So:
</p>

<KeyIdea>
	<p>
		<strong>Homology measures the failure of exactness.</strong> A complex is exact at \(C_n\) precisely when \(H_n(C) = 0\); the
		bigger \(H_n(C)\), the further it is from exact. Every construction in this chapter — Tor, Ext, spectral sequences — is a way of
		measuring some failure of exactness by taking homology of a well-chosen complex.
	</p>
</KeyIdea>

<h3>Chain homotopy</h3>

<p>
	In <Ref to="homology/invariance" /> we proved that <Term t="homotopy-invariance">homotopic maps induce the same map on homology</Term>.
	The algebraic heart of that proof
	is worth isolating, because it will reappear below.
</p>

<Definition id="def-chain-homotopy" title="Chain homotopy">
	<p>
		Two chain maps \(f, g\colon C\to D\) are <dfn>chain homotopic</dfn> if there are homomorphisms \(s_n\colon C_n\to D_{n+1}\), going
		<em>up</em> one degree, with
		\[ f_n - g_n = \partial_{n+1}\circ s_n + s_{n-1}\circ\partial_n \quad\text{for all } n. \]
		The family \(s\) is a <dfn>chain homotopy</dfn>.
	</p>
</Definition>

<Figure num="5.2.1" title="A chain homotopy">
	<ChainHomotopyLadder />
	{#snippet caption()}
		Two chain maps \(f, g\) (vertical) between the rows \(C\) and \(D\), and the diagonal maps \(s\) that raise degree by one. For
		spaces, \(s\) is the “prism” swept out by a homotopy from <Ref to="homology/invariance" />: the boundary of the prism over a chain
		is the difference of the two images, plus the prism over the chain’s boundary.
	{/snippet}
</Figure>

<Proposition id="prop-chain-homotopy" title="Chain homotopic maps agree on homology">
	<p>If \(f\) and \(g\) are chain homotopic, then \(f_* = g_*\colon H_n(C)\to H_n(D)\) for every \(n\).</p>
</Proposition>
<Proof>
	<p>
		Take a cycle \(z\in C_n\), so \(\partial z = 0\). Then \(f(z) - g(z) = \partial s(z) + s(\partial z) = \partial\big(s(z)\big) + 0\),
		which is a boundary. So \(f(z)\) and \(g(z)\) differ by a boundary and define the same homology class.
	</p>
</Proof>

<p>
	Geometry enters only once: the homotopy between two maps of spaces gives a prism, and the prism gives \(s\). After that, everything is
	algebra. This division of labour — a geometric input, then an algebraic machine — is the theme of the chapter.
</p>

<h2 id="snake-lemma">The snake lemma and long exact sequences</h2>

<p>
	The single most useful tool of homological algebra is a lemma about one commutative diagram. It manufactures a map out of nothing,
	and that map is the connecting homomorphism you used to build every long exact sequence in <Ref to="homology/exact-sequences" />.
</p>

<Lemma id="lem-snake" label="Lemma (the snake lemma)">
	<p>Suppose that in the commutative diagram of abelian groups</p>
	\[ \begin{array}{ccccccccc} & & A & \xrightarrow{\;i\;} & B & \xrightarrow{\;p\;} & C & \to & 0 \\ & & {\scriptstyle a}\big\downarrow & & \big\downarrow{\scriptstyle b} & & \big\downarrow{\scriptstyle c} & & \\ 0 & \to & A' & \xrightarrow[\;i'\;]{} & B' & \xrightarrow[\;p'\;]{} & C' & & \end{array} \]
	<p>both rows are exact. Then there is a homomorphism \(\delta\colon\ker c\to\coker a\), the <dfn>connecting homomorphism</dfn>, making the six-term sequence</p>
	\[ \ker a\to\ker b\to\ker c\xrightarrow{\;\delta\;}\coker a\to\coker b\to\coker c \]
	<p>exact. (The other four maps are the ones induced by \(i, p, i', p'\).)</p>
</Lemma>

<p>
	Before the proof, read the picture. The kernels of the three vertical maps sit in a row above the diagram, the cokernels in a row
	below. The connecting map \(\delta\) joins the right end of the top row to the left end of the bottom row; drawn in, it winds through
	the diagram like a snake, which is where the name comes from. The figure follows one element along the snake, in a concrete example
	where every group is \(\Z\) or \(\Z/m\) and you can check every step with arithmetic.
</p>

<Figure num="5.2.2" title="Chasing the snake" hint="Step through with ‹ › · change m, n and the starting element">
	<SnakeLemma />
	{#snippet caption()}
		The rows are the short exact sequence \(0\to\Z\xrightarrow{\times m}\Z\to\Z/m\to 0\) twice, and every vertical map multiplies by
		\(n\). Start at an element \(x\) of \(\ker c\) — an \(x\in\Z/m\) with \(nx\equiv 0\) — then lift it to \(B\), push it down with
		\(b\), pull it back to \(A'\) and read off its class in \(\coker a = \Z/n\). The gold trail is the diagram chase; the gold snake is
		the map \(\delta\) it defines. Step 7 shows that a different choice of lift gives the same answer.
	{/snippet}
</Figure>

<Proof>
	<p>
		<em>Defining \(\delta\).</em> Let \(x\in\ker c\). Since \(p\) is onto, choose \(y\in B\) with \(p(y) = x\). The element \(b(y)\in
		B'\) satisfies \(p'(b(y)) = c(p(y)) = c(x) = 0\), because the right square commutes. By exactness of the bottom row at \(B'\), \(b(y)
		= i'(z)\) for some \(z\in A'\), unique because \(i'\) is injective. Set \(\delta(x) = [z]\), the class of \(z\) in \(\coker a =
		A'/\im a\).
	</p>
	<p>
		<em>It does not depend on the choice.</em> Another lift \(y'\) of \(x\) has \(p(y'-y) = 0\), so \(y' - y = i(w)\) for some \(w\in
		A\) (exactness of the top row). Then \(b(y') - b(y) = b(i(w)) = i'(a(w))\), so the new \(z\) differs from the old one by \(a(w)\in\im
		a\) — the same class in \(\coker a\). A similar check shows \(\delta\) is a homomorphism.
	</p>
	<p>
		<em>Exactness.</em> Each of the four exactness claims is a short chase of the same kind; for instance, if \(x = p(y)\) with \(y\in\ker
		b\), we may use that \(y\) as the lift, so \(b(y) = 0\) gives \(z = 0\) and \(\delta(x) = 0\). The two exactness claims next to
		\(\delta\) are Exercise 7, and the other two (at \(\ker b\) and \(\coker b\)) are shorter chases of the same kind — the best
		possible practice in diagram chasing. Weibel’s text has the whole proof <Cite k="weibel1994" loc="Lemma 1.3.2" />.
	</p>
</Proof>

<History title="A lemma with a screen credit">
	<p>
		The snake lemma has an unusual distinction: it has been proved in a feature film. <em>It’s My Turn</em> (1980) opens
		with Jill Clayburgh, as a Chicago mathematics professor, chasing exactly this diagram on a blackboard: “Let me just show you how to
		construct the map … which is the fun of the lemma anyhow.” A student heckles that the lift is “not unique”, she answers that it
		is unique “up to an element in the image of \(f\)” — the very check in the second paragraph of the proof above — and his verdict
		at the end is one every student of the subject has felt: “This stuff is just garbage. That’s another diagram chase.” <Cite
			k="its-my-turn1980"
		/>
	</p>
</History>

<Intuition title="What δ measures">
	<p>
		An element of \(\ker c\) is something that is invisible after the right-hand vertical map. Lifting it back into the middle, it need
		not stay invisible: \(b\) may send it to something nonzero. Whatever is left over is forced into the left of the bottom row, and its
		class in \(\coker a\) is the “leftover” that could not be explained by the left-hand map. In our example, \(x = 2\in\Z/4\) is killed
		by \(\times 6\), but its lift \(2\in\Z\) becomes \(12 = 4\cdot 3\), and the 3 survives modulo 6.
	</p>
</Intuition>

<h3>From short exact sequences of complexes to long ones</h3>

<p>
	A <dfn>short exact sequence of chain complexes</dfn> \(0\to A\xrightarrow{i}B\xrightarrow{p}C\to 0\) is a pair of chain maps that is
	short exact in every degree: \(0\to A_n\to B_n\to C_n\to 0\) exact for each \(n\). You met two in <Ref to="homology/exact-sequences" />:
	the chains of a subspace, of the whole space, and of the pair; and the <Term t="mayer-vietoris-sequence">Mayer–Vietoris sequence</Term>
	of chains of \(U\cap V\), of \(U\) and
	\(V\), and of \(U\cup V\).
</p>

<Theorem id="thm-les" label="Theorem (long exact sequence)">
	<p>A short exact sequence of chain complexes \(0\to A\to B\to C\to 0\) gives a long exact sequence in homology</p>
	\[ \cdots\to H_n(A)\xrightarrow{\;i_*\;}H_n(B)\xrightarrow{\;p_*\;}H_n(C)\xrightarrow{\;\partial\;}H_{n-1}(A)\xrightarrow{\;i_*\;}H_{n-1}(B)\to\cdots \]
	<p>and a map of short exact sequences gives a commuting ladder between the long ones (the sequence is natural).</p>
</Theorem>

<p>
	The connecting map \(\partial\) is a snake. Take a class \([c]\in H_n(C)\), lift the cycle \(c\) to \(b\in B_n\), take its boundary
	\(\partial b\in B_{n-1}\); it maps to \(\partial c = 0\) in \(C_{n-1}\), so it comes from a unique \(a\in A_{n-1}\), which turns out to
	be a cycle. Then \(\partial[c] = [a]\). Up, across, down, across: the same zig-zag as in Figure 5.2.2. (In fact the theorem follows by
	applying the snake lemma to the diagram whose rows are \(A_n/\im\partial\to B_n/\im\partial\to C_n/\im\partial\to 0\) and \(0\to
	\ker\partial_{n-1}^A\to\ker\partial_{n-1}^B\to\ker\partial_{n-1}^C\), with the vertical maps induced by \(\partial\): their kernels
	are \(H_n\) and their cokernels are \(H_{n-1}\).) Hatcher proves the theorem by exactly this zig-zag <Cite
		k="hatcher2002"
		loc="Thm 2.16"
	/>.
</p>

<Remark title="A machine that runs in any abelian category">
	<p>
		Nothing in the snake lemma used anything special about abelian groups except kernels, cokernels and exactness. So it holds in any
		abelian category (<Ref to="big-picture/categories" hash="abelian-categories" />): vector spaces, modules, sheaves. One chase, proved
		once, gives long exact sequences for cohomology, for sheaf cohomology, for group cohomology — everywhere at once. This is the “rising
		sea” of the epigraph. Grothendieck wanted a hard problem to be “submerged and dissolved by some more or less vast theory, going
		well beyond the results originally to be established” <Cite k="mclarty2007" />, and the abelian-category snake lemma is a small
		example of the method.
	</p>
</Remark>

<h2 id="hom-and-tensor">Hom and tensor: two ways to combine groups</h2>

<p>
	Coefficients have appeared in this book in two different ways. <em>Chains</em> with coefficients in \(G\) were formal sums of
	simplices with coefficients from \(G\) (<Ref to="homology/computing" />). <em>Cochains</em> with values in \(G\) were functions from
	chains to \(G\) (<Ref to="cohomology/cohomology-groups" />). Each is a way of combining two abelian groups into a third, and each has
	a name.
</p>

<h3>Hom</h3>

<p>
	For abelian groups \(A\) and \(G\), the set \(\Hom(A,G)\) of all homomorphisms \(A\to G\) is itself an abelian group: add
	homomorphisms pointwise, \((f+g)(a) = f(a)+g(a)\). Computing it is a matter of asking where the generators can go.
</p>

<ul>
	<li>
		\(\Hom(\Z, G)\cong G\). A homomorphism out of \(\Z\) is decided by where it sends \(1\), and \(1\) may go anywhere: \(f\mapsto
		f(1)\) is the isomorphism. (This is the universal property of the free group on one generator.)
	</li>
	<li>
		\(\Hom(\Z/n,\Z) = 0\). If \(f(1) = x\) then \(nx = f(n\cdot 1) = f(0) = 0\) in \(\Z\), so \(x = 0\). An element of finite order
		has nowhere to go in a group without torsion.
	</li>
	<li>
		\(\Hom(\Z/n,\Z/m)\cong\Z/\gcd(m,n)\). Now \(f(1) = x\) only needs \(nx\equiv 0\pmod m\), and there are exactly \(\gcd(m,n)\) such
		\(x\) in \(\Z/m\). For instance \(\Hom(\Z/6,\Z/4)\cong\Z/2\): \(1\) can go to \(0\) or to \(2\).
	</li>
	<li>
		\(\Hom(A\oplus A', G)\cong\Hom(A,G)\oplus\Hom(A',G)\): a map out of a direct sum is a pair of maps — the coproduct property from
		<Ref to="big-picture/categories" hash="universal-properties" />.
	</li>
</ul>

<p>
	As a functor of its first argument, \(\Hom(-,G)\) is contravariant (<Ref to="big-picture/categories" hash="contravariance" />): a
	homomorphism \(f\colon A\to B\) gives \(f^*\colon\Hom(B,G)\to\Hom(A,G)\), \(\varphi\mapsto\varphi\circ f\). Applied to chains, it
	produces cochains: \(C^n(X;G) = \Hom(C_n(X),G)\), and the coboundary is \(\delta = \partial^*\).
</p>

<h3 id="tensor">Tensor product</h3>

<p>
	The other combination is less familiar. We want a group whose elements are “formal products” \(a\otimes g\) of an element of \(A\)
	with an element of \(G\), obeying the distributive laws and nothing else.
</p>

<Definition id="def-tensor" title="Tensor product">
	<p>
		The <dfn>tensor product</dfn> \(A\otimes G\) is the abelian group generated by symbols \(a\otimes g\) (\(a\in A\), \(g\in G\))
		subject to the relations
		\[ (a + a')\otimes g = a\otimes g + a'\otimes g, \qquad a\otimes(g+g') = a\otimes g + a\otimes g'. \]
	</p>
</Definition>

<p>
	From the relations: \(0\otimes g = 0\) (apply the first with \(a = a' = 0\)), and \((na)\otimes g = n(a\otimes g) = a\otimes(ng)\) for
	every integer \(n\) — integers can be moved freely across the \(\otimes\) sign. The key property is universal (<Ref
		to="big-picture/categories"
		hash="universal-properties"
	/> again): a homomorphism \(A\otimes G\to H\) is the same thing as a function \(A\times G\to H\) that is additive in each variable
	separately (bilinear). Now the examples, which have some surprises.
</p>

<ul>
	<li>\(\Z\otimes G\cong G\), via \(n\otimes g\mapsto ng\). Tensoring with \(\Z\) changes nothing.</li>
	<li>
		\(\Z/m\otimes\Z/n\cong\Z/\gcd(m,n)\). Every \(a\otimes b\) equals \(ab\,(1\otimes 1)\), so the group is generated by \(1\otimes
		1\). Its order divides \(m\), since \(m(1\otimes 1) = m\otimes 1 = 0\otimes 1 = 0\), and likewise divides \(n\), so it divides
		\(\gcd(m,n)\). The bilinear map \((a,b)\mapsto ab \bmod \gcd(m,n)\) shows the order is exactly \(\gcd(m,n)\).
	</li>
	<li>
		\(\Z/2\otimes\Z/3 = 0\). Watch it happen: \(1\otimes 1 = 3(1\otimes 1) - 2(1\otimes 1) = (1\otimes 3) - (2\otimes 1) = (1\otimes 0)
		- (0\otimes 1) = 0\). Two nonzero groups whose tensor product is zero.
	</li>
	<li>
		\(\Q\otimes\Z/n = 0\): \(q\otimes x = \tfrac qn n\otimes x = \tfrac qn\otimes nx = \tfrac qn\otimes 0 = 0\). Fractions let you divide
		by \(n\), and \(n\) kills everything in \(\Z/n\).
	</li>
</ul>

<Intuition title="Tensoring changes the coefficients">
	<p>
		Two rules of thumb cover most of what you will meet. <strong>\(A\otimes\Z/n\cong A/nA\)</strong>: tensoring with \(\Z/n\) “reduces
		everything mod \(n\)”, so \(\Z\otimes\Z/2 = \Z/2\) and \(\Z/3\otimes\Z/2 = 0\). <strong>\(A\otimes\Q\cong\Q^{\rank A}\)</strong>
		for finitely generated \(A\): tensoring with \(\Q\) “allows fractions and forgets torsion”. And chains with coefficients are exactly a tensor product: \(C_n(X;G)
		= C_n(X)\otimes G\), since \(C_n(X)\) is a direct sum of copies of \(\Z\), one per simplex, and each copy becomes a copy of \(G\).
	</p>
</Intuition>

<h3 id="exactness">Exactness, and how it fails</h3>

<p>
	Here is the problem that the rest of the chapter solves. Take a short exact sequence of abelian groups \(0\to A\xrightarrow{f}
	B\xrightarrow{g}C\to 0\) and apply one of our two operations. Is the result still exact? Only partly.
</p>

<Proposition id="prop-exactness" title="Hom is left exact; tensor is right exact">
	<p>For a short exact sequence \(0\to A\to B\to C\to 0\) and any abelian group \(G\), the sequences</p>
	\[ 0\to\Hom(C,G)\to\Hom(B,G)\to\Hom(A,G) \qquad\text{and}\qquad A\otimes G\to B\otimes G\to C\otimes G\to 0 \]
	<p>are exact. But the last map of the first need not be onto, and the first map of the second need not be one-to-one.</p>
</Proposition>

<p>One example shows both failures. Start from the short exact sequence</p>
\[ 0\to\Z\xrightarrow{\;\times 2\;}\Z\to\Z/2\to 0 . \]
<Question>
	<p>
		Before reading on, try it yourself: apply \(\Hom(-,\Z)\) and \(-\otimes\Z/2\) to this sequence. You need only \(\Hom(\Z,G)\cong G\),
		\(\Z\otimes G\cong G\), and the fact that a homomorphism \(\Z/2\to\Z\) must send the element of order 2 to an element of order
		dividing 2. Which map stops being onto? Which stops being one-to-one?
	</p>
</Question>
<p>
	<strong>Apply \(\Hom(-,\Z)\).</strong> Since \(\Hom(\Z,\Z)\cong\Z\) and \(\Hom(\Z/2,\Z) = 0\), we get
	\(0\to 0\to\Z\xrightarrow{\times 2}\Z\). The last map is multiplication by 2, which is not onto: its cokernel is \(\Z/2\). In words: a
	homomorphism defined on the subgroup \(2\Z\) — say the one sending \(2\) to \(1\) — cannot be extended to all of \(\Z\), because \(1\)
	has no half in \(\Z\). The cokernel \(\Z/2\) measures exactly these non-extendable maps.
</p>
<p>
	<strong>Apply \(-\otimes\Z/2\).</strong> Since \(\Z\otimes\Z/2\cong\Z/2\), we get \(\Z/2\xrightarrow{\times 2}\Z/2\to\Z/2\to 0\). But
	multiplication by 2 is the <em>zero</em> map on \(\Z/2\), so the first map is not one-to-one: its kernel is \(\Z/2\). In words: the
	element \(1\) of the first \(\Z\) was perfectly nonzero, but after reducing mod 2 it maps to \(2\otimes 1 = 1\otimes 2 = 0\). Reducing
	mod 2 forgot that 2 was not zero.
</p>

<p>
	In both cases the failure is itself an abelian group, here \(\Z/2\). The next section gives these failures their names, \(\Ext\) and
	\(\Tor\), and a way to compute them.
</p>

<h2 id="tor-and-ext">Resolutions, Tor and Ext</h2>

<h3 id="resolutions">Free resolutions</h3>

<p>
	Free abelian groups are the easy case: if \(F\) is free, then \(\Hom(F,-)\) and \(-\otimes F\) preserve all exactness, because \(F\) is
	just a sum of copies of \(\Z\), and both operations do nothing to \(\Z\). So the idea is to replace any group by free groups.
</p>

<Definition id="def-resolution" title="Free resolution">
	<p>
		A <dfn>free resolution</dfn> of an abelian group \(A\) is an exact sequence \(\cdots\to F_2\to F_1\to F_0\to A\to 0\) in which every
		\(F_i\) is a free abelian group.
	</p>
</Definition>

<p>
	For abelian groups the story is short. Choose generators of \(A\): that gives a free group \(F_0\) mapping onto \(A\). The kernel
	\(F_1\) of that map — the <em>relations</em> among the generators — is a subgroup of a free abelian group, and a standard theorem
	(a close cousin of the classification in <Ref to="foundations/abelian-groups" />) says that such a subgroup is itself free. So every
	abelian group has a resolution of length one,
	\[ 0\to F_1\xrightarrow{\;M\;}F_0\to A\to 0 , \]
	and for finitely generated groups \(M\) is the relation matrix whose <Term t="smith-normal-form">Smith normal form</Term> you met in
	<Ref to="foundations/linear-algebra" />.
	The basic example:
</p>
\[ 0\to\Z\xrightarrow{\;\times n\;}\Z\to\Z/n\to 0 . \]

<Definition id="def-tor-ext" head={torExtHead}>
	<p>
		Let \(0\to F_1\xrightarrow{M}F_0\to A\to 0\) be a free resolution of \(A\). Delete \(A\), apply \(-\otimes G\) or \(\Hom(-,G)\) to
		what is left, and measure the failure of exactness:
		\[ \Tor(A,G) = \ker\big(F_1\otimes G\xrightarrow{M\otimes G}F_0\otimes G\big), \qquad \Ext(A,G) = \coker\big(\Hom(F_0,G)\xrightarrow{M^*}\Hom(F_1,G)\big). \]
	</p>
</Definition>

{#snippet torExtHead()}\(\Tor\) and \(\Ext\){/snippet}

<p>
	Two things deserve to be said at once. First, the answer does not depend on which resolution you choose: any two free resolutions of
	\(A\) are chain homotopy equivalent (once more, a chain homotopy saves the day), so they give isomorphic \(\Tor\) and \(\Ext\). We
	shall take this on trust; Hatcher proves it in a page <Cite k="hatcher2002" loc="Lemma 3.1" />. Second, the definitions are not a trick: they are exactly “the homology of the complex you get by applying
	the functor to a resolution”, which is how all derived functors are defined.
</p>

<p>Now compute, using the resolution \(0\to\Z\xrightarrow{\times n}\Z\to\Z/n\to 0\).</p>

<ul>
	<li>
		<strong>\(\Tor(\Z/n, G)\)</strong> is the kernel of \(G\xrightarrow{\times n}G\): the elements of \(G\) killed by \(n\). So
		\(\Tor(\Z/n,\Z) = 0\), and \(\Tor(\Z/m,\Z/n)\cong\Z/\gcd(m,n)\) (the elements \(x\in\Z/n\) with \(mx\equiv 0\)). For example,
		\(\Tor(\Z/4,\Z/6)\cong\Z/2\).
	</li>
	<li>
		<strong>\(\Ext(\Z/n, G)\)</strong> is the cokernel of \(G\xrightarrow{\times n}G\), that is \(G/nG\). So \(\Ext(\Z/n,\Z)\cong\Z/n\),
		\(\Ext(\Z/n,\Z/m)\cong\Z/\gcd(m,n)\), and \(\Ext(\Z/n,\Q) = 0\) (every rational number is divisible by \(n\)).
	</li>
	<li>
		<strong>Free groups contribute nothing:</strong> \(\Tor(\Z,G) = \Ext(\Z,G) = 0\), since \(\Z\) is its own resolution \(0\to 0\to\Z\to\Z\to 0\).
	</li>
	<li>
		<strong>Sums split:</strong> \(\Tor(A\oplus A',G)\cong\Tor(A,G)\oplus\Tor(A',G)\), and the same for \(\Ext\). With the
		classification \(A\cong\Z^r\oplus\Z/d_1\oplus\cdots\oplus\Z/d_k\) of <Ref to="foundations/abelian-groups" />, these rules compute
		everything.
	</li>
</ul>

<Figure num="5.2.3" title="A calculator for ⊗, Tor, Hom and Ext" hint="Build A and G from ℤ and ℤ/n pieces · or try a preset">
	<TorExtCalculator />
	{#snippet caption()}
		Each operation splits over the cyclic pieces of \(A\) and \(G\), and the cards show every piece. Below, the free resolution of \(A\):
		after tensoring with \(G\) the first map stops being injective, and its kernel is \(\Tor(A,G)\); after applying \(\Hom(-,G)\) the
		last map stops being surjective, and its cokernel is \(\Ext(A,G)\). Notice that \(\Tor\) and \(\Ext\) vanish unless \(A\) has
		torsion — free groups resolve themselves.
	{/snippet}
</Figure>

<h3 id="names">Where the names come from</h3>

<p>
	<strong>Tor</strong> is short for torsion. One way to see it: \(\Tor(A,\Q/\Z)\) is isomorphic to the <Term t="torsion-subgroup">torsion subgroup</Term> of \(A\) — for
	instance \(\Tor(\Z/n,\Q/\Z)\) consists of the elements of \(\Q/\Z\) killed by \(n\), which form a copy of \(\Z/n\). Tor detects the
	torsion in \(A\), as seen through \(G\).
</p>
<p>
	<strong>Ext</strong> is short for extension. An <dfn>extension</dfn> of \(C\) by \(A\) is a short exact sequence \(0\to A\to B\to C\to
	0\): a bigger group \(B\) built from a subgroup \(A\) and a quotient \(C\). It turns out that the extensions (up to the obvious
	equivalence) correspond exactly to the elements of \(\Ext(C,A)\), with the split extension \(B = A\oplus C\) corresponding to \(0\).
	Take \(A = C = \Z/2\): there are two ways to build a group of order 4 from two copies of \(\Z/2\), namely \(\Z/2\oplus\Z/2\) and
	\(\Z/4\) (in which the subgroup \(\{0,2\}\cong\Z/2\) has quotient \(\Z/2\)). Correspondingly, \(\Ext(\Z/2,\Z/2)\cong\Z/2\) has two
	elements. (The count is of extensions, not of groups. \(\Ext(\Z/3,\Z/3)\) has three elements, but only two middle groups occur,
	\(\Z/3\oplus\Z/3\) and \(\Z/9\): the two non-split extensions both use \(\Z/9\), glued to the quotient by different maps.)
</p>

<Remark id="derived-functors" title="Derived functors, in one paragraph">
	<p>
		For abelian groups, resolutions have length one, so only one \(\Tor\) and one \(\Ext\) appear. Over other rings — polynomial rings,
		group rings, the rings of algebraic geometry — resolutions can be longer, and one gets a whole sequence \(\Tor_1,\Tor_2,\dots\) and
		\(\Ext^1,\Ext^2,\dots\) by taking homology in each degree. These are the <dfn>derived functors</dfn> of \(\otimes\) and \(\Hom\).
		Group cohomology is \(\Ext\) over a group ring, and Grothendieck defined sheaf cohomology (<Ref to="cohomology/sheaves" />) as the
		derived functors of “take global sections”. Derived functors are how homological algebra spread from topology to the rest of
		mathematics.
	</p>
</Remark>

<h2 id="universal-coefficients">The universal coefficient theorems</h2>

<p>
	Now the payoff. If you know the integral homology \(H_n(X) = H_n(X;\Z)\) of a space, do you know its homology and cohomology with
	every other coefficient group? Yes — and \(\Tor\) and \(\Ext\) are exactly the correction terms.
</p>

<Theorem id="thm-uct" label="Theorem (universal coefficient theorems)">
	<p>For any space \(X\) (indeed any chain complex of free abelian groups) and any abelian group \(G\), there are short exact sequences</p>
	\[ 0\to H_n(X)\otimes G\to H_n(X;G)\to\Tor(H_{n-1}(X),G)\to 0, \]
	\[ 0\to\Ext(H_{n-1}(X),G)\to H^n(X;G)\to\Hom(H_n(X),G)\to 0, \]
	<p>and both split, so that</p>
	\[ H_n(X;G)\cong H_n(X)\otimes G\;\oplus\;\Tor(H_{n-1}(X),G), \qquad H^n(X;G)\cong\Hom(H_n(X),G)\;\oplus\;\Ext(H_{n-1}(X),G). \]
</Theorem>

<p>
	The second formula is the one stated in <Ref to="cohomology/cohomology-groups" />; now you can see where its \(\Ext\) comes from. In
	both formulas the correction term is built from the degree <em>below</em>. The proof is a well-chosen short exact sequence of chain
	complexes and the long exact sequence it produces — homological algebra feeding on itself. We will not write it out; Hatcher does so
	in a few pages for each version <Cite k="hatcher2002" loc="Thm 3.2, Thm 3A.3" />. The cohomology version is the coincidence that
	Eilenberg and Mac Lane set out to explain in 1942, inventing functors along the way (<Ref
		to="big-picture/categories"
		hash="naturality"
	/>).
</p>

<Example head={rp2Head}>
	<p>Recall \(H_0 = \Z\), \(H_1 = \Z/2\), \(H_2 = 0\) (<Ref to="homology/computing" />).</p>
	<ul>
		<li>
			<strong>Homology mod 2.</strong> \(H_0(\RP^2;\Z/2) = \Z\otimes\Z/2 = \Z/2\); \(H_1 = \Z/2\otimes\Z/2 = \Z/2\); and \(H_2 = 0\otimes
			\Z/2\oplus\Tor(\Z/2,\Z/2) = \Z/2\). That last group is the extra \(H_2\) you met in <Ref to="homology/computing" />: mod 2, the
			sum of all triangles is a cycle, because its boundary \(2c\) is zero. The UCT says it comes from the torsion one degree down.
		</li>
		<li>
			<strong>Cohomology with \(\Z\).</strong> \(H^1 = \Hom(\Z/2,\Z)\oplus\Ext(\Z,\Z) = 0\), and \(H^2 = \Hom(0,\Z)\oplus\Ext(\Z/2,\Z) =
			\Z/2\): the torsion has moved up one degree, as in <Ref to="cohomology/cohomology-groups" />.
		</li>
		<li>
			<strong>Mod 3.</strong> \(\Z/2\otimes\Z/3 = 0\) and \(\Tor(\Z/2,\Z/3) = 0\): with \(\Z/3\) coefficients, \(\RP^2\) looks exactly
			like a point. Coefficients prime to the torsion cannot see it.
		</li>
	</ul>
</Example>

{#snippet rp2Head()}The projective plane \(\RP^2\){/snippet}

<Example title="The Klein bottle, and an old cliffhanger">
	<p>
		With \(H_0 = \Z\), \(H_1 = \Z\oplus\Z/2\), \(H_2 = 0\): mod 2 the UCT gives \(\Z/2\), \((\Z/2)^2\), \(\Z/2\) — the same as the torus
		mod 2, which was the cliffhanger of <Ref to="homology/homology-groups" hash="cliffhanger" />. Mod 2 the torsion \(\Z/2\) is seen
		twice, once as an extra \(\Z/2\) in \(H_1\) and once as an extra \(H_2\), and the result happens to match the torus. With integer coefficients
		the difference is plain: \(\Z\oplus\Z/2\) versus \(\Z^2\).
	</p>
</Example>

<Figure num="5.2.4" title="Universal coefficients" hint="Choose a space and a coefficient group">
	<UCTExplorer />
	{#snippet caption()}
		Pick a space and coefficients. The table computes \(H_n(X;G)\) and \(H^n(X;G)\) from integral homology by the universal coefficient
		theorems; the rose part of each entry is the \(\Tor\) or \(\Ext\) term coming from torsion one degree down. Every entry is checked
		against a direct computation from the cell chain complex shown at the top (the book’s test suite also checks it on the simplicial
		models of Part III). Compare \(\RP^2\) with \(\Z/2\), \(\Z/3\) and \(\Q\).
	{/snippet}
</Figure>

<Warning title="Split, but not naturally">
	<p>
		The exact sequences in the theorem are natural — a map of spaces gives a map between them. The splittings are not. Collapse the
		“equator” \(\RP^1\) of \(\RP^2\) to a point: the result is a sphere, and the quotient map \(q\colon\RP^2\to S^2\) induces zero on
		integral homology in degrees 1 and 2 (the groups are \(\Z/2\to 0\) and \(0\to\Z\)). A natural splitting of \(H_2(-;\Z/2)\) into
		a \(\otimes\) part and a \(\Tor\) part would force \(q_*\) to be zero on \(H_2(-;\Z/2)\) too. But mod 2, \(q\) carries the sum of
		all the triangles of \(\RP^2\) onto the sphere, and \(q_*\colon\Z/2\to\Z/2\) is an isomorphism <Cite
			k="hatcher2002"
			loc="Example 2.51, §3.A"
		/>. This is the “isomorphic but not naturally isomorphic” phenomenon of <Ref to="big-picture/categories" hash="naturality" /> in
		the wild. In practice: the theorem tells you what the groups <em>are</em>, but to compute an induced map you should use the exact
		sequence, not the splitting.
	</p>
</Warning>

<p>
	Two consequences get used constantly. With coefficients in \(\Q\) (or \(\R\)) all torsion disappears: when the homology is finitely
	generated, \(H_n(X;\Q)\cong\Q^{b_n}\), and cohomology has the same dimensions as homology. With coefficients in \(\Z/p\) for a prime \(p\), torsion of order prime to \(p\)
	disappears, while each summand \(\Z/p^k\) of \(H_n\) is seen twice, as a \(\Z/p\) in degree \(n\) and another in degree \(n+1\).
	That is why the mod-2 Betti numbers of
	\(\RP^2\) are \(1, 1, 1\) although its rational Betti numbers are \(1, 0, 0\).
</p>

<h2 id="kunneth">The Künneth theorem: homology of products</h2>

<p>
	The torus is a product of two circles, \(T^2 = S^1\times S^1\). Its homology \(\Z,\Z^2,\Z\) looks like it ought to be “the product” of
	the circle’s \(\Z,\Z\) with itself — and the Künneth theorem, glimpsed in <Ref to="cohomology/cup-product" /> as the <Term
		t="kunneth-formula">Künneth formula</Term
	>, says exactly how.
</p>

<p>
	Start with cells. If \(X\) and \(Y\) are cell complexes, then \(X\times Y\) is one too: its cells are products \(e^i\times e^j\) of an
	\(i\)-cell of \(X\) and a \(j\)-cell of \(Y\), of dimension \(i+j\). The circle has a 0-cell and a 1-cell, so the torus gets cells of
	dimension \(0+0\), \(0+1\), \(1+0\) and \(1+1\): one vertex, two edges, one face, the familiar square with opposite sides glued. The
	cellular chain complex of the product is the tensor product of the two chain complexes, with boundary given by a Leibniz rule,
	\[ \partial(a\otimes b) = \partial a\otimes b + (-1)^{i}\,a\otimes\partial b \qquad (a\text{ an } i\text{-cell}). \]
	So computing \(H_n(X\times Y)\) is a purely algebraic question about the homology of a tensor product of complexes, and the answer is:
</p>

<Theorem id="thm-kunneth" label="Theorem (Künneth)">
	<p>For cell complexes \(X\) and \(Y\) (and integer coefficients) there is an isomorphism</p>
	\[ H_n(X\times Y)\;\cong\;\bigoplus_{i+j=n} H_i(X)\otimes H_j(Y)\;\;\oplus\bigoplus_{i+j=n-1}\Tor\big(H_i(X),H_j(Y)\big). \]
</Theorem>

<p>
	Hatcher proves it, for any principal ideal domain of coefficients, in his §3.B <Cite k="hatcher2002" loc="Thm 3B.6" />.
	For the torus: \(H_0 = \Z\otimes\Z = \Z\); \(H_1 = (H_0\otimes H_1)\oplus(H_1\otimes H_0) = \Z^2\); \(H_2 = H_1\otimes H_1 = \Z\). No
	torsion, no \(\Tor\) terms. A pleasant way to remember torsion-free cases: multiply the <em>Poincaré polynomials</em> \(\sum_n b_n t^n\).
	The circle has \(1 + t\), so the torus has \((1+t)^2 = 1 + 2t + t^2\), and the \(k\)-dimensional torus has \((1+t)^k\), with binomial
	coefficients as Betti numbers. With coefficients in a field, the \(\Tor\) term disappears and this multiplication rule is exact.
</p>

<p>
	The \(\Tor\) term is a genuine correction, and it is the same phenomenon as in the UCT: torsion in two factors combines to produce
	something one degree higher. For \(\RP^2\times\RP^2\), the classes of order 2 in the two copies of \(H_1\) give \(\Tor(\Z/2,\Z/2) =
	\Z/2\) in \(H_3\). The figure lets you try products.
</p>

<Figure num="5.2.5" title="Homology of a product" hint="Choose the two factors">
	<KunnethGrid />
	{#snippet caption()}
		Cell \((i, j)\) holds \(H_i(X)\otimes H_j(Y)\); the cells along an anti-diagonal \(i+j = n\) (one colour) add up to \(H_n(X\times
		Y)\), together with any \(\Tor\) terms (rose) that arrive from the diagonal below. For \(\RP^2\times\RP^2\), \(H_3\) consists of a
		single \(\Tor\). Every total is checked against the homology of the product cell complex, computed directly. Keep this grid in mind:
		a spectral sequence is a grid like this one that has not yet settled down.
	{/snippet}
</Figure>

<h2 id="spectral-sequences">Spectral sequences: computing in stages</h2>

<p>
	Many spaces are built in stages. A cell complex is built skeleton by skeleton; a fibre bundle is built from copies of a fibre spread
	over the cells of a base; a double complex (a grid of groups with two commuting boundary maps) can be cut into columns. In each case
	there is an obvious plan: compute the homology of each stage separately, then glue. The difficulty is that the stages interact. A
	cycle that looks new at stage \(p\) may have a boundary that lies in an earlier stage — or several stages earlier — and then it is not
	really a cycle of the whole. A <dfn>spectral sequence</dfn> is the bookkeeping device that makes the plan work, correcting the first
	approximation in a sequence of steps.
</p>

<p>
	Here is the setting. A <dfn>filtered complex</dfn> is a chain complex \(C\) with a nested sequence of subcomplexes \(F_0C\subseteq
	F_1C\subseteq\cdots\subseteq F_kC = C\): the space after stage 0, after stage 1, and so on. Draw a grid with columns \(p = 0, 1, 2,
	\dots\) for the stages and rows \(q\), and put each generator of degree \(n\) that is added at stage \(p\) at the position \((p, q)\)
	with \(q = n - p\). Total degree is constant along the anti-diagonals \(p + q = n\), just as in the Künneth grid.
</p>

<ul>
	<li>
		<strong>Page \(E^1\)</strong> records the homology of each stage <em>relative to the stages before it</em>: \(E^1_{p,q} =
		H_{p+q}(F_pC/F_{p-1}C)\). It is the first approximation: the new cycles at each stage, ignoring how stages attach.
	</li>
	<li>
		<strong>The differential \(d^1\colon E^1_{p,q}\to E^1_{p-1,q}\)</strong> records how stage \(p\) attaches to stage \(p-1\): the
		boundary of a new cycle, seen in the previous stage. Taking homology gives the next page, \(E^2 = H(E^1,d^1)\).
	</li>
	<li>
		<strong>The differential \(d^2\colon E^2_{p,q}\to E^2_{p-2,q+1}\)</strong> records attachments that skip a stage; and in general
		\(d^r\colon E^r_{p,q}\to E^r_{p-r,\,q+r-1}\) moves \(r\) columns left and \(r-1\) rows up, with \(E^{r+1} = H(E^r, d^r)\).
	</li>
	<li>
		<strong>Convergence.</strong> With finitely many stages the differentials eventually have nowhere to go, the pages stop changing,
		and the final page \(E^\infty\) spells out the homology: over a field, \(\dim H_n(C) = \sum_{p+q=n}\dim E^\infty_{p,q}\).
	</li>
</ul>

<Figure num="5.2.6" title="Turning the pages" hint="Choose a page · switch examples and coefficients">
	<SpectralPages />
	{#snippet caption()}
		Each dot is a generator, placed at (stage, degree − stage). <em>Two disks on a segment:</em> on \(E^1\) two \(d^1\) arrows cancel
		\(t\) against \(w\) and \(f\) against \(b\); on \(E^2\) a \(d^2\), of slope \((-2,1)\), cancels the disk \(e\) against the loop
		\(c\) it fills, two stages earlier; \(E^3 = E^\infty\) leaves one dot, so the space has the homology of a point. <em>Torus by
		cells:</em> nothing ever cancels. <em>\(\RP^2\) by cells:</em> over \(\Q\) a \(d^1\) (multiplication by 2) cancels \(s\) against
		\(a\); over \(\Z/2\) it is zero and every dot survives — the universal coefficient story again.
	{/snippet}
</Figure>

<Example title="Cellular homology is a spectral sequence">
	<p>
		Filter a cell complex by its skeleta, \(F_pX = X^p\). Then the \(p\)-th stage adds only \(p\)-cells, so every dot sits on the bottom
		row \(q = 0\), and \(E^1_{p,0} = H_p(X^p, X^{p-1})\) is the free group on the \(p\)-cells: \(E^1\) is the cellular chain complex,
		and \(d^1\) is the <Term t="cellular-chain-complex">cellular boundary</Term> of <Ref to="homology/exact-sequences" />. Then \(E^2\) is cellular homology. Every later
		differential would leave the bottom row, so it is zero: the sequence stops at \(E^2\), and the convergence statement is the theorem
		that cellular homology equals homology. The “Torus” and “\(\RP^2\)” examples in Figure 5.2.6 are exactly this.
	</p>
</Example>

<Remark title="You are in good company">
	<p>
		Spectral sequences have a fearsome reputation, mostly because of their indices. Ravi Vakil opens his notes on them with a joke:
		“It has been suggested that the name ‘spectral’ was given because, like spectres, spectral sequences are terrifying, evil, and
		dangerous. I have heard no one disagree with this interpretation, which is perhaps not surprising since I just made it up”
		<Cite k="vakil2008" />. The ideas are the ones above: approximate, correct, correct the correction, and read off the answer along
		the diagonals. Timothy Chow’s five-page article shows how you could have invented them yourself <Cite k="chow2006" />.
	</p>
</Remark>

<p>
	The most famous example has a fibration as input. When a space \(E\) is fibred over a base \(B\) with fibre \(F\) — like the Hopf
	fibration of <Ref to="big-picture/horizons" hash="homotopy-groups" />, where \(S^3\) is fibred over \(S^2\) by circles — the
	<dfn>Serre spectral sequence</dfn> has \(E^2_{p,q} = H_p(B; H_q(F))\) (when \(B\) is simply connected) and converges to
	\(H_{p+q}(E)\). Its \(E^2\) page is a Künneth
	grid, and the differentials measure how far \(E\) is from being the product \(B\times F\). Jean-Pierre Serre built it in his 1951
	thesis and used it to prove that the homotopy groups of spheres are finitely generated <Cite k="serre1951" />; two years later he
	showed that almost all of them are finite <Cite k="serre1953" />.
</p>

<Warning title="Over the integers, the last page is not quite the answer">
	<p>
		\(E^\infty\) gives the pieces of \(H_n\), not how they fit together: if two pieces are \(\Z/2\) and \(\Z/2\), the group \(H_n\) might
		be \(\Z/2\oplus\Z/2\) or \(\Z/4\). This is called an <em>extension problem</em>, and — as the name suggests — \(\Ext\) measures it.
		Over a field there is no problem, which is one reason computations are often done mod \(p\) or over \(\Q\) first.
	</p>
</Warning>

<History title="A topologist in a prison camp">
	<p>
		Jean Leray spent 1940 to 1945 as a prisoner of war in Oflag XVII-A, an officers’ camp in Austria. According to his MacTutor
		biography, “Not wishing the Germans to know that he was an expert in hydrodynamics, since he feared that if they found out he
		would be forced to undertake war work for them, Leray claimed to be a topologist” <Cite k="oconnor-robertson-leray" />. The
		prisoners ran a “university in captivity”, with Leray as its rector; he taught algebraic topology there and came home with the
		ideas of sheaves, sheaf cohomology and spectral sequences, published in 1946 <Cite k="miller2000" />. Jean-Louis Koszul gave
		spectral sequences their algebraic form in 1947, using a filtered complex as Henri Cartan suggested, and Serre’s 1951 thesis
		showed what they could do <Cite k="weibel1999" />.
	</p>
</History>

<h2 id="axioms">The Eilenberg–Steenrod axioms</h2>

<p>
	This book has met several homology theories: simplicial homology of simplicial complexes, singular homology of all spaces, cellular
	homology of cell complexes, and (in <Ref to="cohomology/sheaves" />) Čech cohomology. Why do they agree whenever they can be compared?
	In 1945 Samuel Eilenberg and Norman Steenrod answered: because they all satisfy the same short list of properties, and those
	properties alone determine homology <Cite k="eilenberg-steenrod1945" />. Notice that the list is phrased entirely in the language of <Ref to="big-picture/categories" />:
	functors, natural transformations, exactness.
</p>

<Definition id="def-homology-theory" title="Homology theory (Eilenberg–Steenrod)">
	<p>
		A <dfn>homology theory</dfn> assigns to each pair of spaces \((X, A)\) (with \(A\subseteq X\)) abelian groups \(H_n(X, A)\), one for
		each integer \(n\), functorially in maps of pairs, together with natural <em>connecting homomorphisms</em> \(\partial\colon
		H_n(X,A)\to H_{n-1}(A)\) (where \(H_n(A)\) means \(H_n(A,\varnothing)\)), such that:
	</p>
	<ol>
		<li><strong>Homotopy.</strong> Homotopic maps of pairs induce the same homomorphisms.</li>
		<li>
			<strong>Exactness.</strong> Every pair gives a long exact sequence \(\cdots\to H_n(A)\to H_n(X)\to H_n(X,A)\xrightarrow{\partial}
			H_{n-1}(A)\to\cdots\).
		</li>
		<li>
			<strong>Excision.</strong> If the closure of \(U\) lies in the interior of \(A\), the inclusion \((X\setminus U, A\setminus U)\to
			(X, A)\) induces isomorphisms in every degree.
		</li>
		<li><strong>Dimension.</strong> For a one-point space, \(H_n(\mathrm{pt}) = 0\) when \(n\neq 0\).</li>
		<li>
			<strong>Additivity.</strong> For a disjoint union \(X = \bigsqcup_\alpha X_\alpha\), the inclusions induce an isomorphism
			\(\bigoplus_\alpha H_n(X_\alpha)\cong H_n(X)\).
		</li>
	</ol>
	<p>The group \(G = H_0(\mathrm{pt})\) is called the <dfn>coefficient group</dfn> of the theory.</p>
</Definition>

<p>
	Each axiom is a theorem you have seen for singular homology: homotopy invariance (<Ref to="homology/invariance" />), the long exact
	sequence of a pair and excision (<Ref to="homology/exact-sequences" />), the homology of a point (<Ref to="homology/homology-groups" />),
	and additivity, which for finitely many pieces follows from the others and was added for infinite unions by John Milnor in 1962
	<Cite k="milnor1962" />. What is new is
	the claim that nothing else is needed. The figure computes the homology of every sphere using only the five axioms.
</p>

<Figure num="5.2.7" title="Spheres from the axioms" hint="Step through · the axioms used in each step light up">
	<AxiomsProof />
	{#snippet caption()}
		The computation that drives the uniqueness theorem. A disk has the homology of a point; the long exact sequence of the pair
		\((D^n, S^{n-1})\) shifts degree by one; collapsing the rim of the disk gives a sphere one dimension up. Iterating down to the
		0-sphere — two points — leaves \(\tilde H_k(S^n)\cong G\) for \(k = n\) and \(0\) otherwise. Here \(\tilde H\) is reduced homology
		(<Ref to="homology/homology-groups" />), which removes one copy of \(G\) from \(H_0\).
	{/snippet}
</Figure>

<Theorem id="thm-uniqueness" label="Theorem (uniqueness, Eilenberg–Steenrod)">
	<p>
		On finite cell complexes, any two homology theories with the same coefficient group are isomorphic. More precisely, a natural map
		between two homology theories that is an isomorphism for the one-point space is an isomorphism for every finite cell complex (and,
		with the additivity axiom, for every cell complex).
	</p>
</Theorem>

<p>
	The idea of the proof is the figure, run inside an induction on cells. Attaching an \(n\)-cell changes homology only through the pair
	\((D^n, S^{n-1})\), whose homology the axioms pin down; the long exact sequence and the five lemma (a cousin of the snake lemma) carry
	the isomorphism from one stage of the construction to the next. In fact the argument shows more: any theory satisfying the axioms can
	be computed by the cellular chain complex. So simplicial, singular and cellular homology agree on complexes — they all satisfy the
	axioms with coefficient group \(\Z\). Hatcher states the uniqueness theorem in his §2.3 and proves it, for all CW pairs, in
	Chapter 4 <Cite k="hatcher2002" loc="§2.3, Thm 4.59" />.
</p>

<KeyIdea>
	<p>
		The axioms say what homology <em>does</em>, not what it <em>is</em>. A homology theory is a functor from pairs of spaces to
		graded abelian groups that turns homotopies into equalities, pairs into long exact sequences and excisions into isomorphisms — and
		on cell complexes there is exactly one such functor for each coefficient group.
	</p>
</KeyIdea>

<h3 id="dropping-an-axiom">Dropping an axiom</h3>

<p>
	The dimension axiom looks the most innocent: of course a point has no interesting homology in degree 5. But it is the one axiom that
	refers to a specific space, and if you drop it you get a wider class of <dfn>generalized (co)homology theories</dfn> that still satisfy
	homotopy, exactness, excision and additivity — and so still have long exact sequences, Mayer–Vietoris sequences and spectral sequences
	— but in which a point can have nonzero groups in many degrees. Complex K-theory, built from vector bundles, assigns to a point the
	group \(\Z\) in every even degree; cobordism, built from manifolds, assigns to a point the groups of all closed manifolds up to
	cobordism. These are among the destinations of <Ref to="big-picture/horizons" hash="generalized-cohomology" />.
</p>

<History title="From the axioms to the book">
	<p>
		Eilenberg and Steenrod announced their axioms in a four-page note in the Proceedings of the National Academy of Sciences in 1945,
		and developed them into <em>Foundations of Algebraic Topology</em> (1952) <Cite k="eilenberg-steenrod1952" />. The note pointed
		out at once that singular and Čech homology both satisfy the axioms, and so must agree on all finite complexes <Cite
			k="weibel1999"
		/>. The dimension axiom went in because every homology theory then known obeyed it; within a few years topologists were studying
		<em>bordism</em>, whose groups of a point are nonzero in infinitely many dimensions <Cite k="hatcher2002" loc="§2.3" />. The
		generalized theories of today keep the other axioms and add Milnor’s axiom for infinite unions in place of the dimension axiom.
	</p>
</History>

<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Tensor products">
	<p>Compute \(\Z/4\otimes\Z/6\), \(\Z/5\otimes\Z/7\), \(\Z\otimes\Z/3\), \(\Q\otimes\Z/2\) and \((\Z^2\oplus\Z/4)\otimes\Z/2\).</p>
	{#snippet solution()}
		<p>
			\(\Z/4\otimes\Z/6\cong\Z/\gcd(4,6) = \Z/2\). \(\Z/5\otimes\Z/7 = 0\), since \(\gcd(5,7) = 1\). \(\Z\otimes\Z/3\cong\Z/3\).
			\(\Q\otimes\Z/2 = 0\). Finally tensor distributes over direct sums: \((\Z^2\oplus\Z/4)\otimes\Z/2\cong(\Z/2)^2\oplus\Z/2 =
			(\Z/2)^3\) — the rule \(A\otimes\Z/2\cong A/2A\) gives the same answer.
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Hom groups">
	<p>Compute \(\Hom(\Z/6,\Z/4)\), \(\Hom(\Z/3,\Z)\), \(\Hom(\Z,\Z/5)\) and \(\Hom(\Z/3,\Q/\Z)\).</p>
	{#snippet hint()}
		<p>Ask where the generator \(1\) may go: its image \(x\) must satisfy \(n x = 0\) when the source is \(\Z/n\).</p>
	{/snippet}
	{#snippet solution()}
		<p>
			\(\Hom(\Z/6,\Z/4)\cong\Z/2\): we need \(6x\equiv 0\pmod 4\), so \(x\in\{0, 2\}\). \(\Hom(\Z/3,\Z) = 0\): \(3x = 0\) forces \(x =
			0\). \(\Hom(\Z,\Z/5)\cong\Z/5\): \(1\) may go anywhere. \(\Hom(\Z/3,\Q/\Z)\cong\Z/3\): \(x\) must be one of \(0, \tfrac13,
			\tfrac23\) modulo 1.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} head={exTorHead}>
	<p>
		Use the resolution \(0\to\Z\xrightarrow{\times 4}\Z\to\Z/4\to 0\) to compute \(\Tor(\Z/4,\Z/6)\). Then check your answer is
		consistent with the symmetry \(\Tor(A,B)\cong\Tor(B,A)\) by resolving \(\Z/6\) instead.
	</p>
	{#snippet solution()}
		<p>
			Tensoring the resolution with \(\Z/6\) and deleting \(\Z/4\) gives \(\Z/6\xrightarrow{\times 4}\Z/6\). Its kernel is
			\(\{x : 4x\equiv 0\pmod 6\} = \{0, 3\}\cong\Z/2\). So \(\Tor(\Z/4,\Z/6)\cong\Z/2\). Resolving \(\Z/6\) instead gives
			\(\Z/4\xrightarrow{\times 6}\Z/4\), with kernel \(\{x : 6x\equiv 0\pmod 4\} = \{0, 2\}\cong\Z/2\). The same group, as promised.
		</p>
	{/snippet}
</Exercise>

{#snippet exTorHead()}\(\Tor(\Z/4,\Z/6)\) by a resolution{/snippet}

<Exercise level={2} head={exExtHead}>
	<p>
		Compute \(\Ext(\Z/n,\Z)\) from the resolution of \(\Z/n\), and explain the answer in terms of homomorphisms from \(n\Z\) to \(\Z\)
		that cannot be extended to \(\Z\).
	</p>
	{#snippet solution()}
		<p>
			Applying \(\Hom(-,\Z)\) to \(0\to\Z\xrightarrow{\times n}\Z\) (after deleting \(\Z/n\)) gives \(\Hom(\Z,\Z)\xrightarrow{(\times
			n)^*}\Hom(\Z,\Z)\), i.e. \(\Z\xrightarrow{\times n}\Z\). Its cokernel is \(\Z/n\), so \(\Ext(\Z/n,\Z)\cong\Z/n\). Interpretation:
			the first copy of \(\Z\) is really the subgroup \(n\Z\). A homomorphism \(\varphi\colon n\Z\to\Z\) is decided by \(\varphi(n) = k\),
			and it extends to \(\Z\) exactly when \(k\) is divisible by \(n\) (set the extension’s value at 1 to \(k/n\)). So the
			non-extendable maps are measured by \(k \bmod n\), an element of \(\Z/n\).
		</p>
	{/snippet}
</Exercise>

{#snippet exExtHead()}\(\Ext(\Z/n,\Z)\){/snippet}

<Exercise level={2} head={exUctHead}>
	<p>
		Use the universal coefficient theorems to compute \(H_n(\RP^2;\Z/2)\), \(H^n(\RP^2;\Z/2)\) and \(H_n(\RP^2;\Z/3)\) for \(n = 0,1,2\).
		Check them in Figure 5.2.4.
	</p>
	{#snippet solution()}
		<p>
			With \(H_0 = \Z\), \(H_1 = \Z/2\), \(H_2 = 0\): \(H_0(\,;\Z/2) = \Z/2\), \(H_1(\,;\Z/2) = \Z/2\otimes\Z/2 = \Z/2\), \(H_2(\,;\Z/2) =
			\Tor(\Z/2,\Z/2) = \Z/2\). For cohomology, \(H^0 = \Hom(\Z,\Z/2) = \Z/2\), \(H^1 = \Hom(\Z/2,\Z/2)\oplus\Ext(\Z,\Z/2) = \Z/2\), \(H^2
			= \Hom(0,\Z/2)\oplus\Ext(\Z/2,\Z/2) = \Z/2\). With \(\Z/3\): \(H_0 = \Z/3\), and \(H_1 = \Z/2\otimes\Z/3 = 0\), \(H_2 =
			\Tor(\Z/2,\Z/3) = 0\).
		</p>
	{/snippet}
</Exercise>

{#snippet exUctHead()}\(\RP^2\) with coefficients{/snippet}

<Exercise level={2} title="Products of circles and spheres">
	<p>
		Use the Künneth theorem to compute the homology of \(S^1\times S^2\) and of the three-dimensional torus \(T^3 = S^1\times S^1\times
		S^1\). What are their Euler characteristics?
	</p>
	{#snippet solution()}
		<p>
			Everything is torsion-free, so multiply Poincaré polynomials. \(S^1\times S^2\): \((1+t)(1+t^2) = 1 + t + t^2 + t^3\), so \(H_n =
			\Z\) for \(n = 0,1,2,3\). \(T^3\): \((1+t)^3 = 1 + 3t + 3t^2 + t^3\), so \(H = \Z,\Z^3,\Z^3,\Z\). Setting \(t = -1\) gives the Euler
			characteristic: \(0\) in both cases (in general \(\chi(X\times Y) = \chi(X)\chi(Y)\), and \(\chi(S^1) = 0\)).
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Finishing the snake">
	<p>
		In the snake lemma, prove exactness at \(\ker c\) — that the kernel of \(\delta\) is exactly the image of \(\ker b\to\ker c\) — and
		at \(\coker a\).
	</p>
	{#snippet hint()}
		<p>
			For “\(\delta(x) = 0\) implies \(x\) comes from \(\ker b\)”: if \(z = a(w)\), replace the lift \(y\) by \(y - i(w)\). For exactness at
			\(\coker a\), chase an element \([z]\) with \(i'(z)\in\im b\) back up to \(\ker c\).
		</p>
	{/snippet}
	{#snippet solution()}
		<p>
			<em>At \(\ker c\).</em> If \(x = p(y)\) with \(b(y) = 0\), use \(y\) as the lift: then \(z = 0\) and \(\delta(x) = 0\). Conversely,
			suppose \(\delta(x) = 0\), i.e. the element \(z\) with \(i'(z) = b(y)\) lies in \(\im a\), say \(z = a(w)\). Put \(y_0 = y - i(w)\).
			Then \(p(y_0) = p(y) = x\) (since \(p\circ i = 0\)), and \(b(y_0) = b(y) - b(i(w)) = i'(z) - i'(a(w)) = 0\). So \(y_0\in\ker b\) maps
			to \(x\).
		</p>
		<p>
			<em>At \(\coker a\).</em> The composite \(\ker c\to\coker a\to\coker b\) sends \(x\) to the class of \(i'(z) = b(y)\), which is
			zero in \(\coker b = B'/\im b\). Conversely, if \([z]\in\coker a\) maps to zero in \(\coker b\), then \(i'(z) = b(y)\) for some
			\(y\in B\). Let \(x = p(y)\). Then \(c(x) = c(p(y)) = p'(b(y)) = p'(i'(z)) = 0\), so \(x\in\ker c\), and by construction (with
			lift \(y\)) \(\delta(x) = [z]\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} head={exExtExtHead}>
	<p>
		Show that the two short exact sequences \(0\to\Z/2\xrightarrow{\times 2}\Z/4\to\Z/2\to 0\) and \(0\to\Z/2\to\Z/2\oplus\Z/2\to\Z/2\to
		0\) are genuinely different extensions — the middle groups are not isomorphic — and check that \(\Ext(\Z/2,\Z/2)\) has exactly two
		elements.
	</p>
	{#snippet solution()}
		<p>
			\(\Z/4\) has an element of order 4 (namely \(1\)); in \(\Z/2\oplus\Z/2\) every element has order at most 2. So the middle groups
			are not isomorphic, and no equivalence of extensions can exist. For \(\Ext\): resolve \(\Z/2\) by \(0\to\Z\xrightarrow{\times
			2}\Z\to\Z/2\to 0\) and apply \(\Hom(-,\Z/2)\): we get \(\Z/2\xrightarrow{\times 2}\Z/2\), which is the zero map, so its cokernel is
			all of \(\Z/2\). Two elements: \(0\) for the split extension \(\Z/2\oplus\Z/2\), and the nonzero one for \(\Z/4\).
		</p>
	{/snippet}
</Exercise>

{#snippet exExtExtHead()}\(\Ext(\Z/2,\Z/2)\) and the group of order 4{/snippet}

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>
			Chain complexes and chain maps form a category \(\Ch\); homology is a functor on it, and it <strong>measures the failure of
			exactness</strong>. Chain homotopic maps induce the same map on homology.
		</li>
		<li>
			The <strong>snake lemma</strong> turns a commutative diagram with exact rows into a six-term exact sequence; its connecting map is
			found by a diagram chase. It yields the <strong>long exact sequence</strong> of a short exact sequence of complexes.
		</li>
		<li>
			\(\Hom(-,G)\) is left exact and \(-\otimes G\) is right exact. Examples: \(\Z/m\otimes\Z/n\cong\Z/\gcd(m,n)\),
			\(\Hom(\Z/n,\Z) = 0\).
		</li>
		<li>
			Applying them to a free resolution measures the failure of exactness: \(\Tor(\Z/m,\Z/n)\cong\Z/\gcd(m,n)\),
			\(\Ext(\Z/n,\Z)\cong\Z/n\); free groups give zero. Tor detects torsion; Ext classifies extensions.
		</li>
		<li>
			The <strong>universal coefficient theorems</strong>: \(H_n(X;G)\cong H_n\otimes G\oplus\Tor(H_{n-1},G)\) and \(H^n(X;G)\cong
			\Hom(H_n,G)\oplus\Ext(H_{n-1},G)\) — torsion is felt one degree up. The splittings are not natural.
		</li>
		<li>
			<strong>Künneth</strong>: \(H_n(X\times Y)\cong\bigoplus_{i+j=n}H_i\otimes H_j\oplus\bigoplus_{i+j=n-1}\Tor(H_i,H_j)\).
		</li>
		<li>
			A <strong>spectral sequence</strong> computes the homology of a filtered complex page by page, with \(d^r\) of slope \((-r, r-1)\);
			cellular homology is the simplest case, and the Serre spectral sequence of a fibration the most famous.
		</li>
		<li>
			The <strong>Eilenberg–Steenrod axioms</strong> — homotopy, exactness, excision, dimension, additivity — determine homology on cell
			complexes. Dropping the dimension axiom gives generalized theories such as K-theory and cobordism.
		</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading items={[...reading]} />