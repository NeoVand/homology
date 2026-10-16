// Works cited in §3.5 Maps, invariance, and first triumphs. DOIs checked against
// Crossref; urls opened.
import type { Work } from '../index';

export const works: Work[] = [
	// milnor1965 (Topology from the Differentiable Viewpoint) is defined in characteristic-classes.ts
	{
		key: 'cantor1878',
		authors: ['Georg Cantor'],
		year: 1878,
		title: 'Ein Beitrag zur Mannigfaltigkeitslehre',
		venue: 'Journal für die reine und angewandte Mathematik 84, 242–258',
		doi: '10.1515/crll.1878.84.242',
		kind: 'paper'
	},
	{
		key: 'gouvea2011',
		authors: ['Fernando Q. Gouvêa'],
		year: 2011,
		title: 'Was Cantor surprised?',
		venue: 'The American Mathematical Monthly 118(3), 198–209',
		doi: '10.4169/amer.math.monthly.118.03.198',
		kind: 'paper'
	},
	{
		key: 'peano1890',
		authors: ['Giuseppe Peano'],
		year: 1890,
		title: 'Sur une courbe, qui remplit toute une aire plane',
		venue: 'Mathematische Annalen 36, 157–160',
		doi: '10.1007/BF01199438',
		kind: 'paper'
	},
	{
		key: 'brouwer1911dim',
		authors: ['L. E. J. Brouwer'],
		year: 1911,
		title: 'Beweis der Invarianz der Dimensionenzahl',
		venue: 'Mathematische Annalen 70, 161–165',
		doi: '10.1007/BF01461154',
		kind: 'paper'
	},
	{
		key: 'vandalen2013',
		authors: ['Dirk van Dalen'],
		label: 'van Dalen',
		year: 2013,
		title: 'L. E. J. Brouwer – Topologist, Intuitionist, Philosopher: How Mathematics Is Rooted in Life',
		venue: 'Springer',
		doi: '10.1007/978-1-4471-4616-2',
		kind: 'book'
	},
	{
		key: 'veblen1905',
		authors: ['Oswald Veblen'],
		year: 1905,
		title: 'Theory on plane curves in non-metrical analysis situs',
		venue: 'Transactions of the American Mathematical Society 6(1), 83–98',
		doi: '10.1090/S0002-9947-1905-1500697-4',
		kind: 'paper'
	},
	{
		key: 'hales2007',
		authors: ['Thomas C. Hales'],
		year: 2007,
		title: 'Jordan’s proof of the Jordan curve theorem',
		venue: 'Studies in Logic, Grammar and Rhetoric 10(23), 45–60',
		url: 'https://webhomes.maths.ed.ac.uk/~v1ranick/papers/hales1.pdf',
		free: true,
		kind: 'paper'
	},
	{
		key: 'alexander1924',
		authors: ['J. W. Alexander'],
		year: 1924,
		title: 'An example of a simply connected surface bounding a region which is not simply connected',
		venue: 'Proceedings of the National Academy of Sciences 10(1), 8–10',
		doi: '10.1073/pnas.10.1.8',
		free: true,
		kind: 'paper'
	},
	{
		key: 'poincare1904',
		authors: ['Henri Poincaré'],
		year: 1904,
		title: 'Cinquième complément à l’Analysis situs',
		venue: 'Rendiconti del Circolo Matematico di Palermo 18, 45–110',
		doi: '10.1007/BF03014091',
		kind: 'paper'
	},
	{
		key: 'oconnor-robertson-brouwer',
		authors: ['John J. O’Connor', 'Edmund F. Robertson'],
		label: 'O’Connor & Robertson',
		year: 2003,
		title: 'Luitzen Egbertus Jan Brouwer',
		venue: 'MacTutor History of Mathematics Archive, University of St Andrews',
		url: 'https://mathshistory.st-andrews.ac.uk/Biographies/Brouwer/',
		free: true,
		kind: 'web'
	},
	{
		key: 'oconnor-robertson-dedekind',
		authors: ['John J. O’Connor', 'Edmund F. Robertson'],
		label: 'O’Connor & Robertson',
		year: 1998,
		title: 'Julius Wilhelm Richard Dedekind',
		venue: 'MacTutor History of Mathematics Archive, University of St Andrews',
		url: 'https://mathshistory.st-andrews.ac.uk/Biographies/Dedekind/',
		free: true,
		kind: 'web'
	},
	{
		key: 'johnson1979',
		authors: ['Dale M. Johnson'],
		year: 1979,
		title: 'The problem of the invariance of dimension in the growth of modern topology, part I',
		venue: 'Archive for History of Exact Sciences 20, 97–188',
		url: 'https://webhomes.maths.ed.ac.uk/~v1ranick/papers/johnson1.pdf',
		doi: '10.1007/BF00327627',
		free: true,
		kind: 'paper'
	},
	{
		key: 'oconnor-robertson-jordan',
		authors: ['John J. O’Connor', 'Edmund F. Robertson'],
		label: 'O’Connor & Robertson',
		year: 2001,
		title: 'Marie Ennemond Camille Jordan',
		venue: 'MacTutor History of Mathematics Archive, University of St Andrews',
		url: 'https://mathshistory.st-andrews.ac.uk/Biographies/Jordan/',
		free: true,
		kind: 'web'
	},
	{
		key: 'oconnor-robertson-lefschetz',
		authors: ['John J. O’Connor', 'Edmund F. Robertson'],
		label: 'O’Connor & Robertson',
		year: 2003,
		title: 'Solomon Lefschetz',
		venue: 'MacTutor History of Mathematics Archive, University of St Andrews',
		url: 'https://mathshistory.st-andrews.ac.uk/Biographies/Lefschetz/',
		free: true,
		kind: 'web'
	}
];
