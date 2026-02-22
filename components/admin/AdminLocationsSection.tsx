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
import { LocationForm } from "@/components/admin/LocationForm";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { deleteLocationAction } from "@/app/admin/actions/locations";
import { Pencil, Trash2 } from "lucide-react";

type LocationRow = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  maps_query: string | null;
};

type AdminLocationsSectionProps = { locations: LocationRow[] };

export function AdminLocationsSection({ locations }: AdminLocationsSectionProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingLoc, setEditingLoc] = useState<LocationRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function openEdit(loc: LocationRow) {
    setEditingLoc(loc);
    setEditOpen(true);
  }

  function handleEditSuccess() {
    setEditOpen(false);
    setEditingLoc(null);
    router.refresh();
  }

  function handleCreateSuccess() {
    setCreateOpen(false);
    router.refresh();
  }

  async function handleConfirmDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    await deleteLocationAction(deleteId);
    setDeleteLoading(false);
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Locations</CardTitle>
            <CardDescription>Branches / venues.</CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)}>Add location</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {locations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No locations.
                  </TableCell>
                </TableRow>
              ) : (
                locations.map((loc) => (
                  <TableRow key={loc.id}>
                    <TableCell>{loc.name}</TableCell>
                    <TableCell>{loc.slug}</TableCell>
                    <TableCell>{loc.address ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(loc)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(loc.id)}
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
            <DialogTitle>Add location</DialogTitle>
          </DialogHeader>
          <LocationForm onSuccess={handleCreateSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(open) => !open && setEditingLoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit location</DialogTitle>
          </DialogHeader>
          {editingLoc && (
            <LocationForm
              editId={editingLoc.id}
              initialValues={{
                name: editingLoc.name,
                slug: editingLoc.slug,
                address: editingLoc.address ?? "",
                phone: editingLoc.phone ?? "",
                maps_query: editingLoc.maps_query ?? "",
              }}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete location"
        description="Classes and snack orders may reference this location."
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
      />
    </>
  );
}
