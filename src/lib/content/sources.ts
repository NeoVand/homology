// The bibliography: what this book draws on, and where to go next.
import type { Reading } from '$lib/components/prose/FurtherReading.svelte';

export interface SourceGroup {
	title: string;
	intro: string;
	items: Reading[];
}

export const sources: SourceGroup[] = [
	{
		title: 'If you read only three more things',
		intro: 'Gentle, generous, and free — the best next steps after this book.',
		items: [
			{
				title: 'Algebraic Topology',
				author: 'Allen Hatcher (2002)',
				url: 'https://pi.math.cornell.edu/~hatcher/AT/AT.pdf',
				note: 'The standard modern textbook, free online. Chapter 2 (homology) and Chapter 3 (cohomology) open with exactly the graph-and-loop intuitions used here.',
				kind: 'book',
				free: true
			},
			{
				title: 'Hodge Laplacians on Graphs',
				author: 'Lek-Heng Lim (SIAM Review, 2020)',
				url: 'https://arxiv.org/abs/1507.05379',
				note: 'Cohomology and Hodge theory as pure linear algebra on graphs — readable with nothing more than matrices.',
				kind: 'paper',
				free: true
			},
			{
				title: 'Barcodes: the persistent topology of data',
				author: 'Robert Ghrist (Bull. AMS, 2008)',
				url: 'https://www.ams.org/journals/bull/2008-45-01/S0273-0979-07-01191-3/',
				note: 'Fifteen pages that explain why homology became a tool for data science. Beautifully written.',
				kind: 'paper',
				free: true
			}
		]
	},
	{
		title: 'Textbooks on homology and cohomology',
		intro: 'From the friendliest to the most complete.',
		items: [
			{
				title: 'Graphs, Surfaces and Homology',
				author: 'Peter Giblin (CUP, 3rd ed. 2010)',
				note: 'The gentlest real textbook: graphs, then surfaces, then homology, with a mod-2 chapter and hundreds of exercises.',
				kind: 'book'
			},
			{
				title: 'Elementary Applied Topology',
				author: 'Robert Ghrist (2014)',
				url: 'https://www2.math.upenn.edu/~ghrist/notes.html',
				note: 'A visual, application-first tour: homology, cohomology, sheaves and persistence, with hundreds of figures.',
				kind: 'book'
			},
			{
				title: 'Elements of Algebraic Topology',
				author: 'James Munkres (1984)',
				note: 'The careful classic for simplicial homology and its conventions.',
				kind: 'book'
			},
			{
				title: 'Differential Forms in Algebraic Topology',
				author: 'Raoul Bott & Loring Tu (Springer, 1982)',
				note: 'The gold standard for de Rham cohomology, Mayer–Vietoris, Čech cohomology and characteristic classes.',
				kind: 'book'
			},
			{
				title: 'Characteristic Classes',
				author: 'John Milnor & James Stasheff (Princeton, 1974)',
				note: 'The reference for Stiefel–Whitney, Euler and Chern classes.',
				kind: 'book'
			},
			{
				title: 'Homology, Cohomology, and Sheaf Cohomology',
				author: 'Jean Gallier & Jocelyn Quaintance',
				note: 'A long, careful set of notes that goes all the way to sheaf cohomology.',
				kind: 'notes'
			},
			{
				title: 'Mod Two Homology and Cohomology',
				author: 'Jean-Claude Hausmann (Springer Universitext)',
				note: 'Develops the whole theory with ℤ/2 coefficients — and argues convincingly that this is the best way to start.',
				kind: 'book'
			}
		]
	},
	{
		title: 'Foundations: proofs, algebra and linear algebra',
		intro: 'For the prerequisites taught in Parts 0 and I.',
		items: [
			{
				title: 'Book of Proof',
				author: 'Richard Hammack',
				url: 'https://richardhammack.github.io/BookOfProof/',
				note: 'Logic, sets, functions, relations and proof techniques, from zero. Free.',
				kind: 'book',
				free: true
			},
			{
				title: 'How to Read Mathematics',
				author: 'Shai Simonson & Fernando Gouvêa',
				url: 'https://mathcomm.org/writing/reading-mathematics/',
				note: 'A short guide to the slow, active way mathematics has to be read.',
				kind: 'web',
				free: true
			},
			{
				title: 'Abstract Algebra: Theory and Applications',
				author: 'Thomas Judson',
				url: 'http://abstract.ups.edu/',
				note: 'A complete, free algebra textbook: groups, cosets, quotients, homomorphisms.',
				kind: 'book',
				free: true
			},
			{
				title: 'Visual Group Theory and Group Explorer',
				author: 'Nathan Carter',
				url: 'https://nathancarter.github.io/group-explorer/',
				note: 'Groups through Cayley diagrams; the free web app lets you play with hundreds of groups.',
				kind: 'interactive',
				free: true
			},
			{
				title: 'Expository papers (“blurbs”)',
				author: 'Keith Conrad',
				url: 'https://kconrad.math.uconn.edu/blurbs/',
				note: 'Short, crystal-clear notes; “Quotient Groups” is the one to read with Chapter 1.4.',
				kind: 'notes',
				free: true
			},
			{
				title: 'Math3ma',
				author: 'Tai-Danae Bradley',
				url: 'https://www.math3ma.com',
				note: 'Warm, intuitive essays on quotient groups, the isomorphism theorems and category theory.',
				kind: 'web',
				free: true
			},
			{
				title: 'Essence of Linear Algebra',
				author: '3Blue1Brown (Grant Sanderson)',
				url: 'https://www.3blue1brown.com/topics/linear-algebra',
				note: 'Matrices as transformations of space, kernels, ranks and duality — animated.',
				kind: 'video',
				free: true
			},
			{
				title: 'Immersive Linear Algebra',
				author: 'J. Ström, K. Åström & T. Akenine-Möller',
				url: 'https://immersivemath.com/ila/',
				note: 'An interactive linear algebra book with live figures in every chapter.',
				kind: 'interactive',
				free: true
			},
			{
				title: 'Interactive Linear Algebra',
				author: 'Dan Margalit & Joseph Rabinoff',
				url: 'https://textbooks.math.gatech.edu/ila/',
				note: 'A free textbook with interactive demonstrations of row reduction, span and rank.',
				kind: 'book',
				free: true
			}
		]
	},
	{
		title: 'Topology, homotopy and manifolds',
		intro: 'For Part II.',
		items: [
			{
				title: 'Topology Without Tears',
				author: 'Sidney Morris',
				note: 'A free, patient introduction to point-set topology.',
				kind: 'book',
				free: true
			},
			{
				title: 'The Shape of Space, and Torus Games',
				author: 'Jeffrey Weeks',
				url: 'https://www.geometrygames.org/TorusGames/',
				note: 'Flat tori, Klein bottles and gluing diagrams made playable — the inspiration for several figures here.',
				kind: 'interactive',
				free: true
			},
			{
				title: 'Conway’s ZIP proof',
				author: 'George Francis & Jeffrey Weeks (Amer. Math. Monthly, 1999)',
				note: 'A short, beautiful proof of the classification of surfaces.',
				kind: 'paper'
			},
			{
				title: 'Euler’s Gem',
				author: 'David Richeson (Princeton, 2008)',
				note: 'The popular history of V − E + F, from Euler to modern topology.',
				kind: 'book'
			},
			{
				title: 'Proofs and Refutations',
				author: 'Imre Lakatos (1976)',
				note: 'A dialogue about Euler’s formula, its counterexamples, and how mathematics is really made.',
				kind: 'book'
			}
		]
	},
	{
		title: 'Differential forms and de Rham cohomology',
		intro: 'For Chapters 4.3–4.4.',
		items: [
			{
				title: 'A Geometric Approach to Differential Forms',
				author: 'David Bachman',
				url: 'https://arxiv.org/abs/math/0306194',
				note: 'Forms explained through pictures and geometry first, formulas second.',
				kind: 'book',
				free: true
			},
			{
				title: 'Discrete Differential Geometry: An Applied Introduction',
				author: 'Keenan Crane',
				url: 'https://www.cs.cmu.edu/~kmcrane/Projects/DDG/paper.pdf',
				note: 'Discrete forms as integrated values on meshes; the most practical bridge between cochains and forms.',
				kind: 'notes',
				free: true
			},
			{
				title: 'Differential forms and integration',
				author: 'Terence Tao',
				url: 'https://www.math.ucla.edu/~tao/preprints/forms.pdf',
				note: 'A short essay on what forms really are and why they are integrated.',
				kind: 'notes',
				free: true
			},
			{
				title: 'A Visual Introduction to Differential Forms and Calculus on Manifolds',
				author: 'Jon Pierre Fortney (Birkhäuser, 2018)',
				note: 'Hundreds of pictures; written for readers meeting forms for the first time.',
				kind: 'book'
			},
			{
				title: 'Visual Differential Geometry and Forms',
				author: 'Tristan Needham (Princeton, 2021)',
				note: 'A lavishly illustrated, geometric account of curvature and forms.',
				kind: 'book'
			},
			{
				title: 'Discrete Exterior Calculus',
				author: 'M. Desbrun, A. Hirani, M. Leok & J. Marsden',
				url: 'https://arxiv.org/abs/math/0508341',
				note: 'Cochains as discrete differential forms, with a discrete Hodge star.',
				kind: 'paper',
				free: true
			}
		]
	},
	{
		title: 'Cohomology in the wild',
		intro: 'Impossible figures, rankings, sheaves — cohomology as the measure of local-to-global failure.',
		items: [
			{
				title: 'The Topology of Impossible Spaces',
				author: 'Tony Phillips (AMS Feature Column, 2014)',
				url: 'https://www.ams.org/publicoutreach/feature-column/fc-2014-10',
				note: 'A clear walk-through of Penrose’s cohomological analysis of the impossible tribar.',
				kind: 'web',
				free: true
			},
			{
				title: 'Obstructions to Reality: Torsors & Visual Paradox',
				author: 'Robert Ghrist & Zoe Cooperband (2025)',
				url: 'https://arxiv.org/abs/2507.01226',
				note: 'A gallery of impossible staircases on many surfaces, analysed with cohomology.',
				kind: 'paper',
				free: true
			},
			{
				title: 'Impossible by Degrees: Cohomology & Bistable Visual Paradox',
				author: 'Lee Ghrist & Robert Ghrist (2026)',
				url: 'https://arxiv.org/abs/2602.09313',
				note: 'Gear rings, Necker cubes and tilings as ℤ/2 cohomology — with animations.',
				kind: 'paper',
				free: true
			},
			{
				title: 'Statistical ranking and combinatorial Hodge theory',
				author: 'X. Jiang, L.-H. Lim, Y. Yao & Y. Ye (2011)',
				url: 'https://arxiv.org/abs/0811.1067',
				note: 'HodgeRank: global rankings from pairwise comparisons, with cohomology measuring inconsistency.',
				kind: 'paper',
				free: true
			},
			{
				title: 'Cup product and intersections',
				author: 'Michael Hutchings',
				url: 'https://math.berkeley.edu/~hutching/teach/215b-2011/cup.pdf',
				note: 'Why the cup product counts intersections — “arguably the most important thing to know about cup product”.',
				kind: 'notes',
				free: true
			},
			{
				title: 'This Week’s Finds, Week 293',
				author: 'John Baez (2010)',
				url: 'https://math.ucr.edu/home/baez/week293.html',
				note: 'Electrical circuits as chains and cochains: currents, voltages and power.',
				kind: 'web',
				free: true
			},
			{
				title: 'Sheaves, Cosheaves and Applications',
				author: 'Justin Curry (2014)',
				url: 'https://arxiv.org/abs/1303.3255',
				note: 'Cellular sheaves made computable.',
				kind: 'paper',
				free: true
			},
			{
				title: 'Toward a Spectral Theory of Cellular Sheaves',
				author: 'Jakob Hansen & Robert Ghrist (2019)',
				url: 'https://arxiv.org/abs/1808.01513',
				note: 'Sheaf Laplacians and global sections — sheaves as an engineering tool.',
				kind: 'paper',
				free: true
			},
			{
				title: 'Sheaf Theory through Examples',
				author: 'Daniel Rosiak (MIT Press, 2022, open access)',
				url: 'https://direct.mit.edu/books/oa-monograph/5460/Sheaf-Theory-through-Examples',
				note: 'Sheaves taught entirely through examples: colourings, data, music, chess.',
				kind: 'book',
				free: true
			},
			{
				title: 'Contextuality, Cohomology and Paradox',
				author: 'S. Abramsky et al. (2015)',
				url: 'https://arxiv.org/abs/1502.03097',
				note: 'Cohomological obstructions in quantum contextuality and logical paradox.',
				kind: 'paper',
				free: true
			}
		]
	},
	{
		title: 'Persistent homology and data',
		intro: 'For Chapter 3.7 and beyond.',
		items: [
			{
				title: 'Topology and data',
				author: 'Gunnar Carlsson (Bull. AMS, 2009)',
				note: 'The manifesto of topological data analysis.',
				kind: 'paper'
			},
			{
				title: 'What is… persistent homology?',
				author: 'Shmuel Weinberger (Notices AMS, 2011)',
				note: 'Two pages of perfect intuition.',
				kind: 'paper'
			},
			{
				title: 'A roadmap for the computation of persistent homology',
				author: 'N. Otter, M. Porter, U. Tillmann, P. Grindrod & H. Harrington (2017)',
				url: 'https://arxiv.org/abs/1506.08903',
				note: 'The full pipeline, software, and a hands-on tutorial.',
				kind: 'paper',
				free: true
			},
			{
				title: 'An introduction to Topological Data Analysis',
				author: 'Frédéric Chazal & Bertrand Michel (2021)',
				url: 'https://arxiv.org/abs/1710.04019',
				note: 'Rips and Čech complexes, stability, and practice, for data scientists.',
				kind: 'paper',
				free: true
			},
			{
				title: 'Computational Topology: An Introduction',
				author: 'Herbert Edelsbrunner & John Harer (AMS, 2010)',
				note: 'Algorithms, the elder rule, persistence diagrams and stability.',
				kind: 'book'
			},
			{
				title: 'Persistent Cohomology and Circular Coordinates',
				author: 'V. de Silva, D. Morozov & M. Vejdemo-Johansson (2011)',
				url: 'https://arxiv.org/abs/0905.4887',
				note: 'Turning cohomology classes of data into angle-valued coordinates.',
				kind: 'paper',
				free: true
			},
			{
				title: 'Computing homology (and other posts)',
				author: 'Jeremy Kun, Math ∩ Programming',
				url: 'https://www.jeremykun.com/2013/04/10/computing-homology/',
				note: 'Homology computed in Python with row reduction — a programmer’s introduction.',
				kind: 'web',
				free: true
			}
		]
	},
	{
		title: 'Categories and homological algebra',
		intro: 'For Part V.',
		items: [
			{
				title: 'Basic Category Theory',
				author: 'Tom Leinster (CUP, 2014)',
				url: 'https://arxiv.org/abs/1612.09375',
				note: 'The clearest first course in category theory, free on the arXiv.',
				kind: 'book',
				free: true
			},
			{
				title: 'Category Theory in Context',
				author: 'Emily Riehl (Dover, 2016)',
				url: 'https://emilyriehl.github.io/files/context.pdf',
				note: 'A rich second course, with examples from all over mathematics.',
				kind: 'book',
				free: true
			},
			{
				title: 'Seven Sketches in Compositionality',
				author: 'Brendan Fong & David Spivak',
				url: 'https://arxiv.org/abs/1803.05316',
				note: 'Applied category theory through databases, circuits and signal flow.',
				kind: 'book',
				free: true
			},
			{
				title: 'Physics, Topology, Logic and Computation: A Rosetta Stone',
				author: 'John Baez & Mike Stay',
				url: 'https://arxiv.org/abs/0903.0340',
				note: 'How the same categorical patterns appear across four fields.',
				kind: 'paper',
				free: true
			},
			{
				title: 'Category Theory for Programmers',
				author: 'Bartosz Milewski',
				url: 'https://github.com/hmemcpy/milewski-ctfp-pdf',
				note: 'Categories and functors explained to people who write code.',
				kind: 'book',
				free: true
			},
			{
				title: 'History of Homological Algebra',
				author: 'Charles Weibel',
				url: 'https://metaphor.ethz.ch/x/2025/hs/401-3132-00L/ex/historyweibel.pdf',
				note: 'Who did what, and when: de Rham, Čech, Whitney, Leray, Cartan, Eilenberg, Grothendieck.',
				kind: 'paper',
				free: true
			}
		]
	},
	{
		title: 'Lectures to watch',
		intro: 'Recommended lecture series and explainers (listed from their course pages and descriptions).',
		items: [
			{
				title: 'Algebraic Topology (lecture series)',
				author: 'N. J. Wildberger',
				url: 'https://www.youtube.com/playlist?list=PL41FDABC6AA085E78',
				note: 'Example-first lectures at a beginner’s pace, including an introduction to homology.',
				kind: 'video',
				free: true
			},
			{
				title: 'Topology & Geometry',
				author: 'Tadashi Tokieda (AIMS)',
				url: 'https://www.youtube.com/playlist?list=PLTBqohhFNBE_09L0i-lf3fYXF5woAbrzJ',
				note: 'Delightful, intuition-first lectures on the Euler characteristic and beyond.',
				kind: 'video',
				free: true
			},
			{
				title: 'Discrete Differential Geometry (lectures)',
				author: 'Keenan Crane',
				url: 'https://brickisland.net/DDGSpring2021/',
				note: 'Polished visual lectures on exterior calculus, discrete forms and Hodge decomposition.',
				kind: 'video',
				free: true
			},
			{
				title: 'Introduction to Persistent Homology',
				author: 'Matthew Wright',
				url: 'https://www.youtube.com/watch?v=2PSqWBIrn90',
				note: 'A short animated introduction: the growing complex and its barcode side by side.',
				kind: 'video',
				free: true
			},
			{
				title: 'Euler’s Formula and Graph Duality',
				author: '3Blue1Brown',
				url: 'https://www.3blue1brown.com/lessons/eulers-characteristic-formula',
				note: 'A spanning-tree proof of V − E + F = 2 that quietly previews homology.',
				kind: 'video',
				free: true
			},
			{
				title: 'Algebraic Topology I',
				author: 'Pierre Albin (UIUC)',
				url: 'https://www.youtube.com/playlist?list=PLjuyMEhIbRmBixjg0ZeRvWBQx_KMGC5Tv',
				note: 'A rigorous graduate course following Hatcher.',
				kind: 'video',
				free: true
			}
		]
	},
	{
		title: 'History',
		intro: 'How the ideas came to be.',
		items: [
			{
				title: 'Papers on Topology: Analysis Situs and Its Five Supplements',
				author: 'Henri Poincaré, translated by John Stillwell (AMS/LMS, 2010)',
				note: 'Where homology began, in 1895 — and where the word “torsion” comes from.',
				kind: 'book'
			},
			{
				title: 'Emmy Noether and Topology',
				author: 'Friedrich Hirzebruch (1996 lecture)',
				url: 'https://hirzebruch.mpim-bonn.mpg.de/98/6/preprint_1997_34.pdf',
				note: 'How Noether turned Betti numbers into groups, mostly in conversation.',
				kind: 'paper',
				free: true
			},
			{
				title: 'In Search of Shadows: the First Topological Conference, Moscow 1935',
				author: 'D. Apushkinskaya, A. Nazarov & G. Sinkevich',
				url: 'https://arxiv.org/abs/1903.02065',
				note: 'The conference where cohomology and the cup product appeared.',
				kind: 'paper',
				free: true
			}
		]
	},
	{
		title: 'On explaining mathematics',
		intro: 'The craft this book tries to practise.',
		items: [
			{
				title: 'On proof and progress in mathematics',
				author: 'William Thurston (1994)',
				url: 'https://arxiv.org/abs/math/9404236',
				note: 'What understanding mathematics really means — and how it is shared.',
				kind: 'paper',
				free: true
			},
			{
				title: 'Research Debt',
				author: 'Chris Olah & Shan Carter (Distill, 2017)',
				url: 'https://distill.pub/2017/research-debt/',
				note: 'Why good explanations are research, and who pays when they are missing.',
				kind: 'web',
				free: true
			},
			{
				title: 'Explorable Explanations',
				author: 'Bret Victor (2011)',
				url: 'http://worrydream.com/ExplorableExplanations/',
				note: 'The manifesto for reactive documents that let readers play with ideas.',
				kind: 'web',
				free: true
			},
			{
				title: 'Bartosz Ciechanowski’s articles',
				author: 'Bartosz Ciechanowski',
				url: 'https://ciechanow.ski/',
				note: 'The high-water mark of interactive explanation on the web.',
				kind: 'interactive',
				free: true
			}
		]
	}
];
