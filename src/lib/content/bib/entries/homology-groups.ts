// Works cited in §3.3 Homology groups. DOIs checked against Crossref; urls opened.
// tubbenhauer2021 (the VisualMath video) is defined in cycles-and-boundaries.ts.
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'hirzebruch1999',
		authors: ['Friedrich Hirzebruch'],
		year: 1999,
		title: 'Emmy Noether and topology',
		venue:
			'in M. Teicher (ed.), The Heritage of Emmy Noether, Israel Mathematical Conference Proceedings 12, Bar-Ilan University, 57–65 (lecture of 1996; MPIM preprint 1997-34)',
		url: 'https://hirzebruch.mpim-bonn.mpg.de/98/6/preprint_1997_34.pdf',
		free: true,
		kind: 'paper'
	},
	{
		key: 'lefschetz1930',
		authors: ['Solomon Lefschetz'],
		year: 1930,
		title: 'Topology',
		venue: 'American Mathematical Society, Colloquium Publications 12',
		doi: '10.1090/coll/012',
		kind: 'book'
	},
	{
		key: 'delfinado-edelsbrunner1995',
		authors: ['Cecil Jose A. Delfinado', 'Herbert Edelsbrunner'],
		year: 1995,
		title: 'An incremental algorithm for Betti numbers of simplicial complexes on the 3-sphere',
		venue: 'Computer Aided Geometric Design 12(7), 771–784',
		doi: '10.1016/0167-8396(95)00016-Y',
		kind: 'paper'
	},
	{
		key: 'aleph0-2025',
		authors: ['Aleph 0'],
		label: 'Aleph 0',
		year: 2025,
		title: 'What is algebraic topology?',
		venue: 'YouTube video, 10 February 2025 (14 minutes)',
		url: 'https://www.youtube.com/watch?v=5xLe77iTHuQ',
		free: true,
		kind: 'video'
	}
];
