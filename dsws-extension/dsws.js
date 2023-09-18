if (typeof InstallTrigger !== 'undefined')
{
	browser.browserAction.onClicked.addListener(() => {
	    let creating = browser.tabs.create({
	      url: "/dsws-app/index.html",
	    });
	  });
 } else 
 {
	chrome.browserAction.onClicked.addListener(function(activeTab) {
		chrome.tabs.create({ url: "/dsws-app/index.html" });
	});
 }
