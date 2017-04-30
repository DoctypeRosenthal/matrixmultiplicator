const reduxHistory = (function() {
	// "imports"
	let {mergeObj} = utils

	let subscriber = [],
		history = [],
		indexOfNow

	function registerSubscriber(fn) {
		subscriber.push(fn)
	}

	function updateSubscribers() {
		subscriber.forEach(x => x(history[indexOfNow]))
	}

	function createHistory(initState) {
		history.push(initState)
		return {
			registerSubscriber,
			update,
			undo,
			redo
		}
	}

	function connectHistory(Component) {
		return function(props) {
			return Component(mergeObj(props, {undo, redo, gotoState, getIndexOfNow: () => indexOfNow, getHistorySize: () => history.length}))
		}
	}

	function update(newState = {}) {
		// this deletes possible future states and adds a new state at the beginning
		history = [
			newState, 
			...history.slice(indexOfNow)
		]

		indexOfNow = 0
		updateSubscribers()
	}

	function redo(steps = 1) {
		if (indexOfNow === 0) return
		indexOfNow -= steps
		updateSubscribers()
	}

	function undo(steps = 1) {
		if (indexOfNow === history.length - 1) return
		indexOfNow += steps
		updateSubscribers()
	}

	function gotoState(stateID) {
		if (stateID < 0 || history.length - 1 < stateID) return 
		indexOfNow = stateID
		updateSubscribers()
	}

	return {
		createHistory,
		connectHistory
	}
})()