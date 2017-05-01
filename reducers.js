const reducers = (function() {
	// "imports"
	const {
		SET_CALC_DIRECTIVE,
		ADD_MATRIX, 
		DEL_MATRIX, 
		DEL_ALL_MATRICES,
		ADD_COL,
		ADD_ROW,
		DEL_COL,
		DEL_ROW,
		CHANGE_ELEMENT,
		SWAP_ROWS,
		ROW_PLUS_ROW,
		ROW_MINUS_ROW,
		MULTIPLY_ROW,
		DIVIDE_ROW,
		SCALAR_MULTIPLICATION,
		MATRIX_MULTIPLICATION,
		MATRIX_ADDITION,
		CALC_RESULT,
		TOGGLE_SELECT_MATRIX,

		UNDO,
		REDO
	} = actionNames
	const {isArr, isNum, isMatrixName} = utils

	function row(state = [], action) {
		switch(action.type) {
			case CHANGE_ELEMENT:
				return state.map((col, i) => i !== action.colID ? col : action.nextValue)

			case ROW_PLUS_ROW:
				
				return state.map((col, i) => col + action.otherRow[i])

			case ROW_MINUS_ROW:
				return state.map((col, i) => col - action.otherRow[i])

			case MULTIPLY_ROW:
			case SCALAR_MULTIPLICATION:
				return state.map(col => col * action.scalar)

			case DIVIDE_ROW:
				return state.map(col => col / action.scalar)
		}
	}

	function matrix(state = [[0]], action) {
		let A, B

		switch(action.type) {
			case ADD_COL:
				return state.map(x => [...x, 0])

			case ADD_ROW:
				return [
					...state,
					state[0].map(x => 0)
				]

			case DEL_COL:
				return state.map(x => x.filter((col, i) => i !== action.colID))

			case DEL_ROW:
				return state.filter((x, i) => i !== action.rowID)

			case SWAP_ROWS:
				let tmp = state[action.otherRowID]
				// ATTENTION: reassignment!
				state[action.otherRowID] = state[action.rowID]
				state[action.rowID] = tmp

				return state

			case ROW_PLUS_ROW:
			case ROW_MINUS_ROW:
				// another row is given to put into the equation
				// -> get it, multiply it with the given scalar, merge it into the action object and give it to the row reducer
				let otherRow = row(state[action.otherRowID], {type: MULTIPLY_ROW, scalar: action.scalar})
				return state.map((x, i) => i !== action.rowID ? x : row(x, action.merge({otherRow})))

			case MULTIPLY_ROW:
			case DIVIDE_ROW:
			case CHANGE_ELEMENT:
				return state.map((x, i) => i !== action.rowID ? x : row(x, action))
			
			case SCALAR_MULTIPLICATION:
				if (action.scalar === 1) {
					// multiplication with 1
					return state
				}
				return state.map(x => row(x, action))

			case MATRIX_MULTIPLICATION:
				A = state
				B = action.otherMatrix

				if (!A || !B || !A[0] || (A[0].length !== B.length)) {
					// matrix A has less or more cols than matrix B has rows
					// -> multiplication is not defined!
					return undefined
				}
				// multiplication is defined!
				let colsB = B[0].map((y,i) => B.map(x => x[i])) // get col-vectors of B
				// Multiply every element of a row in A with the element at the same index in colB. Then add up.
				// Do that for every col in B. Then go to next row in A.
				return A.map(rowA => colsB.map(colB => colB.map((x, i) => x*rowA[i]).reduce((a, b) => a+b, 0)))

			case MATRIX_ADDITION:
				A = state
				B = action.otherMatrix

				if (!A || !B || A.length !== B.length || A[0].length !== B[0].length) {
					return undefined
				}

				// add up!
				return A.map((rowA, i) => rowA.map((colA, j) => colA + B[i][j]))

			case ADD_MATRIX:
				return action.initState || state

			default:
				return state
		}
	}

	function matrices(state = [[[0]]], action) {
		switch(action.type) {
			case ADD_MATRIX:
				return [
					...state,
					matrix(undefined, action)
				]

			case ADD_COL:
			case ADD_ROW:
			case DEL_COL:
			case DEL_ROW:
			case CHANGE_ELEMENT:
			case SWAP_ROWS:
			case ROW_PLUS_ROW:
			case ROW_MINUS_ROW:
			case MULTIPLY_ROW:
			case DIVIDE_ROW:
			case SCALAR_MULTIPLICATION:				
				return state.map((x, i) => i === action.matrixID ? matrix(x, action) : x)

			case MATRIX_MULTIPLICATION:
				// this returns only one matrix! Not a whole set of matrices.
				// But since it starts with the whole set of matrices, the matrices reducer 
				// should handle it imo...
				return state.length > 1 ? state.reduceRight((A, B) => matrix(B, action.merge({otherMatrix: A}))) : state[0]

			case DEL_MATRIX:
				if (state.length === 1) {
					// reset state to only one matrix
					return [[[0]]]
				}
				return state.filter((x, i) => i !== action.matrixID)

			case DEL_ALL_MATRICES:
				return [[[0]]]

			default:
				return state
		}
	}

	/**
	 * [result description]
	 * @param  {[type]} state  [description]
	 * @param  {[type]} action [description]
	 * @return {Array/undefined}        result matrix or undefined if calculation is not possible
	 */
	function result(state = undefined, action) {
		switch(action.type) {
			case CALC_RESULT:
				let {allMatrices, calcDirective} = action
				if (calcDirective.length === 0) return
				return calcDirective
					// 1.: resolve nested calculations and matrices
					.map(x => {
						if (isArr(x)) {
							// there is a nested calculation (in brackets)
							// -> call this reducer with the nested directive!
							return result(undefined, action.merge({calcDirective: x})) 
						}

						if (isMatrixName(x)) {
							// this is a matrix name like A, B, C...
							// -> replace this letter with the corresponding matrix
							return allMatrices[utils.getIdFromLetter(x)]
						}
						// x is number or operator. return as is.
						return x
					})
					// 2.: transform subtraction in addition with a negative prefactor. 
					// e.g.: 
					// ['-', 'A'] => ['+', '-1', 'A']
					// ['-', '2', 'A'] => ['+', '-2', 'A']
					.reduce((out, x, i, arr) => {
						if (x !== '-') {
							return [...out, x]
						}
						// x is minus operator
						let nextEl = arr[i+1]
						if (isNum(nextEl)) {
							// next element is a number
							let inverseNum = -1*parseFloat(nextEl)
							return [...out, '+', inverseNum]
						}
						if (isArr(nextEl)) {
							// next element is a matrix
							return [...out, '+', '-1']
						}
					}, [])
					// 3.: now every array we encounter is a matrix! arr is a flat, one-dimensional
					// Array of numbers, + operators and matrices.
					// -> reduce it to an array of groups of matrices which are seperated by addition or subtraction
					.reduce((out, x, i, arr) => {
						if (isArr(x)) {
							// x is a matrix
							if (isNum(arr[i-1])) {
								// There is a prefactor -> scalar multiplication with matrix!
								x = matrix(x, {type: SCALAR_MULTIPLICATION, scalar: parseFloat(arr[i-1])})
							}
							out[out.length-1].push(x)
							return out
						}
						if (x === '+') {
							// create new multiplication group
							return [...out, []]
						}
						// do nothing
						return out
					}, [[]])
					// 4.: calc the matrix products
					.reduce((out, x) => [...out, matrices(x, {type: MATRIX_MULTIPLICATION})], [])
					// 5.th: sum up all product matrices if possible
					.reduce((A,B, i, arr) => arr.length === 1 ? A : matrix(A, {type: MATRIX_ADDITION, otherMatrix: B})) 

			default:
				return state
		}
	}

	function calcDirective(state = [], action) {
		switch(action.type) {
			case SET_CALC_DIRECTIVE:
				// strip out any multiplication operator
				let input = action.userInput.replace(/\*/g, '') 
				return utils.groupByBrackets(input)

			default:
				return state
		}
	}

	function selectedMatrix(state = undefined, action) {
		switch(action.type) {
			case TOGGLE_SELECT_MATRIX:
				return state === undefined ? action.matrixID : undefined

			default:
				return state
		}
	}

	/**
	 * Higher order reducer to add a history to a normal reducer 
	 * @param  {Function} reducer The reducer to enhance
	 * @return {Function}         The enhanced reducer
	 */
	function undoable(reducer) {
	    // Call the reducer with empty action to populate the initial state
	    let history = {
	        past: [],
	        present: undefined,
	        future: []
	    }

	    // Return a reducer that handles undo and redo
	    return function(state = history.present, action) {
	        const { past, present, future } = history

	        switch (action.type) {
	            case UNDO:
	            	if (past.length === 1) {
	            		// nothing else to undo
	            		return present
	            	}

	                const previous = past[past.length - 1]
	                const newPast = past.slice(0, past.length - 1)
	                history = {
	                    past: newPast,
	                    present: previous,
	                    future: [present, ...future]
	                }
	                break

	            case REDO:
	            	if (future.length === 0) {
	            		// nothing else to redo
	            		return present
	            	}

	                const next = future[0]
	                const newFuture = future.slice(1)
	                history = {
	                    past: [...past, present],
	                    present: next,
	                    future: newFuture
	                }
	                break

	            default:
	                // Delegate handling the action to the passed reducer
	                const newPresent = reducer(state, action)
	                if (present === newPresent) {
	                    return present
	                }
	                history = {
	                    past: [...past, present],
	                    present: newPresent,
	                    future: []
	                }
	                break
	        }

	        return history.present
	    }
	}


	// "exports"
	return {
		calcDirective: undoable(calcDirective),
		matrices: undoable(matrices),
		result: undoable(result)
	}
})()