const markup = (function() {
	// "imports"
	const {connect} = redux,
		{connectHistory} = reduxHistory,
		{multiplyMatrices, parseNumber, displayStateAsJson, getLetterFromId} = utils,
		actions = actionCreators


	function Col({value, isResultMatrix, onCreateCol, onCreateRow, onRemoveCol, onRemoveRow, onChangeEl}) {
		return {
			tag: 'div',
			className: 'matrixCol',
			children: [
				{
					tag: 'input',
					value,
					disabled: isResultMatrix,
					autofocus: !isResultMatrix,
					onchange: evt => onChangeEl(parseNumber(evt.target.value)),
					onkeypress(evt) {
						switch(evt.code) {
							case 'Space':
								evt.preventDefault()
								if (evt.ctrlKey) {
									return onRemoveCol()
								}
								return onCreateCol()

							case 'Enter':
							case 'NumpadEnter':
								if (evt.ctrlKey) {
									evt.preventDefault()
									return onRemoveRow()
								}
								return onCreateRow()
						}
					}
				}
			]
		}
	}

	function Row({cols, isResultMatrix, onCreateCol, onCreateRow, onRemoveCol, onRemoveRow, onChangeEl, onTransform}) {
		return {
			tag: 'div',
			className: 'matrixRow',
			children: [
				...cols.map((x, i) => Col({value: x, isResultMatrix, onCreateCol, onCreateRow, onRemoveCol: () => onRemoveCol(i), onRemoveRow, onChangeEl: val => onChangeEl(i, val)})),
				(
					isResultMatrix ? 
					'' : 
					{
						tag: 'div',
						className: 'rowOperations',
						children: [
							{
								tag: 'input',
								defaultValue: '',
								title: 'z.B. "+(-1)*I" oder "swap <gewünschte Zeile>" zum Zeilentausch',
								placeholder: 'Zeilenumformung',
								onchange: evt => onTransform(evt.target.value)
							}
						]
					}
				)
			]
		}
	}

	function MatrixNotDef() {
		return {
			tag: 'div',
			innerHTML: 'nicht definiert'
		}
	}

	function ResultMatrix({matrix, onCopy}) {
		return {
			tag: 'div',
			className: 'matrixWrapper',
			children: [
				{
					tag: 'div',
					className: 'matrixOperations',
					children: [{
						tag: 'i',
						title: 'Matrix kopieren',
						innerHTML: '⎘',
						onclick: onCopy
					}]
				},
				(
					!matrix ?
					{
						tag: 'div',
						className: 'matrix',
						innerHTML: 'nicht definiert'
					} : 
					{
						tag: 'div',
						className: 'matrix',
						children: matrix.map((x, i) => Row({
							cols: x, 
							isResultMatrix: true
						}))
					}

				)
			]
			
		}
	}

	function Matrix({matrix, matrixName, selected, onCopy, onSelectMatrix, onRemoveMatrix, onCreateCol, onCreateRow, onRemoveCol, onRemoveRow, onChangeEl, onDoRowTransform, onScalarMultiplication}) {
		// display different Matrix operations depending on wether its the result matrix
		return {
			tag: 'div',
			className: 'matrixWrapper',
			children: [
				{
					tag: 'div',
					className: 'matrixOperations',
					children: [
						{
							tag: 'i',
							className: 'delete',
							title: 'Matrix löschen',
							innerHTML: '×',
							onclick: onRemoveMatrix
						},
						{
							tag: 'i',
							title: 'Matrix kopieren',
							innerHTML: '⎘',
							onclick: onCopy
						},
						'&nbsp;',
						{
							tag: 'input',
							title: 'Multiplikation mit Skalar',
							size: 4,
							onchange: evt => onScalarMultiplication(evt.target.value)
						},
						'·()'
					]
				},
				{
					tag: 'div',
					className: 'matrix' + (selected ? ' selected' : ''),
					onclick: onSelectMatrix,
					children: matrix.map((x, i) => Row({
							cols: x, 
							isResultMatrix: false,
							onCreateCol, 
							onCreateRow, 
							onRemoveCol, 
							onRemoveRow: () => onRemoveRow(i), 
							onChangeEl: (colID, val) => onChangeEl(i, colID, val), 
							onTransform: val => onDoRowTransform(i, val)
						}))
				},
				{
					tag: 'div',
					className: 'matrixName',
					innerHTML: matrixName
				}
			]
			
		}
	}

	function Hint() {
		return {
			tag: 'div',
			className: 'help',
			children: [
				{
					tag: 'div',
					className: 'hint',
					children: [
						{
							tag: 'h4',
							innerHTML: 'Hinweise'
						},
						'Zum Bearbeiten der Matrizen auf eine Zahl klicken. <br />'
						+ 'Mit <kbd>Leertaste</kbd> können Sie neue Spalten erzeugen. <br />'
						+ 'Mit <kbd>Enter</kbd> erzeugen Sie eine neue Zeile. <br />'
						+ '<kbd>Strg</kbd>+<kbd>Leertaste</kbd> löscht die aktuelle Spalte. <br />'
						+ '<kbd>Strg</kbd>+<kbd>Enter</kbd> löscht die aktuelle Zeile.<br />'
						+ '<kbd>Strg</kbd>+<kbd>Z</kbd>: Rückgängig machen<br />'
						+ '<kbd>Strg</kbd>+<kbd>Y</kbd>: Schritt wiederholen'
					]
				}
			]
		}
	}

	function App({matrices, result, selectedMatrix, undo, redo, gotoState, getHistorySize, getIndexOfNow, dispatch}) {
		return [
			{
				tag: 'div',
				className: 'row',
				children: [
					{
						tag: 'h1',
						innerHTML: 'Matrizen'
					},
					Hint(),
				]
			},
			{
				tag: 'div',
				className: 'row',
				children: [
					{
						tag: 'button',
						innerHTML: '<i>{"matrices": [...], "result": ...}</i>',
						title: 'Rechnung als JSON anzeigen',
						onclick: () => displayStateAsJson({matrices, result})
					},
					{
						tag: 'button',
						className: 'delete deleteAllBtn',
						title: 'Alle Matrizen löschen',
						onclick: () => dispatch(actions.deleteAllMatrices())
					},
				]
			},
			{
				tag: 'div',
				className: 'row',
				children: [
					'&nbsp;Verlauf: ',
					{
						tag: 'input',
						className: 'historySlider' + (getHistorySize() > 1 ? ' hasHistory': ''),
						type: 'range',
						max: getHistorySize() - 1,
						title: 'Regler bewegen um in der Geschichte zu reisen',
						min: 0,
						step: 1,
						value: getIndexOfNow(),
						oninput: evt => gotoState(evt.target.value)
					},
				]
			},
			{
				tag: 'div',
				className: 'row',
				children: [
					...matrices.map((x, i) => Matrix({
						matrix: x, 
						matrixName: getLetterFromId(i),
						selected: i === selectedMatrix,
						onCopy: () => dispatch(actions.createMatrix(x)),
						onSelectMatrix: () => dispatch(actions.toggleSelectMatrix(i)),
						onRemoveMatrix: () => dispatch(actions.removeMatrix(i)),
						onCreateCol: () => dispatch(actions.createCol(i)),
						onCreateRow: () => dispatch(actions.createRow(i)),
						onRemoveCol: colIndex => dispatch(actions.removeCol(i, colIndex)), 
						onRemoveRow: rowIndex => dispatch(actions.removeRow(i, rowIndex)),
						onChangeEl: (rowIndex, colIndex, val) => dispatch(actions.changeElement(i, rowIndex, colIndex, val)),
						onScalarMultiplication: scalar => dispatch(actions.scalarMultiplication(i, scalar)),
						onDoRowTransform: (rowIndex, userInput) => dispatch(actions.rowTransformation(i, rowIndex, userInput))
					})),
					{
						tag: 'button',
						className: 'newMatrixBtn',
						title: 'neue Matrix erzeugen',
						onclick: () => dispatch(actions.createMatrix())
					}
				]
			},
			{
				tag: 'div',
				className: 'row',
				children: [
					{
						tag: 'input',
						className: 'calculation',
						placeholder: 'Rechnung eingeben, z.B. "-2AAB+CD+E"',
						defaultValue: '',
						onchange: evt => dispatch(actions.setCalcDirective(evt.target.value)),
					},
					{
						tag: 'div',
						className: 'equalSign',
						innerHTML: '='
					},
					ResultMatrix({matrix: result, onCopy: () => dispatch(actions.createMatrix(result))})
				]
			}
		]
	} 

	return {
		App: connectHistory(connect(App))
	}
})()


