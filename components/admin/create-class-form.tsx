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
import { createClassAction, type CreateClassResult } from "@/app/admin/actions";

const DAY_LABELS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

const createClassSchema = z.object({
  name: z.string().min(1, "Class name is required."),
  day_of_week: z.coerce.number().min(1, "Select a day.").max(7, "Select a day."),
  start_time: z.string().min(1, "Start time is required."),
});

type CreateClassForm = {
  name: string;
  day_of_week: number;
  start_time: string;
};

export function CreateClassForm() {
  const locale = useLocale();
  const [state, setState] = useState<CreateClassResult | null>(null);

  const form = useForm<CreateClassForm>({
    resolver: zodResolver(createClassSchema) as Resolver<CreateClassForm>,
    defaultValues: {
      name: "",
      day_of_week: 1,
      start_time: "09:00",
    },
  });

  async function onSubmit(data: CreateClassForm) {
    setState(null);
    const formData = new FormData();
    formData.set("name", data.name);
    formData.set("day_of_week", String(data.day_of_week));
    formData.set("start_time", data.start_time);
    formData.set("locale", locale);
    const result = await createClassAction({}, formData);
    if (result?.error) {
      setState(result);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex max-w-md flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Class name</Label>
        <Input
          id="name"
          placeholder="e.g. Morning WOD"
          {...form.register("name")}
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
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
          <p className="text-sm text-destructive">{form.formState.errors.day_of_week.message}</p>
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
          <p className="text-sm text-destructive">{form.formState.errors.start_time.message}</p>
        )}
      </div>
      {state?.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit">Create Class</Button>
    </form>
  );
}
