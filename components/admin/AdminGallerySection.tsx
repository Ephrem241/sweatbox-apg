"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
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
import { GalleryImageForm } from "@/components/admin/GalleryImageForm";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { deleteGalleryImageAction } from "@/app/admin/actions/gallery";
import { Pencil, Trash2 } from "lucide-react";

type GalleryImageRow = {
  id: string;
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
  sort_order: number;
};

type AdminGallerySectionProps = { images: GalleryImageRow[] };

export function AdminGallerySection({ images }: AdminGallerySectionProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<GalleryImageRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function openEdit(row: GalleryImageRow) {
    setEditingRow(row);
    setEditOpen(true);
  }

  function handleEditSuccess() {
    setEditOpen(false);
    setEditingRow(null);
    router.refresh();
  }

  function handleCreateSuccess() {
    setCreateOpen(false);
    router.refresh();
  }

  async function handleConfirmDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    await deleteGalleryImageAction(deleteId);
    setDeleteLoading(false);
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Gallery images</CardTitle>
            <CardDescription>Images shown on the public Gallery page. Add image URL and alt text.</CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)}>Add image</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Alt</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {images.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No gallery images. Add one to show on the Gallery page.
                  </TableCell>
                </TableRow>
              ) : (
                images.map((img) => (
                  <TableRow key={img.id}>
                    <TableCell>
                      <div className="relative h-12 w-16 overflow-hidden rounded bg-muted">
                        <Image
                          src={img.src}
                          alt={img.alt || "Gallery"}
                          fill
                          className="object-cover"
                          sizes="64px"
                          unoptimized
                        />
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{img.alt || "—"}</TableCell>
                    <TableCell>{img.sort_order}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(img)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(img.id)}
                          aria-label="Delete"
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
            <DialogTitle>Add gallery image</DialogTitle>
          </DialogHeader>
          <GalleryImageForm onSuccess={handleCreateSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit gallery image</DialogTitle>
          </DialogHeader>
          {editingRow && (
            <GalleryImageForm
              editId={editingRow.id}
              initialValues={{
                src: editingRow.src,
                alt: editingRow.alt,
                width: editingRow.width ?? undefined,
                height: editingRow.height ?? undefined,
                sort_order: editingRow.sort_order,
              }}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteId != null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
        title="Delete gallery image?"
        description="This image will be removed from the Gallery page."
      />
    </>
  );
}
