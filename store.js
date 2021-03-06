var store = (function(){
	var api = {},
		win = window,
		doc = win.document,
		u = undefined,
		localStorageName = 'localStorage',
		globalStorageName = 'globalStorage',
		storage,
		json = win.JSON ? {
		  s: win.JSON.stringify,
		  p: win.JSON.parse
		} : {
		    s: function(o) { return o },
		    p: function(s) { return s }
		};

	function _g(v, d) { return v == u ? d : json.p(v) }

	api.set = function(key, value) {}
	api.get = function(key, def) { return def }
	api.remove = function(key) {}
	api.clear = function() {}
	
	if (localStorageName in win && win[localStorageName]) {
		storage = win[localStorageName]
		api.set = function(key, val) { storage[key] = json.s(val) }
		api.get = function(key, def) { return _g(storage[key], def) }
		api.remove = function(key) { delete storage[key] }
		api.clear = function() { storage.clear() }
	} else if (doc.documentElement.addBehavior) {
			function createStorage() {
				storage = doc.body.appendChild(doc.createElement('div'))
				storage.style.display = 'none'
				// See http://msdn.microsoft.com/en-us/library/ms531081(v=VS.85).aspx
				// and http://msdn.microsoft.com/en-us/library/ms531424(v=VS.85).aspx
				storage.addBehavior('#default#userData')
				storage.load(localStorageName)
			}
			api.set = function(key, val) {
				if (!storage) { createStorage() }
				storage.setAttribute(key, json.s(val))
				storage.save(localStorageName)
			}
			api.get = function(key, def) {
				if (!storage) { createStorage() }
				return _g(storage.getAttribute(key), def)
			}
			api.remove = function(key) {
				if (!storage) { createStorage() }
				storage.removeAttribute(key)
				storage.save(localStorageName)
			}
			api.clear = function() {
				if (!storage) { createStorage() }
				var attributes = storage.XMLDocument.documentElement.attributes;
				storage.load(localStorageName)
				for (var i=0, attr; attr = attributes[i]; i++) {
					storage.removeAttribute(attr.name)
				}
				storage.save(localStorageName)
			}
	} else if (globalStorageName in win && win[globalStorageName]) {
		storage = win[globalStorageName][win.location.hostname]
		api.set = function(key, val) { storage[key] = json.s(val) }
		api.get = function(key, def) { return _g(storage[key] && storage[key].value, def) }
		api.remove = function(key) { delete storage[key] }
		api.clear = function() { for (var key in storage ) { delete storage[key] } }
	}
	
	return api
})()