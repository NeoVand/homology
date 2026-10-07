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
	import Cite from '$lib/components/prose/Cite.svelte';
	import Question from '$lib/components/prose/Question.svelte';
	import Recap from '$lib/components/prose/Recap.svelte';
	import Exercise from '$lib/components/prose/Exercise.svelte';
	import Figure from '$lib/components/prose/Figure.svelte';
	import Term from '$lib/components/prose/Term.svelte';
	import Ref from '$lib/components/prose/Ref.svelte';
	import Scrub from '$lib/components/prose/Scrub.svelte';
	import TeX from '$lib/components/prose/TeX.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import PolyhedronGallery from '$lib/figures/topology/euler-characteristic/PolyhedronGallery.svelte';
	import CauchyProof from '$lib/figures/topology/euler-characteristic/CauchyProof.svelte';
	import TwoTrees from '$lib/figures/topology/euler-characteristic/TwoTrees.svelte';
	import SubdivisionPlayground from '$lib/figures/topology/euler-characteristic/SubdivisionPlayground.svelte';
	import Tunnels from '$lib/figures/topology/euler-characteristic/Tunnels.svelte';
	import SurfaceChart from '$lib/figures/topology/euler-characteristic/SurfaceChart.svelte';
	import GraphChi from '$lib/figures/topology/euler-characteristic/GraphChi.svelte';

	let n = $state(6);
	let g = $state(3);
	let k = $state(3);

	const reading = [
		{
			title: 'Euler’s Gem: The Polyhedron Formula and the Birth of Topology',
			author: 'David S. Richeson',
			url: 'https://doi.org/10.1515/9781400838561',
			note: 'A whole book about V − E + F, for a general reader: the history from the Greeks to Poincaré, many proofs, the torus and beyond, and Gauss–Bonnet. The best companion to this chapter.',
			kind: 'book' as const
		},
		{
			title: 'Proofs and Refutations',
			author: 'Imre Lakatos',
			url: 'https://doi.org/10.1017/CBO9781139171472',
			note: 'A classroom dialogue about Euler’s formula, its proofs and its counterexamples (picture frames, cubes within cubes, crested cubes). A classic of the philosophy of mathematics, and great fun.',
			kind: 'book' as const
		},
		{
			title: 'Euler’s Formula and Graph Duality',
			author: '3Blue1Brown (Grant Sanderson)',
			url: 'https://www.3blue1brown.com/lessons/eulers-characteristic-formula',
			note: 'A beautifully animated version of the “two trees” proof in this chapter.',
			kind: 'video' as const,
			free: true
		},
		{
			title: 'Twenty-one Proofs of Euler’s Formula',
			author: 'David Eppstein',
			url: 'https://ics.uci.edu/~eppstein/junkyard/euler/',
			note: 'Exactly what it says: a long list of different proofs, with sketches and references. Browse for the variety of ideas.',
			kind: 'web' as const,
			free: true
		},
		{
			title: 'Graphs, Surfaces and Homology',
			author: 'Peter Giblin',
			url: 'https://doi.org/10.1017/CBO9780511779534',
			note: 'The Euler characteristic of graphs and surfaces, the classification of surfaces, and how it all becomes homology — at undergraduate level, with many exercises.',
			kind: 'book' as const
		},
		{
			title: 'Computational Topology: An Introduction',
			author: 'Herbert Edelsbrunner and John Harer',
			url: 'https://doi.org/10.1090/mbk/069',
			note: 'Euler characteristic and the classification of surfaces from a computer scientist’s point of view, leading into homology and persistence.',
			kind: 'book' as const
		},
		{
			title: 'How Mathematicians Use Homology to Make Sense of Topology',
			author: 'Kelsey Houston-Edwards, Quanta Magazine',
			url: 'https://www.quantamagazine.org/how-mathematicians-use-homology-to-make-sense-of-topology-20210511/',
			note: 'A short popular article that ends exactly where this chapter does: the Euler characteristic as an alternating count of holes.',
			kind: 'web' as const,
			free: true
		}
	];
</script>

<Epigraph author="John Stillwell" source="introduction to Poincaré’s Papers on Topology (2010)"
	>Without much exaggeration, it can be said that only one important topological concept came to light before Poincaré. This was
	the Euler characteristic of surfaces…</Epigraph
>

<p class="lead">
	Take any box, die, pyramid or gemstone. Count its corners, its edges and its flat faces. Subtract the second number from the
	first, and add the third. A cube gives \(8 - 12 + 6 = 2\). A pyramid gives \(5 - 8 + 5 = 2\). A soccer ball, stitched from 32
	panels, gives \(60 - 90 + 32 = 2\). The answer is always 2. This chapter is about why — and about what happens when it is
	<em>not</em> 2, which turns out to be even more interesting.
</p>

<Ahead>
	<p>
		The number \(V - E + F\) is the <em>Euler characteristic</em>, the first quantity in history that was noticed to depend only on
		the shape of a thing and not on how it is cut up. It is the hinge between counting and topology. In
		<Ref to="homology/homology-groups" /> it will be explained completely by the Euler–Poincaré formula \(\chi = b_0 - b_1 + b_2\): an
		alternating count of <em>pieces</em> equals an alternating count of <em>holes</em>. Later it reappears in curvature (the
		Gauss–Bonnet theorem of <Ref to="cohomology/characteristic-classes" />), in vector fields (why you cannot comb a hairy ball), and
		in <Ref to="cohomology/poincare-duality" />.
	</p>
</Ahead>

<h2 id="a-curious-count">A curious count</h2>

<p>
	A <dfn>polyhedron</dfn> is a solid whose surface is made of flat polygons (with no holes in them), the <em>faces</em>, joined
	along straight <em>edges</em>, with the edges meeting at <em>vertices</em> (corners). The cube is one; so is a pyramid, a prism, a cut diamond.
	For each polyhedron we count three numbers: \(V\), the number of vertices; \(E\), the number of edges; and \(F\), the number of
	faces. Then we compute \(V - E + F\). Try it in the gallery below; the figure does the counting with you.
</p>

<Figure num="2.6.1" title="A gallery of polyhedra" hint="Choose a solid · tap a count · drag to rotate">
	<PolyhedronGallery />
	{#snippet caption()}
		Pick a solid and tap \(V\), \(E\) or \(F\) to watch the vertices, edges or faces counted one by one. However the numbers change,
		\(V - E + F\) is always \(2\). (The note about angle defects will make sense later in the chapter.)
	{/snippet}
</Figure>

<p>
	Here are the five <dfn>Platonic solids</dfn> — the convex polyhedra whose faces are identical regular polygons, the same number
	meeting at every corner — in a table.
</p>

<div class="table-wrap">
	<table>
		<thead>
			<tr><th>Solid</th><th>Faces</th><th>V</th><th>E</th><th>F</th><th>V − E + F</th></tr>
		</thead>
		<tbody>
			<tr><td>Tetrahedron</td><td>4 triangles</td><td>4</td><td>6</td><td>4</td><td>2</td></tr>
			<tr><td>Cube</td><td>6 squares</td><td>8</td><td>12</td><td>6</td><td>2</td></tr>
			<tr><td>Octahedron</td><td>8 triangles</td><td>6</td><td>12</td><td>8</td><td>2</td></tr>
			<tr><td>Dodecahedron</td><td>12 pentagons</td><td>20</td><td>30</td><td>12</td><td>2</td></tr>
			<tr><td>Icosahedron</td><td>20 triangles</td><td>12</td><td>30</td><td>20</td><td>2</td></tr>
		</tbody>
	</table>
</div>

<p>
	The individual numbers vary wildly; the combination \(V - E + F\) does not. It is not just the Platonic solids. Take a
	<em>prism</em> over a polygon with \(n\) sides — two copies of the polygon, top and bottom, joined by \(n\) rectangles. Drag the
	number to change it: with \(n =\) <Scrub bind:value={n} min={3} max={40} label="number of sides of the polygon" /> there are
	\(2n\) vertices, \(3n\) edges (\(n\) on top, \(n\) on the bottom, \(n\) upright) and \(n + 2\) faces, and
	<TeX tex={`${2 * n} - ${3 * n} + ${n + 2} = ${2 * n - 3 * n + n + 2}`} />. A <em>pyramid</em> over the same polygon has \(n+1\)
	vertices, \(2n\) edges and \(n+1\) faces: <TeX tex={`${n + 1} - ${2 * n} + ${n + 1} = 2`} />. A double pyramid has \(n+2\)
	vertices, \(3n\) edges and \(2n\) faces: <TeX tex={`${n + 2} - ${3 * n} + ${2 * n} = 2`} />. In each case the algebra shows why:
	the \(n\)’s cancel, and 2 is left over.
</p>

<Question>
	<p>
		Before reading on, try to break the pattern. Can you imagine a polyhedron for which \(V - E + F\) is not \(2\)? (There are some —
		but they all have something in common. We will meet them later in the chapter.)
	</p>
</Question>

<h2 id="eulers-formula">Euler’s polyhedron formula</h2>

<Theorem id="thm-euler" label="Theorem (Euler’s polyhedron formula)">
	<p>
		For every convex polyhedron — and more generally for every polyhedron whose surface can be inflated into a round sphere without
		tearing — the numbers of vertices, edges and faces satisfy
		\[ V - E + F = 2. \]
	</p>
</Theorem>

<p>
	“Convex” means the solid has no dents: the straight segment between any two of its points stays inside it. Every polyhedron in the
	gallery is convex. The more general phrasing says the same thing topologically: the surface must be <em>a sphere in disguise</em>
	— homeomorphic to a sphere, in the language of <Ref to="topology/spaces" />. That condition is not decoration. We will see that the
	whole content of the formula is a fact about the sphere, and that other surfaces give other numbers.
</p>

<History title="A lost notebook, a letter, and a theorem with a rocky childhood">
	<p>
		Leonhard Euler announced the formula in a letter to Christian Goldbach in November 1750 and published it, with an attempted
		proof, in 1758 <Cite k="euler1758,euler1758b" />. His insight was to ignore angles and lengths and look only at the
		<em>pattern</em> of a solid: how many corners, edges and faces it has, and how they fit together — the first truly topological
		way of looking at a shape. René Descartes had come close around 1630, in a notebook about polyhedra. After his death in Stockholm
		the notebook was shipped back to Paris, the boat sank in the Seine, and the pages spent three days under water. Leibniz copied
		them in 1676; then both the original and the copy vanished, until the copy turned up in Hanover around 1860
		<Cite k="federico1982" />. Euler’s own proof had gaps. Augustin-Louis Cauchy, aged 21, gave a better one in a memoir read in
		1811 <Cite k="cauchy1813" /> — the one you will see next — and two years later Simon Lhuilier catalogued polyhedra for which the
		formula fails <Cite k="lhuilier1813" />. The long argument about what exactly the theorem says, and what counts as a
		polyhedron, is the subject of Imre Lakatos’s <em>Proofs and Refutations</em> <Cite k="lakatos1976" />, a dialogue in which a
		teacher and a class of students argue over this very formula. The whole story is told in <Cite k="richeson2008" text />.
	</p>
</History>

<p>
	Descartes’s notebook contained a related theorem that you can already check in the gallery. At each corner of a convex
	polyhedron, the angles of the faces meeting there add up to less than a full turn of \(360°\) — otherwise the corner would be flat.
	The shortfall is the <dfn>angle defect</dfn> at that corner. A cube has three right angles at each corner, so each defect is \(360°
	- 270° = 90°\), and the eight corners together fall short by \(8 \times 90° = 720°\). Descartes found that the total defect of every
	convex polyhedron is exactly \(720°\), two full turns <Cite k="federico1982" /> — and two is the same 2 as in Euler’s formula. This is the first glimpse of a
	deep link between counting and curvature that we will return to at the end of the chapter.
</p>

<h2 id="why-it-is-true">Why it is true</h2>

<p>
	A good proof should explain the 2. Here are two. The first is Cauchy’s, which changes the polyhedron step by step without ever
	changing \(V - E + F\); the second counts the edges with two trees.
</p>

<h3 id="cauchys-proof">Cauchy’s proof: shrink the problem without changing the answer</h3>

<p>The idea is to keep simplifying the picture by moves that never change \(V - E + F\), until we reach something trivial.</p>

<ol>
	<li>
		<strong>Remove one face and flatten.</strong> Take out one face, say the front face of the cube, and imagine the rest is made of
		stretchy rubber. Pull the hole wide open and lay the surface flat on a table. You get a flat network of points and lines — for the
		cube, a small square inside a big one, joined at the corners. Vertices and edges are untouched; only one face is gone. So for the
		flat network, \(V - E + F\) is exactly one less than for the polyhedron: Euler’s formula is the same as saying the flat network
		has \(V - E + F = 1\). (The removed face has not really disappeared: it has become the region <em>outside</em> the network.)
	</li>
	<li>
		<strong>Cut every face into triangles.</strong> Draw diagonals across each polygon until only triangles are left. Each diagonal
		adds one edge, and splits one face into two, so it adds one face too. \(E\) and \(F\) both go up by 1, and \(V - E + F\) is
		unchanged.
	</li>
	<li>
		<strong>Remove triangles from the outside, one at a time.</strong> A triangle on the outside of the network touches the outside
		along either one edge or two edges.
		<ul>
			<li>One edge: removing the triangle removes that edge and one face. \(E\) and \(F\) both drop by 1; no change.</li>
			<li>
				Two edges: removing the triangle removes both edges, the corner between them, and one face. \(V\) drops by 1, \(E\) by 2
				and \(F\) by 1; the change in \(V - E + F\) is \(-1 + 2 - 1 = 0\).
			</li>
		</ul>
	</li>
	<li>
		<strong>Stop when one triangle is left.</strong> It has \(3 - 3 + 1 = 1\). Since nothing ever changed, the flat network had \(V -
		E + F = 1\) all along, and the polyhedron, with its face put back, has \(V - E + F = 1 + 1 = 2\).
	</li>
</ol>

<Figure num="2.6.2" title="Cauchy’s proof, on a cube" hint="Step through, or press play">
	<CauchyProof />
	{#snippet caption()}
		Each step changes \(V\), \(E\) and \(F\), but never \(V - E + F\). The dashed rose outline shows what the last step removed. The
		final count, one triangle, is \(3 - 3 + 1 = 1\); adding back the face we took out gives \(2\).
	{/snippet}
</Figure>

<Question title="Run the proof yourself on a tetrahedron">
	<p>
		Remove one triangular face of a tetrahedron and flatten the rest: you get a triangle with one extra point inside, joined to its three
		corners. Check that \(V - E + F = 4 - 6 + 3 = 1\). Every face is already a triangle, so step 2 does nothing. Now remove a triangle
		with one outer edge (\(4 - 5 + 2 = 1\)), then one with two outer edges (\(3 - 3 + 1 = 1\)). One triangle is left, and putting the
		missing face back gives \(1 + 1 = 2\).
	</p>
</Question>

<Warning title="The order of removals matters">
	<p>
		Step 3 hides a trap that Cauchy passed over and Lakatos made famous. Suppose a triangle touches the outside along one edge, but
		its third corner <em>also</em> lies on the outside. Removing it does not change the count, but what is left is pinched: two
		pieces hanging together at a single corner. Carry on, and you can meet a triangle with two outer edges whose shared corner also
		belongs to the other piece. That corner has to stay, so only \(E\) and \(F\) drop, by 2 and 1, and \(V - E + F\) goes
		<em>up</em> by 1. The repair is to remove only triangles that leave the network in one piece with a single outer boundary. Such
		a triangle always exists, and the figure follows that rule.
	</p>
</Warning>

<p>
	Look at where the proof used the shape of the polyhedron. Only in step 1: removing a face had to leave something that can be
	stretched flat. That is true for anything shaped like a sphere — a sphere with a hole punched in it is a disk — and it is exactly
	what will fail for a polyhedron with a tunnel through it.
</p>

<h3 id="two-trees">A second proof: two trees</h3>

<p>
	Flatten the polyhedron as in step 1 (or simply draw its edges on a sphere). Now choose a <Term t="spanning-tree">spanning tree</Term>:
	a set of edges that connects all \(V\) vertices without forming any loop. A tree on \(V\) vertices always has exactly \(V - 1\)
	edges, because building it up one edge at a time, each new edge brings in exactly one new vertex. Colour these edges teal.
</p>

<p>
	Now look at the edges you did <em>not</em> use. Put a dot in the middle of every face (including one for the outside face), and for
	each unused edge, draw a short path between the two faces on either side of it, crossing that edge. These paths join the \(F\) face
	dots into a network of their own, the <dfn>dual graph</dfn>. Two facts make the proof work. The paths join up all the faces — if a
	group of faces were cut off from the rest, the teal edges around it would have to form a loop, and a tree has none. And the paths
	contain no loop — a loop of paths would fence off some vertices from the others, but the teal tree connects everything. So the
	unused edges form a tree on the \(F\) faces, with \(F - 1\) edges. Every edge is in exactly one of the two trees, so
	\[ E = (V - 1) + (F - 1), \qquad\text{that is,}\qquad V - E + F = 2. \]
	The 2 is \(1 + 1\): one for each tree. This proof goes back to Karl von Staudt’s <em>Geometrie der Lage</em> of 1847
	<Cite k="vonstaudt1847" />, and it is the favourite of David Eppstein, who has collected twenty-one different proofs of the
	formula (see the reading list).
</p>

<Figure num="2.6.3" title="Two trees" hint="Hover a grey edge · try another tree">
	<TwoTrees />
	{#snippet caption()}
		The flattened cube. Teal: a spanning tree of the 8 corners (7 edges). Violet: paths across the other 5 edges, joining the 6 faces —
		counting the outside — into a tree. Every one of the 12 edges is used by exactly one of the two trees. Each grey edge, added to the
		teal tree, would close a gold loop.
	{/snippet}
</Figure>

<Intuition title="A first look at loops">
	<p>
		Hover a grey edge in the figure: adding it to the tree closes exactly one loop. A connected network with \(V\) vertices and \(E\)
		edges therefore has \(E - (V - 1)\) “extra” edges, each closing its own loop. Counting loops this way is the starting point of
		<Ref to="homology/cycles-and-boundaries" />, and we will come back to it at the end of this chapter.
	</p>
</Intuition>

<h2 id="invariance">Cutting finer never changes it</h2>

<p>
	Cauchy’s proof hides a more general idea, worth pulling into the light. Take any surface cut into polygons — a polyhedron, or a
	triangulated torus from <Ref to="topology/simplicial-complexes" /> — and refine it by one of three moves.
</p>

<ul>
	<li>
		<strong>Split an edge</strong> by putting a new vertex in its middle: \(V\) goes up by 1, and the edge becomes two, so \(E\) goes
		up by 1. Change in \(V - E + F\): \(+1 - 1 = 0\).
	</li>
	<li>
		<strong>Cut a face</strong> with a new edge between two of its corners: \(E\) goes up by 1 and \(F\) goes up by 1. Change: \(-1 +
		1 = 0\).
	</li>
	<li>
		<strong>Put a vertex inside a face</strong> with \(k\) corners and join it to all of them: \(V\) goes up by 1, \(E\) by \(k\), and
		the face becomes \(k\) triangles, so \(F\) goes up by \(k - 1\). Change: \(1 - k + (k - 1) = 0\).
	</li>
</ul>

<p>Try to break it.</p>

<Figure num="2.6.4" title="Subdivide it yourself" hint="Pick a move · click an edge or face · drag to turn">
	<SubdivisionPlayground />
	{#snippet caption()}
		Every click changes \(V\), \(E\) and \(F\); the readout shows by how much. The glowing number \(V - E + F\) never moves from 2.
		“Ten random moves” lets the computer try.
	{/snippet}
</Figure>

<p>
	Now we can define the number in general. A finite simplicial complex has an f-vector \((n_0, n_1, n_2, \dots)\) — the numbers of
	vertices, edges, triangles, tetrahedra and so on — and a CW complex has its numbers of cells \(c_0, c_1, c_2, \dots\).
</p>

<Definition id="def-euler-characteristic">
	{#snippet head()}The Euler characteristic \(\chi\){/snippet}
	<p>
		The <strong>Euler characteristic</strong> of a finite simplicial complex \(K\) is the alternating sum
		\[ \chi(K) = n_0 - n_1 + n_2 - n_3 + \cdots, \]
		and for a finite CW complex, the same alternating sum of its numbers of cells, \(c_0 - c_1 + c_2 - \cdots\). For a polyhedron or a
		surface cut into polygons, \(\chi = V - E + F\). The letter \(\chi\) is the Greek “chi”, pronounced “kai”.
	</p>
</Definition>

<Theorem id="thm-invariance" title="χ depends only on the shape">
	<p>
		If two finite simplicial (or CW) complexes have homeomorphic underlying spaces, they have the same Euler characteristic. So it
		makes sense to write \(\chi(X)\) for a space \(X\) itself.
	</p>
</Theorem>

<p>
	This is what makes \(\chi\) a <Term t="topological-invariant">topological invariant</Term>: a number attached to a space that
	homeomorphisms cannot change. If two spaces have different Euler characteristics, they are definitely not homeomorphic — no
	amount of stretching will turn one into the other.
</p>

<Remark title="How honest is our evidence?">
	<p>
		The three moves show that refining a decomposition never changes \(\chi\). To finish the proof this way we would need any two
		decompositions of the same space to have refinements that match exactly. For surfaces they do — Tibor Radó proved it in 1925
		<Cite k="rado1925" /> — but the argument is long and fiddly, and in higher dimensions it is false: John Milnor found two
		triangulated spaces that are homeomorphic yet have no matching refinements at all <Cite k="milnor1961" />. The clean proof,
		valid in every dimension and for every way of cutting up a space, comes from homology, in <Ref to="homology/homology-groups" />
		<Cite k="hatcher2002" loc="Theorem 2.44" />. Until then, treat the theorem as a well-tested promise.
	</p>
</Remark>

<p>
	Some quick checks with complexes from the previous chapter. A single point: \(\chi = 1\). A solid triangle: \(3 - 3 + 1 = 1\). A
	solid tetrahedron: \(4 - 6 + 4 - 1 = 1\). All of these can be squashed down to a point, and all have \(\chi = 1\). The circle, as a
	hollow triangle: \(3 - 3 = 0\). The barycentric subdivisions of <Ref to="topology/simplicial-complexes" hash="barycentric-subdivision"
		>the last chapter</Ref
	> changed the f-vector of a triangle with an edge attached from \((4,4,1)\) to \((9,14,6)\) to \((29,64,36)\), and every time
	\(\chi = 1\). Hatcher’s textbook opens with a stranger example, the “house with two rooms”: a box divided by a floor into two
	rooms, each reached only by a tunnel through the other. Cut into the obvious pieces it has \(29\) vertices, \(51\) edges and \(23\)
	faces, and \(29 - 51 + 23 = 1\) — a hint that, against all appearances, this house too can be squashed to a point
	<Cite k="hatcher2002" loc="Example 0.2" />.
</p>

<h2 id="tunnels">Polyhedra with tunnels</h2>

<p>
	In 1813 Simon Lhuilier pointed out polyhedra for which Euler’s formula fails: polyhedra with tunnels through them
	<Cite k="lhuilier1813" />. Take a square <em>picture frame</em>, with a square hole through the middle. Its top and bottom are each made of four trapezoids, the outside of four rectangles, and the inside of the
	tunnel of four more: \(16\) faces. There are \(16\) corners (eight around the top, eight around the bottom) and \(32\) edges. So
	\[ V - E + F = 16 - 32 + 16 = 0. \]
	Every face is a flat polygon, every edge is shared by two faces, nothing is weird — except that the surface is not a sphere in
	disguise. It is a <Term t="torus">torus</Term>.
</p>

<Figure num="2.6.5" title="Polyhedra with tunnels" hint="Switch shapes · change the number of tunnels · drag to rotate">
	<Tunnels />
	{#snippet caption()}
		Lhuilier’s picture frame has \(V - E + F = 0\). Switch to the slab of cubes and add tunnels: each one lowers \(V - E + F\) by 2, so a
		slab with \(g\) tunnels has \(V - E + F = 2 - 2g\).
	{/snippet}
</Figure>

<p>
	Why exactly 2 per tunnel? Cauchy’s proof gives a clue. A surface with a tunnel cannot be laid flat after removing just one face:
	you must also cut the tube of the tunnel, and cut around the ring of the frame. Here is a direct count instead. Drilling a tunnel
	removes a small square face from the top and one from the bottom, and puts in a tube of four rectangular walls. The 8 corners of the
	two little squares stay, as corners where the walls meet the top and bottom; their 8 edges stay too, as the top and bottom rims of
	the tube. The tube adds 4 new upright edges and 4 new faces, and we lost 2 faces. Total change:
	\[ \Delta V - \Delta E + \Delta F = 0 - 4 + (4 - 2) = -2. \]
	(This assumes the two little squares were already faces of the surface; you can always arrange that by subdividing first, which
	does not change \(\chi\).) Lhuilier had already found the general rule: a polyhedron pierced by \(g\) separate tunnels has
	\(V - E + F = 2 - 2g\).
</p>

<p>
	Lhuilier had another “monster”, as Lakatos would later call such examples: a cube with a cube-shaped cavity hidden inside it, like a
	hollow box with thick walls. Its surface is made of two separate pieces — the outside of the box and the inside of the cavity —
	each a cube’s surface. Counting everything gives \(V = 8 + 8 = 16\), \(E = 12 + 12 = 24\), \(F = 6 + 6 = 12\), and
	\[ V - E + F = 16 - 24 + 12 = 4 = 2 + 2. \]
	This one is easy to explain: the count simply adds up over separate pieces, and each piece is a sphere in disguise. The Euler
	characteristic of several separate pieces is the sum of their Euler characteristics.
</p>

<Warning title="Faces must be disks">
	<p>
		Lhuilier found a third kind of exception, subtler than the other two: put a small cube on top of a big one, in the middle of its
		top face. The big cube’s top face is now a square with a square hole in it — a ring. (Lhuilier expected such solids to be common
		in nature, and had seen clusters of crystals shaped like this in a friend’s mineral collection.) Counting naively, \(V = 16\), \(E = 24\), \(F = 11\), and \(V - E + F = 3\). Nothing is wrong with the surface
		(it is still a sphere in disguise); the problem is the ring-shaped face. Add one edge across the ring, from an inner corner to an
		outer corner, and the ring becomes a single disk-shaped face: now \(E = 25\), \(F\) is still \(11\), and \(V - E + F = 2\) again.
		The Euler characteristic counts faces that are disks — or, in a CW complex, cells that are open disks — which is why our
		definition of a polyhedron asked for polygons with no holes.
	</p>
</Warning>

<h2 id="every-surface">χ for every closed surface</h2>

<p>
	We can now compute the Euler characteristic of every surface we met in <Ref to="topology/gluing" /> and
	<Ref to="topology/manifolds" />, using any decomposition we like.
</p>

<div class="table-wrap">
	<table>
		<thead>
			<tr><th>Surface</th><th>Decomposition</th><th>Count</th><th style="text-transform:none">χ</th></tr>
		</thead>
		<tbody>
			<tr>
				<td>Sphere</td>
				<td>hollow tetrahedron<br />hollow octahedron<br />point + disk</td>
				<td class="nowrap">4 − 6 + 4<br />6 − 12 + 8<br />1 − 0 + 1</td>
				<td>2</td>
			</tr>
			<tr>
				<td>Torus</td>
				<td>3 × 3 grid<br />7-vertex torus<br />point, 2 loops, disk</td>
				<td class="nowrap">9 − 27 + 18<br />7 − 21 + 14<br />1 − 2 + 1</td>
				<td>0</td>
			</tr>
			<tr>
				<td>Projective plane</td>
				<td>6-vertex<br />point, 1 loop, disk</td>
				<td class="nowrap">6 − 15 + 10<br />1 − 1 + 1</td>
				<td>1</td>
			</tr>
			<tr>
				<td>Klein bottle</td>
				<td>twisted 3 × 3 grid<br />point, 2 loops, disk</td>
				<td class="nowrap">9 − 27 + 18<br />1 − 2 + 1</td>
				<td>0</td>
			</tr>
			<tr>
				<td>Genus-2 surface</td>
				<td>two 7-vertex tori, glued<br />point, 4 loops, disk</td>
				<td class="nowrap">11 − 39 + 26<br />1 − 4 + 1</td>
				<td>−2</td>
			</tr>
		</tbody>
	</table>
</div>

<p>
	The cell decompositions (the last line of each row) come straight from the gluing words of <Ref to="topology/gluing" />: a
	polygon whose sides are glued in pairs so that all its corners become a single point gives one 0-cell, one 1-cell for each letter,
	and one 2-cell. The surface of genus \(g\) — a sphere with \(g\) handles, glued from a \(4g\)-gon with the word \(a_1 b_1
	a_1^{-1} b_1^{-1} \cdots a_g b_g a_g^{-1} b_g^{-1}\) — has \(2g\) letters, so
	\[ \chi(\Sigma_g) = 1 - 2g + 1 = 2 - 2g. \]
	For \(g =\) <Scrub bind:value={g} min={0} max={12} label="genus" /> handles that is <TeX tex={`2 - 2\\cdot ${g} = ${2 - 2 * g}`} />. Gluing
	\(k\) projective planes together (the word \(a_1 a_1 a_2 a_2 \cdots a_k a_k\)) gives a non-orientable surface with
	\[ \chi(N_k) = 1 - k + 1 = 2 - k, \]
	so for \(k =\) <Scrub bind:value={k} min={1} max={12} label="number of projective planes" /> it is <TeX tex={`2 - ${k} = ${2 - k}`} />.
</p>

<p>
	There is also a neat way to see these formulas through the <Term t="connected-sum">connected sum</Term> of
	<Ref to="topology/manifolds" />, which cuts a small disk out of each of two surfaces and glues them along the two boundary circles.
	Triangulate both surfaces and cut out one triangle from each: each \(\chi\) drops by 1 (one face fewer). Then glue the two
	triangular holes together: the 3 vertices and 3 edges of one hole are matched with those of the other, so we lose \(3\) vertices and
	\(3\) edges, which changes nothing (\(-3 + 3 = 0\)). Hence
	\[ \chi(A \mathbin{\#} B) = \chi(A) + \chi(B) - 2. \]
	Adding a handle — a connected sum with a torus — lowers \(\chi\) by \(2\); adding a projective plane lowers it by \(1\).
</p>

<h3 id="cut-and-paste">Counting by cutting and pasting</h3>

<p>
	The connected-sum argument is an instance of a rule worth knowing by itself. Suppose a complex \(X\) is the union of two
	subcomplexes \(A\) and \(B\), which overlap in the subcomplex \(A \cap B\). Count the cells of \(X\) by counting those of \(A\) and
	those of \(B\): the cells in the overlap get counted twice, so we subtract them once. Since this works for vertices, edges and faces
	separately, it works for the alternating sum:
	\[ \chi(A \cup B) \;=\; \chi(A) + \chi(B) - \chi(A \cap B). \]
	This is the same <em>inclusion–exclusion</em> you would use to count the people in two overlapping clubs. Combined with two facts we
	already know — a disk has \(\chi = 1\), and a circle, a cylinder and a Möbius band all have \(\chi = 0\) — it computes Euler
	characteristics by cutting shapes into simple pieces.
</p>

<ul>
	<li>
		<strong>Sphere</strong> = northern hemisphere ∪ southern hemisphere, two disks meeting along the equator, a circle: \(\chi = 1 + 1
		- 0 = 2\).
	</li>
	<li>
		<strong>Torus</strong> = two cylinders (slice the doughnut like a bagel into an upper and a lower half; each half is a cylinder),
		meeting along two circles, the inner and the outer rim: \(\chi = 0 + 0 - (0 + 0) = 0\).
	</li>
	<li>
		<strong>Projective plane</strong> = a Möbius band with a disk sewn onto its single boundary circle: \(\chi = 0 + 1 - 0 = 1\).
	</li>
	<li>
		<strong>Klein bottle</strong> = two Möbius bands sewn together along their boundary circles: \(\chi = 0 + 0 - 0 = 0\).
	</li>
</ul>

<p>
	Each answer agrees with the table. In <Ref to="homology/exact-sequences" /> this cut-and-paste reasoning grows into the
	<em>Mayer–Vietoris sequence</em>, which does the same thing for the holes themselves rather than only for their alternating count.
</p>

<Remark title="Products multiply">
	<p>
		There is a matching rule for products. The torus is a circle times a circle — a point of the torus is a pair (angle around the
		hole, angle around the tube), as in <Ref to="topology/gluing" />. If \(X\) and \(Y\) are cell complexes, the product of an
		\(i\)-cell of \(X\) and a \(j\)-cell of \(Y\) is an \((i+j)\)-cell of \(X \times Y\), and expanding the alternating sums shows
		\(\chi(X \times Y) = \chi(X)\,\chi(Y)\). So \(\chi(T^2) = \chi(S^1)\,\chi(S^1) = 0 \cdot 0 = 0\), and a cylinder, a circle times an
		interval, has \(0 \cdot 1 = 0\).
	</p>
</Remark>

<Example title="Surfaces with boundary">
	<p>
		The same counting works for surfaces with edges. A disk (one triangle) has \(\chi = 1\). A cylinder, the 3 × 3 grid with only one
		pair of sides glued, has \(\chi = 0\), and so does the Möbius band. The smallest triangulated Möbius band has vertices \(0, \dots, 4\) and the five
		triangles \(\set{i, i+1, i+2}\), labels read modulo 5; it has \(5\) vertices, \(10\) edges and \(5\) triangles, and
		\(5 - 10 + 5 = 0\). In general, cutting a hole out of a closed surface lowers \(\chi\) by 1 (one face is removed), so a sphere with \(b\)
		holes has \(\chi = 2 - b\): a disk has 1, a cylinder 0.
	</p>
</Example>

<h2 id="classification">Two numbers decide everything</h2>

<p>
	In <Ref to="topology/manifolds" /> you met the classification of closed surfaces: every closed connected surface is a sphere, a
	sphere with handles, or a connected sum of projective planes <Cite k="armstrong1983" loc="ch. 7" />. Combine that with the
	formulas we just found.
</p>

<Theorem id="thm-classification" title="Classification by χ and orientability">
	<p>
		Two closed connected surfaces are homeomorphic if and only if they are both orientable or both non-orientable, and they have the
		same Euler characteristic.
	</p>
</Theorem>

<p>
	Indeed, among orientable surfaces \(\chi = 2 - 2g\) determines the number of handles \(g\), and among non-orientable ones \(\chi = 2
	- k\) determines the number of projective planes \(k\). Neither test is enough alone: the torus and the Klein bottle both have
	\(\chi = 0\), but one is orientable and the other is not; the sphere and the torus are both orientable, but have \(\chi = 2\) and
	\(\chi = 0\).
</p>

<Figure num="2.6.6" title="Every closed surface has its own cell" hint="Hover or tap a surface">
	<SurfaceChart />
	{#snippet caption()}
		Columns: the Euler characteristic. Rows: orientable or not. Every closed connected surface occupies exactly one cell, and no cell
		holds two. Orientable surfaces only have even \(\chi\), since \(2 - 2g\) is always even.
	{/snippet}
</Figure>

<KeyIdea>
	<p>
		To identify a mystery closed surface, cut it into pieces however you like, count \(V - E + F\), and check whether it can be
		oriented. Those two facts tell you exactly which surface it is — a complete answer to “what shape is this?” from two simple tests.
	</p>
</KeyIdea>

<p>
	The formula \(E = 3(V - \chi)\) for triangulated surfaces (see the exercise “Counting a triangulated surface”) also explains the small triangulations of the last chapter.
	A triangulated torus has \(E = 3V\), and since at most \(\binom{V}{2}\) edges are possible, \(3V \le V(V-1)/2\), which forces \(V \ge
	7\). The seven-vertex torus meets this bound exactly, which is why every pair of its vertices is joined. The same argument gives \(V
	\ge 6\) for the projective plane and \(V \ge 4\) for the sphere.
</p>

<h2 id="graphs">χ for graphs: pieces minus loops</h2>

<p>
	A graph — vertices joined by edges, with no faces — is a one-dimensional complex, and its Euler characteristic is simply
	\[ \chi = V - E. \]
	What does it measure? Build a graph one step at a time. Adding a lone vertex creates a new piece, and raises \(\chi\) by 1. Adding an
	edge lowers \(\chi\) by 1, and it does one of two things: either it joins two pieces into one, or both its ends are already in the
	same piece and it closes a new loop. So every step either changes the number of pieces or the number of loops, and keeping track
	gives
	\[ V - E \;=\; (\text{number of pieces}) - (\text{number of independent loops}). \]
	A <Term t="tree">tree</Term> has one piece and no loops, so \(V - E = 1\); a triangle has one piece and one loop, so \(3 - 3 = 0\).
</p>

<Example title="The figure eight">
	<p>
		Two hollow triangles sharing one corner make a figure eight: \(5\) vertices and \(6\) edges, so \(\chi = 5 - 6 = -1\). It is one
		piece with two independent loops, and indeed \(1 - 2 = -1\). Draw it differently — two squares sharing a corner, \(7 - 8 = -1\), or a
		single vertex with two loops attached as a CW complex, \(1 - 2 = -1\) — and the answer does not change, just as for surfaces.
	</p>
</Example>

<Figure num="2.6.7" title="Pieces and loops" hint="Tap to add vertices and edges · switch modes · hover a gold edge">
	<GraphChi />
	{#snippet caption()}
		Each colour is one piece. Gold dashed edges are the “extra” edges: each closes one loop (hover to see it). However you edit the
		graph, \(V - E\) equals the number of pieces minus the number of independent loops.
	{/snippet}
</Figure>

<p>
	For a connected graph this says that the number of independent loops is \(E - V + 1\), a formula found by Gustav Kirchhoff in 1847
	while studying electrical circuits <Cite k="kirchhoff1847" /> (it counts how many independent loop currents a circuit can carry). The words “independent loop” need
	care — the graph \(K_4\) has seven different loops but only \(3\) independent ones — and <Ref to="homology/cycles-and-boundaries" />
	will make them precise. In that chapter the number of pieces is called \(b_0\) and the number of independent loops \(b_1\).
</p>

<h2 id="deeper">A shadow of something deeper</h2>

<p>
	Look at what just happened with graphs. On the left of \(V - E = b_0 - b_1\) is a count of the <em>pieces of a decomposition</em>:
	vertices and edges, which depend on how we drew the graph. On the right is a count of features of the <em>shape</em> itself: how
	many components it has and how many independent loops. The equation says the alternating count of pieces equals the alternating
	count of holes.
</p>

<p>
	The same is true one dimension up. For a closed surface, let \(b_0\) be the number of components, \(b_1\) the number of independent
	loops that do not fence off a piece of the surface, and \(b_2\) the number of enclosed hollows. For the sphere these are
	\(1, 0, 1\): one piece; no such loop, since every loop on a sphere cuts it in two; one hollow inside. For the torus they are
	\(1, 2, 1\): the loop around the hole and the loop around the tube, neither of which cuts the torus apart, and the hollow inside
	the tube. And indeed
	\[ \chi(S^2) = 1 - 0 + 1 = 2, \qquad \chi(T^2) = 1 - 2 + 1 = 0, \qquad \chi(\Sigma_g) = 1 - 2g + 1 = 2 - 2g. \]
	This is the <em>Euler–Poincaré formula</em>,
	\[ \chi \;=\; b_0 - b_1 + b_2 - b_3 + \cdots, \]
	where the numbers \(b_k\), the <em>Betti numbers</em>, count “\(k\)-dimensional holes”. Making “hole” precise, defining the \(b_k\)
	properly, and proving the formula is the business of Part III; it happens in <Ref to="homology/homology-groups" />. The proof is
	the alternating ledger you saw with graphs, in every dimension: each new cell either creates a new hole or fills an old one, and
	the alternating signs keep the books balanced.
</p>

<KeyIdea>
	<p>
		The Euler characteristic is a shadow of homology: the alternating count of cells, \(n_0 - n_1 + n_2 - \cdots\), equals the
		alternating count of holes, \(b_0 - b_1 + b_2 - \cdots\). That is why it cannot depend on how a shape is cut up — the holes do not
		know about the cutting.
	</p>
</KeyIdea>

<p>
	The Euler characteristic turns up far beyond counting. The angle defects of Descartes add up to \(360° \times \chi\) for any closed
	polyhedral surface — \(720°\) for a sphere, and \(0°\) for the picture frame, where each of the eight outer corners falls \(90°\)
	short of flat while each of the eight corners around the tunnel overshoots by \(90°\).
	For smooth surfaces the defects become <em>curvature</em>, and the Gauss–Bonnet theorem says the total curvature of a closed
	surface is \(2\pi\chi\), whatever its shape. A vector field on a closed surface — a breeze blowing along it — must have calm points
	whose “indices” add up to \(\chi\); since \(\chi(S^2) = 2 \neq 0\), every breeze on the Earth has a calm spot somewhere (the hairy
	ball theorem), while a torus, with \(\chi = 0\), can be combed smooth. These stories are told in
	<Ref to="cohomology/characteristic-classes" />.
</p>

<p>
	And the alternating sum makes sense in every dimension. The 3-dimensional sphere, triangulated as the boundary of a 4-simplex, has
	\(5 - 10 + 10 - 5 = 0\); in fact every closed manifold of odd dimension has \(\chi = 0\), a consequence of the Poincaré duality of
	<Ref to="cohomology/poincare-duality" />. Not bad for a count Euler made with polyhedra.
</p>

<h2 id="exercises">Exercises</h2>

<Exercise title="Checking the formula" level={1}>
	<p>
		Count \(V\), \(E\) and \(F\) for a triangular prism, a square pyramid, and a “house” (a cube with a square pyramid on top as its
		roof, so the top face of the cube is no longer a face). Check \(V - E + F = 2\).
	</p>
	{#snippet solution()}
		<p>
			Prism: \(6 - 9 + 5 = 2\). Pyramid: \(5 - 8 + 5 = 2\). House: \(9\) vertices (8 of the cube and the roof’s peak), \(16\) edges (12
			of the cube and 4 roof edges), \(9\) faces (5 of the cube and 4 roof triangles): \(9 - 16 + 9 = 2\).
		</p>
	{/snippet}
</Exercise>

<Exercise title="The soccer ball" level={1}>
	<p>
		A soccer ball is a polyhedron with \(12\) pentagons and \(20\) hexagons, three faces meeting at every corner. Find \(E\) and \(V\)
		from the faces alone, and check Euler’s formula.
	</p>
	{#snippet hint()}
		<p>Each edge borders exactly two faces; each corner touches exactly three faces.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			Counting edges face by face gives \(12 \cdot 5 + 20 \cdot 6 = 180\), but each edge is counted twice, so \(E = 90\). Counting
			corners face by face also gives \(180\), with each corner counted three times, so \(V = 60\). Then \(V - E + F = 60 - 90 + 32 =
			2\).
		</p>
	{/snippet}
</Exercise>

<Exercise title="Why exactly twelve pentagons?" level={2}>
	<p>
		Suppose a polyhedron shaped like a sphere has only pentagons and hexagons as faces, with three faces at every corner. Show that it
		has exactly 12 pentagons, however many hexagons it has. (This is why every soccer ball — and every “buckyball” molecule of carbon —
		has 12 pentagons.)
	</p>
	{#snippet solution()}
		<p>
			Let there be \(p\) pentagons and \(h\) hexagons. As in the previous exercise, \(E = (5p + 6h)/2\) and \(V = (5p + 6h)/3\), and \(F
			= p + h\). So
			\[ 2 = V - E + F = (5p + 6h)\Big(\tfrac13 - \tfrac12\Big) + p + h = -\frac{5p + 6h}{6} + p + h = \frac{p}{6}, \]
			and \(p = 12\). The number of hexagons cancels out completely.
		</p>
	{/snippet}
</Exercise>

<Exercise title="Descartes’s defects" level={2}>
	<p>
		(a) A regular pentagon has angles of \(108°\). Find the angle defect at each corner of a regular tetrahedron, octahedron and
		dodecahedron, and check that in each case the defects add up to \(720°\). (b) A corner can also have a negative defect. In
		Lhuilier’s picture frame each outer corner meets two trapezoids, with angles of \(45°\) there, and two rectangles; each corner
		around the tunnel meets two trapezoids, with angles of \(135°\), and two rectangles. Find the total defect, and compare it with
		\(360° \times \chi\).
	</p>
	{#snippet solution()}
		<p>
			(a) Tetrahedron: three \(60°\) angles at each corner, defect \(360° - 180° = 180°\), and \(4 \times 180° = 720°\). Octahedron:
			four \(60°\) angles, defect \(120°\), and \(6 \times 120° = 720°\). Dodecahedron: three \(108°\) angles, defect \(36°\), and
			\(20 \times 36° = 720°\). (b) An outer corner has \(45° + 45° + 90° + 90° = 270°\), a defect of \(90°\); an inner corner has
			\(135° + 135° + 90° + 90° = 450°\), a defect of \(-90°\). The total is \(8 \times 90° - 8 \times 90° = 0°\), which is
			\(360° \times 0\), as it should be for a surface with \(\chi = 0\).
		</p>
	{/snippet}
</Exercise>

<Exercise title="Counting a triangulated surface" level={2}>
	<p>
		A closed surface is triangulated with \(V\) vertices, \(E\) edges and \(F\) triangles. Show that \(E = 3(V - \chi)\) and \(F = 2(V -
		\chi)\). Deduce that a triangulated torus needs at least 7 vertices, a projective plane at least 6, and a sphere at least 4.
	</p>
	{#snippet hint()}
		<p>Every triangle has 3 edges and every edge lies in exactly 2 triangles, so \(3F = 2E\). And there are at most \(\binom{V}{2}\) edges.</p>
	{/snippet}
	{#snippet solution()}
		<p>
			From \(3F = 2E\) we get \(F = \tfrac23 E\), and \(\chi = V - E + \tfrac23 E = V - \tfrac13 E\), so \(E = 3(V - \chi)\) and \(F =
			2(V - \chi)\). Since an edge is determined by its two endpoints, \(E \le \binom{V}{2} = \tfrac{V(V-1)}{2}\). For the torus (\(\chi
			= 0\)): \(3V \le V(V-1)/2\) gives \(V - 1 \ge 6\), so \(V \ge 7\). For the projective plane (\(\chi = 1\)): \(3(V - 1) \le
			V(V-1)/2\) gives \(V \ge 6\). For the sphere (\(\chi = 2\)): \(3V - 6 \le V(V-1)/2\), i.e. \(V^2 - 7V + 12 = (V-3)(V-4) \ge 0\), so
			\(V \le 3\) or \(V \ge 4\); and \(V = 3\) is impossible (it would need \(E = 3\) and \(F = 2\): two triangles with the same three
			corners). So \(V \ge 4\). All three bounds are attained, by the 7-vertex torus, the 6-vertex projective plane and the hollow
			tetrahedron.
		</p>
	{/snippet}
</Exercise>

<Exercise title="Five towns, ten roads" level={2}>
	<p>
		Five towns are each to be joined to each of the others by a road, on flat ground, with no crossings and no bridges. Show that this
		is impossible. (In graph language: the complete graph \(K_5\) cannot be drawn in the plane without crossings.)
	</p>
	{#snippet hint()}
		<p>
			A connected drawing in the plane has \(V - E + F = 2\) (counting the outside region as a face). Each face is bounded by at least 3
			edges.
		</p>
	{/snippet}
	{#snippet solution()}
		<p>
			Suppose it could be drawn. Then \(V = 5\), \(E = 10\), and Euler’s formula gives \(F = 2 - V + E = 7\). Each face is surrounded by
			at least 3 edges and each edge borders at most 2 faces, so \(3F \le 2E\), that is \(21 \le 20\) — a contradiction. (In general this
			argument shows \(E \le 3V - 6\) for any crossing-free drawing with \(V \ge 3\), and \(K_5\) has \(10 > 9\).) On a torus the
			corresponding bound is \(E \le 3V\), and the seven-vertex torus shows that even \(K_7\), with \(21 = 3 \cdot 7\) edges, fits.
		</p>
	{/snippet}
</Exercise>

<Exercise title="Two tori, glued" level={2}>
	<p>
		Take two copies of the seven-vertex torus, remove one triangle from each, and glue the two surfaces together along the edges of the
		removed triangles. Compute \(V\), \(E\), \(F\) and \(\chi\) of the result, and say which surface it is.
	</p>
	{#snippet solution()}
		<p>
			Each torus has \((7, 21, 14)\). Removing a triangle from each leaves the vertices and edges, so the faces become \(13 + 13 = 26\).
			Gluing identifies the 3 vertices and 3 edges of one hole with those of the other: \(V = 7 + 7 - 3 = 11\) and \(E = 21 + 21 - 3 =
			39\). So \(\chi = 11 - 39 + 26 = -2\). The result is orientable (each piece is), so by the classification it is the genus-2
			surface, in agreement with \(\chi(A \mathbin{\#} B) = 0 + 0 - 2\).
		</p>
	{/snippet}
</Exercise>

<Exercise title="Mystery surfaces" level={3}>
	<p>
		(a) A closed surface is triangulated with 10 vertices, 30 edges and 20 triangles, and its triangles cannot be oriented
		coherently. Which surface is it? (b) Another has 12 vertices, 42 edges and 28 triangles and is orientable. Which is it? (c) Could a
		closed surface be triangulated with 10 vertices, 31 edges and 20 triangles?
	</p>
	{#snippet solution()}
		<p>
			(a) \(\chi = 10 - 30 + 20 = 0\), non-orientable: the Klein bottle. (b) \(\chi = 12 - 42 + 28 = -2\), orientable: the genus-2
			surface. (c) No: in a triangulated closed surface \(3F = 2E\), but \(3 \cdot 20 = 60 \neq 62\).
		</p>
	{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>
			Euler’s polyhedron formula: \(V - E + F = 2\) for every polyhedron whose surface is a sphere in disguise. Descartes’s angle
			defects always add up to \(720°\).
		</li>
		<li>
			Cauchy’s proof: remove a face and flatten (\(-1\)), triangulate (no change), remove triangles from the outside (no change), end
			with one triangle (\(1\)). The two-trees proof: \(E = (V - 1) + (F - 1)\).
		</li>
		<li>
			Splitting an edge, cutting a face, or putting a vertex in a face never changes \(V - E + F\). In general \(\chi = n_0 - n_1 + n_2 -
			\cdots\), and it depends only on the space: it is a topological invariant.
		</li>
		<li>
			Polyhedra with tunnels break Euler’s formula: each tunnel lowers \(\chi\) by 2, and the picture frame has \(\chi = 0\). Faces must
			be disks.
		</li>
		<li>
			\(\chi(S^2) = 2\), \(\chi(T^2) = 0\), \(\chi(\RP^2) = 1\), \(\chi(K) = 0\); \(\chi(\Sigma_g) = 2 - 2g\), \(\chi(N_k) = 2 - k\);
			\(\chi(A \mathbin{\#} B) = \chi(A) + \chi(B) - 2\).
		</li>
		<li>Closed surfaces are classified by two facts: orientable or not, and \(\chi\).</li>
		<li>For a graph, \(\chi = V - E\) = (number of pieces) − (number of independent loops).</li>
		<li>
			Coming in <Ref to="homology/homology-groups" />: \(\chi = b_0 - b_1 + b_2 - \cdots\), the alternating count of holes.
		</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading items={reading} />

<style>
	.nowrap {
		white-space: nowrap;
	}
</style>
