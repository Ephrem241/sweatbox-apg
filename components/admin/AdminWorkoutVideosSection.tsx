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
import { WorkoutVideoForm } from "@/components/admin/WorkoutVideoForm";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { deleteWorkoutVideoAction } from "@/app/admin/actions/workout-videos";
import { Pencil, Trash2 } from "lucide-react";

type WorkoutVideoRow = {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  duration_sec: number | null;
  tags: string[];
  sort_order: number;
  thumbnail_url: string | null;
};

type AdminWorkoutVideosSectionProps = { videos: WorkoutVideoRow[] };

export function AdminWorkoutVideosSection({ videos }: AdminWorkoutVideosSectionProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<WorkoutVideoRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function openEdit(row: WorkoutVideoRow) {
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
    await deleteWorkoutVideoAction(deleteId);
    setDeleteLoading(false);
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Workout videos</CardTitle>
            <CardDescription>Library videos (gated by membership in app).</CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)}>Add video</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Sort</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No workout videos.
                  </TableCell>
                </TableRow>
              ) : (
                videos.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.title}</TableCell>
                    <TableCell>{v.duration_sec != null ? `${v.duration_sec}s` : "—"}</TableCell>
                    <TableCell>{(v.tags ?? []).join(", ") || "—"}</TableCell>
                    <TableCell>{v.sort_order}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(v)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(v.id)}
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
            <DialogTitle>Add workout video</DialogTitle>
          </DialogHeader>
          <WorkoutVideoForm onSuccess={handleCreateSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(open) => !open && setEditingRow(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit workout video</DialogTitle>
          </DialogHeader>
          {editingRow && (
            <WorkoutVideoForm
              editId={editingRow.id}
              initialValues={{
                title: editingRow.title,
                description: editingRow.description ?? "",
                thumbnail_url: editingRow.thumbnail_url ?? "",
                video_url: editingRow.video_url,
                duration_sec: editingRow.duration_sec ?? undefined,
                tags: (editingRow.tags ?? []).join(", "),
                sort_order: editingRow.sort_order,
              }}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete workout video"
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
      />
    </>
  );
}
