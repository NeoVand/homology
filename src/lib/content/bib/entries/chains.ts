// Works cited in §3.2 Chains and the boundary operator. DOIs checked against
// Crossref; urls opened. The Alexander quotation was checked against the 1922
// paper itself.
import type { Work } from '../index';

// Also cited in §3.2 and defined elsewhere: kun2013 (cycles-and-boundaries.ts),
// poincare1899 (poincare-duality.ts), and the shared works in core.ts.

export const works: Work[] = [
	{
		key: 'farrell2021',
		authors: ['David Farrell'],
		label: 'Boarbarktree',
		year: 2021,
		title: 'You Could Have Invented Homology, Part 3: Boundaries & The Big Idea',
		venue: 'Boarbarktree, YouTube video (16 February 2021)',
		url: 'https://www.youtube.com/watch?v=j9JJJoTjIpY',
		free: true,
		kind: 'video'
	},
	{
		key: 'tietze1908',
		authors: ['Heinrich Tietze'],
		year: 1908,
		title: 'Über die topologischen Invarianten mehrdimensionaler Mannigfaltigkeiten',
		venue: 'Monatshefte für Mathematik und Physik 19, 1–118',
		doi: '10.1007/BF01736688',
		kind: 'paper'
	},
	{
		key: 'veblen-alexander1913',
		authors: ['Oswald Veblen', 'J. W. Alexander'],
		year: 1913,
		title: 'Manifolds of n dimensions',
		venue: 'Annals of Mathematics (2) 14, 163–178 (volume dated 1912–13)',
		doi: '10.2307/1967611',
		kind: 'paper'
	},
	{
		key: 'alexander1922',
		authors: ['J. W. Alexander'],
		year: 1922,
		title: 'A proof and extension of the Jordan–Brouwer separation theorem',
		venue: 'Transactions of the American Mathematical Society 23(4), 333–349',
		doi: '10.1090/S0002-9947-1922-1501206-6',
		free: true,
		kind: 'paper'
	},
	{
		key: 'hausmann2014',
		authors: ['Jean-Claude Hausmann'],
		year: 2014,
		title: 'Mod Two Homology and Cohomology',
		venue: 'Springer, Universitext (a corrected 2022 version is free on the author’s web page)',
		url: 'https://www.unige.ch/math/folks/hausmann/hausmannBook.pdf',
		doi: '10.1007/978-3-319-09354-3',
		free: true,
		kind: 'book'
	}
];
