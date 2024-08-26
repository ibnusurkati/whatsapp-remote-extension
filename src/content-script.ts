/* The code snippet is setting up an EventSource connection to the specified URL
"https://api.whatspi.id/wascrap/events". The `EventSource` interface is used for receiving
server-sent events from a server over a HTTP connection. */
const eventSourceUrl = "https://api.whatspi.id/wascrap/events";
var eventSource: EventSource;

class ContentScript {
  constructor() {
    this.injectScript();
    this.onMessage();
  }

  injectScript(): void {
    try {
      (function () {
        var res = document.createElement("script");
        res.src = chrome.runtime.getURL("client.js");
        (document.head || document.documentElement).appendChild(res);
      })();
    } catch (err) {
      console.error(err);
    }
  }

  onMessage(): void {
    eventSource = new EventSource(eventSourceUrl);

    eventSource.onmessage = (event) => {
      window.postMessage({ from: "__wr_message_from_server__", msg: JSON.parse(event.data) }, "*");
    };

    eventSource.onerror = function (error) {
      if (eventSource.readyState === EventSource.CLOSED) {
        setTimeout(() => {
          eventSource = new EventSource(eventSourceUrl);
        }, 3000);
      }
    };

    eventSource.onopen = function () {
      console.log("Connection opened.");
    };
  }
}

/* The code `chrome.runtime.sendMessage({ method: "_wr_settings" }, function (_) {
  window.WR = new ContentScript();
});` is sending a message to the background script of a Chrome extension. The message contains an
object with a `method` property set to `"_wr_settings"`. */
chrome.runtime.sendMessage({ method: "__wr_settings__" }, function (_) {
  window.WR = new ContentScript();
});
