// The people whose portraits appear in the book's history boxes. Each portrait
// is a drawing made with an image model from a historical portrait (references
// from the MacTutor History of Mathematics archive), in the book's gold-line style.

export interface Person {
	key: string;
	name: string;
	/** life dates as printed under the portrait */
	dates: string;
	/** MacTutor biography slug, if MacTutor has one */
	mactutor?: string;
	/** a biography to read when MacTutor has none */
	url?: string;
	/** no authentic likeness survives: the drawing follows a later imagined one */
	imagined?: boolean;
}

const P = (key: string, name: string, dates: string, mactutor?: string, extra: Partial<Person> = {}): Person => ({
	key,
	name,
	dates,
	mactutor,
	...extra
});

export const people: Record<string, Person> = Object.fromEntries(
	[
		P('pythagoras', 'Pythagoras', 'c. 570 – c. 490 BC', 'Pythagoras', { imagined: true }),
		P('aristotle', 'Aristotle', '384 – 322 BC', 'Aristotle'),
		P('liu-hui', 'Liu Hui', 'c. 220 – c. 280', undefined, { imagined: true, url: 'https://en.wikipedia.org/wiki/Liu_Hui' }),
		P('kepler', 'Johannes Kepler', '1571 – 1630', 'Kepler'),
		P('descartes', 'René Descartes', '1596 – 1650', 'Descartes'),
		P('leibniz', 'Gottfried Wilhelm Leibniz', '1646 – 1716', 'Leibniz'),
		P('euler', 'Leonhard Euler', '1707 – 1783', 'Euler'),
		P('lagrange', 'Joseph-Louis Lagrange', '1736 – 1813', 'Lagrange'),
		// Simon Lhuilier (1750–1840) has a history box in 2.6 but no portrait: no likeness of him is known.
		P('gauss', 'Carl Friedrich Gauss', '1777 – 1855', 'Gauss'),
		P('cauchy', 'Augustin-Louis Cauchy', '1789 – 1857', 'Cauchy'),
		P('mobius', 'August Ferdinand Möbius', '1790 – 1868', 'Mobius'),
		P('abel', 'Niels Henrik Abel', '1802 – 1829', 'Abel'),
		P('galois', 'Évariste Galois', '1811 – 1832', 'Galois'),
		P('listing', 'Johann Benedict Listing', '1808 – 1882', 'Listing'),
		P('stokes', 'George Gabriel Stokes', '1819 – 1903', 'Stokes'),
		P('cayley', 'Arthur Cayley', '1821 – 1895', 'Cayley'),
		P('betti', 'Enrico Betti', '1823 – 1892', 'Betti'),
		P('kirchhoff', 'Gustav Kirchhoff', '1824 – 1887', 'Kirchhoff'),
		P('kelvin', 'William Thomson, Lord Kelvin', '1824 – 1907', 'Thomson'),
		P('riemann', 'Bernhard Riemann', '1826 – 1866', 'Riemann'),
		P('smith', 'Henry John Stephen Smith', '1826 – 1883', 'Smith'),
		P('dedekind', 'Richard Dedekind', '1831 – 1916', 'Dedekind'),
		P('tait', 'Peter Guthrie Tait', '1831 – 1901', 'Tait'),
		P('jordan', 'Camille Jordan', '1838 – 1922', 'Jordan'),
		P('cantor', 'Georg Cantor', '1845 – 1918', 'Cantor'),
		P('klein', 'Felix Klein', '1849 – 1925', 'Klein'),
		P('poincare', 'Henri Poincaré', '1854 – 1912', 'Poincare'),
		P('dyck', 'Walther von Dyck', '1856 – 1934', 'Von_Dyck'),
		P('hilbert', 'David Hilbert', '1862 – 1943', 'Hilbert'),
		P('hausdorff', 'Felix Hausdorff', '1868 – 1942', 'Hausdorff'),
		P('elie-cartan', 'Élie Cartan', '1869 – 1951', 'Cartan'),
		P('heegaard', 'Poul Heegaard', '1871 – 1948', 'Heegaard'),
		P('frechet', 'Maurice Fréchet', '1878 – 1973', 'Frechet'),
		P('brouwer', 'L. E. J. Brouwer', '1881 – 1966', 'Brouwer'),
		P('noether', 'Emmy Noether', '1882 – 1935', 'Noether_Emmy'),
		P('lefschetz', 'Solomon Lefschetz', '1884 – 1972', 'Lefschetz'),
		P('weyl', 'Hermann Weyl', '1885 – 1955', 'Weyl'),
		P('mayer', 'Walther Mayer', '1887 – 1948', undefined, { url: 'https://en.wikipedia.org/wiki/Walther_Mayer' }),
		P('alexander', 'James Waddell Alexander', '1888 – 1971', 'Alexander'),
		P('vietoris', 'Leopold Vietoris', '1891 – 2002', 'Vietoris'),
		P('reidemeister', 'Kurt Reidemeister', '1893 – 1971', 'Reidemeister'),
		P('cech', 'Eduard Čech', '1893 – 1960', 'Cech'),
		P('hopf', 'Heinz Hopf', '1894 – 1971', 'Hopf'),
		P('alexandrov', 'Pavel Alexandrov', '1896 – 1982', 'Aleksandrov'),
		P('lionel-penrose', 'Lionel Penrose', '1898 – 1972', undefined, { url: 'https://en.wikipedia.org/wiki/Lionel_Penrose' }),
		P('artin', 'Emil Artin', '1898 – 1962', 'Artin'),
		P('escher', 'M. C. Escher', '1898 – 1972', undefined, { url: 'https://en.wikipedia.org/wiki/M._C._Escher' }),
		P('dirac', 'Paul Dirac', '1902 – 1984', 'Dirac'),
		P('kolmogorov', 'Andrey Kolmogorov', '1903 – 1987', 'Kolmogorov'),
		P('de-rham', 'Georges de Rham', '1903 – 1990', 'De_Rham'),
		P('cartan', 'Henri Cartan', '1904 – 2008', 'Cartan_Henri'),
		P('hurewicz', 'Witold Hurewicz', '1904 – 1956', 'Hurewicz'),
		P('leray', 'Jean Leray', '1906 – 1998', 'Leray'),
		P('whitney', 'Hassler Whitney', '1907 – 1989', 'Whitney'),
		P('seifert', 'Herbert Seifert', '1907 – 1996', 'Seifert'),
		P('mac-lane', 'Saunders Mac Lane', '1909 – 2005', 'MacLane'),
		P('stiefel', 'Eduard Stiefel', '1909 – 1978', 'Stiefel'),
		P('steenrod', 'Norman Steenrod', '1910 – 1971', 'Steenrod'),
		P('chern', 'Shiing-Shen Chern', '1911 – 2004', 'Chern'),
		P('eilenberg', 'Samuel Eilenberg', '1913 – 1998', 'Eilenberg'),
		P('bott', 'Raoul Bott', '1923 – 2005', 'Bott'),
		P('hirzebruch', 'Friedrich Hirzebruch', '1927 – 2012', 'Hirzebruch'),
		P('grothendieck', 'Alexander Grothendieck', '1928 – 2014', 'Grothendieck'),
		P('conway', 'John Horton Conway', '1937 – 2020', 'Conway'),
		P('vaughan-jones', 'Vaughan Jones', '1952 – 2020', 'Jones_Vaughan'),
		P('atiyah', 'Michael Atiyah', '1929 – 2019', 'Atiyah')
	].map((p) => [p.key, p])
);

export const biographyLink = (p: Person) =>
	p.mactutor ? `https://mathshistory.st-andrews.ac.uk/Biographies/${p.mactutor}/` : p.url;
