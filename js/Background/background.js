/**
 *  @file background.js
 *  @brief AxonLite Chrome extension background processing 
 */
 
var _config;
/**
 *  Get the configuration out of local storage
 */
chrome.storage.local.get('config', function (config) {
	console.log("Retrieved config", config);
	if (config.version)
		_config = config;
	else {
		_config = {
			version: axon.enums.CURRENT_VERSION,
			network: 'public',
			accounts: {}
		};
	}
	axon.setNetwork();
	// The base accounts are not stored
	axon.setAccounts();
});

var axon = {
	enums: {
		CURRENT_VERSION: .1
	},
	/**
	 *  Set the fixed public keys for the AxonLite account according to what network 
	 *  is being used.
	 */
	setAccounts: function () {
		if (_config.network == "public")
			_config.baseAccount = "GD3XZY6576VGGP7D2RHTRJ2FHZ2W62FUFWEW27SI6MUXLWCFOVYZ4SRK";
		else
			_config.baseAccount = "GAFKZ3KINIHFOXSMT23ESUCAWZY4OIPFRFWLBIB3GHPOUB6B5PM3DXYJ";
	},
	/**
	 *  Set the fixed public keys for the AxonLite account according to what network 
	 *  is being used.
	 */
	setNetwork: function () {
		if (_config.network == "public")
			_config.horizon = 'https://horizon.stellar.org';
		else
			_config.horizon = 'https://horizon-testnet.stellar.org';
	},
	getCurrentAccount: function(cb){
		if (_config.accounts){
			for (var a in _config.accounts){
				var acc = _config.accounts[a];
				if (acc.active)
					cb(acc);
			}
		}
	}
};

/**
 *  Communication from the popup or content scripts
 *  for storing or retrieving the configuration
 */
chrome.runtime.onMessage.addListener(function (request, sender, callback) {
	switch (request.type) {
	case 'GetContacts':
		chrome.storage.local.get('contacts', function (entry) {
			console.log("Contacts retrieved", entry.contacts);
			callback(entry.contacts);
		});
		break;
		
	case 'SaveContacts':
		console.log("Contacts received", request.value);
		chrome.storage.local.set({'contacts': request.value});
		return false;
		
	case 'GetCurrentAccount':
		// Is there a current selected account
		axon.getCurrentAccount(callback);
		break;
		
	case 'SaveConfig':
		// Save it using the Chrome extension storage API.
		// Called from the popup
		// Create a clone for saving. Remove sensitive properties
		var cfg = JSON.parse(JSON.stringify( request.value ));
		// The base account is never placed into local storage
		delete cfg.baseAccount;
		for (var k in cfg.accounts){
			cfg.accounts[k].active = false;
			delete cfg.accounts[k].privateKey;
		}
		cfg.version = axon.enums.CURRENT_VERSION;
		chrome.storage.local.set({'config': cfg}, function () {
			_config = request.value;
			// Sets the network address for the current network 'test' / 'public'
			axon.setNetwork();
			console.log('Settings saved');
			
			// Inform all tabs of the configuration change
			chrome.tabs.query({}, function (tabs) {
				tabs.forEach(function (tb) {
					chrome.tabs.sendMessage(tb.id, {
						type: "config",
						value: _config
					}, function (response) {
						console.log('response', response);
					});
				});
			});
			
			// Send a message to the popup with the new configuration
			chrome.runtime.sendMessage({
				type: "config",
				value: _config
			},
				function (response) {
			});
		});
		return false;

	case 'GetConfig':
		// Request for the current configuration
		callback(_config);
		break;
	}
	// response may be asynchronous
	return true;
});

// Called when the user clicks on the browser action.
/*
chrome.browserAction.onClicked.addListener(function(tab) {
// Send a message to the active tab
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
var activeTab = tabs[0];
alert('click');
chrome.tabs.sendMessage(activeTab.id, {"type": "clicked_browser_action"});
});
});

 */

// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// The onClicked callback function.
/*
function onClickHandler(info, tab) {
if (info.menuItemId == "radio1" || info.menuItemId == "radio2") {
console.log("radio item " + info.menuItemId +
" was clicked (previous checked state was "  +
info.wasChecked + ")");
} else if (info.menuItemId == "checkbox1" || info.menuItemId == "checkbox2") {
console.log(JSON.stringify(info));
console.log("checkbox item " + info.menuItemId +
" was clicked, state is now: " + info.checked +
" (previous state was " + info.wasChecked + ")");

} else {
debugger;
console.log("item " + info.menuItemId + " was clicked");
console.log("info: " + JSON.stringify(info));
console.log("tab: " + JSON.stringify(tab));
}
};

chrome.contextMenus.onClicked.addListener(onClickHandler);

// Set up context menu tree at install time.
chrome.runtime.onInstalled.addListener(function() {
// Create one test item for each context type.
var contexts = ["page","selection","link","editable","image","video",
"audio"];
for (var i = 0; i < contexts.length; i++) {
var context = contexts[i];
var title = "Test '" + context + "' menu item";
var id = chrome.contextMenus.create({"title": title, "contexts":[context],
"id": "context" + context});
console.log("'" + context + "' item:" + id);
}

// Create a parent item and two children.
chrome.contextMenus.create({"title": "Test parent item", "id": "parent"});
chrome.contextMenus.create(
{"title": "Child 1", "parentId": "parent", "id": "child1"});
chrome.contextMenus.create(
{"title": "Child 2", "parentId": "parent", "id": "child2"});
console.log("parent child1 child2");

// Create some radio items.
chrome.contextMenus.create({"title": "Radio 1", "type": "radio",
"id": "radio1"});
chrome.contextMenus.create({"title": "Radio 2", "type": "radio",
"id": "radio2"});
console.log("radio1 radio2");

// Create some checkbox items.
chrome.contextMenus.create(
{"title": "Checkbox1", "type": "checkbox", "id": "checkbox1"});
chrome.contextMenus.create(
{"title": "Checkbox2", "type": "checkbox", "id": "checkbox2"});
console.log("checkbox1 checkbox2");

// Intentionally create an invalid item, to show off error checking in the
// create callback.
console.log("About to try creating an invalid item - an error about " +
"duplicate item child1 should show up");
chrome.contextMenus.create({"title": "Oops", "id": "child1"}, function() {
if (chrome.extension.lastError) {
console.log("Got expected error: " + chrome.extension.lastError.message);
}
});
});
*/
