const redux = (function() {
	
	let state = {},
		reducers = {},
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
		Object.keys(fns).forEach(key => {
			// register reducers
			state[key] = fns[key](initState[key], {}) //initialise Store
		}) 

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
		Object.keys(state).forEach(key => state[key] = reducers[key](state[key], action))
		updateSubscribers()
	}

	function connect(Component) {
		return function(props) {
			return Component(props.merge({dispatch}))
		}
	}

	return {
		createStore,
		connect
	}
})()