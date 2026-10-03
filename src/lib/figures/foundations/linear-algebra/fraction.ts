// Exact rational numbers for the row-reduction stepper (small values only).

function gcd(a: number, b: number): number {
	a = Math.abs(a);
	b = Math.abs(b);
	while (b) [a, b] = [b, a % b];
	return a || 1;
}

export class Frac {
	readonly n: number;
	readonly d: number;
	constructor(n: number, d = 1) {
		if (d === 0) throw new Error('division by zero');
		if (d < 0) {
			n = -n;
			d = -d;
		}
		const g = gcd(n, d);
		this.n = n / g + 0; // + 0 turns −0 into 0
		this.d = d / g;
	}
	static of(x: number | Frac): Frac {
		return x instanceof Frac ? x : new Frac(x);
	}
	add(o: Frac): Frac {
		return new Frac(this.n * o.d + o.n * this.d, this.d * o.d);
	}
	sub(o: Frac): Frac {
		return new Frac(this.n * o.d - o.n * this.d, this.d * o.d);
	}
	mul(o: Frac): Frac {
		return new Frac(this.n * o.n, this.d * o.d);
	}
	div(o: Frac): Frac {
		return new Frac(this.n * o.d, this.d * o.n);
	}
	neg(): Frac {
		return new Frac(-this.n, this.d);
	}
	isZero(): boolean {
		return this.n === 0;
	}
	isOne(): boolean {
		return this.n === 1 && this.d === 1;
	}
	eq(o: Frac): boolean {
		return this.n === o.n && this.d === o.d;
	}
	valueOf(): number {
		return this.n / this.d;
	}
	/** plain text with a real minus sign, e.g. "−3/2" */
	toString(): string {
		const s = this.n < 0 ? '−' : '';
		const a = Math.abs(this.n);
		return this.d === 1 ? `${s}${a}` : `${s}${a}/${this.d}`;
	}
	/** TeX, e.g. "-\tfrac{3}{2}" */
	tex(): string {
		const s = this.n < 0 ? '-' : '';
		const a = Math.abs(this.n);
		return this.d === 1 ? `${s}${a}` : `${s}\\tfrac{${a}}{${this.d}}`;
	}
}

/**
 * Display a float that is (very nearly) a fraction with a small denominator,
 * e.g. 0.5 → "1/2", −2 → "−2". Used to show exact rationals in MatrixView,
 * which takes plain numbers.
 */
export function fracString(v: number): string {
	if (Math.abs(v) < 1e-12) return '0';
	for (let d = 1; d <= 720; d++) {
		const n = Math.round(v * d);
		if (Math.abs(v * d - n) < 1e-9) return new Frac(n, d).toString();
	}
	return v.toFixed(3).replace('-', '−');
}
