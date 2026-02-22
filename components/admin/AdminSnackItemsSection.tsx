"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SnackItemForm } from "@/components/admin/SnackItemForm";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { deleteSnackItemAction } from "@/app/admin/actions/snack-items";
import { Pencil, Trash2 } from "lucide-react";

type SnackItemRow = {
  id: string;
  name: string;
  price_etb: number;
  available: boolean;
  sort_order: number;
  description?: string | null;
  image_url?: string | null;
};

type AdminSnackItemsSectionProps = { items: SnackItemRow[] };

export function AdminSnackItemsSection({ items }: AdminSnackItemsSectionProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SnackItemRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function openEdit(item: SnackItemRow) {
    setEditingItem(item);
    setEditOpen(true);
  }

  function handleEditSuccess() {
    setEditOpen(false);
    setEditingItem(null);
    router.refresh();
  }

  function handleCreateSuccess() {
    setCreateOpen(false);
    router.refresh();
  }

  async function handleConfirmDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    await deleteSnackItemAction(deleteId);
    setDeleteLoading(false);
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Snack items</CardTitle>
            <CardDescription>Menu items for pre-order.</CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)}>Add item</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price (ETB)</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No snack items.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{Number(item.price_etb).toLocaleString()}</TableCell>
                    <TableCell>{item.available ? "Yes" : "No"}</TableCell>
                    <TableCell>{item.sort_order}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(item.id)}
                          aria-label="Delete"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add snack item</DialogTitle>
          </DialogHeader>
          <SnackItemForm onSuccess={handleCreateSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit snack item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <SnackItemForm
              editId={editingItem.id}
              initialValues={{
                name: editingItem.name,
                price_etb: editingItem.price_etb,
                available: editingItem.available,
                sort_order: editingItem.sort_order,
                description: editingItem.description ?? "",
                image_url: editingItem.image_url ?? "",
              }}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete snack item"
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
      />
    </>
  );
}
