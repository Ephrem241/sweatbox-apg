"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLocationAction, updateLocationAction, type LocationActionResult } from "@/app/admin/actions/locations";

const locationSchema = z.object({
  name: z.string().min(1, "Name is required."),
  slug: z.string().min(1, "Slug is required."),
  address: z.string().optional(),
  phone: z.string().optional(),
  maps_query: z.string().optional(),
});

type LocationFormValues = z.infer<typeof locationSchema>;

type LocationFormProps = {
  editId?: string | null;
  initialValues?: Partial<LocationFormValues> | null;
  onSuccess?: () => void;
};

export function LocationForm({ editId, initialValues, onSuccess }: LocationFormProps) {
  const [state, setState] = useState<LocationActionResult | null>(null);

  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema) as Resolver<LocationFormValues>,
    defaultValues: {
      name: initialValues?.name ?? "",
      slug: initialValues?.slug ?? "",
      address: initialValues?.address ?? "",
      phone: initialValues?.phone ?? "",
      maps_query: initialValues?.maps_query ?? "",
    },
  });

  async function onSubmit(data: LocationFormValues) {
    setState(null);
    const payload = {
      name: data.name,
      slug: data.slug,
      address: data.address || null,
      phone: data.phone || null,
      maps_query: data.maps_query || null,
    };
    if (editId) {
      const result = await updateLocationAction({ ...payload, id: editId });
      if (result?.error) {
        setState(result);
        return;
      }
      onSuccess?.();
      return;
    }
    const result = await createLocationAction(payload);
    if (result?.error) {
      setState(result);
      return;
    }
    onSuccess?.();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="loc-name">Name</Label>
        <Input id="loc-name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="loc-slug">Slug (unique, URL-friendly)</Label>
        <Input id="loc-slug" placeholder="e.g. bole" {...form.register("slug")} />
        {form.formState.errors.slug && (
          <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="loc-address">Address</Label>
        <Input id="loc-address" {...form.register("address")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="loc-phone">Phone</Label>
        <Input id="loc-phone" {...form.register("phone")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="loc-maps">Maps query</Label>
        <Input id="loc-maps" {...form.register("maps_query")} />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : editId ? "Update location" : "Create location"}
      </Button>
    </form>
  );
}
