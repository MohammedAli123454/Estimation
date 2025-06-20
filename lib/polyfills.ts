// Only polyfill on server
if (typeof window === "undefined") {
  (async () => {
    const { DOMParser } = await import("xmldom");
    globalThis.DOMParser = DOMParser;

    // @ts-expect-error: minimal navigator polyfill for Node.js
    globalThis.navigator = { userAgent: "node" };

    if (typeof globalThis.btoa === "undefined") {
      globalThis.btoa = (str: string) => Buffer.from(str).toString("base64");
    }
    if (typeof globalThis.atob === "undefined") {
      globalThis.atob = (b64: string) => Buffer.from(b64, "base64").toString("binary");
    }
  })();
}
