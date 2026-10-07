import { it } from 'vitest';
import { SimplicialComplex, isClosedSurface, isOrientable } from '$lib/math/complex';
import { homology, groupName, bettiNumbers } from '$lib/math/homology';
import * as ex from '$lib/math/examples';

const info = (name: string, K: SimplicialComplex) =>
	console.log(
		name,
		JSON.stringify(K.fVector),
		'chi',
		K.eulerCharacteristic(),
		'closed',
		K.dim === 2 ? isClosedSurface(K) : '-',
		'orient',
		K.dim === 2 ? isOrientable(K) : '-',
		homology(K, 'Z').map((g) => groupName(g, 'Z')).join(' , ')
	);

it('checks', () => {
	const kg = ex.gridSurface('klein', 3, 3);
	info('klein3x3', kg.complex);
	console.log('klein tri count raw', kg.triangles.length, new Set(kg.triangles.map((t) => [...t].sort().join())).size);
	info('torus7', ex.torus7());
	info('rp2_6', ex.projectivePlane6());
	info('mobius5', ex.mobius5());
	info('genus2', ex.genus2());
	info('torusgrid3', ex.torusGrid(3, 3));
	info('cyl3', ex.gridSurface('cylinder', 3, 3).complex);
	// sd of tetrahedron counts by chains
	// 7-vertex torus from the formula in the text
	const t: number[][] = [];
	for (let i = 0; i < 7; i++) {
		t.push([i, (i + 1) % 7, (i + 3) % 7]);
		t.push([i, (i + 2) % 7, (i + 3) % 7]);
	}
	info('torus7-text', new SimplicialComplex(t));
	// boundary of 4-simplex
	const s3: number[][] = [];
	for (let i = 0; i < 5; i++) s3.push([0, 1, 2, 3, 4].filter((x) => x !== i));
	info('S3', new SimplicialComplex(s3));
	// figure eight
	info('fig8', new SimplicialComplex([[0, 1], [1, 2], [0, 2], [0, 3], [3, 4], [0, 4]]));
	console.log('betti fig8', bettiNumbers(new SimplicialComplex([[0, 1], [1, 2], [0, 2], [0, 3], [3, 4], [0, 4]])));
});
