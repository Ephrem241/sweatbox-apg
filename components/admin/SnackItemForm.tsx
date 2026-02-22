"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSnackItemAction, updateSnackItemAction, type SnackItemActionResult } from "@/app/admin/actions/snack-items";

const snackItemSchema = z.object({
  name: z.string().min(1, "Name is required."),
  description: z.string().optional(),
  price_etb: z.coerce.number().min(0),
  image_url: z.string().optional(),
  available: z.boolean(),
  sort_order: z.coerce.number().min(0),
});

type SnackItemFormValues = z.infer<typeof snackItemSchema>;

type SnackItemFormProps = {
  editId?: string | null;
  initialValues?: Partial<SnackItemFormValues> | null;
  onSuccess?: () => void;
};

export function SnackItemForm({ editId, initialValues, onSuccess }: SnackItemFormProps) {
  const [state, setState] = useState<SnackItemActionResult | null>(null);

  const form = useForm<SnackItemFormValues>({
    resolver: zodResolver(snackItemSchema) as Resolver<SnackItemFormValues>,
    defaultValues: {
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      price_etb: initialValues?.price_etb ?? 0,
      image_url: initialValues?.image_url ?? "",
      available: initialValues?.available ?? true,
      sort_order: initialValues?.sort_order ?? 0,
    },
  });

  async function onSubmit(data: SnackItemFormValues) {
    setState(null);
    const payload = {
      name: data.name,
      description: data.description || null,
      price_etb: data.price_etb,
      image_url: data.image_url || null,
      available: data.available,
      sort_order: data.sort_order,
    };
    if (editId) {
      const result = await updateSnackItemAction({ ...payload, id: editId });
      if (result?.error) {
        setState(result);
        return;
      }
      onSuccess?.();
      return;
    }
    const result = await createSnackItemAction(payload);
    if (result?.error) {
      setState(result);
      return;
    }
    onSuccess?.();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="snack-name">Name</Label>
        <Input id="snack-name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="snack-desc">Description</Label>
        <textarea
          id="snack-desc"
          className="min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          {...form.register("description")}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="snack-price">Price (ETB)</Label>
        <Input id="snack-price" type="number" min={0} step={0.01} {...form.register("price_etb")} />
        {form.formState.errors.price_etb && (
          <p className="text-sm text-destructive">{form.formState.errors.price_etb.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="snack-image">Image URL</Label>
        <Input id="snack-image" {...form.register("image_url")} />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="snack-available"
          type="checkbox"
          checked={form.watch("available")}
          onChange={(e) => form.setValue("available", e.target.checked)}
          className="h-4 w-4 rounded border-input"
        />
        <Label htmlFor="snack-available">Available</Label>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="snack-sort">Sort order</Label>
        <Input id="snack-sort" type="number" min={0} {...form.register("sort_order")} />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : editId ? "Update item" : "Create item"}
      </Button>
    </form>
  );
}
