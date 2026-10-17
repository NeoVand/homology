import type { GlossaryEntry } from './types';

const chapter = 'homology/knots';

export const entries: GlossaryEntry[] = [
	{
		key: 'knot',
		term: 'Knot',
		def: 'A smooth closed curve in \\(\\R^3\\) (or \\(S^3\\)) that does not cross itself. As a space every knot is a circle; what distinguishes knots is how they sit in space, up to ambient isotopy.',
		chapter,
		anchor: 'def-knot',
		see: ['link', 'ambient-isotopy']
	},
	{
		key: 'link',
		term: 'Link',
		def: 'A finite collection of disjoint knots, its components. The Hopf link, the Whitehead link and the Borromean rings are links of two, two and three components.',
		chapter,
		anchor: 'def-knot',
		see: ['knot', 'linking-number']
	},
	{
		key: 'ambient-isotopy',
		term: 'Ambient isotopy',
		def: 'A continuous family of homeomorphisms \\(h_t\\) of space, starting at the identity, that carries one knot to another: the string moves and drags the space along, never passing through itself. Two knots are equivalent when one exists.',
		chapter,
		anchor: 'def-knot',
		see: ['knot', 'homotopy']
	},
	{
		key: 'chiral-knot',
		term: 'Chiral knot',
		def: 'A knot that is not equivalent to its mirror image, like the trefoil. A knot equal to its mirror image, like the figure-eight knot, is amphichiral. The Jones polynomial detects the trefoil’s chirality.',
		chapter,
		anchor: 'circles-in-space',
		see: ['jones-polynomial']
	},
	{
		key: 'knot-connected-sum',
		term: 'Connected sum of knots',
		def: 'The knot \\(K_1\\#K_2\\) made by cutting each knot open at a point and joining the loose ends in pairs. The granny knot is \\(3_1\\#3_1\\) and the square knot \\(3_1\\#\\overline{3_1}\\). Genus adds up under it.',
		chapter,
		anchor: 'circles-in-space',
		see: ['knot-genus', 'connected-sum']
	},
	{
		key: 'knot-diagram',
		term: 'Knot diagram',
		def: 'A drawing of a knot’s shadow in the plane, crossing itself in finitely many points, with the lower strand broken at each crossing to show which strand passes under.',
		chapter,
		anchor: 'diagrams',
		see: ['reidemeister-moves', 'crossing-number']
	},
	{
		key: 'crossing-number',
		term: 'Crossing number',
		def: 'The smallest number of crossings in any diagram of a knot: \\(0\\) for the unknot, \\(3\\) for the trefoil, \\(4\\) for the figure-eight knot. It is the number in a knot’s table name, as in \\(5_2\\).',
		chapter,
		anchor: 'diagrams',
		see: ['knot-diagram']
	},
	{
		key: 'reidemeister-moves',
		term: 'Reidemeister moves',
		def: 'Three local changes to a knot diagram: removing a kink (I), pulling two strands apart (II), and sliding a strand across a crossing (III). Two diagrams show the same knot exactly when a sequence of them connects the two.',
		chapter,
		anchor: 'thm-reidemeister',
		see: ['knot-invariant', 'knot-diagram']
	},
	{
		key: 'knot-invariant',
		term: 'Knot invariant',
		def: 'Anything computed from a knot diagram that does not change under the Reidemeister moves, and therefore depends only on the knot: colourings, the determinant, the Alexander and Jones polynomials, Khovanov homology.',
		chapter,
		anchor: 'diagrams',
		see: ['reidemeister-moves']
	},
	{
		key: 'writhe',
		term: 'Writhe',
		def: 'The sum of the signs of the crossings of an oriented diagram, \\(+1\\) for each right-handed crossing and \\(-1\\) for each left-handed one. Moves II and III keep it; move I changes it by one, so it is not a knot invariant.',
		chapter,
		anchor: 'diagrams',
		see: ['kauffman-bracket']
	},
	{
		key: 'fox-colouring',
		term: 'Fox colouring',
		def: 'A labelling of the arcs of a diagram by elements of \\(\\Z/p\\) such that at every crossing twice the over-arc equals the sum of the two under-arcs. Their number is a knot invariant: \\(9\\) mod \\(3\\) for the trefoil, \\(3\\) for the unknot.',
		chapter,
		anchor: 'def-colouring',
		see: ['knot-determinant', 'knot-group']
	},
	{
		key: 'knot-determinant',
		term: 'Determinant of a knot',
		def: 'The absolute value of the determinant of the colouring equations with one row and one column struck out; it equals \\(|\\Delta(-1)|\\). A knot has non-constant \\(p\\)-colourings exactly when \\(p\\) divides it.',
		chapter,
		anchor: 'colourings',
		see: ['fox-colouring', 'alexander-polynomial']
	},
	{
		key: 'linking-number',
		term: 'Linking number',
		def: 'How many times a closed curve \\(\\gamma\\) winds around a knot \\(K\\), counted with signs: the integer \\(n\\) with \\([\\gamma] = n[\\mu]\\) in \\(H_1(S^3\\setminus K)\\cong\\Z\\). In a diagram it is half the sum of the signs of the crossings between the two curves; it is also the signed number of times \\(\\gamma\\) pierces a Seifert surface of \\(K\\).',
		chapter,
		anchor: 'what-homology-sees',
		see: ['seifert-surface', 'alexander-duality', 'winding-number']
	},
	{
		key: 'knot-group',
		term: 'Knot group',
		def: 'The fundamental group \\(\\pi_1(S^3\\setminus K)\\) of a knot’s complement. Its abelianization is always \\(\\Z\\), which is all that homology sees; the group itself tells the trefoil from the unknot.',
		chapter,
		anchor: 'knot-group',
		see: ['wirtinger-presentation', 'abelianization']
	},
	{
		key: 'wirtinger-presentation',
		term: 'Wirtinger presentation',
		def: 'A presentation of the knot group read off a diagram: one generator for each arc (a lasso around it), and at each crossing one relation \\(x_c = x_a^{\\pm1}x_bx_a^{\\mp1}\\) between the lassos around the over-arc and the two under-arcs.',
		chapter,
		anchor: 'knot-group',
		see: ['knot-group']
	},
	{
		key: 'braid-group',
		term: 'Braid group',
		def: 'The group \\(B_n\\) of braids on \\(n\\) strands, multiplied by stacking. Artin showed it is generated by the crossings \\(\\sigma_1,\\ldots,\\sigma_{n-1}\\) subject to \\(\\sigma_i\\sigma_j = \\sigma_j\\sigma_i\\) for \\(|i-j|\\ge2\\) and \\(\\sigma_i\\sigma_{i+1}\\sigma_i = \\sigma_{i+1}\\sigma_i\\sigma_{i+1}\\).',
		chapter,
		anchor: 'braids',
		see: ['braid-closure']
	},
	{
		key: 'braid-closure',
		term: 'Closure of a braid',
		def: 'The link made by joining the bottom ends of a braid back up to the top ends. Every link is a closed braid (Alexander), and Markov’s moves say when two braids have the same closure.',
		chapter,
		anchor: 'braids',
		see: ['braid-group']
	},
	{
		key: 'seifert-surface',
		term: 'Seifert surface',
		def: 'An oriented, connected surface in space whose boundary is a given knot; Seifert’s algorithm builds one from any diagram. It is the fence of the class “linking number with the knot”: a loop’s linking number is the signed number of times it pierces the surface.',
		chapter,
		anchor: 'seifert-surfaces',
		see: ['knot-genus', 'linking-number', 'fence']
	},
	{
		key: 'knot-genus',
		term: 'Genus of a knot',
		def: 'The smallest genus of a Seifert surface for the knot. Only the unknot has genus \\(0\\); the trefoil and the figure-eight knot have genus \\(1\\). Genus adds up under connected sum, so knots cannot cancel each other.',
		chapter,
		anchor: 'def-genus',
		see: ['seifert-surface', 'knot-connected-sum']
	},
	{
		key: 'alexander-polynomial',
		term: 'Alexander polynomial',
		def: 'A Laurent polynomial \\(\\Delta_K(t)\\) attached to a knot, playing the role of the characteristic polynomial of the shift acting on \\(H_1\\) of the infinite cyclic cover of the complement; \\(\\Delta = \\det(V - tV^{\\mathsf T})\\) for a Seifert matrix \\(V\\). For the trefoil, \\(t - 1 + t^{-1}\\).',
		chapter,
		anchor: 'alexander-polynomial',
		see: ['knot-genus', 'jones-polynomial']
	},
	{
		key: 'kauffman-bracket',
		term: 'Kauffman bracket',
		def: 'The sum over all states of a diagram (a choice of A- or B-smoothing at every crossing) of \\(A^{a-b}(-A^2-A^{-2})^{\\ell-1}\\), where \\(\\ell\\) counts the loops. Unchanged by moves II and III; corrected by the writhe it gives the Jones polynomial.',
		chapter,
		anchor: 'def-bracket',
		see: ['jones-polynomial', 'writhe']
	},
	{
		key: 'jones-polynomial',
		term: 'Jones polynomial',
		def: 'The knot invariant \\(V(t) = (-A^3)^{-w}\\langle D\\rangle\\) with \\(A = t^{-1/4}\\), discovered by Vaughan Jones in 1984. It tells the trefoil (\\(t + t^3 - t^4\\)) from its mirror image; whether it can recognise the unknot is open.',
		chapter,
		anchor: 'thm-jones',
		see: ['kauffman-bracket', 'khovanov-homology']
	},
	{
		key: 'khovanov-homology',
		term: 'Khovanov homology',
		def: 'A bigraded homology theory of knots (Mikhail Khovanov, 2000), built from the cube of states of a diagram, whose graded Euler characteristic is the Jones polynomial. Kronheimer and Mrowka proved in 2011 that it detects the unknot.',
		chapter,
		anchor: 'khovanov',
		see: ['jones-polynomial', 'categorification']
	}
];
