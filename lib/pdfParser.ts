import pdf from "pdf-parse";

// Accept buffer directly from uploaded file
export const parsePdf = async (buffer: Buffer): Promise<string> => {
  const data = await pdf(buffer);
  return data.text;
};

// Polyfill for server if needed
if (typeof window === "undefined") {
  (async () => {
    const { DOMParser } = await import("xmldom");
    globalThis.DOMParser = DOMParser;

    // @ts-expect-error: minimal partial polyfill for server libs
    globalThis.navigator = { userAgent: "node" };

    if (typeof globalThis.btoa === "undefined") {
      globalThis.btoa = (str: string) => Buffer.from(str).toString("base64");
    }
    if (typeof globalThis.atob === "undefined") {
      globalThis.atob = (b64: string) => Buffer.from(b64, "base64").toString("binary");
    }
  })();
}
