// The Matrix data type

/**
* Matrix Datatype.
* @param {Array} arr matrix rows
*/
function Matrix(arr = [[0]]) {
	let data = arr

	function rows(arg) {
		if (!arg) {
			// user wants all rows
			return data
		}

		if (!isNaN(arg)) {
			// user wants certain row
			return data[arg]
		}
		
		if (isArr(arg) && isNaN(arg[0])) {
			// user wants to get range of certain rows. Make sure to include all!
			return data.slice(arg[0]-1, arg[1])
		}
	}

	function cols(arg) {
		if (!arg) {
			// user wants all cols as vectors
			return data.map((x,i) => data.map(y => y[i]))
		}

		if (!isNaN(arg)) {
			// user wants certain col
			return data.map(x => x[arg])
		}
		
		if (isArr(arg) && isNaN(arg[0])) {
			// user wants to get range of certain rows
			return data.map((x,i) => data.map(y => y[i])).slice(arg[0]-1, arg[1])
		}
	}


	function dot(B) {
		if (!B instanceof Matrix || isNaN(B)) {
			throw Error('Keine Matrizenmmultiplikation mit ' + typeof B + ' definiert.')
		}

		if (isNum(B)) {
			// scalar multiplication
			return new Matrix(data.map(x => x.map(y => y*B)))
		}

		// matrix multiplication
		if (data.length !== B.cols().length) {
			// matrix A has less or more cols than matrix B has rows
			// -> multiplication is not defined!
			throw new Error("Matrizenmmultiplikation nicht definiert. Ungleiche Anzahl von Zeilen von A und Spalten von B.")
		}
		return new Matrix(
			data.map(rowA => B.cols().map(colB => colB.map((x, i) => x*rowA[i]).reduce((a, b) => a+b, 0)))
		)
	}

	function toString() {
		return data.toSource()
	}

	function valueOf() {
		return data
	}

	return {
		rows,
		cols,
		dot,
		toString,
		valueOf
	}

} 

let hey = new Matrix([[1,2],[2,3]])
console.log(hey + "")
console.log(hey.rows())
console.log(JSON.stringify({matrix: hey}))

