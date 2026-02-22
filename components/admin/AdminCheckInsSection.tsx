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
import { ConfirmDeleteDialog } from "@/components/admin/ConfirmDeleteDialog";
import { deleteCheckInAction } from "@/app/admin/actions/check-ins";
import { Trash2 } from "lucide-react";

type CheckInRow = {
  id: string;
  user_id: string;
  class_id: string;
  checked_in_at: string;
  profiles: { full_name: string | null; email: string | null } | null;
  classes: { name: string } | null;
};

type AdminCheckInsSectionProps = {
  checkIns: CheckInRow[];
};

export function AdminCheckInsSection({ checkIns }: AdminCheckInsSectionProps) {
  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  async function handleConfirmDelete() {
    if (!deleteId) return;
    setDeleteLoading(true);
    await deleteCheckInAction(deleteId);
    setDeleteLoading(false);
    setDeleteId(null);
    router.refresh();
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Check-ins</CardTitle>
          <CardDescription>Class check-in records. Delete to correct errors.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Checked in at</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {checkIns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No check-ins.
                  </TableCell>
                </TableRow>
              ) : (
                checkIns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.profiles?.full_name ?? c.profiles?.email ?? c.user_id.slice(0, 8) + "…"}</TableCell>
                    <TableCell>{c.classes?.name ?? "—"}</TableCell>
                    <TableCell>{new Date(c.checked_in_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(c.id)}
                        aria-label="Delete"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        open={deleteId !== null}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete check-in"
        description="Remove this check-in record. Use only to correct mistakes."
        onConfirm={handleConfirmDelete}
        isLoading={deleteLoading}
      />
    </>
  );
}
