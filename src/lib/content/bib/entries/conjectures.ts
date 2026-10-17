import type { Work } from '../index';

// Sources for the conjecture boxes (src/lib/content/conjectures.ts) that no
// chapter cites otherwise.
export const works: Work[] = [
	{
		key: 'leray1934',
		authors: ['Jean Leray'],
		year: 1934,
		title: 'Sur le mouvement d’un liquide visqueux emplissant l’espace',
		venue: 'Acta Mathematica 63 (1934), 193–248',
		doi: '10.1007/BF02547354',
		kind: 'paper'
	},
	{
		key: 'hodge1950',
		authors: ['W. V. D. Hodge'],
		year: 1950,
		title: 'The topological invariants of algebraic varieties',
		venue: 'Proceedings of the International Congress of Mathematicians, Cambridge, Massachusetts, 1950, vol. 1, 182–192',
		kind: 'paper'
	},
	{
		key: 'borel-serre1953',
		authors: ['Armand Borel', 'Jean-Pierre Serre'],
		label: 'Borel & Serre',
		year: 1953,
		title: 'Groupes de Lie et puissances réduites de Steenrod',
		venue: 'American Journal of Mathematics 75 (1953), 409–448',
		doi: '10.2307/2372495',
		kind: 'paper'
	},
	{
		key: 'matsumoto1982',
		authors: ['Yukio Matsumoto'],
		year: 1982,
		title: 'On the bounding genus of homology 3-spheres',
		venue: 'Journal of the Faculty of Science, University of Tokyo, Section IA, Mathematics 29 (1982), 287–318',
		kind: 'paper'
	},
	{
		key: 'fefferman2000',
		authors: ['Charles L. Fefferman'],
		year: 2000,
		title: 'Existence and smoothness of the Navier–Stokes equation',
		venue: 'official problem description, Clay Mathematics Institute',
		url: 'https://www.claymath.org/millennium/navier-stokes-equation/',
		free: true,
		kind: 'web'
	},
	{
		key: 'deligne2000',
		authors: ['Pierre Deligne'],
		year: 2000,
		title: 'The Hodge conjecture',
		venue: 'official problem description, Clay Mathematics Institute',
		url: 'https://www.claymath.org/millennium/hodge-conjecture/',
		free: true,
		kind: 'web'
	},
	{
		key: 'furuta2001',
		authors: ['Mikio Furuta'],
		year: 2001,
		title: 'Monopole equation and the 11/8-conjecture',
		venue: 'Mathematical Research Letters 8 (2001), 279–291',
		doi: '10.4310/MRL.2001.v8.n3.a5',
		kind: 'paper'
	},
	{
		key: 'hill-hopkins-ravenel2016',
		authors: ['Michael A. Hill', 'Michael J. Hopkins', 'Douglas C. Ravenel'],
		label: 'Hill, Hopkins & Ravenel',
		year: 2016,
		title: 'On the nonexistence of elements of Kervaire invariant one',
		venue: 'Annals of Mathematics 184 (2016), 1–262',
		doi: '10.4007/annals.2016.184.1.1',
		kind: 'paper'
	},
	{
		key: 'hopkins-lin-shi-xu2022',
		authors: ['Michael J. Hopkins', 'Jianfeng Lin', 'XiaoLin Danny Shi', 'Zhouli Xu'],
		label: 'Hopkins, Lin, Shi & Xu',
		year: 2022,
		title: 'Intersection forms of spin 4-manifolds and the Pin(2)-equivariant Mahowald invariant',
		venue: 'Communications of the American Mathematical Society 2 (2022), 22–132',
		doi: '10.1090/cams/4',
		free: true,
		kind: 'paper'
	},
	{
		key: 'lin-wang-xu2024',
		authors: ['Weinan Lin', 'Guozhen Wang', 'Zhouli Xu'],
		label: 'Lin, Wang & Xu',
		year: 2024,
		title: 'On the last Kervaire invariant problem',
		venue: 'preprint',
		arxiv: '2412.10879',
		url: 'https://arxiv.org/abs/2412.10879',
		free: true,
		kind: 'paper'
	},
	{
		key: 'markman2025',
		authors: ['Eyal Markman'],
		year: 2025,
		title: 'Cycles on abelian 2n-folds of Weil type from secant sheaves on abelian n-folds',
		venue: 'preprint',
		arxiv: '2502.03415',
		url: 'https://arxiv.org/abs/2502.03415',
		free: true,
		kind: 'paper'
	},
	{
		key: 'alpoge2026s6',
		authors: ['Levent Alpöge'],
		year: 2026,
		title: 'The (3, 4, ∞) modular family of 2-tori, completed at its three special points, is a complex structure on S⁶',
		venue: 'manuscript, August 2026, written with the AI model Claude',
		url: 'https://alpo.ge/s6.pdf',
		free: true,
		kind: 'notes'
	},
	{
		key: 'brendle-hung2026',
		authors: ['Simon Brendle', 'Pei-Ken Hung'],
		label: 'Brendle & Hung',
		year: 2026,
		title: 'A metric on S² × S² with positive sectional curvature',
		venue: 'preprint',
		arxiv: '2608.19068',
		url: 'https://arxiv.org/abs/2608.19068',
		free: true,
		kind: 'paper'
	},
	{
		key: 'constantin-ignatova-vicol2026',
		authors: ['Peter Constantin', 'Mihaela Ignatova', 'Vlad Vicol'],
		label: 'Constantin, Ignatova & Vicol',
		year: 2026,
		title: 'Regularity of asymptotically axisymmetric solutions to the 3D Navier–Stokes equations with analytic forcing',
		venue: 'preprint',
		arxiv: '2609.20803',
		url: 'https://arxiv.org/abs/2609.20803',
		free: true,
		kind: 'paper'
	},
	{
		key: 'viaclovsky2026',
		authors: ['Jeff Viaclovsky'],
		year: 2026,
		title: 'A two-parameter family of complex structures on S⁶',
		venue: 'preprint',
		arxiv: '2609.33785',
		url: 'https://arxiv.org/abs/2609.33785',
		free: true,
		kind: 'paper'
	},
	{
		key: 'polya1954',
		authors: ['George Pólya'],
		year: 1954,
		title: 'Mathematics and Plausible Reasoning, Volume I: Induction and Analogy in Mathematics',
		venue: 'Princeton University Press',
		kind: 'book'
	},
	{
		key: 'strassen1969',
		authors: ['Volker Strassen'],
		year: 1969,
		title: 'Gaussian elimination is not optimal',
		venue: 'Numerische Mathematik 13 (1969), 354–356',
		doi: '10.1007/BF02165411',
		kind: 'paper'
	},
	{
		key: 'halperin1985',
		authors: ['Stephen Halperin'],
		year: 1985,
		title: 'Rational homotopy and torus actions',
		venue: 'in I. M. James (ed.), Aspects of Topology, London Mathematical Society Lecture Note Series 93, Cambridge University Press, 1985, 293–306',
		kind: 'paper'
	},
	{
		key: 'matschke2014',
		authors: ['Benjamin Matschke'],
		year: 2014,
		title: 'A survey on the square peg problem',
		venue: 'Notices of the American Mathematical Society 61 (2014), 346–352',
		doi: '10.1090/noti1100',
		free: true,
		kind: 'paper'
	},
	{
		key: 'tao2017',
		authors: ['Terence Tao'],
		year: 2017,
		title: 'An integration approach to the Toeplitz square peg problem',
		venue: 'Forum of Mathematics, Sigma 5 (2017), e30',
		doi: '10.1017/fms.2017.23',
		free: true,
		kind: 'paper'
	},
	{
		key: 'walker2017',
		authors: ['Mark E. Walker'],
		year: 2017,
		title: 'Total Betti numbers of modules of finite projective dimension',
		venue: 'Annals of Mathematics 186 (2017), 641–646',
		doi: '10.4007/annals.2017.186.2.6',
		kind: 'paper'
	},
	{
		key: 'greene-lobb2021',
		authors: ['Joshua Evan Greene', 'Andrew Lobb'],
		label: 'Greene & Lobb',
		year: 2021,
		title: 'The rectangular peg problem',
		venue: 'Annals of Mathematics 194 (2021), 509–517',
		doi: '10.4007/annals.2021.194.2.4',
		arxiv: '2005.09193',
		kind: 'paper'
	},
	{
		key: 'zoller2024',
		authors: ['Leopold Zoller'],
		year: 2024,
		title: 'The toral rank conjecture',
		venue: 'lecture notes for a mini-course, University of Copenhagen, June 2024',
		url: 'https://www.math.ku.dk/english/calendar/events/rank-conjectures/TRC_script.pdf',
		free: true,
		kind: 'notes'
	},
	{
		key: 'alman2025',
		authors: ['Josh Alman', 'Ran Duan', 'Virginia Vassilevska Williams', 'Yinzhan Xu', 'Zixuan Xu', 'Renfei Zhou'],
		label: 'Alman et al.',
		year: 2025,
		title: 'More asymmetry yields faster matrix multiplication',
		venue: 'Proceedings of the 2025 ACM–SIAM Symposium on Discrete Algorithms (SODA)',
		arxiv: '2404.16349',
		url: 'https://arxiv.org/abs/2404.16349',
		free: true,
		kind: 'paper'
	},
	{
		key: 'dupont2026',
		authors: ['Emilien Dupont', 'Marvin Eisenberger', 'Borislav Kozlovskii', 'Abbas Mehrabian', 'Francisco J. R. Ruiz', 'Abigail See', 'Renfei Zhou', 'Josh Alman', 'Virginia Vassilevska Williams', 'Matej Balog'],
		label: 'Dupont et al.',
		year: 2026,
		title: 'Improving the matrix multiplication exponent with modern optimization and AlphaEvolve',
		venue: 'preprint',
		arxiv: '2608.16884',
		url: 'https://arxiv.org/abs/2608.16884',
		free: true,
		kind: 'paper'
	},
	{
		key: 'openai2026omega',
		authors: ['OpenAI'],
		year: 2026,
		title: 'An upper bound of 9/4 for the matrix multiplication exponent',
		venue: 'manuscript produced by an AI model, in the repository github.com/openai/math (family 107), October 2026',
		url: 'https://github.com/openai/math',
		free: true,
		kind: 'notes'
	},
	{
		key: 'seymour1979',
		authors: ['Paul D. Seymour'],
		year: 1979,
		title: 'Sums of circuits',
		venue: 'in J. A. Bondy and U. S. R. Murty (eds.), Graph Theory and Related Topics, Academic Press, 1979, 341–355',
		kind: 'paper'
	},
	{
		key: 'openai2026cdc',
		authors: ['OpenAI'],
		year: 2026,
		title: 'A proof of the cycle double cover conjecture',
		venue: 'three-page note, July 2026; the proof is credited to the model GPT-5.6 Sol Ultra',
		url: 'https://cdn.openai.com/pdf/04d1d1e4-bc75-476a-97cf-49055cd98d31/cdc_proof.pdf',
		free: true,
		kind: 'notes'
	},
	{
		key: 'geelen2026',
		authors: ['Jim Geelen'],
		year: 2026,
		title: 'OpenAI’s proof of the Cycle Double Cover Theorem',
		venue: 'expository preprint',
		arxiv: '2607.15399',
		url: 'https://arxiv.org/abs/2607.15399',
		free: true,
		kind: 'paper'
	},
	{
		key: 'riemann1859',
		authors: ['Bernhard Riemann'],
		year: 1859,
		title: 'Ueber die Anzahl der Primzahlen unter einer gegebenen Grösse',
		venue: 'Monatsberichte der Königlichen Preussischen Akademie der Wissenschaften zu Berlin, November 1859, 671–680',
		kind: 'paper'
	},
	{
		key: 'haselgrove1958',
		authors: ['C. Brian Haselgrove'],
		year: 1958,
		title: 'A disproof of a conjecture of Pólya',
		venue: 'Mathematika 5 (1958), 141–145',
		doi: '10.1112/S0025579300001480',
		kind: 'paper'
	},
	{
		key: 'lander-parkin1966',
		authors: ['Leon J. Lander', 'Thomas R. Parkin'],
		label: 'Lander & Parkin',
		year: 1966,
		title: 'Counterexample to Euler’s conjecture on sums of like powers',
		venue: 'Bulletin of the American Mathematical Society 72 (1966), 1079',
		doi: '10.1090/S0002-9904-1966-11654-3',
		free: true,
		kind: 'paper'
	},
	{
		key: 'tanaka1980',
		authors: ['Minoru Tanaka'],
		year: 1980,
		title: 'A numerical investigation on cumulative sum of the Liouville function',
		venue: 'Tokyo Journal of Mathematics 3 (1980), 187–189',
		doi: '10.3836/tjm/1270216093',
		kind: 'paper'
	},
	{
		key: 'wiles1995',
		authors: ['Andrew Wiles'],
		year: 1995,
		title: 'Modular elliptic curves and Fermat’s Last Theorem',
		venue: 'Annals of Mathematics 141 (1995), 443–551',
		doi: '10.2307/2118559',
		kind: 'paper'
	},
	{
		key: 'taylor-wiles1995',
		authors: ['Richard Taylor', 'Andrew Wiles'],
		label: 'Taylor & Wiles',
		year: 1995,
		title: 'Ring-theoretic properties of certain Hecke algebras',
		venue: 'Annals of Mathematics 141 (1995), 553–572',
		doi: '10.2307/2118560',
		kind: 'paper'
	},
	{
		key: 'burnside1902',
		authors: ['William Burnside'],
		year: 1902,
		title: 'On an unsettled question in the theory of discontinuous groups',
		venue: 'Quarterly Journal of Pure and Applied Mathematics 33 (1902), 230–238',
		kind: 'paper'
	},
	{
		key: 'hadamard1893',
		authors: ['Jacques Hadamard'],
		year: 1893,
		title: 'Résolution d’une question relative aux déterminants',
		venue: 'Bulletin des Sciences Mathématiques 17 (1893), 240–246',
		kind: 'paper'
	},
	{
		key: 'paley1933',
		authors: ['Raymond E. A. C. Paley'],
		year: 1933,
		title: 'On orthogonal matrices',
		venue: 'Journal of Mathematics and Physics 12 (1933), 311–320',
		doi: '10.1002/sapm1933121311',
		kind: 'paper'
	},
	{
		key: 'godel1940',
		authors: ['Kurt Gödel'],
		year: 1940,
		title: 'The Consistency of the Axiom of Choice and of the Generalized Continuum-Hypothesis with the Axioms of Set Theory',
		venue: 'Annals of Mathematics Studies 3, Princeton University Press',
		kind: 'book'
	},
	{
		key: 'cohen1963',
		authors: ['Paul J. Cohen'],
		year: 1963,
		title: 'The independence of the continuum hypothesis',
		venue: 'Proceedings of the National Academy of Sciences 50 (1963), 1143–1148',
		doi: '10.1073/pnas.50.6.1143',
		free: true,
		kind: 'paper'
	},
	{
		key: 'andrews-curtis1965',
		authors: ['James J. Andrews', 'Morton L. Curtis'],
		label: 'Andrews & Curtis',
		year: 1965,
		title: 'Free groups and handlebodies',
		venue: 'Proceedings of the American Mathematical Society 16 (1965), 192–195',
		doi: '10.1090/S0002-9939-1965-0173241-8',
		free: true,
		kind: 'paper'
	},
	{
		key: 'shelah1974',
		authors: ['Saharon Shelah'],
		year: 1974,
		title: 'Infinite abelian groups, Whitehead problem and some constructions',
		venue: 'Israel Journal of Mathematics 18 (1974), 243–256',
		doi: '10.1007/BF02757281',
		kind: 'paper'
	},
	{
		key: 'havas-wall-wamsley1974',
		authors: ['George Havas', 'G. E. Wall', 'J. W. Wamsley'],
		label: 'Havas, Wall & Wamsley',
		year: 1974,
		title: 'The two generator restricted Burnside group of exponent five',
		venue: 'Bulletin of the Australian Mathematical Society 10 (1974), 459–470',
		doi: '10.1017/S0004972700041137',
		free: true,
		kind: 'paper'
	},
	{
		key: 'eklof1976',
		authors: ['Paul C. Eklof'],
		year: 1976,
		title: 'Whitehead’s problem is undecidable',
		venue: 'The American Mathematical Monthly 83 (1976), 775–788',
		doi: '10.1080/00029890.1976.11994250',
		kind: 'paper'
	},
	{
		key: 'halpern-weaver1977',
		authors: ['Benjamin Halpern', 'Charles Weaver'],
		label: 'Halpern & Weaver',
		year: 1977,
		title: 'Inverting a cylinder through isometric immersions and isometric embeddings',
		venue: 'Transactions of the American Mathematical Society 230 (1977), 41–70',
		doi: '10.1090/S0002-9947-1977-0474388-1',
		free: true,
		kind: 'paper'
	},
	{
		key: 'galewski-stern1980',
		authors: ['David E. Galewski', 'Ronald J. Stern'],
		label: 'Galewski & Stern',
		year: 1980,
		title: 'Classification of simplicial triangulations of topological manifolds',
		venue: 'Annals of Mathematics 111 (1980), 1–34',
		doi: '10.2307/1971215',
		kind: 'paper'
	},
	{
		key: 'akbulut-kirby1985',
		authors: ['Selman Akbulut', 'Robion Kirby'],
		label: 'Akbulut & Kirby',
		year: 1985,
		title: 'A potential smooth counterexample in dimension 4 to the Poincaré conjecture, the Schoenflies conjecture, and the Andrews–Curtis conjecture',
		venue: 'Topology 24 (1985), 375–390',
		doi: '10.1016/0040-9383(85)90010-2',
		kind: 'paper'
	},
	{
		key: 'kalai1989',
		authors: ['Gil Kalai'],
		year: 1989,
		title: 'The number of faces of centrally-symmetric polytopes',
		venue: 'Graphs and Combinatorics 5 (1989), 389–391',
		doi: '10.1007/BF01788696',
		kind: 'paper'
	},
	{
		key: 'morgan-tian2007',
		authors: ['John Morgan', 'Gang Tian'],
		label: 'Morgan & Tian',
		year: 2007,
		title: 'Ricci Flow and the Poincaré Conjecture',
		venue: 'Clay Mathematics Monographs 3, American Mathematical Society',
		arxiv: 'math/0607607',
		url: 'https://arxiv.org/abs/math/0607607',
		free: true,
		kind: 'book'
	},
	{
		key: 'sanyal-werner-ziegler2009',
		authors: ['Raman Sanyal', 'Axel Werner', 'Günter M. Ziegler'],
		label: 'Sanyal, Werner & Ziegler',
		year: 2009,
		title: 'On Kalai’s conjectures concerning centrally symmetric polytopes',
		venue: 'Discrete & Computational Geometry 41 (2009), 183–198',
		doi: '10.1007/s00454-008-9104-8',
		arxiv: '0708.3661',
		kind: 'paper'
	},
	{
		key: 'freedman-gompf-morrison-walker2010',
		authors: ['Michael Freedman', 'Robert Gompf', 'Scott Morrison', 'Kevin Walker'],
		label: 'Freedman, Gompf, Morrison & Walker',
		year: 2010,
		title: 'Man and machine thinking about the smooth 4-dimensional Poincaré conjecture',
		venue: 'Quantum Topology 1 (2010), 171–208',
		doi: '10.4171/QT/5',
		arxiv: '0906.5177',
		kind: 'paper'
	},
	{
		key: 'helfgott2013',
		authors: ['Harald A. Helfgott'],
		year: 2013,
		title: 'The ternary Goldbach conjecture is true',
		venue: 'preprint; a book-length version is to appear in Annals of Mathematics Studies',
		arxiv: '1312.7748',
		url: 'https://arxiv.org/abs/1312.7748',
		free: true,
		kind: 'paper'
	},
	{
		key: 'oliveira-e-silva2014',
		authors: ['Tomás Oliveira e Silva', 'Siegfried Herzog', 'Silvio Pardi'],
		label: 'Oliveira e Silva, Herzog & Pardi',
		year: 2014,
		title: 'Empirical verification of the even Goldbach conjecture and computation of prime gaps up to 4·10¹⁸',
		venue: 'Mathematics of Computation 83 (2014), 2033–2060',
		doi: '10.1090/S0025-5718-2013-02787-1',
		kind: 'paper'
	},
	{
		key: 'babai2016',
		authors: ['László Babai'],
		year: 2016,
		title: 'Graph isomorphism in quasipolynomial time',
		venue: 'Proceedings of the 48th Annual ACM Symposium on Theory of Computing (STOC 2016), 684–697',
		doi: '10.1145/2897518.2897542',
		arxiv: '1512.03547',
		url: 'https://arxiv.org/abs/1512.03547',
		free: true,
		kind: 'paper'
	},
	{
		key: 'helfgott2017',
		authors: ['Harald A. Helfgott'],
		year: 2017,
		title: 'Graph isomorphisms in quasi-polynomial time',
		venue: 'English version, with additions, of Séminaire Bourbaki exposé 1125',
		arxiv: '1710.04574',
		url: 'https://arxiv.org/abs/1710.04574',
		free: true,
		kind: 'notes'
	},
	{
		key: 'shehper2024',
		authors: ['Ali Shehper', 'Anibal M. Medina-Mardones', 'Lucas Fagan', 'Bartłomiej Lewandowski', 'Angus Gruen', 'Yang Qiu', 'Piotr Kucharski', 'Zhenghan Wang', 'Sergei Gukov'],
		label: 'Shehper et al.',
		year: 2024,
		title: 'What makes math problems hard for reinforcement learning: a case study',
		venue: 'preprint',
		arxiv: '2408.15332',
		url: 'https://arxiv.org/abs/2408.15332',
		free: true,
		kind: 'paper'
	},
	{
		key: 'oeis-a007299',
		authors: ['The OEIS Foundation'],
		label: 'OEIS',
		year: 2026,
		title: 'Sequence A007299: Hadamard matrices of order 4n',
		venue: 'The On-Line Encyclopedia of Integer Sequences, with links to the matrices of orders 668 to 1964 found in August 2026',
		url: 'https://oeis.org/A007299',
		free: true,
		kind: 'web'
	}
];
