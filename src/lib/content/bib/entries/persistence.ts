// Works cited in §3.7 Persistent homology. DOIs checked against Crossref; urls opened.
// (reitberger2002 is in exact-sequences.ts, borsuk1948 in sheaves.ts.)
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'weinberger2011',
		authors: ['Shmuel Weinberger'],
		year: 2011,
		title: 'What is … persistent homology?',
		venue: 'Notices of the American Mathematical Society 58(1), 36–39',
		url: 'https://www.ams.org/notices/201101/rtx110100036p.pdf',
		free: true,
		kind: 'paper'
	},
	{
		key: 'edelsbrunner-harer2008',
		authors: ['Herbert Edelsbrunner', 'John Harer'],
		year: 2008,
		title: 'Persistent homology — a survey',
		venue: 'in Surveys on Discrete and Computational Geometry: Twenty Years Later, Contemporary Mathematics 453, AMS, 257–282',
		doi: '10.1090/conm/453/08802',
		url: 'https://webhomes.maths.ed.ac.uk/~v1ranick/papers/edelhare.pdf',
		free: true,
		kind: 'paper'
	},
	{
		key: 'jung1901',
		authors: ['Heinrich Jung'],
		year: 1901,
		title: 'Über die kleinste Kugel, die eine räumliche Figur einschliesst',
		venue: 'Journal für die reine und angewandte Mathematik 123, 241–257',
		doi: '10.1515/crll.1901.123.241',
		kind: 'paper'
	},
	{
		key: 'hausmann1995',
		authors: ['Jean-Claude Hausmann'],
		year: 1995,
		title: 'On the Vietoris–Rips complexes and a cohomology theory for metric spaces',
		venue: 'in Prospects in Topology, Annals of Mathematics Studies 138, Princeton University Press, 175–188',
		doi: '10.1515/9781400882588-013',
		kind: 'paper'
	},
	{
		key: 'gower-ross1969',
		authors: ['J. C. Gower', 'G. J. S. Ross'],
		year: 1969,
		title: 'Minimum spanning trees and single linkage cluster analysis',
		venue: 'Journal of the Royal Statistical Society, Series C (Applied Statistics) 18(1), 54–64',
		doi: '10.2307/2346439',
		kind: 'paper'
	},
	{
		key: 'chazal-desilva-oudot2014',
		authors: ['Frédéric Chazal', 'Vin de Silva', 'Steve Oudot'],
		year: 2014,
		title: 'Persistence stability for geometric complexes',
		venue: 'Geometriae Dedicata 173, 193–214',
		doi: '10.1007/s10711-013-9937-z',
		arxiv: '1207.3885',
		url: 'https://arxiv.org/abs/1207.3885',
		free: true,
		kind: 'paper'
	},
	{
		key: 'chazal-michel2021',
		authors: ['Frédéric Chazal', 'Bertrand Michel'],
		year: 2021,
		title: 'An introduction to topological data analysis: fundamental and practical aspects for data scientists',
		venue: 'Frontiers in Artificial Intelligence 4, 667963',
		doi: '10.3389/frai.2021.667963',
		arxiv: '1710.04019',
		free: true,
		kind: 'paper'
	},
	{
		key: 'adamaszek-adams2017',
		authors: ['Michał Adamaszek', 'Henry Adams'],
		year: 2017,
		title: 'The Vietoris–Rips complexes of a circle',
		venue: 'Pacific Journal of Mathematics 290(1), 1–40',
		doi: '10.2140/pjm.2017.290.1',
		arxiv: '1503.03669',
		url: 'https://arxiv.org/abs/1503.03669',
		free: true,
		kind: 'paper'
	},
	{
		key: 'carlsson2008',
		authors: ['Gunnar Carlsson', 'Tigran Ishkhanov', 'Vin de Silva', 'Afra Zomorodian'],
		year: 2008,
		title: 'On the local behavior of spaces of natural images',
		venue: 'International Journal of Computer Vision 76(1), 1–12',
		doi: '10.1007/s11263-007-0056-x',
		kind: 'paper'
	},
	{
		key: 'chan2013',
		authors: ['Joseph Minhow Chan', 'Gunnar Carlsson', 'Raul Rabadan'],
		year: 2013,
		title: 'Topology of viral evolution',
		venue: 'Proceedings of the National Academy of Sciences 110(46), 18566–18571',
		doi: '10.1073/pnas.1313480110',
		free: true,
		kind: 'paper'
	},
	{
		key: 'giusti2015',
		authors: ['Chad Giusti', 'Eva Pastalkova', 'Carina Curto', 'Vladimir Itskov'],
		year: 2015,
		title: 'Clique topology reveals intrinsic geometric structure in neural correlations',
		venue: 'Proceedings of the National Academy of Sciences 112(44), 13455–13460',
		doi: '10.1073/pnas.1506407112',
		free: true,
		kind: 'paper'
	},
	{
		key: 'hiraoka2016',
		authors: ['Yasuaki Hiraoka', 'Takenobu Nakamura', 'Akihiko Hirata', 'Emerson G. Escolar', 'Kaname Matsue', 'Yasumasa Nishiura'],
		year: 2016,
		title: 'Hierarchical structures of amorphous solids characterized by persistent homology',
		venue: 'Proceedings of the National Academy of Sciences 113(26), 7035–7040',
		doi: '10.1073/pnas.1520877113',
		free: true,
		kind: 'paper'
	},
	{
		key: 'pranav2017',
		authors: ['Pratyush Pranav', 'Herbert Edelsbrunner', 'Rien van de Weygaert', 'Gert Vegter', 'Michael Kerber', 'Bernard J. T. Jones', 'Mathijs Wintraecken'],
		year: 2017,
		title: 'The topology of the cosmic web in terms of persistent Betti numbers',
		venue: 'Monthly Notices of the Royal Astronomical Society 465(4), 4281–4310',
		doi: '10.1093/mnras/stw2862',
		arxiv: '1608.04519',
		url: 'https://arxiv.org/abs/1608.04519',
		free: true,
		kind: 'paper'
	},
	{
		key: 'xia-wei2014',
		authors: ['Kelin Xia', 'Guo-Wei Wei'],
		year: 2014,
		title: 'Persistent homology analysis of protein structure, flexibility, and folding',
		venue: 'International Journal for Numerical Methods in Biomedical Engineering 30(8), 814–844',
		doi: '10.1002/cnm.2655',
		kind: 'paper'
	},
	{
		key: 'feng-porter2021',
		authors: ['Michelle Feng', 'Mason A. Porter'],
		year: 2021,
		title: 'Persistent homology of geospatial data: a case study with voting',
		venue: 'SIAM Review 63(1), 67–99',
		doi: '10.1137/19M1241519',
		arxiv: '1902.05911',
		url: 'https://arxiv.org/abs/1902.05911',
		free: true,
		kind: 'paper'
	},
	{
		key: 'nicolau2011',
		authors: ['Monica Nicolau', 'Arnold J. Levine', 'Gunnar Carlsson'],
		year: 2011,
		title: 'Topology based data analysis identifies a subgroup of breast cancers with a unique mutational profile and excellent survival',
		venue: 'Proceedings of the National Academy of Sciences 108(17), 7265–7270',
		doi: '10.1073/pnas.1102826108',
		free: true,
		kind: 'paper'
	}
];
