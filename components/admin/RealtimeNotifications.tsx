"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type NotificationItem =
  | { type: "membership"; id: string; message: string; at: number }
  | { type: "booking"; id: string; message: string; at: number };

const MAX_ITEMS = 10;

export function RealtimeNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("admin-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "memberships" },
        () => {
          setItems((prev) => {
            const next = [
              {
                type: "membership" as const,
                id: `m-${Date.now()}`,
                message: "New member signup",
                at: Date.now(),
              },
              ...prev,
            ].slice(0, MAX_ITEMS);
            return next;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bookings" },
        () => {
          setItems((prev) => {
            const next = [
              {
                type: "booking" as const,
                id: `b-ins-${Date.now()}`,
                message: "New class booking",
                at: Date.now(),
              },
              ...prev,
            ].slice(0, MAX_ITEMS);
            return next;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bookings" },
        () => {
          setItems((prev) => {
            const next = [
              {
                type: "booking" as const,
                id: `b-upd-${Date.now()}`,
                message: "Booking updated",
                at: Date.now(),
              },
              ...prev,
            ].slice(0, MAX_ITEMS);
            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      className={cn(
        "fixed top-4 right-4 z-50 flex max-h-[50vh] w-full max-w-sm flex-col gap-2 overflow-auto rounded-lg border bg-background p-2 shadow-lg"
      )}
      aria-live="polite"
    >
      <p className="text-muted-foreground px-2 text-xs font-medium">
        Live updates
      </p>
      {items.map((item) => (
        <div
          key={item.id}
          className="rounded border bg-muted/50 px-3 py-2 text-sm"
        >
          {item.type === "membership" ? (
            <Link
              href="/admin"
              className="text-primary hover:underline"
            >
              {item.message}
            </Link>
          ) : (
            <span>{item.message}</span>
          )}
        </div>
      ))}
    </div>
  );
}
