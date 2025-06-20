"use client";
import React, { useState } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { BarLoader } from "react-spinners";

type TableRow = {
  ["Sl No"]?: string;
  ["Item Description"]?: string;
  ["SIZE"]?: string;
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

  // PDF Upload handler (your API code remains the same)
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
    } catch (err: unknown) {
      if (err && typeof err === "object" && "message" in err) {
        setError((err as { message?: string }).message || "An error occurred during extraction");
      } else {
        setError("An error occurred during extraction");
      }
    } finally {
      setIsLoading(false);
    }

  };

  // --- ExcelJS Export ---
  const handleExportExcel = async () => {
    if (!table.length) return;
  
    // Prepare custom heading text
    const firstRowText = `COMMERCIAL PROPOSAL FOR MOC# ${moc || ""}`;
  
    const headers = [
      "Item No.",
      "Description",
      "SIZE",
      "Unit",
      "Required QTY",
      "Unit Rate (SAR)",
      "Amount (SAR)"
    ];
    const staticRows = [
      ["", "PROCUREMENT", "", "", "", "", ""],
      ["", "MATERIAL UNIT RATES", "", "", "", "", ""],
      ["", "PIPING", "", "", "", "", ""]
    ];
    const tableRows = table.map(row => [
      "", // Item No.
      (row["Item Description"] ?? "").replace(/[\r\n]+/g, " "),
      row["SIZE"] ?? "",
      row["UOM"] ?? "",
      row["Qty"] ?? "",
      "",
      ""
    ]);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("MTO Table", { properties: { tabColor: { argb: "FF92D050" } } });
  
    // Set zoom to 115%
    worksheet.views = [{ state: "normal", zoomScale: 115 }];
  
    // 1. Add custom heading as first row
    worksheet.addRow([firstRowText]);
    // Merge all 7 columns (A1:G1)
    worksheet.mergeCells(1, 1, 1, 7);
    // Style heading row
    const headingRow = worksheet.getRow(1);
    headingRow.getCell(1).font = { name: "Arial", size: 14, bold: true };
    headingRow.getCell(1).alignment = { vertical: "middle", horizontal: "center", wrapText: true };
    headingRow.height = 28;
  
    // 2. Add header
    worksheet.addRow(headers);
  
    // 3. Add static rows
    staticRows.forEach(row => worksheet.addRow(row));
  
    // 4. Add data
    tableRows.forEach(row => worksheet.addRow(row));
  
    // 5. Set column widths
    worksheet.columns = [
      { width: 12 },
      { width: 60 },
      { width: 14 },
      { width: 10 },
      { width: 16 },
      { width: 18 },
      { width: 18 },
    ];
  
    // --- Header formatting (now row 2!)
    const headerRow = worksheet.getRow(2);
    headerRow.eachCell(cell => {
      cell.font = { name: "Arial", size: 11, bold: true };
      cell.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFD9D2E9" }
      };
      cell.border = {
        top:    { style: "thin", color: { argb: "FF000000" } },
        left:   { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right:  { style: "thin", color: { argb: "FF000000" } }
      };
    });
    headerRow.height = 25;
  
    // --- Static rows (now rows 3, 4, 5)
    const procurementRow = worksheet.getRow(3);
    procurementRow.getCell(2).font = { name: "Arial", size: 11, bold: true };
    procurementRow.getCell(2).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFFF00" }
    };
    procurementRow.eachCell(cell => {
      cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
      cell.border = {
        top:    { style: "thin", color: { argb: "FF000000" } },
        left:   { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right:  { style: "thin", color: { argb: "FF000000" } }
      };
    });
    procurementRow.height = 20;
  
    const materialUnitRow = worksheet.getRow(4);
    materialUnitRow.getCell(2).font = { name: "Arial", size: 11, bold: true };
    materialUnitRow.eachCell(cell => {
      cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
      cell.border = {
        top:    { style: "thin", color: { argb: "FF000000" } },
        left:   { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right:  { style: "thin", color: { argb: "FF000000" } }
      };
    });
    materialUnitRow.height = 20;
  
    const pipingRow = worksheet.getRow(5);
    pipingRow.getCell(2).font = { name: "Arial", size: 11, bold: true, italic: true };
    pipingRow.getCell(2).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFEAD1C2" }
    };
    pipingRow.eachCell(cell => {
      cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
      cell.border = {
        top:    { style: "thin", color: { argb: "FF000000" } },
        left:   { style: "thin", color: { argb: "FF000000" } },
        bottom: { style: "thin", color: { argb: "FF000000" } },
        right:  { style: "thin", color: { argb: "FF000000" } }
      };
    });
    pipingRow.height = 20;
  
    // --- Data rows formatting (now from row 6 onwards)
    for (let r = 6; r <= worksheet.rowCount; r++) {
      const row = worksheet.getRow(r);
  
      // Estimate height only for data rows (skip static)
      if (r > 5) {
        const desc = row.getCell(2).value?.toString() || "";
        const descWidth = worksheet.getColumn(2).width || 60;
        const charsPerLine = Math.floor(descWidth * 1.5);
        const numLines = Math.ceil(desc.length / charsPerLine) || 1;
        row.height = Math.max(20, numLines * 15); // minimum 20, else grow
      }
  
      row.eachCell((cell, colNumber) => {
        cell.font = { name: "Arial", size: 11 };
        cell.alignment = { vertical: "top", horizontal: colNumber === 2 ? "left" : "center", wrapText: true };
        cell.border = {
          top:    { style: "thin", color: { argb: "FF000000" } },
          left:   { style: "thin", color: { argb: "FF000000" } },
          bottom: { style: "thin", color: { argb: "FF000000" } },
          right:  { style: "thin", color: { argb: "FF000000" } }
        };
      });
    }
  
    // Save file
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), "Extracted-MTO-Table.xlsx");
  };
  
  

  // --- Render ---
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
      {/* Loader */}
      {isLoading && (
        <div className="flex flex-col items-center mb-4 p-4">
          <BarLoader color="#2563eb" height={5} width={200} />
          <span className="mt-2 text-blue-700">Processing PDF and extracting table...</span>
        </div>
      )}
      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
      {/* MOC# */}
      {moc && (
        <div className="mb-4 p-2 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded">
          <span className="font-semibold">MOC#:</span> {moc}
        </div>
      )}
      {/* Excel Export Button */}
      {table.length > 0 && (
        <div className="mb-4 flex flex-row items-center justify-between">
          <p className="text-green-600 font-medium">
            Successfully extracted {table.length} rows.
          </p>
          <button
            onClick={handleExportExcel}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded shadow transition"
          >
            Export to Excel
          </button>
        </div>
      )}
      {/* Table */}
      {table.length > 0 && (
        <div className="overflow-x-auto shadow-md rounded-lg">
          <table className="min-w-full border">
            <thead className="bg-gray-50">
              <tr>
                <th className="border px-4 py-2 text-left">Sl No</th>
                <th className="border px-4 py-2 text-left">Item Description</th>
                <th className="border px-4 py-2 text-left">SIZE</th>
                <th className="border px-4 py-2 text-left">UOM</th>
                <th className="border px-4 py-2 text-left">Qty</th>
                <th className="border px-4 py-2 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border px-4 py-2 align-top">{row["Sl No"]}</td>
                  <td className="border px-4 py-2 align-top whitespace-pre-line">{row["Item Description"]}</td>
                  <td className="border px-4 py-2 align-top">{row["SIZE"]}</td>
                  <td className="border px-4 py-2 align-top">{row["UOM"]}</td>
                  <td className="border px-4 py-2 align-top">{row["Qty"]}</td>
                  <td className="border px-4 py-2 align-top">{row["Remarks"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Raw Output */}
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
