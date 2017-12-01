// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/*
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, {type:"getText"}, function(response){
        //alert(response)
		var elm = document.getElementById("text");
		elm.innerHTML = response;
        //$("#text").text(response);
    });
});
*/

/**
 *  The configuration choices are persisted across sessions through
 *  local storage.
 */
var axon = new function(){
	var _config;
	chrome.storage.local.get(null, function(config){
		_config = config || {};
	});
		
	Object.defineProperty(this, "network", {
		get: function(){
			_config.network;
		},
		set: function(val){
			_config.network = val;
			saveConfig();
		}
	});
	
	function saveConfig(){
	// Save it using the Chrome extension storage API.
        chrome.storage.local.set(_config, function() {
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

/**
 * Change the background color of the current page.
 *
 * @param {string} color The new background color.
 */
 /*
function changeBackgroundColor(color) {
  var script = 'document.body.style.backgroundColor="' + color + '";';
  // See https://developer.chrome.com/extensions/tabs#method-executeScript.
  // chrome.tabs.executeScript allows us to programmatically inject JavaScript
  // into a page. Since we omit the optional first argument "tabId", the script
  // is inserted into the active tab of the current window, which serves as the
  // default.
  chrome.tabs.executeScript({
    code: script
  });
}
*/

/**
 * Gets the saved background color for url.
 *
 * @param {string} url URL whose background color is to be retrieved.
 * @param {function(string)} callback called with the saved background color for
 *     the given url on success, or a falsy value if no color is retrieved.
 */
 /*
function getSavedBackgroundColor(url, callback) {
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We check
  // for chrome.runtime.lastError to ensure correctness even when the API call
  // fails.
  chrome.storage.sync.get(url, (items) => {
    callback(chrome.runtime.lastError ? null : items[url]);
  });
}
*/

/**
 * Sets the given background color for url.
 *
 * @param {string} url URL for which background color is to be saved.
 * @param {string} color The background color to be saved.
 */
 /*
function saveBackgroundColor(url, color) {
  var items = {};
  items[url] = color;
  // See https://developer.chrome.com/apps/storage#type-StorageArea. We omit the
  // optional callback since we don't need to perform any action once the
  // background color is saved.
  chrome.storage.sync.set(items);
}
*/

document.addEventListener('DOMContentLoaded', () => {
  getCurrentTabUrl((url) => {
    var mainNetBtn = document.getElementById('publicNetBtn');
    var testNetBtn = document.getElementById('testNetBtn');
	mainNetBtn.addEventListener("click", function(){
		console.log("You clicked publicNetBtn");
		testNetBtn.classList.remove("positive");
		mainNetBtn.classList.add("positive");
		axon.network = "public";
	});

	testNetBtn.addEventListener("click", function(){
		console.log("You clicked testNetBtn");
		mainNetBtn.classList.remove("positive");
		testNetBtn.classList.add("positive");
		axon.network = "test";
	});

	/*
    // Load the saved background color for this page and modify the dropdown
    // value, if needed.
    getSavedBackgroundColor(url, (savedColor) => {
      if (savedColor) {
        changeBackgroundColor(savedColor);
        dropdown.value = savedColor;
      }
    });

    // Ensure the background color is changed and saved when the dropdown
    // selection changes.
    dropdown.addEventListener('change', () => {
      changeBackgroundColor(dropdown.value);
      saveBackgroundColor(url, dropdown.value);
    });
	*/
  });
});
