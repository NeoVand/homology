// Works cited in §2.2 Gluing Spaces Together. Each DOI was checked against
// Crossref and each url opened (October 2026).
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'munkres2000',
		authors: ['James R. Munkres'],
		year: 2000,
		title: 'Topology (2nd edition)',
		venue: 'Prentice Hall',
		kind: 'book'
	},
	{
		key: 'klein1882',
		authors: ['Felix Klein'],
		year: 1882,
		title: 'Über Riemanns Theorie der algebraischen Functionen und ihrer Integrale',
		venue: 'Teubner, Leipzig',
		url: 'https://www.gutenberg.org/ebooks/20313',
		free: true,
		kind: 'book'
	},
	{
		key: 'boy1903',
		authors: ['Werner Boy'],
		year: 1903,
		title: 'Über die Curvatura integra und die Topologie geschlossener Flächen',
		venue: 'Mathematische Annalen 57, 151–184',
		doi: '10.1007/BF01444342',
		kind: 'paper'
	},
	{
		key: 'kusner1987',
		authors: ['Rob Kusner'],
		year: 1987,
		title: 'Conformal geometry and complete minimal surfaces',
		venue: 'Bulletin of the American Mathematical Society 17(2), 291–295',
		doi: '10.1090/S0273-0979-1987-15564-9',
		free: true,
		kind: 'paper'
	},
	{
		key: 'schwartz2025',
		authors: ['Richard Evan Schwartz'],
		year: 2025,
		title: 'The optimal paper Moebius band',
		venue: 'Annals of Mathematics 201(1), 291–305',
		doi: '10.4007/annals.2025.201.1.5',
		arxiv: '2308.12641',
		url: 'https://arxiv.org/abs/2308.12641',
		free: true,
		kind: 'paper'
	}
];
