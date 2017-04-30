const utils = (function() {

	/**
	 * Maps every ID, beginning with 0, to a letter from the alphabet
	 * @param  {Integer} ID A number in the range 0-24
	 * @return {String}    The letter
	 */
	function getLetterFromId(ID) {
		return String.fromCharCode(65 + ID)
	}

	/**
	 * Maps every upper-case letter to an ID, beginning with  A = 0, B = 1, ..., Z = 24
	 * @param  {Char} letter 	The letter (upper case!)
	 * @return {Integer}        The alphabetical index of the letter
	 */
	function getIdFromLetter(letter) {
		return letter.charCodeAt() - 65
	}

	function displayStateAsJson(state) {
		window.prompt("Strg+C zum kopieren:", JSON.stringify(state))
	}

	function mergeObj(...objects) {
		return Object.assign({}, ...objects)
	}
	
	function romanNumToInt(str) {
		// provisorisch!!
		const map = {
			"I": 1,
			"II": 2,
			"III": 3,
			"IV": 4,
			"V": 5,
			"VI": 6,
			"VII": 7,
			"VIII": 8,
			"IX": 9,
			"X": 10
		}

		return map[str]
	}

	function parseNumber(str) {
		let isFrac = str.match(/(\d)+\/(\d+)/)
		if (isFrac) {
			// return fraction as array
			return [
				parseInt(isFrac[1]), 
				parseInt(isFrac[2])
			]
		}
		return parseFloat(str)
	}

	/**
	 * Transforms a user input into an array of groups (arrays) of matrix ids
	 * 
	 * @param  {[type]} str [description]
	 * @return {[type]}     [description]
	 */
	function getMatrixIDs(str) {
		return str
			// 1.: get all groups of letters.
			.split(/[+-\d.]/)
			// 1 b) filter out unwanted empty string at the beginning
			.filter(x => x !== '')
			// 2.: transform the strings of Matrix letters into arrays of matrixIDs.
			.map(x => x.split('').map(x => getIdFromLetter(x)))
	}
	/**
	 * Get the prefactors for a calculation directive in string form.
	 * Special cases are '-' ≡ '(-1)*' and the empty string '' ≡ '1*'.
	 * @param  {[type]} str [description]
	 * @return {[type]}     [description]
	 */
	function getPrefactors(str) {
		return str
			// make array of prefactors
			.split(/[^+-\d.]+/)
			// replace special cases in order to have a consistent array in the end
			.map(x => x === '-' ? '-1' : (x === '+' || x === '' ? '+1' : x))
			// parse every factor into a number
			.map(x => parseNumber(x))
	}

	/**
	 * Get the parameters for a row transformation from a user input.
	 * E.g.: "-2III" means: subtract twice the third row from this row. -> ["-", "2", "III"]
	 * 
	 * @param  {String} str The user's row transformation directive 
	 * @return {Array}     	Parameterized form of the directive
	 */
	function getDirectiveParams(str) {
		return str.match(/^([\+\-\*\/])\(?(\-?\d+)?\)?\*?([IVX]+)?$/)
	}

	function getTransformationDirective(str) {
		// check if str is a legit row-transformation directive
		if (str.match(/^swap/)) {
			let otherRowID = romanNumToInt(str.replace('swap ', '')) - 1

			if (!otherRowID) {
				throw new Error('Zeilennummer bitte als römische Zahl mit Großbuchstaben eingeben!')
			}
			// rows shall be swapped
			return {
				operation: 'swap',
				otherRowID
			}
		}

		let params = getDirectiveParams(str)
		if ((params[1] === '*' || params[1] === '/') && !params[3]) {
			// scalar multiplication
			return {
				operation: params[1],
				scalar: parseNumber(params[2]), // a signed float or rational number
			}
		}
		else if ((params[1] === '+' || params[1] === '-') && params[3]) {
			// row transformation includes another row
			return {
				operation: params[1],
				scalar: params[2] ? parseNumber(params[2]) : 1, // a signed float or rational number. defaults to 1.
				otherRowID: romanNumToInt(params[3]) - 1
			}
		}
		else {
			throw new Error('Keine gültige Transformationsanweisung!')
		}
		
	}

	return {
		getIdFromLetter,
		getLetterFromId,
		displayStateAsJson,
		mergeObj,
		romanNumToInt,
		getPrefactors,
		getMatrixIDs,
		getTransformationDirective,
		getDirectiveParams,
		parseNumber
	}
})()
