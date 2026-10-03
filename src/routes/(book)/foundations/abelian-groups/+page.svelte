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

	import CosetCollapse from '$lib/figures/foundations/abelian-groups/CosetCollapse.svelte';
	import CircleQuotient3D from '$lib/figures/foundations/abelian-groups/CircleQuotient3D.svelte';
	import LatticeQuotient from '$lib/figures/foundations/abelian-groups/LatticeQuotient.svelte';
	import FirstIsoTheorem from '$lib/figures/foundations/abelian-groups/FirstIsoTheorem.svelte';
	import GearsCRT from '$lib/figures/foundations/abelian-groups/GearsCRT.svelte';
	import InventoryCalculator from '$lib/figures/foundations/abelian-groups/InventoryCalculator.svelte';
	import ClassificationExplorer from '$lib/figures/foundations/abelian-groups/ClassificationExplorer.svelte';
	import SesPicture from '$lib/figures/foundations/abelian-groups/SesPicture.svelte';
	import ExactnessExplorer from '$lib/figures/foundations/abelian-groups/ExactnessExplorer.svelte';

	const reading = [
		{
			title: 'Quotient Groups',
			author: 'Keith Conrad',
			url: 'https://kconrad.math.uconn.edu/blurbs/grouptheory/quotientgroups.pdf',
			note: 'A careful, example-rich expository note. Its sections on quotients of ℤ and of abelian groups are exactly this chapter; it also explains what changes for non-abelian groups (normal subgroups).',
			kind: 'notes' as const,
			free: true
		},
		{
			title: 'What’s a Quotient Group, Really? (Parts 1 and 2)',
			author: 'Tai-Danae Bradley (Math3ma)',
			url: 'https://www.math3ma.com/blog/whats-a-quotient-group-really-part-1',
			note: 'Two short, friendly blog posts on cosets as “piles” and quotients as “the set of piles”. Part 2 is the source of the many-ways-to-be-wrong saying.',
			kind: 'web' as const,
			free: true
		},
		{
			title: 'The First Isomorphism Theorem, Intuitively',
			author: 'Tai-Danae Bradley (Math3ma)',
			url: 'https://www.math3ma.com/blog/the-first-isomorphism-theorem-intuitively',
			note: 'The theorem of this chapter told as a picture story: dots, coloured piles, one dot per pile.',
			kind: 'web' as const,
			free: true
		},
		{
			title: 'Abstract Algebra: Theory and Applications',
			author: 'Thomas W. Judson',
			url: 'https://judsonbooks.org/abstract-algebra-theory-and-applications/',
			note: 'Free textbook. Its chapters on cosets and Lagrange’s theorem, factor groups, homomorphisms and the structure of finite abelian groups are the standard next step.',
			kind: 'book' as const,
			free: true
		},
		{
			title: 'Algebraic Topology for Data Scientists',
			author: 'Michael S. Postol',
			url: 'https://arxiv.org/abs/2308.10825',
			note: 'Long notes that build homology from scratch for readers from data science; the “fruit stand” picture of free abelian groups comes from here.',
			kind: 'notes' as const,
			free: true
		},
		{
			title: 'Algebraic Topology, Chapter 2',
			author: 'Allen Hatcher',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/AT.pdf',
			note: 'The standard graduate text, free online. Look at the opening pages of Chapter 2 once you reach Part III: free abelian groups of chains and quotient groups appear exactly as they do here.',
			kind: 'book' as const,
			free: true
		}
	];
</script>

<Epigraph author="Keith Conrad" source="“Quotient Groups”">Subgroups are inside a group while quotient groups are a type of collapsing of a group, generalizing the way \(\R\) can be wrapped around to form the circle group <span class="nw">\(\R/2\pi\Z\).</span></Epigraph>

<p class="lead">
	In the last chapter you added hours on a clock without asking where clock arithmetic comes from. The answer is a
	construction so important that homology itself is an instance of it: take a group, choose a subgroup, and declare
	every element of that subgroup to be zero. What survives is a new group, called a <em>quotient</em>. This chapter is
	about that construction, and about a second one that is just as important to us: the group of <em>formal sums</em>,
	the algebra of inventories. Put the two together and you can describe every abelian group homology will ever
	produce.
</p>

<p>
	We go slowly, because this is the algebraic engine of the whole book. First come <em>cosets</em> (shifted copies of a
	subgroup) and <em>quotient groups</em> (cosets collapsed to points), with three pictures: the integers, the real line,
	and a lattice in the plane. Then the <em>First Isomorphism Theorem</em>, which ties quotients to homomorphisms;
	<em>direct sums</em>; <em>free abelian groups</em> of formal sums; <em>generators and relations</em>; the
	<em>classification</em> of finitely generated abelian groups; and finally a first look at <em>exact sequences</em>.
</p>

<Ahead>
	<p>
		The <em>chains</em> of <Ref to="homology/chains" /> are formal sums, such as \(2a - b + c\) for edges \(a, b, c\) of a
		shape: elements of a free abelian group. The boundary map is a homomorphism between such groups, and the homology
		group \(H_k = Z_k / B_k\) is a quotient group: the cycles, with the boundaries collapsed to zero — the collapse you
		will perform by hand in the first figure. The classification theorem then says that every homology group of a
		finite shape looks like \(\Z^r \oplus \Z/d_1 \oplus \dots \oplus \Z/d_k\). The number \(r\) counts holes (it will be
		called a Betti number), and the finite part, called <em>torsion</em>, is how homology tells a torus (whose first
		homology is <span class="nw">\(\Z^2\))</span> from a Klein bottle <span class="nw">(\(\Z \oplus \Z/2\)).</span>
	</p>
</Ahead>

<!-- ─────────────────────────────────────────────────────────────────── -->
<h2 id="cosets">Shifted copies: cosets</h2>

<p>
	From now on every group is abelian and written additively, as agreed in <Ref to="foundations/groups" hash="abelian" />.
	Start with the integers \(\Z\) and the subgroup of multiples of three,
	\[ 3\Z = \{\dots, -6, -3, 0, 3, 6, 9, \dots\} . \]
	Now <em>shift</em> it: add \(1\) to every element. You get
	\[ 1 + 3\Z = \{\dots, -5, -2, 1, 4, 7, 10, \dots\}, \]
	the numbers that leave remainder \(1\) when divided by three. Shift by \(2\) instead and you get
	<span class="nw">\(2 + 3\Z = \{\dots, -4, -1, 2, 5, 8, \dots\}\).</span> Shift by \(3\) and nothing new happens: \(3 + 3\Z\) is \(3\Z\)
	again. Shift by \(4\) and you are back to <span class="nw">\(1 + 3\Z\);</span> shift by \(-1\) and you get <span class="nw">\(2 + 3\Z\).</span>
</p>

<p>
	So there are exactly three different shifted copies of <span class="nw">\(3\Z\),</span> and together they contain every integer exactly once.
	Each integer belongs to one copy: the one named by its remainder.
</p>

<Definition id="def-coset" title="Coset">
	<p>
		Let \(H\) be a subgroup of an abelian group <span class="nw">\(G\),</span> and let <span class="nw">\(a \in G\).</span> The <dfn>coset</dfn> of \(H\) containing
		\(a\) is the shifted copy
		\[ a + H = \{\, a + h \;:\; h \in H \,\} . \]
		Any element of a coset is called a <dfn>representative</dfn> of it.
	</p>
</Definition>

<p>
	A coset usually has many names. <span class="nw">\(1 + 3\Z\),</span> \(4 + 3\Z\) and \(-5 + 3\Z\) are three names for one and the same set.
	When do two names describe the same coset? Exactly when the two representatives differ by an element of <span class="nw">\(H\):</span>
</p>

<Proposition id="prop-same-coset" title="When are two cosets equal?">
	<p>\(a + H = b + H\) if and only if <span class="nw">\(a - b \in H\).</span></p>
</Proposition>

<Proof>
	<p>
		Suppose <span class="nw">\(a + H = b + H\).</span> The element \(a = a + 0\) lies in <span class="nw">\(a + H\),</span> hence in <span class="nw">\(b + H\),</span> so \(a = b + h\) for some
		<span class="nw">\(h \in H\).</span> Then <span class="nw">\(a - b = h \in H\).</span>
	</p>
	<p>
		Conversely, suppose \(a - b = h_0\) with <span class="nw">\(h_0 \in H\).</span> Any element of \(a + H\) has the form <span class="nw">\(a + h = b + (h_0 +
		h)\),</span> and \(h_0 + h \in H\) because \(H\) is a subgroup; so it lies in <span class="nw">\(b + H\).</span> This shows \(a + H \subseteq b +
		H\) (read “is contained in”). Since \(b - a = -h_0\) is also in <span class="nw">\(H\),</span> the same argument with the roles swapped
		gives <span class="nw">\(b + H \subseteq a + H\).</span> So the two sets are equal.
	</p>
</Proof>

<p>
	This proposition says that the cosets of \(H\) are exactly the classes of the relation <span class="nw">“\(a \sim b\)</span> when <span class="nw">\(a - b \in
	H\)”,</span> and this is an <Term t="equivalence-relation">equivalence relation</Term> in the sense of
	<Ref to="foundations/equivalence" />. Each of the three requirements uses one property of a subgroup: it is
	<em>reflexive</em> because <span class="nw">\(a - a = 0 \in H\);</span> <em>symmetric</em> because if \(a - b \in H\) then its negative
	\(b - a\) is in <span class="nw">\(H\);</span> and <em>transitive</em> because if \(a - b\) and \(b - c\) are in <span class="nw">\(H\),</span> so is their sum
	<span class="nw">\(a - c\).</span> Therefore the cosets form a <Term t="partition">partition</Term> of <span class="nw">\(G\):</span> every element lies in exactly one
	coset, and two cosets are either identical or have nothing in common.
</p>

<Intuition title="Many ways to be wrong">
	<p>
		Think of \(H\) as the set of “right answers” and sort every element of \(G\) by <em>how</em> it fails to be in
		<span class="nw">\(H\).</span> The multiples of three are right; the numbers in \(1 + 3\Z\) are all wrong in the same way (one too many);
		those in \(2 + 3\Z\) are wrong in another way. Tai-Danae Bradley, on her blog Math3ma, sums it up with an old
		saying: “There are many ways to be wrong, but only one way to be right!” Exactly one coset is “right” — the subgroup
		\(H\) itself, the only coset containing <span class="nw">\(0\).</span>
	</p>
</Intuition>

<Warning title="Only one coset is a subgroup">
	<p>
		A coset \(a + H\) with \(a \notin H\) is <em>not</em> a subgroup: it does not even contain <span class="nw">\(0\).</span> (Is \(0\) in
		<span class="nw">\(1 + 3\Z\)?</span> No.) Cosets are shifted copies of a subgroup, not subgroups themselves.
	</p>
</Warning>

<p>
	A picture worth keeping in mind: in the plane <span class="nw">\(\R^2\),</span> take \(H\) to be a straight line through the origin. Its
	cosets are all the lines <em>parallel</em> to <span class="nw">\(H\),</span> one through each point of the plane. Every point lies on exactly
	one of them. You also met cosets, without the name, in <Ref to="foundations/groups" hash="injective" />: the elements
	that a homomorphism \(\varphi\) sends to the same place as \(a\) are exactly <span class="nw">\(a + \ker\varphi\).</span>
</p>

<h3 id="lagrange">Counting cosets: Lagrange’s theorem</h3>

<p>
	All cosets of \(H\) have the same size as <span class="nw">\(H\).</span> Indeed, the rule \(h \mapsto a + h\) matches the elements of \(H\)
	one-for-one with the elements of <span class="nw">\(a + H\):</span> every element of \(a + H\) is hit, and no two elements of \(H\) are sent to
	the same place (if \(a + h = a + h'\) then <span class="nw">\(h = h'\)).</span> For a finite group this has a striking consequence.
</p>

<Theorem title="Lagrange’s theorem">
	<p>
		If \(G\) is a finite group and \(H\) a subgroup, then the number of elements of \(H\) divides the number of
		elements of <span class="nw">\(G\).</span> More precisely, <span class="nw">\(|G| = [G : H] \cdot |H|\),</span> where <span class="nw">\([G : H]\),</span> the <dfn>index</dfn> of <span class="nw">\(H\),</span> is
		the number of cosets.
	</p>
</Theorem>

<Proof>
	<p>
		The cosets cut \(G\) into \([G : H]\) pieces with no overlaps, and each piece has exactly \(|H|\) elements.
	</p>
</Proof>

<p>
	For example, the subgroups of \(\Z/6\) found in <Ref to="foundations/groups" /> have \(1, 2, 3\) and \(6\) elements —
	all divisors of <span class="nw">\(6\).</span> There is no subgroup of \(\Z/6\) with four elements, and Lagrange tells us there could not
	be. Since the order of an element \(a\) is the size of the subgroup <span class="nw">\(\langle a \rangle\),</span> it follows that
	<em>the order of every element of a finite group divides the order of the group</em>.
</p>

<!-- ─────────────────────────────────────────────────────────────────── -->
<h2 id="quotient-groups">Collapsing each coset to a point: quotient groups</h2>

<p>
	Here is the decisive step. Instead of looking at the individual integers, look at the three cosets
	<span class="nw">\(3\Z\),</span> \(1 + 3\Z\) and <span class="nw">\(2 + 3\Z\),</span> and treat each of them as <em>a single object</em> — one dot, standing for the
	whole infinite pile of integers in it. Can we add these dots?
</p>

<p>
	Experience suggests that this step, treating a whole set as one thing, is the single hardest moment in a first course
	on groups. It is worth doing it with your own hands.
</p>

<Figure size="wide" num="1.4.1" title="Collapse the cosets" hint="Choose a stage · tap two integers (or two dots) to add">
	<CosetCollapse />
	{#snippet caption()}
		Stage 1: the integers, coloured by their coset of <span class="nw">\(n\Z\).</span> Stage 2: sorted into rows; each row is one coset, a shifted
		copy of <span class="nw">\(n\Z\).</span> Stage 3: each row collapses to a single dot, and these \(n\) dots <em>are</em> the group
		<span class="nw">\(\Z/n\Z\).</span> In stage 2, tap a representative \(a\) of one row and a representative \(b\) of another: the row
		containing \(a + b\) never depends on which representatives you tapped. That is why adding the dots makes sense.
	{/snippet}
</Figure>

<p>
	The natural rule for adding cosets is: to add two cosets, pick a representative of each, add the representatives, and
	take the coset of the result:
	\[ (a + H) + (b + H) = (a + b) + H . \]
	But there is a worry, and it is not a small one. A coset has many representatives. If somebody else picked different
	representatives of the same two cosets, would they get the same answer? If not, the “rule” would not be a rule at
	all. (This is the question of being <Term t="well-defined">well defined</Term>, from
	<Ref to="foundations/equivalence" />.) In \(\Z\) with <span class="nw">\(H = 3\Z\),</span> for example: \(1 + 3\Z\) is also <span class="nw">\(4 + 3\Z\),</span> and
	\(2 + 3\Z\) is also <span class="nw">\(-1 + 3\Z\).</span> Adding the first names gives <span class="nw">\(1 + 2 = 3\);</span> adding the second names gives
	\(4 + (-1) = 3\) too. Lucky? No:
</p>

<Proposition id="prop-well-defined" title="Adding cosets is well defined">
	<p>
		If \(a + H = a' + H\) and <span class="nw">\(b + H = b' + H\),</span> then <span class="nw">\((a + b) + H = (a' + b') + H\).</span>
	</p>
</Proposition>

<Proof>
	<p>
		By the proposition on equal cosets, \(a - a' \in H\) and <span class="nw">\(b - b' \in H\).</span> Their sum is in \(H\) too, because \(H\)
		is a subgroup. Rearranging (which is allowed because \(G\) is abelian),
		\[ (a - a') + (b - b') = (a + b) - (a' + b') , \]
		so <span class="nw">\((a + b) - (a' + b') \in H\),</span> and by the same proposition <span class="nw">\((a + b) + H = (a' + b') + H\).</span>
	</p>
</Proof>

<Definition id="def-quotient" title="Quotient group">
	<p>
		Let \(H\) be a subgroup of an abelian group <span class="nw">\(G\).</span> The <dfn>quotient group</dfn> \(G/H\) (read <span class="nw">“\(G\)</span> mod <span class="nw">\(H\)”</span> or
		<span class="nw">“\(G\)</span> modulo <span class="nw">\(H\)”)</span> is the set of cosets of <span class="nw">\(H\),</span> with the addition
		\[ (a + H) + (b + H) = (a + b) + H . \]
		Its zero is the coset <span class="nw">\(0 + H = H\),</span> and the negative of \(a + H\) is <span class="nw">\(-a + H\).</span> The function
		\[ q\colon G \to G/H, \qquad q(a) = a + H , \]
		which sends each element to its coset, is called the <dfn>quotient homomorphism</dfn>.
	</p>
</Definition>

<p>
	Everything here has already been checked: the addition is well defined; it is associative and commutative because
	the addition of \(G\) is; <span class="nw">\(H + (a + H) = (0 + a) + H = a + H\),</span> so \(H\) is the zero; and <span class="nw">\((a + H) + (-a + H) = 0
	+ H\).</span> The quotient homomorphism \(q\) is a homomorphism because <span class="nw">\(q(a + b) = (a + b) + H = q(a) + q(b)\);</span> it is
	surjective (every coset is the coset of something); and its kernel is exactly <span class="nw">\(H\),</span> since \(q(a) = H\) means <span class="nw">\(a + H
	= 0 + H\),</span> which means <span class="nw">\(a \in H\).</span>
</p>

<KeyIdea title="A quotient declares a subgroup to be zero">
	<p>
		In <span class="nw">\(G/H\),</span> an element \(a\) becomes zero exactly when <span class="nw">\(a \in H\).</span> Two elements become equal exactly when they
		differ by an element of <span class="nw">\(H\).</span> So passing from \(G\) to \(G/H\) means: <em>keep the addition, but declare
		everything in \(H\) to be zero</em>. Clock arithmetic \(\Z/n\Z\) is the integers with every multiple of \(n\)
		declared zero. Homology will be cycles with every boundary declared zero.
	</p>
</KeyIdea>

<h3 id="three-views">Three ways to look at \(\Z/n\Z\)</h3>

<p>
	With \(G = \Z\) and <span class="nw">\(H = n\Z\),</span> the quotient \(\Z/n\Z\) is our clock arithmetic \(\Z/n\) (we will prove the two are
	isomorphic in a moment, but you can already see it in Figure 1.4.1). Education researchers have found that learners
	often hold one of three pictures of its elements, and that trouble comes from holding only one. All three are
	correct, and you should be able to switch between them.
</p>

<ol>
	<li>
		<strong>An element is an infinite set.</strong> The element we call \(2\) in \(\Z/5\Z\) is the coset
		<span class="nw">\(2 + 5\Z = \{\dots, -8, -3, 2, 7, 12, \dots\}\).</span>
	</li>
	<li>
		<strong>An element is a single point of a new group.</strong> In Figure 1.4.1, after the collapse, that whole
		infinite set is one dot. The new group has exactly five dots.
	</li>
	<li>
		<strong>An element is named by a representative.</strong> We write <span class="nw">“\(2\)”</span> as shorthand for the dot, and compute
		with names: <span class="nw">\(3 + 4 = 7 = 2\).</span> This shortcut is safe <em>precisely because</em> addition of cosets is well
		defined: any names give the same answer.
	</li>
</ol>

<Warning title="A quotient is not a subgroup">
	<p>
		Keith Conrad puts it bluntly in his notes on quotient groups: “Don’t confuse quotient groups and subgroups!” The
		names \(\{0, 1, \dots, n-1\}\) are integers, but \(\Z/n\Z\) does not sit inside <span class="nw">\(\Z\):</span> that set is not closed under
		the addition of <span class="nw">\(\Z\),</span> and in \(\Z/n\Z\) every element has finite order while in \(\Z\) no nonzero element does. A
		subgroup is a <em>part</em> of a group; a quotient is the <em>whole</em> group, collapsed.
	</p>
</Warning>

<Remark title="What changes for non-abelian groups">
	<p>
		The proof that adding cosets is well defined used commutativity, in the rearranging step. For non-abelian groups the
		same construction only works for special subgroups, called <em>normal</em> subgroups. Since homology lives
		entirely in the abelian world, we never need them; Conrad’s notes and Judson’s book in the further reading explain
		the general story.
	</p>
</Remark>

<h3 id="circle">The real line wrapped into a circle</h3>

<p>
	Now take <span class="nw">\(G = \R\),</span> the real numbers, and <span class="nw">\(H = \Z\),</span> the integers inside them. Two real numbers lie in the same
	coset when they differ by a whole number: <span class="nw">\(0.3\),</span> <span class="nw">\(1.3\),</span> \(2.3\) and \(-0.7\) all belong to the coset <span class="nw">\(0.3 +
	\Z\).</span> Each coset contains exactly one number in the interval \(0 \le t < 1\) (the “fractional part”), so you might
	think \(\R/\Z\) is just that interval. But look at what happens near the ends: \(0.99\) and \(0.01\) are very far
	apart in the interval, yet adding \(0.02\) to the first gives <span class="nw">\(1.01\),</span> which is in the coset of <span class="nw">\(0.01\).</span> In \(\R/\Z\)
	the two ends of the interval are glued together, and the result is a <em>circle</em>.
</p>

<Figure size="wide" num="1.4.2" title="ℝ/ℤ is a circle" hint="Press play or drag “wrap” · move the coset · drag to rotate">
	<CircleQuotient3D />
	{#snippet caption()}
		The real line, with the integers marked in teal and one coset \(t_0 + \Z\) in gold, coils into a spring whose every
		turn has length <span class="nw">\(1\),</span> and then flattens. Every gold bead ends on the same point, and every teal bead on another:
		each coset of \(\Z\) has become a single point of a circle. Adding cosets is adding angles — a quarter turn plus a
		half turn is three quarters of a turn, whatever representatives you use.
	{/snippet}
</Figure>

<p>
	Adding in \(\R/\Z\) is adding fractions of a turn: <span class="nw">\(0.7 + 0.5 = 1.2\),</span> which lies in the coset <span class="nw">\(0.2 + \Z\),</span> so in
	\(\R/\Z\) “seven tenths of a turn plus half a turn is a fifth of a turn”. This is why \(\R/\Z\) is called the
	<dfn>circle group</dfn>. Conrad’s sentence at the top of this chapter uses the same circle with a different
	circumference, <span class="nw">\(\R/2\pi\Z\):</span> the real numbers with multiples of \(2\pi\) declared zero, which is how angles in
	radians behave. Gluing the ends of an interval to make a circle is also your first example of building a
	<em>shape</em> as a quotient — the subject of <Ref to="topology/gluing" />.
</p>

<h3 id="lattice-quotients">Collapsing a lattice</h3>

<p>
	For a two-dimensional example, take <span class="nw">\(G = \Z^2\),</span> the points of the plane whose two coordinates are integers, added
	coordinate by coordinate: <span class="nw">\((1, 2) + (3, -1) = (4, 1)\).</span> (This is the <dfn>integer lattice</dfn>; we will meet it
	again as the direct sum <span class="nw">\(\Z \oplus \Z\).)</span> For <span class="nw">\(H\),</span> take all integer combinations of the two vectors \(v = (2, 1)\)
	and <span class="nw">\(w = (1, 2)\):</span>
	\[ H = \langle v, w \rangle = \{\, m\,(2, 1) + n\,(1, 2) \;:\; m, n \in \Z \,\} . \]
	How many cosets does \(H\) have, and what group is <span class="nw">\(\Z^2/H\)?</span> Explore before reading on.
</p>

<Figure size="full" num="1.4.3" title="Collapsing a lattice" hint="Drag the tips of v and w · or tap points · try the presets">
	<LatticeQuotient />
	{#snippet caption()}
		Every lattice point is coloured by its coset of <span class="nw">\(H\);</span> the points of \(H\) itself are the large glowing ones. The
		shaded parallelogram spanned by \(v\) and \(w\) contains exactly one point of each colour (ringed), and its
		translates tile the plane, so the number of cosets equals its area, the absolute value of the determinant. Drag the
		vectors until they line up (determinant zero): suddenly there are infinitely many cosets, and the quotient contains
		a copy of <span class="nw">\(\Z\).</span>
	{/snippet}
</Figure>

<p>
	With \(v = (2, 1)\) and \(w = (1, 2)\) there are three colours. The shaded tile, the parallelogram with corners <span class="nw">\(0,
	v, v + w, w\),</span> has area
	\[ \det\begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix} = 2 \cdot 2 - 1 \cdot 1 = 3 . \]
	(For a \(2 \times 2\) matrix, the <em>determinant</em> \(\det\begin{pmatrix} p & q \\ r & s \end{pmatrix} = ps - qr\)
	is the signed area of the parallelogram spanned by its columns; <Ref to="foundations/linear-algebra" /> explains why.)
	Why should the number of cosets equal the area? The translates of the tile cover the plane without overlapping, and
	each tile contains exactly one point of each coset. A large region of area \(A\) contains about \(A\) lattice points
	and about \(A/3\) tiles, so each tile must hold \(3\) points: three cosets. And a group with three elements must be
	\(\Z/3\) (by Lagrange, each nonzero element has order dividing <span class="nw">\(3\),</span> so it generates everything). So
	\[ \Z^2 / \langle (2,1), (1,2) \rangle \;\cong\; \Z/3 . \]
	Other choices give other answers: <span class="nw">\(v = (2, 0)\),</span> \(w = (0, 2)\) gives four cosets, forming the group we will call <span class="nw">\(\Z/2 \oplus \Z/2\)</span> in the section on
	direct sums;
	<span class="nw">\(v = (2, 0)\),</span> \(w = (0, 3)\) gives six, forming <span class="nw">\(\Z/6\).</span> When the determinant is zero the quotient is infinite. How
	to name the quotient in general is the subject of the sections on direct sums and on generators and relations; the
	figure already uses the method.
</p>

<!-- ─────────────────────────────────────────────────────────────────── -->
<h2 id="first-isomorphism">The First Isomorphism Theorem</h2>

<p>
	Quotients and homomorphisms are two sides of one coin. Every quotient comes with a homomorphism, <span class="nw">\(q\colon G \to
	G/H\),</span> whose kernel is <span class="nw">\(H\).</span> Conversely, every homomorphism comes with a quotient: in
	<Ref to="foundations/groups" hash="injective" /> we saw that the elements a homomorphism \(\varphi\) sends to the same
	point form a coset of its kernel, <span class="nw">\(a + \ker\varphi\).</span> Collapse those cosets, and the homomorphism stops losing
	information.
</p>

<Theorem id="thm-first-iso" title="First Isomorphism Theorem">
	<p>
		Let \(\varphi\colon G \to H\) be a homomorphism of abelian groups. Then the rule
		\[ \bar\varphi(a + \ker\varphi) = \varphi(a) \]
		is a well-defined isomorphism \(\bar\varphi\colon G/\ker\varphi \to \im\varphi\). In short,
		\[ G/\ker\varphi \;\cong\; \im\varphi . \]
	</p>
</Theorem>

<p>
	(The bar in <span class="nw">\(\bar\varphi\),</span> read “phi bar”, marks the new map that \(\varphi\) induces on the quotient.) Before the
	proof, watch it happen.
</p>

<Figure size="wide" num="1.4.4" title="The First Isomorphism Theorem" hint="Step through · choose k">
	<FirstIsoTheorem />
	{#snippet caption()}
		The homomorphism \(\varphi(x) = kx\) on <span class="nw">\(\Z/12\).</span> Colour each element by where it lands; elements of the same colour
		form a coset of the kernel (gold). Pile each coset above the point it lands on, collapse each pile to one dot, and
		what remains matches the image perfectly, one dot to one point. Collapse what \(\varphi\) cannot see, and what
		remains is exactly what it reaches.
	{/snippet}
</Figure>

<Proof>
	<p>Write <span class="nw">\(K = \ker\varphi\).</span> There are four things to check.</p>
	<p>
		<em>Well defined.</em> A coset has many representatives, so we must check that \(\varphi(a)\) does not depend on
		which one we use. If <span class="nw">\(a + K = a' + K\),</span> then <span class="nw">\(a - a' \in K\),</span> so \(\varphi(a) - \varphi(a') = \varphi(a - a') =
		0\), that is, <span class="nw">\(\varphi(a) = \varphi(a')\).</span>
	</p>
	<p>
		<em>A homomorphism.</em> \(\bar\varphi\big((a + K) + (b + K)\big) = \bar\varphi\big((a + b) + K\big) = \varphi(a +
		b) = \varphi(a) + \varphi(b) = \bar\varphi(a + K) + \bar\varphi(b + K)\).
	</p>
	<p>
		<em>Injective.</em> By the theorem of <Ref to="foundations/groups" hash="injective" />, it is enough to show that the
		kernel of \(\bar\varphi\) contains only the zero of <span class="nw">\(G/K\).</span> If <span class="nw">\(\bar\varphi(a + K) = 0\),</span> then <span class="nw">\(\varphi(a) = 0\),</span>
		so <span class="nw">\(a \in K\),</span> so <span class="nw">\(a + K = K\),</span> which is the zero of <span class="nw">\(G/K\).</span>
	</p>
	<p>
		<em>Onto the image.</em> Every element of \(\im\varphi\) has the form <span class="nw">\(\varphi(a) = \bar\varphi(a + K)\).</span>
	</p>
</Proof>

<Example title="The theorem at work">
	<ul>
		<li>
			Reduction \(\Z \to \Z/n\) (the clock reading) has kernel \(n\Z\) and image everything, so <span class="nw">\(\Z/n\Z \cong \Z/n\).</span>
			This is the promised proof that the quotient of Figure 1.4.1 <em>is</em> clock arithmetic.
		</li>
		<li>
			The map <span class="nw">\(\Z^2 \to \Z\),</span> <span class="nw">\((a, b) \mapsto a - b\),</span> is a homomorphism. Its kernel is \(\{(t, t) : t \in \Z\} =
			\langle (1, 1) \rangle\), the diagonal; its image is all of \(\Z\) (the point \((m, 0)\) goes to <span class="nw">\(m\)).</span> So
			<span class="nw">\(\Z^2 / \langle (1, 1) \rangle \cong \Z\):</span> collapsing every diagonal line of the lattice to a point leaves a copy
			of the number line.
		</li>
		<li>
			Doubling on a 6-hour clock, <span class="nw">\(\varphi(x) = 2x\),</span> has kernel \(\{0, 3\}\) and image <span class="nw">\(\{0, 2, 4\}\).</span> So
			<span class="nw">\((\Z/6)/\{0, 3\} \cong \{0, 2, 4\} \cong \Z/3\).</span>
		</li>
	</ul>
</Example>

<Corollary title="Counting">
	<p>
		If \(G\) is finite and \(\varphi\colon G \to H\) is a homomorphism, then <span class="nw">\(|G| = |\ker\varphi| \cdot
		|\im\varphi|\).</span>
	</p>
</Corollary>

<p>
	(By Lagrange, <span class="nw">\(|G/\ker\varphi| = |G| / |\ker\varphi|\),</span> and by the theorem this is <span class="nw">\(|\im\varphi|\).)</span> This is the
	pattern you noticed in Figure 1.3.6. Its counterpart for vector spaces, “dimension of the kernel plus dimension of the
	image equals dimension of the domain”, is the rank–nullity theorem of <Ref to="foundations/linear-algebra" />, and it
	will be the reason the Euler characteristic can be computed from homology.
</p>

<!-- ─────────────────────────────────────────────────────────────────── -->
<h2 id="direct-sums">Side by side: direct sums</h2>

<p>
	Quotients make groups smaller. The opposite construction puts two groups side by side.
</p>

<Definition title="Direct sum">
	<p>
		The <dfn>direct sum</dfn> \(G \oplus H\) (read <span class="nw">“\(G\)</span> direct sum <span class="nw">\(H\)”,</span> or <span class="nw">“\(G\)</span> plus <span class="nw">\(H\)”)</span> of two abelian groups
		is the set of pairs \((g, h)\) with \(g \in G\) and <span class="nw">\(h \in H\),</span> added coordinate by coordinate:
		\[ (g, h) + (g', h') = (g + g', \; h + h') . \]
		Similarly for more than two groups; we write \(\Z^n\) for \(\Z \oplus \Z \oplus \dots \oplus \Z\) <span class="nw">(\(n\)</span> copies).
	</p>
</Definition>

<p>
	Think of two dials that turn independently: the first coordinate lives on one dial, the second on the other, and an
	addition turns each dial by its own amount. Its zero is \((0, 0)\) and <span class="nw">\(-(g, h) = (-g, -h)\).</span> Some examples:
</p>

<ul>
	<li>\(\Z \oplus \Z = \Z^2\) is the integer lattice of the previous section.</li>
	<li>
		\(\Z/2 \oplus \Z/2\) has four elements, <span class="nw">\((0,0), (1,0), (0,1), (1,1)\),</span> each of which added to itself gives
		<span class="nw">\((0,0)\).</span> It is the group of symmetries of a rectangle from <Ref to="foundations/groups" hash="isomorphism" />, with
		<span class="nw">\(h \mapsto (1, 0)\),</span> <span class="nw">\(v \mapsto (0, 1)\),</span> <span class="nw">\(t \mapsto (1, 1)\).</span>
	</li>
	<li>
		\(\Z \oplus \Z/2\) is like a ladder with two rails: a copy of the integers on each rail, where adding \((0, 1)\)
		hops to the other rail and hopping twice brings you back.
	</li>
</ul>

<p>
	A direct sum inherits orders in a simple way: the multiple \(k\cdot(g, h)\) is zero exactly when \(kg = 0\) and <span class="nw">\(kh =
	0\).</span> So the order of \((g, h)\) is the smallest number that is a multiple of both orders: their <dfn>least common
	multiple</dfn>, <span class="nw">\(\operatorname{lcm}\).</span> For instance in \(\Z/4 \oplus \Z/6\) the element \((1, 1)\) has order
	<span class="nw">\(\operatorname{lcm}(4, 6) = 12\).</span>
</p>

<h3 id="crt">When are two clocks one clock?</h3>

<p>
	Here is a puzzle that shows why we must be careful with names. Both \(\Z/2 \oplus \Z/3\) and \(\Z/6\) have six
	elements. Are they the same group? And \(\Z/2 \oplus \Z/2\) and <span class="nw">\(\Z/4\),</span> with four elements each?
</p>

<Figure size="wide" num="1.4.5" title="Two clocks ticking together" hint="Step or play · change m and n">
	<GearsCRT />
	{#snippet caption()}
		Each step adds <span class="nw">\((1, 1)\):</span> both hands advance one hour. The grid records the pairs visited; leaving it on one side
		re-enters on the other, as on a torus. With \(m = 2\) and \(n = 3\) the walk visits all six cells before coming home,
		so \((1,1)\) generates everything. With \(m = n = 2\) it comes home after two steps, having seen only half the cells.
	{/snippet}
</Figure>

<Theorem title="When ℤ/m ⊕ ℤ/n is cyclic">
	<p>
		\(\Z/m \oplus \Z/n \cong \Z/mn\) if and only if <span class="nw">\(\gcd(m, n) = 1\).</span>
	</p>
</Theorem>

<Proof>
	<p>
		The element \((1, 1)\) has order <span class="nw">\(\operatorname{lcm}(m, n)\).</span> If <span class="nw">\(\gcd(m, n) = 1\),</span> then <span class="nw">\(\operatorname{lcm}(m,
		n) = mn\),</span> the number of elements of the group; so the multiples of \((1, 1)\) are all different and fill the whole
		group, which is therefore cyclic of order <span class="nw">\(mn\),</span> that is, isomorphic to <span class="nw">\(\Z/mn\).</span>
	</p>
	<p>
		If <span class="nw">\(\gcd(m, n) = d > 1\),</span> then \(L = \operatorname{lcm}(m, n) = mn/d\) is smaller than <span class="nw">\(mn\).</span> Every element
		\((a, b)\) satisfies <span class="nw">\(L\cdot(a, b) = (La, Lb) = (0, 0)\),</span> because \(L\) is a multiple of both \(m\) and <span class="nw">\(n\).</span> So
		every element has order at most <span class="nw">\(L < mn\),</span> and none can generate the group. Since \(\Z/mn\) <em>does</em> have an
		element of order <span class="nw">\(mn\),</span> the two groups are not isomorphic.
	</p>
</Proof>

<p>
	So \(\Z/2 \oplus \Z/3 \cong \Z/6\) and <span class="nw">\(\Z/3 \oplus \Z/4 \cong \Z/12\),</span> while \(\Z/2 \oplus \Z/2 \not\cong \Z/4\)
	and <span class="nw">\(\Z/2 \oplus \Z/4 \not\cong \Z/8\).</span> The same group can wear very different names — \(\Z/6\) “is” \(\Z/2 \oplus
	\Z/3\) — which is why we will need a standard way of naming abelian groups.
</p>

<History title="The Chinese remainder theorem">
	<p>
		The theorem is named after a puzzle in the Chinese text <em>Sunzi Suanjing</em> (“Master Sun’s Mathematical
		Manual”, written between the third and fifth centuries): find a number that leaves remainder 2 when divided by 3,
		remainder 3 when divided by 5, and remainder 2 when divided by 7. In our language, the puzzle asks for the element of
		\(\Z/105\) that corresponds to \((2, 3, 2)\) in <span class="nw">\(\Z/3 \oplus \Z/5 \oplus \Z/7\).</span> One answer is 23.
	</p>
</History>

<!-- ─────────────────────────────────────────────────────────────────── -->
<h2 id="free-abelian-groups">Formal sums: free abelian groups</h2>

<p>
	Imagine a market stall that sells apples, bananas and cherries. At the end of the day the stallholder writes down
	what changed hands: “two apples sold, four bananas sold, one cherry returned”. A compact way to write this is
	\[ 2a + 4b - c , \]
	where the letters are <em>names</em> of the three kinds of fruit, not numbers. This is a <dfn>formal sum</dfn>:
	“formal” because it is not evaluated — \(a + b\) does not simplify to anything, it simply records one apple and one
	banana. (The fruit-stand picture is borrowed from Michael Postol’s notes in the further reading.)
</p>

<p>Formal sums obey the arithmetic of inventories:</p>

<ul>
	<li>
		they are added and subtracted kind by kind: \((2a + 4b - c) + (a - 4b + 3c) = 3a + 2c\) — the bananas cancel, and a
		term with coefficient \(0\) is simply not written;
	</li>
	<li>the empty inventory, with every coefficient zero, is written <span class="nw">\(0\);</span></li>
	<li>negative coefficients are debts, and every inventory can be cancelled by its negative;</li>
	<li>the order in which the items are listed never matters.</li>
</ul>

<p>In other words, inventories form an abelian group.</p>

<Definition id="def-free" title="Free abelian group">
	<p>
		Let \(S\) be a finite set of symbols. The <dfn>free abelian group</dfn> on <span class="nw">\(S\),</span> written <span class="nw">\(\Z[S]\),</span> is the set of
		formal sums
		\[ n_1 s_1 + n_2 s_2 + \dots + n_k s_k \qquad (s_i \in S,\ n_i \in \Z), \]
		added coefficient by coefficient. Two formal sums are equal exactly when every symbol has the same coefficient in
		both.
	</p>
</Definition>

<p>
	If \(S = \{a, b, c\}\) then \(\Z[S]\) is just \(\Z^3\) in disguise: the formal sum \(2a - b + 3c\) corresponds to the
	triple of coefficients <span class="nw">\((2, -1, 3)\),</span> and adding formal sums is adding triples. The only difference is that the
	coordinates have <em>names</em>. That difference matters for us, because the names will be the pieces of a shape. In
	the next figure the three symbols are drawn as the three edges of a triangle, each with a chosen direction.
</p>

<Figure size="wide" num="1.4.6" title="Inventories of edges" hint="Step the coefficients · choose + or − · try the presets">
	<InventoryCalculator />
	{#snippet caption()}
		The symbols \(a, b, c\) are the edges of a triangle, each with an arrow. A coefficient is drawn as the thickness of
		an edge, and a negative coefficient reverses its arrow. Sums are computed coefficient by coefficient; terms with
		coefficient zero vanish (dashed). The preset “around the triangle” produces <span class="nw">\(a + b - c\):</span> walking once around the
		triangle uses \(a\) and \(b\) forwards and \(c\) backwards. Soon such formal sums will be called
		<em>chains</em>, and those that go around a loop, <em>cycles</em>.
	{/snippet}
</Figure>

<p>
	Look at \(a + b - c\) in the figure: it records a walk once around the triangle, with the minus sign saying that edge
	\(c\) is traversed against its arrow. This is precisely how <Ref to="homology/chains" /> will describe a loop in a
	shape: as a formal sum of edges, with signs for direction. And \(2(a + b - c)\) goes around twice.
</p>

<h3 id="bases">Bases and rank</h3>

<p>
	The symbols \(a, b, c\) have a special property: every element of \(\Z[a, b, c]\) can be written as an integer
	combination of them in <em>exactly one</em> way. That property can be shared by other sets of elements.
</p>

<Definition title="Basis and rank">
	<p>
		A <dfn>basis</dfn> of an abelian group \(F\) is a set of elements \(e_1, \dots, e_r\) such that every element of
		\(F\) can be written as \(n_1 e_1 + \dots + n_r e_r\) with integers <span class="nw">\(n_i\),</span> in exactly one way. A group with a
		finite basis is called <em>free</em>, and the number of elements of a basis is its <dfn>rank</dfn>.
	</p>
</Definition>

<p>
	Take <span class="nw">\(\Z[a, b]\).</span> The pair \(\{a, b\}\) is a basis, of course. So is <span class="nw">\(\{a, a + b\}\):</span> any element \(pa + qb\) equals
	<span class="nw">\((p - q)\,a + q\,(a + b)\),</span> and in only one way. But \(\{2a, b\}\) is not a basis — you cannot reach \(a\) itself,
	because \(n \cdot 2a + m b = a\) would need <span class="nw">\(2n = 1\).</span> And \(\{a, b, a + b\}\) is not a basis either: it reaches
	everything, but \(a + b\) can be written in two ways (as <span class="nw">\(1 \cdot (a + b)\),</span> or as <span class="nw">\(1 \cdot a + 1 \cdot b\)).</span>
</p>

<Warning title="No dividing allowed">
	<p>
		If you know some linear algebra, \(\{2a, b\}\) looks like a perfectly good basis: just divide by <span class="nw">\(2\).</span> Over the
		integers you may not divide, and this single restriction is the source of everything interesting in this chapter,
		from \(\Z/n\) to torsion. Linear algebra over \(\Z\) is “linear algebra where you are not allowed to divide”.
	</p>
</Warning>

<p>
	Is the rank well defined — could one free group have bases of different sizes? No: every basis of \(\Z^r\) has exactly
	\(r\) elements. Here is a short reason. If \(e_1, \dots, e_r\) is a basis of <span class="nw">\(F\),</span> then the quotient \(F/2F\) (where
	\(2F\) is the subgroup of doubles <span class="nw">\(2x\))</span> consists of the combinations \(n_1 e_1 + \dots + n_r e_r\) with each \(n_i\)
	only mattering mod <span class="nw">\(2\),</span> so it has exactly \(2^r\) elements. Since \(F/2F\) was defined without mentioning any basis,
	<span class="nw">\(2^r\),</span> and hence <span class="nw">\(r\),</span> cannot depend on the basis.
</p>

<h3 id="linearity">Defining a homomorphism on a basis</h3>

<p>
	Free abelian groups have one more property that makes them indispensable: it is very easy to define homomorphisms out
	of them.
</p>

<Proposition title="Homomorphisms are decided by a basis">
	<p>
		Let \(F\) be free with basis <span class="nw">\(e_1, \dots, e_r\),</span> and let \(G\) be any abelian group. For <em>any</em> choice of
		elements \(g_1, \dots, g_r\) of \(G\) there is exactly one homomorphism \(\varphi\colon F \to G\) with
		<span class="nw">\(\varphi(e_i) = g_i\),</span> namely
		\[ \varphi(n_1 e_1 + \dots + n_r e_r) = n_1 g_1 + \dots + n_r g_r . \]
	</p>
</Proposition>

<p>
	This is well defined because each element of \(F\) has exactly one expression in the basis, and it respects addition
	because coefficients add. In words: <em>say where each basis element goes, and the rest is forced</em>. In homology the
	boundary map is defined in just this way — by saying what the boundary of each single edge or triangle is — and then
	extended to all formal sums (the exercises give a first taste).
</p>

<Warning title="Free abelian is not free">
	<p>
		There is also a “free group” on the letters <span class="nw">\(a, b\),</span> in which \(ab\) and \(ba\) are different. It is not abelian,
		it is much bigger than <span class="nw">\(\Z^2\),</span> and it is the fundamental group of a figure-eight (<Ref to="topology/homotopy" />).
		Our free <em>abelian</em> group is what you get if, on top of everything, you let the letters commute.
	</p>
</Warning>

<p>
	Finally, a fact we will use without proof: <em>every subgroup of \(\Z^r\) is itself free, of rank at most \(r\)</em>.
	For example the subgroup \(2\Z \oplus 0\) of \(\Z^2\) is free with basis <span class="nw">\(\{(2, 0)\}\).</span> In homology this guarantees
	that the cycles and the boundaries, which are subgroups of a free group of chains, are free too.
</p>

<!-- ─────────────────────────────────────────────────────────────────── -->
<h2 id="presentations">Generators and relations</h2>

<p>
	A free abelian group is built from generators that obey no rules except commutativity. To build other groups, we add
	rules. The notation
	\[ \langle\, a \mid 3a = 0 \,\rangle \]
	(read “the group generated by <span class="nw">\(a\),</span> subject to <span class="nw">\(3a = 0\)”)</span> means: start with all the integer multiples of a symbol
	<span class="nw">\(a\),</span> and impose the single rule \(3a = 0\) together with everything it implies <span class="nw">(\(6a = 0\),</span> <span class="nw">\(4a = a\),</span> and so on),
	but nothing more. The result has the three elements <span class="nw">\(0, a, 2a\):</span> it is <span class="nw">\(\Z/3\).</span> Think of generators as Lego bricks
	and relations as the rules about which constructions count as “nothing”.
</p>

<ul>
	<li>\(\langle\, a, b \mid 2a = 0 \,\rangle \cong \Z/2 \oplus \Z\): \(a\) is a twist that undoes itself when doubled, and \(b\) is free.</li>
	<li>\(\langle\, a, b \mid a - b = 0 \,\rangle \cong \Z\): the relation says <span class="nw">\(a = b\),</span> so there is really one generator.</li>
	<li><span class="nw">\(\langle\, a, b \mid \;\rangle \cong \Z^2\):</span> no relations at all gives the free abelian group.</li>
</ul>

<p>
	Precisely: a relation is a formal sum declared to be zero, and declaring things zero is exactly what a quotient does.
</p>

<Definition title="Presentation">
	<p>
		The group \(\langle\, g_1, \dots, g_m \mid r_1 = 0, \dots, r_k = 0 \,\rangle\), where each \(r_j\) is a formal sum of
		the <span class="nw">\(g_i\),</span> is the quotient of the free abelian group \(\Z[g_1, \dots, g_m] \cong \Z^m\) by the subgroup generated by
		<span class="nw">\(r_1, \dots, r_k\).</span> Writing the coefficients of each relation as a column gives an \(m \times k\)
		<dfn>relation matrix</dfn> <span class="nw">\(A\),</span> with one row for each generator and one column for each relation; then the group
		is \(\Z^m\) modulo the integer combinations of the columns of <span class="nw">\(A\).</span>
	</p>
</Definition>

<p>
	For example, \(\langle\, a, b \mid 2a + b = 0,\ a + 2b = 0 \,\rangle\) has relation matrix
	<span class="nw">\(\begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix}\):</span> it is \(\Z^2\) modulo the integer combinations of \((2, 1)\) and <span class="nw">\((1,
	2)\),</span> which is exactly the lattice quotient of Figure 1.4.3. We found that it has three elements. Here are two ways to
	see which group it is.
</p>

<p>
	<strong>By substitution.</strong> The second relation says <span class="nw">\(a = -2b\).</span> Substitute into the first: <span class="nw">\(2(-2b) + b = -3b =
	0\),</span> so <span class="nw">\(3b = 0\).</span> Every element can be written using \(b\) alone, and the only rule left is <span class="nw">\(3b = 0\).</span> So the group
	is <span class="nw">\(\langle\, b \mid 3b = 0 \,\rangle \cong \Z/3\).</span>
</p>

<p>
	<strong>By matrix operations.</strong> Certain changes to the relation matrix never change the group it presents:
</p>

<ul>
	<li>
		<em>column operations</em> — swap two columns, multiply a column by <span class="nw">\(-1\),</span> or add an integer multiple of one column
		to another — replace the relations by an equivalent list (each new relation follows from the old ones and vice
		versa, so the same things are declared zero);
	</li>
	<li>
		<em>row operations</em> of the same three kinds correspond to choosing new generators (for instance, using
		\(a' = a + 2b\) in place of <span class="nw">\(a\)).</span>
	</li>
</ul>

<p>
	Using these operations, every integer matrix can be brought to a diagonal form in which each diagonal entry divides the
	next, called its <dfn>Smith normal form</dfn> (after Henry John Stephen Smith, who studied it in 1861; the general
	algorithm is in <Ref to="foundations/linear-algebra" />). For our matrix: swap the two columns; subtract twice the
	first row from the second; subtract twice the first column from the second; multiply the second row by <span class="nw">\(-1\):</span>
	\[
		\begin{pmatrix} 2 & 1 \\ 1 & 2 \end{pmatrix} \to
		\begin{pmatrix} 1 & 2 \\ 2 & 1 \end{pmatrix} \to
		\begin{pmatrix} 1 & 2 \\ 0 & -3 \end{pmatrix} \to
		\begin{pmatrix} 1 & 0 \\ 0 & -3 \end{pmatrix} \to
		\begin{pmatrix} 1 & 0 \\ 0 & 3 \end{pmatrix} .
	\]
	A diagonal matrix is easy to read: the new generators \(a', b'\) are subject only to \(1\cdot a' = 0\) and <span class="nw">\(3 b' =
	0\).</span> The first relation kills \(a'\) entirely, and the second makes \(b'\) a 3-hour clock: the group is <span class="nw">\(0 \oplus
	\Z/3 = \Z/3\).</span> In general, a diagonal entry \(d\) contributes a factor \(\Z/d\) (nothing at all when <span class="nw">\(d = 1\)),</span> and
	every generator with no diagonal entry left over contributes a free <span class="nw">\(\Z\).</span>
</p>

<Figure size="wide" num="1.4.7" title="From relations to a group" hint="Edit the matrix · step through · try the presets">
	<ClassificationExplorer />
	{#snippet caption()}
		Type any small relation matrix: one row per generator, one column per relation. The stepper diagonalises it by
		integer row and column operations — each step changes the presentation but never the group — until each diagonal
		entry divides the next. Then the group can be read off. The presets include the presentations that homology will
		produce for the torus, the Klein bottle and the projective plane.
	{/snippet}
</Figure>

<!-- ─────────────────────────────────────────────────────────────────── -->
<h2 id="classification">The shape of every finite answer</h2>

<p>
	A group is <dfn>finitely generated</dfn> if some finite set of its elements generates it. Every finite group is,
	\(\Z^r\) is, and so is every homology group of a shape built from finitely many pieces. Such groups always have a
	finite presentation, and the Smith normal form then turns that presentation into a standard name. The result is one
	of the most satisfying theorems in algebra.
</p>

<Theorem id="thm-classification" title="Classification of finitely generated abelian groups">
	<p>Every finitely generated abelian group \(G\) is isomorphic to exactly one group of the form</p>
	\[ \Z^r \;\oplus\; \Z/d_1 \;\oplus\; \Z/d_2 \;\oplus\; \dots \;\oplus\; \Z/d_k , \qquad d_1 \mid d_2 \mid \dots \mid d_k , \]
	<p>
		where \(r \ge 0\) and each <span class="nw">\(d_i \ge 2\).</span> The vertical bar \(d_1 \mid d_2\) is read <span class="nw">“\(d_1\)</span> divides <span class="nw">\(d_2\)”.</span>
		The number \(r\) is the <dfn>rank</dfn> of <span class="nw">\(G\),</span> and \(d_1, \dots, d_k\) are its <dfn>invariant factors</dfn>.
	</p>
</Theorem>

<p>
	<em>Why it is true.</em> Existence is what you just watched: present \(G\) by generators and relations (a finite list
	suffices, by the fact about subgroups of \(\Z^m\) quoted earlier), and diagonalise the relation matrix. Uniqueness —
	that two different lists can never give isomorphic groups — needs a separate argument, by counting how many elements
	of each order the group has; we will not prove it here.
</p>

<p>
	The theorem says that every finitely generated abelian group is “some free directions and some clocks”: a lattice
	\(\Z^r\) of independent infinite directions, together with a finite collection of clocks. The condition
	\(d_1 \mid d_2 \mid \dots\) is what makes the name unique: without it, \(\Z/2 \oplus \Z/3\) and \(\Z/6\) would be two
	names for one group.
</p>

<Example title="Naming some groups">
	<ul>
		<li>
			The abelian groups with eight elements are <span class="nw">\(\Z/8\),</span> \(\Z/2 \oplus \Z/4\) and \(\Z/2 \oplus \Z/2 \oplus \Z/2\) —
			exactly three, one for each way of writing \(8\) as a product \(d_1 d_2 \cdots\) with each factor dividing the
			next.
		</li>
		<li>
			\(\Z/4 \oplus \Z/6\) is not in standard form (4 does not divide 6). Since \(\Z/6 \cong \Z/2 \oplus \Z/3\) and
			<span class="nw">\(\Z/4 \oplus \Z/3 \cong \Z/12\),</span> it is <span class="nw">\(\Z/2 \oplus \Z/12\).</span>
		</li>
		<li>
			Similarly <span class="nw">\(\Z/12 \oplus \Z/18 \cong \Z/6 \oplus \Z/36\).</span> Try both in Figure 1.4.7.
		</li>
	</ul>
</Example>

<h3 id="torsion">Torsion</h3>

<Definition title="Torsion">
	<p>
		An element of an abelian group is a <dfn>torsion element</dfn> if it has finite order: some multiple \(ka\) with
		\(k \ge 1\) is zero. The torsion elements form a subgroup, the <dfn>torsion subgroup</dfn>. A group whose only
		torsion element is \(0\) is called <dfn>torsion-free</dfn>.
	</p>
</Definition>

<p>
	In \(\Z^r \oplus \Z/d_1 \oplus \dots \oplus \Z/d_k\), an element is torsion exactly when its \(\Z^r\) part is zero
	(a nonzero integer vector never becomes zero when multiplied). So the torsion subgroup is the finite part <span class="nw">\(\Z/d_1
	\oplus \dots \oplus \Z/d_k\),</span> and the classification can be read as
	\[ G \;\cong\; \underbrace{\Z^r}_{\text{free part}} \;\oplus\; \underbrace{T(G)}_{\text{torsion}} . \]
	For example, in \(\Z \oplus \Z/3\) the torsion subgroup is \(0 \oplus \Z/3\) and the rank is <span class="nw">\(1\).</span>
</p>

<Warning title="Two cautions">
	<p>
		<strong>“Rank” means several things.</strong> The rank of a group (the \(r\) above), the rank of a matrix
		(<Ref to="foundations/linear-algebra" />) and the smallest number of generators are different numbers. \(\Z/6\) has
		rank \(0\) but needs one generator, even though it is also <span class="nw">\(\Z/2 \oplus \Z/3\).</span>
	</p>
	<p>
		<strong>“Finitely generated” matters.</strong> A finitely generated torsion-free group is free, <span class="nw">\(\cong \Z^r\).</span> Without
		finite generation this fails: the rational numbers \(\Q\) under addition are torsion-free but have no basis.
	</p>
</Warning>

<p>
	Now the payoff. In Part III we will compute the first homology groups of some surfaces. Here, on trust, are the
	answers, already in classified form:
</p>

<div class="table-wrap">
	<table>
		<thead>
			<tr><th>Shape</th><th>First homology \(H_1\)</th><th>Rank (holes)</th><th>Torsion</th></tr>
		</thead>
		<tbody>
			<tr><td>circle</td><td>\(\Z\)</td><td>1</td><td>\(0\)</td></tr>
			<tr><td>sphere</td><td>\(0\)</td><td>0</td><td>\(0\)</td></tr>
			<tr><td>torus</td><td>\(\Z^2\)</td><td>2</td><td>\(0\)</td></tr>
			<tr><td>Klein bottle</td><td>\(\Z \oplus \Z/2\)</td><td>1</td><td>\(\Z/2\)</td></tr>
			<tr><td>projective plane</td><td>\(\Z/2\)</td><td>0</td><td>\(\Z/2\)</td></tr>
		</tbody>
	</table>
</div>

<p>
	The rank will be called the <em>Betti number</em> <span class="nw">\(b_1\):</span> it counts independent loops that bound nothing. The
	torsion is subtler. On the Klein bottle there is a loop that does not bound anything, but which, <em>travelled
	twice</em>, does: an element of order two. That is the <span class="nw">\(\Z/2\),</span> and it is exactly what distinguishes the Klein bottle
	from the torus in <Ref to="homology/computing" />.
</p>

<History title="Why “torsion”?">
	<p>
		The word comes from topology, not algebra. Poincaré, who discovered torsion in 1900, chose the name because, as his
		translator John Stillwell explains, it occurs only in shapes “such as the Möbius band, that are non-orientable and
		hence ‘twisted onto themselves’ in some way”. (For closed surfaces this is exactly right: a surface has torsion in its
		first homology precisely when it cannot be oriented. In higher dimensions torsion can also appear in orientable
		shapes.) Stillwell continues: “When Emmy Noether built the Betti numbers and
		torsion numbers into the homology groups in 1926, the word ‘torsion’ took up residence in algebra, much to the
		mystification of group theory students who were not informed of its origin in topology.” Before Noether, Betti and
		torsion numbers were read off from tables of incidence numbers; after her, they were invariants of groups. In the
		preface of their 1935 textbook, Pavel Alexandroff and Heinz Hopf wrote that this strong algebraisation of
		topology on a group-theoretic basis “goes back entirely to Emmy Noether” (our translation).
	</p>
</History>

<!-- ─────────────────────────────────────────────────────────────────── -->
<h2 id="exact-sequences">A first look at exact sequences</h2>

<p>
	We end with a piece of bookkeeping that will become one of the main tools of Part III. Often several groups are linked
	by a chain of homomorphisms,
	\[ A \xrightarrow{\;f\;} B \xrightarrow{\;g\;} C , \]
	and the interesting question is how the image of one map sits inside the next group compared with the kernel of the
	next map.
</p>

<Definition title="Exactness">
	<p>
		The sequence \(A \xrightarrow{f} B \xrightarrow{g} C\) is <dfn>exact</dfn> at \(B\) if <span class="nw">\(\im f = \ker g\).</span> A longer
		sequence \(\dots \to A_1 \to A_2 \to A_3 \to \dots\) is exact if it is exact at every group that has a map coming in
		and a map going out.
	</p>
</Definition>

<p>
	Read it as: <em>what \(f\) produces is exactly what \(g\) kills</em>. Two things are packed into the equality.
	First, <span class="nw">\(\im f \subseteq \ker g\):</span> everything \(f\) produces is killed by <span class="nw">\(g\),</span> or in other words \(g(f(a)) = 0\) for
	all \(a\) — doing \(f\) and then \(g\) gives zero. Second, <span class="nw">\(\ker g \subseteq \im f\):</span> nothing else is killed by <span class="nw">\(g\).</span>
	Two special cases are worth memorising (here \(0\) is the trivial group, and the maps to and from it are the only
	possible ones):
</p>

<ul>
	<li>
		\(0 \to A \xrightarrow{f} B\) is exact at \(A\) exactly when \(f\) is <Term t="injective">injective</Term>: the image
		of the map from \(0\) is <span class="nw">\(\{0\}\),</span> so exactness says <span class="nw">\(\ker f = \{0\}\).</span>
	</li>
	<li>
		\(B \xrightarrow{g} C \to 0\) is exact at \(C\) exactly when \(g\) is <Term t="surjective">surjective</Term>: the
		map \(C \to 0\) kills everything, so exactness says <span class="nw">\(\im g = C\).</span>
	</li>
</ul>

<h3 id="short-exact">Short exact sequences</h3>

<Definition title="Short exact sequence">
	<p>A <dfn>short exact sequence</dfn> is an exact sequence of the form</p>
	\[ 0 \to A \xrightarrow{\;f\;} B \xrightarrow{\;g\;} C \to 0 . \]
	<p>
		Exactness at the three spots says: \(f\) is injective, <span class="nw">\(\im f = \ker g\),</span> and \(g\) is surjective.
	</p>
</Definition>

<p>
	By the First Isomorphism Theorem, <span class="nw">\(C \cong B/\ker g = B/f(A)\).</span> So a short exact sequence says: <em>\(B\) contains a
	copy of <span class="nw">\(A\),</span> and collapsing that copy leaves \(C\)</em>. The fundamental example is
	\[ 0 \to \Z \xrightarrow{\;\times n\;} \Z \xrightarrow{\;\bmod n\;} \Z/n \to 0 . \]
	Multiplying by \(n\) is injective (for <span class="nw">\(n \neq 0\));</span> its image is <span class="nw">\(n\Z\);</span> the kernel of reduction mod \(n\) is also
	<span class="nw">\(n\Z\);</span> and reduction is surjective.
</p>

<Figure num="1.4.8" title="A short exact sequence" hint="Change n">
	<SesPicture />
	{#snippet caption()}
		\(0 \to \Z \xrightarrow{\times n} \Z \xrightarrow{\bmod n} \Z/n \to 0\). The teal arrows show multiplication by
		<span class="nw">\(n\):</span> no two integers land together (injective), and what they reach, the multiples of <span class="nw">\(n\),</span> is exactly what the
		gold arrows send to <span class="nw">\(0\).</span> Every point of \(\Z/n\) is reached (surjective).
	{/snippet}
</Figure>

<p>
	A short exact sequence does not always determine its middle group. Both
	\[ 0 \to \Z/2 \xrightarrow{\times 2} \Z/4 \xrightarrow{\bmod 2} \Z/2 \to 0 \quad\text{and}\quad 0 \to \Z/2 \to \Z/2
	\oplus \Z/2 \to \Z/2 \to 0 \]
	are exact (in the second, the maps are \(x \mapsto (x, 0)\) and <span class="nw">\((x, y) \mapsto y\)),</span> yet <span class="nw">\(\Z/4 \not\cong \Z/2
	\oplus \Z/2\).</span> Knowing the two ends tells you the size of the middle, but not always its structure — a subtlety that
	will matter when homology is assembled from pieces.
</p>

<p>
	Finally, what if a sequence is <em>not</em> exact? Suppose only that doing \(f\) and then \(g\) gives zero, so that
	<span class="nw">\(\im f \subseteq \ker g\).</span> Then the quotient \(\ker g / \im f\) measures exactly how far the sequence is from being
	exact: it is zero precisely when the sequence is exact. Try it.
</p>

<Figure size="wide" num="1.4.9" title="Exact, or not?" hint="Choose n and the two multipliers">
	<ExactnessExplorer />
	{#snippet caption()}
		Three copies of <span class="nw">\(\Z/n\),</span> joined by multiplication maps whose composite is zero. In the middle, the image of \(f\)
		is filled teal and the kernel of \(g\) is ringed. When every ringed dot is teal the sequence is exact. When some are
		not (rose), the leftover \(\ker g / \im f\) is a nonzero group. Try \(n = 8\) with \(f = \times 4\) and <span class="nw">\(g = \times
		2\),</span> then change \(g\) to <span class="nw">\(\times 4\).</span>
	{/snippet}
</Figure>

<KeyIdea title="Homology measures the failure of exactness">
	<p>
		In <Ref to="homology/chains" /> the boundary maps will form a long sequence of homomorphisms
		\(\dots \to C_2 \xrightarrow{\partial_2} C_1 \xrightarrow{\partial_1} C_0 \to 0\) in which doing two maps in a row
		always gives zero (“the boundary of a boundary is zero”). So the image of each map lies inside the kernel of the
		next — the boundaries lie inside the cycles. The homology group \(H_1 = \ker\partial_1 / \im\partial_2\) is exactly
		the leftover of the last figure: it measures how far the sequence of chains is from being exact, and a hole in the
		shape is precisely a failure of exactness.
	</p>
</KeyIdea>

<!-- ─────────────────────────────────────────────────────────────────── -->
<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Cosets on a 12-hour clock">
	<p>
		List the cosets of the subgroup \(H = \{0, 4, 8\}\) of <span class="nw">\(\Z/12\).</span> How many are there? Which familiar group is
		<span class="nw">\((\Z/12)/H\)?</span>
	</p>
	{#snippet solution()}
		<p>
			There are four: <span class="nw">\(\{0, 4, 8\}\),</span> <span class="nw">\(\{1, 5, 9\}\),</span> <span class="nw">\(\{2, 6, 10\}\),</span> \(\{3, 7, 11\}\) — as Lagrange predicts, <span class="nw">\(12/3
			= 4\).</span> The coset \(1 + H\) generates the quotient, since \(4 \cdot 1 = 4 \in H\) and no smaller multiple of \(1\)
			lies in <span class="nw">\(H\);</span> so \((\Z/12)/H\) is cyclic of order four, <span class="nw">\(\cong \Z/4\).</span> (By the First Isomorphism Theorem, this is
			also because reduction \(\Z/12 \to \Z/4\) is surjective with kernel <span class="nw">\(H\).)</span>
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Well defined or not?">
	<p>
		Is the rule <span class="nw">“\(a + 6\Z \mapsto\)</span> the parity of <span class="nw">\(a\)”</span> a well-defined function <span class="nw">\(\Z/6\Z \to \Z/2\)?</span> What about
		<span class="nw">“\(a + 7\Z \mapsto\)</span> the parity of <span class="nw">\(a\)”</span> on <span class="nw">\(\Z/7\Z\)?</span>
	</p>
	{#snippet hint()}
		<p>Two representatives of the same coset differ by a multiple of \(6\) (respectively <span class="nw">\(7\)).</span> Can they have different parities?</p>
	{/snippet}
	{#snippet solution()}
		<p>
			On <span class="nw">\(\Z/6\Z\):</span> yes. Two representatives differ by a multiple of <span class="nw">\(6\),</span> which is even, so they have the same parity.
			(It is the homomorphism \(\Z/6 \to \Z/2\) of reduction mod 2.) On <span class="nw">\(\Z/7\Z\):</span> no. The integers \(0\) and \(7\)
			represent the same coset, but \(0\) is even and \(7\) is odd, so the “rule” gives two different answers for one
			element.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Collapsing the diagonal">
	<p>
		Show that <span class="nw">\(\varphi\colon \Z^2 \to \Z\),</span> <span class="nw">\(\varphi(a, b) = a - b\),</span> is a homomorphism, find its kernel and image, and
		conclude that <span class="nw">\(\Z^2/\langle (1, 1) \rangle \cong \Z\).</span>
	</p>
	{#snippet solution()}
		<p>
			\(\varphi\big((a, b) + (a', b')\big) = (a + a') - (b + b') = (a - b) + (a' - b')\), so it is a homomorphism. The
			kernel consists of the pairs with <span class="nw">\(a = b\),</span> that is <span class="nw">\(\{(t, t)\} = \langle (1, 1) \rangle\).</span> The image is all of
			<span class="nw">\(\Z\),</span> since <span class="nw">\(\varphi(m, 0) = m\).</span> By the First Isomorphism Theorem, <span class="nw">\(\Z^2/\langle (1, 1) \rangle \cong \Z\).</span>
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="A torsion surprise">
	<p>
		Show that \(\Z^2/\langle (2, 2) \rangle \cong \Z \oplus \Z/2\). Which coset is a nonzero torsion element?
	</p>
	{#snippet hint()}
		<p>Use the basis <span class="nw">\(e_1 = (1, 1)\),</span> \(e_2 = (0, 1)\) of <span class="nw">\(\Z^2\).</span> What is \((2, 2)\) in this basis?</p>
	{/snippet}
	{#snippet solution()}
		<p>
			\(\{(1, 1), (0, 1)\}\) is a basis: <span class="nw">\((p, q) = p\,(1, 1) + (q - p)\,(0, 1)\),</span> uniquely. In this basis the subgroup is
			generated by <span class="nw">\((2, 2) = 2e_1 + 0e_2\).</span> So the quotient is \(\langle e_1, e_2 \mid 2e_1 = 0 \rangle \cong \Z/2 \oplus
			\Z\). The torsion element is the coset of <span class="nw">\((1, 1)\):</span> it is not in <span class="nw">\(\langle (2, 2) \rangle\),</span> but twice it is.
			(Check with Figure 1.4.3 or 1.4.7, using the single relation column <span class="nw">\((2, 2)\).)</span>
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Standard names">
	<p>
		(a) Is \(\Z/4 \oplus \Z/6\) cyclic? Write it in the standard form of the classification theorem. (b) List the
		abelian groups with eight elements, and tell them apart by counting their elements of order two.
	</p>
	{#snippet solution()}
		<p>
			(a) No: <span class="nw">\(\gcd(4, 6) = 2\),</span> so every element has order at most <span class="nw">\(\operatorname{lcm}(4, 6) = 12 < 24\).</span> In standard
			form it is <span class="nw">\(\Z/2 \oplus \Z/12\).</span>
		</p>
		<p>
			(b) <span class="nw">\(\Z/8\),</span> \(\Z/2 \oplus \Z/4\) and <span class="nw">\(\Z/2 \oplus \Z/2 \oplus \Z/2\).</span> An element of order two is a nonzero
			\(x\) with <span class="nw">\(2x = 0\).</span> In \(\Z/8\) there is one <span class="nw">(\(4\));</span> in \(\Z/2 \oplus \Z/4\) there are three <span class="nw">(\((1, 0)\),</span>
			<span class="nw">\((0, 2)\),</span> <span class="nw">\((1, 2)\));</span> in \((\Z/2)^3\) all seven nonzero elements. Since isomorphisms preserve orders, the three
			groups are different.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="A boundary teaser">
	<p>
		A triangle has vertices \(0, 1, 2\) and edges \(a\) from \(0\) to <span class="nw">\(1\),</span> \(b\) from \(1\) to <span class="nw">\(2\),</span> and \(c\) from
		\(0\) to \(2\) (as in Figure 1.4.6). Define a homomorphism \(\partial\) from \(\Z[a, b, c]\) to the free abelian group
		on the vertices \(v_0, v_1, v_2\) by saying where each edge goes: an edge from \(p\) to \(q\) goes to \(v_q - v_p\)
		(“end minus start”). Compute \(\partial(a + b - c)\) and <span class="nw">\(\partial(a + b)\).</span> What do the answers mean?
	</p>
	{#snippet solution()}
		<p>
			By the rule for homomorphisms on a basis, \(\partial(a + b - c) = (v_1 - v_0) + (v_2 - v_1) - (v_2 - v_0) = 0\),
			and \(\partial(a + b) = (v_1 - v_0) + (v_2 - v_1) = v_2 - v_0\). The walk \(a + b - c\) goes once around the
			triangle and has no end and no start: its “boundary” is zero, so it lies in the kernel of <span class="nw">\(\partial\).</span> The walk
			\(a + b\) starts at \(v_0\) and ends at <span class="nw">\(v_2\),</span> and its boundary records exactly that. This \(\partial\) is the
			boundary map of <Ref to="homology/chains" />, and its kernel will be called the cycles.
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Exact or not?">
	<p>
		(a) Check that \(0 \to \Z \xrightarrow{\times 3} \Z \xrightarrow{\bmod 3} \Z/3 \to 0\) is exact at each of its three
		middle spots. (b) Is \(\Z/8 \xrightarrow{\times 4} \Z/8 \xrightarrow{\times 4} \Z/8\) exact in the middle? If not,
		compute <span class="nw">\(\ker / \im\).</span>
	</p>
	{#snippet solution()}
		<p>
			(a) At the first <span class="nw">\(\Z\):</span> the kernel of \(\times 3\) is <span class="nw">\(\{0\}\),</span> the image of <span class="nw">\(0 \to \Z\).</span> In the middle: the
			image of \(\times 3\) is <span class="nw">\(3\Z\),</span> and the kernel of reduction mod 3 is also <span class="nw">\(3\Z\).</span> At <span class="nw">\(\Z/3\):</span> reduction is
			surjective, so its image is everything, which is the kernel of <span class="nw">\(\Z/3 \to 0\).</span>
		</p>
		<p>
			(b) The composite is \(\times 16 = 0\) on <span class="nw">\(\Z/8\),</span> so <span class="nw">\(\im \subseteq \ker\).</span> The image of \(\times 4\) is <span class="nw">\(\{0,
			4\}\);</span> the kernel of \(\times 4\) is <span class="nw">\(\{0, 2, 4, 6\}\).</span> They differ, so the sequence is not exact, and \(\ker/\im =
			\{0, 2, 4, 6\}/\{0, 4\}\) has two elements: it is <span class="nw">\(\Z/2\).</span> (Check with Figure 1.4.9.)
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Generators and relations by hand">
	<p>
		Identify the group \(\langle\, a, b, c \mid a + b + c = 0,\ 2a + 2b = 0 \,\rangle\) in standard form.
	</p>
	{#snippet hint()}
		<p>Use the first relation to eliminate <span class="nw">\(c\).</span></p>
	{/snippet}
	{#snippet solution()}
		<p>
			The first relation says <span class="nw">\(c = -a - b\),</span> so the group is generated by \(a\) and \(b\) alone, subject to the remaining
			relation <span class="nw">\(2a + 2b = 0\).</span> Change generators to \(a' = a + b\) and \(b\) (a basis of <span class="nw">\(\Z[a, b]\),</span> since <span class="nw">\(a = a' -
			b\)).</span> The relation becomes <span class="nw">\(2a' = 0\),</span> with no condition on <span class="nw">\(b\).</span> So the group is <span class="nw">\(\Z/2 \oplus \Z\),</span> of rank
			\(1\) with torsion <span class="nw">\(\Z/2\).</span> In Figure 1.4.7, the matrix with columns \((1, 1, 1)\) and \((2, 2, 0)\) gives
			invariant factors \(1, 2\) and one free generator.
		</p>
	{/snippet}
</Exercise>

<!-- ─────────────────────────────────────────────────────────────────── -->
<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>
			A <strong>coset</strong> \(a + H\) is a shifted copy of a subgroup; \(a + H = b + H\) exactly when <span class="nw">\(a - b \in
			H\).</span> The cosets partition \(G\) into pieces of equal size (<strong>Lagrange</strong>).
		</li>
		<li>
			The <strong>quotient group</strong> \(G/H\) has the cosets as its elements, each treated as one object, added
			through representatives — which is well defined. It is \(G\) with \(H\) declared zero: \(\Z/n\Z\) is clock
			arithmetic, \(\R/\Z\) is a circle, and \(\Z^2/H\) has \(|\det|\) elements.
		</li>
		<li>
			<strong>First Isomorphism Theorem:</strong> <span class="nw">\(G/\ker\varphi \cong \im\varphi\).</span> Collapse what \(\varphi\) cannot see,
			and what remains is what it reaches.
		</li>
		<li>
			<strong>Direct sums</strong> put groups side by side; \(\Z/m \oplus \Z/n \cong \Z/mn\) exactly when <span class="nw">\(\gcd(m,n) =
			1\).</span>
		</li>
		<li>
			A <strong>free abelian group</strong> \(\Z[S]\) consists of formal sums — inventories — of the symbols in <span class="nw">\(S\).</span>
			Homomorphisms out of it are decided by where the basis goes. Chains will be formal sums of edges and triangles.
		</li>
		<li>
			Groups can be <strong>presented</strong> by generators and relations; integer row and column operations
			diagonalise the relation matrix (the Smith normal form) and reveal the group.
		</li>
		<li>
			<strong>Classification:</strong> every finitely generated abelian group is \(\Z^r \oplus \Z/d_1 \oplus \dots \oplus
			\Z/d_k\) with <span class="nw">\(d_1 \mid \dots \mid d_k\).</span> The rank \(r\) will count holes; the <strong>torsion</strong> detects
			twisting.
		</li>
		<li>
			A sequence is <strong>exact</strong> where image equals kernel; short exact sequences \(0 \to A \to B \to C \to 0\)
			say <span class="nw">\(C \cong B/A\).</span> Homology will measure the failure of exactness.
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
