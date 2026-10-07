// Works cited in §4.4 de Rham cohomology. DOIs checked against Crossref, urls opened.
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'derham1931',
		authors: ['Georges de Rham'],
		label: 'de Rham',
		year: 1931,
		title: 'Sur l’analysis situs des variétés à n dimensions',
		venue: 'Journal de Mathématiques Pures et Appliquées, 9e série, 10, 115–200 (his thesis)',
		url: 'https://numdam.org/item/JMPA_1931_9_10__115_0/',
		free: true,
		kind: 'paper'
	},
	{
		key: 'oconnor-robertson-derham',
		authors: ['John J. O’Connor', 'Edmund F. Robertson'],
		label: 'O’Connor & Robertson',
		year: 2015,
		title: 'Georges de Rham',
		venue: 'MacTutor History of Mathematics Archive, University of St Andrews (quotes R. Bott, Notices of the AMS 38 (1991), 114–115)',
		url: 'https://mathshistory.st-andrews.ac.uk/Biographies/De_Rham/',
		free: true,
		kind: 'web'
	},
	{
		key: 'ehrenberg-siday1949',
		authors: ['Werner Ehrenberg', 'Raymond E. Siday'],
		year: 1949,
		title: 'The refractive index in electron optics and the principles of dynamics',
		venue: 'Proceedings of the Physical Society B 62(1), 8–21',
		doi: '10.1088/0370-1301/62/1/303',
		kind: 'paper'
	},
	{
		key: 'tonomura1986',
		authors: ['Akira Tonomura', 'Nobuyuki Osakabe', 'Tsuyoshi Matsuda', 'Takeshi Kawasaki', 'Junji Endo', 'Shinichiro Yano', 'Hiroji Yamada'],
		year: 1986,
		title: 'Evidence for Aharonov–Bohm effect with magnetic field completely shielded from electron wave',
		venue: 'Physical Review Letters 56, 792–795',
		doi: '10.1103/PhysRevLett.56.792',
		kind: 'paper'
	}
];
