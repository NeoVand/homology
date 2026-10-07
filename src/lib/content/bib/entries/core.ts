// Works cited across the book. Each DOI here was checked against Crossref and
// each url opened; add chapter-specific works in a file of their own.
import type { Work } from '../index';

export const works: Work[] = [
	// ── textbooks ──────────────────────────────────────────────────────────
	{
		key: 'hatcher2002',
		authors: ['Allen Hatcher'],
		year: 2002,
		title: 'Algebraic Topology',
		venue: 'Cambridge University Press',
		url: 'https://pi.math.cornell.edu/~hatcher/AT/ATpage.html',
		free: true,
		kind: 'book'
	},
	{
		key: 'munkres1984',
		authors: ['James R. Munkres'],
		year: 1984,
		title: 'Elements of Algebraic Topology',
		venue: 'Addison-Wesley (reprinted by CRC Press, 2018)',
		doi: '10.1201/9780429493911',
		kind: 'book'
	},
	{
		key: 'armstrong1983',
		authors: ['M. A. Armstrong'],
		year: 1983,
		title: 'Basic Topology',
		venue: 'Springer, Undergraduate Texts in Mathematics',
		doi: '10.1007/978-1-4757-1793-8',
		kind: 'book'
	},
	{
		key: 'massey1991',
		authors: ['William S. Massey'],
		year: 1991,
		title: 'A Basic Course in Algebraic Topology',
		venue: 'Springer, Graduate Texts in Mathematics 127',
		doi: '10.1007/978-1-4939-9063-4',
		kind: 'book'
	},
	{
		key: 'edelsbrunnerharer2010',
		authors: ['Herbert Edelsbrunner', 'John L. Harer'],
		year: 2010,
		title: 'Computational Topology: An Introduction',
		venue: 'American Mathematical Society',
		doi: '10.1090/mbk/069',
		kind: 'book'
	},
	{
		key: 'ghrist2014',
		authors: ['Robert Ghrist'],
		year: 2014,
		title: 'Elementary Applied Topology',
		venue: 'Createspace',
		url: 'https://www2.math.upenn.edu/~ghrist/notes.html',
		free: true,
		kind: 'book'
	},
	{
		key: 'bott-tu1982',
		authors: ['Raoul Bott', 'Loring W. Tu'],
		year: 1982,
		title: 'Differential Forms in Algebraic Topology',
		venue: 'Springer, Graduate Texts in Mathematics 82',
		doi: '10.1007/978-1-4757-3951-0',
		kind: 'book'
	},
	{
		key: 'tu2011',
		authors: ['Loring W. Tu'],
		year: 2011,
		title: 'An Introduction to Manifolds (2nd edition)',
		venue: 'Springer, Universitext',
		doi: '10.1007/978-1-4419-7400-6',
		kind: 'book'
	},
	{
		key: 'lee2013',
		authors: ['John M. Lee'],
		year: 2013,
		title: 'Introduction to Smooth Manifolds (2nd edition)',
		venue: 'Springer, Graduate Texts in Mathematics 218',
		doi: '10.1007/978-1-4419-9982-5',
		kind: 'book'
	},
	{
		key: 'spivak1965',
		authors: ['Michael Spivak'],
		year: 1965,
		title: 'Calculus on Manifolds',
		venue: 'W. A. Benjamin (reprinted by CRC Press, 2018)',
		doi: '10.1201/9780429501906',
		kind: 'book'
	},
	{
		key: 'milnor-stasheff1974',
		authors: ['John W. Milnor', 'James D. Stasheff'],
		year: 1974,
		title: 'Characteristic Classes',
		venue: 'Princeton University Press, Annals of Mathematics Studies 76',
		doi: '10.1515/9781400881826',
		kind: 'book'
	},
	{
		key: 'frankel2011',
		authors: ['Theodore Frankel'],
		year: 2011,
		title: 'The Geometry of Physics (3rd edition)',
		venue: 'Cambridge University Press',
		doi: '10.1017/CBO9781139061377',
		kind: 'book'
	},
	{
		key: 'nakahara2003',
		authors: ['Mikio Nakahara'],
		year: 2003,
		title: 'Geometry, Topology and Physics (2nd edition)',
		venue: 'Institute of Physics Publishing (reprinted by CRC Press, 2018)',
		doi: '10.1201/9781315275826',
		kind: 'book'
	},
	{
		key: 'maclane1971',
		authors: ['Saunders Mac Lane'],
		label: 'Mac Lane',
		year: 1971,
		title: 'Categories for the Working Mathematician',
		venue: 'Springer, Graduate Texts in Mathematics 5 (2nd edition 1998)',
		doi: '10.1007/978-1-4757-4721-8',
		kind: 'book'
	},
	{
		key: 'leinster2014',
		authors: ['Tom Leinster'],
		year: 2014,
		title: 'Basic Category Theory',
		venue: 'Cambridge University Press',
		arxiv: '1612.09375',
		url: 'https://arxiv.org/abs/1612.09375',
		free: true,
		kind: 'book'
	},
	{
		key: 'riehl2016',
		authors: ['Emily Riehl'],
		year: 2016,
		title: 'Category Theory in Context',
		venue: 'Dover',
		url: 'https://emilyriehl.github.io/files/context.pdf',
		free: true,
		kind: 'book'
	},
	{
		key: 'weibel1994',
		authors: ['Charles A. Weibel'],
		year: 1994,
		title: 'An Introduction to Homological Algebra',
		venue: 'Cambridge University Press',
		doi: '10.1017/CBO9781139644136',
		kind: 'book'
	},
	{
		key: 'eilenberg-steenrod1952',
		authors: ['Samuel Eilenberg', 'Norman Steenrod'],
		year: 1952,
		title: 'Foundations of Algebraic Topology',
		venue: 'Princeton University Press',
		doi: '10.1515/9781400877492',
		kind: 'book'
	},
	{
		key: 'axler2024',
		authors: ['Sheldon Axler'],
		year: 2024,
		title: 'Linear Algebra Done Right (4th edition)',
		venue: 'Springer, Undergraduate Texts in Mathematics (open access)',
		url: 'https://linear.axler.net',
		doi: '10.1007/978-3-031-41026-0',
		free: true,
		kind: 'book'
	},
	{
		key: 'hammack2018',
		authors: ['Richard Hammack'],
		year: 2018,
		title: 'Book of Proof (3rd edition)',
		venue: 'self-published',
		url: 'https://richardhammack.github.io/BookOfProof/',
		free: true,
		kind: 'book'
	},

	// ── history ────────────────────────────────────────────────────────────
	{
		key: 'euler1758',
		authors: ['Leonhard Euler'],
		year: 1758,
		title: 'Elementa doctrinae solidorum',
		venue: 'Novi Commentarii academiae scientiarum Petropolitanae 4, 109–140 (Euler Archive E230)',
		url: 'https://scholarlycommons.pacific.edu/euler-works/230/',
		free: true,
		kind: 'paper'
	},
	{
		key: 'euler1741',
		authors: ['Leonhard Euler'],
		year: 1741,
		title: 'Solutio problematis ad geometriam situs pertinentis',
		venue: 'Commentarii academiae scientiarum Petropolitanae 8, 128–140 (Euler Archive E53)',
		url: 'https://scholarlycommons.pacific.edu/euler-works/53/',
		free: true,
		kind: 'paper'
	},
	{
		key: 'riemann1857',
		authors: ['Bernhard Riemann'],
		year: 1857,
		title: 'Theorie der Abel’schen Functionen',
		venue: 'Journal für die reine und angewandte Mathematik 54, 115–155',
		doi: '10.1515/crll.1857.54.115',
		kind: 'paper'
	},
	{
		key: 'betti1870',
		authors: ['Enrico Betti'],
		year: 1870,
		title: 'Sopra gli spazi di un numero qualunque di dimensioni',
		venue: 'Annali di Matematica Pura ed Applicata 4, 140–158',
		doi: '10.1007/BF02420029',
		kind: 'paper'
	},
	{
		key: 'poincare1895',
		authors: ['Henri Poincaré'],
		year: 1895,
		title: 'Analysis situs',
		venue:
			'Journal de l’École Polytechnique, 2e série, cahier 1; English translation by John Stillwell in Papers on Topology (AMS, 2010)',
		doi: '10.1090/hmath/037',
		kind: 'paper'
	},
	{
		key: 'smith1861',
		authors: ['Henry John Stephen Smith'],
		year: 1861,
		title: 'On systems of linear indeterminate equations and congruences',
		venue: 'Philosophical Transactions of the Royal Society of London 151, 293–326',
		doi: '10.1098/rstl.1861.0016',
		kind: 'paper'
	},
	{
		key: 'brouwer1911',
		authors: ['L. E. J. Brouwer'],
		year: 1911,
		title: 'Über Abbildung von Mannigfaltigkeiten',
		venue: 'Mathematische Annalen 71, 97–115',
		doi: '10.1007/BF01456931',
		kind: 'paper'
	},
	{
		key: 'vietoris1927',
		authors: ['Leopold Vietoris'],
		year: 1927,
		title: 'Über den höheren Zusammenhang kompakter Räume und eine Klasse von zusammenhangstreuen Abbildungen',
		venue: 'Mathematische Annalen 97, 454–472',
		doi: '10.1007/BF01447877',
		kind: 'paper'
	},
	{
		key: 'mayer1929',
		authors: ['Walther Mayer'],
		year: 1929,
		title: 'Über abstrakte Topologie',
		venue: 'Monatshefte für Mathematik und Physik 36, 1–42',
		doi: '10.1007/BF02307601',
		kind: 'paper'
	},
	{
		key: 'vietoris1930',
		authors: ['Leopold Vietoris'],
		year: 1930,
		title: 'Über die Homologiegruppen der Vereinigung zweier Komplexe',
		venue: 'Monatshefte für Mathematik und Physik 37, 159–162',
		doi: '10.1007/BF01696765',
		kind: 'paper'
	},
	{
		key: 'hopf1931',
		authors: ['Heinz Hopf'],
		year: 1931,
		title: 'Über die Abbildungen der dreidimensionalen Sphäre auf die Kugelfläche',
		venue: 'Mathematische Annalen 104, 637–665',
		doi: '10.1007/BF01457962',
		kind: 'paper'
	},
	{
		key: 'chern1944',
		authors: ['Shiing-Shen Chern'],
		year: 1944,
		title: 'A simple intrinsic proof of the Gauss–Bonnet formula for closed Riemannian manifolds',
		venue: 'Annals of Mathematics 45(4), 747–752',
		doi: '10.2307/1969302',
		kind: 'paper'
	},
	{
		key: 'eilenberg-maclane1945',
		authors: ['Samuel Eilenberg', 'Saunders Mac Lane'],
		label: 'Eilenberg & Mac Lane',
		year: 1945,
		title: 'General theory of natural equivalences',
		venue: 'Transactions of the American Mathematical Society 58, 231–294',
		doi: '10.1090/S0002-9947-1945-0013131-6',
		kind: 'paper'
	},
	{
		key: 'katz1979',
		authors: ['Victor J. Katz'],
		year: 1979,
		title: 'The history of Stokes’ theorem',
		venue: 'Mathematics Magazine 52(3), 146–156',
		doi: '10.1080/0025570X.1979.11976770',
		kind: 'paper'
	},
	{
		key: 'lakatos1976',
		authors: ['Imre Lakatos'],
		year: 1976,
		title: 'Proofs and Refutations: The Logic of Mathematical Discovery',
		venue: 'Cambridge University Press (edited by John Worrall and Elie Zahar)',
		doi: '10.1017/CBO9781139171472',
		kind: 'book'
	},
	{
		key: 'richeson2008',
		authors: ['David S. Richeson'],
		year: 2008,
		title: 'Euler’s Gem: The Polyhedron Formula and the Birth of Topology',
		venue: 'Princeton University Press',
		doi: '10.1515/9781400838561',
		kind: 'book'
	},
	{
		key: 'dieudonne1989',
		authors: ['Jean Dieudonné'],
		year: 1989,
		title: 'A History of Algebraic and Differential Topology, 1900–1960',
		venue: 'Birkhäuser',
		doi: '10.1007/978-0-8176-4907-4',
		kind: 'book'
	},
	{
		key: 'weibel1999',
		authors: ['Charles A. Weibel'],
		year: 1999,
		title: 'History of homological algebra',
		venue: 'in I. M. James (ed.), History of Topology, Elsevier, 797–836',
		kind: 'paper'
	},
	{
		key: 'thurston1994',
		authors: ['William P. Thurston'],
		year: 1994,
		title: 'On proof and progress in mathematics',
		venue: 'Bulletin of the American Mathematical Society 30(2), 161–177',
		doi: '10.1090/S0273-0979-1994-00502-6',
		arxiv: 'math/9404236',
		free: true,
		kind: 'paper'
	},

	// ── applications and modern work ───────────────────────────────────────
	{
		key: 'ghrist2008',
		authors: ['Robert Ghrist'],
		year: 2008,
		title: 'Barcodes: the persistent topology of data',
		venue: 'Bulletin of the American Mathematical Society 45(1), 61–75',
		doi: '10.1090/S0273-0979-07-01191-3',
		free: true,
		kind: 'paper'
	},
	{
		key: 'carlsson2009',
		authors: ['Gunnar Carlsson'],
		year: 2009,
		title: 'Topology and data',
		venue: 'Bulletin of the American Mathematical Society 46(2), 255–308',
		doi: '10.1090/S0273-0979-09-01249-X',
		free: true,
		kind: 'paper'
	},
	{
		key: 'elz2002',
		authors: ['Herbert Edelsbrunner', 'David Letscher', 'Afra Zomorodian'],
		year: 2002,
		title: 'Topological persistence and simplification',
		venue: 'Discrete & Computational Geometry 28, 511–533',
		doi: '10.1007/s00454-002-2885-2',
		kind: 'paper'
	},
	{
		key: 'zomorodian-carlsson2005',
		authors: ['Afra Zomorodian', 'Gunnar Carlsson'],
		year: 2005,
		title: 'Computing persistent homology',
		venue: 'Discrete & Computational Geometry 33, 249–274',
		doi: '10.1007/s00454-004-1146-y',
		kind: 'paper'
	},
	{
		key: 'ceh2007',
		authors: ['David Cohen-Steiner', 'Herbert Edelsbrunner', 'John Harer'],
		year: 2007,
		title: 'Stability of persistence diagrams',
		venue: 'Discrete & Computational Geometry 37, 103–120',
		doi: '10.1007/s00454-006-1276-5',
		kind: 'paper'
	},
	{
		key: 'bauer2021',
		authors: ['Ulrich Bauer'],
		year: 2021,
		title: 'Ripser: efficient computation of Vietoris–Rips persistence barcodes',
		venue: 'Journal of Applied and Computational Topology 5, 391–423',
		doi: '10.1007/s41468-021-00071-5',
		arxiv: '1908.02518',
		free: true,
		kind: 'paper'
	},
	{
		key: 'otter2017',
		authors: ['Nina Otter', 'Mason A. Porter', 'Ulrike Tillmann', 'Peter Grindrod', 'Heather A. Harrington'],
		year: 2017,
		title: 'A roadmap for the computation of persistent homology',
		venue: 'EPJ Data Science 6, 17',
		doi: '10.1140/epjds/s13688-017-0109-5',
		free: true,
		kind: 'paper'
	},
	{
		key: 'desilva-ghrist2007',
		authors: ['Vin de Silva', 'Robert Ghrist'],
		label: 'de Silva & Ghrist',
		year: 2007,
		title: 'Coverage in sensor networks via persistent homology',
		venue: 'Algebraic & Geometric Topology 7, 339–358',
		doi: '10.2140/agt.2007.7.339',
		free: true,
		kind: 'paper'
	},
	{
		key: 'desilva2011',
		authors: ['Vin de Silva', 'Dmitriy Morozov', 'Mikael Vejdemo-Johansson'],
		label: 'de Silva et al.',
		year: 2011,
		title: 'Persistent cohomology and circular coordinates',
		venue: 'Discrete & Computational Geometry 45, 737–759',
		doi: '10.1007/s00454-011-9344-x',
		kind: 'paper'
	},
	{
		key: 'lim2020',
		authors: ['Lek-Heng Lim'],
		year: 2020,
		title: 'Hodge Laplacians on graphs',
		venue: 'SIAM Review 62(3), 685–715',
		doi: '10.1137/18M1223101',
		arxiv: '1507.05379',
		free: true,
		kind: 'paper'
	},
	{
		key: 'jiang2011',
		authors: ['Xiaoye Jiang', 'Lek-Heng Lim', 'Yuan Yao', 'Yinyu Ye'],
		year: 2011,
		title: 'Statistical ranking and combinatorial Hodge theory',
		venue: 'Mathematical Programming 127, 203–244',
		doi: '10.1007/s10107-010-0419-x',
		kind: 'paper'
	},
	{
		key: 'penrose1958',
		authors: ['Lionel S. Penrose', 'Roger Penrose'],
		year: 1958,
		title: 'Impossible objects: a special type of visual illusion',
		venue: 'British Journal of Psychology 49(1), 31–33',
		doi: '10.1111/j.2044-8295.1958.tb00634.x',
		kind: 'paper'
	},
	{
		key: 'penrose1992',
		authors: ['Roger Penrose'],
		year: 1992,
		title: 'On the cohomology of impossible figures',
		venue: 'Leonardo 25(3/4), 245–247',
		doi: '10.2307/1575844',
		kind: 'paper'
	},
	{
		key: 'khovanov2000',
		authors: ['Mikhail Khovanov'],
		year: 2000,
		title: 'A categorification of the Jones polynomial',
		venue: 'Duke Mathematical Journal 101(3), 359–426',
		doi: '10.1215/S0012-7094-00-10131-7',
		arxiv: 'math/9908171',
		kind: 'paper'
	},
	{
		key: 'dirac1931',
		authors: ['Paul A. M. Dirac'],
		year: 1931,
		title: 'Quantised singularities in the electromagnetic field',
		venue: 'Proceedings of the Royal Society of London A 133, 60–72',
		doi: '10.1098/rspa.1931.0130',
		kind: 'paper'
	},
	{
		key: 'aharonov-bohm1959',
		authors: ['Yakir Aharonov', 'David Bohm'],
		year: 1959,
		title: 'Significance of electromagnetic potentials in the quantum theory',
		venue: 'Physical Review 115, 485–491',
		doi: '10.1103/PhysRev.115.485',
		kind: 'paper'
	},
	{
		key: 'wu-yang1975',
		authors: ['Tai Tsun Wu', 'Chen Ning Yang'],
		year: 1975,
		title: 'Concept of nonintegrable phase factors and global formulation of gauge fields',
		venue: 'Physical Review D 12, 3845–3857',
		doi: '10.1103/PhysRevD.12.3845',
		kind: 'paper'
	},
	{
		key: 'tknn1982',
		authors: ['David J. Thouless', 'Mahito Kohmoto', 'M. Peter Nightingale', 'Marcel den Nijs'],
		year: 1982,
		title: 'Quantized Hall conductance in a two-dimensional periodic potential',
		venue: 'Physical Review Letters 49, 405–408',
		doi: '10.1103/PhysRevLett.49.405',
		kind: 'paper'
	},
	{
		key: 'simon1983',
		authors: ['Barry Simon'],
		year: 1983,
		title: 'Holonomy, the quantum adiabatic theorem, and Berry’s phase',
		venue: 'Physical Review Letters 51, 2167–2170',
		doi: '10.1103/PhysRevLett.51.2167',
		kind: 'paper'
	},
	{
		key: 'anderson-feil1998',
		authors: ['Marlow Anderson', 'Todd Feil'],
		year: 1998,
		title: 'Turning Lights Out with linear algebra',
		venue: 'Mathematics Magazine 71(4), 300–303',
		doi: '10.1080/0025570X.1998.11996658',
		kind: 'paper'
	}
];
