//var T$.L10n;
var axon;
//$(function () {
	//axon = new Axon();
	//$("#currentAccount").html(axon.i18n("No active account"));
//});

document.addEventListener('DOMContentLoaded', () => {
	$('.menu .item').tab();

	$("#addBtn").click(function () {
		var accName = $("#accountName").val();
		if (accName) {
			var account = {
				id: "" + Math.floor(Math.random() * 10 ** 7),
				title: accName,
				privateKey: ""
			}
			axon.config.accounts[account.id] = account;
			axon.saveConfigChanges();
			generateTab(account);
		}
		$("#accountName").val("");
	});
	axon = new Axon();
	$("#currentAccount").html(axon.i18n("No active account"));
});

function generateTab(settings) {
	// Does the tab already exist?
	if ($('#' + settings.id).length)
		return;
	// If not then create it.
	var tab = $('<a id="' + settings.id + '" class="item" data-tab="' + settings.id + '">' + settings.title + '</a>')
		.appendTo("#tabs")
		.click(function () {
			var id = $(this).attr("id");
			if ($("#" + id + "_Key").val())
				axon.config.accounts[id].active = true;
		});

	var content = $('<div id="' + settings.id + '_content" class="ui bottom attached tab segment" data-tab="' + settings.id + '">' +
			'<h4>Connect to account on ' + axon.i18n(axon.network) + '</h4>' +
			'<b>Private keys will be forgotten</b>.' +
			'<div class="ui icon input">' +
			'Private Key<br/>' +
			'<input type="text" id="' + settings.id + '_Key" placeholder="Private key">' +
			'<i class="spy icon"></i>' +
			'</div><br/><br/>' +
			'<div id="' + settings.id + '_status"></div><br/>' +
			'<button id="' + settings.id + '_OpenBtn" class="ui small button" >CONNECT ACCOUNT</button>' +
			'<button id="' + settings.id + '_DelBtn" class="ui small button" >UNLOAD</button>' +
			'</div>');
	content.insertBefore("#closeBtn");
	// The content must have loaded prior to creating the tab.
	tab.tab({
		'onVisible': function () {
			// This is now the active account
			var acc = axon.config.accounts[settings.id];
			acc.active = true;
			if (acc.privateKey)
				$("#currentAccount").html(settings.title + " " + axon.i18n("account selected"));
			else
				$("#currentAccount").html(axon.i18n("No active account"));
		}
	});

	$("#" + settings.id + "_OpenBtn").click(function () {
		var sk = $('#' + settings.id + '_Key').val();
		if (sk) {
			var acc = axon.config.accounts[settings.id];
			acc.network = axon.network;
			acc.privateKey = sk;
			acc.active = true;
			$("#currentAccount").html(settings.title + " " + axon.i18n("account selected"));
			axon.saveConfigChanges();
			// Show current balance
			loadAccountDetails({
				key: sk,
				div: settings.id + '_status'
			});
		} else
			alert(axon.i18n("Private key required"));
	});

	$("#" + settings.id + "_DelBtn").click(function () {
		$("#" + settings.id + "_content").remove();
		$("#" + settings.id).remove();
		delete axon.config.accounts[settings.id];
		axon.saveConfigChanges();
		// Go to the home tab
		$('.ui.menu').find('.item').tab('change tab', 'settings');
	});
}

/**
 *  The configuration choices are persisted across sessions through
 *  local storage.
 */
function Axon() {
	var _config;
	var me = this;
	me.manifest = {};

	me.getConfiguration = () => {
		// Request the latest configuration
		chrome.runtime.sendMessage({
			type: "GetConfig"
		}, function (config) {
			console.log("getConfig response", config);
			if (config) {
				_config = config;
				initializeScreen();
			} else {
				// There was a timing problem. If the user loads Chrome and then immediately clicks
				// the icon the config object was null, so keep trying until it is retrieved.
				setTimeout(me.getConfiguration, 500);
			}
		});
	};

	Object.defineProperty(this, "config", {
		get: function () {
			return _config;
		}
	});

	// Listen for Axon messages
	chrome.runtime.onMessage.addListener(
		function (request, sender, sendResponse) {
		if (request.type == "config") {
			// The configuration has changed
			_config = request.value;
			// Check that all account tabs exist
			me.checkAccountTabs();
			console.log('Received message', request);
		}
	});

	Object.defineProperty(this, "network", {
		get: function () {
			return _config.network;
		},
		set: function (val) {
			_config.network = val;
			// The base account for the AxonLite extension
			this.saveConfigChanges();
			testNetBtn.classList.remove("positive");
			publicNetBtn.classList.remove("positive");
			if (val == "public")
				publicNetBtn.classList.add("positive");
			else
				testNetBtn.classList.add("positive");
			alert(axon.i18n("Network has been changed refresh open pages"));
			console.log("Network changed to ", val);
		}
	});

	this.saveConfigChanges = function () {
		chrome.runtime.sendMessage({
			type: "SaveConfig",
			value: _config
		},
			function () {
			// The response will be received as a 'config' message above
			console.log("Configuration saved");
		});
	};

	this.checkAccountTabs = function () {
		for (var k in _config.accounts) {
			var acc = _config.accounts[k];
			generateTab(acc);
		}
	};
	me.getConfiguration();
};

/**
 *  Load the current state of the account
 */
function loadAccountDetails(options) {
	var sk = options.key;
	// Get the account details
	// Generate the public address key from the seed.
	var sourceKeypair = StellarSdk.Keypair.fromSecret(sk);
	var sourcePublicKey = sourceKeypair.publicKey();
	var url = axon.config.horizon + "/accounts/" + sourcePublicKey;
	$.get(url, function (data) {
		console.log(data);
		var accState = '<table class="ui compact table">' +
			'<tr>' +
			'<td>' + axon.i18n("Balance") + '</td>' +
			'<td>' + data.balances[0].balance + '</td>' +
			'</tr>' +
			'</table>';
		$("#" + options.div).html(accState);
	})
	.catch (function (e) {
		$("#" + options.div).html("Error connecting to account");
	});
}

/**
 *  The configuration has been retrieved now the screen can be
 *  setup.
 */
function initializeScreen() {
	var publicNetBtn = document.getElementById('publicNetBtn');
	var testNetBtn = document.getElementById('testNetBtn');
	console.log("Current network", axon.network);
	if (axon.network == "public")
		publicNetBtn.classList.add("positive");
	else
		testNetBtn.classList.add("positive");

	publicNetBtn.addEventListener("click", function () {
		axon.network = "public";
	});

	testNetBtn.addEventListener("click", function () {
		axon.network = "test";
	});

	var closeBtn = document.getElementById('closeBtn');
	closeBtn.addEventListener("click", function () {
		window.close();
	});

	axon.checkAccountTabs();

	// Get the named sites from the manifest file
	XHR("../manifest.json", function (manifest) {
		axon.manifest = JSON.parse(manifest);
		var select = document.getElementsByName("url")[0];
		if (axon.manifest['content_scripts']) {
			axon.manifest['content_scripts'].forEach((cs) => {
				//console.log(cs);
				if (cs.name) {
					//console.log(cs.name);
					var option = document.createElement('option');
					option.text = option.value = cs.name;
					select.add(option, 0);
				}
			});
		}
		//console.log(axon.manifest);
	});
	//$(".ui .dropdown").dropdown();
}

// Attempt to pull the manifest.json file
function XHR(file, callback) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function () {
		if (xhr.readyState === 4 && xhr.status === 200) {
			callback(xhr.responseText);
		}
	}
	xhr.open('GET', file, true);
	xhr.send();
}
