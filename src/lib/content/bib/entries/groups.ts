// Works cited in 1.3 Groups. Each DOI was checked against Crossref and each url
// opened; theorem numbers in Judson were checked against the 2025 edition.
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'judson2025',
		authors: ['Thomas W. Judson'],
		year: 2025,
		title: 'Abstract Algebra: Theory and Applications',
		venue: 'Annual edition 2025, free under the GNU Free Documentation License',
		url: 'https://judsonbooks.org/abstract-algebra-theory-and-applications/',
		free: true,
		kind: 'book'
	},
	{
		key: 'cayley1854',
		authors: ['Arthur Cayley'],
		year: 1854,
		title: 'On the theory of groups, as depending on the symbolic equation θⁿ = 1',
		venue: 'The London, Edinburgh, and Dublin Philosophical Magazine 7(42), 40–47',
		doi: '10.1080/14786445408647421',
		kind: 'paper'
	},
	{
		key: 'neumann2011',
		authors: ['Peter M. Neumann'],
		year: 2011,
		title: 'The Mathematical Writings of Évariste Galois',
		venue: 'European Mathematical Society, Heritage of European Mathematics',
		doi: '10.4171/104',
		kind: 'book'
	}
];
