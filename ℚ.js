// The rational Number Type

function ℚ(numerator, denominator) {
	if (denominator === 0) throw Error("Bruch darf keine 0 im Nenner haben")

	this.p = numerator
	this.q = denominator

	// reduce if possible
	this.reduce()
}

/**
 * This returns a scalar if the denominator = 1 or if numerator = denominator.
 * Otherwise it returns the fraction itself
 * @return {[type]} [description]
 */
ℚ.prototype.valueOf = function() {
	if (this.p === this.q)
		return 1
	else if (this.q === 1) // Nenner ist 1 => Rückgabewert ist nur der Zähler
		return this.p 
	else 
		return this.valueOf()
}

ℚ.prototype.reduce = function() {
	let x = this.p,
		y = this.q,
		out = []
	
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
		// Bruch kürzen
		this.p = this.p / x
		this.q = this.q / x
	}
	
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

/*
 * Tests
 */
let p = new ℚ(5,10)
console.log(p)
let a = p.dot(8)
console.log(a*2)