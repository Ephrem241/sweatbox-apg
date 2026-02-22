"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { bookClassAction } from "@/app/actions/book-class";

/** DB day_of_week: 1=Mon .. 7=Sun. Returns next occurrence as YYYY-MM-DD. */
function nextDateForWeekday(dayOfWeek: number): string {
  const today = new Date();
  const jsDay = today.getDay();
  const dbDay = jsDay === 0 ? 7 : jsDay;
  let daysAhead = dayOfWeek - dbDay;
  if (daysAhead <= 0) daysAhead += 7;
  const d = new Date(today);
  d.setDate(today.getDate() + daysAhead);
  return d.toISOString().slice(0, 10);
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  className: string;
  dayOfWeek: number;
};

export function BookClassDialog({
  open,
  onOpenChange,
  classId,
  className,
  dayOfWeek,
}: Props) {
  const [date, setDate] = useState(() => nextDateForWeekday(dayOfWeek));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDate(nextDateForWeekday(dayOfWeek));
      setError(null);
    }
  }, [open, dayOfWeek]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await bookClassAction(classId, date);
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book class: {className}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="booked_date" className="text-sm font-medium">
                Date
              </label>
              <Input
                id="booked_date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Booking…" : "Confirm booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
