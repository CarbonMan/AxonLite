/**
 *  The configuration choices are persisted across sessions through
 *  local storage.
 */
var axon = new function () {
	var _config;
	chrome.storage.local.get(null, function (config) {
		console.log("Retrieved config", config);
		_config = config || { network: 'public'};
	});

	Object.defineProperty(this, "network", {
		get: function () {
			return _config.network;
		},
		set: function (val) {
			_config.network = val;
			// Inform all tabs of the network change
			chrome.tabs.query({}, function (tabs) {
				tabs.forEach(function (tb) {
					chrome.tabs.sendMessage(tb.id, {
						type: "settings",
						name: "network",
						value: val
					}, function (response) {
						console.log('response', response);
					});
				});
			});
			saveConfig();
		}
	});

	function saveConfig() {
		// Save it using the Chrome extension storage API.
		chrome.storage.local.set(_config, function () {
			// Notify that we saved.
			console.log('Settings saved');
		});
	}
};

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
	// Query filter to be passed to chrome.tabs.query - see
	// https://developer.chrome.com/extensions/tabs#method-query
	var queryInfo = {
		active: true,
		currentWindow: true
	};

	chrome.tabs.query(queryInfo, (tabs) => {
		// chrome.tabs.query invokes the callback with a list of tabs that match the
		// query. When the popup is opened, there is certainly a window and at least
		// one tab, so we can safely assume that |tabs| is a non-empty array.
		// A window can only have one active tab at a time, so the array consists of
		// exactly one tab.
		var tab = tabs[0];

		// A tab is a plain object that provides information about the tab.
		// See https://developer.chrome.com/extensions/tabs#type-Tab
		var url = tab.url;

		// tab.url is only available if the "activeTab" permission is declared.
		// If you want to see the URL of other tabs (e.g. after removing active:true
		// from |queryInfo|), then the "tabs" permission is required to see their
		// "url" properties.
		console.assert(typeof url == 'string', 'tab.url should be a string');

		callback(url);
	});

}

document.addEventListener('DOMContentLoaded', () => {
	getCurrentTabUrl((url) => {
		var publicNetBtn = document.getElementById('publicNetBtn');
		var testNetBtn = document.getElementById('testNetBtn');
		console.log("Current network", axon.network);
		if (axon.network == "public")
			publicNetBtn.classList.add("positive");
		else
			testNetBtn.classList.add("positive");
		
		publicNetBtn.addEventListener("click", function () {
			console.log("You clicked publicNetBtn");
			testNetBtn.classList.remove("positive");
			publicNetBtn.classList.add("positive");
			axon.network = "public";
		});

		testNetBtn.addEventListener("click", function () {
			console.log("You clicked testNetBtn");
			publicNetBtn.classList.remove("positive");
			testNetBtn.classList.add("positive");
			axon.network = "test";
		});

		var closeBtn = document.getElementById('closeBtn');
		closeBtn.addEventListener("click", function () {
			window.close();
		});

	});
});
