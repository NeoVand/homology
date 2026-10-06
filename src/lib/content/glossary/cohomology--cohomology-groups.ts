import type { GlossaryEntry } from './types';

const chapter = 'cohomology/cohomology-groups';

export const entries: GlossaryEntry[] = [
	{
		key: 'coefficients',
		term: 'Coefficients',
		def: 'The abelian group \\(G\\) in which cochains take their values, such as \\(\\Z\\), \\(\\R\\) or \\(\\Z/2\\). It is written after a semicolon: \\(C^k(K; G)\\), \\(H^k(K; G)\\). Changing the coefficients changes what a measurement can see.',
		chapter,
		anchor: 'cochain-groups',
		see: ['cochain-group', 'universal-coefficient-theorem']
	},
	{
		key: 'hom-group',
		term: 'Hom group',
		def: 'For abelian groups \\(A\\) and \\(B\\), \\(\\Hom(A, B)\\) is the set of all homomorphisms \\(A \\to B\\), made into a group by adding values: \\((h + h\')(a) = h(a) + h\'(a)\\). Read it as “homs from \\(A\\) to \\(B\\)”.',
		chapter,
		anchor: 'def-cochain-group',
		see: ['cochain-group']
	},
	{
		key: 'cochain-group',
		term: 'Cochain group',
		def: 'The group \\(C^k(K; G) = \\Hom(C_k(K), G)\\) of \\(k\\)-cochains: homomorphisms from \\(k\\)-chains to \\(G\\). Concretely, one value in \\(G\\) on each \\(k\\)-simplex, extended to chains by adding up with multiplicities, so \\(C^k(K;G) \\cong G^{n_k}\\).',
		chapter,
		anchor: 'def-cochain-group',
		see: ['cochain', 'hom-group', 'indicator-cochain']
	},
	{
		key: 'indicator-cochain',
		term: 'Indicator cochain',
		def: 'For a \\(k\\)-simplex \\(\\tau\\), the cochain \\(\\mathbf 1_\\tau\\) that is \\(1\\) on \\(\\tau\\) and \\(0\\) on every other \\(k\\)-simplex. Every cochain is a combination \\(\\varphi = \\sum_\\tau \\varphi(\\tau)\\,\\mathbf 1_\\tau\\); over a field the indicators form the dual basis.',
		chapter,
		anchor: 'cochain-groups',
		see: ['cochain-group', 'dual-basis']
	},
	{
		key: 'coboundary-matrix',
		term: 'Coboundary matrix',
		def: 'The matrix of \\(\\delta_k\\colon C^k \\to C^{k+1}\\) in the bases of indicator cochains. It is the transpose of the boundary matrix: \\(\\delta_k = \\partial_{k+1}^{\\mathsf T}\\).',
		chapter,
		anchor: 'prop-transpose',
		see: ['coboundary-operator', 'transpose']
	},
	{
		key: 'coface',
		term: 'Coface',
		def: 'A simplex one dimension up that has a given simplex \\(\\tau\\) as a face. The coboundary \\(\\delta\\mathbf 1_\\tau\\) is \\(\\pm 1\\) on the cofaces of \\(\\tau\\) and \\(0\\) elsewhere: the boundary looks down to faces, the coboundary looks up to cofaces.',
		chapter,
		anchor: 'the-coboundary-map',
		see: ['coboundary-matrix']
	},
	{
		key: 'cochain-complex',
		term: 'Cochain complex',
		def: 'A sequence of groups and maps \\(C^0 \\xto{\\delta} C^1 \\xto{\\delta} C^2 \\to \\cdots\\) that raise the degree and satisfy \\(\\delta\\circ\\delta = 0\\). The cochains of a complex form one, because \\(\\delta\\delta = 0\\) follows from \\(\\partial\\partial = 0\\).',
		chapter,
		anchor: 'the-coboundary-map',
		see: ['chain-complex', 'cohomology-group']
	},
	{
		key: 'cocycle-group',
		term: 'Cocycle group',
		def: 'The group \\(Z^k = \\ker \\delta_k\\) of \\(k\\)-cochains with zero coboundary. A 1-cocycle is an edge labelling that passes every local test.',
		chapter,
		anchor: 'def-cohomology',
		see: ['cocycle', 'cohomology-group']
	},
	{
		key: 'coboundary-group',
		term: 'Coboundary group',
		def: 'The group \\(B^k = \\im \\delta_{k-1}\\) of \\(k\\)-cochains of the form \\(\\delta g\\). Since \\(\\delta\\delta = 0\\), it sits inside the cocycle group. A 1-coboundary is a gradient.',
		chapter,
		anchor: 'def-cohomology',
		see: ['coboundary', 'cocycle-group']
	},
	{
		key: 'cohomology-group',
		term: 'Cohomology group',
		def: 'The quotient \\(H^k(K; G) = Z^k / B^k = \\ker\\delta_k / \\im\\delta_{k-1}\\): cocycles modulo coboundaries. It collects the global obstructions in degree \\(k\\), with all local detail forgotten.',
		chapter,
		anchor: 'def-cohomology',
		see: ['cocycle-group', 'coboundary-group', 'cohomology-class']
	},
	{
		key: 'cohomology-class',
		term: 'Cohomology class',
		def: 'An element \\([\\varphi] = \\varphi + B^k\\) of a cohomology group: a cocycle up to adding coboundaries.',
		chapter,
		anchor: 'def-cohomology',
		see: ['cohomologous', 'cohomology-group']
	},
	{
		key: 'cohomologous',
		term: 'Cohomologous',
		def: 'Two cocycles are cohomologous when they differ by a coboundary, \\(\\varphi\' = \\varphi + \\delta g\\), so that they define the same cohomology class. Two 1-cocycles on a graph are cohomologous exactly when they have the same loop sums.',
		chapter,
		anchor: 'def-cohomology',
		see: ['cohomology-class']
	},
	{
		key: 'fence',
		term: 'Fence',
		def: 'A picture of a 1-cocycle on a surface: curves crossing the edges, as many times (with sign) as the cocycle’s value on each edge. The value of the cocycle on a closed loop is the number of times the loop crosses the fence, counted with sign. A fence coming from a coboundary looks like the level curves of a function.',
		chapter,
		anchor: 'fences-and-pairing',
		see: ['cocycle', 'kronecker-pairing']
	},
	{
		key: 'kronecker-pairing',
		term: 'Kronecker pairing',
		def: 'The pairing \\(H^k(K;G) \\times H_k(K) \\to G\\), \\(\\langle [\\varphi], [z] \\rangle = \\varphi(z)\\), of a cohomology class with a homology class. It is well defined by Stokes’ formula: coboundaries vanish on cycles, and cocycles vanish on boundaries.',
		chapter,
		anchor: 'prop-pairing',
		see: ['pairing', 'discrete-stokes-theorem']
	},
	{
		key: 'pullback',
		term: 'Pullback',
		def: 'For a map \\(f\\colon X \\to Y\\) and a cochain \\(\\varphi\\) on \\(Y\\), the cochain \\(f^*\\varphi = \\varphi\\circ f_\\sharp\\) on \\(X\\): to measure a chain of \\(X\\), push it into \\(Y\\) and measure there. Its matrix is the transpose of the matrix of \\(f_\\sharp\\).',
		chapter,
		anchor: 'contravariance',
		see: ['induced-map-on-cohomology', 'contravariant']
	},
	{
		key: 'induced-map-on-cohomology',
		term: 'Induced map on cohomology',
		def: 'The homomorphism \\(f^*\\colon H^k(Y; G) \\to H^k(X; G)\\), \\(f^*[\\varphi] = [\\varphi\\circ f_\\sharp]\\), induced by a map \\(f\\colon X \\to Y\\). It goes backwards, satisfies \\((g\\circ f)^* = f^*\\circ g^*\\), and \\(\\langle f^*\\varphi, c\\rangle = \\langle \\varphi, f_* c\\rangle\\).',
		chapter,
		anchor: 'thm-pullback',
		see: ['pullback', 'induced-map', 'contravariant']
	},
	{
		key: 'covariant',
		term: 'Covariant',
		def: 'Said of a rule that turns spaces into groups and maps into homomorphisms going in the same direction, as homology does: \\(f\\colon X \\to Y\\) gives \\(f_*\\colon H_k(X) \\to H_k(Y)\\).',
		chapter,
		anchor: 'contravariance',
		see: ['contravariant']
	},
	{
		key: 'contravariant',
		term: 'Contravariant',
		def: 'Said of a rule that turns maps into homomorphisms going in the opposite direction, as cohomology does: \\(f\\colon X \\to Y\\) gives \\(f^*\\colon H^k(Y) \\to H^k(X)\\). Preimages and transposes are contravariant too.',
		chapter,
		anchor: 'contravariance',
		see: ['covariant', 'pullback']
	},
	{
		key: 'torsion-shift',
		term: 'Torsion shift',
		def: 'The fact that torsion in homology degree \\(k\\) appears in integer cohomology in degree \\(k+1\\). For the projective plane, \\(H_1 = \\Z/2\\) but \\(H^1(\\RP^2;\\Z) = 0\\) and \\(H^2(\\RP^2;\\Z) = \\Z/2\\). The same entry of a boundary matrix is responsible for both.',
		chapter,
		anchor: 'torsion-moves-up',
		see: ['universal-coefficient-theorem', 'torsion']
	},
	{
		key: 'mod-2-cohomology',
		term: 'Mod 2 cohomology',
		def: 'Cohomology \\(H^k(K;\\Z/2)\\) with values in \\(\\Z/2\\), where \\(1 + 1 = 0\\). It needs no orientations and sees one-sidedness: every group of \\(\\RP^2\\) with \\(\\Z/2\\) coefficients is \\(\\Z/2\\).',
		chapter,
		anchor: 'torsion-moves-up',
		see: ['coefficients', 'torsion-shift']
	},
	{
		key: 'universal-coefficient-theorem',
		term: 'Universal Coefficient Theorem',
		def: 'For every simplicial complex, \\(H^k(K;G) \\cong \\Hom(H_k(K), G) \\oplus \\Ext(H_{k-1}(K), G)\\). With \\(G = \\Z\\): integer cohomology in degree \\(k\\) is the free part of \\(H_k\\) plus the torsion of \\(H_{k-1}\\). The isomorphism is not natural.',
		chapter,
		anchor: 'thm-uct',
		see: ['ext-group', 'hom-group', 'torsion-shift']
	},
	{
		key: 'ext-group',
		term: 'Ext group',
		def: 'A group \\(\\Ext(A, G)\\) built from abelian groups \\(A\\) and \\(G\\), defined properly in the chapter on homological algebra. For finitely generated groups: \\(\\Ext(\\Z, G) = 0\\), \\(\\Ext(\\Z/n, G) \\cong G/nG\\), and \\(\\Ext\\) of a direct sum is the direct sum.',
		chapter,
		anchor: 'universal-coefficients',
		see: ['universal-coefficient-theorem']
	},
	{
		key: 'real-cohomology',
		term: 'Real cohomology',
		def: 'Cohomology \\(H^k(K;\\R)\\) with real coefficients. It is the dual vector space of \\(H_k(K;\\R)\\), has dimension the \\(k\\)-th Betti number, and cannot see torsion. It is what differential forms compute.',
		chapter,
		anchor: 'universal-coefficients',
		see: ['coefficients', 'betti-number']
	}
];
