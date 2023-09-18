browser.browserAction.onClicked.addListener(() => {
    let creating = browser.tabs.create({
      url: "https://example.org",
    });
    creating.then(onCreated, onError);
  });
  