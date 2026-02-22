"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createGalleryImageAction,
  updateGalleryImageAction,
  type GalleryActionResult,
} from "@/app/admin/actions/gallery";

const galleryImageSchema = z.object({
  src: z.string().min(1, "Image URL is required."),
  alt: z.string(),
  width: z.union([z.coerce.number().min(0), z.nan()]).transform((v) => (Number.isNaN(v) ? undefined : v)),
  height: z.union([z.coerce.number().min(0), z.nan()]).transform((v) => (Number.isNaN(v) ? undefined : v)),
  sort_order: z.coerce.number().min(0),
});

type GalleryImageFormValues = z.infer<typeof galleryImageSchema>;

type GalleryImageFormProps = {
  editId?: string | null;
  initialValues?: Partial<GalleryImageFormValues> | null;
  onSuccess?: () => void;
};

export function GalleryImageForm({ editId, initialValues, onSuccess }: GalleryImageFormProps) {
  const [state, setState] = useState<GalleryActionResult | null>(null);

  const form = useForm<GalleryImageFormValues>({
    resolver: zodResolver(galleryImageSchema) as Resolver<GalleryImageFormValues>,
    defaultValues: {
      src: initialValues?.src ?? "",
      alt: initialValues?.alt ?? "",
      width: initialValues?.width ?? undefined,
      height: initialValues?.height ?? undefined,
      sort_order: initialValues?.sort_order ?? 0,
    },
  });

  async function onSubmit(data: GalleryImageFormValues) {
    setState(null);
    const payload = {
      src: data.src,
      alt: data.alt,
      width: data.width ?? null,
      height: data.height ?? null,
      sort_order: data.sort_order,
    };
    if (editId) {
      const result = await updateGalleryImageAction({ ...payload, id: editId });
      if (result?.error) {
        setState(result);
        return;
      }
      onSuccess?.();
      return;
    }
    const result = await createGalleryImageAction(payload);
    if (result?.error) {
      setState(result);
      return;
    }
    onSuccess?.();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="gallery-src">Image URL</Label>
        <Input
          id="gallery-src"
          {...form.register("src")}
          placeholder="https://..."
          className="mt-1"
        />
        {form.formState.errors.src && (
          <p className="mt-1 text-sm text-destructive">{form.formState.errors.src.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="gallery-alt">Alt text</Label>
        <Input id="gallery-alt" {...form.register("alt")} placeholder="Describe the image" className="mt-1" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="gallery-width">Width (optional)</Label>
          <Input id="gallery-width" type="number" {...form.register("width")} className="mt-1" />
        </div>
        <div>
          <Label htmlFor="gallery-height">Height (optional)</Label>
          <Input id="gallery-height" type="number" {...form.register("height")} className="mt-1" />
        </div>
      </div>
      <div>
        <Label htmlFor="gallery-sort">Sort order</Label>
        <Input id="gallery-sort" type="number" {...form.register("sort_order")} className="mt-1" />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {editId ? "Update" : "Add"} image
      </Button>
    </form>
  );
}
