const redux = (function() {
	// "imports"
	let {mergeObj} = utils
	
	let state = {},
		reducers = [],
		subscriber = []

	function getState() {
		return state
	}
	
	function registerSubscriber(fn) {
		subscriber.push(fn)
	}

	function updateSubscribers() {
		subscriber.forEach(x => x(state))
	}

	function createStore(fns, initState) {
		reducers = fns
		reducers.forEach(r => state[r.name] = r(initState[r.name], {type: undefined})) //initialise Store
		return {
			getState,
			dispatch,
			registerSubscriber
		}
	}

	function dispatch(action) {
		if (typeof action === 'function') {
			// action is a thunk
			return action(dispatch, getState)
		}
		let nextState = {} // very important step here: make a new object for every state!
		reducers.forEach(r => nextState[r.name] = r(state[r.name], action))
		state = nextState
		updateSubscribers()
	}

	function connect(Component) {
		return function(props) {
			return Component(mergeObj(props, {dispatch}))
		}
	}

	return {
		createStore,
		dispatch,
		connect
	}
})()