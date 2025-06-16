"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WidgetCard } from "./WidgetCard";
import { WidgetDialog } from "./WidgetDialog";
import { Group, Item, WidgetEntry } from "./types";
import * as XLSX from "xlsx";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableCell, TableBody } from "@/components/ui/table";
import { BarLoader } from "react-spinners";

function getNosXHrsXDays(entry: any): string {
  if (entry && typeof entry.persons !== "undefined" && typeof entry.days !== "undefined") {
    return `${entry.persons}x10x${entry.days}`;
  }
  return "";
}
function calculateRequiredQty(entry: any): number | "" {
  if (entry && typeof entry.persons !== "undefined" && typeof entry.days !== "undefined") {
    return Number(entry.persons) * 10 * Number(entry.days);
  }
  return "";
}

export default function Page() {
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [consolidated, setConsolidated] = useState<Record<string, WidgetEntry[]>>({});

  // Fetch all groups
  const { data: groups = [], isLoading: groupsLoading } = useQuery<Group[]>({
    queryKey: ["item-groups"],
    queryFn: async () => {
      const res = await fetch("/api/item-groups");
      if (!res.ok) throw new Error("Failed to fetch groups");
      return res.json();
    },
  });

  // Fetch items for selected group
  const { data: groupItems = [], isLoading: itemsLoading } = useQuery<Item[]>({
    queryKey: ["group-items", selectedGroup?.id],
    queryFn: async () => {
      if (!selectedGroup?.id) return [];
      const url = `/api/item-groups-items/group-items?groupId=${selectedGroup.id}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch group items");
      return res.json();
    },
    enabled: !!selectedGroup?.id && dialogOpen,
  });

  const handleOpenDialog = (group: Group) => {
    setSelectedGroup(group);
    setDialogOpen(true);
  };

  const handleFinish = (groupId: number, groupName: string, entries: WidgetEntry[]) => {
    setConsolidated(prev => ({ ...prev, [groupName]: entries }));
    setDialogOpen(false);
    setSelectedGroup(null);
  };

  // Flatten all consolidated data for the table
  const consolidatedRows = Object.entries(consolidated).flatMap(([group, entries]) =>
    entries.map((entry, i) => ({
      group,
      ...entry,
      key: `${group}-${i}`,
    }))
  );
  // Grand total of all rows
  const mainGrandTotal = consolidatedRows.reduce((sum, row) => sum + (Number(row?.totalValue) ?? 0), 0);

  // Export to Excel
  const exportToExcel = () => {
    const grouped = consolidatedRows.reduce((acc, row) => {
      (acc[row.group] = acc[row.group] || []).push(row);
      return acc;
    }, {} as Record<string, typeof consolidatedRows>);

    const wsData: any[] = [
      [
        "Item No.",
        "Description",
        "NosXHrsXDays",
        "Unit",
        "Required QTY",
        "Unit Rate (SAR)",
        "Amount (SAR)",
      ],
    ];

    const headingRows: number[] = [];
    let currentRow = 1;
    Object.entries(grouped).forEach(([groupName, items]) => {
      wsData.push([groupName]);
      headingRows.push(currentRow);
      currentRow++;
      items.forEach((entry: any) => {
        wsData.push([
          entry.itemNo,
          entry.description,
          getNosXHrsXDays(entry),
          entry.unit,
          calculateRequiredQty(entry),
          entry.unitRateSar,
          entry.totalValue,
        ]);
        currentRow++;
      });
    });

    const worksheet = XLSX.utils.aoa_to_sheet(wsData);
    worksheet["!cols"] = [
      { wch: 15 }, // Item No.
      { wch: 40 }, // Description
      { wch: 18 }, // NosXHrsXDays
      { wch: 8 },  // Unit
      { wch: 16 }, // Required QTY
      { wch: 16 }, // Unit Rate (SAR)
      { wch: 18 }, // Amount (SAR)
    ];
    worksheet["!rows"] = wsData.map((row, idx) =>
      idx === 0 || headingRows.includes(idx) ? { hpt: 28 } : { hpt: 20 }
    );

    let rowIdx = 1;
    Object.entries(grouped).forEach(([groupName, items]) => {
      (worksheet["!merges"] = worksheet["!merges"] || []).push({
        s: { r: rowIdx, c: 0 },
        e: { r: rowIdx, c: 6 },
      });
      rowIdx += items.length + 1;
    });

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Manhours");
    XLSX.writeFile(workbook, "manhours_consolidated.xlsx");
  };

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h2 className="gradient-title text-2xl">Select Activity for Manhours Loading</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-10">
        {groupsLoading ? (
          <div>Loading...</div>
        ) : (
          groups.map(group => (
            <WidgetCard
              key={group.id}
              title={group.name}
              selected={selectedGroup?.id === group.id && dialogOpen}
              onClick={() => handleOpenDialog(group)}
            />
          ))
        )}
      </div>
      {/* Dialog & Loader */}
      {selectedGroup && dialogOpen && (
        itemsLoading ? (
          <div className="fixed inset-0 flex items-center justify-center z-[999] bg-black/20">
            <div className="bg-white rounded-lg shadow-lg px-0 py-8 flex flex-col items-stretch gap-4 w-full max-w-2xl">
              <div className="w-full px-8">
                <BarLoader color="#2563eb" height={6} width="100%" />
              </div>
              <div className="text-blue-700 text-lg font-medium pt-2 text-center w-full">Loading items…</div>
            </div>
          </div>

        ) : (
          <WidgetDialog
            open={dialogOpen}
            onOpenChange={open => {
              setDialogOpen(open);
              if (!open) setSelectedGroup(null);
            }}
            groupName={selectedGroup.name}
            items={groupItems}
            onFinish={entries => handleFinish(selectedGroup.id, selectedGroup.name, entries)}
          />
        )
      )}
      <h2 className="text-xl font-semibold mt-10 mb-4">Consolidated Entries</h2>
      <div className="flex justify-end mb-4">
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Export to Excel
        </button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            Summary Table
            <span className="float-right text-blue-700 font-bold text-lg">
              Grand Total:{" "}
              {mainGrandTotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              SAR
            </span>
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead>Item No.</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Unit Rate (SAR)</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Persons</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Total Value (SAR)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consolidatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-gray-400 py-8">
                    No data yet. Click any widget to enter details.
                  </TableCell>
                </TableRow>
              ) : (
                consolidatedRows.map(entry => (
                  <TableRow key={entry.key}>
                    <TableCell>{entry.group}</TableCell>
                    <TableCell>{entry.itemNo}</TableCell>
                    <TableCell>{entry.description}</TableCell>
                    <TableCell>{entry.unit}</TableCell>
                    <TableCell>{Number(entry.unitRateSar).toFixed(2)}</TableCell>
                    <TableCell>{entry.days}</TableCell>
                    <TableCell>{entry.persons}</TableCell>
                    <TableCell>{entry.totalHours}</TableCell>
                    <TableCell>{Number(entry.totalValue).toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}