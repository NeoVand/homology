<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	import Definition from '$lib/components/prose/Definition.svelte';
	import Theorem from '$lib/components/prose/Theorem.svelte';
	import Proof from '$lib/components/prose/Proof.svelte';
	import Example from '$lib/components/prose/Example.svelte';
	import Intuition from '$lib/components/prose/Intuition.svelte';
	import KeyIdea from '$lib/components/prose/KeyIdea.svelte';
	import Warning from '$lib/components/prose/Warning.svelte';
	import Remark from '$lib/components/prose/Remark.svelte';
	import History from '$lib/components/prose/History.svelte';
	import Question from '$lib/components/prose/Question.svelte';
	import Notation from '$lib/components/prose/Notation.svelte';
	import Recap from '$lib/components/prose/Recap.svelte';
	import Exercise from '$lib/components/prose/Exercise.svelte';
	import Figure from '$lib/components/prose/Figure.svelte';
	import Term from '$lib/components/prose/Term.svelte';
	import Ref from '$lib/components/prose/Ref.svelte';
	import FurtherReading from '$lib/components/prose/FurtherReading.svelte';

	import FtcFigure from '$lib/figures/cohomology/differential-forms/FtcFigure.svelte';
	import FieldExplorer from '$lib/figures/cohomology/differential-forms/FieldExplorer.svelte';
	import TilesFigure from '$lib/figures/cohomology/differential-forms/TilesFigure.svelte';
	import GreenFigure from '$lib/figures/cohomology/differential-forms/GreenFigure.svelte';
	import Flux3D from '$lib/figures/cohomology/differential-forms/Flux3D.svelte';
	import SheetsPath from '$lib/figures/cohomology/differential-forms/SheetsPath.svelte';
	import WedgeFigure from '$lib/figures/cohomology/differential-forms/WedgeFigure.svelte';
	import SheetEnds from '$lib/figures/cohomology/differential-forms/SheetEnds.svelte';
	import DLadder from '$lib/figures/cohomology/differential-forms/DLadder.svelte';
	import PullbackFigure from '$lib/figures/cohomology/differential-forms/PullbackFigure.svelte';
</script>

<Epigraph author="Michael Spivak" source="Calculus on Manifolds (1965), p. 104">Stokes’ theorem shares three important attributes with many fully evolved major theorems: 1. It is trivial. 2. It is trivial because the terms appearing in it have been properly defined. 3. It has significant consequences.</Epigraph>

<p class="lead">In the last two chapters you met a curious kind of calculus that lives on the edges of a graph. You put heights on the vertices, took differences along the edges, and discovered that some edge labellings could not come from any heights at all — the impossible staircase. That discrete calculus has an older, smooth sibling: the calculus of slopes, flows, areas and volumes that engineers and physicists have used for three centuries. This chapter rebuilds it from nothing, in a language called <em>differential forms</em>, which makes the shape of the space visible in the calculus.</p>

<p>Along the way, four famous theorems — the fundamental theorem of calculus, Green’s theorem, Stokes’ theorem and the divergence theorem — will collapse into a single line, \(\int_{\partial M} \omega = \int_M d\omega\). You will not need to remember any calculus to follow. We will relearn slopes and areas with pictures first, and only then make the jump to forms.</p>

<Ahead>
	<p>Differential forms are the smooth version of the <Term t="cochain">cochains</Term> of <Ref to="cohomology/cochains" />: a 1-form is something you can add up along any curve, just as a 1-cochain gives a number to each edge. The exterior derivative \(d\) is the smooth version of the coboundary \(\delta\), and Stokes’ theorem is the smooth version of the rule \((\delta\varphi)(c) = \varphi(\partial c)\). In <Ref to="cohomology/de-rham" /> we will use forms to detect holes with calculus: a form whose derivative is zero everywhere, yet which is not the derivative of anything, is a hole announcing itself. De Rham’s theorem will then say that this smooth story and the combinatorial one compute the same cohomology.</p>
</Ahead>

<h2 id="calculus-refresher">A calculus refresher in pictures</h2>

<p>We need three ideas from ordinary calculus: the <em>derivative</em> (a rate), the <em>integral</em> (a total), and the theorem that links them. If you already know them, skim this section for the pictures, because the pictures are what we will generalise.</p>

<h3 id="slopes-and-rates">Slopes and rates</h3>

<p>Imagine walking along a hilly road. Let \(F(x)\) be your height above sea level when you are at horizontal position \(x\). Between two nearby positions \(x\) and \(x + h\), the road rises by \(F(x+h) - F(x)\) over a horizontal distance \(h\), so its average steepness there is</p>
\[ \frac{\text{rise}}{\text{run}} = \frac{F(x+h) - F(x)}{h}. \]
<p>As \(h\) shrinks towards \(0\), this ratio settles down (for the smooth roads we will consider) to a single number, the <dfn>derivative</dfn> \(F'(x)\), read “\(F\) prime of \(x\)” and also written \(\tfrac{dF}{dx}\). It is the slope of the graph at \(x\): positive going uphill, negative going downhill, zero at a summit. If \(F(t)\) were your position at time \(t\) instead, \(F'(t)\) would be your speed — the number on a speedometer.</p>

<p>Here is the reformulation that matters for this chapter. Turn the definition around: for a <em>small</em> step \(\Delta x\) (read “delta \(x\)”, a small change in \(x\)), the change in height is approximately</p>
\[ \Delta F \;\approx\; F'(x)\,\Delta x . \]
<p>So the derivative is a little machine: feed it a small step, and it predicts how much you will climb. Notice that the prediction is <em>linear</em> in the step — twice the step, twice the climb; a step backwards, a negative climb. Keep this machine in mind. It is the seed from which differential forms grow.</p>

<h3 id="totals">Totals</h3>

<p>The second idea runs the other way: from a rate to a total. If you know your speed at every moment, how far did you travel? Chop the time interval into many short pieces of length \(\Delta t\); on each piece, distance \(\approx\) speed \(\times\) \(\Delta t\); add the pieces up. As the pieces get shorter, these sums approach a single number, the <dfn>integral</dfn>,</p>
\[ \int_a^b f(x)\,dx \;=\; \lim_{n\to\infty} \sum_{i=1}^{n} f(x_i)\,\Delta x . \]
<p>The long S, \(\int\), is an old-fashioned letter S for “sum”; \(a\) and \(b\) are where the adding starts and stops; \(dx\) remembers the little widths \(\Delta x\). In a picture, each term \(f(x_i)\,\Delta x\) is the area of a thin rectangle, so the integral is the area under the graph of \(f\) — with the convention that area below the axis counts as negative.</p>

<h3 id="fundamental-theorem">The fundamental theorem</h3>

<p>Now put the two ideas together. Take \(f = F'\), the slope of our road, and add up the predicted rises \(F'(x_i)\,\Delta x\) across the interval from \(a\) to \(b\). Each predicted rise is close to the actual rise \(F(x_{i+1}) - F(x_i)\) on its piece, and the actual rises add up in a wonderfully lazy way. With three pieces, \(a = x_0 \lt x_1 \lt x_2 \lt x_3 = b\):</p>
\[ \big[F(x_1) - F(x_0)\big] + \big[F(x_2) - F(x_1)\big] + \big[F(x_3) - F(x_2)\big] = F(x_3) - F(x_0). \]
<p>Every intermediate height appears once with a plus sign and once with a minus sign, and cancels. Only the two ends survive. Sums that collapse like this are called <em>telescoping</em>, after the way a pocket telescope folds up. Letting the pieces shrink gives the most important theorem of calculus.</p>

<Theorem id="thm-ftc" title="Fundamental theorem of calculus">
	<p>If \(F\) has a continuous derivative \(F'\) on \([a, b]\), then \(\displaystyle\int_a^b F'(x)\,dx = F(b) - F(a)\).</p>
</Theorem>

<Figure title="Adding up little rises" hint="Drag a and b · change the number of pieces" num="4.3.1">
	<FtcFigure />
	{#snippet caption()}Top: a road \(F\) and a gold staircase that climbs, on each piece, by the rise that the slope predicts. Bottom: the slope \(F'\), with rectangles whose signed areas are those same predicted rises. As the pieces get thinner, the staircase hugs the road and the total of the rectangles approaches the actual change \(F(b) - F(a)\), shown in teal.{/snippet}
</Figure>

<p>Read the theorem as a sentence about <em>insides and boundaries</em>. The left side adds up a derivative over the inside of the interval \([a, b]\). The right side looks only at the boundary of the interval — its two endpoints — counting the end \(b\) with a plus sign and the start \(a\) with a minus sign. You have seen exactly this signed boundary before: in <Ref to="homology/chains" /> the boundary of an edge \([a, b]\) was \(\partial[a,b] = b - a\). Hold on to this sentence. The rest of the chapter is about making it true in every dimension:</p>

<KeyIdea>
	<p>The total of a derivative over a region equals the total of the original quantity over the region’s boundary.</p>
</KeyIdea>

<Question>
	<p>What does the theorem say when \(F\) is constant? And what is \(\int_a^a F'(x)\,dx\)? Both answers are “zero”, for reasons that should now feel inevitable rather than computed.</p>
</Question>

<h2 id="vector-fields">Arrows everywhere: vector fields and work</h2>

<h3 id="slopes-in-two-directions">Slopes in two directions</h3>

<p>A landscape is a function of two variables: the height \(f(x, y)\) at the point with east–west coordinate \(x\) and north–south coordinate \(y\). Standing at a point, the slope depends on which way you face. Two directions are especially easy. Walking due east, \(y\) stays fixed while \(x\) changes, and the slope you feel is the <dfn>partial derivative</dfn> \(\tfrac{\partial f}{\partial x}\), read “partial \(f\) partial \(x\)”. It is computed exactly like an ordinary derivative while pretending \(y\) is a constant. Walking due north gives \(\tfrac{\partial f}{\partial y}\). For example, if \(f(x,y) = x^2 y\) then \(\tfrac{\partial f}{\partial x} = 2xy\) and \(\tfrac{\partial f}{\partial y} = x^2\). We will often shorten these to \(f_x\) and \(f_y\).</p>

<p>For a small step \((\Delta x, \Delta y)\) in any direction, the change in height is approximately the eastward part of the step times the eastward slope, plus the northward part times the northward slope:</p>
\[ \Delta f \;\approx\; \frac{\partial f}{\partial x}\,\Delta x + \frac{\partial f}{\partial y}\,\Delta y. \]
<p>Again a machine that eats a step and predicts a climb — and again linear in the step. The two slopes are often packaged as an arrow, the <dfn>gradient</dfn> \(\nabla f = \big(\tfrac{\partial f}{\partial x}, \tfrac{\partial f}{\partial y}\big)\) (the symbol \(\nabla\) is read “nabla” or simply “grad”). The gradient points straight uphill, its length is the steepness, and it is perpendicular to the contour lines of the map, along which the height does not change.</p>

<h3 id="arrows-everywhere">Arrows everywhere</h3>

<p>A <dfn>vector field</dfn> is a choice of arrow at every point: the wind on a weather map, the current in a river, the gravitational pull at each point of space. In the plane we write it as \(\mathbf F(x, y) = \big(P(x,y),\, Q(x,y)\big)\): at the point \((x, y)\) the arrow goes \(P\) units east and \(Q\) units north. Bold letters like \(\mathbf F\) are a reminder that the value is an arrow, not a number.</p>

<p>The gradient of a landscape is one example. Others are the rotation \(\mathbf F = (-y, x)\), which spins the plane counterclockwise, and the source \(\mathbf F = (x, y)\), which streams out of the origin. Figure 4.3.2 shows them as they are best seen: alive. The particles ride along the arrows, and the streaky texture behind them traces the flow lines everywhere at once.</p>

<Figure title="A gallery of vector fields" hint="Pick a field · switch the colouring · drag the paddle wheel" num="4.3.2">
	<FieldExplorer />
	{#snippet caption()}Six planar vector fields. The gold paddle wheel turns at the rate the fluid rotates around it; the colourings (curl, divergence, potential) are explained in the next section. Try the <em>shear</em> field: its flow lines are perfectly straight, yet the paddle wheel turns. And try <em>vortex</em> with the potential colouring: its level lines are rays, an object we will meet again.{/snippet}
</Figure>

<h3 id="work-along-a-path">Work along a path</h3>

<p>Suppose \(\mathbf F\) is a force and you carry an object along a path \(\gamma\) (the Greek letter gamma). On a short straight step \(\Delta\mathbf r = (\Delta x, \Delta y)\), the work done by the force is the part of the force pointing along the step, times the length of the step. In coordinates this is the <dfn>dot product</dfn></p>
\[ \mathbf F\cdot\Delta\mathbf r = P\,\Delta x + Q\,\Delta y . \]
<p>Pushing with the motion counts positively, against it negatively, sideways not at all. Chop the path into many small steps, add up the work of each, and let the steps shrink: the result is the <dfn>line integral</dfn></p>
\[ \int_\gamma \mathbf F\cdot d\mathbf r \;=\; \int_\gamma P\,dx + Q\,dy . \]
<p>A path has a direction of travel, and walking it backwards reverses every step and flips the sign of the answer. When \(\gamma\) is a closed loop we write \(\oint_\gamma\), with a little circle on the integral sign.</p>

<p>Now suppose the force is a gradient, \(\mathbf F = \nabla f\). Then the work of each small step is approximately the change \(\Delta f\) of \(f\) on that step, the changes telescope exactly as on the road, and</p>
\[ \int_\gamma \nabla f\cdot d\mathbf r \;=\; f(\text{end}) - f(\text{start}). \]
<p>This is the fundamental theorem again, now along a curved path in the plane. It has two striking consequences. The work does not depend on the route, only on where you start and finish. And around any closed loop, where the start is the end, the work is zero. Fields with these properties are called <dfn>conservative</dfn>: gravity near the ground is one, with \(f = -mgy\) (height times weight, with a sign).</p>

<Example title="A field that is not a gradient">
	<p>Take the rotation \(\mathbf F = (-y, x)\) and walk once counterclockwise around the unit circle, \(\gamma(t) = (\cos t, \sin t)\) for \(0 \le t \le 2\pi\). At time \(t\) you are at \((\cos t, \sin t)\), your small step is \(\Delta\mathbf r \approx (-\sin t, \cos t)\,\Delta t\), and the force there is \((-\sin t, \cos t)\). Their dot product is \((\sin^2 t + \cos^2 t)\,\Delta t = \Delta t\). The force always pushes you along, and the total work is \(\oint_\gamma \mathbf F\cdot d\mathbf r = 2\pi\), not zero. So no landscape \(f\) has \(\nabla f = (-y, x)\): there is no consistent “height” whose slopes are these arrows. Remember the impossible staircase of <Ref to="cohomology/cochains" />? This is the same phenomenon in smooth clothing.</p>
</Example>

<h2 id="swirl-and-spread">Swirl and spread: three famous theorems</h2>

<p>The loop integral around a closed curve deserves a name: it is the <dfn>circulation</dfn> of \(\mathbf F\) around the curve, the total push you feel going round. Since a gradient has zero circulation around every loop, circulation is a test for “being a gradient”. But a loop is a global thing. Is there a <em>local</em> quantity, measured at single points, that adds up to the circulation?</p>

<h3 id="circulation-and-curl">Circulation and curl</h3>

<p>Shrink the loop to a tiny square of side \(h\) with its lower-left corner at \((x, y)\), and walk it counterclockwise. Along the bottom edge (going east) the work is about \(P(x, y)\,h\); along the top edge (going west) about \(-P(x, y + h)\,h\). Together they give \(-\big(P(x, y+h) - P(x, y)\big)\,h \approx -\tfrac{\partial P}{\partial y}\,h^2\). The right and left edges similarly give \(\tfrac{\partial Q}{\partial x}\,h^2\). So the circulation around the tiny square is approximately</p>
\[ \Big(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\Big)\,h^2 \;=\; \operatorname{curl}\mathbf F \times \text{area}. \]

<Definition id="def-curl" title="Curl (in the plane)">
	<p>The <dfn>curl</dfn> of \(\mathbf F = (P, Q)\) is \(\operatorname{curl}\mathbf F = \dfrac{\partial Q}{\partial x} - \dfrac{\partial P}{\partial y}\): the circulation per unit area around a tiny counterclockwise loop.</p>
</Definition>

<p>A physical picture: drop a tiny paddle wheel into the flow. It turns counterclockwise where the curl is positive, clockwise where it is negative, and the rate at which it turns is exactly half the curl. For the rotation \((-y, x)\) the curl is \(1 - (-1) = 2\) everywhere. For the shear \((y, 0)\) it is \(0 - 1 = -1\): the flow lines are straight, but the water above the wheel moves faster than the water below it, so the wheel turns clockwise. Switch on the curl colouring in Figure 4.3.2 and watch.</p>

<p>For a gradient, \(P = f_x\) and \(Q = f_y\), so \(\operatorname{curl}\nabla f = f_{yx} - f_{xy}\): the difference of the two “mixed” second derivatives, taken in the two possible orders. For every function with continuous second derivatives these are equal — a classical fact usually credited to Schwarz or Clairaut — so a gradient has zero curl everywhere. Zero curl is the <em>local</em> shadow of having zero circulation.</p>

<h3 id="flux-and-divergence">Flux and divergence</h3>

<p>Circulation measures flow <em>along</em> a curve. The other natural question is how much flows <em>across</em> it. The <dfn>flux</dfn> of \(\mathbf F\) out of a closed curve is \(\oint \mathbf F\cdot\mathbf n\,ds\), where \(\mathbf n\) is the outward-pointing unit arrow perpendicular to the curve and \(ds\) is the length of a small piece. The same tiny-square computation shows that the outward flux of a tiny square is about</p>
\[ \Big(\frac{\partial P}{\partial x} + \frac{\partial Q}{\partial y}\Big)\,h^2 \;=\; \operatorname{div}\mathbf F \times\text{area}. \]
<p>The <dfn>divergence</dfn> \(\operatorname{div}\mathbf F = \tfrac{\partial P}{\partial x} + \tfrac{\partial Q}{\partial y}\) is the outflow per unit area: positive at a source, where fluid appears; negative at a sink, where it disappears. The source \((x, y)\) has divergence \(2\) everywhere; the rotation has divergence \(0\).</p>

<h3 id="greens-theorem">Green’s theorem</h3>

<p>Here is the idea that turns local into global. Take a region \(R\) in the plane and tile it with tiny squares. Add up the circulations of all the tiles. Each interior edge belongs to two neighbouring tiles, which walk it in opposite directions, so its contributions cancel. Only the edges on the outer boundary survive, and they make up the counterclockwise walk around the boundary of \(R\), written \(\partial R\). On the other hand, each tile’s circulation is about its curl times its area, and these add up to the total curl inside.</p>

<Figure title="Why the inside talks to the boundary" hint="Step through, or press play" num="4.3.3">
	<TilesFigure />
	{#snippet caption()}Tile a region with small squares, each walked counterclockwise. An edge shared by two tiles is walked once in each direction, so it cancels; only the outer boundary is left. This is the same cancellation that makes the boundary of a sum of triangles in <Ref to="homology/chains" /> lose all its interior edges.{/snippet}
</Figure>

<Theorem id="thm-green" title="Green’s theorem">
	<p>Let \(R\) be a bounded region in the plane whose boundary \(\partial R\) is a piecewise smooth curve, walked counterclockwise (with \(R\) on your left). For a vector field \(\mathbf F = (P, Q)\) with continuous partial derivatives on and around \(R\),</p>
	\[ \oint_{\partial R} P\,dx + Q\,dy \;=\; \iint_R \Big(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\Big)\,dA . \]
	<p>The same reasoning with outward flux gives \(\oint_{\partial R} \mathbf F\cdot\mathbf n\,ds = \iint_R \operatorname{div}\mathbf F\,dA\).</p>
</Theorem>

<p>The tiling argument is the whole idea of the proof; making “about” precise is a matter of careful estimates. Rather than take it on trust, test it. In Figure 4.3.4 the computer evaluates the two sides independently — one by walking along your curve, the other by adding up over the region inside it — and you can drag the curve wherever you like.</p>

<Figure title="Green’s theorem, live" hint="Drag the round handles to reshape · the diamond moves the loop" num="4.3.4">
	<GreenFigure />
	{#snippet caption()}The background is coloured by the curl (rose counterclockwise, teal clockwise) or the divergence (gold source, blue sink). The number on the left is computed along the gold curve; the number on the right, over the shaded region inside it. Put the loop around one eddy, then around both: their swirls cancel. Make a figure eight: the two lobes are walked in opposite senses and count with opposite signs.{/snippet}
</Figure>

<h3 id="in-three-dimensions">In three dimensions</h3>

<p>In space a vector field has three components, \(\mathbf F = (P, Q, R)\). A tiny loop can now face in any direction, so the curl becomes an arrow, \(\operatorname{curl}\mathbf F = \big(R_y - Q_z,\; P_z - R_x,\; Q_x - P_y\big)\), whose component in a direction \(\mathbf n\) is the circulation per unit area around a tiny loop facing \(\mathbf n\). The divergence is \(\operatorname{div}\mathbf F = P_x + Q_y + R_z\), the outflow per unit volume of a tiny box. The tiling argument, with tiny squares on a curved surface or tiny cubes in a solid, gives two more theorems:</p>
\[ \oint_{\partial S} \mathbf F\cdot d\mathbf r = \iint_S (\operatorname{curl}\mathbf F)\cdot\mathbf n\,dA \quad\text{(Kelvin–Stokes)}, \qquad \iint_{\partial V} \mathbf F\cdot\mathbf n\,dA = \iiint_V \operatorname{div}\mathbf F\,dV \quad\text{(Gauss)}. \]
<p>In the first, \(S\) is a surface with boundary curve \(\partial S\); in the second, \(V\) is a solid with boundary surface \(\partial V\), and \(\mathbf n\) points outward. The second one is the <dfn>divergence theorem</dfn>: what flows out through the skin is what was created inside.</p>

<Figure title="The divergence theorem in space" hint="Drag the sphere to move it, its rim to resize · drag elsewhere to rotate" num="4.3.5">
	<Flux3D />
	{#snippet caption()}The glowing blob is a source: the field’s divergence is concentrated there. Arrows on the glass sphere show the flow through its surface (gold out, teal in). Both totals are computed independently, by adding up over the sphere’s surface and over its solid inside. Drag the sphere off the blob and the flux drops to zero; switch on the wind and arrows point inward on one side and outward on the other, but the total does not change, because a uniform wind creates nothing.{/snippet}
</Figure>

<p>Line up what we have so far:</p>

<div class="table-wrap">
	<table>
		<thead>
			<tr><th>Theorem</th><th>Inside</th><th>Boundary</th></tr>
		</thead>
		<tbody>
			<tr><td>Fundamental theorem</td><td>\(\int_a^b F'(x)\,dx\)</td><td>\(F(b) - F(a)\)</td></tr>
			<tr><td>Gradient theorem</td><td>\(\int_\gamma \nabla f\cdot d\mathbf r\)</td><td>\(f(\text{end}) - f(\text{start})\)</td></tr>
			<tr><td>Green / Kelvin–Stokes</td><td>\(\iint_S \operatorname{curl}\mathbf F\cdot\mathbf n\,dA\)</td><td>\(\oint_{\partial S}\mathbf F\cdot d\mathbf r\)</td></tr>
			<tr><td>Gauss</td><td>\(\iiint_V \operatorname{div}\mathbf F\,dV\)</td><td>\(\iint_{\partial V}\mathbf F\cdot\mathbf n\,dA\)</td></tr>
		</tbody>
	</table>
</div>

<p>Four theorems, one shape: <em>a derivative integrated over the inside equals the original thing integrated over the boundary</em>. Four different kinds of derivative (slope, gradient, curl, divergence), four kinds of integral (along intervals, curves, surfaces, solids). It is hard to believe this is a coincidence, and it is not. To see the single theorem behind all four, we need the right things to integrate.</p>

<History>
	<p>The theorem we now call Stokes’ theorem first appeared in a letter from William Thomson (later Lord Kelvin) to George Stokes, dated 2 July 1850. Stokes set it as an examination question for the Smith’s Prize at Cambridge in 1854 — and that year the prize was shared by two students who sat it, Edward Routh and a young James Clerk Maxwell — who would later make these theorems central to his theory of electricity and magnetism. The modern unified form, with differential forms, grew out of Élie Cartan’s work beginning in 1899.</p>
</History>

<h2 id="one-forms">Covectors and 1-forms: stacks of sheets</h2>

<p>Look again at the integrand of a line integral, \(P\,dx + Q\,dy\). What is it, really? Not quite the arrow \(\mathbf F\): it is a <em>recipe that turns a small step into a number</em>. That recipe is the hero of this section.</p>

<h3 id="measuring-devices">Measuring devices</h3>

<p>Recall from <Ref to="foundations/linear-algebra" /> the <Term t="dual-space">dual space</Term> \(V^*\) of a vector space \(V\): the set of all linear functions from \(V\) to the numbers. Its elements are called <dfn>covectors</dfn>. Think of a covector as a measuring device for arrows: you hand it an arrow, it hands you back a number, and it respects the arrow arithmetic (the reading of a sum is the sum of the readings, and doubling the arrow doubles the reading).</p>

<p>In the plane there are two especially simple measuring devices. The covector \(dx\) reads off how far east an arrow goes, and \(dy\) reads off how far north:</p>
\[ dx(\mathbf v) = v_1, \qquad dy(\mathbf v) = v_2 \qquad\text{for } \mathbf v = (v_1, v_2). \]
<p>Every covector on the plane is a combination \(\alpha = a\,dx + b\,dy\), with \(\alpha(\mathbf v) = a v_1 + b v_2\). For instance, with \(\mathbf v = (3, 4)\): \(dx(\mathbf v) = 3\), \(dy(\mathbf v) = 4\), and \((2\,dx + dy)(\mathbf v) = 2\cdot 3 + 4 = 10\).</p>

<Notation title="Why the d?">
	<p>The symbols \(dx\) and \(dy\) look like the “infinitely small changes” of old calculus books, and that resemblance is deliberate — but it is safest to ignore it for now. Keenan Crane, who teaches this subject to computer-graphics students, puts it this way: “Stay sane: think of these symbols as bases; forget they look like derivatives!” Shortly we will define an operator \(d\), and then \(dx\) will turn out to be, honestly, \(d\) applied to the function \(x\).</p>
</Notation>

<p>How should you <em>picture</em> a covector? An arrow is the wrong picture. Draw instead the lines where the linear function \(a x + b y\) takes the values \(\ldots, -2, -1, 0, 1, 2, \ldots\): a <em>stack</em> of evenly spaced parallel lines, with a marked direction in which the value increases. Then \(\alpha(\mathbf v)\) is simply the number of lines the arrow \(\mathbf v\) crosses, counted positively in the marked direction and negatively against it. A large covector is a dense stack; \(dx\) is the stack of vertical lines one unit apart. This picture comes from the great physics textbook <em>Gravitation</em> by Misner, Thorne and Wheeler, who describe a 1-form as a family of surfaces and the measurement as counting how many surfaces an arrow pierces.</p>

<Warning title="Arrows and stacks are different kinds of thing">
	<p>It is tempting to identify the covector \(a\,dx + b\,dy\) with the arrow \((a, b)\). They behave differently, though. Change units from metres to centimetres: the components of an arrow get <em>multiplied</em> by 100 (a 3-metre arrow is a 300-centimetre arrow), while the components of a covector get <em>divided</em> by 100 (a slope of 2 per metre is 0.02 per centimetre). Turning one into the other requires extra structure — a choice of dot product — and on curved spaces that choice is real information. Covectors are the natural objects to integrate; arrows are not.</p>
</Warning>

<h3 id="fields-of-covectors">A covector at every point</h3>

<Definition id="def-one-form" title="Differential 1-form">
	<p>A <dfn>differential 1-form</dfn> on a region of the plane is a choice of covector at every point, varying smoothly:</p>
	\[ \omega = P(x, y)\,dx + Q(x, y)\,dy . \]
	<p>At the point \(p\), it measures a small arrow \(\mathbf v\) based at \(p\) by \(\omega_p(\mathbf v) = P(p)\,v_1 + Q(p)\,v_2\). The set of all 1-forms on a region \(U\) is written \(\Omega^1(U)\), and functions are called <em>0-forms</em>, \(\Omega^0(U)\).</p>
</Definition>

<p>The most important example comes from a function. Our “step in, climb out” machine \(\Delta f \approx f_x\,\Delta x + f_y\,\Delta y\) is exactly a 1-form, the <dfn>differential</dfn> of \(f\):</p>
\[ df = \frac{\partial f}{\partial x}\,dx + \frac{\partial f}{\partial y}\,dy. \]
<p>Apply this to the function \(f(x, y) = x\): its partial derivatives are \(1\) and \(0\), so \(d(x) = 1\,dx + 0\,dy\). The basic covector \(dx\) really is “\(d\) of \(x\)”, which justifies the notation.</p>

<p>The stack picture now becomes a map. A 1-form is a field of tiny stacks, one at each point. For \(df\) the stacks fit together into the <Term t="level-set">level curves</Term> \(f = 0, \pm\varepsilon, \pm 2\varepsilon, \ldots\) of \(f\), for some small spacing \(\varepsilon\) (epsilon): the contour lines of a hiking map. And \(dx\) is the stack of vertical lines \(x = \text{const}\): “\(dx\) counts how many \(x\)-sheets you cross”.</p>

<h3 id="integrating-one-forms">Integrating a 1-form</h3>

<p>A 1-form eats small steps, so it can be added up along a path: chop the oriented curve \(\gamma\) into small steps \(\Delta\mathbf r_i\) starting at points \(p_i\), add up \(\omega_{p_i}(\Delta\mathbf r_i)\), and refine. The limit is \(\int_\gamma\omega\). For \(\omega = P\,dx + Q\,dy\) it is the same number as the work \(\int_\gamma \mathbf F\cdot d\mathbf r\) of the field \(\mathbf F = (P, Q)\) — but notice that no arrows were needed. The 1-form <em>is</em> the thing you integrate along curves. In practice, if \(\gamma(t) = (x(t), y(t))\) for \(a \le t \le b\), then</p>
\[ \int_\gamma \omega = \int_a^b \Big( P\big(\gamma(t)\big)\,x'(t) + Q\big(\gamma(t)\big)\,y'(t) \Big)\,dt , \]
<p>and the answer does not depend on how fast you travel along \(\gamma\), only on the route and its direction.</p>

<p>In the stack picture, \(\int_\gamma\omega\) is the net number of sheets the path crosses (forwards minus backwards), each sheet worth \(\varepsilon\). For \(\omega = df\), crossing level curves from \(f(A)\) to \(f(B)\) gives the gradient theorem in its most memorable form:</p>
\[ \int_\gamma df \;=\; f(B) - f(A) \qquad\text{(count the contour lines you climb).} \]

<Figure title="A 1-form as a stack of sheets" hint="Drag the endpoints A, B and the middle of the path" num="4.3.6">
	<SheetsPath />
	{#snippet caption()}Teal curves are the sheets of \(\omega = df\) (the small arrows show which way across counts as \(+1\)). Green dots mark forward crossings, rose rings backward ones. Bend the path as much as you like: the net count — and so the integral — depends only on the endpoints. Drag \(B\) close to \(A\) to see a covector measuring a single short arrow.{/snippet}
</Figure>

<Warning title="Where the sheet picture stops being literal">
	<p>The stacks are exact at each single point, and they glue into honest curves for forms like \(df\). For a general 1-form they need not. In the plane, the sheets of a form such as \(x\,dy\) must <em>end</em> somewhere (that is the subject of the section on \(d\) below). In space it can be worse: the stacks of \(dz - y\,dx\) twist so that no family of surfaces anywhere fits them, however small (a fact known as the Frobenius theorem). So treat the sheets as a local picture and a counting device, not as literal global surfaces.</p>
</Warning>

<h2 id="wedge">The wedge product: oriented area and volume</h2>

<p>A 1-form measures tiny arrows, so it can be integrated along curves. To integrate over a surface we need something that measures tiny <em>parallelograms</em>. Since a parallelogram is spanned by two arrows, we want a measuring device that eats two arrows and returns an area.</p>

<h3 id="oriented-area">Oriented area</h3>

<p>The parallelogram spanned by \(\mathbf u = (u_1, u_2)\) and \(\mathbf v = (v_1, v_2)\) has area \(\abs{u_1 v_2 - u_2 v_1}\). Drop the absolute value and you get the <dfn>signed area</dfn> \(u_1 v_2 - u_2 v_1\), the <em>determinant</em> of the matrix with columns \(\mathbf u\) and \(\mathbf v\) from <Ref to="foundations/linear-algebra" />. Its sign records an orientation: it is positive when turning from \(\mathbf u\) to \(\mathbf v\) is a counterclockwise turn, and negative when it is clockwise. Three rules make the signed area tick: swapping \(\mathbf u\) and \(\mathbf v\) flips its sign; if \(\mathbf v\) is parallel to \(\mathbf u\) the area is \(0\); and it is linear in each arrow separately.</p>

<Figure title="dx ∧ dy measures oriented area" hint="Drag the tips of u and v · swap them" num="4.3.7">
	<WedgeFigure />
	{#snippet caption()}The signed area of the parallelogram spanned by \(\mathbf u\) and \(\mathbf v\). When \(\mathbf v\) lies counterclockwise from \(\mathbf u\) the area is positive (gold); push \(\mathbf v\) past the line of \(\mathbf u\) and it turns negative (hatched rose). The dashed square is the unit of area.{/snippet}
</Figure>

<Definition id="def-wedge" title="Wedge product">
	<p>For covectors \(\alpha\) and \(\beta\), the <dfn>wedge product</dfn> \(\alpha\wedge\beta\) (read “alpha wedge beta”) is the measuring device for pairs of arrows</p>
	\[ (\alpha\wedge\beta)(\mathbf u, \mathbf v) = \alpha(\mathbf u)\,\beta(\mathbf v) - \beta(\mathbf u)\,\alpha(\mathbf v). \]
	<p>In particular \((dx\wedge dy)(\mathbf u, \mathbf v) = u_1 v_2 - u_2 v_1\) is the signed area.</p>
</Definition>

<p>Directly from the formula: \(\alpha\wedge\beta = -\beta\wedge\alpha\), and so \(\alpha\wedge\alpha = 0\); in particular \(dx\wedge dx = 0\) and \(dy\wedge dx = -dx\wedge dy\). These two rules are all you need to compute. For example,</p>
\[ (a\,dx + b\,dy)\wedge(c\,dx + d\,dy) = ac\,\underbrace{dx\wedge dx}_{0} + ad\,dx\wedge dy + bc\,\underbrace{dy\wedge dx}_{-dx\wedge dy} + bd\,\underbrace{dy\wedge dy}_{0} = (ad - bc)\,dx\wedge dy . \]
<p>Out pops the determinant \(ad - bc\). So \((dx + 2\,dy)\wedge(3\,dx - dy) = (1\cdot(-1) - 2\cdot 3)\,dx\wedge dy = -7\,dx\wedge dy\).</p>

<h3 id="k-forms">2-forms, 3-forms, k-forms</h3>

<p>A <dfn>2-form</dfn> on the plane is a smoothly varying multiple of \(dx\wedge dy\), say \(g(x, y)\,dx\wedge dy\). It is integrated over a region \(R\) by chopping \(R\) into tiny parallelograms, measuring each, and adding: if \(R\) carries the standard counterclockwise orientation, \(\iint_R g\,dx\wedge dy\) is the ordinary area integral \(\iint_R g\,dA\), and reversing the orientation flips the sign.</p>

<p>In space, with coordinates \(x, y, z\), there is more room:</p>
<ul>
	<li><strong>1-forms</strong> \(P\,dx + Q\,dy + R\,dz\) measure arrows, and are integrated along curves.</li>
	<li><strong>2-forms</strong> \(A\,dy\wedge dz + B\,dz\wedge dx + C\,dx\wedge dy\) measure parallelograms. Each basic piece measures a <em>shadow</em>: \(dx\wedge dy\) gives the signed area of the parallelogram’s shadow on the floor (the \(xy\)-plane), \(dy\wedge dz\) its shadow on the \(yz\)-wall, \(dz\wedge dx\) on the \(zx\)-wall. They are integrated over surfaces.</li>
	<li><strong>3-forms</strong> \(f\,dx\wedge dy\wedge dz\) measure boxes: \(dx\wedge dy\wedge dz\) gives the signed volume of the box spanned by three arrows, the \(3\times 3\) determinant. They are integrated over solids.</li>
</ul>
<p>Counting the basic pieces gives \(1, 3, 3, 1\) in degrees \(0, 1, 2, 3\): a row of Pascal’s triangle. In \(n\) dimensions a <dfn>k-form</dfn> measures tiny oriented \(k\)-dimensional parallelepipeds, there are \(\binom{n}{k}\) basic ones, and there are no nonzero \(k\)-forms with \(k > n\), because some \(dx_i\) would have to appear twice and \(dx_i\wedge dx_i = 0\). The space of \(k\)-forms on \(U\) is written \(\Omega^k(U)\).</p>

<KeyIdea>
	<p>A \(k\)-form is something you integrate over oriented \(k\)-dimensional pieces: 0-forms (functions) at points, 1-forms along curves, 2-forms over surfaces, 3-forms over solids. The degree of the form must match the dimension of the piece.</p>
</KeyIdea>

<h2 id="exterior-derivative">The exterior derivative: where sheets end</h2>

<p>We have one derivative already: \(d\) turns a function \(f\) into the 1-form \(df\). Now we extend it to forms of every degree, by a single rule.</p>

<Definition id="def-d" title="Exterior derivative">
	<p>The <dfn>exterior derivative</dfn> \(d\colon\Omega^k \to \Omega^{k+1}\) acts on functions by \(df = \sum_i \tfrac{\partial f}{\partial x_i}\,dx_i\), on sums term by term, and on a single term by</p>
	\[ d\big(f\,dx_{i_1}\wedge\cdots\wedge dx_{i_k}\big) = df\wedge dx_{i_1}\wedge\cdots\wedge dx_{i_k}. \]
</Definition>

<p>Let us compute it for a general 1-form in the plane, \(\omega = P\,dx + Q\,dy\). By the rule,</p>
\[ d\omega = dP\wedge dx + dQ\wedge dy = (P_x\,dx + P_y\,dy)\wedge dx + (Q_x\,dx + Q_y\,dy)\wedge dy . \]
<p>Two of the four products contain \(dx\wedge dx\) or \(dy\wedge dy\) and vanish, and \(dy\wedge dx = -dx\wedge dy\), leaving</p>
\[ d(P\,dx + Q\,dy) = \Big(\frac{\partial Q}{\partial x} - \frac{\partial P}{\partial y}\Big)\,dx\wedge dy . \]
<p>That is the curl, appearing on its own. For example, \(d(x^2 y\,dx + xy\,dy) = (y - x^2)\,dx\wedge dy\). Now Green’s theorem can be written without a single arrow:</p>
\[ \oint_{\partial R}\omega = \iint_R d\omega . \]

<h3 id="where-sheets-end">Where sheets end</h3>

<p>What does \(d\omega\) look like? Take \(\omega = x\,dy\). Its covectors are multiples of \(dy\), so its sheets are horizontal lines; but at horizontal position \(x\) the stack has density \(x\) — the lines crowd together as you move right. Horizontal lines whose density grows towards the right cannot all run forever: new lines must <em>begin</em>. Mark each beginning with a dot. The dots turn out to be spread perfectly evenly, one per unit of area (in units of \(\varepsilon\)), and that even sprinkling is the 2-form \(dx\wedge dy = d(x\,dy)\). By contrast the sheets of \(dy\), or the contour lines of any function, never begin or end, and indeed \(d(dy) = 0\) and \(d(df) = 0\).</p>

<Intuition title="d marks where the sheets end">
	<p>Picture a 1-form as a field of sheets. Wherever sheets begin or end, leave a dot, with a sign recording whether the count goes up or down there. The dots are the 2-form \(d\omega\). This picture (due to Dan Piponi, building on Misner, Thorne and Wheeler) explains Stokes’ theorem at a glance: the net number of sheets crossing the boundary of a region equals the number of sheet-ends inside it, because every sheet that enters must either leave again or end inside.</p>
</Intuition>

<Figure title="d marks where the sheets end" hint="Pick a form · drag the rectangle, or its corner to resize" num="4.3.8">
	<SheetEnds />
	{#snippet caption()}Each 1-form is drawn as co-oriented curves (ticks mark the side that counts \(+1\)); dots mark where curves begin — gold for positive, rose rings for negative — and together the dots are \(d\omega\). For every rectangle, the net number of curves piercing its counterclockwise boundary equals the signed number of dots inside: Stokes’ theorem as pure counting. The last-but-one form, \(d\theta\), has no dots at all, yet curves stream out of any rectangle around the origin.{/snippet}
</Figure>

<h3 id="grad-curl-div">Gradient, curl and divergence are one operator</h3>

<p>In space, apply the same rule in each degree:</p>
\[ df = f_x\,dx + f_y\,dy + f_z\,dz, \]
\[ d(P\,dx + Q\,dy + R\,dz) = (R_y - Q_z)\,dy\wedge dz + (P_z - R_x)\,dz\wedge dx + (Q_x - P_y)\,dx\wedge dy, \]
\[ d(A\,dy\wedge dz + B\,dz\wedge dx + C\,dx\wedge dy) = (A_x + B_y + C_z)\,dx\wedge dy\wedge dz . \]
<p>Read the coefficients: the first line is the gradient, the second the curl, the third the divergence. The three operators of vector calculus, each with its own formula to memorise, are one and the same \(d\), applied to forms of degree \(0\), \(1\) and \(2\).</p>

<Figure title="The de Rham ladder" num="4.3.9">
	<DLadder />
	{#snippet caption()}Top row: forms on \(\R^3\), with \(d\) raising the degree. Bottom row: the pieces they are integrated over, with the boundary operator \(\partial\) lowering the dimension. Integration pairs each column. Stokes’ theorem says that taking \(d\) on top and taking \(\partial\) underneath give the same number.{/snippet}
</Figure>

<h3 id="d-squared">d of d is zero</h3>

<Theorem id="thm-dd" title="d ∘ d = 0">
	<p>For every smooth form \(\omega\), \(d(d\omega) = 0\).</p>
</Theorem>

<Proof>
	<p>Here is the heart of it, for a function \(f\) on the plane. First \(df = f_x\,dx + f_y\,dy\). Then, by the formula for \(d\) of a 1-form with \(P = f_x\) and \(Q = f_y\),</p>
	\[ d(df) = \big(f_{yx} - f_{xy}\big)\,dx\wedge dy = 0, \]
	<p>because the mixed partial derivatives are equal. In general the same thing happens: \(d(d\omega)\) is a sum of terms \(\tfrac{\partial^2 f}{\partial x_i\,\partial x_j}\,dx_i\wedge dx_j\wedge\cdots\), and each pair \(i \ne j\) appears twice, with equal coefficients but with \(dx_i\wedge dx_j = -dx_j\wedge dx_i\), so everything cancels; the terms with \(i = j\) vanish because \(dx_i\wedge dx_i = 0\).</p>
</Proof>

<p>In the language of vector calculus, \(d\circ d = 0\) on functions says \(\operatorname{curl}(\operatorname{grad} f) = 0\), and on 1-forms says \(\operatorname{div}(\operatorname{curl}\mathbf F) = 0\). In the sheet picture it says something lovely: <em>the ends of sheets have no ends</em>. And it should ring a bell. In <Ref to="homology/chains" /> you proved \(\partial\circ\partial = 0\), “the boundary of a boundary is empty”, and in <Ref to="cohomology/cohomology-groups" /> its mirror image \(\delta\circ\delta = 0\). The exterior derivative belongs to the same family. Whenever an operator squares to zero, its image sits inside its kernel, and the gap between them — the things killed by \(d\) that are not produced by \(d\) — is going to measure something.</p>

<Remark title="A preview of the next chapter">
	<p>A form with \(d\omega = 0\) is called <em>closed</em>, and a form \(\omega = d\eta\) is called <em>exact</em>. Because \(d\circ d = 0\), every exact form is closed. Is every closed form exact — is every curl-free field a gradient? Figure 4.3.8 has already hinted at the answer: the form \(d\theta\) is closed, yet its sheets stream out of a box around the origin, which is impossible for the contour lines of a function. That gap is where cohomology lives.</p>
</Remark>

<p>One last rule, for computing: \(d\) satisfies a product rule, \(d(f\,\omega) = df\wedge\omega + f\,d\omega\), and more generally \(d(\alpha\wedge\beta) = d\alpha\wedge\beta + (-1)^k\,\alpha\wedge d\beta\) when \(\alpha\) is a \(k\)-form. You will not need it often in this book.</p>

<h2 id="pullbacks-and-manifolds">Pullbacks, manifolds and integration</h2>

<h3 id="pulling-back">Pulling forms back along maps</h3>

<p>To integrate a 2-form over a curved surface, or to change coordinates, we need to move forms from one place to another. Suppose \(\varphi\colon U \to V\) (phi) is a smooth map between regions. A small arrow \(\mathbf v\) at a point \(p\) of \(U\) is carried by \(\varphi\) to a small arrow \(D\varphi_p(\mathbf v)\) at \(\varphi(p)\) — its image under the best linear approximation of \(\varphi\), the matrix of partial derivatives. Given a form \(\omega\) on \(V\) we can then measure arrows in \(U\) by measuring their images.</p>

<Definition id="def-pullback" title="Pullback">
	<p>The <dfn>pullback</dfn> \(\varphi^*\omega\) of a \(k\)-form \(\omega\) on \(V\) is the \(k\)-form on \(U\) given by</p>
	\[ (\varphi^*\omega)_p(\mathbf v_1,\ldots,\mathbf v_k) = \omega_{\varphi(p)}\big(D\varphi_p\mathbf v_1,\ldots, D\varphi_p\mathbf v_k\big). \]
	<p>In practice: substitute. Write the coordinates of \(V\) as functions of those of \(U\), and replace each \(dx\) by its differential.</p>
</Definition>

<Example title="Polar coordinates">
	<p>Let \(\varphi(r, \theta) = (r\cos\theta,\, r\sin\theta)\). Substituting \(x = r\cos\theta\) and \(y = r\sin\theta\) gives \(dx = \cos\theta\,dr - r\sin\theta\,d\theta\) and \(dy = \sin\theta\,dr + r\cos\theta\,d\theta\). Wedge them together, remembering \(dr\wedge dr = d\theta\wedge d\theta = 0\) and \(d\theta\wedge dr = -dr\wedge d\theta\):</p>
	\[ \varphi^*(dx\wedge dy) = \big(\cos\theta\cdot r\cos\theta - (-r\sin\theta)\sin\theta\big)\,dr\wedge d\theta = r\,dr\wedge d\theta . \]
	<p>So the area of a disk of radius \(R\) is \(\int_0^{2\pi}\int_0^R r\,dr\,d\theta = 2\pi\cdot\tfrac{R^2}{2} = \pi R^2\). The factor \(r\) is the familiar “Jacobian” of polar coordinates, and Figure 4.3.10 shows where it comes from.</p>
</Example>

<Figure title="Pulling back area" hint="Drag the highlighted cell in either picture · arrow keys" num="4.3.10">
	<PullbackFigure />
	{#snippet caption()}A grid cell in the \((r, \theta)\) rectangle is carried by \(\varphi\) to a curved cell in the plane. Its area there is exactly \(\bar r\,\Delta r\,\Delta\theta\), where \(\bar r\) is the cell’s middle radius: cells farther out are stretched more. That stretching factor is why \(\varphi^*(dx\wedge dy) = r\,dr\wedge d\theta\).{/snippet}
</Figure>

<p>Notice the direction of travel. The map \(\varphi\) carries points from \(U\) to \(V\), but the pullback carries forms the other way, from \(V\) back to \(U\). This is our fourth recurring idea, <em>reversed arrows</em>, again: preimages of sets in <Ref to="foundations/sets-and-functions" />, transposes of matrices, cochains in <Ref to="cohomology/cochains" /> — and now forms. Measuring devices always travel against the map.</p>

<p>Two facts make pullbacks indispensable. First, integrals are defined through them: for a curve \(\gamma\colon[a,b]\to\R^2\), the recipe for \(\int_\gamma\omega\) above is exactly \(\int_a^b\gamma^*\omega\). Second, pullback respects everything we have built:</p>
\[ \varphi^*(\alpha\wedge\beta) = \varphi^*\alpha\wedge\varphi^*\beta, \qquad \varphi^*(d\omega) = d(\varphi^*\omega). \]
<p>The second identity says that \(d\) does not care which coordinates you compute it in. That is what allows us to leave flat space.</p>

<h3 id="forms-on-manifolds">Forms on manifolds</h3>

<p>Recall from <Ref to="topology/manifolds" /> that a smooth <Term t="manifold">manifold</Term> \(M\) of dimension \(n\) looks, near each point, like a piece of \(\R^n\) — via <Term t="chart">charts</Term> that overlap smoothly — and that at each point \(p\) it has a <Term t="tangent-space">tangent space</Term> \(T_pM\) of little arrows. A <dfn>\(k\)-form on \(M\)</dfn> is a choice, at every point, of a measuring device that eats \(k\) tangent arrows, is linear in each, and flips sign when two arrows are swapped — varying smoothly. In each chart it looks exactly like the forms above; on overlaps, the two descriptions are related by pullback along the transition map. Because pullback commutes with \(d\), the exterior derivative computed in one chart agrees with the one computed in any other, so \(d\colon\Omega^k(M)\to\Omega^{k+1}(M)\) makes sense on the whole manifold.</p>

<p>To integrate an \(n\)-form over an \(n\)-dimensional manifold, chop the manifold into pieces that each lie in a chart, pull the form back to \(\R^n\) on each piece, integrate there, and add. (Doing the chopping smoothly uses a device called a partition of unity, which we will not need to see.) One requirement is essential: the manifold must be <Term t="orientable">oriented</Term>, so that every chart agrees on which way round is positive. On a Möbius band there is no consistent choice, and 2-forms cannot be integrated over it.</p>

<p>More generally, a \(k\)-form can be integrated over any oriented \(k\)-dimensional piece of a manifold: a curve, a surface, a smooth triangle, or a <em>formal sum</em> of such pieces, \(c = \sum a_i\sigma_i\), by \(\int_c\omega = \sum a_i\int_{\sigma_i}\omega\). Formal sums of pieces are exactly the <Term t="chain">chains</Term> of Part III. So integration gives a pairing</p>
\[ \ip{\omega}{c} = \int_c \omega \]
<p>between \(k\)-forms and \(k\)-chains — the same kind of pairing as between cochains and chains in <Ref to="cohomology/cohomology-groups" />.</p>

<h2 id="stokes">Stokes’ theorem: the crown jewel</h2>

<p>Everything is now in place to state the theorem that this chapter has been circling. An oriented region \(M\) has a boundary \(\partial M\), and the boundary inherits an orientation by the rule “outward first”: at a boundary point, an arrow pointing out of \(M\), followed by the boundary’s own orientation, should give the orientation of \(M\). In the plane this means walking the boundary counterclockwise, with the region on your left; for an interval \([a, b]\) it means \(b\) counts plus and \(a\) counts minus.</p>

<Theorem id="thm-stokes" label="Theorem (Stokes)">
	<p>Let \(M\) be a compact oriented \(k\)-dimensional manifold with boundary \(\partial M\), carrying the boundary orientation, and let \(\omega\) be a smooth \((k-1)\)-form on \(M\). Then</p>
	\[ \int_{\partial M}\omega \;=\; \int_M d\omega . \]
	<p>The same holds with \(M\) replaced by any smooth \(k\)-chain \(c\): \(\int_{\partial c}\omega = \int_c d\omega\).</p>
</Theorem>

<p>Here is what it says in each dimension, with the old theorems as special cases:</p>

<div class="table-wrap">
	<table>
		<thead>
			<tr><th>\(M\)</th><th>\(\omega\)</th><th>Stokes’ theorem becomes</th></tr>
		</thead>
		<tbody>
			<tr><td>an interval \([a,b]\)</td><td>a function \(F\)</td><td>\(F(b) - F(a) = \int_a^b F'\,dx\)</td></tr>
			<tr><td>a curve \(\gamma\) in space</td><td>a function \(f\)</td><td>\(f(\text{end}) - f(\text{start}) = \int_\gamma df\)</td></tr>
			<tr><td>a region in the plane</td><td>\(P\,dx + Q\,dy\)</td><td>Green’s theorem</td></tr>
			<tr><td>a surface in space</td><td>a 1-form</td><td>the Kelvin–Stokes theorem</td></tr>
			<tr><td>a solid in space</td><td>a 2-form</td><td>the divergence theorem</td></tr>
		</tbody>
	</table>
</div>

<p>Why is it true? You have already seen both reasons. The first is the tiling argument of Figure 4.3.3: chop \(M\) into tiny cubes; for a single tiny cube the theorem is the fundamental theorem of calculus applied in each direction; and when the cubes are put back together, every interior face is counted twice with opposite orientations and cancels, leaving only \(\partial M\). The second is the sheet picture of Figure 4.3.8: \(\int_{\partial M}\omega\) counts the sheets of \(\omega\) entering and leaving through the boundary, each sheet that enters must leave again or end inside, and the ends inside are what \(d\omega\) counts.</p>

<p>Spivak’s verdict, in the epigraph of this chapter, is that the theorem is <em>trivial</em> — “because the terms appearing in it have been properly defined”. He goes on: “Since this entire chapter was little more than a series of definitions which made the statement and proof of Stokes’ theorem possible, the reader should be willing to grant the first two of these attributes to Stokes’ theorem.” The difficulty was never in the theorem. It was in finding the right objects — forms, \(d\), oriented chains — for which it becomes a single honest line.</p>

<h3 id="d-and-boundary">d and ∂ are mirror images</h3>

<p>Write Stokes’ theorem with the pairing \(\ip{\omega}{c} = \int_c\omega\):</p>
\[ \ip{d\omega}{c} \;=\; \ip{\omega}{\partial c}. \]
<p>This is exactly the defining property of the coboundary in <Ref to="cohomology/cohomology-groups" />, \((\delta\varphi)(c) = \varphi(\partial c)\): there, \(\delta\) was the transpose of \(\partial\). So differential forms behave like cochains, with \(d\) in the role of \(\delta\). Two consequences follow in one line each, and they are the doorway to the next chapter.</p>
<ul>
	<li>If \(\omega = d\eta\) is exact and \(z\) is a cycle (\(\partial z = 0\)), then \(\int_z\omega = \int_{\partial z}\eta = 0\). <em>Exact forms integrate to zero over every cycle.</em></li>
	<li>If \(d\omega = 0\) and \(z = \partial b\) is a boundary, then \(\int_z\omega = \int_b d\omega = 0\). <em>Closed forms integrate to zero over every boundary.</em></li>
</ul>
<p>So when a closed form is integrated over a cycle, the answer only depends on the cycle up to boundaries, and only on the form up to exact forms. Integrating closed forms over cycles is a way of pairing homology with something new. That something is de Rham cohomology.</p>

<KeyIdea>
	<p>Forms are measurements that can be made everywhere at once; chains are the places where we measure. The exterior derivative \(d\) and the boundary \(\partial\) are mirror images under integration, \(\int_c d\omega = \int_{\partial c}\omega\), and both satisfy “twice is zero”.</p>
</KeyIdea>

<h2 id="exercises">Exercises</h2>

<Exercise level={1} title="Measuring arrows">
	<p>Let \(\mathbf v = (3, 4)\). Compute \(dx(\mathbf v)\), \(dy(\mathbf v)\) and \((2\,dx + dy)(\mathbf v)\). Then draw the stack of lines for \(2\,dx + dy\) and check your last answer by counting crossings.</p>
	{#snippet hint()}<p>\(dx\) reads the first component, \(dy\) the second; covectors are linear.</p>{/snippet}
	{#snippet solution()}<p>\(dx(\mathbf v) = 3\), \(dy(\mathbf v) = 4\), and \((2\,dx + dy)(\mathbf v) = 2\cdot 3 + 1\cdot 4 = 10\). The stack consists of the lines \(2x + y = k\) for integers \(k\). The arrow from \((0,0)\) to \((3,4)\) starts on the line \(k = 0\) and ends on the line \(k = 2\cdot3 + 4 = 10\), so it crosses ten lines in the increasing direction.</p>{/snippet}
</Exercise>

<Exercise level={1} title="Wedges are determinants">
	<p>Compute \((dx + 2\,dy)\wedge(3\,dx - dy)\). Then, with \(\alpha = dx + 2\,dy\), \(\beta = 3\,dx - dy\), \(\mathbf u = (1, 0)\) and \(\mathbf v = (0, 1)\), evaluate \((\alpha\wedge\beta)(\mathbf u, \mathbf v)\) directly from the definition and compare.</p>
	{#snippet hint()}<p>Use \(dx\wedge dx = dy\wedge dy = 0\) and \(dy\wedge dx = -dx\wedge dy\), or the determinant rule \((a\,dx + b\,dy)\wedge(c\,dx + d\,dy) = (ad - bc)\,dx\wedge dy\).</p>{/snippet}
	{#snippet solution()}<p>Expanding, \(3\,dx\wedge dx - dx\wedge dy + 6\,dy\wedge dx - 2\,dy\wedge dy = -dx\wedge dy - 6\,dx\wedge dy = -7\,dx\wedge dy\). Directly: \(\alpha(\mathbf u) = 1\), \(\alpha(\mathbf v) = 2\), \(\beta(\mathbf u) = 3\), \(\beta(\mathbf v) = -1\), so \((\alpha\wedge\beta)(\mathbf u,\mathbf v) = 1\cdot(-1) - 3\cdot 2 = -7\), which matches \(-7\,(dx\wedge dy)(\mathbf u, \mathbf v) = -7\cdot 1\).</p>{/snippet}
</Exercise>

<Exercise level={2} title="Computing d">
	<p>Compute \(d\omega\) for \(\omega = x^2 y\,dx + xy\,dy\).</p>
	{#snippet hint()}<p>Use \(d(P\,dx + Q\,dy) = (Q_x - P_y)\,dx\wedge dy\).</p>{/snippet}
	{#snippet solution()}<p>Here \(P = x^2 y\) and \(Q = xy\), so \(Q_x = y\) and \(P_y = x^2\). Therefore \(d\omega = (y - x^2)\,dx\wedge dy\).</p>{/snippet}
</Exercise>

<Exercise level={2} title="Twice is zero, by hand">
	<p>Let \(f(x, y) = x^3 y^2\). Compute \(df\), and then verify directly that \(d(df) = 0\).</p>
	{#snippet solution()}<p>\(df = 3x^2y^2\,dx + 2x^3y\,dy\). Then \(d(df) = \big(\tfrac{\partial}{\partial x}(2x^3y) - \tfrac{\partial}{\partial y}(3x^2y^2)\big)\,dx\wedge dy = (6x^2y - 6x^2y)\,dx\wedge dy = 0\).</p>{/snippet}
</Exercise>

<Exercise level={2} title="Green’s theorem on a square">
	<p>Let \(R = [0,1]\times[0,1]\) be the unit square with its counterclockwise boundary, and \(\omega = x\,dy\). Compute \(\oint_{\partial R}\omega\) edge by edge, and compare with \(\iint_R d\omega\). Then do the same for \(\omega = -y\,dx + x\,dy\).</p>
	{#snippet hint()}<p>Along a horizontal edge \(dy = 0\); along a vertical edge \(x\) is constant.</p>{/snippet}
	{#snippet solution()}<p>For \(\omega = x\,dy\): the bottom and top edges are horizontal, so \(dy = 0\) and they contribute nothing. The left edge has \(x = 0\), so it contributes nothing either. The right edge has \(x = 1\) and is walked upwards from \(y = 0\) to \(y = 1\), contributing \(\int_0^1 1\,dy = 1\). On the other side, \(d\omega = dx\wedge dy\), whose integral over the square is its area, \(1\). They agree.</p><p>For \(\omega = -y\,dx + x\,dy\): \(d\omega = 2\,dx\wedge dy\), so the area integral is \(2\). Along the edges: bottom (\(y = 0\), going right) gives \(0\); right (\(x = 1\), going up) gives \(\int_0^1 dy = 1\); top (\(y = 1\), going left, so \(x\) runs from \(1\) to \(0\)) gives \(\int_1^0 -1\,dx = 1\); left (\(x = 0\)) gives \(0\). The total is \(2\).</p>{/snippet}
</Exercise>

<Exercise level={2} title="Polar area">
	<p>Using \(\varphi^*(dx\wedge dy) = r\,dr\wedge d\theta\), compute the area of the annulus \(1 \le r \le 2\). Check your answer as a difference of two disk areas.</p>
	{#snippet solution()}<p>\(\int_0^{2\pi}\int_1^2 r\,dr\,d\theta = 2\pi\cdot\big[\tfrac{r^2}{2}\big]_1^2 = 2\pi\cdot\tfrac{3}{2} = 3\pi\), which equals \(\pi\cdot 2^2 - \pi\cdot 1^2\).</p>{/snippet}
</Exercise>

<Exercise level={3} title="div curl = 0">
	<p>Let \(\mathbf F = (P, Q, R)\) be a smooth vector field in space. Using the formulas for curl and divergence, show directly that \(\operatorname{div}(\operatorname{curl}\mathbf F) = 0\). Which instance of \(d\circ d = 0\) is this?</p>
	{#snippet hint()}<p>\(\operatorname{curl}\mathbf F = (R_y - Q_z,\, P_z - R_x,\, Q_x - P_y)\). Take the \(x\)-derivative of the first component, and so on.</p>{/snippet}
	{#snippet solution()}<p>\(\operatorname{div}(\operatorname{curl}\mathbf F) = (R_y - Q_z)_x + (P_z - R_x)_y + (Q_x - P_y)_z = R_{yx} - Q_{zx} + P_{zy} - R_{xy} + Q_{xz} - P_{yz}\). The six terms cancel in pairs because mixed partial derivatives are equal. This is \(d(d\omega) = 0\) for the 1-form \(\omega = P\,dx + Q\,dy + R\,dz\): its \(d\) is the 2-form with the coefficients of \(\operatorname{curl}\mathbf F\), and \(d\) of that 2-form is \(\operatorname{div}(\operatorname{curl}\mathbf F)\,dx\wedge dy\wedge dz\).</p>{/snippet}
</Exercise>

<Exercise level={3} title="A closed form that refuses to be exact">
	<p>On the plane with the origin removed, let \(\omega = \dfrac{-y\,dx + x\,dy}{x^2 + y^2}\). Show that \(d\omega = 0\), and that \(\oint\omega = 2\pi\) around the unit circle. Explain why \(\omega\) cannot equal \(df\) for any smooth function \(f\) on the punctured plane.</p>
	{#snippet hint()}<p>With \(P = -y/(x^2+y^2)\) and \(Q = x/(x^2+y^2)\), compute \(Q_x\) and \(P_y\) with the quotient rule. For the circle use \(x = \cos t\), \(y = \sin t\).</p>{/snippet}
	{#snippet solution()}<p>By the quotient rule, \(Q_x = \dfrac{(x^2+y^2) - x\cdot 2x}{(x^2+y^2)^2} = \dfrac{y^2 - x^2}{(x^2+y^2)^2}\) and \(P_y = \dfrac{-(x^2+y^2) + y\cdot 2y}{(x^2+y^2)^2} = \dfrac{y^2 - x^2}{(x^2+y^2)^2}\), so \(d\omega = (Q_x - P_y)\,dx\wedge dy = 0\). On the unit circle, \(x^2 + y^2 = 1\), \(dx = -\sin t\,dt\) and \(dy = \cos t\,dt\), so \(\omega = (\sin^2 t + \cos^2 t)\,dt = dt\), and \(\oint\omega = 2\pi\). If \(\omega\) were \(df\), the integral around any closed loop would be \(f(\text{end}) - f(\text{start}) = 0\). This form is the hero of <Ref to="cohomology/de-rham" />.</p>{/snippet}
</Exercise>

<h2 id="summary">Summary</h2>

<Recap>
	<ul>
		<li>The derivative is a rate; the integral is a total; the fundamental theorem says the total of a derivative over an interval is the signed boundary values: \(\int_a^b F' = F(b) - F(a)\).</li>
		<li>Vector fields assign arrows to points. Their line integrals measure work; curl measures circulation per area, divergence outflow per area. Green’s, Stokes’ and the divergence theorem all say “derivative inside = original on the boundary”, and all come from cancelling interior edges.</li>
		<li>A covector is a linear measuring device for arrows, pictured as a stack of lines; a 1-form is a covector at every point, pictured as local stacks of sheets. Line integrals count sheets crossed, and \(\int_\gamma df = f(B) - f(A)\).</li>
		<li>The wedge product measures oriented area: \((dx\wedge dy)(\mathbf u, \mathbf v) = u_1v_2 - u_2v_1\). \(k\)-forms measure oriented \(k\)-dimensional pieces and are integrated over them.</li>
		<li>The exterior derivative \(d\) is gradient, curl and divergence in one; pictorially it marks where sheets end. It satisfies \(d\circ d = 0\), the cousin of \(\partial\circ\partial = 0\).</li>
		<li>Forms pull back along maps (arrows reverse), and pullback commutes with \(d\), so forms and \(d\) live on manifolds.</li>
		<li>Stokes’ theorem \(\int_{\partial M}\omega = \int_M d\omega\) unifies the classical theorems and says that \(d\) is the mirror image of \(\partial\) under integration.</li>
	</ul>
</Recap>

<h2 id="further-reading">Further reading</h2>

<FurtherReading
	items={[
		{
			title: 'A Geometric Approach to Differential Forms',
			author: 'David Bachman',
			url: 'https://arxiv.org/abs/math/0306194',
			note: 'A gentle, picture-driven course in forms for students who know some multivariable calculus; the free draft of his Birkhäuser book.',
			kind: 'book',
			free: true
		},
		{
			title: 'A Visual Introduction to Differential Forms and Calculus on Manifolds',
			author: 'Jon Pierre Fortney',
			url: 'https://link.springer.com/book/10.1007/978-3-319-96992-3',
			note: 'Hundreds of figures; chapter 5 is devoted to visualising one-, two- and three-forms. The best next step after this chapter.',
			kind: 'book'
		},
		{
			title: 'Visual Differential Geometry and Forms',
			author: 'Tristan Needham',
			url: 'https://press.princeton.edu/books/paperback/9780691203706/visual-differential-geometry-and-forms',
			note: 'A lavishly drawn tour of curvature, with a final act on forms in the geometric spirit of this chapter.',
			kind: 'book'
		},
		{
			title: 'Discrete Differential Geometry: An Applied Introduction',
			author: 'Keenan Crane',
			url: 'https://www.cs.cmu.edu/~kmcrane/Projects/DDG/paper.pdf',
			note: 'Course notes that teach exterior calculus on meshes, where forms literally become cochains. Beautiful figures; accompanying lecture videos.',
			kind: 'notes',
			free: true
		},
		{
			title: 'Differential forms and integration',
			author: 'Terence Tao',
			url: 'https://www.math.ucla.edu/~tao/preprints/forms.pdf',
			note: 'A short essay (from the Princeton Companion to Mathematics) explaining forms as the things you integrate over oriented domains.',
			kind: 'paper',
			free: true
		},
		{
			title: 'On the Visualization of Differential Forms',
			author: 'Duarte Maia',
			url: 'https://math.uchicago.edu/~dmaia/documents/visualizing_diff_forms.pdf',
			note: 'Builds on Piponi’s pictures of forms as sheets whose ends are the exterior derivative, with Stokes’ theorem as counting.',
			kind: 'notes',
			free: true
		},
		{
			title: 'Gravitation',
			author: 'Charles Misner, Kip Thorne and John Archibald Wheeler',
			url: 'https://press.princeton.edu/books/hardcover/9780691177793/gravitation',
			note: 'The physics classic whose chapters 2 and 4 introduced the "stack of surfaces" picture of 1-forms to generations of students.',
			kind: 'book'
		},
		{
			title: 'Calculus on Manifolds',
			author: 'Michael Spivak',
			url: 'https://doi.org/10.1201/9780429501906',
			note: 'A famously compact rigorous treatment, culminating in Stokes’ theorem for chains; the source of this chapter’s epigraph.',
			kind: 'book'
		},
		{
			title: 'Differential Forms in Algebraic Topology',
			author: 'Raoul Bott and Loring Tu',
			url: 'https://link.springer.com/book/10.1007/978-1-4757-3951-0',
			note: 'The graduate classic that uses forms to do topology. Read after the next chapter.',
			kind: 'book'
		}
	]}
/>
