chrome.browserAction.onClicked.addListener(function (e: any) {
    chrome.tabs.create({ url: "/index.html" });
})