<script lang="ts">
	import Ornament from '$lib/components/layout/Ornament.svelte';
	import { chapterHref } from '$lib/util/paths';
</script>

<svelte:head>
	<title>Cheat sheet · Homology &amp; Cohomology</title>
	<meta name="description" content="The key definitions, theorems and computations of homology and cohomology on one page." />
</svelte:head>

<main class="wrap">
	<header class="head">
		<p class="eyebrow">Reference</p>
		<h1 class="gold-text">The Whole Story on One Page</h1>
		<p class="sub">Every key definition, theorem and computation of the book, in the order they appear — each with a link back to its chapter.</p>
		<Ornament width={200} />
	</header>

	<div class="grid">
		<section class="card panel">
			<h2>Chains and boundaries</h2>
			<p>An oriented \(k\)-simplex \([v_0,\dots,v_k]\). A \(k\)-chain is a formal sum of \(k\)-simplices with coefficients in \(G\):</p>
			\[ C_k(K;G) = \Big\{ \textstyle\sum_i g_i \sigma_i \Big\}. \]
			<p>The boundary operator:</p>
			\[ \partial[v_0,\dots,v_k] = \sum_{i=0}^{k} (-1)^i\,[v_0,\dots,\hat v_i,\dots,v_k], \qquad \partial\circ\partial = 0. \]
			<a class="go ui" href={chapterHref('homology/chains')}>§3.2 Chains and the boundary operator →</a>
		</section>

		<section class="card panel">
			<h2>Homology</h2>
			<p>Cycles are chains with no boundary; boundaries are boundaries of something one dimension up:</p>
			\[ Z_k = \ker\partial_k, \qquad B_k = \im\partial_{k+1} \subseteq Z_k, \qquad H_k = Z_k / B_k. \]
			<p>Betti numbers (over a field \(\F\)), with \(n_k\) the number of \(k\)-simplices:</p>
			\[ b_k = \dim H_k = n_k - \rank\partial_k - \rank\partial_{k+1}. \]
			<a class="go ui" href={chapterHref('homology/homology-groups')}>§3.3 Homology groups →</a>
		</section>

		<section class="card panel">
			<h2>Euler–Poincaré</h2>
			<p>The alternating count of cells equals the alternating sum of Betti numbers:</p>
			\[ \chi(X) = \sum_k (-1)^k n_k = \sum_k (-1)^k b_k. \]
			<p>For closed surfaces: \(\chi(\Sigma_g) = 2 - 2g\) (orientable, genus \(g\)); \(\chi = 2 - k\) for a sum of \(k\) projective planes.</p>
			<a class="go ui" href={chapterHref('topology/euler-characteristic')}>§2.6 The Euler characteristic →</a>
		</section>

		<section class="card panel">
			<h2>Torsion</h2>
			<p>Every finitely generated abelian group is</p>
			\[ \Z^{r} \oplus \Z/d_1 \oplus \cdots \oplus \Z/d_m, \qquad d_1 \mid d_2 \mid \cdots \mid d_m . \]
			<p>The free rank is read from ranks of boundary matrices; the torsion \(\Z/d_i\) of \(H_k\) from the Smith normal form of \(\partial_{k+1}\) (diagonal entries \(d_i > 1\)).</p>
			<a class="go ui" href={chapterHref('homology/computing')}>§3.4 Computing homology →</a>
		</section>

		<section class="card panel">
			<h2>Invariance and functoriality</h2>
			<p>A continuous map \(f\colon X\to Y\) induces \(f_*\colon H_k(X)\to H_k(Y)\), with</p>
			\[ (g\circ f)_* = g_*\circ f_*, \qquad (\id_X)_* = \id, \qquad f\simeq g \;\Rightarrow\; f_* = g_*. \]
			<p>So homotopy-equivalent spaces have isomorphic homology. Payoffs: Brouwer's fixed point theorem, the hairy ball theorem, invariance of dimension.</p>
			<a class="go ui" href={chapterHref('homology/invariance')}>§3.5 Maps, invariance, and first triumphs →</a>
		</section>

		<section class="card panel">
			<h2>Exact sequences</h2>
			<p>Mayer–Vietoris, for \(X = U\cup V\) with \(U, V\) open:</p>
			\[ \cdots \to H_k(U\cap V) \to H_k(U)\oplus H_k(V) \to H_k(X) \xrightarrow{\;\partial_*\;} H_{k-1}(U\cap V) \to \cdots \]
			<p>Every map's image is exactly the next map's kernel.</p>
			<a class="go ui" href={chapterHref('homology/exact-sequences')}>§3.6 Exact sequences and Mayer–Vietoris →</a>
		</section>

		<section class="card panel">
			<h2>Cohomology</h2>
			<p>Cochains measure chains; the coboundary is the transpose of the boundary:</p>
			\[ C^k(K;G) = \Hom(C_k(K), G), \qquad (\delta\varphi)(\sigma) = \varphi(\partial\sigma), \qquad \delta\circ\delta = 0, \]
			\[ H^k = \ker\delta^k \big/ \im\delta^{k-1}. \]
			<p>Maps pull back: \(f\colon X\to Y\) gives \(f^*\colon H^k(Y)\to H^k(X)\).</p>
			<a class="go ui" href={chapterHref('cohomology/cohomology-groups')}>§4.2 Cohomology groups →</a>
		</section>

		<section class="card panel">
			<h2>Universal coefficients</h2>
			<p>Cohomology is determined by homology, but torsion moves up one degree:</p>
			\[ H^k(X;\Z) \;\cong\; \Hom\big(H_k(X),\Z\big) \,\oplus\, \Ext\big(H_{k-1}(X),\Z\big). \]
			<p>Example: \(H_1(\RP^2) = \Z/2\) and \(H_2(\RP^2) = 0\), yet \(H^2(\RP^2;\Z) = \Z/2\).</p>
			<a class="go ui" href={chapterHref('big-picture/homological-algebra')}>§5.2 Homological algebra →</a>
		</section>

		<section class="card panel">
			<h2>de Rham and Stokes</h2>
			\[ \int_{\partial M}\omega = \int_M d\omega, \qquad d\circ d = 0, \qquad H^k_{\dR}(M) = \frac{\{\text{closed } k\text{-forms}\}}{\{\text{exact } k\text{-forms}\}} \cong H^k(M;\R). \]
			<p>On the punctured plane, \(d\theta = \frac{-y\,dx + x\,dy}{x^2+y^2}\) is closed but not exact: \(\oint_\gamma d\theta = 2\pi\cdot(\text{winding number of }\gamma)\).</p>
			<a class="go ui" href={chapterHref('cohomology/de-rham')}>§4.4 de Rham cohomology →</a>
		</section>

		<section class="card panel">
			<h2>Cup product</h2>
			\[ (\alpha\smile\beta)(\sigma) = \alpha\big(\sigma|_{[v_0,\dots,v_p]}\big)\,\beta\big(\sigma|_{[v_p,\dots,v_{p+q}]}\big), \qquad \alpha\smile\beta = (-1)^{pq}\,\beta\smile\alpha. \]
			<p>\(T^2\) and \(S^1\vee S^1\vee S^2\) have the same groups; on \(T^2\), \(a\smile b\) generates \(H^2\), on the wedge every such product is \(0\).</p>
			<a class="go ui" href={chapterHref('cohomology/cup-product')}>§4.5 The cup product →</a>
		</section>

		<section class="card panel">
			<h2>Poincaré duality</h2>
			<p>For a closed, oriented \(n\)-manifold \(M\):</p>
			\[ H^k(M;\Z) \;\cong\; H_{n-k}(M;\Z), \qquad b_k = b_{n-k}. \]
			<p>With \(\Z/2\) coefficients it holds for every closed manifold, orientable or not.</p>
			<a class="go ui" href={chapterHref('cohomology/poincare-duality')}>§4.6 Poincaré duality →</a>
		</section>

		<section class="card panel">
			<h2>Gauss–Bonnet</h2>
			<p>Total curvature of a closed surface is topology:</p>
			\[ \int_M K\, dA = 2\pi\,\chi(M). \]
			<p>Sphere: \(4\pi\). Torus: \(0\). The hairy ball theorem: a sphere has no nowhere-zero tangent vector field, because \(\chi(S^2) = 2 \neq 0\).</p>
			<a class="go ui" href={chapterHref('cohomology/characteristic-classes')}>§4.8 Curvature and characteristic classes →</a>
		</section>
	</div>

	<section class="table-card panel">
		<h2>Homology of famous spaces (integer coefficients)</h2>
		<div class="table-wrap">
			<table>
				<thead>
					<tr><th>Space</th><th>\(H_0\)</th><th>\(H_1\)</th><th>\(H_2\)</th><th>higher</th><th>\(\chi\)</th></tr>
				</thead>
				<tbody>
					<tr><td>point</td><td>\(\Z\)</td><td>\(0\)</td><td>\(0\)</td><td>\(0\)</td><td>\(1\)</td></tr>
					<tr><td>circle \(S^1\)</td><td>\(\Z\)</td><td>\(\Z\)</td><td>\(0\)</td><td>\(0\)</td><td>\(0\)</td></tr>
					<tr><td>wedge of \(n\) circles</td><td>\(\Z\)</td><td>\(\Z^n\)</td><td>\(0\)</td><td>\(0\)</td><td>\(1-n\)</td></tr>
					<tr><td>sphere \(S^2\)</td><td>\(\Z\)</td><td>\(0\)</td><td>\(\Z\)</td><td>\(0\)</td><td>\(2\)</td></tr>
					<tr><td>sphere \(S^n\), \(n\ge 1\)</td><td>\(\Z\)</td><td colspan="3">\(\Z\) in degree \(n\), \(0\) otherwise</td><td>\(1+(-1)^n\)</td></tr>
					<tr><td>torus \(T^2\)</td><td>\(\Z\)</td><td>\(\Z^2\)</td><td>\(\Z\)</td><td>\(0\)</td><td>\(0\)</td></tr>
					<tr><td>genus-\(g\) surface \(\Sigma_g\)</td><td>\(\Z\)</td><td>\(\Z^{2g}\)</td><td>\(\Z\)</td><td>\(0\)</td><td>\(2-2g\)</td></tr>
					<tr><td>Klein bottle \(K\)</td><td>\(\Z\)</td><td>\(\Z\oplus\Z/2\)</td><td>\(0\)</td><td>\(0\)</td><td>\(0\)</td></tr>
					<tr><td>projective plane \(\RP^2\)</td><td>\(\Z\)</td><td>\(\Z/2\)</td><td>\(0\)</td><td>\(0\)</td><td>\(1\)</td></tr>
					<tr><td>Möbius band</td><td>\(\Z\)</td><td>\(\Z\)</td><td>\(0\)</td><td>\(0\)</td><td>\(0\)</td></tr>
					<tr><td>\(n\)-torus \(T^n\)</td><td>\(\Z\)</td><td>\(\Z^n\)</td><td>\(\Z^{\binom n2}\)</td><td>\(H_k = \Z^{\binom nk}\)</td><td>\(0\)</td></tr>
					<tr><td>\(\CP^n\)</td><td>\(\Z\)</td><td>\(0\)</td><td>\(\Z\)</td><td>\(\Z\) in even degrees \(\le 2n\)</td><td>\(n+1\)</td></tr>
				</tbody>
			</table>
		</div>
		<p class="note">
			With \(\Z/2\) coefficients the Klein bottle has Betti numbers \(1, 2, 1\) — the same as the torus — and
			\(\RP^2\) has \(1, 1, 1\). Torsion is exactly what such coefficients cannot see.
		</p>
	</section>
</main>

<style>
	.wrap {
		max-width: 76rem;
		margin: 0 auto;
		padding: 0 1.25rem 5rem;
	}
	.head {
		text-align: center;
		padding: 3.5rem 0 1.5rem;
	}
	.head h1 {
		font-family: var(--font-display);
		font-size: clamp(2rem, 1.3rem + 2.8vw, 3.2rem);
		letter-spacing: 0.04em;
		margin: 0.6rem 0;
	}
	.sub {
		font-family: var(--font-elegant);
		font-style: italic;
		font-size: 1.25rem;
		color: var(--ink-dim);
		max-width: 42rem;
		margin: 0 auto 1.4rem;
	}
	.head :global(.ornament) {
		margin: 0 auto;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
		gap: 1.1rem;
		margin-top: 2rem;
	}
	.card {
		padding: 1.2rem 1.3rem 1rem;
		display: flex;
		flex-direction: column;
		font-size: 0.98rem;
	}
	.card h2,
	.table-card h2 {
		font-family: var(--font-display);
		font-size: 1.15rem;
		letter-spacing: 0.06em;
		color: var(--gold-bright);
		margin: 0 0 0.6rem;
	}
	.card p {
		margin: 0 0 0.6rem;
		color: var(--ink);
		line-height: 1.6;
	}
	.card :global(.math-block) {
		margin: 0.4rem 0 0.8rem;
	}
	.go {
		margin-top: auto;
		padding-top: 0.6rem;
		font-size: 0.76rem;
		color: var(--gold);
		text-decoration: none;
	}
	.go:hover {
		color: var(--gold-pale);
	}
	.table-card {
		margin-top: 1.4rem;
		padding: 1.3rem 1.3rem 1rem;
	}
	.table-wrap {
		overflow-x: auto;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.95rem;
	}
	th {
		font-family: var(--font-ui);
		font-size: 0.72rem;
		letter-spacing: 0.1em;
		color: var(--gold);
		text-align: left;
		padding: 0.55rem 0.7rem;
		border-bottom: 1px solid var(--line);
		font-weight: 600;
	}
	td {
		padding: 0.5rem 0.7rem;
		border-bottom: 1px solid var(--line-faint);
		white-space: nowrap;
	}
	tbody tr:hover {
		background: rgba(216, 178, 110, 0.04);
	}
	.note {
		color: var(--ink-dim);
		font-size: 0.92rem;
		margin: 0.9rem 0 0;
	}
</style>
