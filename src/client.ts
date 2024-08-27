const injectScript = () => {
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

const onMessage = ({ data: { from, msg } }: MessageEvent<{ from: string; msg: MessageDataDTO }>) => {
  if (from === "__wr_message_from_server__") {
    upsertChat(msg, (chat: any) => {
      switch (msg.type) {
        case "text":
          chat.sendMessage(msg.text);
          break;
        case "location":
          chat.sendMessage(msg.text);
          break;
      }
    });
  }
};

const upsertChat = (msg: MessageDataDTO, callback: (chat: any) => void) => {
  let idUser: any;
  let findContact: (arg: any) => Promise<any>;

  if (window.Store.FindChat && window.Store.FindChat.findChat) {
    findContact = window.Store.FindChat.findChat;
    idUser = jid(msg.to);
  } else if (window.Store.FindChat && window.Store.FindChat.findOrCreateLatestChat) {
    findContact = window.Store.FindChat.findOrCreateLatestChat;
    idUser = window.Store.WAWebWidFactory.createWid(jid(msg.to), { intentionallyUsePrivateConstructor: true });
  } else {
    findContact = window.Store.Chat.find;
    idUser = jid(msg.to);
  }

  findContact(idUser)
    .then((chat: any) => {
      chat = chatSendMessage(chat);
      callback(chat);
    })
    .catch((_: any) => {
      if (window.Store.UserConstructor) {
        const idUser2 = new window.Store.UserConstructor(jid(msg.to), { intentionallyUsePrivateConstructor: true });

        findContact(idUser2)
          .then((chat: any) => {
            chat = chatSendMessage(chat);
            callback(chat);
          })
          .catch((_: any) => {
            window.Store.WapQuery.queryExist(jid(msg.to))
              .then((contact: any) => {
                if (contact && contact.jid) {
                  let chat = window.Store.Chat.gadd(contact.jid);
                  chat = chatSendMessage(chat);
                  callback(chat);
                }
              })
              .catch((_: any) => {});
          });
      } else {
        const idUser2 = window.Store.WAWebWidFactory.createWid(jid(msg.to), { intentionallyUsePrivateConstructor: true });
        window.Store.Chat.gaddUp(idUser2);
        findContact(jid(msg.to))
          .then((chat: any) => {
            chat.sendMessage =
              chat.sendMessage ??
              function (this: any, e: any): Promise<any> {
                return window.Store.SendTextMsgToChat(this, ...arguments);
              };
            callback(chat);
          })
          .catch((_: any) => {});
      }
    });
};

const jid = (id: string) => {
  return id.indexOf("@") < 0 ? id + "@c.us" : id;
};

const chatSendMessage = (chat: any): any => {
  chat.sendMessage =
    chat.sendMessage ??
    function (this: any, e: any): Promise<any> {
      return window.Store.SendTextMsgToChat(this, ...arguments);
    };
  return chat;
};

const intervalInjectScript = setInterval(function () {
  if (window.Store && window.Store["Chat"]) {
    window.addEventListener("message", onMessage);
    clearInterval(intervalInjectScript);
    return;
  }
  if (!window.Store && document.querySelector("#side")) injectScript();
}, 1000);
