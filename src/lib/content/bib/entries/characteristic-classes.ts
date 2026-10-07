// Works cited in §4.8 Curvature and characteristic classes. DOIs checked against Crossref, urls opened.
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'gauss1827',
		authors: ['Carl Friedrich Gauss'],
		year: 1827,
		title: 'General Investigations of Curved Surfaces (Disquisitiones generales circa superficies curvas)',
		venue: 'translated by J. C. Morehead and A. M. Hiltebeitel, Princeton University Library, 1902; Project Gutenberg',
		url: 'https://www.gutenberg.org/ebooks/36856',
		free: true,
		kind: 'paper'
	},
	{
		key: 'euler1767',
		authors: ['Leonhard Euler'],
		year: 1767,
		title: 'Recherches sur la courbure des surfaces',
		venue: 'Mémoires de l’académie des sciences de Berlin 16, 119–143; written 1763 (Euler Archive E333)',
		url: 'https://scholarlycommons.pacific.edu/euler-works/333/',
		free: true,
		kind: 'paper'
	},
	{
		key: 'poincare1885',
		authors: ['Henri Poincaré'],
		year: 1885,
		title: 'Sur les courbes définies par les équations différentielles (troisième partie)',
		venue: 'Journal de Mathématiques Pures et Appliquées, 4e série, 1, 167–244',
		url: 'https://www.numdam.org/item/JMPA_1885_4_1__167_0/',
		free: true,
		kind: 'paper'
	},
	{
		key: 'hopf1927',
		authors: ['Heinz Hopf'],
		year: 1927,
		title: 'Vektorfelder in n-dimensionalen Mannigfaltigkeiten',
		venue: 'Mathematische Annalen 96, 225–249',
		doi: '10.1007/BF01209164',
		kind: 'paper'
	},
	{
		key: 'hopf1935',
		authors: ['Heinz Hopf'],
		year: 1935,
		title: 'Über die Drehung der Tangenten und Sehnen ebener Kurven',
		venue: 'Compositio Mathematica 2, 50–62',
		url: 'https://www.numdam.org/item/CM_1935__2__50_0/',
		free: true,
		kind: 'paper'
	},
	{
		key: 'milnor1965',
		authors: ['John W. Milnor'],
		year: 1965,
		title: 'Topology from the Differentiable Viewpoint',
		venue: 'University Press of Virginia (reprinted by Princeton University Press, 1997)',
		url: 'https://press.princeton.edu/books/paperback/9780691048338/topology-from-the-differentiable-viewpoint',
		kind: 'book'
	},
	{
		key: 'crane-ddg',
		authors: ['Keenan Crane'],
		year: 2025,
		title: 'Discrete Differential Geometry: An Applied Introduction',
		venue: 'lecture notes, Carnegie Mellon University (last updated January 2025)',
		url: 'https://www.cs.cmu.edu/~kmcrane/Projects/DDG/paper.pdf',
		free: true,
		kind: 'notes'
	},
	{
		key: 'chern1946',
		authors: ['Shiing-Shen Chern'],
		year: 1946,
		title: 'Characteristic classes of Hermitian manifolds',
		venue: 'Annals of Mathematics 47(1), 85–121',
		doi: '10.2307/1969037',
		kind: 'paper'
	},
	{
		key: 'hatcher-vbkt2017',
		authors: ['Allen Hatcher'],
		year: 2017,
		title: 'Vector Bundles and K-Theory (version 2.2)',
		venue: 'book in progress, Cornell University',
		url: 'https://pi.math.cornell.edu/~hatcher/VBKT/VBpage.html',
		free: true,
		kind: 'book'
	},
	{
		key: 'needham2021',
		authors: ['Tristan Needham'],
		year: 2021,
		title: 'Visual Differential Geometry and Forms',
		venue: 'Princeton University Press',
		doi: '10.1515/9780691219899',
		kind: 'book'
	},
	{
		key: 'berry1984',
		authors: ['Michael V. Berry'],
		year: 1984,
		title: 'Quantal phase factors accompanying adiabatic changes',
		venue: 'Proceedings of the Royal Society of London A 392, 45–57',
		doi: '10.1098/rspa.1984.0023',
		kind: 'paper'
	},
	{
		key: 'klitzing1980',
		authors: ['Klaus von Klitzing', 'Gerhard Dorda', 'Michael Pepper'],
		label: 'von Klitzing et al.',
		year: 1980,
		title:
			'New method for high-accuracy determination of the fine-structure constant based on quantized Hall resistance',
		venue: 'Physical Review Letters 45, 494–497',
		doi: '10.1103/PhysRevLett.45.494',
		kind: 'paper'
	},
	{
		key: 'haldane1988',
		authors: ['F. Duncan M. Haldane'],
		year: 1988,
		title:
			'Model for a quantum Hall effect without Landau levels: condensed-matter realization of the “parity anomaly”',
		venue: 'Physical Review Letters 61, 2015–2018',
		doi: '10.1103/PhysRevLett.61.2015',
		kind: 'paper'
	},
	{
		key: 'hasan-kane2010',
		authors: ['M. Zahid Hasan', 'Charles L. Kane'],
		year: 2010,
		title: 'Colloquium: Topological insulators',
		venue: 'Reviews of Modern Physics 82, 3045–3067',
		doi: '10.1103/RevModPhys.82.3045',
		arxiv: '1002.3895',
		url: 'https://arxiv.org/abs/1002.3895',
		free: true,
		kind: 'paper'
	},
	{
		key: 'nobel2016',
		authors: ['The Royal Swedish Academy of Sciences'],
		label: 'Nobel Prize',
		year: 2016,
		title: 'The Nobel Prize in Physics 2016',
		venue: 'NobelPrize.org',
		url: 'https://www.nobelprize.org/prizes/physics/2016/summary/',
		free: true,
		kind: 'web'
	}
];
