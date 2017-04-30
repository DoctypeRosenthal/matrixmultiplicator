(function() {
	// "imports"
	const {createStore} = redux,
		{createHistory} = reduxHistory,
		actions = actionCreators,
		{App} = markup

	// initialise
	let initialState = {"matrices":[[[1,0],[-2,0]],[[0,1],[-1,0]],[[1,1],[-3,0]],[[-2,1],[-3,-3]]],"result":[[0,1],[-2,-3]]},
		store = createStore(reducers, initialState),
		history = createHistory(store.state)

	store.registerSubscriber(state => history.update(state))
	history.registerSubscriber(currentState => DOM.render(App(currentState)))
	DOM.registerRootNode(document.getElementById("app"))

	DOM.render(App(store.getState()))

	// register global keyboard events
	document.addEventListener('keypress', evt => {
		if (!evt.ctrlKey) {
			return
		}
		
		evt.preventDefault()
		switch(evt.key) {
			case 'z':
				return history.undo()
			case 'y':
				return history.redo()
		}
	})


	// let test = ['+II', '+2II', '+(-1)*II', '-II'],
	// 	results = test.map(x => utils.getDirectiveParams(x))
	// console.log(test)
	// console.log(results)

})()