// Works cited in 1.2 Equivalence and Quotients. Each DOI was checked against
// Crossref and each url opened; quotations were checked against the text.
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'poincare1908',
		authors: ['Henri Poincaré'],
		year: 1908,
		title: 'Science et méthode',
		venue:
			'Flammarion, Paris; English translation by George Bruce Halsted as “Science and Method” in The Foundations of Science (Science Press, 1913)',
		url: 'https://www.gutenberg.org/ebooks/39713',
		free: true,
		kind: 'book'
	},
	{
		key: 'gauss1801',
		authors: ['Carl Friedrich Gauss'],
		year: 1801,
		title: 'Disquisitiones Arithmeticae',
		venue: 'Gerhard Fleischer, Leipzig; English translation by Arthur A. Clarke (Yale, 1966; Springer, 1986)',
		url: 'https://archive.org/details/disquisitionesa00gaus',
		doi: '10.1007/978-1-4939-7560-0',
		free: true,
		kind: 'book'
	},
	{
		key: 'dubinsky1994',
		authors: ['Ed Dubinsky', 'Jennie Dautermann', 'Uri Leron', 'Rina Zazkis'],
		year: 1994,
		title: 'On learning fundamental concepts of group theory',
		venue: 'Educational Studies in Mathematics 27(3), 267–305',
		doi: '10.1007/BF01273732',
		kind: 'paper'
	},
	{
		key: 'siebert-williams2003',
		authors: ['Daniel Siebert', 'Steven R. Williams'],
		label: 'Siebert & Williams',
		year: 2003,
		title: 'Students’ understanding of ℤn',
		venue: 'Proceedings of the 2003 joint meeting of PME and PME-NA, vol. 4, 167–173',
		url: 'https://files.eric.ed.gov/fulltext/ED501121.pdf',
		free: true,
		kind: 'paper'
	}
];
