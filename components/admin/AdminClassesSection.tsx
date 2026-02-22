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
import { ClassForm, DAY_LABELS } from "@/components/admin/ClassForm";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { deleteClassAction } from "@/app/admin/actions/classes";
import { Pencil, Trash2 } from "lucide-react";

type ClassRow = {
  id: string;
  name: string;
  day_of_week: number;
  start_time: string;
  location_id: string | null;
  locations: { name: string } | null;
};

type LocationOption = { id: string; name: string };

type AdminClassesSectionProps = {
  classes: ClassRow[];
  locations: LocationOption[];
};

export function AdminClassesSection({
  classes,
  locations,
}: AdminClassesSectionProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function openEdit(cls: ClassRow) {
    setEditingClass(cls);
    setEditOpen(true);
  }

  function handleEditSuccess() {
    setEditOpen(false);
    setEditingClass(null);
    router.refresh();
  }

  function handleCreateSuccess() {
    setCreateOpen(false);
    router.refresh();
  }

  async function handleConfirmDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    await deleteClassAction(deleteId);
    setDeleteLoading(false);
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>Create, edit, or delete classes.</CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)}>Add class</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No classes. Add one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((cls) => (
                  <TableRow key={cls.id}>
                    <TableCell>{cls.name}</TableCell>
                    <TableCell>{DAY_LABELS[cls.day_of_week] ?? cls.day_of_week}</TableCell>
                    <TableCell>{cls.start_time}</TableCell>
                    <TableCell>{cls.locations?.name ?? "—"}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(cls)}
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(cls.id)}
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
            <DialogTitle>Add class</DialogTitle>
          </DialogHeader>
          <ClassForm
            locations={locations}
            onSuccess={handleCreateSuccess}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(open) => !open && setEditingClass(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit class</DialogTitle>
          </DialogHeader>
          {editingClass && (
            <ClassForm
              editId={editingClass.id}
              initialValues={{
                name: editingClass.name,
                day_of_week: editingClass.day_of_week,
                start_time: editingClass.start_time,
                location_id: editingClass.location_id ?? undefined,
              }}
              locations={locations}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete class"
        description="This will remove the class from the schedule. Bookings may be affected."
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
      />
    </>
  );
}
