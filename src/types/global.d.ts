import { ContentScript } from "../content-script";

declare global {
  interface Window {
    WR: ContentScript;
    Store: any;
    require: (module: string) => any;
    webpackJsonp: any;
  }

  let WR = window.WR;
  let webpackJsonp = any;
  let webpackChunkwhatsapp_web_client = any;

  type MessageDataDTO = {
    type: string;
    to: string;
    text: string;
    latitude: number;
    longitude: number;
    file: string;
    caption: string;
    mimetype: string;
    fileName: string;
    contacts: {
      fullName: string;
      organization: string;
      phoneNumber: string;
    }[];
  };
}
