// Works cited in §4.5 The cup product (hutchings2011 is also cited in §4.6).
// DOIs checked against Crossref, urls opened.
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'hutchings2011',
		authors: ['Michael Hutchings'],
		year: 2011,
		title: 'Cup product and intersections',
		venue: 'lecture notes, Math 215B, University of California, Berkeley',
		url: 'https://math.berkeley.edu/~hutching/teach/215b-2011/cup.pdf',
		free: true,
		kind: 'notes'
	},
	{
		key: 'whitney1938',
		authors: ['Hassler Whitney'],
		year: 1938,
		title: 'On products in a complex',
		venue: 'Annals of Mathematics 39(2), 397–432',
		doi: '10.2307/1968795',
		kind: 'paper'
	},
	{
		key: 'apushkinskaya2019',
		authors: ['Darya E. Apushkinskaya', 'Alexander I. Nazarov', 'Galina I. Sinkevich'],
		year: 2019,
		title: 'In search of shadows: the First Topological Conference, Moscow 1935',
		venue: 'The Mathematical Intelligencer 41, 37–42',
		doi: '10.1007/s00283-019-09907-6',
		arxiv: '1903.02065',
		url: 'https://arxiv.org/abs/1903.02065',
		free: true,
		kind: 'paper'
	}
];
