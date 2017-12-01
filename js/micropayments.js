﻿function Axon(options) {
	var me = this;
	me.config = {
		network: 'main'
	};
	// What network should be used for communications?
	chrome.runtime.sendMessage({
		type: 'settings',
		name: 'network'
	}, function (value) {
		console.log("Stored network preference:", value);
		if (value !== null)
			me.config.network = value;
		if (options.done)
			options.done();
	});
}

/**
 *  Payment control for the Stellar network
 */
Axon.prototype.Stellar = function () {
	this.showWarning = true;
	this.sendPayment = function (receiver) {
		var receiverPublicKey = receiver.key;
		console.log("Axon.Stellar.SendPayment");
		var yourSecretKey = prompt("Enter your Stellar seed (empty=CANCEL): ", "your Stellar seed");
		if (!yourSecretKey)
			return;
		var amountStr = prompt("Enter the amount (you will be asked to confirm): ", "the amount");
		if (!amountStr || amountStr == "0")
			return;
		var amt = parseFloat(amountStr);
		if (!confirm("Are you sure you wish to send " + amt + " lumens from\n" +
				yourSecretKey + " to " + receiver.name + "?"))
			return;

		var sourceKeypair = StellarSdk.Keypair.fromSecret(yourSecretKey);
		var sourcePublicKey = sourceKeypair.publicKey();

		// Configure StellarSdk to talk to the horizon instance hosted by Stellar.org
		// To use the live network, set the hostname to 'horizon.stellar.org'
		var horizon,
		useNet;
		//var server = new StellarSdk.Server(horizon);

		// Uncomment the following line to build transactions for the live network. Be
		// sure to also change the horizon hostname.
		if (axon.config.network === "public") {
			horizon = 'https://horizon.stellar.org'
				useNet = StellarSdk.Network.usePublicNetwork;
		} else {
			horizon = 'https://horizon-testnet.stellar.org'
				useNet = StellarSdk.Network.useTestNetwork;
		}
		var server = new StellarSdk.Server(horizon);
		useNet();
		// Transactions require a valid sequence number that is specific to this account.
		// We can fetch the current sequence number for the source account from Horizon.
		server.loadAccount(sourcePublicKey)
		.then(function (account) {
			var transaction = new StellarSdk.TransactionBuilder(account)
				// Add a payment operation to the transaction
				.addOperation(StellarSdk.Operation.payment({
						destination: receiverPublicKey,
						// The term native asset refers to lumens
						asset: StellarSdk.Asset.native(),
						// Specify 350.1234567 lumens. Lumens are divisible to seven digits past
						// the decimal. They are represented in JS Stellar SDK in string format
						// to avoid errors from the use of the JavaScript Number data structure.
						amount: amountStr
					}))
				// Uncomment to add a memo (https://www.stellar.org/developers/learn/concepts/transactions.html)
				//.addMemo(StellarSdk.Memo.text('Hello world!'))
				.build();

			// Sign this transaction with the secret key
			// NOTE: signing is transaction is network specific. Test network transactions
			// won't work in the public network. To switch networks, use the Network object
			// as explained above (look for StellarSdk.Network).
			transaction.sign(sourceKeypair);

			// Let's see the XDR (encoded in base64) of the transaction we just built
			console.log(transaction.toEnvelope().toXDR('base64'));

			// Submit the transaction to the Horizon server. The Horizon server will then
			// submit the transaction into the network for us.
			server.submitTransaction(transaction)
			.then(function (transactionResult) {
				console.log(JSON.stringify(transactionResult, null, 2));
				console.log('\nSuccess! View the transaction at: ');
				console.log(transactionResult._links.transaction.href);
			})
			.catch (function (err) {
				alert("An error occurred sending the transaction");
				console.log('An error has occured:');
				console.log(err);
			});
		})
		.catch (function (e) {
			debugger;
			alert("Unable to connect with the destination account");
			console.error(e);
		});
	};
}

// Add the font awesome icons
var head = document.getElementsByTagName('head')[0];
var s = document.createElement('style');
s.setAttribute('type', 'text/css');
s.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css');
head.appendChild(s);

// Modal Popup
Axon.prototype.Modal = function (prop) {
	// Default parameters
	// Modified from here https://paulund.co.uk/how-to-create-a-simple-modal-box-with-jquery
	var options = $.extend({
			height: "250",
			width: "500",
			title: "",
			description: "",
			top: "20%",
			left: "30%",
		}, prop);

	function add_styles() {
		$('.axon_modal_box').css({
			'position': 'absolute',
			'left': options.left,
			'top': options.top,
			'display': 'none',
			'height': options.height + 'px',
			'width': options.width + 'px',
			'border': '1px solid #fff',
			'box-shadow': '0px 2px 7px #292929',
			'-moz-box-shadow': '0px 2px 7px #292929',
			'-webkit-box-shadow': '0px 2px 7px #292929',
			'border-radius': '10px',
			'-moz-border-radius': '10px',
			'-webkit-border-radius': '10px',
			'background': '#f2f2f2',
			'z-index': '50',
		});
		/*Block page overlay*/
		var pageHeight = $(document).height();
		var pageWidth = $(window).width();

		$('.axon_block_page').css({
			'position': 'absolute',
			'top': '0',
			'left': '0',
			'background-color': 'rgba(0,0,0,0.6)',
			'height': pageHeight,
			'width': pageWidth,
			'z-index': '10'
		});
		$('.axon_inner_modal_box').css({
			'background-color': '#fff',
			'height': (options.height - 50) + 'px',
			'width': (options.width - 50) + 'px',
			'padding': '10px',
			'margin': '15px',
			'border-radius': '10px',
			'-moz-border-radius': '10px',
			'-webkit-border-radius': '10px'
		});
		// Button styling
		$('.axon_ok_button').css({
			'background-color': '#44c767',
			'-moz-border-radius': '28px',
			'-webkit-border-radius': '28px',
			'border-radius': '28px',
			'border': '1px solid #18ab29',
			'display': 'inline-block',
			'cursor': 'pointer',
			'color': '#ffffff',
			'font-family': 'Arial',
			'font-size': '14px',
			'padding': '7px 17px',
			'text-decoration': 'none',
			'text-shadow': '0px 1px 0px #2f6627'
		});
		$('head').append('<style>' +
			'.axon_ok_button:hover{background-color : #5cbf2a;}' +
			'.axon_ok_button:active{position:relative;top:1px;}' +
			'</style>');
		$('.axon_close_button').css({
			'background-color': '#eb461d',
			'-moz-border-radius': '28px',
			'-webkit-border-radius': '28px',
			'border-radius': '28px',
			'border': '1px solid #330606',
			'display': 'inline-block',
			'cursor': 'pointer',
			'color': '#ffffff',
			'font-family': 'Arial',
			'font-size': '14px',
			'padding': '7px 17px',
			'text-decoration': 'none',
			'text-shadow': '0px 1px 0px #1a0303'
		});
		$('head').append('<style>' +
			'.axon_close_button:hover{background-color : #e01010;}' +
			'.axon_close_button:active{position:relative;top:1px;}' +
			'</style>');
	}

	function add_block_page() {
		var block_page = $('<div class="axon_block_page"></div>');

		$(block_page).appendTo('body');
	}

	function add_popup_box() {
		var pop_up = $('<div class="axon_modal_box">' +
				'<div class="axon_inner_modal_box">' +
				'<p style="font-size:14px;font-style:bold;text-align: center;color:red">' + options.title + '</p>' +
				'<br/>' +
				'<p style="font-size:12px;">' + options.description + '</p></div></div>');
		$(pop_up).appendTo('.axon_block_page');
	}

	this.close = function () {
		$('.axon_modal_box').fadeOut().remove();
		$('.axon_block_page').fadeOut().remove();
	};

	add_block_page();
	add_popup_box();
	add_styles();

	$('.axon_modal_box').fadeIn();
};

/**
 *  Goes through the user interface and looks for account matches
 */
function readUserInterface() {
	var accounts = [],
	accLocation = (axon.config.network === "public" ? "public_stellar_accounts" : "test_stellar_accounts"),
	accountStr = localStorage.getItem("stellar_accounts");
	console.log("micropayments.js loaded");
	if (accountStr) {
		console.log("Account details found");
		accounts = JSON.parse(accountStr);
		console.dir(accounts);
		$(".comment").each(function (i) {
			var name = $(this).attr("data-author");
			for (var i in accounts) {
				if (accounts[i].name == name) {
					((account) => {
						// Lists can be nested only the first one is wanted.
						var list = $(this).find(".flat-list.buttons:first");
						// Get the url for this comment
						var embed = list.find('.bylink:first');
						var a = '<a data-inbound-url="' + embed.attr("data-inbound-url") + '">';
						var giftButton = $('<li>' + a + 'Lumens</a></li>').click(function (event) {
								event.preventDefault();
								console.log("Give lumens");
								var mB = new axon.Modal({
										top: event.pageY - 100,
										title: 'Take security seriously',
										description: "Send Lumens to " + name +
										"<br/>You will now be prompted for your account private key<br/>" +
										"<b>Nothing is stored on this computer or on our servers</b><br/>" +
										"If you have concerns about the security of this computer<br/>" +
										"before entering your private seed, open the debugger and look for the console message<br/>" +
										"Axon.Stellar.SendPayment<br/>" +
										"look at the code that generated that message. The variable <i>yourSecretKey</i> must not be stored<br/>" +
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
									mB.close();
									axon.stellar.sendPayment(account);
								});
							});
						list.append(giftButton);
					})(accounts[i]);
				}
			}
		});
	}
}

var axon = new Axon({
		done: readUserInterface
	});
axon.stellar = axon.stellar || new axon.Stellar();
