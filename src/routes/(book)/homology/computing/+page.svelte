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
	import Svg from '$lib/components/svg/Svg.svelte';
	import FlatComplex from '$lib/figures/homology/homology-groups/FlatComplex.svelte';
	import TorusKleinPair from '$lib/figures/homology/homology-groups/TorusKleinPair.svelte';
	import Pipeline from '$lib/figures/homology/computing/Pipeline.svelte';
	import MatrixLab from '$lib/figures/homology/computing/MatrixLab.svelte';
	import TimesTwo from '$lib/figures/homology/computing/TimesTwo.svelte';
	import ProjectivePlaneDisk from '$lib/figures/homology/computing/ProjectivePlaneDisk.svelte';
	import BoySurface3D from '$lib/figures/homology/computing/BoySurface3D.svelte';
	import OrientationPainter from '$lib/figures/homology/computing/OrientationPainter.svelte';
	import CoefficientLenses from '$lib/figures/homology/computing/CoefficientLenses.svelte';
	import HomologyCalculator from '$lib/figures/homology/computing/HomologyCalculator.svelte';
	import { torusGrid, kleinGrid } from '$lib/figures/homology/homology-groups/complexes';
	import { counterclockwise } from '$lib/figures/homology/homology-groups/flat';
	import { conflicts } from '$lib/figures/homology/computing/orientation';

	const torus = torusGrid();
	const klein = kleinGrid();
	const tEps = counterclockwise(torus.L);
	const kEps = counterclockwise(klein.L);
	const kClash = conflicts(klein.K, kEps).c;
</script>

<Epigraph author="Michael Atiyah" source="Mathematics in the 20th Century (2001)">Algebra is the offer made by the devil to the mathematician. The devil says: ‘I will give you this powerful machine, and it will answer any question you like. All you need to do is give me your soul; give up geometry and you will have this marvellous machine.’</Epigraph>

<p class="lead">We left the last chapter in an uncomfortable tie. The torus and the Klein bottle are different surfaces, one orientable and one not, yet with coefficients in \(\Z/2\) their homology agrees exactly: Betti numbers \(1, 2, 1\) for both. This chapter breaks the tie.</p>

<p class="lead">The tool is the oldest one in the subject: matrices. We will see that computing homology is linear algebra, and that over a field it comes down to ranks. Over the integers, where we may not divide, something extra survives the computation. That extra, called <em>torsion</em>, is exactly what separates the Klein bottle from the torus.</p>

<p>Along the way we turn homology into a completely mechanical procedure, the “powerful machine” of Atiyah’s devil. Then we build that machine into a calculator you can feed any complex you like. But we will also keep our souls: at every step we will ask what the algebra means geometrically. The answer for torsion is beautiful. It is the shadow of a surface that is <em>twisted onto itself</em>.</p>

<Ahead>
	<p>Every computation of homology in practice runs on the matrices of this chapter. Persistent homology (<Ref to="homology/persistence" />) is the \(\Z/2\) column reduction you will see here, run on a growing complex. Cohomology (<Ref to="cohomology/cohomology-groups" />) uses the same boundary matrices, transposed. And the comparison of coefficients at the end of this chapter is a first look at the Universal Coefficient Theorem, which reappears in Parts IV and V.</p>
</Ahead>

<h2 id="linear-algebra">Homology is linear algebra</h2>

<p>Look back at what we did in <Ref to="homology/homology-groups" />. For each space we listed its simplices, wrote down the boundary matrices, found their kernels and images, and took quotients. Nothing in that procedure depends on pictures or cleverness. It is a machine with four stages.</p>

<Figure num="3.4.1" title="The homology machine">
	<Pipeline />
	{#snippet caption()}From a complex to its homology. List the simplices; write each boundary map as a matrix of \(0\)s and \(\pm1\)s; simplify each matrix by row and column operations; read off the groups. Over a field the last two stages only need ranks. Over \(\Z\) the simplified matrix can contain entries bigger than \(1\), such as the rose \(2\) here, and they become torsion.{/snippet}
</Figure>

<p>Recall the bookkeeping from <Ref to="homology/chains" />. The <Term t="boundary-matrix">boundary matrix</Term> of \(\partial_k\colon C_k \to C_{k-1}\) has one row for each \((k-1)\)-simplex and one column for each \(k\)-simplex. The column of a simplex lists its faces, with sign \(+1\) or \(-1\) according to the alternating rule, and every other entry is \(0\). Everything we want to know is in these matrices.</p>

<h3>Over a field, ranks are enough</h3>

<p>With coefficients in a field, such as the rational numbers \(\Q\) or the two-element field \(\Z/2\), the chain groups are vector spaces and the boundary maps are linear maps. Then the rank formula of <Ref to="homology/homology-groups" /> computes every Betti number:</p>

\[ b_k = n_k - \rank\partial_k - \rank\partial_{k+1}. \]

<p>Why is a single number per matrix enough? Because a vector space is determined, up to isomorphism, by its dimension (<Ref to="foundations/linear-algebra" />). The cycles form a subspace \(Z_k\), the boundaries a subspace \(B_k\) inside it, and the quotient \(Z_k/B_k\) is a vector space of dimension \(\dim Z_k - \dim B_k\). Knowing that dimension, we know the quotient completely: it is \(F^{b_k}\). Nothing else can happen.</p>

<p>So over a field, computing homology means computing ranks, and the standard way to compute a rank is <Term t="row-reduction">row reduction</Term>. Choose a non-zero entry in the first column, the <em>pivot</em>; swap its row to the top; subtract multiples of that row from the rows below so that the rest of the column becomes zero. Then move one row down and one column right, and repeat. When you run out of pivots the matrix is in echelon form, and the rank is the number of pivots.</p>

<p>Over \(\Z/2\) this is especially pleasant. Every non-zero entry is \(1\), since \(-1 = 1\) in \(\Z/2\). “Subtracting a multiple of a row” is just adding the pivot row, entry by entry, with \(1 + 1 = 0\). Figure 3.4.2 runs the procedure on the second boundary matrix of the six-vertex projective plane, a \(15 \times 10\) matrix, one pivot per step. Run it twice, once over \(\Z/2\) and once over \(\Q\).</p>

<Figure num="3.4.2" title="Rank by row reduction" hint="Step through · switch number system">
	<MatrixLab matrix="rp2" mode="Z2" modes={['Z2', 'Q']} matrices={['sphere', 'rp2', 'klein']} />
	{#snippet caption()}Row-reducing \(\partial_2\). Each step chooses a pivot (gold) and clears the entries below it; changed rows are tinted blue; finished pivots stay gold. For the sphere the rank is \(3\) either way. For \(\RP^2\) and the Klein bottle the last pivot is a \(2\) (rose): over \(\Q\) it is a perfectly good pivot, but over \(\Z/2\) it is zero, so the rank drops by one.{/snippet}
</Figure>

<p>Something remarkable happened. <em>The same matrix has rank \(9\) over \(\Z/2\) and rank \(10\) over \(\Q\).</em> Everything goes identically until the very end, when the last pivot turns out to be a \(2\). Over \(\Q\) we may divide by \(2\), so it is a pivot like any other. Over \(\Z/2\), \(2 = 0\), and the column simply vanishes. Feed the two ranks into the rank formula (with \(n_1 = 15\), \(n_2 = 10\) and \(\rank\partial_1 = 5\) in both cases):</p>

\[ \text{over } \Z/2: \quad b_1 = 15 - 5 - 9 = 1, \quad b_2 = 10 - 9 = 1; \qquad \text{over } \Q: \quad b_1 = 15 - 5 - 10 = 0, \quad b_2 = 0. \]

<p>So which is right: does \(\RP^2\) have a non-bounding loop or not? Both answers are correct. They answer different questions, because “bounding” depends on what coefficients the filling chain may have. To see the whole truth at once we must work over the integers, and over the integers we may not divide at all.</p>

<Question>
	<p>For the hollow tetrahedron, \(\partial_2\) has rank \(3\) over both fields (try it in Figure 3.4.2). What does that tell you about its Betti numbers over \(\Z/2\) and over \(\Q\)? (They agree: \(1, 0, 1\). Disagreement between fields can only come from entries such as the \(2\) above.)</p>
</Question>

<h2 id="integers">When you cannot divide</h2>

<p>Here is the simplest possible example of the trouble. Consider the map “multiply by 2” from the integers to themselves, \(x \mapsto 2x\). As a matrix it is the \(1\times1\) matrix \((2)\). Figure 3.4.3 looks at it through three lenses.</p>

<Figure num="3.4.3" title="One map, three number systems" hint="Switch the number system">
	<TimesTwo />
	{#snippet caption()}The map \(x \mapsto 2x\). Over \(\Q\) it is invertible, so it has rank \(1\) and leaves nothing behind. Over \(\Z/2\) it is the zero map, rank \(0\). Over \(\Z\) it is one-to-one, but it reaches only the even numbers (teal); the odd numbers (rose) are missed, and “even versus odd” is the two-element group \(\Z/2\Z \cong \Z/2\).{/snippet}
</Figure>

<p>Over \(\Z\), the map \((2)\) is neither “rank 1, nothing left over” (as over \(\Q\)) nor “rank 0” (as over \(\Z/2\)). It is one-to-one, but its image \(2\Z\) is not everything; the quotient \(\Z/2\Z\) has two elements. Now imagine that this \((2)\) sits inside a boundary matrix \(\partial_{k+1}\). Then some cycle \(z\) is not a boundary, yet \(2z\) is the boundary of something. In \(H_k\) this means \([z] \ne 0\) but \(2[z] = [2z] = 0\).</p>

<Definition id="def-torsion">
	{#snippet head()}Torsion classes{/snippet}
	<p>A homology class \([z] \in H_k(K)\) is a <dfn>torsion class</dfn>, or has <dfn>finite order</dfn>, if \(m[z] = 0\) for some whole number \(m \ge 1\): the cycle \(z\) itself need not bound, but some multiple \(mz\) does. The smallest such \(m\) is the <dfn>order</dfn> of \([z]\). The torsion classes form a subgroup of \(H_k(K)\), the <dfn>torsion subgroup</dfn>.</p>
</Definition>

<p>By the classification of finitely generated abelian groups (<Ref to="foundations/abelian-groups" />), every homology group of a finite complex has the shape</p>

\[ H_k(K) \;\cong\; \Z^{b_k} \;\oplus\; \Z/d_1 \oplus \Z/d_2 \oplus \cdots \oplus \Z/d_m, \qquad d_1 \mid d_2 \mid \cdots \mid d_m, \]

<p>a free part counted by the Betti number, plus finitely many finite cyclic groups, the torsion. (Read \(d_1 \mid d_2\) as “\(d_1\) divides \(d_2\)”.) Ranks alone see only \(b_k\). To find the \(d_i\) we need a finer tool that works with whole numbers only.</p>

<h3>Integer row and column operations</h3>

<p>Over \(\Z\) we allow exactly the moves that can be undone without fractions (<Ref to="foundations/linear-algebra" />):</p>

<ul>
	<li>swap two rows, or two columns;</li>
	<li>multiply a row or a column by \(-1\);</li>
	<li>add an integer multiple of one row to another row, or of one column to another column.</li>
</ul>

<p>Each move is undone by a move of the same kind, so none of them loses information. Row operations on \(\partial_{k+1}\) amount to choosing a new basis of \(C_k\), and column operations to choosing a new basis of \(C_{k+1}\). The groups and the map stay the same; only our description of them changes. What we may <em>not</em> do is divide a row by \(2\), because the inverse, multiplying by \(2\), is not an allowed move. That is precisely what protects the information Figure 3.4.2 destroyed.</p>

<Theorem id="thm-snf" label="Theorem (Smith normal form)">
	<p>Every integer matrix \(A\) can be brought, by integer row and column operations, to a diagonal matrix</p>
	\[ D = \operatorname{diag}(d_1, d_2, \dots, d_r, 0, \dots, 0), \qquad d_i \ge 1, \quad d_1 \mid d_2 \mid \cdots \mid d_r. \]
	<p>The numbers \(d_1, \dots, d_r\), the <dfn>invariant factors</dfn> of \(A\), do not depend on the operations chosen, and \(r = \rank A\) over \(\Q\).</p>
</Theorem>

<p>The algorithm behind the theorem is Euclid’s algorithm for greatest common divisors, played on a whole matrix. Move the smallest non-zero entry to the top-left corner. Divide every other entry of its row and column by it, with remainder, and subtract the corresponding multiples of its row and column; what remains are the remainders, which are smaller. Repeat until the corner entry divides everything in its row and column, clear them, and continue with the smaller matrix that is left. (A final tidying step makes each \(d_i\) divide the next; you met the details in <Ref to="foundations/linear-algebra" />.) Now the payoff.</p>

<Theorem id="thm-homology-snf" label="Theorem (homology from Smith normal forms)">
	<p>Let \(r_j = \rank\partial_j\), and let \(d_1, \dots, d_{r_{k+1}}\) be the invariant factors of \(\partial_{k+1}\). Then</p>
	\[ H_k(K) \;\cong\; \Z^{\,n_k - r_k - r_{k+1}} \;\oplus \bigoplus_{d_i > 1} \Z/d_i . \]
	<p>Invariant factors equal to \(1\) contribute nothing, and each factor bigger than \(1\) contributes a torsion summand.</p>
</Theorem>

<Proof>
	<p>Bring \(\partial_{k+1}\) to Smith normal form. In the new bases \(e_1, e_2, \dots\) of \(C_{k+1}\) and \(f_1, f_2, \dots\) of \(C_k\) it reads \(\partial e_i = d_i f_i\) for \(i \le r_{k+1}\), and \(\partial e_i = 0\) for the remaining basis vectors. So the boundaries are \(B_k = \Z d_1 f_1 \oplus \cdots \oplus \Z d_{r} f_{r}\), with \(r = r_{k+1}\).</p>
	<p>Each \(f_i\) with \(i \le r\) is a cycle: \(d_i\,\partial f_i = \partial(d_i f_i) = \partial\partial e_i = 0\), and in \(C_{k-1}\), a free group, a non-zero element cannot become zero when multiplied by \(d_i \ge 1\); so \(\partial f_i = 0\). Moreover \(f_1, \dots, f_r\) can be extended by further cycles \(g_1, \dots, g_s\) to a basis of \(Z_k\) (this uses that \(Z_k\) contains every element that some non-zero multiple of puts into it, a property of kernels). Counting ranks, \(r + s = \rank Z_k = n_k - r_k\), so \(s = n_k - r_k - r_{k+1}\). Now take the quotient one basis direction at a time:</p>
	\[ H_k = \frac{Z_k}{B_k} = \frac{\Z f_1 \oplus \cdots \oplus \Z f_r \oplus \Z g_1 \oplus \cdots \oplus \Z g_s}{\Z d_1 f_1 \oplus \cdots \oplus \Z d_r f_r} \cong \Z/d_1 \oplus \cdots \oplus \Z/d_r \oplus \Z^{s}. \]
	<p>Finally \(\Z/1 = 0\), so only the factors \(d_i > 1\) survive.</p>
</Proof>

<p>Two loose ends from the last chapter are now tied. The free rank of \(H_k(K)\) is \(n_k - r_k - r_{k+1}\) with ranks over \(\Q\), as promised there. And for the sphere and the torus, all invariant factors of every boundary matrix are \(1\) (check it in Figure 3.4.4 or in the calculator below), so their homology has no torsion. In particular \(B_1 = Z_1\) on the sphere: every loop on a sphere really does bound.</p>

<Figure num="3.4.4" title="The Smith normal form, step by step" hint="Step through the pivots">
	<MatrixLab matrix="rp2" mode="Z" modes={['Z']} matrices={['rp2', 'klein', 'torus']} />
	{#snippet caption()}Integer row and column operations on \(\partial_2\), one pivot per step; the side panel lists the operations used. For \(\RP^2\) the result has nine \(1\)s and one \(2\); for the Klein bottle, seventeen \(1\)s and one \(2\); for the torus, seventeen \(1\)s and nothing else. The rose \(2\) is torsion: no integer operation can turn it into a \(1\).{/snippet}
</Figure>

<Intuition title="Why the 2 cannot be removed">
	<p>Integer row and column operations never change the greatest common divisor of all the entries of a matrix (an integer combination of multiples of \(g\) is a multiple of \(g\)). When only the last \(1\times1\) or \(6\times1\) block is left and all its entries are even, no sequence of allowed moves can ever produce an odd number there. Over \(\Q\) you would simply divide by \(2\). Over \(\Z\) the \(2\) is stuck, and it records a genuine feature of the space.</p>
</Intuition>

<h2 id="klein-bottle">The Klein bottle, over the integers</h2>

<p>Back to the cliffhanger. The Klein bottle grid is the \(3\times3\) square with its left and right sides glued straight and its top glued to its bottom with a flip (top row \(0, 2, 1, 0\)). It has \(9\) vertices, \(27\) edges and \(18\) triangles, exactly like the torus. The Smith normal forms are</p>

<ul>
	<li>\(\partial_1\): eight invariant factors, all equal to \(1\), so \(r_1 = 8\);</li>
	<li>\(\partial_2\): seventeen \(1\)s and one \(2\), so \(r_2 = 18\).</li>
</ul>

<p>Now read off the homology:</p>

\[ H_0(K) \cong \Z^{9 - 0 - 8} = \Z, \qquad H_1(K) \cong \Z^{27 - 8 - 18} \oplus \Z/2 = \Z \oplus \Z/2, \qquad H_2(K) \cong \Z^{18 - 18 - 0} = 0. \]

<p>Compare the torus: \(\Z\), \(\Z^2\), \(\Z\). The tie is broken twice over. The Klein bottle has an element of order two in \(H_1\), and it has no 2-cycles at all.</p>

<h3>Where the 2 comes from</h3>

<p>Here is the same conclusion seen directly. Orient all eighteen triangles counterclockwise in the square picture and add them up. Every edge inside the square is shared by two triangles that run along it in opposite directions, so it cancels. The left and right sides are glued straight; walking counterclockwise, the left side is traversed downwards and the right side upwards, so after gluing these two copies also cancel. But the top is glued to the bottom <em>reversed</em>. Walking counterclockwise, the bottom row is traversed left to right, \(0 \to 1 \to 2 \to 0\); the top row is traversed right to left along labels \(0, 1, 2, 0\), which reads \(0 \to 1 \to 2 \to 0\) again. The two copies of the seam run in the <em>same</em> direction and add up instead of cancelling:</p>

\[ \partial\Big(\sum_{18 \text{ triangles}} \pm\, t\Big) = 2a, \qquad a = [0,1] + [1,2] - [0,2]. \]

<Figure num="3.4.5" title="Orienting both grids" hint="Compare the seams">
	<div class="pair2">
		<div>
			<Svg viewBox={torus.L.viewBox} maxHeight={260} label="The torus grid with every triangle oriented counterclockwise: no edge survives">
				<FlatComplex L={torus.L} triOrient={(t) => tEps[t]} labelSize={1.05} />
			</Svg>
			<p class="pc ui">torus: \(\partial(\sum \pm t) = 0\)</p>
		</div>
		<div>
			<Svg viewBox={klein.L.viewBox} maxHeight={260} label="The Klein bottle grid with every triangle oriented counterclockwise: the seam a survives twice">
				<FlatComplex L={klein.L} triOrient={(t) => kEps[t]} edgeCoef={(e) => kClash[e]} coefColor="var(--rose)" labelSize={1.05} />
			</Svg>
			<p class="pc ui">Klein bottle: \(\partial(\sum \pm t) = 2a\)</p>
		</div>
	</div>
	{#snippet caption()}Every triangle oriented counterclockwise (violet). On the torus each edge, including the glued ones, is crossed once in each direction, so the sum is a 2-cycle. On the Klein bottle the flipped seam is crossed twice in the same direction: the rose loop \(a\) appears in the boundary with coefficient \(2\).{/snippet}
</Figure>

<p>So \(2a\) is a boundary. Is \(a\) itself a boundary? No, and the cheapest proof uses the last chapter. If \(a = \partial x\) for some integer 2-chain \(x\), then reducing every coefficient mod 2 would give \(a = \partial \bar x\) over \(\Z/2\). But we computed in <Ref to="homology/homology-groups" hash="cliffhanger" /> that \([a] \ne 0\) in \(H_1(K;\Z/2)\). Hence \([a] \ne 0\) and \(2[a] = 0\): the class of the seam has order exactly two. Meanwhile the left column \(b = [0,3] + [3,6] - [0,6]\) has infinite order (Exercise 4 gives a crossing-count proof), and</p>

\[ H_1(K) \;=\; \Z[b] \;\oplus\; \Z/2\,[a]. \]

<KeyIdea>
	<p>Mod 2, the seam \(a\) of the Klein bottle looked exactly like the bottom row \(a\) of the torus: a loop that does not bound. Over \(\Z\) the difference appears. On the torus no multiple of \(a\) bounds; on the Klein bottle \(2a\) is the boundary of the whole surface. A class that is not zero, but whose double is.</p>
</KeyIdea>

<p>The same computation explains \(H_2(K) = 0\). A 2-cycle would be a combination of triangles in which every edge cancels; we will see in a moment that this forces all the triangles to be oriented coherently, and on the Klein bottle that is impossible. Figure 3.4.6 replays the cliffhanger with the new lens available.</p>

<Figure num="3.4.6" title="The tie, broken" hint="Drag to rotate · switch coefficients">
	<TorusKleinPair lens="Z" toggle />
	{#snippet caption()}The torus and the Klein bottle again. Through the \(\Z/2\) lens their homology is identical. Through the \(\Z\) lens the Klein bottle’s seam (rose) is doubled: \(\partial(\sum \pm t) = 2a\), so \(H_1(K) \cong \Z \oplus \Z/2\) and \(H_2(K) = 0\), while the torus keeps \(\Z^2\) and \(\Z\).{/snippet}
</Figure>

<h2 id="projective-plane">The projective plane</h2>

<p>The six-vertex real projective plane \(\RP^2\) of <Ref to="topology/simplicial-complexes" /> has \(6\) vertices, \(15\) edges and \(10\) triangles; every pair of vertices is joined by an edge. Its Smith normal forms (Figure 3.4.4) are five \(1\)s for \(\partial_1\), and nine \(1\)s and one \(2\) for \(\partial_2\). So</p>

\[ H_0(\RP^2) \cong \Z, \qquad H_1(\RP^2) \cong \Z^{15 - 5 - 10} \oplus \Z/2 = \Z/2, \qquad H_2(\RP^2) \cong \Z^{10 - 10} = 0. \]

<p>The whole first homology of the projective plane is a single element of order two. There is a loop \(c\) that bounds nothing, and twice that loop bounds. Figure 3.4.7 finds them.</p>

<p>Recall from <Ref to="topology/gluing" /> that \(\RP^2\) is a disk whose opposite boundary points are glued. Our triangulation can be drawn exactly that way: a hexagon whose rim reads \(4, 5, 6, 4, 5, 6\), with opposite rim points identified, and three vertices \(1, 2, 3\) inside. Inside a flat hexagon nothing stops us orienting every triangle counterclockwise. Then all interior edges cancel, and the boundary of the sum is the rim of the hexagon. Going once around the rim we read \(4 \to 5 \to 6 \to 4\), and then, past the gluing, \(4 \to 5 \to 6 \to 4\) again.</p>

<Figure num="3.4.7" title="Twice c bounds" hint="Step through · in the last step click triangles">
	<ProjectivePlaneDisk />
	{#snippet caption()}The six-vertex projective plane as a hexagon with opposite rim points glued. All ten triangles oriented counterclockwise have boundary \(2c\), where \(c = 4\to5\to6\to4\) is half the rim. In the last step, try to find a set of triangles whose mod-2 boundary is \(c\) alone.{/snippet}
</Figure>

<p>In symbols, with \(c = [4,5] + [5,6] - [4,6]\),</p>

\[ \partial\Big(\sum_{10\text{ triangles}} \pm\, t\Big) \;=\; 2c. \]

<p>And \(c\) is not a boundary. Over \(\Z/2\) a 2-chain is just a set of triangles, and there are only \(2^{10} = 1024\) of them; a computer (or a patient reader) checks that no set has boundary \(c\). An integer chain \(x\) with \(\partial x = c\) would give such a set by reducing mod 2, so none exists. Hence \([c]\) generates \(H_1(\RP^2) \cong \Z/2\). In fact all ten triangles of edges that are <em>not</em> faces, such as \(1 \to 2 \to 4 \to 1\), are cycles in this same class; they are the “projective lines” of the projective plane.</p>

<Figure num="3.4.8" title="The loop c on Boy’s surface" hint="Drag to rotate">
	<BoySurface3D />
	{#snippet caption()}Boy’s surface, a model of \(\RP^2\) in space that is allowed to pass through itself, carrying the same ten triangles. The gold loop is \(c\). On the hexagon it was half of the rim; here the two halves of the rim land on the same curve, so the rim of the disk runs around \(c\) twice. That is \(\partial(\sum \pm t) = 2c\), made visible.{/snippet}
</Figure>

<Warning title="Is the projective plane hollow?">
	<p>Mod 2, \(H_2(\RP^2;\Z/2) \cong \Z/2\): the set of all ten triangles is a 2-cycle, because every edge lies in exactly two triangles. It is tempting to read this as “\(\RP^2\) encloses a cavity”, like a sphere. It does not. Over \(\Z\), \(H_2(\RP^2) = 0\): the ten triangles can never be signed so that every edge cancels, since that would require a coherent orientation. Mod-2 top homology detects a closed surface; integer top homology detects a closed <em>orientable</em> one. The extra mod-2 class is a shadow of the torsion one dimension down.</p>
</Warning>

<h2 id="torsion-and-orientation">What torsion means</h2>

<p>In both examples the story was the same. We tried to orient all the triangles coherently, so that every edge would cancel. Inside the flat picture this works, but across one seam of the gluing the orientations clash, and the boundary of the sum is twice the clashing loop. Torsion appeared exactly where the surface is glued to itself with a flip. Let us make this precise.</p>

<Theorem id="thm-top-homology" label="Theorem (orientability and top homology)">
	<p>Let \(S\) be a triangulated closed connected surface. Then</p>
	\[ H_2(S) \cong \begin{cases} \Z & \text{if } S \text{ is orientable,} \\ 0 & \text{if } S \text{ is not,} \end{cases} \qquad\text{while}\qquad H_2(S;\Z/2) \cong \Z/2 \text{ always.} \]
</Theorem>

<Proof>
	<p>There are no 3-simplices, so \(H_2 = Z_2\), the group of 2-cycles. Let \(x = \sum_t a_t\, t\) be a 2-cycle. Every edge \(e\) of a closed surface lies in exactly two triangles, \(t\) and \(t'\), and the coefficient of \(e\) in \(\partial x\) is \(\pm a_t \pm a_{t'}\). For it to vanish we need \(\lvert a_t \rvert = \lvert a_{t'} \rvert\), with signs that make the two triangles induce <em>opposite</em> directions on \(e\). Since \(S\) is connected, we can walk from any triangle to any other across edges, so every \(\lvert a_t \rvert\) equals the same number \(m\). If \(m \ne 0\), the signs of the \(a_t\) orient every triangle so that neighbours always agree: a coherent orientation (<Ref to="topology/manifolds" />). So if \(S\) is not orientable, the only 2-cycle is \(0\). If \(S\) is orientable, the 2-cycles are exactly the multiples \(m\,T\) of the coherently oriented sum \(T\), and \(H_2 \cong \Z\). Over \(\Z/2\) there are no signs to worry about: the sum of all triangles always has every edge twice, so \(H_2(S;\Z/2) \cong \Z/2\).</p>
</Proof>

<p>The proof also shows where the torsion lives. Choose <em>any</em> orientation \(\varepsilon_t = \pm1\) for each triangle. At each edge the two triangles either agree (and the edge cancels) or clash (and the edge appears twice). So</p>

\[ \partial\Big(\sum_t \varepsilon_t\, t\Big) = 2c \]

<p>for an integer 1-chain \(c\) made of the clashing edges, the <dfn>clash cycle</dfn>. (It is a cycle: \(2\,\partial c = \partial\partial(\cdots) = 0\), so \(\partial c = 0\).) Reversing one triangle \(t\) changes the sum by \(\mp 2t\), so it changes \(c\) by \(\mp\partial t\), a boundary. However you re-orient the triangles, the class \([c] \in H_1(S)\) never changes. On an orientable surface some choice has no clashes, so \([c] = 0\). On a non-orientable surface \([c] \ne 0\): if \(c = \partial x\), then \(\sum \varepsilon_t t - 2x\) would be a 2-cycle with odd coefficients, contradicting the theorem. And \(2[c] = [\partial(\cdots)] = 0\). So every non-orientable closed surface has an element of order two in its first homology, and the clash cycle points right at it. Figure 3.4.9 lets you hunt for it by hand.</p>

<Figure num="3.4.9" title="The orientation painter" hint="Click triangles to flip them">
	<OrientationPainter />
	{#snippet caption()}Each triangle carries an orientation arrow; click to reverse it. Rose edges are clashes, where both neighbouring triangles run the same way, and together they form the clash cycle \(c\) with \(\partial(\sum \pm t) = 2c\). On the torus you can remove every clash. On the Klein bottle you can push the clashes around and shrink them to three edges, but never remove them: \([c] = [a]\) is the element of order two.{/snippet}
</Figure>

<History title="Twisted onto itself">
	<p>Poincaré discovered torsion in 1900, in the second of the five long supplements to his <em>Analysis Situs</em>, when he noticed that his two different ways of defining Betti numbers, with and without division, could disagree. He explained the name himself: the existence of torsion coefficients, he wrote, comes from the fact that the pieces of a polyhedron can form non-orientable manifolds, so that “the polyhedron is so to speak twisted onto itself”. When Emmy Noether later built Betti numbers and torsion numbers into the homology groups, the word, as John Stillwell puts it, “took up residence in algebra, much to the mystification of group theory students who were not informed of its origin in topology.”</p>
</History>

<Warning title="Torsion is not always a twist of orientation">
	<p>For surfaces, torsion in \(H_1\) happens exactly for the non-orientable ones, as we just proved. In higher dimensions the link breaks: the three-dimensional projective space \(\RP^3\) is orientable, yet \(H_1(\RP^3) \cong \Z/2\), and there are orientable 3-manifolds with any finite cyclic group you like as \(H_1\). Poincaré’s explanation of the name was too narrow. The general meaning is the one in the definition: a loop (or a higher cycle) that does not bound, some multiple of which does.</p>
</Warning>

<h2 id="coefficients">Three lenses: \(\Z\), \(\Q\) and \(\Z/2\)</h2>

<p>We now have three ways of looking at the same space, and they are not independent. The integer homology knows everything; the other two are shadows of it.</p>

<ul>
	<li><strong>Over \(\Q\)</strong> torsion disappears, because you may divide: if \(2z = \partial x\) then \(z = \partial(\tfrac12 x)\). So \(\dim H_k(K;\Q) = b_k\), the rank of the free part of \(H_k(K)\).</li>
	<li><strong>Over \(\Z/2\)</strong> every summand \(\Z/d\) with \(d\) even is seen <em>twice</em>. It appears once in \(H_k\), because the cycle \(z\) with \(dz = \partial x\) still fails to bound mod 2. And it appears again in \(H_{k+1}\), because mod 2 the chain \(x\) itself has become a cycle: \(\partial x = dz \equiv 0\). Summands \(\Z/d\) with \(d\) odd are invisible mod 2.</li>
</ul>

<p>In a formula: if \(t_k\) is the number of torsion summands of \(H_k(K)\) whose order is even, then</p>

\[ \dim H_k(K;\Z/2) \;=\; b_k + t_k + t_{k-1}. \]

<p>Check it on \(\RP^2\), whose integer homology is \(\Z, \Z/2, 0\): mod 2 we get \(1\), \(0 + 1 + 0 = 1\) and \(0 + 0 + 1 = 1\), exactly the \(1, 1, 1\) of Figure 3.4.2. For the Klein bottle, \(\Z, \Z \oplus \Z/2, 0\) gives \(1\), \(1 + 1 = 2\), \(0 + 0 + 1 = 1\): the \(1, 2, 1\) that made the Klein bottle look like a torus. The extra mod-2 classes were the torsion all along, counted twice. The same rule holds with any prime \(p\) in place of \(2\), counting the torsion summands whose order \(p\) divides.</p>

<Figure num="3.4.10" title="Four lenses on one space" hint="Choose a space">
	<CoefficientLenses />
	{#snippet caption()}Integer homology and the Betti numbers over \(\Q\), \(\Z/2\) and \(\Z/3\). Rose numbers differ from the \(\Q\) column, and the small grey sums split them into the free part plus torsion seen in this degree plus torsion from one degree below. The triple-wrapped disk (a disk whose rim wraps three times around a triangle) has \(H_1 \cong \Z/3\): invisible mod 2, seen twice mod 3.{/snippet}
</Figure>

<Remark title="The Universal Coefficient Theorem, in one sentence">
	<p>What we have just described is a special case of the Universal Coefficient Theorem: the integer homology of a space determines its homology with any coefficients. The general statement needs the tensor product and the “Tor” construction of <Ref to="big-picture/homological-algebra" />, and its cohomology version, with its surprising shift of torsion up one degree, is in <Ref to="cohomology/cohomology-groups" />. The converse fails: mod 2 alone could not tell the Klein bottle from the torus, and \(\Q\) alone cannot tell \(\RP^2\) from a point.</p>
</Remark>

<p>Which lens should you use? \(\Z/2\) is the simplest: no signs, no orientations, sets instead of sums, and the arithmetic of light switches. It is what most software for data uses. \(\Q\) (or \(\R\)) gives the honest Betti numbers, and it is the right setting for calculus on spaces, as in Part IV. \(\Z\) is the full truth, at the price of the Smith normal form.</p>

<h2 id="calculator">The homology calculator</h2>

<p>Here is the whole machine in one place. Choose a space from the gallery, or build your own by typing its simplices. The calculator lists the simplices, forms the boundary matrices, computes their ranks over \(\Q\) and \(\Z/2\) and their invariant factors over \(\Z\), and reads off the homology with four kinds of coefficients. It also finds a basis of mod-2 cycles that bound nothing and draws them on the picture, flat or (for the surfaces) in 3D.</p>

<Figure num="3.4.11" title="Homology calculator" hint="Choose a space · or build your own">
	<HomologyCalculator />
	{#snippet caption()}Everything this chapter computes, for any complex. The table shows \(H_k\) over \(\Z\) (torsion tinted rose) and the Betti numbers over \(\Q\), \(\Z/2\) and \(\Z/3\). Click a generator to highlight it; open “Boundary matrices” to see the matrices themselves.{/snippet}
</Figure>

<Question>
	<p>Some experiments to try. (1) In “Build your own”, start from three faces of a tetrahedron, then add the fourth face \(123\): watch \(H_2\) appear. (2) Load the Möbius band, then add the five triangles of a cone on its boundary: the result is \(\RP^2\), and \(H_1\) changes from \(\Z\) to \(\Z/2\) (Exercise 3 explains why). (3) Use “Edit a copy” on the Klein bottle and delete the triangle \(014\). Did the torsion survive? (4) Can you build a complex with \(H_1 \cong \Z/3\)? (Look at the triple wrap first.)</p>
</Question>

<h2 id="generators-and-scale">Generators, and computing at scale</h2>

<h3>Finding generators</h3>

<p>Knowing that \(H_1 \cong \Z \oplus \Z/2\) is one thing; pointing at loops that generate it is another. The Smith normal form gives generators for free. In the proof above, the basis vectors \(f_i\) with \(d_i > 1\) are cycles generating the torsion, and the extra cycles \(g_j\) generate the free part; keeping track of the row operations expresses them in terms of the original edges. Over \(\Z/2\) there is an even simpler procedure, the one the calculator uses: reduce the columns of \(\partial_k\) from left to right, recording which original columns were added together. Every column that reduces to zero gives a cycle, and comparing with the columns of \(\partial_{k+1}\) tells which of these cycles are independent modulo boundaries. Exactly this column reduction, run on a complex that grows over time, is the standard algorithm of persistent homology in <Ref to="homology/persistence" />.</p>

<p>Generators are not unique: any cycle homologous to a generator works just as well, and adding boundaries can make it wiggle all over the space. Choosing a “nice” representative, such as a shortest loop in a given class, is a genuinely harder optimization problem than computing the group, and an active area of computational topology.</p>

<h3>Millions of simplices</h3>

<p>Our examples are tiny. The torus grid has \(54\) simplices and a \(27\times18\) matrix. A surface scanned from a real object, or a complex built from data in <Ref to="homology/persistence" />, can have millions. Then the slogan “it is just linear algebra” stops being comforting. Robert Ghrist put it memorably:</p>

<blockquote>There is no recourse to chanting “Homology is just linear algebra” when faced with millions of simplices: one needs good algorithms.</blockquote>

<p>Several facts make large computations possible.</p>

<ul>
	<li><strong>Sparsity.</strong> A \(k\)-simplex has only \(k+1\) faces, so each column of \(\partial_k\) has at most \(k+1\) non-zero entries, however large the complex. Algorithms that touch only the non-zero entries are far faster than the textbook bound for elimination, which grows like the cube of the matrix size.</li>
	<li><strong>Shrinking first.</strong> Many simplices can be removed without changing homology at all, for instance a triangle together with an edge that belongs to no other triangle (an “elementary collapse”). Removing such pairs before doing any linear algebra, a strategy refined by discrete Morse theory, often shrinks the problem enormously.</li>
	<li><strong>Working mod a prime.</strong> Integer Smith normal forms can produce enormous intermediate numbers. Computing ranks modulo a few primes avoids this and still detects torsion: a prime \(p\) that divides an invariant factor makes the rank mod \(p\) drop.</li>
	<li><strong>Good software.</strong> Libraries such as GUDHI and Ripser routinely compute homology and persistent homology of complexes with millions of simplices.</li>
</ul>

<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="The matrix (2)">
	<p>View the \(1\times1\) matrix \((2)\) as a map \(\Z\to\Z\). What is its rank over \(\Q\), over \(\Z/2\) and over \(\Z/3\)? What is its cokernel (the target divided by the image) over \(\Z\)? If \((2)\) were the matrix of \(\partial_{k+1}\colon C_{k+1}\to C_k\) and \(\partial_k = 0\), what would \(H_k\) be?</p>
	{#snippet solution()}
		<p>Over \(\Q\) the rank is \(1\), over \(\Z/2\) it is \(0\) (since \(2 = 0\)), and over \(\Z/3\) it is \(1\) (since \(2 \ne 0\) in \(\Z/3\); indeed \(2\cdot2 = 4 = 1\), so \(2\) is invertible there). Over \(\Z\) the image is \(2\Z\) and the cokernel is \(\Z/2\Z \cong \Z/2\). With \(\partial_k = 0\) every element of \(C_k = \Z\) is a cycle and the boundaries are \(2\Z\), so \(H_k \cong \Z/2\). This is exactly the projective plane’s \(H_1\), in its smallest possible model (one cell in each dimension, <Ref to="homology/exact-sequences" />).</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="A Smith normal form by hand">
	<p>Bring \(\begin{pmatrix} 2 & 4 \\ 6 & 8 \end{pmatrix}\) to Smith normal form using integer row and column operations. If this were \(\partial_{k+1}\) and its two rows were a basis of the cycles \(Z_k\), what would \(H_k\) be?</p>
	{#snippet hint()}
		<p>The greatest common divisor of all entries is \(2\), and the determinant is \(-8\). The invariant factors multiply to \(\lvert\det\rvert\).</p>
	{/snippet}
	{#snippet solution()}
		<p>Subtract \(3\times\) row 1 from row 2: \(\begin{pmatrix} 2 & 4 \\ 0 & -4 \end{pmatrix}\). Subtract \(2\times\) column 1 from column 2: \(\begin{pmatrix} 2 & 0 \\ 0 & -4 \end{pmatrix}\). Negate row 2: \(\operatorname{diag}(2, 4)\), and \(2 \mid 4\). The invariant factors are \(2\) and \(4\), so \(H_k \cong \Z/2 \oplus \Z/4\), a group of order \(8 = \lvert\det\rvert\). Note that \(\Z/2 \oplus \Z/4\) is not \(\Z/8\): it has no element of order \(8\).</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="The rim of a Möbius band">
	<p>The five-vertex Möbius band has triangles \([i, i+1, i+2]\) (labels mod 5). Its core circle is \(m = 0\to1\to2\to3\to4\to0\) and its boundary circle is \(\beta = 0\to2\to4\to1\to3\to0\). (a) Show that \(\beta = 2m - \partial\big(\sum_{i} [i, i+1, i+2]\big)\), where each triangle is oriented \(i \to i+1 \to i+2\). (b) Conclude that the boundary circle is homologous to twice the core. (c) The projective plane is a Möbius band with a disk glued to its boundary circle (<Ref to="topology/gluing" />). Explain why this produces an element of order two.</p>
	{#snippet solution()}
		<p>(a) The boundary of the oriented triangle \(i \to i+1 \to i+2\) is \((i\to i+1) + (i+1 \to i+2) + (i+2 \to i)\): two edges of the core and one edge of the rim, run backwards. Adding over \(i = 0, \dots, 4\), each core edge \(i \to i+1\) occurs twice (in the triangles starting at \(i\) and at \(i-1\)), and each rim edge \(i \to i+2\) occurs once with a minus sign. So \(\partial(\sum_i t_i) = 2m - \beta\). (b) Rearranging, \(\beta - 2m = -\partial(\sum_i t_i)\) is a boundary, so \([\beta] = 2[m]\). (c) \(H_1\) of the band is \(\Z\), generated by \([m]\). Gluing in a disk along \(\beta\) makes \(\beta\) a boundary, so \(2[m] = [\beta] = 0\), while \([m]\) itself does not become zero (nothing new bounds \(m\)). The result is \(H_1(\RP^2) \cong \Z/2\), generated by the core of the band. (You can watch this happen in the calculator.)</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="The other Klein bottle loop">
	<p>On the Klein bottle grid, let \(\psi(x)\) be the signed number of times a 1-chain \(x\) crosses the top seam going upward (edges from the top row of small squares into the glued top count \(+1\) when run upward, \(-1\) when run downward). Show that \(\psi\) vanishes on every boundary, and deduce that no non-zero multiple of \(b = [0,3] + [3,6] - [0,6]\) is a boundary. Why does the same trick fail for the horizontal loop \(a\)?</p>
	{#snippet solution()}
		<p>The boundary of a triangle in the top row of squares crosses the seam once upward and once downward (or not at all), so \(\psi(\partial t) = 0\), and by linearity \(\psi(\partial x) = 0\) for every 2-chain \(x\). The flip in the gluing reverses left and right but not up and down, so “upward” makes sense on both sides of the seam. The loop \(b\) crosses the top seam once upward, so \(\psi(nb) = n\), which is non-zero for \(n \ne 0\); hence \(nb\) is never a boundary. For \(a\) one would count crossings of the left/right seam, from left to right. But a path that crosses the flipped top seam comes back with left and right exchanged, so “rightward” is not consistent: that count is not well defined over \(\Z\) (only mod 2). Its failure is exactly why \(2a\) can bound.</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Reading coefficients">
	<p>Suppose a complex has integer homology \(H_0 = \Z\), \(H_1 = \Z \oplus \Z/4 \oplus \Z/3\), and \(H_k = 0\) for \(k \ge 2\). Find its Betti numbers over \(\Q\), over \(\Z/2\), over \(\Z/3\) and over \(\Z/5\).</p>
	{#snippet solution()}
		<p>Over \(\Q\): \(1, 1, 0\). Over \(\Z/2\): the \(\Z/4\) has even order and counts in degrees \(1\) and \(2\), while \(\Z/3\) is invisible: \(1\), \(1 + 1 = 2\), \(1\). Over \(\Z/3\): now \(\Z/3\) counts twice and \(\Z/4\) is invisible: \(1, 2, 1\). Over \(\Z/5\): no torsion is seen: \(1, 1, 0\). Different primes see different parts of the torsion; only \(\Z\) sees all of it.</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Non-orientable means no 2-cycles">
	<p>Write out in full the argument that on a closed connected surface every 2-cycle \(\sum a_t t\) has all \(\lvert a_t\rvert\) equal, and that a non-zero 2-cycle orients the surface coherently. Where exactly did you use that every edge lies in <em>exactly two</em> triangles, and what goes wrong for the Möbius band?</p>
	{#snippet solution()}
		<p>Take an edge \(e\) with its two triangles \(t, t'\). In \(\partial(\sum a_s s)\) the coefficient of \(e\) is \(\sigma a_t + \sigma' a_{t'}\), with \(\sigma, \sigma' = \pm1\) the signs of \(e\) in \(\partial t\) and \(\partial t'\). It vanishes only if \(a_{t'} = -\sigma\sigma' a_t\); in particular \(\lvert a_t\rvert = \lvert a_{t'}\rvert\), and the oriented triangles \(\operatorname{sign}(a_t)\,t\) and \(\operatorname{sign}(a_{t'})\,t'\) induce opposite directions on \(e\). Connectedness spreads the equality \(\lvert a_t \rvert = m\) to all triangles, and if \(m \ne 0\) the signs give a coherent orientation. “Exactly two” was used to write the coefficient of \(e\) as a sum of just two terms. On the Möbius band the edges of the rim lie in only one triangle, so their coefficient is \(\pm a_t\), forcing \(a_t = 0\) for every triangle along the rim and then, by the same spreading argument, everywhere. The band has no 2-cycles, but for a different reason: it has a boundary.</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="Punctured surfaces">
	<p>Remove the single triangle \([0,1,4]\) from the torus grid, and separately from the Klein bottle grid. Predict the homology of both results before checking in the calculator. What happened to the Klein bottle’s torsion?</p>
	{#snippet solution()}
		<p>Both become \(\Z, \Z^2, 0\). Removing an open triangle from a closed surface leaves a surface with one boundary circle, which deformation retracts onto a wedge of two circles (the edges \(a\) and \(b\) of the square). In particular \(H_2\) becomes \(0\), and the Klein bottle loses its torsion: the relation \(2a = \partial(\sum \pm t)\) needed <em>all</em> eighteen triangles, and with one missing, the boundary of the remaining seventeen also contains the rim of the hole. The torsion was a global property of the closed surface, not of any small piece of it.</p>
	{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>Computing homology is linear algebra on the boundary matrices. Over a field it needs only ranks, \(b_k = n_k - \rank\partial_k - \rank\partial_{k+1}\), computed by row reduction.</li>
		<li>The same matrix can have different ranks over different fields: \(\partial_2\) of \(\RP^2\) has rank \(9\) over \(\Z/2\) and \(10\) over \(\Q\), because a pivot equals \(2\).</li>
		<li>Over \(\Z\) the Smith normal form \(\operatorname{diag}(d_1, \dots, d_r)\) of \(\partial_{k+1}\) gives \(H_k \cong \Z^{n_k - r_k - r_{k+1}} \oplus \bigoplus_{d_i > 1} \Z/d_i\). Invariant factors bigger than \(1\) are torsion.</li>
		<li>Klein bottle: \(\Z, \Z \oplus \Z/2, 0\), with \(2a = \partial(\sum \pm t)\). Projective plane: \(\Z, \Z/2, 0\), with \(2c = \partial(\sum \pm t)\). Torus: \(\Z, \Z^2, \Z\). The cliffhanger is resolved.</li>
		<li>A closed connected surface has \(H_2 \cong \Z\) if orientable and \(0\) if not. The clash cycle of any orientation choice represents a class of order two that vanishes exactly when the surface is orientable.</li>
		<li>\(\Q\) forgets torsion; \(\Z/p\) sees each torsion summand of order divisible by \(p\) twice, in two adjacent degrees. Integer homology determines all the others.</li>
		<li>Real computations rely on sparsity, collapses and modular arithmetic: in Ghrist’s words, one needs good algorithms.</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading
	items={[
		{
			title: 'Computing Homology',
			author: 'Jeremy Kun',
			url: 'https://jeremykun.com/2013/04/10/computing-homology/',
			note: 'A friendly, code-first walk through column reduction of boundary matrices, following his "Homology Theory — A Primer".',
			kind: 'web',
			free: true
		},
		{
			title: 'Computational Homology',
			author: 'Tomasz Kaczynski, Konstantin Mischaikow and Marian Mrozek',
			url: 'https://doi.org/10.1007/b97315',
			note: 'A whole book on computing homology, with cubical complexes for images, reduction algorithms and the Smith normal form in detail.',
			kind: 'book'
		},
		{
			title: 'Computational Topology: An Introduction',
			author: 'Herbert Edelsbrunner and John Harer',
			url: 'https://doi.org/10.1090/mbk/069',
			note: 'Homology and its algorithms (chapter IV), matrix reduction and complexity, leading straight into persistence.',
			kind: 'book'
		},
		{
			title: 'Elements of Algebraic Topology',
			author: 'James R. Munkres',
			url: 'https://doi.org/10.1201/9780429493911',
			note: 'The first chapter computes the homology of surfaces, the Klein bottle and the projective plane among them, by hand, and shows how integer matrix reduction makes homology computable.',
			kind: 'book'
		},
		{
			title: 'Algebraic Topology, Section 2.1 and Example 2.37',
			author: 'Allen Hatcher',
			url: 'https://pi.math.cornell.edu/~hatcher/AT/AT.pdf',
			note: 'Simplicial homology, and the homology of all closed surfaces, orientable and not, computed by cellular means.',
			kind: 'book',
			free: true
		},
		{
			title: 'Barcodes: the persistent topology of data',
			author: 'Robert Ghrist',
			url: 'https://doi.org/10.1090/S0273-0979-07-01191-3',
			note: 'A short, lively survey (Bull. AMS, 2008) of why and how homology is computed for data; the source of the quotation above.',
			kind: 'paper',
			free: true
		},
		{
			title: 'Interactive Homology Calculator',
			author: 'John Wiltshire-Gordon',
			url: 'https://jwiltshiregordon.github.io/homology',
			note: 'Another browser calculator: type facets, get elementary divisors, cycle representatives and long exact sequences.',
			kind: 'interactive',
			free: true
		},
		{
			title: 'Papers on Topology: Analysis Situs and Its Five Supplements',
			author: 'Henri Poincaré, translated by John Stillwell',
			url: 'https://webhomes.maths.ed.ac.uk/~v1ranick/papers/poincare2009.pdf',
			note: 'Where Betti numbers, torsion coefficients and the incidence matrices all began; the translator’s introduction is a gem.',
			kind: 'book',
			free: true
		}
	]}
/>

<style>
	.pair2 {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem 1rem;
		padding: 1rem 1.1rem 0.6rem;
	}
	@media (max-width: 520px) {
		.pair2 {
			grid-template-columns: 1fr;
		}
	}
	.pc {
		text-align: center;
		font-size: 0.86rem;
		color: var(--ink-dim);
		margin: 0.2rem 0 0 !important;
	}
</style>
