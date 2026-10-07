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
	import Question from '$lib/components/prose/Question.svelte';
	import Recap from '$lib/components/prose/Recap.svelte';
	import Exercise from '$lib/components/prose/Exercise.svelte';
	import Figure from '$lib/components/prose/Figure.svelte';
	import Term from '$lib/components/prose/Term.svelte';
	import Ref from '$lib/components/prose/Ref.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import Cite from '$lib/components/prose/Cite.svelte';

	import VortexLoop from '$lib/figures/cohomology/de-rham/VortexLoop.svelte';
	import Helicoid from '$lib/figures/cohomology/de-rham/Helicoid.svelte';
	import ClosedExactGallery from '$lib/figures/cohomology/de-rham/ClosedExactGallery.svelte';
	import PoincareLemma from '$lib/figures/cohomology/de-rham/PoincareLemma.svelte';
	import MayerVietoris from '$lib/figures/cohomology/de-rham/MayerVietoris.svelte';
	import DeRhamMap from '$lib/figures/cohomology/de-rham/DeRhamMap.svelte';
	import AmpereAB from '$lib/figures/cohomology/de-rham/AmpereAB.svelte';
</script>

<Epigraph author="Raoul Bott and Loring Tu" source="Differential Forms in Algebraic Topology (1982)">The guiding principle in this book is to use differential forms as an aid in exploring some of the less digestible aspects of algebraic topology.</Epigraph>

<p class="lead">At the end of the last chapter we met a strange 1-form on the plane with one point removed. Its exterior derivative is zero everywhere — it has no swirl at any point — and yet its integral around a circle is \(2\pi\), not zero. A field with no local swirl and a global one: that is the impossible staircase of <Ref to="cohomology/cochains" />, drawn this time with calculus instead of with numbers on edges. The missing point is to blame. This chapter turns that observation into an instrument for detecting holes with calculus, called <em>de Rham cohomology</em>, and then shows that the instrument reads exactly the same as the combinatorial one you have already built.</p>

<Ahead>
	<p>De Rham cohomology is cohomology made out of calculus: closed forms modulo exact forms. Its simplest instance, the angle form \(d\theta\), returns \(2\pi\) times the winding number of any loop — the circle’s hole announcing itself. De Rham’s theorem says these groups agree with the cohomology groups of <Ref to="cohomology/cohomology-groups" /> (with real numbers as coefficients), with integration as the bridge. Everything that follows uses this: the cup product of <Ref to="cohomology/cup-product" /> is the wedge product of forms, Poincaré duality pairs forms by integrating their wedge, and the curvature forms of <Ref to="cohomology/characteristic-classes" /> are closed forms whose classes are topological invariants.</p>
</Ahead>

<h2 id="closed-and-exact">Closed and exact forms</h2>

<p>Recall the two most important consequences of \(d\circ d = 0\) from <Ref to="cohomology/differential-forms" />. They deserve names.</p>

<Definition id="def-closed-exact" title="Closed and exact forms">
	<p>A differential form \(\omega\) is <dfn>closed</dfn> if \(d\omega = 0\). It is <dfn>exact</dfn> if \(\omega = d\eta\) for some form \(\eta\) of one degree lower; such an \(\eta\) is called a <em>primitive</em> or <em>potential</em> of \(\omega\).</p>
</Definition>

<p>For a 1-form on the plane, \(\omega = P\,dx + Q\,dy\), being closed means \(\tfrac{\partial Q}{\partial x} = \tfrac{\partial P}{\partial y}\): the curl of the field \((P, Q)\) vanishes everywhere. Being exact means \(\omega = df\) for some function \(f\): the field is a gradient, and \(f\) is its potential (the “height” of <Ref to="cohomology/cochains" />). Because \(d(df) = 0\), <strong>every exact form is closed</strong>. This chapter is about the converse.</p>

<Question>
	<p>Is every closed form exact? Is every field without curl a gradient? Before reading on, try to decide using only the pictures of the last chapter: can the sheets of a closed 1-form be stitched together into the level curves of a single function?</p>
</Question>

<h3 id="loop-test">The loop test</h3>

<p>There is a clean way to tell exactness from closedness, using loop integrals. If \(\omega = df\) is exact, then for every closed loop \(\gamma\),</p>
\[ \oint_\gamma \omega = \oint_\gamma df = f(\text{end}) - f(\text{start}) = 0 . \]
<p>Conversely, suppose every loop integral of \(\omega\) vanishes, on a connected region. Fix a base point \(p_0\) and define \(f(p) = \int_{p_0}^{p}\omega\), integrating along any path from \(p_0\) to \(p\). Two different paths give the same answer, because going out along one and back along the other is a loop, whose integral is zero. And \(df = \omega\): near \(p\), \(f\) changes by the integral of \(\omega\) along short steps, which is what \(df = \omega\) says. So:</p>

<KeyIdea>
	<p>A 1-form is <em>exact</em> exactly when its integral around <em>every</em> closed loop is zero. It is <em>closed</em> exactly when its integral around every loop that <em>bounds a region</em> (on which the form is defined) is zero, by Green’s theorem. The difference between the two is the difference between all loops and boundaries: holes.</p>
</KeyIdea>

<Example title="Finding a potential by integrating">
	<p>Take \(\omega = 2xy\,dx + x^2\,dy\) on the whole plane. It is closed: \(\partial_x(x^2) = 2x = \partial_y(2xy)\). To find a potential, follow the recipe of the loop test with base point \(p_0 = (0, 0)\): walk to \((x, y)\) first along the \(x\)-axis, then straight up. On the first leg \(y = 0\) and \(dy = 0\), so \(\omega = 0\) and nothing accumulates. On the second leg \(x\) is fixed and \(dx = 0\), so we collect \(\int_0^y x^2\,dt = x^2 y\). Hence \(f(x, y) = x^2y\), and indeed \(df = 2xy\,dx + x^2\,dy\). Had the form not been closed, the route would have mattered. Try \(y\,dx\): across-then-up collects nothing at all, while up-then-across collects \(\int_0^x y\,dt = xy\).</p>
</Example>

<p>Closedness is a <em>local</em> condition — you can check it at each point by computing derivatives. Exactness is a <em>global</em> condition — it asks for a single function on the whole region. Figure 4.4.1 lets you test both on five forms; drag the loop around and watch the two numbers.</p>

<Figure title="Closed, exact, or neither?" hint="Pick a form · drag the centre (diamond) or the rim of the circle" num="4.4.1">
	<ClosedExactGallery />
	{#snippet caption()}Arrows show each 1-form \(P\,dx + Q\,dy\) as the field \((P, Q)\); rose rings are missing points. The first readout is the integral around the gold circle, the second the integral of \(d\omega\) over the part of the disk where \(\omega\) is defined. For \(d\theta\), small loops give \(0\) and loops around the puncture give \(2\pi\). The last form, \(d(x/r^2)\), also lives on the punctured plane and its arrows loop in and out of the puncture, yet it is exact: every loop gives \(0\).{/snippet}
</Figure>

<p>This should feel familiar. In <Ref to="cohomology/cochains" /> you met edge labellings with zero “curl” around every filled triangle which were nevertheless not differences of vertex heights, because a loop around an unfilled hole picked up a nonzero sum. Here is the dictionary between the two worlds:</p>

<div class="table-wrap">
	<table>
		<thead>
			<tr><th>Cochains (Part IV so far)</th><th>Differential forms</th></tr>
		</thead>
		<tbody>
			<tr><td>\(k\)-cochain \(\varphi\in C^k\)</td><td>\(k\)-form \(\omega\in\Omega^k\)</td></tr>
			<tr><td>coboundary \(\delta\), with \(\delta\circ\delta = 0\)</td><td>exterior derivative \(d\), with \(d\circ d = 0\)</td></tr>
			<tr><td>cocycle: \(\delta\varphi = 0\)</td><td>closed form: \(d\omega = 0\)</td></tr>
			<tr><td>coboundary: \(\varphi = \delta\psi\)</td><td>exact form: \(\omega = d\eta\)</td></tr>
			<tr><td>\((\delta\varphi)(c) = \varphi(\partial c)\)</td><td>\(\int_c d\omega = \int_{\partial c}\omega\) (Stokes)</td></tr>
		</tbody>
	</table>
</div>

<Warning title="Four different meanings of ‘closed’">
	<p>Mathematics overuses this word. A <em>closed set</em> (<Ref to="topology/spaces" />) contains its limit points; a <em>closed curve</em> or loop ends where it starts; a <em>closed manifold</em> is compact without boundary; a <em>closed form</em> has \(d\omega = 0\). The four ideas share a word and little else, although closed forms and closed loops will spend a lot of time together.</p>
</Warning>

<h2 id="de-rham-groups">The de Rham cohomology groups</h2>

<p>Following the recipe of Part III and <Ref to="cohomology/cohomology-groups" />, we measure the gap between closed and exact forms with a quotient. The closed \(k\)-forms \(Z^k(M) = \ker\big(d\colon\Omega^k(M)\to\Omega^{k+1}(M)\big)\) form a vector space, the exact ones \(B^k(M) = \im\big(d\colon\Omega^{k-1}(M)\to\Omega^k(M)\big)\) form a subspace of it, and we divide.</p>

<Definition id="def-de-rham" title="de Rham cohomology">
	<p>The \(k\)-th <dfn>de Rham cohomology</dfn> of a smooth manifold \(M\) is the quotient vector space</p>
	\[ H^k_{\dR}(M) \;=\; \frac{\{\text{closed } k\text{-forms on } M\}}{\{\text{exact } k\text{-forms on } M\}} \;=\; \frac{\ker d}{\im d} . \]
	<p>Its elements are classes \([\omega]\) of closed forms, where two closed forms are <dfn>cohomologous</dfn> — define the same class — when their difference is exact.</p>
</Definition>

<p>In words: take all the closed forms, and agree to ignore the ones that are exact, since they are “closed for a trivial reason”. Whatever is left over measures closed forms that fail to be exact for a global reason. Concretely, to show that two closed forms \(\omega\) and \(\omega'\) represent the same class you exhibit a form \(\eta\) with \(\omega - \omega' = d\eta\); to show that they do not, you usually find a cycle over which they integrate differently — since, by Stokes’ theorem, an exact form integrates to zero over every cycle. This is the same quotient construction as \(\Z/n\) in <Ref to="foundations/equivalence" /> and \(V/W\) in <Ref to="foundations/linear-algebra" />: declare two things the same when they differ by something negligible. Over the real numbers these groups are vector spaces, and the most useful thing to know about each is its dimension.</p>

<h3 id="h-zero">Degree zero: what does not change</h3>

<p>A 0-form is a function \(f\), and there are no forms of degree \(-1\), so nothing is exact in degree \(0\). A function is closed when \(df = 0\), that is, when all its partial derivatives vanish: it is constant near every point. Such <Term t="locally-constant-function">locally constant</Term> functions are constant on each connected piece of \(M\) but may take different values on different pieces. So, when \(M\) has finitely many components,</p>
\[ H^0_{\dR}(M) \;\cong\; \R^{\#\text{connected components of } M}, \]
<p>one real number for each piece, exactly as \(H^0\) of a graph counted its components in <Ref to="cohomology/cochains" />. At the other end, if \(M\) has dimension \(n\) there are no nonzero forms of degree \(k > n\), so \(H^k_{\dR}(M) = 0\) for \(k > n\).</p>

<h3 id="line-and-circle">The line and the circle</h3>

<Example title="The real line has no first cohomology">
	<p>Every 1-form on \(\R\) is \(g(x)\,dx\) for some smooth function \(g\), and every such form is closed (a 2-form on a line is zero). It is also exact: the function \(G(x) = \int_0^x g(t)\,dt\) satisfies \(dG = g\,dx\), by the fundamental theorem of calculus. So \(H^1_{\dR}(\R) = 0\) and \(H^0_{\dR}(\R) = \R\): the line has one component and no holes.</p>
</Example>

<p>The circle is more interesting. Describe a point of the circle \(S^1\) by its angle \(\theta\), remembering that \(\theta\) and \(\theta + 2\pi\) are the same point. The angle itself is <em>not</em> a function on the circle — it has no single value at the starting point — but its differential is a perfectly good 1-form: it measures the angle swept by a small step, and that does not care which value of \(\theta\) you started from. This form is written \(d\theta\), and every 1-form on the circle is \(g(\theta)\,d\theta\) for a smooth \(2\pi\)-periodic function \(g\).</p>

<Example title="The circle has one hole">
	<p>When is \(g(\theta)\,d\theta\) exact? We need a function \(G\) on the circle — that is, a \(2\pi\)-periodic function — with \(G' = g\). The candidate \(G(\theta) = \int_0^\theta g(t)\,dt\) is periodic exactly when \(G(2\pi) = G(0) = 0\), that is, when \(\int_0^{2\pi} g(\theta)\,d\theta = 0\). So a 1-form on the circle is exact precisely when its integral around the circle is zero, and the map</p>
	\[ H^1_{\dR}(S^1) \to \R, \qquad [\omega] \mapsto \int_{S^1}\omega \]
	<p>is well defined and an isomorphism. Hence \(H^1_{\dR}(S^1)\cong\R\), generated by the class of \(d\theta\), which integrates to \(2\pi\). For instance \(\cos\theta\,d\theta = d(\sin\theta)\) is exact, while \((1 + \cos\theta)\,d\theta\) is cohomologous to \(d\theta\).</p>
</Example>

<p>Compare this with <Ref to="homology/homology-groups" />: the circle has \(H_0 \cong \Z\) and \(H_1 \cong \Z\). De Rham cohomology finds the same component and the same hole, with \(\R\) in place of \(\Z\).</p>

<h2 id="the-vortex">The vortex: a closed form that is not exact</h2>

<p>Now the hero of the chapter. On the <Term t="punctured-plane">punctured plane</Term> \(\R^2\setminus 0\) (the plane with the origin removed) consider</p>
\[ \omega \;=\; \frac{-y\,dx + x\,dy}{x^2 + y^2} . \]
<p>Away from the origin, the polar angle \(\theta\) of a point can be chosen to vary smoothly, at least on any region that does not go all the way around. On the right half-plane \(x > 0\), for example, \(\theta = \arctan(y/x)\). Let us check that its differential is \(\omega\). The derivative of \(\arctan u\) is \(1/(1 + u^2)\), so by the chain rule</p>
\[ \frac{\partial}{\partial x}\arctan\frac{y}{x} = \frac{1}{1 + y^2/x^2}\cdot\Big(-\frac{y}{x^2}\Big) = \frac{-y}{x^2 + y^2}, \qquad \frac{\partial}{\partial y}\arctan\frac{y}{x} = \frac{1}{1 + y^2/x^2}\cdot\frac{1}{x} = \frac{x}{x^2+y^2}, \]
<p>and these are exactly the coefficients of \(\omega\). On other half-planes a different formula for the angle does the same job (on the upper half-plane, \(\theta = \operatorname{arccot}(x/y)\), say), and two such formulas differ by a constant where both are defined, so they have the same differential. That is why this form is called the <Term t="angle-form">angle form</Term> and is written \(d\theta\). Being locally the differential of a function, it is closed: \(d\omega = d(d\theta) = 0\). (You can also check \(\partial_x Q = \partial_y P\) directly; it was the last exercise of the previous chapter.) Its field \((P, Q)\) is the vortex of Figure 4.3.2: it circles the origin with strength \(1/r\), and has no curl anywhere.</p>

<p>And yet around the unit circle, \(x = \cos t\), \(y = \sin t\), we have \(\omega = (\sin^2 t + \cos^2 t)\,dt = dt\), so</p>
\[ \oint_{S^1} d\theta = 2\pi \;\neq\; 0 . \]
<p>By the loop test, \(d\theta\) is <em>not</em> exact on the punctured plane. There is no function \(f\) on \(\R^2\setminus 0\) with \(df = d\theta\). The notation \(d\theta\) is a trap: it is the derivative of the angle only locally, never globally.</p>

<Warning title="‘dθ is d of θ, so it must be exact’">
	<p>The angle \(\theta\) is not a function on the punctured plane. At each point it has infinitely many candidate values, differing by multiples of \(2\pi\), and no continuous choice works all the way round. \(d\theta\) is a genuine 1-form; it is the differential of some function on every slit plane, but of no function on the whole punctured plane.</p>
</Warning>

<h3 id="staircase">The endless staircase</h3>

<p>Imagine walking once around the origin while keeping track of your angle continuously. You start at \(\theta = 0\); a quarter of the way round you are at \(\pi/2\); halfway at \(\pi\); and when you are back where you started, your angle reads \(2\pi\), not \(0\). Walk round again and it reads \(4\pi\). The angle is a <Term t="multivalued-function">multivalued function</Term>: a height you can climb forever while going in circles. Lionel and Roger Penrose drew exactly such a staircase in 1958 <Cite k="penrose1958" />, and M. C. Escher turned it into his lithograph <em>Ascending and Descending</em> (1960), with monks trudging round it for ever. Their staircase is an optical illusion. The angle is the real thing.</p>

<p>Figure 4.4.2 builds it honestly, in three dimensions. Over each point of the punctured plane, stack all its possible angles \(\theta, \theta \pm 2\pi, \theta \pm 4\pi, \ldots\) as heights. These stacks form a single smooth spiral surface, the <em>helicoid</em>, like the ramp of a multistorey car park wound around the missing axis. Instead of pretending to close up, as the Penroses’ staircase does, it simply keeps rising. A loop in the plane, together with a continuously chosen angle along it, traces a path on the ramp. If the loop goes around the hole, the path climbs a full storey per lap; if it does not, the path rises and falls and comes back to its start.</p>

<Figure title="The angle as a spiral staircase" hint="Drag to rotate · play or scrub the walk" num="4.4.2">
	<Helicoid />
	{#snippet caption()}The helicoid has one sheet for each possible value of the angle; its storeys are \(2\pi\) apart, and the rose axis is the missing origin. The gold loop in the floor lifts to the gold path on the ramp. Around the hole, each lap climbs exactly one storey — the integral of \(d\theta\) along the loop is the height gained. Beside the hole, the path returns to its starting height. (This surface is a picture of what mathematicians call the Riemann surface of the logarithm.){/snippet}
</Figure>

<h3 id="winding">Winding numbers</h3>

<p>The staircase also tells us what \(\oint d\theta\) is around <em>any</em> loop. In <Ref to="topology/homotopy" /> you met the <Term t="winding-number">winding number</Term> \(w(\gamma, 0)\) of a loop \(\gamma\) around the origin: the net number of times \(\gamma\) goes around, counting counterclockwise turns positively and clockwise ones negatively.</p>

<Theorem id="thm-winding" title="Integrals of dθ count windings">
	<p>For every closed piecewise-smooth loop \(\gamma\) in \(\R^2\setminus 0\),</p>
	\[ \oint_\gamma d\theta = 2\pi\cdot w(\gamma, 0). \]
</Theorem>

<Proof>
	<p>Chop \(\gamma\) into short arcs, each lying in some half-plane that avoids the origin. On each such arc there is a smooth branch of the angle, \(\theta_i\), with \(d\theta_i = \omega\), so by the fundamental theorem of calculus the integral over the arc is the change in \(\theta_i\) along it. Choose the branches so that each one starts where the previous one ended; they then fit together into a single continuous angle \(\tilde\theta\) along the whole loop — the lift onto the staircase. Adding up the arcs, \(\oint_\gamma d\theta = \tilde\theta(\text{end}) - \tilde\theta(\text{start})\). The loop ends at its starting point, so this difference is a whole number of full turns, \(2\pi\cdot k\), and \(k\) — the net number of times the angle went around — is by definition the winding number.</p>
</Proof>

<Figure title="Vortex and loop" hint="Drag the round handles to reshape the loop · the diamond moves it" num="4.4.3">
	<VortexLoop />
	{#snippet caption()}The field of \(d\theta\), streaming around the missing origin. A bead walks your loop while the rose spiral at the centre records the angle swept so far. Whatever loop you draw, the integral computed along it is \(2\pi\) times a whole number: \(2\pi\) once around, \(4\pi\) for the star that goes round twice, \(0\) for a loop beside the hole, \(-2\pi\) backwards. Switch to “Angle rays” to see the level curves of \(\theta\): rays that never end, but cannot be labelled consistently.{/snippet}
</Figure>

<p>Integration has turned into counting. That is a hint of what is coming: the numbers we get from integrating closed forms around loops are locked to topological data, and cannot be changed by small wiggles.</p>

<h3 id="computing-h1">The first cohomology of the punctured plane</h3>

<Theorem id="thm-h1-punctured" title="One hole, one dimension">
	<p>\(H^1_{\dR}(\R^2\setminus 0)\cong\R\), and the isomorphism sends \([\eta]\) to \(\frac{1}{2\pi}\oint_{S^1}\eta\). In particular every closed 1-form \(\eta\) on the punctured plane is cohomologous to a unique multiple \(c\,d\theta\).</p>
</Theorem>

<Proof>
	<p>Given a closed 1-form \(\eta\), let \(c = \frac{1}{2\pi}\oint_{S^1}\eta\) and set \(\eta' = \eta - c\,d\theta\). Then \(\eta'\) is closed and has integral \(0\) around the unit circle. We claim its integral around every loop is \(0\), so that \(\eta'\) is exact by the loop test. A loop \(\gamma\) in the punctured plane can be deformed, without crossing the origin, into the unit circle traversed \(w = w(\gamma, 0)\) times (this is the computation \(\pi_1(S^1)\cong\Z\) from <Ref to="topology/homotopy" />). The integral of a <em>closed</em> form does not change under such a deformation: the deformation sweeps out a surface between the old and the new loop, and by Stokes’ theorem the difference of the two integrals is the integral of \(d\eta' = 0\) over that surface. So \(\oint_\gamma\eta' = w\oint_{S^1}\eta' = 0\). Hence \(\eta = c\,d\theta + (\text{exact})\), and \(c\) is unique because \(d\theta\) itself is not exact.</p>
</Proof>

<p>The same argument works with several holes. On the plane with \(k\) points removed, each puncture has its own angle form, and \(H^1_{\dR}\cong\R^k\): a closed 1-form is determined, up to exact forms, by its \(k\) integrals around small circles about the punctures. The “two vortices” form of Figure 4.4.1 is \(d\theta_a - d\theta_b\), with integrals \(2\pi\) around \(a\), \(-2\pi\) around \(b\), and \(0\) around both.</p>

<h2 id="poincare-lemma">The Poincaré lemma: no holes, no cohomology</h2>

<p>If holes are what stop closed forms from being exact, then on a region without holes every closed form should be exact. The cleanest version of this uses a particularly simple kind of hole-free region.</p>

<Definition id="def-star" title="Star-shaped region">
	<p>An open set \(U\subseteq\R^n\) is <dfn>star-shaped</dfn> about a point \(c\in U\) if for every point \(p\in U\) the whole straight segment from \(c\) to \(p\) lies in \(U\). Every convex set (a disk, a ball, a cube, all of \(\R^n\)) is star-shaped about each of its points; a five-pointed star is star-shaped about its centre; an annulus and the punctured plane are not star-shaped about any point.</p>
</Definition>

<Theorem id="thm-poincare-lemma" label="Theorem (Poincaré lemma)">
	<p>On a star-shaped open set \(U\subseteq\R^n\), every closed \(k\)-form with \(k \ge 1\) is exact. Consequently \(H^0_{\dR}(U)\cong\R\) and \(H^k_{\dR}(U) = 0\) for all \(k\ge 1\). <Cite k="spivak1965" loc="Theorem 4-11" /></p>
</Theorem>

<p>For 1-forms the proof is a construction you can watch. Put the centre at the origin. To find a potential \(f\) at a point \(p\), integrate \(\omega\) along the straight ray from the centre to \(p\) — the ray stays inside \(U\), so this makes sense:</p>
\[ f(p) \;=\; \int_{\text{ray from } 0 \text{ to } p}\omega \;=\; \int_0^1 \omega_{tp}(p)\,dt \;=\; \int_0^1 \sum_i a_i(tp)\,p_i\,dt, \qquad\text{for } \omega = \sum_i a_i\,dx_i . \]

<Proof label="Proof for 1-forms">
	<p>Differentiate under the integral sign with respect to \(p_j\):</p>
	\[ \frac{\partial f}{\partial p_j} = \int_0^1 \Big( a_j(tp) + \sum_i t\,p_i\,\frac{\partial a_i}{\partial x_j}(tp) \Big)\,dt . \]
	<p>Closedness says \(\tfrac{\partial a_i}{\partial x_j} = \tfrac{\partial a_j}{\partial x_i}\). Using it, the integrand becomes \(a_j(tp) + t\sum_i p_i\,\tfrac{\partial a_j}{\partial x_i}(tp)\), which is exactly the derivative with respect to \(t\) of \(t\,a_j(tp)\) (product rule and chain rule). So \(\tfrac{\partial f}{\partial p_j} = \big[t\,a_j(tp)\big]_{t=0}^{t=1} = a_j(p)\), which says \(df = \omega\).</p>
	<p>For forms of higher degree the idea is the same — integrate along the rays — but the bookkeeping is heavier; <Cite k="spivak1965" text loc="Theorem 4-11" /> and <Cite k="bott-tu1982" text loc="§4" /> write it out.</p>
</Proof>

<Figure title="Building a potential along rays" hint="Switch regions · play or scrub · in the annulus, drag c and q" num="4.4.4">
	<PoincareLemma />
	{#snippet caption()}A closed 1-form on a star-shaped region: integrating along each ray from the centre builds the potential, shown growing outward as a coloured map with teal level lines. Switch to the annulus, with \(d\theta\) on it. Rays from \(c\) that would cross the hole are blocked (hatched), and the two ways round the hole from \(c\) to \(q\) give values that differ by exactly \(2\pi\).{/snippet}
</Figure>

<Question>
	<p>Is the punctured plane star-shaped about any point \(c\)? Try the segment from \(c\) to the point \(-c\) on the other side of the origin. (If \(c\) is the origin itself, it is not in the punctured plane at all.)</p>
</Question>

<p>The ray construction also shows why the annulus is different. From any centre \(c\) in the annulus, some straight rays run into the hole, so the construction cannot reach the points behind it. Going around the hole instead, the potential would have to take two different values at the same point, one for each way around, and they differ by \(\oint d\theta = 2\pi\).</p>

<Intuition title="Local versus global">
	<p>Every point of every manifold has a small neighbourhood that looks like a ball, and balls are star-shaped. So by the Poincaré lemma every closed form is exact <em>locally</em>: near each point it has a potential. Cohomology measures the failure of these local potentials to fit together into a global one. That sentence — “local solutions exist, but they may not glue” — is the heart of cohomology, and <Ref to="cohomology/sheaves" /> will take it as a definition.</p>
</Intuition>

<h2 id="invariance-and-mayer-vietoris">Invariance and cutting into pieces</h2>

<h3 id="pullbacks-on-cohomology">Maps act backwards on cohomology</h3>

<p>A smooth map \(f\colon M\to N\) pulls forms back from \(N\) to \(M\). Since pullback commutes with \(d\), it sends closed forms to closed forms (\(d f^*\omega = f^*d\omega = 0\)) and exact forms to exact forms (\(f^*d\eta = d f^*\eta\)), so it gives a well-defined linear map</p>
\[ f^*\colon H^k_{\dR}(N) \to H^k_{\dR}(M), \qquad [\omega]\mapsto[f^*\omega]. \]
<p>The arrow points backwards — the fourth recurring idea once more — just as \(f^*\) on cochains did in <Ref to="cohomology/cohomology-groups" />. And composition behaves: \((g\circ f)^* = f^*\circ g^*\).</p>

<Example title="Squaring doubles the angle">
	<p>Think of the punctured plane as the nonzero complex numbers and let \(f(z) = z^2\): in polar coordinates, \(f\) sends the point at radius \(r\) and angle \(\theta\) to the point at radius \(r^2\) and angle \(2\theta\). Pulling the angle form back means substituting the new angle into it, so \(f^*(d\theta) = d(2\theta) = 2\,d\theta\). On \(H^1_{\dR}(\R^2\setminus0)\cong\R\) the map \(f^*\) is therefore multiplication by \(2\) — the number of times \(f\) wraps the circle around itself. In general, a map of the circle to itself acts on \(H^1\) by multiplication by its <em>degree</em>, the winding number you met in <Ref to="homology/invariance" />. Cohomology turns geometry (“wraps around twice”) into arithmetic (“multiply by two”).</p>
</Example>

<Theorem id="thm-homotopy" title="Homotopy invariance">
	<p>If two smooth maps \(f, g\colon M\to N\) are homotopic, then \(f^* = g^*\) on de Rham cohomology. Consequently, homotopy-equivalent manifolds have isomorphic de Rham cohomology.</p>
</Theorem>

<p>The idea is the one we used for loops above: a homotopy sweeps out a “cylinder” between \(f\) and \(g\), and Stokes’ theorem on that cylinder shows that, for a closed form, what you see at one end differs from what you see at the other only by an exact form <Cite k="lee2013" loc="ch. 17" />. Here is what it buys immediately:</p>
<ul>
	<li>\(\R^n\) is homotopy equivalent to a point, so \(H^k_{\dR}(\R^n) = 0\) for \(k\ge1\) — the Poincaré lemma again.</li>
	<li>The punctured plane deformation-retracts onto the unit circle, so \(H^1_{\dR}(\R^2\setminus0)\cong H^1_{\dR}(S^1)\cong\R\), matching our computation.</li>
	<li>Space minus a straight line also retracts onto a circle, so \(H^1_{\dR}(\R^3\setminus\text{line})\cong\R\). Space minus a point retracts onto a sphere, so \(H^1_{\dR}(\R^3\setminus 0) = 0\), but, as we will see, \(H^2_{\dR}(\R^3\setminus 0)\cong\R\).</li>
</ul>

<h3 id="mayer-vietoris">Mayer–Vietoris: computing by cutting</h3>

<p>Like homology in <Ref to="homology/exact-sequences" />, de Rham cohomology can be computed by cutting a space into overlapping pieces. If \(M = U\cup V\) with \(U\), \(V\) open, there is a long exact sequence <Cite k="bott-tu1982" loc="§2" /></p>
\[ 0 \to H^0(M) \to H^0(U)\oplus H^0(V) \to H^0(U\cap V) \to H^1(M) \to H^1(U)\oplus H^1(V) \to H^1(U\cap V) \to H^2(M) \to \cdots \]
<p>(all groups de Rham). The first map restricts a form to both pieces; the second takes two forms on \(U\) and \(V\) and subtracts their restrictions to the overlap; the third, the “connecting map”, is the clever one.</p>

<Figure title="The circle from two arcs" num="4.4.5">
	<MayerVietoris />
	{#snippet caption()}Cover the circle by two arcs \(U\) and \(V\). Each arc is an interval, with no first cohomology, and their overlap has two separate pieces. Read the sequence downwards: locally constant functions on the pieces leave exactly one dimension unaccounted for, and exactness pushes it into \(H^1(S^1)\).{/snippet}
</Figure>

<p>Let us run it for the circle. The arcs \(U\) and \(V\) are each connected and contractible, so \(H^0(U) = H^0(V) = \R\) and \(H^1(U) = H^1(V) = 0\). Their intersection is two disjoint arcs \(W_1\sqcup W_2\), so \(H^0(U\cap V) = \R^2\). A pair of constants \((a, b)\) on \(U\) and \(V\) is sent to the difference \(b - a\) on each of \(W_1\) and \(W_2\): the image of this map is only the diagonal line \(\{(t, t)\}\) in \(\R^2\). Exactness at \(H^0(U\cap V)\) says that the connecting map kills exactly this diagonal, so it carries the quotient \(\R^2/\{(t,t)\}\cong\R\) injectively into \(H^1(S^1)\). Exactness at \(H^1(S^1)\), where the next group \(H^1(U)\oplus H^1(V)\) is \(0\), says the connecting map is also onto. So \(\dim H^1_{\dR}(S^1) = 2 - 1 = 1\).</p>

<p>Geometrically, the leftover class is a choice of two constants \((c_1, c_2)\) on the two overlaps that is not of the form \((t, t)\): a “jump” across one overlap that is not matched by the same jump across the other. Smoothing such a jump out with a bump function produces a closed 1-form whose integral around the circle is the difference \(c_2 - c_1\) (up to a sign fixed by conventions) — a copy of \(d\theta\), up to a constant multiple and exact forms.</p>

<h2 id="de-rhams-theorem">De Rham’s theorem: calculus meets combinatorics</h2>

<p>We now have two kinds of cohomology for a manifold \(M\): the de Rham groups built from forms, and the groups \(H^k(M;\R)\) of <Ref to="cohomology/cohomology-groups" /> built from cochains on a triangulation (or from singular simplices). They are built out of completely different raw material — smooth functions and derivatives on one side, finite lists of numbers and matrices on the other. Integration connects them.</p>

<p>Given a \(k\)-form \(\omega\), integrate it over each oriented \(k\)-simplex \(\sigma\) of a triangulation to get a number. That assignment is a \(k\)-cochain, \(I(\omega)(\sigma) = \int_\sigma\omega\): the <Term t="de-rham-map">integration map</Term>, or de Rham map. Stokes’ theorem says</p>
\[ I(d\omega)(\sigma) = \int_\sigma d\omega = \int_{\partial\sigma}\omega = I(\omega)(\partial\sigma) = \big(\delta I(\omega)\big)(\sigma), \]
<p>that is, \(I\circ d = \delta\circ I\). So integration sends closed forms to cocycles (if \(d\omega = 0\) then \(\delta I(\omega) = I(d\omega) = 0\)) and exact forms to coboundaries (\(I(d\eta) = \delta I(\eta)\)), and therefore gives a linear map \(H^k_{\dR}(M)\to H^k(M;\R)\).</p>

<Figure title="The de Rham map" hint="Pick a form · click a triangle or a loop" num="4.4.6">
	<DeRhamMap />
	{#snippet caption()}A triangulated annulus around the missing origin — the same shape as the annulus of <Ref to="cohomology/cochains" />. Each edge is labelled with the integral of the chosen form along it, in the direction of its arrow. For \(d\theta\) the numbers are fractions of a turn; every triangle adds up to \(0\) (a cocycle) and each loop around the hole to exactly one turn (not a coboundary). Click a triangle to add up around it. The other two forms show what goes wrong when the form is not closed, and what an exact form gives.{/snippet}
</Figure>

<p>Look at the numbers the integration map produced for \(d\theta\). Each inner or outer edge subtends \(120^\circ\) at the missing point, so it carries a third of a turn: \(+\tfrac13\) when its arrow runs counterclockwise, \(-\tfrac13\) when it runs clockwise. Each edge from an inner vertex \(a_i\) to an outer vertex subtends \(60^\circ\) and carries \(\pm\tfrac16\). Around every triangle the angles cancel, since a triangle that does not contain the origin subtends no net angle. Around either loop they add up to one turn. Any other cocycle whose loop sum is one turn — say, the “fence of ones” of <Ref to="cohomology/cochains" />, which is \(1\) on the three edges \(a_0\to a_1\), \(a_0\to b_1\), \(b_0\to b_1\) and \(0\) everywhere else — differs from this one by a coboundary: they are two representatives of the same class. Of all those representatives, the one produced by integrating \(d\theta\) is the most evenly spread: it has the smallest sum of squares. That is a first glimpse of the Hodge theory sketched in <Ref to="big-picture/horizons" />.</p>

<Theorem id="thm-de-rham" label="Theorem (de Rham, 1931)">
	<p>For every smooth manifold \(M\), integration over chains induces an isomorphism</p>
	\[ H^k_{\dR}(M) \;\cong\; H^k(M;\R) \qquad\text{for all } k. \]
	<p>For a triangulated manifold, the right side can be computed with simplicial cochains. <Cite k="derham1931,lee2013" loc="ch. 18" /></p>
</Theorem>

<p>We will not prove it. The proofs compare the two theories piece by piece with a Mayer–Vietoris argument, using the Poincaré lemma for the pieces; <Cite k="bott-tu1982" text loc="§8" /> give a particularly clean version. But consider what it says:</p>
<ul>
	<li><strong>Two worlds agree.</strong> The smooth world of forms and derivatives and the combinatorial world of simplices and matrices measure the same holes. Any calculation can be done in whichever world is easier.</li>
	<li><strong>Periods detect everything.</strong> A closed form is exact if and only if all its <Term t="period">periods</Term> — its integrals over cycles — vanish. We saw this for loops; de Rham’s theorem says it in every degree.</li>
	<li><strong>No torsion.</strong> Forms have real coefficients, so de Rham cohomology cannot see the torsion that \(\Z\)-coefficients detect. For the projective plane, \(H^k_{\dR}(\RP^2) = \R, 0, 0\), although \(H^2(\RP^2;\Z) = \Z/2\) (<Ref to="cohomology/cohomology-groups" />).</li>
</ul>

<p>Raoul Bott, remembering de Rham, called the theorem “a sort of topological form of the particle-wave equivalence of quantum mechanics” <Cite k="oconnor-robertson-derham" />. One way to read him: a chain is concentrated on a few simplices, like a particle; a form is spread over the whole manifold, like a wave; and integration lets each describe the other completely.</p>

<History>
	<p>Élie Cartan had conjectured the theorem, and even used it, in 1928; Poincaré had probably believed something like it. Georges de Rham, a young Swiss mathematician from the canton of Vaud, read Cartan’s note in 1929 and saw how to prove it, by pairing cycles with forms through integration. He defended the proof as his thesis in Paris on 20 June 1931, before a committee chaired by Cartan himself <Cite k="derham1931,oconnor-robertson-derham" />. Cohomology had not yet been invented — it arrived in 1935 — so, as Charles Weibel notes, de Rham “was forced to state his results in terms of homology”, as statements about integrals over cycles <Cite k="weibel1999" />. Away from his desk de Rham was a serious mountaineer, who as a student spent his summers “making ascents of the greatest difficulty”.</p>
</History>

<h2 id="physics">Holes you can feel: physics</h2>

<p>Closed forms that are not exact are not only a mathematician’s curiosity. Physics is full of fields with no local “curl” whose loop integrals are nonetheless not zero, and every time, a hole in space is responsible.</p>

<h3 id="conservative">Conservative forces</h3>

<p>A force field \(\mathbf F\) is <em>conservative</em> if the work it does around every closed path is zero; then it is the (negative) gradient of a potential energy, \(\mathbf F = -\nabla U\), and energy is conserved. In the language of forms, the work 1-form is exact. Gravity near the ground, \(U = mgy\), is the classic example. On a region without holes, the Poincaré lemma says that “no curl” already guarantees a potential. On a region with holes it does not.</p>

<h3 id="ampere">The field around a wire</h3>

<p>A steady current \(I\) flowing up a long straight wire along the \(z\)-axis produces a magnetic field circling the wire,</p>
\[ \mathbf B = \frac{\mu_0 I}{2\pi}\,\frac{(-y,\ x,\ 0)}{x^2+y^2}, \]
<p>where \(\mu_0\) is a physical constant. As a 1-form, this is \(\tfrac{\mu_0 I}{2\pi}\,d\theta\) on space with the wire removed. Outside the wire it has no curl, so it is closed. But around any loop it gives</p>
\[ \oint_\gamma \mathbf B\cdot d\mathbf l = \mu_0 I \times (\text{number of times } \gamma \text{ winds around the wire}), \]
<p>which is <Term t="amperes-law">Ampère’s law</Term>. So \(\mathbf B\) is closed but not exact: there is no “magnetic potential function” outside a wire, and the obstruction is a class in \(H^1_{\dR}(\R^3\setminus\text{wire})\cong\R\). For a current in a closed loop of wire, the number of times becomes the <em>linking number</em> of the two loops — a first taste of how cohomology detects knotting and linking.</p>

<h3 id="aharonov-bohm">The Aharonov–Bohm effect</h3>

<p>Physicists often describe a magnetic field \(\mathbf B\) through a <Term t="vector-potential">vector potential</Term> \(\mathbf A\) with \(\mathbf B = \operatorname{curl}\mathbf A\); as forms, a 1-form \(A\) with \(B = dA\). Take a long thin solenoid — a coil of wire — carrying a magnetic flux \(\Phi\) inside it. Outside the solenoid the magnetic field is zero, so \(dA = 0\) there: \(A\) is closed. But by Stokes’ theorem on a disk spanning a loop around the solenoid, \(\oint A = \Phi \ne 0\). Outside the solenoid, \(A = \tfrac{\Phi}{2\pi}\,d\theta\) (up to an exact form): the angle form once more.</p>

<p>Classically this would not matter, since a charged particle feels only \(\mathbf B\), and \(\mathbf B = 0\) wherever the particle goes. Quantum mechanically it matters. Yakir Aharonov and David Bohm pointed out in 1959 <Cite k="aharonov-bohm1959" />, as Werner Ehrenberg and Raymond Siday had a decade earlier <Cite k="ehrenberg-siday1949" />, that the wave of a charged particle travelling around the solenoid acquires an extra phase \(\tfrac{q}{\hbar}\oint A = \tfrac{q}{\hbar}\Phi\) per turn, which shifts the interference pattern of electrons passing on either side. The most convincing confirmation came in 1986, when Akira Tonomura and colleagues sent electrons around a tiny ring magnet sealed inside a superconducting shield <Cite k="tonomura1986" />. The electrons never touch the magnetic field. What they measure is the period \(\oint A\) of the closed form \(A\) around the hole — its cohomology class, read through a loop.</p>

<Figure title="A wire and a solenoid" hint="Drag to rotate · choose the physics and the loop" num="4.4.7">
	<AmpereAB />
	{#snippet caption()}The wire: the magnetic field circles a straight current, and the gold loop collects \(\mu_0 I\) for every time it goes around the wire, and nothing if it does not. The solenoid: the field is trapped inside the coil; outside it vanishes, but the vector potential \(A = \tfrac{\Phi}{2\pi}d\theta\) still circulates (violet), and a charged particle’s phase changes by \(\tfrac{q}{\hbar}\Phi\) per turn.{/snippet}
</Figure>

<h3 id="gauss">Gauss’s law and a hole of dimension two</h3>

<p>One dimension up, consider space with the origin removed, \(\R^3\setminus 0\), and the 2-form</p>
\[ \sigma = \frac{x\,dy\wedge dz + y\,dz\wedge dx + z\,dx\wedge dy}{(x^2+y^2+z^2)^{3/2}} . \]
<p>It is closed (\(d\sigma = 0\), a computation you can try), and on the unit sphere it restricts to the area form, so \(\iint_{S^2}\sigma = 4\pi\). If \(\sigma\) were exact, \(\sigma = d\eta\), then Stokes’ theorem on the sphere — which has no boundary — would give \(\iint_{S^2}\sigma = \iint_{\partial S^2}\eta = 0\). So \(\sigma\) is closed but not exact, and in fact \(H^2_{\dR}(\R^3\setminus 0)\cong\R\), generated by \([\sigma]\). The integral of \(\sigma\) over a closed surface is \(4\pi\) times the number of times the surface wraps around the origin, which is why \(\sigma\) is called the <Term t="solid-angle-form">solid-angle form</Term>.</p>

<p>The electric field of a point charge \(Q\) is exactly \(\tfrac{Q}{4\pi\varepsilon_0}\,\sigma\), and the statement “the flux out of a closed surface equals the enclosed charge over \(\varepsilon_0\)” is <Term t="gauss-law">Gauss’s law</Term>. The divergence theorem of the previous chapter would give zero flux for every surface — if the field were defined everywhere inside. The charge is the hole.</p>

<Remark title="A preview: magnetic monopoles">
	<p>Ordinary magnetic fields are exact, \(B = dA\), and so their flux through every closed surface is zero: there are no isolated magnetic poles. If a magnetic monopole existed, its field would be a multiple of \(\sigma\) — closed but not exact — so no single vector potential could describe it on all of space. Paul Dirac showed in 1931 that quantum mechanics can live with such a monopole only if electric charge comes in whole multiples of a basic unit <Cite k="dirac1931" />. His potential had a line of singularities, the “Dirac string”, running off to infinity; in 1975 Tai Tsun Wu and Chen Ning Yang replaced it by two smooth potentials on two overlapping regions, glued along their overlap <Cite k="wu-yang1975" />. That story belongs to <Ref to="cohomology/characteristic-classes" />.</p>
</Remark>

<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Closed? Exact?">
	<p>For each 1-form on \(\R^2\), decide whether it is closed, and if so find a potential: (a) \(2xy\,dx + x^2\,dy\); (b) \(y\,dx\); (c) \(e^x\cos y\,dx - e^x\sin y\,dy\).</p>
	{#snippet hint()}<p>Closed means \(\partial_x Q = \partial_y P\). On \(\R^2\) — which is star-shaped — closed forms are exact, so look for \(f\) with \(f_x = P\) and \(f_y = Q\).</p>{/snippet}
	{#snippet solution()}<p>(a) \(\partial_x(x^2) = 2x = \partial_y(2xy)\): closed, and \(2xy\,dx + x^2\,dy = d(x^2 y)\). (b) \(\partial_x(0) = 0 \ne 1 = \partial_y(y)\): not closed, since \(d(y\,dx) = -dx\wedge dy\). (c) \(\partial_x(-e^x\sin y) = -e^x\sin y = \partial_y(e^x\cos y)\): closed, and it equals \(d(e^x\cos y)\).</p>{/snippet}
</Exercise>

<Exercise level={1} title="Degree zero">
	<p>What is \(H^0_{\dR}\) of the real line with the origin removed? And what is its \(H^1_{\dR}\)?</p>
	{#snippet solution()}<p>\(\R\setminus 0\) has two components, the negative and the positive half-lines, so \(H^0_{\dR}\cong\R^2\) (a locally constant function may take one value on each). Every 1-form \(g\,dx\) has an antiderivative on each half-line separately, and together these give a function on \(\R\setminus0\) with \(dG = g\,dx\). So \(H^1_{\dR}(\R\setminus 0) = 0\): removing a point from a line disconnects it but does not create a loop.</p>{/snippet}
</Exercise>

<Exercise level={2} title="Counting turns">
	<p>Compute \(\oint d\theta\) (counterclockwise) around (a) the circle of radius \(1\) centred at \((3, 0)\); (b) the square with corners \((\pm1, \pm1)\); (c) the square, traversed twice. Use the winding-number theorem, then check (b) directly by adding the angles that the four sides subtend at the origin.</p>
	{#snippet solution()}<p>(a) The circle does not go around the origin, so the winding number is \(0\) and the integral is \(0\). (b) Winding number \(1\), so \(2\pi\). Directly: each side subtends a right angle at the origin (for instance the side from \((1,-1)\) to \((1,1)\) is seen at angles from \(-\pi/4\) to \(\pi/4\)), and four right angles make \(2\pi\). (c) \(4\pi\).</p>{/snippet}
</Exercise>

<Exercise level={2} title="Same class on the circle">
	<p>Show that \((1 + \cos\theta)\,d\theta\) and \(d\theta\) are cohomologous on \(S^1\). Which multiple of \([d\theta]\) is the class of \((3 + \sin 2\theta)\,d\theta\)?</p>
	{#snippet solution()}<p>Their difference is \(\cos\theta\,d\theta = d(\sin\theta)\), and \(\sin\theta\) is a genuine (periodic) function on the circle, so the difference is exact. For the second form, integrate: \(\int_0^{2\pi}(3 + \sin 2\theta)\,d\theta = 6\pi\), while \(\int d\theta = 2\pi\); so the class is \(3[d\theta]\). Indeed \((3 + \sin 2\theta)\,d\theta - 3\,d\theta = d\big(-\tfrac12\cos 2\theta\big)\).</p>{/snippet}
</Exercise>

<Exercise level={2} title="Two holes, two dimensions">
	<p>On the plane with the two points \(a = (-1, 0)\) and \(b = (1, 0)\) removed, let \(d\theta_a\) and \(d\theta_b\) be the angle forms centred at \(a\) and \(b\). Show that their classes are linearly independent in \(H^1_{\dR}\).</p>
	{#snippet hint()}<p>Suppose \(s\,d\theta_a + t\,d\theta_b\) is exact, and integrate around a small circle about \(a\), then about \(b\).</p>{/snippet}
	{#snippet solution()}<p>If \(s\,d\theta_a + t\,d\theta_b = df\), its integral around every loop is \(0\). Around a small circle about \(a\) (which does not go around \(b\)) the integral is \(2\pi s + 0\cdot t\), so \(s = 0\); around a small circle about \(b\) it is \(2\pi t\), so \(t = 0\). Hence the two classes are independent and \(\dim H^1_{\dR}\ge 2\). (In fact it equals \(2\).)</p>{/snippet}
</Exercise>

<Exercise level={2} title="The Beautiful Mind problem">
	<p>In the film <em>A Beautiful Mind</em> (2001) a blackboard shows a problem — devised, as Lek-Heng Lim reports, by the film’s mathematical consultant Dave Bayer <Cite k="lim2020" loc="Example 3.2" /> — which reads: \(V = \{\mathbf F\colon\R^3\setminus X\to\R^3 \text{ so } \nabla\times\mathbf F = 0\}\), \(W = \{\mathbf F = \nabla g\}\), \(\dim(V/W) = {?}\) Here \(\nabla\times\mathbf F\) is the curl. Explain why \(V/W\) is \(H^1_{\dR}(\R^3\setminus X)\), and find its dimension when \(X\) is (a) a point, (b) a straight line, (c) two disjoint parallel lines.</p>
	{#snippet solution()}<p>Curl-free fields are closed 1-forms and gradients are exact 1-forms, so \(V/W = H^1_{\dR}(\R^3\setminus X)\). (a) \(\R^3\setminus\) point retracts onto a sphere \(S^2\), which has no first cohomology: dimension \(0\). (b) \(\R^3\setminus\) line retracts onto a circle: dimension \(1\), generated by the angle form around the line. (c) Space minus two parallel lines retracts onto a plane minus two points, which has dimension \(2\) by the previous exercise.</p>{/snippet}
</Exercise>

<Exercise level={3} title="The Poincaré lemma by hand">
	<p>For \(\omega = 2xy\,dx + x^2\,dy\) on \(\R^2\), compute \(f(x, y) = \int_0^1 \omega_{(tx, ty)}(x, y)\,dt\) and check that \(df = \omega\).</p>
	{#snippet solution()}<p>At the point \((tx, ty)\) the coefficients are \(P = 2(tx)(ty) = 2t^2xy\) and \(Q = (tx)^2 = t^2x^2\). Evaluating on the vector \((x, y)\): \(2t^2xy\cdot x + t^2x^2\cdot y = 3t^2x^2y\). So \(f = \int_0^1 3t^2x^2y\,dt = x^2y\), and indeed \(d(x^2y) = 2xy\,dx + x^2\,dy\).</p>{/snippet}
</Exercise>

<Exercise level={3} title="The solid-angle form on the sphere">
	<p>Show that on the unit sphere the 2-form \(\sigma\) gives the area of small parallelograms tangent to the sphere, and conclude that \(\iint_{S^2}\sigma = 4\pi\). Why does this show that \(\sigma\) is not exact on \(\R^3\setminus 0\)?</p>
	{#snippet hint()}<p>At a point \(\mathbf p\) with \(\abs{\mathbf p} = 1\), the numerator of \(\sigma\) evaluated on tangent vectors \(\mathbf u, \mathbf v\) is the \(3\times3\) determinant with rows \(\mathbf p, \mathbf u, \mathbf v\).</p>{/snippet}
	{#snippet solution()}<p>Expanding the determinant along its first row gives \(x(u_2v_3 - u_3v_2) + y(u_3v_1 - u_1v_3) + z(u_1v_2 - u_2v_1)\), which is exactly the numerator of \(\sigma\) evaluated on \(\mathbf u, \mathbf v\). The determinant is the signed volume of the box spanned by \(\mathbf p, \mathbf u, \mathbf v\); since \(\mathbf p\) is a unit vector perpendicular to the tangent vectors, that volume is the area of the parallelogram spanned by \(\mathbf u, \mathbf v\) (positive for the outward orientation). So \(\sigma\) restricts to the area form, and its integral is the area \(4\pi\) of the unit sphere. If \(\sigma = d\eta\), Stokes’ theorem on the sphere, whose boundary is empty, would give \(0\) instead.</p>{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>A form is closed if \(d\omega = 0\) and exact if \(\omega = d\eta\). Exact forms are closed because \(d\circ d = 0\). A 1-form is exact precisely when all its loop integrals vanish.</li>
		<li>De Rham cohomology \(H^k_{\dR}(M)\) = closed \(k\)-forms modulo exact ones. \(H^0\) counts components; \(H^1_{\dR}(\R) = 0\); \(H^1_{\dR}(S^1)\cong\R\) via \(\oint\).</li>
		<li>The angle form \(d\theta = (-y\,dx + x\,dy)/(x^2+y^2)\) is closed but not exact on \(\R^2\setminus 0\): \(\oint_\gamma d\theta = 2\pi\cdot w(\gamma, 0)\). The angle is a multivalued function, a spiral staircase. \(H^1_{\dR}(\R^2\setminus 0)\cong\R\).</li>
		<li>Poincaré lemma: on star-shaped regions every closed form (of positive degree) is exact, by integrating along rays. Closed is local, exact is global; cohomology measures the gap.</li>
		<li>Smooth maps pull classes back; homotopic maps act identically, so de Rham cohomology is a homotopy invariant. Mayer–Vietoris computes it by cutting.</li>
		<li>De Rham’s theorem: integration over chains is a cochain map (by Stokes) and gives \(H^k_{\dR}(M)\cong H^k(M;\R)\). Smooth and combinatorial cohomology agree.</li>
		<li>Physics: Ampère’s law, the Aharonov–Bohm effect and Gauss’s law are all closed-but-not-exact phenomena caused by holes in space.</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading
	items={[
		{
			title: 'Differential Forms in Algebraic Topology',
			author: 'Raoul Bott and Loring Tu',
			url: 'https://link.springer.com/book/10.1007/978-1-4757-3951-0',
			note: 'The classic: de Rham cohomology, Mayer–Vietoris, the Poincaré lemma, and how far forms can take you in topology. Graduate level, but its first chapter reads well after this one.',
			kind: 'book'
		},
		{
			title: 'An Introduction to Manifolds',
			author: 'Loring W. Tu',
			url: 'https://link.springer.com/book/10.1007/978-1-4419-7400-6',
			note: 'The gentlest rigorous route: its closing chapters build de Rham cohomology, the Mayer–Vietoris sequence and homotopy invariance from scratch, with many worked computations. Written as a prequel to Bott and Tu.',
			kind: 'book'
		},
		{
			title: 'The Essence of de Rham Cohomology',
			author: 'Alice Petrov',
			url: 'https://arxiv.org/abs/2411.06296',
			note: 'A student-level exposition covering Mayer–Vietoris, homotopy invariance, Poincaré duality and de Rham’s theorem.',
			kind: 'notes',
			free: true
		},
		{
			title: 'Discrete Differential Geometry: An Applied Introduction',
			author: 'Keenan Crane',
			url: 'https://www.cs.cmu.edu/~kmcrane/Projects/DDG/paper.pdf',
			note: 'Shows forms becoming cochains on meshes — de Rham’s map made concrete — with the Hodge decomposition as a payoff.',
			kind: 'notes',
			free: true
		},
		{
			title: 'A Visual Introduction to Differential Forms and Calculus on Manifolds',
			author: 'Jon Pierre Fortney',
			url: 'https://link.springer.com/book/10.1007/978-3-319-96992-3',
			note: 'Its chapters on the Poincaré lemma and on electromagnetism treat closed and exact forms with many pictures.',
			kind: 'book'
		},
		{
			title: 'A Geometric Approach to Differential Forms',
			author: 'David Bachman',
			url: 'https://arxiv.org/abs/math/0306194',
			note: 'Gentle and geometric; includes a short section on de Rham cohomology as an application.',
			kind: 'book',
			free: true
		},
		{
			title: 'Algebraic Topology',
			author: 'Allen Hatcher',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/AT.pdf',
			note: 'For the combinatorial side of de Rham’s theorem: simplicial and singular cohomology with any coefficients.',
			kind: 'book',
			free: true
		},
		{
			title: 'A path-dependent vector field with zero curl',
			author: 'Duane Nykamp (Math Insight)',
			url: 'https://mathinsight.org/path_dependent_zero_curl',
			note: 'A short interactive page on the vortex field, for readers who prefer the vector-calculus language.',
			kind: 'interactive',
			free: true
		},
		{
			title: 'Significance of Electromagnetic Potentials in the Quantum Theory',
			author: 'Yakir Aharonov and David Bohm',
			url: 'https://doi.org/10.1103/PhysRev.115.485',
			note: 'The 1959 paper predicting the Aharonov–Bohm effect (Physical Review 115, 485–491).',
			kind: 'paper'
		},
		{
			title: 'The Feynman Lectures on Physics, Vol. II, ch. 15: The Vector Potential',
			author: 'Richard Feynman, Robert Leighton and Matthew Sands',
			url: 'https://www.feynmanlectures.caltech.edu/II_15.html',
			note: 'Feynman’s own account of why the vector potential is real, including the solenoid experiment.',
			kind: 'book',
			free: true
		}
	]}
/>
