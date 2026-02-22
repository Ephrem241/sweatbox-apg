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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateSnackOrderAction } from "@/app/admin/actions/snack-orders";
import { Pencil } from "lucide-react";

type SnackOrderRow = {
  id: string;
  user_id: string;
  status: string;
  pickup_at: string | null;
  created_at: string;
  locations: { name: string } | null;
};

type AdminSnackOrdersSectionProps = {
  orders: SnackOrderRow[];
  profileByUserId: Map<string, { full_name: string | null; email: string | null }>;
};

const STATUS_OPTIONS = ["pending", "preparing", "ready", "picked_up", "cancelled"];

export function AdminSnackOrdersSection({
  orders,
  profileByUserId,
}: AdminSnackOrdersSectionProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<SnackOrderRow | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editPickupAt, setEditPickupAt] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  function openEdit(o: SnackOrderRow) {
    setEditingOrder(o);
    setEditStatus(o.status);
    setEditPickupAt(o.pickup_at ? new Date(o.pickup_at).toISOString().slice(0, 16) : "");
    setEditOpen(true);
  }

  async function handleSave() {
    if (!editingOrder) return;
    setEditLoading(true);
    await updateSnackOrderAction(editingOrder.id, {
      status: editStatus,
      pickup_at: editPickupAt ? new Date(editPickupAt).toISOString() : null,
    });
    setEditLoading(false);
    setEditOpen(false);
    setEditingOrder(null);
    router.refresh();
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Snack bar orders</CardTitle>
          <CardDescription>Update status and pickup time.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Pickup</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-muted-foreground">
                    No snack orders.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      {profileByUserId.get(o.user_id)?.full_name ??
                        profileByUserId.get(o.user_id)?.email ??
                        o.user_id.slice(0, 8) + "…"}
                    </TableCell>
                    <TableCell>{o.locations?.name ?? "—"}</TableCell>
                    <TableCell>
                      {o.pickup_at ? new Date(o.pickup_at).toLocaleString() : "—"}
                    </TableCell>
                    <TableCell>{o.status}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(o)} aria-label="Edit">
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

      <Dialog open={editOpen} onOpenChange={(open) => !open && setEditingOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit snack order</DialogTitle>
          </DialogHeader>
          {editingOrder && (
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label>Status</Label>
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
              <div className="grid gap-2">
                <Label htmlFor="pickup-at">Pickup at (datetime-local)</Label>
                <Input
                  id="pickup-at"
                  type="datetime-local"
                  value={editPickupAt}
                  onChange={(e) => setEditPickupAt(e.target.value)}
                />
              </div>
              <Button onClick={handleSave} disabled={editLoading}>
                {editLoading ? "Saving…" : "Save"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
