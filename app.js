(function() {
	// "imports"
	const {createStore} = redux,
		actions = actionCreators,
		{App} = markup

	// initialise
	let initialState = {"matrices":[[[1,3,-1,2],[0,11,-5,3],[2,-5,3,1],[4,1,1,5]],[[0,0,0,1],[0,0,1,0],[0,1,0,0],[1,0,0,0]],[[1,0,2,4],[3,11,-5,1],[-1,-5,3,1],[2,3,1,5]],[[1,0,2,4],[0,11,-11,-11],[0,-5,5,5],[0,3,-3,-3]]]},
		store = createStore(reducers, initialState)

	store.registerSubscriber(currentState => DOM.render(App(currentState)))
	DOM.registerRootNode(document.getElementById("app"))
	DOM.render(App(store.getState()))

	// register global keyboard events
	document.addEventListener('keypress', evt => {
		if (!evt.ctrlKey) {
			return
		}
		switch(evt.key) {
			case 'z':
				evt.preventDefault()
				return store.dispatch(actions.undo())
			case 'y':
				evt.preventDefault()
				return store.dispatch(actions.redo())
		}
	})


	// let test = ['+II', '+2II', '+(-1)*II', '-II'],
	// 	results = test.map(x => utils.getDirectiveParams(x))
	// console.log(test)
	// console.log(results)

})()