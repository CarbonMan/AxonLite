//var T$.L10n;
var axon;
$(function(){
	axon = new Axon();
});

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
			generateTab(account);
		}
		$("#accountName").val("");
	});
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
			'<button id="' + settings.id + '_OpenBtn" class="ui small button" >OPEN</button>' +
			'<button id="' + settings.id + '_DelBtn" class="ui small button" >UNLOAD</button>' +
			'</div>');
	content.insertBefore("#closeBtn");
	// The content must have loaded prior to creating the tab.
	tab.tab({
		'onVisible':function(){
			// This is now the active account
			axon.config.accounts[settings.id].active = true;
		}
	});

	$("#" + settings.id + "_OpenBtn").click(function () {
		var sk = $('#' + settings.id + '_Key').val();
		if (sk) {
			var acc = axon.config.accounts[settings.id];
			acc.network = axon.network;
			acc.privateKey = sk;
			acc.active = true;
			axon.saveConfigChanges();
			// Show current balance
			loadAccountDetails({
				key: sk,
				div: settings.id + '_status'
			});
		}
	});

	$("#" + settings.id + "_DelBtn").click(function () {
		$("#" + settings.id + "_content").remove();
		$("#" + settings.id).remove();
		delete axon.config.accounts[settings.id];
		axon.saveConfigChanges();
	});
}

/**
 *  The configuration choices are persisted across sessions through
 *  local storage.
 */
function Axon() {
	var _config;
	var me = this;
	this.i18n = function (string) {
		return Axon.L10n[string] || string;
	};
	// Request the latest configuration
	chrome.runtime.sendMessage({
		type: "GetConfig"
	}, function (config) {
		console.log("getConfig response", config);
		_config = config;
		initializeScreen();
	});

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
			//setBaseAccount();
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
};
// i18n see messages folder
Axon.L10n = {};

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
}
