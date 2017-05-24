const utils = (function() {

	// New props and methods for built-in JS-Objects below
	Object.prototype.merge = function(o) {
		return Object.assign({}, this, o)
	}

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

	function isNum(x) {
	    return !isNaN(parseFloat(x))
	}

	function isMatrixName(str) {
	    return !!str.match(/[A-Z]/)
	}

	function isArr(str) {
	    return str instanceof Array
	}

	function isOperator(str) {
		const operators = ['+', '-', '*']
		return operators.includes(str)
	}

	/**
	 * Group a string into arrays of strings by the string's brackets.
	 * 
	 * String needs to have no spaces
	 * @param  {[type]} str [description]
	 * @return {[type]}     [description]
	 */
	function groupByBrackets(str) {
	    let openingBracketCount = 0,
	        stringInBetween = ''
	    return str
	        .split('')
	        .reduce((out, token, i, arr) => {
	            if (token === '(') openingBracketCount ++
	            if (token === ')') openingBracketCount --

	            if (token === '(' && openingBracketCount === 1) {
	                // first opening bracket
	                // reset stringInBetween
	                stringInBetween = ''
	                // dont capture this bracket. Return out as is.
	                return out
	            }
	            else if (token === ')' && openingBracketCount === 0) {
	                // we found the matching bracket! 
	                // Now call groupByBrackets() with the String since the opening bracket and add this to our out-Array
	                return [...out, groupByBrackets(stringInBetween)]
	            }
	            else if (openingBracketCount > 0) {
	                // find closing bracket on same level and add anything in between main brackets to stringInBetween
	                stringInBetween += token
	                return out
	            }
	            // we are not in search for a closing bracket. Just add token to out-Array.
	            return [...out, token]
	        }, [])
	}

	function displayStateAsJson(state) {
		window.prompt("Strg+C zum kopieren:", JSON.stringify(state))
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
			// addition/subtraction of another row
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
		isNum,
		isMatrixName,
		isArr,
		groupByBrackets,
		displayStateAsJson,
		romanNumToInt,
		getTransformationDirective,
		getDirectiveParams,
		parseNumber
	}
})()
