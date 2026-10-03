import { describe, expect, it } from 'vitest';
import { letters, letterByChar, signature, cutLetter, classes } from './letters';

const sig = (c: string) => {
	const s = signature(letterByChar.get(c)!);
	return [s.ends, s.b3, s.b4, s.loops].join('/');
};

describe('letters of the alphabet', () => {
	it('has all 26 capitals', () => {
		expect(letters.map((l) => l.ch).join('')).toBe('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
	});
	it('every class shares one fingerprint, and different classes differ', () => {
		const seen = new Map<string, string>();
		for (const c of classes) {
			const fps = new Set([...c.members].map(sig));
			expect(fps.size).toBe(1);
			const fp = [...fps][0];
			expect(seen.has(fp)).toBe(false);
			seen.set(fp, c.name);
		}
		expect(classes.reduce((n, c) => n + c.members.length, 0)).toBe(26);
	});
	it('counts the pieces left after removing a point', () => {
		const T = letterByChar.get('T')!;
		expect(cutLetter(T, { kind: 'node', node: 2 }).pieces).toBe(3);
		const X = letterByChar.get('X')!;
		expect(cutLetter(X, { kind: 'node', node: 2 }).pieces).toBe(4);
		const O = letterByChar.get('O')!;
		expect(cutLetter(O, { kind: 'edge', edge: 0, seg: 5, t: 0.5 }).pieces).toBe(1);
		expect(cutLetter(O, { kind: 'node', node: 0 }).pieces).toBe(1);
		const I = letterByChar.get('I')!;
		expect(cutLetter(I, { kind: 'edge', edge: 0, seg: 0, t: 0.5 }).pieces).toBe(2);
		expect(cutLetter(I, { kind: 'node', node: 0 }).pieces).toBe(1);
		const A = letterByChar.get('A')!;
		expect(cutLetter(A, { kind: 'edge', edge: 1, seg: 0, t: 0.5 }).pieces).toBe(1); // crossbar
		expect(cutLetter(A, { kind: 'edge', edge: 2, seg: 0, t: 0.5 }).pieces).toBe(2); // a leg
		expect(cutLetter(A, { kind: 'node', node: 0 }).pieces).toBe(2);
		const B = letterByChar.get('B')!;
		expect(cutLetter(B, { kind: 'node', node: 0 }).pieces).toBe(1);
		const H = letterByChar.get('H')!;
		expect(cutLetter(H, { kind: 'edge', edge: 4, seg: 0, t: 0.5 }).pieces).toBe(2);
		expect(cutLetter(H, { kind: 'node', node: 4 }).pieces).toBe(3);
	});
});
