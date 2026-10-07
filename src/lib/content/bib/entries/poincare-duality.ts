// Works cited in §4.6 Poincaré duality. DOIs checked against Crossref, urls opened.
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'kepler1619',
		authors: ['Johannes Kepler'],
		year: 1619,
		title: 'Harmonices Mundi',
		venue: 'Linz; Book V translated by Charles Glenn Wallis as Harmonies of the World (1939)',
		kind: 'book'
	},
	{
		key: 'poincare1899',
		authors: ['Henri Poincaré'],
		year: 1899,
		title: 'Complément à l’Analysis situs',
		venue:
			'Rendiconti del Circolo Matematico di Palermo 13, 285–343; English translation by John Stillwell in Papers on Topology (AMS, 2010)',
		doi: '10.1007/BF03024461',
		kind: 'paper'
	},
	{
		key: 'freedman1982',
		authors: ['Michael H. Freedman'],
		year: 1982,
		title: 'The topology of four-dimensional manifolds',
		venue: 'Journal of Differential Geometry 17(3), 357–453',
		doi: '10.4310/jdg/1214437136',
		kind: 'paper'
	},
	{
		key: 'donaldson1983',
		authors: ['Simon K. Donaldson'],
		year: 1983,
		title: 'An application of gauge theory to four-dimensional topology',
		venue: 'Journal of Differential Geometry 18(2), 279–315',
		doi: '10.4310/jdg/1214437665',
		kind: 'paper'
	},
	{
		key: 'ricca-nipoti2011',
		authors: ['Renzo L. Ricca', 'Bernardo Nipoti'],
		year: 2011,
		title: 'Gauss’ linking number revisited',
		venue: 'Journal of Knot Theory and Its Ramifications 20(10), 1325–1343',
		doi: '10.1142/S0218216511009261',
		kind: 'paper'
	},
	{
		key: 'seifert1935',
		authors: ['Herbert Seifert'],
		year: 1935,
		title: 'Über das Geschlecht von Knoten',
		venue: 'Mathematische Annalen 110, 571–592',
		doi: '10.1007/BF01448044',
		kind: 'paper'
	},
	{
		key: 'alexander1928',
		authors: ['James W. Alexander'],
		year: 1928,
		title: 'Topological invariants of knots and links',
		venue: 'Transactions of the American Mathematical Society 30(2), 275–306',
		doi: '10.1090/S0002-9947-1928-1501429-1',
		kind: 'paper'
	}
];
