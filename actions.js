
const actionNames = {
	SET_CALC_DIRECTIVE: 'SET_CALC_DIRECTIVE',
	ADD_MATRIX: 'ADD_MATRIX', 
	DEL_MATRIX: 'DEL_MATRIX',
	DEL_ALL_MATRICES: 'DEL_ALL_MATRICES', 
	ADD_COL: 'ADD_COL',
	ADD_ROW: 'ADD_ROW',
	DEL_COL: 'DEL_COL',
	DEL_ROW: 'DEL_ROW',
	CHANGE_ELEMENT: 'CHANGE_ELEMENT',
	SWAP_ROWS: 'SWAP_ROWS',
	ROW_PLUS_ROW: 'ROW_PLUS_ROW',
	ROW_MINUS_ROW: 'ROW_MINUS_ROW',
	MULTIPLY_ROW: 'MULTIPLY_ROW',
	DIVIDE_ROW: 'DIVIDE_ROW',
	SCALAR_MULTIPLICATION: 'SCALAR_MULTIPLICATION',
	MATRIX_MULTIPLICATION: 'MATRIX_MULTIPLICATION',
	MATRIX_ADDITION: 'MATRIX_ADDITION',
	TOGGLE_SELECT_MATRIX: 'TOGGLE_SELECT_MATRIX',
	CALC_RESULT: 'CALC_RESULT',

	UNDO: 'UNDO',
	REDO: 'REDO'
}

const actionCreators = (function() {
	// "imports"
	const {getTransformationDirective} = utils

	function setCalcDirective(userInput) { 
		return {type: actionNames.SET_CALC_DIRECTIVE, userInput}
	}

	function createMatrix(initState) { return {type: actionNames.ADD_MATRIX, initState} }

	function removeMatrix(matrixID) {
		return {type: actionNames.DEL_MATRIX, matrixID}
	}

	function deleteAllMatrices() {
		return {type: actionNames.DEL_ALL_MATRICES}
	}

	function createCol(matrixID) { return {type: actionNames.ADD_COL, matrixID} }

	function createRow(matrixID) { return {type: actionNames.ADD_ROW, matrixID} }

	function removeCol(matrixID, colID) { return {type: actionNames.DEL_COL, matrixID, colID} }

	function removeRow(matrixID, rowID) { return {type: actionNames.DEL_ROW, matrixID, rowID} }

	function changeElement(matrixID, rowID, colID, nextValue) { return {type: actionNames.CHANGE_ELEMENT, matrixID, rowID, colID, nextValue} }

	function rowTransformation(matrixID, rowID, userInput) {
		let {operation, otherRowID, scalar} = getTransformationDirective(userInput)
		switch(operation) {
			case 'swap':
				// swap rows
				return swapRows(matrixID, rowID, otherRowID)
			case '+':
				return rowPlusRow(matrixID, rowID, otherRowID, scalar)
			case '-':
				return rowMinusRow(matrixID, rowID, otherRowID, scalar)
			case '*':
				return multiplyRow(matrixID, rowID, scalar)
			case '/':
				return divideRow(matrixID, rowID, scalar)
		}
	}

	function swapRows(matrixID, rowID, otherRowID) { return {type: actionNames.SWAP_ROWS, matrixID, rowID, otherRowID} }
	function rowPlusRow(matrixID, rowID, otherRowID, scalar) { return {type: actionNames.ROW_PLUS_ROW, matrixID, rowID, otherRowID, scalar} }
	function rowMinusRow(matrixID, rowID, otherRowID, scalar) { return {type: actionNames.ROW_MINUS_ROW, matrixID, rowID, otherRowID, scalar} }
	function multiplyRow(matrixID, rowID, scalar) { return {type: actionNames.MULTIPLY_ROW, matrixID, rowID, scalar} }
	function divideRow(matrixID, rowID, scalar) { return {type: actionNames.DIVIDE_ROW, matrixID, rowID, scalar} }

	function scalarMultiplication(matrixID, scalar) { return {type: actionNames.SCALAR_MULTIPLICATION, matrixID, scalar} }

	function toggleSelectMatrix(matrixID) { return {type: actionNames.TOGGLE_SELECT_MATRIX, matrixID} }

	function calcResult(matrices, calcDirective) {
		return {type: actionNames.CALC_RESULT, allMatrices: matrices, calcDirective}
	}

	function alwaysRecalcResultAfter(...actions) {
		let out = {}
		actions.forEach(a => out[a.name] = (...args) => (dispatch, getState) => {
			dispatch(a(...args))
			let {matrices, calcDirective} = getState()
			dispatch(calcResult(matrices, calcDirective))
		})
		return out
	}

	function undo() {
		return {type: actionNames.UNDO}
	}

	function redo() {
		return {type: actionNames.REDO}
	}

	// Redux thunk = enhanced action
	const thunks = alwaysRecalcResultAfter(
		setCalcDirective,
		removeMatrix,
		createCol,
		createRow,
		removeCol,
		removeRow,
		changeElement,
		rowTransformation,
		swapRows,
		rowPlusRow,
		rowMinusRow,
		multiplyRow,
		divideRow,
		scalarMultiplication
	)
	
	return thunks.merge({
		createMatrix, 
		deleteAllMatrices,
		toggleSelectMatrix,
		undo,
		redo
	})

})()
