// The rational Number Type

function ℚ(numerator, denominator) {
	if (denominator === 0) throw Error("Bruch darf keine 0 im Nenner haben")
	this.p = numerator
	this.q = denominator
}

ℚ.prototype.plus = function(b) {
	if (b instanceof ℚ) {
		// add a fraction to a fraction
		return new ℚ(this.p*b.q + this.q*b.p, this.q*b.q)
	}

	if (!isNaN(b)) {
		// expand number to fit with fraction
		if (b*this.q+this.p === this.q) {
			return 1 // dont make a fraction
		}
		return new ℚ(b*this.q+this.p, this.q)
	}
}

ℚ.prototype.dot = function(b) {
	if (b instanceof ℚ) {
		// multiply fractions
		return new ℚ(this.p*b.p, this.q*b.q)
	}

	if (!isNaN(b)) {
		// multiply numerator with b
		if (b*this.p === this.q) {
			return 1 // dont make a fraction
		}
		return new ℚ(b*this.p, this.q)
	}
}

ℚ.prototype.slash = function(b) {
	if (b instanceof ℚ) {
		// swap numerator and denominator and multiply
		return new ℚ(this.q*b.p, this.p*b.q)
	}
	
	if (!isNaN(b)) {
		if (b*this.q === this.p) {
			return 1
		}

		return new ℚ(this.p, b*this.q)
	}
}

ℚ.prototype.toString = function() {
	return this.p + '/' + this.q
}