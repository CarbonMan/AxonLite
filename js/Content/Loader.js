/**
 *  @file Loader.js
 *  @brief Defines the Axon class
 */
if (typeof Axon == "undefined"){
	// In case multiple patterns match in the manifest.json
	function Axon(options) {
		var me = this;
		this.enums = {
			USER_CANCELLED: 0,
			TRANSACTION_ERROR: 1,
			DESTINATION_ACCOUNT_ERROR: 2,
			INSUFFICIENT_FUNDS: 4,
			INITIALIZED: "INIT"
		};
		me.config = {};
		//me.financials = new me.Financials();
		eventHandler(me);

		// What is the current configuration?
		chrome.runtime.sendMessage({
			type: 'GetConfig'
		}, function (value) {
			console.log("Stored network preference:", value);
			me.config = value;
			Axon.handlers.forEach(function(init){
				init();
			});
			me.fire( me.enums.INITIALIZED );
		});

		// Listen for Axon messages
		chrome.runtime.onMessage.addListener(
			function (request, sender, sendResponse) {
			if (request.type == "config")
				me.config = request.value;
			console.log('Received message', request);
		});
	}

	Axon.handlers = [];
	Axon.register = function(handler){
		this.handlers.push(handler);
	}

}