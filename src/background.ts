/* This code snippet is an event listener that listens for updates on Chrome tabs. When a tab is
updated, it checks if the status of the update is "complete" and if the URL of the tab matches the
pattern for WhatsApp web (https://web.whatsapp.com). If these conditions are met, it executes a
content script on the tab. */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && /^https:\/\/web.whatsapp.com/.test(tab?.url ?? "")) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId, allFrames: false },
        func: function () {
          return window.WR;
        },
      },
      function (ir) {
        if (ir && ir.length && ir[0].result == null) {
          validate((auth) => {
            if (auth) {
              chrome.scripting
                .executeScript({
                  target: { tabId: tabId, allFrames: false },
                  files: ["./content-script.js"],
                })
                .catch((err) => console.error(err));
            }
          });
        }
      }
    );
  }
});

/* This code snippet is setting up a message listener using `chrome.runtime.onMessage.addListener`.
When a message is received, it checks if the message has a property `method` with the value
`"_wr_settings"`. If this condition is met, it calls the `validate` function with a callback that
checks if `auth` is true. If `auth` is true, it then retrieves items from the local storage using
`chrome.storage.local.get` and sends the items back as a response using the `sendResponse` function. */
chrome.runtime.onMessage.addListener(function (request, _, sendResponse) {
  if (request.method == "__wr_settings__") {
    validate((auth) => {
      if (auth) {
        chrome.storage.local.get(null, function (items) {
          sendResponse(items);
        });
      }
    });
  }
  return true;
});

const validate = (cb: (auth: boolean) => void) => {
  chrome.storage.local
    .get(["credentials"])
    .then(({ credentials }) => {
      if (credentials) cb ? cb(true) : void 0;
    })
    .catch(() => {
      cb ? cb(false) : void 0;
    });
};
