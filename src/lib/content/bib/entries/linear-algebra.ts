// Works cited in §1.5 Linear Algebra. Each DOI was checked against Crossref and
// each url opened.
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'kaplansky1991',
		authors: ['Irving Kaplansky'],
		year: 1991,
		title: 'Reminiscences',
		venue: 'in J. H. Ewing and F. W. Gehring (eds.), Paul Halmos: Celebrating 50 Years of Mathematics, Springer, 87–89',
		doi: '10.1007/978-1-4612-0967-6_10',
		kind: 'paper'
	},
	{
		key: 'grcar2011',
		authors: ['Joseph F. Grcar'],
		year: 2011,
		title: 'How ordinary elimination became Gaussian elimination',
		venue: 'Historia Mathematica 38(2), 163–218',
		doi: '10.1016/j.hm.2010.06.003',
		arxiv: '0907.2397',
		url: 'https://arxiv.org/abs/0907.2397',
		free: true,
		kind: 'paper'
	},
	{
		key: 'strang1993',
		authors: ['Gilbert Strang'],
		year: 1993,
		title: 'The fundamental theorem of linear algebra',
		venue: 'The American Mathematical Monthly 100(9), 848–855',
		doi: '10.1080/00029890.1993.11990500',
		kind: 'paper'
	},
	{
		key: 'oeis-a159257',
		authors: ['Bruno Vallet and others'],
		label: 'OEIS',
		year: 2009,
		title: 'A159257: Rank deficiency of the Lights Out problem of size n',
		venue: 'The On-Line Encyclopedia of Integer Sequences',
		url: 'https://oeis.org/A159257',
		free: true,
		kind: 'web'
	}
];
