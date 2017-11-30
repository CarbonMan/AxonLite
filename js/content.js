// content.js
// alert("Hello from your Chrome extension!")

var text = "hello";
chrome.runtime.onMessage.addListener(
    function(message, sender, sendResponse) {
		console.dir(message);
        switch(message.type) {
            case "getText":
                sendResponse(text);
            break;
        }
    }
);

/*
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
  debugger;
    if( request.message === "clicked_browser_action" ) {
      var firstHref = $("a[href^='http']").eq(0).attr("href");

      console.log(firstHref);
    }
  }
);
*/