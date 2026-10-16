import type { Work } from '../index';

// Works cited in homology/computing (§3.4).
export const works: Work[] = [
	{
		key: 'atiyah2001',
		authors: ['Michael Atiyah'],
		year: 2001,
		title: 'Mathematics in the 20th century',
		venue: 'American Mathematical Monthly 108(7), 654–666',
		doi: '10.1080/00029890.2001.11919797',
		kind: 'paper'
	},
	{
		key: 'tubbenhauer2021cellular',
		authors: ['Daniel Tubbenhauer'],
		year: 2021,
		title: 'What is…cellular homology? Or: Winding around (slides)',
		venue: 'Slides for the VisualMath video series on algebraic topology',
		url: 'https://www.dtubbenhauer.com/slides/algebraic-topology/13-cellular-homology.pdf',
		free: true,
		kind: 'notes'
	},
	{
		key: 'oconnor-robertson-smith',
		authors: ['John J. O’Connor', 'Edmund F. Robertson'],
		label: 'O’Connor & Robertson',
		year: 2005,
		title: 'Henry John Stephen Smith',
		venue: 'MacTutor History of Mathematics Archive, University of St Andrews',
		url: 'https://mathshistory.st-andrews.ac.uk/Biographies/Smith/',
		free: true,
		kind: 'web'
	}
];
