"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createWorkoutVideoAction,
  updateWorkoutVideoAction,
  type WorkoutVideoActionResult,
} from "@/app/admin/actions/workout-videos";

const videoSchema = z.object({
  title: z.string().min(1, "Title is required."),
  description: z.string().optional(),
  thumbnail_url: z.string().optional(),
  video_url: z.string().min(1, "Video URL is required."),
  duration_sec: z.union([z.coerce.number().min(0), z.nan()]).transform((v) => (Number.isNaN(v) ? undefined : v)),
  tags: z.string(),
  sort_order: z.coerce.number().min(0),
});

type WorkoutVideoFormValues = z.infer<typeof videoSchema>;

type WorkoutVideoFormProps = {
  editId?: string | null;
  initialValues?: Partial<WorkoutVideoFormValues> & { tags?: string[] | string } | null;
  onSuccess?: () => void;
};

export function WorkoutVideoForm({ editId, initialValues, onSuccess }: WorkoutVideoFormProps) {
  const [state, setState] = useState<WorkoutVideoActionResult | null>(null);

  const tagsInitial =
    initialValues?.tags == null
      ? ""
      : Array.isArray(initialValues.tags)
        ? (initialValues.tags as string[]).join(", ")
        : String(initialValues.tags);

  const form = useForm<WorkoutVideoFormValues>({
    resolver: zodResolver(videoSchema) as Resolver<WorkoutVideoFormValues>,
    defaultValues: {
      title: initialValues?.title ?? "",
      description: initialValues?.description ?? "",
      thumbnail_url: initialValues?.thumbnail_url ?? "",
      video_url: initialValues?.video_url ?? "",
      duration_sec: initialValues?.duration_sec ?? undefined,
      tags: tagsInitial,
      sort_order: initialValues?.sort_order ?? 0,
    },
  });

  async function onSubmit(data: WorkoutVideoFormValues) {
    setState(null);
    const tags = data.tags
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const payload = {
      title: data.title,
      description: data.description || null,
      thumbnail_url: data.thumbnail_url || null,
      video_url: data.video_url,
      duration_sec: data.duration_sec ?? null,
      tags,
      sort_order: data.sort_order,
    };
    if (editId) {
      const result = await updateWorkoutVideoAction({ ...payload, id: editId });
      if (result?.error) {
        setState(result);
        return;
      }
      onSuccess?.();
      return;
    }
    const result = await createWorkoutVideoAction(payload);
    if (result?.error) {
      setState(result);
      return;
    }
    onSuccess?.();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="video-title">Title</Label>
        <Input id="video-title" {...form.register("title")} />
        {form.formState.errors.title && (
          <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="video-desc">Description</Label>
        <textarea
          id="video-desc"
          className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          {...form.register("description")}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="video-thumb">Thumbnail URL</Label>
        <Input id="video-thumb" {...form.register("thumbnail_url")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="video-url">Video URL</Label>
        <Input id="video-url" {...form.register("video_url")} />
        {form.formState.errors.video_url && (
          <p className="text-sm text-destructive">{form.formState.errors.video_url.message}</p>
        )}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="video-duration">Duration (seconds)</Label>
        <Input id="video-duration" type="number" min={0} {...form.register("duration_sec")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="video-tags">Tags (comma-separated)</Label>
        <Input id="video-tags" placeholder="e.g. HIIT, beginner" {...form.register("tags")} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="video-sort">Sort order</Label>
        <Input id="video-sort" type="number" min={0} {...form.register("sort_order")} />
      </div>
      {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Saving…" : editId ? "Update video" : "Create video"}
      </Button>
    </form>
  );
}
