// Works cited in §2.1 Spaces and Continuity. Each DOI was checked against
// Crossref and each url opened.
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'moore2008',
		authors: ['Gregory H. Moore'],
		year: 2008,
		title: 'The emergence of open sets, closed sets, and limit points in analysis and topology',
		venue: 'Historia Mathematica 35(3), 220–241',
		doi: '10.1016/j.hm.2008.01.001',
		kind: 'paper'
	},
	{
		key: 'frechet1906',
		authors: ['Maurice Fréchet'],
		year: 1906,
		title: 'Sur quelques points du calcul fonctionnel',
		venue: 'Rendiconti del Circolo Matematico di Palermo 22, 1–72 (his doctoral thesis)',
		doi: '10.1007/BF03018603',
		kind: 'thesis'
	},
	{
		key: 'vickers1989',
		authors: ['Steven Vickers'],
		year: 1989,
		title: 'Topology via Logic',
		venue: 'Cambridge University Press, Cambridge Tracts in Theoretical Computer Science 5',
		kind: 'book'
	},
	{
		key: 'lamb2017',
		authors: ['Evelyn Lamb'],
		year: 2017,
		title: 'What does compactness really mean?',
		venue: 'Roots of Unity, Scientific American blog, 25 May 2017',
		url: 'https://www.scientificamerican.com/blog/roots-of-unity/what-does-compactness-really-mean/',
		free: true,
		kind: 'web'
	},
	{
		key: 'farrell2021',
		authors: ['David Farrell'],
		label: 'Boarbarktree',
		year: 2021,
		title: 'You Could Have Invented Homology, Part 3: Boundaries & The Big Idea',
		venue: 'Boarbarktree, YouTube video (16 February 2021); part 1 appeared on 16 December 2020',
		url: 'https://www.youtube.com/watch?v=j9JJJoTjIpY',
		free: true,
		kind: 'video'
	}
];
