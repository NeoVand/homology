// Works cited in 1.4 Abelian Groups and Formal Sums. Each DOI was checked against
// Crossref and each url opened; quotations were checked against the text.
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'conrad-quotients',
		authors: ['Keith Conrad'],
		year: 2025,
		title: 'Quotient groups',
		venue: 'expository note, University of Connecticut (undated; version of September 2025)',
		url: 'https://kconrad.math.uconn.edu/blurbs/grouptheory/quotientgroups.pdf',
		free: true,
		kind: 'notes'
	},
	{
		key: 'bradley2016',
		authors: ['Tai-Danae Bradley'],
		year: 2016,
		title: 'What’s a quotient group, really? Part 2',
		venue: 'Math3ma (blog), 22 November 2016',
		url: 'https://www.math3ma.com/blog/whats-a-quotient-group-really-part-2',
		free: true,
		kind: 'web'
	},
	{
		key: 'roth2001',
		authors: ['Richard L. Roth'],
		year: 2001,
		title: 'A history of Lagrange’s theorem on groups',
		venue: 'Mathematics Magazine 74(2), 99–108',
		doi: '10.1080/0025570X.2001.11953045',
		kind: 'paper'
	},
	{
		key: 'lam-ang2004',
		authors: ['Lam Lay Yong', 'Ang Tian Se'],
		label: 'Lam & Ang',
		year: 2004,
		title: 'Fleeting Footsteps: Tracing the Conception of Arithmetic and Algebra in Ancient China (revised edition)',
		venue: 'World Scientific; includes a complete English translation of the Sunzi suanjing',
		doi: '10.1142/5425',
		kind: 'book'
	},
	{
		key: 'poincare1900',
		authors: ['Henri Poincaré'],
		year: 1900,
		title: 'Second complément à l’Analysis Situs',
		venue:
			'Proceedings of the London Mathematical Society 32, 277–308; English translation by John Stillwell in Papers on Topology (AMS, 2010)',
		doi: '10.1112/plms/s1-32.1.277',
		kind: 'paper'
	},
	{
		key: 'stillwell-intro2010',
		authors: ['John Stillwell'],
		year: 2010,
		title: 'Translator’s introduction, in Henri Poincaré, Papers on Topology: Analysis Situs and Its Five Supplements',
		venue: 'American Mathematical Society and London Mathematical Society, History of Mathematics 37',
		url: 'https://webhomes.maths.ed.ac.uk/~v1ranick/papers/poincare2009.pdf',
		doi: '10.1090/hmath/037',
		free: true,
		kind: 'book'
	}
];
