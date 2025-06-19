"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ManpowerWidgetCard } from "./components/ManpowerWidgetCard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type Item = {
  id: number;
  code: string;
  description: string;
  category: string;
  rate: string;
};

type Grouped = Record<string, Item[]>;

export default function ManpowerList() {
  const { data, isLoading, error } = useQuery<Grouped>({
    queryKey: ["manpower-items"],
    queryFn: async () => {
      const res = await fetch("/api/manpower-items");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    staleTime: 60 * 1000,
  });

  // Selection state: store selected item IDs
  const [selected, setSelected] = useState<Record<number, Item>>({});
  const [showTable, setShowTable] = useState(false);

  const toggleSelect = (item: Item) => {
    setSelected((prev) =>
      prev[item.id]
        ? Object.fromEntries(Object.entries(prev).filter(([id]) => Number(id) !== item.id))
        : { ...prev, [item.id]: item }
    );
  };

  // Table rows
  const selectedItems = Object.values(selected);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Accordion type="multiple" className="space-y-3">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-2">
            {[1, 2, 3, 4].map(n => <Skeleton key={n} className="h-20 w-full rounded-2xl" />)}
          </div>
        ) : error ? (
          <div className="text-red-500">Failed to load data.</div>
        ) : (
          Object.entries(data ?? {}).map(([category, items]) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="text-xl font-bold text-blue-700">
                {category}
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-2">
                  {items.map(item => (
                    <ManpowerWidgetCard
                      key={item.id}
                      selected={!!selected[item.id]}
                      onClick={() => toggleSelect(item)}
                      code={item.code}
                      description={item.description}
                      rate={item.rate}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))
        )}
      </Accordion>
      <div className="mt-6 flex justify-end">
        <Button
          disabled={selectedItems.length === 0}
          onClick={() => setShowTable((prev) => !prev)}
        >
          {showTable ? "Hide Selected Manpower" : "Show Selected Manpower"}
        </Button>
      </div>
      {showTable && selectedItems.length > 0 && (
        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-4 py-2 font-bold text-gray-700">Code</th>
                <th className="px-4 py-2 font-bold text-gray-700">Description</th>
                <th className="px-4 py-2 font-bold text-gray-700 text-right">Rate (SR)</th>
              </tr>
            </thead>
            <tbody>
              {selectedItems.map((item) => (
                <tr key={item.id} className="odd:bg-white even:bg-blue-50">
                  <td className="px-4 py-2 font-mono">{item.code}</td>
                  <td className="px-4 py-2">{item.description}</td>
                  <td className="px-4 py-2 text-right font-semibold text-blue-700">
                    {Number(item.rate).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
