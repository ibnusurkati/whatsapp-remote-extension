const getStoreWebpack = (modules: any) => {
  let foundCount = 0;
  let neededObjects: any = [
    { id: "Stream", conditions: (module: any) => (module.StreamInfo && module.StreamMode ? module.Stream : null) },
    { id: "Conn", conditions: (module: any) => (module.default && module.default.ref && module.default.refTTL ? module.default : module.Conn && module.Conn.ref && module.Conn.refTTL ? module.Conn : null) },
    { id: "WapQuery", conditions: (module: any) => (module.default && module.default.queryExist ? module.default : null) },
    { id: "CryptoLib", conditions: (module: any) => (module.decryptE2EMedia ? module : null) },
    { id: "FindChat", conditions: (module: any) => (module && module.findChat ? module : null) },
    { id: "SendTextMsgToChat", conditions: (module: any) => (module.sendTextMsgToChat ? module.sendTextMsgToChat : null) },
    { id: "UserConstructor", conditions: (module: any) => (module.default && module.default.prototype && module.default.prototype.isServer && module.default.prototype.isUser ? module.default : null) },
    {
      id: "DownloadManager",
      conditions: (module: any) => {
        return module.downloadManager ? module : null;
      },
    },
    {
      id: "getMeUser",
      conditions: (module: any) => {
        return module.getMeUser ? module.getMeUser : null;
      },
    },
    { id: "State", conditions: (module: any) => (module.STATE && module.STREAM ? module : null) },
  ];

  window.Store = {};

  for (let idx in modules) {
    if (typeof modules[idx] === "object" && modules[idx] !== null) {
      neededObjects.forEach((needObj: { conditions: (arg0: any) => any; foundedModule: any }) => {
        if (!needObj.conditions || needObj.foundedModule) {
          return;
        }

        let neededModule = needObj.conditions(modules[idx]);

        if (neededModule !== null) {
          foundCount++;
          needObj.foundedModule = neededModule;
        }
      });

      if (foundCount == neededObjects.length) {
        break;
      }
    }
  }

  let neededStore = neededObjects.find((needObj: { id: string }) => needObj.id === "Store");
  window.Store = neededStore.foundedModule ? neededStore.foundedModule : {};
  neededObjects.splice(neededObjects.indexOf(neededStore), 1);
  neededObjects.forEach((needObj: { foundedModule: any; id: string | number }) => {
    if (needObj.foundedModule) {
      window.Store[needObj.id] = needObj.foundedModule;
    }
  });
};

const getStoreRequired = () => {
  window.Store = {
    Stream: window.require("WAWebStreamModel").Stream,
    Conn: window.require("WAWebConnModel").Conn,
    Chat: window.require("WAWebChatCollection").ChatCollection,
    FindChat: window.require("WAWebFindChatAction"),
    SendTextMsgToChat: window.require("WAWebSendTextMsgChatAction").sendTextMsgToChat,
    DownloadManager: window.require("WAWebDownloadManager"),
    getMeUser: window.require("WAWebUserPrefsMeUser").getMeUser,
    WAWebWidFactory: window.require("WAWebWidFactory"),
  };
};

const onMessage = ({ data }: any) => {
  if (window.Store && window.Store) {
    if (data.type === "__wr_message_from_server__") {
      const msg = data.msg;
      upsertChat(msg.msg.to, function (chat: any) {
        chat.sendMessage(msg.msg.body.text);
      });
    }
  }
};

const upsertChat = function (id: string, cb: (chat: any) => void): void {
  let iu: string;
  let fcfn: (arg0: string) => Promise<any>;

  if (window.Store.FindChat && window.Store.FindChat.findChat) {
    fcfn = window.Store.FindChat.findChat;
    iu = jid(id);
  } else if (window.Store.FindChat && window.Store.FindChat.findOrCreateLatestChat) {
    fcfn = window.Store.FindChat.findOrCreateLatestChat;
    iu = window.Store.WAWebWidFactory.createWid(jid(id), { intentionallyUsePrivateConstructor: true });
  } else {
    fcfn = window.Store.Chat.find;
    iu = jid(id);
  }

  fcfn(iu)
    .then((chat: any) => {
      chat.sendMessage =
        chat.sendMessage ??
        function (this: any, e: any): Promise<any> {
          return window.Store.SendTextMsgToChat(this, ...arguments);
        };
      cb(chat);
    })
    .catch((fail: any) => {
      if (window.Store.UserConstructor) {
        const iu2 = new window.Store.UserConstructor(jid(id), { intentionallyUsePrivateConstructor: true });

        fcfn(iu2)
          .then((chat: any) => {
            chat.sendMessage =
              chat.sendMessage ??
              function (this: any, e: any): Promise<any> {
                return window.Store.SendTextMsgToChat(this, ...arguments);
              };
            cb(chat);
          })
          .catch((fail: any) => {
            window.Store.WapQuery.queryExist(jid(id))
              .then((contact: any) => {
                if (contact && contact.jid) {
                  const chat = window.Store.Chat.gadd(contact.jid);
                  chat.sendMessage =
                    chat.sendMessage ??
                    function (this: any, e: any): Promise<any> {
                      return window.Store.SendTextMsgToChat(this, ...arguments);
                    };
                  cb(chat);
                }
              })
              .catch((fail: any) => {
                // Handle error
              });
          });
      } else {
        const iu2 = window.Store.WAWebWidFactory.createWid(jid(id), { intentionallyUsePrivateConstructor: true });
        window.Store.Chat.gaddUp(iu2);

        fcfn(jid(id))
          .then((chat: any) => {
            chat.sendMessage =
              chat.sendMessage ??
              function (this: any, e: any): Promise<any> {
                return window.Store.SendTextMsgToChat(this, ...arguments);
              };
            cb(chat);
          })
          .catch((fail: any) => {
            // Handle error
          });
      }
    });
};

const jid = (id: string) => {
  return id.indexOf("@") < 0 ? id + "@c.us" : id;
};

const intervalScript = setInterval(function () {
  if (window.Store && window.Store["Chat"]) {
    window.addEventListener("message", onMessage);
    clearInterval(intervalScript);
    return;
  }
  if (!window.Store && document.querySelector("#side")) {
    if (typeof webpackJsonp === "function") {
      webpackJsonp([], { parasite: (x: any, y: any, z: any) => getStoreWebpack(z) }, ["parasite"]);
    } else if (typeof webpackChunkwhatsapp_web_client === "function" && Object.keys(webpackChunkwhatsapp_web_client).length > 0) {
      webpackChunkwhatsapp_web_client.push([
        ["parasite" + new Date().getTime()],
        {},
        function (o: any, e: any, t: any) {
          let modules = [];
          for (let idx in o.m) {
            let module = o(idx);
            modules.push(module);
          }
          getStoreWebpack(modules);
        },
      ]);
    } else if (typeof window.require == "function") {
      getStoreRequired();
    }
  }
}, 100);
