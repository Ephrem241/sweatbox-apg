"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createProductAction, updateProductAction, type ProductActionResult } from "@/app/admin/actions/products";

const productSchema = z.object({
  name: z.string().min(1, "Name is required."),
  slug: z.string().min(1, "Slug is required."),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required."),
  price_etb: z.coerce.number().min(0),
  image_url: z.string().optional(),
  stock: z.coerce.number().min(0),
});

type ProductFormValues = z.infer<typeof productSchema>;

type ProductFormProps = {
  editId?: string | null;
  initialValues?: Partial<ProductFormValues> | null;
  onSuccess?: () => void;
};

const CATEGORIES = ["gear", "merch", "supplements", "other"];

export function ProductForm({ editId, initialValues, onSuccess }: ProductFormProps) {
  const [state, setState] = useState<ProductActionResult | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as Resolver<ProductFormValues>,
    defaultValues: {
      name: initialValues?.name ?? "",
      slug: initialValues?.slug ?? "",
      description: initialValues?.description ?? "",
      category: initialValues?.category ?? "gear",
      price_etb: initialValues?.price_etb ?? 0,
      image_url: initialValues?.image_url ?? "",
      stock: initialValues?.stock ?? 0,
    },
  });

  async function onSubmit(data: ProductFormValues) {
    setState(null);
    const payload = {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      category: data.category,
      price_etb: data.price_etb,
      image_url: data.image_url || null,
      stock: data.stock,
    };
    if (editId) {
      const result = await updateProductAction({ ...payload, id: editId });
      if (result?.error) {
        setState(result);
        return;
      }
      onSuccess?.();
      return;
    }
    const result = await createProductAction(payload);
    if (result?.error) {
      setState(result);
      return;
    }
    onSuccess?.();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="prod-name">Name</Label>
        <Input id="prod-name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="prod-slug">Slug (URL-friendly, unique)</Label>
        <Input id="prod-slug" {...form.register("slug")} />
        {form.formState.errors.slug && (
          <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="prod-desc">Description</Label>
        <textarea
          id="prod-desc"
          className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          {...form.register("description")}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="prod-category">Category</Label>
        <select
          id="prod-category"
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
          {...form.register("category")}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="prod-price">Price (ETB)</Label>
        <Input id="prod-price" type="number" min={0} step={0.01} {...form.register("price_etb")} />
        {form.formState.errors.price_etb && (
          <p className="text-sm text-destructive">{form.formState.errors.price_etb.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="prod-image">Image URL</Label>
        <Input id="prod-image" {...form.register("image_url")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="prod-stock">Stock</Label>
        <Input id="prod-stock" type="number" min={0} {...form.register("stock")} />
        {form.formState.errors.stock && (
          <p className="text-sm text-destructive">{form.formState.errors.stock.message}</p>
        )}
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : editId ? "Update product" : "Create product"}
      </Button>
    </form>
  );
}
