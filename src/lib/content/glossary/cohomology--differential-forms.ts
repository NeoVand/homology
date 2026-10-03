import type { GlossaryEntry } from './types';

const chapter = 'cohomology/differential-forms';

export const entries: GlossaryEntry[] = [
	{
		key: 'derivative',
		term: 'Derivative',
		def: 'The rate of change of a function: the slope \\(F\'(x)\\) of its graph at \\(x\\). For a small step \\(\\Delta x\\) it predicts the change \\(\\Delta F \\approx F\'(x)\\,\\Delta x\\).',
		chapter,
		anchor: 'slopes-and-rates'
	},
	{
		key: 'integral',
		term: 'Integral',
		def: 'An accumulated total: \\(\\int_a^b f(x)\\,dx\\) is the limit of the sums \\(\\sum f(x_i)\\,\\Delta x\\) over finer and finer subdivisions of \\([a,b]\\) — the signed area under the graph.',
		chapter,
		anchor: 'totals'
	},
	{
		key: 'fundamental-theorem-of-calculus',
		term: 'Fundamental theorem of calculus',
		def: '\\(\\int_a^b F\'(x)\\,dx = F(b) - F(a)\\): adding up the small changes of \\(F\\) over an interval leaves only its values at the two boundary points.',
		chapter,
		anchor: 'thm-ftc',
		see: ['stokes-theorem']
	},
	{
		key: 'partial-derivative',
		term: 'Partial derivative',
		def: 'The slope of a function of several variables in one coordinate direction, with the other coordinates held fixed, written \\(\\partial f/\\partial x\\).',
		chapter,
		anchor: 'slopes-in-two-directions'
	},
	{
		key: 'gradient',
		term: 'Gradient',
		def: 'The vector \\(\\nabla f = (\\partial f/\\partial x, \\partial f/\\partial y)\\) of partial derivatives. It points straight uphill, is perpendicular to the level curves of \\(f\\), and its length is the steepness.',
		chapter,
		anchor: 'slopes-in-two-directions',
		see: ['exterior-derivative']
	},
	{
		key: 'vector-field',
		term: 'Vector field',
		def: 'A choice of arrow at every point of a region, such as a wind map or a force field: \\(\\mathbf F(x,y) = (P(x,y), Q(x,y))\\).',
		chapter,
		anchor: 'arrows-everywhere'
	},
	{
		key: 'line-integral',
		term: 'Line integral',
		def: 'The total \\(\\int_\\gamma \\mathbf F\\cdot d\\mathbf r\\) of a field along an oriented path: the work done by a force along the path. Reversing the path flips the sign.',
		chapter,
		anchor: 'work-along-a-path',
		see: ['one-form']
	},
	{
		key: 'conservative-field',
		term: 'Conservative field',
		def: 'A vector field that is the gradient of a function. Its line integrals depend only on the endpoints, and its integral around every closed loop is zero.',
		chapter,
		anchor: 'work-along-a-path'
	},
	{
		key: 'circulation',
		term: 'Circulation',
		def: 'The line integral \\(\\oint \\mathbf F\\cdot d\\mathbf r\\) of a field around a closed loop: how much the field pushes you along as you go round.',
		chapter,
		anchor: 'circulation-and-curl'
	},
	{
		key: 'curl',
		term: 'Curl',
		def: 'Circulation per unit area around a tiny loop; in the plane, \\(\\operatorname{curl}\\mathbf F = \\partial Q/\\partial x - \\partial P/\\partial y\\). A paddle wheel in the flow spins at half this rate.',
		chapter,
		anchor: 'circulation-and-curl'
	},
	{
		key: 'flux',
		term: 'Flux',
		def: 'The net amount of a flow crossing a curve or surface, \\(\\int \\mathbf F\\cdot\\mathbf n\\), counted positively in the direction of the chosen normal \\(\\mathbf n\\).',
		chapter,
		anchor: 'flux-and-divergence'
	},
	{
		key: 'divergence',
		term: 'Divergence',
		def: 'Outward flux per unit area (or volume) out of a tiny region; in the plane, \\(\\operatorname{div}\\mathbf F = \\partial P/\\partial x + \\partial Q/\\partial y\\). Positive at sources, negative at sinks.',
		chapter,
		anchor: 'flux-and-divergence'
	},
	{
		key: 'greens-theorem',
		term: "Green's theorem",
		def: 'For a region \\(R\\) in the plane with counterclockwise boundary, \\(\\oint_{\\partial R} P\\,dx + Q\\,dy = \\iint_R (\\partial Q/\\partial x - \\partial P/\\partial y)\\,dA\\): circulation around the edge equals total curl inside.',
		chapter,
		anchor: 'thm-green',
		see: ['stokes-theorem']
	},
	{
		key: 'divergence-theorem',
		term: 'Divergence theorem',
		def: 'The flux of a field out through the boundary surface of a solid equals the total divergence inside: \\(\\iint_{\\partial V} \\mathbf F\\cdot\\mathbf n\\,dA = \\iiint_V \\operatorname{div}\\mathbf F\\,dV\\). Also called Gauss’s theorem.',
		chapter,
		anchor: 'in-three-dimensions',
		see: ['stokes-theorem']
	},
	{
		key: 'covector',
		term: 'Covector',
		def: 'A linear measuring device for vectors: a linear function \\(\\alpha\\colon V \\to \\R\\), i.e. an element of the dual space. In the plane, \\(\\alpha = a\\,dx + b\\,dy\\) gives \\(\\alpha(\\mathbf v) = a v_1 + b v_2\\). Picture it as a stack of parallel lines.',
		chapter,
		anchor: 'measuring-devices'
	},
	{
		key: 'one-form',
		term: 'Differential 1-form',
		def: 'A covector at every point, varying smoothly: \\(\\omega = P\\,dx + Q\\,dy\\). It eats a small step and returns a number, so it can be integrated along oriented curves.',
		chapter,
		anchor: 'def-one-form',
		see: ['covector', 'k-form']
	},
	{
		key: 'wedge-product',
		term: 'Wedge product',
		def: 'The product \\(\\alpha\\wedge\\beta\\) of covectors, measuring oriented area: \\((\\alpha\\wedge\\beta)(\\mathbf u,\\mathbf v) = \\alpha(\\mathbf u)\\beta(\\mathbf v) - \\beta(\\mathbf u)\\alpha(\\mathbf v)\\). It is antisymmetric, so \\(dx\\wedge dx = 0\\).',
		chapter,
		anchor: 'def-wedge'
	},
	{
		key: 'k-form',
		term: 'Differential k-form',
		def: 'A smoothly varying measuring device for tiny oriented \\(k\\)-dimensional parallelograms, such as \\(g\\,dx\\wedge dy\\). A \\(k\\)-form is integrated over oriented \\(k\\)-dimensional pieces; the space of them is written \\(\\Omega^k(M)\\).',
		chapter,
		anchor: 'k-forms',
		see: ['one-form', 'wedge-product']
	},
	{
		key: 'exterior-derivative',
		term: 'Exterior derivative',
		def: 'The operator \\(d\\colon \\Omega^k \\to \\Omega^{k+1}\\) with \\(d(f\\,dx_I) = df\\wedge dx_I\\). In \\(\\R^3\\) it is the gradient, curl and divergence; pictorially it marks where the sheets of a form end.',
		chapter,
		anchor: 'def-d',
		see: ['d-squared-zero']
	},
	{
		key: 'd-squared-zero',
		term: 'd∘d = 0',
		def: 'Applying the exterior derivative twice always gives zero. It packages \\(\\operatorname{curl}\\operatorname{grad} = 0\\) and \\(\\operatorname{div}\\operatorname{curl} = 0\\), and mirrors \\(\\partial\\circ\\partial = 0\\) for chains.',
		chapter,
		anchor: 'thm-dd',
		see: ['exterior-derivative']
	},
	{
		key: 'pullback',
		term: 'Pullback',
		def: 'For a smooth map \\(\\varphi\\colon U \\to V\\) and a form \\(\\omega\\) on \\(V\\), the form \\(\\varphi^*\\omega\\) on \\(U\\) measures a step by measuring its image. Forms travel against the map; in polar coordinates, \\(\\varphi^*(dx\\wedge dy) = r\\,dr\\wedge d\\theta\\).',
		chapter,
		anchor: 'def-pullback'
	},
	{
		key: 'boundary-orientation',
		term: 'Boundary orientation',
		def: 'The orientation a boundary inherits from the region it bounds: "outward first". In the plane the boundary is walked counterclockwise, keeping the region on the left.',
		chapter,
		anchor: 'thm-stokes'
	},
	{
		key: 'stokes-theorem',
		term: "Stokes' theorem",
		def: 'For a compact oriented manifold \\(M\\) with boundary and a form \\(\\omega\\) of one degree less, \\(\\int_{\\partial M}\\omega = \\int_M d\\omega\\). It contains the fundamental theorem of calculus, Green’s theorem, the classical Stokes theorem and the divergence theorem.',
		chapter,
		anchor: 'thm-stokes',
		see: ['fundamental-theorem-of-calculus', 'greens-theorem', 'divergence-theorem']
	},
	{
		key: 'signed-area',
		term: 'Signed area',
		def: 'The area of the parallelogram spanned by \\(\\mathbf u\\) and \\(\\mathbf v\\), with a plus sign if \\(\\mathbf v\\) is counterclockwise from \\(\\mathbf u\\) and a minus sign otherwise: the determinant \\(u_1v_2 - u_2v_1\\).',
		chapter,
		anchor: 'oriented-area'
	},
	{
		key: 'level-set',
		term: 'Level set',
		def: 'The set of points where a function takes one fixed value, such as a contour line on a map. The level sets \\(f = k\\varepsilon\\) form the stack of sheets that pictures the 1-form \\(df\\).',
		chapter,
		anchor: 'fields-of-covectors'
	}
];
