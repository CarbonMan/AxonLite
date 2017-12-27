/**
 *  @file StellarFinancials.js
 *  @brief Plugin payment control for the Stellar network
 */
Axon.prototype.Financials = function () {
	var me = this;
	// This is the payment state
	me.payment = {};
	me.currency = "Lumens";
	me.showWarning = true;
	me.networkTitle = "";
	//me.gross = 0;
	/**
	 *  Base payment for the extension
	 */
	me.FIXED_MINIMUM_CHARGE = 0.05;
	me.FIXED_BASIC_PERCENTAGE = 0.01;

	/**
	 *  The popup message body is replaceable
	 */
	Object.defineProperty(me, 'popupBody', {
		get: () => {
			return (me.payment.title ? "Send from " + me.payment.title + "<br/>" : "") +
			'Memo text (28 characters)<br/> \
			<input class="axonInput" type="text" id="transactionMemo" placeholder="Memo..." >  \
			<br/><br/>';
		}
	});

	/**
	 *  Called from payment.js when the transaction popup has been OKed.
	 *  Put some text into the transaction memo
	 */
	me.preSendTransaction = () => {
		me.payment.memoText = $("#transactionMemo").val() || 'Reddit tip!';
	};

	/**
	 *  This is the secret key that should not be made public.
	 *  Not a problem for an extension as this is running in a code sandbox.
	 */
	// me.getAccountSeed = function (state) {
	// var seed = new Promise( (resolve, reject) =>{
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
	// if (privateKey){
	// state.privateKey = state.title = privateKey;
	// resolve();
	// }else
	// reject(new axon.PaymentError(axon.enums.USER_CANCELLED));
	// }
	// });
	// });
	// return seed;
	// };

	me.getAccount = function () {
		var seed = new Promise((resolve, reject) => {
				// First see if there is an active account in the extension
				// What is the current configuration?
				chrome.runtime.sendMessage({
					type: 'GetCurrentAccount'
				}, function (acc) {
					console.log("Current Account", acc);
					if (acc) {
						resolve({
							privateKey: acc.privateKey,
							title: acc.title
						});
					} else
						resolve();
				});
			});
		return seed;
	};

	me.calculateFee = function (state) {
		return new Promise((resolve, reject) => {
			var fee = state.amount * me.FIXED_BASIC_PERCENTAGE;
			fee = (fee > me.FIXED_MINIMUM_CHARGE ? fee : me.FIXED_MINIMUM_CHARGE);
			var net = state.amount + fee;
			state.fee = fee;
			var content = "Send " + state.amount + " XLM from<br/>" +
				"the " + (state.title || "private") + " account to " + state.receiverName + "?<br/>" +
				"Transfer fee is " + fee + " XLM"
				var contentFooter = '<br/><br/>  \
				<div style="margin: 0 auto; text-align: center;">  \
				<button id="axonOK" class="axon_ok_button">PROCEED</button>&nbsp; \
				<button id="axonClose" class="axon_close_button">CLOSE</button>  \
				</div> ';
			var mB = new axon.Modal({
					title: ' Send a payment on the ' + axon.networkTitle + ' network ',
					description: content + contentFooter,
					height: '150',
					width: '400'
				});
			$("#axonClose").click(function () {
				mB.close();
				return reject(new axon.PaymentError(axon.enums.USER_CANCELLED));
			});

			$("#axonOK").click(function () {
				mB.close();
				setTimeout(() => {
					resolve();
				}, 0);
			});

		});
	};

	// me.getAmountToSend = function (state) {
	// var p = new Promise( (resolve, reject) =>{
	// // var amountStr = prompt("Enter the amount (you will be asked to confirm): ", "the amount");
	// // var gross = parseFloat(amountStr);
	// // if (isNaN(gross) || !gross)
	// // return reject(new axon.PaymentError(axon.enums.USER_CANCELLED));

	// var fee = state.gross * me.FIXED_BASIC_PERCENTAGE;
	// fee = (fee > me.FIXED_MINIMUM_CHARGE ? fee : me.FIXED_MINIMUM_CHARGE);
	// var net = state.gross + fee;
	// state.amount = state.gross;
	// state.fee = fee;
	// if (!confirm("Send " + state.gross + " XLM from\n" +
	// "the " + state.title + " account to " + state.receiverName + "?\n" +
	// "Transfer fee is "+ fee + "XLM"))
	// return reject(new axon.PaymentError(axon.enums.USER_CANCELLED));

	// resolve();
	// });
	// return p;
	// };

	/**
	 *  Load our account
	 */
	me.loadAccount = function (state) {
		// Generate the public address key from the seed.
		state.sourceKeypair = StellarSdk.Keypair.fromSecret(state.privateKey);
		var sourcePublicKey = state.sourceKeypair.publicKey();

		// Configure StellarSdk to talk to the horizon instance hosted by Stellar.org
		var useNet;

		// May see further network options if running with private networks.
		if (axon.config.network === "public") {
			// To use the live network, set the hostname to 'horizon.stellar.org'
			//horizon = 'https://horizon.stellar.org';
			useNet = StellarSdk.Network.usePublicNetwork;
		} else {
			// To use the test network, set the hostname to 'horizon.stellar.org'
			//horizon = 'https://horizon-testnet.stellar.org';
			useNet = StellarSdk.Network.useTestNetwork;
		}
		state.server = new StellarSdk.Server(axon.config.horizon);
		useNet.call(StellarSdk.Network);
		// Transactions require a valid sequence number that is specific to this account.
		// We can fetch the current sequence number for the source account from Horizon.
		return state.server.loadAccount(sourcePublicKey)
		.then(function (account) {
			state.account = account;
		})
		.catch (function (e) {
			console.error(e);
			throw new axon.PaymentError({
				type: axon.enums.DESTINATION_ACCOUNT_ERROR,
				message: "Unable to connect with the destination account",
				contents: e
			});
		});
	};
	/**
	 *  Build the transaction and send through the network
	 */
	me.buildAndSend = function (state) {
		var transaction = new StellarSdk.TransactionBuilder(state.account)
			// Add a payment operation to the transaction
			.addOperation(StellarSdk.Operation.payment({
					destination: state.receiverPublicKey,
					asset: StellarSdk.Asset.native(),
					amount: "" + state.amount
				}))
			// Base extension payment
			.addOperation(StellarSdk.Operation.payment({
					destination: axon.config.baseAccount,
					asset: StellarSdk.Asset.native(),
					amount: "" + state.fee
				}))
			// Uncomment to add a memo (https://www.stellar.org/developers/learn/concepts/transactions.html)
			.addMemo(StellarSdk.Memo.text(me.payment.memoText))
			.build();

		// Sign this transaction with the secret key
		// NOTE: signing is transaction is network specific. Test network transactions
		// won't work in the public network. To switch networks, use the Network object
		// as explained above (look for StellarSdk.Network).
		transaction.sign(state.sourceKeypair);

		// Let's see the XDR (encoded in base64) of the transaction we just built
		console.log(transaction.toEnvelope().toXDR('base64'));

		// Submit the transaction to the Horizon server. The Horizon server will then
		// submit the transaction into the network for us.
		axon.changeIcon({
			timeout: 2000,
			icon: "assets/bank16_greenbackground.png"
		});
		return state.server.submitTransaction(transaction)
		.catch (function (e) {
			console.log('An error has occured:');
			console.log(e);
			throw new axon.PaymentError({
				type: axon.enums.TRANSACTION_ERROR,
				message: "An error occurred sending the transaction",
				contents: e
			});
		});
	};

	/**
	 *  Send a payment to a user
	 */
	me.sendPayment = (options) => {
		var receiver = options.account;
		var paymentState = {
			receiverPublicKey: receiver.key,
			receiverName: receiver.name,
			privateKey: options.privateKey,
			amount: options.amount
		};
		return me.calculateFee(paymentState)
		.then(() => {
			return me.loadAccount(paymentState);
		})
		.then(function () {
			return me.buildAndSend(paymentState);
		})
		.then(function (transactionResult) {
			console.log(JSON.stringify(transactionResult, null, 2));
			console.log('\nSuccess! View the transaction at: ');
			console.log(transactionResult._links.transaction.href);
			return paymentState;
		});
		// return me.getAccountSeed(paymentState)
		// .then(function () {
		// return me.getAmountToSend(paymentState);
		// })
		// .then(function () {
		// return me.loadAccount(paymentState);
		// })
		// .then(function () {
		// return me.buildAndSend(paymentState);
		// })
		// .then(function (transactionResult) {
		// console.log(JSON.stringify(transactionResult, null, 2));
		// console.log('\nSuccess! View the transaction at: ');
		// console.log(transactionResult._links.transaction.href);
		// return paymentState;
		// });
	};

};

Axon.register(function () {
	axon.financials = new axon.Financials();
});
