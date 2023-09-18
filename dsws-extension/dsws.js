browser.browserAction.onClicked.addListener(() => {
    let creating = browser.tabs.create({
      url: "home.html",
    });
    creating.then(onCreated, onError);
  });