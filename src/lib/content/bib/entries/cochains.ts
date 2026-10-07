// Works cited in §4.1 Cochains (several are cited again in §4.2).
// arXiv ids and urls opened; quotations checked against the texts.
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'baez2010',
		authors: ['John Baez'],
		year: 2010,
		title: 'This Week’s Finds in Mathematical Physics (Week 293)',
		venue: 'online column, 5 February 2010',
		url: 'https://math.ucr.edu/home/baez/week293.html',
		free: true,
		kind: 'web'
	},
	{
		key: 'ghrist-cooperband2025',
		authors: ['Robert Ghrist', 'Zoe Cooperband'],
		year: 2025,
		title: 'Obstructions to reality: torsors & visual paradox',
		venue: 'preprint',
		arxiv: '2507.01226',
		url: 'https://arxiv.org/abs/2507.01226',
		free: true,
		kind: 'paper'
	},
	{
		key: 'ghrist-ghrist2026',
		authors: ['Lewis Ghrist', 'Robert Ghrist'],
		year: 2026,
		title: 'Impossible by degrees: cohomology & bistable visual paradox',
		venue: 'preprint',
		arxiv: '2602.09313',
		url: 'https://arxiv.org/abs/2602.09313',
		free: true,
		kind: 'paper'
	},
	{
		// the plywood models themselves; the link is the museum's catalogue entry
		key: 'penrose-models',
		authors: ['Roger Penrose', 'Lionel S. Penrose'],
		year: '1955–59',
		title: 'First models of the “impossible triangle” and “impossible staircase” (birch plywood)',
		venue: 'Science Museum Group Collection, London, object 1982-899',
		url: 'https://collection.sciencemuseumgroup.org.uk/objects/co59923',
		free: true,
		kind: 'web'
	}
];
