// Control points for the closed curves in the turning-number figure (screen coordinates, y down).
import type { P2 } from './geometry';

export const turningPresets: Record<'bean' | 'eight' | 'loop', P2[]> = {
	bean: [
		[150, 190],
		[190, 300],
		[270, 240],
		[360, 300],
		[430, 200],
		[360, 110],
		[230, 90]
	],
	eight: [
		[120, 200],
		[200, 110],
		[300, 200],
		[400, 290],
		[480, 200],
		[400, 110],
		[300, 200],
		[200, 290]
	],
	// listed in reverse so that, like the bean, it is traversed anticlockwise on screen
	loop: [
		[260, 320],
		[440, 270],
		[360, 150],
		[260, 170],
		[330, 250],
		[400, 120],
		[250, 80],
		[140, 210]
	]
};
