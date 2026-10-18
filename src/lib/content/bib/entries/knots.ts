import type { Work } from '../index';

const mactutor = (key: string, name: string, slug: string, year: number): Work => ({
	key,
	authors: ['John J. O’Connor', 'Edmund F. Robertson'],
	label: 'O’Connor & Robertson',
	year,
	title: name,
	venue: 'MacTutor History of Mathematics Archive, University of St Andrews',
	url: `https://mathshistory.st-andrews.ac.uk/Biographies/${slug}/`,
	free: true,
	kind: 'web'
});

// Knot theory: Chapter 3.7, and the knots that appear before it (2.1, 2.3).
export const works: Work[] = [
	{
		key: 'rolfsen1976',
		authors: ['Dale Rolfsen'],
		year: 1976,
		title: 'Knots and Links',
		venue: 'Publish or Perish, Berkeley; reprinted by AMS Chelsea, 2003',
		kind: 'book'
	},
	{
		key: 'thomson1867',
		authors: ['William Thomson'],
		year: 1867,
		title: 'On vortex atoms',
		venue: 'Proceedings of the Royal Society of Edinburgh 6 (1867), 94–105; also Philosophical Magazine 34 (1867), 15–24',
		doi: '10.1017/S0370164600045430',
		kind: 'paper'
	},
	{
		key: 'tait1877',
		authors: ['Peter Guthrie Tait'],
		year: 1877,
		title: 'On knots',
		venue: 'Transactions of the Royal Society of Edinburgh 28 (1877), 145–190; reprinted in Scientific Papers, vol. I, Cambridge University Press, 1898, 273–317',
		doi: '10.1017/S0080456800090633',
		kind: 'paper'
	},
	{
		key: 'campbell-garnett1882',
		authors: ['Lewis Campbell', 'William Garnett'],
		year: 1882,
		title: 'The Life of James Clerk Maxwell',
		venue: 'Macmillan, London',
		url: 'https://archive.org/details/lifeofjamesclerk00camprich',
		free: true,
		kind: 'book'
	},
	{
		key: 'hoste2005',
		authors: ['Jim Hoste'],
		year: 2005,
		title: 'The enumeration and classification of knots and links',
		venue: 'in W. Menasco and M. Thistlethwaite (eds.), Handbook of Knot Theory, Elsevier, 2005, 209–232',
		doi: '10.1016/B978-044451452-3/50006-X',
		kind: 'paper'
	},
	{
		key: 'dehn1914',
		authors: ['Max Dehn'],
		year: 1914,
		title: 'Die beiden Kleeblattschlingen',
		venue: 'Mathematische Annalen 75 (1914), 402–413',
		doi: '10.1007/BF01563732',
		kind: 'paper'
	},
	{
		key: 'alexander1923',
		authors: ['James W. Alexander'],
		year: 1923,
		title: 'A lemma on systems of knotted curves',
		venue: 'Proceedings of the National Academy of Sciences 9 (1923), 93–95',
		doi: '10.1073/pnas.9.3.93',
		free: true,
		kind: 'paper'
	},
	{
		key: 'artin1925',
		authors: ['Emil Artin'],
		year: 1925,
		title: 'Theorie der Zöpfe',
		venue: 'Abhandlungen aus dem Mathematischen Seminar der Universität Hamburg 4 (1925), 47–72',
		doi: '10.1007/BF02950718',
		kind: 'paper'
	},
	{
		key: 'alexander-briggs1927',
		authors: ['James W. Alexander', 'Garland B. Briggs'],
		label: 'Alexander & Briggs',
		year: 1927,
		title: 'On types of knotted curves',
		venue: 'Annals of Mathematics 28 (1926–27), 562–586',
		doi: '10.2307/1968399',
		kind: 'paper'
	},
	{
		key: 'reidemeister1927',
		authors: ['Kurt Reidemeister'],
		year: 1927,
		title: 'Elementare Begründung der Knotentheorie',
		venue: 'Abhandlungen aus dem Mathematischen Seminar der Universität Hamburg 5 (1927), 24–32',
		doi: '10.1007/BF02952507',
		kind: 'paper'
	},
	{
		key: 'frankl-pontryagin1930',
		authors: ['Fritz Frankl', 'Lev Pontryagin'],
		label: 'Frankl & Pontryagin',
		year: 1930,
		title: 'Ein Knotensatz mit Anwendung auf die Dimensionstheorie',
		venue: 'Mathematische Annalen 102 (1930), 785–789',
		doi: '10.1007/BF01782377',
		kind: 'paper'
	},
	{
		key: 'reidemeister1932',
		authors: ['Kurt Reidemeister'],
		year: 1932,
		title: 'Knotentheorie',
		venue: 'Ergebnisse der Mathematik und ihrer Grenzgebiete, Springer, Berlin',
		kind: 'book'
	},
	{
		key: 'seifert-threlfall1934',
		authors: ['Herbert Seifert', 'William Threlfall'],
		label: 'Seifert & Threlfall',
		year: 1934,
		title: 'Lehrbuch der Topologie',
		venue: 'Teubner, Leipzig',
		kind: 'book'
	},
	{
		key: 'markov1936',
		authors: ['A. A. Markov'],
		year: 1936,
		title: 'Über die freie Äquivalenz der geschlossenen Zöpfe',
		venue: 'Recueil Mathématique (Matematicheskii Sbornik) 1(43) (1936), 73–78',
		kind: 'paper'
	},
	{
		key: 'artin1947',
		authors: ['Emil Artin'],
		year: 1947,
		title: 'Theory of braids',
		venue: 'Annals of Mathematics 48 (1947), 101–126',
		doi: '10.2307/1969218',
		kind: 'paper'
	},
	{
		key: 'schubert1949',
		authors: ['Horst Schubert'],
		year: 1949,
		title: 'Die eindeutige Zerlegbarkeit eines Knotens in Primknoten',
		venue: 'Sitzungsberichte der Heidelberger Akademie der Wissenschaften, Math.-nat. Klasse, 1949, 3. Abhandlung, 57–104',
		doi: '10.1007/978-3-642-45813-2',
		kind: 'paper'
	},
	{
		key: 'haken1961',
		authors: ['Wolfgang Haken'],
		year: 1961,
		title: 'Theorie der Normalflächen: Ein Isotopiekriterium für den Kreisknoten',
		venue: 'Acta Mathematica 105 (1961), 245–375',
		doi: '10.1007/BF02559591',
		kind: 'paper'
	},
	{
		key: 'conway1970',
		authors: ['John H. Conway'],
		year: 1970,
		title: 'An enumeration of knots and links, and some of their algebraic properties',
		venue: 'in J. Leech (ed.), Computational Problems in Abstract Algebra, Pergamon, Oxford, 1970, 329–358',
		doi: '10.1016/B978-0-08-012975-4.50034-5',
		kind: 'paper'
	},
	{
		key: 'perko1974',
		authors: ['Kenneth A. Perko'],
		year: 1974,
		title: 'On the classification of knots',
		venue: 'Proceedings of the American Mathematical Society 45 (1974), 262–266',
		doi: '10.1090/S0002-9939-1974-0353294-X',
		free: true,
		kind: 'paper'
	},
	{
		key: 'liu-depew-wang1976',
		authors: ['Leroy F. Liu', 'Roxanne E. Depew', 'James C. Wang'],
		label: 'Liu, Depew & Wang',
		year: 1976,
		title: 'Knotted single-stranded DNA rings: a novel topological isomer of circular single-stranded DNA formed by treatment with Escherichia coli ω protein',
		venue: 'Journal of Molecular Biology 106 (1976), 439–452',
		doi: '10.1016/0022-2836(76)90095-4',
		kind: 'paper'
	},
	{
		key: 'jones1985',
		authors: ['Vaughan F. R. Jones'],
		year: 1985,
		title: 'A polynomial invariant for knots via von Neumann algebras',
		venue: 'Bulletin of the American Mathematical Society 12 (1985), 103–111',
		doi: '10.1090/S0273-0979-1985-15304-2',
		free: true,
		kind: 'paper'
	},
	{
		key: 'wasserman-dungan-cozzarelli1985',
		authors: ['Steven A. Wasserman', 'Jan M. Dungan', 'Nicholas R. Cozzarelli'],
		label: 'Wasserman, Dungan & Cozzarelli',
		year: 1985,
		title: 'Discovery of a predicted DNA knot substantiates a model for site-specific recombination',
		venue: 'Science 229 (1985), 171–174',
		doi: '10.1126/science.2990045',
		kind: 'paper'
	},
	{
		key: 'wasserman-cozzarelli1986',
		authors: ['Steven A. Wasserman', 'Nicholas R. Cozzarelli'],
		label: 'Wasserman & Cozzarelli',
		year: 1986,
		title: 'Biochemical topology: applications to DNA recombination and replication',
		venue: 'Science 232 (1986), 951–960',
		doi: '10.1126/science.3010458',
		kind: 'paper'
	},
	{
		key: 'kauffman1987',
		authors: ['Louis H. Kauffman'],
		year: 1987,
		title: 'State models and the Jones polynomial',
		venue: 'Topology 26 (1987), 395–407',
		doi: '10.1016/0040-9383(87)90009-7',
		kind: 'paper'
	},
	{
		key: 'murasugi1987',
		authors: ['Kunio Murasugi'],
		year: 1987,
		title: 'Jones polynomials and classical conjectures in knot theory',
		venue: 'Topology 26 (1987), 187–194',
		doi: '10.1016/0040-9383(87)90058-9',
		kind: 'paper'
	},
	{
		key: 'thistlethwaite1987',
		authors: ['Morwen B. Thistlethwaite'],
		year: 1987,
		title: 'A spanning tree expansion of the Jones polynomial',
		venue: 'Topology 26 (1987), 297–309',
		doi: '10.1016/0040-9383(87)90003-6',
		kind: 'paper'
	},
	{
		key: 'gordon-luecke1989',
		authors: ['Cameron McA. Gordon', 'John Luecke'],
		label: 'Gordon & Luecke',
		year: 1989,
		title: 'Knots are determined by their complements',
		venue: 'Journal of the American Mathematical Society 2 (1989), 371–415',
		doi: '10.1090/S0894-0347-1989-0965210-7',
		free: true,
		kind: 'paper'
	},
	{
		key: 'witten1989',
		authors: ['Edward Witten'],
		year: 1989,
		title: 'Quantum field theory and the Jones polynomial',
		venue: 'Communications in Mathematical Physics 121 (1989), 351–399',
		doi: '10.1007/BF01217730',
		kind: 'paper'
	},
	{
		key: 'dietrich-buchecker-sauvage1989',
		authors: ['Christiane O. Dietrich-Buchecker', 'Jean-Pierre Sauvage'],
		label: 'Dietrich-Buchecker & Sauvage',
		year: 1989,
		title: 'A synthetic molecular trefoil knot',
		venue: 'Angewandte Chemie International Edition 28 (1989), 189–192',
		doi: '10.1002/anie.198901891',
		kind: 'paper'
	},
	{
		key: 'przytycki1998',
		authors: ['Józef H. Przytycki'],
		year: 1998,
		title: '3-coloring and other elementary invariants of knots',
		venue: 'Banach Center Publications 42 (1998), 275–295',
		doi: '10.4064/-42-1-275-295',
		arxiv: 'math/0608172',
		url: 'https://arxiv.org/abs/math/0608172',
		free: true,
		kind: 'paper'
	},
	{
		key: 'hoste-thistlethwaite-weeks1998',
		authors: ['Jim Hoste', 'Morwen Thistlethwaite', 'Jeff Weeks'],
		label: 'Hoste, Thistlethwaite & Weeks',
		year: 1998,
		title: 'The first 1,701,936 knots',
		venue: 'The Mathematical Intelligencer 20(4) (1998), 33–48',
		doi: '10.1007/BF03025227',
		kind: 'paper'
	},
	{
		key: 'taylor2000',
		authors: ['William R. Taylor'],
		year: 2000,
		title: 'A deeply knotted protein structure and how it might fold',
		venue: 'Nature 406 (2000), 916–919',
		doi: '10.1038/35022623',
		kind: 'paper'
	},
	{
		key: 'bar-natan2002',
		authors: ['Dror Bar-Natan'],
		year: 2002,
		title: 'On Khovanov’s categorification of the Jones polynomial',
		venue: 'Algebraic & Geometric Topology 2 (2002), 337–370',
		doi: '10.2140/agt.2002.2.337',
		arxiv: 'math/0201043',
		url: 'https://arxiv.org/abs/math/0201043',
		free: true,
		kind: 'paper'
	},
	{
		key: 'kleckner-irvine2013',
		authors: ['Dustin Kleckner', 'William T. M. Irvine'],
		label: 'Kleckner & Irvine',
		year: 2013,
		title: 'Creation and dynamics of knotted vortices',
		venue: 'Nature Physics 9 (2013), 253–258',
		doi: '10.1038/nphys2560',
		kind: 'paper'
	},
	{
		key: 'danon2017',
		authors: ['Jonathan J. Danon', 'Anneke Krüger', 'David A. Leigh', 'Jean-François Lemonnier', 'Alexander J. Stephens', 'Iñigo J. Vitorica-Yrezabal', 'Steffen L. Woltering'],
		label: 'Danon et al.',
		year: 2017,
		title: 'Braiding a molecular knot with eight crossings',
		venue: 'Science 355 (2017), 159–162',
		doi: '10.1126/science.aal1619',
		kind: 'paper'
	},
	{
		key: 'burton2020',
		authors: ['Benjamin A. Burton'],
		year: 2020,
		title: 'The next 350 million knots',
		venue: '36th International Symposium on Computational Geometry (SoCG 2020), LIPIcs 164, 25:1–25:17',
		doi: '10.4230/LIPIcs.SoCG.2020.25',
		free: true,
		kind: 'paper'
	},
	{
		key: 'thistlethwaite2025',
		authors: ['Morwen B. Thistlethwaite'],
		year: 2025,
		title: 'The enumeration and classification of prime 20-crossing knots',
		venue: 'Algebraic & Geometric Topology 25 (2025), 329–344',
		doi: '10.2140/agt.2025.25.329',
		kind: 'paper'
	},
	{
		key: 'ozsvath-szabo2004',
		authors: ['Peter Ozsváth', 'Zoltán Szabó'],
		label: 'Ozsváth & Szabó',
		year: 2004,
		title: 'Holomorphic disks and knot invariants',
		venue: 'Advances in Mathematics 186 (2004), 58–116',
		doi: '10.1016/j.aim.2003.05.001',
		kind: 'paper'
	},
	{
		key: 'ozsvath-szabo2004genus',
		authors: ['Peter Ozsváth', 'Zoltán Szabó'],
		label: 'Ozsváth & Szabó',
		year: 2004,
		title: 'Holomorphic disks and genus bounds',
		venue: 'Geometry & Topology 8 (2004), 311–334',
		doi: '10.2140/gt.2004.8.311',
		free: true,
		kind: 'paper'
	},
	{
		key: 'rasmussen2010',
		authors: ['Jacob Rasmussen'],
		year: 2010,
		title: 'Khovanov homology and the slice genus',
		venue: 'Inventiones Mathematicae 182 (2010), 419–447',
		doi: '10.1007/s00222-010-0275-6',
		kind: 'paper'
	},
	{
		key: 'massey1998',
		authors: ['William S. Massey'],
		year: 1998,
		title: 'Higher order linking numbers',
		venue: 'Journal of Knot Theory and Its Ramifications 7 (1998), 393–414; first published in the proceedings of a 1968 conference on algebraic topology',
		doi: '10.1142/S0218216598000206',
		kind: 'paper'
	},
	{
		key: 'wendt1937',
		authors: ['H. Wendt'],
		year: 1937,
		title: 'Die gordische Auflösung von Knoten',
		venue: 'Mathematische Zeitschrift 42 (1937), 680–696',
		kind: 'paper'
	},
	{
		key: 'hass-lagarias-pippenger1999',
		authors: ['Joel Hass', 'Jeffrey C. Lagarias', 'Nicholas Pippenger'],
		label: 'Hass, Lagarias & Pippenger',
		year: 1999,
		title: 'The computational complexity of knot and link problems',
		venue: 'Journal of the ACM 46 (1999), 185–211',
		doi: '10.1145/301970.301971',
		kind: 'paper'
	},
	{
		key: 'jones2000',
		authors: ['Vaughan F. R. Jones'],
		year: 2000,
		title: 'Ten problems',
		venue: 'in Mathematics: Frontiers and Perspectives, American Mathematical Society, 2000, 79–91',
		kind: 'paper'
	},
	{
		key: 'thistlethwaite2001',
		authors: ['Morwen B. Thistlethwaite'],
		year: 2001,
		title: 'Links with trivial Jones polynomial',
		venue: 'Journal of Knot Theory and Its Ramifications 10 (2001), 641–643',
		doi: '10.1142/S0218216501001050',
		kind: 'paper'
	},
	{
		key: 'lackenby2015',
		authors: ['Marc Lackenby'],
		year: 2015,
		title: 'A polynomial upper bound on Reidemeister moves',
		venue: 'Annals of Mathematics 182 (2015), 491–564',
		doi: '10.4007/annals.2015.182.2.3',
		kind: 'paper'
	},
	{
		key: 'lackenby2021',
		authors: ['Marc Lackenby'],
		year: 2021,
		title: 'The efficient certification of knottedness and Thurston norm',
		venue: 'Advances in Mathematics 387 (2021), 107796',
		doi: '10.1016/j.aim.2021.107796',
		kind: 'paper'
	},
	{
		key: 'tuzun-sikora2021',
		authors: ['Robert E. Tuzun', 'Adam S. Sikora'],
		label: 'Tuzun & Sikora',
		year: 2021,
		title: 'Verification of the Jones unknot conjecture up to 24 crossings',
		venue: 'Journal of Knot Theory and Its Ramifications 30 (2021), 2150020',
		doi: '10.1142/S0218216521500206',
		arxiv: '2003.06724',
		kind: 'paper'
	},
	{
		key: 'brittenham-hermiller2026',
		authors: ['Mark Brittenham', 'Susan Hermiller'],
		label: 'Brittenham & Hermiller',
		year: 2026,
		title: 'Unknotting number is not additive under connected sum',
		venue: 'Annals of Mathematics 204 (2026), 795–817',
		doi: '10.4007/annals.2026.204.2.7',
		arxiv: '2506.24088',
		kind: 'paper'
	},
	{
		key: 'yu-schumacher-crane2021',
		authors: ['Chris Yu', 'Henrik Schumacher', 'Keenan Crane'],
		label: 'Yu, Schumacher & Crane',
		year: 2021,
		title: 'Repulsive curves',
		venue: 'ACM Transactions on Graphics 40:2 (2021), 1–21',
		doi: '10.1145/3439429',
		arxiv: '2006.07859',
		kind: 'paper'
	},
	mactutor('oconnor-robertson-reidemeister', 'Kurt Werner Friedrich Reidemeister', 'Reidemeister', 2014),
	mactutor('oconnor-robertson-artin', 'Emil Artin', 'Artin', 2000),
	mactutor('oconnor-robertson-seifert', 'Herbert Seifert', 'Seifert', 2000),
	mactutor('oconnor-robertson-conway', 'John Horton Conway', 'Conway', 2004),
	mactutor('oconnor-robertson-jones', 'Vaughan Frederick Randal Jones', 'Jones_Vaughan', 2009)
];
