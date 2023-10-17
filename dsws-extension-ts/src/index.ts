var DswsFilename: String = "";

// var port = chrome.runtime.connect({name: "dsws-frontend"});

document.addEventListener('DOMContentLoaded', function() {
    console.log("Hello2");
    const el = document.getElementById("dsws-file-input") as HTMLInputElement;
    el.disabled = false;
    el.addEventListener('change', async (e) => {
        console.log("Hello3a");
        console.log(e);
        let file = el.files!.item(0);
        DswsFilename = file!.name;
        console.log('file', file);
        // process_zip(file!);
        // chrome.runtime.sendMessage({'action': 'openDswsFile', 'file': file, 'buf': buf});
        (navigator as Navigator).serviceWorker!.controller!.postMessage({'action': 'openDswsFile', 'file': file})
    })
});

(navigator as Navigator).serviceWorker.addEventListener('message', (event) => {
    // event is a MessageEvent object
    console.log(`The service worker sent me a message: ${event.data}`);
    const message = event.data;
    if (message.event == 'dswsReady') {
        const url = chrome.runtime.getURL(DswsFilename+"/");
        console.log(url);
        const el = document.getElementById("main-iframe") as HTMLIFrameElement;
        el.src = url;
    }
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('onMessage', message, sender, sendResponse);
    if (message.event == 'dswsReady') {
        const url = chrome.runtime.getURL(DswsFilename+"/");
        console.log(url);
        const el = document.getElementById("main-iframe") as HTMLIFrameElement;
        el.src = url;
        // chrome.runtime.sendMessage({'action': 'getBlobForUrl', 'url': '/', dsws_filename: DswsFilename}, async (reply) => {
        //     const el = document.getElementById("main-iframe") as HTMLIFrameElement;
        //     // console.log("got reply", reply);
        //     // const url = URL.createObjectURL(reply);
        //     // console.log(url);
        //     // el.src = url;
        // });
    }
});