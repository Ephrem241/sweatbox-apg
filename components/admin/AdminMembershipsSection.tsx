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
import { MembershipForm } from "@/components/admin/MembershipForm";
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { deleteMembershipAction } from "@/app/admin/actions/memberships";
import { Pencil, Trash2 } from "lucide-react";

type MembershipRow = {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  start_date: string;
  end_date: string;
  profiles: { full_name: string | null; email: string | null } | null;
  plans: { name: string } | null;
};

type ProfileOption = { id: string; full_name: string | null; email: string | null };
type PlanOption = { id: string; name: string };

type AdminMembershipsSectionProps = {
  memberships: MembershipRow[];
  profiles: ProfileOption[];
  plans: PlanOption[];
};

export function AdminMembershipsSection({
  memberships,
  profiles,
  plans,
}: AdminMembershipsSectionProps) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<MembershipRow | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  function openEdit(row: MembershipRow) {
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
    await deleteMembershipAction(deleteId);
    setDeleteLoading(false);
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Memberships</CardTitle>
            <CardDescription>Subscription memberships.</CardDescription>
          </div>
          <Button onClick={() => setCreateOpen(true)}>Add membership</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>End date</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {memberships.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No memberships.
                  </TableCell>
                </TableRow>
              ) : (
                memberships.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>
                      {m.profiles?.full_name ?? m.profiles?.email ?? m.user_id.slice(0, 8) + "…"}
                    </TableCell>
                    <TableCell>{m.plans?.name ?? "—"}</TableCell>
                    <TableCell>{m.status}</TableCell>
                    <TableCell>{m.end_date}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(m)} aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(m.id)}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add membership</DialogTitle>
          </DialogHeader>
          <MembershipForm profiles={profiles} plans={plans} onSuccess={handleCreateSuccess} />
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={(open) => !open && setEditingRow(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit membership</DialogTitle>
          </DialogHeader>
          {editingRow && (
            <MembershipForm
              editId={editingRow.id}
              initialValues={{
                user_id: editingRow.user_id,
                plan_id: editingRow.plan_id,
                status: editingRow.status,
                start_date: editingRow.start_date,
                end_date: editingRow.end_date,
              }}
              profiles={profiles}
              plans={plans}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete membership"
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
      />
    </>
  );
}
