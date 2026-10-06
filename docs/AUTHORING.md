# Authoring guide — *Homology & Cohomology: an illustrated journey*

This is the house style and technical handbook for writing chapters of the book.
Read it fully before writing. It is long because the book is ambitious: an
interactive, beautifully illustrated textbook that takes a reader with **no
background** in algebra, topology or category theory all the way to a genuine
understanding of homology and cohomology.

---

## 1. Who we are writing for

- A curious, intelligent adult who has forgotten most school algebra, has never
  seen a proof, and has never heard of a group, a topological space, a manifold,
  a differential form or a category.
- They are willing to work, but they need **every** idea motivated, explained
  slowly, shown in pictures, and tried out by hand.
- They will read on a laptop or a phone, often in several sittings.

**Our promise to the reader:** nothing is used before it is explained; every new
symbol is read aloud the first time; every abstraction is preceded by at least
one concrete example; every important idea has a picture; every chapter tells
you why you are learning what you are learning.

## 2. Voice and pedagogy

1. **Concrete → abstract.** Start every new idea with a specific example the
   reader can see or play with (a triangle, a clock, a loop on a doughnut), then
   generalize. Climb the "ladder of abstraction" one rung at a time.
2. **Over-explain.** If you think a step is obvious, explain it anyway. Say what
   the symbols mean in words. Expand abbreviations. Write the intermediate step.
   Prefer two short sentences to one clever one.
3. **Motivate before defining.** Pose the question first ("which edge-labelings
   come from a potential?"), let the reader feel the need, then give the
   definition as the answer.
4. **Several models for key ideas** (Thurston): give 2–3 complementary pictures
   of the big concepts (e.g. kernel = "what gets crushed" = "solutions of the
   homogeneous equation" = "quiet patterns").
5. **Say where an intuition breaks** (Tao: rigour destroys *bad* intuition). Pair
   each intuition box with a *Careful* box when the picture can mislead.
6. **Honesty.** Never say something false to simplify. If you simplify, say so
   ("this is not quite the full definition; the complete one is …").
7. **Rhythm.** Prose → picture → definition → example → check-yourself → next idea.
   Avoid walls of text: a paragraph is 2–6 sentences; a section is 400–1200 words.
8. **Warmth.** Second person ("you"), encouraging, occasionally playful, never
   condescending. No hype ("mind-blowing"), no filler ("it is important to note").
9. **The four recurring ideas.** The whole book restages four ideas; name them
   when they reappear so homology feels like a reunion:
   **quotients** (identify things), **kernel & image** (what's crushed / what's
   reached), **formal sums** (inventories of pieces), **reversed arrows**
   (preimages, transposes, pullbacks, cochains).
10. **Payoff.** Each foundations/topology chapter should say where its ideas pay
    off later (use the `<Ahead>` callout near the start).

## 3. Anatomy of a chapter

A chapter is one Svelte file: `src/routes/(book)/<part>/<slug>/+page.svelte`.
The layout adds the title block (part, number, title, subtitle, reading time,
prerequisites), the sidebar, numbered section headings and the next-chapter card,
all from `src/lib/content/toc.ts`. **You write only the body.**

Required shape:

```svelte
<script lang="ts">
	import Epigraph from '$lib/components/prose/Epigraph.svelte';
	import Ahead from '$lib/components/prose/Ahead.svelte';
	// … other components and your figures
</script>

<Epigraph author="Henri Poincaré" source="Science and Method (1908)">Mathematics is the art of giving the same name to different things.</Epigraph>

<p class="lead">One or two inviting paragraphs that pose the chapter's question.</p>

<Ahead><p>Why this matters for homology / cohomology, in plain words.</p></Ahead>

<h2 id="first-section">First section title</h2>
<p>…</p>

<!-- 5–9 h2 sections, each with a kebab-case id (used for the sidebar and links) -->

<h2 id="exercises">Exercises</h2>
<!-- 4–8 <Exercise> blocks with solutions -->

<h2 id="summary">Summary</h2>
<Recap>…bullets…</Recap>

<h2 id="further-reading">Further reading</h2>
<FurtherReading items={[…]} />
```

**Targets per chapter:** 4,500–8,000 words of prose; **at least 5 figures, at
least 3 of them interactive** (2D or 3D); 4–8 exercises with full solutions;
glossary entries for every term introduced.

**Figure numbers** are `num="<chapter>.<k>"` in document order (`2.4.1`,
`2.4.2`, …), and the prose refers to them the same way ("see Figure 2.4.3").
`src/lib/content/chapters.test.ts` enforces the numbering and the closing
sections (exercises, summary, further reading).

Use `<h3>` for subsections inside an `<h2>`. Do not use `<h1>` (the layout owns
it). Headings may contain math.

## 4. Writing math

Math is written directly in the template and rendered **at build time**:

- inline: `\( H_n(X) = \ker \partial_n / \im \partial_{n+1} \)`
- display: `\[ \partial_{n-1} \circ \partial_n = 0 \]`

Rules (the build enforces them with clear errors):

- Math may appear anywhere in template **text**, including inside components'
  children and headings — but **not inside an attribute string**. If a title,
  caption or label needs math, pass it as a snippet:
  ```svelte
  <Definition>
  	{#snippet head()}The group \(\Z/n\){/snippet}
  	<p>…</p>
  </Definition>
  ```
  Callouts accept `title="plain text"` or a `head` snippet. Figures take a
  `caption` snippet.
- Display math may sit inside a `<p>` or between paragraphs.
- TeX errors fail the build and print the file, line and formula.
- Never put a literal `{` or `}` in prose outside math (Svelte reads them as
  expressions). Inside math they are fine.
- For math that changes with the reader's input, use the runtime component
  `<TeX tex={…} display? />` with a JS string (remember to escape backslashes, or
  use `String.raw\`\frac{a}{b}\``).
- Inside SVG figures, use `<SvgTeX x y tex />`.
- Punctuation written straight after inline math (`\(x\).`) is kept on the same
  line as the formula automatically, so do not put a space before it.
- Every rendered formula gets `role="math"` and an `aria-label` with its TeX
  source (KaTeX's HTML output is otherwise hidden from screen readers).

### Macros (defined in `src/lib/katex/macros.js`)

`\N \Z \Q \R \C \F \RP \CP`, `\im \coker \rank \Hom \Ext \Tor \id \dR \sgn \supp`,
`\Set \Top \Grp \Ab \Vect \Ch`, `\op` (superscript op), `\lra`, `\xto{f}`,
`\ip{a}{b}` (⟨a, b⟩), `\abs{x}`, `\norm{x}`, `\set{…}`, `\setb{x}{P(x)}` (set-builder).
Semantic colour macros (match the palette, see §6): `\cyc{…}` gold, `\bdy{…}` teal,
`\chn{…}` violet, `\hole{…}` rose, `\hlb{…}` blue, `\hlg{…}` green.

### Notation conventions (use these everywhere)

| Concept | Write | Notes |
|---|---|---|
| integers mod n | `\Z/n` (and `\Z/2`) | never `\Z_n`; say once that \(\Z/2\) is also written \(\mathbb F_2\) |
| maps | `f\colon X \to Y`, `x \mapsto x^2` | composition `g\circ f`, read "g after f" |
| preimage | `f^{-1}(B)` | exists even if f is not invertible |
| identity | `\id_X` | |
| isomorphic / homeomorphic | `\cong` | |
| homotopy equivalent | `\simeq` | |
| equivalence relation | `\sim`, class `[x]` | quotient set `X/{\sim}` |
| abelian groups | additive: `a+b`, `0`, `-a`, direct sum `\oplus` | general groups multiplicative `gh`, identity `e` |
| quotient group | `G/H`, cosets `a + H` | |
| transpose | `A^{\mathsf T}` | |
| spheres, disks | `S^n`, `D^n` | torus `T^2`, Klein bottle `K`, projective plane `\RP^2`, genus-g surface `\Sigma_g` |
| unit interval | `I = [0,1]` | |
| simplices | `\sigma, \tau`; oriented simplex `[v_0, v_1, \dots, v_k]` | standard simplex `\Delta^n` |
| number of k-simplices | `n_k` | |
| chains | `C_k(K)`, `C_k(K;\Z/2)`, `C_k(K;G)` | boundary `\partial_k` |
| cycles, boundaries | `Z_k = \ker\partial_k`, `B_k = \im\partial_{k+1}` | |
| homology | `H_k(X)`, `H_k(X;G)`, class `[z]` | reduced `\tilde H_k` |
| Betti numbers | `b_k` | say once that data science often writes \(\beta_k\) |
| Euler characteristic | `\chi(X)` | |
| boundary formula | `\partial[v_0,\dots,v_k] = \sum_{i=0}^k (-1)^i [v_0,\dots,\hat v_i,\dots,v_k]` | vertices labelled by integers; simplices written in increasing order; edges oriented from lower to higher label |
| cochains | `C^k(K;G) = \Hom(C_k(K),G)` | coboundary `\delta`, with `(\delta\varphi)(\sigma) = \varphi(\partial\sigma)` (no extra sign) |
| cocycles etc. | `Z^k, B^k, H^k(X;G)` | pairing `\ip{\varphi}{c}` |
| induced maps | `f_*` (homology, pushes forward), `f^*` (cohomology, pulls back) | |
| cup / cap | `\smile`, `\frown` | `(\alpha\smile\beta)(\sigma)=\alpha(\sigma|_{[v_0..v_p]})\,\beta(\sigma|_{[v_p..v_{p+q}]})` |
| forms | `\Omega^k(M)`, `d`, `\wedge`, `H^k_{\dR}(M)` | |
| categories | `\Set, \Top, \Ab, \Grp, \Vect`; functor `F\colon\mathcal C\to\mathcal D`; natural transformation `\eta\colon F\Rightarrow G` | |
| persistence | Vietoris–Rips `\mathrm{VR}_r(P)` with **radius** convention r: edge when distance ≤ 2r | bars half-open `[b,d)` |

## 5. Concept ledger — who introduces what

Introduce a concept only in the chapter listed here. Other chapters may **recall**
it in a sentence and link back with `<Ref to="…" />` and `<Term t="…">`. If your
chapter needs something earlier chapters don't provide, teach a short "just in
time" version and flag it in your final report.

- **0.1 The Shape of a Question** — informal: what topology studies, invariants, "holes", coffee cup = doughnut, Euler's formula teaser, roadmap. No formal definitions.
- **0.2 How to Read Mathematics** — and/or/not, implication (as a promise; vacuous truth), converse vs contrapositive, iff, ∀/∃ and their order, negation, definitions/theorems/proofs/lemmas/corollaries/remarks, proof shapes (direct, contrapositive, contradiction, double inclusion, induction, "well-defined"), symbol dictionary, Greek letters by role, levels of sameness (=, ≅, ≃, ∼, :=), subscripts push forward / superscripts pull back.
- **1.1 Sets and Functions** — sets, ∈, ⊆, ∅, ∪ ∩ ∖, complement, Cartesian product, functions (domain, codomain, image, preimage), injective/surjective/bijective, composition, identity, inverses, commutative diagrams ("dots and arrows" vocabulary seed), finite cardinality (brief: countable/uncountable).
- **1.2 Equivalence and Quotients** — relations, equivalence relations (reflexive/symmetric/transitive), classes, partitions, quotient set X/∼, projection map, well-defined functions on quotients, examples: parity, clock arithmetic ℤ/n as a set, fractions, rotations, *gluing preview* ([0,1] with 0∼1 is a circle).
- **1.3 Groups** — operations, group axioms, examples (ℤ, ℤ/n, symmetries of a triangle D₃, rotations, ℝ under +), abelian groups (additive notation), subgroups, generators, cyclic groups, order, homomorphisms, kernel, image, isomorphism, Cayley tables, why non-abelian groups exist (D₃) and why abelian ones suffice for homology.
- **1.4 Abelian Groups and Formal Sums** — cosets, quotient groups (ℤ/nℤ by collapsing; ℝ/ℤ as a circle), first isomorphism theorem, direct sums, free abelian groups and formal ℤ-linear combinations (*chains preview*), bases and rank, generators and relations, classification of finitely generated abelian groups ℤ^r ⊕ ℤ/d₁ ⊕ … with d₁|d₂|…, torsion, exact sequences (first look: im = ker; short exact sequences).
- **1.5 Linear Algebra** — vector spaces over ℝ and ℤ/2, span, independence, basis, dimension, linear maps as matrices, matrix product = composition, kernel, image, rank, rank–nullity, row reduction, quotient spaces, solving Ax=b, Lights Out over ℤ/2, dual space V*, transpose, "im A = (ker Aᵀ)^⊥"-style duality (cohomology preview), matrices over ℤ, Smith normal form, reading off ℤ^r ⊕ torsion.
- **2.1 Spaces and Continuity** — distance/metric spaces, open balls, open & closed sets, topological space axioms, subspace & product topology, continuity (ε–δ intuition; preimage of open is open), homeomorphism, invariants (connectedness, path-connectedness, compactness intuitively, cut points, letters of the alphabet), Hausdorff (brief).
- **2.2 Gluing Spaces Together** — quotient topology, gluing diagrams and edge words: circle, cylinder, Möbius band, torus aba⁻¹b⁻¹, Klein bottle abab⁻¹, sphere aa⁻¹, ℝP² (aa or abab), embedding vs immersion, wedge ∨, cone, suspension, collapsing X/A, genus-g words.
- **2.3 Homotopy** — paths, homotopy of maps, homotopy equivalence, deformation retraction (annulus→circle, Möbius→circle, punctured torus→figure eight, ℝⁿ→point), contractible, loops, the fundamental group π₁ (loop composition), π₁(S¹)=ℤ and winding number, π₁ of the figure eight is non-abelian, simply connected.
- **2.4 Manifolds and Surfaces** — locally Euclidean, charts, atlases, transition maps, dimension, examples, manifolds with boundary, smooth manifolds, tangent spaces, orientability (ant on a Möbius band), connected sum, classification of closed surfaces (S², Σ_g, sums of ℝP²'s), genus.
- **2.5 Simplicial Complexes** — simplices, faces, barycentric coordinates, simplicial complexes (closure & intersection rules), abstract simplicial complexes, realization, triangulations (hollow triangle, hollow tetrahedron, 3×3 torus grid, 7-vertex torus, 6-vertex ℝP²), orientation of simplices, simplicial maps, barycentric subdivision, Δ-complexes (brief), CW complexes (cells, attaching maps; torus = 1 vertex + 2 edges + 1 face).
- **2.6 The Euler Characteristic** — V−E+F, Euler/Descartes, proof idea, invariance under subdivision, Lhuilier's torus, χ = 2−2g and 2−k, χ for CW complexes, classification by (orientability, χ), foreshadow χ = b₀ − b₁ + b₂.
- **3.1 Cycles and Boundaries** — graphs first: cycles = even-degree edge sets, symmetric difference, cycle space, spanning trees & fundamental cycles, b₁ = E − V + c (Kirchhoff), b₀ = components; then fill in triangles: boundaries; **"a hole is a cycle that is not a boundary"**; homologous cycles (they sweep out a surface between them); loops on sphere/torus; 2-cycles and voids; the "how many holes does a straw have" debate.
- **3.2 Chains and the Boundary Operator** — C_k(K;ℤ/2) as sets of simplices with symmetric difference, mod-2 boundary ("faces counted an odd number of times"), ∂∂ = 0 mod 2 (each face counted twice), then orientations, C_k(K;ℤ), signed boundary, ∂∂=0 with signs, chain complexes, boundary matrices.
- **3.3 Homology Groups** — Z_k, B_k, B_k ⊆ Z_k, H_k = Z_k/B_k, classes, Betti numbers, b_k = n_k − rank ∂_k − rank ∂_{k+1}, full computations (point, two points, circle, disk, sphere, torus, wedge of circles), H₀ = components, reduced homology, Euler–Poincaré χ = Σ(−1)^k b_k, and the cliffhanger: mod 2 cannot tell the torus from the Klein bottle.
- **3.4 Computing Homology** — boundary matrices, rank by row reduction (ℤ/2, ℚ), Smith normal form over ℤ, torsion, Klein bottle H₁ = ℤ ⊕ ℤ/2, ℝP² H₁ = ℤ/2 and H₂ = 0 (∂ of all triangles = 2c), orientability and top homology, coefficients ℤ vs ℤ/2 vs ℚ, the live **homology calculator**, generators.
- **3.5 Maps, Invariance, and First Triumphs** — simplicial maps, chain maps, induced maps, functoriality, homotopy invariance (chain homotopy idea), singular homology, Hₙ(Sⁿ) ≠ 0, no-retraction, Brouwer fixed point theorem, invariance of dimension, degree, antipodal map, hairy ball theorem, Hurewicz H₁ = π₁^ab (commutator loop), Lefschetz (glimpse), Jordan curve (statement).
- **3.6 Exact Sequences and Mayer–Vietoris** — exactness, SES of chain complexes → LES (connecting map), relative homology, LES of a pair, excision (intuition), good pairs, Mayer–Vietoris (spheres, torus, Klein bottle), cellular chain complex, degrees, cellular computations (surfaces from words, ℝPⁿ, ℂPⁿ).
- **3.7 Persistent Homology** — point clouds, scale, Čech & Vietoris–Rips (radius convention), nerve theorem (statement), filtrations, births/deaths, barcodes, diagrams, elder rule, stability theorem (statement), the reduction algorithm, applications with citations.
- **4.1 Cochains** — potentials on vertices, values on edges, δ as discrete gradient/curl, Kirchhoff's voltage law, "which edge labellings are gradients?", closed vs exact, the impossible staircase, Penrose triangle, arbitrage, H⁰ = locally constant functions, H¹ as obstruction, Hodge decomposition preview.
- **4.2 Cohomology Groups** — Cᵏ = Hom(C_k, G), δ = ∂ᵀ, δδ=0, Zᵏ, Bᵏ, Hᵏ, computations (circle, torus, sphere, ℝP², Klein bottle, with ℤ and ℤ/2), pairing ⟨φ, c⟩, contravariance f*, Universal Coefficient Theorem and the torsion shift.
- **4.3 Differential Forms** — vector calculus refresher, covectors, 1-forms as stacks of sheets, line integrals, wedge product, k-forms, exterior derivative d (grad/curl/div), d∘d=0, pullback, integration, generalized Stokes.
- **4.4 de Rham Cohomology** — closed/exact forms, H^k_dR, H⁰, the angle form dθ on ℝ²∖0 (∮ = 2π·winding), H¹_dR(S¹)=ℝ, Poincaré lemma, homotopy invariance, de Rham's theorem, integration pairing, physics (conservative fields, Ampère, Aharonov–Bohm).
- **4.5 The Cup Product** — wedge product on cohomology, simplicial cup product, graded commutativity, ring of T², T² vs S¹∨S¹∨S², ℝP² with ℤ/2, ℝPⁿ, ℂPⁿ, Künneth (glimpse), intersections.
- **4.6 Poincaré Duality** — fundamental class, dual cell decomposition, Hᵏ ≅ H_{n−k}, cap product, intersection numbers, consequences (symmetric Betti numbers, χ = 0 in odd dimensions), intersection form & signature (glimpse), ℤ/2 version for non-orientable, Alexander & Lefschetz duality (glimpse).
- **4.7 Sheaves and Čech Cohomology** — covers, nerves, nerve theorem, Čech cochains and cohomology (circle with 3 arcs; the 2-arc subtlety), presheaves, sheaves (locality & gluing), examples (continuous/locally constant functions, branches of √z and log z), sheaf cohomology as failure to glue, Penrose triangle, Leray, applications (sensor networks, cellular sheaves).
- **4.8 Curvature and Characteristic Classes** — vector bundles (tangent bundle, Möbius line bundle), sections, hairy ball revisited, Poincaré–Hopf, Euler class, Gauss–Bonnet ∫K dA = 2πχ, Chern class/number, Dirac monopole & charge quantization, Berry phase and topological insulators (glimpse), Stiefel–Whitney w₁ and orientability.
- **5.1 Categories and Functors** — categories, examples, commutative diagrams, functors (co/contravariant), Hₙ and Hⁿ as functors, natural transformations (V→V** natural, V→V* not), Hurewicz and connecting maps as natural, universal properties (products, coproducts, kernels, cokernels), abelian categories (glimpse), Brouwer via functoriality.
- **5.2 Homological Algebra** — chain complexes & chain maps as a category, chain homotopy, snake lemma (diagram chase), LES from SES, Hom and ⊗, resolutions, Ext and Tor, both UCTs, Künneth, spectral sequences (what/why), Eilenberg–Steenrod axioms.
- **5.3 Horizons** — Hodge theory (harmonic forms, graph Hodge Laplacian, HodgeRank), generalized cohomology (K-theory, cobordism), homotopy groups πₙ, applications (TDA, sensor networks, robotics, neuroscience, topological phases), a study path.

**Spine examples to reuse:** the hollow triangle (circle), the hollow tetrahedron
(sphere), the square torus aba⁻¹b⁻¹ (3×3 grid), the Klein bottle abab⁻¹, ℝP²
(6-vertex), the punctured plane ℝ²∖0 with the angle form, Lights Out, the
Königsberg bridges, letters of the alphabet, the coffee cup and doughnut.

## 6. Colour semantics (prose *and* figures)

| Colour | CSS var / TeX macro / three.js | Meaning |
|---|---|---|
| gold | `var(--gold-bright)` / `\cyc{}` / `'gold'` | cycles; the thing being measured; primary highlight |
| teal | `var(--teal)` / `\bdy{}` / `'teal'` | boundaries; exact things; "it bounds" |
| violet | `var(--violet)` / `\chn{}` / `'violet'` | chains; general elements; selections |
| rose | `var(--rose)` / `\hole{}` / `'rose'` | holes; obstructions; non-trivial classes |
| blue | `var(--blue)` / `\hlb{}` / `'blue'` | neutral structure; examples |
| green | `var(--green)` / `\hlg{}` / `'green'` | exercises; success; "consistent" |
| amber | `var(--amber)` | warnings |

Surfaces use the iridescent material. Backgrounds are always the dark night-sky
panel; never use white backgrounds inside figures.

## 7. Components

All live in `src/lib/components/`. Import them explicitly.

### Prose (`prose/`)

| Component | Use |
|---|---|
| `Epigraph author source` + text child | opening quote — **verified quotes only** (§10) |
| `Definition`, `Theorem`, `Proposition`, `Lemma`, `Corollary` | formal statements (`title` or `head` snippet; optional `id` for links; `label` to override e.g. "Theorem (Brouwer)") |
| `Proof` | proof body; a ∎ is added automatically |
| `Example`, `Intuition`, `KeyIdea`, `Warning` (label "Careful"), `Remark`, `History`, `Recap`, `Question` ("Pause and ponder"), `Notation`, `Ahead` ("Where this is going") | callouts, all `title`/`head`/`id` |
| `Exercise level={1|2|3} title` + `{#snippet hint()}` + `{#snippet solution()}` | exercises; hint and solution are collapsible |
| `Figure size="normal|wide|full" title hint num` + `{#snippet caption()}` | wraps every figure; `hint` says how to interact ("Drag to rotate · click an edge") |
| `Term t="glossary-key"` + text | glossary popover; use on first use of a term from another chapter |
| `Ref to="part/slug" hash?` | cross-reference link (renders "§3.2 Chains and…" if no children) |
| `Hl k="key" c="gold|teal|…"` | linked highlighting: hovering sets `hl.key` (from `$lib/stores/ui.svelte`) so your figure can emphasise the matching object |
| `Scrub bind:value min max step format` | inline draggable number in prose |
| `TeX tex display?` | runtime math |
| `MatrixView M rowLabels colLabels highlightRows highlightCols cellClass caption onhover onclick` | interactive matrices |
| `FurtherReading items` | annotated reading list (`{title, author, url, note, kind, free}`) |
| `Aside` | small marginal remark |

### UI controls (`ui/`)

`Slider bind:value min max step label format`, `Toggle bind:checked label`,
`Segmented bind:value options=[{value,label}]`, `Button variant="ghost|gold|subtle" onclick`,
`StepControls bind:step count labels interval`, `Controls` (a styled bar to hold
controls under a figure: `<Controls>…</Controls>`).

### 2D diagrams (`svg/`)

- `Svg viewBox maxHeight label` — responsive canvas with shared defs:
  arrowheads `marker-end="url(#arrow-gold)"` (also teal, violet, rose, blue,
  green, amber, ivory, dim), mid-arrows `url(#arrowmid-…)`, filters `url(#glow)`,
  `url(#glow-strong)`, gradient `url(#vertex-fill)`.
- `SvgTeX x y tex size color w h anchor` — KaTeX label inside SVG.
- `ComplexView2D K pos selected vertexColor edgeColor triColor edgeLabel
  vertexLabel triLabel orient interactive onpick onhover` — draws a simplicial
  complex from the math engine; indices are `K.simplices[k]` indices. Use it for
  chains, cycles, cochains (edge labels), boundary demos. Must be inside `<Svg>`.
- `GluingSquare preset="torus|klein|rp2|sphere|cylinder|mobius|plain" x y size corners sides`
  — gluing diagram with arrows; inside `<Svg>`.

Write your own SVG freely for anything else. Keep strokes ~1.5–3px, use the
palette, label with `SvgTeX`, and make everything work at 360px wide.

### 3D (`three/` and `$lib/three/*`)

```svelte
<script lang="ts">
	import Scene3D, { type SceneContext } from '$lib/components/three/Scene3D.svelte';
	import { glassMesh, iridescent, glowTube, glowPoint } from '$lib/three/materials';
	import { torus, surfaceGeometry, SurfaceCurve, loopPath } from '$lib/three/surfaces';

	let p = $state(1); // reactive input from a slider
	let api: { setP(v: number): void } | null = null;

	function setup({ scene, THREE, invalidate, label }: SceneContext) {
		const f = torus(1.6, 0.6);
		scene.add(glassMesh(surfaceGeometry(f, 160, 64), { opacity: 0.85, grid: [48, 20] }));
		let loop = glowTube(new SurfaceCurve(f, loopPath(p, 1)), { color: 'gold', closed: true });
		scene.add(loop);
		label([0, 1.2, 0], 'a (TeX via $lib/katex/render tex())', { className: 'gold' });
		api = {
			setP(v) {
				scene.remove(loop);
				loop = glowTube(new SurfaceCurve(f, loopPath(v, 1)), { color: 'gold', closed: true });
				scene.add(loop);
				invalidate();
			}
		};
		return { dispose: () => (api = null) };
	}
	// Read the reactive value FIRST. The scene is created lazily (when scrolled into
	// view), so on the effect's first run `api` is null; writing `api?.setP(p)` would
	// short-circuit before `p` is read, the effect would track nothing, and the slider
	// would silently do nothing.
	$effect(() => {
		const v = p;
		api?.setP(v);
	});
</script>

<Figure size="wide" hint="Drag to rotate">
	<Scene3D {setup} height={440} controls={{ autoRotate: true }} camera={{ position: [0, 3, 6.5] }}
		label="Describe the figure for screen readers" />
	{#snippet caption()}What to notice, in one or two sentences, with math \(a\).{/snippet}
</Figure>
```

- `Scene3D` creates its WebGL context lazily when scrolled into view, renders
  only while visible, caps live contexts, and disposes everything in the scene
  graph automatically. Props: `setup`, `height`, `camera {position,target,fov}`,
  `controls` (`false` or `{autoRotate, zoom, pan, minDistance, maxDistance, …}`),
  `animate` (render every frame; needed for shimmer/animations), `label`, and
  children (HTML overlay).
- `setup(ctx)` may return `{ update(t, dt), dispose() }`. `ctx` has `THREE, scene,
  camera, renderer, controls, canvas, container, reducedMotion, invalidate(),
  onFrame(cb), label(pos, html, {className, normal}), pick(event, objects),
  project(v)`. Label `className` may be `gold teal violet rose blue small tag`.
- Materials (`$lib/three/materials`): `iridescent(opts)`, `glassMesh(geometry,
  opts)` (two-pass transparent), `glowTube(curve, {color, radius, closed, halo})`,
  `glowPoint(pos, {color, size})`, `pointCloud(positions, opts)`,
  `faceMaterial(color, opacity)`, `setGlowColor(obj, color)`, `palette`.
  Iridescent options: `opacity, grid:[u,v], gridStrength, gridColor, film, hue,
  tint, tintMix, rim, brightness, clippingPlanes`; `uniforms.uHighlight /
  uHighlightRect / uHighlightColor` paint a uv-rectangle.
- Surfaces (`$lib/three/surfaces`): `torus, sphere, cylinder, annulus, disk, plane,
  mobius, kleinBottle, kleinFigure8, boy` (ℝP²), `surfaceGeometry(fn, su, sv)`,
  `surfaceNormal`, `SurfaceCurve(fn, path, offset)`, `loopPath(p, q)`, `smoothLoop(points)`.
- Complexes (`$lib/three/complex3d`): `buildComplex3D(K, positions, opts)` →
  `{group, setEdge(i,c), setVertex(i,c), setFace(i,c), reset(), pickables}`;
  `solids.tetrahedron()`, `solids.octahedron()`.
- **Reactivity pitfall:** in `$effect`, read every reactive value before any
  `api?.…` call (see the example above), or make `api` itself `$state`.
- **Colours in custom shaders:** pass `shaderColor(name)` (not `color(name)`) to
  ShaderMaterial uniforms; `color()` is for three.js built-in materials. The
  helpers in `materials.ts` already do this.
- Keep it light: ≤ 6 Scene3D per chapter; reuse geometry; no per-frame
  allocation in `update`; respect `ctx.reducedMotion` for auto-play.

### Math engine (`$lib/math/*`, tested)

- `new SimplicialComplex(simplices)` (faces added automatically; vertices are
  integers) → `.simplices[k]`, `.count(k)`, `.fVector`, `.indexOf(s)`,
  `.boundaryMatrix(k)`, `.boundaryColumns(k)`, `.boundary(k, chain)`,
  `.coboundary(k, cochain)`, `.eulerCharacteristic()`, `.maximal()`, `.induced(pred)`.
- `isClosedSurface(K)`, `isOrientable(K)`.
- `homology(K, 'Z'|'Z2'|'Q')` → `[{rank, torsion}]`; `cohomology(K, coeff)`;
  `bettiNumbers(K)`; `groupName(g)` ("ℤ² ⊕ ℤ/2"), `groupTeX(g)`.
- `new Z2HomologyBasis(K, k, preferredCycles?)` → `.generators`, `.isCycle(chain)`,
  `.isBoundary(chain)`, `.classOf(chain)`; `boundaryZ2(K, k, chain)`.
- `smith(M)` (invariant factors), `rankZ2(M)`, `rankQ(M)`, `transpose`, `matmul`,
  `BitVec`, `conjugateGradient`.
- Examples (`$lib/math/examples`): `point, twoPoints, interval, circle(n), disk,
  figureEight, sphereTetra, sphereOcta, ball, torus7, projectivePlane6, mobius5,
  torusGrid(n,m), kleinGrid(n,m), genus2, gridSurface(kind,n,m)` (kind torus,
  klein, cylinder, mobius; returns `{complex, vertexGrid, flatTriangles}`), and the
  `examples` registry.
- Persistence (`$lib/math/persistence`): `ripsPersistence(points, maxScale)` →
  `{simplices, bars}`; `ripsAt(f, eps)`; `bettiAt(f, eps)`; sample clouds
  `noisyCircle, twoCircles, figureEightCloud, blobCloud`; `mulberry32(seed)`.
- Hodge (`$lib/math/hodge`): `hodgeDecompose(K, edgeValues)` →
  `{potential, gradient, curl, harmonic, circulation}`.

Note that `ripsPersistence` uses the *diameter* as the edge parameter: an edge appears
at its length. If you present the radius convention, an edge of length L appears at
radius r = L/2 — convert in the UI.

## 8. Figure design rules

1. **One idea per figure.** Before building, write the caption: what should the
   reader notice? If you can't say it in two sentences, split the figure.
2. **Interactive = something to discover.** Give the reader a question to answer
   by playing ("Can you find a loop that is not a boundary?"), immediate visual
   feedback, and a readout (numbers/formulas updating live).
3. **Affordances:** every interactive figure sets `hint` on `<Figure>`; clickable
   things change on hover; controls are labelled.
4. **Readouts with math:** show live formulas (`<TeX>`) beside the picture, e.g.
   \(V − E + F = 8 − 12 + 6 = 2\).
5. **Step-throughs** for processes (row reduction, gluing, boundary of a
   boundary): use `StepControls`, one change per step, with a label per step.
6. **Mobile:** must work at 360–400px width; touch targets ≥ 32px; no hover-only
   information.
7. **Accessibility:** `label` on Scene3D and Svg; keyboard focus for clickable
   SVG items when practical; never encode meaning only in colour (also use
   shape, labels or thickness).
8. **Motion:** auto-rotation and auto-play only when `prefers-reduced-motion` is
   off (`ctx.reducedMotion`). Animations ease (no linear jerks), 300–900ms.
9. **Beauty:** iridescent surfaces with fine grid lines, glowing gold cycles,
   soft halos, generous padding, centred compositions, consistent palette. Look
   at your screenshots and polish until it looks like a page from a luxurious
   illustrated book.

## 9. Files you own, and files you must not touch

- **Own:** your chapter routes `src/routes/(book)/<part>/<slug>/+page.svelte`;
  a folder for your figure components `src/lib/figures/<part>/<slug>/` (create it;
  PascalCase `.svelte` files and `.ts` helpers; optional `*.test.ts`); one
  glossary file per chapter `src/lib/content/glossary/<part>--<slug>.ts`
  exporting `entries: GlossaryEntry[]` (see `types.ts` and the example
  `homology--homology-groups.ts`).
- **Do not edit** anything else (shared components, styles, the TOC, other
  chapters, configs, package.json). Several authors work in parallel; edits
  outside your area will be lost or cause conflicts. If a shared component
  lacks something you need, copy it into your figures folder and adapt it, and
  mention it in your final report.
- No new npm dependencies.

## 10. Quotes, history and sources

- **Only verified quotes.** Use quotes from the verified banks in the research
  reports (`research-prereqs.md` "Epigraph bank", `research-homology.md` §8.2,
  `research-cohomology.md` when available) or quotes you verify yourself against
  a primary/trustworthy source. If you can't verify, don't quote. No invented or
  misattributed quotes (e.g. "Point set topology is a disease…" is misattributed
  — never use it).
- History boxes: dates and names must be right; prefer one vivid, accurate
  detail over a list.
- Further reading: real books, papers, notes and videos with working URLs, taken
  from the research reports or verified by you.

## 11. Checking your work (required before you finish)

1. `npm run check` — TeX-aware svelte-check; **0 errors** and no warnings in your files.
2. `npm test` — passes (add tests for any computed claims you make). Whole-book
   tests check that every glossary entry's math compiles, that its anchor and
   see-also keys exist, that every `<Term t="…">` resolves, and that figures
   are numbered in order.
3. `npm run build` — passes (TeX errors fail here with file:line).
4. Screenshots: serve the build and photograph your pages at desktop and phone sizes:
   ```sh
   (cd build && python3 -m http.server <PORT> >/dev/null 2>&1 &)
   SHOT=/tmp/claude-0/-home-user-homology/8d8977ca-b54f-5fd0-91c6-dd0b17902683/scratchpad/shot.mjs
   FULL=1 WAIT=2500 node $SHOT http://localhost:<PORT> ./screenshots /topology/spaces/
   SCROLL=2400 WAIT=3000 node $SHOT http://localhost:<PORT> ./screenshots /topology/spaces/   # a viewport at y=2400 (3D figures initialise when scrolled into view)
   W=390 H=844 FULL=1 SUFFIX=-mobile node $SHOT http://localhost:<PORT> ./screenshots /topology/spaces/
   ```
   Then open the PNGs with the Read tool and **look**. Fix overlaps, cramped
   labels, illegible colours, empty canvases, broken layouts on mobile.
   (WebGL works in this headless browser via SwiftShader.)
5. Re-read your chapter as the beginner reader. Is every symbol explained? Is
   there a picture for every big idea? Would you enjoy reading it?
6. Commit your work on your branch with clear messages. Do not push.
