"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPlanAction, updatePlanAction, type PlanActionResult } from "@/app/admin/actions/plans";

const planSchema = z.object({
  name: z.string().min(1, "Plan name is required."),
  peak: z.boolean(),
  duration_months: z.coerce.number().min(1, "At least 1 month."),
  price_etb: z.coerce.number().min(0, "Price must be 0 or more."),
});

type PlanFormValues = z.infer<typeof planSchema>;

type PlanFormProps = {
  editId?: string | null;
  initialValues?: Partial<PlanFormValues> | null;
  onSuccess?: () => void;
};

export function PlanForm({ editId, initialValues, onSuccess }: PlanFormProps) {
  const [state, setState] = useState<PlanActionResult | null>(null);

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planSchema) as Resolver<PlanFormValues>,
    defaultValues: {
      name: initialValues?.name ?? "",
      peak: initialValues?.peak ?? true,
      duration_months: initialValues?.duration_months ?? 1,
      price_etb: initialValues?.price_etb ?? 0,
    },
  });

  async function onSubmit(data: PlanFormValues) {
    setState(null);
    if (editId) {
      const result = await updatePlanAction({
        id: editId,
        name: data.name,
        peak: data.peak,
        duration_months: data.duration_months,
        price_etb: data.price_etb,
      });
      if (result?.error) {
        setState(result);
        return;
      }
      onSuccess?.();
      return;
    }
    const result = await createPlanAction({
      name: data.name,
      peak: data.peak,
      duration_months: data.duration_months,
      price_etb: data.price_etb,
    });
    if (result?.error) {
      setState(result);
      return;
    }
    onSuccess?.();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="plan-name">Plan name</Label>
        <Input id="plan-name" placeholder="e.g. 3-Month Peak" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        <input
          id="plan-peak"
          type="checkbox"
          checked={form.watch("peak")}
          onChange={(e) => form.setValue("peak", e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor="plan-peak">Peak</Label>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="duration_months">Duration (months)</Label>
        <Input
          id="duration_months"
          type="number"
          min={1}
          {...form.register("duration_months")}
        />
        {form.formState.errors.duration_months && (
          <p className="text-sm text-destructive">{form.formState.errors.duration_months.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="price_etb">Price (ETB)</Label>
        <Input id="price_etb" type="number" min={0} step={0.01} {...form.register("price_etb")} />
        {form.formState.errors.price_etb && (
          <p className="text-sm text-destructive">{form.formState.errors.price_etb.message}</p>
        )}
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : editId ? "Update plan" : "Create plan"}
      </Button>
    </form>
  );
}
