// Works cited in §3.1 Cycles and boundaries. DOIs checked against Crossref;
// urls opened (math.stackexchange.com answers 403 to scripts; its API was used
// to read the answer instead).
import type { Work } from '../index';

// Also cited in §3.1 and defined elsewhere: richeson2021 and tubbenhauer2021
// (shape-of-a-question.ts), kirchhoff1847 (euler-characteristic.ts).

export const works: Work[] = [
	{
		key: 'hierholzer1873',
		authors: ['Carl Hierholzer', 'Christian Wiener'],
		label: 'Hierholzer',
		year: 1873,
		title: 'Ueber die Möglichkeit, einen Linienzug ohne Wiederholung und ohne Unterbrechung zu umfahren',
		venue: 'Mathematische Annalen 6, 30–32 (published after Hierholzer’s death by Christian Wiener)',
		doi: '10.1007/BF01442866',
		kind: 'paper'
	},
	{
		key: 'diestel2025',
		authors: ['Reinhard Diestel'],
		year: 2025,
		title: 'Graph Theory (6th edition)',
		venue: 'Springer, Graduate Texts in Mathematics 173 (free preview of the main text at diestel-graph-theory.com)',
		url: 'https://diestel-graph-theory.com/basic.html',
		doi: '10.1007/978-3-662-70107-2',
		kind: 'book'
	},
	{
		key: 'kirby2016',
		authors: ['Edward C. Kirby', 'Roger B. Mallion', 'Paul Pollak', 'Paweł J. Skrzyński'],
		year: 2016,
		title: 'What Kirchhoff actually did concerning spanning trees in electrical networks and its relationship to modern graph-theoretical work',
		venue: 'Croatica Chemica Acta 89(4)',
		url: 'https://hrcak.srce.hr/en/172895',
		doi: '10.5562/cca2995',
		free: true,
		kind: 'paper'
	},
	{
		key: 'kun2013',
		authors: ['Jeremy Kun'],
		year: 2013,
		title: 'Homology Theory — A Primer',
		venue: 'Math ∩ Programming (blog), 3 April 2013',
		url: 'https://jeremykun.com/2013/04/03/homology-theory-a-primer/',
		free: true,
		kind: 'web'
	},
	{
		key: 'mse40151',
		authors: ['“Josh”'],
		label: 'Math StackExchange',
		year: 2011,
		title: 'Answer to “Intuition of the meaning of homology groups”',
		venue: 'Mathematics Stack Exchange, question 40149, answer 40151 (19 May 2011)',
		url: 'https://math.stackexchange.com/a/40151',
		free: true,
		kind: 'web'
	}
];
