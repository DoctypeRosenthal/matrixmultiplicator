// ALGEBRAIC OPERATIONS

const operations = (function() {

	function multiply(a, b) {
		if (a instanceof Matrix || a instanceof Frac) {
			// a is either a Matrix or a Fraction. b is Matrix or Fraction or number
			return a.dot(b)
		}

		// a is now definitely a number
		if (b instanceof Matrix || b instanceof Frac) {
			// b is either Matrix or Fraction
			return b.dot(a)
		}

		// a AND b are numbers
		return a*b
	}

	function add(a, b) {
		if (a instanceof Matrix && b instanceof Matrix) {
			a.plus(b)
		}

		if (a instanceof Matrix) {
			throw new Error('Addition Matrix mit Skalar nicht definiert')
		}

		if (a instanceof Frac) {
			return a.plus(b)
		}

		if (b instanceof Frac) {
			return b.plus(a)
		}

		// both are numbers
		return a+b
	}

	return {
		add,
		multiply
	}
})()
