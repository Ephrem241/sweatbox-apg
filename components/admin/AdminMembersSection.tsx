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
import { MemberForm } from "@/components/admin/MemberForm";
import { Pencil } from "lucide-react";

type MemberRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
};

type AdminMembersSectionProps = { members: MemberRow[] };

export function AdminMembersSection({ members }: AdminMembersSectionProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<MemberRow | null>(null);

  function openEdit(m: MemberRow) {
    setEditingMember(m);
    setEditOpen(true);
  }

  function handleEditSuccess() {
    setEditOpen(false);
    setEditingMember(null);
    router.refresh();
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>Registered profiles. Edit role and display info only.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-muted-foreground">
                    No members.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell>{m.full_name ?? "—"}</TableCell>
                    <TableCell>{m.email ?? "—"}</TableCell>
                    <TableCell>{m.role ?? "—"}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(m)} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={editOpen} onOpenChange={(open) => !open && setEditingMember(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit member</DialogTitle>
          </DialogHeader>
          {editingMember && (
            <MemberForm
              memberId={editingMember.id}
              initialValues={{
                full_name: editingMember.full_name ?? "",
                email: editingMember.email ?? "",
                role: (editingMember.role === "admin" ? "admin" : "member") as "member" | "admin",
              }}
              onSuccess={handleEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
