// Works cited in §5.2 Homological algebra. DOIs checked against Crossref, urls opened.
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'mclarty2007',
		authors: ['Colin McLarty'],
		year: 2007,
		title: 'The rising sea: Grothendieck on simplicity and generality',
		venue:
			'in J. J. Gray and K. H. Parshall (eds), Episodes in the History of Modern Algebra (1800–1950), AMS/LMS History of Mathematics 32 (preprint, 2003)',
		url: 'https://www.landsburg.com/grothendieck/mclarty1.pdf',
		free: true,
		kind: 'paper'
	},
	{
		key: 'its-my-turn1980',
		authors: ['Claudia Weill'],
		label: 'It’s My Turn',
		year: 1980,
		title: 'It’s My Turn (film, directed by Claudia Weill)',
		venue: 'transcript of the opening lecture at Burkard Polster and Marty Ross, Mathematics Goes to the Movies',
		url: 'https://www.qedcat.com/moviemath/its_my_turn.html',
		free: true,
		kind: 'video'
	},
	{
		key: 'chow2006',
		authors: ['Timothy Y. Chow'],
		year: 2006,
		title: 'You could have invented spectral sequences',
		venue: 'Notices of the American Mathematical Society 53(1), 15–19',
		url: 'https://www.ams.org/notices/200601/fea-chow.pdf',
		free: true,
		kind: 'paper'
	},
	{
		key: 'vakil2008',
		authors: ['Ravi Vakil'],
		year: 2008,
		title: 'Spectral sequences: friend or foe?',
		venue: 'lecture notes, Stanford University (Math 216)',
		url: 'https://math.stanford.edu/~vakil/0708-216/216ss.pdf',
		free: true,
		kind: 'notes'
	},
	{
		key: 'mccleary2001',
		authors: ['John McCleary'],
		year: 2001,
		title: 'A User’s Guide to Spectral Sequences (2nd edition)',
		venue: 'Cambridge University Press, Cambridge Studies in Advanced Mathematics 58',
		doi: '10.1017/CBO9780511626289',
		kind: 'book'
	},
	{
		key: 'serre1951',
		authors: ['Jean-Pierre Serre'],
		year: 1951,
		title: 'Homologie singulière des espaces fibrés. Applications',
		venue: 'Annals of Mathematics 54(3), 425–505',
		doi: '10.2307/1969485',
		kind: 'paper'
	},
	{
		key: 'serre1953',
		authors: ['Jean-Pierre Serre'],
		year: '1953a',
		title: 'Groupes d’homotopie et classes de groupes abéliens',
		venue: 'Annals of Mathematics 58(2), 258–294',
		doi: '10.2307/1969789',
		kind: 'paper'
	},
	{
		key: 'eilenberg-steenrod1945',
		authors: ['Samuel Eilenberg', 'Norman Steenrod'],
		year: 1945,
		title: 'Axiomatic approach to homology theory',
		venue: 'Proceedings of the National Academy of Sciences 31(4), 117–120',
		doi: '10.1073/pnas.31.4.117',
		free: true,
		kind: 'paper'
	},
	{
		key: 'milnor1962',
		authors: ['John Milnor'],
		year: 1962,
		title: 'On axiomatic homology theory',
		venue: 'Pacific Journal of Mathematics 12(1), 337–341',
		doi: '10.2140/pjm.1962.12.337',
		url: 'https://msp.org/pjm/1962/12-1/p26.xhtml',
		free: true,
		kind: 'paper'
	}
];
