/**
 *  @file GithubAccounts.js
 *  @brief Collect the name and account details from the Reddit screen
 *  see https://www.reddit.com/r/AxonLite/comments/7gulbo/register_your_test_stellar_key/
 *  or
 *  https://www.reddit.com/r/AxonLite/comments/7gko2t/register_your_public_stellar_key/
 */

console.log("RedditAccounts.js loaded");
function gatherAccounts(){
	var accounts = [];
	$(".comment").each(function(i){ 
		var name = $(this).attr("data-author");
		var publicKey = $(this).find(".md p").text();
		var exists = accounts.some(function(a) {
			if (a.name === name){
				// Update the account key
				a.key = publicKey;
				return true;
			} else
				return false;
		});
		if (!exists){
			var account = {name: name, key: publicKey};
			accounts.push(account);
			console.log( account.name, account.key );
		}
	});
	if (location.href.endsWith("register_your_test_stellar_key/"))
		localStorage.setItem("stellar_test_reddit",  JSON.stringify(accounts));
	else
		localStorage.setItem("stellar_public_reddit",  JSON.stringify(accounts));
	var mB = new axon.Modal({
		title: axon.i18n("Accounts registered"),
		description: accounts.length + " " + axon.i18n("accounts registered"),
		height: '100',
		width: '200'
	});
	setTimeout( ()=>{
		mB.close();
	}, 2500);
	//alert(accounts.length + " accounts registered");
}

Axon.register(gatherAccounts);
//setTimeout(gatherAccounts, 500);
