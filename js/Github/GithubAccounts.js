/**
 *  @file GithubAccounts.js
 *  @brief Collect the name and account details from the Github screen
 *  see https://github.com/CarbonMan/AxonLite/issues/1
 *  or
 *  https://github.com/CarbonMan/AxonLite/issues/2
 */
console.log("GithubAccounts.js loaded");
function gatherAccounts(){
	var accounts = [];
	$(".comment").each(function(i, elm){ 
		// The first is the Github issue
		if (!i) return;
		// The rest are comments on the issue
		var $author = $(elm).find(".author");
		if (!$author.length) return;
		var name = $author.text();
		var publicKey = $author.closest(".comment").find("td.comment-body p").text();
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
	if (location.href.endsWith("/1"))
		localStorage.setItem("stellar_test_github",  JSON.stringify(accounts));
	else
		localStorage.setItem("stellar_public_github",  JSON.stringify(accounts));
	alert(accounts.length + " accounts registered");
}

setTimeout(gatherAccounts, 500);
