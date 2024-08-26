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
}
