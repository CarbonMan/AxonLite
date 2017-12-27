/**
 *  @file Payment.js
 *  @brief Controls the processing of a payment
 *  various payment processors can be attached through the axon.financials hook
 */
Axon.prototype.PaymentError = function (options) {
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

Axon.prototype.PaymentError.prototype = new Error;

/**
 *  Make a payment
 */
Axon.prototype.manualPayment = (opts) => {
	var p = new Promise((resolve, reject) => {
			// payment is the state object for the pending transaction
			var payment = axon.financials.payment = {
				amount: 0
			};
			console.log("Send", axon.financials.currency);
			axon.financials.getAccount()
			.then((account) => {
				if (account){
					payment.privateKey = account.privateKey;
					payment.title = account.title;
				}else{
					var privateKey = prompt("Enter your account private key (empty=CANCEL): ", "your key");
					if (!privateKey)
						return reject(new axon.PaymentError(axon.enums.USER_CANCELLED));
					payment.privateKey = privateKey;
					payment.title = "";

					// contentBody = 'Account private key \
					// < input class="axonInput" type="text" id="axonPrivateKey" placeholder="Amount..." >  \
					// <br/>  <br/> ';
				}
				var contentBody = axon.financials.popupBody;
				var content = "Send " + axon.financials.currency + " to " + opts.to +
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
					payment.amount = parseFloat(amountStr);
					if (isNaN(payment.amount) || !payment.amount) {
						alert(axon.i18n("Invalid amount"));
						return;
					}
					axon.financials.preSendTransaction();
					mB.close();
					setTimeout(() => {
						resolve(payment);
					}, 0);
				});
			});
		});
	return p;
};
