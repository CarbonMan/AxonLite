/**
 *  @file RedditPayments.js
 *  @brief Interface between the reddit screen and the Axon payments
 */
Axon.currentPage = "Reddit";
Axon.accounts = [];

/**
 *  Goes through the user interface and looks for account matches
 */
function readUserInterface() {
	var accounts = [],
	accLocation = (axon.config.network === "public" ? "stellar_public_reddit" : "stellar_test_reddit"),
	netTitle = (axon.config.network === "public" ? "Public" : "Test"),
	accountStr = localStorage.getItem(accLocation);
	if (accountStr) {
		//console.log("Account details found");
		Axon.accounts = JSON.parse(accountStr);
	}
	chrome.runtime.sendMessage({
		type: "GetContacts",
		filter: Axon.currentPage
	},
		(entries) => {
			//console.log("Contacts received", entries);
			entries.forEach( (el)=>{
				Axon.accounts.push(el);
			});
	});
	console.log("Contacts", Axon.accounts);
	applyAccounts();
}

function applyAccounts(){
	$(".comment").each(function (i) {
		var name = $(this).attr("data-author");
		for (var i in Axon.accounts) {
			if (Axon.accounts[i].name == name) {
				((account) => {
					// Lists can be nested only the first one is wanted.
					var list = $(this).find(".flat-list.buttons:first");
					// Get the url for this comment
					var embed = list.find('.bylink:first');
					// The style="cursor: pointer" is required b/c of the contained li
					var a = '<a style="cursor: pointer" data-inbound-url="' + embed.attr("data-inbound-url") + '">';
					var giftButton = $('<li>' + a + 'Lumens</li></a>').click(function (event) {
							var me = this;
							event.preventDefault();
							console.log("Give lumens");
							var content = "Send Lumens to " + name +
								"<br/>" +
								"<b>No keys are stored on this computer or on our servers</b><br/>" +
								"This application is protected against key theft<br/>" +
								"<br/><br/>" +
								"<div style='margin: 0 auto; text-align: center;'>" +
								"<button id='axonOK' class='axon_ok_button'>PROCEED</button>&nbsp;" +
								"<button id='axonClose' class='axon_close_button'>CLOSE</button>" +
								"</div>";
							var mB = new axon.Modal({
									/* top: event.pageY - 100, */
									title: 'Send a payment on the ' + netTitle + ' network',
									description: content,
									height: '150',
									width: '400'
								});
							$("#axonClose").click(function () {
								mB.close();
							});
							$("#axonOK").click(function () {
								mB.close();
								setTimeout( ()=>{
									var noop = () => {};
									axon.sendTipFromLink({
										element: me,
										toAccount: account
									})
									.then( noop )
									.catch (noop);
								}, 0);
								//.then(mB.close)
								//.catch (mB.close);

							});
						});
					list.append(giftButton);
				})(Axon.accounts[i]);
			}
		}
	});
}

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

// Execute when ready
Axon.register(readUserInterface);
