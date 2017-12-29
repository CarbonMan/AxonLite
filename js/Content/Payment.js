/**
 *  @file Payment.js
 *  @brief Controls the processing of a payment
 *  various payment processors can be attached through the axon.Payment hook
 */

var Payment = Axon.prototype.Payment = function(){
	var me = this;
	// This is the payment state
	me.paymentState = {
		title: "",
		amount: 0,
		networkTitle: ""
	};

/**
 *  The popup message body is replaceable
 */
Object.defineProperty(this, 'popupBody', {
	get: () => {
		return (me.paymentState.title ? "Send from " + me.paymentState.title + "<br/>" : "") +
		'Memo text (28 characters)<br/> \
		<input class="axonInput" type="text" id="transactionMemo" placeholder="Memo..." >  \
		<br/><br/>';
	}
});

};
 
Payment.prototype.PaymentError = function (options) {
	if (typeof options == "number") {
		this.type = options;
		this.message = "";
		this.contents = options.contents || {};
	} else {
		this.type = options.type;
		this.message = options.message || "";
		this.contents = options.contents || {};
	}
};

Payment.prototype.PaymentError.prototype = new Error;

/**
 *  Get the active account (if there is one)
 */
Payment.prototype.getAccount = () => {
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

Payment.prototype.calculateFee = function (state) {
	var me = this;
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
			return reject(new me.PaymentError(axon.enums.USER_CANCELLED));
		});

		$("#axonOK").click(function () {
			mB.close();
			setTimeout(() => {
				resolve();
			}, 0);
		});

	});
};

/**
 *  Send a payment to a user
 */
Payment.prototype.sendPayment = function(options){
	var me = this;
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
};

/**
 *  Make a payment
 */
Payment.prototype.manualPayment = function(opts){
	var me = this;
	var p = new Promise((resolve, reject) => {
			// payment is the state object for the pending transaction
			console.log("Send", me.currency);
			me.getAccount()
			.then((account) => {
				if (account) {
					me.paymentState.privateKey = account.privateKey;
					me.paymentState.title = account.title;
				} else {
					var privateKey = prompt("Enter your account private key (empty=CANCEL): ", "your key");
					if (!privateKey)
						return reject(new me.PaymentError(axon.enums.USER_CANCELLED));
					me.paymentState.privateKey = privateKey;
					me.paymentState.title = "";
				}
				var contentBody = me.popupBody;
				var content = "Send " + me.currency + " to " + opts.to +
					'<br/> \
					<b>No keys are stored on this computer or on our servers</b><br/> \
					This application is protected against key theft<br/> \
					<br/><br/>';
				var contentFooter = 'Amount to send \
					<input class="axonInput" type="text" id="amountToSend" placeholder="Amount..." >  \
					<br/><br/>  \
					<div style="margin: 0 auto; text-align: center;">  \
					<button id="axonOK" class="axon_ok_button">PROCEED</button>&nbsp; \
					<button id="axonClose" class="axon_close_button">CLOSE</button>  \
					</div> ';
				var mB = new axon.Modal({
						title: ' Send a payment on the ' + axon.networkTitle + ' network ',
						description: content + contentBody + contentFooter,
						height: '350',
						width: '400'
					});
				$("#axonClose").click(function () {
					mB.close();
					reject();
				});

				$("#axonOK").click(function () {
					var amountStr = $("#amountToSend").val();
					me.paymentState.amount = parseFloat(amountStr);
					if (isNaN(me.paymentState.amount) || !me.paymentState.amount) {
						alert(axon.i18n("Invalid amount"));
						return;
					}
					me.preSendTransaction();
					mB.close();
					setTimeout(() => {
						resolve(me.paymentState);
					}, 0);
				});
			});
		});
	return p;
};
