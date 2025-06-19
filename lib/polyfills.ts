// Only polyfill on server
if (typeof window === "undefined") {
  globalThis.DOMParser = require("xmldom").DOMParser;
  globalThis.navigator = { userAgent: "node" } as any;
  if (typeof btoa === "undefined") {
    globalThis.btoa = (str) => Buffer.from(str).toString("base64");
  }
  if (typeof atob === "undefined") {
    globalThis.atob = (b64) => Buffer.from(b64, "base64").toString("binary");
  }
}
