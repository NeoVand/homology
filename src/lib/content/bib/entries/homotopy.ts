// Works cited in §2.3 Homotopy (munkres2000 lives in gluing.ts). Each DOI was
// checked against Crossref and each url opened (October 2026).
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'demaine2014',
		authors: [
			'Erik D. Demaine',
			'Martin L. Demaine',
			'Yair N. Minsky',
			'Joseph S. B. Mitchell',
			'Ronald L. Rivest',
			'Mihai Pătraşcu'
		],
		year: 2014,
		title: 'Picture-Hanging Puzzles',
		venue: 'Theory of Computing Systems 54(4), 531–550',
		doi: '10.1007/s00224-013-9501-0',
		arxiv: '1203.3602',
		url: 'https://arxiv.org/abs/1203.3602',
		free: true,
		kind: 'paper'
	},
	{
		key: 'boone1958',
		authors: ['William W. Boone'],
		year: 1958,
		title: 'The word problem',
		venue: 'Proceedings of the National Academy of Sciences 44(10), 1061–1065',
		doi: '10.1073/pnas.44.10.1061',
		free: true,
		kind: 'paper'
	}
];
