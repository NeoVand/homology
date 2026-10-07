import type { GlossaryEntry } from './types';

const chapter = 'cohomology/characteristic-classes';

export const entries: GlossaryEntry[] = [
	{
		key: 'vector-bundle',
		term: 'Vector bundle',
		def: 'A continuously varying family of vector spaces (the fibres) over a base space, which over small open sets looks like a product \\(U\\times\\R^n\\). Examples: the tangent bundle of a surface, the cylinder and the Möbius band over a circle.',
		chapter,
		anchor: 'def-vector-bundle',
		see: ['fibre', 'line-bundle', 'trivial-bundle']
	},
	{
		key: 'fibre',
		term: 'Fibre',
		def: 'The vector space \\(E_b = \\pi^{-1}(b)\\) of a vector bundle \\(\\pi\\colon E\\to B\\) sitting over a point \\(b\\) of the base.',
		chapter,
		anchor: 'def-vector-bundle'
	},
	{
		key: 'line-bundle',
		term: 'Line bundle',
		def: 'A vector bundle whose fibres are lines (rank 1). Over the circle there are two real ones: the cylinder and the Möbius band.',
		chapter,
		anchor: 'def-vector-bundle'
	},
	{
		key: 'trivial-bundle',
		term: 'Trivial bundle',
		def: 'A vector bundle isomorphic to a product \\(B\\times\\R^n\\). A line bundle is trivial exactly when it has a nowhere-zero section.',
		chapter,
		anchor: 'def-vector-bundle'
	},
	{
		key: 'tangent-bundle',
		term: 'Tangent bundle',
		def: 'The vector bundle \\(TM\\) whose fibre over a point \\(p\\) is the tangent space \\(T_pM\\). Its sections are vector fields.',
		chapter
	},
	{
		key: 'transition-function',
		term: 'Transition function',
		def: 'For a bundle trivialised over overlapping open sets \\(U_i\\), the invertible linear maps \\(g_{ij}(b)\\) comparing the two coordinate systems on \\(U_i\\cap U_j\\). They satisfy the cocycle condition \\(g_{ik} = g_{ij}g_{jk}\\).',
		chapter
	},
	{
		key: 'bundle-section',
		term: 'Section of a bundle',
		def: 'A continuous choice \\(s(b)\\in E_b\\) of one vector in every fibre of a vector bundle. The zero section picks \\(0\\) everywhere.',
		chapter,
		anchor: 'def-section'
	},
	{
		key: 'vector-field',
		term: 'Vector field',
		def: 'A continuous choice of a tangent arrow at every point of a surface or manifold — a section of its tangent bundle.',
		chapter,
		anchor: 'def-section'
	},
	{
		key: 'stiefel-whitney-class',
		term: 'Stiefel–Whitney class w₁',
		def: 'The class \\(w_1(E)\\in H^1(B;\\Z/2)\\) of the signs of the transition functions of a real bundle. It vanishes exactly when the bundle is orientable; for the Möbius band it is nonzero.',
		chapter,
		anchor: 'def-w1'
	},
	{
		key: 'index-of-a-zero',
		term: 'Index of a zero',
		def: 'The number of turns made by the arrow of a vector field as you walk once anticlockwise around a small loop enclosing an isolated zero: source, sink and centre \\(+1\\), saddle \\(-1\\).',
		chapter,
		anchor: 'def-index'
	},
	{
		key: 'poincare-hopf-theorem',
		term: 'Poincaré–Hopf theorem',
		def: 'For a vector field with finitely many zeros on a closed manifold, the indices of the zeros add up to the Euler characteristic.',
		chapter,
		anchor: 'thm-poincare-hopf'
	},
	{
		key: 'euler-class',
		term: 'Euler class',
		def: 'The characteristic class \\(e(E)\\in H^n(B;\\Z)\\) of an oriented rank-\\(n\\) bundle: the obstruction to a nowhere-zero section, the signed count of zeros of a generic section. For a tangent bundle, \\(e(TM) = \\chi(M)\\).',
		chapter,
		anchor: 'def-euler-class'
	},
	{
		key: 'characteristic-class',
		term: 'Characteristic class',
		def: 'A cohomology class attached to every vector bundle, natural under pulling back along maps and zero for trivial bundles; it measures how the bundle twists.',
		chapter,
		anchor: 'def-characteristic-class'
	},
	{
		key: 'chern-class',
		term: 'First Chern class',
		def: 'The characteristic class \\(c_1(L)\\in H^2(B;\\Z)\\) of a complex line bundle. Complex line bundles are classified by it; over the sphere it is a single integer, the Chern number.',
		chapter,
		anchor: 'def-chern'
	},
	{
		key: 'chern-number',
		term: 'Chern number',
		def: 'The integer obtained by evaluating a Chern class on a closed surface — for a bundle over the sphere, the winding number \\(n\\) of its transition function \\(e^{in\\varphi}\\).',
		chapter,
		anchor: 'def-chern'
	},
	{
		key: 'curvature-of-a-curve',
		term: 'Curvature of a curve',
		def: 'The rate \\(\\kappa = d\\theta/ds\\) at which the direction of a curve turns per unit length; \\(1/r\\) for a circle of radius \\(r\\).',
		chapter
	},
	{
		key: 'turning-number',
		term: 'Turning number',
		def: 'The total turning \\(\\oint\\kappa\\,ds\\) of a closed plane curve divided by \\(2\\pi\\): always an integer, \\(\\pm1\\) for a simple closed curve.',
		chapter
	},
	{
		key: 'principal-curvatures',
		term: 'Principal curvatures',
		def: 'The largest and smallest curvatures \\(k_1, k_2\\) of the curves cut out of a surface by planes through its normal line at a point.',
		chapter
	},
	{
		key: 'gaussian-curvature',
		term: 'Gaussian curvature',
		def: '\\(K = k_1k_2\\), the product of the principal curvatures: positive on a sphere, zero on a cylinder, negative on a saddle. By the Theorema Egregium it can be measured from inside the surface.',
		chapter,
		anchor: 'def-gaussian-curvature'
	},
	{
		key: 'theorema-egregium',
		term: 'Theorema Egregium',
		def: 'Gauss’s “remarkable theorem” (1827): bending a surface without stretching it does not change its Gaussian curvature.',
		chapter
	},
	{
		key: 'geodesic',
		term: 'Geodesic',
		def: 'A straightest possible path on a surface; on a sphere, an arc of a great circle.',
		chapter
	},
	{
		key: 'angle-excess',
		term: 'Angle excess',
		def: 'For a geodesic triangle, \\(\\alpha+\\beta+\\gamma-\\pi\\). Gauss proved it equals the total curvature \\(\\iint_T K\\,dA\\) inside the triangle.',
		chapter,
		anchor: 'thm-angle-excess'
	},
	{
		key: 'angle-defect',
		term: 'Angle defect',
		def: 'At a vertex of a triangulated surface, \\(2\\pi\\) minus the sum of the angles of the triangles there. The defects of a closed triangulated surface add up to exactly \\(2\\pi\\chi\\).',
		chapter,
		anchor: 'def-angle-defect'
	},
	{
		key: 'gauss-bonnet-theorem',
		term: 'Gauss–Bonnet theorem',
		def: 'For a closed surface, \\(\\iint_M K\\,dA = 2\\pi\\chi(M)\\): total curvature is a topological invariant.',
		chapter,
		anchor: 'thm-gauss-bonnet'
	},
	{
		key: 'chern-weil-theory',
		term: 'Chern–Weil theory',
		def: 'The principle that curvature forms of a bundle represent its characteristic classes in de Rham cohomology; Gauss–Bonnet is the simplest example.',
		chapter
	},
	{
		key: 'magnetic-monopole',
		term: 'Magnetic monopole',
		def: 'A hypothetical isolated magnetic pole, with field \\(g\\,\\hat{\\mathbf r}/r^2\\). Its vector potential needs two patches, and the patching phase \\(e^{in\\varphi}\\) is a complex line bundle with Chern number \\(n\\).',
		chapter
	},
	{
		key: 'dirac-quantization',
		term: 'Dirac quantisation condition',
		def: 'For a charge \\(q\\) and a monopole of strength \\(g\\), \\(2qg/\\hbar\\) must be an integer (units with \\(c = 1\\)); so a single monopole would force all electric charges to be whole multiples of one unit.',
		chapter
	},
	{
		key: 'berry-phase',
		term: 'Berry phase',
		def: 'The geometric phase acquired by a quantum system whose parameters are carried slowly around a loop; it is the holonomy of a line bundle over the parameter space, and its curvature integrates to Chern numbers.',
		chapter
	},
	{
		key: 'quantum-hall-effect',
		term: 'Quantum Hall effect',
		def: 'Hall conductance quantised in whole multiples of \\(e^2/h\\), discovered by von Klitzing in 1980. TKNN (1982) explained the integers as topological invariants of the filled electron bands, which Simon (1983) recognised as Chern numbers.',
		chapter
	},
	{
		key: 'topological-insulator',
		term: 'Topological insulator',
		def: 'A material that insulates in its interior but conducts along its surface, distinguished from ordinary insulators by a topological invariant of its electron bands.',
		chapter
	}
];
