// Works cited in §4.3 Differential forms. DOIs checked against Crossref, urls opened.
import type { Work } from '../index';

export const works: Work[] = [
	{
		key: 'stokes1854',
		authors: ['George Gabriel Stokes'],
		year: 1854,
		title: 'Smith’s Prize examination paper, February 1854',
		venue: 'University of Cambridge; question 8 is the theorem now named after Stokes (transcription by the James Clerk Maxwell Foundation)',
		url: 'https://ClerkMaxwellFoundation.org/SmithsPrizeExam_Stokes.pdf',
		free: true,
		kind: 'web'
	},
	{
		key: 'maxwell1873',
		authors: ['James Clerk Maxwell'],
		year: 1873,
		title: 'A Treatise on Electricity and Magnetism, vol. 1',
		venue: 'Clarendon Press, Oxford',
		url: 'https://en.wikisource.org/wiki/A_Treatise_on_Electricity_and_Magnetism/Preliminary',
		free: true,
		kind: 'book'
	},
	{
		key: 'cartan1899',
		authors: ['Élie Cartan'],
		year: 1899,
		title: 'Sur certaines expressions différentielles et le problème de Pfaff',
		venue: 'Annales scientifiques de l’École Normale Supérieure, 3e série, 16, 239–332',
		doi: '10.24033/asens.467',
		url: 'https://www.numdam.org/item/ASENS_1899_3_16__239_0/',
		free: true,
		kind: 'paper'
	},
	{
		key: 'mtw1973',
		authors: ['Charles W. Misner', 'Kip S. Thorne', 'John Archibald Wheeler'],
		year: 1973,
		title: 'Gravitation',
		venue: 'W. H. Freeman (reprinted by Princeton University Press, 2017)',
		url: 'https://press.princeton.edu/books/hardcover/9780691177793/gravitation',
		kind: 'book'
	},
	{
		key: 'crane-forms2019',
		authors: ['Keenan Crane'],
		year: 2019,
		title: 'Differential forms in ℝⁿ',
		venue: 'lecture slides, Discrete Differential Geometry (CMU 15-458/858), Carnegie Mellon University',
		url: 'https://brickisland.net/DDGSpring2019/wp-content/uploads/2019/02/DDG_458_SP19_Lecture05_DifferentialForms.pdf',
		free: true,
		kind: 'notes'
	},
	{
		key: 'maia2025',
		authors: ['Duarte Maia'],
		year: 2025,
		title: 'On the visualization of differential forms',
		venue: 'notes, University of Chicago (a transcription of two 2021 blog posts, based on an informal note by Dan Piponi)',
		url: 'https://math.uchicago.edu/~dmaia/documents/visualizing_diff_forms.pdf',
		free: true,
		kind: 'notes'
	},
	{
		key: 'gatterdam1981',
		authors: ['Ronald W. Gatterdam'],
		year: 1981,
		title: 'The planimeter as an example of Green’s theorem',
		venue: 'The American Mathematical Monthly 88(9), 701–704',
		doi: '10.1080/00029890.1981.11995347',
		kind: 'paper'
	},
	{
		key: 'foote-levi-tabachnikov2013',
		authors: ['Robert Foote', 'Mark Levi', 'Serge Tabachnikov'],
		year: 2013,
		title: 'Tractrices, bicycle tire tracks, hatchet planimeters, and a 100-year-old conjecture',
		venue: 'The American Mathematical Monthly 120(3), 199–216',
		doi: '10.4169/amer.math.monthly.120.03.199',
		arxiv: '1207.0834',
		url: 'https://arxiv.org/abs/1207.0834',
		free: true,
		kind: 'paper'
	}
];
