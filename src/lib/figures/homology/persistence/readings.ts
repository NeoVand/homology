// Annotated reading list for §3.7 (FurtherReading items).
export interface Reading {
	title: string;
	author: string;
	url?: string;
	note: string;
	kind?: 'book' | 'paper' | 'notes' | 'video' | 'web' | 'interactive';
	free?: boolean;
}

export const readings: Reading[] = [
	{
		title: 'Barcodes: The Persistent Topology of Data',
		author: 'Robert Ghrist, Bulletin of the AMS 45 (2008) 61–75',
		url: 'https://www.ams.org/journals/bull/2008-45-01/S0273-0979-07-01191-3/',
		note: 'The best short introduction: Čech and Rips complexes, persistence, barcodes, and the story of the natural-image Klein bottle. Readable with this chapter and some linear algebra.',
		kind: 'paper',
		free: true
	},
	{
		title: 'Computational Topology: An Introduction',
		author: 'Herbert Edelsbrunner & John Harer, American Mathematical Society (2010)',
		url: 'https://doi.org/10.1090/mbk/069',
		note: 'The standard textbook of the subject, by two of its founders: complexes, the reduction algorithm and its pairing lemma, the elder rule, stability. Advanced undergraduate to graduate.',
		kind: 'book'
	},
	{
		title: 'A roadmap for the computation of persistent homology',
		author: 'Nina Otter, Mason Porter, Ulrike Tillmann, Peter Grindrod & Heather Harrington, EPJ Data Science 6 (2017)',
		url: 'https://arxiv.org/abs/1506.08903',
		note: 'A practitioner’s guide from data to barcode — filtrations, algorithms, software — with a benchmark of the main libraries and a tutorial.',
		kind: 'paper',
		free: true
	},
	{
		title: 'An introduction to topological data analysis: fundamental and practical aspects for data scientists',
		author: 'Frédéric Chazal & Bertrand Michel, Frontiers in Artificial Intelligence (2021)',
		url: 'https://arxiv.org/abs/1710.04019',
		note: 'Rips and Čech complexes, the nerve theorem and stability with precise constants (note their diameter convention for Rips), statistics of diagrams, and Python examples with GUDHI.',
		kind: 'paper',
		free: true
	},
	{
		title: 'Topology and data',
		author: 'Gunnar Carlsson, Bulletin of the AMS 46 (2009) 255–308',
		url: 'https://www.ams.org/journals/bull/2009-46-02/S0273-0979-09-01249-X/',
		note: 'The manifesto of topological data analysis by one of its founders: why topology suits data, persistence, and the image-patch study in detail. More demanding than Ghrist’s survey.',
		kind: 'paper',
		free: true
	},
	{
		title: 'What is … persistent homology?',
		author: 'Shmuel Weinberger, Notices of the AMS 58 (2011) 36–39',
		url: 'https://www.ams.org/notices/201101/rtx110100036p.pdf',
		note: 'Two pages of intuition: Seurat, barcodes, the stability theorem and a glimpse of uses inside pure mathematics.',
		kind: 'paper',
		free: true
	},
	{
		title: 'Introduction to Persistent Homology (video)',
		author: 'Matthew Wright (2016)',
		url: 'https://www.youtube.com/watch?v=2PSqWBIrn90',
		note: 'An animated introduction for viewers with no algebraic topology, drawing the growing complex and the barcode side by side — like Figure 6 in motion. Accompanies a short paper in the SoCG 2016 proceedings.',
		kind: 'video',
		free: true
	},
	{
		title: 'Ripser',
		author: 'Ulrich Bauer; paper in the Journal of Applied and Computational Topology 5 (2021) 391–423',
		url: 'https://github.com/Ripser/ripser',
		note: 'The fast, compact program for Vietoris–Rips barcodes, built on clearing, cohomology and implicit matrices. Try it in the browser at live.ripser.org.',
		kind: 'interactive',
		free: true
	},
	{
		title: 'GUDHI',
		author: 'The GUDHI project (Inria)',
		url: 'https://gudhi.inria.fr/',
		note: 'An open-source C++ library with a Python interface for topological data analysis: Rips, Čech, alpha and cubical complexes, persistence, bottleneck distances, and many tutorials.',
		kind: 'interactive',
		free: true
	}
];
