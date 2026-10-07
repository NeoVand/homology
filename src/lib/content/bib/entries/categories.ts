// Works cited in §5.1 Categories and functors. DOIs checked against Crossref, urls opened.
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'poincare1914',
		authors: ['Henri Poincaré'],
		year: 1914,
		title: 'Science and Method',
		venue: 'translated by Francis Maitland, Thomas Nelson and Sons, London (French original: Science et méthode, Flammarion, 1908)',
		url: 'https://archive.org/details/sciencemethod00poinuoft',
		free: true,
		kind: 'book'
	},
	{
		key: 'eilenberg-maclane1942',
		authors: ['Samuel Eilenberg', 'Saunders Mac Lane'],
		label: 'Eilenberg & Mac Lane',
		year: '1942a',
		title: 'Group extensions and homology',
		venue: 'Annals of Mathematics 43(4), 757–831',
		doi: '10.2307/1968966',
		kind: 'paper'
	},
	{
		key: 'eilenberg-maclane1942b',
		authors: ['Samuel Eilenberg', 'Saunders Mac Lane'],
		label: 'Eilenberg & Mac Lane',
		year: '1942b',
		title: 'Natural isomorphisms in group theory',
		venue: 'Proceedings of the National Academy of Sciences 28(12), 537–543',
		doi: '10.1073/pnas.28.12.537',
		free: true,
		kind: 'paper'
	}
];
