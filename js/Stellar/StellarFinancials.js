/**
 *  @file StellarFinancials.js
 *  @brief Plugin payment control for the Stellar network
 *  This file is requested by background.js according to the wallet.
 */

var Payment = Axon.prototype.Payment;

Payment.prototype.currency = "Lumens";
/**
 *  Base payment for the extension
 */
Payment.prototype.FIXED_MINIMUM_CHARGE = 0.05;
Payment.prototype.FIXED_BASIC_PERCENTAGE = 0.01;

/**
 *  Load our account
 */
Payment.prototype.loadAccount = function (state) {
	var me = this;
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
		throw new me.PaymentError({
			type: axon.enums.DESTINATION_ACCOUNT_ERROR,
			message: "Unable to connect with the destination account",
			contents: e
		});
	});
};

/**
 *  Build the transaction and send through the network
 */
Payment.prototype.buildAndSend = function (state) {
	var me = this;
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
		.addMemo(StellarSdk.Memo.text(me.paymentState.memoText))
		.build();

	// Sign this transaction with the secret key
	// NOTE: signing is transaction is network specific. Test network transactions
	// won't work in the public network. To switch networks, use the Network object
	// as explained above (look for StellarSdk.Network).
	transaction.sign(state.sourceKeypair);

	// Let's see the XDR (encoded in base64) of the transaction we just built
	console.log(transaction.toEnvelope().toXDR('base64'));

	// Submit the transaction to the Horizon server.
	axon.changeIcon({
		timeout: 2000,
		icon: "assets/bank16_greenbackground.png"
	});
	return state.server.submitTransaction(transaction)
	.catch (function (e) {
		console.log('An error has occured:');
		console.log(e);
		throw new me.PaymentError({
			type: axon.enums.TRANSACTION_ERROR,
			message: "An error occurred sending the transaction",
			contents: e
		});
	});
};

// Axon.prototype.Financials = function () {
// var me = this;
// me.currency = "Lumens";
// me.showWarning = true;
// me.networkTitle = "";

// /**
// *  Base payment for the extension
// */
// me.FIXED_MINIMUM_CHARGE = 0.05;
// me.FIXED_BASIC_PERCENTAGE = 0.01;

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
// .then(function (account) {
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
// amount: "" + state.fee
// }))
// .addMemo(StellarSdk.Memo.text(me.paymentState.memoText))
// .build();

// // Sign this transaction with the secret key
// // NOTE: signing is transaction is network specific. Test network transactions
// // won't work in the public network. To switch networks, use the Network object
// // as explained above (look for StellarSdk.Network).
// transaction.sign(state.sourceKeypair);

// // Let's see the XDR (encoded in base64) of the transaction we just built
// console.log(transaction.toEnvelope().toXDR('base64'));

// // Submit the transaction to the Horizon server.
// axon.changeIcon({
// timeout: 2000,
// icon: "assets/bank16_greenbackground.png"
// });
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
// };

//axon.financials = new axon.Financials();
