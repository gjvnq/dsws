// let active = false;

// function makeOrange(color: string): void {
//     document.body.style.backgroundColor = color;
// }

// chrome.action.onClicked.addListener((tab) => {
//     active = !active;
//     const color = active ? 'orange' : 'white';
//     chrome.scripting.executeScript({
//         target: {tabId: tab.id ? tab.id : -1},
//         func: makeOrange,
//         args: [color]
//     }).then();
// });

// chrome.browserAction.onClicked.addListener(function(tab)
// {
//     chrome.tabs.create({});
// });

// browser.browserAction.onClicked.addListener(function (e) {
//     console.log("hello!");
//     console.log(e);
// })

chrome.browserAction.onClicked.addListener(function (e: any) {
    chrome.tabs.create({ url: "/index.html" });
})

console.log(chrome);