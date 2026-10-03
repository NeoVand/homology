import type { GlossaryEntry } from './types';

const chapter = 'foundations/linear-algebra';

export const entries: GlossaryEntry[] = [
	{
		key: 'field',
		term: 'Field',
		def: 'A number system in which you can add, subtract, multiply and divide by anything except zero, with the usual rules of arithmetic. Examples: \\(\\Q\\), \\(\\R\\) and \\(\\Z/2\\). The integers \\(\\Z\\) are *not* a field, because \\(2\\) has no integer reciprocal.',
		chapter,
		anchor: 'def-field',
		see: ['vector-space']
	},
	{
		key: 'vector-space',
		term: 'Vector space',
		def: 'A set of vectors that can be added and scaled by numbers from a field, following the usual rules: under addition it is an abelian group, and scaling distributes over addition. Examples: \\(\\R^n\\) and \\((\\Z/2)^n\\).',
		chapter,
		anchor: 'def-vector-space',
		see: ['field', 'linear-map', 'basis']
	},
	{
		key: 'vector',
		term: 'Vector',
		def: 'An element of a vector space. Depending on the space, it can be pictured as an arrow, as a list of numbers, or (over \\(\\Z/2\\)) as a row of on/off switches.',
		chapter,
		anchor: 'vectors',
		see: ['vector-space']
	},
	{
		key: 'linear-combination',
		term: 'Linear combination',
		def: 'A sum of scalar multiples of vectors, \\(a_1\\mathbf v_1 + \\dots + a_k\\mathbf v_k\\).',
		chapter,
		anchor: 'vectors',
		see: ['span']
	},
	{
		key: 'symmetric-difference',
		term: 'Symmetric difference',
		def: 'The set of elements that lie in exactly one of two sets. Viewing vectors over \\(\\Z/2\\) as sets, it is exactly vector addition: \\(\\{a,c,d\\} + \\{c,e\\} = \\{a,d,e\\}\\).',
		chapter,
		anchor: 'vectors'
	},
	{
		key: 'span',
		term: 'Span',
		def: 'The set of all linear combinations of some vectors. It is always a subspace: for one nonzero vector in the plane, a line through the origin.',
		chapter,
		anchor: 'def-span',
		see: ['linear-combination', 'linear-subspace']
	},
	{
		key: 'linear-subspace',
		term: 'Subspace (of a vector space)',
		def: 'A subset of a vector space that contains \\(\\mathbf 0\\) and is closed under addition and scaling, such as a line or a plane through the origin.',
		chapter,
		anchor: 'span-and-basis'
	},
	{
		key: 'linear-independence',
		term: 'Linear independence',
		def: 'Vectors are linearly independent if the only linear combination of them that equals \\(\\mathbf 0\\) has all coefficients zero. Equivalently, none of them is a combination of the others.',
		chapter,
		anchor: 'def-independence',
		see: ['basis']
	},
	{
		key: 'basis',
		term: 'Basis (of a vector space)',
		def: 'A linearly independent list of vectors that spans the space. Every vector is then a combination of the basis vectors in exactly one way; the coefficients are its coordinates.',
		chapter,
		anchor: 'def-basis',
		see: ['dimension', 'dual-basis']
	},
	{
		key: 'dimension',
		term: 'Dimension (of a vector space)',
		def: 'The number of vectors in any basis of a vector space: its number of degrees of freedom. For example \\(\\dim \\R^n = n\\), and \\((\\Z/2)^n\\) has dimension \\(n\\) and \\(2^n\\) elements.',
		chapter,
		anchor: 'def-basis',
		see: ['basis']
	},
	{
		key: 'linear-map',
		term: 'Linear map',
		def: 'A function \\(T\\colon V \\to W\\) between vector spaces with \\(T(\\mathbf u + \\mathbf v) = T(\\mathbf u) + T(\\mathbf v)\\) and \\(T(c\\,\\mathbf v) = c\\,T(\\mathbf v)\\). In the plane it keeps grid lines straight, parallel and evenly spaced, and it fixes the origin.',
		chapter,
		anchor: 'def-linear-map',
		see: ['matrix']
	},
	{
		key: 'matrix',
		term: 'Matrix',
		def: 'A rectangular table of numbers that records a linear map: column \\(j\\) is the image of the \\(j\\)-th basis vector. An \\(m \\times n\\) matrix describes a map from \\(n\\)-dimensional to \\(m\\)-dimensional space.',
		chapter,
		anchor: 'linear-maps',
		see: ['linear-map', 'matrix-multiplication']
	},
	{
		key: 'matrix-multiplication',
		term: 'Matrix multiplication',
		def: 'The product \\(AB\\) is the matrix of the composite map "first \\(B\\), then \\(A\\)". Its entry in row \\(i\\), column \\(j\\) is row \\(i\\) of \\(A\\) times column \\(j\\) of \\(B\\). Order matters: usually \\(AB \\neq BA\\).',
		chapter,
		anchor: 'linear-maps'
	},
	{
		key: 'determinant',
		term: 'Determinant',
		def: 'For a \\(2 \\times 2\\) matrix, \\(ad - bc\\): the signed factor by which the map multiplies areas. It is zero exactly when the columns are dependent, so that the map flattens the plane.',
		chapter,
		anchor: 'linear-maps'
	},
	{
		key: 'null-space',
		term: 'Kernel of a linear map (null space)',
		def: 'The subspace \\(\\ker A\\) of inputs that \\(A\\) sends to \\(\\mathbf 0\\): what gets crushed, or the solutions of \\(A\\mathbf x = \\mathbf 0\\). Its dimension is the nullity.',
		chapter,
		anchor: 'def-kernel-image',
		see: ['column-space', 'rank-nullity']
	},
	{
		key: 'column-space',
		term: 'Image of a linear map (column space)',
		def: 'The subspace \\(\\im A\\) of all outputs \\(A\\mathbf x\\): what can be reached. It is the span of the columns of \\(A\\), and its dimension is the rank.',
		chapter,
		anchor: 'def-kernel-image',
		see: ['null-space', 'matrix-rank']
	},
	{
		key: 'matrix-rank',
		term: 'Rank (of a matrix)',
		def: 'The dimension of the image of a linear map: the number of independent columns, which is also the number of pivots after row reduction, and also the number of independent rows.',
		chapter,
		anchor: 'def-kernel-image',
		see: ['rank-nullity']
	},
	{
		key: 'nullity',
		term: 'Nullity',
		def: 'The dimension of the kernel of a linear map.',
		chapter,
		anchor: 'def-kernel-image',
		see: ['rank-nullity']
	},
	{
		key: 'rank-nullity',
		term: 'Rank–nullity theorem',
		def: 'For a linear map \\(A\\colon V \\to W\\) with \\(V\\) finite-dimensional, \\(\\dim V = \\rank A + \\operatorname{nullity} A\\): every input dimension is either crushed into the kernel or survives into the image.',
		chapter,
		anchor: 'thm-rank-nullity'
	},
	{
		key: 'row-reduction',
		term: 'Row reduction (Gaussian elimination)',
		def: 'Simplifying a matrix with row operations (swap two rows, scale a row by a nonzero number, add a multiple of one row to another) until it reaches reduced row echelon form. It reveals the rank, a basis of the kernel and a basis of the image.',
		chapter,
		anchor: 'row-reduction',
		see: ['pivot', 'reduced-row-echelon-form']
	},
	{
		key: 'reduced-row-echelon-form',
		term: 'Reduced row echelon form',
		def: 'The staircase produced by row reduction: each nonzero row starts with a pivot equal to 1, each pivot lies to the right of the one above, and each pivot is the only nonzero entry in its column.',
		chapter,
		anchor: 'row-reduction'
	},
	{
		key: 'pivot',
		term: 'Pivot',
		def: 'The leading 1 of a nonzero row in reduced row echelon form. The number of pivots is the rank; the columns without pivots correspond to free variables, one kernel vector each.',
		chapter,
		anchor: 'row-reduction'
	},
	{
		key: 'particular-solution',
		term: 'Particular solution',
		def: 'Any one solution \\(\\mathbf x_p\\) of \\(A\\mathbf x = \\mathbf b\\). All solutions are then \\(\\mathbf x_p + \\ker A\\), a coset of the kernel.',
		chapter,
		anchor: 'solving'
	},
	{
		key: 'quotient-vector-space',
		term: 'Quotient space (of vector spaces)',
		def: 'For a subspace \\(W\\) of \\(V\\), the vector space \\(V/W\\) whose elements are the cosets \\(\\mathbf v + W\\), parallel copies of \\(W\\). Its dimension is \\(\\dim V - \\dim W\\), and \\(V/\\ker A \\cong \\im A\\).',
		chapter,
		anchor: 'def-quotient-space'
	},
	{
		key: 'lights-out',
		term: 'Lights Out',
		def: 'A puzzle on a grid of lights in which each press switches a light and its neighbours. Over \\(\\Z/2\\) it is the linear system \\(A\\mathbf x = \\mathbf b\\); on the \\(5 \\times 5\\) board, \\(A\\) has rank 23 and nullity 2.',
		chapter,
		anchor: 'lights-out',
		see: ['quiet-pattern']
	},
	{
		key: 'quiet-pattern',
		term: 'Quiet pattern',
		def: 'In Lights Out, a set of presses that changes no light at all: a nonzero element of the kernel of the Lights Out matrix. The \\(5 \\times 5\\) board has three of them.',
		chapter,
		anchor: 'lights-out',
		see: ['null-space']
	},
	{
		key: 'covector',
		term: 'Covector (linear functional)',
		def: 'A linear map \\(\\varphi\\colon V \\to F\\) from a vector space to its field of scalars: a linear measurement. On \\(\\R^2\\) it has the form \\(ax + by\\) and is pictured as a stack of evenly spaced parallel lines.',
		chapter,
		anchor: 'def-dual-space',
		see: ['dual-space']
	},
	{
		key: 'dual-space',
		term: 'Dual space',
		def: 'The vector space \\(V^*\\) of all covectors on \\(V\\). For finite-dimensional \\(V\\), \\(\\dim V^* = \\dim V\\); vectors are columns and covectors are rows.',
		chapter,
		anchor: 'def-dual-space',
		see: ['covector', 'dual-basis', 'transpose']
	},
	{
		key: 'dual-basis',
		term: 'Dual basis',
		def: 'For a basis \\(\\mathbf e_1, \\dots, \\mathbf e_n\\), the covectors \\(\\mathbf e_i^*\\) that read off coordinates: \\(\\mathbf e_i^*(\\mathbf e_j)\\) is 1 when \\(i = j\\) and 0 otherwise. Each depends on the whole basis.',
		chapter,
		anchor: 'duality'
	},
	{
		key: 'transpose',
		term: 'Transpose',
		def: 'For \\(A\\colon V \\to W\\), the map \\(A^{\\mathsf T}\\colon W^* \\to V^*\\), \\(\\varphi \\mapsto \\varphi \\circ A\\), which pulls measurements back. As a matrix it is \\(A\\) flipped across its diagonal. Arrows reverse: \\((AB)^{\\mathsf T} = B^{\\mathsf T}A^{\\mathsf T}\\).',
		chapter,
		anchor: 'duality',
		see: ['dual-space', 'annihilator']
	},
	{
		key: 'annihilator',
		term: 'Annihilator',
		def: 'For a set \\(U\\) of covectors, the subspace \\(U^\\perp\\) of vectors that every covector in \\(U\\) sends to 0. Duality theorem: \\(\\im A = (\\ker A^{\\mathsf T})^\\perp\\), so a target is unreachable exactly when some measurement certifies it.',
		chapter,
		anchor: 'thm-duality',
		see: ['transpose']
	},
	{
		key: 'cokernel',
		term: 'Cokernel',
		def: 'For a linear map or homomorphism \\(A\\colon X \\to Y\\), the quotient \\(Y/\\im A\\): what is left over in the codomain once the image is collapsed.',
		chapter,
		anchor: 'smith-normal-form',
		see: ['smith-normal-form']
	},
	{
		key: 'smith-normal-form',
		term: 'Smith normal form',
		def: 'The diagonal form \\(\\operatorname{diag}(d_1, \\dots, d_r, 0, \\dots)\\), with each \\(d_i\\) dividing the next, that any integer matrix reaches by integer row and column operations. It shows \\(\\Z^m/\\im A \\cong \\Z^{m-r} \\oplus \\Z/d_1 \\oplus \\dots \\oplus \\Z/d_r\\).',
		chapter,
		anchor: 'thm-smith',
		see: ['invariant-factors', 'cokernel']
	}
];
