# Homology & Cohomology — an illustrated journey

An interactive, illustrated textbook that teaches **homology** and **cohomology** from first principles —
including every prerequisite (sets, groups, linear algebra, topology, manifolds, differential forms,
category theory) — with live 3D figures, explorable diagrams, and a built-in homology calculator.

Built with [SvelteKit](https://svelte.dev/docs/kit) (static), [three.js](https://threejs.org) and custom GLSL shaders,
and [KaTeX](https://katex.org) (math is rendered at build time). Deployed to GitHub Pages by GitHub Actions.

## Develop

```sh
npm install
npm run dev        # local dev server
npm test           # math engine tests (homology, persistence, Hodge decomposition)
npm run build      # static site in build/
```

Set `BASE_PATH=/homology` when building for the GitHub Pages project URL (the workflow does this).

## Writing math

In any `.svelte` file, write inline math as `\( … \)` and display math as `\[ … \]`.
A Svelte preprocessor (`src/lib/katex/preprocess.js`) renders it to HTML at build time.
