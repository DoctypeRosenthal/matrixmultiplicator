const DOM = (function() {
	let rootNode

	function createNode(el) {
		let node = document.createElement(el.tag || 'span')

		if (typeof el === 'string') {
			// this is just pure text
			node.innerHTML = el
			return node
		}

		modifyNode(node, el) // properties setzen

		return node
	}

	function modifyNode(node, newProps) {
		for (prop in newProps) {
			if (prop === 'tag') continue
			if (prop === 'children') {
				// if there was only plain text set in old node, delete it
				if (node.children.length === 0 && node.innerHTML) node.innerHTML = ''
				continue
			}
			if (node[prop] !== newProps[prop]) {
				// attribut hat sich geändert
				node[prop] = newProps[prop]
			} 
		}
	}

	function registerRootNode(rtn) {
		rootNode = rtn
	}


	function diffElements(parentDOMNode, childDOMNode, next) {
		if (typeof childDOMNode === 'undefined') {
			// das Element childDOMNode existiert noch nicht -> erzeugen
			childDOMNode = createNode(next)
			parentDOMNode.appendChild(childDOMNode)
		}
		// childDOMNode existiert!
		else if (childDOMNode.tagName.toLowerCase() !== next.tag
			&& childDOMNode.tagName.toLowerCase() !== 'span' && next.tag !== undefined) // Ausnahme sind reine Textknoten
			{
			// entweder dieses Element soll gelöscht werden, oder es soll ein oder mehrere neue Elemente
			// an dieser Stelle eingefügt werden. Diese Fallunterscheidung wäre sehr aufwändig, daher:
			// einfach alten Knoten mit einem neuen überschreiben
			let newNode = createNode(next)
			childDOMNode.replaceWith(newNode)
			childDOMNode = newNode // we have to set our local reference to the new node as well
		} 
		else {
			// gleiche Art von Knoten -> alles ändern, was sich geändert hat (das kann auch nichts sein!)
			modifyNode(childDOMNode, next)
		}

		if (next.children) {
			// next hat Kinder -> auch für die gucken, ob sich was geändert hat
			diffElementLists(childDOMNode, next.children)
		}
	}

	function diffElementLists(parentDOMNode, nextList) {
		let children = parentDOMNode.children // Referenz auf die Kinder von parentDOMNode
		while (children.length > nextList.length) {	
			// Lösche überzählige DOM-Knoten
			parentDOMNode.lastChild.remove()
		}

		// Vergleiche jedes Element aus nextList mit jedem Kind-Knoten von parentDOMNode
		nextList.forEach((x, i) => diffElements(parentDOMNode, children[i], nextList[i]))
	}

	function render(elementList) {
		diffElementLists(rootNode, elementList)
	}

	return {
		render,
		registerRootNode
	}
})()

