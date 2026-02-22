"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export type PlanRow = {
  id: string;
  name: string;
  peak: boolean | null;
  duration_months: number;
  price_etb: number;
};
const DURATIONS = [3, 6, 12] as const;

function formatETB(value: number): string {
  return `${value.toLocaleString("en")} ETB`;
}

type Props = { plans: PlanRow[] };

export function PricingPlans({ plans }: Props) {
  const [peak, setPeak] = useState<boolean>(true);
  const [duration, setDuration] = useState<number>(6);

  const filtered = useMemo(() => {
    return plans.filter((p) => {
      const matchPeak =
        p.peak === null || p.peak === peak;
      const matchDuration = p.duration_months === duration;
      return matchPeak && matchDuration;
    });
  }, [plans, peak, duration]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-col gap-6">
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Peak / Off-Peak
          </p>
          <div className="flex gap-2">
            <Button
              variant={peak ? "default" : "outline"}
              size="sm"
              onClick={() => setPeak(true)}
            >
              Peak
            </Button>
            <Button
              variant={!peak ? "default" : "outline"}
              size="sm"
              onClick={() => setPeak(false)}
            >
              Off-Peak
            </Button>
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            Duration
          </p>
          <div className="flex flex-wrap gap-2">
            {DURATIONS.map((d) => (
              <Button
                key={d}
                variant={duration === d ? "default" : "outline"}
                size="sm"
                onClick={() => setDuration(d)}
              >
                {d} Months
              </Button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No plans match the selected options. Try changing Peak/Off-Peak or
          Duration.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((plan) => (
            <Card key={plan.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {plan.duration_months} month
                  {plan.duration_months !== 1 ? "s" : ""}
                  {plan.peak !== null && (
                    <span> · {plan.peak ? "Peak" : "Off-Peak"}</span>
                  )}
                </p>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-2xl font-bold">
                  {formatETB(plan.price_etb)}
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href="/memberships">Start signup</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
