/**
 *  @file GithubPayments.js
 *  @brief Analyze a Github issues page looking for registered users
 */
 
// function Axon(options) {
// var me = this;
// this.enums = {
// USER_CANCELLED: 0,
// TRANSACTION_ERROR: 1,
// DESTINATION_ACCOUNT_ERROR: 2,
// INSUFFICIENT_FUNDS: 4
// };
// me.config = {};

// // What is the current configuration?
// chrome.runtime.sendMessage({
// type: 'GetConfig'
// }, function (value) {
// console.log("Stored network preference:", value);
// me.config = value;
// //		if (value !== null)
// //			me.config.network = value;
// if (options.done)
// options.done();
// });

// // Listen for Axon messages
// chrome.runtime.onMessage.addListener(
// function (request, sender, sendResponse) {
// if (request.type == "config")
// me.config = request.value;
// console.log('Received message', request);
// });
// }

// Axon.prototype.PaymentError = function (options) {
// if (typeof options == "number") {
// this.type = options;
// this.message = "";
// this.contents = options.contents || {};
// } else {
// this.type = options.type;
// this.message = options.message || "";
// this.contents = options.contents || {};
// }
// };

// Axon.prototype.PaymentError.prototype = new Error;

// /**
// *  Payment control for the Stellar network
// */
// Axon.prototype.Stellar = function () {
// var me = this;
// me.showWarning = true;
// /**
// *  Base payment for the extension
// */
// me.FIXED_MINIMUM_CHARGE = 0.05;
// me.FIXED_BASIC_PERCENTAGE = 0.01;

// /**
// *  This is the secret key that should not be made public.
// *  Not a problem for an extension as this is running in a code sandbox.
// */
// me.getAccountSeed = function (state) {
// var seed = new Promise(function (resolve, reject) {
// // First see if there is an active account in the extension
// // What is the current configuration?
// chrome.runtime.sendMessage({
// type: 'GetCurrentAccount'
// }, function (acc) {
// console.log("Current Account", acc);
// if (acc){
// state.privateKey = acc.privateKey;
// state.title = acc.title;
// resolve();
// }else {
// var privateKey = prompt("Enter your Stellar seed (empty=CANCEL): ", "your Stellar seed");
// if (privateKey)
// state.privateKey = state.title = privateKey;
// resolve();
// else
// reject(new axon.PaymentError(axon.enums.USER_CANCELLED));
// }
// });
// });
// return seed;
// };

// me.getAmountToSend = function (state) {
// var p = new Promise(function (resolve, reject) {
// var amountStr = prompt("Enter the amount (you will be asked to confirm): ", "the amount");
// if (!amountStr || amountStr == "0")
// return reject(new axon.PaymentError(axon.enums.USER_CANCELLED));

// var gross = parseFloat(amountStr);
// var fee = gross * me.FIXED_BASIC_PERCENTAGE;
// fee = (fee > me.FIXED_MINIMUM_CHARGE ? fee : me.FIXED_MINIMUM_CHARGE);
// var net = gross + fee;
// state.amount = gross;
// state.fee = fee;
// /*
// if (amt <= 0) {
// return reject(new axon.PaymentError({
// type: axon.enums.INSUFFICIENT_FUNDS,
// message: "Insufficient funds to cover the basic charge"
// }));
// }
// */
// if (!confirm("Send " + gross + " XLM from\n" +
// "the " + state.title + " account to " + state.receiverName + "?\n" +
// "Transfer fee is "+ fee + "XLM"))
// return reject(new axon.PaymentError(axon.enums.USER_CANCELLED));

// resolve();
// });
// return p;
// };

// /**
// *  Load our account
// */
// me.loadAccount = function (state) {
// // Generate the public address key from the seed.
// state.sourceKeypair = StellarSdk.Keypair.fromSecret(state.privateKey);
// var sourcePublicKey = state.sourceKeypair.publicKey();

// // Configure StellarSdk to talk to the horizon instance hosted by Stellar.org
// var useNet;

// // May see further network options if running with private networks.
// if (axon.config.network === "public") {
// // To use the live network, set the hostname to 'horizon.stellar.org'
// //horizon = 'https://horizon.stellar.org';
// useNet = StellarSdk.Network.usePublicNetwork;
// } else {
// // To use the test network, set the hostname to 'horizon.stellar.org'
// //horizon = 'https://horizon-testnet.stellar.org';
// useNet = StellarSdk.Network.useTestNetwork;
// }
// state.server = new StellarSdk.Server(axon.config.horizon);
// useNet.call(StellarSdk.Network);
// // Transactions require a valid sequence number that is specific to this account.
// // We can fetch the current sequence number for the source account from Horizon.
// return state.server.loadAccount(sourcePublicKey)
// .then(function(account){
// state.account = account;
// })
// .catch (function (e) {
// console.error(e);
// throw new axon.PaymentError({
// type: axon.enums.DESTINATION_ACCOUNT_ERROR,
// message: "Unable to connect with the destination account",
// contents: e
// });
// });
// };
// /**
// *  Build the transaction and send through the network
// */
// me.buildAndSend = function (state) {
// var transaction = new StellarSdk.TransactionBuilder(state.account)
// // Add a payment operation to the transaction
// .addOperation(StellarSdk.Operation.payment({
// destination: state.receiverPublicKey,
// asset: StellarSdk.Asset.native(),
// amount: "" + state.amount
// }))
// // Base extension payment
// .addOperation(StellarSdk.Operation.payment({
// destination: axon.config.baseAccount,
// asset: StellarSdk.Asset.native(),
// amount: state.fee
// }))
// // Uncomment to add a memo (https://www.stellar.org/developers/learn/concepts/transactions.html)
// .addMemo(StellarSdk.Memo.text('Reddit tip!'))
// .build();

// // Sign this transaction with the secret key
// // NOTE: signing is transaction is network specific. Test network transactions
// // won't work in the public network. To switch networks, use the Network object
// // as explained above (look for StellarSdk.Network).
// transaction.sign(state.sourceKeypair);

// // Let's see the XDR (encoded in base64) of the transaction we just built
// console.log(transaction.toEnvelope().toXDR('base64'));

// // Submit the transaction to the Horizon server. The Horizon server will then
// // submit the transaction into the network for us.
// return state.server.submitTransaction(transaction)
// .catch (function (e) {
// console.log('An error has occured:');
// console.log(e);
// throw new axon.PaymentError({
// type: axon.enums.TRANSACTION_ERROR,
// message: "An error occurred sending the transaction",
// contents: e
// });
// });
// };

// /**
// *  Send a payment to a user
// */
// me.sendPayment = function (receiver) {
// var paymentState = {
// receiverPublicKey: receiver.key,
// receiverName: receiver.name
// };
// return me.getAccountSeed(paymentState)
// .then(function () {
// //paymentState.privateKey = privateKey;
// return me.getAmountToSend(paymentState);
// })
// .then(function () {
// //paymentState.amount = amountToSend;
// return me.loadAccount(paymentState);
// })
// .then(function () {
// //paymentState.account = account;
// return me.buildAndSend(paymentState);
// })
// .then(function (transactionResult) {
// console.log(JSON.stringify(transactionResult, null, 2));
// console.log('\nSuccess! View the transaction at: ');
// console.log(transactionResult._links.transaction.href);
// });
// };

// };

// // Add the font awesome icons
// var head = document.getElementsByTagName('head')[0];
// var s = document.createElement('style');
// s.setAttribute('type', 'text/css');
// s.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');
// head.appendChild(s);

// // Modal Popup
// Axon.prototype.Modal = function (prop) {
// // Default parameters
// // Modified from here https://paulund.co.uk/how-to-create-a-simple-modal-box-with-jquery
// var options = $.extend({
// height: "250",
// width: "500",
// title: "",
// description: "",
// top: "20%",
// left: "30%",
// }, prop);

// function add_styles() {
// $('.axon_modal_box').css({
// 'position': 'absolute',
// 'left': options.left,
// 'top': options.top,
// 'display': 'none',
// 'height': options.height + 'px',
// 'width': options.width + 'px',
// 'border': '1px solid #fff',
// 'box-shadow': '0px 2px 7px #292929',
// '-moz-box-shadow': '0px 2px 7px #292929',
// '-webkit-box-shadow': '0px 2px 7px #292929',
// 'border-radius': '10px',
// '-moz-border-radius': '10px',
// '-webkit-border-radius': '10px',
// 'background': '#f2f2f2',
// 'z-index': '50',
// });
// /*Block page overlay*/
// var pageHeight = $(document).height();
// var pageWidth = $(window).width();

// $('.axon_block_page').css({
// 'position': 'absolute',
// 'top': '0',
// 'left': '0',
// 'background-color': 'rgba(0,0,0,0.6)',
// 'height': pageHeight,
// 'width': pageWidth,
// 'z-index': '10'
// });
// $('.axon_inner_modal_box').css({
// 'background-color': '#fff',
// 'height': (options.height - 50) + 'px',
// 'width': (options.width - 50) + 'px',
// 'padding': '10px',
// 'margin': '15px',
// 'border-radius': '10px',
// '-moz-border-radius': '10px',
// '-webkit-border-radius': '10px'
// });
// // Button styling
// $('.axon_ok_button').css({
// 'background-color': '#44c767',
// '-moz-border-radius': '28px',
// '-webkit-border-radius': '28px',
// 'border-radius': '28px',
// 'border': '1px solid #18ab29',
// 'display': 'inline-block',
// 'cursor': 'pointer',
// 'color': '#ffffff',
// 'font-family': 'Arial',
// 'font-size': '14px',
// 'padding': '7px 17px',
// 'text-decoration': 'none',
// 'text-shadow': '0px 1px 0px #2f6627'
// });
// $('head').append('<style>' +
// '.axon_ok_button:hover{background-color : #5cbf2a;}' +
// '.axon_ok_button:active{position:relative;top:1px;}' +
// '</style>');
// $('.axon_close_button').css({
// 'background-color': '#eb461d',
// '-moz-border-radius': '28px',
// '-webkit-border-radius': '28px',
// 'border-radius': '28px',
// 'border': '1px solid #330606',
// 'display': 'inline-block',
// 'cursor': 'pointer',
// 'color': '#ffffff',
// 'font-family': 'Arial',
// 'font-size': '14px',
// 'padding': '7px 17px',
// 'text-decoration': 'none',
// 'text-shadow': '0px 1px 0px #1a0303'
// });
// $('head').append('<style>' +
// '.axon_close_button:hover{background-color : #e01010;}' +
// '.axon_close_button:active{position:relative;top:1px;}' +
// '</style>');
// }

// function add_block_page() {
// var block_page = $('<div class="axon_block_page"></div>');

// $(block_page).appendTo('body');
// }

// function add_popup_box() {
// var pop_up = $('<div class="axon_modal_box">' +
// '<div class="axon_inner_modal_box">' +
// '<p style="font-size:14px;font-style:bold;text-align: center;color:red">' + options.title + '</p>' +
// '<br/>' +
// '<p style="font-size:12px;">' + options.description + '</p></div></div>');
// $(pop_up).appendTo('.axon_block_page');
// }

// this.close = function () {
// $('.axon_modal_box').fadeOut().remove();
// $('.axon_block_page').fadeOut().remove();
// };

// add_block_page();
// add_popup_box();
// add_styles();

// $('.axon_modal_box').fadeIn();
// };

/**
 *  Goes through the user interface and looks for account matches
 */
function readUserInterface() {
	var accounts = [],
	accLocation = (axon.config.network === "public" ? "stellar_public_github" : "stellar_test_github"),
	netTitle = (axon.config.network === "public" ? "Public Stellar" : "Test Stellar"),
	accountStr = localStorage.getItem(accLocation);
	console.log("GithubPayments.js loaded");
	if (accountStr) {
		console.log("Account details found");
		accounts = JSON.parse(accountStr);
		console.dir(accounts);
		$(".comment").each(function (i, elm) {
			var $author = $(elm).find(".author");
			var name = $author.text();
			for (var i in accounts) {
				if (accounts[i].name == name) {
					((account) => {
						var $commentHeader = $(elm).find(".timeline-comment-header-text");
						// Get the url for this comment
						$('<a>Lumens</a>')
						.click(function (event) {
							event.preventDefault();
							console.log("Give lumens");
							var mB = new axon.Modal({
									top: event.pageY - 100,
									title: 'Make a payment on the ' + netTitle + ' network',
									description: "Send Lumens to " + name +
									"<br/>You will now be prompted for your account private key<br/>" +
									"<b>Nothing is stored on this computer or on our servers</b><br/>" +
									"This application is protected against the page it runs within a protected environment<br/>" +
									"<br/><br/>" +
									"<button id='axonOK' class='axon_ok_button'>PROCEED</button>&nbsp;" +
									"<button id='axonClose' class='axon_close_button'>CLOSE</button>",
									height: '300',
									width: '400'
								});
							$("#axonClose").click(function () {
								mB.close();
							});
							$("#axonOK").click(function () {
								axon.sendTipFromLink({
									toAccount: account
								})
								.then(mB.close)
								.catch (mB.close);

							});
						})
						.appendTo($commentHeader);
					})(accounts[i]);
				}
			}
		});
	}
}

Axon.register( readUserInterface );

/**
 *  Send a tip from the Lumens hyperlink
 */
Axon.prototype.sendTipFromLink = function (options) {
	return this.financials.sendPayment(options.toAccount)
	.then(function (state) {
		// Place a comment that a tip has been given. 
		var orgComment = $(".js-new-comment-form .write-content textarea")
			.text("Take a " + state.amount + " tip from me. You are Stellar!\n\n" +
				"----------------------------------------\n" +
				"Via the *Axon Lite Stellar extension*\n\n" +
				"[Github](https://github.com/CarbonMan/AxonLite)");
	})
	.catch (function (err) {
		console.log(err);
		if (err.type && err.type != axon.enums.USER_CANCELLED) {
			if (err.message)
				alert(err.message);
			}
		});
};
