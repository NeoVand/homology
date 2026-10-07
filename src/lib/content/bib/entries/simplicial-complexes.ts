// Works cited in §2.5 Simplicial Complexes. DOIs checked against Crossref,
// urls opened (October 2026).
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'weyl1939',
		authors: ['Hermann Weyl'],
		year: 1939,
		title: 'Invariants',
		venue: 'Duke Mathematical Journal 5(3), 489–502',
		doi: '10.1215/S0012-7094-39-00540-5',
		kind: 'paper'
	},
	{
		key: 'mobius1827',
		authors: ['August Ferdinand Möbius'],
		year: 1827,
		title: 'Der barycentrische Calcul',
		venue: 'Johann Ambrosius Barth, Leipzig',
		url: 'https://archive.org/details/10082429bsb',
		free: true,
		kind: 'book'
	},
	{
		key: 'lutz2008',
		authors: ['Frank H. Lutz'],
		year: 2008,
		title: 'Enumeration and random realization of triangulated surfaces',
		venue: 'in A. I. Bobenko et al. (eds.), Discrete Differential Geometry, Oberwolfach Seminars 38, Birkhäuser, 235–253',
		doi: '10.1007/978-3-7643-8621-4_12',
		arxiv: 'math/0506316',
		url: 'https://arxiv.org/abs/math/0506316',
		free: true,
		kind: 'paper'
	},
	{
		key: 'csaszar1949',
		authors: ['Ákos Császár'],
		year: 1949,
		title: 'A polyhedron without diagonals',
		venue: 'Acta Scientiarum Mathematicarum (Szeged) 13, 140–142',
		kind: 'paper'
	},
	{
		key: 'franklin1934',
		authors: ['Philip Franklin'],
		year: 1934,
		title: 'A six color problem',
		venue: 'Journal of Mathematics and Physics 13, 363–369',
		doi: '10.1002/sapm1934131363',
		kind: 'paper'
	},
	{
		key: 'rado1925',
		authors: ['Tibor Radó'],
		year: 1925,
		title: 'Über den Begriff der Riemannschen Fläche',
		venue: 'Acta Scientiarum Mathematicarum (Szeged) 2, 101–121',
		kind: 'paper'
	},
	{
		key: 'manolescu2016',
		authors: ['Ciprian Manolescu'],
		year: 2016,
		title: 'Pin(2)-equivariant Seiberg–Witten Floer homology and the Triangulation Conjecture',
		venue: 'Journal of the American Mathematical Society 29, 147–176',
		doi: '10.1090/jams829',
		arxiv: '1303.2354',
		url: 'https://arxiv.org/abs/1303.2354',
		free: true,
		kind: 'paper'
	},
	{
		key: 'whitehead1949',
		authors: ['J. H. C. Whitehead'],
		year: 1949,
		title: 'Combinatorial homotopy. I',
		venue: 'Bulletin of the American Mathematical Society 55(3), 213–245',
		doi: '10.1090/S0002-9904-1949-09175-9',
		url: 'https://www.ams.org/journals/bull/1949-55-03/S0002-9904-1949-09175-9/',
		free: true,
		kind: 'paper'
	}
];
