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
import { Edit, Trash2, Loader2, Plus, Search } from "lucide-react";

type Group = { id: number; name: string };

export default function ItemGroupsPage() {
  const queryClient = useQueryClient();
  const [newGroup, setNewGroup] = useState("");
  const [search, setSearch] = useState(""); // <-- search state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editLoadingId, setEditLoadingId] = useState<number | null>(null);
  const [deleteLoadingId, setDeleteLoadingId] = useState<number | null>(null);

  // Dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [pendingEdit, setPendingEdit] = useState<{ id: number; value: string } | null>(null);

  // Fetch groups
  const { data: groups = [], isLoading } = useQuery<Group[]>({
    queryKey: ["item-groups"],
    queryFn: async () => {
      const res = await fetch("/api/item-groups");
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  // Add group
  const addMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/item-groups", {
        method: "POST",
        body: JSON.stringify({ name }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-groups"] });
      setNewGroup("");
    },
    onError: (err: any) => {
      alert(err?.message || "Add failed");
    },
  });

  // Edit group
  const editMutation = useMutation({
    mutationFn: async ({ id, name }: { id: number; name: string }) => {
      setEditLoadingId(id);
      const res = await fetch(`/api/item-groups/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ name }),
        headers: { "Content-Type": "application/json" },
      });
      setEditLoadingId(null);
      if (!res.ok) throw new Error((await res.json()).error || "Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-groups"] });
      setEditingId(null);
      setEditValue("");
      setEditDialogOpen(false);
      setPendingEdit(null);
    },
    onError: (err: any) => {
      setEditLoadingId(null);
      alert(err?.message || "Edit failed");
    },
  });

  // Delete group
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      setDeleteLoadingId(id);
      const res = await fetch(`/api/item-groups/${id}`, { method: "DELETE" });
      setDeleteLoadingId(null);
      if (!res.ok) throw new Error("Delete failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["item-groups"] });
      setDeleteDialogOpen(false);
      setPendingDeleteId(null);
    },
    onError: (err: any) => {
      setDeleteLoadingId(null);
      alert(err?.message || "Delete failed");
    },
  });

  // Handle open Delete Dialog
  function handleOpenDelete(id: number) {
    setPendingDeleteId(id);
    setDeleteDialogOpen(true);
  }

  // Handle open Edit Dialog
  function handleOpenEdit(id: number, value: string) {
    setPendingEdit({ id, value });
    setEditDialogOpen(true);
    setEditValue(value);
  }

  // FILTER LOGIC
  const filteredGroups = groups.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item Group</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this group? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteLoadingId === pendingDeleteId}
              onClick={() => {
                if (pendingDeleteId != null) deleteMutation.mutate(pendingDeleteId);
              }}
            >
              {deleteLoadingId === pendingDeleteId ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Confirmation Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Group Name</DialogTitle>
            <DialogDescription>
              Update the group name and confirm your changes.
            </DialogDescription>
          </DialogHeader>
          <Input
            className="my-2"
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            autoFocus
            disabled={editLoadingId === (pendingEdit?.id ?? null)}
          />
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={
                editLoadingId === (pendingEdit?.id ?? null) ||
                !editValue.trim() ||
                editValue.trim() === (pendingEdit?.value ?? "")
              }
              onClick={() => {
                if (
                  pendingEdit &&
                  editValue.trim() &&
                  editValue.trim() !== pendingEdit.value
                ) {
                  editMutation.mutate({ id: pendingEdit.id, name: editValue.trim() });
                }
              }}
            >
              {editLoadingId === (pendingEdit?.id ?? null) ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="rounded-xl w-full h-full min-h-screen min-w-full border-none shadow-none p-0 bg-white flex flex-col">
        <CardContent className="flex-1 flex flex-col justify-start p-0">
          {/* Sticky Header & Add */}
          <div className="sticky top-0 z-20 bg-white border-b px-20 py-5 flex flex-col gap-4 rounded-t-xl shadow-sm">
            <h2 className="text-2xl font-bold tracking-tight">Item Groups</h2>
   
         {/* Search control aligned with table and header */}
<div className="px-20 mb-4">
  <Input
    className="w-full text-base"
    value={search}
    onChange={e => setSearch(e.target.value)}
    placeholder="Search groups..."
    spellCheck={false}
  />
</div>

            <form
              onSubmit={e => {
                e.preventDefault();
                if (newGroup.trim()) addMutation.mutate(newGroup.trim());
              }}
              className="flex items-center gap-3"
            >
              <Input
                className="flex-1 text-base py-2 px-4"
                value={newGroup}
                placeholder="Add new group"
                onChange={e => setNewGroup(e.target.value)}
                disabled={addMutation.isPending}
                spellCheck={false}
              />
              <Button
                type="submit"
                size="sm"
                className="flex gap-2 items-center px-4 py-2"
                disabled={!newGroup.trim() || addMutation.isPending}
              >
                {addMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Add</span>
              </Button>
            </form>
          </div>

          {/* Scrollable Group Table */}
          <div
            className="flex-1 overflow-y-auto px-20 py-7 bg-white scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-blue-200 scrollbar-track-transparent"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#a7f3d0 #f3f4f6",
              minHeight: "320px",
            }}
          >
            <table className="w-full text-base rounded-xl overflow-hidden shadow-sm bg-white">
              <thead>
                <tr className="bg-muted">
                  <th className="py-3 px-4 font-semibold text-left w-12 rounded-tl-xl">#</th>
                  <th className="py-3 px-4 font-semibold text-left">Group Name</th>
                  <th className="py-3 px-4 w-28 rounded-tr-xl"></th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center">
                      <Loader2 className="w-7 h-7 animate-spin mx-auto text-blue-500" />
                    </td>
                  </tr>
                ) : filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-muted-foreground">
                      No groups found
                    </td>
                  </tr>
                ) : (
                  filteredGroups.map((group, i) => (
                    <tr key={group.id} className="border-b hover:bg-muted/40 transition">
                      <td className="py-3 px-4">{i + 1}</td>
                      <td className="py-3 px-4">
                        <span className="truncate">{group.name}</span>
                      </td>
                      <td className="py-3 px-4 flex gap-2 justify-end">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-full w-8 h-8"
                          onClick={() => handleOpenEdit(group.id, group.name)}
                          disabled={editLoadingId === group.id || deleteLoadingId === group.id}
                        >
                          <Edit className="w-4 h-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="rounded-full w-8 h-8"
                          onClick={() => handleOpenDelete(group.id)}
                          disabled={deleteLoadingId === group.id}
                        >
                          {deleteLoadingId === group.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          <span className="sr-only">Delete</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
