// Works cited in §2.6 The Euler Characteristic. DOIs checked against Crossref,
// urls opened (October 2026). (rado1925 lives in simplicial-complexes.ts.)
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'euler1758b',
		authors: ['Leonhard Euler'],
		year: 1758,
		title: 'Demonstratio nonnullarum insignium proprietatum, quibus solida hedris planis inclusa sunt praedita',
		venue: 'Novi Commentarii academiae scientiarum Petropolitanae 4, 140–160 (Euler Archive E231)',
		url: 'https://scholarlycommons.pacific.edu/euler-works/231/',
		free: true,
		kind: 'paper'
	},
	{
		key: 'federico1982',
		authors: ['P. J. Federico'],
		year: 1982,
		title: 'Descartes on Polyhedra: A Study of the De Solidorum Elementis',
		venue: 'Springer, Sources in the History of Mathematics and Physical Sciences 4',
		doi: '10.1007/978-1-4612-5759-2',
		kind: 'book'
	},
	{
		key: 'cauchy1813',
		authors: ['Augustin-Louis Cauchy'],
		year: 1813,
		title: 'Recherches sur les polyèdres. Premier mémoire',
		venue: 'Journal de l’École polytechnique 9 (cahier 16), 68–86; read to the Institut in February 1811',
		kind: 'paper'
	},
	{
		key: 'lhuilier1813',
		authors: ['Simon Lhuilier'],
		year: 1813,
		title:
			'Mémoire sur la polyédrométrie, contenant une démonstration directe du théorème d’Euler sur les polyèdres, et un examen des diverses exceptions auxquelles ce théorème est assujetti',
		venue: 'Annales de Mathématiques pures et appliquées 3 (1812–1813), 169–189 (the second part reported by the editor, J. D. Gergonne)',
		url: 'https://www.numdam.org/item/AMPA_1812-1813__3__169_0/',
		free: true,
		kind: 'paper'
	},
	{
		key: 'vonstaudt1847',
		authors: ['Karl Georg Christian von Staudt'],
		label: 'von Staudt',
		year: 1847,
		title: 'Geometrie der Lage',
		venue: 'Bauer und Raspe, Nürnberg',
		url: 'https://archive.org/details/geometriederlage00stauuoft',
		free: true,
		kind: 'book'
	},
	{
		key: 'milnor1961',
		authors: ['John Milnor'],
		year: 1961,
		title: 'Two complexes which are homeomorphic but combinatorially distinct',
		venue: 'Annals of Mathematics 74(3), 575–590',
		doi: '10.2307/1970299',
		kind: 'paper'
	},
	{
		key: 'kirchhoff1847',
		authors: ['Gustav Kirchhoff'],
		year: 1847,
		title:
			'Ueber die Auflösung der Gleichungen, auf welche man bei der Untersuchung der linearen Vertheilung galvanischer Ströme geführt wird',
		venue: 'Annalen der Physik 148(12), 497–508',
		doi: '10.1002/andp.18471481202',
		kind: 'paper'
	}
];
