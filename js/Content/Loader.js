/**
 *  @file Loader.js
 *  @brief Defines the Axon class
 */
if (typeof Axon == "undefined") {
	// In case multiple patterns match in the manifest.json
	function Axon(options) {
		var me = this;

		// This is the currently active private key
		//me.activePrivateKey = "";

		this.enums = {
			USER_CANCELLED: 0,
			TRANSACTION_ERROR: 1,
			DESTINATION_ACCOUNT_ERROR: 2,
			INSUFFICIENT_FUNDS: 4,
			INITIALIZED: "INIT"
		};
		me.config = {};

		eventHandler(me);

		// What is the current configuration?
		chrome.runtime.sendMessage({
			type: 'GetConfig'
		}, (value) => {
			console.log("Stored network preference:", value);
			me.config = value;
			Axon.handlers.forEach(function (init) {
				init();
			});
			me.fire(me.enums.INITIALIZED);
		});

		// Listen for Axon messages
		chrome.runtime.onMessage.addListener(
			(request, sender, sendResponse) => {
			if (request.type == "config") {
				me.config = request.value;
				// // Get the currently active account private key
				// me.activePrivateKey = "";
				// for (var p in me.config.accounts) {
					// var acc = me.config.accounts[p];
					// if (acc.active && acc.privateKey)
						// me.activePrivateKey = acc.privateKey;
				// });
			}
			console.log('Received message', request);
		});
	}

	Axon.handlers = [];
	Axon.register = function (handler) {
		this.handlers.push(handler);
	}

}
