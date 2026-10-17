// The book's conjectures and open problems: one record each, shown in the
// chapter where it fits by  <Conjecture k="goldbach">…</Conjecture>,  and all
// together on the Open Problems page. Text fields may hold inline math \\( … \\)
// and *emphasis*. Statuses are as of `ASOF`; check them again before changing it.

export const ASOF = 'October 2026';

export type ProblemStatus = 'open' | 'proved' | 'disproved' | 'independent' | 'claimed';

export interface Problem {
	key: string;
	name: string;
	/** a conjecture asserts something; a problem asks a question */
	kind: 'conjecture' | 'problem';
	/** who first asked, and when; leave `by` empty when the question has no single author */
	posed: { by: string; year: number | string };
	/** the statement, for a reader of the chapter it sits in */
	statement: string;
	status: ProblemStatus;
	/** who settled it, when, and how (for every status but open) */
	settled?: { by: string; year: number | string; how: string };
	/** what is known: partial results, records, evidence */
	known: string;
	/** something concrete a curious reader can try */
	wayIn?: string;
	/** the chapter whose box shows it */
	chapter: string;
	/** bibliography keys */
	cite: string[];
}

export const problems: Problem[] = [
	{
		key: 'goldbach',
		name: 'Goldbach’s conjecture',
		kind: 'conjecture',
		posed: { by: 'Christian Goldbach, in a letter to Leonhard Euler', year: 1742 },
		statement: 'Every even number greater than \\(2\\) is the sum of two primes: \\(4 = 2 + 2\\), \\(6 = 3 + 3\\), \\(8 = 3 + 5\\), \\(100 = 3 + 97\\), and so on.',
		status: 'open',
		known: 'It has been checked by computer for every even number up to \\(4\\cdot10^{18}\\). Chen Jingrun proved in 1973 that every large enough even number is a prime plus a number with at most two prime factors. The *weak* version, that every odd number from \\(7\\) on is a sum of three primes, was proved by Harald Helfgott in 2013; it follows from Goldbach’s conjecture, but not the other way round.',
		wayIn: 'Count the ways of writing each even number as a sum of two primes and plot the counts. The cloud of points, called Goldbach’s comet, rises steadily as the numbers grow, which is why nobody doubts the conjecture. A short program will draw it, and Figure 0.2.1 already has.',
		chapter: 'prelude/reading-math',
		cite: ['oliveira-e-silva2014', 'helfgott2013']
	},
	{
		key: 'continuum-hypothesis',
		name: 'The continuum hypothesis',
		kind: 'problem',
		posed: { by: 'Georg Cantor', year: 1878 },
		statement: 'Is there an infinite set of real numbers that is larger than the set of natural numbers \\(\\N\\) but smaller than \\(\\R\\)? Cantor guessed that there is not.',
		status: 'independent',
		settled: {
			by: 'Kurt Gödel and Paul Cohen',
			year: 1963,
			how: 'Gödel showed in 1940 that the usual axioms of set theory cannot disprove the continuum hypothesis, and Cohen showed in 1963, with a new method called forcing, that they cannot prove it either (assuming the axioms are consistent at all). Cohen received the Fields Medal for it.'
		},
		known: 'Hilbert put the question first on his famous list of 1900. The hypothesis holds for every closed set of real numbers, and indeed for every set built from intervals by repeatedly taking countable unions, intersections and complements, so an intermediate size can never come from a set that is easy to describe. Whether some new, convincing axiom should decide it is still debated.',
		wayIn: 'Prove the parts that are theorems: \\(\\N\\), \\(\\Z\\) and \\(\\Q\\) have the same size; \\(\\R\\) is larger, by Cantor’s diagonal argument; and \\(\\R\\), the plane \\(\\R^2\\) and the set of all subsets of \\(\\N\\) all have the same size as each other.',
		chapter: 'foundations/sets-and-functions',
		cite: ['cantor1878', 'godel1940', 'cohen1963']
	},
	{
		key: 'graph-isomorphism',
		name: 'Graph isomorphism in polynomial time',
		kind: 'problem',
		posed: { by: '', year: 'the 1970s' },
		statement: 'Is there an algorithm that decides whether two networks of \\(n\\) dots are the same network with the dots relabelled, in a number of steps bounded by a fixed power of \\(n\\)?',
		status: 'open',
		known: 'In 2015 László Babai announced an algorithm that runs in quasi-polynomial time, roughly \\(n^{(\\log n)^c}\\) steps: far faster than anything before, but not a fixed power of \\(n\\). In 2017 Harald Helfgott found a gap in one step; Babai repaired it within days, and Helfgott checked the repair. Graph isomorphism is believed not to be among the hardest problems in NP, which puts it in a rare middle ground.',
		wayIn: 'Try *colour refinement*: colour all dots alike, then repeatedly recolour each dot by its old colour together with the list of its neighbours’ colours. If the two networks ever show different numbers of dots of some colour, they are different. Then find two different networks it cannot tell apart, such as a hexagon and a pair of triangles: an invariant can prove that two things differ, but never that they are the same.',
		chapter: 'foundations/equivalence',
		cite: ['babai2016', 'helfgott2017']
	},
	{
		key: 'burnside',
		name: 'The Burnside problem for exponent 5',
		kind: 'problem',
		posed: { by: 'William Burnside', year: 1902 },
		statement: 'Take two letters \\(a\\) and \\(b\\), form all words in them, and impose only the rule that \\(w^5 = 1\\) for every word \\(w\\). Is the resulting group, called \\(B(2,5)\\), finite?',
		status: 'open',
		known: 'With \\(w^2 = 1\\), \\(w^3 = 1\\), \\(w^4 = 1\\) or \\(w^6 = 1\\) in place of \\(w^5 = 1\\) the group is finite; for large odd exponents it is infinite (Novikov and Adian, 1968). The largest *finite* group of this kind with exponent \\(5\\) is known, with \\(5^{34}\\) elements (Havas, Wall and Wamsley, 1974), and Zelmanov proved that such a largest finite group always exists, work recognised with a Fields Medal in 1994. \\(B(2,5)\\) is finite exactly when it is that group, and nobody knows whether it is.',
		wayIn: 'Start small. If every word squares to \\(1\\), show that \\(ab = ba\\) (expand \\((ab)^2 = 1\\)) and that the group has exactly \\(4\\) elements. With cubes instead of squares the group has \\(27\\) elements; try to list them.',
		chapter: 'foundations/groups',
		cite: ['burnside1902', 'havas-wall-wamsley1974']
	},
	{
		key: 'whitehead-problem',
		name: 'Whitehead’s problem',
		kind: 'problem',
		posed: { by: 'J. H. C. Whitehead', year: 'about 1950' },
		statement: 'Call an abelian group \\(A\\) a Whitehead group if every short exact sequence \\(0\\to\\Z\\to B\\to A\\to 0\\) splits. Every free abelian group is a Whitehead group. Is every Whitehead group free?',
		status: 'independent',
		settled: {
			by: 'Saharon Shelah',
			year: 1974,
			how: 'Shelah showed that the answer depends on the axioms of set theory. If every set is constructible (Gödel’s axiom \\(V = L\\)), every Whitehead group is free; under Martin’s axiom with the continuum hypothesis false, there is a Whitehead group that is not free. It was the first problem from ordinary algebra shown to be undecidable.'
		},
		known: 'For countable groups the answer is yes: every countable Whitehead group is free (Karl Stein, 1951). Shelah later showed that even the continuum hypothesis does not decide the uncountable case.',
		wayIn: 'Show that \\(\\Z/n\\) is not a Whitehead group, using the sequence \\(0\\to\\Z\\xrightarrow{\\times n}\\Z\\to\\Z/n\\to0\\). Deduce that a Whitehead group has no elements of finite order, and then that every finitely generated Whitehead group is free.',
		chapter: 'foundations/abelian-groups',
		cite: ['shelah1974', 'eklof1976']
	},
	{
		key: 'hadamard',
		name: 'The Hadamard conjecture',
		kind: 'conjecture',
		posed: { by: 'Raymond Paley', year: 1933 },
		statement: 'For every multiple of \\(4\\) there is a square table of \\(+1\\)s and \\(-1\\)s of that size whose rows are pairwise orthogonal: any two different rows agree in exactly half of their places.',
		status: 'open',
		known: 'Hadamard showed in 1893 that the size must be \\(1\\), \\(2\\) or a multiple of \\(4\\); the conjecture, usually credited to Paley, is the converse. Constructions cover infinitely many sizes, every power of \\(2\\) among them. For two decades the smallest size nobody could construct was \\(668\\). In August 2026 Levent Alpöge, Philippe Voinov and Saul Reynolds-Haertle, working with the AI model Claude, posted matrices for all twelve missing sizes below \\(2000\\), \\(668\\) included; anyone can check them in a few lines of code. The conjecture, for every multiple of \\(4\\), remains open.',
		wayIn: 'Build Sylvester’s matrices: start with the \\(1\\times1\\) matrix \\((1)\\) and repeatedly replace \\(H\\) by \\(\\begin{pmatrix}H & H\\\\ H & -H\\end{pmatrix}\\). Check that the rows stay orthogonal. Then look for one of size \\(12\\), by hand or by random search, and notice how quickly blind search runs out of luck.',
		chapter: 'foundations/linear-algebra',
		cite: ['hadamard1893', 'paley1933', 'oeis-a007299']
	},
	{
		key: 'paper-mobius',
		name: 'The shortest paper Möbius band',
		kind: 'conjecture',
		posed: { by: 'Benjamin Halpern and Charles Weaver', year: 1977 },
		statement: 'A strip of paper of width \\(1\\) and length \\(\\lambda\\) can be bent into a Möbius band, without stretching, tearing or passing through itself, only if \\(\\lambda\\gt\\sqrt3\\approx1.73\\), and the bound \\(\\sqrt3\\) cannot be improved.',
		status: 'proved',
		settled: {
			by: 'Richard Evan Schwartz',
			year: 2023,
			how: 'Schwartz posted his proof in August 2023, and it appeared in the Annals of Mathematics in 2025. A paper band bends only along straight lines, and he found a pair of these lines forced to meet in a T shape; comparing that T with triangles gives \\(\\lambda\\gt\\sqrt3\\).'
		},
		known: 'Bands that come close to the bound look more and more like a folded, flattened triangle, the *triangular Möbius band*, which is not a genuine band. If the paper may pass through itself, the threshold drops to \\(\\pi/2\\), as Halpern and Weaver showed.',
		wayIn: 'Fold one. Take a strip \\(3\\) cm wide and \\(5.2\\) cm long, a ratio just over \\(\\sqrt3\\); fold it twice at \\(60°\\) so that it flattens into an equilateral triangle, and tape the ends. Then take a strip twice as long as it is wide and make a genuine, slightly puffy band.',
		chapter: 'topology/gluing',
		cite: ['schwartz2025', 'halpern-weaver1977']
	},
	{
		key: 'andrews-curtis',
		name: 'The Andrews–Curtis conjecture',
		kind: 'conjecture',
		posed: { by: 'James Andrews and Morton Curtis', year: 1965 },
		statement: 'If a presentation with as many relations as generators describes the trivial group, it can be turned into \\(\\langle x_1,\\ldots,x_n\\mid x_1,\\ldots,x_n\\rangle\\) by three kinds of moves: multiplying one relation by another, inverting a relation, and conjugating a relation.',
		status: 'open',
		known: 'Most experts suspect it is false, but no counterexample is known. The best-known candidates are the presentations \\(\\langle x, y\\mid xyx = yxy,\\ x^n = y^{n+1}\\rangle\\) of Akbulut and Kirby (1985). In 2024 a team led by Sergei Gukov used computer search, including reinforcement learning, to dispose of many candidates, and showed that the case \\(n = 3\\) can be reduced if extra generators are allowed; without them it is still open. Some presentations that do reduce need astronomically many moves, so blind search alone cannot settle the question.',
		wayIn: 'Make \\(\\langle x, y\\mid xyx = yxy,\\ x^n = y^{n+1}\\rangle\\) commutative: the first relation forces \\(x = y\\), and then the second forces \\(x = 1\\). So the group is trivial even after forgetting the order, and homology sees no obstruction at all. Then reduce the small example \\(\\langle x, y\\mid xy^2, y\\rangle\\) to \\(\\langle x, y\\mid x, y\\rangle\\) with the three moves.',
		chapter: 'topology/homotopy',
		cite: ['andrews-curtis1965', 'akbulut-kirby1985', 'shehper2024']
	},
	{
		key: 'poincare-conjecture',
		name: 'The Poincaré conjecture',
		kind: 'conjecture',
		posed: { by: 'Henri Poincaré', year: 1904 },
		statement: 'A closed 3-dimensional manifold in which every loop can be shrunk to a point is homeomorphic to the 3-sphere \\(S^3\\).',
		status: 'proved',
		settled: {
			by: 'Grigori Perelman',
			year: 2003,
			how: 'In three papers posted in 2002 and 2003, Perelman completed Richard Hamilton’s programme of Ricci flow: let the shape of the space evolve so that its curvature evens out, and cut it open carefully where it pinches. His work proves Thurston’s geometrization conjecture, which contains Poincaré’s. He declined the Fields Medal in 2006 and the Millennium Prize in 2010.'
		},
		known: 'Poincaré first asked the question with homology in place of loops, then built a space with the homology of \\(S^3\\) whose fundamental group has \\(120\\) elements: homology alone is not enough. The analogue in higher dimensions was proved earlier, by Smale (1961) from dimension \\(5\\) on and by Freedman (1982) in dimension \\(4\\).',
		chapter: 'topology/manifolds',
		cite: ['poincare1904', 'perelman2002', 'morgan-tian2007']
	},
	{
		key: 'smooth-poincare-4',
		name: 'The smooth Poincaré conjecture in dimension 4',
		kind: 'conjecture',
		posed: { by: '', year: 'the 1960s' },
		statement: 'Every 4-dimensional manifold that is homotopy equivalent to the 4-sphere \\(S^4\\) is the 4-sphere not only up to homeomorphism but up to smooth deformation: \\(S^4\\) has no *exotic* smooth structure.',
		status: 'open',
		known: 'Freedman proved the version with homeomorphisms in 1982. In every other dimension it is known which spheres carry exotic smooth structures; Milnor found the first, in dimension \\(7\\), in 1956. Dimension \\(4\\) is the only one where nobody knows, and many proposed exotic 4-spheres have turned out, after years of work, to be the ordinary one.',
		chapter: 'topology/manifolds',
		cite: ['freedman1982', 'milnor1956', 'freedman-gompf-morrison-walker2010']
	},
	{
		key: 'triangulation',
		name: 'The triangulation conjecture',
		kind: 'conjecture',
		posed: { by: '', year: 'the 1920s' },
		statement: 'Every manifold can be cut into simplices: it is homeomorphic to a simplicial complex.',
		status: 'disproved',
		settled: {
			by: 'Ciprian Manolescu',
			year: 2013,
			how: 'Galewski and Stern, and independently Matumoto, had reduced the question in dimensions \\(5\\) and higher to a problem about 3-manifolds with the homology of the 3-sphere. Manolescu solved that problem in 2013 with a new version of Floer homology, a homology theory built from solutions of differential equations, and the answer was no: in every dimension from \\(5\\) on there are manifolds that cannot be triangulated.'
		},
		known: 'Every surface can be triangulated (Radó, 1925), every 3-manifold (Moise, 1952), and every smooth manifold of any dimension. In dimension \\(4\\), manifolds that cannot be triangulated were found in the 1980s, from Freedman’s \\(E_8\\) manifold and Casson’s invariant.',
		wayIn: 'Triangulate the torus with as few vertices as possible (seven suffice, and fewer do not), and compute its homology from your triangulation.',
		chapter: 'topology/simplicial-complexes',
		cite: ['rado1925', 'galewski-stern1980', 'manolescu2016']
	},
	{
		key: 'kalai-3d',
		name: 'Kalai’s 3ᵈ conjecture',
		kind: 'conjecture',
		posed: { by: 'Gil Kalai', year: 1989 },
		statement: 'A convex polytope in \\(d\\) dimensions that is symmetric about its centre has at least \\(3^d\\) faces, counting the vertices, the edges, and so on up to the polytope itself.',
		status: 'open',
		known: 'The cube shows the bound is right: a face of \\([-1,1]^d\\) is chosen by deciding, for each coordinate, whether it is \\(-1\\), \\(+1\\) or free, so there are exactly \\(3^d\\) of them. The conjecture is proved in dimensions up to \\(4\\) (Sanyal, Werner and Ziegler, 2009) and for several special families of polytopes; from dimension \\(5\\) on it is open.',
		wayIn: 'Count the faces of the square (\\(4 + 4 + 1 = 9\\)), the regular hexagon, the cube and the octahedron, and check your counts against Euler’s formula \\(V - E + F = 2\\). Then look for a centrally symmetric solid with more than \\(27\\) faces in all.',
		chapter: 'topology/euler-characteristic',
		cite: ['kalai1989', 'sanyal-werner-ziegler2009']
	},
	{
		key: 'cycle-double-cover',
		name: 'The cycle double cover conjecture',
		kind: 'conjecture',
		posed: { by: 'George Szekeres and, independently, Paul Seymour', year: '1973–79' },
		statement: 'In every network of dots and lines with no bridge (a line whose removal would cut the network in two), one can choose a list of cycles that uses every line exactly twice.',
		status: 'proved',
		settled: {
			by: 'GPT-5.6 Sol Ultra, an AI model of OpenAI',
			year: 2026,
			how: 'In July 2026 OpenAI posted a three-page proof which, by its own statement, was found entirely by the model. Graph theorists checked it within days and found it correct, and it has been formalized in the Lean proof assistant; as of October 2026 it has not yet appeared in a journal. The proof turns a classical theorem about flows with values in \\((\\Z/2)^3\\) into a double cover by solving a system of linear equations over \\(\\Z/2\\): linear algebra of the kind in this chapter.'
		},
		known: 'Before 2026 it was known for networks that can be drawn in the plane, where the face boundaries do the job, and for networks that do not contain a subdivided Petersen graph (Alspach, Goddyn and Zhang, 1994); a smallest counterexample would have had to be a snark, a network with three lines at every dot whose lines cannot be coloured with three colours so that each dot sees all three. Stronger relatives, such as the conjecture that five cycles always suffice, are not settled by the new proof.',
		wayIn: 'Find a double cover of the Petersen graph by hand: it has ten dots and fifteen lines, cannot be drawn in the plane without crossings, and can be covered twice by six cycles of length five. Then read the three-page proof; everything in it is linear algebra over \\(\\Z/2\\).',
		chapter: 'homology/cycles-and-boundaries',
		cite: ['openai2026cdc', 'geelen2026', 'seymour1979']
	},
	{
		key: 'toral-rank',
		name: 'Halperin’s toral rank conjecture',
		kind: 'conjecture',
		posed: { by: 'Stephen Halperin', year: 1985 },
		statement: 'If an \\(r\\)-dimensional torus \\((S^1)^r\\) acts continuously on a finite cell complex \\(X\\) so that each point is left fixed by only finitely many of its elements, then the Betti numbers of \\(X\\) add up to at least \\(2^r\\): \\(\\sum_k b_k(X)\\ge2^r\\).',
		status: 'open',
		known: 'The bound would be the best possible: the torus acting on itself has exactly \\(2^r\\). The conjecture is known when \\(r\\le3\\), when \\(X\\) has dimension at most \\(7\\), and for important classes of spaces such as compact Kähler manifolds and homogeneous spaces; in general only bounds growing linearly in \\(r\\) are known, such as \\(\\sum_k b_k\\ge2r\\). A similar-sounding statement in commutative algebra, the total rank conjecture, was largely proved by Mark Walker in 2017, but it implies the toral rank conjecture only under extra hypotheses.',
		wayIn: 'A circle acts on the 3-sphere \\(S^3\\subset\\C^2\\) by \\((z, w)\\mapsto(e^{i\\theta}z, e^{i\\theta}w)\\) without fixing any point, and the Betti numbers of \\(S^3\\) add up to \\(2 = 2^1\\). Find an action of a 2-dimensional torus on \\(S^3\\times S^3\\), whose Betti numbers add up to \\(4\\), that fixes no point. The conjecture, which is proved for \\(r = 2\\), says that no such action exists on \\(S^3\\) itself.',
		chapter: 'homology/homology-groups',
		cite: ['halperin1985', 'walker2017', 'zoller2024']
	},
	{
		key: 'matrix-multiplication',
		name: 'The exponent of matrix multiplication',
		kind: 'problem',
		posed: { by: '', year: 1969 },
		statement: 'Can two \\(n\\times n\\) matrices be multiplied with roughly \\(n^{2+\\varepsilon}\\) arithmetic operations, for every \\(\\varepsilon\\gt0\\)? In other words, is the exponent \\(\\omega\\) of matrix multiplication equal to \\(2\\)?',
		status: 'open',
		known: 'The school method uses about \\(n^3\\) multiplications. In 1969 Volker Strassen multiplied \\(2\\times2\\) matrices with \\(7\\) multiplications instead of \\(8\\); applied recursively to blocks, this gives \\(\\omega\\le\\log_2 7\\approx2.807\\). A long series of improvements brought the bound below \\(2.3714\\) by 2024, and a team using Google DeepMind’s AlphaEvolve lowered it a little further in August 2026. In October 2026 OpenAI released manuscripts, written by an unreleased AI model and partly checked in the Lean proof assistant, claiming \\(\\omega\\le9/4\\) over the complex numbers; as of this writing the claim has not been independently confirmed. From below, nothing better than \\(\\omega\\ge2\\) is known.',
		wayIn: 'Find Strassen’s seven products for \\(2\\times2\\) matrices (or look them up and check them), and see why using them on blocks of a large matrix gives about \\(n^{2.807}\\) operations. Then notice that the record algorithms are useless in practice: their savings appear only for astronomically large matrices.',
		chapter: 'homology/computing',
		cite: ['strassen1969', 'alman2025', 'dupont2026', 'openai2026omega']
	},
	{
		key: 'inscribed-square',
		name: 'The inscribed square problem',
		kind: 'problem',
		posed: { by: 'Otto Toeplitz', year: 1911 },
		statement: 'Does every Jordan curve in the plane pass through the four corners of some square?',
		status: 'open',
		known: 'Yes for convex curves, for smooth curves and for many other well-behaved classes, by work going back to Arnold Emch (1913–16) and Lev Schnirelmann (1929). Terence Tao proved it in 2017 for curves made of two graphs of slope less than \\(1\\), and in 2020 Joshua Greene and Andrew Lobb proved that every smooth Jordan curve passes through the corners of rectangles of every shape, using the fact that a Klein bottle cannot be placed in 4-dimensional space in a certain symplectic way. For curves that are merely continuous, like the fractal curves of this section, the question is open.',
		wayIn: 'Draw a wiggly closed curve and hunt for a square: fix two points on the curve, complete them to a square, and move them until the other two corners land on the curve as well. For smooth curves, a counting argument shows that squares generically come in odd numbers, so there is always at least one; the trouble with rough curves is that, as smooth curves approximate them, the squares might shrink to a point.',
		chapter: 'homology/invariance',
		cite: ['matschke2014', 'tao2017', 'greene-lobb2021']
	},
	{
		key: 'navier-stokes',
		name: 'Navier–Stokes existence and smoothness',
		kind: 'problem',
		posed: { by: 'Jean Leray', year: 1934 },
		statement: 'Do the Navier–Stokes equations of an incompressible fluid in three dimensions always have smooth solutions that last for all time, starting from any smooth initial velocity? Or can the velocity become infinite at some point after a finite time?',
		status: 'claimed',
		settled: {
			by: 'OpenAI, with an unreleased AI model',
			year: 2026,
			how: 'On 8 September 2026 OpenAI announced a proof, checked in the Lean proof assistant, that a fluid initially at rest and pushed by a suitable smooth force can develop a singularity in finite time. That is one of the four alternatives in the Clay Mathematics Institute’s official statement of the problem. Charles Fefferman, who wrote that statement, said he was thrilled that the problem was solved, and credited the method of Diego Córdoba and Luis Martínez-Zoroa on which the construction builds. Others point out that the force must have special properties (it cannot be analytic, by work of Constantin, Ignatova and Vicol), and the Clay Institute still lists the problem as open.'
		},
		known: 'The question has been one of the seven Millennium Prize Problems of the Clay Mathematics Institute since 2000. In two dimensions smooth solutions last forever. In three, Leray proved in 1934 that weaker solutions always exist, and Caffarelli, Kohn and Nirenberg showed in 1982 that their singularities, if there are any, are rare. Whether a smooth flow can blow up with no driving force at all is still open.',
		wayIn: 'Write the velocity of the fluid as \\(\\mathbf u\\). Incompressibility says \\(\\operatorname{div}\\mathbf u = 0\\), which by the divergence theorem means that as much fluid flows into any ball as flows out. What can concentrate is the swirl, \\(\\operatorname{curl}\\mathbf u\\): in three dimensions a spinning tube of fluid can be stretched thinner and spin faster, which cannot happen in a flat, two-dimensional flow.',
		chapter: 'cohomology/differential-forms',
		cite: ['leray1934', 'fefferman2000', 'constantin-ignatova-vicol2026']
	},
	{
		key: 'eleven-eighths',
		name: 'The 11/8 conjecture',
		kind: 'conjecture',
		posed: { by: 'Yukio Matsumoto', year: 1982 },
		statement: 'Every closed smooth spin 4-manifold satisfies \\(b_2\\ge\\tfrac{11}{8}\\,\\lvert\\sigma\\rvert\\), where \\(b_2\\) is the second Betti number and \\(\\sigma\\) the signature of the intersection form. (For a simply connected manifold, spin means that \\(Q(x,x)\\) is even for every \\(x\\).)',
		status: 'open',
		known: 'The bound would be sharp: the K3 surface, the complex surface \\(x^4 + y^4 + z^4 + w^4 = 0\\) in \\(\\CP^3\\), has \\(b_2 = 22\\) and \\(\\sigma = -16\\), and \\(22 = \\tfrac{11}{8}\\cdot16\\). Donaldson’s theorem rules out definite forms. In 2001 Mikio Furuta proved \\(b_2\\ge\\tfrac{10}{8}\\lvert\\sigma\\rvert + 2\\) when \\(\\sigma\\ne0\\), using the Seiberg–Witten equations, and in 2022 Hopkins, Lin, Shi and Xu reached \\(\\tfrac{10}{8}\\lvert\\sigma\\rvert + 4\\) for simply connected manifolds other than \\(S^4\\), \\(S^2\\times S^2\\) and K3, showing also that this is as far as that method can go.',
		wayIn: 'Plot the pairs \\((\\lvert\\sigma\\rvert, b_2)\\) of the manifolds you know: \\(S^2\\times S^2\\) gives \\((0, 2)\\), K3 gives \\((16, 22)\\), and connected sums add both numbers. Which points can you reach from these two, and where do they lie relative to the line \\(b_2 = \\tfrac{11}{8}\\lvert\\sigma\\rvert\\)?',
		chapter: 'cohomology/poincare-duality',
		cite: ['matsumoto1982', 'furuta2001', 'hopkins-lin-shi-xu2022']
	},
	{
		key: 's6-complex',
		name: 'A complex structure on the 6-sphere',
		kind: 'problem',
		posed: { by: 'Heinz Hopf', year: 'the 1940s' },
		statement: 'Can the 6-sphere be given complex coordinates: is \\(S^6\\) a complex manifold of complex dimension \\(3\\)?',
		status: 'claimed',
		settled: {
			by: 'Levent Alpöge, working with the AI model Claude',
			year: 2026,
			how: 'On 23 August 2026 Alpöge, a mathematician at Anthropic, posted a 108-page manuscript, written with Claude, that builds a complex structure on \\(S^6\\) out of a family of complex 2-dimensional tori lying over a sphere, completed over three special points. Within weeks other geometers had used it to construct further complex structures on \\(S^6\\). As of October 2026 it has not been refereed.'
		},
		known: 'Using characteristic classes, Borel and Serre showed in 1953 that among all spheres only \\(S^2\\) and \\(S^6\\) admit even an almost complex structure, a rotation \\(J\\) of every tangent space with \\(J^2 = -1\\). The 2-sphere is a complex manifold, the Riemann sphere. The 6-sphere has an almost complex structure coming from the octonions, but it does not come from complex coordinates, and LeBrun showed in 1987 that no complex structure can fit the round shape of the sphere. Michael Atiyah announced a proof that none exists at all in 2016; it was not accepted, and the 2026 construction, if correct, shows the answer is yes.',
		wayIn: 'Give the 2-sphere complex coordinates: use stereographic projection from the north pole and from the south pole, and check that the change of coordinates between the two charts is \\(z\\mapsto1/z\\), which is complex-differentiable where both charts apply. The question was whether anything like this can be done for \\(S^6\\).',
		chapter: 'cohomology/characteristic-classes',
		cite: ['borel-serre1953', 'alpoge2026s6', 'viaclovsky2026']
	},
	{
		key: 'hopf-sign',
		name: 'Hopf’s sign conjecture',
		kind: 'conjecture',
		posed: { by: 'Heinz Hopf', year: 'the 1930s' },
		statement: 'If a closed manifold \\(M\\) of dimension \\(2n\\) has a metric whose curvature is negative in every direction (negative sectional curvature), then \\((-1)^n\\chi(M)\\gt0\\); if the curvature is only nonpositive, then \\((-1)^n\\chi(M)\\ge0\\).',
		status: 'open',
		known: 'For surfaces it follows at once from Gauss–Bonnet, and in dimension \\(4\\) from Chern’s version of it, whose integrand then has the right sign. It is known for several special classes, such as Kähler manifolds of negative curvature (Gromov, 1991), and open from dimension \\(6\\) on. Hopf also asked whether positive curvature forces \\(\\chi\\gt0\\), and whether \\(S^2\\times S^2\\) can be curved positively in every direction; in August 2026 Simon Brendle and Pei-Ken Hung posted a metric of positive curvature on \\(S^2\\times S^2\\), which experts are now checking.',
		wayIn: 'Check the surfaces: a round sphere (positive curvature, \\(\\chi = 2\\)), a flat torus (\\(\\chi = 0\\)) and a surface of genus \\(2\\) with negative curvature (\\(\\chi = -2\\)). In dimension \\(4\\), the product of two surfaces of genus \\(2\\) has nonpositive curvature; compute its Euler characteristic with \\(\\chi(M\\times N) = \\chi(M)\\,\\chi(N)\\) and compare with the prediction.',
		chapter: 'cohomology/characteristic-classes',
		cite: ['chern1944', 'brendle-hung2026']
	},
	{
		key: 'kervaire',
		name: 'The Kervaire invariant one problem',
		kind: 'problem',
		posed: { by: 'Michel Kervaire and William Browder', year: '1960–69' },
		statement: 'In which dimensions is there a closed framed manifold, a manifold with a consistent choice of directions at every point, whose Kervaire invariant is \\(1\\), so that it cannot be simplified by surgery into a sphere?',
		status: 'proved',
		settled: {
			by: 'Michael Hill, Michael Hopkins and Douglas Ravenel (2009), and Weinan Lin, Guozhen Wang and Zhouli Xu',
			year: 2024,
			how: 'Browder showed in 1969 that only the dimensions \\(2^{j+1} - 2\\), that is \\(2, 6, 14, 30, 62, 126, 254, \\ldots\\), are possible, and examples were known in dimensions \\(2, 6, 14, 30\\) and \\(62\\). In 2009 Hill, Hopkins and Ravenel showed with equivariant homotopy theory that there are none beyond \\(126\\). In 2024 Lin, Wang and Xu showed, with a large computer calculation of the Adams spectral sequence, that dimension \\(126\\) has one. The answer: exactly the dimensions \\(2, 6, 14, 30, 62\\) and \\(126\\).'
		},
		known: 'Framed manifolds, up to cobordism, are the same thing as the stable homotopy groups of spheres, so the problem is about which classes survive a spectral sequence to its last page. As of October 2026 the Lin–Wang–Xu paper is a preprint, widely accepted by experts.',
		chapter: 'big-picture/homological-algebra',
		cite: ['hill-hopkins-ravenel2016', 'lin-wang-xu2024']
	},
	{
		key: 'hodge',
		name: 'The Hodge conjecture',
		kind: 'conjecture',
		posed: { by: 'W. V. D. Hodge', year: 1950 },
		statement: 'On a smooth complex projective variety, every rational cohomology class of type \\((p,p)\\) is a rational combination of the classes of algebraic subvarieties.',
		status: 'open',
		known: 'It is one of the seven Millennium Prize Problems of the Clay Mathematics Institute. It holds for classes of degree \\(2\\), by the Lefschetz \\((1,1)\\) theorem of 1924, and hence for all varieties of dimension at most \\(3\\); with integer instead of rational coefficients it is false (Atiyah and Hirzebruch, 1962). In 2025 Eyal Markman proved it for abelian varieties of dimension \\(4\\), and in 2026 further cases were announced, some of them by AI systems, a few of which have since been withdrawn. The general conjecture is open.',
		wayIn: 'On a complex curve, every class of degree \\(2\\) is a multiple of the class of a point, and a point is an algebraic subvariety, so there is nothing to prove. The first real case is degree \\(2\\) on a surface, where Lefschetz’s theorem follows from the long exact sequence of \\(0\\to\\Z\\to\\mathcal O\\to\\mathcal O^*\\to0\\), a sequence of sheaves like those of Chapter 4.7.',
		chapter: 'big-picture/horizons',
		cite: ['hodge1950', 'deligne2000', 'markman2025']
	},
	{
		key: 'jones-unknot',
		name: 'The Jones unknot problem',
		kind: 'problem',
		posed: { by: '', year: 'the 1980s' },
		statement: 'Is there a knot other than the unknot whose Jones polynomial is \\(1\\)?',
		status: 'open',
		known: 'The question arose soon after Jones found his polynomial in 1984, and he put it on his list of ten problems for the twenty-first century in 2000. A computer search found no such knot among all knots with up to \\(24\\) crossings (Tuzun and Sikora, 2021), and none can be alternating, since the Jones polynomial of an alternating knot reveals its crossing number. For links the answer is yes: Thistlethwaite found links of several components with the same Jones polynomial as separate circles (2001). Stephen Bigelow tied the question to an open problem about matrices representing the braids on four strands.',
		wayIn: 'Compute brackets of small diagrams, by hand or with Figure 3.7.7; every knot you try will have a polynomial other than \\(1\\). Then think about categorification: Khovanov homology, whose Euler characteristic is the Jones polynomial, does detect the unknot, so a counterexample would have to hide its knottedness in cancellations between homology groups.',
		chapter: 'homology/knots',
		cite: ['jones2000', 'tuzun-sikora2021', 'thistlethwaite2001', 'kronheimer-mrowka2011']
	},
	{
		key: 'unknot-recognition',
		name: 'Recognising the unknot quickly',
		kind: 'problem',
		posed: { by: '', year: 1961 },
		statement: 'Is there an algorithm that decides whether a knot diagram with \\(n\\) crossings shows the unknot, in a number of steps bounded by a fixed power of \\(n\\)?',
		status: 'open',
		known: 'Wolfgang Haken gave the first algorithm in 1961, using surfaces inside the knot complement; it is extremely slow. Hass, Lagarias and Pippenger showed in 1999 that whenever a knot is the unknot there is a short certificate of it that a computer can check quickly, and Lackenby showed in 2021 that the same holds for certificates that a knot is knotted. He also proved that a diagram of the unknot can always be untangled with a number of Reidemeister moves bounded by a fixed power of \\(n\\) (2015). In 2021 he announced an algorithm that runs in quasi-polynomial time, roughly \\(n^{c\\log n}\\) steps; as of October 2026 it has been presented in talks but not yet published.',
		wayIn: 'Draw a tangled diagram of the unknot and try to simplify it using only moves that reduce the number of crossings. Some diagrams get stuck and must first become more complicated before they can be simplified, which is why “just try Reidemeister moves” is not obviously a fast algorithm.',
		chapter: 'homology/knots',
		cite: ['haken1961', 'hass-lagarias-pippenger1999', 'lackenby2015', 'lackenby2021']
	},
	{
		key: 'unknotting-additivity',
		name: 'Is unknotting number additive?',
		kind: 'conjecture',
		posed: { by: '', year: 1937 },
		statement: 'The unknotting number \\(u(K)\\) is the smallest number of crossings that must be switched, in some diagram, to untie \\(K\\). The conjecture: \\(u(K_1\\#K_2) = u(K_1) + u(K_2)\\) for all knots \\(K_1\\) and \\(K_2\\).',
		status: 'disproved',
		settled: {
			by: 'Mark Brittenham and Susan Hermiller',
			year: 2025,
			how: 'They showed that the connected sum of the knot \\(7_1\\) and its mirror image can be untied with at most \\(5\\) crossing changes, although each of the two knots needs \\(3\\). They found the example in computer experiments with the program SnapPy while studying a different question, and the paper appeared in the Annals of Mathematics in 2026.'
		},
		known: 'The question goes back to a 1937 paper of H. Wendt and stood on the standard lists of problems in low-dimensional topology. It is true when both knots have unknotting number \\(1\\), since such knots are prime (Scharlemann, 1985). After the counterexample, Brittenham and Hermiller found knots whose sums with the figure-eight knot and with the cinquefoil also need fewer changes than expected; whether the trefoil has such a partner is open.',
		wayIn: 'Lower bounds for unknotting numbers come from invariants that add up under connected sum, such as the signature, computed from a Seifert matrix. A knot and its mirror image have opposite signatures, which cancel in the sum, so the bounds go blind exactly for sums of mirror images. That is where the counterexample was hiding.',
		chapter: 'homology/knots',
		cite: ['wendt1937', 'brittenham-hermiller2026']
	}
];

export const problemByKey = new Map(problems.map((p) => [p.key, p]));

/** the label on the box: Conjecture, Open problem, Problem */
export function problemLabel(p: Problem): string {
	if (p.kind === 'conjecture') return 'Conjecture';
	return p.status === 'open' ? 'Open problem' : 'Problem';
}

/** the badge: "Open since 1742", "Proved in 2003", … */
export function statusText(p: Problem): string {
	switch (p.status) {
		case 'open':
			return `Open since ${p.posed.year}`;
		case 'proved':
			return p.kind === 'conjecture' ? `Proved in ${p.settled?.year}` : `Solved in ${p.settled?.year}`;
		case 'disproved':
			return `Disproved in ${p.settled?.year}`;
		case 'independent':
			return 'Neither provable nor disprovable';
		case 'claimed':
			return `Solution claimed in ${p.settled?.year}`;
	}
}

export const statusColor: Record<ProblemStatus, string> = {
	open: 'var(--rose)',
	proved: 'var(--green)',
	disproved: 'var(--amber)',
	independent: 'var(--blue)',
	claimed: 'var(--amber)'
};
