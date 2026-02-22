"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createClassAction,
  updateClassAction,
  type ClassActionResult,
  type UpdateClassInput,
} from "@/app/admin/actions/classes";

export const DAY_LABELS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

const classSchema = z.object({
  name: z.string().min(1, "Class name is required."),
  day_of_week: z.coerce.number().min(1).max(7),
  start_time: z.string().min(1, "Start time is required."),
  location_id: z.string().optional(),
});

type ClassFormValues = z.infer<typeof classSchema>;

type LocationOption = { id: string; name: string };

type ClassFormProps = {
  editId?: string | null;
  initialValues?: Partial<ClassFormValues> | null;
  locations?: LocationOption[];
  onSuccess?: () => void;
};

export function ClassForm({
  editId,
  initialValues,
  locations = [],
  onSuccess,
}: ClassFormProps) {
  const locale = useLocale();
  const [state, setState] = useState<ClassActionResult | null>(null);

  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema) as Resolver<ClassFormValues>,
    defaultValues: {
      name: initialValues?.name ?? "",
      day_of_week: initialValues?.day_of_week ?? 1,
      start_time: initialValues?.start_time ?? "09:00",
      location_id: initialValues?.location_id ?? "",
    },
  });

  async function onSubmit(data: ClassFormValues) {
    setState(null);
    if (editId) {
      const result = await updateClassAction({
        id: editId,
        name: data.name,
        day_of_week: data.day_of_week,
        start_time: data.start_time,
        location_id: data.location_id || null,
      });
      if (result?.error) {
        setState(result);
        return;
      }
      onSuccess?.();
      return;
    }
    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("day_of_week", String(data.day_of_week));
    formData.set("start_time", data.start_time);
    if (data.location_id) formData.set("location_id", data.location_id);
    formData.set("locale", locale);
    const result = await createClassAction({}, formData);
    if (result?.error) {
      setState(result);
    } else {
      onSuccess?.();
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="class-name">Class name</Label>
        <Input
          id="class-name"
          placeholder="e.g. Morning WOD"
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="day_of_week">Day of week</Label>
        <Select
          value={String(form.watch("day_of_week"))}
          onValueChange={(v) => form.setValue("day_of_week", Number(v))}
        >
          <SelectTrigger id="day_of_week" className="w-full">
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            {[1, 2, 3, 4, 5, 6, 7].map((d) => (
              <SelectItem key={d} value={String(d)}>
                {DAY_LABELS[d]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.formState.errors.day_of_week && (
          <p className="text-sm text-destructive">
            {form.formState.errors.day_of_week.message}
          </p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="start_time">Start time</Label>
        <Input
          id="start_time"
          type="time"
          {...form.register("start_time")}
        />
        {form.formState.errors.start_time && (
          <p className="text-sm text-destructive">
            {form.formState.errors.start_time.message}
          </p>
        )}
      </div>
      {locations.length > 0 && (
        <div className="grid gap-2">
          <Label htmlFor="location_id">Location</Label>
          <Select
            value={form.watch("location_id") ?? ""}
            onValueChange={(v) => form.setValue("location_id", v)}
          >
            <SelectTrigger id="location_id" className="w-full">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : editId ? "Update class" : "Create class"}
      </Button>
    </form>
  );
}
