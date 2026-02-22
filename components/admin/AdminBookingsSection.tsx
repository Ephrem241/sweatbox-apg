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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { updateBookingAction, deleteBookingAction } from "@/app/admin/actions/bookings";
import { Pencil, Trash2 } from "lucide-react";

type BookingRow = {
  id: string;
  booked_date: string;
  status: string;
  profiles: { full_name: string | null; email: string | null } | null;
  classes: { name: string } | null;
};

type AdminBookingsSectionProps = { bookings: BookingRow[] };

const STATUS_OPTIONS = ["confirmed", "cancelled", "completed"];

export function AdminBookingsSection({ bookings }: AdminBookingsSectionProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<BookingRow | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function openEdit(b: BookingRow) {
    setEditingBooking(b);
    setEditStatus(b.status);
    setEditOpen(true);
  }

  async function handleSaveStatus() {
    if (!editingBooking) return;
    setEditLoading(true);
    await updateBookingAction(editingBooking.id, editStatus);
    setEditLoading(false);
    setEditOpen(false);
    setEditingBooking(null);
    router.refresh();
  }

  async function handleConfirmDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    await deleteBookingAction(deleteId);
    setDeleteLoading(false);
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
          <CardDescription>Class bookings. Update status or delete.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No bookings.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.profiles?.full_name ?? b.profiles?.email ?? "—"}</TableCell>
                    <TableCell>{b.classes?.name ?? "—"}</TableCell>
                    <TableCell>{b.booked_date}</TableCell>
                    <TableCell>{b.status}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(b)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(b.id)}
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

      <Dialog open={editOpen} onOpenChange={(open) => !open && setEditingBooking(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit booking status</DialogTitle>
          </DialogHeader>
          {editingBooking && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                {editingBooking.profiles?.full_name ?? editingBooking.profiles?.email} — {editingBooking.classes?.name} — {editingBooking.booked_date}
              </p>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSaveStatus} disabled={editLoading}>
                {editLoading ? "Saving…" : "Save"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete booking"
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
      />
    </>
  );
}
