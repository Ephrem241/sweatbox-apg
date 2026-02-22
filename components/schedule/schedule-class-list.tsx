"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BookClassDialog } from "@/components/schedule/BookClassDialog";

const DAY_LABELS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 7];

export type ScheduleClass = {
  id: string;
  name: string;
  day_of_week: number;
  start_time: string;
};

function isInPeakWindow(startTime: string): boolean {
  const t = startTime.trim().slice(0, 5);
  return t >= "16:00" && t < "20:00";
}

function formatTime(s: string): string {
  const part = s.trim().slice(0, 5);
  if (/^\d{2}:\d{2}$/.test(part)) {
    const [h, m] = part.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${h12}:${String(m).padStart(2, "0")} ${period}`;
  }
  return part || s;
}

type Props = {
  classesByDay: Record<number, ScheduleClass[]>;
  isOffPeak: boolean;
  isSignedIn: boolean;
};

export function ScheduleClassList({
  classesByDay,
  isOffPeak,
  isSignedIn,
}: Props) {
  const [bookingClass, setBookingClass] = useState<{
    id: string;
    name: string;
    day_of_week: number;
  } | null>(null);

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {DAY_ORDER.map((day) => {
          const classes = classesByDay[day] ?? [];
          if (classes.length === 0) return null;
          return (
            <Card key={day}>
              <CardHeader>
                <CardTitle className="text-lg">{DAY_LABELS[day]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {classes.map((cls) => {
                  const peakDisabled =
                    isSignedIn && isOffPeak && isInPeakWindow(cls.start_time);
                  const canBook = isSignedIn && !peakDisabled;
                  const button = (
                    <Button
                      size="sm"
                      disabled={!canBook}
                      onClick={() =>
                        canBook &&
                        setBookingClass({ id: cls.id, name: cls.name, day_of_week: cls.day_of_week })
                      }
                    >
                      Book Class
                    </Button>
                  );
                  return (
                    <div
                      key={cls.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-2"
                    >
                      <div className="min-w-0">
                        <p className="font-medium truncate">{cls.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(cls.start_time)}
                        </p>
                      </div>
                      {peakDisabled ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex shrink-0">
                              {button}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>Peak Hours Only</TooltipContent>
                        </Tooltip>
                      ) : (
                        button
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
      {bookingClass && (
        <BookClassDialog
          open={!!bookingClass}
          onOpenChange={(open) => !open && setBookingClass(null)}
          classId={bookingClass.id}
          className={bookingClass.name}
          dayOfWeek={bookingClass.day_of_week}
        />
      )}
    </>
  );
}
