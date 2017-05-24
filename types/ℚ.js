// The rational Number Type

function ℚ(numerator, denominator) {
	if (denominator === 0) throw Error("Bruch darf keine 0 im Nenner haben")

	let [p, q] = reduce(numerator, denominator) // reduce fraction if possible

	function reduce(numerator, denominator) {
		let x = numerator,
			y = denominator
		
		if (x < 0)
			// Zähler vorübergehend positiv machen
			x = x * (-1)
			
		if (y < 0)
			// Nenner positiv machen
			y = y * (-1)
		
		if (x === 0)
			return 0
		else if (x === y)
			return 1
		else
			// größten gemeinsamen Teiler ermitteln
			while ((x !== y) && (x !== 1)) {
				if (y > x)
					y = y - x
				else
					x = x - y
			}
			
		if (x != 0) {
			// Bruch kürzen und zurückgeben
			return [numerator / x, denominator / x]
		}
		// ungekürzten Bruch zurückgeben
		return [numerator, denominator]
	}

	function plus(b) {
		if (b instanceof ℚ) {
			// add a fraction to a fraction
			return new ℚ(p*b.q + q*b.p, q*b.q)
		}

		if (!isNaN(b)) {
			// expand number to fit with fraction
			if (b*q+p === q) {
				return 1 // dont make a fraction
			}
			return new ℚ(b*q+p, q)
		}
	}

	function dot(b) {
		if (b instanceof ℚ) {
			// multiply fractions
			return new ℚ(p*b.p, q*b.q)
		}

		if (!isNaN(b)) {
			// multiply numerator with b
			if (b*p === q) {
				return 1 // dont make a fraction
			}
			return new ℚ(b*p, q)
		}
	}

	function slash(b) {
		if (b instanceof ℚ) {
			// swap numerator and denominator and multiply
			return new ℚ(q*b.p, p*b.q)
		}
		
		if (!isNaN(b)) {
			if (b*q === p) {
				return 1
			}

			return new ℚ(p, b*q)
		}
	}

	/**
	 * valueOf returns a scalar if the denominator = 1 or if numerator = denominator.
	 * Otherwise it returns the fraction itself
	 * @return {[type]} [description]
	 */
	function valueOf() {
		if (p === q)
			return 1
		else if (q === 1) // Nenner ist 1 => Rückgabewert ist nur der Zähler
			return p 
		else 
			return this
	}

	function toString() {
		return p + '/' + q
	}

	return {
		p, q,
		reduce,
		plus,
		dot,
		slash,
		valueOf,
		toString
	}
}



/*
 * Tests
 */
let p = new ℚ(5,10)
console.log(p)
let a = p.dot(8)
console.log(a*2)


