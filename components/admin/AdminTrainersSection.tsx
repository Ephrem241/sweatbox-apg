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
import { TrainerForm } from "@/components/admin/TrainerForm";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { deleteTrainerAction } from "@/app/admin/actions/trainers";
import { Pencil, Trash2 } from "lucide-react";

type TrainerRow = {
  id: string;
  profile_id: string;
  display_name: string;
  bio: string | null;
  image_url: string | null;
  specialties: string[];
  sort_order: number;
  location_id: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  twitter_url: string | null;
  tiktok_url: string | null;
  profiles: { full_name: string | null; email: string | null } | null;
};

type ProfileOption = { id: string; full_name: string | null; email: string | null };
type LocationOption = { id: string; name: string };

type AdminTrainersSectionProps = {
  trainers: TrainerRow[];
  profiles: ProfileOption[];
  locations: LocationOption[];
};

export function AdminTrainersSection({ trainers, profiles, locations }: AdminTrainersSectionProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<TrainerRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function openEdit(row: TrainerRow) {
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
    await deleteTrainerAction(deleteId);
    setDeleteLoading(false);
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Trainer profiles</CardTitle>
            <CardDescription>Coaches displayed on the trainers page.</CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)}>Add trainer</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Display name</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trainers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No trainer profiles.
                  </TableCell>
                </TableRow>
              ) : (
                trainers.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{t.display_name}</TableCell>
                    <TableCell>{t.profiles?.full_name ?? t.profiles?.email ?? "—"}</TableCell>
                    <TableCell>{(t.specialties ?? []).join(", ") || "—"}</TableCell>
                    <TableCell>{t.sort_order}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(t)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(t.id)}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add trainer</DialogTitle>
          </DialogHeader>
          <TrainerForm profiles={profiles} locations={locations} onSuccess={handleCreateSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(open) => !open && setEditingRow(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit trainer</DialogTitle>
          </DialogHeader>
          {editingRow && (
            <TrainerForm
              editId={editingRow.id}
              initialValues={{
                profile_id: editingRow.profile_id,
                display_name: editingRow.display_name,
                bio: editingRow.bio ?? "",
                image_url: editingRow.image_url ?? "",
                specialties: (editingRow.specialties ?? []).join(", "),
                sort_order: editingRow.sort_order,
                location_id: editingRow.location_id ?? "",
                instagram_url: editingRow.instagram_url ?? "",
                facebook_url: editingRow.facebook_url ?? "",
                twitter_url: editingRow.twitter_url ?? "",
                tiktok_url: editingRow.tiktok_url ?? "",
              }}
              profiles={profiles}
              locations={locations}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete trainer profile"
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
      />
    </>
  );
}
