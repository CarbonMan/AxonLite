/**
 *  @file FacebookPayments.js
 *  @brief Interface between the reddit screen and the Axon payments
 */
 
/**
 *  Goes through the user interface and looks for account matches
 */
function readUserInterface() {
	var accounts = [],
	accLocation = (axon.config.network === "public" ? "stellar_public_facebook" : "stellar_test_facebook"),
	netTitle = (axon.config.network === "public" ? "Public Stellar" : "Test Stellar"),
	accountStr = localStorage.getItem(accLocation);
	console.log("micropayments.js loaded");
	if (accountStr) {
		console.log("Account details found");
		accounts = JSON.parse(accountStr);
		console.dir(accounts);
		var elements = document.getElementsByClassName("UFICommentActorName");
		[].forEach.call(elements, function (el) {
			var name = el.text;
			for (var i in accounts) {
				if (accounts[i].name == name) {
					((account) => {
						// Lists can be nested only the first one is wanted.
						var block = $(el).closest(".UFICommentContentBlock");
						// Get the url for this comment
						var embed = block.find('.UFICommentActions');
						var giftButton = $('<a>Lumens</a>')
						.click(function (event) {
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
									// Get the reply textbox
									var comment = block.closest(".UFIComment");
									var textbox = comment.parent().find(".UFIReplyList .UFIAddComment")
									axon.sendTipFromLink({
										element: me,
										toAccount: account
									})
									.then(mB.close)
									.catch (mB.close);

								});
							});
						embed.append(giftButton);
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
	return axon.sendPayment(options.toAccount)
	.then(function (state) {
		// Getting to the FB reply area was
		// Place a comment that a tip has been given. Have to find the reply textbox
		var text = "Take a " + state.amount + " tip from me. You are Stellar!\n\n" +
				"----------------------------------------\n" +
				"Via the Axon Lite Stellar extension\n\n" +
				"Find us at Github https://github.com/CarbonMan/AxonLite";
		if (copyTextToClipboard(text)){
			alert("A message has been placed in your clipboard\n"+
				"Paste it into the comment reply box");
		}else{
			alert("Sorry I couldn't put a personalized message in your clipboard");
		}
	})
	.catch (function (err) {
		console.log(err);
		if (err.type && err.type != axon.enums.USER_CANCELLED) {
			if (err.message)
				alert(err.message);
			}
		});
};


/**
 *  See https://stackoverflow.com/a/30810322/529273
 */
function copyTextToClipboard(text){
  var textArea = document.createElement("textarea");

  //
  // *** This styling is an extra step which is likely not required. ***
  //
  // Why is it here? To ensure:
  // 1. the element is able to have focus and selection.
  // 2. if element was to flash render it has minimal visual impact.
  // 3. less flakyness with selection and copying which **might** occur if
  //    the textarea element is not visible.
  //
  // The likelihood is the element won't even render, not even a flash,
  // so some of these are just precautions. However in IE the element
  // is visible whilst the popup box asking the user for permission for
  // the web page to copy to the clipboard.
  //

  // Place in top-left corner of screen regardless of scroll position.
  textArea.style.position = 'fixed';
  textArea.style.top = 0;
  textArea.style.left = 0;

  // Ensure it has a small width and height. Setting to 1px / 1em
  // doesn't work as this gives a negative w/h on some browsers.
  textArea.style.width = '2em';
  textArea.style.height = '2em';

  // We don't need padding, reducing the size if it does flash render.
  textArea.style.padding = 0;

  // Clean up any borders.
  textArea.style.border = 'none';
  textArea.style.outline = 'none';
  textArea.style.boxShadow = 'none';

  // Avoid flash of white box if rendered for any reason.
  textArea.style.background = 'transparent';


  textArea.value = text;

  document.body.appendChild(textArea);

  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copying text command was ' + msg);
  } catch (err) {
    console.log('Oops, unable to copy');
  }

  document.body.removeChild(textArea);
}
