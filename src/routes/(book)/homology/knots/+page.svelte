<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	import Definition from '$lib/components/prose/Definition.svelte';
	import Theorem from '$lib/components/prose/Theorem.svelte';
	import Corollary from '$lib/components/prose/Corollary.svelte';
	import Proof from '$lib/components/prose/Proof.svelte';
	import Example from '$lib/components/prose/Example.svelte';
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
	import Cite from '$lib/components/prose/Cite.svelte';
	import Conjecture from '$lib/components/prose/Conjecture.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';
	import KnotGallery from '$lib/figures/homology/knots/KnotGallery.svelte';
	import Reidemeister from '$lib/figures/homology/knots/Reidemeister.svelte';
	import ColourKnot from '$lib/figures/homology/knots/ColourKnot.svelte';
	import MeridianLongitude from '$lib/figures/homology/knots/MeridianLongitude.svelte';
	import BraidBuilder from '$lib/figures/homology/knots/BraidBuilder.svelte';
	import SeifertSurface from '$lib/figures/homology/knots/SeifertSurface.svelte';
	import BracketStates from '$lib/figures/homology/knots/BracketStates.svelte';
	import KhovanovCube from '$lib/figures/homology/knots/KhovanovCube.svelte';
	import ArmsRace from '$lib/figures/homology/knots/ArmsRace.svelte';
</script>

<Epigraph author="Alexandre-Théophile Vandermonde" source="Remarques sur les problèmes de situation (1771), translated for this book"
	>The worker who makes a braid, a net, or knots conceives them not by relations of magnitude but by those of position: what he sees there is the order in which the threads are interlaced.</Epigraph
>

<p class="lead">
	Tie a knot in a piece of string and glue the two ends together. You now hold a closed loop that no amount of patient fiddling will turn into a plain ring, or so everyone who has tried it believes. Proving it is another matter. As a space, the knotted loop is just a circle: Figure 2.1.8 matched the two point for point. As a loop that may pass through itself, it comes undone at once, as <Ref to="topology/homotopy" /> showed. What makes it a knot is the way it sits in space, and that is what this chapter learns to measure.
</p>

<p>
	The story has a twist that makes it worth telling in a book about homology. The most natural measurement, the homology of the space around the knot, turns out to be completely blind: it is the same for every knot (Section 4). The search for something that can see led to colourings, to the knot group, to braids, to surfaces and to polynomials, and it is still going on. Then, at the very end of the twentieth century, homology came back. Khovanov homology, built directly from a drawing of the knot, sees more than all the polynomials before it, and it can always tell whether a knot is tied at all. So the chapter runs from blindness to sight, and it ends at the edge of what is known.
</p>

<Ahead>
	<p>
		Knots will keep turning up. The magnetic field around a wire in <Ref to="cohomology/de-rham" /> measures linking numbers. The Borromean rings of Section 1 are linked in a way no pair of them can detect, and <Ref to="cohomology/cup-product" /> points to the cohomology operation that does. <Ref to="cohomology/poincare-duality" /> explains, through Alexander duality, why the homology of Section 4 had to be blind. And <Ref to="big-picture/horizons" /> follows Khovanov homology to its relatives at the frontier.
	</p>
</Ahead>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="circles-in-space">Circles in space</h2>

<p>
	A knot is a circle placed in space. All the subtlety is in what “the same knot” should mean, and the first two answers that come to mind are both wrong.
</p>

<Definition id="def-knot">
	{#snippet head()}Knot, link, equivalence{/snippet}
	<p>
		A <Term t="knot">knot</Term> is a smooth closed curve \(K\) in \(\R^3\) that does not cross itself, so that \(K\) is homeomorphic to a circle. A <Term t="link">link</Term> is a finite collection of disjoint knots, its <dfn>components</dfn>.
	</p>
	<p>
		Two knots or links \(K\) and \(K'\) are <dfn>equivalent</dfn> if there is an <Term t="ambient-isotopy">ambient isotopy</Term> taking one to the other: a family of homeomorphisms \(h_t\colon\R^3\to\R^3\), depending continuously on \(t\in[0,1]\), with \(h_0\) the identity and \(h_1(K) = K'\). A knot equivalent to a round circle is the <dfn>unknot</dfn>.
	</p>
</Definition>

<p>
	Think of \(h_t\) as a slow-motion film in which the string moves through space and drags the surrounding space along. Each \(h_t\) is a homeomorphism, so it never sends two points to one: the string can never pass through itself. Compare the three notions of sameness the book now has.
</p>
<ul>
	<li><strong>Homeomorphic as spaces.</strong> Every knot is a circle, so every knot is the same as every other (<Ref to="topology/spaces" />). Far too coarse.</li>
	<li><strong>Homotopic as maps</strong> \(S^1\to\R^3\). A homotopy may pass the string through itself, so every knot can be untied (<Ref to="topology/homotopy" />). Still too coarse.</li>
	<li><strong>Ambient isotopic.</strong> The string moves, the space moves with it, and nothing ever passes through anything. This is the notion that matches the string on the table.</li>
</ul>

<Warning>
	<p>
		The word <em>ambient</em> matters even for smooth knots. If we only asked the string to stay free of self-crossings at each moment, we could pull a knotted stretch tighter and tighter until the knot shrank to a point and vanished: every knot would come undone. Moving the space along forbids this. We also insist on smooth curves (closed polygons would do as well). A merely continuous curve can tie infinitely many knots, smaller and smaller, piling up at a point; such <dfn>wild</dfn> knots exist, and they are excluded here.
	</p>
</Warning>

<Figure num="3.7.1" title="A gallery of knots and links" hint="Choose a knot or link · drag to turn it">
	<KnotGallery />
	{#snippet caption()}
		Knots are named as in the standard tables: \(5_2\) is the second knot with five crossings in its simplest drawing. The granny and square knots are each made of two trefoils; the last four entries are links. Choose the Borromean rings and take one ring away: the other two fall apart, although the three together cannot be separated.
	{/snippet}
</Figure>

<p>
	The gallery shows the families this chapter returns to. The <dfn>trefoil</dfn> \(3_1\) is the simplest knot after the unknot, and the <dfn>figure-eight knot</dfn> \(4_1\) comes next. The trefoil, the cinquefoil \(5_1\) and the septafoil \(7_1\) all lie on the surface of a doughnut, going twice around its hole while they wind three, five or seven times around its tube; they are <dfn>torus knots</dfn>. Every knot also has a <dfn>mirror image</dfn> \(\overline K\), its reflection in a plane. Whether a knot equals its mirror image is a real question: the figure-eight knot does, and in Section 7 we will prove that the trefoil does not. A knot that differs from its mirror image is <Term t="chiral-knot">chiral</Term>, like a hand.
</p>

<p>
	Two knots can be added. Cut each open at one point and join the loose ends in pairs, without creating crossings between them: the result is the <Term t="knot-connected-sum">connected sum</Term> \(K_1\#K_2\). The granny knot is \(3_1\#3_1\); the square knot, a sailor’s reef knot with its ends joined, is \(3_1\#\overline{3_1}\). A knot is <dfn>prime</dfn> if it is not the connected sum of two knots that are both knotted. Sections 6 and 9 will ask how knots behave under this addition, and one of the answers was found only in 2025.
</p>

<p>
	The <dfn>Borromean rings</dfn> are the strangest exhibit. No two of the three rings are linked, as the figure shows by removing one: the other two simply drift apart. Yet the three together cannot be separated. Whatever tells us they are linked is not a statement about pairs, and the tools of this chapter will mostly be unable to see it.
</p>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="diagrams">Diagrams and Reidemeister’s theorem</h2>

<p>
	A knot lives in space, but we draw it on paper. Look at it from far above. Its shadow is a closed curve in the plane that crosses itself, and for almost every viewing direction the shadow is tidy: it crosses itself at finitely many points, two strands at a time, at an honest angle. At each crossing, break the lower strand to record which one passes under. The result is a <Term t="knot-diagram">knot diagram</Term>. The smallest number of crossings among all diagrams of a knot is its <Term t="crossing-number">crossing number</Term>; it is the number in the knot’s name.
</p>

<p>
	Many diagrams draw the same knot, so the question becomes: when do two diagrams show equivalent knots? In 1927 Kurt Reidemeister proved that three local changes are enough to get between any two. James Alexander and Garland Briggs found the same three moves independently <Cite k="reidemeister1927,alexander-briggs1927" />.
</p>

<Theorem id="thm-reidemeister" label="Theorem (Reidemeister)">
	<p>
		Two diagrams show equivalent knots or links if and only if one can be turned into the other by deforming the plane, which creates and destroys no crossings, together with a finite sequence of the three <Term t="reidemeister-moves">Reidemeister moves</Term>:
	</p>
	<ul>
		<li><strong>I.</strong> put in or take out a kink, a single twist in one strand;</li>
		<li><strong>II.</strong> slide one strand over another, creating or removing two crossings;</li>
		<li><strong>III.</strong> slide a strand across a crossing, from one side to the other.</li>
	</ul>
</Theorem>

<p>
	Why these three? Move a knot about in space and watch its shadow. Most of the time the shadow changes only by a deformation of the plane. It changes in an essential way only at isolated moments: when a little loop of the shadow pinches to a cusp and vanishes (move I), when two strands of the shadow touch and pass through each other (move II), or when a strand of the shadow passes across a crossing, so that three strands meet in one point (move III). Proving that these are the only events takes care, and we will trust it <Cite k="rolfsen1976" />.
</p>

<Figure num="3.7.2" title="Reidemeister’s three moves" hint="Play or scrub: all three moves at once">
	<Reidemeister />
	{#snippet caption()}
		The three moves, played together. Each takes place inside a small disk (dashed); outside it the strands, which stand for the rest of the diagram, do not move. Move I adds or removes one crossing, move II two at once, and move III keeps all three crossings but moves the top strand across the crossing of the other two. The crossings are circled and counted under each disk.
	{/snippet}
</Figure>

<KeyIdea>
	<p>
		A <Term t="knot-invariant">knot invariant</Term> is anything computed from a diagram that is unchanged by the three moves. By Reidemeister’s theorem it then depends only on the knot, not on the drawing. This is the situation of <Ref to="homology/invariance" /> all over again. There homology was defined from a triangulation and turned out not to depend on it; here an invariant is defined from a diagram and must not depend on it. Reidemeister’s theorem reduces “every possible way of moving a knot” to three local checks.
	</p>
</KeyIdea>

<p>
	The theorem does not say the moves are easy to find. There are drawings of the unknot that cannot be simplified at all without first adding crossings, so a computer that only ever removes crossings can get stuck. An invariant sidesteps the search: it never asks how to move one diagram to another, only whether some number differs.
</p>

<p>
	One quantity is useful but not invariant. Give the knot a direction of travel, drawn as arrows. Then every crossing is one of two kinds. Rotate the over-strand counterclockwise, by less than half a turn, until it points along the under-strand: if the two arrows then agree, the crossing is <dfn>right-handed</dfn> and has sign \(+1\), and otherwise it is <dfn>left-handed</dfn> with sign \(-1\). The <Term t="writhe">writhe</Term> \(w(D)\) of a diagram is the sum of the signs. Moves II and III do not change it (the two crossings of move II have opposite signs, and move III only moves crossings about), but move I changes it by one. So the writhe is not a knot invariant, but it will help to repair things that move I breaks.
</p>

<History title="Smoke rings and knot tables" people="tait">
	<p>
		The first knot tables were made for chemistry. In 1867 William Thomson, the future Lord Kelvin, saw “a magnificent display of smoke-rings” in Peter Guthrie Tait’s lecture room in Edinburgh; Tait fired them from boxes with a rubber diaphragm. Thomson proposed that atoms are knotted vortex rings in the ether, with “knotted or knitted vortex atoms” for the different chemical elements <Cite k="thomson1867" />. A table of knots would then be a table of the elements. Tait set out to make one. With Thomas Kirkman and Charles Little he spent about 25 years on it, and the three produced tables of the prime alternating knots up to 11 crossings and of the non-alternating ones up to 10 <Cite k="hoste2005" />. Tait warned in 1877 that “the subject is a very much more difficult and intricate one than at first sight one is inclined to think, and I feel that I have not succeeded in catching the key-note” <Cite k="tait1877" loc="p. 273" />.
	</p>
	<p>
		Vortex atoms were abandoned. The tables stayed, and so did the questions Tait asked while making them, now known as Tait’s conjectures. The first was proved in 1987, with the polynomial of Section 7 <Cite k="kauffman1987,murasugi1987,thistlethwaite1987" />.
	</p>
</History>

<p>
	Tabulating is treacherous, because two different-looking diagrams can hide the same knot. Little’s table of 1900 lists two ten-crossing knots as different. In 1974 Kenneth Perko showed that they are the same knot <Cite k="perko1974" />. Little had believed that the writhe of a diagram drawn with as few crossings as possible is an invariant, and the two diagrams of this <dfn>Perko pair</dfn> have different writhes: the duplicate entry disproved his belief.
</p>

<History title="Three moves and a short book" people="reidemeister">
	<p>
		Kurt Reidemeister came to knots in Vienna, where Wilhelm Wirtinger, of the Wirtinger presentation, interested him in the subject. There he also read Wittgenstein’s <em>Tractatus</em> and joined the Vienna Circle of philosophers. He proved his theorem in Königsberg, and in 1932 he published <em>Knotentheorie</em>, the first book on the subject: only 74 pages long, and highly significant <Cite k="oconnor-robertson-reidemeister,reidemeister1932" />. In 1933 the Nazis forced him out of his chair in Königsberg. He continued in Marburg and later in Göttingen, and his late interests turned almost entirely to philosophy. The moves themselves had been known to James Clerk Maxwell as early as 1868 <Cite k="hoste2005" />.
	</p>
</History>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="colourings">Colourings: a first invariant</h2>

<p>
	Here is an invariant simple enough to compute by hand, and strong enough to prove that the trefoil is knotted. A diagram falls apart into <dfn>arcs</dfn>: the pieces of string from one undercrossing to the next. The usual trefoil diagram has three arcs and three crossings; at each crossing, one arc passes over and two arcs end underneath.
</p>

<p>
	Colour each arc red, green or blue, by this rule: at every crossing, the three arcs that meet are either all the same colour or all different. Colouring every arc red always works, and is boring. For the trefoil, giving its three arcs three different colours also works, since every crossing then sees all three colours. Now try the round, crossing-free unknot: it has a single arc, so it has exactly three colourings, all of them boring.
</p>

<p>
	Number the colours \(0, 1, 2\) and the rule becomes arithmetic. Three numbers mod \(3\) are all equal or all different exactly when their sum is \(0\) mod \(3\); and \(a + b + c\equiv 0\) is the same as \(2a\equiv b + c\), because \(3a\equiv0\). The second form generalises to any prime.
</p>

<Definition id="def-colouring">
	{#snippet head()}Fox colouring{/snippet}
	<p>
		Let \(p\) be a prime. A <Term t="fox-colouring">\(p\)-colouring</Term> of a diagram gives every arc a number in \(\Z/p\) so that at every crossing
	</p>
	\[ 2\cdot(\text{over-arc}) \equiv (\text{under-arc}_1) + (\text{under-arc}_2) \pmod p. \]
</Definition>

<Theorem id="thm-colourings" label="Theorem (colourings are an invariant)">
	<p>The number of \(p\)-colourings of a diagram does not change under the Reidemeister moves. So it is an invariant of the knot.</p>
</Theorem>

<Proof>
	<p>
		Check each move: the moves change the diagram only inside a small disk, and we show that every colouring outside the disk extends in exactly one way across the inside, before and after the move. <strong>Move I.</strong> The kink has one crossing whose over-arc is also one of its under-arcs, so the rule reads \(2a = a + b\), forcing \(b = a\): the arc goes in and comes out with the same colour, as it would without the kink. <strong>Move II.</strong> The over-strand, coloured \(a\), cuts the lower strand into three arcs \(b, b', b''\). The rules \(2a = b + b'\) and \(2a = b' + b''\) give \(b' = 2a - b\) and \(b'' = b\): the middle arc is determined, and the lower strand leaves with the colour it entered with, as it does when the strands are pulled apart. <strong>Move III.</strong> The same kind of bookkeeping, done in Exercise 2: the colours on the six ends leaving the disk determine everything inside, and they are related in the same way before and after the move.
	</p>
</Proof>

<p>
	The colourings of a diagram are the solutions of a system of linear equations over \(\Z/p\), one unknown per arc and one equation per crossing, so they form a vector space over \(\Z/p\) (<Ref to="foundations/linear-algebra" />). Its dimension is at least \(1\), since all constant colourings are solutions, and so the number of colourings is \(p, p^2, p^3, \ldots\). The trefoil has \(9 = 3^2\) colourings mod \(3\), and the unknot has \(3\). Therefore:
</p>

<Corollary id="cor-trefoil-knotted">
	<p>The trefoil is not the unknot.</p>
</Corollary>

<p>
	The pioneers of the early twentieth century proved it with the fundamental group and considerable ingenuity. With colourings it takes a line. The idea is due to Ralph Fox, who seems to have developed it around 1956 while explaining knot theory to undergraduates at Haverford College <Cite k="przytycki1998" />.
</p>

<Figure num="3.7.3" title="Colour the knot" hint="Tap an arc to change its colour · choose the knot and the number of colours">
	<ColourKnot />
	{#snippet caption()}
		Colour the arcs so that every crossing checks out: twice the over-arc equals the sum of the two under-arcs, mod \(p\). The trefoil has non-constant colourings with \(3\) colours, the figure-eight knot only with \(5\). The last diagram is a tangled drawing of the unknot: whatever you try, and however many colours, only the constant colourings survive.
	{/snippet}
</Figure>

<p>
	Which primes give interesting colourings? Strike out one equation and one unknown from the system. The determinant of the square matrix that remains is, up to sign, the same whichever ones you strike, and whatever diagram of the knot you start from; its absolute value is the <Term t="knot-determinant">determinant</Term> of the knot. A knot has a non-constant \(p\)-colouring exactly when \(p\) divides its determinant. The trefoil has determinant \(3\), the figure-eight knot \(5\), the knot \(5_2\) has \(7\), and the stevedore knot \(6_1\) has \(9\), so it is \(3\)-colourable. The unknot has determinant \(1\) and no interesting colourings at all.
</p>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="what-homology-sees">What homology sees, and what it misses</h2>

<p>
	Now bring in the machinery of this book. The knot itself is a circle, and its homology says nothing. The interesting space is the <dfn>knot complement</dfn>, everything except the knot. It will be convenient to add one point at infinity to space, which turns \(\R^3\) into the sphere \(S^3\), just as stereographic projection turns the plane plus one point into the sphere \(S^2\) (<Ref to="topology/manifolds" hash="stereographic" />). The extra point does not change the first homology group, which is the one we care about.
</p>

<p>
	Thicken the knot \(K\) into a thin solid tube \(N\) around it. The tube is a <dfn>solid torus</dfn>, a circle’s worth of disks, and its homology is that of its core circle, \(H_1(N)\cong\Z\). Let \(E\) be the rest of the sphere. Then \(E\) has the same homology as \(S^3\setminus K\), since the gap between \(E\) and the knot is a thin layer that can be pushed onto \(E\)’s edge. The two pieces \(N\) and \(E\) meet along the surface of the tube, a torus \(T\), with \(H_1(T)\cong\Z^2\) (<Ref to="homology/exact-sequences" hash="torus-and-klein" />). On that torus live two special loops: a <Term t="knot-meridian">meridian</Term> \(\mu\), which goes once around the tube, and a <dfn>longitude</dfn> \(\lambda\), which runs once along it. Together they generate \(H_1(T)\).
</p>

<Figure num="3.7.4" title="Two loops on a thickened knot" hint="Choose a knot and what to show · drag to turn it">
	<MeridianLongitude />
	{#snippet caption()}
		The knot \(K\) (gold), its tube, and two loops on the tube’s surface: the meridian \(\mu\) (rose) goes once around the tube and the longitude \(\lambda\) (teal) runs once along it. The longitude shown is the one that does not link the knot; to get there it must turn around the tube a few times on the way, and the readout says how many.
	{/snippet}
</Figure>

<Theorem id="thm-knot-complement" label="Theorem (homology of a knot complement)">
	<p>For every knot \(K\) in \(S^3\),</p>
	\[ H_0(S^3\setminus K)\cong\Z,\qquad H_1(S^3\setminus K)\cong\Z,\qquad H_2(S^3\setminus K) = H_3(S^3\setminus K) = 0, \]
	<p>and \(H_1\) is generated by the meridian.</p>
</Theorem>

<Proof>
	<p>
		Apply Mayer–Vietoris (<Ref to="homology/exact-sequences" hash="mayer-vietoris" />) to \(S^3 = N\cup E\), slightly enlarged so that the two pieces overlap in a thin collar around \(T\). Since \(H_1(S^3) = H_2(S^3) = 0\), the part of the sequence in degree \(1\) reads
	</p>
	\[ 0\to H_1(T)\xrightarrow{\ \Phi\ }H_1(N)\oplus H_1(E)\to 0, \]
	<p>
		so \(\Phi\) is an isomorphism. Look at what it does to the two generators. In the tube, the meridian bounds a disk, a slice across the tube, so it becomes \(0\) in \(H_1(N)\), while the longitude goes once around the core and becomes the generator \(1\). So \(\Phi(\mu) = (0, -\mu_E)\) and \(\Phi(\lambda) = (1, -\lambda_E)\), where \(\mu_E\) and \(\lambda_E\) are the classes of the two loops in \(E\). These two elements form a basis of \(\Z\oplus H_1(E)\). An element \((0, e)\) can only be a multiple of the first, so every class \(e\) in \(H_1(E)\) is a multiple of \(\mu_E\); and no nonzero multiple of \(\mu_E\) is zero, since \(\Phi\) is injective. Therefore \(H_1(E)\cong\Z\), generated by the meridian.
	</p>
	<p>
		In degrees \(2\) and \(3\), the connecting map \(H_3(S^3)\to H_2(T)\) cuts the whole sphere into its two pieces and returns their common edge, the torus; so it sends a generator to a generator and is an isomorphism. Exactness on either side of it then forces \(H_2(E) = H_3(E) = 0\).
	</p>
</Proof>

<p>
	Look again at the longitude. In \(H_1(E)\) its class is some multiple \(n\,\mu_E\) of the meridian. Replace \(\lambda\) by a loop that turns \(n\) extra times around the tube on its way along it, in the opposite direction, and its class becomes \(0\). This preferred longitude, which bounds in the complement, is the teal loop of Figure 3.7.4.
</p>

<p>
	The theorem gives every loop \(\gamma\) in the complement an integer: the \(n\) with \([\gamma] = n[\mu]\) in \(H_1(S^3\setminus K)\cong\Z\). This is the <Term t="linking-number">linking number</Term> \(\operatorname{lk}(\gamma, K)\): how many times \(\gamma\) winds around the knot, counted with signs. For two components of a link drawn in a diagram it can be read off from the crossings between them: it is half the sum of their signs. The Hopf link has linking number \(\pm1\), and Solomon’s knot, despite its name a link of two components, has \(\pm2\). Gauss found an integral for the linking number of two closed curves in 1833 <Cite k="ricca-nipoti2011" />, and <Ref to="cohomology/poincare-duality" /> computes it that way.
</p>

<Warning title="Homology cannot see the knot">
	<p>
		The theorem holds for <em>every</em> knot. The homology of the complement of a trefoil is exactly the homology of the complement of a round circle, which is the homology of a circle. So homology, applied in the obvious way, cannot tell any knot from any other. Linking numbers do distinguish some links, but not all: the two components of the Whitehead link have linking number \(0\), the same as two separate circles, and the Borromean rings have linking number \(0\) between every pair.
	</p>
</Warning>

<p>
	The rest of the chapter can be read as three ways around this blindness. Keep the order of loops instead of forgetting it: that is the knot group, next. Take the homology of a cleverer space built from the complement: that is the Alexander polynomial of Section 7. Or build a new homology theory out of the knot diagram itself: that is Khovanov homology, in Section 8.
</p>

<h3 id="knot-group">The knot group</h3>

<p>
	The <Term t="knot-group">knot group</Term> of \(K\) is the fundamental group \(\pi_1(S^3\setminus K)\), and <Ref to="topology/homotopy" /> has already written it down. Pick a basepoint high above the diagram. Each arc gives a generator, the lasso that drops down, goes once around the arc and climbs back, and each crossing gives a relation: with \(x_a\) the lasso around the over-arc and \(x_b, x_c\) the lassos around the under-arcs going in and coming out,
</p>
\[ x_c = x_a^{\varepsilon}\,x_b\,x_a^{-\varepsilon}, \]
<p>
	where \(\varepsilon = \pm1\) is the sign of the crossing. This is the <Term t="wirtinger-presentation">Wirtinger presentation</Term>. Now make it commutative, as Hurewicz’s theorem (<Ref to="homology/invariance" hash="hurewicz" />) instructs: in the abelianization each relation becomes \(x_c = x_b\). Walking along the knot, every arc is identified with the next one, so all the generators become a single generator, and the abelianization is \(\Z\). That is the theorem above, seen from the group. The knot group knows exactly what homology forgets: the commutators.
</p>

<p>
	Colourings are a way of looking at the knot group. Label the corners of a regular \(p\)-gon by \(\Z/p\). Its reflections are the maps \(r_a(x) = 2a - x\), one for each \(a\) in \(\Z/p\), and a short computation gives
</p>
\[ r_a\,r_b\,r_a^{-1} = r_{2a-b}. \]
<p>
	Now send each lasso \(x_a\) to the reflection \(r_{\mathrm{colour}(a)}\). The relation at a crossing becomes \(r_c = r_{2a-b}\), which says \(c = 2a - b\): precisely the colouring rule. So a \(p\)-colouring is the same thing as a homomorphism from the knot group to the symmetries of the \(p\)-gon that sends every meridian to a reflection. For \(p = 3\) this is the lasso test of Figure 2.3.8, now with numbers. A colouring with more than one colour sends two lassos to two different reflections, which do not commute; so the knot group is not abelian, and the knot is not the unknot, whose group is \(\Z\).
</p>

<p>
	How much does the complement know? Everything, essentially. Cameron Gordon and John Luecke proved in 1989 that if two knots have homeomorphic complements, then the knots are equivalent, or mirror images of each other <Cite k="gordon-luecke1989" />. The knot group alone knows slightly less: the granny knot and the square knot have isomorphic groups, yet different complements <Cite k="rolfsen1976" />. And groups given by presentations are hard to work with, as <Ref to="topology/homotopy" /> warned: in general no algorithm can even decide whether two words describe the same element. The invariants in the rest of this chapter are what people compute instead.
</p>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="braids">Braids</h2>

<p>
	A <dfn>braid</dfn> on \(n\) strands is \(n\) strings hanging from \(n\) hooks on a bar and fastened to \(n\) hooks on a second bar below, each string always heading downward, considered up to moving the strings while the ends stay fixed. Two braids can be multiplied by hanging the second one below the first. The braid with straight strings is the identity, and every braid has an inverse: its mirror image in a horizontal mirror, which undoes it strand by strand. So the braids on \(n\) strands form a group, the <Term t="braid-group">braid group</Term> \(B_n\).
</p>

<p>
	Every braid is a product of elementary ones. Let \(\sigma_i\) be the braid in which the strands in positions \(i\) and \(i + 1\) swap places once, the one moving left passing over the one moving right, while all the others hang straight; \(\sigma_i^{-1}\) is the same swap with the other strand on top. Read with the strands running down the page, \(\sigma_i\) is a right-handed crossing.
</p>

<Theorem id="thm-artin" label="Theorem (Artin’s presentation)">
	<p>The braid group \(B_n\) is generated by \(\sigma_1,\ldots,\sigma_{n-1}\), subject only to the relations</p>
	\[ \sigma_i\sigma_j = \sigma_j\sigma_i\quad\text{if } |i - j|\ge 2,\qquad\qquad \sigma_i\sigma_{i+1}\sigma_i = \sigma_{i+1}\sigma_i\sigma_{i+1}. \]
</Theorem>

<p>
	The first relation says that crossings far apart can be done in either order. The second is a picture you have already seen: it is Reidemeister’s move III. Following where each string ends gives a homomorphism \(B_n\to S_n\) onto the permutations of \(n\) things, sending \(\sigma_i\) to the swap of \(i\) and \(i + 1\) (<Ref to="foundations/groups" />); the braids in its kernel, whose strands all end where they began, are the <dfn>pure braids</dfn>. Unlike permutations, braids remember how they crossed: \(\sigma_1^2\) is not the identity, and in fact \(B_2\) is a copy of \(\Z\).
</p>

<p>
	Join the bottom hooks of a braid back up to the top hooks, around the side, and you get a link: the braid’s <Term t="braid-closure">closure</Term>. The closure of \(\sigma_1^3\) in \(B_2\) is the trefoil, of \(\sigma_1^2\) the Hopf link, and of \((\sigma_1\sigma_2^{-1})^2\) in \(B_3\) the figure-eight knot.
</p>

<Figure num="3.7.5" title="Build a braid, close it up" hint="Add crossings · tap a crossing to switch it · drag the closure to turn it">
	<BraidBuilder />
	{#snippet caption()}
		Build a braid one crossing at a time, and press any crossing to switch which strand is on top. Beside it the braid is closed up in space, with one colour for each component: the permutation of the strands decides how many there are, one for each cycle. The readout names the closure when it is a knot or link from this chapter, judged by its Jones polynomial. The examples give the trefoil \(\sigma_1^3\), the figure-eight knot \((\sigma_1\sigma_2^{-1})^2\) and the Borromean rings \((\sigma_1\sigma_2^{-1})^3\); the last two buttons build \(\sigma_1\sigma_2\sigma_1\) and \(\sigma_2\sigma_1\sigma_2\), which Artin’s relation says are the same braid.
	{/snippet}
</Figure>

<Theorem id="thm-alexander-markov" label="Theorem (Alexander; Markov)">
	<p>
		Every link is the closure of some braid <Cite k="alexander1923" />. Two braids have equivalent closures if and only if one can be turned into the other by a sequence of <dfn>Markov moves</dfn> <Cite k="markov1936" />: replacing \(\beta\) by a conjugate \(\gamma\beta\gamma^{-1}\) in the same group, or replacing \(\beta\) in \(B_n\) by \(\beta\sigma_n^{\pm1}\) in \(B_{n+1}\), and back.
	</p>
</Theorem>

<p>
	Conjugating moves the top of the braid around to the bottom, which changes nothing after closing up. The second move adds a new strand with one twist, a move I in disguise. Together the two theorems turn knots into algebra: a link invariant is the same thing as a function on all the braid groups that is unchanged by conjugation and by adding a twisted strand. That is exactly how the Jones polynomial of Section 7 was found.
</p>

<p>
	Braids also illuminate the knot group. The trefoil is the closure of a braid on two strands, and its Wirtinger presentation simplifies to \(\langle x, y\mid xyx = yxy\rangle\). That is Artin’s presentation of \(B_3\): the trefoil’s knot group is the braid group on three strands. And unlike groups in general, braid groups have a solved word problem: there is an algorithm, going back to Artin, that decides whether two braid words describe the same braid <Cite k="artin1925,artin1947" />.
</p>

<History title="A number theorist’s braids" people="artin">
	<p>
		Emil Artin is remembered mostly for algebra and number theory, but in 1925, in Hamburg, he presented the theory of braids <Cite k="artin1925" />. His wife Natascha was Jewish, and when a Nazi law of 1937 struck at civil servants related to Jews by marriage, Artin had no real alternative but to leave Germany <Cite k="oconnor-robertson-artin" />. He taught at Notre Dame, then for eight years at Indiana University and twelve at Princeton, and in 1947 he came back to braids in a second paper <Cite k="artin1947" />. In 1958 he returned to the University of Hamburg.
	</p>
</History>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="seifert-surfaces">Seifert surfaces and genus</h2>

<p>
	The unknot bounds a disk. Every knot bounds <em>some</em> surface: Fritz Frankl and Lev Pontryagin proved this in 1930, and Herbert Seifert gave an algorithm in 1935 that builds one with two sides, so that it can be oriented <Cite k="frankl-pontryagin1930,seifert1935" />. Such a surface, oriented and connected with the knot as its boundary, is a <Term t="seifert-surface">Seifert surface</Term>.
</p>

<Theorem id="thm-seifert-algorithm" label="Seifert’s algorithm">
	<ol>
		<li>Give the knot a direction of travel.</li>
		<li>At every crossing, cut both strands and reconnect them the other way, respecting the arrows: the strand coming in on the left now leaves on the left. The diagram becomes a set of disjoint circles, the <dfn>Seifert circles</dfn>.</li>
		<li>Fill each Seifert circle with a disk; if circles are nested, stack the inner disk above the outer one.</li>
		<li>Where each crossing was, join the two disks by a small band with a half twist, twisted the way the crossing went.</li>
	</ol>
	<p>The result is an oriented surface whose boundary is the knot.</p>
</Theorem>

<Figure num="3.7.6" title="Seifert’s algorithm" hint="Step through the algorithm · choose a knot · drag to turn it">
	<SeifertSurface />
	{#snippet caption()}
		Each knot is drawn as a closed braid. The crossings are smoothed along the arrows into Seifert circles, one for each strand; the circles are filled with stacked disks, and a half-twisted band at each crossing joins neighbouring disks. The finished surface is teal on one side and violet on the other, and its edge is the knot. The readout counts \(c\), \(s\), \(\chi = s - c\) and the genus. For \(5_2\) this diagram gives genus \(2\), although the knot has genus \(1\): Seifert’s algorithm only gives an upper bound, and a different diagram does better.
	{/snippet}
</Figure>

<p>
	How complicated is the surface? The Euler characteristic of <Ref to="topology/euler-characteristic" /> answers. A disk has \(\chi = 1\), and attaching a band along two short ends adds one rectangle but glues along two segments, which lowers \(\chi\) by \(1\). So a diagram with \(s\) Seifert circles and \(c\) crossings gives a surface with \(\chi = s - c\).
</p>

<p>
	<Ref to="topology/euler-characteristic" /> counted closed surfaces, with no boundary: a closed oriented surface of genus \(g\) has \(\chi = 2 - 2g\). Cutting a small disk out of a surface removes one face and changes nothing else, so it lowers \(\chi\) by one. A surface with \(b\) boundary circles, made from a closed surface of genus \(g\) by cutting out \(b\) disks, therefore has
</p>
\[ \chi = 2 - 2g - b. \]
<p>
	A Seifert surface of a knot has one boundary circle, so \(1 - 2g = s - c\) and \(g = \tfrac12(1 - s + c)\). For the standard trefoil diagram, \(c = 3\) and \(s = 2\), so Seifert’s algorithm builds a surface of genus \(1\): a punctured torus whose edge is a trefoil.
</p>

<Definition id="def-genus">
	{#snippet head()}Genus of a knot{/snippet}
	<p>
		The <Term t="knot-genus">genus</Term> \(g(K)\) of a knot is the smallest genus of any Seifert surface for it, from any diagram and by any method.
	</p>
</Definition>

<p>
	The unknot is the only knot of genus \(0\), since genus \(0\) with one boundary circle means a disk. Genus adds up under connected sum: \(g(K_1\#K_2) = g(K_1) + g(K_2)\). One inequality is easy, since two Seifert surfaces can be joined along the cut to give one for the sum; the other takes real work <Cite k="rolfsen1976" />. This has a striking consequence: if \(K_1\#K_2\) is the unknot, both genera are \(0\), so both knots were unknots to begin with. <strong>A knot cannot be cancelled by tying another knot in the same string.</strong> Horst Schubert built on this in 1949 to prove that every knot is a connected sum of prime knots in exactly one way, just as every whole number is a product of primes <Cite k="schubert1949" />.
</p>

<p>
	The Seifert surface also makes Section 4 concrete. If a loop \(\gamma\) in the complement pierces the surface, count the piercings with signs, \(+1\) when \(\gamma\) passes through from one side to the other and \(-1\) when it comes back. The count does not change as \(\gamma\) moves, and it equals the linking number \(\operatorname{lk}(\gamma, K)\). The surface is a fence, in the language of <Ref to="cohomology/cohomology-groups" hash="fences-and-pairing" />, and counting how often a loop climbs over it realises the isomorphism \(H_1(S^3\setminus K)\cong\Z\).
</p>

<History title="Fibres and surfaces" people="seifert">
	<p>
		Herbert Seifert studied mathematics and physics in Dresden, and in 1934 he and William Threlfall published <em>Lehrbuch der Topologie</em>, for decades a standard textbook of the subject <Cite k="seifert-threlfall1934" />. The same years produced the surfaces of this section and the 3-manifolds now called Seifert fibred spaces; Seifert was the first to use the term “fibre space” <Cite k="oconnor-robertson-seifert" />. He spent the war years as a professor at Heidelberg, volunteering for war work at an institute for gas dynamics, and he died in Heidelberg in 1996.
	</p>
</History>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="polynomials">Knot polynomials</h2>

<h3 id="alexander-polynomial">The Alexander polynomial: homology of a cover</h3>

<p>
	The first polynomial invariant came from homology, applied to a cleverer space than the complement. Cut the complement \(E\) open along a Seifert surface \(F\). The result has two copies of \(F\) on its edge, the two sides of the cut. Now take infinitely many copies of the cut-open space, numbered by the integers, and glue the upper side of copy \(k\) to the lower side of copy \(k + 1\), for every \(k\). The result is an infinite stack \(\tilde E\), the <dfn>infinite cyclic cover</dfn> of the complement. It comes with a symmetry \(t\colon\tilde E\to\tilde E\) that shifts every copy one step up the stack.
</p>

<p>
	The shift acts on the homology group \(H_1(\tilde E)\), and the interesting information is in how it acts. For the trefoil, \(H_1(\tilde E)\cong\Z^2\), and \(t\) acts on it by a \(2\times2\) matrix with characteristic polynomial \(t^2 - t + 1\). In general the <Term t="alexander-polynomial">Alexander polynomial</Term> \(\Delta_K(t)\) plays the role of the characteristic polynomial of \(t\) acting on \(H_1(\tilde E)\). It is a Laurent polynomial, defined only up to multiplication by \(\pm t^k\), so we normalise it to be symmetric under \(t\mapsto t^{-1}\) with \(\Delta(1) = 1\). For the trefoil, \(\Delta(t) = t - 1 + t^{-1}\).
</p>

<p>
	James Alexander found it in 1928 from the diagram directly <Cite k="alexander1928" />, and it can be computed in several ways: from the Wirtinger presentation (this is how the figures in this chapter compute it), or from the Seifert surface. For the second, choose loops \(a_1,\ldots,a_{2g}\) on \(F\) that generate \(H_1(F)\cong\Z^{2g}\), and let \(V\) be the <dfn>Seifert matrix</dfn>, whose entry \(V_{ij}\) is the linking number of \(a_i\) with a copy of \(a_j\) pushed slightly off the surface to its upper side. Then
</p>
\[ \Delta_K(t)\doteq\det\left(V - t\,V^{\mathsf T}\right), \]
<p>
	where \(\doteq\) means equal up to a factor \(\pm t^k\). For the trefoil’s genus-one surface, with a suitable choice of the two loops, \(V = \begin{pmatrix}-1&1\\0&-1\end{pmatrix}\), and \(\det(V - tV^{\mathsf T}) = (t - 1)^2 + t = t^2 - t + 1\). Since \(V\) is a \(2g\times2g\) matrix, the polynomial spans at most \(2g\) powers of \(t\): <strong>the Alexander polynomial bounds the genus from below</strong>. For the trefoil this proves that no Seifert surface has genus \(0\), so its genus is exactly \(1\).
</p>

<p>
	In 1970 John Conway found a way to compute \(\Delta\) without any homology at all. Pick a crossing, and compare the link \(L_+\) where it is right-handed, the link \(L_-\) where it is switched to left-handed, and the link \(L_0\) where it is smoothed along the arrows, as in Seifert’s algorithm. Conway showed that the polynomial \(\nabla\) defined by \(\Delta(t) = \nabla\bigl(t^{1/2} - t^{-1/2}\bigr)\) obeys the <dfn>skein relation</dfn>
</p>
\[ \nabla(L_+) - \nabla(L_-) = z\,\nabla(L_0),\qquad \nabla(\text{unknot}) = 1. \]
<p>
	Any knot can be unknotted by switching crossings, so the relation computes \(\nabla\) of everything, starting from the unknot <Cite k="conway1970" />.
</p>

<Example title="The trefoil by skein relation">
	<p>
		Take a crossing of the trefoil. Switching it gives the unknot, and smoothing it gives the Hopf link: \(\nabla(3_1) = 1 + z\,\nabla(\text{Hopf})\). For the Hopf link, switching a crossing gives two separate circles and smoothing it gives one circle: \(\nabla(\text{Hopf}) = \nabla(\text{two circles}) + z\cdot1\). Two separate circles have \(\nabla = 0\): draw the unknot with a single twist and apply the relation at its crossing, where switching gives the unknot again and smoothing gives two separate circles, so \(1 - 1 = z\,\nabla(\text{two circles})\). So \(\nabla(\text{Hopf}) = z\) and \(\nabla(3_1) = 1 + z^2\). Substituting \(z = t^{1/2} - t^{-1/2}\), with \(z^2 = t - 2 + t^{-1}\), gives \(\Delta(t) = t - 1 + t^{-1}\), as before.
	</p>
</Example>

<p>
	The Alexander polynomial is a strong invariant, but it has a blind spot: a knot and its mirror image always have the same one. It cannot tell the trefoil from its mirror, nor the granny knot from the square knot.
</p>

<History title="Knots by hand" people="conway">
	<p>
		John Conway, better known outside mathematics for the Game of Life and the surreal numbers <Cite k="oconnor-robertson-conway" />, invented a notation for knots built from small pieces called tangles, and with it enumerated the knots and links of up to eleven crossings by hand. In the process he found eleven knots missing from Little’s table of the alternating knots with eleven crossings, and one listed twice <Cite k="conway1970,hoste2005" />. The skein relation in the same paper turned out to be the seed of everything in the next subsection.
	</p>
</History>

<h3 id="jones-polynomial">The Jones polynomial</h3>

<p>
	In 1984 Vaughan Jones found a new polynomial invariant, and it can see mirror images <Cite k="jones1985" />. The quickest route to it is Louis Kauffman’s, from 1987 <Cite k="kauffman1987" />. Every crossing can be <dfn>smoothed</dfn> in two ways, removing the crossing and reconnecting the four ends in pairs without regard to the arrows. Turn the over-strand counterclockwise until it lies along the under-strand: it sweeps across two of the four corners at the crossing. The <dfn>A-smoothing</dfn> opens a channel joining those two corners; the <dfn>B-smoothing</dfn> joins the other two.
</p>

<Definition id="def-bracket">
	{#snippet head()}The Kauffman bracket{/snippet}
	<p>
		A <dfn>state</dfn> of a diagram \(D\) with \(n\) crossings is a choice of smoothing at every crossing, so there are \(2^n\) states, and each one turns the diagram into a set of disjoint loops. The <Term t="kauffman-bracket">Kauffman bracket</Term> of \(D\) is the Laurent polynomial in a variable \(A\)
	</p>
	\[ \langle D\rangle = \sum_{\text{states } s} A^{\,a(s) - b(s)}\,\bigl(-A^2 - A^{-2}\bigr)^{\ell(s) - 1}, \]
	<p>
		where \(a(s)\) and \(b(s)\) count the A- and B-smoothings in \(s\), and \(\ell(s)\) is its number of loops.
	</p>
</Definition>

<p>
	The odd factor \(-A^2 - A^{-2}\) is exactly what makes the bracket survive moves II and III: expanding both sides of each move, the extra states cancel in pairs (Exercise 5 does move II). Move I is different. Removing a kink multiplies the bracket by \(-A^{3}\) or \(-A^{-3}\), depending on the kink. But move I also changes the writhe of Section 2 by one, so the two defects can be made to cancel.
</p>

<Theorem id="thm-jones" label="Theorem (Jones; Kauffman)">
	<p>For an oriented knot or link with diagram \(D\), the Laurent polynomial</p>
	\[ V(t) = \bigl(-A^{3}\bigr)^{-w(D)}\,\langle D\rangle\quad\text{with } A = t^{-1/4} \]
	<p>does not depend on the diagram. It is the <Term t="jones-polynomial">Jones polynomial</Term>.</p>
</Theorem>

<p>
	For the trefoil with its three right-handed crossings, the eight states give \(\langle D\rangle = -A^{5} - A^{-3} + A^{-7}\) and \(w(D) = 3\), so
</p>
\[ V_{3_1}(t) = t + t^{3} - t^{4}. \]
<p>
	The mirror image has every crossing switched, which exchanges A- and B-smoothings and turns \(A\) into \(A^{-1}\) and \(t\) into \(t^{-1}\): \(V_{\overline{3_1}}(t) = t^{-1} + t^{-3} - t^{-4}\). The two polynomials differ, so <strong>the trefoil is not equivalent to its mirror image</strong>. Max Dehn first proved this in 1914, with a long argument about the knot group <Cite k="dehn1914" />; with the Jones polynomial it takes a few lines. The figure-eight knot has \(V(t) = t^{2} - t + 1 - t^{-1} + t^{-2}\), unchanged by \(t\mapsto t^{-1}\), as it must be for a knot equal to its own mirror image.
</p>

<Figure num="3.7.7" title="The bracket, state by state" hint="Choose a diagram · tap a state to see its smoothing · try the mirror image">
	<BracketStates />
	{#snippet caption()}
		Every state of the diagram, with its loops and its term \(A^{a-b}(-A^2-A^{-2})^{\ell-1}\); the bracket is their sum, and the writhe correction turns it into the Jones polynomial. Mirror the diagram and every \(A\) becomes \(A^{-1}\): the trefoil’s Jones polynomial changes, the figure-eight knot’s does not.
	{/snippet}
</Figure>

<Remark title="A poet’s knot">
	<p>
		A knot equal to its mirror image is called <dfn>amphichiral</dfn>, and the word had already reached verse in the nineteenth century. James Clerk Maxwell, who followed Tait’s tables closely, wrote a mock ode in 1878 that begins “My soul is an entangled knot, / Upon a liquid vortex wrought”; a variant reading of the first line, recorded in the footnotes of his biography, is “My soul’s an amphicheiral knot” <Cite k="campbell-garnett1882" loc="pp. 649–650" />.
	</p>
</Remark>

<History title="Von Neumann algebras and knots" people="vaughan-jones">
	<p>
		Vaughan Jones, from New Zealand, was working on von Neumann algebras, a subject of analysis with no visible connection to knots, when he found matrices satisfying the braid relations of Section 5 together with a trace that is unchanged by Markov’s moves. By the theorems of Alexander and Markov, that is a link invariant. Joan Birman, introducing his work at the 1990 International Congress in Kyoto, said: “In 1984 Jones discovered an astonishing relationship between von Neumann algebras and geometric topology” <Cite k="oconnor-robertson-jones" />. He received a Fields Medal at that congress, and gave his lecture there wearing the All Blacks rugby strip. Within three years his polynomial had settled the first of Tait’s century-old conjectures, and in 1989 Edward Witten explained it through quantum field theory <Cite k="witten1989" />. Jones died in Nashville in 2020.
	</p>
</History>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="khovanov">Khovanov homology: homology returns</h2>

<p>
	Look at the bracket again. It is a sum over the \(2^n\) vertices of a cube, with signs and powers of a variable. <Ref to="homology/homology-groups" /> taught us to recognise such sums: an alternating sum of dimensions is an Euler characteristic, and an Euler characteristic is the shadow of a homology theory. Mikhail Khovanov built the homology whose shadow is the Jones polynomial, in a paper posted in 1999 and published in 2000 <Cite k="khovanov2000" />.
</p>

<p>
	The construction, in outline <Cite k="bar-natan2002" />. Let \(W\) be a two-dimensional vector space with basis \(v_+\) and \(v_-\), and give these basis vectors degrees \(+1\) and \(-1\). To each state with \(\ell\) loops, attach the vector space \(W^{\otimes\ell}\): one copy of \(W\) for each loop, so a basis vector labels each loop with a \(+\) or a \(-\). Arrange the states in columns by their number of B-smoothings, from \(0\) to \(n\); these will be the chain groups. Two states that differ at a single crossing, A in one and B in the other, are joined by an edge of the cube, and changing that one smoothing either merges two loops into one or splits one loop into two. Merging and splitting get the maps
</p>
\[
	\begin{aligned}
		m(v_+\otimes v_+) &= v_+, & m(v_+\otimes v_-) = m(v_-\otimes v_+) &= v_-, & m(v_-\otimes v_-) &= 0,\\
		\Delta(v_+) &= v_+\otimes v_- + v_-\otimes v_+, & \Delta(v_-) &= v_-\otimes v_-.
	\end{aligned}
\]
<p>
	The boundary map from one column to the next is the sum of the edge maps, with signs chosen so that the square faces of the cube anticommute; then \(\partial\circ\partial = 0\), and we have a chain complex. Both degrees, the column and the total \(\pm\) degree, are then shifted by amounts that depend on the numbers of right- and left-handed crossings. The homology of this complex is a family of vector spaces \(\mathit{Kh}^{i,j}(K)\), graded by two integers.
</p>

<Theorem id="thm-khovanov" label="Theorem (Khovanov)">
	<p>
		The groups \(\mathit{Kh}^{i,j}(K)\) do not depend on the diagram, so they are invariants of the knot, called its <Term t="khovanov-homology">Khovanov homology</Term>. For a knot, their graded Euler characteristic is the Jones polynomial:
	</p>
	\[ \sum_{i,j}(-1)^i\,q^{\,j}\,\dim\mathit{Kh}^{i,j}(K) = \bigl(q + q^{-1}\bigr)\,V_K\bigl(q^2\bigr). \]
</Theorem>

<p>
	For the trefoil, the \(8\) states carry \(30\) basis vectors in all, and only four survive in homology, one each in bidegrees \((0,1)\), \((0,3)\), \((2,5)\) and \((3,9)\). The Euler characteristic is \(q + q^{3} + q^{5} - q^{9} = (q + q^{-1})(q^2 + q^6 - q^8)\), which is \(q + q^{-1}\) times \(V_{3_1}(q^2)\). This is the Euler–Poincaré theorem of <Ref to="homology/homology-groups" hash="euler-poincare" />, that the Euler characteristic of a chain complex equals that of its homology, now with a second grading.
</p>

<Figure num="3.7.8" title="The Khovanov cube" hint="Choose a diagram · switch between chain groups and homology">
	<KhovanovCube />
	{#snippet caption()}
		The states of the diagram in columns by their number of B-smoothings, joined by merges (gold) and splits (teal). The table shows the dimensions of the chain groups in each bidegree, or of the homology. Most of the chain groups cancel out, and what survives is the knot invariant. For the twisted unknot, a diagram with a crossing, everything cancels except exactly the homology of a round unknot.
	{/snippet}
</Figure>

<p>
	Khovanov homology is strictly stronger than the Jones polynomial: Dror Bar-Natan’s tables of 2002 already contain distinct knots, such as \(10_{132}\) and a mirror image of \(5_1\), with the same Jones polynomial and different Khovanov homology <Cite k="bar-natan2002" />. In 2011 Peter Kronheimer and Tomasz Mrowka proved, with gauge theory, that Khovanov homology detects the unknot: a knot whose Khovanov homology is that of the unknot <em>is</em> the unknot <Cite k="kronheimer-mrowka2011" />. Whether its shadow can do the same is the best-known open question about the Jones polynomial.
</p>

<Conjecture k="jones-unknot">
	<p>
		Khovanov homology detects the unknot, and the Jones polynomial is its Euler characteristic. The question is whether that shadow still contains enough to recognise the unknot.
	</p>
</Conjecture>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="arms-race">The arms race of invariants</h2>

<p>
	Every invariant in this chapter has a blind spot, and for each one there are pairs of different knots that it cannot tell apart. Knot theory has advanced by finding such pairs and then finding invariants that see the difference. The figure lines up the invariants of this chapter against a few famous pairs.
</p>

<Figure num="3.7.9" title="The arms race of invariants" hint="Choose a famous pair, or any two knots">
	<ArmsRace />
	{#snippet caption()}
		For each pair, the invariants in order of discovery. Rows where the two knots agree are greyed out; the first row that differs proves the knots different. The trefoil and its mirror fool everything before the Jones polynomial, and the granny and square knots fool the Alexander polynomial; \(6_1\) and \(9_{46}\) have the same Alexander polynomial but different numbers of colourings; \(10_{132}\) and a mirror image of \(5_1\) have the same Jones polynomial, and only Khovanov homology tells them apart.
	{/snippet}
</Figure>

<p>
	The race is not a straight line: the humble colouring count separates \(6_1\) from \(9_{46}\), where the Alexander polynomial cannot. Nor is it over. Each invariant answers “are these knots different?” only when it happens to differ. The opposite question, “is this knot the unknot?”, has an answer in principle: Wolfgang Haken gave an algorithm in 1961 <Cite k="haken1961" />. How fast it can be answered is open.
</p>

<Conjecture k="unknot-recognition">
	<p>
		Khovanov homology detects the unknot, but computing it takes time exponential in the number of crossings, since the cube has \(2^n\) vertices. Is there a fast test?
	</p>
</Conjecture>

<p>
	Some of the simplest questions about knots are among the hardest. The <dfn>unknotting number</dfn> \(u(K)\) is the smallest number of crossings that must be switched, in some diagram, to turn \(K\) into the unknot. Genus adds up under connected sum (Section 6). For decades it was expected that unknotting number does too.
</p>

<Conjecture k="unknotting-additivity">
	<p>It sounds obvious: to untie two knots tied one after the other, untie each of them. It is false.</p>
</Conjecture>

<p>
	The tables keep growing. There is one prime knot with three crossings, one with four, two with five, three with six, seven with seven, \(21\) with eight, \(49\) with nine and \(165\) with ten. With sixteen crossings there are \(1{,}388{,}705\) <Cite k="hoste-thistlethwaite-weeks1998" />. Benjamin Burton extended the tables to nineteen crossings in 2020 <Cite k="burton2020" />, and in 2025 Morwen Thistlethwaite completed the list of the \(1{,}847{,}319{,}428\) prime knots with twenty crossings <Cite k="thistlethwaite2025" />. Each of them had to be told apart from all the others by computer, with invariants like the ones in this chapter and stronger ones.
</p>

<h3 id="knots-in-the-world">Knots in the world</h3>

<p>Kelvin’s vortex atoms were wrong, but knots turned out to matter in the sciences anyway.</p>
<ul>
	<li>
		<strong>DNA.</strong> The long loops of DNA in a cell get knotted and linked, and enzymes called topoisomerases cut and reseal the strands to undo them; knotted DNA rings were made with one such enzyme in 1976 <Cite k="liu-depew-wang1976" />. Biologists identify the knots in electron micrographs and use them to read off how an enzyme acts <Cite k="wasserman-dungan-cozzarelli1985,wasserman-cozzarelli1986" />.
	</li>
	<li>
		<strong>Proteins.</strong> Some proteins fold into knots. In 2000 William Taylor found a deep figure-eight knot in a plant enzyme <Cite k="taylor2000" />.
	</li>
	<li>
		<strong>Molecules.</strong> Chemists tie knots on purpose: a molecular trefoil in 1989 <Cite k="dietrich-buchecker-sauvage1989" />, part of the work recognised by the 2016 Nobel Prize in Chemistry for molecular machines, and in 2017 a molecule knotted as \(8_{19}\), with eight crossings, braided from three strands <Cite k="danon2017" />.
	</li>
	<li>
		<strong>Fluids.</strong> In 2013 Dustin Kleckner and William Irvine made knotted and linked vortex loops in water with 3D-printed hydrofoils and watched them move <Cite k="kleckner-irvine2013" />, close to what Kelvin had imagined.
	</li>
	<li>
		<strong>Physics.</strong> Witten’s explanation of the Jones polynomial <Cite k="witten1989" /> made knot invariants part of quantum field theory, and through it of the study of topological phases of matter.
	</li>
</ul>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Colour the figure-eight">
	<p>
		The standard diagram of the figure-eight knot has four arcs and four crossings. Show that it has only the constant \(3\)-colourings, and find a \(5\)-colouring that uses more than one colour. What does this say about the figure-eight knot and the unknot?
	</p>
	{#snippet solution()}
		<p>
			Call the arcs \(a, b, c, d\) in order along the knot. With the usual drawing, the four crossings give \(2a = b + c\), \(2b = c + d\), \(2c = d + a\) and \(2d = a + b\). The first two give \(c = 2a - b\) and \(d = 2b - c = 3b - 2a\). Substituting into the third gives \(4a - 2b = 3b - a\), that is \(5(a - b) = 0\), and the fourth gives the same. Mod \(3\) this forces \(a = b\), and then \(c = d = a\): only the constant colourings. Mod \(5\) it holds for every choice of \(a\) and \(b\), so there are \(5^2 = 25\) colourings; for example \(a = 0\), \(b = 1\), \(c = 4\), \(d = 3\). The unknot has only \(5\), so the figure-eight knot is knotted. The equation \(5(a - b) = 0\) shows its determinant: \(5\).
		</p>
	{/snippet}
</Exercise>

<Exercise level={1} title="Move III and colourings">
	<p>
		Finish the proof that colourings are invariant. In move III, label the colours of the three strands where they enter the disk \(x\) (the top strand), \(y\) and \(z\). Compute the colours where they leave, before and after the move, and check that they agree.
	</p>
	{#snippet solution()}
		<p>
			Let the top strand cross over both others and let \(y\) cross over \(z\). Before the move, \(y\) passes under \(x\) and leaves as \(2x - y\); \(z\) passes under \(y\), becoming \(2y - z\), then under \(x\), leaving as \(2x - (2y - z) = 2x - 2y + z\). After the move, \(z\) first passes under \(x\), becoming \(2x - z\), then under the other strand, which by now has colour \(2x - y\): it leaves as \(2(2x - y) - (2x - z) = 2x - 2y + z\). The top strand keeps \(x\) and the middle strand leaves as \(2x - y\) in both pictures. The exits agree, and the inside is determined by the entries, so colourings correspond one to one.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Linking numbers from a diagram">
	<p>
		Using “half the sum of the signs of the crossings between the two components”, compute the linking numbers of the Hopf link, Solomon’s knot and the Whitehead link from diagrams of them (the gallery of Figure 3.7.1 shows all three in space). Why must the number of crossings between two components always be even?
	</p>
	{#snippet solution()}
		<p>
			The Hopf link has two crossings between its components, of the same sign: \(\operatorname{lk} = \pm1\). Solomon’s knot has four, all of the same sign: \(\pm2\). The Whitehead link’s standard diagram has five crossings: one where the twisted component crosses itself, which does not count, and four between the two components, two of each sign, so \(\operatorname{lk} = 0\). The shadows of the two components are closed curves in the plane, and two closed curves in general position always cross an even number of times: slide one of them far away from the other, and watch the crossings appear and disappear only in pairs.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="The genus of torus knots">
	<p>
		The closure of \(\sigma_1^{\,n}\) in \(B_2\), for odd \(n\), is a knot (the trefoil for \(n = 3\), the cinquefoil for \(n = 5\)). Find its Seifert circles and the genus of the surface Seifert’s algorithm builds. Check your answer for \(n = 5\) against the Alexander polynomial \(\Delta_{5_1}(t) = t^{2} - t + 1 - t^{-1} + t^{-2}\).
	</p>
	{#snippet solution()}
		<p>
			All crossings point the same way, so smoothing each one along the arrows separates the two strands: there are \(s = 2\) Seifert circles, one inside the other, and \(c = n\) crossings. The genus is \(\tfrac12(1 - 2 + n) = \tfrac{n-1}{2}\): \(1\) for the trefoil, \(2\) for the cinquefoil. The cinquefoil’s polynomial runs from \(t^{-2}\) to \(t^{2}\), a span of \(4 = 2g\), so the genus is at least \(2\); Seifert’s surface has genus \(2\), so \(g(5_1) = 2\) exactly.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="The bracket and move II">
	<p>
		Expand the bracket of the two crossings in move II, smoothing both of them in all four ways, and show that the result equals the bracket of the two strands pulled apart. (One of the four states contains a small closed loop.)
	</p>
	{#snippet solution()}
		<p>
			Write \(\langle\,)(\,\rangle\) for the bracket of the diagram with the two strands pulled apart, and \(\langle\asymp\rangle\) for the diagram in which both strands are turned back on themselves, cup over cap. The two states that smooth both crossings the same way, AA and BB, both give the turned-back picture, with factors \(A^{2}\) and \(A^{-2}\). The two mixed states have no net power of \(A\): one gives the strands pulled apart, and the other gives the turned-back picture with a small closed loop between the cup and the cap, which contributes a factor \(-A^2 - A^{-2}\). In total the coefficient of \(\langle\asymp\rangle\) is \(A^2 + A^{-2} - A^2 - A^{-2} = 0\), and what remains is \(\langle\,)(\,\rangle\). The loop factor was chosen to make exactly this cancellation happen.
		</p>
	{/snippet}
</Exercise>

<Exercise level={2} title="Abelianizing the knot group">
	<p>
		Show directly from the Wirtinger presentation that the abelianization of every knot group is \(\Z\), and that the image of a loop in it is its linking number with the knot.
	</p>
	{#snippet solution()}
		<p>
			In an abelian group, \(x_a^{\varepsilon}x_bx_a^{-\varepsilon} = x_b\), so every relation becomes \(x_c = x_b\): the lasso around the arc leaving a crossing equals the lasso around the arc entering it. Walking once along the knot passes every crossing from the under side once, so all the generators are identified, and nothing else is imposed: the abelianization is the free abelian group on one generator \(x\), that is \(\Z\). A loop in the complement is a product of lassos and their inverses, and its image is \(x^{n}\), where \(n\) is the number of lassos minus the number of inverse lassos: the signed number of times the loop goes around the knot, which is the linking number.
		</p>
	{/snippet}
</Exercise>

<Exercise level={3} title="The trefoil group and its quotients">
	<p>
		The trefoil’s group is \(G = \langle x, y\mid xyx = yxy\rangle\). (a) Find a homomorphism from \(G\) onto the permutation group \(S_3\), the triangle group \(D_3\) of <Ref to="foundations/groups" />, and conclude that \(G\) is not abelian. (b) Let \(a = xy\) and \(b = xyx\). Show that \(a\) and \(b\) generate \(G\) and that \(a^3 = b^2\). (c) Deduce that \(a^3\) commutes with every element of \(G\), and that \(a^3\ne1\).
	</p>
	{#snippet solution()}
		<p>
			(a) Send \(x\) to the swap \((1\,2)\) and \(y\) to \((2\,3)\). Both sides of the relation go to the swap \((1\,3)\), so the map is a homomorphism, and the two swaps generate \(S_3\). Since \(S_3\) is not abelian, neither is \(G\).
		</p>
		<p>
			(b) \(a^{-1}b = y^{-1}x^{-1}\,xyx = x\), and then \(y = x^{-1}a\), so \(a\) and \(b\) generate. Using the relation once, on the second factor, \(b^2 = (xyx)(xyx) = (xyx)(yxy) = (xy)(xy)(xy) = a^3\).
		</p>
		<p>
			(c) \(a^3\) commutes with \(a\), being a power of \(a\), and with \(b\), being equal to \(b^2\). Since \(a\) and \(b\) generate \(G\), it commutes with everything. The abelianization \(G\to\Z\), sending \(x\) and \(y\) to \(1\), sends \(a^3\) to \(6\), so \(a^3\ne1\). So \(G\) is not abelian, yet it has a nontrivial centre. (In fact \(G\cong B_3\), and \(a^3\) is the full twist \((\sigma_1\sigma_2)^3\) of three strands.)
		</p>
	{/snippet}
</Exercise>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>A <strong>knot</strong> is a smooth closed curve in space, and two knots are <strong>equivalent</strong> if an ambient isotopy carries one to the other. Homeomorphism and homotopy are both too weak to tell knots apart.</li>
		<li><strong>Reidemeister:</strong> two diagrams show the same knot exactly when three local moves connect them. An invariant is anything computed from a diagram that the moves do not change.</li>
		<li><strong>Colourings</strong> mod \(p\) are solutions of a linear system; their number is an invariant. The trefoil has \(9\) colourings mod \(3\), the unknot \(3\). Non-constant colourings exist exactly for the primes dividing the <strong>determinant</strong>.</li>
		<li><strong>Homology is blind:</strong> by Mayer–Vietoris, every knot complement has \(H_1\cong\Z\), generated by the meridian, and no higher homology. The class of a loop is its <strong>linking number</strong>.</li>
		<li>The <strong>knot group</strong> keeps what homology forgets. Colourings are its homomorphisms to the symmetries of a \(p\)-gon. The complement determines the knot up to mirror image (Gordon–Luecke).</li>
		<li><strong>Braids</strong> form groups \(B_n\) with Artin’s presentation; every link is a closed braid (Alexander), and Markov’s moves say when two closures agree.</li>
		<li>Every knot bounds an oriented <strong>Seifert surface</strong>, with \(\chi = s - c\) and \(\chi = 2 - 2g - b\). Genus is additive, so knots cannot cancel each other, and prime decomposition is unique.</li>
		<li>The <strong>Alexander polynomial</strong> is homology again, of the infinite cyclic cover; it bounds the genus. The <strong>Jones polynomial</strong>, from the Kauffman bracket and the writhe, sees that the trefoil is chiral.</li>
		<li><strong>Khovanov homology</strong> turns the bracket’s cube of states into a chain complex. Its Euler characteristic is the Jones polynomial, and it detects the unknot.</li>
	</ul>
</Recap>

<!-- ───────────────────────────────────────────────────────────────────── -->
<h2 id="further-reading">Further reading</h2>

<FurtherReading
	items={[
		{
			title: 'The Knot Book',
			author: 'Colin C. Adams',
			url: 'https://bookstore.ams.org/view?ProductCode=KNOTBOOK',
			note: 'The friendliest introduction there is: diagrams, tabulation, invariants, braids and the Jones polynomial, with open problems and pictures on almost every page. A good first book after this chapter.',
			kind: 'book'
		},
		{
			title: 'Knots and Links',
			author: 'Dale Rolfsen',
			url: 'https://bookstore.ams.org/chel-346-h',
			note: 'The classic geometric treatment, with Seifert surfaces, covering spaces and the Alexander polynomial done properly, and the knot table that everyone still uses.',
			kind: 'book'
		},
		{
			title: 'An Introduction to Knot Theory',
			author: 'W. B. Raymond Lickorish',
			url: 'https://link.springer.com/book/10.1007/978-1-4612-0691-0',
			note: 'A concise graduate text: Seifert matrices, the Jones polynomial and Tait’s conjectures, and the 3-manifold side of the story.',
			kind: 'book'
		},
		{
			title: 'On Khovanov’s categorification of the Jones polynomial',
			author: 'Dror Bar-Natan',
			url: 'https://arxiv.org/abs/math/0201043',
			note: 'The paper that made Khovanov homology computable and popular: a clear account of the cube of resolutions, with tables of the invariant for all prime knots up to eleven crossings.',
			kind: 'paper',
			free: true
		},
		{
			title: '3-coloring and other elementary invariants of knots',
			author: 'Józef H. Przytycki',
			url: 'https://arxiv.org/abs/math/0608172',
			note: 'Colourings, Fox’s idea and where it leads, written for students.',
			kind: 'paper',
			free: true
		},
		{
			title: 'KnotInfo',
			author: 'Charles Livingston and Allison H. Moore',
			url: 'https://knotinfo.org',
			note: 'A searchable table of the prime knots up to thirteen crossings with dozens of invariants each: diagrams, braids, polynomials, genus, unknotting numbers. The values in this chapter were checked against it.',
			kind: 'interactive',
			free: true
		},
		{
			title: 'The Knot Atlas',
			author: 'Dror Bar-Natan, Scott Morrison and others',
			url: 'https://katlas.org',
			note: 'A wiki of knots and links with pictures, polynomials and Khovanov homology tables for every knot in Rolfsen’s table. Note that its trefoil is the left-handed one.',
			kind: 'interactive',
			free: true
		}
	]}
/>
