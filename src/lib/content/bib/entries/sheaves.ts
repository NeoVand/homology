// Works cited in §4.7 Sheaves and Čech cohomology. DOIs checked against Crossref, urls opened.
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'alexandroff1928',
		authors: ['Paul Alexandroff'],
		year: 1928,
		title: 'Über den allgemeinen Dimensionsbegriff und seine Beziehungen zur elementaren geometrischen Anschauung',
		venue: 'Mathematische Annalen 98, 617–635',
		doi: '10.1007/BF01451612',
		kind: 'paper'
	},
	{
		key: 'cech1932',
		authors: ['Eduard Čech'],
		year: 1932,
		title: 'Théorie générale de l’homologie dans un espace quelconque',
		venue: 'Fundamenta Mathematicae 19, 149–183',
		doi: '10.4064/fm-19-1-149-183',
		kind: 'paper'
	},
	{
		key: 'borsuk1948',
		authors: ['Karol Borsuk'],
		year: 1948,
		title: 'On the imbedding of systems of compacta in simplicial complexes',
		venue: 'Fundamenta Mathematicae 35, 217–234',
		doi: '10.4064/fm-35-1-217-234',
		kind: 'paper'
	},
	{
		key: 'riemann1851',
		authors: ['Bernhard Riemann'],
		year: 1851,
		title: 'Grundlagen für eine allgemeine Theorie der Functionen einer veränderlichen complexen Grösse',
		venue: 'Inauguraldissertation, Göttingen (transcribed by D. R. Wilkins, Trinity College Dublin)',
		url: 'https://www.maths.tcd.ie/pub/HistMath/People/Riemann/Grund/',
		free: true,
		kind: 'thesis'
	},
	{
		key: 'serre1955',
		authors: ['Jean-Pierre Serre'],
		year: 1955,
		title: 'Faisceaux algébriques cohérents',
		venue: 'Annals of Mathematics 61(2), 197–278',
		doi: '10.2307/1969915',
		kind: 'paper'
	},
	{
		key: 'grothendieck1957',
		authors: ['Alexander Grothendieck'],
		year: 1957,
		title: 'Sur quelques points d’algèbre homologique',
		venue: 'Tôhoku Mathematical Journal 9, 119–221',
		doi: '10.2748/tmj/1178244839',
		free: true,
		kind: 'paper'
	},
	{
		key: 'oconnor-robertson-leray',
		authors: ['John J. O’Connor', 'Edmund F. Robertson'],
		label: 'O’Connor & Robertson',
		year: 2001,
		title: 'Jean Leray',
		venue: 'MacTutor History of Mathematics Archive, University of St Andrews',
		url: 'https://mathshistory.st-andrews.ac.uk/Biographies/Leray/',
		free: true,
		kind: 'web'
	},
	{
		key: 'miller2000',
		authors: ['Haynes Miller'],
		year: 2000,
		title: 'Leray in Oflag XVIIA: the origins of sheaf theory, sheaf cohomology, and spectral sequences',
		venue: 'Gazette des Mathématiciens 84 (supplement), 17–34',
		url: 'https://math.mit.edu/~hrm/papers/ss.pdf',
		free: true,
		kind: 'paper'
	},
	{
		key: 'stacks-project',
		authors: ['The Stacks Project Authors'],
		label: 'Stacks Project',
		year: 2026,
		title: 'The Stacks Project',
		venue: 'an open online reference for algebraic geometry, Columbia University',
		url: 'https://stacks.math.columbia.edu',
		free: true,
		kind: 'web'
	},
	{
		key: 'curry2014',
		authors: ['Justin Michael Curry'],
		year: 2014,
		title: 'Sheaves, Cosheaves and Applications',
		venue: 'PhD thesis, University of Pennsylvania',
		arxiv: '1303.3255',
		url: 'https://arxiv.org/abs/1303.3255',
		free: true,
		kind: 'thesis'
	},
	{
		key: 'hansen-ghrist2019',
		authors: ['Jakob Hansen', 'Robert Ghrist'],
		year: 2019,
		title: 'Toward a spectral theory of cellular sheaves',
		venue: 'Journal of Applied and Computational Topology 3, 315–358',
		doi: '10.1007/s41468-019-00038-7',
		arxiv: '1808.01513',
		url: 'https://arxiv.org/abs/1808.01513',
		free: true,
		kind: 'paper'
	},
	{
		key: 'ghrist-cooperband2025',
		authors: ['Robert Ghrist', 'Zoe Cooperband'],
		year: 2025,
		title: 'Obstructions to reality: torsors & visual paradox',
		venue: 'arXiv preprint',
		arxiv: '2507.01226',
		url: 'https://arxiv.org/abs/2507.01226',
		free: true,
		kind: 'paper'
	},
	{
		key: 'rosiak2022',
		authors: ['Daniel Rosiak'],
		year: 2022,
		title: 'Sheaf Theory through Examples',
		venue: 'MIT Press (open access)',
		doi: '10.7551/mitpress/12581.001.0001',
		free: true,
		kind: 'book'
	}
];
