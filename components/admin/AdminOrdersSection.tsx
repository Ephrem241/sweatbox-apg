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
import { updateOrderAction } from "@/app/admin/actions/orders";
import { Pencil } from "lucide-react";

type OrderRow = {
  id: string;
  user_id: string;
  status: string;
  total_etb: number;
  created_at: string;
};

type AdminOrdersSectionProps = {
  orders: OrderRow[];
  profileByUserId: Map<string, { full_name: string | null; email: string | null }>;
};

const STATUS_OPTIONS = ["pending_payment", "paid", "shipped", "cancelled"];

export function AdminOrdersSection({ orders, profileByUserId }: AdminOrdersSectionProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderRow | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  function openEdit(o: OrderRow) {
    setEditingOrder(o);
    setEditStatus(o.status);
    setEditOpen(true);
  }

  async function handleSaveStatus() {
    if (!editingOrder) return;
    setEditLoading(true);
    await updateOrderAction(editingOrder.id, editStatus);
    setEditLoading(false);
    setEditOpen(false);
    setEditingOrder(null);
    router.refresh();
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Shop orders</CardTitle>
          <CardDescription>Update order status.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground">
                    No orders.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((o) => (
                  <TableRow key={o.id}>
                    <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {profileByUserId.get(o.user_id)?.full_name ??
                        profileByUserId.get(o.user_id)?.email ??
                        o.user_id.slice(0, 8) + "…"}
                    </TableCell>
                    <TableCell>{Number(o.total_etb).toLocaleString()} ETB</TableCell>
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
            <DialogTitle>Edit order status</DialogTitle>
          </DialogHeader>
          {editingOrder && (
            <div className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                Order {editingOrder.id.slice(0, 8)}… — {Number(editingOrder.total_etb).toLocaleString()} ETB
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
    </>
  );
}
