chrome.browserAction.onClicked.addListener(function (e: any) {
    chrome.tabs.create({ url: "/index.html" });
})

async function register_worker() {
    console.log("registering worker");
    if ("serviceWorker" in navigator) {
        try {
            const registration = await navigator.serviceWorker.register("/dsws_worker.js", {
                scope: "/",
            });
            if (registration.installing) {
                console.log("Service worker installing");
            } else if (registration.waiting) {
                console.log("Service worker installed");
            } else if (registration.active) {
                console.log("Service worker active");
            }
        } catch (error) {
            console.error(`Registration failed with ${error}`);
        }
    }
}

register_worker();