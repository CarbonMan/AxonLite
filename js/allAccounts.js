console.log("allAccounts.js loaded");
function gatherAccounts(){
	var accounts = [];
	$(".comment").each(function(i){ 
		var name = $(this).attr("data-author");
		var exists = accounts.some(function(a) {
			return a.name === name;
		});
		if (!exists){
			var account = {name: name, key: $(this).find(".md p").text()};
			accounts.push(account);
			console.log( account.name, account.key );
		}
	});
	localStorage.setItem("stellar_accounts",  JSON.stringify(accounts));
	alert("Accounts registered");
}

setTimeout(gatherAccounts, 500);
