"use client";
import React, { useState } from "react";
import { BarLoader } from "react-spinners";

type TableRow = {
  ["Sl No"]?: string;
  ["Item Description"]?: string;
  ["Qty"]?: string;
  ["UOM"]?: string;
  ["Remarks"]?: string;
};

export default function ExtractTablePage() {
  const [table, setTable] = useState<TableRow[]>([]);
  const [moc, setMoc] = useState("");
  const [rawText, setRawText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError("");
    setTable([]);
    setMoc("");
    setRawText("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract-mto", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setRawText(data.modelOutput ?? "");
        throw new Error(data.error || "Failed to extract table from PDF");
      }

      setTable(data.table);
      setMoc(data.moc || "");
    } catch (err: any) {
      setError(err.message || "An error occurred during extraction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">PDF Table Extraction (OpenAI)</h1>
      <div className="mb-6">
        <label className="block mb-2 font-medium">
          Upload PDF:
          <input
            type="file"
            accept="application/pdf"
            onChange={handleUpload}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={isLoading}
          />
        </label>
      </div>
      {/* Show loader when loading */}
      {isLoading && (
        <div className="flex flex-col items-center mb-4 p-4">
          <BarLoader color="#2563eb" height={5} width={200} />
          <span className="mt-2 text-blue-700">Processing PDF and extracting table...</span>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      {/* Show MOC# if found */}
      {moc && (
        <div className="mb-4 p-2 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded">
          <span className="font-semibold">MOC#:</span> {moc}
        </div>
      )}
      {table.length > 0 && (
        <>
          <div className="mb-4">
            <p className="text-green-600 font-medium">
              Successfully extracted {table.length} rows.
            </p>
          </div>
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-4 py-2 text-left">Sl No</th>
                  <th className="border px-4 py-2 text-left">Item Description</th>
                  <th className="border px-4 py-2 text-left">Qty</th>
                  <th className="border px-4 py-2 text-left">UOM</th>
                  <th className="border px-4 py-2 text-left">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 align-top">{row["Sl No"]}</td>
                    <td className="border px-4 py-2 align-top">{row["Item Description"]}</td>
                    <td className="border px-4 py-2 align-top">{row["Qty"]}</td>
                    <td className="border px-4 py-2 align-top">{row["UOM"]}</td>
                    <td className="border px-4 py-2 align-top">{row["Remarks"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {rawText && (
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-2">Model Raw Output</h2>
          <div className="bg-gray-50 p-4 rounded border max-h-96 overflow-auto">
            <pre className="whitespace-pre-wrap text-sm">{rawText}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
