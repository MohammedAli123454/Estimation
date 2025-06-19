import pdf from "pdf-parse";

// Accept buffer directly from uploaded file
export const parsePdf = async (buffer: Buffer): Promise<string> => {
  const data = await pdf(buffer);
  return data.text;
};

// Polyfill for server if needed
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
