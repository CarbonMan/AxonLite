/**
 *  @file RedditPayments.js
 *  @brief Interface between the reddit screen and the Axon payments
 */
/**
 *  Goes through the user interface and looks for account matches
 */
function readUserInterface() {
	var accounts = [],
	accLocation = (axon.config.network === "public" ? "stellar_public_reddit" : "stellar_test_reddit"),
	netTitle = (axon.config.network === "public" ? "Public Stellar" : "Test Stellar"),
	accountStr = localStorage.getItem(accLocation);
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
								var me = this;
								event.preventDefault();
								//$(this).closest(".flat-list.buttons").find(".reply-button.login-required a")
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
										element: me,
										toAccount: account
									})
									.then(mB.close)
									.catch (mB.close);

								});
							});
						list.append(giftButton);
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
	var elm = options.element;
	return this.financials.sendPayment(options.toAccount)
	.then(function (state) {
		// Place a comment that a tip has been given. Have to find the reply button
		var replyA = $(elm).siblings(".reply-button.login-required").find("a");
		// jQuery replyA.click() didn't work.
		replyA[0].click();
		setTimeout(function () {
			// A reply comment can be found by
			var orgComment = $(elm).closest(".sitetable.nestedlisting");
			orgComment.find(".child .usertext-edit.md-container textarea")
			.text("Take a " + state.amount + " tip from me. You are Stellar!\n\n" +
				"----------------------------------------\n" +
				"Via the *Axon Lite Stellar extension*\n\n" +
				"[Github](https://github.com/CarbonMan/AxonLite)");
		}, 500);
	})
	.catch (function (err) {
		console.log(err);
		if (err.type && err.type != axon.enums.USER_CANCELLED) {
			if (err.message)
				alert(err.message);
			}
		});
};

