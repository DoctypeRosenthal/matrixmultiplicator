// The Matrix data type

/**
* Matrix Datatype.
* @param {Array} arr matrix rows
*/
function Matrix(name, arr = [[0]]) {
	let data = arr

	this.name = name

	this.rows = function(arg) {
		if (!arg) {
			// user wants all rows
			return arg
		}

		if (!isNaN(arg)) {
			// user wants certain row
			return data[arg]
		}
		
		if (isArr(arg) && isNaN(arg[0])) {
			// user wants to get range of certain rows
			return data.slice(arg[0], arg[1])
		}
	}

	this.dot = function(B) {
		if (!B instanceof Matrix || isNaN(B)) {
			throw Error('Keine Matrizenmmultiplikation mit ' + typeof B + ' definiert.')
		}

		if (isNum(B)) {
			// scalar multiplication
			return new Matrix(data.map(x => x.map(y => y*B)))
		}

		// matrix multiplication
		return new Matrix(
			
		)
	}

} 
