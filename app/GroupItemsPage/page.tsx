"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogHeader,
  DialogFooter,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Edit, Trash2, Loader2, Plus } from "lucide-react";

// Allowed unit options
const UNIT_OPTIONS = ["MH", "EA", "LS", "LM", "CUM", "SQM"] as const;

// TypeScript types
type Group = { id: number; name: string };
type GroupItem = {
  id: number;
  itemNo: string | null;
  description: string;
  unit: string;
  unitRateSar: string;
  groupId: number;
};

export default function GroupItemsPage() {
  const queryClient = useQueryClient();
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [itemForm, setItemForm] = useState<Omit<GroupItem, "id" | "groupId">>({
    itemNo: "",
    description: "",
    unit: "",
    unitRateSar: "",
  });
  const [editingItem, setEditingItem] = useState<GroupItem | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // Fetch groups
  const { data: groups = [], isLoading: loadingGroups } = useQuery<Group[]>({
    queryKey: ["item-groups"],
    queryFn: async (): Promise<Group[]> => {
      const res = await fetch("/api/item-groups-items/item-groups");
      if (!res.ok) throw new Error("Failed to load groups");
      return res.json();
    },
  });

  // Find the currently selected group object, if any
  const selectedGroup = groups.find((g) => g.id === selectedGroupId) || null;

  // Fetch items
  const { data: items = [], isLoading: loadingItems } = useQuery<GroupItem[]>({
    queryKey: ["group-items", selectedGroup?.id],
    enabled: !!selectedGroup,
    queryFn: async (): Promise<GroupItem[]> => {
      const res = await fetch(`/api/item-groups-items/group-items?groupId=${selectedGroup?.id}`);
      if (!res.ok) throw new Error("Failed to load items");
      return res.json();
    },
  });

  // Add item
  const addMutation = useMutation({
    mutationFn: async (item: Omit<GroupItem, "id">) => {
      const res = await fetch("/api/item-groups-items", {
        method: "POST",
        body: JSON.stringify(item),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Add failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-items", selectedGroup?.id] });
      setItemForm({ itemNo: "", description: "", unit: "", unitRateSar: "" });
      setEditingItem(null);
    },
    onError: (err: unknown) => {
      if (typeof err === "object" && err && "message" in err) {
        alert((err as { message?: string }).message || "Add failed");
      } else {
        alert("Add failed");
      }
    },
  });

  // Edit item
  const editMutation = useMutation({
    mutationFn: async (item: GroupItem) => {
      const res = await fetch(`/api/item-groups-items/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify(item),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Edit failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-items", selectedGroup?.id] });
      setEditingItem(null);
      setItemForm({ itemNo: "", description: "", unit: "", unitRateSar: "" });
    },
    onError: (err: unknown) => {
      if (typeof err === "object" && err && "message" in err) {
        alert((err as { message?: string }).message || "Edit failed");
      } else {
        alert("Edit failed");
      }
    },
  });

  // Delete item
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/item-groups-items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["group-items", selectedGroup?.id] });
      setDeleteDialogOpen(false);
      setPendingDeleteId(null);
    },
    onError: (err: unknown) => {
      if (typeof err === "object" && err && "message" in err) {
        alert((err as { message?: string }).message || "Delete failed");
      } else {
        alert("Delete failed");
      }
    },
  });

  const filteredItems = items.filter(
    (item) =>
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      (item.itemNo?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <Card className="rounded-xl w-full h-full min-h-screen min-w-full border-none shadow-none p-0 bg-white flex flex-col">
      <CardContent className="flex-1 flex flex-col justify-start p-0">
        {/* Group Select */}
        <div className="sticky top-0 z-20 bg-white border-b px-20 py-5 flex flex-col gap-4 rounded-t-xl shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight">Group Items</h2>
          <div className="w-full mb-2">
            <select
              value={selectedGroupId ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "") {
                  setSelectedGroupId(null);
                  setItemForm({ itemNo: "", description: "", unit: "", unitRateSar: "" });
                  setEditingItem(null);
                } else {
                  setSelectedGroupId(Number(value));
                  setItemForm({ itemNo: "", description: "", unit: "", unitRateSar: "" });
                  setEditingItem(null);
                }
              }}
              className="w-full border rounded px-3 py-2 bg-white text-base"
              disabled={loadingGroups}
            >
              <option value="">Select a group...</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          {selectedGroup && (
            <div className="flex gap-3 items-center">
              <Input
                className="text-base flex-1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search item no / description..."
                spellCheck={false}
              />
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editingItem) {
                    editMutation.mutate({ ...editingItem, ...itemForm, groupId: selectedGroup.id });
                  } else {
                    addMutation.mutate({ ...itemForm, groupId: selectedGroup.id });
                  }
                }}
                className="flex gap-2 items-center"
              >
                <Input
                  className="w-24"
                  value={itemForm.itemNo || ""}
                  onChange={(e) => setItemForm((f) => ({ ...f, itemNo: e.target.value }))}
                  placeholder="Item No"
                />
                <Input
                  className="w-48"
                  value={itemForm.description}
                  onChange={(e) => setItemForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Description"
                  required
                />
                {/* Dropdown for unit selection */}
                <select
                  className="w-28 border rounded px-2 py-2 bg-white text-base"
                  value={itemForm.unit}
                  onChange={e => setItemForm(f => ({ ...f, unit: e.target.value }))}
                  required
                >
                  <option value="">Unit</option>
                  {UNIT_OPTIONS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
                <Input
                  className="w-32"
                  value={itemForm.unitRateSar}
                  onChange={(e) => setItemForm((f) => ({ ...f, unitRateSar: e.target.value }))}
                  placeholder="Unit Rate (SAR)"
                  required
                  type="number"
                  min="0"
                  step="0.01"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="flex gap-2 items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={
                    addMutation.isPending ||
                    editMutation.isPending ||
                    !itemForm.description.trim() ||
                    !itemForm.unit.trim() ||
                    !itemForm.unitRateSar.trim()
                  }
                >
                  {(addMutation.isPending || editMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingItem ? (
                    <>
                      <Edit className="w-4 h-4" /> <span>Update</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> <span>Add</span>
                    </>
                  )}
                </Button>
                {editingItem && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setEditingItem(null);
                      setItemForm({ itemNo: "", description: "", unit: "", unitRateSar: "" });
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </form>
            </div>
          )}
        </div>
        {selectedGroup && (
          <div className="px-20 py-7 flex-1 overflow-y-auto bg-white scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-blue-200 scrollbar-track-transparent">
            <table className="w-full text-base rounded-xl overflow-hidden shadow-sm bg-white">
              <thead>
                <tr className="bg-muted">
                  <th className="py-2 px-4 text-left w-8">#</th>
                  <th className="py-2 px-4 text-left">Item No</th>
                  <th className="py-2 px-4 text-left">Description</th>
                  <th className="py-2 px-4 text-left">Unit</th>
                  <th className="py-2 px-4 text-left">Unit Rate (SAR)</th>
                  <th className="py-2 px-4 w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loadingItems ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center">
                      <Loader2 className="w-7 h-7 animate-spin mx-auto text-blue-500" />
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      No items for this group
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item, i) => (
                    <tr key={item.id} className="border-b hover:bg-muted/40 transition">
                      <td className="py-1.5 px-4">{i + 1}</td>
                      <td className="py-1.5 px-4">{item.itemNo}</td>
                      <td className="py-1.5 px-4">{item.description}</td>
                      <td className="py-1.5 px-4">{item.unit}</td>
                      <td className="py-1.5 px-4">{item.unitRateSar}</td>
                      <td className="py-1.5 px-4 flex gap-2 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full w-8 h-8"
                          onClick={() => {
                            setEditingItem(item);
                            setItemForm({
                              itemNo: item.itemNo || "",
                              description: item.description,
                              unit: item.unit,
                              unitRateSar: item.unitRateSar,
                            });
                          }}
                          disabled={editMutation.isPending || addMutation.isPending}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="rounded-full w-8 h-8"
                          onClick={() => {
                            setDeleteDialogOpen(true);
                            setPendingDeleteId(item.id);
                          }}
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending && pendingDeleteId === item.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Item</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this item? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (pendingDeleteId != null) deleteMutation.mutate(pendingDeleteId);
                }}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirm"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
